import { listDiscountCodes } from "../lib/shopify/discounts.ts";
const rows = await listDiscountCodes();
console.log("total code rows:", rows.length);
console.log("statuses:", [...new Set(rows.map(r => r.status))].join(", ") || "—");
console.log("kinds:", [...new Set(rows.map(r => r.kind))].join(", ") || "—");
console.log();
for (const r of rows.slice(0, 30)) {
  console.log(`  ${r.code.padEnd(14)} ${String(r.status).padEnd(10)} ${r.value.padEnd(12)} used=${r.timesUsed}  ${r.title}`);
}
