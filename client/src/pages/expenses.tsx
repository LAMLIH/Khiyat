import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/contexts/LanguageContext";
import { useStandaloneExpenses, type StandaloneExpense } from "@/hooks/use-standalone-expenses";
import { useExpenseCategories } from "@/hooks/use-expense-categories";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
    ShoppingBag, Plus, Trash2, Search, TrendingDown, Calendar,
    Filter, ChevronDown, Tag, StickyNote, X,
} from "lucide-react";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
    AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Drawer } from "vaul";
import { useToast } from "@/hooks/use-toast";
import { SearchableSelect } from "@/components/ui/searchable-select";

export default function ExpensesPage() {
    const { t } = useTranslation();
    const { isRTL } = useLanguage();
    const { toast } = useToast();
    const { expenses, addExpense, deleteExpense, totalAmount } = useStandaloneExpenses();
    const { categories } = useExpenseCategories();

    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [sortBy, setSortBy] = useState<"date" | "amount">("date");
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const [form, setForm] = useState({
        description: "",
        amount: "",
        category: "",
        date: new Date().toISOString().split("T")[0],
        notes: "",
    });

    const handleAdd = () => {
        if (!form.description.trim() || !form.amount) return;
        addExpense({
            description: form.description.trim(),
            amount: Number(form.amount),
            category: form.category || (isRTL ? "أخرى" : "Autre"),
            date: form.date,
            notes: form.notes.trim() || undefined,
        });
        setForm({ description: "", amount: "", category: "", date: new Date().toISOString().split("T")[0], notes: "" });
        setIsDrawerOpen(false);
        toast({
            title: isRTL ? "تمت إضافة الدفعة ✅" : "Dépense ajoutée ✅",
            description: `${form.description} — ${form.amount} Dhs`,
        });
    };

    const filtered = useMemo(() => {
        return expenses
            .filter(e => {
                const matchSearch =
                    e.description.toLowerCase().includes(search.toLowerCase()) ||
                    e.category.toLowerCase().includes(search.toLowerCase());
                const matchCat = categoryFilter === "all" || e.category === categoryFilter;
                return matchSearch && matchCat;
            })
            .sort((a, b) => {
                if (sortBy === "amount") return b.amount - a.amount;
                return new Date(b.date).getTime() - new Date(a.date).getTime();
            });
    }, [expenses, search, categoryFilter, sortBy]);

    const filteredTotal = filtered.reduce((s, e) => s + e.amount, 0);

    // Group by category for summary
    const byCategory = useMemo(() => {
        const map: Record<string, number> = {};
        expenses.forEach(e => { map[e.category] = (map[e.category] || 0) + e.amount; });
        return Object.entries(map).sort((a, b) => b[1] - a[1]);
    }, [expenses]);

    const thisMonthTotal = useMemo(() => {
        const now = new Date();
        return expenses
            .filter(e => {
                const d = new Date(e.date);
                return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
            })
            .reduce((s, e) => s + e.amount, 0);
    }, [expenses]);

    return (
        <div className={cn("p-4 md:p-8 space-y-8 animate-in fade-in duration-500 bg-background min-h-screen", isRTL && "font-arabic")}>
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground flex items-center gap-3">
                        <div className="p-2 bg-destructive/10 rounded-2xl">
                            <ShoppingBag className="h-6 w-6 md:h-8 md:w-8 text-destructive" />
                        </div>
                        {isRTL ? "سجل الدفعات" : "Gestion des Dépenses"}
                    </h1>
                    <p className="text-muted-foreground mt-1 text-base ml-14">
                        {isRTL ? "تسجيل ومتابعة دفعات المشغل (إيجار، كهرباء، مستلزمات...)" : "Enregistrez vos dépenses hors commandes (loyer, électricité, fournitures...)"}
                    </p>
                </div>
                <Drawer.Root open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                    <Drawer.Trigger asChild>
                        <Button size="lg" className="gap-2 h-14 px-8 rounded-full bg-primary font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                            <Plus className="h-5 w-5" />
                            {isRTL ? "دفعة جديدة" : "Nouvelle dépense"}
                        </Button>
                    </Drawer.Trigger>
                    <Drawer.Portal>
                        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-50" />
                        <Drawer.Content className={cn("bg-background flex flex-col rounded-t-[32px] h-[85%] mt-24 fixed bottom-0 left-0 right-0 z-50 outline-none border-t-4 border-primary/20", isRTL && "font-arabic")}>
                            <div className="p-6 flex-1 overflow-y-auto">
                                <div className="mx-auto w-12 h-1.5 rounded-full bg-muted mb-8" />
                                <div className="max-w-xl mx-auto space-y-6">
                                    <Drawer.Title className="text-2xl font-bold flex items-center gap-3 text-primary">
                                        <ShoppingBag className="h-7 w-7" />
                                        {isRTL ? "إضافة دفعة جديدة" : "Ajouter une dépense"}
                                    </Drawer.Title>

                                    <div className="space-y-5">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                                                {isRTL ? "الوصف *" : "Description *"}
                                            </Label>
                                            <Input
                                                placeholder={isRTL ? "مثل: إيجار الشهر، فاتورة الكهرباء..." : "Ex: Loyer du mois, Facture électricité..."}
                                                value={form.description}
                                                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                                                className="h-12 text-base"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                                                    {isRTL ? "المبلغ (د.م) *" : "Montant (Dhs) *"}
                                                </Label>
                                                <Input
                                                    type="number"
                                                    placeholder="0"
                                                    value={form.amount}
                                                    onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
                                                    className="h-12 text-base"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                                                    {isRTL ? "التاريخ" : "Date"}
                                                </Label>
                                                <Input
                                                    type="date"
                                                    value={form.date}
                                                    onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                                                    className="h-12"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                                                {isRTL ? "الموتيف / الفئة" : "Motif / Catégorie"}
                                            </Label>
                                            <SearchableSelect
                                                options={categories.map(cat => ({ label: cat, value: cat }))}
                                                value={form.category}
                                                onValueChange={v => setForm(p => ({ ...p, category: v }))}
                                                placeholder={isRTL ? "اختر موتيفاً..." : "Choisir un motif..."}
                                                emptyMessage={isRTL ? "لا توجد نتائج" : "Aucun résultat"}
                                                className="h-12"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                                                {isRTL ? "ملاحظات" : "Notes"}
                                            </Label>
                                            <Textarea
                                                placeholder={isRTL ? "ملاحظات إضافية..." : "Notes optionnelles..."}
                                                value={form.notes}
                                                onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                                                className="min-h-[80px]"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex gap-4 pt-4">
                                        <Button
                                            onClick={handleAdd}
                                            disabled={!form.description.trim() || !form.amount}
                                            className="flex-[2] h-16 text-xl font-bold rounded-xl bg-primary shadow-lg"
                                        >
                                            {isRTL ? "حفظ الدفعة" : "Enregistrer"}
                                        </Button>
                                        <Drawer.Close asChild>
                                            <Button variant="outline" className="flex-1 h-16 text-xl rounded-xl border-2">
                                                {isRTL ? "إلغاء" : "Annuler"}
                                            </Button>
                                        </Drawer.Close>
                                    </div>
                                </div>
                            </div>
                        </Drawer.Content>
                    </Drawer.Portal>
                </Drawer.Root>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border border-border shadow-sm bg-card">
                    <CardContent className="p-6">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">
                            {isRTL ? "إجمالي الدفعات" : "Total Dépenses"}
                        </p>
                        <div className="text-3xl font-black text-destructive">
                            <span className="text-lg font-normal">Dhs </span>
                            {totalAmount.toLocaleString("fr-MA", { minimumFractionDigits: 2 })}
                        </div>
                    </CardContent>
                </Card>
                <Card className="border border-border shadow-sm bg-card">
                    <CardContent className="p-6">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">
                            {isRTL ? "دفعات هذا الشهر" : "Ce mois-ci"}
                        </p>
                        <div className="text-3xl font-black text-amber-600">
                            <span className="text-lg font-normal">Dhs </span>
                            {thisMonthTotal.toLocaleString("fr-MA", { minimumFractionDigits: 2 })}
                        </div>
                    </CardContent>
                </Card>
                <Card className="border border-border shadow-sm bg-card">
                    <CardContent className="p-6">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">
                            {isRTL ? "عدد الدفعات" : "Nombre d'entrées"}
                        </p>
                        <div className="text-3xl font-black text-foreground">{expenses.length}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Category summary tags */}
            {byCategory.length > 0 && (
                <Card className="border border-border shadow-sm bg-card">
                    <CardHeader className="border-b border-border bg-muted/20 py-3 px-5">
                        <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                            {isRTL ? "حسب الفئة" : "Par catégorie"}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 flex flex-wrap gap-2">
                        {byCategory.map(([cat, total]) => (
                            <button
                                key={cat}
                                onClick={() => setCategoryFilter(categoryFilter === cat ? "all" : cat)}
                                className={cn(
                                    "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold border transition-all",
                                    categoryFilter === cat
                                        ? "bg-primary text-white border-primary"
                                        : "bg-muted/30 text-foreground border-border hover:bg-muted/60"
                                )}
                            >
                                <Tag className="h-3.5 w-3.5" />
                                {cat}
                                <span className="opacity-70">· Dhs {total.toLocaleString("fr-MA", { maximumFractionDigits: 0 })}</span>
                            </button>
                        ))}
                        {categoryFilter !== "all" && (
                            <button
                                onClick={() => setCategoryFilter("all")}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-semibold bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20 transition-all"
                            >
                                <X className="h-3.5 w-3.5" />
                                {isRTL ? "إزالة الفلتر" : "Effacer"}
                            </button>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className={cn("absolute top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/50", isRTL ? "right-4" : "left-4")} />
                    <Input
                        placeholder={isRTL ? "بحث عن دفعة..." : "Rechercher une dépense..."}
                        className={cn("h-12 text-base", isRTL ? "pr-12" : "pl-12")}
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <Select value={sortBy} onValueChange={v => setSortBy(v as "date" | "amount")}>
                    <SelectTrigger className="h-12 w-full md:w-48">
                        <ChevronDown className="h-4 w-4 mr-2 text-muted-foreground" />
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="date">{isRTL ? "الأحدث أولاً" : "Plus récent"}</SelectItem>
                        <SelectItem value="amount">{isRTL ? "الأعلى مبلغاً" : "Montant décroissant"}</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Expenses List */}
            <div className="space-y-3">
                {filtered.length === 0 ? (
                    <div className="py-20 text-center">
                        <TrendingDown className="h-14 w-14 mx-auto mb-4 text-muted-foreground/20" />
                        <p className="text-muted-foreground italic text-lg">
                            {expenses.length === 0
                                ? (isRTL ? "لا توجد دفعات بعد. أضف أولى دفعاتك!" : "Aucune dépense. Ajoutez votre première dépense !")
                                : (isRTL ? "لا توجد نتائج" : "Aucun résultat")}
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Filtered total */}
                        {search || categoryFilter !== "all" ? (
                            <div className="flex justify-between items-center px-1 pb-2">
                                <span className="text-sm text-muted-foreground">{filtered.length} {isRTL ? "نتيجة" : "résultat(s)"}</span>
                                <span className="font-bold text-destructive">
                                    Dhs {filteredTotal.toLocaleString("fr-MA", { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                        ) : null}

                        {filtered.map(exp => (
                            <Card key={exp.id} className="border border-border bg-card hover:shadow-sm transition-all group">
                                <CardContent className="p-4 flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
                                        <TrendingDown className="h-5 w-5 text-destructive" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <p className="font-bold text-foreground truncate">{exp.description}</p>
                                            {exp.category && (
                                                <Badge className="bg-amber-500/10 text-amber-600 border border-amber-200 text-xs font-semibold">
                                                    <Tag className="h-3 w-3 mr-1" />{exp.category}
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-3.5 w-3.5" />
                                                {new Date(exp.date).toLocaleDateString("fr-MA")}
                                            </span>
                                            {exp.notes && (
                                                <span className="flex items-center gap-1 truncate">
                                                    <StickyNote className="h-3.5 w-3.5" />
                                                    {exp.notes}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="text-right">
                                            <span className="text-sm text-muted-foreground font-normal">Dhs </span>
                                            <span className="text-xl font-black text-destructive">
                                                {exp.amount.toLocaleString("fr-MA", { minimumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button size="icon" variant="ghost" className="h-9 w-9 text-destructive/40 hover:text-destructive opacity-0 group-hover:opacity-100 transition-all">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent className="rounded-2xl">
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>{isRTL ? "حذف الدفعة؟" : "Supprimer cette dépense ?"}</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        {isRTL ? `"${exp.description}" — ${exp.amount} Dhs` : `"${exp.description}" — ${exp.amount} Dhs`}
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel className="rounded-xl">{isRTL ? "إلغاء" : "Annuler"}</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        className="bg-destructive hover:bg-destructive/90 rounded-xl"
                                                        onClick={() => deleteExpense(exp.id)}
                                                    >
                                                        {isRTL ? "حذف" : "Supprimer"}
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </>
                )}
            </div>
        </div>
    );
}
