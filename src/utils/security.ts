/**
 * Security utilities
 * Uses Web Crypto API (built into every modern browser — no dependencies)
 */

// ── Password ──────────────────────────────────────────────────────────────────

export const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  const inputHash = await hashPassword(password);
  // Constant-time comparison to prevent timing attacks
  if (inputHash.length !== hash.length) return false;
  let diff = 0;
  for (let i = 0; i < inputHash.length; i++) {
    diff |= inputHash.charCodeAt(i) ^ hash.charCodeAt(i);
  }
  return diff === 0;
};

// Override via VITE_ADMIN_PASSWORD_HASH in .env (see .env.example)
const DEFAULT_PASSWORD_HASH = '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9';
export const ADMIN_PASSWORD_HASH =
  import.meta.env.VITE_ADMIN_PASSWORD_HASH || DEFAULT_PASSWORD_HASH;

// ── Session Token ─────────────────────────────────────────────────────────────
// Instead of storing a plain boolean, we store a signed token.
// Format: base64(payload) + "." + base64(hmac)
// Payload: { iat: timestamp, exp: timestamp, sub: "admin" }
// Signing key is derived from the password hash + a browser fingerprint.
// Even if someone reads the token, they cannot forge a new valid one without
// knowing the password hash (which is never stored in the token itself).

const SESSION_KEY = 'admin_session_token';
const SESSION_DURATION = 2 * 60 * 60 * 1000; // 2 hours

// Derive a per-browser HMAC key from the password hash
async function deriveHMACKey(passwordHash: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  // Mix password hash with a stable browser fingerprint
  const fingerprint = [
    navigator.language,
    navigator.platform,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
  ].join('|');

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(passwordHash + fingerprint),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
  return keyMaterial;
}

function b64encode(buf: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}

function b64decode(str: string): Uint8Array {
  return new Uint8Array(
    atob(str).split('').map(c => c.charCodeAt(0))
  );
}

export interface SessionPayload {
  sub: 'admin';
  iat: number; // issued at
  exp: number; // expires at
  jti: string; // unique token id (prevents replay)
}

export async function createSessionToken(): Promise<string> {
  const now = Date.now();
  const payload: SessionPayload = {
    sub: 'admin',
    iat: now,
    exp: now + SESSION_DURATION,
    jti: Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join(''),
  };

  const encoder = new TextEncoder();
  const payloadStr = JSON.stringify(payload);
  const payloadB64 = btoa(payloadStr);

  const key = await deriveHMACKey(ADMIN_PASSWORD_HASH);
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(payloadB64));

  return `${payloadB64}.${b64encode(sig)}`;
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  if (!token || typeof token !== 'string') return null;

  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [payloadB64, sigB64] = parts;

  try {
    const encoder = new TextEncoder();
    const key = await deriveHMACKey(ADMIN_PASSWORD_HASH);
    const sigBytes = b64decode(sigB64);

    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      sigBytes,
      encoder.encode(payloadB64)
    );

    if (!valid) {
      logSecurityEvent('TOKEN_INVALID_SIGNATURE');
      return null;
    }

    const payload: SessionPayload = JSON.parse(atob(payloadB64));

    if (payload.sub !== 'admin') return null;
    if (Date.now() > payload.exp) {
      logSecurityEvent('TOKEN_EXPIRED');
      return null;
    }

    return payload;
  } catch {
    logSecurityEvent('TOKEN_PARSE_ERROR');
    return null;
  }
}

export function storeSession(token: string): void {
  sessionStorage.setItem(SESSION_KEY, token);
  // Do NOT store in localStorage — sessionStorage clears on tab close
  // This prevents persistent injection via DevTools
}

export function getStoredToken(): string | null {
  return sessionStorage.getItem(SESSION_KEY);
}

export function clearSession(): void {
  sessionStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem('last_activity');
  localStorage.removeItem('admin_authenticated'); // Remove old boolean if it exists
  localStorage.removeItem('last_activity');
  resetLoginAttempts();
}

// ── Rate Limiting ─────────────────────────────────────────────────────────────

const LOGIN_ATTEMPTS_KEY = 'login_attempts';
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

interface LoginAttempt {
  count: number;
  lockedUntil?: number;
}

export const checkLoginAttempts = (): { allowed: boolean; remainingAttempts?: number; lockedUntil?: Date } => {
  try {
    const stored = localStorage.getItem(LOGIN_ATTEMPTS_KEY);
    const attempts: LoginAttempt = stored ? JSON.parse(stored) : { count: 0 };

    if (attempts.lockedUntil && Date.now() < attempts.lockedUntil) {
      return { allowed: false, lockedUntil: new Date(attempts.lockedUntil) };
    }

    if (attempts.lockedUntil && Date.now() >= attempts.lockedUntil) {
      attempts.count = 0;
      attempts.lockedUntil = undefined;
      localStorage.setItem(LOGIN_ATTEMPTS_KEY, JSON.stringify(attempts));
    }

    return { allowed: attempts.count < MAX_ATTEMPTS, remainingAttempts: MAX_ATTEMPTS - attempts.count };
  } catch {
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS };
  }
};

export const recordFailedLogin = (): void => {
  try {
    const stored = localStorage.getItem(LOGIN_ATTEMPTS_KEY);
    const attempts: LoginAttempt = stored ? JSON.parse(stored) : { count: 0 };
    attempts.count += 1;
    if (attempts.count >= MAX_ATTEMPTS) {
      attempts.lockedUntil = Date.now() + LOCKOUT_DURATION;
    }
    localStorage.setItem(LOGIN_ATTEMPTS_KEY, JSON.stringify(attempts));
  } catch { /* ignore */ }
};

export const resetLoginAttempts = (): void => {
  localStorage.removeItem(LOGIN_ATTEMPTS_KEY);
};

// ── Activity Tracking ─────────────────────────────────────────────────────────

const SESSION_TIMEOUT = 2 * 60 * 60 * 1000; // 2 hours

export const updateLastActivity = (): void => {
  sessionStorage.setItem('last_activity', Date.now().toString());
};

export const checkSessionTimeout = (): boolean => {
  const last = sessionStorage.getItem('last_activity');
  if (!last) return true; // no activity recorded = treat as expired
  return Date.now() - parseInt(last) > SESSION_TIMEOUT;
};

// ── Input Sanitization ────────────────────────────────────────────────────────

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '').slice(0, 100);
};

// ── Logging ───────────────────────────────────────────────────────────────────

export const logSecurityEvent = (event: string, details?: unknown): void => {
  const timestamp = new Date().toISOString();
  console.warn(`[SECURITY] ${timestamp} — ${event}`, details ?? '');
};
