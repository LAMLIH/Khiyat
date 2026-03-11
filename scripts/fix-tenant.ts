import postgres from 'postgres';
import 'dotenv/config';

const url = process.env.DATABASE_URL || "postgres://imad:nitdm2026@europe-west1-001.proxy.sevalla.app:30956/khiyatApp";

async function fix() {
    const sql = postgres(url);
    try {
        console.log("Locating tenant 'khiyat-x1bor'...");
        const [tenant] = await sql`SELECT id FROM tenants WHERE subdomain = 'khiyat-x1bor'`;

        if (tenant) {
            console.log("Updating admin user to tenant ID:", tenant.id);
            await sql`UPDATE users SET tenant_id = ${tenant.id} WHERE username = 'admin'`;
            console.log("Success!");
        } else {
            console.log("Tenant 'khiyat-x1bor' not found. Creating it...");
            const [newTenant] = await sql`INSERT INTO tenants (name, subdomain, settings) VALUES ('Khiyatma Production', 'khiyat-x1bor', '{}') RETURNING id`;
            await sql`UPDATE users SET tenant_id = ${newTenant.id} WHERE username = 'admin'`;
            console.log("Created and linked to tenant ID:", newTenant.id);
        }
    } catch (e) {
        console.error("Fix failed:", e);
    } finally {
        await sql.end();
    }
}

fix();
