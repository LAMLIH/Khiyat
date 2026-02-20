import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertClientSchema, insertMeasurementSchema, insertOrderSchema } from "@shared/schema";

export function registerRoutes(app: Express): Server {
    setupAuth(app);

    // Tenants
    app.get("/api/tenant", async (req, res) => {
        const subdomain = req.query.subdomain as string;
        if (!subdomain) return res.status(400).send("subdomain is required");
        const tenant = await storage.getTenantBySubdomain(subdomain);
        if (!tenant) return res.status(404).send("Tenant not found");
        res.json(tenant);
    });

    // Clients
    app.get("/api/clients", async (req, res) => {
        const tenantId = Number(req.query.tenantId) || req.user?.tenantId;
        if (!tenantId) return res.status(400).send("tenantId is required");
        const clients = await storage.getClients(tenantId);
        res.json(clients);
    });

    app.post("/api/clients", async (req, res) => {
        try {
            const tenantId = Number(req.body.tenantId) || req.user?.tenantId;
            if (!tenantId) return res.status(400).send("tenantId is required");

            const clientData = insertClientSchema.omit({ tenantId: true }).parse(req.body);
            const client = await storage.createClient(tenantId, clientData);
            res.status(201).json(client);
        } catch (error) {
            console.error("Client creation error:", error);
            throw error;
        }
    });

    // Measurements
    app.get("/api/measurements", async (req, res) => {
        const tenantId = Number(req.query.tenantId) || req.user?.tenantId;
        const clientId = Number(req.query.clientId);
        if (!tenantId || !clientId) return res.status(400).send("tenantId and clientId are required");
        const measurements = await storage.getMeasurements(tenantId, clientId);
        res.json(measurements);
    });

    app.post("/api/measurements", async (req, res) => {
        const tenantId = Number(req.body.tenantId) || req.user?.tenantId;
        if (!tenantId) return res.status(400).send("tenantId is required");

        const measurementData = insertMeasurementSchema.omit({ tenantId: true }).parse(req.body);
        const measurement = await storage.createMeasurement(tenantId, measurementData);
        res.status(201).json(measurement);
    });

    // Orders
    app.get("/api/orders", async (req, res) => {
        const tenantId = Number(req.query.tenantId) || req.user?.tenantId;
        if (!tenantId) return res.status(400).send("tenantId is required");
        const orders = await storage.getOrders(tenantId);
        res.json(orders);
    });

    app.post("/api/orders", async (req, res) => {
        try {
            const tenantId = Number(req.body.tenantId) || req.user?.tenantId;
            if (!tenantId) {
                console.warn("Order creation attempt without tenantId");
                return res.status(400).send("tenantId is required");
            }

            console.log("Creating order for tenant:", tenantId, "Data:", JSON.stringify(req.body, null, 2));

            let orderData;
            try {
                orderData = insertOrderSchema.omit({ tenantId: true }).parse(req.body);
            } catch (parseError: any) {
                console.error("Order Data Parsing Error:", parseError);
                return res.status(400).json({
                    error: "Invalid order data",
                    details: parseError.errors || parseError.message
                });
            }

            const order = await storage.createOrder(tenantId, orderData);
            console.log("Order created successfully:", order.id);
            res.status(201).json(order);
        } catch (error: any) {
            console.error("Order creation database error:", error);
            res.status(500).json({
                error: "Failed to create order",
                message: error.message,
                detail: error.detail // Postgres detail if available
            });
        }
    });

    app.patch("/api/orders/:id", async (req, res) => {
        try {
            const id = Number(req.params.id);
            const tenantId = req.user?.tenantId;
            if (!tenantId) return res.status(401).send("Unauthorized");

            // We use Partial because we only want to update some fields
            const updateData = insertOrderSchema.partial().parse(req.body);
            const order = await storage.updateOrder(id, updateData);
            res.json(order);
        } catch (error: any) {
            console.error("Order update error:", error);
            res.status(500).json({ error: "Failed to update order", message: error.message });
        }
    });

    const httpServer = createServer(app);
    return httpServer;
}
