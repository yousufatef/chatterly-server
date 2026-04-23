import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import fileUpload from 'express-fileupload';
import env from './config/env';
import { setupSocket } from './socket';
import { errorMiddleware } from './middleware/error.middleware';

// Routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import roomRoutes from './routes/room.routes';
import messageRoutes from './routes/message.routes';
import uploadRoutes from './routes/upload.routes';

/**
 * Express App Setup
 * Follows AGENTS.md requirements:
 * - All routes under /api/v1
 * - Response shape: { success, data?, error?, pagination? }
 * - All routes call services (no business logic in routes)
 */

const app = express();
const server = createServer(app);

// Socket.io configuration
const io = new Server(server, {
    cors: {
        origin: env.CORS_ORIGIN,
        methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
});

// Middleware
app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(fileUpload());

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

// API Routes - All follow /api/v1 base path
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/rooms', roomRoutes);
app.use('/api/v1/messages', messageRoutes);
app.use('/api/v1/uploads', uploadRoutes);

// Static files for uploads
app.use('/uploads', express.static('uploads'));

// Socket.io setup
setupSocket(io);

// Error handling middleware (must be last)
app.use(errorMiddleware);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found',
    });
});

export { app, server, io };
