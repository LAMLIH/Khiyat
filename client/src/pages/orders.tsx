import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
    ClipboardList,
    History,
    TrendingUp,
    Wallet,
    Plus,
    Package,
    Calendar,
    CheckCircle2,
    Clock,
    AlertCircle,
    ChevronRight,
    Save,
    UserPlus,
    ShoppingBag,
    Trash2,
    Scissors
} from "lucide-react";
import { useOrders } from "@/hooks/use-orders";
import { useClients } from "@/hooks/use-clients";
import { type Client, type Order, garmentTypes } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Drawer } from "vaul";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

export default function OrdersPage() {
    const { t } = useTranslation();
    const { isRTL } = useLanguage();
    const { orders, isLoading, createOrder, updateOrder } = useOrders();
    const { clients } = useClients();

    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isEditOrderOpen, setIsEditOrderOpen] = useState(false);
    const [editAdvance, setEditAdvance] = useState("");
    const [editExpense, setEditExpense] = useState({ description: "", cost: "" });

    const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
    const [newOrder, setNewOrder] = useState({
        clientId: 0,
        garmentType: "Caftan" as typeof garmentTypes[number],
        totalPrice: "0",
        totalCost: "0",
        advancePayment: "0",
        dueDate: new Date().toISOString(),
        expenses: [] as { description: string; cost: number; date: string }[],
    });

    const [statusFilter, setStatusFilter] = useState<"all" | "ongoing">("ongoing");

    const [newExpense, setNewExpense] = useState({ description: "", cost: "" });

    const handleAddExpense = () => {
        if (!newExpense.description || !newExpense.cost) return;
        const expense = {
            description: newExpense.description,
            cost: Number(newExpense.cost),
            date: new Date().toISOString(),
        };
        setNewOrder(prev => {
            const updatedExpenses = [...prev.expenses, expense];
            const expensesTotal = updatedExpenses.reduce((sum, e) => sum + e.cost, 0);
            return {
                ...prev,
                expenses: updatedExpenses,
                totalCost: expensesTotal.toString()
            };
        });
        setNewExpense({ description: "", cost: "" });
    };

    const handleRemoveExpense = (index: number) => {
        setNewOrder(prev => {
            const updatedExpenses = prev.expenses.filter((_, i) => i !== index);
            const expensesTotal = updatedExpenses.reduce((sum, e) => sum + e.cost, 0);
            return {
                ...prev,
                expenses: updatedExpenses,
                totalCost: expensesTotal.toString()
            };
        });
    };


    const handleCreateOrder = () => {
        const orderData = {
            clientId: Number(newOrder.clientId),
            garmentType: newOrder.garmentType,
            totalPrice: newOrder.totalPrice.toString(),
            totalCost: newOrder.totalCost.toString(),
            advancePayment: newOrder.advancePayment.toString(),
            dueDate: new Date(newOrder.dueDate),
            profit: (Number(newOrder.totalPrice) - Number(newOrder.totalCost)).toString(),
            expenses: newOrder.expenses,
            status: "Nouvelle",
            currentStep: "Coupe",
            productionSteps: []
        };

        if (!orderData.clientId) {
            console.error("Client ID is missing");
            return;
        }

        createOrder.mutate(orderData, {
            onSuccess: () => {
                setIsNewOrderOpen(false);
                setNewOrder({
                    clientId: 0,
                    garmentType: "Caftan",
                    totalPrice: "0",
                    totalCost: "0",
                    advancePayment: "0",
                    dueDate: new Date().toISOString(),
                    expenses: [],
                });
            }
        });
    };

    const handleUpdateOrder = (order: Order, updates: Partial<Order>) => {
        updateOrder.mutate({ id: order.id, data: updates }, {
            onSuccess: () => {
                setIsEditOrderOpen(false);
                setEditAdvance("");
                setEditExpense({ description: "", cost: "" });
            }
        });
    };

    const handleAddEditExpense = () => {
        if (!selectedOrder || !editExpense.description || !editExpense.cost) return;

        const newExpenses = [
            ...(selectedOrder.expenses || []),
            {
                description: editExpense.description,
                cost: Number(editExpense.cost),
                date: new Date().toISOString()
            }
        ];

        const totalCost = newExpenses.reduce((sum, e) => sum + e.cost, 0);
        const profit = Number(selectedOrder.totalPrice) - totalCost;

        handleUpdateOrder(selectedOrder, {
            expenses: newExpenses,
            totalCost: totalCost.toString(),
            profit: profit.toString()
        });
    };

    const handleAddAdvance = () => {
        if (!selectedOrder || !editAdvance) return;

        const newTotalAdvance = (Number(selectedOrder.advancePayment) + Number(editAdvance)).toString();

        handleUpdateOrder(selectedOrder, {
            advancePayment: newTotalAdvance
        });
    };

    const getClientName = (id: number) => clients?.find((c: Client) => c.id === id)?.name || "---";

    const statusColors: Record<string, string> = {
        "Nouvelle": "bg-blue-500/10 text-blue-500 border-blue-500/20",
        "En cours": "bg-amber-500/10 text-amber-500 border-amber-500/20",
        "Terminée": "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
        "Livrée": "bg-purple-500/10 text-purple-500 border-purple-500/20",
        "Annulée": "bg-red-500/10 text-red-500 border-red-500/20",
    };

    return (
        <div className="p-6 space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight text-foreground flex items-center gap-3">
                        <span className="p-2 bg-primary/10 rounded-xl">
                            <ClipboardList className="h-8 w-8 text-primary" />
                        </span>
                        {t("common.orders")}
                    </h1>
                    <p className="text-muted-foreground mt-2 text-lg">
                        {isRTL ? "متابعة تطور و تكاليف طلبات الخياطة" : "Suivi de l'avancement et des coûts de vos commandes."}
                    </p>
                </div>

                <Drawer.Root open={isNewOrderOpen} onOpenChange={setIsNewOrderOpen}>
                    <Drawer.Trigger asChild>
                        <Button size="lg" className="hover-elevate shadow-lg gap-2 text-lg h-14 px-8 rounded-2xl transition-all hover:scale-105 active:scale-95">
                            <Plus className="h-6 w-6" />
                            {isRTL ? "طلب جديد" : "Nouvelle commande"}
                        </Button>
                    </Drawer.Trigger>
                    <Drawer.Portal>
                        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-50" />
                        <Drawer.Content className={cn(
                            "bg-background flex flex-col rounded-t-[32px] h-[90%] mt-24 fixed bottom-0 left-0 right-0 z-50 outline-none border-t-4 border-primary/20",
                            isRTL && "font-arabic"
                        )}>
                            <div className="p-6 bg-background rounded-t-[32px] flex-1 overflow-y-auto">
                                <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-muted mb-8" />
                                <div className="max-w-2xl mx-auto">
                                    <Drawer.Title className="text-3xl font-bold mb-2 flex items-center gap-3">
                                        <Plus className="h-8 w-8 text-primary" />
                                        {isRTL ? "إنشاء طلب جديد" : "Créer une nouvelle commande"}
                                    </Drawer.Title>
                                    <Drawer.Description className="text-muted-foreground mb-8 text-lg">
                                        {isRTL ? "أدخل معلومات الطلب الجديد هنا." : "Saisissez les informations de la nouvelle commande."}
                                    </Drawer.Description>

                                    <div className="space-y-8">
                                        <div className="space-y-4 bg-muted/30 p-4 rounded-2xl border border-border/50">
                                            <h3 className="text-lg font-bold flex items-center gap-2">
                                                <span className="bg-primary/10 p-1.5 rounded-lg text-primary"><UserPlus className="h-4 w-4" /></span>
                                                {t("common.clients")}
                                            </h3>
                                            <Select onValueChange={(val) => setNewOrder(prev => ({ ...prev, clientId: Number(val) }))}>
                                                <SelectTrigger className="h-14 rounded-xl border-2 bg-background">
                                                    <SelectValue placeholder={t("common.search")} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {clients?.map((c: Client) => (
                                                        <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-4 bg-muted/30 p-4 rounded-2xl border border-border/50">
                                                <h3 className="text-lg font-bold flex items-center gap-2">
                                                    <span className="bg-primary/10 p-1.5 rounded-lg text-primary"><Scissors className="h-4 w-4" /></span>
                                                    {isRTL ? "تفاصيل الطلب" : "Détails de la commande"}
                                                </h3>
                                                <div className="space-y-4">
                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-semibold">{isRTL ? "نوع اللباس" : "Type d'habit"}</Label>
                                                        <Select
                                                            defaultValue="Caftan"
                                                            onValueChange={(val: any) => setNewOrder(prev => ({ ...prev, garmentType: val }))}
                                                        >
                                                            <SelectTrigger className="h-12 rounded-xl border-2 bg-background">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {garmentTypes.map(type => (
                                                                    <SelectItem key={type} value={type}>{t(`garments.${type}`)}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-semibold">{isRTL ? "تاريخ التسليم" : "Date prévue"}</Label>
                                                        <Input
                                                            type="date"
                                                            className="h-12 rounded-xl border-2 bg-background"
                                                            onChange={(e) => setNewOrder(prev => ({ ...prev, dueDate: new Date(e.target.value).toISOString() }))}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-4 bg-muted/30 p-4 rounded-2xl border border-border/50">
                                                <h3 className="text-lg font-bold flex items-center gap-2">
                                                    <span className="bg-primary/10 p-1.5 rounded-lg text-primary"><Wallet className="h-4 w-4" /></span>
                                                    {isRTL ? "التكلفة والدفع" : "Coûts et Paiement"}
                                                </h3>
                                                <div className="space-y-4">
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <Label className="text-sm font-semibold">{t("common.price")}</Label>
                                                            <div className="relative">
                                                                <Input
                                                                    type="number"
                                                                    className="h-12 rounded-xl border-2 bg-background pr-8"
                                                                    value={newOrder.totalPrice}
                                                                    onChange={(e) => setNewOrder(prev => ({ ...prev, totalPrice: e.target.value }))}
                                                                />
                                                                <span className="absolute rt-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-bold right-3">DH</span>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label className="text-sm font-semibold">{isRTL ? "تسبيق" : "Avance"}</Label>
                                                            <div className="relative">
                                                                <Input
                                                                    type="number"
                                                                    className="h-12 rounded-xl border-2 bg-background pr-8"
                                                                    value={newOrder.advancePayment}
                                                                    onChange={(e) => setNewOrder(prev => ({ ...prev, advancePayment: e.target.value }))}
                                                                />
                                                                <span className="absolute rt-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-bold right-3">DH</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-between items-center p-3 bg-background rounded-xl border border-border">
                                                        <span className="text-sm font-medium text-muted-foreground">{t("common.cost")}</span>
                                                        <span className="text-lg font-bold">{newOrder.totalCost} <span className="text-xs font-normal">DH</span></span>
                                                    </div>
                                                    <div className="flex justify-between items-center p-3 bg-primary/5 rounded-xl border border-primary/20">
                                                        <span className="text-sm font-medium text-primary">{t("common.profit")}</span>
                                                        <span className="text-lg font-bold text-primary">
                                                            {(Number(newOrder.totalPrice) - Number(newOrder.totalCost)).toFixed(2)} <span className="text-xs font-normal">DH</span>
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4 bg-muted/30 p-4 rounded-2xl border border-border/50">
                                            <h3 className="text-lg font-bold flex items-center gap-2">
                                                <span className="bg-primary/10 p-1.5 rounded-lg text-primary"><ShoppingBag className="h-4 w-4" /></span>
                                                {isRTL ? "المصاريف (سلعة، خياطة...)" : "Dépenses (Fournitures, Couture...)"}
                                            </h3>

                                            <div className="flex gap-2">
                                                <Input
                                                    placeholder={isRTL ? "الوصف (مثال: ثوب)" : "Description (ex: Tissu)"}
                                                    className="flex-[2] h-12 rounded-xl border-2 bg-background"
                                                    value={newExpense.description}
                                                    onChange={(e) => setNewExpense(prev => ({ ...prev, description: e.target.value }))}
                                                />
                                                <Input
                                                    type="number"
                                                    placeholder={isRTL ? "الثمن" : "Prix"}
                                                    className="flex-1 h-12 rounded-xl border-2 bg-background"
                                                    value={newExpense.cost}
                                                    onChange={(e) => setNewExpense(prev => ({ ...prev, cost: e.target.value }))}
                                                />
                                                <Button onClick={handleAddExpense} size="icon" className="h-12 w-12 rounded-xl bg-primary hover:bg-primary/90">
                                                    <Plus className="h-5 w-5" />
                                                </Button>
                                            </div>

                                            {newOrder.expenses.length > 0 && (
                                                <div className="space-y-2 mt-4">
                                                    {newOrder.expenses.map((expense, idx) => (
                                                        <div key={idx} className="flex items-center justify-between p-3 bg-background rounded-xl border border-border animate-in fade-in slide-in-from-top-2">
                                                            <div className="flex items-center gap-3">
                                                                <div className="h-8 w-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500 font-bold text-xs">
                                                                    {idx + 1}
                                                                </div>
                                                                <span className="font-medium text-sm">{expense.description}</span>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <span className="font-bold text-sm">{expense.cost} DH</span>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-lg"
                                                                    onClick={() => handleRemoveExpense(idx)}
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    <div className="flex justify-end pt-2 border-t border-dashed border-border mt-2">
                                                        <span className="text-sm font-medium text-muted-foreground mr-2">{isRTL ? "المجموع:" : "Total:"}</span>
                                                        <span className="text-sm font-bold">{newOrder.expenses.reduce((s, e) => s + e.cost, 0)} DH</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex gap-4 pt-6 sticky bottom-0 bg-background/95 backdrop-blur py-4 border-t mt-auto">
                                            <Button
                                                size="lg"
                                                className="flex-1 h-14 text-lg rounded-xl shadow-lg hover-elevate transition-all gap-2 bg-primary text-primary-foreground"
                                                onClick={handleCreateOrder}
                                                disabled={createOrder.isPending || !newOrder.clientId || Number(newOrder.totalPrice) <= 0}
                                            >
                                                {createOrder.isPending ? <div className="h-5 w-5 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Save className="h-5 w-5" />}
                                                {t("common.save")}
                                            </Button>
                                            <Drawer.Close asChild>
                                                <Button variant="outline" size="lg" className="h-14 text-lg rounded-xl px-8 border-2">
                                                    {t("common.cancel")}
                                                </Button>
                                            </Drawer.Close>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Drawer.Content>
                    </Drawer.Portal>
                </Drawer.Root>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="rounded-3xl bg-primary shadow-xl border-none text-primary-foreground overflow-hidden relative group">
                    <div className="absolute right-[-20px] top-[-20px] opacity-10 transition-transform group-hover:scale-125 duration-700">
                        <TrendingUp size={200} />
                    </div>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg opacity-80 font-medium">{t("common.profit")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold">12,500 <span className="text-lg font-normal opacity-80">DH</span></div>
                        <p className="text-xs mt-2 opacity-60 font-medium">+15% {isRTL ? "منذ الشهر الماضي" : "depuis le mois dernier"}</p>
                    </CardContent>
                </Card>

                <Card className="rounded-3xl bg-secondary shadow-lg border-2 border-primary/10 overflow-hidden relative group">
                    <div className="absolute right-[-20px] top-[-20px] text-primary/5 opacity-80 group-hover:scale-125 transition-transform duration-700">
                        <Package size={200} />
                    </div>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg font-medium text-muted-foreground">{isRTL ? "قيد التنفيذ" : "En cours"}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold text-foreground">12</div>
                        <p className="text-xs mt-2 text-muted-foreground font-medium">4 {isRTL ? "طلبيات تنتظر الفصالة" : "commandes en attente de coupe"}</p>
                    </CardContent>
                </Card>

                <Card className="rounded-3xl bg-background shadow-lg border-2 border-primary/10 overflow-hidden relative group">
                    <div className="absolute right-[-20px] top-[-20px] text-primary/5 opacity-80 group-hover:scale-125 transition-transform duration-700">
                        <Wallet size={200} />
                    </div>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg font-medium text-muted-foreground">{isRTL ? "مداخيل الطلبات" : "Chiffre d'Affaire"}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold text-foreground">45,800 <span className="text-lg font-normal text-muted-foreground">DH</span></div>
                        <p className="text-xs mt-2 text-muted-foreground font-medium">{isRTL ? "إجمالي قيمة الطلبات النشطة" : "Valeur totale des commandes actives"}</p>
                    </CardContent>
                </Card>
            </div>

            <div className="flex items-center gap-4 border-b pb-4">
                <Button
                    variant={statusFilter === "all" ? "default" : "outline"}
                    onClick={() => setStatusFilter("all")}
                    className="rounded-xl px-6"
                >
                    {isRTL ? "الكل" : "Tout"}
                </Button>
                <Button
                    variant={statusFilter === "ongoing" ? "default" : "outline"}
                    onClick={() => setStatusFilter("ongoing")}
                    className="rounded-xl px-6 gap-2"
                >
                    <Clock className="h-4 w-4" />
                    {isRTL ? "قيد التنفيذ" : "En cours"}
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {isLoading ? (
                    [1, 2, 3].map(i => <div key={i} className="h-32 bg-muted/50 rounded-3xl animate-pulse" />)
                ) : orders?.filter((order: Order) => {
                    if (statusFilter === "ongoing") {
                        return ["Nouvelle", "En cours"].includes(order.status);
                    }
                    return true;
                }).map((order: Order) => (
                    <Card key={order.id} className="group hover-elevate transition-all border-2 hover:border-primary/50 rounded-3xl overflow-hidden bg-card/50 backdrop-blur-sm shadow-sm hover:shadow-xl">
                        <div className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                            <div className="flex items-center gap-6 flex-1 min-w-0">
                                <div className={cn(
                                    "h-16 w-16 rounded-2xl flex items-center justify-center shrink-0 border-2",
                                    "bg-primary/5 text-primary border-primary/20 group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                                )}>
                                    <Package className="h-8 w-8" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h3 className="text-xl font-bold truncate">#{order.id} - {getClientName(order.clientId || 0)}</h3>
                                        <Badge variant="outline" className={cn("rounded-full border px-3 py-0.5 font-bold uppercase text-[10px]", statusColors[order.status])}>
                                            {order.status}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground font-medium">
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-4 w-4 text-primary/60" />
                                            {t(`steps.${order.currentStep}`)}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <History className="h-4 w-4 text-primary/60" />
                                            {t(`garments.${order.garmentType}`)}
                                        </span>
                                        <span className="flex items-center gap-1 hidden md:flex">
                                            <Calendar className="h-4 w-4 text-primary/60" />
                                            {order.dueDate ? new Date(order.dueDate).toLocaleDateString() : "---"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-8 w-full md:w-auto border-t md:border-t-0 md:border-l border-primary/10 pt-4 md:pt-0 md:pl-8">
                                <div className="flex-1 md:flex-none">
                                    <div className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-1">{t("common.price")}</div>
                                    <div className="text-xl font-bold text-foreground">{order.totalPrice} <span className="text-xs font-normal">DH</span></div>
                                </div>
                                <div className="flex-1 md:flex-none">
                                    <div className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-1">{t("common.profit")}</div>
                                    <div className="text-xl font-bold text-emerald-500">{order.profit} <span className="text-xs font-normal">DH</span></div>
                                </div>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="rounded-2xl h-14 w-14 hover:bg-primary/10 border-2 border-transparent hover:border-primary/20 transition-all"
                                    onClick={() => {
                                        setSelectedOrder(order);
                                        setIsEditOrderOpen(true);
                                    }}
                                >
                                    <ChevronRight className={cn("h-6 w-6", isRTL && "rotate-180")} />
                                </Button>
                            </div>
                        </div>
                        <div className="h-1.5 w-full bg-muted/50 overflow-hidden">
                            <div
                                className="h-full bg-primary transition-all duration-1000 shadow-[0_0_10px_rgba(var(--primary),0.5)]"
                                style={{ width: "35%" }}
                            />
                        </div>
                    </Card>
                ))}
            </div>

            {/* Edit Order Drawer */}
            <Drawer.Root open={isEditOrderOpen} onOpenChange={setIsEditOrderOpen}>
                <Drawer.Portal>
                    <Drawer.Overlay className="fixed inset-0 bg-black/40 z-50" />
                    <Drawer.Content className={cn(
                        "bg-background flex flex-col rounded-t-[32px] h-[85%] mt-24 fixed bottom-0 left-0 right-0 z-50 outline-none border-t-4 border-primary/20",
                        isRTL && "font-arabic"
                    )}>
                        <div className="p-6 bg-background rounded-t-[32px] flex-1 overflow-y-auto">
                            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-muted mb-8" />
                            <div className="max-w-2xl mx-auto">
                                <Drawer.Title className="text-3xl font-bold mb-2 flex items-center gap-3">
                                    <TrendingUp className="h-8 w-8 text-primary" />
                                    {isRTL ? `تعديل الطلب #${selectedOrder?.id}` : `Modifier la commande #${selectedOrder?.id}`}
                                </Drawer.Title>
                                <Drawer.Description className="text-muted-foreground mb-8 text-lg">
                                    {isRTL ? "أضف دفعة جديدة أو مصاريف لهذا الطلب." : "Ajoutez une avance ou une dépense pour cette commande."}
                                </Drawer.Description>

                                {selectedOrder && (
                                    <div className="space-y-8">
                                        {/* Advance Payment Update */}
                                        <div className="space-y-4 bg-muted/30 p-6 rounded-2xl border border-border/50 shadow-inner">
                                            <h3 className="text-xl font-bold flex items-center gap-2">
                                                <span className="bg-emerald-500/10 p-1.5 rounded-lg text-emerald-500"><Wallet className="h-5 w-5" /></span>
                                                {isRTL ? "إضافة تسبيق (دفعة)" : "Ajouter un acompte"}
                                            </h3>
                                            <div className="flex justify-between items-center text-sm font-medium p-3 bg-background rounded-xl border border-border mb-2">
                                                <span className="text-muted-foreground">{isRTL ? "التسبيق الحالي:" : "Avance actuelle:"}</span>
                                                <span className="font-bold text-lg text-emerald-600">{selectedOrder.advancePayment} DH</span>
                                            </div>
                                            <div className="flex gap-3">
                                                <div className="relative flex-1">
                                                    <Input
                                                        type="number"
                                                        placeholder={isRTL ? "المبلغ المضاف" : "Montant à ajouter"}
                                                        className="h-14 rounded-xl border-2 bg-background pr-12 text-lg"
                                                        value={editAdvance}
                                                        onChange={(e) => setEditAdvance(e.target.value)}
                                                    />
                                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">DH</span>
                                                </div>
                                                <Button
                                                    onClick={handleAddAdvance}
                                                    className="h-14 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-6 gap-2"
                                                    disabled={!editAdvance || Number(editAdvance) <= 0 || updateOrder.isPending}
                                                >
                                                    <Plus className="h-5 w-5" />
                                                    {isRTL ? "إضافة" : "Ajouter"}
                                                </Button>
                                            </div>
                                            <div className="flex justify-between items-center text-sm p-3 bg-primary/5 rounded-xl border border-primary/10">
                                                <span className="text-primary font-medium">{isRTL ? "الباقي استخلاصه:" : "Reste à payer:"}</span>
                                                <span className="font-bold text-lg text-primary">
                                                    {(Number(selectedOrder.totalPrice) - Number(selectedOrder.advancePayment)).toFixed(2)} DH
                                                </span>
                                            </div>
                                        </div>

                                        {/* Expenses Update */}
                                        <div className="space-y-4 bg-muted/30 p-6 rounded-2xl border border-border/50 shadow-inner">
                                            <h3 className="text-xl font-bold flex items-center gap-2">
                                                <span className="bg-orange-500/10 p-1.5 rounded-lg text-orange-500"><ShoppingBag className="h-5 w-5" /></span>
                                                {isRTL ? "إضافة مصاريف" : "Nouvelle dépense"}
                                            </h3>
                                            <div className="space-y-3">
                                                <Input
                                                    placeholder={isRTL ? "الوصف" : "Description"}
                                                    className="h-12 rounded-xl border-2 bg-background"
                                                    value={editExpense.description}
                                                    onChange={(e) => setEditExpense(prev => ({ ...prev, description: e.target.value }))}
                                                />
                                                <div className="flex gap-3">
                                                    <div className="relative flex-1">
                                                        <Input
                                                            type="number"
                                                            placeholder={isRTL ? "المبلغ" : "Montant"}
                                                            className="h-12 rounded-xl border-2 bg-background pr-12"
                                                            value={editExpense.cost}
                                                            onChange={(e) => setEditExpense(prev => ({ ...prev, cost: e.target.value }))}
                                                        />
                                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-sm">DH</span>
                                                    </div>
                                                    <Button
                                                        onClick={handleAddEditExpense}
                                                        className="rounded-xl px-6 bg-orange-600 hover:bg-orange-700 h-12"
                                                        disabled={!editExpense.description || !editExpense.cost || updateOrder.isPending}
                                                    >
                                                        {isRTL ? "تسجيل" : "Enregistrer"}
                                                    </Button>
                                                </div>
                                            </div>

                                            {selectedOrder.expenses && selectedOrder.expenses.length > 0 && (
                                                <div className="space-y-2 pt-4">
                                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{isRTL ? "لائحة المصاريف:" : "Liste des dépenses :"}</p>
                                                    {selectedOrder.expenses.map((exp: any, idx: number) => (
                                                        <div key={idx} className="flex justify-between items-center p-3 bg-background rounded-xl border border-border text-sm">
                                                            <div className="flex flex-col">
                                                                <span className="font-bold">{exp.description}</span>
                                                                <span className="text-[10px] text-muted-foreground">{new Date(exp.date).toLocaleDateString()}</span>
                                                            </div>
                                                            <span className="font-bold text-orange-600">-{exp.cost} DH</span>
                                                        </div>
                                                    ))}
                                                    <div className="flex justify-between items-center p-3 bg-orange-500/5 rounded-xl border border-orange-500/10 mt-2">
                                                        <span className="text-muted-foreground font-medium text-xs">{isRTL ? "إجمالي المصاريف:" : "Total dépenses:"}</span>
                                                        <span className="font-bold text-orange-700">{selectedOrder.totalCost} DH</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="pt-6">
                                            <Drawer.Close asChild>
                                                <Button variant="outline" size="lg" className="w-full h-14 text-lg rounded-xl px-8 border-2">
                                                    {isRTL ? "إغلاق" : "Fermer"}
                                                </Button>
                                            </Drawer.Close>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Drawer.Content>
                </Drawer.Portal>
            </Drawer.Root>
        </div>
    );
}
