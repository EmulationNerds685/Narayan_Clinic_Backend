import Admin from '../models/admin.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

/**
 * @desc    Logs in an admin user
 * @route   POST /api/admin/login
 * @access  Public
 */
export const loginAdmin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
        throw new ApiError(401, "Invalid email or password");
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
        throw new ApiError(401, "Invalid email or password");
    }

    // Set the admin ID in the session
    req.session.adminId = admin._id;

    return res
        .status(200)
        .json(new ApiResponse(200, { email: admin.email }, "Logged in successfully"));
});

/**
 * @desc    Logs out the current admin user
 * @route   POST /api/admin/logout
 * @access  Private
 */
export const logoutAdmin = asyncHandler(async (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            throw new ApiError(500, "Logout failed");
        }
        // Clear the session cookie
        res.clearCookie('connect.sid');
        return res
            .status(200)
            .json(new ApiResponse(200, null, "Logged out successfully"));
    });
});

/**
 * @desc    Updates admin credentials (email/password)
 * @route   PUT /api/admin/update
 * @access  Private
 */
export const updateAdminCredentials = asyncHandler(async (req, res) => {
    const { currentEmail, newEmail, newPassword } = req.body;

    const admin = await Admin.findOne({ email: currentEmail });
    if (!admin) {
        throw new ApiError(404, "Admin not found");
    }

    // If new email is provided, check if it's already in use
    if (newEmail && newEmail !== currentEmail) {
        const emailTaken = await Admin.findOne({ email: newEmail });
        if (emailTaken) {
            throw new ApiError(400, "New email already in use");
        }
        admin.email = newEmail;
    }

    // If new password is provided, update it (it will be hashed by the pre-save hook)
    if (newPassword) {
        admin.password = newPassword;
    }

    await admin.save();

    return res
        .status(200)
        .json(new ApiResponse(200, { email: admin.email }, "Credentials updated successfully"));
});

/**
 * @desc    Checks if an admin session is active
 * @route   GET /api/admin/check
 * @access  Public
 */
export const checkAuthStatus = asyncHandler(async (req, res) => {
    if (req.session && req.session.adminId) {
        return res
            .status(200)
            .json(new ApiResponse(200, { loggedIn: true }, "Admin session active"));
    }
    return res
        .status(200)
        .json(new ApiResponse(200, { loggedIn: false }, "Admin session inactive"));
});

/**
 * @desc    Creates a new admin
 * @route   POST /api/admin/create
 * @access  Private
 */
export const createAdmin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
        throw new ApiError(400, "Admin with this email already exists");
    }

    const newAdmin = await Admin.create({ email, password });

    if (!newAdmin) {
        throw new ApiError(500, "Error creating admin");
    }

    return res
        .status(201)
        .json(new ApiResponse(201, { email: newAdmin.email }, "Admin created successfully"));
});