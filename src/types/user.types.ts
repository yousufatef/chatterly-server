/**
 * User types
 */
export interface User {
    id: string;
    email: string;
    password: string;
    username: string;
    avatar?: string;
    role: 'user' | 'admin';
    isOnline: boolean;
    lastSeenAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface UserCreateInput {
    email: string;
    password: string;
    username: string;
}

export interface UserLoginInput {
    email: string;
    password: string;
}

export interface UserResponse {
    id: string;
    email: string;
    username: string;
    avatar?: string;
    role: string;
    isOnline: boolean;
    lastSeenAt: Date;
    createdAt: Date;
}

export interface AuthResponse {
    token: string;
    user: UserResponse;
}
