import { Router } from 'express';
import { healthCheck, registerUser,logoutUser, loginUser, verifyOTP, getCurrentUser } from '../controllers/user.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

router.route('/health').get(healthCheck);
router.route('/register').post(registerUser);
router.route('/verify-otp').post(verifyOTP);
router.route('/login').post(loginUser);


// Secured routes
router.route('/current-user').get(verifyJWT, getCurrentUser);
router.route('/logout').post(verifyJWT, logoutUser);

export default router;