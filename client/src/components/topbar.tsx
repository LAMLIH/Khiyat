import { Moon, Sun, Languages, LogOut, User as UserIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

export function Topbar() {
    const { t } = useTranslation();
    const [location] = useLocation();
    const { language, setLanguage, isRTL } = useLanguage();
    const { theme, setTheme } = useTheme();
    const { user, logout } = useAuth();

    const getPageTitle = () => {
        if (location === "/") return t("common.dashboard");
        if (location === "/clients") return t("common.clients");
        if (location === "/measurements") return t("common.measurements");
        if (location === "/orders") return t("common.orders");
        if (location === "/stats") return t("common.stats");
        return "";
    };

    return (
        <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center justify-between gap-2 border-b bg-card px-4 md:px-6">
            <div className="flex items-center gap-2 md:gap-4">
                <SidebarTrigger className="md:hidden" />
                <h1 className="text-lg font-semibold tracking-tight">
                    {getPageTitle()}
                </h1>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    {/* Language Switcher */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-sm hover:bg-background shadow-sm hover:shadow-none transition-all">
                                <Languages className="h-4 w-4" />
                                <span className="sr-only">Switch language</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align={isRTL ? "start" : "end"} className="rounded-sm border-2 shadow-2xl p-2 min-w-[140px]">
                            <DropdownMenuItem onClick={() => setLanguage('fr')}>
                                Français
                                {language === 'fr' && <span className="ml-auto text-primary text-xs">✓</span>}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setLanguage('ar')} className="font-arabic">
                                العربية
                                {language === 'ar' && <span className="ml-auto text-primary text-xs">✓</span>}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <div className="w-[1px] h-4 bg-border/50 mx-1" />

                    {/* Theme Toggle */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-sm hover:bg-background shadow-sm hover:shadow-none transition-all"
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    >
                        {theme === "dark" ? (
                            <Sun className="h-4 w-4 transition-all text-amber-500" />
                        ) : (
                            <Moon className="h-4 w-4 transition-all text-blue-600" />
                        )}
                        <span className="sr-only">Toggle theme</span>
                    </Button>
                </div>

                {user && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-full">
                                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center border">
                                    <UserIcon className="h-4 w-4" />
                                </div>
                                <span className="sr-only">Toggle user menu</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align={isRTL ? "start" : "end"}>
                            <div className="px-3 py-2 mb-2">
                                <p className="text-xs font-bold text-muted-foreground uppercase">{isRTL ? "المستخدم" : "Utilisateur"}</p>
                                <p className="font-bold truncate">{user.fullName}</p>
                                <p className="text-xs text-muted-foreground truncate">{user.username}</p>
                            </div>
                            <DropdownMenuSeparator className="mb-1" />
                            <DropdownMenuItem onClick={() => logout()}>
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>{isRTL ? "تسجيل الخروج" : "Déconnexion"}</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>
        </header>
    );
}
