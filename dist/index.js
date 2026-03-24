var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import "dotenv/config";
import express from "express";

// server/routes.ts
import { createServer } from "http";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  clients: () => clients,
  garmentTypes: () => garmentTypes,
  insertClientSchema: () => insertClientSchema,
  insertMeasurementSchema: () => insertMeasurementSchema,
  insertOrderSchema: () => insertOrderSchema,
  insertSubscriptionRequestSchema: () => insertSubscriptionRequestSchema,
  insertSubscriptionSchema: () => insertSubscriptionSchema,
  insertTenantSchema: () => insertTenantSchema,
  insertUserSchema: () => insertUserSchema,
  measurements: () => measurements,
  orders: () => orders,
  subscriptionRequests: () => subscriptionRequests,
  subscriptions: () => subscriptions,
  tenants: () => tenants,
  users: () => users
});
import { pgTable, text, serial, integer, timestamp, boolean, jsonb, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var tenants = pgTable("tenants", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  subdomain: text("subdomain").notNull().unique(),
  isActive: boolean("is_active").default(true).notNull(),
  plan: text("plan").notNull().default("Starter"),
  // 'Starter', 'Pro', 'Enterprise'
  subscriptionExpiresAt: timestamp("subscription_expires_at"),
  settings: jsonb("settings").$type().default({}),
  createdAt: timestamp("created_at").defaultNow()
});
var subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").references(() => tenants.id).notNull(),
  plan: text("plan").notNull(),
  // 'Starter', 'Pro', 'Enterprise'
  status: text("status").notNull().default("active"),
  // 'active', 'expired', 'canceled'
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull().default("0"),
  startDate: timestamp("start_date").defaultNow().notNull(),
  endDate: timestamp("end_date").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").references(() => tenants.id),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  role: text("role").notNull().default("staff")
  // 'staff', 'admin', 'saas_admin'
});
var clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").references(() => tenants.id),
  name: text("name").notNull(),
  phone: text("phone"),
  address: text("address"),
  createdAt: timestamp("created_at").defaultNow()
});
var garmentTypes = ["Caftan", "Takchitta", "Jellaba", "Gandoura", "Jabador", "Autre"];
var measurements = pgTable("measurements", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").references(() => clients.id),
  tenantId: integer("tenant_id").references(() => tenants.id),
  garmentType: text("garment_type", { enum: garmentTypes }).notNull(),
  data: jsonb("data").$type().notNull(),
  isLast: boolean("is_last").default(true),
  createdAt: timestamp("created_at").defaultNow()
});
var orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").references(() => tenants.id),
  clientId: integer("client_id").references(() => clients.id),
  garmentType: text("garment_type", { enum: garmentTypes }).notNull(),
  status: text("status").notNull().default("Nouvelle"),
  currentStep: text("current_step").notNull().default("Fsalla"),
  totalPrice: numeric("total_price", { precision: 10, scale: 2 }).notNull().default("0"),
  totalCost: numeric("total_cost", { precision: 10, scale: 2 }).notNull().default("0"),
  profit: numeric("profit", { precision: 10, scale: 2 }).notNull().default("0"),
  advancePayment: numeric("advance_payment", { precision: 10, scale: 2 }).default("0"),
  dueDate: timestamp("due_date"),
  productionSteps: jsonb("production_steps").$type().default([]),
  expenses: jsonb("expenses").$type().default([]),
  advances: jsonb("advances").$type().default([]),
  measurements: jsonb("measurements").$type().default({}),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow()
});
var subscriptionRequests = pgTable("subscription_requests", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  city: text("city").notNull(),
  phone: text("phone").notNull(),
  plan: text("plan").notNull(),
  status: text("status").notNull().default("pending"),
  // 'pending', 'processed', 'rejected'
  createdAt: timestamp("created_at").defaultNow()
});
var insertTenantSchema = createInsertSchema(tenants);
var insertUserSchema = createInsertSchema(users);
var insertClientSchema = createInsertSchema(clients);
var insertMeasurementSchema = createInsertSchema(measurements);
var insertOrderSchema = createInsertSchema(orders);
var insertSubscriptionSchema = createInsertSchema(subscriptions);
var insertSubscriptionRequestSchema = createInsertSchema(subscriptionRequests).omit({
  id: true,
  status: true,
  createdAt: true
});

