import Dexie from "dexie";
import { type Client, type Measurement, type Order } from "@shared/schema";

export type { Client, Measurement, Order };

export const db: any = new Dexie("khiyatma_db");
db.version(1).stores({
    clients: "++id, tenantId, name, synced",
    measurements: "++id, tenantId, clientId, synced",
    orders: "++id, tenantId, clientId, synced",
});
