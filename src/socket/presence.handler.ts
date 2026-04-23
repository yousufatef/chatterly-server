import { Socket } from 'socket.io';
import { AuthService } from '../services/auth.service';
import { PRESENCE_EVENTS } from '../types/socket.events';

/**
 * Presence Socket Handler - Only calls services, no business logic
 * Tracks user online/offline status
 * All event names come from socket.events.ts (AGENTS.md rule #3)
 */

export const presenceHandler = (io: any, socket: Socket) => {
    const userId = socket.data.user?.id;

    // User comes online
    socket.emit(PRESENCE_EVENTS.USER_ONLINE, {
        userId,
        timestamp: new Date(),
    });

    // Broadcast to all connected users
    io.emit(PRESENCE_EVENTS.USER_ONLINE, {
        userId,
        username: socket.data.user?.email,
        timestamp: new Date(),
    });

    // Update user status (call service)
    if (userId) {
        AuthService.setOnlineStatus(userId, true).catch((err) => {
            console.error('Failed to set online status:', err);
        });
    }

    /**
     * Handle disconnect
     */
    socket.on('disconnect', () => {
        // Broadcast to all connected users
        io.emit(PRESENCE_EVENTS.USER_OFFLINE, {
            userId,
            timestamp: new Date(),
        });

        // Update user status
        if (userId) {
            AuthService.setOnlineStatus(userId, false).catch((err) => {
                console.error('Failed to set offline status:', err);
            });
        }
    });

    /**
     * Handle away status
     */
    socket.on(PRESENCE_EVENTS.USER_AWAY, (data: any) => {
        io.emit(PRESENCE_EVENTS.USER_AWAY, {
            userId,
            timestamp: new Date(),
        });
    });

    /**
     * Handle back status
     */
    socket.on(PRESENCE_EVENTS.USER_BACK, (data: any) => {
        io.emit(PRESENCE_EVENTS.USER_BACK, {
            userId,
            timestamp: new Date(),
        });
    });
};
