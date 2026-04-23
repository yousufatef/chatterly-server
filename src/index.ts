// Environment variables are loaded by tsx --env-file flag
// Import modules that depend on environment variables
import env from './config/env';
import { server } from './app';
import { connectDB, disconnectDB } from './config/db';

/**
 * Application Entry Point
 * 1. Environment variables loaded by tsx --env-file=.env
 * 2. Validates all env vars (via env.ts, app crashes if missing - AGENTS.md rule #5)
 * 3. Connects to MongoDB using DATABASE_URL
 * 4. Starts HTTP + Socket.io server
 */

const PORT = env.PORT;
const NODE_ENV = env.NODE_ENV;

const startServer = async () => {
    try {
        // Connect to MongoDB
        await connectDB();

        // Start server
        server.listen(PORT, () => {
            console.log(`
╔════════════════════════════════════════════════════════════════╗
║          🚀 Chatterly Server Started                           ║
╠════════════════════════════════════════════════════════════════╣
║  Environment: ${NODE_ENV.padEnd(48)}║
║  Port: ${PORT.toString().padEnd(56)}║
║  API Base: /api/v1                                        ║
║  WebSocket: Enabled (In-Memory Adapter)                   ║
║  Database: MongoDB (Connected)                            ║
╚════════════════════════════════════════════════════════════════╝
      `);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('📍 SIGTERM received, shutting down gracefully...');
    server.close(async () => {
        await disconnectDB();
        process.exit(0);
    });
});

process.on('SIGINT', async () => {
    console.log('📍 SIGINT received, shutting down gracefully...');
    server.close(async () => {
        await disconnectDB();
        process.exit(0);
    });
});

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

// Start the server
startServer();
