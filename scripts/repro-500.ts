import "dotenv/config";
import { storage } from "../server/storage";
import { insertOrderSchema } from "../shared/schema";

async function testCreateOrder() {
    try {
        console.log("Starting order creation test...");

        // Use an existing tenant and client from the previous diagnostic
        // Tenants count: 1, Clients count: 2
        // We'll just fetch one
        const tenant = await storage.getTenantBySubdomain("localhost");
        // If not found, we'll try ID 1
        const tenantId = tenant?.id || 1;

        const clients = await storage.getClients(tenantId);
        if (clients.length === 0) {
            console.error("No clients found for tenant", tenantId);
            return;
        }
        const clientId = clients[0].id;

        const orderData = {
            clientId: clientId,
            garmentType: "Caftan",
            totalPrice: "1000",
            totalCost: "500",
            advancePayment: "200",
            dueDate: new Date(),
            profit: "500",
            expenses: [],
            status: "Nouvelle",
            currentStep: "Coupe",
            productionSteps: []
        };

        console.log("Attempting to create order with data:", JSON.stringify(orderData, null, 2));
        const order = await storage.createOrder(tenantId, orderData as any);
        console.log("SUCCESS! Created order ID:", order.id);

    } catch (err: any) {
        console.error("FAILURE! Error creating order:");
        console.error("Message:", err.message);
        console.error("Stack:", err.stack);
        if (err.detail) console.error("DB Detail:", err.detail);
        if (err.hint) console.error("DB Hint:", err.hint);
    } finally {
        // Connection will be closed when process exits or storage handles it
        process.exit(0);
    }
}

testCreateOrder();
