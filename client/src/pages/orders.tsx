import { useState, useEffect, useMemo } from "react";
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
    Scissors,
    FileText,
    PartyPopper,
    MoveHorizontal,
    MoveVertical,
    Circle,
    CircleDashed,
    Ruler,
    Watch,
    CircleDot,
    Printer
} from "lucide-react";
import { useOrders } from "@/hooks/use-orders";
import { useClients } from "@/hooks/use-clients";
import { useMeasurements } from "@/hooks/use-measurements";
import { useTenant } from "@/hooks/use-tenant";
import { format } from "date-fns";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { type Client, type Order, garmentTypes } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Drawer } from "vaul";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/contexts/LanguageContext";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DatePicker } from "@/components/ui/date-picker";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useSearch, useLocation } from "wouter";

const ORDER_STEPS = ["Fsalla", "Terwam", "Khiata", "Finition", "Mslouh", "Prete"] as const;
type OrderStep = typeof ORDER_STEPS[number];

export default function OrdersPage() {
    const { t } = useTranslation();
    const { isRTL } = useLanguage();
    const { toast } = useToast();
    const { tenant } = useTenant();
    const { orders, isLoading, createOrder, updateOrder } = useOrders();
    const { clients } = useClients();

    const [newOrder, setNewOrder] = useState({
        clientId: 0,
        garmentType: "Caftan" as typeof garmentTypes[number],
        totalPrice: "0",
        totalCost: "0",
        advancePayment: "0",
        dueDate: new Date().toISOString(),
        notes: "",
        currentStep: "Fsalla"
    });

    const { measurements, createMeasurement } = useMeasurements(newOrder.clientId);
    const [measurementData, setMeasurementData] = useState<Record<string, number>>({});

    // Load measurements when client or garment type changes
    useEffect(() => {
        if (newOrder.clientId && measurements) {
            const last = measurements.find(m => m.garmentType === newOrder.garmentType);
            if (last) {
                setMeasurementData(last.data as Record<string, number>);
            } else {
                setMeasurementData({ shoulders: 0, chest: 0, waist: 0, hips: 0, length: 0, sleeves: 0, wrist: 0, neck: 0 });
            }
        }
    }, [newOrder.clientId, newOrder.garmentType, measurements]);

    const stats = useMemo(() => {
        if (!orders) return { profit: 0, inProgress: 0, revenue: 0, waitingCoupe: 0 };
        
        const inProgressOrders = orders.filter(o => ["Nouvelle", "En cours"].includes(o.status));
        const waitingCoupe = orders.filter(o => o.currentStep === "Fsalla").length;

        return {
            profit: orders.reduce((acc, o) => acc + Number(o.profit || 0), 0),
            inProgress: inProgressOrders.length,
            revenue: orders.reduce((acc, o) => acc + Number(o.totalPrice || 0), 0),
            waitingCoupe
        };
    }, [orders]);

    const [editOrderId, setEditOrderId] = useState<number | null>(null);
    const selectedOrder = orders?.find(o => o.id === editOrderId) || null;
    
    // For local UI state while editing
    const [editAdvance, setEditAdvance] = useState("");
    const [editExpense, setEditExpense] = useState({ description: "", cost: "", step: "" });
    const [localNotes, setLocalNotes] = useState("");
    const [showHistoricalMeasurements, setShowHistoricalMeasurements] = useState(false);
    const [isPrintConfirmOpen, setIsPrintConfirmOpen] = useState(false);

    // Sync localNotes when selectedOrder changes
    useEffect(() => {
        if (selectedOrder) {
            setLocalNotes(selectedOrder.notes || "");
            setShowHistoricalMeasurements(false);
        }
    }, [editOrderId, selectedOrder?.notes]);

    const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);


    const [statusFilter, setStatusFilter] = useState<"all" | "ongoing">("ongoing");
    const [isClientSearchOpen, setIsClientSearchOpen] = useState(false);
    const search = useSearch();
    const [, navigate] = useLocation();

    // Pre-filter by clientId from URL
    const [clientIdFilter, setClientIdFilter] = useState<number | null>(null);
    useEffect(() => {
        const params = new URLSearchParams(search);
        const cid = params.get("clientId");
        if (cid) {
            setClientIdFilter(Number(cid));
            setStatusFilter("all"); // show all statuses when filtering by client
        } else {
            setClientIdFilter(null);
        }
    }, [search]);

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

    const handleCreateOrder = () => {
        const orderData = {
            clientId: Number(newOrder.clientId),
            garmentType: newOrder.garmentType,
            totalPrice: newOrder.totalPrice.toString(),
            totalCost: newOrder.totalCost.toString(),
            advancePayment: newOrder.advancePayment.toString(),
            dueDate: new Date(newOrder.dueDate),
            profit: (Number(newOrder.totalPrice) - Number(newOrder.totalCost)).toString(),
            expenses: [],
            notes: newOrder.notes,
            status: "Nouvelle",
            currentStep: newOrder.currentStep,
            measurements: measurementData,
            productionSteps: []
        };

        if (!orderData.clientId) {
            console.error("Client ID is missing");
            return;
        }

        // Save or update measurements if they exist
        if (Object.keys(measurementData).length > 0) {
            createMeasurement.mutate({
                clientId: orderData.clientId,
                garmentType: orderData.garmentType,
                data: measurementData,
                isLast: true
            });
        }

        createOrder.mutate(orderData, {
            onSuccess: (data: Order) => {
                setIsNewOrderOpen(false);
                setNewOrder({
                    clientId: 0,
                    garmentType: "Caftan",
                    totalPrice: "0",
                    totalCost: "0",
                    advancePayment: "0",
                    dueDate: new Date().toISOString(),
                    notes: "",
                    currentStep: "Fsalla"
                });
                setMeasurementData({});
                
                // Open print confirmation and select the new order
                setEditOrderId(data.id);
                setIsPrintConfirmOpen(true);
                
                toast({
                    title: isRTL ? "تم بنجاح" : "Succès",
                    description: isRTL ? "تم إنشاء الطلب بنجاح" : "Commande créée avec succès."
                });
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

        const amount = Number(editAdvance);
        const newTotalAdvance = (Number(selectedOrder.advancePayment) + amount).toString();
        const newAdvances = [
            ...(selectedOrder.advances || []),
            {
                amount,
                date: new Date().toISOString()
            }
        ];

        handleUpdateOrder(selectedOrder, {
            advancePayment: newTotalAdvance,
            advances: newAdvances
        });
    };

    const handlePrint = () => {
        window.print();
    };

    const getClientName = (id: number | null) => {
        if (!id) return "---";
        return clients?.find((c: Client) => c.id === id)?.name || "---";
    };

    const statusColors: Record<string, string> = {
        "Nouvelle": "bg-blue-500/10 text-blue-500 border-blue-500/20",
        "En cours": "bg-amber-500/10 text-amber-500 border-amber-500/20",
        "Terminée": "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
        "Livrée": "bg-purple-500/10 text-purple-500 border-purple-500/20",
        "Annulée": "bg-red-500/10 text-red-500 border-red-500/20",
    };

    return (
        <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500 bg-background min-h-screen border-none">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-2">
                <div className="w-full md:w-auto">
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground flex items-center gap-3">
                        <ClipboardList className="h-6 w-6 md:h-8 md:w-8 text-muted-foreground/50" />
                        {t("common.orders")}
                    </h1>
                    <p className="text-muted-foreground mt-1 text-base md:text-lg opacity-80">
                        {isRTL ? "متابعة تطور و تكاليف طلبات الخياطة" : "Suivi de l'avancement et des coûts de vos commandes."}
                    </p>
                </div>

                <Drawer.Root open={isNewOrderOpen} onOpenChange={setIsNewOrderOpen}>
                    <Drawer.Trigger asChild className="w-full md:w-auto">
                        <Button size="lg" className="w-full md:w-auto hover-elevate shadow-lg shadow-primary/20 gap-3 text-lg h-16 md:h-14 px-8 rounded-full transition-all hover:scale-105 active:scale-95 bg-primary font-bold">
                            <Plus className="h-6 w-6 md:h-7 md:w-7" />
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
                                                        <DatePicker
                                                            date={newOrder.dueDate ? new Date(newOrder.dueDate) : undefined}
                                                            setDate={(date) => setNewOrder(prev => ({ ...prev, dueDate: date?.toISOString() || "" }))}
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
                                                                    className="font-bold text-lg"
                                                                    value={newOrder.totalPrice}
                                                                    onChange={(e) => setNewOrder(prev => ({ ...prev, totalPrice: e.target.value }))}
                                                                />
                                                                
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label className="text-sm font-bold text-foreground/80">{isRTL ? "تسبيق" : "Avance"}</Label>
                                                            <div className="relative group">
                                                                <Input
                                                                    type="number"
                                                                    className="font-bold text-lg"
                                                                    value={newOrder.advancePayment}
                                                                    onChange={(e) => setNewOrder(prev => ({ ...prev, advancePayment: e.target.value }))}
                                                                />
                                                                
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-between items-center p-4 bg-muted/10 rounded-xl border border-border">
                                                        <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">{t("common.cost")}</span>
                                                        <span className="text-2xl font-lalezar text-foreground">{newOrder.totalCost} <span className="text-xs font-sans font-bold text-muted-foreground/60">Dhs</span></span>
                                                    </div>
                                                    <div className="flex justify-between items-center p-4 bg-primary/10 rounded-xl border border-primary/20 shadow-sm">
                                                        <span className="text-sm font-bold text-primary uppercase tracking-widest">{t("common.profit")}</span>
                                                        <span className="text-2xl font-lalezar text-primary">
                                                            {(Number(newOrder.totalPrice) - Number(newOrder.totalCost)).toFixed(2)} <span className="text-xs font-sans font-bold text-primary/60">Dhs</span>
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="premium-form-section flex flex-col gap-4 p-6 bg-card rounded-2xl border border-border shadow-sm transition-all">
                                            <h3 className="text-xl font-lalezar flex items-center gap-2 text-primary">
                                                <FileText className="h-6 w-6" />
                                                {isRTL ? "ملاحظات إضافية" : "Notes additionnelles"}
                                            </h3>
                                            <div className="space-y-2">
                                                <Label className="text-sm font-bold text-foreground/80">{isRTL ? "ملاحظات حول الطلب" : "Notes sur la commande"}</Label>
                                                <Textarea
                                                    placeholder={isRTL ? "أضف أي تفاصيل أخرى هنا..." : "Ajoutez des détails supplémentaires ici..."}
                                                    className="min-h-[120px] rounded-xl border-2 bg-background font-medium"
                                                    value={newOrder.notes}
                                                    onChange={(e) => setNewOrder(prev => ({ ...prev, notes: e.target.value }))}
                                                />
                                            </div>
                                        </div>

                                        {/* Measurement Section */}
                                        <div className="premium-form-section flex flex-col gap-4 p-6 bg-card rounded-2xl border border-border shadow-sm transition-all">
                                            <h3 className="text-xl font-lalezar flex items-center gap-2 text-primary">
                                                <Ruler className="h-6 w-6" />
                                                {isRTL ? "القياسات" : "Mesures"}
                                            </h3>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                {Object.entries(measurementData).map(([key, value]) => (
                                                    <div key={key} className="space-y-2">
                                                        <Label className="text-xs font-bold text-muted-foreground uppercase">{t(`measurements.${key}`)}</Label>
                                                        <div className="relative">
                                                            <Input
                                                                type="number"
                                                                className="h-10 font-bold text-sm pr-8"
                                                                value={value || ""}
                                                                onChange={(e) => setMeasurementData(prev => ({ ...prev, [key]: Number(e.target.value) }))}
                                                            />
                                                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground uppercase">cm</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            {Object.keys(measurementData).length === 0 && newOrder.clientId > 0 && (
                                                <Button 
                                                    variant="outline" 
                                                    className="w-full border-dashed"
                                                    onClick={() => setMeasurementData({ shoulders: 0, chest: 0, waist: 0, hips: 0, length: 0, sleeves: 0, wrist: 0, neck: 0 })}
                                                >
                                                    {isRTL ? "إضافة قياسات جديدة" : "Ajouter des mesures"}
                                                </Button>
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
                <Card className="border border-border/50 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-bold text-muted-foreground">
                            {t("common.profit")}
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">{stats.profit.toLocaleString()} Dhs</div>
                        <p className="text-xs text-muted-foreground mt-1">{isRTL ? "إجمالي الأرباح المحققة" : "Total des bénéfices réalisés"}</p>
                    </CardContent>
                </Card>

                <Card className="border border-border/50 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-bold text-muted-foreground">
                            {isRTL ? "قيد التنفيذ" : "En cours"}
                        </CardTitle>
                        <Package className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">{stats.inProgress}</div>
                        <p className="text-xs text-muted-foreground mt-1">{stats.waitingCoupe} {isRTL ? "طلبيات تنتظر الفصالة" : "commandes en attente de coupe"}</p>
                    </CardContent>
                </Card>

                <Card className="border border-border/50 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-bold text-muted-foreground">
                            {isRTL ? "مداخيل الطلبات" : "Chiffre d'Affaire"}
                        </CardTitle>
                        <Wallet className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">{stats.revenue.toLocaleString()} Dhs</div>
                        <p className="text-xs text-muted-foreground mt-1">{isRTL ? "إجمالي قيمة جميع الطلبات" : "Valeur totale de toutes les commandes"}</p>
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

            {/* Active client filter tag */}
            {clientIdFilter && (
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{isRTL ? "تصفية بـ:" : "Filtre :"}</span>
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold bg-primary/10 text-primary border border-primary/20">
                        {getClientName(clientIdFilter)}
                        <button
                            onClick={() => navigate("/orders")}
                            className="hover:text-destructive transition-colors text-base leading-none"
                        >&times;</button>
                    </span>
                </div>
            )}

            <div className="grid grid-cols-1 gap-4">
                {isLoading ? (
                    [1, 2, 3].map(i => <div key={i} className="h-32 bg-muted/50 rounded-sm animate-pulse" />)
                ) : orders?.filter((order: Order) => {
                    if (clientIdFilter && order.clientId !== clientIdFilter) return false;
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
                                            {t(`statuses.${order.status}`)}
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
                                        {order.notes && (
                                            <span className="flex items-center gap-1 text-primary/80 italic line-clamp-1 max-w-[200px]" title={order.notes}>
                                                <FileText className="h-3.5 w-3.5" />
                                                {order.notes}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between md:justify-end gap-2 md:gap-8 w-full md:w-auto border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-8 mt-2 md:mt-0">
                                <div className={cn("flex-1 md:flex-none", isRTL ? "text-right" : "text-left")}>
                                    <div className="text-[10px] md:text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">{t("common.price")}</div>
                                    <div className="text-lg md:text-xl font-bold text-foreground">{order.totalPrice} <span className="text-xs font-normal">Dhs</span></div>
                                </div>
                                <div className={cn("flex-1 md:flex-none", isRTL ? "text-right" : "text-left")}>
                                    <div className="text-[10px] md:text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">{t("common.profit")}</div>
                                    <div className="text-lg md:text-xl font-bold text-primary">{order.profit} <span className="text-xs font-normal">Dhs</span></div>
                                </div>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-10 w-10 shrink-0"
                                    onClick={() => {
                                        setEditOrderId(order.id);
                                    }}
                                >
                                    <ChevronRight className={cn("h-5 w-5 md:h-6 md:w-6", isRTL && "rotate-180")} />
                                </Button>
                            </div>
                        </div>
                        <div className="h-1.5 w-full bg-muted/50 overflow-hidden">
                            <div
                                className="h-full bg-primary transition-all duration-1000 shadow-[0_0_10px_rgba(var(--primary),0.5)]"
                                style={{ width: `${["Terminée", "Livrée"].includes(order.status) ? 100 : ((ORDER_STEPS.indexOf(order.currentStep as any) + 1) / ORDER_STEPS.length) * 100}%` }}
                            />
                        </div>
                    </Card>
                ))}
            </div>

            {/* Edit Order Drawer */}
            <Drawer.Root open={!!editOrderId} onOpenChange={(open) => !open && setEditOrderId(null)}>
                <Drawer.Portal>
                    <Drawer.Overlay className="fixed inset-0 bg-black/40 z-50" />
                    <Drawer.Content className={cn(
                        "bg-card flex flex-col rounded-t-[32px] h-[85%] mt-24 fixed bottom-0 left-0 right-0 z-50 outline-none border-t border-border",
                        isRTL && "font-arabic"
                    )}>
                        <div className="p-6 bg-card rounded-t-[32px] flex-1 overflow-y-auto">
                            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-muted mb-8" />
                            <div className="max-w-2xl mx-auto">
                                <Drawer.Title className="text-2xl md:text-3xl font-bold mb-2 flex items-center gap-3">
                                    <TrendingUp className="h-8 w-8 text-primary" />
                                    {isRTL ? `تعديل الطلب #${selectedOrder?.id}` : `Modifier la commande #${selectedOrder?.id}`}
                                </Drawer.Title>
                                <Drawer.Description className="text-muted-foreground mb-8 text-lg">
                                    {isRTL ? "أضف دفعة جديدة أو مصاريف لهذا الطلب." : "Ajoutez une avance ou une dépense pour cette commande."}
                                </Drawer.Description>

                                {selectedOrder && (
                                    <div className="space-y-8 pb-10">
                                        {/* Production Pipeline */}
                                        <div className="premium-form-section flex flex-col gap-8 py-10 px-6 bg-card rounded-2xl border border-border shadow-sm transition-all">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-xl font-lalezar flex items-center gap-2 text-primary">
                                                    <Scissors className="h-6 w-6" />
                                                    {isRTL ? "مراحل الإنتاج" : "Pipeline de Production"}
                                                </h3>
                                                <Badge variant="outline" className="font-bold border-primary/20 text-primary bg-primary/10 dark:bg-primary/20">
                                                    {t(`steps.${selectedOrder.currentStep}`)}
                                                </Badge>
                                            </div>

                                            {/* Order Notes (Editable) */}
                                            <div className="flex flex-col gap-4 p-4 bg-primary/5 rounded-xl border border-primary/10">
                                                <div className="flex items-center gap-2 text-primary">
                                                    <FileText className="h-5 w-5" />
                                                    <span className="font-bold">{isRTL ? "ملاحظات الطلب" : "Notes de la commande"}</span>
                                                </div>

                                                <div className="grid grid-cols-2 gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="gap-1.5 font-bold bg-background shadow-sm border-primary/20 hover:bg-primary/5 h-11 w-full"
                                                        onClick={() => setShowHistoricalMeasurements(!showHistoricalMeasurements)}
                                                    >
                                                        <Ruler className="h-4 w-4 text-primary shrink-0" />
                                                        <span className="truncate text-xs">{isRTL ? "قياسات الطلب" : "Mesures"}</span>
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="gap-1.5 font-bold bg-primary/10 shadow-sm border-primary/30 hover:bg-primary/20 h-11 text-primary w-full"
                                                        onClick={handlePrint}
                                                    >
                                                        <Printer className="h-4 w-4 shrink-0" />
                                                        <span className="truncate text-xs">{isRTL ? "طباعة الوصل" : "Imprimer"}</span>
                                                    </Button>
                                                </div>

                                                {showHistoricalMeasurements && (
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 mt-2 bg-background/80 rounded-xl border-2 border-primary/20 animate-in slide-in-from-top-4 duration-300">
                                                        {selectedOrder.measurements && Object.entries(selectedOrder.measurements).map(([key, value]) => (
                                                            <div key={key} className="space-y-1">
                                                                <Label className="text-[10px] font-black text-muted-foreground uppercase">{t(`measurements.${key}`)}</Label>
                                                                <div className="text-sm font-black flex items-center gap-1 text-primary">
                                                                    {value} <span className="text-[10px] opacity-70">CM</span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                        {(!selectedOrder.measurements || Object.keys(selectedOrder.measurements).length === 0) && (
                                                            <div className="col-span-full py-4 text-center text-xs text-muted-foreground italic">
                                                                {isRTL ? "لم يتم تسجيل قياسات لهذا الطلب" : "Aucune mesure enregistrée pour cette commande."}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                <Textarea
                                                    className="min-h-[80px] bg-background/50 border-primary/20"
                                                    value={localNotes}
                                                    onChange={(e) => setLocalNotes(e.target.value)}
                                                />
                                                <Button
                                                    size="sm"
                                                    className="w-fit gap-2 font-bold"
                                                    onClick={() => handleUpdateOrder(selectedOrder, { notes: localNotes })}
                                                    disabled={updateOrder.isPending}
                                                >
                                                    <Save className="h-4 w-4" />
                                                    {isRTL ? "تحديث الملاحظات" : "Mettre à jour les notes"}
                                                </Button>
                                            </div>

                                            <div className="relative flex justify-between items-center px-4 pt-4">
                                                <div className="absolute left-0 right-0 h-1.5 bg-border top-[40%] -translate-y-1/2 z-0" />
                                                <div
                                                    className="absolute left-0 h-1.5 bg-primary top-[40%] -translate-y-1/2 z-0 transition-all duration-500"
                                                    style={{ width: `${["Terminée", "Livrée"].includes(selectedOrder.status) ? 100 : (ORDER_STEPS.indexOf(selectedOrder.currentStep as any) / (ORDER_STEPS.length - 1)) * 100}%` }}
                                                />
                                                {ORDER_STEPS.map((step, idx) => {
                                                    const isCompleted = ["Terminée", "Livrée"].includes(selectedOrder.status);
                                                    const isReached = isCompleted || ORDER_STEPS.indexOf(selectedOrder.currentStep as any) >= idx;
                                                    const isCurrent = !isCompleted && selectedOrder.currentStep === step;
                                                    return (
                                                        <div key={step} className="relative z-10 flex flex-col items-center gap-3">
                                                            <div className={cn(
                                                                "h-10 w-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                                                                isReached ? "bg-primary border-primary text-white" : "bg-background border-border text-muted-foreground",
                                                                isCurrent && "scale-125 shadow-lg shadow-primary/20 ring-4 ring-primary/10"
                                                            )}>
                                                                {isReached ? <Check className="h-5 w-5" /> : <span className="text-sm font-bold">{idx + 1}</span>}
                                                            </div>
                                                            <span className={cn(
                                                                "text-sm font-bold uppercase tracking-tight whitespace-nowrap mt-2",
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
                                                <span className="text-primary text-base"><span className="text-sm font-normal">Dhs </span><span className="font-bold text-2xl">{selectedOrder.advancePayment}</span></span>
                                            </div>
                                            <div className="flex flex-col sm:flex-row gap-3">
                                                <div className="relative flex-1 group">
                                                    <Input
                                                        type="number"
                                                        placeholder={isRTL ? "المبلغ المضاف" : "Montant à ajouter"}
                                                        className="font-bold text-lg h-12"
                                                        value={editAdvance}
                                                        onChange={(e) => setEditAdvance(e.target.value)}
                                                    />
                                                    
                                                </div>
                                                <Button
                                                    onClick={handleAddAdvance}
                                                    className="h-12 w-full sm:w-auto rounded-xl bg-primary hover:bg-primary/90 px-8 gap-2 font-bold shadow-md transition-all active:scale-95"
                                                    disabled={!editAdvance || Number(editAdvance) <= 0 || updateOrder.isPending}
                                                >
                                                    <Plus className={cn("h-5 w-5", isRTL && "ml-1")} />
                                                    {isRTL ? "إضافة" : "Ajouter"}
                                                </Button>
                                            </div>
                                            <div className="flex justify-between items-center p-4 bg-primary/10 rounded-xl border border-primary/20 shadow-sm">
                                                <span className="text-sm font-bold text-primary uppercase tracking-widest">{isRTL ? "الباقي استخلاصه:" : "Reste à payer:"}</span>
                                                <span className="text-primary text-base"><span className="text-sm font-normal">Dhs </span><span className="font-bold text-2xl">{(Number(selectedOrder.totalPrice) - Number(selectedOrder.advancePayment)).toFixed(2)}</span></span>
                                            </div>

                                            {/* Advances History */}
                                            {/* Advances History: show initial advance + subsequent ones */}
                                            {(Number(selectedOrder.advancePayment) > 0 || (selectedOrder.advances && selectedOrder.advances.length > 0)) && (
                                                <div className="space-y-3 pt-2">
                                                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-[0.15em] mb-2">{isRTL ? "تاريخ الدفعات:" : "Historique des paiements :"}</p>
                                                    {/* Initial advance from order creation */}
                                                    {Number(selectedOrder.advancePayment) > 0 && (
                                                        <div className="flex justify-between items-center p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                                                            <div className="flex flex-col">
                                                                <span className="font-bold text-foreground/80">{isRTL ? "تسبيق أولي (Aلإنشاء)" : "Avance initiale (Création)"}</span>
                                                                <span className="text-[10px] text-muted-foreground font-medium">{selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString() : "--"}</span>
                                                            </div>
                                                            <span className="text-emerald-600 text-base"><span className="text-sm font-normal">Dhs </span><span className="font-bold text-xl">+{selectedOrder.advancePayment}</span></span>
                                                        </div>
                                                    )}
                                                    {/* Subsequent advances */}
                                                    {selectedOrder.advances && selectedOrder.advances.map((adv: any, idx: number) => (
                                                        <div key={idx} className="flex justify-between items-center p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/10 transition-all hover:border-emerald-500/20">
                                                            <div className="flex flex-col">
                                                                <span className="font-bold text-foreground/80">{isRTL ? "دفعة (تسبيق)" : "Paiement (Avance)"}</span>
                                                                <span className="text-[10px] text-muted-foreground font-medium">{new Date(adv.date).toLocaleString()}</span>
                                                            </div>
                                                            <span className="text-emerald-600 text-base"><span className="text-sm font-normal">Dhs </span><span className="font-bold text-xl">+{adv.amount}</span></span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
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
                                                        <SelectTrigger className="flex-1 h-10 rounded-xl">
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
                                                            className="h-10 rounded-xl"
                                                            value={editExpense.cost}
                                                            onChange={(e) => setEditExpense(prev => ({ ...prev, cost: e.target.value }))}
                                                        />
                                                        
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
                                                    <p className="text-base font-bold text-muted-foreground uppercase tracking-[0.15em] mb-2">{isRTL ? "لائحة المصاريف:" : "Liste des dépenses :"}</p>
                                                    {selectedOrder.expenses.map((exp: any, idx: number) => (
                                                        <div key={idx} className="flex justify-between items-center p-4 bg-destructive/5 rounded-xl border border-destructive/10 transition-all hover:border-destructive/20">
                                                            <div className="flex flex-col">
                                                                <span className="font-bold text-foreground/80">{exp.description}</span>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-[10px] text-muted-foreground font-medium">{new Date(exp.date).toLocaleDateString()}</span>
                                                                    {exp.step && exp.step !== "none" && (
                                                                        <>
                                                                            <span className="text-[10px] text-muted-foreground">•</span>
                                                                            <span className="text-sm text-destructive font-bold uppercase">{t(`steps.${exp.step}`)}</span>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <span className="text-destructive text-base"><span className="text-sm font-normal">Dhs </span><span className="font-bold text-xl">-{exp.cost}</span></span>
                                                        </div>
                                                    ))}
                                                    <div className="flex justify-between items-center p-4 bg-muted/20 rounded-xl border border-border mt-2">
                                                        <span className="text-muted-foreground font-bold text-base uppercase tracking-wide">{isRTL ? "إجمالي المصاريف:" : "Total dépenses:"}</span>
                                                        <span className="text-destructive text-base"><span className="text-sm font-normal">Dhs </span><span className="font-bold text-2xl">{selectedOrder.totalCost}</span></span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Mark as Complete Button */}
                                        {selectedOrder.status !== "Terminée" && (
                                            <div className="pt-4">
                                                {selectedOrder.currentStep !== "Mslouh" && selectedOrder.currentStep !== "Prete" ? (
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button
                                                                className="w-full h-14 text-lg font-bold rounded-xl gap-3 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20"
                                                            >
                                                                {isRTL ? "تحديد الطلب كمنجز" : "Marquer comme Réalisé"}
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent className="rounded-2xl">
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle className="flex items-center gap-2 text-amber-600">
                                                                    <AlertCircle className="h-6 w-6" />
                                                                    {isRTL ? "تحذير: مرحلة غير مكتملة" : "Attention : Étape incomplete"}
                                                                </AlertDialogTitle>
                                                                <AlertDialogDescription className="text-base">
                                                                    {isRTL
                                                                        ? `الطلب لم يصل بعد مرحلة "مصلوح" (المرحلة الأخيرة). هل تريد تحديده كمنجز على أي حال?`
                                                                        : `Cette commande n'a pas encore atteint l'étape "Mslouh" (dernière étape). Voulez-vous quand même la marquer comme réalisée ?`}
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel className="rounded-xl">
                                                                    {isRTL ? "إلغاء" : "Annuler"}
                                                                </AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    className="bg-emerald-600 hover:bg-emerald-700 rounded-xl"
                                                                    onClick={() => handleUpdateOrder(selectedOrder, { status: "Terminée" })}
                                                                >
                                                                    {isRTL ? "تأكيد الإنجاز" : "Confirmer la réalisation"}
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                ) : (
                                                    <Button
                                                        className="w-full h-14 text-lg font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20"
                                                        onClick={() => handleUpdateOrder(selectedOrder, { status: "Terminée" })}
                                                        disabled={updateOrder.isPending}
                                                    >
                                                        {isRTL ? "تحديد الطلب كمنجز ✅" : "Marquer comme Réalisé ✅"}
                                                    </Button>
                                                )}
                                            </div>
                                        )}
                                        {selectedOrder.status === "Terminée" && (
                                            <div className="pt-4 flex items-center justify-center gap-3 p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                                                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                                                <span className="font-bold text-emerald-700 text-lg">{isRTL ? "هذا الطلب منجز" : "Commande réalisée !"}</span>
                                            </div>
                                        )}

                                        <div className="pt-4">
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
            
            {/* Print Layout */}
            <div id="print-area" className="hidden print:block !m-0 !p-8 bg-white font-sans text-black" dir={isRTL ? "rtl" : "ltr"}>
                <style>{`
                    @media print {
                        body * { visibility: hidden; }
                        #print-area, #print-area * { visibility: visible; }
                        #print-area { position: absolute; left: 0; top: 0; width: 100%; }
                        @page { margin: 0; }
                    }
                `}</style>
                
                {selectedOrder && (
                    <div className="space-y-12">
                        {/* 1. Atelier Sheet */}
                        <div className="border-2 border-black p-6 space-y-6">
                            <div className="flex justify-between items-start border-b-2 border-black pb-4">
                                <div>
                                    <h1 className="text-3xl font-black uppercase tracking-tighter">{tenant?.name || "KHIYATMA"}</h1>
                                    <p className="text-sm font-bold opacity-80 italic">{isRTL ? "فيشة العمل" : "FICHE DE TRAVAIL"}</p>
                                </div>
                                <div className="text-right">
                                    <h2 className="text-2xl font-bold">#{selectedOrder.id}</h2>
                                    <p className="text-sm">{selectedOrder.createdAt ? format(new Date(selectedOrder.createdAt), "dd/MM/yyyy HH:mm") : ""}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-8 text-lg font-bold">
                                <div>
                                    <p className="text-xs font-normal opacity-60 mb-1">{isRTL ? "الزبون:" : "CLIENT:"}</p>
                                    <p className="text-2xl">{getClientName(selectedOrder.clientId)}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-normal opacity-60 mb-1">{isRTL ? "اللباس:" : "HABIT:"}</p>
                                    <p className="text-2xl uppercase">{t(`garments.${selectedOrder.garmentType}`)}</p>
                                </div>
                            </div>

                            <div className="border-t-2 border-black pt-6">
                                <h3 className="text-lg font-black uppercase mb-4 text-center bg-black text-white py-1">{isRTL ? "القياسات" : "MESURES"}</h3>
                                <div className="grid grid-cols-4 gap-y-4 gap-x-8">
                                    {selectedOrder.measurements && Object.entries(selectedOrder.measurements).map(([key, value]) => (
                                        <div key={key} className="flex flex-col border-b border-black pb-1">
                                            <span className="text-[10px] font-bold opacity-70 uppercase tracking-widest">{t(`measurements.${key}`)}</span>
                                            <span className="text-xl font-black text-center">{value} <span className="text-[8px] font-normal">cm</span></span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {selectedOrder.notes && (
                                <div className="border-t-2 border-black pt-4">
                                    <p className="text-xs font-bold opacity-60 uppercase mb-1">{isRTL ? "ملاحظات:" : "NOTES:"}</p>
                                    <p className="font-bold italic text-sm">{selectedOrder.notes}</p>
                                </div>
                            )}

                            <div className="flex justify-between text-xs font-bold pt-4">
                                <span>{isRTL ? "موعد التسليم:" : "Date de livraison :"} {selectedOrder.dueDate ? format(new Date(selectedOrder.dueDate), "dd/MM/yyyy") : "---"}</span>
                                <span>{isRTL ? "التوقيع:" : "Signature :"} .......................</span>
                            </div>
                        </div>

                        {/* SEPARATION LINE */}
                        <div className="relative h-4 flex items-center justify-center">
                            <div className="w-full border-b-[3px] border-dashed border-black"></div>
                            <span className="absolute bg-white px-4 text-[10px] font-bold italic tracking-[0.5em]">{isRTL ? "مقص" : "COUPE"} ✂ ✂ ✂</span>
                        </div>

                        {/* 2. Customer Receipt */}
                        <div className="border-2 border-black p-6 space-y-6 bg-slate-50/10">
                            <div className="flex justify-between items-start border-b-2 border-black pb-4">
                                <div>
                                    <h1 className="text-3xl font-black uppercase tracking-tighter">{tenant?.name || "KHIYATMA"}</h1>
                                    <p className="text-sm font-bold opacity-80 italic">{isRTL ? "وصل الزبون" : "REÇU CLIENT"}</p>
                                </div>
                                <div className="text-right">
                                    <h2 className="text-2xl font-bold">#{selectedOrder.id}</h2>
                                    <p className="text-sm">{selectedOrder.createdAt ? format(new Date(selectedOrder.createdAt), "dd/MM/yyyy HH:mm") : ""}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-8 text-lg font-bold">
                                <div>
                                    <p className="text-xs font-normal opacity-60 mb-1">{isRTL ? "الزبون:" : "CLIENT:"}</p>
                                    <p className="text-2xl">{getClientName(selectedOrder.clientId)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-normal opacity-60 mb-1">{isRTL ? "موعد الاستلام:" : "Rendez-vous :"}</p>
                                    <p className="text-2xl">{selectedOrder.dueDate ? format(new Date(selectedOrder.dueDate), "dd/MM/yyyy") : "---"}</p>
                                </div>
                            </div>

                            <div className="border-y-2 border-black py-6 grid grid-cols-3 gap-4 text-center h-28">
                                <div className="flex flex-col justify-center bg-black/5 rounded">
                                    <p className="text-[10px] font-bold opacity-60 uppercase mb-2">{isRTL ? "المجموع الكلي" : "TOTAL"}</p>
                                    <p className="text-3xl font-black">{selectedOrder.totalPrice} <span className="text-sm">DH</span></p>
                                </div>
                                <div className="flex flex-col justify-center border-x-2 border-black">
                                    <p className="text-[10px] font-bold opacity-60 uppercase mb-2 text-emerald-700">{isRTL ? "التسبيق" : "AVANCE"}</p>
                                    <p className="text-3xl font-black text-emerald-700">+{selectedOrder.advancePayment} <span className="text-sm">DH</span></p>
                                </div>
                                <div className="flex flex-col justify-center bg-red-500/5">
                                    <p className="text-[10px] font-bold opacity-60 uppercase mb-2 text-red-600">{isRTL ? "الباقي" : "RESTE"}</p>
                                    <p className="text-3xl font-black text-red-600">{(Number(selectedOrder.totalPrice) - Number(selectedOrder.advancePayment)).toFixed(2)} <span className="text-sm">DH</span></p>
                                </div>
                            </div>

                            <div className="flex justify-between items-end italic text-xs pt-4">
                                <div className="space-y-1">
                                    <p>{isRTL ? "شكراً لزيارتكم." : "Merci pour votre confiance."}</p>
                                    <p className="text-[9px] opacity-70">Khiyatma Pro - Logiciel de gestion pour tailleurs</p>
                                </div>
                                <div className="text-right">
                                    <p className="mt-8 border-t border-black w-40 inline-block pt-1 uppercase">{isRTL ? "توقيع المحل" : "Sceau du Magasin"}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Post-creation Print Confirmation */}
            <AlertDialog open={isPrintConfirmOpen} onOpenChange={setIsPrintConfirmOpen}>
                <AlertDialogContent className="rounded-2xl border-2">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-2xl font-lalezar text-primary">
                            {isRTL ? "طلب جديد" : "Nouvelle commande"}
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-lg font-bold">
                            {isRTL 
                                ? "تم تسجيل الطلب بنجاح. هل تريد طباعة الوصل للزبون الآن؟" 
                                : "La commande a été enregistrée. Voulez-vous imprimer le reçu pour le client maintenant ?"}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-3 mt-6">
                        <AlertDialogCancel className="h-12 font-bold rounded-xl flex-1">
                            {isRTL ? "لا، لاحقاً" : "Non, plus tard"}
                        </AlertDialogCancel>
                        <AlertDialogAction 
                            className="h-12 font-bold rounded-xl flex-1 bg-primary text-primary-foreground gap-2"
                            onClick={handlePrint}
                        >
                            <Printer className="h-5 w-5" />
                            {isRTL ? "نعم، اطبع" : "Oui, imprimer"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
