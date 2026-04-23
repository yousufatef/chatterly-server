import { Socket } from 'socket.io';
import { MessageService } from '../services/message.service';
import { MESSAGE_EVENTS } from '../types/socket.events';
import { throwApiError } from '../middleware/error.middleware';

/**
 * Message Socket Handler - Only calls services, no business logic
 * All event names come from socket.events.ts (AGENTS.md rule #3)
 */

export const messageHandler = (io: any, socket: Socket) => {
    /**
     * Handle sending a message
     * Uses MESSAGE_EVENTS.SEND_MESSAGE from socket.events.ts
     */
    socket.on(MESSAGE_EVENTS.SEND_MESSAGE, async (data: any, ack?: any) => {
        try {
            const userId = socket.data.user?.id;
            if (!userId) {
                throw new Error('Not authenticated');
            }

            // Call service (no logic here)
            const message = await MessageService.createMessage({
                roomId: data.roomId,
                userId,
                content: data.content,
                attachments: data.attachments,
            });

            // Emit to room subscribers
            io.to(`room:${data.roomId}`).emit(MESSAGE_EVENTS.MESSAGE_CREATED, message);

            // Acknowledge
            if (ack) ack({ success: true, message });
        } catch (error: any) {
            socket.emit(MESSAGE_EVENTS.ERROR, {
                message: error.message || 'Failed to send message',
            });
            if (ack) ack({ success: false, error: error.message });
        }
    });

    /**
     * Handle message update
     */
    socket.on(MESSAGE_EVENTS.MESSAGE_UPDATED, async (data: any, ack?: any) => {
        try {
            const userId = socket.data.user?.id;
            if (!userId) {
                throw new Error('Not authenticated');
            }

            // Call service
            const message = await MessageService.updateMessage(
                data.messageId,
                userId,
                data.content,
            );

            // Emit to room
            io.to(`room:${message.roomId}`).emit(MESSAGE_EVENTS.MESSAGE_UPDATED, message);

            if (ack) ack({ success: true, message });
        } catch (error: any) {
            socket.emit(MESSAGE_EVENTS.ERROR, {
                message: error.message || 'Failed to update message',
            });
            if (ack) ack({ success: false, error: error.message });
        }
    });

    /**
     * Handle message delete
     */
    socket.on(MESSAGE_EVENTS.MESSAGE_DELETED, async (data: any, ack?: any) => {
        try {
            const userId = socket.data.user?.id;
            if (!userId) {
                throw new Error('Not authenticated');
            }

            // Call service
            const result = await MessageService.deleteMessage(data.messageId, userId);

            // Emit to room
            io.to(`room:${result.roomId}`).emit(MESSAGE_EVENTS.MESSAGE_DELETED, {
                messageId: result.messageId,
            });

            if (ack) ack({ success: true });
        } catch (error: any) {
            socket.emit(MESSAGE_EVENTS.ERROR, {
                message: error.message || 'Failed to delete message',
            });
            if (ack) ack({ success: false, error: error.message });
        }
    });

    /**
     * Handle typing indicator
     */
    socket.on(MESSAGE_EVENTS.MESSAGE_TYPING, (data: any) => {
        io.to(`room:${data.roomId}`).emit(MESSAGE_EVENTS.MESSAGE_TYPING, {
            userId: socket.data.user?.id,
            roomId: data.roomId,
        });
    });

    /**
     * Handle stop typing indicator
     */
    socket.on(MESSAGE_EVENTS.MESSAGE_STOP_TYPING, (data: any) => {
        io.to(`room:${data.roomId}`).emit(MESSAGE_EVENTS.MESSAGE_STOP_TYPING, {
            userId: socket.data.user?.id,
            roomId: data.roomId,
        });
    });
};
