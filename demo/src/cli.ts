// Demo control for "The Forger".
//   pnpm start | pnpm stop | pnpm status
//   pnpm users                      what the database stores (hashes, not passwords)
//   pnpm login viewer@demo.vn [pw]  get a JWT and show what is inside it
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, openSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const RUN = join(ROOT, '.run'); // pid file + log (git-ignored)
const PID_FILE = join(RUN, 'server.pid');
const PORT = Number(process.env.PORT ?? 4000);
const URL_BASE = `http://localhost:${PORT}`;

function isRunning(pid: number): boolean {
  try { process.kill(pid, 0); return true; } catch { return false; }
}

function readPid(): number | null {
  if (!existsSync(PID_FILE)) return null;
  const pid = Number(readFileSync(PID_FILE, 'utf8').trim());
  return pid && isRunning(pid) ? pid : null;
}

const healthy = (): Promise<boolean> => fetch(`${URL_BASE}/__health`).then((r) => r.ok, () => false);

async function start(): Promise<void> {
  if (readPid()) { console.log(`Already running on ${URL_BASE}`); return; }
  mkdirSync(RUN, { recursive: true });
  const log = openSync(join(RUN, 'server.log'), 'a');
  const child = spawn(process.execPath, ['--experimental-strip-types', '--disable-warning=ExperimentalWarning', join(ROOT, 'src', 'server.ts')], {
    detached: true,
    stdio: ['ignore', log, log],
    env: { ...process.env, PORT: String(PORT) },
  });
  child.unref();
  writeFileSync(PID_FILE, String(child.pid));
  // bcrypt-hashing the seed users takes a moment; wait until the server answers.
  for (let i = 0; i < 50; i++) {
    if (await healthy()) { console.log(`Auth demo running on ${URL_BASE} (pid ${child.pid})`); return; }
    await new Promise((r) => setTimeout(r, 100));
  }
  console.log(`Server did not answer within 5 s; check ${join(RUN, 'server.log')}`);
}

function stop(): void {
  const pid = readPid();
  if (pid) { process.kill(pid, 'SIGTERM'); console.log('Server stopped'); }
  else console.log('Server was not running');
  rmSync(PID_FILE, { force: true });
}

async function users(): Promise<void> {
  const rows: { email: string; role: string; passwordHash: string }[] = await fetch(`${URL_BASE}/__db`).then((r) => r.json());
  console.table(rows.map((u) => ({ email: u.email, role: u.role, hash: u.passwordHash })));
}

async function login(email: string | undefined, password: string | undefined): Promise<void> {
  if (!email) { console.error('Usage: pnpm login <email> [password]'); process.exit(1); }
  const res = await fetch(`${URL_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: password ?? `${email.split('@')[0]}123` }), // demo default
  });
  const body = await res.json();
  if (!res.ok) { console.error(`${res.status} ${body.error}`); process.exit(1); }
  const [header, payload] = body.token.split('.');
  const decode = (part: string): unknown => JSON.parse(Buffer.from(part, 'base64url').toString());
  console.log(`token:\n${body.token}\n`);
  console.log('header: ', decode(header));
  console.log('payload:', decode(payload)); // anyone can read it: a JWT is signed, not encrypted
}

// pnpm passes the `--` separator through (npm strips it), so drop it here
const [command, ...args] = process.argv.slice(2).filter((a) => a !== '--');

const needServer = async (): Promise<void> => {
  if (await healthy()) return;
  console.error(`Server is not running on ${URL_BASE}. Start it with: pnpm start`);
  process.exit(1);
};

switch (command) {
  case 'start':
    await start();
    break;
  case 'stop':
    stop();
    break;
  case 'status':
    console.log((await healthy()) ? `up · ${URL_BASE}` : `down · port ${PORT}`);
    break;
  case 'users':
    await needServer();
    await users();
    break;
  case 'login':
    await needServer();
    await login(args[0], args[1]);
    break;
  default:
    console.log('Usage: pnpm start | pnpm stop | pnpm status | pnpm users | pnpm login <email> [password]');
}
