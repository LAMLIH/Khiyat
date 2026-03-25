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
import { Loader2, ExternalLink, Users, Trash2, PlusCircle, ShieldCheck, Mail, Key, PencilLine, CreditCard, History, Calendar as CalendarIcon, BarChart3, ArrowLeft, LayoutList, Globe, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Link } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
    AlertDialog, 
    AlertDialogAction, 
    AlertDialogCancel, 
    AlertDialogContent, 
    AlertDialogDescription, 
    AlertDialogFooter, 
    AlertDialogHeader, 
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function SaaSAdminTenants() {
    const { toast } = useToast();
    const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
    const [isAddUserOpen, setIsAddUserOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [isSubscriptionsOpen, setIsSubscriptionsOpen] = useState(false);
    const [subTenant, setSubTenant] = useState<Tenant | null>(null);
    const [isAddSubOpen, setIsAddSubOpen] = useState(false);
    
    // New subscription form
    const [subPlan, setSubPlan] = useState("Starter");
    const [subAmount, setSubAmount] = useState("0");
    const [subEndDate, setSubEndDate] = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    const [deletingTenantId, setDeletingTenantId] = useState<number | null>(null);
    
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

    // Fetch subscriptions for selected tenant
    const { data: subscriptions, isLoading: loadingSubs } = useQuery<any[]>({
        queryKey: ["/api/saas-admin/subscriptions", { tenantId: subTenant?.id }],
        enabled: !!subTenant,
        queryFn: async () => {
            const res = await fetch(`/api/saas-admin/subscriptions?tenantId=${subTenant?.id}`);
            if (!res.ok) throw new Error("Failed to fetch subscriptions");
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

    const updateUserMutation = useMutation({
        mutationFn: async ({ id, data }: { id: number, data: any }) => {
            const res = await fetch(`/api/saas-admin/users/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error(await res.text());
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/saas-admin/users", { tenantId: selectedTenant?.id }] });
            toast({ title: "Succès", description: "Utilisateur mis à jour." });
            setEditingUser(null);
            setNewPassword("");
        },
        onError: (e: any) => {
            toast({ title: "Erreur", description: e.message, variant: "destructive" });
        }
    });

    const addSubscriptionMutation = useMutation({
        mutationFn: async () => {
            if (!subTenant) return;
            const res = await fetch("/api/saas-admin/subscriptions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    tenantId: subTenant.id,
                    plan: subPlan,
                    amount: subAmount,
                    startDate: new Date().toISOString(),
                    endDate: new Date(subEndDate).toISOString(),
                    status: "active"
                }),
            });
            if (!res.ok) throw new Error(await res.text());
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/saas-admin/tenants"] });
            queryClient.invalidateQueries({ queryKey: ["/api/saas-admin/subscriptions", { tenantId: subTenant?.id }] });
            toast({ title: "Succès", description: "Abonnement ajouté avec succès." });
            setIsAddSubOpen(false);
        },
        onError: (e: any) => {
            toast({ title: "Erreur", description: e.message, variant: "destructive" });
        }
    });

    const deleteTenantMutation = useMutation({
        mutationFn: async (id: number) => {
            const res = await fetch(`/api/saas-admin/tenants/${id}`, {
                method: "DELETE"
            });
            if (!res.ok) throw new Error("Failed to delete tenant");
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/saas-admin/tenants"] });
            toast({ title: "Succès", description: "Le client a été supprimé ainsi que toutes ses données." });
            setDeletingTenantId(null);
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
        <div className="p-4 md:p-8 space-y-6 md:space-y-8 max-w-[100vw]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex flex-col gap-1">
                    <Link href="/">
                        <Button variant="ghost" size="sm" className="w-fit gap-2 -ml-2 text-muted-foreground hover:text-primary font-bold">
                            <ArrowLeft className="h-4 w-4" /> Retour
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl md:text-4xl font-black text-foreground">Gestion des Clients</h1>
                        <p className="text-sm md:text-base text-muted-foreground mt-1 font-medium">Gérez les sous-domaines, les abonnements et les accès.</p>
                    </div>
                </div>
            </div>

            <Card className="border-border/50 shadow-xl overflow-hidden border-2">
                <CardHeader className="bg-muted/30 border-b py-6">
                    <CardTitle className="flex items-center gap-3 text-2xl font-black">
                        <LayoutList className="h-7 w-7 text-primary" />
                        Liste des Clients
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table className="min-w-[800px]">
                    <TableHeader>
                        <TableRow className="bg-muted/10 hover:bg-muted/10 h-16">
                            <TableHead className="font-black text-foreground">Nom</TableHead>
                            <TableHead className="font-black text-foreground">Sous-domaine</TableHead>
                            <TableHead className="font-black text-foreground">Plan</TableHead>
                            <TableHead className="font-black text-foreground">Statut</TableHead>
                            <TableHead className="font-black text-foreground">Créé le</TableHead>
                            <TableHead className="text-right font-black text-foreground">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tenants?.map((tenant) => (
                            <TableRow key={tenant.id} className="hover:bg-muted/5 transition-colors h-20">
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black uppercase border border-primary/20 shrink-0">
                                            {tenant.name[0]}
                                        </div>
                                        <span className="font-black text-lg">{tenant.name}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2 font-black">
                                        <Globe className="h-4 w-4 text-muted-foreground" />
                                        <code className="bg-muted px-2 py-1 rounded text-sm">{tenant.subdomain}</code>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={tenant.plan === "Elite" ? "destructive" : tenant.plan === "Pro" ? "default" : "secondary"} className="font-black px-3 py-1">
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
                                        <Badge variant={tenant.isActive ? "default" : "secondary"} className="font-black px-3 py-1 uppercase text-[10px]">
                                            {tenant.isActive ? "Actif" : "Suspendu"}
                                        </Badge>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2 font-medium text-muted-foreground italic">
                                        <Calendar className="h-4 w-4" />
                                        {tenant.createdAt ? new Date(tenant.createdAt).toLocaleDateString() : "-"}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right space-x-2">
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="gap-2 font-bold bg-amber-500/5 border-amber-500/20 hover:bg-amber-500/10 text-amber-600"
                                        onClick={() => {
                                            setSubTenant(tenant);
                                            setIsSubscriptionsOpen(true);
                                        }}
                                    >
                                        <CreditCard className="h-4 w-4" />
                                        Abonnements
                                    </Button>
                                    <Link href={`/tenants/${tenant.id}/stats`}>
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            className="gap-2 font-bold bg-blue-500/5 border-blue-500/20 hover:bg-blue-500/10 text-blue-600"
                                        >
                                            <BarChart3 className="h-4 w-4" />
                                            Indicateurs
                                        </Button>
                                    </Link>
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="gap-2 font-bold bg-primary/5 border-primary/20 hover:bg-primary/10 text-primary"
                                        onClick={() => setSelectedTenant(tenant)}
                                    >
                                        <Users className="h-4 w-4" />
                                        Accès
                                    </Button>
                                    <Button variant="ghost" size="sm" asChild className="font-bold">
                                        <a href={`http://${tenant.subdomain}.localhost:5173`} target="_blank" rel="noreferrer">
                                            <ExternalLink className="h-4 w-4 mr-2" />
                                            Ouvrir
                                        </a>
                                    </Button>
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        onClick={() => setDeletingTenantId(tenant.id)}
                                        className="text-destructive hover:bg-destructive/10 hover:text-destructive font-bold"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                </div>
                </CardContent>
            </Card>

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
                                                <TableCell className="text-right space-x-1">
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        className="text-primary hover:bg-primary/10"
                                                        onClick={() => {
                                                            setEditingUser(user);
                                                            setNewPassword("");
                                                        }}
                                                    >
                                                        <PencilLine className="h-4 w-4" />
                                                    </Button>
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

            {/* Change Password / Edit User Dialog */}
            <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
                <DialogContent className="max-w-md border-t-4 border-t-primary shadow-xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black">Modifier l'accès : {editingUser?.username}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label className="font-bold flex items-center gap-2">
                                <Key className="h-4 w-4 text-primary" /> Nouveau mot de passe
                            </Label>
                            <Input 
                                type="text"
                                value={newPassword} 
                                onChange={(e) => setNewPassword(e.target.value)} 
                                placeholder="Laisser vide pour ne pas changer"
                                className="font-bold border-2"
                            />
                            <p className="text-xs text-muted-foreground italic">
                                Saisissez un nouveau mot de passe pour cet utilisateur.
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setEditingUser(null)} className="font-bold">Annuler</Button>
                        <Button 
                            className="bg-primary hover:bg-primary/90 text-white font-bold px-6"
                            onClick={() => editingUser && updateUserMutation.mutate({ 
                                id: editingUser.id, 
                                data: { password: newPassword } 
                            })}
                            disabled={updateUserMutation.isPending || !newPassword}
                        >
                            {updateUserMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Mettre à jour"}
                        </Button>
                    </DialogFooter>
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

            {/* Subscriptions History & Management Dialog */}
            <Dialog open={isSubscriptionsOpen} onOpenChange={(open) => !open && setIsSubscriptionsOpen(false)}>
                <DialogContent className="max-w-4xl border-t-4 border-t-amber-500 shadow-2xl overflow-y-auto max-h-[90vh]">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <History className="h-7 w-7 text-amber-500" />
                                Abonnements : {subTenant?.name}
                            </div>
                            <Button 
                                size="sm" 
                                className="font-bold gap-2 bg-amber-600 hover:bg-amber-700" 
                                onClick={() => setIsAddSubOpen(!isAddSubOpen)}
                            >
                                <PlusCircle className="h-4 w-4" />
                                Nouvel abonnement
                            </Button>
                        </DialogTitle>
                    </DialogHeader>

                    {isAddSubOpen && (
                        <div className="mt-4 p-4 border-2 border-amber-100 rounded-xl bg-amber-50/30 space-y-4 animate-in slide-in-from-top-2">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label className="font-bold">Plan</Label>
                                    <Select value={subPlan} onValueChange={setSubPlan}>
                                        <SelectTrigger className="bg-white">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Starter">Starter</SelectItem>
                                            <SelectItem value="Pro">Pro</SelectItem>
                                            <SelectItem value="Enterprise">Enterprise</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-bold">Montant (Dhs)</Label>
                                    <Input 
                                        type="number" 
                                        value={subAmount} 
                                        onChange={(e) => setSubAmount(e.target.value)}
                                        className="bg-white font-bold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-bold">Date de fin</Label>
                                    <Input 
                                        type="date" 
                                        value={subEndDate} 
                                        onChange={(e) => setSubEndDate(e.target.value)}
                                        className="bg-white font-bold"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3">
                                <Button variant="ghost" size="sm" onClick={() => setIsAddSubOpen(false)}>Annuler</Button>
                                <Button 
                                    size="sm" 
                                    className="bg-amber-600 hover:bg-amber-700 font-bold"
                                    onClick={() => addSubscriptionMutation.mutate()}
                                    disabled={addSubscriptionMutation.isPending}
                                >
                                    {addSubscriptionMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enregistrer"}
                                </Button>
                            </div>
                        </div>
                    )}

                    <div className="mt-6">
                        {loadingSubs ? (
                            <div className="flex justify-center p-8">
                                <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
                            </div>
                        ) : (
                            <div className="border rounded-xl overflow-hidden shadow-sm">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/20">
                                            <TableHead className="font-bold">Plan</TableHead>
                                            <TableHead className="font-bold">Période</TableHead>
                                            <TableHead className="font-bold">Montant</TableHead>
                                            <TableHead className="font-bold text-right">Statut</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {subscriptions?.map((sub) => (
                                            <TableRow key={sub.id}>
                                                <TableCell className="font-bold">{sub.plan}</TableCell>
                                                <TableCell className="text-sm font-medium">
                                                    {new Date(sub.startDate).toLocaleDateString()} — {new Date(sub.endDate).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell className="font-bold text-amber-700">
                                                    {sub.amount} Dhs
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Badge variant={sub.status === "active" ? "default" : "secondary"}>
                                                        {sub.status === "active" ? "Actif" : sub.status}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {subscriptions?.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={4} className="h-32 text-center text-muted-foreground italic">
                                                    Aucun historique d'abonnement.
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

            {/* Confirmation Deletion AlertDialog */}
            <AlertDialog open={!!deletingTenantId} onOpenChange={(open) => !open && setDeletingTenantId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl font-black">Confirmer la suppression ?</AlertDialogTitle>
                        <AlertDialogDescription className="font-medium">
                            Cette action est irréversible. Toutes les données associées à ce client (clients, commandes, mesures, utilisateurs et abonnements) seront définitivement supprimées. 
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="font-bold">Annuler</AlertDialogCancel>
                        <AlertDialogAction 
                            className="bg-destructive hover:bg-destructive/90 text-white font-bold"
                            onClick={() => deletingTenantId && deleteTenantMutation.mutate(deletingTenantId)}
                        >
                            {deleteTenantMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
                            Supprimer définitivement
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
