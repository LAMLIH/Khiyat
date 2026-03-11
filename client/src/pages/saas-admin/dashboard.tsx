import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Building2, CreditCard, Activity, Loader2, Calendar, TrendingUp, AlertTriangle, ArrowRight, ShieldCheck, Globe } from "lucide-react";
import { Tenant, User } from "@shared/schema";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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

    // Calculations
    const totalTenants = tenants?.length || 0;
    const activeTenantsCount = tenants?.filter(t => t.isActive).length || 0;

    // Revenue simulation based on plans
    const revenue = tenants?.reduce((acc, t) => {
        if (!t.isActive) return acc;
        if (t.plan === "Enterprise") return acc + 5000;
        if (t.plan === "Pro") return acc + 1500;
        return acc + 500; // Starter
    }, 0) || 0;

    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);
    const newTenantsCount = tenants?.filter(t => t.createdAt && new Date(t.createdAt) > last30Days).length || 0;

    const next7Days = new Date();
    next7Days.setDate(next7Days.getDate() + 7);
    const expiringSoonCount = tenants?.filter(t => t.subscriptionExpiresAt && new Date(t.subscriptionExpiresAt) < next7Days && t.isActive).length || 0;

    const recentTenants = [...(tenants || [])]
        .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
        .slice(0, 5);

    const stats = [
        {
            title: "Total Clients",
            value: totalTenants,
            icon: Building2,
            description: "Entreprises enregistrées",
            color: "text-blue-500",
            bg: "bg-blue-500/10"
        },
        {
            title: "Revenu Mensuel",
            value: `${revenue.toLocaleString()} DH`,
            icon: TrendingUp,
            description: "Estimation sur abonnements actifs",
            color: "text-emerald-500",
            bg: "bg-emerald-500/10"
        },
        {
            title: "Nouveaux (30j)",
            value: `+${newTenantsCount}`,
            icon: Activity,
            description: "Inscriptions récentes",
            color: "text-orange-500",
            bg: "bg-orange-500/10"
        },
        {
            title: "Alertes Expira.",
            value: expiringSoonCount,
            icon: AlertTriangle,
            description: "Fin d'abonnement < 7 jours",
            color: expiringSoonCount > 0 ? "text-red-500" : "text-slate-400",
            bg: expiringSoonCount > 0 ? "bg-red-500/10" : "bg-slate-500/10"
        },
    ];

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500 bg-background/30 min-h-screen">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-0 select-none">
                        <div className="text-5xl font-lalezar text-primary leading-none drop-shadow-sm">خياط برو</div>
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight border-l-2 border-primary/20 pl-4 ml-4 text-foreground">SaaS Admin</h1>
                        <p className="text-muted-foreground ml-8">Vue d'ensemble globale de la plateforme Khiyatma.</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Link href="/tenants">
                        <Button variant="outline" className="gap-2 border-border bg-card hover:bg-muted">
                            <Building2 className="h-4 w-4" /> Gérer les Clients
                        </Button>
                    </Link>
                    <Button className="gap-2 bg-primary hover:bg-primary/90">
                        <ShieldCheck className="h-4 w-4" /> Sécurité Système
                    </Button>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <Card key={stat.title} className="overflow-hidden border border-border/50 shadow-sm hover:shadow-md transition-shadow bg-card">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-semibold text-muted-foreground">{stat.title}</CardTitle>
                            <div className={`${stat.bg} p-2.5 rounded-xl`}>
                                <stat.icon className={`h-5 w-5 ${stat.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold tracking-tight text-foreground">{stat.value}</div>
                            <p className="text-xs text-muted-foreground mt-1.5 font-medium">{stat.description}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                {/* Recent Registrations */}
                <Card className="lg:col-span-2 hover-elevate transition-all border border-border shadow-sm bg-card overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-border bg-muted/20">
                        <div>
                            <CardTitle className="text-lg font-bold text-foreground">Inscriptions Récentes</CardTitle>
                            <p className="text-sm text-muted-foreground">Flux d'activité des nouveaux clients</p>
                        </div>
                        <div className="bg-card p-2 rounded-lg border border-border">
                            <Calendar className="h-5 w-5 text-muted-foreground" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-border">
                            {recentTenants.map((tenant) => (
                                <div key={tenant.id} className="flex items-center justify-between p-5 hover:bg-slate-50/50 transition-colors group">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-lg border border-primary/5 group-hover:scale-105 transition-transform">
                                            {tenant.name.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-bold text-foreground">{tenant.name}</p>
                                                <Badge variant="outline" className={cn(
                                                    "text-[10px] uppercase tracking-wider py-0 px-1.5 font-bold",
                                                    tenant.isActive ? "border-emerald-200/50 text-emerald-500 bg-emerald-500/10" : "border-border text-muted-foreground bg-muted"
                                                )}>
                                                    {tenant.isActive ? "Actif" : "Inactif"}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground font-medium">@{tenant.subdomain}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-center gap-2 justify-end mb-1">
                                            <Globe className="h-3 w-3 text-muted-foreground" />
                                            <span className="text-xs font-bold text-foreground bg-muted px-2 py-0.5 rounded">
                                                {tenant.plan}
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-tight">
                                            {tenant.createdAt ? format(new Date(tenant.createdAt), 'dd MMM yyyy', { locale: fr }) : '---'}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {recentTenants.length === 0 && (
                            <div className="p-12 text-center text-slate-400 italic">
                                Aucun client enregistré pour le moment.
                            </div>
                        )}
                        <div className="p-4 bg-muted/20 border-t border-border text-center">
                            <Link href="/tenants">
                                <Button variant="ghost" className="text-primary font-bold text-sm hover:bg-primary/10">
                                    Voir tous les clients <ArrowRight className="h-4 w-4 ml-2" />
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                {/* System Summary / Usage */}
                <div className="space-y-6">
                    <Card className="hover-elevate transition-all border border-border shadow-sm bg-card">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold text-foreground">Performance Système</CardTitle>
                            <p className="text-sm text-muted-foreground">Statistiques d'utilisation</p>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground font-medium">Occupation Utilisateurs</span>
                                    <span className="font-bold text-primary">{users?.length || 0} total</span>
                                </div>
                                <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
                                    <div className="h-full bg-primary shadow-sm" style={{ width: '85%' }}></div>
                                </div>
                                <p className="text-[10px] text-muted-foreground">Capacité utilisée à environ 85% de l'infrastructure actuelle.</p>
                            </div>

                            <div className="pt-4 border-t border-border space-y-4">
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Plan Distribution</p>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-4 rounded-2xl border border-border bg-muted/20 hover:border-primary/20 transition-colors">
                                        <p className="text-[10px] text-muted-foreground font-bold uppercase mb-1">Starter</p>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-2xl font-black text-foreground">{tenants?.filter(t => t.plan === 'Starter').length || 0}</span>
                                            <span className="text-[10px] text-muted-foreground">clients</span>
                                        </div>
                                    </div>
                                    <div className="p-4 rounded-2xl border border-primary/10 bg-primary/5 hover:border-primary/20 transition-colors">
                                        <p className="text-[10px] text-primary font-bold uppercase mb-1">Pro</p>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-2xl font-black text-primary">{tenants?.filter(t => t.plan === 'Pro').length || 0}</span>
                                            <span className="text-[10px] text-primary/40">clients</span>
                                        </div>
                                    </div>
                                    <div className="p-4 rounded-2xl border border-emerald-500/10 bg-emerald-500/5 hover:border-emerald-500/20 transition-colors col-span-2">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="text-[10px] text-emerald-500 font-bold uppercase mb-1">Enterprise</p>
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-2xl font-black text-emerald-500">{tenants?.filter(t => t.plan === 'Enterprise').length || 0}</span>
                                                    <span className="text-[10px] text-emerald-500/60">clients</span>
                                                </div>
                                            </div>
                                            <ShieldCheck className="h-8 w-8 text-emerald-500/20" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm bg-primary text-white overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <TrendingUp className="h-24 w-24" />
                        </div>
                        <CardContent className="p-6 relative z-10">
                            <p className="text-sm font-bold text-white/70 uppercase mb-4">Objectif Revenu</p>
                            <div className="text-4xl font-black mb-1">92%</div>
                            <p className="text-xs text-white/80 leading-relaxed max-w-[200px]">
                                Vous êtes proche de l'objectif mensuel de croissance.
                            </p>
                            <Button variant="secondary" size="sm" className="mt-6 w-full font-bold text-primary">
                                Analyser Rapports
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
