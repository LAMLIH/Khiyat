import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL, must be set");
}

// NOTE: Sevalla internal K8s connection (svc.cluster.local) does NOT support SSL.
// Sevalla external proxy also works without SSL. postgres.js does not support 'prefer'.
export const queryClient = postgres(process.env.DATABASE_URL, {
    ssl: false,
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
    prepare: false, // Essential for proxies like PgBouncer/Sevalla
});
export const db = drizzle(queryClient, { schema });
