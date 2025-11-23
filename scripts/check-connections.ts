
import { PrismaClient } from '@prisma/client';
import IORedis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();
const redis = new IORedis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    maxRetriesPerRequest: null,
});

async function check() {
    console.log('Checking connections...');

    try {
        await prisma.$connect();
        console.log('PostgreSQL connected');
    } catch (e) {
        console.error('PostgreSQL connection failed:', e);
    }

    try {
        await redis.ping();
        console.log('Redis connected');
    } catch (e) {
        console.error('Redis connection failed:', e);
    }

    await prisma.$disconnect();
    redis.disconnect();
}

check();
