import { NextFunction, Request, Response } from "express";

/**
 * When OWS_BACKEND_API_KEY is set, protected routes require:
 *   X-OWS-API-Key: <token>   or   Authorization: Bearer <token>
 *
 * Generate a long-lived secret locally and store it in your vault / secrets manager.
 * (OWS CLI `ows key create` produces agent keys for wallet signing; this env is a separate HTTP gate for your API.)
 */
export function owsBackendApiKeyMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const expected = process.env.OWS_BACKEND_API_KEY?.trim();
  if (!expected) {
    return next();
  }

  const header = req.headers["x-ows-api-key"];
  const fromHeader = typeof header === "string" ? header : undefined;
  const auth = req.headers["authorization"];
  const bearer =
    typeof auth === "string" && auth.startsWith("Bearer ")
      ? auth.slice(7)
      : undefined;
  const token = fromHeader ?? bearer;

  if (token !== expected) {
    return res.status(401).json({
      message: "Invalid or missing API key (OWS_BACKEND_API_KEY)",
    });
  }

  next();
}
