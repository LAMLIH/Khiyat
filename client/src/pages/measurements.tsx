import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
    Scissors,
    ChevronRight,
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
    Ruler
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useMeasurements } from "@/hooks/use-measurements";
import { useClients } from "@/hooks/use-clients";
import { type Client, type Measurement, garmentTypes } from "@shared/schema";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

export default function MeasurementsPage() {
    const { t } = useTranslation();
    const { isRTL } = useLanguage();
    const { clients } = useClients();
    const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
    const [garmentType, setGarmentType] = useState<typeof garmentTypes[number]>("Caftan");
    const { measurements, createMeasurement } = useMeasurements(selectedClientId || 0);

    const [formData, setFormData] = useState<Record<string, number>>({
        shoulders: 0,
        chest: 0,
        waist: 0,
        hips: 0,
        length: 0,
        sleeves: 0,
        wrist: 0,
        neck: 0,
    });

    const lastMeasurement = measurements?.find((m: Measurement) => m.garmentType === garmentType);

    const applyLast = () => {
        if (lastMeasurement) {
            setFormData(lastMeasurement.data);
        }
    };

    const handleSave = () => {
        if (!selectedClientId) return;
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
                            <Select onValueChange={(val) => setSelectedClientId(Number(val))}>
                                <SelectTrigger className="h-14 rounded-xl border-2 border-slate-200 bg-background font-medium hover:border-primary/30 transition-all">
                                    <SelectValue placeholder={t("common.search")} />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-2 shadow-xl">
                                    {clients?.map((c: Client) => (
                                        <SelectItem key={c.id} value={c.id.toString()} className="rounded-lg my-1">{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
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
                                                : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-primary/5 hover:border-primary/30 hover:text-primary"
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
                                className="w-full h-12 gap-3 font-bold rounded-xl border-2 border-slate-200 transition-all active:scale-95 hover:bg-slate-50"
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
                                <p className="text-sm font-bold text-slate-700 mt-1 uppercase tracking-widest opacity-60">
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-10 py-4">
                            {Object.keys(formData).map((key) => (
                                <div key={key} className="space-y-4 group">
                                    <div className="flex justify-between items-center px-1">
                                        <Label htmlFor={key} className="text-sm font-bold text-slate-500 group-focus-within:text-primary transition-colors flex items-center gap-3 uppercase tracking-widest">
                                            <span className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl group-focus-within:bg-primary/10 group-focus-within:border-primary/20 group-focus-within:text-primary transition-all">
                                                {measurementIcons[key]}
                                            </span>
                                            {t(`measurements.${key}`)}
                                        </Label>
                                    </div>
                                    <div className="relative group-focus-within:scale-[1.01] transition-transform duration-300">
                                        <Input
                                            id={key}
                                            type="number"
                                            className={cn(
                                                "h-16 text-2xl font-bold",
                                                isRTL ? "pl-16 pr-6" : "pr-16 pl-6"
                                            )}
                                            value={formData[key] || ""}
                                            onChange={(e) => setFormData(prev => ({ ...prev, [key]: Number(e.target.value) }))}
                                        />
                                        <div className={cn(
                                            "absolute top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm tracking-widest group-focus-within:text-primary transition-colors",
                                            isRTL ? "left-6" : "right-6"
                                        )}>
                                            CM
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-10 flex flex-col md:flex-row gap-4 pt-6 border-t border-slate-100">
                            <Button
                                size="lg"
                                className="flex-1 h-14 text-lg font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl transition-all active:scale-95 bg-primary gap-3"
                                onClick={handleSave}
                                disabled={!selectedClientId || createMeasurement.isPending}
                            >
                                <Save className="h-6 w-6" />
                                {createMeasurement.isPending ? "..." : t("common.save")}
                            </Button>
                            <Button
                                variant="outline"
                                size="lg"
                                className="px-10 h-14 rounded-xl border-2 border-slate-200 hover:bg-slate-50 transition-all active:scale-95"
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
