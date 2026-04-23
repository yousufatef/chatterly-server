import crypto from 'crypto';

/**
 * Password hashing utilities
 * In production, use bcrypt instead
 */

export const hashPassword = async (password: string): Promise<string> => {
    // This is a placeholder - use bcrypt in production
    return crypto.createHash('sha256').update(password).digest('hex');
};

export const comparePassword = async (
    plainPassword: string,
    hashedPassword: string,
): Promise<boolean> => {
    const hashed = crypto.createHash('sha256').update(plainPassword).digest('hex');
    return hashed === hashedPassword;
};

export const generateSalt = (): string => {
    return crypto.randomBytes(16).toString('hex');
};
