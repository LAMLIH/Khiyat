import { postgres } from "../server/db";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is not set");
    process.exit(1);
  }

  console.log("Connecting to database to add full_name column...");
  const sql = postgres(url);

  try {
    // Add full_name column to users table if it doesn't exist
    await sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS full_name text NOT NULL DEFAULT 'Admin'
    `;
    console.log("Column 'full_name' added successfully (or already existed).");
  } catch (error) {
    console.error("Error adding column:", error);
  } finally {
    await sql.end();
  }
}

main();
