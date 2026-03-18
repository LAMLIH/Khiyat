import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Tenant, User } from "@shared/schema";
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
import { Loader2, ExternalLink, Users, Trash2, PlusCircle, ShieldCheck, Mail, Key } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SaaSAdminTenants() {
    const { toast } = useToast();
    const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
    const [isAddUserOpen, setIsAddUserOpen] = useState(false);
    
    // New user form state
    const [newUsername, setNewUsername] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [newFullName, setNewFullName] = useState("");

    const { data: tenants, isLoading } = useQuery<Tenant[]>({
        queryKey: ["/api/saas-admin/tenants"],
    });

    // Fetch users for selected tenant
    const { data: tenantUsers, isLoading: loadingUsers } = useQuery<User[]>({
        queryKey: ["/api/saas-admin/users", { tenantId: selectedTenant?.id }],
        enabled: !!selectedTenant,
        queryFn: async () => {
            const res = await fetch(`/api/saas-admin/users?tenantId=${selectedTenant?.id}`);
            if (!res.ok) throw new Error("Failed to fetch users");
            return res.json();
        }
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

    const addUserMutation = useMutation({
        mutationFn: async (id: number) => {
            const res = await fetch("/api/saas-admin/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: newUsername,
                    password: newPassword,
                    fullName: newFullName,
                    role: "admin",
                    tenantId: id
                }),
            });
            if (!res.ok) throw new Error(await res.text());
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/saas-admin/users", { tenantId: selectedTenant?.id }] });
            toast({ title: "Succès", description: "Utilisateur ajouté." });
            setIsAddUserOpen(false);
            setNewUsername("");
            setNewPassword("");
            setNewFullName("");
        },
        onError: (e: any) => {
            toast({ title: "Erreur", description: e.message, variant: "destructive" });
        }
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
                    <p className="text-muted-foreground">Gérez les sous-domaines, les abonnements et les accès.</p>
                </div>
            </div>

            <div className="border rounded-lg bg-card shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/30">
                            <TableHead className="font-bold">Nom</TableHead>
                            <TableHead className="font-bold">Sous-domaine</TableHead>
                            <TableHead className="font-bold">Plan</TableHead>
                            <TableHead className="font-bold">Statut</TableHead>
                            <TableHead className="font-bold">Créé le</TableHead>
                            <TableHead className="text-right font-bold">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tenants?.map((tenant) => (
                            <TableRow key={tenant.id} className="hover:bg-muted/10 transition-colors">
                                <TableCell className="font-bold text-lg">{tenant.name}</TableCell>
                                <TableCell>
                                    <code className="bg-muted px-2 py-1 rounded text-sm font-semibold">{tenant.subdomain}</code>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="font-bold border-primary/20 bg-primary/5 text-primary">
                                        {tenant.plan}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            checked={tenant.isActive}
                                            onCheckedChange={(checked) =>
                                                updateTenantMutation.mutate({ id: tenant.id, data: { isActive: checked } })
                                            }
                                        />
                                        <Badge variant={tenant.isActive ? "default" : "secondary"} className="font-bold">
                                            {tenant.isActive ? "Actif" : "Suspendu"}
                                        </Badge>
                                    </div>
                                </TableCell>
                                <TableCell className="text-muted-foreground font-medium">
                                    {tenant.createdAt ? new Date(tenant.createdAt).toLocaleDateString() : "-"}
                                </TableCell>
                                <TableCell className="text-right space-x-2">
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="gap-2 font-bold bg-primary/5 border-primary/20 hover:bg-primary/10 text-primary"
                                        onClick={() => setSelectedTenant(tenant)}
                                    >
                                        <Users className="h-4 w-4" />
                                        Utilisateurs
                                    </Button>
                                    <Button variant="ghost" size="sm" asChild className="font-bold">
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

            {/* Users Management Dialog */}
            <Dialog open={!!selectedTenant} onOpenChange={(open) => !open && setSelectedTenant(null)}>
                <DialogContent className="max-w-3xl border-t-4 border-t-primary shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <ShieldCheck className="h-7 w-7 text-primary" />
                                Gestion des Utilisateurs : {selectedTenant?.name}
                            </div>
                            <Button 
                                size="sm" 
                                className="font-bold gap-2 bg-emerald-600 hover:bg-emerald-700" 
                                onClick={() => setIsAddUserOpen(true)}
                            >
                                <PlusCircle className="h-4 w-4" />
                                Ajouter un accès
                            </Button>
                        </DialogTitle>
                    </DialogHeader>

                    <div className="mt-6">
                        {loadingUsers ? (
                            <div className="flex justify-center p-8">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : (
                            <div className="border rounded-xl overflow-hidden shadow-sm">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/20">
                                            <TableHead className="font-bold">Nom Complet</TableHead>
                                            <TableHead className="font-bold">Identifiant</TableHead>
                                            <TableHead className="font-bold">Rôle</TableHead>
                                            <TableHead className="text-right font-bold">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {tenantUsers?.map((user) => (
                                            <TableRow key={user.id}>
                                                <TableCell className="font-bold">{user.fullName}</TableCell>
                                                <TableCell className="font-medium text-muted-foreground">{user.username}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="font-bold uppercase tracking-wider text-[10px]">
                                                        {user.role}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {tenantUsers?.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={4} className="h-32 text-center text-muted-foreground italic">
                                                    Aucun utilisateur pour ce client.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Add User Dialog */}
            <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
                <DialogContent className="max-w-md border-t-4 border-t-emerald-500 shadow-xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black">Ajouter un utilisateur admin</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label className="font-bold flex items-center gap-2">
                                <Users className="h-4 w-4 text-emerald-500" /> Nom Complet
                            </Label>
                            <Input 
                                value={newFullName} 
                                onChange={(e) => setNewFullName(e.target.value)} 
                                placeholder="Prénom Nom"
                                className="font-bold border-2"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="font-bold flex items-center gap-2">
                                <Mail className="h-4 w-4 text-emerald-500" /> Identifiant (Login)
                            </Label>
                            <div className="relative">
                                <Input 
                                    value={newUsername} 
                                    onChange={(e) => setNewUsername(e.target.value)} 
                                    placeholder="nom@boutique"
                                    className="font-bold border-2 pr-12"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="font-bold flex items-center gap-2">
                                <Key className="h-4 w-4 text-emerald-500" /> Mot de passe
                            </Label>
                            <Input 
                                type="text"
                                value={newPassword} 
                                onChange={(e) => setNewPassword(e.target.value)} 
                                placeholder="Mot de passe"
                                className="font-bold border-2"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsAddUserOpen(false)} className="font-bold">Annuler</Button>
                        <Button 
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6"
                            onClick={() => selectedTenant && addUserMutation.mutate(selectedTenant.id)}
                            disabled={addUserMutation.isPending}
                        >
                            {addUserMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Créer l'accès"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