// server/storage.ts
import session from "express-session";

// server/db.ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, must be set");
}
var queryClient = postgres(process.env.DATABASE_URL, {
  max: 10,
  connect_timeout: 30,
  prepare: false
  // Essential for proxies like PgBouncer/Sevalla
});
var db = drizzle(queryClient, { schema: schema_exports });
async function runMigrations() {
  console.log("Running auto-migrations...");
  try {
    await queryClient`
            CREATE TABLE IF NOT EXISTS "tenants" (
                "id" serial PRIMARY KEY NOT NULL,
                "name" text NOT NULL,
                "subdomain" text NOT NULL,
                "is_active" boolean DEFAULT true NOT NULL,
                "plan" text DEFAULT 'Starter' NOT NULL,
                "subscription_expires_at" timestamp,
                "settings" jsonb DEFAULT '{}'::jsonb,
                "created_at" timestamp DEFAULT now(),
                CONSTRAINT "tenants_subdomain_unique" UNIQUE("subdomain")
            )
        `;
    await queryClient`
            CREATE TABLE IF NOT EXISTS "users" (
                "id" serial PRIMARY KEY NOT NULL,
                "tenant_id" integer REFERENCES "tenants"("id"),
                "username" text NOT NULL,
                "password" text NOT NULL,
                "full_name" text NOT NULL,
                "role" text DEFAULT 'staff' NOT NULL,
                CONSTRAINT "users_username_unique" UNIQUE("username")
            )
        `;
    await queryClient`
            CREATE TABLE IF NOT EXISTS "clients" (
                "id" serial PRIMARY KEY NOT NULL,
                "tenant_id" integer REFERENCES "tenants"("id"),
                "name" text NOT NULL,
                "phone" text,
                "address" text,
                "created_at" timestamp DEFAULT now()
            )
        `;
    await queryClient`
            CREATE TABLE IF NOT EXISTS "measurements" (
                "id" serial PRIMARY KEY NOT NULL,
                "client_id" integer REFERENCES "clients"("id"),
                "tenant_id" integer REFERENCES "tenants"("id"),
                "garment_type" text NOT NULL,
                "data" jsonb NOT NULL,
                "is_last" boolean DEFAULT true,
                "created_at" timestamp DEFAULT now()
            )
        `;
    await queryClient`
            CREATE TABLE IF NOT EXISTS "orders" (
                "id" serial PRIMARY KEY NOT NULL,
                "tenant_id" integer REFERENCES "tenants"("id"),
                "client_id" integer REFERENCES "clients"("id"),
                "garment_type" text NOT NULL,
                "status" text DEFAULT 'Nouvelle' NOT NULL,
                "current_step" text DEFAULT 'Fsalla' NOT NULL,
                "total_price" numeric(10, 2) DEFAULT '0' NOT NULL,
                "total_cost" numeric(10, 2) DEFAULT '0' NOT NULL,
                "profit" numeric(10, 2) DEFAULT '0' NOT NULL,
                "advance_payment" numeric(10, 2) DEFAULT '0',
                "due_date" timestamp,
                "production_steps" jsonb DEFAULT '[]'::jsonb,
                "expenses" jsonb DEFAULT '[]'::jsonb,
                "advances" jsonb DEFAULT '[]'::jsonb,
                "measurements" jsonb DEFAULT '{}'::jsonb,
                "notes" text,
                "created_at" timestamp DEFAULT now()
            )
        `;
    await queryClient`
            CREATE TABLE IF NOT EXISTS "subscriptions" (
                "id" serial PRIMARY KEY NOT NULL,
                "tenant_id" integer REFERENCES "tenants"("id") NOT NULL,
                "plan" text NOT NULL,
                "status" text DEFAULT 'active' NOT NULL,
                "amount" numeric(10, 2) DEFAULT '0' NOT NULL,
                "start_date" timestamp DEFAULT now() NOT NULL,
                "end_date" timestamp NOT NULL,
                "created_at" timestamp DEFAULT now()
            )
        `;
    await queryClient`
            CREATE TABLE IF NOT EXISTS "subscription_requests" (
                "id" serial PRIMARY KEY NOT NULL,
                "full_name" text NOT NULL,
                "city" text NOT NULL,
                "phone" text NOT NULL,
                "plan" text NOT NULL,
                "status" text DEFAULT 'pending' NOT NULL,
                "created_at" timestamp DEFAULT now()
            )
        `;
    await queryClient`ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "measurements" jsonb DEFAULT '{}'::jsonb`;
    const [existing] = await queryClient`SELECT id FROM users WHERE username = 'saasadmin'`;
    if (!existing) {
      let [tenant] = await queryClient`SELECT id FROM tenants LIMIT 1`;
      if (!tenant) {
        [tenant] = await queryClient`INSERT INTO tenants (name, subdomain, is_active, plan) VALUES ('System Admin', 'admin', true, 'Enterprise') RETURNING id`;
      }
      await queryClient`INSERT INTO users (username, password, full_name, role, tenant_id) VALUES ('saasadmin', 'saaspassword', 'Global Administrator', 'saas_admin', ${tenant.id})`;
      console.log("Created saasadmin user.");
    }
    console.log("Auto-migrations complete.");
  } catch (err) {
    console.error("Auto-migration error (non-fatal):", err);
  }
}

