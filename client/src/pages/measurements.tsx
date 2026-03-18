import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
    Scissors,
    RotateCcw,
    Save,
    Trash2,
    Info,
    MoveHorizontal,
    MoveVertical,
    Circle,
    CircleDashed,
    CircleDot,
    Watch,
    Ruler,
    ChevronsUpDown,
    Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { useMeasurements } from "@/hooks/use-measurements";
import { useClients } from "@/hooks/use-clients";
import { type Client, type Measurement, garmentTypes } from "@shared/schema";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useRef } from "react";
import { useSearch } from "wouter";

const EMPTY_FORM = { shoulders: 0, chest: 0, waist: 0, hips: 0, length: 0, sleeves: 0, wrist: 0, neck: 0 };

export default function MeasurementsPage() {
    const { t } = useTranslation();
    const { isRTL } = useLanguage();
    const { toast } = useToast();
    const search = useSearch();
    const { clients } = useClients();
    const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
    const [clientOpen, setClientOpen] = useState(false);
    const [clientSearch, setClientSearch] = useState("");
    const [garmentType, setGarmentType] = useState<typeof garmentTypes[number]>("Caftan");
    const { measurements, createMeasurement } = useMeasurements(selectedClientId || 0);

    // Pre-select client from URL query param
    useEffect(() => {
        const params = new URLSearchParams(search);
        const clientId = params.get("clientId");
        if (clientId) setSelectedClientId(Number(clientId));
    }, [search]);

    const [formData, setFormData] = useState<Record<string, number>>(EMPTY_FORM);
    const isUpdateRef = useRef(false);

    const lastMeasurement = measurements?.find((m: Measurement) => m.garmentType === garmentType);

    // Auto-load measurement data when client, garment type, or measurements change
    useEffect(() => {
        if (!selectedClientId) {
            setFormData(EMPTY_FORM);
            return;
        }
        if (lastMeasurement) {
            setFormData(lastMeasurement.data as Record<string, number>);
        } else {
            setFormData(EMPTY_FORM);
        }
    }, [garmentType, selectedClientId, measurements?.length]);

    // Show toast after save
    useEffect(() => {
        if (createMeasurement.isSuccess) {
            toast({
                title: isUpdateRef.current
                    ? (isRTL ? "تم تحديث القياسات ✅" : "Mise à jour effectuée ✅")
                    : (isRTL ? "تم تسجيل القياسات ✅" : "Mesures enregistrées ✅"),
                description: isUpdateRef.current
                    ? (isRTL ? `تم تحديث قياسات ${t(`garments.${garmentType}`)} بنجاح` : `Les mesures "${t(`garments.${garmentType}`)}" ont été mises à jour.`)
                    : (isRTL ? `تم تسجيل قياسات ${t(`garments.${garmentType}`)} بنجاح` : `Nouvelles mesures "${t(`garments.${garmentType}`)}" enregistrées.`),
            });
        }
        if (createMeasurement.isError) {
            toast({
                title: isRTL ? "خطأ" : "Erreur",
                description: isRTL ? "حدث خطأ أثناء الحفظ" : "Une erreur est survenue lors de l'enregistrement.",
                variant: "destructive",
            });
        }
    }, [createMeasurement.isSuccess, createMeasurement.isError]);

    const applyLast = () => {
        if (lastMeasurement) {
            setFormData(lastMeasurement.data as Record<string, number>);
        }
    };

    const handleSave = () => {
        if (!selectedClientId) return;
        isUpdateRef.current = !!lastMeasurement;
        createMeasurement.mutate({
            clientId: selectedClientId,
            garmentType,
            data: formData,
            isLast: true,
        });
    };

    const measurementIcons: Record<string, any> = {
        shoulders: <MoveHorizontal className="h-5 w-5" />,
        chest: <Circle className="h-5 w-5" />,
        waist: <CircleDashed className="h-5 w-5" />,
        hips: <Circle className="h-5 w-5" />,
        length: <MoveVertical className="h-5 w-5" />,
        sleeves: <Ruler className="h-5 w-5" />,
        wrist: <Watch className="h-5 w-5" />,
        neck: <CircleDot className="h-5 w-5" />,
    };

    return (
        <div className="p-4 md:p-8 space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground flex items-center gap-3">
                        <Scissors className="h-6 w-6 md:h-8 md:w-8 text-muted-foreground/50" />
                        {t("common.measurements")}
                    </h1>
                    <p className="text-muted-foreground mt-1 text-base md:text-lg">
                        {isRTL ? "تسجيل وإدارة قياسات الزبناء حسب نوع اللباس" : "Enregistrez et gérez les mesures par type d'habit."}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
                <Card className="lg:col-span-4 component-card shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl font-bold">
                            <Info className="h-5 w-5 text-muted-foreground/50" />
                            {isRTL ? "الزبون واللباس" : "Sélection & Habit"}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-8 p-6 pt-0">
                        <div className="space-y-4">
                            <Label className="text-sm font-bold uppercase tracking-widest text-slate-500">{t("common.clients")}</Label>
                            <Popover open={clientOpen} onOpenChange={setClientOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={clientOpen}
                                        className="w-full h-14 rounded-xl border-2 border-input bg-background font-medium hover:border-primary/30 justify-between px-4 transition-all"
                                    >
                                        <span className="truncate">
                                            {selectedClientId
                                                ? clients?.find((c: Client) => c.id === selectedClientId)?.name
                                                : (isRTL ? "ابحث عن زبون..." : "Rechercher un client...")}
                                        </span>
                                        <ChevronsUpDown className="h-4 w-4 opacity-40 shrink-0" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="p-0 rounded-xl border-2 shadow-xl" align="start" style={{ width: "var(--radix-popover-trigger-width)" }}>
                                    <Command>
                                        <CommandInput
                                            placeholder={isRTL ? "ابحث..." : "Rechercher..."}
                                            value={clientSearch}
                                            onValueChange={setClientSearch}
                                            className="h-11"
                                        />
                                        <CommandList>
                                            <CommandEmpty>{isRTL ? "لا توجد نتائج" : "Aucun résultat"}</CommandEmpty>
                                            <CommandGroup>
                                                {clients
                                                    ?.filter((c: Client) => c.name.toLowerCase().includes(clientSearch.toLowerCase()))
                                                    .map((c: Client) => (
                                                        <CommandItem
                                                            key={c.id}
                                                            value={c.name}
                                                            onSelect={() => {
                                                                setSelectedClientId(c.id);
                                                                setClientOpen(false);
                                                                setClientSearch("");
                                                            }}
                                                            className="flex items-center gap-2 rounded-lg my-0.5"
                                                        >
                                                            <Check className={cn("h-4 w-4", selectedClientId === c.id ? "opacity-100 text-primary" : "opacity-0")} />
                                                            {c.name}
                                                        </CommandItem>
                                                    ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="space-y-4">
                            <Label className="text-sm font-bold uppercase tracking-widest text-slate-500">{isRTL ? "نوع اللباس" : "Type d'habit"}</Label>
                            <div className="grid grid-cols-2 gap-3">
                                {garmentTypes.map(type => (
                                    <Button
                                        key={type}
                                        variant={garmentType === type ? "default" : "outline"}
                                        className={cn(
                                            "h-14 rounded-xl font-bold transition-all text-sm border-2",
                                            garmentType === type
                                                ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20"
                                                : "bg-muted border-border text-muted-foreground hover:bg-primary/5 hover:border-primary/30 hover:text-primary"
                                        )}
                                        onClick={() => setGarmentType(type)}
                                    >
                                        {t(`garments.${type}`)}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        {lastMeasurement && (
                            <Button
                                variant="outline"
                                className="w-full h-12 gap-3 font-bold rounded-xl border-2 border-border transition-all active:scale-95 hover:bg-muted"
                                onClick={applyLast}
                            >
                                <RotateCcw className="h-4 w-4" />
                                {t("measurements.last")}
                            </Button>
                        )}
                    </CardContent>
                </Card>

                <Card className="lg:col-span-8 component-card shadow-sm">
                    <CardHeader>
                        <div className="flex justify-between items-center relative z-10">
                            <div>
                                <CardTitle className="text-3xl font-lalezar text-primary tracking-wide">
                                    {t(`garments.${garmentType}`)}
                                </CardTitle>
                                <p className="text-sm font-bold text-muted-foreground mt-1 uppercase tracking-widest opacity-80">
                                    {selectedClientId ? clients?.find(c => c.id === selectedClientId)?.name : "---"}
                                </p>
                            </div>
                            {selectedClientId && (
                                <Badge variant="outline" className="px-4 py-1.5 text-[10px] font-bold border-2 rounded-full tracking-[0.2em]">
                                    {formData.length === 0 ? "NOUVEAU" : "EN SAISIE"}
                                </Badge>
                            )}
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8 py-4">
                            {Object.keys(formData).map((key) => (
                                <div key={key} className="space-y-3 group">
                                    <div className="flex justify-between items-center px-1">
                                        <Label htmlFor={key} className="text-sm font-bold text-muted-foreground group-focus-within:text-primary transition-colors flex items-center gap-2 uppercase tracking-[0.12em]">
                                            <span className="p-2 bg-muted border border-border rounded-lg group-focus-within:bg-primary/10 group-focus-within:border-primary/20 group-focus-within:text-primary transition-all">
                                                {measurementIcons[key]}
                                            </span>
                                            {t(`measurements.${key}`)}
                                        </Label>
                                    </div>
                                    <div className="relative group-focus-within:scale-[1.01] transition-all duration-300">
                                        <Input
                                            id={key}
                                            type="number"
                                            className={cn(
                                                "h-14 text-xl font-bold rounded-xl border-2 border-input bg-background focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary transition-all",
                                                isRTL ? "pl-14 pr-5 text-left" : "pr-14 pl-5 text-right"
                                            )}
                                            value={formData[key] || ""}
                                            onChange={(e) => setFormData(prev => ({ ...prev, [key]: Number(e.target.value) }))}
                                        />
                                        <div className={cn(
                                            "absolute top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-[10px] tracking-widest group-focus-within:text-primary transition-colors",
                                            isRTL ? "left-5" : "right-5"
                                        )}>
                                            Cm
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-10 flex flex-col gap-4 pt-6 border-t border-slate-100">
                            <Button
                                className="w-full h-16 text-xl font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl transition-all active:scale-95 bg-primary gap-3"
                                onClick={handleSave}
                                disabled={!selectedClientId || createMeasurement.isPending}
                            >
                                <Save className="h-7 w-7" />
                                {createMeasurement.isPending ? "..." : t("common.save")}
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full h-14 rounded-xl border-2 border-border hover:bg-muted transition-all active:scale-95"
                                onClick={() => setFormData({ shoulders: 0, chest: 0, waist: 0, hips: 0, length: 0, sleeves: 0, wrist: 0, neck: 0 })}
                            >
                                <Trash2 className="h-6 w-6 text-destructive/60" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
