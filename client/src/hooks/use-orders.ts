import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { db } from "@/lib/db";
import { useIsOnline } from "./use-is-online";
import { useTenant } from "./use-tenant";
import { apiRequest } from "@/lib/queryClient";
import { Order, InsertOrder } from "@shared/schema";

export function useOrders() {
    const isOnline = useIsOnline();
    const { tenantId } = useTenant();

    const { data: orders, isLoading } = useQuery<Order[]>({
        queryKey: ["/api/orders", tenantId],
        queryFn: async () => {
            if (isOnline) {
                return apiRequest("GET", `/api/orders?tenantId=${tenantId}`);
            }
            return db.orders.where("tenantId").equals(tenantId || 0).toArray() as any;
        },
        enabled: typeof tenantId === 'number',
    });

    const createOrder = useMutation({
        mutationFn: async (newOrder: InsertOrder) => {
            if (isOnline) {
                const response = await apiRequest("POST", "/api/orders", { ...newOrder, tenantId });
                await db.orders.put(response);
                return response;
            } else {
                const localId = await db.orders.add({
                    ...newOrder,
                    tenantId: tenantId!,
                    synced: false,
                } as any);
                return { ...newOrder, id: localId, tenantId, createdAt: new Date() } as Order;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/orders", tenantId] });
        },
    });

    const updateOrder = useMutation({
        mutationFn: async ({ id, data }: { id: number; data: Partial<Order> }) => {
            if (isOnline) {
                return apiRequest("PATCH", `/api/orders/${id}`, data);
            } else {
                await db.orders.update(id, { ...data, synced: false });
                return { id, ...data } as Order;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/orders", tenantId] });
        },
    });

    return { orders, isLoading, createOrder, updateOrder };
}
