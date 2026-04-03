import { Router } from "express";
import { PARENT_WALLET_ADDRESS, TASK_DEPOSIT_LAMPORTS } from "../config";
import { isAlliumConfigured, alliumFetch } from "../allium";

const router = Router();

/**
 * x402-style discovery: returns HTTP 402 with machine-readable payment requirements
 * for task creation (same economics as POST /v1/user/task).
 */
router.get("/x402/task-deposit", (_req, res) => {
  res.status(402).json({
    error: "Payment Required",
    x402: {
      version: 1,
      resource: "POST /v1/user/task",
      description: "nine9six task deposit (0.1 SOL to treasury)",
      paymentRequirements: {
        scheme: "solana-transfer",
        payTo: PARENT_WALLET_ADDRESS,
        amountLamports: TASK_DEPOSIT_LAMPORTS,
        memo: "nine9six-task",
      },
    },
  });
});

/** Same payment info as 200 — for clients that do not handle HTTP 402. */
router.get("/deposit-instructions", (_req, res) => {
  res.json({
    payTo: PARENT_WALLET_ADDRESS,
    amountLamports: TASK_DEPOSIT_LAMPORTS,
    amountSol: TASK_DEPOSIT_LAMPORTS / 1_000_000_000,
    note: "Send payment, then submit POST /v1/user/task with the transaction signature.",
  });
});

router.get("/integrations/allium/status", (_req, res) => {
  res.json({
    configured: isAlliumConfigured(),
    docs: "https://docs.allium.so/api/overview",
  });
});

/**
 * Example passthrough for a saved Explorer query — set ALLIUM_EXPLORER_QUERY_PATH
 * to the path Allium gives you for your saved query (enterprise).
 */
router.post("/integrations/allium/query", async (req, res) => {
  if (!isAlliumConfigured()) {
    return res.status(503).json({
      message: "ALLIUM_API_KEY not set",
    });
  }
  const path =
    process.env.ALLIUM_EXPLORER_QUERY_PATH ?? "/v1/explorer/queries/run";
  const result = await alliumFetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req.body ?? {}),
  });
  res.status(result.status).json(result.body);
});

export default router;
