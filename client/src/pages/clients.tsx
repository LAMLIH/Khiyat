import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useClients } from "@/hooks/use-clients";
import { useTranslation } from "react-i18next";
import {
    Plus,
    Search,
    UserPlus,
    Phone,
    MapPin,
    ChevronRight,
    Scissors,
    History,
    LayoutGrid,
    List
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { Drawer } from "vaul";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertClientSchema, type InsertClient } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

export default function ClientsPage() {
    const { t } = useTranslation();
    const { isRTL } = useLanguage();
    const { clients, isLoading, createClient } = useClients();
    const [search, setSearch] = useState("");
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

    const form = useForm<InsertClient>({
        resolver: zodResolver(insertClientSchema.omit({ tenantId: true }) as any),
        defaultValues: {
            name: "",
            phone: "",
            address: "",
        }
    });

    const filteredClients = clients?.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        (c.phone && c.phone.includes(search))
    );

    const onSubmit = (data: InsertClient) => {
        createClient.mutate(data, {
            onSuccess: () => {
                setIsDrawerOpen(false);
                form.reset({ name: "", phone: "", address: "" });
            }
        });
    };

    return (
        <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground flex items-center gap-3">
                        <UserPlus className="h-6 w-6 md:h-8 md:w-8 text-muted-foreground/50" />
                        {t("common.clients")}
                    </h1>
                    <p className="text-muted-foreground mt-1 text-base md:text-lg">
                        {isRTL ? "إدارة قاعدة بيانات الزبناء والطلبات" : "Gérez votre base de clients et leurs commandes."}
                    </p>
                </div>

                <div className="flex gap-4">
                    <div className="bg-muted/50 p-1.5 rounded-[1.25rem] shadow-sm flex gap-1">
                        <Button
                            variant={viewMode === "grid" ? "default" : "ghost"}
                            size="icon"
                            className={cn("rounded-xl h-11 w-11 transition-all", viewMode === "grid" && "shadow-sm bg-primary")}
                            onClick={() => setViewMode("grid")}
                        >
                            <LayoutGrid className="h-5 w-5" />
                        </Button>
                        <Button
                            variant={viewMode === "list" ? "default" : "ghost"}
                            size="icon"
                            className={cn("rounded-xl h-11 w-11 transition-all", viewMode === "list" && "shadow-sm bg-primary")}
                            onClick={() => setViewMode("list")}
                        >
                            <List className="h-5 w-5" />
                        </Button>
                    </div>

                    <Drawer.Root open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                        <Drawer.Trigger asChild>
                            <Button size="lg" className="hover-elevate shadow-sm gap-2 text-[15px] h-14 px-6 md:px-8 rounded-full transition-all hover:scale-105 active:scale-95 bg-primary font-bold">
                                <Plus className="h-5 w-5 md:h-6 md:w-6" />
                                {t("common.add")}
                            </Button>
                        </Drawer.Trigger>
                        <Drawer.Portal>
                            <Drawer.Overlay className="fixed inset-0 bg-black/40 z-50" />
                            <Drawer.Content className={cn(
                                "bg-background flex flex-col rounded-t-[32px] h-[80%] mt-24 fixed bottom-0 left-0 right-0 z-50 outline-none border-t-4 border-primary/20",
                                isRTL && "font-arabic"
                            )}>
                                <div className="p-6 bg-background rounded-t-[32px] flex-1 overflow-y-auto">
                                    <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-muted mb-8" />
                                    <div className="max-w-xl mx-auto">
                                        <Drawer.Title className="text-3xl font-lalezar mb-2 flex items-center gap-3 text-primary">
                                            <UserPlus className="h-8 w-8" />
                                            {t("common.add")}
                                        </Drawer.Title>
                                        <Drawer.Description className="text-muted-foreground mb-10 text-lg font-medium">
                                            {isRTL ? "أدخل معلومات الزبون الجديد هنا." : "Saisissez les informations du nouveau client."}
                                        </Drawer.Description>

                                        <Form {...form}>
                                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                                <FormField
                                                    control={form.control}
                                                    name="name"
                                                    render={({ field }) => (
                                                        <FormItem className="space-y-3">
                                                            <FormLabel className="text-sm font-bold text-slate-700 uppercase tracking-widest">{isRTL ? "الاسم الكامل" : "Nom Complet"}</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="Ahmed Alaoui" {...field} />
                                                            </FormControl>
                                                            <FormMessage className="text-xs font-bold" />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="phone"
                                                    render={({ field }) => (
                                                        <FormItem className="space-y-3">
                                                            <FormLabel className="text-sm font-bold text-slate-700 uppercase tracking-widest">{isRTL ? "الهاتف" : "Téléphone"}</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="06XXXXXXXX" {...field} value={field.value || ""} />
                                                            </FormControl>
                                                            <FormMessage className="text-xs font-bold" />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="address"
                                                    render={({ field }) => (
                                                        <FormItem className="space-y-3">
                                                            <FormLabel className="text-sm font-bold text-slate-700 uppercase tracking-widest">{isRTL ? "العنوان" : "Adresse"}</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="Casablanca, Maroc" {...field} value={field.value || ""} />
                                                            </FormControl>
                                                            <FormMessage className="text-xs font-bold" />
                                                        </FormItem>
                                                    )}
                                                />
                                                <div className="flex gap-4 pt-10">
                                                    <Button type="submit" size="lg" className="flex-[2] h-16 text-xl rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all font-bold bg-primary active:scale-95" disabled={createClient.isPending}>
                                                        {createClient.isPending ? "..." : t("common.save")}
                                                    </Button>
                                                    <Drawer.Close asChild>
                                                        <Button variant="outline" size="lg" className="flex-1 h-16 text-xl rounded-xl border-2 border-slate-200 font-bold hover:bg-slate-50 transition-all active:scale-95">
                                                            {t("common.cancel")}
                                                        </Button>
                                                    </Drawer.Close>
                                                </div>
                                            </form>
                                        </Form>
                                    </div>
                                </div>
                            </Drawer.Content>
                        </Drawer.Portal>
                    </Drawer.Root>
                </div>
            </div>

            <div className="relative group max-w-2xl">
                <Search className={cn(
                    "absolute top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground/40 group-focus-within:text-primary transition-colors",
                    isRTL ? "right-4" : "left-4"
                )} />
                <Input
                    placeholder={t("common.search")}
                    className={cn(
                        "h-16 text-xl font-medium",
                        isRTL ? "pr-14 text-right" : "pl-14"
                    )}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {viewMode === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {isLoading ? (
                        [1, 2, 3].map(i => (
                            <div key={i} className="h-48 bg-muted/50 rounded-3xl animate-pulse" />
                        ))
                    ) : filteredClients?.map(client => (
                        <Card key={client.id} className="component-card shadow-sm hover:shadow-md transition-all">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <div className="p-2 bg-primary/10 rounded-md">
                                        <UserPlus className="h-5 w-5 text-primary" />
                                    </div>
                                    <Badge variant="outline" className="px-2 py-0.5 text-[10px] uppercase tracking-wider">
                                        Client
                                    </Badge>
                                </div>
                                <CardTitle className="text-xl mt-4 font-bold truncate">
                                    {client.name}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 pt-0">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Phone className="h-4 w-4 shrink-0" />
                                        <span className="text-sm font-medium truncate">{client.phone || "---"}</span>
                                    </div>
                                    {client.address && (
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <MapPin className="h-4 w-4 shrink-0" />
                                            <span className="text-sm truncate font-medium">{client.address}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-6 flex gap-2">
                                    <Button variant="outline" className="flex-1 gap-2 text-xs">
                                        <Scissors className="h-4 w-4" />
                                        <span>{t("common.measurements")}</span>
                                    </Button>
                                    <Button variant="outline" className="flex-1 gap-2 text-xs">
                                        <History className="h-4 w-4" />
                                        <span>{t("common.orders")}</span>
                                    </Button>
                                    <Link href={`/clients/${client.id}`} className="inline-flex">
                                        <Button size="icon" variant="ghost">
                                            <ChevronRight className={cn("h-4 w-4", isRTL && "rotate-180")} />
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="space-y-4">
                    {isLoading ? (
                        [1, 2, 3].map(i => (
                            <div key={i} className="h-24 bg-muted/50 rounded-3xl animate-pulse" />
                        ))
                    ) : filteredClients?.map(client => (
                        <Card key={client.id} className="component-card shadow-sm hover:shadow-md transition-all">
                            <CardContent className="p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-4 flex-1 w-full">
                                    <div className="p-2 bg-primary/10 rounded-md shrink-0">
                                        <UserPlus className="h-5 w-5 text-primary" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="text-lg font-bold text-foreground truncate">{client.name}</h3>
                                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                                            <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                                                <Phone className="h-3.5 w-3.5" />
                                                <span>{client.phone || "---"}</span>
                                            </div>
                                            {client.address && (
                                                <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                                                    <MapPin className="h-3.5 w-3.5" />
                                                    <span>{client.address}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto mt-4 md:mt-0">
                                    <Button variant="outline" className="flex-1 md:flex-none gap-2 text-sm">
                                        <Scissors className="h-4 w-4" />
                                        <span>{t("common.measurements")}</span>
                                    </Button>
                                    <Button variant="outline" className="flex-1 md:flex-none gap-2 text-sm">
                                        <History className="h-4 w-4" />
                                        <span>{t("common.orders")}</span>
                                    </Button>
                                    <Link href={`/clients/${client.id}`} className="inline-flex">
                                        <Button size="icon" variant="ghost">
                                            <ChevronRight className={cn("h-4 w-4", isRTL && "rotate-180")} />
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}

