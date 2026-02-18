import { useTranslation } from "react-i18next";
import { useLanguage } from "@/contexts/LanguageContext";
import { useClients } from "@/hooks/use-clients";
import { useOrders } from "@/hooks/use-orders";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Users, Package, Wallet, TrendingUp, Scissors, Calendar, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

export default function DashboardPage() {
    const { t } = useTranslation();
    const { isRTL } = useLanguage();
    const { clients, isLoading: clientsLoading } = useClients();
    const { orders, isLoading: ordersLoading } = useOrders();

    const stats = [
        {
            title: t("common.clients"),
            value: clients?.length || 0,
            icon: Users,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
        },
        {
            title: t("common.orders"),
            value: orders?.length || 0,
            icon: Package,
            color: "text-orange-500",
            bg: "bg-orange-500/10",
        },
        {
            title: isRTL ? "إجمالي الأرباح" : "Chiffre d'affaires",
            value: (orders?.reduce((acc, o) => acc + Number(o.totalPrice), 0) || 0).toLocaleString() + " DH",
            icon: Wallet,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
        },
        {
            title: isRTL ? "النمو" : "Croissance",
            value: "+12%",
            icon: TrendingUp,
            color: "text-purple-500",
            bg: "bg-purple-500/10",
        },
    ];

    // Dummy data for the chart - in a real app, this would be computed from orders
    const chartData = [
        { name: "Lun", value: 400 },
        { name: "Mar", value: 300 },
        { name: "Mer", value: 600 },
        { name: "Jeu", value: 800 },
        { name: "Ven", value: 500 },
        { name: "Sam", value: 900 },
        { name: "Dim", value: 700 },
    ];

    const recentOrders = orders?.slice(0, 5) || [];

    return (
        <div className="p-6 space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-4xl font-bold tracking-tight text-foreground flex items-center gap-3">
                    <span className="p-2 bg-primary/10 rounded-xl">
                        <TrendingUp className="h-8 w-8 text-primary" />
                    </span>
                    {isRTL ? "لوحة التحكم" : "Tableau de Bord"}
                </h1>
                <p className="text-muted-foreground mt-2 text-lg">
                    {isRTL ? "نظرة عامة على نشاطك التجاري اليوم." : "Aperçu de votre activité aujourd'hui."}
                </p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <Card key={i} className="group hover-elevate transition-all border-2 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start">
                                <div className={cn("p-4 rounded-2xl transition-transform group-hover:scale-110", stat.bg)}>
                                    <stat.icon className={cn("h-7 w-7", stat.color)} />
                                </div>
                            </div>
                            <div className="mt-6">
                                <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{stat.title}</p>
                                <h3 className="text-3xl font-bold mt-1 tabular-nums">{stat.value}</h3>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Activity Chart */}
                <Card className="lg:col-span-2 border-2 rounded-[32px] shadow-sm overflow-hidden">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold flex items-center gap-3">
                            <TrendingUp className="h-6 w-6 text-primary" />
                            {isRTL ? "نشاط المبيعات" : "Activité des ventes"}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="h-[400px] w-full pt-4 pr-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "hsl(var(--background))",
                                            borderColor: "hsl(var(--border))",
                                            borderRadius: "16px",
                                            boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="value"
                                        stroke="hsl(var(--primary))"
                                        strokeWidth={4}
                                        fillOpacity={1}
                                        fill="url(#colorValue)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Orders */}
                <Card className="border-2 rounded-[32px] shadow-sm overflow-hidden">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold flex items-center gap-3">
                            <Clock className="h-6 w-6 text-primary" />
                            {isRTL ? "آخر الطلبات" : "Commandes récentes"}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-border">
                            {recentOrders.length === 0 ? (
                                <div className="p-8 text-center text-muted-foreground italic">
                                    {isRTL ? "لا يوجد طلبات حالياً" : "Aucune commande pour le moment"}
                                </div>
                            ) : recentOrders.map((order, i) => (
                                <div key={i} className="p-6 flex items-center gap-4 hover:bg-muted/50 transition-colors">
                                    <div className="p-3 bg-primary/10 rounded-xl">
                                        <Package className="h-5 w-5 text-primary" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold truncate">{order.garmentType}</p>
                                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {new Date(order.createdAt!).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-primary">{order.totalPrice} DH</p>
                                        <span className="text-[10px] font-bold uppercase tracking-tighter bg-secondary px-2 py-0.5 rounded-full">
                                            {order.status}
                                        </span>
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
