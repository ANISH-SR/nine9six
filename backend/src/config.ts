export const JWT_SECRET = process.env.JWT_SECRET ?? "kirat123";
export const WORKER_JWT_SECRET = JWT_SECRET + "worker";

export const TOTAL_DECIMALS = 1000_000;

/** Treasury (task payments & worker payouts) — override via env for your deployment */
export const PARENT_WALLET_ADDRESS =
  process.env.PARENT_WALLET_ADDRESS ?? "2KeovpYvrgpziaDsq8nbNMP4mc48VNBVXb5arbqrg9Cq";

export const TASK_DEPOSIT_LAMPORTS = 100_000_000;