import { MessageModel } from '../models/Message.model';
import { UserModel } from '../models/User.model';
import { RoomModel } from '../models/Room.model';
import { MessageCreateInput, MessageResponse } from '../types/message.types';
import { throwApiError } from '../middleware/error.middleware';

/**
 * Message Service - Contains ALL business logic for messaging
 * Routes and socket handlers call this service, they never contain logic
 * 
 * Note: Event broadcasting is handled by Socket.io handlers, not here
 */

const formatMessageResponse = async (message: any): Promise<MessageResponse> => {
    const user = await UserModel.findById(message.userId);

    return {
        id: message.id,
        roomId: message.roomId,
        userId: message.userId,
        content: message.content,
        attachments: message.attachments,
        createdAt: message.createdAt,
        updatedAt: message.updatedAt,
        user: user
            ? {
                id: user.id,
                username: user.username,
                avatar: user.avatar,
            }
            : undefined,
    };
};

export const MessageService = {
    async createMessage(input: MessageCreateInput): Promise<MessageResponse> {
        // Validate room exists
        const room = await RoomModel.findById(input.roomId);
        if (!room) {
            throwApiError(404, 'Room not found');
        }

        // Validate user is room member
        if (!room.members.includes(input.userId)) {
            throwApiError(403, 'User is not a member of this room');
        }

        // Validate content
        if (!input.content || input.content.trim().length === 0) {
            throwApiError(400, 'Message content cannot be empty');
        }

        // Create message
        const message = await MessageModel.create(input);

        return formatMessageResponse(message);
    },

    async getMessages(
        roomId: string,
        userId: string,
        limit = 50,
        offset = 0,
    ): Promise<{ messages: MessageResponse[]; total: number }> {
        // Validate room exists and user is member
        const room = await RoomModel.findById(roomId);
        if (!room) {
            throwApiError(404, 'Room not found');
        }

        if (!room.members.includes(userId)) {
            throwApiError(403, 'User is not a member of this room');
        }

        const messages = await MessageModel.findByRoomId(roomId, limit, offset);
        const formattedMessages = await Promise.all(
            messages.map((msg) => formatMessageResponse(msg)),
        );

        return {
            messages: formattedMessages,
            total: messages.length,
        };
    },

    async updateMessage(
        messageId: string,
        userId: string,
        content: string,
    ): Promise<MessageResponse> {
        // Get message
        const message = await MessageModel.findById(messageId);
        if (!message) {
            throwApiError(404, 'Message not found');
        }

        // Verify ownership
        if (message.userId !== userId) {
            throwApiError(403, 'Can only edit your own messages');
        }

        // Update message
        const updated = await MessageModel.update(messageId, { content });

        return formatMessageResponse(updated);
    },

    async deleteMessage(messageId: string, userId: string): Promise<void> {
        // Get message
        const message = await MessageModel.findById(messageId);
        if (!message) {
            throwApiError(404, 'Message not found');
        }

        // Verify ownership or admin
        if (message.userId !== userId) {
            throwApiError(403, 'Can only delete your own messages');
        }

        // Delete message
        await MessageModel.delete(messageId);
    },
};
