import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertSubscriptionRequestSchema, type InsertSubscriptionRequest } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SubscribeRequestPage() {
    const { isRTL } = useLanguage();
    const [, setLocation] = useLocation();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Get plan from URL query
    const params = new URLSearchParams(window.location.search);
    const initialPlan = params.get("plan") || "Starter";

    const form = useForm<InsertSubscriptionRequest>({
        resolver: zodResolver(insertSubscriptionRequestSchema as any),
        defaultValues: {
            fullName: "",
            city: "",
            phone: "",
            plan: initialPlan as any,
        }
    });

    const onSubmit = async (data: InsertSubscriptionRequest) => {
        setIsSubmitting(true);
        try {
            await apiRequest("POST", "/api/subscription-requests", data);
            toast({
                title: isRTL ? "تم إرسال الطلب بنجاح" : "Demande envoyée avec succès",
                description: isRTL ? "سنتصل بك في أقرب وقت لتفعيل حسابك." : "Nous vous contacterons bientôt pour activer votre compte.",
            });
            setTimeout(() => setLocation("/"), 2000);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to submit request. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const cities = [
        "Casablanca", "Rabat", "Marrakech", "Fès", "Tanger", 
        "Agadir", "Meknès", "Oujda", "Kénitra", "Tétouan", 
        "Safi", "Mohammédia", "Khouribga", "Béni Mellal", "El Jadida", 
        "Taza", "الناظور / Nador", "سطات / Settat", "العرائش / Larache", "القصر الكبير / Ksar El Kébir", 
        "كلميم / Guelmim", "برشيد / Berrechid", "ورزازات / Ouarzazate", "إفران / Ifrane", "شفشاون / Chefchaouen", 
        "Dakhla", "Laâyoune", "Essaouira", "Tiznit", "Azrou", 
        "Taroudant", "Asilah", "Tan-Tan", "Midelt", "Errachidia", 
        "Youssoufia", "Ben Guerir", "Ouezzane"
    ].sort();

    return (
        <div className="min-h-screen bg-muted/30 p-4 md:p-8" dir={isRTL ? "rtl" : "ltr"}>
            <div className="max-w-2xl mx-auto">
                <Button 
                    variant="ghost" 
                    className="mb-8 gap-2 group" 
                    onClick={() => setLocation("/")}
                >
                    <ChevronLeft className={cn("h-4 w-4 transition-transform group-hover:-translate-x-1", isRTL && "rotate-180")} />
                    {isRTL ? "العودة للرئيسية" : "Retour à l'accueil"}
                </Button>

                <Card className="border-none shadow-2xl bg-background/80 backdrop-blur-sm">
                    <CardHeader className="space-y-1 text-center pb-8 border-b border-border/50">
                        <CardTitle className="text-3xl font-black text-primary">
                            {isRTL ? "طلب الاشتراك في خياط برو" : "Demande d'inscription à Khiyat Pro"}
                        </CardTitle>
                        <p className="text-muted-foreground font-medium">
                            {isRTL ? "املأ النموذج أدناه وسنتواصل معك لتفعيل حسابك." : "Remplissez le formulaire et nous vous contacterons pour activer votre compte."}
                        </p>
                    </CardHeader>
                    <CardContent className="pt-10">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                                <FormField
                                    control={form.control}
                                    name="fullName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{isRTL ? "الاسم الكامل" : "Nom et Prénom"}</FormLabel>
                                            <FormControl>
                                                <Input placeholder={isRTL ? "مثلاً: محمد الإدريسي" : "Ex: Mohamed El Idrissi"} {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="city"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                                <FormLabel className="mb-2">{isRTL ? "المدينة" : "Ville"}</FormLabel>
                                                <SearchableSelect
                                                    options={cities.map(city => ({ label: city, value: city }))}
                                                    value={field.value}
                                                    onValueChange={field.onChange}
                                                    placeholder={isRTL ? "ابحث عن مدينتك..." : "Rechercher votre ville..."}
                                                    emptyMessage={isRTL ? "لم يتم العثور على مدينة." : "Aucune ville trouvée."}
                                                />
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="phone"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{isRTL ? "رقم الهاتف" : "Téléphone"}</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="06XXXXXXXX" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="plan"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{isRTL ? "الباقة المطلوبة" : "Abonnement souhaité"}</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="h-12 border-2 focus:ring-primary/20">
                                                        <SelectValue placeholder="Choisir un plan" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Starter">Starter (199 DH / mois)</SelectItem>
                                                    <SelectItem value="Pro">Pro (399 DH / mois)</SelectItem>
                                                    <SelectItem value="Elite">Elite (799 DH / mois)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Button type="submit" className="w-full h-14 text-xl font-black shadow-lg shadow-primary/20" disabled={isSubmitting}>
                                    {isSubmitting ? (isRTL ? "جاري الإرسال..." : "Envoi en cours...") : (isRTL ? "إرسال طلب الاشتراك" : "Envoyer ma demande")}
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

