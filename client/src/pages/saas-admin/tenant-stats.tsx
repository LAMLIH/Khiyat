import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ShoppingBag, TrendingUp, DollarSign, Loader2, ArrowLeft, Building2, Calendar, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tenant } from "@shared/schema";
import { Badge } from "@/components/ui/badge";

export default function TenantStatsPage() {
    const { id } = useParams<{ id: string }>();
    const tenantId = parseInt(id || "0");

    const { data: tenants } = useQuery<Tenant[]>({
        queryKey: ["/api/saas-admin/tenants"],
    });

    const tenant = tenants?.find(t => t.id === tenantId);

    const { data: stats, isLoading } = useQuery<any>({
        queryKey: [`/api/saas-admin/tenants/${tenantId}/stats`],
        enabled: !!tenantId,
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    if (!stats) return <div className="p-8 text-center">Aucune statistique trouvée.</div>;

    const cards = [
        {
            title: "Total Clients",
            value: stats.totalClients,
            icon: Users,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
            description: "Clients enregistrés par la boutique"
        },
        {
            title: "Total Commandes",
            value: stats.totalOrders,
            icon: ShoppingBag,
            color: "text-purple-500",
            bg: "bg-purple-500/10",
            description: "Volume global d'activité"
        },
        {
            title: "Chiffre d'Affaires",
            value: `${stats.totalRevenue.toLocaleString()} Dhs`,
            icon: TrendingUp,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
            description: "Revenu brut généré"
        },
        {
            title: "Bénéfice Total",
            value: `${stats.totalProfit.toLocaleString()} Dhs`,
            icon: DollarSign,
            color: "text-amber-500",
            bg: "bg-amber-500/10",
            description: "Marge nette estimée"
        }
    ];

    return (
        <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500 max-w-[100vw] overflow-x-hidden pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex flex-col gap-2">
                    <Link href="/tenants">
                        <Button variant="ghost" size="sm" className="w-fit gap-2 -ml-2 text-muted-foreground hover:text-primary">
                            <ArrowLeft className="h-4 w-4" /> Retour aux clients
                        </Button>
                    </Link>
                    <div className="flex items-center gap-4 mt-2">
                        <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-sm">
                            <Building2 className="h-8 w-8" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
                                {tenant?.name}
                                <Badge variant="outline" className="text-[10px] uppercase font-bold border-primary/20 bg-primary/5 text-primary">
                                    {tenant?.plan}
                                </Badge>
                            </h1>
                            <p className="text-muted-foreground font-medium flex items-center gap-2">
                                <LayoutDashboard className="h-4 w-4" /> Indicateurs de Performance Global
                            </p>
                        </div>
                    </div>
                </div>
                
                <div className="flex gap-3 w-full md:w-auto">
                    <Button variant="outline" className="flex-1 md:flex-none font-bold gap-2">
                        <Calendar className="h-4 w-4" /> Ce Mois
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                {cards.map((card) => (
                    <Card key={card.title} className="overflow-hidden border-2 border-border/50 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-bold text-muted-foreground">{card.title}</CardTitle>
                            <div className={`${card.bg} p-2 rounded-lg`}>
                                <card.icon className={`h-5 w-5 ${card.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-black tracking-tight">{card.value}</div>
                            <p className="text-xs text-muted-foreground mt-2 font-semibold italic">{card.description}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Secondary Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Orders by Status */}
                <Card className="border-2 shadow-sm bg-card h-fit">
                    <CardHeader className="border-b bg-muted/20">
                        <CardTitle className="text-lg font-bold">Répartition Commandes</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="space-y-4">
                            {Object.entries(stats.ordersByStatus).map(([status, count]: [string, any]) => (
                                <div key={status} className="flex flex-col gap-2">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="font-bold flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full bg-primary" />
                                            {status}
                                        </span>
                                        <span className="font-black text-primary">{count}</span>
                                    </div>
                                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-primary/60 transition-all duration-1000" 
                                            style={{ width: `${(count / stats.totalOrders) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                            {Object.keys(stats.ordersByStatus).length === 0 && (
                                <p className="text-center text-muted-foreground italic py-8 text-sm">Aucune commande enregistrée.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card className="lg:col-span-2 border-2 shadow-sm bg-card">
                    <CardHeader className="border-b bg-muted/20">
                        <CardTitle className="text-lg font-bold">Activités Récentes</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y">
                            {stats.recentOrders.map((order: any) => (
                                <div key={order.id} className="p-4 flex justify-between items-center hover:bg-muted/10 transition-colors">
                                    <div className="flex flex-col">
                                        <p className="font-bold text-sm">Commande #{order.id}</p>
                                        <p className="text-xs text-muted-foreground">{order.garmentType}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-sm">{order.totalPrice} Dhs</p>
                                        <Badge variant="outline" className="text-[10px] py-0">{order.status}</Badge>
                                    </div>
                                </div>
                            ))}
                            {stats.recentOrders.length === 0 && (
                                <div className="p-12 text-center text-muted-foreground italic text-sm">Aucune activité récente.</div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
