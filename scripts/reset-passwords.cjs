require('dotenv').config();
const postgres = require('postgres');
const sql = postgres(process.env.DATABASE_URL);

async function run() {
    try {
        await sql.unsafe("UPDATE users SET password = 'password' WHERE username IN ('admin', 'saasadmin')");
        console.log('Success: All passwords reset to "password"');
        process.exit(0);
    } catch (e) {
        console.error('Error:', e);
        process.exit(1);
    }
}
run();
