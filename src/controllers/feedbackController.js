import Feedback from '../models/feedback.js';
import ContactMessage from '../models/contactMessage.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

// --- Feedback ---

export const submitFeedback = asyncHandler(async (req, res) => {
    const { name, comment } = req.body;

    if (!name || !comment) {
        throw new ApiError(400, "Name and comment are required");
    }

    const feedback = await Feedback.create({ name, comment });

    return res
        .status(201)
        .json(new ApiResponse(201, feedback, "Feedback submitted successfully. It will be visible once approved."));
});

export const getApprovedFeedback = asyncHandler(async (req, res) => {
    const reviews = await Feedback.find({ status: 'Approved' }).sort({ createdAt: -1 });

    return res
        .status(200)
        .json(new ApiResponse(200, reviews, "Approved feedback fetched successfully"));
});

export const getAllFeedback = asyncHandler(async (req, res) => {
    const { status } = req.query;
    let query = {};
    if (status && status !== 'All') query.status = status;

    const feedback = await Feedback.find(query).sort({ createdAt: -1 });

    return res
        .status(200)
        .json(new ApiResponse(200, feedback, "All feedback fetched successfully"));
});

export const updateFeedbackStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Pending', 'Approved', 'Rejected'].includes(status)) {
        throw new ApiError(400, "Invalid status");
    }

    const feedback = await Feedback.findByIdAndUpdate(id, { status }, { new: true });

    if (!feedback) {
        throw new ApiError(404, "Feedback not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, feedback, "Feedback status updated"));
});

export const deleteFeedback = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const feedback = await Feedback.findByIdAndDelete(id);

    if (!feedback) {
        throw new ApiError(404, "Feedback not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, null, "Feedback deleted successfully"));
});

// --- Contact Messages ---

export const submitContactMessage = asyncHandler(async (req, res) => {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
        throw new ApiError(400, "Name, email, and message are required");
    }

    const contactMessage = await ContactMessage.create({ name, email, subject, message });

    return res
        .status(201)
        .json(new ApiResponse(201, contactMessage, "Message sent successfully"));
});

export const getAllMessages = asyncHandler(async (req, res) => {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });

    return res
        .status(200)
        .json(new ApiResponse(200, messages, "Messages fetched successfully"));
});

export const updateMessageReadStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { readStatus } = req.body;

    const message = await ContactMessage.findByIdAndUpdate(id, { readStatus }, { new: true });

    if (!message) {
        throw new ApiError(404, "Message not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, message, "Message status updated"));
});

export const deleteMessage = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const message = await ContactMessage.findByIdAndDelete(id);

    if (!message) {
        throw new ApiError(404, "Message not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, null, "Message deleted successfully"));
});
