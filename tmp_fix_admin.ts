import postgres from 'postgres';
import 'dotenv/config';

const url = process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/khiyatma";
const sql = postgres(url);

async function run() {
    try {
        console.log("Forcing password for saasadmin to 'saaspassword'...");
        const result = await sql`UPDATE users SET password = 'saaspassword', role = 'saas_admin' WHERE username = 'saasadmin'`;
        console.log("Password updated successfully.");
        process.exit(0);
    } catch (e) {
        console.error("Failed to update password:", e);
        process.exit(1);
    }
}

run();
