import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { db } from "@/lib/db";
import { useIsOnline } from "./use-is-online";
import { useTenant } from "./use-tenant";
import { apiRequest } from "@/lib/queryClient";
import { Measurement, InsertMeasurement } from "@shared/schema";

export function useMeasurements(clientId: number) {
    const isOnline = useIsOnline();
    const { tenantId } = useTenant();

    const { data: measurements, isLoading } = useQuery<Measurement[]>({
        queryKey: ["/api/measurements", tenantId, clientId],
        queryFn: async () => {
            if (isOnline) {
                return apiRequest("GET", `/api/measurements?tenantId=${tenantId}&clientId=${clientId}`);
            }
            return db.measurements
                .where({ tenantId: tenantId || 0, clientId })
                .toArray() as any;
        },
        enabled: !!tenantId && !!clientId,
    });

    const createMeasurement = useMutation({
        mutationFn: async (newMeasurement: InsertMeasurement) => {
            if (isOnline) {
                const response = await apiRequest("POST", "/api/measurements", { ...newMeasurement, tenantId });
                await db.measurements.put(response);
                return response;
            } else {
                const localId = await db.measurements.add({
                    ...newMeasurement,
                    tenantId: tenantId!,
                    synced: false,
                } as any);
                return { ...newMeasurement, id: localId, tenantId, createdAt: new Date() } as Measurement;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/measurements", tenantId, clientId] });
        },
    });

    return { measurements, isLoading, createMeasurement };
}
