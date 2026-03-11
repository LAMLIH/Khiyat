import postgres from 'postgres';
import 'dotenv/config';

// Use local DB for this setup
const url = process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/khiyatma";

async function setup() {
    const sql = postgres(url);
    try {
        console.log("Creating SaaS Admin user 'saasadmin'...");

        // Ensure we have at least one tenant (even if empty for saas admin)
        let [tenant] = await sql`SELECT id FROM tenants LIMIT 1`;
        if (!tenant) {
            [tenant] = await sql`INSERT INTO tenants (name, subdomain, is_active, plan) VALUES ('System Admin', 'admin', true, 'Enterprise') RETURNING id`;
        }

        const [existing] = await sql`SELECT id FROM users WHERE username = 'saasadmin'`;
        if (existing) {
            await sql`UPDATE users SET role = 'saas_admin' WHERE id = ${existing.id}`;
            console.log("Updated existing user to saas_admin role.");
        } else {
            await sql`INSERT INTO users (username, password, full_name, role, tenant_id) 
                      VALUES ('saasadmin', 'saaspassword', 'Global Administrator', 'saas_admin', ${tenant.id})`;
            console.log("Created new saasadmin user (password: saaspassword)");
        }

        console.log("Setup complete! You can now login at http://localhost:5173/");
    } catch (e) {
        console.error("Setup failed:", e);
    } finally {
        await sql.end();
    }
}

setup();
