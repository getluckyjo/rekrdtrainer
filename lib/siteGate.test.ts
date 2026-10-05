import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  HOME,
  checkSitePassword,
  hasSitePass,
  isOpenPath,
  safeNext,
} from "./siteGate";

describe("isOpenPath", () => {
  it("keeps the client-facing vanity link open", () => {
    expect(isOpenPath("/t/SIPHO")).toBe(true);
  });

  it("keeps the machine endpoints open — they have their own secrets", () => {
    expect(isOpenPath("/api/cron/sync-orders")).toBe(true);
    expect(isOpenPath("/api/cron/sync-orders-deep")).toBe(true);
    expect(isOpenPath("/api/export/ambassadors")).toBe(true);
    expect(isOpenPath("/api/export/coaches")).toBe(true);
    expect(isOpenPath("/api/admin/resend-welcome")).toBe(true);
    expect(isOpenPath("/unlock")).toBe(true);
  });

  it("gates everything an ambassador reads", () => {
    for (const p of [
      "/",
      "/ambassadors",
      "/ambassadors/terms",
      "/ambassadors/welcome/SIPHO",
      "/dashboard",
      "/dashboard/enter",
      "/api/trainers",
      "/api/trainers/code-check",
    ]) {
      expect(isOpenPath(p), p).toBe(false);
    }
  });

  it("matches whole segments, not prefixes of words", () => {
    expect(isOpenPath("/tools")).toBe(false);
    expect(isOpenPath("/unlocked")).toBe(false);
    expect(isOpenPath("/api/cronjob")).toBe(false);
  });
});

describe("safeNext", () => {
  it("passes same-origin paths through, query and all", () => {
    expect(safeNext("/ambassadors/terms")).toBe("/ambassadors/terms");
    expect(safeNext("/dashboard/enter?token=abc.def")).toBe(
      "/dashboard/enter?token=abc.def",
    );
  });

  it("refuses anything that would leave the site", () => {
    for (const raw of [
      "https://evil.example",
      "//evil.example",
      "/\\evil.example",
      "/\t/evil.example",
      "/\n/evil.example",
      "evil.example",
      "",
    ]) {
      expect(safeNext(raw), JSON.stringify(raw)).toBe(HOME);
    }
  });

  it("won't send someone back to the gate", () => {
    expect(safeNext("/unlock")).toBe(HOME);
    expect(safeNext("/unlock?next=/unlock")).toBe(HOME);
  });

  it("falls back to home for a missing or repeated param", () => {
    expect(safeNext(undefined)).toBe(HOME);
    expect(safeNext(["/a", "/b"])).toBe(HOME);
  });
});

describe("the password", () => {
  const before = process.env.SITE_PASSWORD;
  beforeEach(() => {
    process.env.SITE_PASSWORD = "Hydration";
  });
  afterEach(() => {
    if (before === undefined) delete process.env.SITE_PASSWORD;
    else process.env.SITE_PASSWORD = before;
  });

  it("mints a cookie that then passes, and isn't the password itself", async () => {
    const pass = await checkSitePassword("Hydration");
    expect(pass).toMatch(/^[0-9a-f]{64}$/);
    expect(pass).not.toContain("Hydration");
    expect(await hasSitePass(pass!)).toBe(true);
  });

  it("forgives surrounding whitespace but not case", async () => {
    expect(await checkSitePassword(" Hydration ")).not.toBeNull();
    expect(await checkSitePassword("hydration")).toBeNull();
    expect(await checkSitePassword("Hydrations")).toBeNull();
    expect(await checkSitePassword("")).toBeNull();
  });

  it("rejects a missing or forged cookie", async () => {
    expect(await hasSitePass(undefined)).toBe(false);
    expect(await hasSitePass("")).toBe(false);
    expect(await hasSitePass("Hydration")).toBe(false);
    expect(await hasSitePass("0".repeat(64))).toBe(false);
  });

  it("signs everyone out when the password changes", async () => {
    const pass = await checkSitePassword("Hydration");
    process.env.SITE_PASSWORD = "Electrolyte";
    expect(await hasSitePass(pass!)).toBe(false);
  });

  it("stays locked, not open, when SITE_PASSWORD is unset", async () => {
    const pass = await checkSitePassword("Hydration");
    delete process.env.SITE_PASSWORD;
    expect(await checkSitePassword("")).toBeNull();
    expect(await checkSitePassword("Hydration")).toBeNull();
    expect(await hasSitePass(pass!)).toBe(false);
  });
});
