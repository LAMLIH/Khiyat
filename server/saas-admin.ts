import { Router } from "express";
import { storage } from "./storage";
import { insertTenantSchema } from "@shared/schema";

export const saasAdminRouter = Router();

// Middleware to ensure user is a SaaS admin
saasAdminRouter.use((req, res, next) => {
    if (!req.isAuthenticated() || req.user?.role !== "saas_admin") {
        return res.status(403).send("Forbidden: SaaS Admin access required");
    }
    next();
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

// Users
saasAdminRouter.get("/users", async (req, res) => {
    const users = await storage.getAllUsers();
    res.json(users);
});
