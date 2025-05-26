import { Router } from 'express';
import {
    sendMessage,
    getMessages,
    deleteMessage,
    clearAllMessages
} from '../controllers/message.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js'; 

const router = Router();

router.use(verifyJWT);

router.route('/send').post(sendMessage);
router.route('/').get(getMessages);
router.route('/clear-all').delete(clearAllMessages);
router.route('/:messageId').delete(deleteMessage);

export default router;