import { describe, expect, it } from "vitest";
import {
  COMM_ONE_OFF_C,
  COMM_STARTER_C,
  COMM_SUB_C,
  PRICE_ONE_OFF_C,
  PRICE_STARTER_C,
  PRICE_SUB_FIRST_C,
  PRICE_SUB_RENEWAL_C,
  calculate,
  commissionForOrder,
  compareSubscription,
  formatCount,
  formatZar,
  formatZarWhole,
} from "./calc";

/**
 * These figures are the contract between the approved plan and the build.
 * If one of them changes, the programme terms changed — go update the plan,
 * the coach T&Cs and the page copy, not this file.
 */

describe("per-order economics", () => {
  it("prices what the client pays", () => {
    expect(PRICE_ONE_OFF_C).toBe(57_000); // R570.00
    expect(PRICE_SUB_FIRST_C).toBe(51_300); // R513.00
    expect(PRICE_SUB_RENEWAL_C).toBe(54_000); // R540.00
    expect(PRICE_STARTER_C).toBe(9_500); // R95.00
  });

  it("pays the coach 15% of the price before the client's 5%", () => {
    expect(COMM_ONE_OFF_C).toBe(9_000); // R90.00
    expect(COMM_SUB_C).toBe(8_100); // R81.00
    expect(COMM_STARTER_C).toBe(1_500); // R15.00
  });

  it("never lets the coach's own discount come out of their cut", () => {
    // 15% of R570 would be R85.50. We pay R90.00.
    expect(COMM_ONE_OFF_C).toBeGreaterThan(
      Math.round(PRICE_ONE_OFF_C * 0.15),
    );
  });
});

describe("calculate — the five plan fixtures", () => {
  const cases = [
    {
      name: "pessimism chip",
      inputs: { clients: 40, conversion: 0.1, tubesPerMonth: 1, subShare: 0.4 },
      monthly: 34_560, // R345.60
      annual: 414_720, // R4,147.20
    },
    {
      name: "small book",
      inputs: { clients: 20, conversion: 0.3, tubesPerMonth: 1, subShare: 0.4 },
      monthly: 51_840, // R518.40
      annual: 622_080, // R6,220.80
    },
    {
      name: "full book (default)",
      inputs: { clients: 40, conversion: 0.3, tubesPerMonth: 1, subShare: 0.4 },
      monthly: 103_680, // R1,036.80
      annual: 1_244_160, // R12,441.60
    },
    {
      name: "studio or team",
      inputs: {
        clients: 100,
        conversion: 0.3,
        tubesPerMonth: 1,
        subShare: 0.4,
      },
      monthly: 259_200, // R2,592.00
      annual: 3_110_400, // R31,104.00
    },
    {
      name: "coach who works it",
      inputs: {
        clients: 100,
        conversion: 0.4,
        tubesPerMonth: 1.25,
        subShare: 0.6,
      },
      monthly: 423_000, // R4,230.00
      annual: 5_076_000, // R50,760.00
    },
  ];

  for (const c of cases) {
    it(c.name, () => {
      const r = calculate(c.inputs);
      expect(r.monthlyC).toBe(c.monthly);
      expect(r.annualC).toBe(c.annual);
    });
  }

  it("breaks the default down the way the ledger displays it", () => {
    const r = calculate({
      clients: 40,
      conversion: 0.3,
      tubesPerMonth: 1,
      subShare: 0.4,
    });
    expect(r.buyers).toBeCloseTo(12);
    expect(r.tubesOneOff).toBeCloseTo(7.2);
    expect(r.tubesSub).toBeCloseTo(4.8);
    expect(r.clientSpendC).toBe(669_600); // R6,696.00
    expect(r.perClientC).toBe(2_592); // R25.92
    expect(r.perBuyerC).toBe(8_640); // R86.40
  });

  it("survives the zero case without dividing by zero", () => {
    const r = calculate({
      clients: 0,
      conversion: 0.3,
      tubesPerMonth: 1,
      subShare: 0.4,
    });
    expect(r.monthlyC).toBe(0);
    expect(r.perClientC).toBe(0);
    expect(r.perBuyerC).toBe(0);
  });
});

describe("compareSubscription", () => {
  it("pays less per order and 2.3x more per year", () => {
    const c = compareSubscription(5, 4);
    expect(c.oneOffAnnualC).toBe(45_000); // R450.00 — 5 x R90
    expect(c.subAnnualC).toBe(105_300); // R1,053.00 — 13 x R81
    expect(c.multiple).toBeCloseTo(2.34, 2);
    // The honest bit: per order, a subscription is worth less to the coach.
    expect(COMM_SUB_C).toBeLessThan(COMM_ONE_OFF_C);
  });

  it("handles every Subscribe & Save interval", () => {
    expect(compareSubscription(5, 2).subAnnualC).toBe(210_600); // 26 x R81
    expect(compareSubscription(5, 8).subAnnualC).toBe(52_650); // 6.5 x R81
  });
});

describe("commissionForOrder — real Shopify orders", () => {
  it("reconstructs the pre-discount value when the code was used", () => {
    // Client paid R570 with the code. Commission is 15% of R600.
    expect(commissionForOrder({ subtotalC: 57_000, codeApplied: true })).toBe(
      9_000,
    );
  });

  it("takes the subtotal as-is on a carry-over order with no code", () => {
    // Subscription renewal at R540, no code on the order.
    expect(commissionForOrder({ subtotalC: 54_000, codeApplied: false })).toBe(
      8_100,
    );
  });

  it("pays nothing on a fully refunded order", () => {
    expect(commissionForOrder({ subtotalC: 0, codeApplied: true })).toBe(0);
    expect(commissionForOrder({ subtotalC: -5_000, codeApplied: true })).toBe(0);
  });

  it("scales down with a partial refund", () => {
    // Two tubes ordered (R1,140), one returned.
    expect(commissionForOrder({ subtotalC: 57_000, codeApplied: true })).toBe(
      9_000,
    );
  });

  it("honours a per-trainer commission rate override", () => {
    expect(
      commissionForOrder({
        subtotalC: 57_000,
        codeApplied: true,
        commissionRate: 0.1,
      }),
    ).toBe(6_000);
  });
});

describe("formatting", () => {
  it("writes rands the way the store does", () => {
    expect(formatZar(103_680)).toBe("R1,036.80");
    expect(formatZar(9_000)).toBe("R90.00");
    expect(formatZar(5_076_000)).toBe("R50,760.00");
    expect(formatZar(0)).toBe("R0.00");
    expect(formatZar(-9_000)).toBe("-R90.00");
    expect(formatZarWhole(103_680)).toBe("R1,037");
  });

  it("keeps fractional buyer counts honest", () => {
    expect(formatCount(12)).toBe("12");
    expect(formatCount(7.2)).toBe("7.2");
  });
});
