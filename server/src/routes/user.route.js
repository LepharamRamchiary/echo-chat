import { Router } from 'express';
import { healthCheck, registerUser,logoutUser, loginUser, verifyOTP, getCurrentUser } from '../controllers/user.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - fullname
 *         - phoneNumber
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated MongoDB ObjectId
 *         fullname:
 *           type: string
 *           minLength: 3
 *           maxLength: 50
 *           description: User's full name
 *           example: "John Doe"
 *         phoneNumber:
 *           type: string
 *           pattern: '^[6-9]\d{9}$'
 *           description: Indian phone number (10 digits starting with 6-9)
 *           example: "9876543210"
 *         isVerified:
 *           type: boolean
 *           description: Whether the user's phone number is verified
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: User creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: User last update timestamp
 *     
 *     RegisterRequest:
 *       type: object
 *       required:
 *         - phoneNumber
 *         - fullname
 *       properties:
 *         phoneNumber:
 *           type: string
 *           pattern: '^[6-9]\d{9}$'
 *           description: Indian phone number (10 digits starting with 6-9)
 *           example: "9876543210"
 *         fullname:
 *           type: string
 *           minLength: 3
 *           maxLength: 50
 *           description: User's full name
 *           example: "John Doe"
 *     
 *     VerifyOTPRequest:
 *       type: object
 *       required:
 *         - phoneNumber
 *         - otp
 *       properties:
 *         phoneNumber:
 *           type: string
 *           pattern: '^[6-9]\d{9}$'
 *           description: Indian phone number (10 digits starting with 6-9)
 *           example: "9876543210"
 *         otp:
 *           type: string
 *           description: 6-digit OTP code
 *           example: "123456"
 *     
 *     LoginRequest:
 *       type: object
 *       required:
 *         - phoneNumber
 *       properties:
 *         phoneNumber:
 *           type: string
 *           pattern: '^[6-9]\d{9}$'
 *           description: Indian phone number (10 digits starting with 6-9)
 *           example: "9876543210"
 *         fullname:
 *           type: string
 *           description: User's full name (optional)
 *           example: "John Doe"
 *     
 *     ApiResponse:
 *       type: object
 *       properties:
 *         statusCode:
 *           type: integer
 *           description: HTTP status code
 *         data:
 *           type: object
 *           description: Response data
 *         message:
 *           type: string
 *           description: Response message
 *         success:
 *           type: boolean
 *           description: Whether the request was successful
 *     
 *     AuthResponse:
 *       type: object
 *       properties:
 *         statusCode:
 *           type: integer
 *           example: 200
 *         data:
 *           type: object
 *           properties:
 *             user:
 *               $ref: '#/components/schemas/User'
 *             accessToken:
 *               type: string
 *               description: JWT access token
 *               example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *         message:
 *           type: string
 *           example: "User logged in successfully"
 *         success:
 *           type: boolean
 *           example: true
 *     
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         statusCode:
 *           type: integer
 *           description: HTTP status code
 *         message:
 *           type: string
 *           description: Error message
 *         success:
 *           type: boolean
 *           example: false
 *         errors:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of error details
 *   
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   
 *   responses:
 *     UnauthorizedError:
 *       description: Access token is missing or invalid
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 *           example:
 *             statusCode: 401
 *             message: "Unauthorized request"
 *             success: false
 *     
 *     ValidationError:
 *       description: Validation error
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 *           example:
 *             statusCode: 400
 *             message: "Validation error"
 *             success: false
 *     
 *     NotFoundError:
 *       description: Resource not found
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 *           example:
 *             statusCode: 404
 *             message: "User not found"
 *             success: false
 * 
 */

/** 
* @swagger
 * /api/v1/user/register:
 *   post:
 *     summary: Register a new user
 *     description: Register a new user with phone number and full name. Sends OTP for verification.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: User registered successfully, OTP sent
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               statusCode: 201
 *               data:
 *                 phoneNumber: "9876543210"
 *                 fullname: "John Doe"
 *               message: "OTP sent successfully. Please verify your phone number."
 *               success: true
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       409:
 *         description: User already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               statusCode: 409
 *               message: "User with this phone number already exists"
 *               success: false
 */


/**
 * @swagger
 * /api/v1/user/verify-otp:
 *   post:
 *     summary: Verify OTP and complete registration
 *     description: Verify the OTP sent during registration to complete user registration
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VerifyOTPRequest'
 *     responses:
 *       200:
 *         description: OTP verified successfully, user registered
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *             example:
 *               statusCode: 200
 *               data:
 *                 user:
 *                   _id: "64a7b8c9d1e2f3a4b5c6d7e8"
 *                   phoneNumber: "9876543210"
 *                   isVerified: true
 *                 accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *               message: "Phone number verified successfully. Register Sucessfully"
 *               success: true
 *       400:
 *         description: Invalid or expired OTP
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               statusCode: 400
 *               message: "Invalid or expired OTP"
 *               success: false
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */

/**
 * @swagger
 * /api/v1/user/login:
 *   post:
 *     summary: Login user
 *     description: Login an existing verified user with phone number
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: User logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *             example:
 *               statusCode: 200
 *               data:
 *                 user:
 *                   _id: "64a7b8c9d1e2f3a4b5c6d7e8"
 *                   phoneNumber: "9876543210"
 *                   isVerified: true
 *                   fullname: "John Doe"
 *                 accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *               message: "User logged in successfully"
 *               success: true
 *       400:
 *         description: Phone number not verified
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               statusCode: 400
 *               message: "Please verify your phone number first"
 *               success: false
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               statusCode: 404
 *               message: "User not found. Please register first."
 *               success: false
 */

/**
 * @swagger
 * /api/v1/user/current-user:
 *   get:
 *     summary: Get current user details
 *     description: Get details of the currently authenticated user
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User details fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               statusCode: 200
 *               data:
 *                 _id: "64a7b8c9d1e2f3a4b5c6d7e8"
 *                 phoneNumber: "9876543210"
 *                 fullname: "John Doe"
 *                 isVerified: true
 *                 createdAt: "2023-07-07T10:30:00.000Z"
 *                 updatedAt: "2023-07-07T10:30:00.000Z"
 *               message: "User fetched successfully"
 *               success: true
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /api/v1/user/logout:
 *   post:
 *     summary: Logout user
 *     description: Logout the currently authenticated user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User logged out successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               statusCode: 200
 *               data: null
 *               message: "User logged out successfully"
 *               success: true
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

router.route('/health').get(healthCheck);
router.route('/register').post(registerUser);
router.route('/verify-otp').post(verifyOTP);
router.route('/login').post(loginUser);




// Secured routes
router.route('/current-user').get(verifyJWT, getCurrentUser);
router.route('/logout').post(verifyJWT, logoutUser);

export default router;