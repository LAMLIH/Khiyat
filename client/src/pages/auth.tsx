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
        <div className={cn("min-h-screen grid lg:grid-cols-2 bg-slate-50 dark:bg-slate-950 relative overflow-hidden transition-colors duration-500", isRTL && "font-arabic")}>
            {/* Desktop Left side (Branding) */}
            <div className="hidden lg:flex flex-col items-center justify-center bg-primary text-primary-foreground p-12 relative overflow-hidden shadow-[20px_0_40px_rgba(0,0,0,0.1)] z-20">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent)]" />
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
                </div>
            </div>

            {/* Mobile/Right side Content */}
            <div className="w-full min-h-screen lg:min-h-0 flex items-center justify-center p-4 sm:p-8 bg-slate-950 lg:bg-transparent relative z-10">
                {/* Background Grains for Mobile */}
                <div className="lg:hidden absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-[-10%] right-[-10%] w-[80%] h-[80%] rounded-full bg-primary/10 blur-[120px]" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-[80%] h-[80%] rounded-full bg-primary/5 blur-[120px]" />
                </div>

                <div className="w-full max-w-[420px] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {/* Simplified Mobile Logo */}
                    <div className="text-center mb-10 flex flex-col items-center gap-2">
                        <div className="p-4 bg-primary/10 rounded-2xl mb-2 lg:hidden">
                            <Scissors className="h-10 w-10 text-primary" />
                        </div>
                        <div className="text-5xl font-lalezar text-white lg:text-primary tracking-wider">خياط برو</div>
                        <div className="text-[10px] text-white/40 lg:text-primary/60 font-bold tracking-[0.4em] uppercase">بصمتك في الأناقة</div>
                    </div>

                    <Card className="border-0 lg:border border-white/5 lg:border-border/40 rounded-[2.5rem] overflow-hidden shadow-2xl bg-white/5 lg:bg-card/90 backdrop-blur-2xl">
                        <CardHeader className="pt-10 pb-4 text-center">
                            <CardTitle className="text-3xl font-lalezar text-white lg:text-primary">
                                {isRTL ? "تسجيل الدخول" : "Connexion"}
                            </CardTitle>
                            <p className="text-xs text-white/40 lg:text-muted-foreground font-bold uppercase tracking-[0.2em] mt-2">
                                {isRTL ? "مرحباً بك مجدداً" : "Accès Personnel"}
                            </p>
                        </CardHeader>
                        <CardContent className="p-8 sm:p-10 pt-4">
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                                    <FormField
                                        control={form.control}
                                        name="username"
                                        render={({ field }: { field: any }) => (
                                            <FormItem className="space-y-2">
                                                <FormLabel className="text-[10px] font-bold text-white/40 lg:text-muted-foreground/90 uppercase tracking-[0.2em] ml-1">
                                                    {isRTL ? "اسم المستخدم" : "Identifiant"}
                                                </FormLabel>
                                                <FormControl>
                                                    <div className="relative group">
                                                        <div className={cn(
                                                            "absolute inset-y-0 flex items-center px-4 pointer-events-none text-white/20 group-focus-within:text-primary transition-colors",
                                                            isRTL ? "right-0" : "left-0"
                                                        )}>
                                                            <User className="h-5 w-5" />
                                                        </div>
                                                        <Input
                                                            placeholder="admin"
                                                            {...field}
                                                            className={cn(
                                                                "h-14 bg-white/5 lg:bg-background border-white/10 lg:border-input text-white lg:text-foreground placeholder:text-white/10",
                                                                isRTL ? "pr-12 text-right" : "pl-12"
                                                            )}
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage className="text-[10px]" />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="password"
                                        render={({ field }: { field: any }) => (
                                            <FormItem className="space-y-2">
                                                <FormLabel className="text-[10px] font-bold text-white/40 lg:text-muted-foreground/90 uppercase tracking-[0.2em] ml-1">
                                                    {isRTL ? "كلمة المرور" : "Mot de passe"}
                                                </FormLabel>
                                                <FormControl>
                                                    <div className="relative group">
                                                        <div className={cn(
                                                            "absolute inset-y-0 flex items-center px-4 pointer-events-none text-white/20 group-focus-within:text-primary transition-colors",
                                                            isRTL ? "right-0" : "left-0"
                                                        )}>
                                                            <Lock className="h-5 w-5" />
                                                        </div>
                                                        <Input
                                                            type="password"
                                                            placeholder="••••••••"
                                                            {...field}
                                                            className={cn(
                                                                "h-14 bg-white/5 lg:bg-background border-white/10 lg:border-input text-white lg:text-foreground placeholder:text-white/10",
                                                                isRTL ? "pr-12 text-right" : "pl-12"
                                                            )}
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage className="text-[10px]" />
                                            </FormItem>
                                        )}
                                    />

                                    <Button
                                        type="submit"
                                        className="w-full h-14 text-base font-black rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-[0.98] mt-4 bg-primary hover:bg-primary/90 text-white"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? "..." : (isRTL ? "تسجيل الدخول" : "Se connecter")}
                                    </Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>

                    <div className="mt-8 flex justify-center">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-full gap-2 px-6 h-10 text-white/40 hover:text-white hover:bg-white/5 transition-colors"
                            onClick={() => setLanguage(language === "fr" ? "ar" : "fr")}
                        >
                            <Languages className="h-4 w-4" />
                            <span className="font-bold text-xs uppercase tracking-widest">{language === "fr" ? "العربية" : "Français"}</span>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
