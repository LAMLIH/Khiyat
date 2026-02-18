import {
    users, tenants, clients, measurements, orders,
    type User, type Tenant, type Client, type Measurement, type Order,
    type InsertUser, type InsertTenant, type InsertClient, type InsertMeasurement, type InsertOrder
} from "@shared/schema";
import session from "express-session";
import { db } from "./db";
import { eq, and } from "drizzle-orm";
import connectPg from "connect-pg-simple";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
    sessionStore: session.Store;

    // Tenants
    getTenant(id: number): Promise<Tenant | undefined>;
    getTenantBySubdomain(subdomain: string): Promise<Tenant | undefined>;
    createTenant(tenant: InsertTenant): Promise<Tenant>;

    // Users
    getUser(id: number): Promise<User | undefined>;
    getUserByUsername(username: string): Promise<User | undefined>;
    createUser(user: InsertUser): Promise<User>;

    // Clients
    getClients(tenantId: number): Promise<Client[]>;
    createClient(tenantId: number, client: InsertClient): Promise<Client>;

    // Measurements
    getMeasurements(tenantId: number, clientId: number): Promise<Measurement[]>;
    createMeasurement(tenantId: number, measurement: InsertMeasurement): Promise<Measurement>;

    // Orders
    getOrders(tenantId: number): Promise<Order[]>;
    createOrder(tenantId: number, order: InsertOrder): Promise<Order>;
}

export class DatabaseStorage implements IStorage {
    sessionStore: session.Store;

    constructor() {
        this.sessionStore = new PostgresSessionStore({
            conObject: {
                connectionString: process.env.DATABASE_URL,
            },
            createTableIfMissing: true,
        });
    }

    async getTenant(id: number): Promise<Tenant | undefined> {
        const [tenant] = await db.select().from(tenants).where(eq(tenants.id, id));
        return tenant;
    }

    async getTenantBySubdomain(subdomain: string): Promise<Tenant | undefined> {
        const [tenant] = await db.select().from(tenants).where(eq(tenants.subdomain, subdomain));
        return tenant;
    }

    async createTenant(insertTenant: InsertTenant): Promise<Tenant> {
        const [tenant] = await db.insert(tenants).values(insertTenant).returning();
        return tenant;
    }

    async getUser(id: number): Promise<User | undefined> {
        const [user] = await db.select().from(users).where(eq(users.id, id));
        return user;
    }

    async getUserByUsername(username: string): Promise<User | undefined> {
        const [user] = await db.select().from(users).where(eq(users.username, username));
        return user;
    }

    async createUser(insertUser: InsertUser): Promise<User> {
        const [user] = await db.insert(users).values(insertUser).returning();
        return user;
    }

    async getClients(tenantId: number): Promise<Client[]> {
        return db.select().from(clients).where(eq(clients.tenantId, tenantId));
    }

    async createClient(tenantId: number, insertClient: InsertClient): Promise<Client> {
        const [client] = await db.insert(clients).values({ ...insertClient, tenantId }).returning();
        return client;
    }

    async getMeasurements(tenantId: number, clientId: number): Promise<Measurement[]> {
        return db.select().from(measurements).where(
            and(
                eq(measurements.tenantId, tenantId),
                eq(measurements.clientId, clientId)
            )
        );
    }

    async createMeasurement(tenantId: number, insertMeasurement: InsertMeasurement): Promise<Measurement> {
        const [measurement] = await db.insert(measurements).values({ ...insertMeasurement, tenantId }).returning();
        return measurement;
    }

    async getOrders(tenantId: number): Promise<Order[]> {
        return db.select().from(orders).where(eq(orders.tenantId, tenantId));
    }

    async createOrder(tenantId: number, insertOrder: InsertOrder): Promise<Order> {
        const [order] = await db.insert(orders).values({ ...insertOrder, tenantId }).returning();
        return order;
    }
}

export const storage = new DatabaseStorage();
