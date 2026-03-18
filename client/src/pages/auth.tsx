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
        <div className="min-h-screen grid lg:grid-cols-2 bg-background relative overflow-hidden">
            {/* Left side (Branding) */}
            <div className="hidden lg:flex flex-col items-center justify-center bg-primary text-primary-foreground p-12 relative overflow-hidden">
                {/* Decorative background elements relative to the primary side */}
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/10 rounded-full blur-[80px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-white/10 rounded-full blur-[80px]" />

                <div className="relative z-10 text-center flex flex-col items-center">
                    <div className="mb-6 flex flex-col items-center gap-2 animate-in zoom-in duration-700">
                        <div className="text-8xl font-lalezar text-white tracking-widest drop-shadow-lg leading-tight">خياط برو</div>
                        <div className="text-xl text-white/80 font-medium tracking-[0.3em] uppercase backdrop-blur-sm bg-white/5 py-1 px-8 rounded-full border border-white/10">بصمتك في الأناقة</div>
                    </div>
                </div>
            </div>

            {/* Right side (Form) */}
            <div className="w-full flex items-center justify-center p-6 sm:p-12 relative z-10">
                <div className="w-full max-w-md flex flex-col">
                    {/* Mobile Branding - only shows on small screens */}
                    <div className="lg:hidden text-center mb-10 flex flex-col items-center gap-2">
                        <div className="text-5xl font-lalezar text-primary tracking-wider animate-in zoom-in duration-700">خياط برو</div>
                        <div className="text-sm text-primary/60 font-bold tracking-widest uppercase animate-in fade-in duration-1000">بصمتك في الأناقة</div>
                    </div>

                    <Card className="border border-border/50 rounded-2xl overflow-hidden shadow-2xl bg-card/80 backdrop-blur-sm">
                        <CardHeader className="pt-10 pb-4 text-center">
                            <CardTitle className="text-3xl font-lalezar text-primary tracking-wide">
                                {isRTL ? "تسجيل الدخول" : "Connexion"}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground font-medium uppercase tracking-widest mt-2 opacity-60">
                                {isRTL ? "مرحباً بك مجدداً" : "Bienvenue"}
                            </p>
                        </CardHeader>
                        <CardContent className="p-8 pb-12">
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                    <FormField
                                        control={form.control}
                                        name="username"
                                        render={({ field }: { field: any }) => (
                                            <FormItem className="space-y-3">
                                                <FormLabel className="text-sm font-bold text-foreground/80 uppercase tracking-wider">
                                                    {isRTL ? "اسم المستخدم" : "Nom d'utilisateur"}
                                                </FormLabel>
                                                <FormControl>
                                                    <div className="relative group">
                                                        <User className={cn(
                                                            "absolute top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/40 group-focus-within:text-primary transition-colors",
                                                            isRTL ? "right-4" : "left-4"
                                                        )} />
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
                                                <FormLabel className="text-sm font-bold text-foreground/80 uppercase tracking-wider">
                                                    {isRTL ? "كلمة المرور" : "Mot de passe"}
                                                </FormLabel>
                                                <FormControl>
                                                    <div className="relative group">
                                                        <Lock className={cn(
                                                            "absolute top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/40 group-focus-within:text-primary transition-colors",
                                                            isRTL ? "right-4" : "left-4"
                                                        )} />
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

                    <div className="mt-8 flex justify-center gap-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-full gap-2 px-4 h-10 border-2 border-transparent hover:border-primary/20"
                            onClick={() => setLanguage(language === "fr" ? "ar" : "fr")}
                        >
                            <Languages className="h-4 w-4 text-primary" />
                            <span className="font-bold">{language === "fr" ? "العربية" : "Français"}</span>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
