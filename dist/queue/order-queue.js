"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderQueue = exports.ORDER_QUEUE_NAME = void 0;
const bullmq_1 = require("bullmq");
const prisma_1 = require("../lib/prisma");
const redis_1 = require("../lib/redis");
const dex_router_1 = require("../services/dex-router");
exports.ORDER_QUEUE_NAME = 'order-execution';
exports.orderQueue = new bullmq_1.Queue(exports.ORDER_QUEUE_NAME, {
    connection: redis_1.redis,
});
const dexRouter = new dex_router_1.DexRouter();
// Helper to publish status updates via Redis Pub/Sub for WebSocket
async function updateStatus(orderId, status, data) {
    await prisma_1.prisma.order.update({
        where: { id: orderId },
        data: { status, ...data },
    });
    const message = JSON.stringify({ orderId, status, ...data });
    await redis_1.redis.publish(`order-updates:${orderId}`, message);
    console.log(`[Order ${orderId}] Status: ${status}`);
}
const worker = new bullmq_1.Worker(exports.ORDER_QUEUE_NAME, async (job) => {
    const { orderId } = job.data;
    console.log(`Processing order ${orderId}`);
    try {
        // 1. Fetch Order
        const order = await prisma_1.prisma.order.findUnique({ where: { id: orderId } });
        if (!order)
            throw new Error('Order not found');
        // 2. Routing
        await updateStatus(orderId, 'routing');
        const quotes = await dexRouter.getQuotes(order.tokenIn, order.tokenOut, order.amount);
        const bestRoute = dexRouter.selectBestRoute(quotes);
        console.log(`[Order ${orderId}] Selected route: ${bestRoute.dex} @ ${bestRoute.price}`);
        // Update order with chosen DEX
        await prisma_1.prisma.order.update({
            where: { id: orderId },
            data: { dex: bestRoute.dex },
        });
        // 3. Building & Submitting
        await updateStatus(orderId, 'building');
        await new Promise(r => setTimeout(r, 500)); // Simulate building time
        await updateStatus(orderId, 'submitted');
        // 4. Execution
        const result = await dexRouter.executeSwap(bestRoute.dex, order);
        // 5. Confirmed
        await prisma_1.prisma.transaction.create({
            data: {
                orderId: order.id,
                txHash: result.txHash,
                executedPrice: result.executedPrice,
                fee: bestRoute.fee,
            },
        });
        await updateStatus(orderId, 'confirmed', { txHash: result.txHash });
    }
    catch (error) {
        console.error(`[Order ${orderId}] Failed:`, error);
        await updateStatus(orderId, 'failed', { error: error.message });
        throw error; // Triggers BullMQ retry
    }
}, {
    connection: redis_1.redis,
    concurrency: 10, // Requirement: Process 10 concurrent orders
    limiter: {
        max: 100,
        duration: 60000, // Requirement: 100 orders/minute
    },
});
worker.on('failed', async (job, err) => {
    if (job) {
        console.log(`Job ${job.id} failed with ${err.message}`);
    }
});
