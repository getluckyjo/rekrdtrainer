/**
 * Compatibility path. The roster export now lives at /api/export/ambassadors,
 * but a live Google Sheet pulls this URL with IMPORTDATA(), which does not
 * reliably follow redirects — a redirect here would surface as #N/A rather
 * than as an error anyone would notice.
 *
 * So this delegates to the real handler instead. Both paths serve identical
 * bytes, and the sheet's formula can be updated whenever, or never.
 *
 * `runtime` and `dynamic` are declared literally rather than re-exported:
 * Next parses route segment config statically at build time and rejects a
 * re-export.
 */
import { GET as ambassadorsGET } from "../ambassadors/route";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = ambassadorsGET;
