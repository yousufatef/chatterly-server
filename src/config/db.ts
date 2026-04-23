import mongoose from 'mongoose';
import env from './env';

/**
 * Database Configuration - MongoDB with Mongoose
 * Uses DATABASE_URL from environment variables
 */

export const connectDB = async () => {
    try {
        await mongoose.connect(env.DATABASE_URL);
        console.log('✅ MongoDB connected successfully');
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error);
        process.exit(1);
    }
};

export const disconnectDB = async () => {
    try {
        await mongoose.disconnect();
        console.log('✅ MongoDB disconnected');
    } catch (error) {
        console.error('❌ MongoDB disconnection failed:', error);
    }
};

// Connection event listeners
mongoose.connection.on('error', (error) => {
    console.error('❌ MongoDB connection error:', error);
});

mongoose.connection.on('disconnected', () => {
    console.log('⚠️ MongoDB disconnected');
});

export default mongoose;
