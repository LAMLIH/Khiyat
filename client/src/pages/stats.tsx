import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/contexts/LanguageContext";
import { useOrders } from "@/hooks/use-orders";
import { useClients } from "@/hooks/use-clients";
import { useStandaloneExpenses } from "@/hooks/use-standalone-expenses";
import { type Order, type Client } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { cn } from "@/lib/utils";
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    Users,
    Package,
    Wallet,
    CheckCircle2,
    Clock,
    AlertCircle,
    Filter,
} from "lucide-react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    Legend,
    LineChart,
    Line,
    LabelList,
} from "recharts";

const COLORS = ["#1c918f", "#f59e0b", "#6366f1", "#ec4899", "#14b8a6", "#f97316"];
const ORDER_STEPS = ["Fsalla", "Terwam", "Khiata", "Finition", "Mslouh", "Prete"] as const;

export default function StatsPage() {
    const { t } = useTranslation();
    const { isRTL } = useLanguage();
    const { orders } = useOrders();
    const { clients } = useClients();
    const { expenses: standaloneExpenses } = useStandaloneExpenses();

    const getClientName = (id: number) =>
        clients?.find((c: Client) => c.id === id)?.name || "---";

    // Filters state
    const [periodFilter, setPeriodFilter] = useState<string>("all");
    const [clientFilter, setClientFilter] = useState<string>("all");
    const [garmentFilter, setGarmentFilter] = useState<string>("all");

    // Unique garment types for filter options
    const uniqueGarments = useMemo(() => {
        const set = new Set<string>();
        orders?.forEach(o => o.garmentType && set.add(o.garmentType));
        return Array.from(set);
    }, [orders]);

    // Apply filters
    const filteredOrders = useMemo(() => {
        let result = orders || [];
        
        if (periodFilter !== "all") {
            const now = new Date();
            let startDate = new Date(0);
            let endDate = new Date(now.getFullYear() + 10, 0, 1);
            
            if (periodFilter === "this_month") startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            else if (periodFilter === "last_month") {
                startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
            } else if (periodFilter === "this_year") startDate = new Date(now.getFullYear(), 0, 1);
            
            result = result.filter(o => {
                if (!o.createdAt) return false;
                const d = new Date(o.createdAt);
                return d >= startDate && d <= endDate;
            });
        }
        if (clientFilter !== "all") result = result.filter(o => o.clientId?.toString() === clientFilter);
        if (garmentFilter !== "all") result = result.filter(o => o.garmentType === garmentFilter);

        return result;
    }, [orders, periodFilter, clientFilter, garmentFilter]);

    const filteredExpenses = useMemo(() => {
        let result = standaloneExpenses || [];
        
        if (periodFilter !== "all") {
            const now = new Date();
            let startDate = new Date(0);
            let endDate = new Date(now.getFullYear() + 10, 0, 1);
            
            if (periodFilter === "this_month") startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            else if (periodFilter === "last_month") {
                startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
            } else if (periodFilter === "this_year") startDate = new Date(now.getFullYear(), 0, 1);
            
            result = result.filter(e => {
                if (!e.date) return false;
                const d = new Date(e.date);
                return d >= startDate && d <= endDate;
            });
        }
        return result;
    }, [standaloneExpenses, periodFilter]);

    // Core metrics
    const totalRevenue = useMemo(() => filteredOrders.reduce((s, o) => s + Number(o.totalPrice || 0), 0) || 0, [filteredOrders]);
    const totalOrderCost = useMemo(() => filteredOrders.reduce((s, o) => s + Number(o.totalCost || 0), 0) || 0, [filteredOrders]);
    const totalStandaloneExpenses = useMemo(() => filteredExpenses.reduce((s, e) => s + Number(e.amount || 0), 0) || 0, [filteredExpenses]);
    const totalCost = totalOrderCost + totalStandaloneExpenses;
    const totalProfit = totalRevenue - totalCost;
    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
    
    const totalOrders = filteredOrders.length;
    const completedOrders = filteredOrders.filter(o => o.status?.includes("Termin")).length;
    const pendingOrders = filteredOrders.filter(o => ["Nouvelle", "En cours", "Fsalla", "Terwam", "Khiata", "Finition", "Mslouh"].includes(o.status)).length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Orders by status
    const statusData = useMemo(() => {
        const map: Record<string, number> = {};
        filteredOrders.forEach(o => { map[o.status] = (map[o.status] || 0) + 1; });
        return Object.entries(map).map(([name, value]) => ({ name, value }));
    }, [filteredOrders]);

    // Orders by garment type
    const garmentData = useMemo(() => {
        const map: Record<string, number> = {};
        filteredOrders.forEach(o => { map[o.garmentType] = (map[o.garmentType] || 0) + 1; });
        return Object.entries(map)
            .map(([name, value]) => ({ name: t(`garments.${name}`, { defaultValue: name }), value }))
            .sort((a, b) => b.value - a.value);
    }, [filteredOrders, t]);

    // Monthly revenue (last 6 months)
    const monthlyData = useMemo(() => {
        const now = new Date();
        const months: Record<string, { revenue: number; cost: number; profit: number }> = {};
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = d.toLocaleString("fr-FR", { month: "short", year: "2-digit" });
            months[key] = { revenue: 0, cost: 0, profit: 0 };
        }
        filteredOrders.forEach(o => {
            if (!o.createdAt) return;
            const d = new Date(o.createdAt);
            const key = d.toLocaleString("fr-FR", { month: "short", year: "2-digit" });
            if (months[key]) {
                months[key].revenue += Number(o.totalPrice);
                months[key].cost += Number(o.totalCost);
                months[key].profit += Number(o.profit || 0);
            }
        });
        filteredExpenses.forEach(e => {
            if (!e.date) return;
            const d = new Date(e.date);
            const key = d.toLocaleString("fr-FR", { month: "short", year: "2-digit" });
            if (months[key]) {
                months[key].cost += Number(e.amount || 0);
                months[key].profit -= Number(e.amount || 0);
            }
        });
        return Object.entries(months).map(([name, vals]) => ({ name, ...vals }));
    }, [filteredOrders, filteredExpenses]);

    // Top clients by revenue
    const topClients = useMemo(() => {
        const map: Record<number, { name: string; revenue: number; orders: number }> = {};
        filteredOrders.forEach(o => {
            const id = o.clientId || 0;
            if (!map[id]) map[id] = { name: getClientName(id), revenue: 0, orders: 0 };
            map[id].revenue += Number(o.totalPrice);
            map[id].orders += 1;
        });
        return Object.values(map).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
    }, [filteredOrders, clients]);

    // Step distribution
    const stepData = useMemo(() => {
        const map: Record<string, number> = {};
        filteredOrders.forEach(o => {
            const s = o.currentStep || "Fsalla";
            map[s] = (map[s] || 0) + 1;
        });
        return ORDER_STEPS.map(s => ({ name: t(`steps.${s}`, { defaultValue: s }), value: map[s] || 0 }));
    }, [filteredOrders, t]);

    // Weekly Trends (Last 4 weeks)
    const weeklyData = useMemo(() => {
        const data = [];
        for (let i = 3; i >= 0; i--) {
            const start = new Date();
            start.setDate(start.getDate() - (i * 7 + 7));
            const end = new Date();
            end.setDate(end.getDate() - (i * 7));
            
            const weekOrders = filteredOrders.filter(o => {
                const d = new Date(o.createdAt || "");
                return d >= start && d <= end;
            });
            
            data.push({
                name: isRTL ? `الأسبوع ${4-i}` : `Semaine ${4-i}`,
                revenue: weekOrders.reduce((s, o) => s + Number(o.totalPrice || 0), 0),
                profit: weekOrders.reduce((s, o) => s + Number(o.profit || 0), 0) - 
                        (filteredExpenses.filter(e => {
                            const d = new Date(e.date);
                            return d >= start && d <= end;
                        }).reduce((s, e) => s + e.amount, 0))
            });
        }
        return data;
    }, [filteredOrders, filteredExpenses, isRTL]);

    // Top Expense Categories
    const expenseData = useMemo(() => {
        const map: Record<string, number> = {};
        filteredExpenses.forEach(e => {
            map[e.category] = (map[e.category] || 0) + e.amount;
        });
        return Object.entries(map)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);
    }, [filteredExpenses]);

    const kpis = [
        {
            label: isRTL ? "إجمالي الإيرادات" : "Chiffre d'affaires",
            value: `${totalRevenue.toLocaleString("fr-MA")} Dhs`,
            icon: Wallet, color: "text-primary", bg: "bg-primary/10"
        },
        {
            label: isRTL ? "معدل الربح" : "Marge Bénéficiaire",
            value: `${profitMargin.toFixed(1)}%`,
            icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-500/10"
        },
        {
            label: isRTL ? "الربح الصافي" : "Bénéfice Net",
            value: `${totalProfit.toLocaleString("fr-MA")} Dhs`,
            icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10"
        },
        {
            label: isRTL ? "إجمالي المصاريف" : "Total Dépenses",
            value: `${totalCost.toLocaleString("fr-MA")} Dhs`,
            icon: TrendingDown, color: "text-destructive", bg: "bg-destructive/10"
        },
        {
            label: isRTL ? "متوسط قيمة الطلب" : "Valeur Moy. Commande",
            value: `${avgOrderValue.toFixed(0)} Dhs`,
            icon: Package, color: "text-amber-600", bg: "bg-amber-500/10"
        },
        {
            label: isRTL ? "طلبات منجزة" : "Commandes Réalisées",
            value: completedOrders,
            icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-500/10"
        },
        {
            label: isRTL ? "طلبات قيد التنفيذ" : "En Cours",
            value: pendingOrders,
            icon: Clock, color: "text-amber-600", bg: "bg-amber-500/10"
        },
        {
            label: isRTL ? "إجمالي الطلبات" : "Total Commandes",
            value: totalOrders,
            icon: BarChart3, color: "text-violet-600", bg: "bg-violet-500/10"
        },
    ];

    const tooltipStyle = {
        backgroundColor: "hsl(var(--popover))",
        borderColor: "hsl(var(--border))",
        color: "hsl(var(--popover-foreground))",
        borderRadius: "12px",
        boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
        fontSize: "12px",
    };

    return (
        <div className={cn("p-0 md:p-8 space-y-8 animate-in fade-in duration-500 bg-background min-h-screen", isRTL && "font-arabic")}>
            {/* Header & Filters */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-2xl">
                            <BarChart3 className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                        </div>
                        {isRTL ? "الإحصائيات" : "Statistiques"}
                    </h1>
                    <p className="text-muted-foreground mt-2 text-base md:text-lg sm:mx-14">
                        {isRTL ? "تحليل شامل لأداء المشغل" : "Analyse complète de la performance de votre atelier."}
                    </p>
                </div>

                <div className="flex flex-col lg:flex-row items-center gap-4 bg-card p-4 sm:p-2 rounded-xl border border-border/50 shadow-sm w-full lg:w-auto mt-6 lg:mt-0">
                    <div className="flex items-center gap-2 px-3 pb-3 lg:pb-0 text-muted-foreground border-b lg:border-b-0 rtl:lg:border-l ltr:lg:border-r border-border/50 w-full lg:w-auto justify-center lg:justify-start">
                        <Filter className="h-4 w-4" />
                        <span className="text-sm font-medium mx-2">{isRTL ? "تصفية" : "Filtres"}</span>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row w-full lg:w-auto gap-3">
                        <Select value={periodFilter} onValueChange={setPeriodFilter}>
                            <SelectTrigger className="w-full sm:w-[150px] h-11 sm:h-9 border border-input lg:border-0 bg-background lg:bg-transparent shadow-sm lg:shadow-none focus:ring-1 font-medium">
                                <SelectValue placeholder={isRTL ? "الفترة" : "Période"} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{isRTL ? "جميع الأوقات" : "Toutes les périodes"}</SelectItem>
                                <SelectItem value="this_month">{isRTL ? "هذا الشهر" : "Ce mois-ci"}</SelectItem>
                                <SelectItem value="last_month">{isRTL ? "الشهر الماضي" : "Mois dernier"}</SelectItem>
                                <SelectItem value="this_year">{isRTL ? "هذه السنة" : "Cette année"}</SelectItem>
                            </SelectContent>
                        </Select>

                        <SearchableSelect
                            options={[
                                { label: isRTL ? "كل الزبناء" : "Tous les clients", value: "all" },
                                ...(clients?.map(c => ({ label: c.name, value: c.id.toString() })) || [])
                            ]}
                            value={clientFilter}
                            onValueChange={setClientFilter}
                            placeholder={isRTL ? "الزبون" : "Client"}
                            emptyMessage={isRTL ? "لا يوجد زبون" : "Aucun client"}
                            className="w-full sm:w-[170px] h-11 sm:h-9 border border-input lg:border-0 bg-background lg:bg-transparent shadow-sm lg:shadow-none focus:ring-1 font-medium"
                        />

                        <Select value={garmentFilter} onValueChange={setGarmentFilter}>
                            <SelectTrigger className="w-full sm:w-[150px] h-11 sm:h-9 border border-input lg:border-0 bg-background lg:bg-transparent shadow-sm lg:shadow-none focus:ring-1 font-medium">
                                <SelectValue placeholder={isRTL ? "النوع" : "Type"} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{isRTL ? "كل الأنواع" : "Tous les types"}</SelectItem>
                                {uniqueGarments.map(g => (
                                    <SelectItem key={g} value={g}>{t(`garments.${g}`, { defaultValue: g})}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {kpis.map((kpi, i) => (
                    <Card key={i} className="border border-border shadow-sm bg-card hover:shadow-md transition-all">
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider leading-tight">{kpi.label}</p>
                                <div className={cn("p-2 rounded-xl", kpi.bg)}>
                                    <kpi.icon className={cn("h-4 w-4", kpi.color)} />
                                </div>
                            </div>
                            <p className="text-2xl font-black text-foreground leading-none" dir="ltr">{kpi.value}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Monthly Trends Chart */}
                <Card className="border border-border shadow-sm bg-card">
                    <CardHeader className="border-b border-border bg-muted/20">
                        <CardTitle className="text-lg font-bold">{isRTL ? "تطور المداخيل والمصاريف" : "Évolution Revenus / Dépenses"}</CardTitle>
                        <p className="text-sm text-muted-foreground">{isRTL ? "آخر 6 أشهر" : "6 derniers mois"}</p>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={monthlyData}>
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
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                                    <Tooltip contentStyle={tooltipStyle} />
                                    <Legend />
                                    <Area type="monotone" dataKey="revenue" name={isRTL ? "الإيرادات" : "Revenus"} stroke="#1c918f" strokeWidth={3} fill="url(#gRevenue)" />
                                    <Area type="monotone" dataKey="cost" name={isRTL ? "المصاريف" : "Dépenses"} stroke="#ef4444" strokeWidth={3} fill="url(#gCost)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Weekly Performance */}
                <Card className="border border-border shadow-sm bg-card">
                    <CardHeader className="border-b border-border bg-muted/20">
                        <CardTitle className="text-lg font-bold">{isRTL ? "الأداء الأسبوعي" : "Performance Hebdomadaire"}</CardTitle>
                        <p className="text-sm text-muted-foreground">{isRTL ? "تطور الربح في آخر 4 أسابيع" : "Évolution du profit sur 4 semaines"}</p>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={weeklyData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                    <YAxis axisLine={false} tickLine={false} />
                                    <Tooltip contentStyle={tooltipStyle} />
                                    <Legend />
                                    <Line type="monotone" dataKey="revenue" name={isRTL ? "المداخيل" : "Chiffre d'Affaire"} stroke="#1c918f" strokeWidth={3} dot={{ r: 4 }} />
                                    <Line type="monotone" dataKey="profit" name={isRTL ? "الربح" : "Profit Net"} stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Garment Distribution */}
                <Card className="border border-border shadow-sm bg-card">
                    <CardHeader className="border-b border-border bg-muted/20">
                        <CardTitle className="text-base font-bold">{isRTL ? "توزيع أنواع اللباس" : "Répartition par Type"}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="h-[220px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                                    <Pie 
                                        data={garmentData} 
                                        dataKey="value" 
                                        nameKey="name" 
                                        cx="50%" 
                                        cy="50%" 
                                        innerRadius={50}
                                        outerRadius={75} 
                                        paddingAngle={5}
                                        labelLine={false}
                                        label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                                            if (!percent || percent < 0.05) return null;
                                            const angle = midAngle || 0;
                                            const inner = innerRadius || 0;
                                            const outer = outerRadius || 0;
                                            const radius = inner + (outer - inner) * 0.5;
                                            const x = Number(cx) + radius * Math.cos(-angle * (Math.PI / 180));
                                            const y = Number(cy) + radius * Math.sin(-angle * (Math.PI / 180));
                                            return (
                                                <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize="12" fontWeight="bold">
                                                    {`${(percent * 100).toFixed(0)}%`}
                                                </text>
                                            );
                                        }}
                                    >
                                        {garmentData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip contentStyle={tooltipStyle} />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Step distribution */}
                <Card className="border border-border shadow-sm bg-card">
                    <CardHeader className="border-b border-border bg-muted/20">
                        <CardTitle className="text-base font-bold">{isRTL ? "الطلبات حسب المرحلة" : "Commandes par Étape"}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="h-[220px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stepData} layout="vertical" margin={{ left: 10, right: 30 }}>
                                    <XAxis type="number" hide />
                                    <YAxis 
                                        dataKey="name" 
                                        type="category" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ 
                                            fontSize: 12, 
                                            fontWeight: 700, 
                                            fill: "hsl(var(--muted-foreground))",
                                            textAnchor: isRTL ? "start" : "end" 
                                        }} 
                                        tickFormatter={(value) => {
                                            const item = stepData.find(d => d.name === value);
                                            const val = item ? item.value : 0;
                                            return isRTL ? `${val} ${value}` : `${value} ${val}`;
                                        }}
                                        width={120} 
                                    />
                                    <Tooltip 
                                        contentStyle={tooltipStyle} 
                                        itemStyle={{ color: "hsl(var(--primary))" }}
                                        cursor={{ fill: "hsl(var(--muted)/0.4)", opacity: 0.4 }}
                                    />
                                    <Bar dataKey="value" name={isRTL ? "الطلبات" : "Commandes"} radius={[0, 6, 6, 0]} barSize={18}>
                                        {stepData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Clients */}
                <Card className="border border-border shadow-sm bg-card">
                    <CardHeader className="border-b border-border bg-muted/20">
                        <CardTitle className="text-base font-bold">{isRTL ? "أفضل الزبناء" : "Top Clients"}</CardTitle>
                    </CardHeader>
                    <CardContent className="divide-y divide-border">
                        {topClients.map((client, i) => (
                            <div key={i} className="py-4 flex items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center font-black text-lg text-white", i === 0 ? "bg-amber-500" : i === 1 ? "bg-slate-400" : i === 2 ? "bg-amber-700" : "bg-muted")}>
                                        {i + 1}
                                    </div>
                                    <div>
                                        <p className="font-bold text-foreground">{client.name}</p>
                                        <p className="text-xs text-muted-foreground">{client.orders} {isRTL ? "طلب" : "commande(s)"}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs font-normal text-muted-foreground leading-none">Dhs </span>
                                    <p className="text-lg font-black text-primary leading-none">{client.revenue.toLocaleString("fr-MA")}</p>
                                </div>
                            </div>
                        ))}
                        {topClients.length === 0 && (
                            <p className="py-8 text-center text-muted-foreground italic">{isRTL ? "لا توجد بيانات" : "Aucune donnée"}</p>
                        )}
                    </CardContent>
                </Card>

                {/* Top Expense Categories */}
                <Card className="border border-border shadow-sm bg-card">
                    <CardHeader className="border-b border-border bg-muted/20">
                        <CardTitle className="text-base font-bold">{isRTL ? "أكبر مصاريف المشغل" : "Plus grandes dépenses"}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={expenseData} margin={{ top: 25, left: 10 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700 }} />
                                    <YAxis axisLine={false} tickLine={false} />
                                    <Tooltip 
                                        contentStyle={tooltipStyle} 
                                        itemStyle={{ color: "hsl(var(--primary))" }}
                                        cursor={{ fill: "hsl(var(--muted)/0.4)", opacity: 0.4 }}
                                    />
                                    <Bar dataKey="value" name={isRTL ? "المبلغ" : "Montant"} radius={[6, 6, 0, 0]} barSize={35} fill="#ef4444">
                                        <LabelList 
                                            dataKey="value" 
                                            content={(props: any) => {
                                                const { x, y, width, value } = props;
                                                return (
                                                    <text 
                                                        x={Number(x) + Number(width) / 2} 
                                                        y={Number(y) - 10} 
                                                        fill="hsl(var(--muted-foreground))"
                                                        fontSize={12}
                                                        fontWeight="bold"
                                                        textAnchor="middle" 
                                                    >
                                                        {value}
                                                    </text>
                                                );
                                            }}
                                        />
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
