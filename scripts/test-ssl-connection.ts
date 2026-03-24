import postgres from 'postgres';

const url = process.env.DATABASE_URL!;

async function testConnection(label: string, options: any) {
    const sql = postgres(url, { ...options, connect_timeout: 10 });
    try {
        const result = await sql`SELECT current_database() as db, current_user as user`;
        console.log(`✅ [${label}] Connected! DB: ${result[0].db}, User: ${result[0].user}`);
        return true;
    } catch (e: any) {
        console.log(`❌ [${label}] Failed: ${e.message}`);
        return false;
    } finally {
        try { await sql.end(); } catch {}
    }
}

async function main() {
    console.log('Testing DB connection options to Sevalla proxy...\n');
    
    // Test 1: No SSL (what worked locally)
    await testConnection('No SSL', { ssl: false, prepare: false });
    
    // Test 2: SSL with rejectUnauthorized false
    await testConnection('SSL rejectUnauthorized:false', { ssl: { rejectUnauthorized: false }, prepare: false });
    
    // Test 3: SSL 'prefer' mode
    await testConnection("SSL 'prefer'", { ssl: 'prefer', prepare: false });
    
    // Test 4: SSL 'require'
    await testConnection("SSL 'require'", { ssl: 'require', prepare: false });
    
    // Test 5: No SSL, no prepare flag
    await testConnection('No SSL, no prepare:false', { ssl: false });
    
    console.log('\nDone!');
}

main();
