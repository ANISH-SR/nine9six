# nine9six

nine9six is a marketplace-style demo where **users** post micro-tasks (thumbnail-style image choices) and fund them on **Solana**, while **workers** complete tasks and receive payouts. The stack is a Node API backed by PostgreSQL, two Next.js apps (user and worker), wallet-based sign-in, AWS S3 for image uploads, and Solana for payments.

## Repository layout

| Directory        | Role |
| ---------------- | ---- |
| `backend/`       | Express API (`/v1/user`, `/v1/worker`), Prisma, Solana RPC, S3 presigned uploads |
| `user-frontend/` | Next.js app for task creators |
| `worker-frontend/` | Next.js app for workers |

## Prerequisites

- Node.js 18+ (recommended)
- PostgreSQL database
- A Solana RPC endpoint URL (devnet or mainnet, depending on how you configure the app)
- AWS credentials and an S3 bucket in `us-east-1` (the API code uses a fixed bucket name `hkirat-cms`; change `backend/src/routers/user.ts` if you use your own bucket)
- For worker **payouts** from the treasury wallet: a funded keypair. Set `backend/src/privateKey.ts` to your base58-encoded secret (see comments in that file in your fork). Payout signing uses this key with the hard-coded parent wallet address in the routers.

## Backend environment variables

Copy the template and edit it (Prisma and the app load `backend/.env`):

```bash
cp backend/.env.example backend/.env
```

Set at least `DATABASE_URL` before running `npx prisma migrate deploy`. The file should contain:

| Variable        | Purpose |
| --------------- | ------- |
| `DATABASE_URL`  | PostgreSQL connection string for Prisma |
| `RPC_URL`       | Solana JSON-RPC URL |
| `ACCESS_KEY_ID` | AWS access key for S3 |
| `ACCESS_SECRET` | AWS secret key for S3 |
| `JWT_SECRET`    | Secret for user JWTs (defaults to a placeholder in code if unset; set this in production) |

## Backend setup and run

```bash
cd backend
npm install
npx prisma migrate deploy
npx prisma generate
npx tsc
node dist/index.js
```

The API listens on **port 3000** by default (`backend/src/index.ts`).

## Frontends

Both apps call the API via `BACKEND_URL` in `user-frontend/utils/index.ts` and `worker-frontend/utils/index.ts` (default `http://localhost:3000`). Change these if the API is hosted elsewhere.

**Port note:** Next.js defaults to port 3000, which conflicts with this backend. Run each app on a different port, for example:

```bash
cd user-frontend
npm install
npm run dev -- -p 3001
```

```bash
cd worker-frontend
npm install
npm run dev -- -p 3002
```

Then open `http://localhost:3001` and `http://localhost:3002` in the browser.

## API overview

- **User routes** (`/v1/user`): sign-in (wallet message), presigned S3 upload, create tasks, fetch task details and submission aggregates.
- **Worker routes** (`/v1/worker`): sign-in, fetch next task, submit an option choice, request payout.

## Database

Schema and migrations live under `backend/prisma/`. Models include `User`, `Worker`, `Task`, `Option`, `Submission`, and `Payouts`.

## Security and production notes

- Replace default `JWT_SECRET` and never commit real secrets or private keys.
- Review hard-coded wallet addresses and S3 bucket names before deploying.
- CORS is enabled broadly in the API; tighten origins for production.

## License - MIT

See individual `package.json` files (for example `backend/package.json`) for declared package metadata; this repository may not include a top-level license file.


Copyright: HumbleFool07 2026