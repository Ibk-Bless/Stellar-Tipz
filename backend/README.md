# Stellar Tipz — Backend

The off-chain, real-time backend for Stellar Tipz. It provides the REST API, an
on-chain **indexer** that mirrors Soroban contract events into PostgreSQL, credit
scoring, X (Twitter) integration, notifications, and a WebSocket layer for live updates.

> ⚠️ This backend is being built on the **`test-implement-drips`** branch.
> Pick an issue, branch off `test-implement-drips`, and open your PR **against
> `test-implement-drips`** (not `main`).

---

## Tech stack

| Concern        | Choice                                   |
| -------------- | ---------------------------------------- |
| Language       | TypeScript (Node.js ≥ 20, ESM)           |
| HTTP framework | Express                                  |
| ORM / DB       | Prisma + PostgreSQL                      |
| Cache / queues | Redis + BullMQ                           |
| Realtime       | Socket.IO                                |
| Chain access   | `@stellar/stellar-sdk` (Soroban RPC)     |
| Validation     | Zod                                      |
| Logging        | Pino                                     |
| Tests          | Vitest + Supertest                       |

---

## Quick start

```bash
# 1. From the repo root, switch to the working branch
git checkout test-implement-drips

# 2. Start Postgres + Redis
docker compose -f backend/docker-compose.yml up -d

# 3. Install deps
cd backend
npm install

# 4. Configure env
cp .env.example .env   # then fill in values

# 5. Generate Prisma client + run migrations
npm run prisma:generate
npm run prisma:migrate

# 6. Run the dev server
npm run dev
# → http://localhost:4000/health
```

---

## Project layout

```
backend/
├── src/
│   ├── config/        # validated env + app config
│   ├── common/        # middleware, errors, utils shared across modules
│   ├── db/            # Prisma client
│   ├── modules/       # feature modules (auth, profiles, tips, credit, ...)
│   ├── indexer/       # Soroban event indexer
│   ├── jobs/          # BullMQ queues + workers
│   ├── realtime/      # Socket.IO gateway
│   ├── app.ts         # Express app assembly
│   └── server.ts      # process entry point
├── prisma/schema.prisma
├── tests/
└── docker-compose.yml
```

## Module conventions

Each feature module lives in `src/modules/<name>/` and typically contains:

```
<name>.routes.ts       # Express router
<name>.controller.ts   # request/response handling
<name>.service.ts      # business logic (no Express here)
<name>.schema.ts       # Zod request/response schemas
<name>.types.ts        # shared types
<name>.test.ts         # Vitest tests
```

Mount the router in `src/app.ts`. Throw `AppError` subclasses (`src/common/errors`)
for HTTP errors — the global error handler formats them.

## Contributing

See [docs/BACKEND_CONTRIBUTING.md](docs/BACKEND_CONTRIBUTING.md) and the open issues.
Issues are atomic and self-contained — each lists acceptance criteria and file hints.
