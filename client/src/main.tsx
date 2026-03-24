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
import ExpensesPage from "./pages/expenses";
import StatsPage from "./pages/stats";
import SettingsPage from "./pages/settings";

// SaaS Admin Pages
import SaaSAdminDashboard from "./pages/saas-admin/dashboard";
import SaaSAdminTenants from "./pages/saas-admin/tenants";
import SubscribeRequestPage from "./pages/SubscribeRequestPage";
import AdminSubRequestsPage from "./pages/AdminSubRequestsPage";
import TenantStatsPage from "./pages/saas-admin/tenant-stats";
import SaaSAdminUsers from "./pages/saas-admin/users";

function Router() {
    const { user, isLoading } = useAuth();
    const [location] = useLocation();

    // Detect subdomain
    const hostname = window.location.hostname;
    const parts = hostname.split(".");

    let subdomain = "";

    if (hostname.endsWith("sevalla.app")) {
        if (parts.length > 3) subdomain = parts[0];
    } else if (hostname === "localhost" || hostname === "127.0.0.1") {
        subdomain = "";
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

    // 1. Permanent Global Routes (Public)
    if (location.startsWith("/subscribe-request")) {
        return <SubscribeRequestPage />;
    }

    // 2. Root Domain Routing
    if (isRootDomain) {
        return (
            <Switch>
                <Route path="/" component={LandingPage} />
                <Route component={LandingPage} />
            </Switch>
        );
    }

    // 3. SaaS Admin Subdomain
    if (isSaaSAdminSubdomain) {
        if (!user) return <SaaSAuthPage />;
        if (user.role !== "saas_admin") {
            return (
                <div className="flex items-center justify-center min-h-screen text-destructive font-bold text-xl p-8 bg-background uppercase">
                    Accès Interdit : Réservé aux administrateurs SaaS.
                </div>
            );
        }

        return (
            <RootLayout>
                <Switch>
                    <Route path="/" component={SaaSAdminDashboard} />
                    <Route path="/tenants" component={SaaSAdminTenants} />
                    <Route path="/tenants/:id/stats" component={TenantStatsPage} />
                    <Route path="/users" component={SaaSAdminUsers} />
                    <Route path="/subscription-requests" component={AdminSubRequestsPage} />
                    <Route>404 SaaS Admin Page Not Found</Route>
                </Switch>
            </RootLayout>
        );
    }

    // 4. Client Subdomain (any other subdomain)
    if (!user) return <AuthPage />;

    return (
        <RootLayout>
            <Switch>
                <Route path="/" component={DashboardPage} />
                <Route path="/clients" component={ClientsPage} />
                <Route path="/measurements" component={MeasurementsPage} />
                <Route path="/orders" component={OrdersPage} />
                <Route path="/stats" component={StatsPage} />
                <Route path="/expenses" component={ExpensesPage} />
                <Route path="/settings/preferences" component={SettingsPage} />
                <Route path="/products" component={() => <div className="p-8 text-2xl font-bold">Produits (En construction)</div>} />
                <Route path="/rentals" component={() => <div className="p-8 text-2xl font-bold">Location (En construction)</div>} />
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
