import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema, type InsertUser } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Lock, User, Languages, Scissors, BarChart3, Users, ShoppingBag, Ruler, Package, Calendar, TrendingUp } from "lucide-react";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import brandLogo from "@/assets/brand-logo.png";

const TEAL = "#1c918f";

const features = [
    { icon: Scissors,    label_ar: "إدارة الطلبات",       label_fr: "Gestion des commandes" },
    { icon: Users,       label_ar: "قاعدة الزبائن",        label_fr: "Base de clients" },
    { icon: BarChart3,   label_ar: "الإحصائيات والتقارير", label_fr: "Statistiques & rapports" },
    { icon: ShoppingBag, label_ar: "تتبع المصاريف",         label_fr: "Suivi des dépenses" },
    { icon: Ruler,       label_ar: "سجل القياسات",          label_fr: "Registre des mesures" },
    { icon: Package,     label_ar: "إدارة المنتجات",        label_fr: "Gestion produits" },
    { icon: Calendar,    label_ar: "تتبع المواعيد",          label_fr: "Suivi des délais" },
    { icon: TrendingUp,  label_ar: "تحليل الأرباح",          label_fr: "Analyse des bénéfices" },
];

export default function AuthPage() {
    const { t } = useTranslation();
    const { isRTL, setLanguage, language } = useLanguage();
    const { user, login, isLoading } = useAuth();
    const [, setLocation] = useLocation();

    useEffect(() => {
        if (user) setLocation("/");
    }, [user, setLocation]);

    const form = useForm<Pick<InsertUser, "username" | "password">>({
        resolver: zodResolver(insertUserSchema.pick({ username: true, password: true }) as any),
        defaultValues: { username: "", password: "" },
    });

    const onSubmit = async (data: Pick<InsertUser, "username" | "password">) => {
        await login(data);
    };

    return (
        <div className={cn("min-h-screen flex bg-[#09090b] relative overflow-hidden", isRTL && "font-arabic")} dir={isRTL ? "rtl" : "ltr"}>

            {/* ── Left / Branding panel ── */}
            <div className="hidden lg:flex w-[46%] flex-col relative overflow-hidden">
                {/* Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#0f1f1f] via-[#0a1a1a] to-[#09090b]" />

                {/* Decorative grid */}
                <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>

                {/* Glow orbs */}
                <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full blur-[120px] opacity-20" style={{ background: TEAL }} />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[100px] opacity-10" style={{ background: TEAL }} />

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-between h-full p-12">
                    {/* Logo top */}
                    <div className="flex flex-col items-start gap-1">
                        <img src={brandLogo} alt="Khayat Pro" className="h-16 w-auto object-contain invert" />
                        <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mr-1">بصمتك في الأناقة.</span>
                    </div>

                    {/* Center copy */}
                    <div className="space-y-10 max-w-sm">
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#1c918f]/30 bg-[#1c918f]/10 text-[#1c918f] text-[11px] font-black uppercase tracking-widest">
                                <div className="h-1.5 w-1.5 rounded-full bg-[#1c918f] animate-pulse" />
                                {isRTL ? "المنصة الأولى في المغرب" : "N°1 au Maroc"}
                            </div>
                            <h1 className="text-5xl font-black text-white leading-tight font-lalezar">
                                {isRTL ? "إدارة مشغلك بطريقة ذكية" : "Gérez votre atelier intelligemment"}
                            </h1>
                            <p className="text-white/40 text-base font-medium leading-relaxed">
                                {isRTL
                                    ? "خياط برو — نظام متكامل للخياطة. من الطلبات إلى المالية، كل شيء في مكان واحد."
                                    : "Khiyat Pro — solution complète pour les ateliers de couture. Commandes, clients, finances, tout en un."}
                            </p>
                        </div>

                        {/* Feature pills – 4 cols */}
                        <div className="grid grid-cols-2 gap-3">
                            {features.map((f, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.07] transition-colors">
                                    <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${TEAL}20` }}>
                                        <f.icon className="h-4 w-4" style={{ color: TEAL }} />
                                    </div>
                                    <span className="text-xs font-bold text-white/60 leading-tight">
                                        {isRTL ? f.label_ar : f.label_fr}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Bottom tagline */}
                    <p className="text-white/20 text-xs font-bold uppercase tracking-[0.2em]">
                        © 2026 KHIYAT PRO
                    </p>
                </div>

                {/* Right edge separator */}
                <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-[#1c918f]/20 to-transparent" />
            </div>

            {/* ── Right / Form panel ── */}
            <div className="flex-1 flex items-center justify-center p-6 sm:p-10 relative">
                {/* Subtle background glow */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[160px] opacity-[0.04]" style={{ background: TEAL }} />
                </div>

                <div className="w-full max-w-[400px] animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8 relative z-10">

                    {/* Mobile logo */}
                    <div className="flex flex-col items-center gap-2 lg:hidden mb-6">
                        <img src={brandLogo} alt="Khayat Pro" className="h-28 w-auto object-contain dark:invert" />
                        <span className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest">بصمتك في الأناقة.</span>
                    </div>

                    {/* Heading */}
                    <div className="space-y-1.5">
                        <h2 className="text-3xl font-black text-white tracking-tight font-lalezar">
                            {isRTL ? "تسجيل الدخول" : "Connexion"}
                        </h2>
                        <p className="text-white/35 text-sm font-medium">
                            {isRTL ? "أدخل بيانات حسابك للمتابعة" : "Entrez vos identifiants pour continuer"}
                        </p>
                    </div>

                    {/* Form card */}
                    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-7 space-y-5 backdrop-blur-sm">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                                <FormField
                                    control={form.control}
                                    name="username"
                                    render={({ field }: { field: any }) => (
                                        <FormItem className="space-y-2">
                                            <FormLabel className="text-sm font-bold text-white/60">
                                                {isRTL ? "اسم المستخدم" : "Identifiant"}
                                            </FormLabel>
                                            <FormControl>
                                                <div className="relative group">
                                                    <div className={cn(
                                                        "absolute inset-y-0 flex items-center px-4 pointer-events-none text-white/20 group-focus-within:text-[#1c918f] transition-colors",
                                                        isRTL ? "right-0" : "left-0"
                                                    )}>
                                                        <User className="h-4 w-4" />
                                                    </div>
                                                    <Input
                                                        placeholder="admin"
                                                        {...field}
                                                        className={cn(
                                                            "h-12 bg-white/[0.05] border-white/[0.08] text-white placeholder:text-white/20 font-medium focus-visible:border-[#1c918f]/50 focus-visible:ring-[#1c918f]/10 rounded-xl",
                                                            isRTL ? "pr-11 text-right" : "pl-11"
                                                        )}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage className="text-[10px] font-bold" />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }: { field: any }) => (
                                        <FormItem className="space-y-2">
                                            <FormLabel className="text-sm font-bold text-white/60">
                                                {isRTL ? "كلمة المرور" : "Mot de passe"}
                                            </FormLabel>
                                            <FormControl>
                                                <div className="relative group">
                                                    <div className={cn(
                                                        "absolute inset-y-0 flex items-center px-4 pointer-events-none text-white/20 group-focus-within:text-[#1c918f] transition-colors",
                                                        isRTL ? "right-0" : "left-0"
                                                    )}>
                                                        <Lock className="h-4 w-4" />
                                                    </div>
                                                    <Input
                                                        type="password"
                                                        placeholder="••••••••"
                                                        {...field}
                                                        className={cn(
                                                            "h-12 bg-white/[0.05] border-white/[0.08] text-white placeholder:text-white/20 font-medium focus-visible:border-[#1c918f]/50 focus-visible:ring-[#1c918f]/10 rounded-xl",
                                                            isRTL ? "pr-11 text-right" : "pl-11"
                                                        )}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage className="text-[10px] font-bold" />
                                        </FormItem>
                                    )}
                                />

                                <Button
                                    type="submit"
                                    className="w-full h-12 text-base font-black rounded-xl shadow-lg transition-all active:scale-[0.98] mt-2 text-white border-0"
                                    style={{ background: TEAL, boxShadow: `0 8px 24px ${TEAL}33` }}
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <div className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                                    ) : (
                                        isRTL ? "تسجيل الدخول" : "Se connecter"
                                    )}
                                </Button>
                            </form>
                        </Form>
                    </div>

                    {/* Language switcher */}
                    <div className="flex justify-center">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-full gap-2 px-6 h-10 text-white/40 hover:text-white/70 hover:bg-white/5 border border-white/[0.06] transition-all text-sm font-semibold"
                            onClick={() => setLanguage(language === "fr" ? "ar" : "fr")}
                        >
                            <Languages className="h-4 w-4 text-[#1c918f]" />
                            {language === "fr" ? "العربية" : "Français"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
