import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { db } from "@/lib/db";
import { useIsOnline } from "./use-is-online";
import { useTenant } from "./use-tenant";
import { apiRequest } from "@/lib/queryClient";
import { Client, InsertClient } from "@shared/schema";

export function useClients() {
    const isOnline = useIsOnline();
    const { tenantId } = useTenant();

    const { data: clients, isLoading } = useQuery<Client[]>({
        queryKey: ["/api/clients", tenantId],
        queryFn: async () => {
            if (isOnline) {
                return apiRequest("GET", `/api/clients?tenantId=${tenantId}`);
            }
            return db.clients.where("tenantId").equals(tenantId || 0).toArray() as any;
        },
        enabled: typeof tenantId === 'number',
    });

    const createClient = useMutation({
        mutationFn: async (newClient: InsertClient) => {
            if (isOnline) {
                const response = await apiRequest("POST", "/api/clients", { ...newClient, tenantId });
                await db.clients.put(response);
                return response;
            } else {
                const localId = await db.clients.add({
                    ...newClient,
                    tenantId: tenantId!,
                    synced: false,
                } as any);
                return { ...newClient, id: localId, tenantId, createdAt: new Date() } as Client;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/clients", tenantId] });
        },
    });

    return { clients, isLoading, createClient };
}
