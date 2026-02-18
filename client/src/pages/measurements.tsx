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
        <div className="p-6 space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight text-foreground flex items-center gap-3">
                        <span className="p-3 bg-primary/10 rounded-2xl shadow-inner">
                            <Scissors className="h-8 w-8 text-primary animate-pulse" />
                        </span>
                        {t("common.measurements")}
                    </h1>
                    <p className="text-muted-foreground mt-2 text-lg">
                        {isRTL ? "تسجيل وإدارة قياسات الزبناء حسب نوع اللباس" : "Enregistrez et gérez les mesures par type d'habit."}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <Card className="lg:col-span-4 rounded-[32px] border-2 bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <Info className="h-6 w-6 text-primary" />
                            {isRTL ? "اختيار الزبون واللباس" : "Sélection Client & Habit"}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        <div className="space-y-3">
                            <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">{t("common.clients")}</Label>
                            <Select onValueChange={(val) => setSelectedClientId(Number(val))}>
                                <SelectTrigger className="h-14 rounded-xl border-2 bg-background/50 hover:border-primary/50 transition-all">
                                    <SelectValue placeholder={t("common.search")} />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl">
                                    {clients?.map((c: Client) => (
                                        <SelectItem key={c.id} value={c.id.toString()} className="rounded-xl my-1">{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-3">
                            <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">{isRTL ? "نوع اللباس" : "Type d'habit"}</Label>
                            <div className="grid grid-cols-2 gap-3">
                                {garmentTypes.map(type => (
                                    <Button
                                        key={type}
                                        variant={garmentType === type ? "default" : "outline"}
                                        className={cn(
                                            "h-14 rounded-xl border-2 font-bold transition-all text-sm",
                                            garmentType === type ? "bg-primary text-primary-foreground border-primary" : "hover:border-primary/30 hover:bg-primary/5"
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
                                variant="secondary"
                                className="w-full h-14 rounded-xl gap-3 font-bold border-2 border-secondary hover:border-primary/20 transition-all group"
                                onClick={applyLast}
                            >
                                <RotateCcw className="h-5 w-5 transition-transform group-hover:rotate-180 duration-500" />
                                {t("measurements.last")}
                            </Button>
                        )}
                    </CardContent>
                </Card>

                <Card className="lg:col-span-8 rounded-[32px] border-2 overflow-hidden bg-background shadow-sm">
                    <div className="absolute top-0 right-0 p-8 opacity-5 -mr-10 -mt-10 pointer-events-none">
                        <Scissors size={240} />
                    </div>

                    <CardHeader className="p-8 pb-0">
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle className="text-3xl font-semibold">
                                    {t(`garments.${garmentType}`)}
                                </CardTitle>
                                <p className="text-sm text-primary font-bold mt-1 uppercase tracking-widest opacity-70">
                                    {selectedClientId ? clients?.find(c => c.id === selectedClientId)?.name : "---"}
                                </p>
                            </div>
                            <Badge variant="outline" className="bg-background px-6 py-2 rounded-2xl border-2 text-primary font-bold text-sm">
                                {formData.length === 0 ? "NOUVEAU" : "EN SAISIE"}
                            </Badge>
                        </div>
                    </CardHeader>

                    <CardContent className="p-8 md:p-12">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                            {Object.keys(formData).map((key) => (
                                <div key={key} className="space-y-4 group">
                                    <div className="flex justify-between items-center px-1">
                                        <Label htmlFor={key} className="text-lg font-bold text-foreground group-focus-within:text-primary transition-colors flex items-center gap-3">
                                            <span className="p-2 bg-muted rounded-xl group-focus-within:bg-primary/10 group-focus-within:text-primary transition-all">
                                                {measurementIcons[key]}
                                            </span>
                                            {t(`measurements.${key}`)}
                                        </Label>
                                    </div>
                                    <div className="relative group-focus-within:scale-[1.02] transition-transform duration-300">
                                        <Input
                                            id={key}
                                            type="number"
                                            className="h-14 text-2xl font-bold rounded-xl border-2 border-muted/60 focus-visible:ring-primary focus-visible:border-primary focus-visible:ring-offset-0 transition-all bg-background/50 pl-6 pr-16"
                                            value={formData[key] || ""}
                                            onChange={(e) => setFormData(prev => ({ ...prev, [key]: Number(e.target.value) }))}
                                        />
                                        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-lg opacity-20 group-focus-within:opacity-40 transition-opacity">
                                            CM
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-12 flex gap-4">
                            <Button
                                size="lg"
                                className="flex-1 h-14 text-xl rounded-xl gap-3 transition-all active:scale-95 font-bold"
                                onClick={handleSave}
                                disabled={!selectedClientId || createMeasurement.isPending}
                            >
                                <Save className="h-6 w-6" />
                                {createMeasurement.isPending ? "..." : t("common.save")}
                            </Button>
                            <Button
                                variant="outline"
                                size="lg"
                                className="h-14 text-xl rounded-xl px-10 border-2 hover:bg-destructive/5 hover:text-destructive hover:border-destructive transition-all"
                                onClick={() => setFormData({ shoulders: 0, chest: 0, waist: 0, hips: 0, length: 0, sleeves: 0, wrist: 0, neck: 0 })}
                            >
                                <Trash2 className="h-6 w-6" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
