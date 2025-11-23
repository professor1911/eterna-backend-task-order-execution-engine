import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { orderQueue } from '../queue/order-queue';
import { redisSubscriber } from '../lib/redis';

const OrderSchema = z.object({
    tokenIn: z.string(),
    tokenOut: z.string(),
    amount: z.number().positive(),
});

export async function orderController(fastify: FastifyInstance) {
    // POST /api/orders/execute
    fastify.post('/execute', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const body = OrderSchema.parse(request.body);

            const order = await prisma.order.create({
                data: {
                    tokenIn: body.tokenIn,
                    tokenOut: body.tokenOut,
                    amount: body.amount,
                    status: 'pending',
                },
            });

            await orderQueue.add('execute-order', { orderId: order.id }, {
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 1000,
                },
            });

            return reply.send({ orderId: order.id, status: 'pending' });
        } catch (error) {
            return reply.status(400).send({ error: 'Invalid request' });
        }
    });

    // WebSocket /api/orders/ws/:orderId
    fastify.get('/ws/:orderId', { websocket: true }, (connection: any, req) => {
        const { orderId } = req.params as { orderId: string };
        console.log(`Client connected for order ${orderId}`);

        // Subscribe to Redis channel for this order
        const channel = `order-updates:${orderId}`;

        const listener = (chan: string, message: string) => {
            if (chan === channel) {
                connection.send(message);
            }
        };

        redisSubscriber.subscribe(channel);
        redisSubscriber.on('message', listener);

        connection.on('close', () => {
            console.log(`Client disconnected for order ${orderId}`);
            redisSubscriber.unsubscribe(channel);
            redisSubscriber.removeListener('message', listener);
        });
    });
}
