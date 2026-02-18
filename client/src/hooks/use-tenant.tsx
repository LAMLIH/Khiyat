import React, { createContext, useContext, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { type Tenant } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

interface TenantContextType {
    tenant: Tenant | null;
    tenantId: number | null;
    isLoading: boolean;
}

const TenantContext = createContext<TenantContextType | null>(null);

export function TenantProvider({ children }: { children: React.ReactNode }) {
    const [subdomain, setSubdomain] = useState<string>("");

    useEffect(() => {
        const host = window.location.hostname;
        const parts = host.split(".");

        if (parts.length > 2) {
            setSubdomain(parts[0]);
        } else if (parts.length === 2 && parts[1] === "localhost") {
            setSubdomain(parts[0]);
        } else if (host === "localhost" || host === "127.0.0.1") {
            // Default to 'default' tenant in local dev if no subdomain
            setSubdomain("default");
        }
    }, []);

    const { data: tenant, isLoading } = useQuery<Tenant>({
        queryKey: ["/api/tenant", subdomain],
        queryFn: () => apiRequest("GET", `/api/tenant?subdomain=${subdomain}`),
        enabled: !!subdomain,
    });

    return (
        <TenantContext.Provider value={{ tenant: tenant || null, tenantId: tenant?.id || null, isLoading }}>
            {children}
        </TenantContext.Provider>
    );
}

export function useTenant() {
    const context = useContext(TenantContext);
    if (!context) {
        throw new Error("useTenant must be used within a TenantProvider");
    }
    return context;
}
