import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL, must be set");
}

// Minimal config — let postgres.js auto-negotiate SSL and connection settings.
// Sevalla K8s internal connection doesn't need explicit SSL config.
export const queryClient = postgres(process.env.DATABASE_URL, {
    max: 10,
    connect_timeout: 30,
    prepare: false, // Essential for proxies like PgBouncer/Sevalla
});
export const db = drizzle(queryClient, { schema });

/**
 * Auto-migration: creates all required tables if they don't exist.
 * This runs at server startup to ensure the DB schema is ready,
 * especially for fresh Sevalla deployments where drizzle-kit push
 * cannot be run manually.
 */
export async function runMigrations() {
    console.log("Running auto-migrations...");
    try {
        await queryClient`
            CREATE TABLE IF NOT EXISTS "tenants" (
                "id" serial PRIMARY KEY NOT NULL,
                "name" text NOT NULL,
                "subdomain" text NOT NULL,
                "is_active" boolean DEFAULT true NOT NULL,
                "plan" text DEFAULT 'Starter' NOT NULL,
                "subscription_expires_at" timestamp,
                "settings" jsonb DEFAULT '{}'::jsonb,
                "created_at" timestamp DEFAULT now(),
                CONSTRAINT "tenants_subdomain_unique" UNIQUE("subdomain")
            )
        `;
        await queryClient`
            CREATE TABLE IF NOT EXISTS "users" (
                "id" serial PRIMARY KEY NOT NULL,
                "tenant_id" integer REFERENCES "tenants"("id"),
                "username" text NOT NULL,
                "password" text NOT NULL,
                "full_name" text NOT NULL,
                "role" text DEFAULT 'staff' NOT NULL,
                CONSTRAINT "users_username_unique" UNIQUE("username")
            )
        `;
        await queryClient`
            CREATE TABLE IF NOT EXISTS "clients" (
                "id" serial PRIMARY KEY NOT NULL,
                "tenant_id" integer REFERENCES "tenants"("id"),
                "name" text NOT NULL,
                "phone" text,
                "address" text,
                "created_at" timestamp DEFAULT now()
            )
        `;
        await queryClient`
            CREATE TABLE IF NOT EXISTS "measurements" (
                "id" serial PRIMARY KEY NOT NULL,
                "client_id" integer REFERENCES "clients"("id"),
                "tenant_id" integer REFERENCES "tenants"("id"),
                "garment_type" text NOT NULL,
                "data" jsonb NOT NULL,
                "is_last" boolean DEFAULT true,
                "created_at" timestamp DEFAULT now()
            )
        `;
        await queryClient`
            CREATE TABLE IF NOT EXISTS "orders" (
                "id" serial PRIMARY KEY NOT NULL,
                "tenant_id" integer REFERENCES "tenants"("id"),
                "client_id" integer REFERENCES "clients"("id"),
                "garment_type" text NOT NULL,
                "status" text DEFAULT 'Nouvelle' NOT NULL,
                "current_step" text DEFAULT 'Fsalla' NOT NULL,
                "total_price" numeric(10, 2) DEFAULT '0' NOT NULL,
                "total_cost" numeric(10, 2) DEFAULT '0' NOT NULL,
                "profit" numeric(10, 2) DEFAULT '0' NOT NULL,
                "advance_payment" numeric(10, 2) DEFAULT '0',
                "due_date" timestamp,
                "production_steps" jsonb DEFAULT '[]'::jsonb,
                "expenses" jsonb DEFAULT '[]'::jsonb,
                "advances" jsonb DEFAULT '[]'::jsonb,
                "measurements" jsonb DEFAULT '{}'::jsonb,
                "notes" text,
                "created_at" timestamp DEFAULT now()
            )
        `;
        await queryClient`
            CREATE TABLE IF NOT EXISTS "subscription_requests" (
                "id" serial PRIMARY KEY NOT NULL,
                "full_name" text NOT NULL,
                "city" text NOT NULL,
                "phone" text NOT NULL,
                "plan" text NOT NULL,
                "status" text DEFAULT 'pending' NOT NULL,
                "created_at" timestamp DEFAULT now()
            )
        `;
        
        // Ensure measurements column exists in orders (Migrate existing DB)
        await queryClient`ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "measurements" jsonb DEFAULT '{}'::jsonb`;

        // Seed saasadmin if not exists
        const [existing] = await queryClient`SELECT id FROM users WHERE username = 'saasadmin'`;
        if (!existing) {
            let [tenant] = await queryClient`SELECT id FROM tenants LIMIT 1`;
            if (!tenant) {
                [tenant] = await queryClient`INSERT INTO tenants (name, subdomain, is_active, plan) VALUES ('System Admin', 'admin', true, 'Enterprise') RETURNING id`;
            }
            await queryClient`INSERT INTO users (username, password, full_name, role, tenant_id) VALUES ('saasadmin', 'saaspassword', 'Global Administrator', 'saas_admin', ${tenant.id})`;
            console.log("Created saasadmin user.");
        }

        console.log("Auto-migrations complete.");
    } catch (err) {
        console.error("Auto-migration error (non-fatal):", err);
    }
}
