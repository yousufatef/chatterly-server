import { Server, Socket } from 'socket.io';
import { socketAuthMiddleware } from '../middleware/socket.auth';
import { messageHandler } from './message.handler';
import { roomHandler } from './room.handler';
import { presenceHandler } from './presence.handler';
import { typingHandler } from './typing.handler';

/**
 * Socket.io Configuration and Event Setup
 * All event names come from socket.events.ts
 * All handlers only call services
 * 
 * Note: Using Socket.io's built-in in-memory adapter for pub/sub
 * For multi-server deployments, consider using @socket.io/redis-adapter
 */

export const setupSocket = (io: Server) => {
    // Apply authentication middleware
    io.use((socket: Socket, next: any) => {
        socketAuthMiddleware(socket, next);
    });

    // Connection handler
    io.on('connection', (socket: Socket) => {
        console.log(`✅ User connected: ${socket.data.user?.id}`);

        // Setup all handlers
        messageHandler(io, socket);
        roomHandler(io, socket);
        presenceHandler(io, socket);
        typingHandler(io, socket);

        // Disconnect handler
        socket.on('disconnect', () => {
            console.log(`❌ User disconnected: ${socket.data.user?.id}`);
        });

        // Error handler
        socket.on('error', (error: any) => {
            console.error('Socket error:', error);
        });
    });

    return io;
};
