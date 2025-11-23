# Eterna Backend – Order Execution Engine

## Overview

The **Eterna backend** is a high‑performance order execution engine built with **Node.js**, **TypeScript**, **Fastify**, **BullMQ**, **Redis**, and **PostgreSQL**. It routes market, limit, and sniper orders to DEXes, tracks execution progress via WebSockets, and persists order history in a PostgreSQL database.

Key features:
- **DEX routing** – integrates with multiple decentralized exchanges via a modular router.
- **Real‑time status** – WebSocket streams keep clients informed of each execution step.
- **Robust queueing** – BullMQ ensures reliable, retry‑able background processing.
- **Typed contracts** – Prisma ORM provides type‑safe database access.
- **Extensive test suite** – Jest + TypeScript tests cover routing, queue handling, and API contracts.

---

## Prerequisites

- **Node.js** >= 18 (LTS) – `nvm` recommended.
- **npm** (comes with Node) – version 9+.
- **Docker** (optional) – for running Redis & PostgreSQL locally.
- **Git** – to clone the repository.

---

## Installation

```bash
# Clone the repository
git clone <repo-url>
cd e:/Placement/Phase 1/Eterna/backend

# Install dependencies
npm ci
```

### Running services locally (Docker)

```bash
# Start Redis and PostgreSQL containers
docker compose up -d
```

Make sure the containers are healthy before proceeding.

---

## Environment Variables

Create a `.env` file in the project root (a template is provided as `.env.example`). Required variables:

| Variable | Description |
|----------|-------------|
| `PORT` | HTTP server port (default `3000`). |
| `DATABASE_URL` | PostgreSQL connection string, e.g. `postgresql://user:pass@localhost:5432/eterna`. |
| `REDIS_URL` | Redis connection string, e.g. `redis://localhost:6379`. |
| `DEX_API_KEY` | API key for external DEX providers (if any). |
| `JWT_SECRET` | Secret used to sign JWT tokens for authentication. |
| `WS_PORT` | WebSocket server port (default `4000`). |

---

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Starts Fastify server with hot‑reload (uses `ts-node-dev`). |
| `npm run build` | Compiles TypeScript to `dist/`. |
| `npm start` | Runs compiled code (`node dist/index.js`). |
| `npm run lint` | Executes ESLint checks. |
| `npm test` | Runs Jest test suite. |
| `npm run test:watch` | Runs tests in watch mode. |
| `npm run prisma:generate` | Generates Prisma client. |
| `npm run prisma:migrate` | Applies pending migrations. |

---

## Testing

The project uses **Jest** with **ts-jest** for unit and integration tests.

```bash
# Run all tests
npm test

# Run a single test file
npm test -- src/services/dex-router.test.ts
```

Coverage reports are generated with `npm run test:coverage` (if configured).

---

## Architecture Overview

```
src/
├─ api/                # Fastify route definitions
├─ services/           # Core business logic (order routing, execution, etc.)
├─ workers/            # BullMQ queue processors
├─ websockets/         # WebSocket server & handlers
├─ prisma/             # Prisma schema & generated client
└─ utils/              # Helper functions & constants
```

- **Fastify** handles HTTP endpoints (`/orders`, `/status`).
- **BullMQ** queues (`orderQueue`) process orders asynchronously.
- **WebSocket** (`/ws`) pushes step‑by‑step updates to connected clients.
- **Prisma** abstracts DB interactions; migrations live in `prisma/migrations/`.

---

## API Endpoints (selected)

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/orders` | Submit a new order (market, limit, sniper). |
| `GET`  | `/orders/:id` | Retrieve order details and current status. |
| `GET`  | `/orders/:id/trace` | Stream execution trace via WebSocket. |
| `GET`  | `/health` | Health‑check endpoint. |

Full OpenAPI spec is available at `http://localhost:{PORT}/docs` when the server is running.

---

## Contributing

1. Fork the repository.
2. Create a feature branch (`git checkout -b feat/awesome-feature`).
3. Write tests for your changes.
4. Ensure lint passes (`npm run lint`).
5. Submit a Pull Request.

Please follow the existing code style (ESLint + Prettier) and include descriptive commit messages.

Made by Vaibhav Shivaji Bhawar
