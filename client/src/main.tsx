import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import RootLayout from "./components/layout";
import { TenantProvider } from "./hooks/use-tenant";
import { LanguageProvider } from "./contexts/LanguageContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider, useAuth } from "./hooks/use-auth";
import { Loader2 } from "lucide-react";

import "./lib/i18n"; // Import i18n config
import "./index.css";

// Pages
import AuthPage from "./pages/auth";
import DashboardPage from "./pages/dashboard";
import ClientsPage from "./pages/clients";
import MeasurementsPage from "./pages/measurements";
import OrdersPage from "./pages/orders";

function Router() {
    const { user, isLoading } = useAuth();
    const [location] = useLocation();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!user && location !== "/auth") {
        return <AuthPage />;
    }

    if (location === "/auth") {
        return <AuthPage />;
    }

    return (
        <RootLayout>
            <Switch>
                <Route path="/" component={DashboardPage} />
                <Route path="/clients" component={ClientsPage} />
                <Route path="/measurements" component={MeasurementsPage} />
                <Route path="/orders" component={OrdersPage} />
                <Route path="/stats" component={() => <div className="p-8 text-2xl font-bold">Statistiques (En construction)</div>} />
                <Route path="/products" component={() => <div className="p-8 text-2xl font-bold">Produits (En construction)</div>} />
                <Route path="/expenses" component={() => <div className="p-8 text-2xl font-bold">Dépenses (En construction)</div>} />
                <Route path="/invoices" component={() => <div className="p-8 text-2xl font-bold">Facturation (En construction)</div>} />
                <Route path="/settings/preferences" component={() => <div className="p-8 text-2xl font-bold">Paramètres (En construction)</div>} />
                <Route>404 Page Not Found</Route>
            </Switch>
        </RootLayout>
    );
}

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider>
                <LanguageProvider>
                    <TenantProvider>
                        <AuthProvider>
                            <Router />
                            <Toaster />
                        </AuthProvider>
                    </TenantProvider>
                </LanguageProvider>
            </ThemeProvider>
        </QueryClientProvider>
    );
}

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <App />
    </StrictMode>,
);
