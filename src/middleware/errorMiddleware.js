import { ApiError } from '../utils/ApiError.js';

/**
 * @description Global Error Handler Middleware
 */
const errorHandler = (err, req, res, next) => {
    let error = err;

    // Check if the error is an instance of ApiError
    if (!(error instanceof ApiError)) {
        const statusCode = error.statusCode || (error.name === 'ValidationError' ? 400 : 500);
        const message = error.message || "Internal Server Error";
        error = new ApiError(statusCode, message, error?.errors || [], err.stack);
    }

    const response = {
        ...error,
        message: error.message,
        ...(process.env.NODE_ENV === "development" ? { stack: error.stack } : {}),
    };

    return res.status(error.statusCode).json(response);
};

export { errorHandler };
