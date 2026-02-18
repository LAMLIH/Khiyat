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
        <div className="p-6 space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight text-foreground flex items-center gap-3">
                        <span className="p-2 bg-primary/10 rounded-xl">
                            <UserPlus className="h-8 w-8 text-primary" />
                        </span>
                        {t("common.clients")}
                    </h1>
                    <p className="text-muted-foreground mt-2 text-lg">
                        {isRTL ? "إدارة قاعدة بيانات الزبناء والطلبات" : "Gérez votre base de clients et leurs commandes."}
                    </p>
                </div>

                <div className="flex gap-4">
                    <div className="bg-muted/30 p-1.5 rounded-2xl border border-border flex gap-1">
                        <Button
                            variant={viewMode === "grid" ? "default" : "ghost"}
                            size="icon"
                            className={cn("rounded-xl h-11 w-11 transition-all", viewMode === "grid" && "shadow-lg bg-primary")}
                            onClick={() => setViewMode("grid")}
                        >
                            <LayoutGrid className="h-5 w-5" />
                        </Button>
                        <Button
                            variant={viewMode === "list" ? "default" : "ghost"}
                            size="icon"
                            className={cn("rounded-xl h-11 w-11 transition-all", viewMode === "list" && "shadow-lg bg-primary")}
                            onClick={() => setViewMode("list")}
                        >
                            <List className="h-5 w-5" />
                        </Button>
                    </div>

                    <Drawer.Root open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                        <Drawer.Trigger asChild>
                            <Button size="lg" className="hover-elevate shadow-lg gap-2 text-lg h-14 px-8 rounded-2xl transition-all hover:scale-105 active:scale-95 bg-primary">
                                <Plus className="h-6 w-6" />
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
                                        <Drawer.Title className="text-3xl font-bold mb-2 flex items-center gap-3">
                                            <UserPlus className="h-8 w-8 text-primary" />
                                            {t("common.add")}
                                        </Drawer.Title>
                                        <Drawer.Description className="text-muted-foreground mb-8 text-lg">
                                            {isRTL ? "أدخل معلومات الزبون الجديد هنا." : "Saisissez les informations du nouveau client."}
                                        </Drawer.Description>

                                        <Form {...form}>
                                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                                <FormField
                                                    control={form.control}
                                                    name="name"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-lg font-semibold">{isRTL ? "الاسم الكامل" : "Nom Complet"}</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="Ahmed Alaoui" {...field} className="h-14 text-lg rounded-xl border-2" />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="phone"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-lg font-semibold">{isRTL ? "الهاتف" : "Téléphone"}</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="06XXXXXXXX" {...field} value={field.value || ""} className="h-14 text-lg rounded-xl border-2" />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="address"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-lg font-semibold">{isRTL ? "العنوان" : "Adresse"}</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="Casablanca, Maroc" {...field} value={field.value || ""} className="h-14 text-lg rounded-xl border-2" />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <div className="flex gap-4 pt-6">
                                                    <Button type="submit" size="lg" className="flex-1 h-16 text-xl rounded-2xl shadow-xl hover-elevate transition-all bg-primary" disabled={createClient.isPending}>
                                                        {createClient.isPending ? "..." : t("common.save")}
                                                    </Button>
                                                    <Drawer.Close asChild>
                                                        <Button variant="outline" size="lg" className="h-16 text-xl rounded-2xl px-8 border-2">
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
                    "absolute top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors",
                    isRTL ? "right-4" : "left-4"
                )} />
                <Input
                    placeholder={t("common.search")}
                    className={cn(
                        "h-16 text-lg rounded-2xl border-2 focus-visible:ring-offset-2 transition-all shadow-sm",
                        isRTL ? "pr-12 text-right" : "pl-12"
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
                        <Card key={client.id} className="group hover-elevate overflow-hidden border-2 hover:border-primary/50 transition-all rounded-3xl shadow-sm hover:shadow-xl">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <div className="p-3 bg-secondary/10 rounded-2xl group-hover:bg-primary/10 transition-colors">
                                        <UserPlus className="h-6 w-6 text-primary" />
                                    </div>
                                    <Badge variant="secondary" className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                        Client
                                    </Badge>
                                </div>
                                <CardTitle className="text-2xl mt-4 font-bold truncate">
                                    {client.name}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Phone className="h-4 w-4" />
                                        <span className="text-sm font-medium">{client.phone || "---"}</span>
                                    </div>
                                    {client.address && (
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <MapPin className="h-4 w-4 shrink-0" />
                                            <span className="text-sm truncate font-medium">{client.address}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-6 flex gap-2">
                                    <Button variant="outline" className="flex-1 gap-2 rounded-xl h-11 transition-all hover:bg-primary hover:text-primary-foreground group/btn">
                                        <Scissors className="h-4 w-4 transition-transform group-hover/btn:rotate-12" />
                                        <span className="text-xs font-bold">{t("common.measurements")}</span>
                                    </Button>
                                    <Button variant="outline" className="flex-1 gap-2 rounded-xl h-11 transition-all hover:bg-primary hover:text-primary-foreground group/btn">
                                        <History className="h-4 w-4" />
                                        <span className="text-xs font-bold">{t("common.orders")}</span>
                                    </Button>
                                    <Link href={`/clients/${client.id}`} className="inline-flex">
                                        <Button size="icon" variant="ghost" className="rounded-xl h-11 w-11 hover:bg-secondary">
                                            <ChevronRight className={cn("h-5 w-5", isRTL && "rotate-180")} />
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
                            <div key={i} className="h-24 bg-muted/50 rounded-2xl animate-pulse" />
                        ))
                    ) : filteredClients?.map(client => (
                        <Card key={client.id} className="group hover:border-primary/50 transition-all rounded-2xl shadow-sm hover:shadow-md border overflow-hidden">
                            <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-4 flex-1">
                                    <div className="p-3 bg-primary/10 rounded-xl">
                                        <UserPlus className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold">{client.name}</h3>
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
                                <div className="flex items-center gap-3 w-full md:w-auto">
                                    <Button variant="outline" className="flex-1 md:flex-none gap-2 rounded-xl h-11 transition-all hover:bg-primary hover:text-primary-foreground">
                                        <Scissors className="h-4 w-4" />
                                        <span className="text-sm font-bold">{t("common.measurements")}</span>
                                    </Button>
                                    <Button variant="outline" className="flex-1 md:flex-none gap-2 rounded-xl h-11 transition-all hover:bg-primary hover:text-primary-foreground">
                                        <History className="h-4 w-4" />
                                        <span className="text-sm font-bold">{t("common.orders")}</span>
                                    </Button>
                                    <Link href={`/clients/${client.id}`} className="inline-flex">
                                        <Button size="icon" variant="ghost" className="rounded-xl h-11 w-11 hover:bg-secondary">
                                            <ChevronRight className={cn("h-5 w-5", isRTL && "rotate-180")} />
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

