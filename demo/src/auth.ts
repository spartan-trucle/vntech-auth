// Users, sessions and permissions. Everything lives in memory and is reseeded on every start.
import type { IncomingMessage } from 'node:http';
import { randomBytes } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { verify } from './jwt.ts';

export type Role = 'viewer' | 'editor' | 'admin';
export type User = { email: string; role: Role; passwordHash: string };
export type AuthResult =
  | { ok: true; user: { email: string; role: Role }; via: 'jwt' | 'session' }
  | { ok: false; reason: string };

// Cost 10 keeps startup fast for the demo; use 12+ in production.
const COST = 10;

// We store only the bcrypt hash ("$2b$10$<salt><hash>"), never the password itself.
export const users = new Map<string, User>();
for (const [email, password, role] of [
  ['admin@demo.vn', 'admin123', 'admin'],
  ['editor@demo.vn', 'editor123', 'editor'],
  ['viewer@demo.vn', 'viewer123', 'viewer'],
] as const) {
  users.set(email, { email, role, passwordHash: bcrypt.hashSync(password, COST) });
}

// RBAC: a role is just a list of permissions. Code asks "can this role do X?",
// never "is this an admin?", so adding a role means editing this table only.
const PERMISSIONS: Record<Role, string[]> = {
  viewer: ['profile:read'],
  editor: ['profile:read', 'posts:write'],
  admin: ['profile:read', 'posts:write', 'users:list'],
};
export const can = (role: Role, permission: string): boolean => PERMISSIONS[role].includes(permission);

// Server-side sessions: random id -> email. Logout = delete the row, effective immediately.
export const sessions = new Map<string, string>();

export function register(email: string, password: string): User | null {
  if (users.has(email)) return null;
  const user: User = { email, role: 'viewer', passwordHash: bcrypt.hashSync(password, COST) };
  users.set(email, user);
  return user;
}

// Compared against when the email is unknown, so both cases take the same bcrypt time.
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', COST);

// Returns null for an unknown email AND for a wrong password. The caller sends one message
// for both, so an attacker cannot use /login to find out which emails have an account.
export function checkPassword(email: string, password: string): User | null {
  const user = users.get(email);
  const ok = bcrypt.compareSync(password, user?.passwordHash ?? DUMMY_HASH);
  return user && ok ? user : null;
}

export function createSession(email: string): string {
  const sid = randomBytes(16).toString('hex'); // 128 random bits: cannot be guessed
  sessions.set(sid, email);
  return sid;
}

export function readCookie(req: IncomingMessage, name: string): string | undefined {
  for (const pair of (req.headers.cookie ?? '').split(';')) {
    const [key, ...rest] = pair.trim().split('=');
    if (key === name) return rest.join('=');
  }
  return undefined;
}

// Who is calling? A Bearer JWT (stateless: trust the signed payload) or a sid cookie
// (stateful: look the session up on the server).
export function authenticate(req: IncomingMessage): AuthResult {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    const result = verify(header.slice('Bearer '.length).trim());
    if (!result.ok) return { ok: false, reason: result.reason };
    return { ok: true, user: { email: result.payload.sub, role: result.payload.role as Role }, via: 'jwt' };
  }
  const sid = readCookie(req, 'sid');
  if (sid) {
    const user = users.get(sessions.get(sid) ?? '');
    if (!user) return { ok: false, reason: 'unknown session' };
    return { ok: true, user: { email: user.email, role: user.role }, via: 'session' };
  }
  return { ok: false, reason: 'missing token' };
}
