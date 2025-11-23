import Fastify from 'fastify';
import websocket from '@fastify/websocket';
import { orderController } from './api/order-controller';
import dotenv from 'dotenv';

dotenv.config();

const server = Fastify({ logger: true });

server.register(websocket);
server.register(orderController, { prefix: '/api/orders' });

const start = async () => {
    try {
        const port = parseInt(process.env.PORT || '3000');
        await server.listen({ port, host: '0.0.0.0' });
        console.log(`Server running on port ${port}`);
    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};

start();
