import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const userSchema = new Schema({
    fullname: {
        type: String,
        required: [true, 'Full name is required'],
        trim: true,
        minlength: [3, 'Full name must be at least 3 characters long'],
        maxlength: [50, 'Full name cannot exceed 50 characters']
    },
    phoneNumber: {
        type: String,
        required: [true, 'Phone number is required'],
        unique: true,
        trim: true,
        match: [/^[6-9]\d{9}$/, 'Please enter a valid Indian phone number']
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    otp: {
        code: String,
        expiresAt: Date
    }
}, {
    timestamps: true
});

userSchema.pre('save', async function(next) {
    if (!this.isModified('otp.code')) return next();
    
    if (this.otp && this.otp.code) {
        this.otp.code = await bcrypt.hash(this.otp.code, 10);
    }
    next();
});

userSchema.methods.generateOTP = function() {
    const otpCode = "123456";
    this.otp = {
        code: otpCode,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000) 
    };
    return otpCode; 
};

userSchema.methods.verifyOTP = async function(candidateOTP) {
    if (!this.otp || !this.otp.code || !this.otp.expiresAt) {
        return false;
    }
    
    if (new Date() > this.otp.expiresAt) {
        return false;
    }
    
    return await bcrypt.compare(candidateOTP, this.otp.code);
};

userSchema.methods.generateAccessToken = function() {
    return jwt.sign(
        {
            _id: this._id,
            phoneNumber: this.phoneNumber
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRY
        }
    );
};

userSchema.methods.clearOTP = function() {
    this.otp = undefined;
};

export const User = mongoose.model('User', userSchema);