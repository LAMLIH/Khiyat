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

// server/auth.ts
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session2 from "express-session";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  clients: () => clients,
  garmentTypes: () => garmentTypes,
  insertClientSchema: () => insertClientSchema,
  insertMeasurementSchema: () => insertMeasurementSchema,
  insertOrderSchema: () => insertOrderSchema,
  insertSubscriptionRequestSchema: () => insertSubscriptionRequestSchema,
  insertTenantSchema: () => insertTenantSchema,
  insertUserSchema: () => insertUserSchema,
  measurements: () => measurements,
  orders: () => orders,
  subscriptionRequests: () => subscriptionRequests,
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
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow()
});
var subscriptionRequests = pgTable("subscription_requests", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
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
var insertSubscriptionRequestSchema = createInsertSchema(subscriptionRequests);

// server/storage.ts
import session from "express-session";

// server/db.ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, must be set");
}
var queryClient = postgres(process.env.DATABASE_URL, {
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
  prepare: false
  // Essential for proxies like PgBouncer/Sevalla
});
var db = drizzle(queryClient, { schema: schema_exports });

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
        ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
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
  async createSubscriptionRequest(request) {
    const [subRequest] = await db.insert(subscriptionRequests).values(request).returning();
    return subRequest;
  }
};
var storage = new DatabaseStorage();

// server/auth.ts
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
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || user.password !== password) {
          return done(null, false);
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

// server/routes.ts
function registerRoutes(app2) {
  setupAuth(app2);
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
    const tenantId = Number(req.query.tenantId) || req.user?.tenantId;
    if (!tenantId) return res.status(400).send("tenantId is required");
    const clients2 = await storage.getClients(tenantId);
    res.json(clients2);
  });
  app2.post("/api/clients", async (req, res) => {
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
  app2.get("/api/measurements", async (req, res) => {
    const tenantId = Number(req.query.tenantId) || req.user?.tenantId;
    const clientId = Number(req.query.clientId);
    if (!tenantId || !clientId) return res.status(400).send("tenantId and clientId are required");
    const measurements2 = await storage.getMeasurements(tenantId, clientId);
    res.json(measurements2);
  });
  app2.post("/api/measurements", async (req, res) => {
    const tenantId = Number(req.body.tenantId) || req.user?.tenantId;
    if (!tenantId) return res.status(400).send("tenantId is required");
    const measurementData = insertMeasurementSchema.omit({ tenantId: true }).parse(req.body);
    const measurement = await storage.createMeasurement(tenantId, measurementData);
    res.status(201).json(measurement);
  });
  app2.get("/api/orders", async (req, res) => {
    const tenantId = Number(req.query.tenantId) || req.user?.tenantId;
    if (!tenantId) return res.status(400).send("tenantId is required");
    const orders2 = await storage.getOrders(tenantId);
    res.json(orders2);
  });
  app2.post("/api/orders", async (req, res) => {
    try {
      const tenantId = Number(req.body.tenantId) || req.user?.tenantId;
      if (!tenantId) {
        console.warn("Order creation attempt without tenantId");
        return res.status(400).send("tenantId is required");
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
      const request = await storage.createSubscriptionRequest(requestData);
      res.status(201).json(request);
    } catch (error) {
      res.status(400).json({ error: "Invalid request data", details: error.errors });
    }
  });
  app2.get("/api/subscription-requests", async (req, res) => {
    const requests = await storage.getSubscriptionRequests();
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
saasAdminRouter.get("/users", async (req, res) => {
  const users2 = await storage.getAllUsers();
  res.json(users2);
});

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
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.get("/api/health", async (_req, res) => {
  let dbStatus = "unknown";
  try {
    await storage.dbPing();
    dbStatus = "connected";
  } catch (err) {
    dbStatus = `error: ${err.message}`;
  }
  res.json({
    status: "ok",
    database: dbStatus,
    mode: process.env.NODE_ENV,
    port: process.env.PORT,
    cwd: process.cwd(),
    dir: __dirname
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
  setupAuth(app);
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
    const message = err.message || "Internal Server Error";
    console.error(`Error ${status} at ${req.method} ${req.path}:`, err);
    res.status(status).json({ message });
  });
  const PORT = process.env.PORT || 5e3;
  server.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || "development"} mode`);
  });
})();
