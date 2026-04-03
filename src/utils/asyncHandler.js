/**
 * @description Wrapper for async controllers to handle potential errors
 * and pass them to the Express error-handling middleware.
 */
const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next))
            .catch((err) => next(err));
    };
}

export { asyncHandler };
