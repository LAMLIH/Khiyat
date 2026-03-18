import postgres from "postgres";
import * as dotenv from "dotenv";

dotenv.config();

if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL must be set");
    process.exit(1);
}

const sql = postgres(process.env.DATABASE_URL, {
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

async function migrate() {
    try {
        console.log("Checking for 'notes' column in 'orders' table...");
        const columns = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'orders' AND column_name = 'notes'
    `;

        if (columns.length === 0) {
            console.log("Adding 'notes' column to 'orders' table...");
            await sql`ALTER TABLE orders ADD COLUMN notes TEXT`;
            console.log("Column 'notes' added successfully.");
        } else {
            console.log("Column 'notes' already exists.");
        }
    } catch (error) {
        console.error("Migration failed:", error);
    } finally {
        await sql.end();
    }
}

migrate();
