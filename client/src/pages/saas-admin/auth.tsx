import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema, type InsertUser } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Lock, User } from "lucide-react";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

export default function SaaSAuthPage() {
    const { user, login, isLoading } = useAuth();
    const [, setLocation] = useLocation();

    useEffect(() => {
        if (user && user.role === "saas_admin") {
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
        <div className="min-h-screen flex items-center justify-center bg-[#0f172a] relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#1c918f]/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-[#1c918f]/5 rounded-full blur-[120px]" />

            <div className="w-full max-w-md p-6 relative z-10">
                <div className="text-center mb-12 group cursor-default relative">
                    <div className="relative inline-block animate-in zoom-in duration-1000">
                        <div className="text-8xl font-lalezar text-white tracking-widest drop-shadow-[0_0_20px_rgba(28,145,143,0.8)] leading-none">خياط برو</div>
                        <div className="text-[11px] text-[#1c918f] font-bold tracking-[0.5em] uppercase mt-2 opacity-80">بصمتك في الأناقة</div>
                    </div>
                    <div className="mt-8">
                        <h1 className="text-2xl font-bold text-white tracking-tight">SaaS Admin Portal</h1>
                        <p className="text-slate-500 mt-1 font-medium tracking-wide uppercase text-[10px] opacity-60">System-Wide Infrastructure</p>
                    </div>
                </div>

                <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl shadow-2xl">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xl text-center text-slate-200">System Authentication</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                                <FormField
                                    control={form.control}
                                    name="username"
                                    render={({ field }: { field: any }) => (
                                        <FormItem>
                                            <FormControl>
                                                <div className="relative group">
                                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-[#1c918f] transition-colors" />
                                                    <Input
                                                        placeholder="Admin Username"
                                                        {...field}
                                                        className="h-12 pl-10 bg-slate-800/50 border-slate-700 text-slate-200 focus:ring-[#1c918f]/20 focus:border-[#1c918f] transition-all"
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage className="text-xs text-red-400" />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }: { field: any }) => (
                                        <FormItem>
                                            <FormControl>
                                                <div className="relative group">
                                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-[#1c918f] transition-colors" />
                                                    <Input
                                                        type="password"
                                                        placeholder="Security Key"
                                                        {...field}
                                                        className="h-12 pl-10 bg-slate-800/50 border-slate-700 text-slate-200 focus:ring-[#1c918f]/20 focus:border-[#1c918f] transition-all"
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage className="text-xs text-red-400" />
                                        </FormItem>
                                    )}
                                />

                                <Button
                                    type="submit"
                                    className="w-full h-12 bg-[#1c918f] hover:bg-[#1c918f]/90 text-white font-bold rounded-lg shadow-lg shadow-[#1c918f]/20 transition-all active:scale-[0.98]"
                                    disabled={isLoading}
                                >
                                    {isLoading ? "Validating..." : "Enter Secure Portal"}
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>

                <p className="text-center text-slate-500 text-[10px] mt-8 uppercase tracking-[0.2em]">
                    Authorized Personnel Only • IP: Logged
                </p>
            </div>
        </div>
    );
}
