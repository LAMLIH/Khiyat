import Dexie, { type Table } from "dexie";
import { type Client, type Measurement, type Order } from "@shared/schema";

export type { Client, Measurement, Order };

export class KhiyatmaDB extends Dexie {
    clients!: Table<Client & { synced?: boolean }>;
    measurements!: Table<Measurement & { synced?: boolean }>;
    orders!: Table<Order & { synced?: boolean }>;

    constructor() {
        super("khiyatma_db");
        this.version(1).stores({
            clients: "++id, tenantId, name, synced",
            measurements: "++id, tenantId, clientId, synced",
            orders: "++id, tenantId, clientId, synced",
        });
    }
}

export const db = new KhiyatmaDB();
