import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
    CheckCircle2,
    TrendingUp,
    Users,
    LayoutDashboard,
    Smartphone,
    Globe,
    ShieldCheck,
    ChevronRight,
    Languages,
    ArrowRight,
    Sun,
    Moon
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/contexts/ThemeContext";

export default function LandingPage() {
    const { isRTL, setLanguage, language } = useLanguage();
    const { t } = useTranslation();
    const { theme, setTheme } = useTheme();

    const features = [
        {
            icon: LayoutDashboard,
            title: isRTL ? "لوحة التحكم" : "Tableau de Bord",
            description: isRTL ? "تابعي نشاطك التجاري في الوقت الفعلي." : "Suivez votre activité en temps réel."
        },
        {
            icon: TrendingUp,
            title: isRTL ? "الأداء والنمو" : "Performance",
            description: isRTL ? "تحليل دقيق للأرباح والمصاريف." : "Analyse précise des revenus et dépenses."
        },
        {
            icon: Users,
            title: isRTL ? "إدارة الزبائن" : "Gestion Clients",
            description: isRTL ? "قاعدة بيانات كاملة بجميع المقاسات." : "Base de données client avec mesures complètes."
        },
        {
            icon: Smartphone,
            title: isRTL ? "تطبيق للهاتف" : "Application Mobile",
            description: isRTL ? "إدارة كاملة للمشغل من هاتفك." : "Gérez votre atelier depuis votre mobile."
        },
        {
            icon: Globe,
            title: isRTL ? "لغات متعددة" : "Multi-langues",
            description: isRTL ? "دعم كامل للعربية والفرنسية." : "Support complet pour Arabe et Français."
        },
        {
            icon: ShieldCheck,
            title: isRTL ? "أمان تام" : "Sécurité Totale",
            description: isRTL ? "بياناتك مشفرة ومؤمنة بالكامل." : "Vos données sont chiffrées et sécurisées."
        }
    ];

    const pricing = [
        {
            name: "Starter",
            price: "199",
            features: ["50 Orders", "Client CRM", "Email Support"]
        },
        {
            name: "Pro",
            price: "399",
            features: ["Unlimited Orders", "Analytics", "Priority Support"],
            popular: true
        },
        {
            name: "Elite",
            price: "799",
            features: ["Multi-user", "API Access", "Custom Logo"]
        }
    ];

    return (
        <div className={cn("min-h-screen bg-background text-foreground selection:bg-primary/20", isRTL && "font-arabic")} dir={isRTL ? "rtl" : "ltr"}>
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
                <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
                    <div className="flex items-center">
                        <span className="text-4xl font-lalezar text-primary drop-shadow-sm select-none">
                            خياط برو
                        </span>
                    </div>

                    <nav className="hidden md:flex items-center gap-6 text-sm font-bold text-muted-foreground uppercase tracking-widest">
                        <a href="#features" className="hover:text-primary transition-colors">{t("landing.features.title")}</a>
                        <a href="#pricing" className="hover:text-primary transition-colors">{t("landing.pricing.title")}</a>

                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="rounded-full gap-2 px-4 h-10 border border-border"
                                onClick={() => setLanguage(language === "fr" ? "ar" : "fr")}
                            >
                                <Languages className="h-4 w-4 text-primary" />
                                <span className="font-bold">{language === "fr" ? "العربية" : "Français"}</span>
                            </Button>

                            <Button
                                variant="ghost"
                                size="icon"
                                className="rounded-full h-10 w-10 border border-border"
                                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                            >
                                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                            </Button>
                        </div>
                    </nav>

                    <div className="flex items-center gap-4">
                        <Button variant="ghost" className="font-bold hidden sm:flex" onClick={() => window.location.href = `http://admin.${window.location.host}`}>
                            Admin
                        </Button>
                        <Button className="bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 rounded-xl px-8 py-6 font-black text-lg">
                            {t("landing.hero.cta")}
                        </Button>
                    </div>
                </div>
            </header>

            {/* Hero */}
            <section className="pt-48 pb-32 px-6 relative overflow-hidden text-center">
                <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary/10 blur-[150px] rounded-full -z-10 animate-pulse" />
                <div className="max-w-7xl mx-auto">
                    <Badge variant="outline" className="mb-8 py-2 px-6 rounded-full border-primary/20 bg-primary/5 text-primary text-sm font-black uppercase tracking-widest">
                        {isRTL ? "أفضل منصة لإدارة الخياطة في المغرب" : "LA PLATEFORME N°1 DE COUTURE AU MAROC"}
                    </Badge>
                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-10 leading-[0.95] text-foreground">
                        {t("landing.hero.title")}
                    </h1>
                    <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-16 font-medium leading-relaxed">
                        {t("landing.hero.subtitle")}
                    </p>
                    <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                        <Button size="lg" className="h-20 px-12 text-2xl font-black rounded-xl bg-primary hover:bg-primary/90 shadow-2xl shadow-primary/40 gap-4 group">
                            {t("landing.hero.cta")} <ArrowRight className={cn("h-7 w-7 transition-transform", isRTL ? "rotate-180 group-hover:-translate-x-2" : "group-hover:translate-x-2")} />
                        </Button>
                        <Button variant="outline" size="lg" className="h-20 px-12 text-xl font-bold rounded-xl border-2 hover:bg-muted/50 border-border">
                            {t("landing.hero.demo")}
                        </Button>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section id="features" className="py-24 bg-muted/20">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-24">
                        <h2 className="text-5xl md:text-7xl font-black text-foreground mb-8">
                            {t("landing.features.title")}
                        </h2>
                        <p className="text-2xl text-muted-foreground font-medium">
                            {t("landing.features.subtitle")}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((f, i) => (
                            <div key={i} className="p-10 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-all hover:translate-y-[-5px] group shadow-sm">
                                <div className="h-16 w-16 bg-primary/10 rounded-xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 border border-primary/20">
                                    <f.icon className="h-8 w-8 text-primary" />
                                </div>
                                <h3 className="text-2xl font-black text-foreground mb-4">{f.title}</h3>
                                <p className="text-muted-foreground leading-relaxed text-lg font-medium">{f.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing */}
            <section id="pricing" className="py-24">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-24">
                        <h2 className="text-5xl md:text-7xl font-black text-foreground mb-8">{t("landing.pricing.title")}</h2>
                        <p className="text-2xl text-muted-foreground max-w-2xl mx-auto font-medium">{t("landing.pricing.subtitle")}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {pricing.map((p, i) => (
                            <Card key={i} className={cn(
                                "p-10 border-2 rounded-2xl transition-all relative",
                                p.popular ? "border-primary bg-card/50 shadow-xl shadow-primary/10 scale-105 z-10" : "border-border/50 bg-card/50"
                            )}>
                                <h3 className="text-2xl font-black text-foreground mb-3">{p.name}</h3>
                                <div className="flex items-baseline gap-2 mb-10">
                                    <span className="text-6xl font-black text-primary">{p.price}</span>
                                    <span className="text-lg text-muted-foreground font-black">{t("landing.pricing.month")}</span>
                                </div>
                                <div className="space-y-4 mb-10 font-bold text-lg">
                                    {p.features.map((feat, fi) => (
                                        <div key={fi} className="flex items-center gap-3">
                                            <div className="h-5 w-5 bg-primary/20 rounded-full flex items-center justify-center">
                                                <CheckCircle2 className="h-3 w-3 text-primary" />
                                            </div>
                                            <span className="text-foreground/80">{feat}</span>
                                        </div>
                                    ))}
                                </div>
                                <Button className={cn(
                                    "w-full h-16 rounded-xl font-black text-xl shadow-lg transition-transform active:scale-95",
                                    p.popular ? "bg-primary hover:bg-primary/90" : "bg-muted text-foreground"
                                )}>
                                    {t("landing.pricing.choose")}
                                </Button>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-20 border-t border-border/50 bg-muted/10">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-10 text-center md:text-left">
                    <span className="text-4xl font-lalezar text-primary select-none opacity-80 decoration-primary/20 underline underline-offset-8">خياط برو</span>
                    <p className="text-muted-foreground font-bold text-lg">© 2026 KHIYAT PRO. بصمتك في الأناقة.</p>
                    <div className="flex gap-8">
                        <Globe className="h-6 w-6 text-muted-foreground" />
                        <ShieldCheck className="h-6 w-6 text-muted-foreground" />
                    </div>
                </div>
            </footer>
        </div>
    );
}
