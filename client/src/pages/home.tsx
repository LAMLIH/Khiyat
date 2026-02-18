import { Card, CardContent } from "@/components/ui/card";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export default function Home() {
    return (
        <div className="flex min-h-screen w-full bg-background font-sans">
            <main className="flex-1 p-8">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-4xl font-bold mb-4">Bienvenue sur Khiyatma</h1>
                    <p className="text-muted-foreground mb-8">
                        Gérez vos clients, mesures et commandes en toute simplicité.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="hover-elevate cursor-pointer">
                            <CardContent className="pt-6">
                                <h2 className="text-xl font-semibold mb-2">Clients</h2>
                                <p className="text-sm text-muted-foreground">Gérer votre base de données clients.</p>
                            </CardContent>
                        </Card>
                        <Card className="hover-elevate cursor-pointer">
                            <CardContent className="pt-6">
                                <h2 className="text-xl font-semibold mb-2">Commandes</h2>
                                <p className="text-sm text-muted-foreground">Suivre vos commandes et livraisons.</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}
