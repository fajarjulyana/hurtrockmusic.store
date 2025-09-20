
-- Migration to add shipping_service column to orders table
ALTER TABLE "orders" ADD COLUMN "shipping_service" text;
