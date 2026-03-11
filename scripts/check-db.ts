import postgres from 'postgres';
import 'dotenv/config';

async function check() {
    const url = process.env.DATABASE_URL || "postgresql://postgres:123456@localhost:5432/khiyatma";
    const sql = postgres(url);
    try {
        const cols = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'tenants'`;
        console.log('Tenants Columns:', cols.map(c => c.column_name).join(', '));
    } catch (e) {
        console.error('Check failed:', e);
    } finally {
        await sql.end();
    }
}

check();
