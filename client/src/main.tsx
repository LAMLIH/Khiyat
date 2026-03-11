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
import SaaSAuthPage from "./pages/saas-admin/auth";
import DashboardPage from "./pages/dashboard";
import ClientsPage from "./pages/clients";
import MeasurementsPage from "./pages/measurements";
import OrdersPage from "./pages/orders";
import LandingPage from "./pages/LandingPage";

// SaaS Admin Pages
import SaaSAdminDashboard from "./pages/saas-admin/dashboard";
import SaaSAdminTenants from "./pages/saas-admin/tenants";

function Router() {
    const { user, isLoading } = useAuth();
    const [location] = useLocation();

    // Detect subdomain
    const hostname = window.location.hostname;
    const parts = hostname.split(".");

    let subdomain = "";

    // Logic for subdomain detection:
    // 1. localhost: sub.localhost (length 2)
    // 2. Platform (sevalla.app): tenant.app-name.sevalla.app (length 4)
    // 3. Custom Domain: sub.domain.com (length 3)

    if (hostname.endsWith("sevalla.app")) {
        if (parts.length > 3) {
            subdomain = parts[0];
        }
    } else if (parts.length > 2) {
        subdomain = parts[0];
    } else if (parts.length === 2 && parts[1] === "localhost") {
        subdomain = parts[0];
    }

    const isRootDomain = subdomain === "";
    const isSaaSAdminSubdomain = subdomain === "admin";

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    // 1. Root Domain -> Always Landing Page (unless explicitly went to /dashboard or something, but let's keep it simple)
    if (isRootDomain) {
        if (location === "/") return <LandingPage />;
        // If they try to access other routes on root, maybe redirect to landing or show 404
        return <LandingPage />;
    }

    // 2. SaaS Admin Subdomain
    if (isSaaSAdminSubdomain) {
        if (!user) return <SaaSAuthPage />;
        if (user.role !== "saas_admin") {
            return (
                <div className="flex items-center justify-center min-h-screen text-destructive font-bold text-xl p-8 bg-background">
                    Accès Interdit : Cette interface est réservée aux administrateurs SaaS.
                </div>
            );
        }

        return (
            <RootLayout>
                <Switch>
                    <Route path="/" component={SaaSAdminDashboard} />
                    <Route path="/tenants" component={SaaSAdminTenants} />
                    <Route>404 Page Not Found (SaaS Admin)</Route>
                </Switch>
            </RootLayout>
        );
    }

    // 3. Client Subdomain (any other subdomain)
    if (!user) return <AuthPage />;

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
