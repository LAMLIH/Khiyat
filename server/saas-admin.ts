import { Router } from "express";
import { storage } from "./storage";
import { insertTenantSchema, insertUserSchema } from "@shared/schema";

export const saasAdminRouter = Router();

// Middleware to ensure user is a SaaS admin
saasAdminRouter.use((req, res, next) => {
    if (!req.isAuthenticated() || req.user?.role !== "saas_admin") {
        return res.status(403).send("Forbidden: SaaS Admin access required");
    }
    next();
});

// Users
saasAdminRouter.get("/users", async (req, res) => {
    const tenantId = req.query.tenantId ? parseInt(req.query.tenantId as string) : undefined;
    const users = await storage.getAllUsers();
    
    if (tenantId) {
        return res.json(users.filter(u => u.tenantId === tenantId));
    }
    
    res.json(users);
});

saasAdminRouter.post("/users", async (req, res) => {
    try {
        const userData = insertUserSchema.parse(req.body);
        const user = await storage.createUser(userData);
        res.status(201).json(user);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

saasAdminRouter.patch("/users/:id", async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const user = await storage.updateUser(id, req.body);
        res.json(user);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// Tenants
saasAdminRouter.get("/tenants", async (req, res) => {
    const tenants = await storage.getAllTenants();
    res.json(tenants);
});

saasAdminRouter.post("/tenants", async (req, res) => {
    const parsed = insertTenantSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json(parsed.error);
    }
    const tenant = await storage.createTenant(parsed.data);
    res.status(201).json(tenant);
});

saasAdminRouter.patch("/tenants/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const tenant = await storage.updateTenant(id, req.body);
    res.json(tenant);
});

// Conversion
saasAdminRouter.post("/convert-request/:id", async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { subdomain, password, plan, name, fullName, expiresAt } = req.body;

        if (!subdomain || !password) {
            return res.status(400).send("Subdomain and password are required");
        }

        // 1. Check if subdomain exists
        const existing = await storage.getTenantBySubdomain(subdomain);
        if (existing) {
            return res.status(400).send("Subdomain already taken");
        }

        // 2. Create Tenant
        const tenant = await storage.createTenant({
            name: name,
            subdomain: subdomain.toLowerCase(),
            plan: plan || "Starter",
            isActive: true,
            subscriptionExpiresAt: expiresAt ? new Date(expiresAt) : null,
            settings: {}
        });

        // 3. Create Admin User for this tenant
        await storage.createUser({
            username: `admin@${subdomain}`,
            password: password.toString(),
            fullName: fullName || name,
            role: "admin",
            tenantId: tenant.id
        });

        // 4. Update Request Status
        await storage.updateSubscriptionRequestStatus(id, "processed");

        res.json({ success: true, tenant });
    } catch (error: any) {
        console.error("Conversion error:", error);
        res.status(500).json({ error: error.message });
    }
});
