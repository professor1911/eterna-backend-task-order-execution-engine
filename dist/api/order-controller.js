"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderController = orderController;
const zod_1 = require("zod");
const prisma_1 = require("../lib/prisma");
const order_queue_1 = require("../queue/order-queue");
const redis_1 = require("../lib/redis");
// import { SocketStream } from '@fastify/websocket';
const OrderSchema = zod_1.z.object({
    tokenIn: zod_1.z.string(),
    tokenOut: zod_1.z.string(),
    amount: zod_1.z.number().positive(),
});
async function orderController(fastify) {
    // POST /api/orders/execute
    fastify.post('/execute', async (request, reply) => {
        try {
            const body = OrderSchema.parse(request.body);
            const order = await prisma_1.prisma.order.create({
                data: {
                    tokenIn: body.tokenIn,
                    tokenOut: body.tokenOut,
                    amount: body.amount,
                    status: 'pending',
                },
            });
            await order_queue_1.orderQueue.add('execute-order', { orderId: order.id }, {
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 1000,
                },
            });
            return reply.send({ orderId: order.id, status: 'pending' });
        }
        catch (error) {
            return reply.status(400).send({ error: 'Invalid request' });
        }
    });
    // WebSocket /api/orders/ws/:orderId
    fastify.get('/ws/:orderId', { websocket: true }, (connection, req) => {
        const { orderId } = req.params;
        console.log(`Client connected for order ${orderId}`);
        // Subscribe to Redis channel for this order
        const channel = `order-updates:${orderId}`;
        const listener = (chan, message) => {
            if (chan === channel) {
                connection.socket.send(message);
            }
        };
        redis_1.redisSubscriber.subscribe(channel);
        redis_1.redisSubscriber.on('message', listener);
        connection.socket.on('close', () => {
            console.log(`Client disconnected for order ${orderId}`);
            redis_1.redisSubscriber.unsubscribe(channel);
            redis_1.redisSubscriber.removeListener('message', listener);
        });
    });
}
