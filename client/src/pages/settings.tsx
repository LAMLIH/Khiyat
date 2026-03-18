import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/contexts/LanguageContext";
import { useExpenseCategories } from "@/hooks/use-expense-categories";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
    Settings, Plus, Trash2, Pencil, Check, X, RotateCcw, Tag, Database, Search
} from "lucide-react";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
    AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

// ─── Reusable "Master List" component ────────────────────────────────────────
function MasterListTab({
    items,
    onAdd,
    onUpdate,
    onDelete,
    onReset,
    icon: Icon,
    iconColor,
    iconBg,
    addPlaceholder,
    emptyLabel,
    countLabel,
    isRTL,
}: {
    items: string[];
    onAdd: (v: string) => void;
    onUpdate: (old: string, nw: string) => void;
    onDelete: (v: string) => void;
    onReset?: () => void;
    icon: any;
    iconColor: string;
    iconBg: string;
    addPlaceholder: string;
    emptyLabel: string;
    countLabel: string;
    isRTL: boolean;
}) {
    const [newVal, setNewVal] = useState("");
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editValue, setEditValue] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    const handleAdd = () => {
        const trimmed = newVal.trim();
        if (!trimmed) return;
        onAdd(trimmed);
        setNewVal("");
    };

    const handleSaveEdit = () => {
        if (editingIndex === null) return;
        onUpdate(items[editingIndex], editValue);
        setEditingIndex(null);
        setEditValue("");
    };

    const filteredItems = items.filter(item =>
        item.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-5">
            {/* Add row */}
            <div className="flex gap-3">
                <Input
                    placeholder={addPlaceholder}
                    value={newVal}
                    onChange={e => setNewVal(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleAdd()}
                    className="h-12 text-base"
                />
                <Button
                    onClick={handleAdd}
                    disabled={!newVal.trim()}
                    className="h-12 px-6 gap-2 bg-primary font-bold rounded-xl"
                >
                    <Plus className="h-5 w-5" />
                    {isRTL ? "إضافة" : "Ajouter"}
                </Button>
            </div>

            {/* Search row */}
            {items.length > 0 && (
                <div className="relative">
                    <Search className={cn("absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40", isRTL ? "right-3" : "left-3")} />
                    <Input
                        placeholder={isRTL ? "بحث..." : "Rechercher..."}
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className={cn("h-10 text-sm bg-muted/20 border-border/50 focus:bg-background transition-all", isRTL ? "pr-9" : "pl-9")}
                    />
                    {searchQuery && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className={cn("absolute top-1/2 -translate-y-1/2 h-8 w-8 text-black hover:text-foreground", isRTL ? "left-1" : "right-1")}
                            onClick={() => setSearchQuery("")}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            )}

            {/* Items list */}
            <div className="space-y-2">
                {items.length === 0 ? (
                    <p className="text-center text-muted-foreground italic py-8">{emptyLabel}</p>
                ) : filteredItems.length === 0 ? (
                    <p className="text-center text-muted-foreground italic py-8">
                        {isRTL ? "لا توجد نتائج" : "Aucun résultat"}
                    </p>
                ) : (
                    filteredItems.map((item, i) => {
                        // Find original index in items for editing/deletion
                        const originalIndex = items.indexOf(item);
                        return (
                            <div
                                key={originalIndex}
                                className="flex items-center gap-3 p-3 rounded-xl border border-border bg-muted/20 hover:bg-muted/40 transition-colors"
                            >
                                <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center shrink-0", iconBg)}>
                                    <Icon className={cn("h-4 w-4", iconColor)} />
                                </div>

                                {editingIndex === originalIndex ? (
                                    <>
                                        <Input
                                            className="flex-1 h-9"
                                            value={editValue}
                                            onChange={e => setEditValue(e.target.value)}
                                            onKeyDown={e => e.key === "Enter" && handleSaveEdit()}
                                            autoFocus
                                        />
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-emerald-600" onClick={handleSaveEdit}>
                                            <Check className="h-4 w-4" />
                                        </Button>
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground" onClick={() => setEditingIndex(null)}>
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <span className="flex-1 font-semibold text-foreground">{item}</span>
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-primary" onClick={() => { setEditingIndex(originalIndex); setEditValue(item); }}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive/60 hover:text-destructive">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent className="rounded-2xl">
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>{isRTL ? "حذف العنصر؟" : "Supprimer cet élément ?"}</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        {isRTL ? `هل تريد حذف "${item}"؟` : `Voulez-vous supprimer "${item}" ?`}
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel className="rounded-xl">{isRTL ? "إلغاء" : "Annuler"}</AlertDialogCancel>
                                                    <AlertDialogAction className="bg-destructive hover:bg-destructive/90 rounded-xl" onClick={() => onDelete(item)}>
                                                        {isRTL ? "حذف" : "Supprimer"}
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center pt-2 border-t border-border">
                <Badge variant="outline" className="text-xs font-bold">
                    {searchQuery ? `${filteredItems.length} / ${items.length}` : items.length} {countLabel}
                </Badge>
                {onReset && (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground text-xs">
                                <RotateCcw className="h-3.5 w-3.5" />
                                {isRTL ? "إعادة تعيين" : "Réinitialiser"}
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="rounded-2xl">
                            <AlertDialogHeader>
                                <AlertDialogTitle>{isRTL ? "إعادة تعيين القائمة؟" : "Réinitialiser la liste ?"}</AlertDialogTitle>
                                <AlertDialogDescription>
                                    {isRTL ? "سيتم استبدال قائمتك بالقائمة الافتراضية." : "Votre liste sera remplacée par la liste par défaut."}
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel className="rounded-xl">{isRTL ? "إلغاء" : "Annuler"}</AlertDialogCancel>
                                <AlertDialogAction className="rounded-xl" onClick={onReset}>
                                    {isRTL ? "تأكيد" : "Confirmer"}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
            </div>
        </div>
    );
}

// ─── Main Settings Page ───────────────────────────────────────────────────────
export default function SettingsPage() {
    const { t } = useTranslation();
    const { isRTL } = useLanguage();
    const { toast } = useToast();

    const {
        categories: expCats,
        addCategory,
        deleteCategory,
        updateCategory,
        resetToDefault,
    } = useExpenseCategories();

    return (
        <div className={cn("p-4 md:p-8 space-y-8 animate-in fade-in duration-500 bg-background min-h-screen", isRTL && "font-arabic")}>
            {/* Page Header */}
            <div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-2xl">
                        <Settings className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                    </div>
                    {isRTL ? "الإعدادات" : "Paramètres"}
                </h1>
                <p className="text-muted-foreground mt-1 text-base md:text-lg ml-14">
                    {isRTL ? "إعداد وتخصيص التطبيق" : "Configuration et personnalisation de l'application."}
                </p>
            </div>

            {/* ── Données de base ─────────────────────────────────────── */}
            <Card className="border border-border shadow-sm bg-card">
                <CardHeader className="border-b border-border bg-muted/20">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-violet-500/10 rounded-xl">
                            <Database className="h-5 w-5 text-violet-600" />
                        </div>
                        <div>
                            <CardTitle className="text-lg font-bold">
                                {isRTL ? "البيانات الأساسية" : "Données de base"}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground mt-0.5">
                                {isRTL ? "القوائم والصنفيات المستخدمة في التطبيق" : "Listes et référentiels utilisés dans l'application."}
                            </p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    <Tabs defaultValue="expense-motifs">
                        <TabsList className="mb-6 rounded-xl h-12 bg-muted/40 p-1 gap-1">
                            <TabsTrigger
                                value="expense-motifs"
                                className="rounded-lg h-10 font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm gap-2"
                            >
                                <Tag className="h-4 w-4" />
                                {isRTL ? "موتيف الدفعات" : "Motifs de dépense"}
                            </TabsTrigger>
                            {/* Future tabs can be added here */}
                            {/* <TabsTrigger value="garment-types" ...> */}
                        </TabsList>

                        <TabsContent value="expense-motifs">
                            <MasterListTab
                                items={expCats}
                                onAdd={name => { addCategory(name); toast({ title: isRTL ? "تمت الإضافة ✅" : "Ajouté ✅", description: `"${name}"` }); }}
                                onUpdate={(old, nw) => { updateCategory(old, nw); toast({ title: isRTL ? "تم التحديث ✅" : "Mis à jour ✅" }); }}
                                onDelete={name => { deleteCategory(name); toast({ title: isRTL ? "تم الحذف" : "Supprimé", variant: "destructive" }); }}
                                onReset={resetToDefault}
                                icon={Tag}
                                iconColor="text-amber-600"
                                iconBg="bg-amber-500/10"
                                addPlaceholder={isRTL ? "موتيف جديد... (مثل: إيجار، كهرباء، تنظيف)" : "Nouveau motif... (ex: Loyer, Électricité, Nettoyage)"}
                                emptyLabel={isRTL ? "لا توجد موتيفات بعد" : "Aucun motif pour le moment"}
                                countLabel={isRTL ? "موتيف" : "motif(s)"}
                                isRTL={isRTL}
                            />
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}
