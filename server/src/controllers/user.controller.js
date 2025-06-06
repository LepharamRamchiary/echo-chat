import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { User } from '../models/user.model.js';

const healthCheck = asyncHandler(async (req, res) => {
    res.status(200).json(new ApiResponse(200, null, 'Server is running'));
});

const registerUser = asyncHandler(async (req, res) => {
    const { phoneNumber, fullname } = req.body;

    if (!phoneNumber) {
        throw new ApiError(400, 'Phone number is required');
    }

    const existingUser = await User.findOne({ phoneNumber });
        
    if (existingUser && existingUser.isVerified) {
        return res.status(409).json(
            new ApiResponse(409, null, 'User with this phone number already exists')
        );
    }

    let user;
    if (existingUser && !existingUser.isVerified) {
        user = existingUser;
    } else {
        user = new User({ phoneNumber, fullname });
    }

    // Generate OTP
    const otpCode = user.generateOTP();
    await user.save();

    console.log(`OTP for ${phoneNumber}: ${otpCode}`);

    res.status(201).json(
        new ApiResponse(
            201,
            { phoneNumber: user.phoneNumber, fullname: user.fullname },
            'OTP sent successfully. Please verify your phone number.'
        )
    );
});

const verifyOTP = asyncHandler(async (req, res) => {
    const { phoneNumber, otp } = req.body;

    if (!phoneNumber || !otp) {
        throw new ApiError(400, 'Phone number and OTP are required');
    }

    const user = await User.findOne({ phoneNumber });

    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    const isOTPValid = await user.verifyOTP(otp);

    if (!isOTPValid) {
        throw new ApiError(400, 'Invalid or expired OTP');
    }

    user.isVerified = true;
    user.clearOTP();
    await user.save();

    const accessToken = user.generateAccessToken();

    res.status(200).json(
        new ApiResponse(
            200,
            {
                user: {
                    _id: user._id,
                    phoneNumber: user.phoneNumber,
                    isVerified: user.isVerified
                },
                accessToken
            },
            'Phone number verified successfully. Register Sucessfully'
        )
    );
});

const loginUser = asyncHandler(async (req, res) => {
    const { phoneNumber, fullname } = req.body;

    if (!phoneNumber) {
        throw new ApiError(400, 'Phone number is required');
    }

    const user = await User.findOne({ phoneNumber });

    if (!user) {
        throw new ApiError(404, 'User not found. Please register first.');
    }

    if (!user.isVerified) {
        throw new ApiError(400, 'Please verify your phone number first');
    }

    const accessToken = user.generateAccessToken();

    res.status(200).json(
        new ApiResponse(
            200,
            {
                user: {
                    _id: user._id,
                    phoneNumber: user.phoneNumber,
                    isVerified: user.isVerified,
                    fullname: user.fullname,
                },
                accessToken
            },
            'User logged in successfully'
        )
    );
});

const getCurrentUser = asyncHandler(async (req, res) => {
    return res.status(200).json(
        new ApiResponse(
            200,
            req.user,
            'User fetched successfully'
        )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
    res.status(200).json(
        new ApiResponse(200, null, 'User logged out successfully')
    );
});

export {
    healthCheck,
    registerUser,
    verifyOTP,
    loginUser,
    getCurrentUser,
    logoutUser
};