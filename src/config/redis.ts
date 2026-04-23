import { createClient } from 'redis';
import env from './env';

let redisPublisher = createClient({
    socket: {
        host: env.REDIS_HOST,
        port: env.REDIS_PORT,
    },
    password: env.REDIS_PASSWORD || undefined,
});

let redisSubscriber = createClient({
    socket: {
        host: env.REDIS_HOST,
        port: env.REDIS_PORT,
    },
    password: env.REDIS_PASSWORD || undefined,
});

const initRedis = async () => {
    try {
        await redisPublisher.connect();
        await redisSubscriber.connect();
        console.log('✅ Redis clients connected');
    } catch (error) {
        console.error('❌ Redis connection failed:', error);
        process.exit(1);
    }
};

const closeRedis = async () => {
    await redisPublisher.disconnect();
    await redisSubscriber.disconnect();
    console.log('✅ Redis clients disconnected');
};

export { redisPublisher, redisSubscriber, initRedis, closeRedis };
