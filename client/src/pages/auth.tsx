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

import logo from "@/assets/logo-light.png";

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
        <div className="min-h-screen grid lg:grid-cols-2 bg-[#f8fafc] dark:bg-slate-950 relative overflow-hidden font-sans">
            {/* Background Decorative patterns for the whole page */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20 dark:opacity-10">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[120px]" />
            </div>

            {/* Left side (Branding - Desktop) */}
            <div className="hidden lg:flex flex-col items-center justify-center bg-primary text-primary-foreground p-12 relative overflow-hidden shadow-[20px_0_40px_rgba(0,0,0,0.1)] z-20">
                {/* Internal branding decorative elements */}
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent)]" />
                <div className="absolute -top-24 -left-24 w-64 h-64 border-4 border-white/5 rounded-full" />
                <div className="absolute -bottom-24 -right-24 w-96 h-96 border-4 border-white/5 rounded-full" />

                <div className="relative z-10 text-center flex flex-col items-center">
                    <div className="mb-8 flex flex-col items-center gap-1 animate-in zoom-in slide-in-from-top-4 duration-1000">
                        <div className="p-5 bg-white/10 backdrop-blur-md rounded-[2.5rem] border border-white/20 shadow-2xl mb-6">
                            <Scissors className="h-16 w-16 text-white" />
                        </div>
                        <h1 className="text-9xl font-lalezar text-white tracking-widest drop-shadow-[0_10px_10px_rgba(0,0,0,0.3)] leading-none mb-4">خياط برو</h1>
                        <div className="inline-flex items-center gap-3">
                            <div className="h-[1px] w-8 bg-white/40" />
                            <span className="text-xl text-white/90 font-medium tracking-[0.4em] uppercase">بصمتك في الأناقة</span>
                            <div className="h-[1px] w-8 bg-white/40" />
                        </div>
                    </div>
                    
                    <div className="mt-12 max-w-sm text-white/70 text-lg font-medium leading-relaxed italic opacity-80">
                        {isRTL 
                            ? "نظام إدارة المشغل المتكامل للمحترفين." 
                            : "Le système de gestion d'atelier complet pour les professionnels."}
                    </div>
                </div>
            </div>

            {/* Right side (Form) */}
            <div className="w-full flex items-center justify-center p-4 sm:p-8 md:p-12 relative z-10">
                <div className="w-full max-w-md flex flex-col">
                    {/* Mobile Branding - only shows on small screens */}
                    <div className="lg:hidden text-center mb-8 flex flex-col items-center gap-1">
                        <div className="p-4 bg-primary/10 rounded-3xl mb-4">
                            <Scissors className="h-10 w-10 text-primary" />
                        </div>
                        <div className="text-6xl font-lalezar text-primary tracking-wider animate-in zoom-in duration-700">خياط برو</div>
                        <div className="text-xs text-primary/60 font-black tracking-[0.3em] uppercase opacity-80">بصمتك في الأناقة</div>
                    </div>

                    <div className="relative">
                        {/* Decorative glow behind card */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-emerald-500/20 rounded-[2rem] blur-xl opacity-50 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                        
                        <Card className="relative border-border/40 rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.1)] bg-card/90 backdrop-blur-xl border-2">
                            <CardHeader className="pt-12 pb-6 text-center border-b border-border/30 bg-muted/5">
                                <CardTitle className="text-4xl font-lalezar text-primary tracking-wide">
                                    {isRTL ? "تسجيل الدخول" : "Connexion"}
                                </CardTitle>
                                <p className="text-sm text-muted-foreground font-black uppercase tracking-[0.2em] mt-3 opacity-50">
                                    {isRTL ? "مرحباً بك مجدداً" : "Accès Personnel"}
                                </p>
                            </CardHeader>
                            <CardContent className="p-8 sm:p-10 pb-12">
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                        <FormField
                                            control={form.control}
                                            name="username"
                                            render={({ field }: { field: any }) => (
                                                <FormItem className="space-y-3">
                                                    <FormLabel className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">
                                                        {isRTL ? "اسم المستخدم" : "Identifiant"}
                                                    </FormLabel>
                                                    <FormControl>
                                                        <div className="relative group">
                                                            <div className={cn(
                                                                "absolute inset-y-0 flex items-center px-4 pointer-events-none text-muted-foreground/40 group-focus-within:text-primary transition-colors",
                                                                isRTL ? "right-0" : "left-0"
                                                            )}>
                                                                <User className="h-5 w-5" />
                                                            </div>
                                                            <Input
                                                                placeholder="admin"
                                                                {...field}
                                                                className={cn(
                                                                    "h-14 text-lg font-medium",
                                                                    isRTL ? "pr-12 text-right" : "pl-12"
                                                                )}
                                                            />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage className="text-xs font-bold" />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="password"
                                            render={({ field }: { field: any }) => (
                                                <FormItem className="space-y-3">
                                                    <FormLabel className="text-sm font-bold text-foreground/80 uppercase tracking-wider ml-1">
                                                        {isRTL ? "كلمة المرور" : "Mot de passe"}
                                                    </FormLabel>
                                                    <FormControl>
                                                        <div className="relative group">
                                                            <div className={cn(
                                                                "absolute inset-y-0 flex items-center px-4 pointer-events-none text-muted-foreground/40 group-focus-within:text-primary transition-colors",
                                                                isRTL ? "right-0" : "left-0"
                                                            )}>
                                                                <Lock className="h-5 w-5" />
                                                            </div>
                                                            <Input
                                                                type="password"
                                                                placeholder="••••••••"
                                                                {...field}
                                                                className={cn(
                                                                    "h-14 text-lg font-medium",
                                                                    isRTL ? "pr-12 text-right" : "pl-12"
                                                                )}
                                                            />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage className="text-xs font-bold" />
                                                </FormItem>
                                            )}
                                        />

                                        <Button
                                            type="submit"
                                            className="w-full h-14 text-lg font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-95 mt-6"
                                            disabled={isLoading}
                                        >
                                            {isLoading ? "..." : (isRTL ? "تسجيل الدخول" : "Se connecter")}
                                        </Button>
                                    </form>
                                </Form>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="mt-12 flex justify-center">
                        <Button
                            variant="ghost"
                            size="lg"
                            className="rounded-full gap-3 px-8 h-12 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-2 border-border/20 hover:border-primary/40 hover:bg-white transition-all shadow-sm"
                            onClick={() => setLanguage(language === "fr" ? "ar" : "fr")}
                        >
                            <Languages className="h-5 w-5 text-primary" />
                            <span className="font-black text-base uppercase tracking-wider">{language === "fr" ? "العربية" : "Français"}</span>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
