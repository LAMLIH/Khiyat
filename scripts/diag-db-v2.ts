import postgres from 'postgres';
import 'dotenv/config';

const url = process.env.DATABASE_URL || "postgres://imad:nitdm2026@europe-west1-001.proxy.sevalla.app:30956/khiyatApp";

console.log("Testing connection to:", url.replace(/:[^:@]+@/, ":****@"));

async function diag() {
    const sql = postgres(url, {
        connect_timeout: 10,
    });

    try {
        console.log("Attempting simple query...");
        const result = await sql`SELECT 1 as connected`;
        console.log("Connection result:", result);

        console.log("Checking for tenants table...");
        const tables = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`;
        console.log("Tables found:", tables.map(t => t.table_name));

        const count = await sql`SELECT count(*) FROM tenants`;
        console.log("Tenants count:", count[0].count);

    } catch (err) {
        console.error("DIAGNOSTIC FAILED");
        console.error("Error Name:", err.name);
        console.error("Error Message:", err.message);
        if (err.code) console.error("Error Code:", err.code);
        if (err.detail) console.error("Error Detail:", err.detail);
        if (err.hint) console.error("Error Hint:", err.hint);
        console.error("Full Error:", err);
    } finally {
        await sql.end();
    }
}

diag();
