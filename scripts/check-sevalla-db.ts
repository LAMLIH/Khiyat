import postgres from 'postgres';

const url = process.env.DATABASE_URL!;
const sql = postgres(url);

async function check() {
    try {
        const users = await sql`SELECT id, username, full_name, role, tenant_id FROM users WHERE username = 'saasadmin'`;
        console.log('SaaS Admin user:', JSON.stringify(users, null, 2));
        
        const tenants = await sql`SELECT id, name, subdomain FROM tenants`;
        console.log('All tenants:', JSON.stringify(tenants, null, 2));
        
        const allUsers = await sql`SELECT id, username, full_name, role, tenant_id FROM users`;
        console.log('All users:', JSON.stringify(allUsers, null, 2));
    } catch (e) {
        console.error('Error:', e);
    } finally {
        await sql.end();
    }
}

check();
