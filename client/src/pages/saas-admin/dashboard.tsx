import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Building2, CreditCard, Activity } from "lucide-react";
import { Tenant, User } from "@shared/schema";
import { Loader2 } from "lucide-react";

export default function SaaSAdminDashboard() {
    const { data: tenants, isLoading: loadingTenants } = useQuery<Tenant[]>({
        queryKey: ["/api/saas-admin/tenants"],
    });

    const { data: users, isLoading: loadingUsers } = useQuery<User[]>({
        queryKey: ["/api/saas-admin/users"],
    });

    if (loadingTenants || loadingUsers) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const stats = [
        {
            title: "Total Clients (Tenants)",
            value: tenants?.length || 0,
            icon: Building2,
            description: "Nombre total d'entreprises sur la plateforme",
        },
        {
            title: "Total Utilisateurs",
            value: users?.length || 0,
            icon: Users,
            description: "Utilisateurs cumulés de tous les clients",
        },
        {
            title: "Abonnements Actifs",
            value: tenants?.filter(t => t.isActive).length || 0,
            icon: Activity,
            description: "Clients avec un abonnement actif",
        },
        {
            title: "Revenu Estimé",
            value: "--- DH",
            icon: CreditCard,
            description: "Basé sur les plans actuels",
        },
    ];

    return (
        <div className="p-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">SaaS Admin Dashboard</h1>
                <p className="text-muted-foreground">Vue d'ensemble globale de la plateforme Khiyatma.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <Card key={stat.title}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                            <stat.icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p className="text-xs text-muted-foreground">{stat.description}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
