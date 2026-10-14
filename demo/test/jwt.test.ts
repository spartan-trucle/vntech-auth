import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sign, verify } from '../src/jwt.ts';

const b64 = (obj: object): string => Buffer.from(JSON.stringify(obj)).toString('base64url');
const now = (): number => Math.floor(Date.now() / 1000);

test('sign then verify returns the payload', () => {
  const result = verify(sign({ sub: 'viewer@demo.vn', role: 'viewer' }));
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.payload.sub, 'viewer@demo.vn');
  assert.equal(result.payload.role, 'viewer');
  assert.equal(result.payload.exp - result.payload.iat, 15 * 60);
});

test('changing the payload (viewer -> admin) but keeping the signature fails', () => {
  const [header, payload, signature] = sign({ sub: 'viewer@demo.vn', role: 'viewer' }).split('.');
  const forged = { ...JSON.parse(Buffer.from(payload, 'base64url').toString()), role: 'admin' };
  assert.deepEqual(verify(`${header}.${b64(forged)}.${signature}`), { ok: false, reason: 'bad signature' });
});

test('alg "none" with an empty signature is rejected', () => {
  const payload = b64({ sub: 'viewer@demo.vn', role: 'admin', iat: now(), exp: now() + 900 });
  const token = `${b64({ alg: 'none', typ: 'JWT' })}.${payload}.`;
  assert.deepEqual(verify(token), { ok: false, reason: 'alg not allowed' });
});

test('alg "HS512" is rejected even though it is a real HMAC', () => {
  const [, payload, signature] = sign({ sub: 'admin@demo.vn', role: 'admin' }).split('.');
  const token = `${b64({ alg: 'HS512', typ: 'JWT' })}.${payload}.${signature}`;
  assert.deepEqual(verify(token), { ok: false, reason: 'alg not allowed' });
});

test('an expired token is rejected', () => {
  const token = sign({ sub: 'viewer@demo.vn', role: 'viewer' }, now() - 3600); // issued an hour ago
  assert.deepEqual(verify(token), { ok: false, reason: 'expired' });
});

test('garbage and 2-part strings are malformed', () => {
  assert.deepEqual(verify('not-a-jwt'), { ok: false, reason: 'malformed' });
  assert.deepEqual(verify('abc.def'), { ok: false, reason: 'malformed' });
  assert.deepEqual(verify('!!!.@@@.###'), { ok: false, reason: 'malformed' });
  assert.deepEqual(verify(''), { ok: false, reason: 'malformed' });
});
