import { Card, CardContent } from "@/components/ui/card";

export default function NotFound() {
    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md">
                <CardContent className="pt-6 text-center">
                    <h1 className="text-4xl font-bold text-primary mb-4">404</h1>
                    <p className="text-muted-foreground mb-6">Page non trouvée</p>
                    <a href="/" className="text-primary hover:underline">
                        Retour à l'accueil
                    </a>
                </CardContent>
            </Card>
        </div>
    );
}
