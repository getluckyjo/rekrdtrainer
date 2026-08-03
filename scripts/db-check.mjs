/**
 * Database connection checker.
 *
 *   npm run db:check
 *
 * Verifies the connection string, confirms every table the app needs exists,
 * reports row counts, and sanity-checks the column defaults that encode the
 * programme terms. Never prints the password.
 */

import postgres from "postgres";

const URL = process.env.DATABASE_URL;

const ok = (s) => `\x1b[32m✓\x1b[0m ${s}`;
const bad = (s) => `\x1b[31m✗\x1b[0m ${s}`;
const warn = (s) => `\x1b[33m!\x1b[0m ${s}`;

if (!URL) {
  console.error(bad("DATABASE_URL is not set in .env.local"));
  process.exit(1);
}

/* Show the shape without the password, so output is safe to paste. */
let shown;
try {
  const u = new global.URL(URL);
  shown = `${u.protocol}//${u.username}:••••@${u.hostname}:${u.port || "5432"}${u.pathname}`;
} catch {
  console.error(bad("DATABASE_URL is not a valid URL."));
  console.error("  Expected: postgresql://user:password@host:6543/postgres");
  process.exit(1);
}

console.log(`\nDatabase  ${shown}`);

const port = new global.URL(URL).port;
if (port === "5432") {
  console.log(
    warn("Port 5432 is the direct connection. Serverless needs the transaction pooler on 6543."),
  );
} else if (port === "6543") {
  console.log(ok("Using the transaction pooler (6543) — correct for serverless"));
}
console.log("");

const EXPECTED = [
  "trainers",
  "referred_customers",
  "referred_orders",
  "payouts",
  "commission_adjustments",
  "link_clicks",
  "sync_state",
];

const sql = postgres(URL, { prepare: false, max: 1, idle_timeout: 5 });
let failed = false;

try {
  const [v] = await sql`select version() as v`;
  console.log(ok(`Connected — ${v.v.split(" ").slice(0, 2).join(" ")}`));
} catch (e) {
  console.log(bad(`Could not connect: ${e.message}`));
  console.log("");
  console.log("  Check, in order:");
  console.log("   1. The password is filled in (Supabase shows [YOUR-PASSWORD] as a placeholder)");
  console.log("   2. Special characters in the password are percent-encoded (@ becomes %40)");
  console.log("   3. You copied the Transaction pooler string, not Direct connection");
  await sql.end();
  process.exit(1);
}

try {
  const rows = await sql`
    select table_name from information_schema.tables
    where table_schema = 'public'
  `;
  const have = rows.map((r) => r.table_name);
  const missing = EXPECTED.filter((t) => !have.includes(t));

  if (missing.length === 0) {
    console.log(ok(`All ${EXPECTED.length} tables present`));
  } else {
    failed = true;
    console.log(bad(`Missing tables: ${missing.join(", ")}`));
    console.log("   Run the schema:  npm run db:push");
    console.log("   or paste drizzle/0000_init.sql into the Supabase SQL Editor.");
  }
} catch (e) {
  failed = true;
  console.log(bad(`Could not list tables: ${e.message}`));
}

if (!failed) {
  for (const t of EXPECTED) {
    try {
      const [c] = await sql`select count(*)::int as n from ${sql(t)}`;
      console.log(`   ${t.padEnd(24)} ${c.n} rows`);
    } catch {
      console.log(`   ${t.padEnd(24)} (unreadable)`);
    }
  }

  /* The column defaults encode the programme terms, so a mismatch here means
     the database and lib/calc.ts disagree about what a coach gets paid. */
  try {
    const rows = await sql`
      select column_name, column_default
      from information_schema.columns
      where table_name = 'trainers'
        and column_name in ('commission_rate', 'customer_discount_rate')
    `;
    console.log("");
    for (const r of rows) {
      const val = (r.column_default ?? "").replace(/[^0-9.]/g, "");
      const want = r.column_name === "commission_rate" ? "0.1500" : "0.1000";
      const good = val === want;
      if (!good) failed = true;
      console.log(
        good
          ? ok(`${r.column_name} defaults to ${val}`)
          : bad(`${r.column_name} defaults to ${val}, expected ${want} — run: npm run db:push`),
      );
    }
  } catch {
    /* non-fatal */
  }
}

await sql.end();

console.log(
  failed
    ? `\n${bad("Some checks failed — see above.")}\n`
    : `\n${ok("Database is ready.")}\n`,
);
process.exit(failed ? 1 : 0);
