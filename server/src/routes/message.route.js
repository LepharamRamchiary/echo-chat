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

/**
 * @swagger
 * tags:
 *   - name: Messages
 *     description: Message management and chat APIs
 * components:
 *   schemas:
 *     Message:
 *       type: object
 *       required:
 *         - sender
 *         - receiver
 *         - content
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated MongoDB ObjectId
 *         sender:
 *           type: string
 *           description: Sender user ID
 *         receiver:
 *           type: string
 *           description: Receiver user ID
 *         content:
 *           type: string
 *           description: Message content
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Message creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Message update timestamp
 *     SendMessageRequest:
 *       type: object
 *       required:
 *         - content
 *       properties:
 *         content:
 *           type: string
 *           description: Message content
 *     MessageResponse:
 *       type: object
 *       properties:
 *         statusCode:
 *           type: integer
 *           example: 201
 *         data:
 *           $ref: '#/components/schemas/Message'
 *         message:
 *           type: string
 *           example: "Message sent successfully"
 *         success:
 *           type: boolean
 *           example: true
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /api/v1/message/send:
 *   post:
 *     summary: Send a new message
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SendMessageRequest'
 *     responses:
 *       201:
 *         description: Message sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 * /api/v1/message:
 *   get:
 *     summary: Get all messages for the authenticated user
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of messages
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Message'
 *                 message:
 *                   type: string
 *                 success:
 *                   type: boolean
 *
 * /api/v1/message/clear-all:
 *   delete:
 *     summary: Delete all messages for the authenticated user
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All messages cleared
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 success:
 *                   type: boolean
 *
 * /api/v1/message/{messageId}:
 *   delete:
 *     summary: Delete a specific message by ID
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         schema:
 *           type: string
 *         required: true
 *         description: The message ID
 *     responses:
 *       200:
 *         description: Message deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 success:
 *                   type: boolean
 */

router.route('/send').post(sendMessage);
router.route('/').get(getMessages);
router.route('/clear-all').delete(clearAllMessages);
router.route('/:messageId').delete(deleteMessage);

export default router;