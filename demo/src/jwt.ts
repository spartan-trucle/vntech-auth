// A JWT is three base64url parts: header.payload.signature
// signature = HMAC-SHA256(secret, header + "." + payload). Change one byte of the payload
// and the signature no longer matches. Forging one needs the secret.
import { createHmac, timingSafeEqual } from 'node:crypto';

// Demo default only. In real life the secret comes from env / a secret manager, never from git.
const SECRET = process.env.JWT_SECRET ?? 'dev-only-secret-change-me';
const TTL_SECONDS = 15 * 60;

export type Payload = { sub: string; role: string; iat: number; exp: number };
export type VerifyResult =
  | { ok: true; payload: Payload }
  | { ok: false; reason: 'malformed' | 'alg not allowed' | 'bad signature' | 'expired' };

const encode = (obj: object): string => Buffer.from(JSON.stringify(obj)).toString('base64url');
const decode = (part: string): any => JSON.parse(Buffer.from(part, 'base64url').toString());
const hmac = (data: string): Buffer => createHmac('sha256', SECRET).update(data).digest();

export function sign(claims: { sub: string; role: string }, now = Math.floor(Date.now() / 1000)): string {
  const head = encode({ alg: 'HS256', typ: 'JWT' });
  const body = encode({ ...claims, iat: now, exp: now + TTL_SECONDS });
  return `${head}.${body}.${hmac(`${head}.${body}`).toString('base64url')}`;
}

export function verify(token: string): VerifyResult {
  const parts = token.split('.');
  if (parts.length !== 3) return { ok: false, reason: 'malformed' };
  const [head, body, signature] = parts;
  let header, payload;
  try { header = decode(head); payload = decode(body); } catch { return { ok: false, reason: 'malformed' }; }

  // Never let the token choose the algorithm: "none" means "no signature", and accepting
  // whatever alg the header says is the classic JWT bypass. We only speak HS256.
  if (header?.alg !== 'HS256') return { ok: false, reason: 'alg not allowed' };

  // timingSafeEqual takes the same time whether the first or the last byte differs,
  // so an attacker cannot guess the signature byte by byte from response times.
  const expected = hmac(`${head}.${body}`);
  const given = Buffer.from(signature, 'base64url');
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) {
    return { ok: false, reason: 'bad signature' };
  }
  if (typeof payload.exp !== 'number' || payload.exp <= Date.now() / 1000) return { ok: false, reason: 'expired' };
  return { ok: true, payload };
}
