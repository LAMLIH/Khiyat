import { pgTable, text, serial, integer, timestamp, boolean, jsonb, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const tenants = pgTable("tenants", {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    subdomain: text("subdomain").notNull().unique(),
    isActive: boolean("is_active").default(true).notNull(),
    plan: text("plan").notNull().default("Starter"), // 'Starter', 'Pro', 'Enterprise'
    subscriptionExpiresAt: timestamp("subscription_expires_at"),
    settings: jsonb("settings").$type<{
        theme?: string;
        language?: string;
    }>().default({}),
    createdAt: timestamp("created_at").defaultNow(),
});

export const subscriptions = pgTable("subscriptions", {
    id: serial("id").primaryKey(),
    tenantId: integer("tenant_id").references(() => tenants.id).notNull(),
    plan: text("plan").notNull(), // 'Starter', 'Pro', 'Enterprise'
    status: text("status").notNull().default("active"), // 'active', 'expired', 'canceled'
    amount: numeric("amount", { precision: 10, scale: 2 }).notNull().default("0"),
    startDate: timestamp("start_date").defaultNow().notNull(),
    endDate: timestamp("end_date").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
});

export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    tenantId: integer("tenant_id").references(() => tenants.id),
    username: text("username").notNull().unique(),
    password: text("password").notNull(),
    fullName: text("full_name").notNull(),
    role: text("role").notNull().default("staff"), // 'staff', 'admin', 'saas_admin'
});

export const clients = pgTable("clients", {
    id: serial("id").primaryKey(),
    tenantId: integer("tenant_id").references(() => tenants.id),
    name: text("name").notNull(),
    phone: text("phone"),
    address: text("address"),
    createdAt: timestamp("created_at").defaultNow(),
});

export const garmentTypes = ["Caftan", "Takchitta", "Jellaba", "Gandoura", "Jabador", "Autre"] as const;

export const measurements = pgTable("measurements", {
    id: serial("id").primaryKey(),
    clientId: integer("client_id").references(() => clients.id),
    tenantId: integer("tenant_id").references(() => tenants.id),
    garmentType: text("garment_type", { enum: garmentTypes }).notNull(),
    data: jsonb("data").$type<Record<string, number>>().notNull(),
    isLast: boolean("is_last").default(true),
    createdAt: timestamp("created_at").defaultNow(),
});

export const orders = pgTable("orders", {
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

    productionSteps: jsonb("production_steps").$type<Array<{
        name: string;
        status: "Pending" | "In-Progress" | "Completed";
        cost: number;
        notes?: string;
        updatedAt: string;
    }>>().default([]),

    expenses: jsonb("expenses").$type<Array<{
        description: string;
        cost: number;
        date: string;
        step?: string;
    }>>().default([]),
    advances: jsonb("advances").$type<Array<{
        amount: number;
        date: string;
        notes?: string;
    }>>().default([]),
    measurements: jsonb("measurements").$type<Record<string, number>>().default({}),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow(),
});

export const subscriptionRequests = pgTable("subscription_requests", {
    id: serial("id").primaryKey(),
    fullName: text("full_name").notNull(),
    city: text("city").notNull(),
    phone: text("phone").notNull(),
    plan: text("plan").notNull(),
    status: text("status").notNull().default("pending"), // 'pending', 'processed', 'rejected'
    createdAt: timestamp("created_at").defaultNow(),
});

// Explicit insert schemas
export const insertTenantSchema = createInsertSchema(tenants);
export const insertUserSchema = createInsertSchema(users);
export const insertClientSchema = createInsertSchema(clients);
export const insertMeasurementSchema = createInsertSchema(measurements);
export const insertOrderSchema = createInsertSchema(orders);
export const insertSubscriptionSchema = createInsertSchema(subscriptions);
export const insertSubscriptionRequestSchema = createInsertSchema(subscriptionRequests).omit({
    id: true,
    status: true,
    createdAt: true
});

// Types
export type Tenant = typeof tenants.$inferSelect;
export type InsertTenant = typeof tenants.$inferInsert;

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export type Client = typeof clients.$inferSelect;
export type InsertClient = typeof clients.$inferInsert;

export type Measurement = typeof measurements.$inferSelect;
export type InsertMeasurement = typeof measurements.$inferInsert;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

export type SubscriptionRequest = typeof subscriptionRequests.$inferSelect;
export type InsertSubscriptionRequest = typeof subscriptionRequests.$inferInsert;

