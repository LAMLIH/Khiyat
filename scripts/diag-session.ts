import "dotenv/config";
import postgres from "postgres";

async function diag() {
    if (!process.env.DATABASE_URL) {
        console.error("DATABASE_URL not set");
        process.exit(1);
    }
    const sql = postgres(process.env.DATABASE_URL);
    try {
        console.log("Listing ALL tables in public schema:");
        const tables = await sql`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `;
        console.log("Tables:", tables.map(t => t.table_name).join(", "));

        console.log("\nChecking for 'session' table specifically...");
        const sessionTable = await sql`
            SELECT count(*) 
            FROM information_schema.tables 
            WHERE table_name = 'session'
        `;
        console.log("Session table exists?", Number(sessionTable[0].count) > 0);

        if (Number(sessionTable[0].count) > 0) {
            const sessions = await sql`SELECT count(*) FROM session`;
            console.log("Sessions count:", sessions[0].count);
        }

    } catch (err: any) {
        console.error("Diagnostic failed:", err.message);
    } finally {
        await sql.end();
    }
}

diag();
