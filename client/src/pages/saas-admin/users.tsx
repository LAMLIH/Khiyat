import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { User } from "@shared/schema";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Key, UserCircle, Loader2, ArrowLeft, PlusCircle } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SaaSAdminUsers() {
    const { toast } = useToast();
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [newPassword, setNewPassword] = useState("");
    
    // Create state
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [createUsername, setCreateUsername] = useState("");
    const [createPassword, setCreatePassword] = useState("Admin123");
    const [createFullName, setCreateFullName] = useState("");

    const { data: users, isLoading } = useQuery<User[]>({
        queryKey: ["/api/saas-admin/system-admins"],
    });

    const createMutation = useMutation({
        mutationFn: async () => {
            const res = await apiRequest("POST", "/api/saas-admin/system-admins", {
                username: createUsername,
                password: createPassword,
                fullName: createFullName,
                role: "saas_admin",
                tenantId: 1 // Default SaaS admin tenant
            });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/saas-admin/system-admins"] });
            toast({
                title: "Succès",
                description: "Nouvel administrateur créé.",
            });
            setIsCreateOpen(false);
            setCreateUsername("");
            setCreateFullName("");
        },
        onError: (error: any) => {
            toast({
                title: "Erreur",
                description: error.message || "Impossible de créer l'administrateur.",
                variant: "destructive",
            });
        }
    });

    const updatePasswordMutation = useMutation({
        mutationFn: async ({ id, password }: { id: number, password: string }) => {
            const res = await apiRequest("PATCH", `/api/saas-admin/system-admins/${id}/password`, { password });
            return res.json();
        },
        onSuccess: () => {
            toast({
                title: "Succès",
                description: "Le mot de passe a été mis à jour.",
            });
            setSelectedUser(null);
            setNewPassword("");
        },
        onError: (error: any) => {
            toast({
                title: "Erreur",
                description: error.message || "Impossible de mettre à jour le mot de passe.",
                variant: "destructive",
            });
        }
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 space-y-6 md:space-y-8 animate-in fade-in duration-500 max-w-[100vw] overflow-x-hidden">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex flex-col gap-1">
                        <Link href="/">
                            <Button variant="ghost" size="sm" className="w-fit gap-2 -ml-2 text-muted-foreground hover:text-primary font-bold">
                                <ArrowLeft className="h-4 w-4" /> Retour
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl md:text-4xl font-black text-foreground flex items-center gap-3">
                                Gestion des Admins
                            </h1>
                            <p className="text-sm md:text-base text-muted-foreground mt-1 font-medium italic">
                                Administrateurs de la plateforme SaaS Khiyatma.
                            </p>
                        </div>
                    </div>
                    <Button 
                        className="bg-primary hover:bg-primary/90 text-white font-black px-6 h-12 gap-2 shadow-lg shadow-primary/20"
                        onClick={() => setIsCreateOpen(true)}
                    >
                        <PlusCircle className="h-5 w-5" />
                        Nouvel Admin
                    </Button>
                </div>

            <Card className="border-border/50 shadow-xl overflow-hidden border-2">
                <CardHeader className="bg-muted/30 border-b py-6">
                    <CardTitle className="flex items-center gap-3 text-2xl font-black">
                        <ShieldCheck className="h-7 w-7 text-primary" />
                        Comptes Administrateurs
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table className="min-w-[800px]">
                            <TableHeader>
                                <TableRow className="bg-muted/10 hover:bg-muted/10 h-16">
                                    <TableHead className="font-black text-foreground">Utilisateur</TableHead>
                                    <TableHead className="font-black text-foreground">Identifiant</TableHead>
                                    <TableHead className="font-black text-foreground text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users?.map((user) => (
                                    <TableRow key={user.id} className="hover:bg-muted/5 transition-colors h-20">
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600 font-black uppercase border border-amber-500/20 shrink-0">
                                                    {user.fullName[0]}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-black text-lg">{user.fullName}</span>
                                                    <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">{user.role}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 font-black">
                                                <UserCircle className="h-4 w-4 text-muted-foreground" />
                                                <span className="bg-muted px-2 py-1 rounded text-sm italic">{user.username}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                className="gap-2 font-black bg-primary/5 hover:bg-primary/10 text-primary border-primary/20"
                                                onClick={() => setSelectedUser(user)}
                                            >
                                                <Key className="h-4 w-4" />
                                                Changer le mot de passe
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
                <DialogContent className="max-w-md border-t-4 border-t-primary shadow-2xl font-sans">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black flex items-center gap-3">
                            <Key className="h-7 w-7 text-primary" />
                            Réinitialisation
                        </DialogTitle>
                        <DialogDescription className="font-bold text-base pt-2">
                            Modifier le mot de passe de : <span className="text-primary italic">@{selectedUser?.username}</span>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-6 space-y-4">
                        <div className="space-y-2">
                            <Label className="text-sm font-black flex items-center gap-2 uppercase tracking-wide">
                                Nouveau mot de passe
                            </Label>
                            <Input 
                                type="text"
                                value={newPassword} 
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="font-black h-12 border-2 text-lg"
                                placeholder="Min. 8 caractères"
                            />
                        </div>
                    </div>

                    <DialogFooter className="gap-3">
                        <Button variant="ghost" onClick={() => setSelectedUser(null)} className="font-bold" disabled={updatePasswordMutation.isPending}>
                            Annuler
                        </Button>
                        <Button 
                            className="bg-primary hover:bg-primary/90 text-white font-black px-6 h-12 gap-2 shadow-lg shadow-primary/20" 
                            onClick={() => updatePasswordMutation.mutate({ id: selectedUser!.id, password: newPassword })}
                            disabled={updatePasswordMutation.isPending || !newPassword}
                        >
                            {updatePasswordMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Key className="h-5 w-5" />}
                            Confirmer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Creation Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="max-w-md border-t-4 border-t-primary shadow-2xl font-sans">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black flex items-center gap-3">
                            <UserCircle className="h-7 w-7 text-primary" />
                            Nouvel Admin
                        </DialogTitle>
                        <DialogDescription className="font-bold text-base pt-2 text-muted-foreground">
                            Créez un nouvel accès administrateur SaaS.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4 space-y-4">
                        <div className="space-y-2">
                            <Label className="text-sm font-black uppercase tracking-wide">Nom Complet</Label>
                            <Input 
                                value={createFullName} 
                                onChange={(e) => setCreateFullName(e.target.value)}
                                className="font-bold h-12 border-2"
                                placeholder="ex: Ahmed Lamlih"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-black uppercase tracking-wide">Identifiant</Label>
                            <Input 
                                value={createUsername} 
                                onChange={(e) => setCreateUsername(e.target.value.toLowerCase())}
                                className="font-bold h-12 border-2"
                                placeholder="username"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-black uppercase tracking-wide">Mot de passe</Label>
                            <Input 
                                type="text"
                                value={createPassword} 
                                onChange={(e) => setCreatePassword(e.target.value)}
                                className="font-black h-12 border-2 tracking-widest"
                            />
                        </div>
                    </div>

                    <DialogFooter className="gap-3">
                        <Button variant="ghost" onClick={() => setIsCreateOpen(false)} className="font-bold" disabled={createMutation.isPending}>
                            Annuler
                        </Button>
                        <Button 
                            className="bg-primary hover:bg-primary/90 text-white font-black px-6 h-12 gap-2 shadow-lg shadow-primary/20" 
                            onClick={() => createMutation.mutate()}
                            disabled={createMutation.isPending || !createUsername || !createFullName}
                        >
                            {createMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <PlusCircle className="h-5 w-5" />}
                            Créer le compte
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
