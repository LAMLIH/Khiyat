import "dotenv/config"; // Refreshed configuration
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Multi-tenant middleware
app.use(async (req, res, next) => {
    const host = req.get("host") || "";
    const subdomain = host.split(".")[0];

    if (subdomain && subdomain !== "www" && subdomain !== "localhost" && !subdomain.includes("127.0.0.1")) {
        const tenant = await storage.getTenantBySubdomain(subdomain);
        if (tenant) {
            (req as any).tenant = tenant;
        }
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
    const server = registerRoutes(app);

    // Serve static files in production
    if (process.env.NODE_ENV === "production") {
        const publicPath = path.resolve(__dirname, "public");
        app.use(express.static(publicPath));

        // Serve index.html for any other routes (client-side routing)
        app.get("*", (req, res) => {
            if (!req.path.startsWith("/api") && !req.path.startsWith("/auth")) {
                res.sendFile(path.resolve(publicPath, "index.html"));
            } else {
                res.status(404).json({ message: "Not Found" });
            }
        });
    }

    // Error handling
    app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
        const status = err.status || err.statusCode || 500;
        const message = err.message || "Internal Server Error";
        console.error(`Error ${status} at ${req.method} ${req.path}:`, err);
        res.status(status).json({ message });
    });

    const PORT = 5000;
    server.listen(PORT, "0.0.0.0", () => {
        console.log(`Server running on port ${PORT}`);
    });
})();
