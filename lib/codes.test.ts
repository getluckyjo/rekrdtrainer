import { describe, expect, it } from "vitest";
import {
  nextCandidates,
  normaliseCode,
  randomCode,
  shopifyDiscountLink,
  suggestFromName,
  validateCode,
} from "./codes";

describe("normaliseCode", () => {
  it("uppercases and strips everything that isn't A-Z0-9", () => {
    expect(normaliseCode("thandi m.")).toBe("THANDIM");
    expect(normaliseCode("  jo-anne  ")).toBe("JOANNE");
    expect(normaliseCode("van der Merwe")).toBe("VANDERMERWE");
    expect(normaliseCode("Christopher Nkosi")).toBe("CHRISTOPHERN"); // 12 max
  });
});

describe("validateCode", () => {
  it("accepts a normal code", () => {
    expect(validateCode("THANDI")).toBeNull();
    expect(validateCode("PT42")).toBeNull();
  });

  it("rejects codes that could impersonate the brand", () => {
    expect(validateCode("REKRD")).toBe("reserved");
    expect(validateCode("REKRD5")).toBe("reserved");
    expect(validateCode("MYREKRD")).toBe("reserved");
  });

  it("rejects guessable promo words", () => {
    expect(validateCode("SAVE")).toBe("reserved");
    expect(validateCode("welcome")).toBe("reserved");
    expect(validateCode("free")).toBe("reserved");
  });

  it("rejects profanity", () => {
    expect(validateCode("KAKCOACH")).toBe("profanity");
  });

  it("rejects lengths and all-numeric codes", () => {
    expect(validateCode("")).toBe("empty");
    expect(validateCode("AB")).toBe("too-short");
    expect(validateCode("12345")).toBe("invalid-chars");
  });
});

describe("suggestFromName", () => {
  it("offers surname variants before anything numeric", () => {
    expect(suggestFromName("Thandi Mokoena")).toEqual([
      "THANDI",
      "THANDIM",
      "THANDIMO",
      "THANDIMOKOEN",
    ]);
  });

  it("handles a single name", () => {
    expect(suggestFromName("Sipho")).toEqual(["SIPHO"]);
  });

  it("drops suggestions that fail validation", () => {
    // "Free" normalises to a reserved word and must not be offered.
    expect(suggestFromName("Free")).toEqual([]);
  });

  it("survives an empty name", () => {
    expect(suggestFromName("   ")).toEqual([]);
  });
});

describe("nextCandidates", () => {
  it("exhausts name variants before numbers", () => {
    const c = nextCandidates("THANDI", "Thandi Mokoena", 0);
    expect(c[0]).toBe("THANDIM");
    expect(c).toContain("THANDI2");
    expect(c.indexOf("THANDIM")).toBeLessThan(c.indexOf("THANDI2"));
  });

  it("falls back to a random code once candidates run out", () => {
    const c = nextCandidates("THANDI", "Thandi Mokoena", 99);
    expect(c).toHaveLength(1);
    expect(c[0]).toMatch(/^RK[0-9A-Z]{6}$/);
  });
});

describe("randomCode", () => {
  it("avoids I, L, O and U so it can be read aloud", () => {
    for (let i = 0; i < 50; i++) {
      expect(randomCode().slice(2)).not.toMatch(/[ILOU]/);
    }
  });

  it("passes its own validation", () => {
    for (let i = 0; i < 50; i++) {
      expect(validateCode(randomCode())).toBeNull();
    }
  });
});

describe("shopifyDiscountLink", () => {
  it("builds the share link Shopify honours", () => {
    expect(shopifyDiscountLink("THANDI")).toBe(
      "https://shop.rekrd.io/discount/THANDI",
    );
    expect(shopifyDiscountLink("THANDI", "/products/x")).toBe(
      "https://shop.rekrd.io/discount/THANDI?redirect=%2Fproducts%2Fx",
    );
  });
});
