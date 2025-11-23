import IORedis from 'ioredis';

const redisConfig = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    maxRetriesPerRequest: null,
};

export const redis = new IORedis(redisConfig);
export const redisSubscriber = new IORedis(redisConfig);
