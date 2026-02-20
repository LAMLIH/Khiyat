import "dotenv/config";
import postgres from "postgres";

async function diag() {
    if (!process.env.DATABASE_URL) {
        console.error("DATABASE_URL not set");
        process.exit(1);
    }
    const sql = postgres(process.env.DATABASE_URL);
    try {
        console.log("Checking tables...");
        const tables = await sql`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `;
        console.log("Tables found:", tables.map(t => t.table_name).join(", "));

        console.log("Checking orders table...");
        const orders = await sql`SELECT count(*) FROM orders`;
        console.log("Orders count:", orders[0].count);

        console.log("Checking clients table...");
        const clients = await sql`SELECT count(*) FROM clients`;
        console.log("Clients count:", clients[0].count);

        console.log("Checking tenants table...");
        const tenants = await sql`SELECT count(*) FROM tenants`;
        console.log("Tenants count:", tenants[0].count);

    } catch (err: any) {
        console.error("Diagnostic failed:", err.message);
    } finally {
        await sql.end();
    }
}

diag();
