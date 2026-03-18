import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { type SubscriptionRequest } from "@shared/schema";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format, addMonths } from "date-fns";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Phone, MapPin, LayoutList, UserPlus, CheckCircle2, ShieldCheck, Globe, Key, Calendar, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function AdminSubRequestsPage() {
    const { isRTL } = useLanguage();
    const { toast } = useToast();
    const [selectedRequest, setSelectedRequest] = useState<SubscriptionRequest | null>(null);
    const [isConverting, setIsConverting] = useState(false);

    // Form state
    const [subdomain, setSubdomain] = useState("");
    const [password, setPassword] = useState("Pro12345");
    const [tenantName, setTenantName] = useState("");
    const [plan, setPlan] = useState("Starter");
    const [months, setMonths] = useState("1");

    const { data: requests, isLoading } = useQuery<SubscriptionRequest[]>({
        queryKey: ["/api/subscription-requests"],
    });

    const convertMutation = useMutation({
        mutationFn: async (id: number) => {
            const expiresAt = addMonths(new Date(), parseInt(months));
            const res = await apiRequest("POST", `/api/saas-admin/convert-request/${id}`, {
                subdomain,
                password,
                plan,
                name: tenantName,
                fullName: selectedRequest?.fullName,
                expiresAt: expiresAt.toISOString()
            });
            return res;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/subscription-requests"] });
            queryClient.invalidateQueries({ queryKey: ["/api/saas-admin/tenants"] });
            toast({
                title: isRTL ? "تم تفعيل الاشتراك" : "Abonnement activé",
                description: isRTL 
                    ? `تم إنشاء الحساب: admin@${subdomain} بكلمة سر: ${password}`
                    : `Compte créé: admin@${subdomain} avec le mot de passe: ${password}`,
            });
            setSelectedRequest(null);
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: error.message || "Failed to convert request",
                variant: "destructive"
            });
        }
    });

    const handleOpenConvert = (req: SubscriptionRequest) => {
        setSelectedRequest(req);
        setTenantName(req.fullName);
        setPlan(req.plan || "Starter");
        // Generate a suggested subdomain from fullName
        const suggested = req.fullName.toLowerCase()
            .replace(/[^a-z0-9]/g, "")
            .substring(0, 20);
        setSubdomain(suggested);
    };

    if (isLoading) return <div>Loading...</div>;

    const pendingRequests = requests?.filter(r => r.status === "pending") || [];
    const processedRequests = requests?.filter(r => r.status !== "pending") || [];

    return (
        <div className={`p-8 space-y-8 ${isRTL ? "font-arabic" : ""}`} dir={isRTL ? "rtl" : "ltr"}>
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black text-foreground">
                        {isRTL ? "طلبات الاشتراك" : "Demandes d'abonnement"}
                    </h1>
                    <p className="text-muted-foreground mt-2 font-medium">
                        {isRTL ? "إدارة الطلبات الجديدة وتحويلها إلى زبائن." : "Gérez les nouvelles demandes et convertissez-les en clients."}
                    </p>
                </div>
                <div className="flex gap-4">
                    <Badge variant="outline" className="px-4 py-2 font-black text-lg text-primary bg-primary/5">
                        {pendingRequests.length} {isRTL ? "طلب قيد الانتظار" : "En attente"}
                    </Badge>
                </div>
            </div>

            <Card className="border-border/50 shadow-xl overflow-hidden border-2">
                <CardHeader className="bg-muted/30 border-b py-6">
                    <CardTitle className="flex items-center gap-3 text-2xl font-black">
                        <LayoutList className="h-7 w-7 text-primary" />
                        {isRTL ? "قائمة الطلبات الجديدة" : "Demandes en attente"}
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/10 hover:bg-muted/10 h-16">
                                <TableHead className="w-[120px] font-black">{isRTL ? "التاريخ" : "Date"}</TableHead>
                                <TableHead className="font-black">{isRTL ? "الزبon" : "Client"}</TableHead>
                                <TableHead className="font-black">{isRTL ? "المدينة" : "Ville"}</TableHead>
                                <TableHead className="font-black">{isRTL ? "رقم الهاتف" : "Téléphone"}</TableHead>
                                <TableHead className="font-black">{isRTL ? "الباقة" : "Plan"}</TableHead>
                                <TableHead className="text-right font-black">{isRTL ? "إجراءات" : "Actions"}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {pendingRequests.map((req) => (
                                <TableRow key={req.id} className="hover:bg-muted/5 transition-colors h-20">
                                    <TableCell className="font-medium text-muted-foreground italic">
                                        {req.createdAt ? format(new Date(req.createdAt), "dd/MM/yyyy") : "-"}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black uppercase border border-primary/20">
                                                {req.fullName[0]}
                                            </div>
                                            <span className="font-black text-lg">{req.fullName}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 font-medium">
                                            <MapPin className="h-4 w-4 text-muted-foreground" />
                                            {req.city}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 font-bold">
                                            <Phone className="h-4 w-4 text-muted-foreground" />
                                            {req.phone}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={req.plan === "Elite" ? "destructive" : req.plan === "Pro" ? "default" : "secondary"} className="font-black px-4 py-1">
                                            {req.plan}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button 
                                            size="sm" 
                                            className="gap-2 font-black shadow-md shadow-primary/10" 
                                            onClick={() => handleOpenConvert(req)}
                                        >
                                            <UserPlus className="h-4 w-4" />
                                            {isRTL ? "تحويل لزبون" : "Convertir"}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {pendingRequests.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-48 text-center text-muted-foreground font-black text-xl italic bg-muted/5">
                                        {isRTL ? "لا توجد طلبات جديدة حالياً." : "Aucune nouvelle demande pour le moment."}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Processed Requests Section */}
            {processedRequests.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-2xl font-black text-muted-foreground flex items-center gap-3">
                        <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                        {isRTL ? "الطلبات المعالجة" : "Demandes traitées"}
                    </h2>
                    <Card className="border-border/50 opacity-70">
                        <CardContent className="p-0">
                            <Table>
                                <TableBody>
                                    {processedRequests.map((req) => (
                                        <TableRow key={req.id} className="h-16">
                                            <TableCell className="w-[120px] font-medium text-muted-foreground">
                                                {req.createdAt ? format(new Date(req.createdAt), "dd/MM/yyyy") : "-"}
                                            </TableCell>
                                            <TableCell className="font-bold">{req.fullName}</TableCell>
                                            <TableCell>{req.city}</TableCell>
                                            <TableCell className="text-muted-foreground">{req.phone}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                                                    {isRTL ? "تم التفعيل" : "Activé"}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Conversion Dialog */}
            <Dialog open={!!selectedRequest} onOpenChange={(open) => !open && setSelectedRequest(null)}>
                <DialogContent className="max-w-xl border-t-4 border-t-primary shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black flex items-center gap-3">
                            <ShieldCheck className="h-8 w-8 text-primary" />
                            {isRTL ? "تفعيل اشتراك المحل" : "Activer l'abonnement du Client"}
                        </DialogTitle>
                        <DialogDescription className="text-lg font-medium pt-2">
                            {isRTL ? "قم بإعداد بيانات المحل والاشتراك للعميل" : "Configurez le magasin et l'abonnement pour le client"} : <strong>{selectedRequest?.fullName}</strong>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-6 py-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-3">
                                <Label className="text-sm font-black flex items-center gap-2">
                                    <Globe className="h-4 w-4 text-primary" />
                                    {isRTL ? "اسم المتجر" : "Nom du Store"}
                                </Label>
                                <Input 
                                    value={tenantName} 
                                    onChange={(e) => setTenantName(e.target.value)}
                                    className="font-bold h-12 border-2"
                                />
                            </div>
                            <div className="space-y-3">
                                <Label className="text-sm font-black flex items-center gap-2">
                                    <Globe className="h-4 w-4 text-primary" />
                                    {isRTL ? "نطاق العميل" : "Sous-domaine"}
                                </Label>
                                <div className="relative">
                                    <Input 
                                        value={subdomain} 
                                        onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ""))}
                                        className="font-bold h-12 pr-20 border-2"
                                        placeholder="boutique"
                                    />
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-muted-foreground text-sm font-bold bg-muted/50 px-2 rounded-r">
                                        .khiyat.pro
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 border-t pt-6">
                            <div className="space-y-3">
                                <Label className="text-sm font-black flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-primary" />
                                    {isRTL ? "الباقة" : "Type d'abonnement"}
                                </Label>
                                <Select value={plan} onValueChange={setPlan}>
                                    <SelectTrigger className="font-bold h-12 border-2">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Starter" className="font-bold">Starter</SelectItem>
                                        <SelectItem value="Pro" className="font-bold">Pro</SelectItem>
                                        <SelectItem value="Elite" className="font-bold">Elite</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-3">
                                <Label className="text-sm font-black flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-primary" />
                                    {isRTL ? "مدة الاشتراك (شهور)" : "Durée (mois)"}
                                </Label>
                                <Select value={months} onValueChange={setMonths}>
                                    <SelectTrigger className="font-bold h-12 border-2">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1" className="font-bold">1 mois</SelectItem>
                                        <SelectItem value="3" className="font-bold">3 mois</SelectItem>
                                        <SelectItem value="6" className="font-bold">6 mois</SelectItem>
                                        <SelectItem value="12" className="font-bold">12 mois</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 border-t pt-6">
                            <div className="space-y-3">
                                <Label className="text-sm font-black flex items-center gap-2">
                                    <Key className="h-4 w-4 text-primary" />
                                    {isRTL ? "اسم مستخدم المدير" : "Identifiant Admin"}
                                </Label>
                                <Input 
                                    value={`admin@${subdomain}`}
                                    readOnly
                                    className="font-bold h-12 border-2 bg-muted/50 cursor-not-allowed"
                                />
                            </div>
                            <div className="space-y-3">
                                <Label className="text-sm font-black flex items-center gap-2">
                                    <Key className="h-4 w-4 text-primary" />
                                    {isRTL ? "كلمة سر المدير" : "Mot de passe Admin"}
                                </Label>
                                <Input 
                                    type="text"
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="font-bold h-12 border-2"
                                />
                            </div>
                        </div>

                        <div className="space-y-3 border-t pt-6">
                            <p className="text-sm text-muted-foreground font-medium italic text-center">
                                {isRTL ? "استخدم هذه البيانات للدخول إلى المتجر الجديد." : "Ces identifiants permettront au client de se connecter à son nouvel espace."}
                            </p>
                        </div>
                    </div>

                    <DialogFooter className="gap-3 pt-4">
                        <Button variant="ghost" onClick={() => setSelectedRequest(null)} className="font-bold" disabled={convertMutation.isPending}>
                            {isRTL ? "إلغاء" : "Annuler"}
                        </Button>
                        <Button 
                            className="bg-primary hover:bg-primary/90 text-white font-black px-8 h-12 gap-2 shadow-lg shadow-primary/20" 
                            onClick={() => convertMutation.mutate(selectedRequest!.id)}
                            disabled={convertMutation.isPending}
                        >
                            {convertMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <UserPlus className="h-5 w-5" />}
                            {isRTL ? "تفعيل وإطلاق المحل" : "Lancer l'abonnement"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
