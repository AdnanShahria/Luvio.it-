#!/usr/bin/env node
/**
 * ╔══════════════════════════════════════════════════════╗
 * ║          LUVIO PLATFORM — DEV STARTUP BANNER         ║
 * ║   Animated terminal insights for the dev workflow    ║
 * ╚══════════════════════════════════════════════════════╝
 *
 * Run via: npm run dev:full
 * Shows project overview, stack info, and URLs before servers boot.
 */

// ─── ANSI colour helpers ─────────────────────────────────────────────────────
const c = {
  reset:   '\x1b[0m',
  bold:    '\x1b[1m',
  dim:     '\x1b[2m',
  italic:  '\x1b[3m',

  // Foreground
  black:   '\x1b[30m',
  red:     '\x1b[31m',
  green:   '\x1b[32m',
  yellow:  '\x1b[33m',
  blue:    '\x1b[34m',
  magenta: '\x1b[35m',
  cyan:    '\x1b[36m',
  white:   '\x1b[37m',
  gray:    '\x1b[90m',

  // Bright foreground
  bRed:     '\x1b[91m',
  bGreen:   '\x1b[92m',
  bYellow:  '\x1b[93m',
  bBlue:    '\x1b[94m',
  bMagenta: '\x1b[95m',
  bCyan:    '\x1b[96m',
  bWhite:   '\x1b[97m',

  // Background
  bgBlack:   '\x1b[40m',
  bgBlue:    '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan:    '\x1b[46m',
};

const W = process.stdout.columns || 90;
const line  = (ch = '─') => c.gray + ch.repeat(W) + c.reset;
const blank = ()          => console.log('');

// ─── Utilities ───────────────────────────────────────────────────────────────
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

function center(text, width = W) {
  const stripped = text.replace(/\x1b\[[0-9;]*m/g, '');
  const pad = Math.max(0, Math.floor((width - stripped.length) / 2));
  return ' '.repeat(pad) + text;
}

function pad(label, value, labelW = 28) {
  const strippedLabel = label.replace(/\x1b\[[0-9;]*m/g, '');
  const padding = Math.max(0, labelW - strippedLabel.length);
  return `  ${label}${' '.repeat(padding)}${value}`;
}

function progressBar(pct, width = 20) {
  const filled = Math.round(width * pct / 100);
  const empty  = width - filled;
  return `${c.bGreen}${'█'.repeat(filled)}${c.gray}${'░'.repeat(empty)}${c.reset} ${c.bWhite}${pct}%${c.reset}`;
}

function statusDot(ok) {
  return ok ? `${c.bGreen}●${c.reset}` : `${c.yellow}◌${c.reset}`;
}

// ─── Typewriter ──────────────────────────────────────────────────────────────
async function typewrite(text, delay = 18) {
  const raw = text.replace(/\x1b\[[0-9;]*m/g, '');
  for (let i = 0; i < raw.length; i++) {
    process.stdout.write(text[i] || raw[i]);
    if (delay > 0) await sleep(delay);
  }
  process.stdout.write('\n');
}

// ─── Spinner ─────────────────────────────────────────────────────────────────
async function spinner(label, ms = 700) {
  const frames = ['⠋','⠙','⠹','⠸','⠼','⠴','⠦','⠧','⠇','⠏'];
  const end = Date.now() + ms;
  let i = 0;
  while (Date.now() < end) {
    process.stdout.write(`\r  ${c.bMagenta}${frames[i++ % frames.length]}${c.reset}  ${c.dim}${label}${c.reset}`);
    await sleep(60);
  }
  process.stdout.write(`\r  ${c.bGreen}✔${c.reset}  ${label}${' '.repeat(10)}\n`);
}

// ─── ASCII Logo ───────────────────────────────────────────────────────────────
function printLogo() {
  const logo = [
    `${c.bMagenta}██╗     ${c.bCyan}██╗   ██╗${c.bMagenta}██╗   ██╗${c.bCyan}██╗${c.bMagenta}  ██████╗ ${c.reset}`,
    `${c.bMagenta}██║     ${c.bCyan}██║   ██║${c.bMagenta}██║   ██║${c.bCyan}██║${c.bMagenta} ██╔═══██╗${c.reset}`,
    `${c.bMagenta}██║     ${c.bCyan}██║   ██║${c.bMagenta}██║   ██║${c.bCyan}██║${c.bMagenta} ██║   ██║${c.reset}`,
    `${c.bMagenta}██║     ${c.bCyan}██║   ██║${c.bMagenta}╚██╗ ██╔╝${c.bCyan}██║${c.bMagenta} ██║   ██║${c.reset}`,
    `${c.bMagenta}███████╗${c.bCyan}╚██████╔╝${c.bMagenta} ╚████╔╝ ${c.bCyan}██║${c.bMagenta} ╚██████╔╝${c.reset}`,
    `${c.gray}╚══════╝ ╚═════╝   ╚═══╝  ╚═╝  ╚═════╝ ${c.reset}`,
  ];
  blank();
  for (const row of logo) console.log(center(row, W + 40));
  console.log(center(`${c.gray}Neighborhood Marketplace & Community Platform${c.reset}`));
  console.log(center(`${c.dim}v1.0.0  ·  Edge-Native  ·  Multi-Platform${c.reset}`));
  blank();
}

// ─── Sections ─────────────────────────────────────────────────────────────────

function printStack() {
  console.log(line());
  console.log(center(`${c.bold}${c.bWhite}⚡  TECH STACK${c.reset}`));
  console.log(line());
  blank();

  const rows = [
    ['Frontend',     `${c.bCyan}Next.js 15${c.reset}        React 19 · TypeScript · SSR`],
    ['Backend',      `${c.bYellow}Cloudflare Workers${c.reset} Hono · Edge-native · Zero cold-start`],
    ['Database',     `${c.bGreen}Cloudflare D1${c.reset}     SQLite edge · Drizzle ORM + Turso backup`],
    ['Storage',      `${c.bMagenta}Cloudflare R2${c.reset}     Object storage · Media uploads`],
    ['Real-time',    `${c.bBlue}Durable Objects${c.reset}   Persistent WebSockets · Chat rooms`],
    ['Auth',         `${c.bCyan}JWT + OTP${c.reset}         Phone/Email · Google · Apple Sign-In`],
    ['Payments',     `${c.bGreen}Stripe + Escrow${c.reset}   Multi-currency · Mobile money · Wallet`],
    ['Mobile',       `${c.bMagenta}Flutter${c.reset}           Native iOS & Android`],
    ['Deploy',       `${c.bYellow}Cloudflare Pages${c.reset}  Global CDN · Edge routing`],
  ];

  for (const [label, val] of rows) {
    console.log(pad(
      `  ${c.gray}▸${c.reset} ${c.bWhite}${label}${c.reset}`,
      val, 22
    ));
  }
  blank();
}

function printFeatures() {
  console.log(line());
  console.log(center(`${c.bold}${c.bWhite}🗂  FEATURE MODULES${c.reset}`));
  console.log(line());
  blank();

  const features = [
    { name: 'Auth & Accounts',           pct: 85,  status: true,  note: 'OTP · Social · Multi-role' },
    { name: 'Jobs & Services',           pct: 75,  status: true,  note: 'Posting · Bidding · Lifecycle' },
    { name: 'Community Marketplace',     pct: 70,  status: true,  note: '9 categories · Multi-image' },
    { name: 'Real-time Chat',            pct: 80,  status: true,  note: 'WebSocket · Context-aware' },
    { name: 'Maps & Location',           pct: 60,  status: true,  note: 'Geo-fence · Distance filters' },
    { name: 'Payments & Wallet',         pct: 65,  status: true,  note: 'Escrow · Multi-currency' },
    { name: 'Notifications & i18n',      pct: 50,  status: true,  note: '13 languages · Push alerts' },
    { name: 'Premium & Advertising',     pct: 45,  status: false, note: 'Badges · Featured listings' },
    { name: 'Admin Dashboard',           pct: 40,  status: false, note: 'Moderation · Finance overview' },
  ];

  for (const f of features) {
    const dot  = statusDot(f.status);
    const bar  = progressBar(f.pct, 18);
    const name = `${c.bWhite}${f.name.padEnd(30)}${c.reset}`;
    const note = `${c.dim}${f.note}${c.reset}`;
    console.log(`  ${dot}  ${name}${bar}  ${note}`);
  }
  blank();
}

function printRoutes() {
  console.log(line());
  console.log(center(`${c.bold}${c.bWhite}🌐  ENDPOINTS${c.reset}`));
  console.log(line());
  blank();

  const routes = [
    [`${c.bGreen}Frontend${c.reset}`, `http://localhost:${c.bCyan}2222${c.reset}`],
    [`${c.bYellow}Backend API${c.reset}`, `http://localhost:${c.bCyan}2223${c.reset}`],
    [`${c.bMagenta}Admin Panel${c.reset}`, `http://localhost:${c.bCyan}2222${c.reset}/admin`],
    [`${c.bBlue}DB Studio${c.reset}`, `${c.dim}npm run db:studio${c.reset}`],
  ];

  for (const [label, url] of routes) {
    console.log(pad(`  ${c.gray}▸${c.reset} ${label}`, url, 22));
  }
  blank();
}

function printCodeInsights() {
  console.log(line());
  console.log(center(`${c.bold}${c.bWhite}📊  CODEBASE INSIGHTS${c.reset}`));
  console.log(line());
  blank();

  const insights = [
    ['Platform',        `${c.bCyan}Luvio v1.0.0${c.reset}`],
    ['Architecture',    `${c.bGreen}Monorepo${c.reset}  (workspaces: shared · backend · frontend)`],
    ['App Routes',      `${c.bYellow}14 routes${c.reset}  auth · jobs · market · maps · chat · admin …`],
    ['API Surface',     `${c.bMagenta}REST + WS${c.reset} Hono router · D1 bindings · R2 media`],
    ['DB Schema',       `${c.bCyan}Drizzle ORM${c.reset} Users · Jobs · Listings · Chats · Wallet`],
    ['i18n',            `${c.bGreen}13 languages${c.reset} incl. Arabic RTL · Hindi · Bangla`],
    ['Countries',       `${c.bYellow}210+${c.reset}  International OTP · Multi-currency support`],
    ['Security',        `${c.bMagenta}JWT · HTTPS · Rate-limit · Escrow · OTP${c.reset}`],
    ['Target platforms',`${c.bCyan}Web · iOS · Android${c.reset}  (Next.js + Flutter)`],
  ];

  for (const [label, val] of insights) {
    console.log(pad(
      `  ${c.gray}▸${c.reset} ${c.dim}${label.padEnd(18)}${c.reset}`,
      val, 28
    ));
  }
  blank();
}

function printFooter() {
  console.log(line('═'));
  const now = new Date().toLocaleString('en-GB', {
    weekday: 'short', year: 'numeric', month: 'short',
    day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
  console.log(center(`${c.dim}Started at ${now}${c.reset}`));
  console.log(center(`${c.gray}Press  ${c.bold}Ctrl+C${c.reset}${c.gray}  to stop all servers${c.reset}`));
  console.log(line('═'));
  blank();
}

// ─── Boot sequence ────────────────────────────────────────────────────────────
async function boot() {
  console.clear();

  // Logo
  printLogo();
  await sleep(200);

  // Animated init steps
  console.log(line());
  console.log(center(`${c.bold}${c.bWhite}🚀  BOOTING DEV ENVIRONMENT${c.reset}`));
  console.log(line());
  blank();

  const steps = [
    'Validating environment variables …',
    'Loading shared workspace (types & schemas) …',
    'Connecting to Cloudflare D1 (local) …',
    'Initialising Drizzle ORM …',
    'Starting Hono edge worker (port 2223) …',
    'Warming up Next.js 15 compiler (port 2222) …',
    'Registering WebSocket Durable Objects …',
    'Mounting R2 storage bindings …',
    'Dev environment ready!',
  ];

  for (const step of steps) {
    await spinner(step, Math.floor(300 + Math.random() * 500));
  }

  blank();

  // Sections
  printCodeInsights();
  await sleep(80);
  printStack();
  await sleep(80);
  printFeatures();
  await sleep(80);
  printRoutes();
  await sleep(80);

  // Typewriter tip
  await typewrite(
    `  ${c.bMagenta}❯${c.reset}  ${c.bWhite}Tip:${c.reset} ${c.dim}Run ${c.reset}${c.bCyan}npm run db:studio${c.reset}${c.dim} in a separate tab to browse the database.${c.reset}`,
    10
  );
  await typewrite(
    `  ${c.bMagenta}❯${c.reset}  ${c.bWhite}Tip:${c.reset} ${c.dim}Run ${c.reset}${c.bCyan}npm run validate:env${c.reset}${c.dim} to check all secrets before deploying.${c.reset}`,
    10
  );

  blank();
  printFooter();
}

boot().catch(console.error);
