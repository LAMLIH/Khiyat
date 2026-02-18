import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { createServer } from "http";

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
