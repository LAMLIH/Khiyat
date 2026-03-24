import { useState } from "react";
import {
    LayoutDashboard, Scissors, Users, Wallet, TrendingUp, Clock,
    Package, ChevronDown, Settings, BarChart3, ShoppingCart,
    History, ShoppingBag, ArrowLeft, ArrowRight, LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import brandLogo from "@/assets/brand-logo.png";

const TEAL = "#1c918f";

const menuItems = [
    { id: "dashboard", icon: LayoutDashboard, label: "لوحة القيادة", simple: true },
    {
        id: "management", icon: Scissors, label: "التسيير", collapsible: true,
        children: [
            { id: "orders", icon: Scissors, label: "الطلبات" },
            { id: "clients", icon: Users, label: "الزبناء" },
            { id: "measurements", icon: History, label: "القياسات" },
        ]
    },
    {
        id: "finance_group", icon: Wallet, label: "المالية", collapsible: true,
        children: [
            { id: "expenses", icon: ShoppingBag, label: "المصاريف" },
        ]
    },
    { id: "products", icon: Package, label: "المنتجات", simple: true },
    { id: "rentals", icon: ShoppingCart, label: "تتبع كراء الملابس الجاهزة", simple: true },
    { id: "stats", icon: BarChart3, label: "الإحصائيات", simple: true },
    {
        id: "settings_group", icon: Settings, label: "الإعدادات", collapsible: true,
        children: [
            { id: "preferences", icon: Settings, label: "التفضيلات" },
        ]
    },
];

const fakeOrders = [
    { id: 42, client: "فاطمة الزهراء", type: "قفطان", status: "En cours", step: "Khiata", total: "1200", progress: 50 },
    { id: 41, client: "أمينة بنعلي", type: "جلابة", status: "Terminée", step: "Prete", total: "850", progress: 100 },
    { id: 40, client: "كريم العلمي", type: "تكشيطة", status: "Nouvelle", step: "Fsalla", total: "600", progress: 17 },
    { id: 39, client: "سلوى التازي", type: "قفطان", status: "Terminée", step: "Prete", total: "1500", progress: 100 },
    { id: 38, client: "مريم أجراي", type: "جلابة", status: "En cours", step: "Terwam", total: "700", progress: 33 },
];

const fakeClients = [
    { name: "فاطمة الزهراء", phone: "06 12 34 56 78", initial: "ف", orders: 3 },
    { name: "أمينة بنعلي", phone: "06 87 65 43 21", initial: "أ", orders: 2 },
    { name: "كريم العلمي", phone: "06 11 22 33 44", initial: "ك", orders: 1 },
    { name: "سلوى التازي", phone: "06 55 44 33 22", initial: "س", orders: 4 },
    { name: "محمد بنسالم", phone: "06 99 88 77 66", initial: "م", orders: 2 },
    { name: "نادية بوغازي", phone: "06 33 22 11 00", initial: "ن", orders: 1 },
];

const barHeights = [15, 45, 20, 90, 65, 100, 70];
const barDays = ["الأربعاء", "الخميس", "الجمعة", "السبت", "الأحد", "الإثنين", "الثلاثاء"];

const distributionData = [
    { name: "قفطان", value: 2, pct: 100 },
    { name: "تكشيطة", value: 1, pct: 50 },
    { name: "سلبة", value: 1, pct: 50 },
];

function StatusBadge({ status }: { status: string }) {
    const isTerminee = status === "Terminée";
    const isNew = status === "Nouvelle";
    return (
        <span className={cn(
            "text-[9px] uppercase font-black px-2 py-0.5 rounded",
            isTerminee ? "bg-emerald-500 text-white" : isNew ? "bg-blue-500 text-white" : "bg-amber-500 text-white"
        )}>
            {status}
        </span>
    );
}

function MiniProgress({ pct, done }: { pct: number; done: boolean }) {
    return (
        <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden shrink-0">
            <div
                className={cn("h-full rounded-full", done ? "bg-emerald-500" : "bg-[#1c918f]")}
                style={{ width: `${pct}%` }}
            />
        </div>
    );
}

export function InteractiveMockup() {
    const [activeTab, setActiveTab] = useState("dashboard");
    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({ management: true });

    const toggleGroup = (id: string) => setOpenGroups(prev => ({ ...prev, [id]: !prev[id] }));

    const activateTab = (id: string) => setActiveTab(id);

    const isActive = (id: string) => activeTab === id;
    const isGroupActive = (item: any) =>
        item.children?.some((c: any) => isActive(c.id));

    return (
        <div className="relative bg-[#09090b] text-white overflow-hidden h-[560px] md:h-[720px] flex font-arabic rounded-2xl" dir="rtl">

            {/* ── Sidebar ── */}
            <aside className="hidden md:flex w-[230px] border-l border-white/5 bg-[#0f1014] flex-col flex-shrink-0">
                {/* Logo */}
                <div className="h-28 flex flex-col items-center justify-center border-b border-white/5 px-4 shrink-0">
                    <img src={brandLogo} alt="logo" className="h-10 w-auto object-contain invert" />
                    <span className="text-[10px] font-bold text-white/30 mt-1 uppercase tracking-widest leading-none">بصمتك في الأناقة.</span>
                </div>

                {/* Nav */}
                <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5 custom-scrollbar">
                    {menuItems.map((item) => {
                        if (item.simple) {
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => activateTab(item.id)}
                                    className={cn(
                                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold transition-all text-right",
                                        isActive(item.id)
                                            ? "bg-[#1c918f] text-white shadow-[0_0_12px_#1c918f40]"
                                            : "text-white/50 hover:bg-white/5 hover:text-white/80"
                                    )}
                                >
                                    <item.icon className="h-4 w-4 shrink-0" />
                                    <span className="truncate">{item.label}</span>
                                </button>
                            );
                        }
                        if (item.collapsible) {
                            const groupOpen = openGroups[item.id];
                            const groupActive = isGroupActive(item);
                            return (
                                <div key={item.id}>
                                    <button
                                        onClick={() => toggleGroup(item.id)}
                                        className={cn(
                                            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold transition-all text-right",
                                            groupActive ? "text-white" : "text-white/50 hover:bg-white/5 hover:text-white/80"
                                        )}
                                    >
                                        <item.icon className="h-4 w-4 shrink-0" />
                                        <span className="flex-1 truncate">{item.label}</span>
                                        <ChevronDown className={cn("h-3 w-3 transition-transform shrink-0", groupOpen && "rotate-180")} />
                                    </button>
                                    {groupOpen && (
                                        <div className="mr-4 border-r border-white/10 pr-2 mt-0.5 space-y-0.5">
                                            {item.children?.map((child: any) => (
                                                <button
                                                    key={child.id}
                                                    onClick={() => activateTab(child.id)}
                                                    className={cn(
                                                        "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all text-right",
                                                        isActive(child.id)
                                                            ? "bg-[#1c918f] text-white shadow-[0_0_10px_#1c918f30]"
                                                            : "text-white/40 hover:bg-white/5 hover:text-white/70"
                                                    )}
                                                >
                                                    <span>{child.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        }
                        return null;
                    })}
                </nav>

                {/* Footer user */}
                <div className="border-t border-white/5 px-3 py-3 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                        <div className="h-8 w-8 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center text-xs font-black shrink-0">AD</div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-xs font-bold text-white truncate leading-none">Administrateur</span>
                            <span className="text-[10px] text-white/40 truncate leading-none mt-0.5">admin</span>
                        </div>
                    </div>
                    <LogOut className="h-4 w-4 text-white/30 shrink-0 cursor-pointer hover:text-white/60 transition-colors" />
                </div>
            </aside>

            {/* ── Main ── */}
            <main className="flex-1 flex flex-col overflow-hidden bg-[#09090b]">

                {/* Top bar */}
                <div className="h-[52px] border-b border-white/5 flex items-center justify-between px-5 shrink-0 bg-[#09090b]/80 backdrop-blur">
                    <h1 className="text-base font-bold text-white">
                        {activeTab === "dashboard" && "لوحة القيادة"}
                        {(activeTab === "orders") && "الطلبات"}
                        {(activeTab === "clients") && "الزبناء"}
                        {(activeTab === "measurements") && "القياسات"}
                        {(activeTab === "expenses") && "المصاريف"}
                        {(activeTab === "stats") && "الإحصائيات"}
                        {(activeTab === "products") && "المنتجات"}
                        {!["dashboard", "orders", "clients", "measurements", "expenses", "stats", "products"].includes(activeTab) && "إعدادات"}
                    </h1>
                    <div className="flex items-center gap-2">
                        <button className="h-8 px-3 bg-[#1c918f] hover:bg-[#1c918f]/80 rounded-lg text-[11px] font-black text-white transition-colors flex items-center gap-1.5 shadow-[0_0_10px_#1c918f40]">
                            <Package className="h-3.5 w-3.5" />
                            جميع الطلبات
                        </button>
                    </div>
                </div>

                {/* Content scroll area */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden p-5 custom-scrollbar">

                    {/* ───── DASHBOARD ───── */}
                    {activeTab === "dashboard" && (
                        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* KPI row */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                {[
                                    { icon: Wallet, label: "إجمالي الأرباح", value: "Dhs 8 600", sub: "إجمالي المبيعات", color: "text-emerald-400", bg: "bg-emerald-400/10" },
                                    { icon: TrendingUp, label: "الربح الصافي", value: "Dhs 8 178", sub: "بعد خصم المصاريف", color: "text-[#1c918f]", bg: "bg-[#1c918f]/10" },
                                    { icon: Clock, label: "طلبات قيد التنفيذ", value: "2", sub: "تنتظر الإنهاء", color: "text-amber-400", bg: "bg-amber-400/10" },
                                    { icon: Users, label: "الزبناء النشطون", value: "2", sub: "زبناء لديهم طلبات", color: "text-blue-400", bg: "bg-blue-400/10" },
                                ].map((stat, i) => (
                                    <div key={i} className="bg-white/[0.03] border border-white/5 rounded-xl p-4 hover:bg-white/[0.06] transition-colors cursor-default group">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-xs font-bold text-white/50">{stat.label}</span>
                                            <div className={cn("p-1.5 rounded-lg", stat.bg)}>
                                                <stat.icon className={cn("h-3.5 w-3.5", stat.color)} />
                                            </div>
                                        </div>
                                        <div className="text-2xl font-black text-white leading-none">{stat.value}</div>
                                        <p className="text-[10px] text-white/30 mt-1.5 font-bold">{stat.sub}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Charts row */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                {/* Area chart mock */}
                                <div className="lg:col-span-2 bg-white/[0.03] border border-white/5 rounded-xl overflow-hidden">
                                    <div className="border-b border-white/5 px-4 py-3 bg-white/[0.02]">
                                        <p className="text-sm font-bold text-white">نشاط المبيعات</p>
                                        <p className="text-[10px] text-white/30 mt-0.5">تطور المداخيل خلال الأسبوع</p>
                                    </div>
                                    <div className="p-4 h-[180px] flex flex-col justify-between">
                                        {/* Fake area chart SVG */}
                                        <svg viewBox="0 0 280 120" className="w-full flex-1" preserveAspectRatio="none">
                                            <defs>
                                                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor={TEAL} stopOpacity="0.3" />
                                                    <stop offset="100%" stopColor={TEAL} stopOpacity="0" />
                                                </linearGradient>
                                            </defs>
                                            {/* grid lines */}
                                            {[30, 60, 90].map(y => (
                                                <line key={y} x1="0" y1={y} x2="280" y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                                            ))}
                                            {/* filled area */}
                                            <path
                                                d="M0,108 C20,95 40,85 60,40 C80,5 100,15 120,10 C140,5 160,30 180,50 C200,70 220,55 240,45 C260,35 270,30 280,25 L280,120 L0,120 Z"
                                                fill="url(#areaGrad)"
                                            />
                                            {/* stroke */}
                                            <path
                                                d="M0,108 C20,95 40,85 60,40 C80,5 100,15 120,10 C140,5 160,30 180,50 C200,70 220,55 240,45 C260,35 270,30 280,25"
                                                fill="none" stroke={TEAL} strokeWidth="2.5"
                                            />
                                            {/* red baseline */}
                                            <line x1="0" y1="115" x2="280" y2="115" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4 3" />
                                        </svg>
                                        {/* x axis labels */}
                                        <div className="flex justify-between mt-1">
                                            {barDays.map((d, i) => (
                                                <span key={i} className="text-[8px] text-white/25 font-bold">{d}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Distribution bar chart */}
                                <div className="bg-white/[0.03] border border-white/5 rounded-xl overflow-hidden">
                                    <div className="border-b border-white/5 px-4 py-3 bg-white/[0.02]">
                                        <p className="text-sm font-bold text-white">توزيع الطلبات</p>
                                        <p className="text-[10px] text-white/30 mt-0.5">أكثر أنواع الملابس طلباً</p>
                                    </div>
                                    <div className="p-4 space-y-4">
                                        {distributionData.map((row, i) => (
                                            <div key={i} className="flex items-center gap-3">
                                                <span className="text-xs font-bold text-white/50 w-[60px] shrink-0 text-left">{row.name} {row.value}</span>
                                                <div className="flex-1 h-5 bg-white/5 rounded-sm overflow-hidden">
                                                    <div
                                                        className="h-full rounded-sm transition-all"
                                                        style={{ width: `${row.pct}%`, background: i === 0 ? TEAL : "rgba(255,255,255,0.15)" }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                        {/* Quick stats */}
                                        <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-white/5">
                                            <div className="p-2.5 bg-white/5 rounded-xl text-center">
                                                <p className="text-[9px] font-black text-white/40 uppercase">الزبناء</p>
                                                <p className="text-lg font-black text-white">4</p>
                                            </div>
                                            <div className="p-2.5 bg-[#1c918f]/10 rounded-xl text-center border border-[#1c918f]/20">
                                                <p className="text-[9px] font-black text-[#1c918f] uppercase">الطلبات</p>
                                                <p className="text-lg font-black text-[#1c918f]">3</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Recent orders */}
                            <div className="bg-white/[0.03] border border-white/5 rounded-xl overflow-hidden">
                                <div className="border-b border-white/5 px-4 py-3 bg-white/[0.02] flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-bold text-white">آخر الطلبات</p>
                                        <p className="text-[10px] text-white/30 mt-0.5">متابعة حالة الإنتاج</p>
                                    </div>
                                    <button
                                        onClick={() => activateTab("orders")}
                                        className="text-[#1c918f] text-xs font-black hover:underline flex items-center gap-1"
                                    >
                                        المزيد <ArrowLeft className="h-3 w-3" />
                                    </button>
                                </div>
                                <div className="divide-y divide-white/5">
                                    {fakeOrders.slice(0, 3).map((o, i) => (
                                        <div key={i} className="flex items-center gap-4 px-4 py-3 hover:bg-white/[0.03] transition-colors cursor-pointer group">
                                            <div className="h-10 w-10 rounded-xl bg-[#1c918f]/10 flex items-center justify-center border border-[#1c918f]/20 shrink-0 group-hover:scale-105 transition-transform">
                                                <Scissors className="h-4 w-4 text-[#1c918f]" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <p className="text-sm font-black text-white">#{o.id} - {o.type}</p>
                                                    <StatusBadge status={o.status} />
                                                </div>
                                                <p className="text-[10px] text-white/30 mt-0.5">{o.client}</p>
                                            </div>
                                            <div className="flex items-center gap-3 shrink-0">
                                                <MiniProgress pct={o.progress} done={o.status === "Terminée"} />
                                                <p className="text-sm font-black text-[#1c918f]">{o.total} Dhs</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ───── ORDERS ───── */}
                    {activeTab === "orders" && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="bg-white/[0.03] border border-white/5 rounded-xl overflow-hidden">
                                <div className="grid grid-cols-[60px_1fr_80px_80px_80px] gap-3 px-4 py-3 border-b border-white/5 bg-white/[0.02] text-[10px] font-black text-white/40 uppercase tracking-wider">
                                    <div>رقم</div><div>الزبون / النوع</div><div>الحالة</div><div>المرحلة</div><div>المبلغ</div>
                                </div>
                                <div className="divide-y divide-white/5">
                                    {fakeOrders.map((o, i) => (
                                        <div key={i} className="grid grid-cols-[60px_1fr_80px_80px_80px] gap-3 px-4 py-3 items-center hover:bg-white/[0.04] transition-colors cursor-pointer group">
                                            <div className="text-xs font-black text-white/60">#{o.id}</div>
                                            <div>
                                                <p className="text-sm font-bold text-white group-hover:text-[#1c918f] transition-colors">{o.client}</p>
                                                <p className="text-[10px] text-white/30">{o.type}</p>
                                            </div>
                                            <div><StatusBadge status={o.status} /></div>
                                            <div className="text-[10px] font-bold text-white/50">{o.step}</div>
                                            <div className="text-xs font-black text-[#1c918f]">{o.total} Dhs</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ───── CLIENTS ───── */}
                    {activeTab === "clients" && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {fakeClients.map((c, i) => (
                                <div key={i} className="bg-white/[0.03] border border-white/5 rounded-xl p-4 hover:border-[#1c918f]/40 hover:bg-white/[0.05] transition-all cursor-pointer group">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="h-11 w-11 rounded-full flex items-center justify-center text-white font-black text-base shrink-0" style={{ background: `linear-gradient(135deg, ${TEAL}, #059669)` }}>
                                            {c.initial}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-white truncate group-hover:text-[#1c918f] transition-colors">{c.name}</p>
                                            <p className="text-[10px] text-white/30 mt-0.5">{c.phone}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 mt-2">
                                        <div className="flex-1 p-2 bg-white/5 rounded-lg text-center">
                                            <p className="text-[9px] text-white/30 font-bold">الطلبات</p>
                                            <p className="text-sm font-black text-white">{c.orders}</p>
                                        </div>
                                        <div className="flex-1 p-2 bg-emerald-500/10 rounded-lg text-center border border-emerald-500/10">
                                            <p className="text-[9px] text-emerald-400/60 font-bold">القياسات</p>
                                            <p className="text-xs font-black text-emerald-400">مكتملة</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* ───── OTHER TABS ───── */}
                    {!["dashboard", "orders", "clients"].includes(activeTab) && (
                        <div className="flex flex-col items-center justify-center h-[300px] text-center animate-in fade-in duration-500">
                            <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                                <Scissors className="h-7 w-7 text-white/20" />
                            </div>
                            <p className="text-base font-bold text-white/30">جرّب قوائم أخرى !</p>
                            <p className="text-xs text-white/20 mt-1 max-w-[200px]">انقر على أي قسم في القائمة لرؤية المحتوى</p>
                        </div>
                    )}
                </div>
            </main>

            {/* bottom fade */}
            <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-[#09090b] to-transparent pointer-events-none z-30 rounded-b-[1.5rem]" />
        </div>
    );
}
