import "server-only";
import { writeFileSync, readFileSync, existsSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import type { OAuthTokenResponse } from "./types";

const API_BASE = "https://api.rentsyst.com/v1";
const TOKEN_FILE = join(tmpdir(), "rentsyst_token_cache.json");

// Use globalThis to persist token across HMR reloads in dev
const globalCache = globalThis as unknown as {
  __rentsyst_token?: string;
  __rentsyst_token_expires?: number;
};

interface TokenCache {
  token: string;
  expires: number;
}

// Deduplicates concurrent token requests — only one HTTP call fires at a time.
// Without this, 10+ simultaneous requests after a cache miss would all race to
// call the token endpoint simultaneously, instantly exhausting the 10 req/hr limit.
let _inflightTokenRequest: Promise<string> | null = null;

function loadPersistedToken(): void {
  if (globalCache.__rentsyst_token) return; // already loaded in memory
  try {
    if (existsSync(TOKEN_FILE)) {
      const raw = readFileSync(TOKEN_FILE, "utf8");
      const cached: TokenCache = JSON.parse(raw);
      if (cached.token && cached.expires && Date.now() < cached.expires) {
        globalCache.__rentsyst_token = cached.token;
        globalCache.__rentsyst_token_expires = cached.expires;
      }
    }
  } catch {
    // ignore read errors
  }
}

function persistToken(token: string, expires: number): void {
  try {
    const data: TokenCache = { token, expires };
    writeFileSync(TOKEN_FILE, JSON.stringify(data), "utf8");
  } catch {
    // ignore write errors
  }
}

async function fetchNewToken(): Promise<string> {
  const now = Date.now();

  const res = await fetch(`${API_BASE}/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.RENTSYST_CLIENT_ID!,
      client_secret: process.env.RENTSYST_CLIENT_SECRET!,
      grant_type: "client_credentials",
      scope: "booking",
    }),
  });

  if (!res.ok) {
    // If rate limited and we have an old token, try using it
    if (res.status === 429 && globalCache.__rentsyst_token) {
      console.warn("RentSyst token rate limited, using cached token");
      // Extend the cache by 10 minutes and hope it still works
      globalCache.__rentsyst_token_expires = now + 10 * 60 * 1000;
      persistToken(globalCache.__rentsyst_token, globalCache.__rentsyst_token_expires);
      return globalCache.__rentsyst_token;
    }
    throw new Error(`RentSyst auth failed: ${res.status}`);
  }

  const data: OAuthTokenResponse = await res.json();
  globalCache.__rentsyst_token = data.access_token;
  // Token valid for 24h, refresh 30 min before expiry to minimize requests
  globalCache.__rentsyst_token_expires = now + (data.expires_in - 1800) * 1000;

  // Persist to disk so server restarts don't require a new token request
  persistToken(globalCache.__rentsyst_token, globalCache.__rentsyst_token_expires);

  return globalCache.__rentsyst_token;
}

export async function getAccessToken(): Promise<string> {
  // Emergency override: if RENTSYST_ACCESS_TOKEN is set in .env.local,
  // skip the token endpoint entirely. Useful when rate-limited during dev.
  if (process.env.RENTSYST_ACCESS_TOKEN) {
    return process.env.RENTSYST_ACCESS_TOKEN;
  }

  // Load from disk if not in memory (survives server restarts)
  loadPersistedToken();

  const now = Date.now();

  // Return immediately if a valid token is cached
  if (globalCache.__rentsyst_token && globalCache.__rentsyst_token_expires && now < globalCache.__rentsyst_token_expires) {
    return globalCache.__rentsyst_token;
  }

  // If a fetch is already in-flight, wait for it — don't fire a second request.
  // This prevents 10 simultaneous requests from all hitting the token endpoint at once.
  if (_inflightTokenRequest) {
    return _inflightTokenRequest;
  }

  _inflightTokenRequest = fetchNewToken().finally(() => {
    _inflightTokenRequest = null;
  });

  return _inflightTokenRequest;
}
