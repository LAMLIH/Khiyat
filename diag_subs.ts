import postgres from 'postgres';
import 'dotenv/config';

const url = process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/khiyatma";
const sql = postgres(url);

async function run() {
    try {
        const requests = await sql`SELECT * FROM subscription_requests`;
        console.log("Count:", requests.length);
        console.log("Data:", JSON.stringify(requests, null, 2));
        process.exit(0);
    } catch (e) {
        console.error("Error:", e);
        process.exit(1);
    }
}

run();
