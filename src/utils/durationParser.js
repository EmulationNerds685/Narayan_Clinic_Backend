/**
 * Parses ISO 8601 duration strings (e.g., PT1M3S, PT45S) into seconds.
 * @param {string} duration - The ISO 8601 duration string.
 * @returns {number} The total number of seconds.
 */
export const parseDurationToSeconds = (duration) => {
    // Regex to match PT, hours (H), minutes (M), and seconds (S)
    const regex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
    const matches = duration.match(regex);

    if (!matches) return 0;

    const hours = parseInt(matches[1] || 0);
    const minutes = parseInt(matches[2] || 0);
    const seconds = parseInt(matches[3] || 0);

    return (hours * 3600) + (minutes * 60) + seconds;
};
