# Demo: The Forger

One small Node + TypeScript auth server on port 4000: bcrypt passwords, server-side sessions, a hand-written HS256 JWT and a permission table. Section 5 of the deck sends real requests to it, lets you edit a JWT payload on the slide, and shows why the server answers `401`.

Everything is in memory and reseeded on every start. Only `node:http`, `node:crypto` and `bcryptjs`.

## Setup

Requires Node 22.6+ (it runs the `.ts` files directly with `--experimental-strip-types`, no build step) and pnpm:

```bash
cd demo
pnpm install
```

## Scripts

| Script | What it does |
|---|---|
| `pnpm start` | start the server in the background (pid in `.run/server.pid`, log in `.run/server.log`) |
| `pnpm stop` | stop it |
| `pnpm status` | up or down, and the port |
| `pnpm users` | print the users table the way the "database" stores it: email, role, bcrypt hash |
| `pnpm jwt <email> [password]` | log in, print the JWT and its decoded header + payload. Default password is the part before `@` + `123` |
| `pnpm dev` | run the server in the foreground |
| `pnpm test` | unit tests (`node:test`) for the JWT and every route |
| `pnpm check` | type-check with `tsc` |


`PORT` and `JWT_SECRET` can be set in the environment. The default secret `dev-only-secret-change-me` is for the demo only.

## Seed users

| email | password | role | permissions |
|---|---|---|---|
| admin@demo.vn | admin123 | admin | `profile:read`, `posts:write`, `users:list` |
| editor@demo.vn | editor123 | editor | `profile:read`, `posts:write` |
| viewer@demo.vn | viewer123 | viewer | `profile:read` |

Hashed with bcrypt cost 10 so startup stays fast. Use 12 or more in production.

## During the talk

| Command | What the audience sees |
|---|---|
| `pnpm start` | server on `http://localhost:4000`; the slide's status dot turns green |
| `pnpm users` | `$2b$10$…` hashes, no passwords: this is what a database leak exposes |
| `pnpm jwt viewer@demo.vn` | the three parts of a JWT; the payload is readable by anyone (signed, not encrypted) |
| slide: `/me` with no token | `401`, reason `missing token` |
| slide: viewer calls `/admin/users` | `403`, `need: users:list` (we know who you are, you may not) |
| slide: change `role` to `admin`, keep the signature | `401`, reason `bad signature` |
| slide: header `alg: none`, empty signature | `401`, reason `alg not allowed` |
| `pnpm stop` | done |

## curl walkthrough

```bash
B=http://localhost:4000

# 1. log in: a JWT in the body AND a session cookie (HttpOnly) in Set-Cookie
curl -i -X POST $B/login -H 'Content-Type: application/json' \
  -d '{"email":"viewer@demo.vn","password":"viewer123"}'

TOKEN=$(curl -s -X POST $B/login -H 'Content-Type: application/json' \
  -d '{"email":"viewer@demo.vn","password":"viewer123"}' | node -pe 'JSON.parse(require("fs").readFileSync(0)).token')

# 2. who am I?  -> 200 {"email":"viewer@demo.vn","role":"viewer","via":"jwt"}
curl -s $B/me -H "Authorization: Bearer $TOKEN"

# 3. forge it: role viewer -> admin, keep the old signature
FORGED=$(node -e 'const [h,p,s]=process.argv[1].split(".");const d=JSON.parse(Buffer.from(p,"base64url"));d.role="admin";console.log([h,Buffer.from(JSON.stringify(d)).toString("base64url"),s].join("."))' "$TOKEN")

# 4. -> 401, X-Auth-Reason: bad signature
curl -i $B/me -H "Authorization: Bearer $FORGED"

# 5. the honest viewer token on an admin route -> 403 {"error":"Forbidden","need":"users:list"}
curl -i $B/admin/users -H "Authorization: Bearer $TOKEN"
```

Also try: wrong password and unknown email both return `401 {"error":"Email or password is wrong"}`, and `curl $B/__db` shows the stored hashes.

## Why forging fails

The signature is `HMAC-SHA256(secret, header + "." + payload)`. The server recomputes it from the payload it received; a changed payload gives a different HMAC, so the old signature no longer matches. Making a valid one needs the secret: **a leaked secret means everything is leaked**. Keep it in the environment, never in git.

## Endpoints

| Method | Path | Auth | Returns |
|---|---|---|---|
| GET | `/__health` | none | `200 {"ok":true}` |
| POST | `/register` | none | `201 {"email","role":"viewer"}`, `400` missing fields, `409` exists |
| POST | `/login` | none | `200 {"token","user"}` + `Set-Cookie: sid=…; HttpOnly; SameSite=Lax; Path=/`, or `401` |
| POST | `/logout` | cookie | `204`, session deleted, cookie cleared |
| GET | `/me` | Bearer JWT or `sid` cookie | `200 {"email","role","via"}` or `401` + `X-Auth-Reason` |
| GET | `/admin/users` | auth + `users:list` | `200 [{"email","role"}]`, `401`, or `403` |
| GET | `/__db` | none (demo only) | `200 [{"email","role","passwordHash"}]` |

CORS echoes the request `Origin` with credentials allowed, so the slide can call the server from another port and send the cookie.

## Layout

```
src/jwt.ts      sign / verify, HS256 only, timingSafeEqual
src/auth.ts     users (bcrypt), sessions, RBAC table + can(), authenticate(req)
src/server.ts   routes + CORS, requireAuth / requirePermission; createServer() for tests
src/cli.ts      start / stop / status / users / login
test/           node:test for jwt.ts and every route (server started on port 0)
.run/           pid file and log (git-ignored)
```
