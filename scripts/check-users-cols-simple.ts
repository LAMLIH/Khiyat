import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

async function check() {
    const client = postgres(process.env.DATABASE_URL!);
    const db = drizzle(client);
    const res = await db.execute("SELECT column_name FROM information_schema.columns WHERE table_name = 'users'");
    console.log(res.map(r => r.column_name));
    process.exit(0);
}

check();
