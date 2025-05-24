import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';

const healthCheck = asyncHandler(async (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running',
  });
});

export {
    healthCheck,
}