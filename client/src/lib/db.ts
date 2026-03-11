import Dexie, { type EntityTable } from "dexie";
import { type Client, type Measurement, type Order } from "@shared/schema";

export type { Client, Measurement, Order };

export class KhiyatmaDB extends Dexie {
    clients!: Dexie.EntityTable<Client & { synced?: boolean }, "id">;
    measurements!: Dexie.EntityTable<Measurement & { synced?: boolean }, "id">;
    orders!: Dexie.EntityTable<Order & { synced?: boolean }, "id">;

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
