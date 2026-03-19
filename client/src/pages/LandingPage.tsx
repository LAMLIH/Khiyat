import { Link, useLocation } from "wouter";
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
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import { useRef } from "react";

export default function LandingPage() {
    const { isRTL, setLanguage, language } = useLanguage();
    const { t } = useTranslation();
    const { theme, setTheme } = useTheme();
    const [, setLocation] = useLocation();

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

    const handleStart = (plan?: string) => {
        setLocation(`/subscribe-request${plan ? `?plan=${plan}` : ""}`);
    };

    return (
        <div className={cn("min-h-screen bg-background text-foreground selection:bg-primary/20", isRTL && "font-arabic")} dir={isRTL ? "rtl" : "ltr"}>
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
                <div className="max-w-7xl mx-auto px-4 md:px-6 h-20 md:h-24 flex items-center justify-between">
                    <div className="flex items-center">
                        <span className="text-3xl md:text-4xl font-lalezar text-primary drop-shadow-sm select-none">
                            خياط برو
                        </span>
                    </div>

                    <nav className="hidden md:flex items-center gap-6 text-sm font-bold text-muted-foreground uppercase tracking-widest">
                        <a href="#features" className="hover:text-primary transition-colors">{t("landing.features.title")}</a>
                        <a href="#pricing" className="hover:text-primary transition-colors">{t("landing.pricing.title")}</a>
                    </nav>

                    <div className="flex items-center gap-2 md:gap-4">
                        <div className="flex items-center gap-1 md:gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="rounded-full gap-2 px-3 md:px-4 h-9 md:h-10 border border-border"
                                onClick={() => setLanguage(language === "fr" ? "ar" : "fr")}
                            >
                                <Languages className="h-4 w-4 text-primary" />
                                <span className="font-bold hidden xs:inline">{language === "fr" ? "العربية" : "Français"}</span>
                                <span className="font-bold xs:hidden uppercase">{language === "fr" ? "AR" : "FR"}</span>
                            </Button>

                            <Button
                                variant="ghost"
                                size="icon"
                                className="rounded-full h-9 w-9 md:h-10 md:w-10 border border-border"
                                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                            >
                                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                            </Button>
                        </div>
                        <Button 
                            className="hidden sm:flex bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 rounded-xl px-4 md:px-8 py-4 md:py-6 font-black text-sm md:text-lg"
                            onClick={() => handleStart()}
                        >
                            {t("landing.hero.cta")}
                        </Button>
                    </div>
                </div>
            </header>

            {/* Hero */}
            <section className="pt-32 md:pt-48 pb-20 md:pb-32 px-4 md:px-6 relative overflow-hidden text-center">
                <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary/10 blur-[150px] rounded-full -z-10 animate-pulse" />
                <div className="max-w-7xl mx-auto">
                    <Badge variant="outline" className="mb-6 md:mb-8 py-2 px-4 md:px-6 rounded-full border-primary/20 bg-primary/5 text-primary text-[10px] md:text-sm font-black uppercase tracking-widest">
                        {isRTL ? "أفضل منصة لإدارة الخياطة في المغرب" : "LA PLATEFORME N°1 DE COUTURE AU MAROC"}
                    </Badge>
                    <h1 className="text-4xl md:text-8xl font-black tracking-tighter mb-8 md:mb-10 leading-[1.1] md:leading-[0.95] text-foreground">
                        {t("landing.hero.title")}
                    </h1>
                    <p className="text-lg md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12 md:mb-16 font-medium leading-relaxed">
                        {t("landing.hero.subtitle")}
                    </p>
                    <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6">
                        <Button 
                            size="lg" 
                            className="w-full md:w-auto h-16 md:h-20 px-8 md:px-12 text-xl md:text-2xl font-black rounded-xl bg-primary hover:bg-primary/90 shadow-2xl shadow-primary/40 gap-4 group"
                            onClick={() => handleStart()}
                        >
                            {t("landing.hero.cta")} <ArrowRight className={cn("h-6 w-6 md:h-7 md:w-7 transition-transform", isRTL ? "rotate-180 group-hover:-translate-x-2" : "group-hover:translate-x-2")} />
                        </Button>
                        <Button variant="outline" size="lg" className="w-full md:w-auto h-16 md:h-20 px-8 md:px-12 text-lg md:text-xl font-bold rounded-xl border-2 hover:bg-muted/50 border-border">
                            {t("landing.hero.demo")}
                        </Button>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section id="features" className="py-20 md:py-24 bg-muted/20">
                <div className="max-w-7xl mx-auto px-4 md:px-6">
                    <div className="text-center mb-16 md:mb-24">
                        <h2 className="text-4xl md:text-7xl font-black text-foreground mb-6 md:mb-8">
                            {t("landing.features.title")}
                        </h2>
                        <p className="text-lg md:text-2xl text-muted-foreground font-medium">
                            {t("landing.features.subtitle")}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        {features.map((f, i) => (
                            <div key={i} className="p-8 md:p-10 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-all hover:translate-y-[-5px] group shadow-sm">
                                <div className="h-14 w-14 md:h-16 md:w-16 bg-primary/10 rounded-xl flex items-center justify-center mb-6 md:mb-8 group-hover:scale-110 transition-transform duration-500 border border-primary/20">
                                    <f.icon className="h-7 w-7 md:h-8 md:w-8 text-primary" />
                                </div>
                                <h3 className="text-xl md:text-2xl font-black text-foreground mb-3">{f.title}</h3>
                                <p className="text-muted-foreground leading-relaxed text-base md:text-lg font-medium">{f.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Trusted By Section - Now with Navigation */}
            <section className="py-16 md:py-20 border-y border-border/50 bg-muted/5 font-arabic overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 md:px-6">
                    <p className="text-[10px] md:text-sm font-bold text-center text-muted-foreground uppercase tracking-[0.3em] mb-12 md:mb-16 opacity-70">
                        {isRTL ? "محلّات ومصممون يثقون في خياط برو" : "Des ateliers et créateurs qui nous font confiance"}
                    </p>
                    
                    <div className="relative px-12 md:px-20">
                        <Carousel
                            opts={{
                                align: "start",
                                loop: true,
                            }}
                            className="w-full"
                        >
                            <CarouselContent className="-ml-4 md:-ml-8 items-center">
                                {/* LamlihCaftan - New Client */}
                                <CarouselItem className="pl-4 md:pl-8 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                                    <div className="flex items-center justify-center gap-3 font-serif italic text-2xl md:text-3xl group cursor-pointer hover:scale-110 transition-transform duration-500">
                                        <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-amber-200 to-amber-600 flex items-center justify-center text-white text-xl md:text-2xl font-bold shadow-lg shadow-amber-500/20">LC</div>
                                        <span className="not-italic font-black bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-amber-400">LamlihCaftan</span>
                                    </div>
                                </CarouselItem>

                                <CarouselItem className="pl-4 md:pl-8 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                                    <div className="flex items-center justify-center gap-3 font-lalezar text-2xl md:text-3xl grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                                        <div className="w-10 h-10 md:w-12 md:h-12 rounded bg-primary/20 flex items-center justify-center text-primary text-xl md:text-2xl font-bold">L</div>
                                        L'Artisanat
                                    </div>
                                </CarouselItem>

                                <CarouselItem className="pl-4 md:pl-8 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                                    <div className="flex items-center justify-center gap-3 font-serif italic text-2xl md:text-3xl grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-foreground/10 flex items-center justify-center text-foreground text-xl md:text-2xl not-italic">S</div>
                                        Sultan Style
                                    </div>
                                </CarouselItem>

                                <CarouselItem className="pl-4 md:pl-8 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                                    <div className="flex items-center justify-center gap-3 font-sans font-black text-2xl md:text-3xl grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                                        <div className="w-10 h-10 md:w-12 md:h-12 transform rotate-45 bg-primary/30 flex items-center justify-center text-primary text-xl md:text-2xl -rotate-45">M</div>
                                        Moda Maghreb
                                    </div>
                                </CarouselItem>

                                <CarouselItem className="pl-4 md:pl-8 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                                    <div className="flex items-center justify-center gap-3 font-bold text-2xl md:text-3xl grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-muted border border-border flex items-center justify-center text-muted-foreground text-xl md:text-2xl">F</div>
                                        Fassi Couture
                                    </div>
                                </CarouselItem>
                            </CarouselContent>
                            
                            {/* Navigation Controls */}
                            <CarouselPrevious className="hidden md:flex -left-4 bg-background border-border hover:bg-primary hover:text-white transition-all scale-125 shadow-xl" />
                            <CarouselNext className="hidden md:flex -right-4 bg-background border-border hover:bg-primary hover:text-white transition-all scale-125 shadow-xl" />
                        </Carousel>
                        
                        {/* Mobile Indicators hint */}
                        <div className="mt-8 flex justify-center gap-2 md:hidden">
                            <div className="h-1 w-8 rounded-full bg-primary" />
                            <div className="h-1 w-2 rounded-full bg-border" />
                            <div className="h-1 w-2 rounded-full bg-border" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing */}
            <section id="pricing" className="py-20 md:py-24">
                <div className="max-w-7xl mx-auto px-4 md:px-6">
                    <div className="text-center mb-16 md:mb-24">
                        <h2 className="text-4xl md:text-7xl font-black text-foreground mb-6 md:mb-8">{t("landing.pricing.title")}</h2>
                        <p className="text-lg md:text-2xl text-muted-foreground max-w-2xl mx-auto font-medium">{t("landing.pricing.subtitle")}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                        {pricing.map((p, i) => (
                            <Card key={i} className={cn(
                                "p-8 md:p-10 border-2 rounded-2xl transition-all relative flex flex-col",
                                p.popular ? "border-primary bg-card/50 shadow-xl shadow-primary/10 md:scale-105 z-10" : "border-border/50 bg-card/50"
                            )}>
                                <h3 className="text-xl md:text-2xl font-black text-foreground mb-2 md:mb-3">{p.name}</h3>
                                <div className="flex items-baseline gap-2 mb-8 md:mb-10">
                                    <span className="text-5xl md:text-6xl font-black text-primary">{p.price}</span>
                                    <span className="text-base md:text-lg text-muted-foreground font-black">{t("landing.pricing.month")}</span>
                                </div>
                                <div className="space-y-3 md:space-y-4 mb-8 md:mb-10 font-bold text-base md:text-lg flex-1">
                                    {p.features.map((feat, fi) => (
                                        <div key={fi} className="flex items-center gap-3">
                                            <div className="h-5 w-5 bg-primary/20 rounded-full flex items-center justify-center">
                                                <CheckCircle2 className="h-3 w-3 text-primary" />
                                            </div>
                                            <span className="text-foreground/80">{feat}</span>
                                        </div>
                                    ))}
                                </div>
                                <Button 
                                    className={cn(
                                        "w-full h-14 md:h-16 rounded-xl font-black text-lg md:text-xl shadow-lg transition-transform active:scale-95",
                                        p.popular ? "bg-primary hover:bg-primary/90" : "bg-muted text-foreground"
                                    )}
                                    onClick={() => handleStart(p.name)}
                                >
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
