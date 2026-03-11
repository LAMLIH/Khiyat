import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Tenant } from "@shared/schema";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Loader2, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SaaSAdminTenants() {
    const { toast } = useToast();
    const { data: tenants, isLoading } = useQuery<Tenant[]>({
        queryKey: ["/api/saas-admin/tenants"],
    });

    const updateTenantMutation = useMutation({
        mutationFn: async ({ id, data }: { id: number, data: Partial<Tenant> }) => {
            const res = await fetch(`/api/saas-admin/tenants/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error("Failed to update tenant");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/saas-admin/tenants"] });
            toast({ title: "Succès", description: "Le client a été mis à jour." });
        },
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Gestion des Clients</h1>
                    <p className="text-muted-foreground">Gérez les sous-domaines et les abonnements.</p>
                </div>
            </div>

            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nom</TableHead>
                            <TableHead>Sous-domaine</TableHead>
                            <TableHead>Plan</TableHead>
                            <TableHead>Statut</TableHead>
                            <TableHead>Créé le</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tenants?.map((tenant) => (
                            <TableRow key={tenant.id}>
                                <TableCell className="font-medium">{tenant.name}</TableCell>
                                <TableCell>
                                    <code className="bg-muted px-1 py-0.5 rounded text-sm">{tenant.subdomain}</code>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline">{tenant.plan}</Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            checked={tenant.isActive}
                                            onCheckedChange={(checked) =>
                                                updateTenantMutation.mutate({ id: tenant.id, data: { isActive: checked } })
                                            }
                                        />
                                        <Badge variant={tenant.isActive ? "default" : "secondary"}>
                                            {tenant.isActive ? "Actif" : "Suspendu"}
                                        </Badge>
                                    </div>
                                </TableCell>
                                <TableCell>{tenant.createdAt ? new Date(tenant.createdAt).toLocaleDateString() : "-"}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm" asChild>
                                        <a href={`http://${tenant.subdomain}.localhost:5173`} target="_blank" rel="noreferrer">
                                            <ExternalLink className="h-4 w-4 mr-2" />
                                            Ouvrir
                                        </a>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
