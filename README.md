# Order Execution Engine

## Overview
This is a backend system for executing Market Orders on Solana. It routes orders to the best DEX (Raydium or Meteora) using a mock implementation. It handles high concurrency with BullMQ and provides real-time status updates via WebSockets.

## Architecture
- **API**: Fastify (Node.js)
- **Queue**: BullMQ + Redis
- **Database**: PostgreSQL + Prisma
- **Routing**: Mock DexRouter comparing prices with simulated network delays.

## Design Decisions
- **Market Order**: Chosen to focus on the core routing and execution flow.
- **Mock Implementation**: Allows for deterministic testing and development without needing a funded Solana wallet or dealing with devnet instability.
- **BullMQ**: Selected for robust queue management, supporting retries and concurrency control.
- **WebSocket**: Used for real-time updates to avoid polling.

## Setup
1. **Prerequisites**: Node.js, Docker.
2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Environment**:
   Copy `.env.example` to `.env`.
   ```bash
   cp .env.example .env
   ```
4. **Start Infrastructure**:
   ```bash
   docker-compose up -d
   ```
5. **Initialize Database**:
   ```bash
   npx prisma db push
   ```
6. **Run Server**:
   ```bash
   npm run dev
   ```

## Testing
Run the test script to simulate an order:
```bash
npx ts-node scripts/test-order.ts
```

## API Endpoints
- `POST /api/orders/execute`: Submit an order.
  - Body: `{ "tokenIn": "SOL", "tokenOut": "USDC", "amount": 1.0 }`
- `WS /api/orders/ws/:orderId`: Stream order updates.
