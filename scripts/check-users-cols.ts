import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function check() {
    const res = await db.execute(sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'users'`);
    console.log(res.rows.map(r => r.column_name));
    process.exit(0);
}

check();
