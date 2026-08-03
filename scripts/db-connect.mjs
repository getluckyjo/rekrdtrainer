/**
 * Builds and verifies DATABASE_URL from a Supabase project ref + password.
 *
 *   npm run db:connect
 *
 * You supply SUPABASE_DB_PASSWORD (and optionally SUPABASE_PROJECT_REF /
 * SUPABASE_REGION) in .env.local. This works out the rest:
 *
 *   - percent-encodes the password, so @ # / ? in it stop being a problem
 *   - tries each shared-pooler host Supabase uses, since new and old projects
 *     sit behind different ones and the dashboard is the only place that says
 *     which
 *   - connects for real before writing anything
 *   - writes the working DATABASE_URL back into .env.local
 *
 * Never prints the password.
 */

import io from "node:fs";
import postgres from "postgres";

const REF = process.env.SUPABASE_PROJECT_REF || "nexbfbvemvdmldyqxsbn";
const REGION = process.env.SUPABASE_REGION || "eu-west-1";
const PASSWORD = process.env.SUPABASE_DB_PASSWORD;

const ok = (s) => `\x1b[32m✓\x1b[0m ${s}`;
const bad = (s) => `\x1b[31m✗\x1b[0m ${s}`;

if (!PASSWORD) {
  console.error(bad("SUPABASE_DB_PASSWORD is not set in .env.local"));
  console.error("");
  console.error("  Add this line, with your database password:");
  console.error("    SUPABASE_DB_PASSWORD=your-password-here");
  console.error("");
  console.error("  Forgot it? Supabase → Project Settings → Database →");
  console.error("  Reset database password. Nothing is using it yet.");
  process.exit(1);
}

if (/^\[.*\]$/.test(PASSWORD) || PASSWORD.includes("YOUR-PASSWORD")) {
  console.error(bad("That's still the placeholder, not a real password."));
  process.exit(1);
}

/* Supabase puts newer projects behind aws-1 and older ones behind aws-0, and
   nothing outside the dashboard reveals which. Trying is cheaper than asking. */
const CANDIDATES = [
  `aws-1-${REGION}.pooler.supabase.com`,
  `aws-0-${REGION}.pooler.supabase.com`,
];

const encoded = encodeURIComponent(PASSWORD);
if (encoded !== PASSWORD) {
  console.log(ok("Password contains characters that need encoding — handled"));
}

console.log(`\nProject   ${REF}`);
console.log(`Region    ${REGION}`);
console.log(`Trying    the shared transaction pooler on 6543\n`);

let working = null;

for (const host of CANDIDATES) {
  const url = `postgresql://postgres.${REF}:${encoded}@${host}:6543/postgres`;
  process.stdout.write(`  ${host.padEnd(40)} `);

  const sql = postgres(url, {
    prepare: false,
    max: 1,
    idle_timeout: 3,
    connect_timeout: 10,
// eslint-disable-next-line
    onnotice: () => {},
  });

  try {
    await sql`select 1`;
    console.log("\x1b[32mconnected\x1b[0m");
    working = url;
    await sql.end();
    break;
  } catch (e) {
    const msg = String(e.message || e);
    console.log(
      `\x1b[31m${msg.includes("password") || msg.includes("authentication") ? "wrong password" : "no"}\x1b[0m`,
    );
    await sql.end().catch(() => {});
    /* A rejected password means the host was right and the secret wasn't —
       no point trying the other host. */
    if (msg.includes("password") || msg.includes("authentication")) {
      console.log("");
      console.log(bad("The host answered but rejected the password."));
      console.log("  Supabase → Project Settings → Database → Reset database password,");
      console.log("  then put the new one in SUPABASE_DB_PASSWORD.");
      process.exit(1);
    }
  }
}

if (!working) {
  console.log(`\n${bad("Could not reach any pooler host.")}`);
  console.log("  Check the project is finished provisioning, and that");
  console.log("  SUPABASE_PROJECT_REF and SUPABASE_REGION are right.");
  process.exit(1);
}

/* Write it back, replacing any existing line. */
const path = ".env.local";
let text = io.readFileSync(path, "utf8");
const line = `DATABASE_URL=${working}`;

text = /^DATABASE_URL=.*$/m.test(text)
  ? text.replace(/^DATABASE_URL=.*$/m, line)
  : `${text.trimEnd()}\n\n${line}\n`;

io.writeFileSync(path, text);

const host = new URL(working.replace("postgresql://", "https://")).hostname;
console.log(`\n${ok(`Wrote DATABASE_URL to .env.local — ${host}`)}`);
console.log(`\n  Next:  npm run db:push && npm run db:check\n`);
