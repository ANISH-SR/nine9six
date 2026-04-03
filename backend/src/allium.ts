/**
 * Allium Explorer / Realtime API client.
 * Explorer queries often require enterprise access — set ALLIUM_API_KEY from
 * https://app.allium.so when available.
 *
 * @see https://docs.allium.so/api/overview
 */

const DEFAULT_BASE = "https://api.allium.so";

export function isAlliumConfigured(): boolean {
  return Boolean(process.env.ALLIUM_API_KEY?.trim());
}

export async function alliumFetch(
  path: string,
  init: RequestInit = {}
): Promise<{ ok: boolean; status: number; body: unknown }> {
  const key = process.env.ALLIUM_API_KEY;
  const base = (process.env.ALLIUM_API_BASE_URL ?? DEFAULT_BASE).replace(/\/$/, "");
  if (!key) {
    return { ok: false, status: 503, body: { error: "ALLIUM_API_KEY not configured" } };
  }
  const url = path.startsWith("http") ? path : `${base}${path.startsWith("/") ? path : `/${path}`}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${key}`,
      Accept: "application/json",
      ...(init.headers as Record<string, string>),
    },
  });
  let body: unknown;
  const text = await res.text();
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  return { ok: res.ok, status: res.status, body };
}
