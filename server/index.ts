import "dotenv/config"; // Refreshed configuration
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { saasAdminRouter } from "./saas-admin";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { runMigrations } from "./db";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Global error handlers to prevent process crashes
process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception:", err);
});

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Health check VERY early to rule out middleware/tenant issues
app.get("/api/health", async (_req, res) => {
    let dbStatus = "unknown";
    try {
        await storage.dbPing();
        dbStatus = "connected";
    } catch (err: any) {
        dbStatus = `error: ${err.message}`;
    }

    // Mask password in URL for debug
    const dbUrl = (process.env.DATABASE_URL || "").replace(/:\/\/([^:]+):([^@]+)@/, "://$1:***@");

    res.json({
        status: "ok",
        database: dbStatus,
        dbUrl,
        mode: process.env.NODE_ENV,
        port: process.env.PORT,
        cwd: process.cwd(),
        dir: __dirname
    });
});

// Multi-tenant middleware
app.use(async (req, res, next) => {
    try {
        const host = req.get("host") || "";
        const hostname = host.split(":")[0]; // Strip port
        const parts = hostname.split(".");
        let subdomain = "";

        // Logic for subdomain detection (matching client-side in main.tsx):
        // 1. Platform (sevalla.app): tenant.app-name.sevalla.app (length 4)
        // 2. Custom Domain: sub.domain.com (length 3)
        // 3. Localhost: sub.localhost (length 2)
        
        if (hostname.endsWith("sevalla.app")) {
            if (parts.length > 3) subdomain = parts[0];
        } else if (parts.length > 2) {
            subdomain = parts[0];
        } else if (parts.length === 2 && parts[1] === "localhost") {
            subdomain = parts[0];
        }

        // Skip tenant lookup for system subdomains
        const systemSubdomains = ["www", "localhost", "127", "admin"];

        if (subdomain && !systemSubdomains.includes(subdomain.toLowerCase())) {
            const tenant = await storage.getTenantBySubdomain(subdomain);
            if (tenant) {
                (req as any).tenant = tenant;
            }
        }
    } catch (error) {
        console.error("Tenant middleware error:", error);
    }
    next();
});

// Request logging
app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    res.on("finish", () => {
        const duration = Date.now() - start;
        if (path.startsWith("/api")) {
            console.log(`${req.method} ${path} ${res.statusCode} in ${duration}ms`);
        }
    });
    next();
});

(async () => {
    // Run auto-migrations to ensure tables exist
    await runMigrations();

    setupAuth(app);

    // SaaS Admin routes
    app.use("/api/saas-admin", saasAdminRouter);

    const server = registerRoutes(app);

    // Serve static files in production
    if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
        const publicPath = path.resolve(__dirname, "public");
        console.log(`Production mode: serving static files from ${publicPath}`);

        app.use(express.static(publicPath));

        // Health check route moved to top

        // Serve index.html for any other routes (client-side routing)
        app.get("*", (req, res) => {
            if (!req.path.startsWith("/api") && !req.path.startsWith("/auth")) {
                const indexPath = path.resolve(publicPath, "index.html");
                res.sendFile(indexPath, (err) => {
                    if (err) {
                        console.error(`Error sending index.html from ${indexPath}:`, err);
                        res.status(404).send("Front-end build not found. Please check deployment logs.");
                    }
                });
            } else {
                res.status(404).json({ message: "API Route Not Found" });
            }
        });
    }

    // Error handling — never expose SQL details to client in production
    app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
        const status = err.status || err.statusCode || 500;
        // Log full error server-side for debugging
        console.error(`Error ${status} at ${req.method} ${req.path}:`, err);
        // In production, hide raw DB error messages from client
        const isProduction = process.env.NODE_ENV === "production";
        const message = isProduction && status === 500
            ? "Internal Server Error"
            : (err.message || "Internal Server Error");
        res.status(status).json({ message });
    });

    const PORT = process.env.PORT || 5000;
    server.listen(Number(PORT), "0.0.0.0", () => {
        console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    });
})();
