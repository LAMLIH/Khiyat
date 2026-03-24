import postgres from 'postgres';

const url = process.env.DATABASE_URL!;

console.log('URL:', url.replace(/:[^:@]+@/, ':***@')); // mask password
console.log('NODE_ENV:', process.env.NODE_ENV);

// Test every possible SSL config with full prepare:false (proxy mode)
const tests = [
    { label: 'ssl:false + prepare:false', opts: { ssl: false, prepare: false } },
    { label: 'ssl:prefer + prepare:false', opts: { ssl: 'prefer', prepare: false } },
    { label: 'ssl:false + no prepare', opts: { ssl: false } },
    { label: 'no ssl option + prepare:false', opts: { prepare: false } },
    { label: 'no options at all', opts: {} },
];

for (const test of tests) {
    const sql = postgres(url, { ...test.opts, connect_timeout: 8 } as any);
    try {
        const [r] = await sql`SELECT id FROM tenants LIMIT 1`;
        console.log(`✅ ${test.label} → OK, first tenant id: ${r?.id ?? 'none'}`);
    } catch (e: any) {
        console.log(`❌ ${test.label} → ${e.message?.split('\n')[0]}`);
    } finally {
        try { await sql.end({ timeout: 2 }); } catch {}
    }
}
