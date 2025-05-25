import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/apiError.js';
import { User } from '../models/user.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            throw new ApiError(401, 'Unauthorized request');
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        
        const user = await User.findById(decodedToken?._id).select('-otp');
        
        if (!user) {
            throw new ApiError(401, 'Invalid Access Token');
        }

        if (!user.isVerified) {
            throw new ApiError(401, 'Please verify your phone number first');
        }

        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || 'Invalid access token');
    }
});