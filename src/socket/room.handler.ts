import { Socket } from 'socket.io';
import { RoomService } from '../services/room.service';
import { ROOM_EVENTS } from '../types/socket.events';

/**
 * Room Socket Handler - Only calls services, no business logic
 * All event names come from socket.events.ts (AGENTS.md rule #3)
 */

export const roomHandler = (io: any, socket: Socket) => {
    /**
     * Handle room join
     */
    socket.on(ROOM_EVENTS.JOIN_ROOM, async (data: any, ack?: any) => {
        try {
            const userId = socket.data.user?.id;
            if (!userId) {
                throw new Error('Not authenticated');
            }

            // Call service
            const room = await RoomService.getRoom(data.roomId, userId);

            // Join socket room
            socket.join(`room:${data.roomId}`);

            // Notify others
            io.to(`room:${data.roomId}`).emit(ROOM_EVENTS.MEMBER_JOINED, {
                roomId: data.roomId,
                userId,
                username: socket.data.user?.email,
            });

            if (ack) ack({ success: true, room });
        } catch (error: any) {
            socket.emit('error', { message: error.message });
            if (ack) ack({ success: false, error: error.message });
        }
    });

    /**
     * Handle room leave
     */
    socket.on(ROOM_EVENTS.LEAVE_ROOM, async (data: any, ack?: any) => {
        try {
            const userId = socket.data.user?.id;
            if (!userId) {
                throw new Error('Not authenticated');
            }

            // Leave socket room
            socket.leave(`room:${data.roomId}`);

            // Notify others
            io.to(`room:${data.roomId}`).emit(ROOM_EVENTS.MEMBER_LEFT, {
                roomId: data.roomId,
                userId,
            });

            if (ack) ack({ success: true });
        } catch (error: any) {
            socket.emit('error', { message: error.message });
            if (ack) ack({ success: false, error: error.message });
        }
    });

    /**
     * Handle room creation
     */
    socket.on(ROOM_EVENTS.ROOM_CREATED, async (data: any, ack?: any) => {
        try {
            const userId = socket.data.user?.id;
            if (!userId) {
                throw new Error('Not authenticated');
            }

            // Call service
            const room = await RoomService.createRoom({
                name: data.name,
                description: data.description,
                createdBy: userId,
                isPrivate: data.isPrivate,
            });

            // Join creator to room
            socket.join(`room:${room.id}`);

            // Notify all users
            io.emit(ROOM_EVENTS.ROOM_CREATED, room);

            if (ack) ack({ success: true, room });
        } catch (error: any) {
            socket.emit('error', { message: error.message });
            if (ack) ack({ success: false, error: error.message });
        }
    });

    /**
     * Handle room update
     */
    socket.on(ROOM_EVENTS.ROOM_UPDATED, async (data: any, ack?: any) => {
        try {
            const userId = socket.data.user?.id;
            if (!userId) {
                throw new Error('Not authenticated');
            }

            // Call service
            const room = await RoomService.updateRoom(
                data.roomId,
                { name: data.name, description: data.description },
                userId,
            );

            // Notify room
            io.to(`room:${data.roomId}`).emit(ROOM_EVENTS.ROOM_UPDATED, room);

            if (ack) ack({ success: true, room });
        } catch (error: any) {
            socket.emit('error', { message: error.message });
            if (ack) ack({ success: false, error: error.message });
        }
    });

    /**
     * Handle room deletion
     */
    socket.on(ROOM_EVENTS.ROOM_DELETED, async (data: any, ack?: any) => {
        try {
            const userId = socket.data.user?.id;
            if (!userId) {
                throw new Error('Not authenticated');
            }

            // Call service
            await RoomService.deleteRoom(data.roomId, userId);

            // Disconnect all from room
            io.to(`room:${data.roomId}`).emit(ROOM_EVENTS.ROOM_DELETED, {
                roomId: data.roomId,
            });

            if (ack) ack({ success: true });
        } catch (error: any) {
            socket.emit('error', { message: error.message });
            if (ack) ack({ success: false, error: error.message });
        }
    });
};