// server/storage.ts
import { eq, and } from "drizzle-orm";
import connectPg from "connect-pg-simple";
var PostgresSessionStore = connectPg(session);
var DatabaseStorage = class {
  sessionStore;
  constructor() {
    this.sessionStore = new PostgresSessionStore({
      conObject: {
        connectionString: process.env.DATABASE_URL,
        // NOTE: Sevalla proxy (europe-west1-001.proxy.sevalla.app) does NOT support TLS.
        // Disabling SSL for the session store connection.
        ssl: false
      },
      createTableIfMissing: true,
      errorLog: (...args) => console.error("Session Store Error:", ...args)
    });
  }
  async dbPing() {
    await db.select({ id: tenants.id }).from(tenants).limit(1);
  }
  async getTenant(id) {
    const [tenant] = await db.select().from(tenants).where(eq(tenants.id, id));
    return tenant;
  }
  async getTenantBySubdomain(subdomain) {
    const [tenant] = await db.select().from(tenants).where(eq(tenants.subdomain, subdomain));
    return tenant;
  }
  async createTenant(insertTenant) {
    const [tenant] = await db.insert(tenants).values(insertTenant).returning();
    return tenant;
  }
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  async getUserByUsername(username) {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  async createUser(insertUser) {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  async updateUser(id, update) {
    const [user] = await db.update(users).set(update).where(eq(users.id, id)).returning();
    if (!user) throw new Error("User not found");
    return user;
  }
  async getClients(tenantId) {
    return db.select().from(clients).where(eq(clients.tenantId, tenantId));
  }
  async createClient(tenantId, insertClient) {
    const [client] = await db.insert(clients).values({ ...insertClient, tenantId }).returning();
    return client;
  }
  async getMeasurements(tenantId, clientId) {
    return db.select().from(measurements).where(
      and(
        eq(measurements.tenantId, tenantId),
        eq(measurements.clientId, clientId)
      )
    );
  }
  async createMeasurement(tenantId, insertMeasurement) {
    const [measurement] = await db.insert(measurements).values({ ...insertMeasurement, tenantId }).returning();
    return measurement;
  }
  async getOrders(tenantId) {
    return db.select().from(orders).where(eq(orders.tenantId, tenantId));
  }
  async createOrder(tenantId, insertOrder) {
    const [order] = await db.insert(orders).values({ ...insertOrder, tenantId }).returning();
    return order;
  }
  async updateOrder(id, update) {
    const [order] = await db.update(orders).set(update).where(eq(orders.id, id)).returning();
    if (!order) throw new Error("Order not found");
    return order;
  }
  // SaaS Admin
  async getAllTenants() {
    return db.select().from(tenants);
  }
  async updateTenant(id, update) {
    const [tenant] = await db.update(tenants).set(update).where(eq(tenants.id, id)).returning();
    if (!tenant) throw new Error("Tenant not found");
    return tenant;
  }
  async getAllUsers() {
    return db.select().from(users);
  }
  // Subscription Requests
  async getSubscriptionRequests() {
    return db.select().from(subscriptionRequests);
  }
  async getSubscriptionRequest(id) {
    const [request] = await db.select().from(subscriptionRequests).where(eq(subscriptionRequests.id, id));
    return request;
  }
  async getSubscriptionRequestByPhone(phone) {
    const [request] = await db.select().from(subscriptionRequests).where(eq(subscriptionRequests.phone, phone));
    return request;
  }
  async createSubscriptionRequest(request) {
    const [subRequest] = await db.insert(subscriptionRequests).values(request).returning();
    return subRequest;
  }
  async updateSubscriptionRequestStatus(id, status) {
    await db.update(subscriptionRequests).set({ status }).where(eq(subscriptionRequests.id, id));
  }
  async getSubscriptions(tenantId) {
    return db.select().from(subscriptions).where(eq(subscriptions.tenantId, tenantId));
  }
  async createSubscription(insertSubscription) {
    const [sub] = await db.insert(subscriptions).values(insertSubscription).returning();
    return sub;
  }
  async getTenantStats(tenantId) {
    const tenantOrders = await db.select().from(orders).where(eq(orders.tenantId, tenantId));
    const tenantClients = await db.select().from(clients).where(eq(clients.tenantId, tenantId));
    const stats = {
      totalClients: tenantClients.length,
      totalOrders: tenantOrders.length,
      totalRevenue: tenantOrders.reduce((sum, o) => sum + parseFloat(o.totalPrice || "0"), 0),
      totalProfit: tenantOrders.reduce((sum, o) => sum + parseFloat(o.profit || "0"), 0),
      ordersByStatus: tenantOrders.reduce((acc, o) => {
        acc[o.status] = (acc[o.status] || 0) + 1;
        return acc;
      }, {}),
      recentOrders: tenantOrders.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()).slice(0, 5)
    };
    return stats;
  }
  async getSaaSAdmins() {
    return await db.select().from(users).where(eq(users.role, "saas_admin"));
  }
};
var storage = new DatabaseStorage();

// server/routes.ts
function registerRoutes(app2) {
  app2.get("/api/tenant", async (req, res) => {
    const subdomain = req.query.subdomain;
    if (!subdomain) return res.status(400).send("subdomain is required");
    if (subdomain.toLowerCase() === "admin") {
      return res.json({
        id: 0,
        name: "SaaS Admin Portal",
        subdomain: "admin",
        isActive: true,
        plan: "Pro",
        settings: {}
      });
    }
    const tenant = await storage.getTenantBySubdomain(subdomain);
    if (!tenant) return res.status(404).send("Tenant not found");
    res.json(tenant);
  });
  app2.get("/api/clients", async (req, res) => {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(401).send("Unauthorized");
    const clients2 = await storage.getClients(tenantId);
    res.json(clients2);
  });
  app2.post("/api/clients", async (req, res) => {
    try {
      const tenantId = req.user?.tenantId;
      if (!tenantId) return res.status(401).send("Unauthorized");
      const clientData = insertClientSchema.omit({ tenantId: true }).parse(req.body);
      const client = await storage.createClient(tenantId, clientData);
      res.status(201).json(client);
    } catch (error) {
      console.error("Client creation error:", error);
      throw error;
    }
  });
  app2.get("/api/measurements", async (req, res) => {
    const tenantId = req.user?.tenantId;
    const clientId = Number(req.query.clientId);
    if (!tenantId || !clientId) return res.status(400).send("tenantId and clientId are required");
    const measurements2 = await storage.getMeasurements(tenantId, clientId);
    res.json(measurements2);
  });
  app2.post("/api/measurements", async (req, res) => {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(401).send("Unauthorized");
    const measurementData = insertMeasurementSchema.omit({ tenantId: true }).parse(req.body);
    const measurement = await storage.createMeasurement(tenantId, measurementData);
    res.status(201).json(measurement);
  });
  app2.get("/api/orders", async (req, res) => {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(401).send("Unauthorized");
    const orders2 = await storage.getOrders(tenantId);
    res.json(orders2);
  });
  app2.post("/api/orders", async (req, res) => {
    try {
      const tenantId = req.user?.tenantId;
      if (!tenantId) {
        console.warn("Order creation attempt without session tenantId");
        return res.status(401).send("Unauthorized");
      }
      console.log("Creating order for tenant:", tenantId, "Data:", JSON.stringify(req.body, null, 2));
      let orderData;
      try {
        const body = {
          ...req.body,
          dueDate: req.body.dueDate ? new Date(req.body.dueDate) : void 0
        };
        orderData = insertOrderSchema.omit({ tenantId: true }).parse(body);
      } catch (parseError) {
        console.error("Order Data Parsing Error:", parseError);
        return res.status(400).json({
          error: "Invalid order data",
          details: parseError.errors || parseError.message
        });
      }
      const order = await storage.createOrder(tenantId, {
        ...orderData,
        currentStep: orderData.currentStep || "Fsalla"
      });
      console.log("Order created successfully:", order.id);
      res.status(201).json(order);
    } catch (error) {
      console.error("Order creation database error:", error);
      res.status(500).json({
        error: "Failed to create order",
        message: error.message,
        detail: error.detail
        // Postgres detail if available
      });
    }
  });
  app2.patch("/api/orders/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const tenantId = req.user?.tenantId;
      if (!tenantId) return res.status(401).send("Unauthorized");
      const updateData = insertOrderSchema.partial().parse(req.body);
      const order = await storage.updateOrder(id, updateData);
      res.json(order);
    } catch (error) {
      console.error("Order update error:", error);
      res.status(500).json({ error: "Failed to update order", message: error.message });
    }
  });
  app2.post("/api/subscription-requests", async (req, res) => {
    try {
      const requestData = insertSubscriptionRequestSchema.parse(req.body);
      const existing = await storage.getSubscriptionRequestByPhone(requestData.phone);
      if (existing && existing.status === "pending") {
        return res.status(409).json({
          error: "Pending request exists",
          message: "Il existe d\xE9j\xE0 une demande en cours de traitement pour ce num\xE9ro de t\xE9l\xE9phone."
        });
      }
      const request = await storage.createSubscriptionRequest(requestData);
      res.status(201).json(request);
    } catch (error) {
      console.error("Subscription request error:", error);
      res.status(400).json({ error: "Invalid request data", details: error.errors });
    }
  });
  app2.get("/api/subscription-requests", async (req, res) => {
    const requests = await storage.getSubscriptionRequests();
    console.log("GET /api/subscription-requests called. Count:", requests.length);
    res.json(requests);
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/saas-admin.ts
import { Router } from "express";
var saasAdminRouter = Router();
saasAdminRouter.use((req, res, next) => {
  if (!req.isAuthenticated() || req.user?.role !== "saas_admin") {
    return res.status(403).send("Forbidden: SaaS Admin access required");
  }
  next();
});
saasAdminRouter.get("/users", async (req, res) => {
  const tenantId = req.query.tenantId ? parseInt(req.query.tenantId) : void 0;
  const users2 = await storage.getAllUsers();
  if (tenantId) {
    return res.json(users2.filter((u) => u.tenantId === tenantId));
  }
  res.json(users2);
});
saasAdminRouter.post("/users", async (req, res) => {
  try {
    const userData = insertUserSchema.parse(req.body);
    const user = await storage.createUser(userData);
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
saasAdminRouter.patch("/users/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const user = await storage.updateUser(id, req.body);
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
saasAdminRouter.get("/tenants", async (req, res) => {
  const tenants2 = await storage.getAllTenants();
  res.json(tenants2);
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
saasAdminRouter.post("/convert-request/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { subdomain, password, plan, name, fullName, expiresAt } = req.body;
    if (!subdomain || !password) {
      return res.status(400).send("Subdomain and password are required");
    }
    const existing = await storage.getTenantBySubdomain(subdomain);
    if (existing) {
      return res.status(400).send("Subdomain already taken");
    }
    const tenant = await storage.createTenant({
      name,
      subdomain: subdomain.toLowerCase(),
      plan: plan || "Starter",
      isActive: true,
      subscriptionExpiresAt: expiresAt ? new Date(expiresAt) : null,
      settings: {}
    });
    await storage.createUser({
      username: `admin@${subdomain}`,
      password: password.toString(),
      fullName: fullName || name,
      role: "admin",
      tenantId: tenant.id
    });
    await storage.updateSubscriptionRequestStatus(id, "processed");
    res.json({ success: true, tenant });
  } catch (error) {
    console.error("Conversion error:", error);
    res.status(500).json({ error: error.message });
  }
});
saasAdminRouter.get("/subscriptions", async (req, res) => {
  const tenantId = req.query.tenantId ? parseInt(req.query.tenantId) : void 0;
  if (!tenantId) {
    return res.status(400).send("tenantId query parameter is required");
  }
  const subs = await storage.getSubscriptions(tenantId);
  res.json(subs);
});
saasAdminRouter.post("/subscriptions", async (req, res) => {
  try {
    const subData = insertSubscriptionSchema.parse(req.body);
    const sub = await storage.createSubscription(subData);
    await storage.updateTenant(subData.tenantId, {
      plan: subData.plan,
      subscriptionExpiresAt: new Date(subData.endDate)
    });
    res.status(201).json(sub);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
saasAdminRouter.get("/tenants/:id/stats", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const stats = await storage.getTenantStats(id);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
saasAdminRouter.get("/system-admins", async (req, res) => {
  try {
    const admins = await storage.getSaaSAdmins();
    res.json(admins);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
saasAdminRouter.patch("/system-admins/:id/password", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ error: "Mot de passe requis" });
    }
    const user = await storage.updateUser(id, { password });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
saasAdminRouter.post("/system-admins", async (req, res) => {
  try {
    const userData = {
      ...req.body,
      role: "saas_admin"
    };
    const user = await storage.createUser(userData);
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// server/auth.ts
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session2 from "express-session";
function setupAuth(app2) {
  const sessionSettings = {
    secret: process.env.SESSION_SECRET || "khiyatma-default-secret",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1e3
      // 24 hours
    }
  };
  app2.use(session2(sessionSettings));
  app2.use(passport.initialize());
  app2.use(passport.session());
  passport.use(
    new LocalStrategy({ passReqToCallback: true }, async (req, username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || user.password !== password) {
          return done(null, false, { message: "Nom d'utilisateur ou mot de passe incorrect." });
        }
        const currentTenant = req.tenant;
        if (currentTenant) {
          if (user.tenantId !== currentTenant.id) {
            console.warn(`Unauthorized login attempt: User ${username} (T:${user.tenantId}) tried to log into T:${currentTenant.id}`);
            return done(null, false, { message: "Vous n'\xEAtes pas autoris\xE9 \xE0 vous connecter sur cet \xE9tablissement." });
          }
          if (!currentTenant.isActive) {
            console.warn(`Blocked login for suspended tenant: ${currentTenant.subdomain}`);
            return done(null, false, { message: "Cet \xE9tablissement est suspendu. Veuillez contacter l'administrateur." });
          }
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await storage.getUser(id);
      if (!user) return done(null, false);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
  app2.post("/api/login", passport.authenticate("local"), (req, res) => {
    res.json(req.user);
  });
  app2.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });
  app2.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });
}

// server/index.ts
import path from "path";
import { fileURLToPath } from "url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});
var app = express();
app.set("trust proxy", 1);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.get("/api/health", async (_req, res) => {
  let dbStatus = "unknown";
  let dbDetails = {};
  try {
    const res_1 = await queryClient`SELECT 1+1 as val`;
    const res_2 = await storage.dbPing().then(() => "ok").catch((e) => `ping_failed: ${e.message}`);
    dbStatus = res_1[0].val === 2 ? "connected (1+1=2)" : "weird_result";
    dbDetails = { ping: res_2 };
  } catch (err) {
    dbStatus = `error: ${err.message}`;
    dbDetails = {
      stack: err.stack,
      code: err.code,
      query: err.query,
      params: err.params
    };
  }
  const dbUrl = (process.env.DATABASE_URL || "").replace(/:\/\/([^:]+):([^@]+)@/, "://$1:***@");
  let pgStatus = "not tested";
  try {
    const { Client } = await import("pg");
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: false
    });
    await client.connect();
    const res_pg = await client.query("SELECT 1 as result");
    pgStatus = res_pg.rows[0].result === 1 ? "connected" : "failed query";
    await client.end();
  } catch (err) {
    pgStatus = `error: ${err.message}`;
  }
  let dnsTest = "unknown";
  try {
    const dns = await import("dns/promises");
    const host = (process.env.DATABASE_URL || "").split("@")[1]?.split(":")[0];
    if (host) {
      const lookups = await dns.lookup(host, { all: true });
      dnsTest = JSON.stringify(lookups);
    } else {
      dnsTest = "no host in URL";
    }
  } catch (err) {
    dnsTest = `error: ${err.message}`;
  }
  res.json({
    version: "1.1.0",
    status: "ok",
    database: dbStatus,
    details: dbDetails,
    dbUrl,
    mode: process.env.NODE_ENV,
    port: process.env.PORT
  });
});
app.use(async (req, res, next) => {
  try {
    const host = req.get("host") || "";
    const hostname = host.split(":")[0];
    const parts = hostname.split(".");
    let subdomain = "";
    if (hostname.endsWith("sevalla.app")) {
      if (parts.length > 3) subdomain = parts[0];
    } else if (parts.length > 2) {
      subdomain = parts[0];
    } else if (parts.length === 2 && parts[1] === "localhost") {
      subdomain = parts[0];
    }
    const systemSubdomains = ["www", "localhost", "127", "admin"];
    if (subdomain && !systemSubdomains.includes(subdomain.toLowerCase())) {
      const tenant = await storage.getTenantBySubdomain(subdomain);
      if (tenant) {
        req.tenant = tenant;
      }
    }
  } catch (error) {
    console.error("Tenant middleware error:", error);
  }
  next();
});
app.use((req, res, next) => {
  const start = Date.now();
  const path2 = req.path;
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path2.startsWith("/api")) {
      console.log(`${req.method} ${path2} ${res.statusCode} in ${duration}ms`);
    }
  });
  next();
});
(async () => {
  await runMigrations();
  setupAuth(app);
  app.use((req, res, next) => {
    if (req.isAuthenticated() && req.user && req.tenant) {
      const currentTenant = req.tenant;
      if (req.user.role !== "saas_admin" && req.user.tenantId !== currentTenant.id) {
        console.warn(`Unauthorized Access Attempt: User ${req.user.username} (T:${req.user.tenantId}) tried to access Tenant ${currentTenant.id} (${currentTenant.subdomain})`);
        return res.status(403).json({
          message: "\xC9tablissement non autoris\xE9. Vous ne pouvez acc\xE9der qu'\xE0 votre propre espace de travail."
        });
      }
      if (req.user.role !== "saas_admin" && !currentTenant.isActive) {
        console.warn(`Suspended Tenant Access Attempt: User ${req.user.username} for Tenant ${currentTenant.subdomain}`);
        return res.status(403).json({
          message: "Votre \xE9tablissement est actuellement suspendu. Veuillez contacter l'administrateur pour r\xE9gulariser votre situation."
        });
      }
    }
    next();
  });
  app.use("/api/saas-admin", saasAdminRouter);
  const server = registerRoutes(app);
  if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
    const publicPath = path.resolve(__dirname, "public");
    console.log(`Production mode: serving static files from ${publicPath}`);
    app.use(express.static(publicPath));
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
  app.use((err, req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    console.error(`Error ${status} at ${req.method} ${req.path}:`, err);
    const isProduction = process.env.NODE_ENV === "production";
    const message = isProduction && status === 500 ? "Internal Server Error" : err.message || "Internal Server Error";
    res.status(status).json({ message });
  });
  const PORT = process.env.PORT || 5e3;
  server.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || "development"} mode`);
  });
})();
