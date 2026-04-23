import { UserModel } from '../models/User.model';
import { UserResponse } from '../types/user.types';
import { throwApiError } from '../middleware/error.middleware';

/**
 * User Service - Contains ALL business logic for user operations
 * Routes call this service, routes never contain logic
 */

const formatUserResponse = (user: any): UserResponse => {
    return {
        id: user.id,
        email: user.email,
        username: user.username,
        avatar: user.avatar,
        role: user.role,
        isOnline: user.isOnline,
        lastSeenAt: user.lastSeenAt,
        createdAt: user.createdAt,
    };
};

export const UserService = {
    async getUser(userId: string): Promise<UserResponse> {
        const user = await UserModel.findById(userId);
        if (!user) {
            throwApiError(404, 'User not found');
        }

        return formatUserResponse(user);
    },

    async getUserByUsername(username: string): Promise<UserResponse> {
        const user = await UserModel.findByUsername(username);
        if (!user) {
            throwApiError(404, 'User not found');
        }

        return formatUserResponse(user);
    },

    async updateUser(userId: string, data: Partial<any>): Promise<UserResponse> {
        const user = await UserModel.findById(userId);
        if (!user) {
            throwApiError(404, 'User not found');
        }

        // Only allow updating certain fields
        const allowedFields = ['username', 'avatar'];
        const updateData: any = {};

        for (const field of allowedFields) {
            if (field in data) {
                updateData[field] = data[field];
            }
        }

        const updated = await UserModel.update(userId, updateData);
        return formatUserResponse(updated);
    },

    async searchUsers(query: string, limit = 10): Promise<UserResponse[]> {
        const users = await UserModel.findAll();

        const filtered = users
            .filter((u) =>
                u.username.toLowerCase().includes(query.toLowerCase()) ||
                u.email.toLowerCase().includes(query.toLowerCase())
            )
            .slice(0, limit);

        return filtered.map((u) => formatUserResponse(u));
    },

    async getOnlineUsers(): Promise<UserResponse[]> {
        const users = await UserModel.findAll();
        return users
            .filter((u) => u.isOnline)
            .map((u) => formatUserResponse(u));
    },
};
