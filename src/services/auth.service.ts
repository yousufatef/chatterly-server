import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User.model';
import { UserLoginInput, UserCreateInput, UserResponse, AuthResponse } from '../types/user.types';
import env from '../config/env';
import { throwApiError } from '../middleware/error.middleware';

/**
 * Auth Service - Contains ALL business logic for authentication
 * Routes call this service, routes never contain logic
 */

const hashPassword = async (password: string): Promise<string> => {
    // In production, use bcrypt
    return Buffer.from(password).toString('base64');
};

const comparePassword = async (plain: string, hashed: string): Promise<boolean> => {
    // In production, use bcrypt
    return hashed === Buffer.from(plain).toString('base64');
};

const generateToken = (userId: string, email: string, role: string): string => {
    return jwt.sign(
        { id: userId, email, role },
        env.JWT_SECRET,
        { expiresIn: env.JWT_EXPIRES_IN },
    );
};

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

export const AuthService = {
    async register(input: UserCreateInput): Promise<AuthResponse> {
        // Check if user exists
        const existing = await UserModel.findByEmail(input.email);
        if (existing) {
            throwApiError(409, 'Email already registered');
        }

        const usernameExists = await UserModel.findByUsername(input.username);
        if (usernameExists) {
            throwApiError(409, 'Username already taken');
        }

        // Hash password
        const hashedPassword = await hashPassword(input.password);

        // Create user
        const user = await UserModel.create({
            ...input,
            password: hashedPassword,
        });

        // Generate token
        const token = generateToken(user.id, user.email, user.role);

        return {
            token,
            user: formatUserResponse(user),
        };
    },

    async login(input: UserLoginInput): Promise<AuthResponse> {
        // Find user by email
        const user = await UserModel.findByEmail(input.email);
        if (!user) {
            throwApiError(401, 'Invalid credentials');
        }

        // Compare password
        const passwordMatch = await comparePassword(input.password, user.password);
        if (!passwordMatch) {
            throwApiError(401, 'Invalid credentials');
        }

        // Generate token
        const token = generateToken(user.id, user.email, user.role);

        return {
            token,
            user: formatUserResponse(user),
        };
    },

    async getCurrentUser(userId: string): Promise<UserResponse> {
        const user = await UserModel.findById(userId);
        if (!user) {
            throwApiError(404, 'User not found');
        }

        return formatUserResponse(user);
    },

    async setOnlineStatus(userId: string, isOnline: boolean): Promise<void> {
        await UserModel.update(userId, {
            isOnline,
            lastSeenAt: new Date(),
        });
    },
};
