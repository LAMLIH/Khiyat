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
        <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
            {/* Background elements */}
            {/* Background elements */}

            <div className="w-full max-w-lg p-6 relative z-10">
                <div className="text-center mb-8">
                    <div className="inline-flex p-4 bg-primary/10 rounded-2xl mb-4">
                        <Scissors className="h-10 w-10 text-primary" />
                    </div>
                    <h1 className="text-4xl font-bold tracking-tighter text-foreground mb-2">
                        KHIYATMA
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        {isRTL ? "منصة إدارة الخياطة العصرية" : "Plateforme de gestion de couture moderne"}
                    </p>
                </div>

                <Card className="border-2 rounded-[32px] overflow-hidden">
                    <CardHeader className="pt-8 pb-4 text-center">
                        <CardTitle className="text-2xl font-bold">
                            {isRTL ? "تسجيل الدخول" : "Connexion"}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 pb-10">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="username"
                                    render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <FormLabel className="text-base font-semibold">
                                                {isRTL ? "اسم المستخدم" : "Nom d'utilisateur"}
                                            </FormLabel>
                                            <FormControl>
                                                <div className="relative group">
                                                    <User className={cn(
                                                        "absolute top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors",
                                                        isRTL ? "right-4" : "left-4"
                                                    )} />
                                                    <Input
                                                        placeholder="admin"
                                                        {...field}
                                                        className={cn(
                                                            "h-14 text-lg rounded-xl border-2 transition-all group-focus-within:border-primary/50",
                                                            isRTL ? "pr-12 text-right" : "pl-12"
                                                        )}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <FormLabel className="text-base font-semibold">
                                                {isRTL ? "كلمة المرور" : "Mot de passe"}
                                            </FormLabel>
                                            <FormControl>
                                                <div className="relative group">
                                                    <Lock className={cn(
                                                        "absolute top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors",
                                                        isRTL ? "right-4" : "left-4"
                                                    )} />
                                                    <Input
                                                        type="password"
                                                        placeholder="••••••••"
                                                        {...field}
                                                        className={cn(
                                                            "h-14 text-lg rounded-xl border-2 transition-all group-focus-within:border-primary/50",
                                                            isRTL ? "pr-12 text-right" : "pl-12"
                                                        )}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Button
                                    type="submit"
                                    className="w-full h-16 text-xl font-bold rounded-2xl hover-elevate transition-all mt-4"
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
    );
}
