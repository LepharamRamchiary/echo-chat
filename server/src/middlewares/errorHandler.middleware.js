// src/middlewares/errorHandler.js
import { ApiError } from '../utils/apiError.js';

const errorHandler = (err, req, res, next) => {
    let error = err;

    // If it's not an ApiError, create one
    if (!(error instanceof ApiError)) {
        const statusCode = error.statusCode || 500;
        const message = error.message || 'Something went wrong';
        error = new ApiError(statusCode, message);
    }

    const response = {
        success: false,
        message: error.message,
        statusCode: error.statusCode,
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    };

    return res.status(error.statusCode).json(response);
};

export { errorHandler };