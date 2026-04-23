import { Socket } from 'socket.io';
import { MESSAGE_EVENTS } from '../types/socket.events';

/**
 * Typing Socket Handler - Only handles typing indicators
 * No business logic - just broadcasts typing status
 * All event names come from socket.events.ts (AGENTS.md rule #3)
 */

export const typingHandler = (io: any, socket: Socket) => {
    /**
     * Handle user typing in a room
     */
    socket.on(MESSAGE_EVENTS.MESSAGE_TYPING, (data: any) => {
        io.to(`room:${data.roomId}`).emit(MESSAGE_EVENTS.MESSAGE_TYPING, {
            userId: socket.data.user?.id,
            username: socket.data.user?.email,
            roomId: data.roomId,
            timestamp: new Date(),
        });
    });

    /**
     * Handle user stops typing
     */
    socket.on(MESSAGE_EVENTS.MESSAGE_STOP_TYPING, (data: any) => {
        io.to(`room:${data.roomId}`).emit(MESSAGE_EVENTS.MESSAGE_STOP_TYPING, {
            userId: socket.data.user?.id,
            roomId: data.roomId,
            timestamp: new Date(),
        });
    });
};
