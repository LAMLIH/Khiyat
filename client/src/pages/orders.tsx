import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
    ClipboardList,
    History,
    TrendingUp,
    Wallet,
    Check,
    ChevronsUpDown,
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
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const ORDER_STEPS = ["Fsalla", "Terwam", "Khiata", "Finition", "Mslouh", "Prete"] as const;
type OrderStep = typeof ORDER_STEPS[number];

export default function OrdersPage() {
    const { t } = useTranslation();
    const { isRTL } = useLanguage();
    const { orders, isLoading, createOrder, updateOrder } = useOrders();
    const { clients } = useClients();

    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isEditOrderOpen, setIsEditOrderOpen] = useState(false);
    const [editAdvance, setEditAdvance] = useState("");
    const [editExpense, setEditExpense] = useState({ description: "", cost: "", step: "" });

    const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
    const [newOrder, setNewOrder] = useState({
        clientId: 0,
        garmentType: "Caftan" as typeof garmentTypes[number],
        totalPrice: "0",
        totalCost: "0",
        advancePayment: "0",
        dueDate: new Date().toISOString(),
        expenses: [] as Array<{ description: string; cost: number; date: string; step?: string }>,
        currentStep: "Fsalla"
    });

    const [statusFilter, setStatusFilter] = useState<"all" | "ongoing">("ongoing");
    const [isClientSearchOpen, setIsClientSearchOpen] = useState(false);

    const [newExpense, setNewExpense] = useState({ description: "", cost: "", step: "" });

    const calculateCurrentStep = (expenses: { step?: string }[]) => {
        const taggedSteps = expenses
            .map(e => e.step)
            .filter((s): s is OrderStep => !!s && ORDER_STEPS.includes(s as OrderStep));

        if (taggedSteps.length === 0) return "Fsalla";

        // Find the index of the furthest step logged in expenses
        const indices = taggedSteps.map(s => ORDER_STEPS.indexOf(s));
        const maxIndex = Math.max(...indices);
        return ORDER_STEPS[maxIndex];
    };

    const handleAddExpense = () => {
        if (!newExpense.description || !newExpense.cost) return;
        const expense = {
            description: newExpense.description,
            cost: Number(newExpense.cost),
            date: new Date().toISOString(),
            step: newExpense.step || undefined,
        };
        setNewOrder(prev => {
            const updatedExpenses = [...prev.expenses, expense];
            const expensesTotal = updatedExpenses.reduce((sum, e) => sum + e.cost, 0);
            return {
                ...prev,
                expenses: updatedExpenses,
                totalCost: expensesTotal.toString(),
                currentStep: calculateCurrentStep(updatedExpenses)
            };
        });
        setNewExpense({ description: "", cost: "", step: "" });
    };

    const handleRemoveExpense = (index: number) => {
        setNewOrder(prev => {
            const updatedExpenses = prev.expenses.filter((_, i) => i !== index);
            const expensesTotal = updatedExpenses.reduce((sum, e) => sum + e.cost, 0);
            return {
                ...prev,
                expenses: updatedExpenses,
                totalCost: expensesTotal.toString(),
                currentStep: calculateCurrentStep(updatedExpenses)
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
                    expenses: [] as any[],
                    currentStep: "Fsalla"
                } as any);
            }
        });
    };

    const handleUpdateOrder = (order: Order, updates: Partial<Order>) => {
        updateOrder.mutate({ id: order.id, data: updates }, {
            onSuccess: () => {
                // Keep the drawer open for sequential updates if needed, 
                // but reset temporary edit states
                setEditAdvance("");
                setEditExpense({ description: "", cost: "", step: "" });
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
                date: new Date().toISOString(),
                step: editExpense.step || undefined
            }
        ];

        const totalCost = newExpenses.reduce((sum, e) => sum + e.cost, 0);
        const profit = Number(selectedOrder.totalPrice) - totalCost;
        const derivedStep = calculateCurrentStep(newExpenses);

        handleUpdateOrder(selectedOrder, {
            expenses: newExpenses,
            totalCost: totalCost.toString(),
            profit: profit.toString(),
            currentStep: derivedStep,
            status: derivedStep === "Prete" ? "Terminée" : "En cours"
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
        <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500 bg-background min-h-screen border-none">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground flex items-center gap-3">
                        <ClipboardList className="h-6 w-6 md:h-8 md:w-8 text-muted-foreground/50" />
                        {t("common.orders")}
                    </h1>
                    <p className="text-muted-foreground mt-1 text-base md:text-lg">
                        {isRTL ? "متابعة تطور و تكاليف طلبات الخياطة" : "Suivi de l'avancement et des coûts de vos commandes."}
                    </p>
                </div>

                <Drawer.Root open={isNewOrderOpen} onOpenChange={setIsNewOrderOpen}>
                    <Drawer.Trigger asChild>
                        <Button size="lg" className="hover-elevate shadow-sm gap-2 text-[15px] h-14 px-6 md:px-8 rounded-full transition-all hover:scale-105 active:scale-95 bg-primary font-bold">
                            <Plus className="h-5 w-5 md:h-6 md:w-6" />
                            {isRTL ? "طلب جديد" : "Nouvelle commande"}
                        </Button>
                    </Drawer.Trigger>
                    <Drawer.Portal>
                        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-50" />
                        <Drawer.Content className={cn(
                            "bg-background flex flex-col rounded-t-[32px] h-[90%] mt-24 fixed bottom-0 left-0 right-0 z-50 outline-none border-t border-border",
                            isRTL && "font-arabic"
                        )}>
                            <div className="p-6 bg-card rounded-t-[32px] flex-1 overflow-y-auto">
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
                                        <div className="premium-form-section flex flex-col gap-4 p-6 bg-card rounded-2xl border border-border shadow-sm transition-all">
                                            <h3 className="text-xl font-lalezar flex items-center gap-2 text-primary">
                                                <UserPlus className="h-6 w-6" />
                                                {t("common.clients")}
                                            </h3>
                                            <Popover open={isClientSearchOpen} onOpenChange={setIsClientSearchOpen}>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        role="combobox"
                                                        className={cn(
                                                            "h-14 w-full justify-between rounded-xl border-2 bg-background font-bold text-lg shadow-sm focus:ring-primary/20",
                                                            !newOrder.clientId && "text-muted-foreground"
                                                        )}
                                                    >
                                                        {newOrder.clientId
                                                            ? clients?.find((c) => c.id === newOrder.clientId)?.name
                                                            : (isRTL ? "البحث عن زبون..." : "Rechercher un client...")}
                                                        <ChevronsUpDown className="ml-2 h-5 w-5 shrink-0 opacity-50" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                                                    <Command>
                                                        <CommandInput placeholder={isRTL ? "بحث..." : "Rechercher..."} className="h-12" />
                                                        <CommandList>
                                                            <CommandEmpty>{isRTL ? "لم يتم العثور على أي زبون." : "Aucun client trouvé."}</CommandEmpty>
                                                            <CommandGroup>
                                                                {clients?.map((client) => (
                                                                    <CommandItem
                                                                        key={client.id}
                                                                        value={client.name}
                                                                        onSelect={() => {
                                                                            setNewOrder(prev => ({ ...prev, clientId: client.id }));
                                                                            setIsClientSearchOpen(false);
                                                                        }}
                                                                        className="h-12 text-base font-bold"
                                                                    >
                                                                        <Check
                                                                            className={cn(
                                                                                "mr-2 h-4 w-4",
                                                                                newOrder.clientId === client.id ? "opacity-100" : "opacity-0"
                                                                            )}
                                                                        />
                                                                        {client.name}
                                                                    </CommandItem>
                                                                ))}
                                                            </CommandGroup>
                                                        </CommandList>
                                                    </Command>
                                                </PopoverContent>
                                            </Popover>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="premium-form-section flex flex-col gap-4">
                                                <h3 className="text-xl font-lalezar flex items-center gap-2 text-primary">
                                                    <Scissors className="h-6 w-6" />
                                                    {isRTL ? "تفاصيل الطلب" : "Détails de la commande"}
                                                </h3>
                                                <div className="space-y-6">
                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-bold text-foreground/80">{isRTL ? "نوع اللباس" : "Type d'habit"}</Label>
                                                        <Select
                                                            defaultValue="Caftan"
                                                            onValueChange={(val: any) => setNewOrder(prev => ({ ...prev, garmentType: val }))}
                                                        >
                                                            <SelectTrigger className="h-14 rounded-xl border-2 bg-background font-medium">
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
                                                        <Label className="text-sm font-bold text-foreground/80">{isRTL ? "تاريخ التسليم" : "Date prévue"}</Label>
                                                        <Input
                                                            type="date"
                                                            onChange={(e) => setNewOrder(prev => ({ ...prev, dueDate: new Date(e.target.value).toISOString() }))}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="premium-form-section flex flex-col gap-4">
                                                <h3 className="text-xl font-lalezar flex items-center gap-2 text-primary">
                                                    <Wallet className="h-6 w-6" />
                                                    {isRTL ? "التكلفة والدفع" : "Coûts et Paiement"}
                                                </h3>
                                                <div className="space-y-6">
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <Label className="text-sm font-bold text-foreground/80">{t("common.price")}</Label>
                                                            <div className="relative group">
                                                                <Input
                                                                    type="number"
                                                                    className="pr-12 font-bold text-lg"
                                                                    value={newOrder.totalPrice}
                                                                    onChange={(e) => setNewOrder(prev => ({ ...prev, totalPrice: e.target.value }))}
                                                                />
                                                                <span className={cn("absolute top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-bold", isRTL ? "left-4" : "right-4")}>DH</span>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label className="text-sm font-bold text-foreground/80">{isRTL ? "تسبيق" : "Avance"}</Label>
                                                            <div className="relative group">
                                                                <Input
                                                                    type="number"
                                                                    className="pr-12 font-bold text-lg"
                                                                    value={newOrder.advancePayment}
                                                                    onChange={(e) => setNewOrder(prev => ({ ...prev, advancePayment: e.target.value }))}
                                                                />
                                                                <span className={cn("absolute top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-bold", isRTL ? "left-4" : "right-4")}>DH</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-between items-center p-4 bg-muted/10 rounded-xl border border-border">
                                                        <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">{t("common.cost")}</span>
                                                        <span className="text-2xl font-lalezar text-foreground">{newOrder.totalCost} <span className="text-xs font-sans font-bold text-muted-foreground/60">DH</span></span>
                                                    </div>
                                                    <div className="flex justify-between items-center p-4 bg-primary/10 rounded-xl border border-primary/20 shadow-sm">
                                                        <span className="text-sm font-bold text-primary uppercase tracking-widest">{t("common.profit")}</span>
                                                        <span className="text-2xl font-lalezar text-primary">
                                                            {(Number(newOrder.totalPrice) - Number(newOrder.totalCost)).toFixed(2)} <span className="text-xs font-sans font-bold text-primary/60">DH</span>
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="premium-form-section flex flex-col gap-6">
                                            <h3 className="text-xl font-lalezar flex items-center gap-2 text-primary">
                                                <ShoppingBag className="h-6 w-6" />
                                                {isRTL ? "المصاريف (سلعة، خياطة...)" : "Dépenses (Fournitures, Couture...)"}
                                            </h3>

                                            <div className="flex flex-col md:flex-row gap-3">
                                                <Input
                                                    placeholder={isRTL ? "الوصف (مثال: ثوب)" : "Description (ex: Tissu)"}
                                                    className="flex-[2]"
                                                    value={newExpense.description}
                                                    onChange={(e) => setNewExpense(prev => ({ ...prev, description: e.target.value }))}
                                                />
                                                <div className="flex flex-1 gap-2">
                                                    <Select
                                                        value={newExpense.step}
                                                        onValueChange={(val) => setNewExpense(prev => ({ ...prev, step: val }))}
                                                    >
                                                        <SelectTrigger className="flex-1 min-w-[120px]">
                                                            <SelectValue placeholder={isRTL ? "المرحلة" : "Étape"} />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="none">{isRTL ? "عام" : "Général"}</SelectItem>
                                                            {ORDER_STEPS.map(step => (
                                                                <SelectItem key={step} value={step}>{t(`steps.${step}`)}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <div className="relative flex-1">
                                                        <Input
                                                            type="number"
                                                            placeholder={isRTL ? "الثمن" : "Prix"}
                                                            className="pr-10"
                                                            value={newExpense.cost}
                                                            onChange={(e) => setNewExpense(prev => ({ ...prev, cost: e.target.value }))}
                                                        />
                                                        <span className={cn("absolute top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-bold", isRTL ? "left-3" : "right-3")}>DH</span>
                                                    </div>
                                                    <Button onClick={handleAddExpense} size="icon" className="h-10 w-10 shrink-0 rounded-xl bg-primary hover:bg-primary/90 shadow-md">
                                                        <Plus className="h-6 w-6" />
                                                    </Button>
                                                </div>
                                            </div>

                                            {newOrder.expenses.length > 0 && (
                                                <div className="space-y-3">
                                                    {(newOrder.expenses as any[]).map((expense, idx) => (
                                                        <div key={idx} className="flex items-center justify-between p-4 bg-card rounded-xl border border-border transition-all hover:bg-muted/10 group animate-in fade-in slide-in-from-top-2">
                                                            <div className="flex items-center gap-4">
                                                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                                                                    {idx + 1}
                                                                </div>
                                                                <div className="flex flex-col">
                                                                    <span className="font-bold text-foreground/80">{expense.description}</span>
                                                                    {expense.step && expense.step !== "none" && (
                                                                        <span className="text-[10px] text-primary font-bold uppercase">{t(`steps.${expense.step}`)}</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-4">
                                                                <span className="font-lalezar text-xl text-foreground">{expense.cost} <span className="text-xs font-sans font-bold text-muted-foreground/60">DH</span></span>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-10 w-10 text-destructive/60 hover:text-destructive hover:bg-destructive/10 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                                                                    onClick={() => handleRemoveExpense(idx)}
                                                                >
                                                                    <Trash2 className="h-5 w-5" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    <div className="flex justify-end pt-4 border-t border-dashed border-border mt-2">
                                                        <span className="text-sm font-bold text-muted-foreground mr-2">{isRTL ? "المجموع:" : "Total:"}</span>
                                                        <span className="text-lg font-lalezar text-foreground">{newOrder.expenses.reduce((s, e) => s + e.cost, 0)} DH</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex gap-4 pt-6 sticky bottom-0 bg-background/80 backdrop-blur-md py-4 border-t mt-auto">
                                            <Button
                                                size="lg"
                                                className="flex-1 h-14 text-lg rounded-sm shadow-sm hover-elevate transition-all gap-2 bg-primary text-primary-foreground"
                                                onClick={handleCreateOrder}
                                                disabled={createOrder.isPending || !newOrder.clientId || Number(newOrder.totalPrice) <= 0}
                                            >
                                                {createOrder.isPending ? <div className="h-5 w-5 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Save className="h-5 w-5" />}
                                                {t("common.save")}
                                            </Button>
                                            <Drawer.Close asChild>
                                                <Button variant="outline" size="lg" className="h-14 text-lg rounded-sm px-8 border-2">
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {t("common.profit")}
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">12,500 DH</div>
                        <p className="text-xs text-muted-foreground">+15% {isRTL ? "منذ الشهر الماضي" : "depuis le mois dernier"}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {isRTL ? "قيد التنفيذ" : "En cours"}
                        </CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">12</div>
                        <p className="text-xs text-muted-foreground">4 {isRTL ? "طلبيات تنتظر الفصالة" : "commandes en attente de coupe"}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {isRTL ? "مداخيل الطلبات" : "Chiffre d'Affaire"}
                        </CardTitle>
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">45,800 DH</div>
                        <p className="text-xs text-muted-foreground">{isRTL ? "إجمالي قيمة الطلبات النشطة" : "Valeur totale des commandes actives"}</p>
                    </CardContent>
                </Card>
            </div>

            <div className="flex items-center gap-4 pb-4">
                <Button
                    variant={statusFilter === "all" ? "default" : "outline"}
                    onClick={() => setStatusFilter("all")}
                    className="rounded-xl px-6 border-none shadow-none"
                >
                    {isRTL ? "الكل" : "Tout"}
                </Button>
                <Button
                    variant={statusFilter === "ongoing" ? "default" : "outline"}
                    onClick={() => setStatusFilter("ongoing")}
                    className="rounded-xl px-6 gap-2 border-none shadow-none"
                >
                    <Clock className="h-4 w-4" />
                    {isRTL ? "قيد التنفيذ" : "En cours"}
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {isLoading ? (
                    [1, 2, 3].map(i => <div key={i} className="h-32 bg-muted/50 rounded-sm animate-pulse" />)
                ) : orders?.filter((order: Order) => {
                    if (statusFilter === "ongoing") {
                        return ["Nouvelle", "En cours"].includes(order.status);
                    }
                    return true;
                }).map((order: Order) => (
                    <Card key={order.id} className="group hover-elevate transition-all border border-border bg-card overflow-hidden">
                        <div className="p-4 md:p-6 pb-0 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                            <div className="flex items-center gap-4 md:gap-6 flex-1 min-w-0">
                                <div className={cn(
                                    "h-14 w-14 md:h-16 md:w-16 rounded-md flex items-center justify-center shrink-0 border border-border/50",
                                    "bg-primary/5 text-primary group-hover:bg-primary/10 transition-colors"
                                )}>
                                    <Package className="h-6 w-6 md:h-8 md:w-8" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h3 className="text-lg md:text-xl font-bold truncate text-foreground">#{order.id} - {getClientName(order.clientId || 0)}</h3>
                                        <Badge variant="outline" className={cn("rounded-md font-medium text-xs border bg-background", statusColors[order.status])}>
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

                            <div className="flex items-center justify-between md:justify-end gap-4 md:gap-8 w-full md:w-auto border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-8 mt-2 md:mt-0">
                                <div className="flex-1 md:flex-none">
                                    <div className="text-[10px] md:text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">{t("common.price")}</div>
                                    <div className="text-lg md:text-xl font-bold text-foreground">{order.totalPrice} <span className="text-xs font-normal">DH</span></div>
                                </div>
                                <div className="flex-1 md:flex-none">
                                    <div className="text-[10px] md:text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">{t("common.profit")}</div>
                                    <div className="text-lg md:text-xl font-bold text-primary">{order.profit} <span className="text-xs font-normal">DH</span></div>
                                </div>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-10 w-10 shrink-0"
                                    onClick={() => {
                                        setSelectedOrder(order);
                                        setIsEditOrderOpen(true);
                                    }}
                                >
                                    <ChevronRight className={cn("h-5 w-5 md:h-6 md:w-6", isRTL && "rotate-180")} />
                                </Button>
                            </div>
                        </div>
                        <div className="h-1.5 w-full bg-muted/50 overflow-hidden">
                            <div
                                className="h-full bg-primary transition-all duration-1000 shadow-[0_0_10px_rgba(var(--primary),0.5)]"
                                style={{ width: `${((ORDER_STEPS.indexOf(order.currentStep as any) + 1) / ORDER_STEPS.length) * 100}%` }}
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
                        "bg-card flex flex-col rounded-t-[32px] h-[85%] mt-24 fixed bottom-0 left-0 right-0 z-50 outline-none border-t border-border",
                        isRTL && "font-arabic"
                    )}>
                        <div className="p-6 bg-card rounded-t-[32px] flex-1 overflow-y-auto">
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
                                    <div className="space-y-8 pb-10">
                                        {/* Production Pipeline */}
                                        <div className="premium-form-section flex flex-col gap-6 p-6 bg-card rounded-2xl border border-border shadow-sm transition-all">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-xl font-lalezar flex items-center gap-2 text-primary">
                                                    <Scissors className="h-6 w-6" />
                                                    {isRTL ? "مراحل الإنتاج" : "Pipeline de Production"}
                                                </h3>
                                                <Badge variant="outline" className="font-bold border-primary/20 text-primary bg-primary/10 dark:bg-primary/20">
                                                    {t(`steps.${selectedOrder.currentStep}`)}
                                                </Badge>
                                            </div>

                                            <div className="relative flex justify-between items-center px-2">
                                                <div className="absolute left-0 right-0 h-1 bg-border top-1/2 -translate-y-1/2 z-0" />
                                                <div
                                                    className="absolute left-0 h-1 bg-primary top-1/2 -translate-y-1/2 z-0 transition-all duration-500"
                                                    style={{ width: `${(ORDER_STEPS.indexOf(selectedOrder.currentStep as any) / (ORDER_STEPS.length - 1)) * 100}%` }}
                                                />
                                                {ORDER_STEPS.map((step, idx) => {
                                                    const isReached = ORDER_STEPS.indexOf(selectedOrder.currentStep as any) >= idx;
                                                    const isCurrent = selectedOrder.currentStep === step;
                                                    return (
                                                        <div key={step} className="relative z-10 flex flex-col items-center gap-2">
                                                            <div className={cn(
                                                                "h-8 w-8 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                                                                isReached ? "bg-primary border-primary text-white" : "bg-background border-border text-muted-foreground",
                                                                isCurrent && "scale-125 shadow-lg shadow-primary/20"
                                                            )}>
                                                                {isReached ? <Check className="h-4 w-4" /> : <span className="text-xs font-bold">{idx + 1}</span>}
                                                            </div>
                                                            <span className={cn(
                                                                "text-[10px] font-bold uppercase tracking-tighter absolute -bottom-6 whitespace-nowrap",
                                                                isReached ? "text-primary" : "text-muted-foreground"
                                                            )}>
                                                                {t(`steps.${step}`)}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                        {/* Advance Payment Update */}
                                        {/* Advance Payment Update */}
                                        <div className="premium-form-section flex flex-col gap-4">
                                            <h3 className="text-xl font-lalezar flex items-center gap-2 text-primary">
                                                <Wallet className="h-6 w-6" />
                                                {isRTL ? "إضافة تسبيق (دفعة)" : "Ajouter un acompte"}
                                            </h3>
                                            <div className="flex justify-between items-center p-4 bg-card rounded-xl border border-border">
                                                <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">{isRTL ? "التسبيق الحالي:" : "Avance actuelle:"}</span>
                                                <span className="text-2xl font-lalezar text-primary">{selectedOrder.advancePayment} <span className="text-xs font-sans font-bold text-muted-foreground/40">DH</span></span>
                                            </div>
                                            <div className="flex gap-3">
                                                <div className="relative flex-1 group">
                                                    <Input
                                                        type="number"
                                                        placeholder={isRTL ? "المبلغ المضاف" : "Montant à ajouter"}
                                                        className="pr-12 font-bold text-lg"
                                                        value={editAdvance}
                                                        onChange={(e) => setEditAdvance(e.target.value)}
                                                    />
                                                    <span className={cn("absolute top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-bold", isRTL ? "left-4" : "right-4")}>DH</span>
                                                </div>
                                                <Button
                                                    onClick={handleAddAdvance}
                                                    className="h-12 rounded-xl bg-primary hover:bg-primary/90 px-8 gap-2 font-bold shadow-md transition-all active:scale-95"
                                                    disabled={!editAdvance || Number(editAdvance) <= 0 || updateOrder.isPending}
                                                >
                                                    <Plus className="h-5 w-5" />
                                                    {isRTL ? "إضافة" : "Ajouter"}
                                                </Button>
                                            </div>
                                            <div className="flex justify-between items-center p-4 bg-primary/10 rounded-xl border border-primary/20 shadow-sm">
                                                <span className="text-sm font-bold text-primary uppercase tracking-widest">{isRTL ? "الباقي استخلاصه:" : "Reste à payer:"}</span>
                                                <span className="text-2xl font-lalezar text-primary">
                                                    {(Number(selectedOrder.totalPrice) - Number(selectedOrder.advancePayment)).toFixed(2)} <span className="text-xs font-sans font-bold text-primary/60">DH</span>
                                                </span>
                                            </div>
                                        </div>

                                        {/* Expenses Update */}
                                        {/* Expenses Update */}
                                        <div className="premium-form-section flex flex-col gap-6">
                                            <h3 className="text-xl font-lalezar flex items-center gap-2 text-primary">
                                                <ShoppingBag className="h-6 w-6" />
                                                {isRTL ? "إضافة مصاريف" : "Nouvelle dépense"}
                                            </h3>
                                            <div className="space-y-4">
                                                <Input
                                                    placeholder={isRTL ? "الوصف" : "Description"}
                                                    value={editExpense.description}
                                                    onChange={(e) => setEditExpense(prev => ({ ...prev, description: e.target.value }))}
                                                />
                                                <div className="flex flex-col md:flex-row gap-3">
                                                    <Select
                                                        value={editExpense.step}
                                                        onValueChange={(val) => setEditExpense(prev => ({ ...prev, step: val }))}
                                                    >
                                                        <SelectTrigger className="flex-1">
                                                            <SelectValue placeholder={isRTL ? "المرحلة" : "Étape"} />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="none">{isRTL ? "عام" : "Général"}</SelectItem>
                                                            {ORDER_STEPS.map(step => (
                                                                <SelectItem key={step} value={step}>{t(`steps.${step}`)}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <div className="relative flex-1 group">
                                                        <Input
                                                            type="number"
                                                            placeholder={isRTL ? "المبلغ" : "Montant"}
                                                            className="pr-12"
                                                            value={editExpense.cost}
                                                            onChange={(e) => setEditExpense(prev => ({ ...prev, cost: e.target.value }))}
                                                        />
                                                        <span className={cn("absolute top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-bold", isRTL ? "left-4" : "right-4")}>DH</span>
                                                    </div>
                                                    <Button
                                                        onClick={handleAddEditExpense}
                                                        className="rounded-xl px-8 bg-primary hover:bg-primary/90 h-10 font-bold shadow-md transition-all active:scale-95"
                                                        disabled={!editExpense.description || !editExpense.cost || updateOrder.isPending}
                                                    >
                                                        {isRTL ? "تسجيل" : "Enregistrer"}
                                                    </Button>
                                                </div>
                                            </div>

                                            {selectedOrder.expenses && selectedOrder.expenses.length > 0 && (
                                                <div className="space-y-3 pt-2">
                                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-2">{isRTL ? "لائحة المصاريف:" : "Liste des dépenses :"}</p>
                                                    {selectedOrder.expenses.map((exp: any, idx: number) => (
                                                        <div key={idx} className="flex justify-between items-center p-4 bg-muted/10 rounded-xl border border-border transition-all hover:border-primary/20">
                                                            <div className="flex flex-col">
                                                                <span className="font-bold text-foreground/80">{exp.description}</span>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-[10px] text-muted-foreground font-medium">{new Date(exp.date).toLocaleDateString()}</span>
                                                                    {exp.step && exp.step !== "none" && (
                                                                        <>
                                                                            <span className="text-[10px] text-muted-foreground">•</span>
                                                                            <span className="text-[10px] text-primary font-bold uppercase">{t(`steps.${exp.step}`)}</span>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <span className="font-lalezar text-xl text-primary">-{exp.cost} DH</span>
                                                        </div>
                                                    ))}
                                                    <div className="flex justify-between items-center p-4 bg-muted/20 rounded-xl border border-border mt-2">
                                                        <span className="text-muted-foreground font-bold text-[10px] uppercase tracking-widest">{isRTL ? "إجمالي المصاريف:" : "Total dépenses:"}</span>
                                                        <span className="font-lalezar text-2xl text-foreground">{selectedOrder.totalCost} DH</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="pt-6">
                                            <Drawer.Close asChild>
                                                <Button variant="outline" size="lg" className="w-full h-14 text-lg rounded-sm px-8 border-2">
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
