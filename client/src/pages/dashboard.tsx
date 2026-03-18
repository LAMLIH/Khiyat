import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/contexts/LanguageContext";
import { useClients } from "@/hooks/use-clients";
import { useOrders } from "@/hooks/use-orders";
import { useStandaloneExpenses } from "@/hooks/use-standalone-expenses";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Users, Package, Wallet, TrendingUp, Scissors, Calendar, Clock, CreditCard, PieChart as PieChartIcon, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell,
    LabelList
} from "recharts";

export default function DashboardPage() {
    const { t } = useTranslation();
    const { isRTL } = useLanguage();
    const { clients, isLoading: clientsLoading } = useClients();
    const { orders, isLoading: ordersLoading } = useOrders();
    const { expenses: standaloneExpenses } = useStandaloneExpenses();

    const ORDER_STEPS = ["Fsalla", "Terwam", "Khiata", "Finition", "Mslouh", "Prete"];
    const getProgress = (order: any) => {
        if (order.status?.includes("Termin") || order.currentStep === "Prete") return 100;
        const idx = ORDER_STEPS.indexOf(order.currentStep);
        return idx >= 0 ? Math.round(((idx + 1) / ORDER_STEPS.length) * 100) : 10;
    };

    // Calculations
    const totalOrders = orders?.length || 0;
    const totalRevenue = orders?.reduce((acc, o) => acc + Number(o.totalPrice), 0) || 0;
    const totalCost = orders?.reduce((acc, o) => acc + Number(o.totalCost), 0) || 0;
    const netProfit = totalRevenue - totalCost;

    const pendingOrders = orders?.filter(o => ["Nouvelle", "En cours"].includes(o.status)).length || 0;
    const activeClientsCount = new Set(orders?.map(o => o.clientId)).size;

    // Garment Type Distribution
    const garmentDistribution = orders?.reduce((acc: any, o) => {
        const type = o.garmentType;
        acc[type] = (acc[type] || 0) + 1;
        return acc;
    }, {});

    const distributionData = Object.entries(garmentDistribution || {}).map(([name, value]) => ({
        name: t(`garments.${name}`),
        value
    })).sort((a: any, b: any) => b.value - a.value);

    const stats = [
        {
            title: isRTL ? "إجمالي الأرباح" : "Chiffre d'affaires",
            value: totalRevenue.toLocaleString() + " Dhs",
            icon: Wallet,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
            description: isRTL ? "إجمالي المبيعات" : "Total des ventes"
        },
        {
            title: isRTL ? "الربح الصافي" : "Bénéfice Net",
            value: netProfit.toLocaleString() + " Dhs",
            icon: TrendingUp,
            color: "text-primary",
            bg: "bg-primary/10",
            description: isRTL ? "بعد خصم المصاريف" : "Après déduction des coûts"
        },
        {
            title: isRTL ? "طلبات قيد التنفيذ" : "Commandes en cours",
            value: pendingOrders,
            icon: Clock,
            color: "text-amber-500",
            bg: "bg-amber-500/10",
            description: isRTL ? "تنتظر الإنهاء" : "En attente de finition"
        },
        {
            title: isRTL ? "الزبناء النشطون" : "Clients Actifs",
            value: activeClientsCount,
            icon: Users,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
            description: isRTL ? "زبناء لديهم طلبات" : "Clients avec commandes"
        },
    ];

    // 7-Days Performance
    const chartData = useMemo(() => {
        const data = [];
        const days = isRTL ? ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"] : ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
        
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            d.setHours(0, 0, 0, 0);
            
            const dEnd = new Date(d);
            dEnd.setHours(23, 59, 59, 999);
            
            const dayOrders = orders?.filter(o => {
                const od = new Date(o.createdAt || "");
                return od >= d && od <= dEnd;
            }) || [];

            const dayExpenses = standaloneExpenses?.filter(e => {
                const ed = new Date(e.date || "");
                return ed >= d && ed <= dEnd;
            }) || [];
            
            data.push({
                name: days[d.getDay()],
                revenue: dayOrders.reduce((s, o) => s + Number(o.totalPrice || 0), 0),
                cost: dayOrders.reduce((s, o) => s + Number(o.totalCost || 0), 0) + dayExpenses.reduce((s, e) => s + Number(e.amount || 0), 0)
            });
        }
        return data;
    }, [orders, standaloneExpenses, isRTL]);

    const recentOrders = [...(orders || [])].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()).slice(0, 5);

    return (
        <div className={cn("p-4 md:p-8 space-y-8 animate-in fade-in duration-500 bg-background min-h-screen", isRTL && "font-arabic")}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-2xl">
                            <TrendingUp className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                        </div>
                        {isRTL ? "لوحة التحكم" : "Tableau de Bord"}
                    </h1>
                    <p className="text-muted-foreground text-base md:text-lg ml-14">
                        {isRTL ? "نظرة عامة على نشاطك التجاري اليوم في خياط برو." : "Aperçu de votre activité aujourd'hui sur Khiyat Pro."}
                    </p>
                </div>
                <div className="flex gap-3">
                    <Link href="/orders">
                        <Button className="gap-2 bg-primary shadow-lg shadow-primary/20 hover:bg-primary/90">
                            <Package className="h-4 w-4" /> {isRTL ? "جميع الطلبات" : "Toutes les commandes"}
                        </Button>
                    </Link>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, i) => (
                    <Card key={i} className="border border-border/50 shadow-sm hover-elevate transition-all group overflow-hidden bg-card">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                                {stat.title}
                            </CardTitle>
                            <div className={cn("p-2 rounded-xl transition-colors", stat.bg)}>
                                <stat.icon className={cn("h-5 w-5", stat.color)} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-black text-foreground leading-none">{stat.value}</div>
                            <p className="text-[10px] text-muted-foreground mt-2 font-bold uppercase tracking-tight">{stat.description}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Activity Chart */}
                <Card className="lg:col-span-2 hover-elevate transition-all border border-border bg-card overflow-hidden">
                    <CardHeader className="border-b border-border bg-muted/20">
                        <CardTitle className="text-xl font-bold text-foreground">
                            {isRTL ? "نشاط المبيعات" : "Activité des ventes"}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">{isRTL ? "تطور المداخيل خلال الأسبوع" : "Évolution des revenus sur la semaine"}</p>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="gRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#1c918f" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#1c918f" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="gCost" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
                                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))", fontWeight: 600 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))", fontWeight: 600 }} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "hsl(var(--popover))",
                                            borderColor: "hsl(var(--border))",
                                            color: "hsl(var(--popover-foreground))",
                                            borderRadius: "12px",
                                            boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                                            fontSize: "12px",
                                            fontWeight: "bold"
                                        }}
                                        itemStyle={{ color: "hsl(var(--primary))" }}
                                    />
                                    <Area type="monotone" dataKey="revenue" name={isRTL ? "الإيرادات" : "Revenus"} stroke="#1c918f" strokeWidth={3} fillOpacity={1} fill="url(#gRevenue)" />
                                    <Area type="monotone" dataKey="cost" name={isRTL ? "المصاريف" : "Dépenses"} stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#gCost)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Distribution by Type */}
                <Card className="border border-border shadow-sm bg-card overflow-hidden">
                    <CardHeader className="border-b border-border bg-muted/20">
                        <CardTitle className="text-xl font-bold text-foreground">
                            {isRTL ? "توزيع الطلبات" : "Distribution par Type"}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">{isRTL ? "أكثر أنواع الملابس طلباً" : "Types de vêtements les plus demandés"}</p>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={distributionData} layout="vertical" margin={{ left: 20, right: 30 }}>
                                    <XAxis type="number" hide />
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12, fontWeight: 700, fill: "hsl(var(--muted-foreground))", textAnchor: isRTL ? "start" : "end" }}
                                        tickFormatter={(value) => {
                                            const item = distributionData.find(d => d.name === value);
                                            const val = item ? item.value : 0;
                                            return isRTL ? `${val} ${value}` : `${value} ${val}`;
                                        }}
                                        width={100}
                                    />
                                    <Tooltip 
                                        cursor={{ fill: 'hsl(var(--muted)/0.1)' }} 
                                        contentStyle={{
                                            backgroundColor: "hsl(var(--popover))",
                                            borderColor: "hsl(var(--border))",
                                            color: "hsl(var(--popover-foreground))",
                                            borderRadius: "12px",
                                            boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                                            fontSize: "12px",
                                            fontWeight: "bold"
                                        }}
                                        itemStyle={{ color: "hsl(var(--primary))" }}
                                    />
                                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                                        {distributionData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={index === 0 ? '#1c918f' : 'hsl(var(--muted-foreground)/0.4)'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-4 space-y-2">
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{isRTL ? "نظرة سريعة" : "Résumé rapide"}</p>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="p-3 bg-muted/20 rounded-xl border border-border flex flex-col items-center">
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold">{isRTL ? "الزبناء" : "Clients"}</p>
                                    <p className="text-xl font-black text-foreground">{clients?.length || 0}</p>
                                </div>
                                <div className="p-3 bg-primary/5 rounded-xl border border-primary/10 flex flex-col items-center">
                                    <p className="text-[10px] text-primary uppercase font-bold">{isRTL ? "الطلبات" : "Orders"}</p>
                                    <p className="text-xl font-black text-primary">{totalOrders}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Orders */}
                <Card className="lg:col-span-3 hover-elevate transition-all border border-border bg-card overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-border bg-muted/20">
                        <div>
                            <CardTitle className="text-xl font-bold text-foreground">
                                {isRTL ? "آخر الطلبات" : "Commandes récentes"}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">{isRTL ? "متابعة حالة الإنتاج" : "Suivi de l'état de production"}</p>
                        </div>
                        <Link href="/orders">
                            <Button variant="ghost" size="sm" className="text-primary font-bold hover:bg-primary/5">
                                {isRTL ? "المزيد" : "Voir plus"} <ArrowRight className={cn("h-4 w-4 ml-2", isRTL && "rotate-180")} />
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-border">
                            {recentOrders.length === 0 ? (
                                <div className="p-12 text-center text-muted-foreground italic">
                                    {isRTL ? "لا يوجد طلبات حالياً" : "Aucune commande pour le moment"}
                                </div>
                            ) : recentOrders.map((order, i) => (
                                <div key={i} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-muted/10 transition-colors group">
                                    <div className="flex items-center gap-5">
                                        <div className="h-14 w-14 bg-primary/5 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                            <Scissors className="h-7 w-7" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <p className="font-black text-foreground text-lg">#{order.id} - {order.garmentType}</p>
                                                <Badge className={cn(
                                                    "text-[10px] uppercase font-bold px-2 py-0.5 rounded-md",
                                                    order.status === "Terminée" ? "bg-emerald-500" : "bg-amber-500"
                                                )}>
                                                    {order.status}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground font-medium flex items-center gap-2 mt-1">
                                                <Calendar className="h-3.5 w-3.5" />
                                                {isRTL ? "تاريخ الإضافة:" : "Créé le:"} {new Date(order.createdAt!).toLocaleDateString()}
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                                                    {t(`steps.${order.currentStep}`)}
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between md:justify-end gap-10 md:min-w-[200px]">
                                        <div className="text-right">
                                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{isRTL ? "المبلغ" : "Montant"}</p>
                                            <p className="text-2xl font-black text-primary leading-none mt-1">{order.totalPrice} Dhs</p>
                                        </div>
                                        {/* Status progress indicator mini */}
                                        <div className="w-24 h-2 bg-muted rounded-full overflow-hidden shrink-0">
                                            <div
                                                className={cn("h-full rounded-full transition-all", order.status?.includes("Termin") ? "bg-emerald-500" : "bg-primary")}
                                                style={{ width: `${getProgress(order)}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
