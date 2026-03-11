import "dotenv/config";
import postgres from "postgres";

async function list() {
    if (!process.env.DATABASE_URL) {
        console.error("DATABASE_URL not set");
        process.exit(1);
    }
    const sql = postgres(process.env.DATABASE_URL);
    try {
        console.log("\n--- Liste des Clients existants ---\n");
        const tenants = await sql`SELECT id, name, subdomain FROM tenants`;
        console.log("Locataires (Tenants):");
        console.table(tenants);

        const clients = await sql`SELECT id, name, tenant_id FROM clients`;
        console.log("\nClients:");
        console.table(clients);

    } catch (err: any) {
        console.error("Failed to list clients:", err.message);
    } finally {
        await sql.end();
    }
}

list();
