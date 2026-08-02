CREATE TABLE "commission_adjustments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trainer_id" uuid NOT NULL,
	"shopify_order_id" bigint NOT NULL,
	"amount_c" integer NOT NULL,
	"reason" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"payout_id" uuid
);
--> statement-breakpoint
CREATE TABLE "link_clicks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trainer_id" uuid NOT NULL,
	"clicked_at" timestamp with time zone DEFAULT now() NOT NULL,
	"referer" text,
	"country" char(2)
);
--> statement-breakpoint
CREATE TABLE "payouts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trainer_id" uuid NOT NULL,
	"period_start" date NOT NULL,
	"period_end" date NOT NULL,
	"amount_c" integer NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"paid_at" timestamp with time zone,
	"reference" text,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "referred_customers" (
	"shopify_customer_id" bigint PRIMARY KEY NOT NULL,
	"trainer_id" uuid NOT NULL,
	"first_order_id" bigint NOT NULL,
	"first_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "referred_orders" (
	"shopify_order_id" bigint PRIMARY KEY NOT NULL,
	"shopify_order_gid" text NOT NULL,
	"order_name" text NOT NULL,
	"trainer_id" uuid NOT NULL,
	"attribution" text NOT NULL,
	"discount_code" text,
	"processed_at" timestamp with time zone NOT NULL,
	"currency" char(3) DEFAULT 'ZAR' NOT NULL,
	"subtotal_c" integer NOT NULL,
	"commissionable_c" integer NOT NULL,
	"commission_rate" numeric(5, 4) NOT NULL,
	"commission_c" integer NOT NULL,
	"order_status" text NOT NULL,
	"is_recurring" boolean DEFAULT false NOT NULL,
	"payable_from" date NOT NULL,
	"payout_id" uuid,
	"last_synced_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sync_state" (
	"key" text PRIMARY KEY NOT NULL,
	"value" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trainers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"full_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"city" text,
	"gym" text,
	"instagram" text,
	"disciplines" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"client_band" text,
	"status" text DEFAULT 'provisioning' NOT NULL,
	"discount_code" text NOT NULL,
	"shopify_discount_gid" text,
	"commission_rate" numeric(5, 4) DEFAULT '0.1500' NOT NULL,
	"customer_discount_rate" numeric(5, 4) DEFAULT '0.0500' NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"payout_details_on_file" boolean DEFAULT false NOT NULL,
	"marketing_opt_in" boolean DEFAULT false NOT NULL,
	"accepted_terms_at" timestamp with time zone,
	"claims_check_passed_at" timestamp with time zone,
	"claims_check_version" text,
	"flags" jsonb DEFAULT '{}'::jsonb NOT NULL
);
--> statement-breakpoint
ALTER TABLE "commission_adjustments" ADD CONSTRAINT "commission_adjustments_trainer_id_trainers_id_fk" FOREIGN KEY ("trainer_id") REFERENCES "public"."trainers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commission_adjustments" ADD CONSTRAINT "commission_adjustments_payout_id_payouts_id_fk" FOREIGN KEY ("payout_id") REFERENCES "public"."payouts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "link_clicks" ADD CONSTRAINT "link_clicks_trainer_id_trainers_id_fk" FOREIGN KEY ("trainer_id") REFERENCES "public"."trainers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_trainer_id_trainers_id_fk" FOREIGN KEY ("trainer_id") REFERENCES "public"."trainers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referred_customers" ADD CONSTRAINT "referred_customers_trainer_id_trainers_id_fk" FOREIGN KEY ("trainer_id") REFERENCES "public"."trainers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referred_orders" ADD CONSTRAINT "referred_orders_trainer_id_trainers_id_fk" FOREIGN KEY ("trainer_id") REFERENCES "public"."trainers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "referred_orders_trainer_idx" ON "referred_orders" USING btree ("trainer_id","processed_at");--> statement-breakpoint
CREATE INDEX "referred_orders_unpaid_idx" ON "referred_orders" USING btree ("payout_id");--> statement-breakpoint
CREATE UNIQUE INDEX "trainers_code_unique" ON "trainers" USING btree ("discount_code");--> statement-breakpoint
CREATE UNIQUE INDEX "trainers_email_unique" ON "trainers" USING btree ("email");