import { parseDurationToSeconds } from '../utils/durationParser.js';
import { asyncHandler } from '../utils/asyncHandler.js';

let shortsCache = {
    data: null,
    timestamp: 0
};

const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

/**
 * @desc    Fetches YouTube Shorts from a specific channel and caches the result
 * @route   GET /api/shorts
 * @access  Public
 */
export const getShorts = asyncHandler(async (req, res) => {
    const apiKey = process.env.YOUTUBE_API_KEY;
    const channelId = process.env.YOUTUBE_CHANNEL_ID;

    if (!apiKey || !channelId) {
        console.error("YouTube API configuration missing in .env");
        return res.status(500).json({ error: "Failed to fetch shorts" });
    }

    const now = Date.now();
    if (shortsCache.data && (now - shortsCache.timestamp < CACHE_DURATION)) {
        return res.status(200).json({ shorts: shortsCache.data });
    }

    try {
        // 1. Fetch the channel's uploads playlist ID
        const channelUrl = `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}&key=${apiKey}`;
        const channelResponse = await fetch(channelUrl);
        const channelData = await channelResponse.json();

        if (!channelData.items || channelData.items.length === 0) {
            throw new Error("Channel not found or API error");
        }

        const uploadsPlaylistId = channelData.items[0].contentDetails.relatedPlaylists.uploads;

        // 2. Fetch all videos from that playlist (handling pagination)
        let allVideoItems = [];
        let nextPageToken = "";

        do {
            const playlistUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=50&pageToken=${nextPageToken}&key=${apiKey}`;
            const playlistResponse = await fetch(playlistUrl);
            const playlistData = await playlistResponse.json();

            if (playlistData.items) {
                allVideoItems.push(...playlistData.items);
            }
            nextPageToken = playlistData.nextPageToken || "";
        } while (nextPageToken);

        // 3. Fetch video durations using the /videos endpoint (batching IDs)
        const videoIds = allVideoItems.map(item => item.snippet.resourceId.videoId);
        const shorts = [];

        // YouTube allows up to 50 IDs per request for the /videos endpoint
        for (let i = 0; i < videoIds.length; i += 50) {
            const batchIds = videoIds.slice(i, i + 50).join(",");
            const videosUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,snippet&id=${batchIds}&key=${apiKey}`;
            const videosResponse = await fetch(videosUrl);
            const videosData = await videosResponse.json();

            if (videosData.items) {
                for (const video of videosData.items) {
                    const durationSeconds = parseDurationToSeconds(video.contentDetails.duration);
                    
                    // Filter for shorts (duration <= 60 seconds)
                    if (durationSeconds <= 60) {
                        shorts.push({
                            id: video.id,
                            title: video.snippet.title,
                            description: video.snippet.description,
                            thumbnail: video.snippet.thumbnails?.high?.url || video.snippet.thumbnails?.default?.url,
                            publishedAt: video.snippet.publishedAt,
                            url: `https://www.youtube.com/shorts/${video.id}`,
                            embedUrl: `https://www.youtube.com/embed/${video.id}`
                        });
                    }
                }
            }
        }

        // Update cache
        shortsCache = {
            data: shorts,
            timestamp: now
        };

        return res.status(200).json({ shorts });

    } catch (error) {
        console.error("Error fetching YouTube shorts:", error);
        return res.status(500).json({ error: "Failed to fetch shorts" });
    }
});
