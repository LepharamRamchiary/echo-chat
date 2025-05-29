import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Message } from "../models/message.model.js";

const sendMessage = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const userId = req.user._id;

  if (!content || !content.trim()) {
    throw new ApiError(400, "Message content is required");
  }

  const sentMessage = new Message({
    userId,
    content: content.trim(),
    type: "sent",
  });
  await sentMessage.save();

  const response1 = new Message({
    userId,
    content: content.trim(),
    type: "received",
  });

  const response2 = new Message({
    userId,
    content: content.trim(),
    type: "received",
  });

  const response3 = new Message({
    userId,
    content: content.trim(),
    type: "received",
  });

  const response4 = new Message({
    userId,
    content: content.trim(),
    type: "received",
  });

  const response5 = new Message({
    userId,
    content: content.trim(),
    type: "received",
  });

  await Promise.all([response1.save(), response2.save(), response3.save(), response4.save(), response5.save()]);

  res.status(201).json(
    new ApiResponse(
      201,
      {
        sentMessage: {
          _id: sentMessage._id,
          content: sentMessage.content,
          type: sentMessage.type,
          createdAt: sentMessage.createdAt,
        },
        responses: [
          {
            _id: response1._id,
            content: response1.content,
            type: response1.type,
            createdAt: response1.createdAt,
          },
          {
            _id: response2._id,
            content: response2.content,
            type: response2.type,
            createdAt: response2.createdAt,
          },
          {
            _id: response3._id,
            content: response2.content,
            type: response2.type,
            createdAt: response2.createdAt,
          },
          {
            _id: response4._id,
            content: response2.content,
            type: response2.type,
            createdAt: response2.createdAt,
          },
          {
            _id: response5._id,
            content: response2.content,
            type: response2.type,
            createdAt: response2.createdAt,
          },
        ],
      },
      "Message sent and responses generated successfully"
    )
  );
});

const getMessages = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { page = 1, limit = 50 } = req.query;

  const messages = await Message.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .select("content type isRead createdAt");

  const totalMessages = await Message.countDocuments({ userId });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        messages: messages.reverse(),
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalMessages / limit),
          totalMessages,
          hasNextPage: page < Math.ceil(totalMessages / limit),
          hasPrevPage: page > 1,
        },
      },
      "Messages fetched successfully"
    )
  );
});

const deleteMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const userId = req.user._id;

  const message = await Message.findOne({ _id: messageId, userId });

  if (!message) {
    throw new ApiError(404, "Message not found");
  }

  await message.deleteOne();

  res
    .status(200)
    .json(new ApiResponse(200, null, "Message deleted successfully"));
});

const clearAllMessages = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  await Message.deleteMany({ userId });

  res
    .status(200)
    .json(new ApiResponse(200, null, "All messages cleared successfully"));
});

export { sendMessage, getMessages, deleteMessage, clearAllMessages };
