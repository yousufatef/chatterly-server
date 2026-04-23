import { z } from 'zod';

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.coerce.number().default(3000),

    // Database
    DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),

    // Redis - REMOVED (using Socket.io built-in adapter instead)

    // JWT
    JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
    JWT_EXPIRES_IN: z.string().default('7d'),

    // CORS
    CORS_ORIGIN: z.string().default('http://localhost:3001'),

    // Upload
    UPLOAD_DIR: z.string().default('./uploads'),
    MAX_FILE_SIZE: z.coerce.number().default(10 * 1024 * 1024), // 10MB

    // Logging
    LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

type Env = z.infer<typeof envSchema>;

let env: Env;

try {
    env = envSchema.parse(process.env);
} catch (error) {
    if (error instanceof z.ZodError) {
        console.error('❌ Environment variable validation failed:');
        error.issues.forEach((err) => {
            console.error(`  • ${err.path.join('.')}: ${err.message}`);
        });
        process.exit(1);
    }
    throw error;
}

export default env;
export type { Env };
