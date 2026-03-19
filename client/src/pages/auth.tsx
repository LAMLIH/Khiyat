import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema, type InsertUser } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Lock, User, Scissors, Languages } from "lucide-react";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

export default function AuthPage() {
    const { t } = useTranslation();
    const { isRTL, setLanguage, language } = useLanguage();
    const { user, login, isLoading } = useAuth();
    const [, setLocation] = useLocation();

    useEffect(() => {
        if (user) {
            setLocation("/");
        }
    }, [user, setLocation]);

    const form = useForm<Pick<InsertUser, "username" | "password">>({
        resolver: zodResolver(insertUserSchema.pick({ username: true, password: true }) as any),
        defaultValues: {
            username: "",
            password: "",
        },
    });

    const onSubmit = async (data: Pick<InsertUser, "username" | "password">) => {
        await login(data);
    };

    return (
        <div className={cn("min-h-screen grid lg:grid-cols-2 bg-background relative overflow-hidden transition-colors duration-500", isRTL && "font-arabic")}>
            {/* Desktop Left side (Branding) - Elegant Dark Theme */}
            <div className="hidden lg:flex flex-col items-center justify-center bg-card/30 text-foreground p-12 relative overflow-hidden border-r border-border/20 z-20">
                {/* Subtle background glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
                
                <div className="relative z-10 text-center flex flex-col items-center">
                    <div className="mb-8 flex flex-col items-center gap-1 animate-in zoom-in slide-in-from-top-4 duration-1000">
                        <div className="p-8 bg-primary/10 rounded-[2.5rem] border border-primary/20 shadow-2xl mb-8">
                            <Scissors className="h-24 w-24 text-primary" />
                        </div>
                        <h1 className="text-[10rem] font-lalezar text-foreground tracking-widest drop-shadow-xl leading-none mb-4">خياط برو</h1>
                        <div className="inline-flex items-center gap-6">
                            <div className="h-[1px] w-20 bg-primary/30" />
                            <span className="text-3xl text-muted-foreground font-medium tracking-[0.5em] uppercase">بصمتك في الأناقة</span>
                            <div className="h-[1px] w-20 bg-primary/30" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Right side / Mobile View */}
            <div className="w-full min-h-screen lg:min-h-0 flex items-center justify-center p-4 sm:p-8 bg-background lg:bg-transparent relative z-10 transition-colors">
                {/* Global subtle glow */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-[-10%] right-[-10%] w-[80%] h-[80%] rounded-full bg-primary/5 blur-[120px]" />
                </div>

                <div className="w-full max-w-[440px] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {/* Brand Header for Mobile / Sidebar for Web mobile-feel */}
                    <div className="text-center mb-10 flex flex-col items-center gap-2 lg:hidden">
                        <div className="p-4 bg-primary/10 rounded-2xl mb-2">
                            <Scissors className="h-10 w-10 text-primary" />
                        </div>
                        <div className="text-6xl font-lalezar text-foreground tracking-wider">خياط برو</div>
                        <div className="text-[10px] text-muted-foreground font-bold tracking-[0.4em] uppercase">بصمتك في الأناقة</div>
                    </div>

                    <Card className="border-border/40 rounded-[3rem] overflow-hidden shadow-2xl bg-card/40 backdrop-blur-3xl border-2">
                        <CardHeader className="pt-12 pb-6 text-center border-b border-border/10">
                            <CardTitle className="text-4xl font-lalezar text-foreground tracking-wide">
                                {isRTL ? "تسجيل الدخول" : "Connexion"}
                            </CardTitle>
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.3em] mt-3 opacity-60">
                                {isRTL ? "مرحباً بك مجدداً" : "Accès Personnel"}
                            </p>
                        </CardHeader>
                        <CardContent className="p-8 sm:p-12 pt-10">
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                    <FormField
                                        control={form.control}
                                        name="username"
                                        render={({ field }: { field: any }) => (
                                            <FormItem className="space-y-3">
                                                <FormLabel className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] ml-1">
                                                    {isRTL ? "اسم المستخدم" : "Identifiant"}
                                                </FormLabel>
                                                <FormControl>
                                                    <div className="relative group">
                                                        <div className={cn(
                                                            "absolute inset-y-0 flex items-center px-4 pointer-events-none text-muted-foreground/30 group-focus-within:text-primary transition-colors",
                                                            isRTL ? "right-0" : "left-0"
                                                        )}>
                                                            <User className="h-5 w-5" />
                                                        </div>
                                                        <Input
                                                            placeholder="admin"
                                                            {...field}
                                                            className={cn(
                                                                "h-14 bg-background/50 border-border/40 text-foreground font-medium text-lg focus-visible:ring-primary/20",
                                                                isRTL ? "pr-12 text-right" : "pl-12"
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
                                            <FormItem className="space-y-3">
                                                <FormLabel className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] ml-1">
                                                    {isRTL ? "كلمة المرور" : "Mot de passe"}
                                                </FormLabel>
                                                <FormControl>
                                                    <div className="relative group">
                                                        <div className={cn(
                                                            "absolute inset-y-0 flex items-center px-4 pointer-events-none text-muted-foreground/30 group-focus-within:text-primary transition-colors",
                                                            isRTL ? "right-0" : "left-0"
                                                        )}>
                                                            <Lock className="h-5 w-5" />
                                                        </div>
                                                        <Input
                                                            type="password"
                                                            placeholder="••••••••"
                                                            {...field}
                                                            className={cn(
                                                                "h-14 bg-background/50 border-border/40 text-foreground font-medium text-lg focus-visible:ring-primary/20",
                                                                isRTL ? "pr-12 text-right" : "pl-12"
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
                                        className="w-full h-14 text-lg font-black rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-[0.98] mt-8 bg-primary hover:bg-primary/80 text-white border-0"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? "..." : (isRTL ? "تسجيل الدخول" : "Se connecter")}
                                    </Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>

                    <div className="mt-12 flex justify-center">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-full gap-3 px-8 h-12 text-muted-foreground hover:text-foreground hover:bg-white/5 border border-border/20 transition-all backdrop-blur-sm"
                            onClick={() => setLanguage(language === "fr" ? "ar" : "fr")}
                        >
                            <Languages className="h-5 w-5 text-primary" />
                            <span className="font-bold text-sm uppercase tracking-widest">{language === "fr" ? "العربية" : "Français"}</span>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
