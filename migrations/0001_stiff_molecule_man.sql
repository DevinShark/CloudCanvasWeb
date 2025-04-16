ALTER TABLE "users" ADD COLUMN "email_newsletter" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "email_product_updates" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "email_promotions" boolean DEFAULT false NOT NULL;