// The Forger: a tiny auth server for the talk. node:http only, no framework.
//   pnpm dev            run in the foreground on :4000 (PORT to change)
//   pnpm start / stop   run it in the background (see src/cli.ts)
import http from 'node:http';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { fileURLToPath } from 'node:url';
import { authenticate, can, checkPassword, createSession, readCookie, register, sessions, users } from './auth.ts';
import type { Role } from './auth.ts';
import { sign } from './jwt.ts';

type Body = Record<string, unknown>;

function send(res: ServerResponse, status: number, body?: unknown, headers: Record<string, string> = {}): void {
  res.writeHead(status, body === undefined ? headers : { 'Content-Type': 'application/json', ...headers });
  res.end(body === undefined ? undefined : JSON.stringify(body));
}

// The slide runs on another origin and sends the cookie, so we echo its Origin
// (credentials are not allowed together with "*") and expose X-Auth-Reason to its JavaScript.
function cors(req: IncomingMessage, res: ServerResponse): void {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin ?? '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Expose-Headers', 'X-Auth-Reason');
  res.setHeader('Vary', 'Origin');
}

async function readJson(req: IncomingMessage): Promise<Body> {
  let raw = '';
  for await (const chunk of req) raw += chunk;
  try { return JSON.parse(raw || '{}'); } catch { return {}; }
}

// 401 = "I don't know who you are". 403 = "I know who you are, and you may not".
function requireAuth(req: IncomingMessage, res: ServerResponse): { user: { email: string; role: Role }; via: string } | null {
  const auth = authenticate(req);
  if (auth.ok) return auth;
  send(res, 401, { error: 'Unauthorized', reason: auth.reason }, { 'X-Auth-Reason': auth.reason });
  return null;
}

function requirePermission(role: Role, permission: string, res: ServerResponse): boolean {
  if (can(role, permission)) return true;
  send(res, 403, { error: 'Forbidden', need: permission });
  return false;
}

async function handle(req: IncomingMessage, res: ServerResponse): Promise<void> {
  cors(req, res);
  const route = `${req.method} ${new URL(req.url ?? '/', 'http://localhost').pathname}`;
  if (req.method === 'OPTIONS') return send(res, 204);

  switch (route) {
    case 'GET /__health':
      return send(res, 200, { ok: true });

    case 'POST /register': {
      const { email, password } = await readJson(req);
      if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
        return send(res, 400, { error: 'email and password are required' });
      }
      const user = register(email, password);
      if (!user) return send(res, 409, { error: 'Email already registered' });
      return send(res, 201, { email: user.email, role: user.role });
    }

    case 'POST /login': {
      const { email, password } = await readJson(req);
      const user = checkPassword(String(email ?? ''), String(password ?? ''));
      // Same message for "no such email" and "wrong password": do not confirm which emails exist.
      if (!user) return send(res, 401, { error: 'Email or password is wrong' });
      const sid = createSession(user.email);
      // HttpOnly: page JavaScript (and an XSS) cannot read the cookie. SameSite=Lax: not sent on cross-site POSTs.
      return send(res, 200, { token: sign({ sub: user.email, role: user.role }), user: { email: user.email, role: user.role } },
        { 'Set-Cookie': `sid=${sid}; HttpOnly; SameSite=Lax; Path=/` });
    }

    case 'POST /logout': {
      const sid = readCookie(req, 'sid');
      if (sid) sessions.delete(sid);
      return send(res, 204, undefined, { 'Set-Cookie': 'sid=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0' });
    }

    case 'GET /me': {
      const auth = requireAuth(req, res);
      if (!auth) return;
      return send(res, 200, { ...auth.user, via: auth.via });
    }

    case 'GET /admin/users': {
      const auth = requireAuth(req, res);
      if (!auth || !requirePermission(auth.user.role, 'users:list', res)) return;
      return send(res, 200, [...users.values()].map(({ email, role }) => ({ email, role })));
    }

    case 'GET /__db': // demo only: shows what a database leak would expose. Hashes, not passwords.
      return send(res, 200, [...users.values()]);

    default:
      return send(res, 404, { error: 'Not found' });
  }
}

export function createServer(): http.Server {
  return http.createServer((req, res) => {
    handle(req, res).catch((err) => { console.error(err); send(res, 500, { error: 'Internal error' }); });
  });
}

// Listen only when run directly (`node src/server.ts`); tests import createServer() instead.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT ?? 4000);
  createServer().listen(port, () => console.log(`Auth demo listening on http://localhost:${port}`));
}
