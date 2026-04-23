import { v4 as uuidv4 } from 'uuid';
import { User, UserCreateInput } from '../types/user.types';

/**
 * User Model - In-memory implementation (replace with actual DB)
 * This is a placeholder for actual database model
 */

const users = new Map<string, User>();

export const UserModel = {
    async create(input: UserCreateInput): Promise<User> {
        const user: User = {
            id: uuidv4(),
            email: input.email,
            password: input.password,
            username: input.username,
            role: 'user',
            isOnline: false,
            lastSeenAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        users.set(user.id, user);
        return user;
    },

    async findById(id: string): Promise<User | null> {
        return users.get(id) || null;
    },

    async findByEmail(email: string): Promise<User | null> {
        for (const user of users.values()) {
            if (user.email === email) return user;
        }
        return null;
    },

    async findByUsername(username: string): Promise<User | null> {
        for (const user of users.values()) {
            if (user.username === username) return user;
        }
        return null;
    },

    async update(id: string, data: Partial<User>): Promise<User | null> {
        const user = users.get(id);
        if (!user) return null;

        const updated = { ...user, ...data, updatedAt: new Date() };
        users.set(id, updated);
        return updated;
    },

    async delete(id: string): Promise<boolean> {
        return users.delete(id);
    },

    async findAll(): Promise<User[]> {
        return Array.from(users.values());
    },
};
