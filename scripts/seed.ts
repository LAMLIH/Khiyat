import "dotenv/config";
import { storage } from "../server/storage";
import { insertTenantSchema, insertUserSchema } from "../shared/schema";

async function seed() {
    try {
        console.log("Seeding database...");

        // Create a default tenant
        const tenant = await storage.createTenant({
            name: "Khiyatma Default",
            subdomain: "default",
            settings: { theme: "light", language: "fr" },
        });
        console.log("Created tenant:", tenant.name);

        // Create a default user
        const user = await storage.createUser({
            tenantId: tenant.id,
            username: "admin",
            password: "password123", // In a real app, hash this
            fullName: "Administrateur",
            role: "admin",
        });
        console.log("Created user:", user.username);

        console.log("Seeding complete!");
        process.exit(0);
    } catch (error) {
        console.error("Seeding failed:", error);
        process.exit(1);
    }
}

seed();
