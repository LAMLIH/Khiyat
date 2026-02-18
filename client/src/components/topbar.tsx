import { Moon, Sun, Languages, LogOut, User as UserIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
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
        <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/40">
            <div className="container flex h-16 items-center justify-between px-6 md:px-8">
                <div className="flex items-center gap-4">
                    <h2 className="text-lg font-bold tracking-tight text-foreground transition-all animate-in fade-in slide-in-from-left-2">
                        {getPageTitle()}
                    </h2>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center bg-muted/40 p-1 rounded-2xl border border-border/50">
                        {/* Language Switcher */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-background shadow-sm hover:shadow-md transition-all">
                                    <Languages className="h-4 w-4" />
                                    <span className="sr-only">Switch language</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align={isRTL ? "start" : "end"} className="rounded-2xl border-2 shadow-2xl p-2 min-w-[140px]">
                                <DropdownMenuItem
                                    className={cn("rounded-xl cursor-pointer p-3 mb-1", language === 'fr' && "bg-primary text-white font-bold")}
                                    onClick={() => setLanguage('fr')}
                                >
                                    Français
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className={cn("rounded-xl cursor-pointer font-arabic p-3", language === 'ar' && "bg-primary text-white font-bold")}
                                    onClick={() => setLanguage('ar')}
                                >
                                    العربية
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <div className="w-[1px] h-4 bg-border/50 mx-1" />

                        {/* Theme Toggle */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-xl hover:bg-background shadow-sm hover:shadow-md transition-all"
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
                                <Button variant="ghost" className="h-10 gap-2 px-3 rounded-xl hover:bg-muted transition-all border border-transparent hover:border-border">
                                    <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <UserIcon className="h-4 w-4 text-primary" />
                                    </div>
                                    <span className="text-sm font-bold hidden sm:inline-block truncate max-w-[100px]">
                                        {user.fullName}
                                    </span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align={isRTL ? "start" : "end"} className="rounded-2xl border-2 shadow-2xl p-2 min-w-[200px]">
                                <div className="px-3 py-2 mb-2">
                                    <p className="text-xs font-bold text-muted-foreground uppercase">{isRTL ? "المستخدم" : "Utilisateur"}</p>
                                    <p className="font-bold truncate">{user.fullName}</p>
                                    <p className="text-xs text-muted-foreground truncate">{user.username}</p>
                                </div>
                                <DropdownMenuSeparator className="mb-1" />
                                <DropdownMenuItem
                                    className="rounded-xl cursor-pointer p-3 text-destructive focus:text-destructive focus:bg-destructive/10 gap-2 font-bold"
                                    onClick={() => logout()}
                                >
                                    <LogOut className="h-4 w-4" />
                                    {isRTL ? "تسجيل الخروج" : "Déconnexion"}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </div>
        </header>
    );
}
