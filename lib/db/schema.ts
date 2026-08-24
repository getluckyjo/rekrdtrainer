import {
  bigint,
  boolean,
  char,
  date,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

/**
 * All money is integer cents. All rates are numeric. Nothing here is a float.
 *
 * POPIA note, and it is load-bearing: `referredOrders` deliberately stores the
 * order NAME only. No customer name, no email, no address. A coach dashboard
 * that lists their clients' identities is a disclosure we have no lawful basis
 * for. `referredCustomers` holds the Shopify customer id for internal
 * attribution and is never exposed to a coach.
 */

export const trainers = pgTable(
  "trainers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),

    fullName: text("full_name").notNull(),
    email: text("email").notNull(),
    phone: text("phone"),
    city: text("city"),

    /* Ambassadors are sent a free tub every month, so the programme needs a
       postable address. Nullable: the six who signed up before the sponsorship
       tier existed have none, and are being asked separately. */
    addressLine1: text("address_line1"),
    addressLine2: text("address_line2"),
    suburb: text("suburb"),
    postalCode: text("postal_code"),

    gym: text("gym"),
    instagram: text("instagram"),
    disciplines: jsonb("disciplines").$type<string[]>().default([]).notNull(),
    clientBand: text("client_band"),

    // provisioning | active | suspended | closed
    status: text("status").default("provisioning").notNull(),

    discountCode: text("discount_code").notNull(),
    shopifyDiscountGid: text("shopify_discount_gid"),

    commissionRate: numeric("commission_rate", { precision: 5, scale: 4 })
      .default("0.1500")
      .notNull(),
    customerDiscountRate: numeric("customer_discount_rate", {
      precision: 5,
      scale: 4,
    })
      .default("0.1000")
      .notNull(),

    emailVerified: boolean("email_verified").default(false).notNull(),
    payoutDetailsOnFile: boolean("payout_details_on_file")
      .default(false)
      .notNull(),
    marketingOptIn: boolean("marketing_opt_in").default(false).notNull(),

    acceptedTermsAt: timestamp("accepted_terms_at", { withTimezone: true }),
    claimsCheckPassedAt: timestamp("claims_check_passed_at", {
      withTimezone: true,
    }),
    claimsCheckVersion: text("claims_check_version"),

    flags: jsonb("flags").$type<Record<string, unknown>>().default({}).notNull(),
  },
  (t) => [
    // Case-insensitive uniqueness is the real gate. The availability endpoint
    // is advisory only.
    uniqueIndex("trainers_code_unique").on(t.discountCode),
    uniqueIndex("trainers_email_unique").on(t.email),
  ],
);

export const referredCustomers = pgTable("referred_customers", {
  shopifyCustomerId: bigint("shopify_customer_id", { mode: "bigint" })
    .primaryKey(),
  trainerId: uuid("trainer_id")
    .references(() => trainers.id)
    .notNull(),
  firstOrderId: bigint("first_order_id", { mode: "bigint" }).notNull(),
  firstSeenAt: timestamp("first_seen_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  /** firstSeenAt + 12 months. After this, orders stop attributing. */
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});

export const referredOrders = pgTable(
  "referred_orders",
  {
    shopifyOrderId: bigint("shopify_order_id", { mode: "bigint" }).primaryKey(),
    shopifyOrderGid: text("shopify_order_gid").notNull(),
    /** "#1042" — safe to show a coach. Nothing else about the order is. */
    orderName: text("order_name").notNull(),

    trainerId: uuid("trainer_id")
      .references(() => trainers.id)
      .notNull(),
    /** discount_code | customer_carryover */
    attribution: text("attribution").notNull(),
    discountCode: text("discount_code"),

    processedAt: timestamp("processed_at", { withTimezone: true }).notNull(),
    currency: char("currency", { length: 3 }).default("ZAR").notNull(),

    /** currentSubtotalPriceSet in cents — after discounts and returns. */
    subtotalC: integer("subtotal_c").notNull(),
    /** Pre-discount value the commission is owed on, in cents. */
    commissionableC: integer("commissionable_c").notNull(),
    /** Snapshotted so a later rate change never rewrites history. */
    commissionRate: numeric("commission_rate", { precision: 5, scale: 4 })
      .notNull(),
    commissionC: integer("commission_c").notNull(),

    /** paid | partially_refunded | refunded | cancelled */
    orderStatus: text("order_status").notNull(),
    isRecurring: boolean("is_recurring").default(false).notNull(),

    /** processedAt + 30 days, matching the returns window. */
    payableFrom: date("payable_from").notNull(),
    payoutId: uuid("payout_id"),

    lastSyncedAt: timestamp("last_synced_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("referred_orders_trainer_idx").on(t.trainerId, t.processedAt),
    index("referred_orders_unpaid_idx").on(t.payoutId),
  ],
);

export const payouts = pgTable("payouts", {
  id: uuid("id").defaultRandom().primaryKey(),
  trainerId: uuid("trainer_id")
    .references(() => trainers.id)
    .notNull(),
  periodStart: date("period_start").notNull(),
  periodEnd: date("period_end").notNull(),
  amountC: integer("amount_c").notNull(),
  /** draft | approved | paid */
  status: text("status").default("draft").notNull(),
  paidAt: timestamp("paid_at", { withTimezone: true }),
  reference: text("reference"),
  notes: text("notes"),
});

/**
 * Clawbacks after a payout has settled. Settled history is never mutated —
 * a refund on a paid order writes a negative row here instead, which nets off
 * the next run. This is what makes "recompute everything nightly" safe.
 */
export const commissionAdjustments = pgTable("commission_adjustments", {
  id: uuid("id").defaultRandom().primaryKey(),
  trainerId: uuid("trainer_id")
    .references(() => trainers.id)
    .notNull(),
  shopifyOrderId: bigint("shopify_order_id", { mode: "bigint" }).notNull(),
  /** Negative for a clawback. */
  amountC: integer("amount_c").notNull(),
  reason: text("reason").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  payoutId: uuid("payout_id").references(() => payouts.id),
});

/** Vanity-redirect analytics. Never attribution. */
export const linkClicks = pgTable("link_clicks", {
  id: uuid("id").defaultRandom().primaryKey(),
  trainerId: uuid("trainer_id")
    .references(() => trainers.id)
    .notNull(),
  clickedAt: timestamp("clicked_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  referer: text("referer"),
  country: char("country", { length: 2 }),
});

export const syncState = pgTable("sync_state", {
  key: text("key").primaryKey(),
  value: jsonb("value").$type<Record<string, unknown>>().notNull(),
});

export type Trainer = typeof trainers.$inferSelect;
export type NewTrainer = typeof trainers.$inferInsert;
export type ReferredOrder = typeof referredOrders.$inferSelect;
