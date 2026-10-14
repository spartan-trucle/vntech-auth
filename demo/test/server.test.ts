import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import { createServer } from '../src/server.ts';

let server: Server;
let base: string;

before(async () => {
  server = createServer();
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});
after(() => { server.close(); });

const post = (path: string, body: object, headers: Record<string, string> = {}): Promise<Response> =>
  fetch(base + path, { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body) });

async function login(email: string, password: string): Promise<{ token: string; cookie: string; res: Response }> {
  const res = await post('/login', { email, password });
  const body = await res.json();
  const cookie = (res.headers.get('set-cookie') ?? '').split(';')[0]; // "sid=..."
  return { token: body.token, cookie, res };
}

test('GET /__health is 200', async () => {
  const res = await fetch(`${base}/__health`);
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { ok: true });
});

test('GET /me with nothing is 401 "missing token"', async () => {
  const res = await fetch(`${base}/me`);
  assert.equal(res.status, 401);
  assert.equal(res.headers.get('x-auth-reason'), 'missing token');
  assert.deepEqual(await res.json(), { error: 'Unauthorized', reason: 'missing token' });
});

test('wrong password and unknown email get the same 401 body', async () => {
  const wrong = await post('/login', { email: 'admin@demo.vn', password: 'nope' });
  const unknown = await post('/login', { email: 'ghost@demo.vn', password: 'nope' });
  assert.equal(wrong.status, 401);
  assert.equal(unknown.status, 401);
  const a = await wrong.text();
  assert.equal(a, await unknown.text());
  assert.deepEqual(JSON.parse(a), { error: 'Email or password is wrong' });
});

test('login ok returns a token, the user and an HttpOnly session cookie', async () => {
  const res = await post('/login', { email: 'viewer@demo.vn', password: 'viewer123' });
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.token.split('.').length, 3);
  assert.deepEqual(body.user, { email: 'viewer@demo.vn', role: 'viewer' });
  const cookie = res.headers.get('set-cookie') ?? '';
  assert.match(cookie, /^sid=[0-9a-f]{32}; /);
  assert.match(cookie, /HttpOnly/);
  assert.match(cookie, /SameSite=Lax/);
  assert.match(cookie, /Path=\//);
});

test('GET /me with a Bearer token is via jwt', async () => {
  const { token } = await login('editor@demo.vn', 'editor123');
  const res = await fetch(`${base}/me`, { headers: { Authorization: `Bearer ${token}` } });
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { email: 'editor@demo.vn', role: 'editor', via: 'jwt' });
});

test('GET /me with the session cookie is via session', async () => {
  const { cookie } = await login('editor@demo.vn', 'editor123');
  const res = await fetch(`${base}/me`, { headers: { Cookie: cookie } });
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { email: 'editor@demo.vn', role: 'editor', via: 'session' });
});

test('GET /me with an unknown sid is 401 "unknown session"', async () => {
  const res = await fetch(`${base}/me`, { headers: { Cookie: 'sid=00000000000000000000000000000000' } });
  assert.equal(res.status, 401);
  assert.equal(res.headers.get('x-auth-reason'), 'unknown session');
});

test('viewer on /admin/users is 403 and says which permission is missing', async () => {
  const { token } = await login('viewer@demo.vn', 'viewer123');
  const res = await fetch(`${base}/admin/users`, { headers: { Authorization: `Bearer ${token}` } });
  assert.equal(res.status, 403);
  assert.deepEqual(await res.json(), { error: 'Forbidden', need: 'users:list' });
});

test('admin on /admin/users gets the list without password hashes', async () => {
  const { token } = await login('admin@demo.vn', 'admin123');
  const res = await fetch(`${base}/admin/users`, { headers: { Authorization: `Bearer ${token}` } });
  assert.equal(res.status, 200);
  const users = await res.json();
  assert.ok(users.some((u: { email: string; role: string }) => u.email === 'admin@demo.vn' && u.role === 'admin'));
  for (const u of users) assert.deepEqual(Object.keys(u).sort(), ['email', 'role']);
});

test('a tampered token on /me is 401 "bad signature"', async () => {
  const { token } = await login('viewer@demo.vn', 'viewer123');
  const [header, payload, signature] = token.split('.');
  const forged = { ...JSON.parse(Buffer.from(payload, 'base64url').toString()), role: 'admin' };
  const tampered = `${header}.${Buffer.from(JSON.stringify(forged)).toString('base64url')}.${signature}`;
  const res = await fetch(`${base}/me`, { headers: { Authorization: `Bearer ${tampered}` } });
  assert.equal(res.status, 401);
  assert.equal(res.headers.get('x-auth-reason'), 'bad signature');
  assert.deepEqual(await res.json(), { error: 'Unauthorized', reason: 'bad signature' });
});

test('/__db shows bcrypt hashes, never plaintext passwords', async () => {
  const res = await fetch(`${base}/__db`);
  assert.equal(res.status, 200);
  const text = await res.text();
  for (const pw of ['admin123', 'editor123', 'viewer123']) assert.ok(!text.includes(pw), `${pw} leaked`);
  for (const row of JSON.parse(text)) assert.match(row.passwordHash, /^\$2b\$10\$/);
});

test('register creates a viewer, rejects duplicates and missing fields', async () => {
  const ok = await post('/register', { email: 'new@demo.vn', password: 'new12345' });
  assert.equal(ok.status, 201);
  assert.deepEqual(await ok.json(), { email: 'new@demo.vn', role: 'viewer' });
  assert.equal((await post('/register', { email: 'new@demo.vn', password: 'x' })).status, 409);
  assert.equal((await post('/register', { email: 'only@demo.vn' })).status, 400);
  assert.equal((await login('new@demo.vn', 'new12345')).res.status, 200);
});

test('OPTIONS preflight is 204 with CORS headers', async () => {
  const res = await fetch(`${base}/me`, {
    method: 'OPTIONS',
    headers: { Origin: 'http://localhost:8080', 'Access-Control-Request-Method': 'GET' },
  });
  assert.equal(res.status, 204);
  assert.equal(res.headers.get('access-control-allow-origin'), 'http://localhost:8080');
  assert.equal(res.headers.get('access-control-allow-credentials'), 'true');
  assert.equal(res.headers.get('access-control-allow-headers'), 'Authorization, Content-Type');
  assert.equal(res.headers.get('access-control-allow-methods'), 'GET, POST, OPTIONS');
  assert.equal(res.headers.get('access-control-expose-headers'), 'X-Auth-Reason');
});

test('CORS falls back to * without an Origin header', async () => {
  const res = await fetch(`${base}/__health`);
  assert.equal(res.headers.get('access-control-allow-origin'), '*');
});

test('POST /logout deletes the session and clears the cookie', async () => {
  const { cookie } = await login('viewer@demo.vn', 'viewer123');
  const out = await fetch(`${base}/logout`, { method: 'POST', headers: { Cookie: cookie } });
  assert.equal(out.status, 204);
  assert.match(out.headers.get('set-cookie') ?? '', /^sid=; .*Max-Age=0/);
  const res = await fetch(`${base}/me`, { headers: { Cookie: cookie } });
  assert.equal(res.status, 401);
  assert.equal(res.headers.get('x-auth-reason'), 'unknown session');
});
