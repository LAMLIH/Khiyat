import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL, must be set");
}

// NOTE: Sevalla proxy (europe-west1-001.proxy.sevalla.app) does NOT support
// ssl: { rejectUnauthorized: false } — it causes ECONNRESET.
// Using ssl: 'prefer' works for both local and Sevalla production.
export const queryClient = postgres(process.env.DATABASE_URL, {
    ssl: process.env.NODE_ENV === "production" ? "prefer" : false,
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
    prepare: false, // Essential for proxies like PgBouncer/Sevalla
});
export const db = drizzle(queryClient, { schema });
