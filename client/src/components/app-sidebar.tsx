import {
    Users,
    History,
    LogOut,
    BarChart3,
    Scissors,
    LayoutDashboard,
    ClipboardList,
    ChevronDown,
    ShoppingBag,
    Wallet,
    Package,
    Settings,
    FileText,
    Truck,
    Factory
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubItem,
    SidebarMenuSubButton,
    SidebarFooter,
    SidebarHeader,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/use-auth";

interface NavItem {
    titleKey: string;
    url: string;
    icon: any;
    badge?: number;
}

interface CollapsibleNavItem {
    key: string;
    titleKey: string;
    icon: any;
    items: NavItem[];
}

type SidebarItem = ({ type: "simple" } & NavItem) | ({ type: "collapsible" } & CollapsibleNavItem);

import logo from "@/assets/logo.png";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const [location] = useLocation();
    const { t } = useTranslation();
    const { language, isRTL } = useLanguage();
    const { user, logout } = useAuth();

    // Default open state based on current location
    const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

    useEffect(() => {
        // Auto-open menu if child is active
        const newOpenState = { ...openMenus };
        menuStructure.forEach(item => {
            if (item.type === "collapsible") {
                const isActive = item.items.some(subItem => location === subItem.url);
                if (isActive) {
                    newOpenState[item.key] = true;
                }
            }
        });
        setOpenMenus(newOpenState);
    }, [location]);

    const toggleMenu = (key: string) => {
        setOpenMenus(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const menuStructure: SidebarItem[] = [
        {
            type: "simple",
            titleKey: "common.dashboard",
            url: "/",
            icon: LayoutDashboard,
        },
        {
            type: "collapsible",
            key: "management",
            titleKey: "common.management",
            icon: Scissors,
            items: [
                {
                    titleKey: "common.orders",
                    url: "/orders",
                    icon: ClipboardList,
                    badge: 5, // Example badge count
                },
                {
                    titleKey: "common.clients",
                    url: "/clients",
                    icon: Users,
                },
                {
                    titleKey: "common.measurements",
                    url: "/measurements",
                    icon: History,
                },
            ],
        },
        {
            type: "collapsible",
            key: "finance",
            titleKey: "common.finance", // Need to ensure translation exists or fallback
            icon: Wallet,
            items: [
                {
                    titleKey: "common.expenses", // Placeholder for now
                    url: "/expenses",
                    icon: ShoppingBag,
                },
                {
                    titleKey: "common.invoices", // Placeholder
                    url: "/invoices",
                    icon: FileText,
                },
            ],
        },
        {
            type: "simple",
            titleKey: "common.products",
            url: "/products",
            icon: Package,
        },
        {
            type: "simple",
            titleKey: "common.stats",
            url: "/stats",
            icon: BarChart3,
        },
        {
            type: "collapsible",
            key: "settings",
            titleKey: "common.settings",
            icon: Settings,
            items: [
                {
                    titleKey: "common.preferences",
                    url: "/settings/preferences",
                    icon: Settings,
                }
            ]
        }
    ];

    return (
        <Sidebar
            variant="sidebar"
            side={isRTL ? "right" : "left"}
            className="border-none bg-[#1e293b] text-white"
            {...props}
        >
            <SidebarHeader className="p-4 flex flex-col items-center justify-center border-b border-white/10 mb-4">
                <Link href="/" className="flex flex-col items-center gap-2 group transition-transform hover:scale-105">
                    <div className="relative h-24 w-full flex items-center justify-center overflow-hidden rounded-xl bg-white/5 p-2 border border-white/5 group-hover:bg-white/10">
                        <img
                            src={logo}
                            alt="Khiyatma Logo"
                            className="h-full w-auto object-contain drop-shadow-2xl"
                        />
                    </div>
                </Link>
            </SidebarHeader>

            <SidebarContent className="px-3 py-6 custom-scrollbar">
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu className="gap-1">
                            {menuStructure.map((item) => {
                                const title = t(item.titleKey);

                                if (item.type === "simple") {
                                    const isActive = location === item.url;
                                    return (
                                        <SidebarMenuItem key={item.url}>
                                            <SidebarMenuButton
                                                asChild
                                                isActive={isActive}
                                                className={cn(
                                                    "w-full justify-start gap-4 px-4 py-6 rounded-lg transition-all duration-200",
                                                    isActive
                                                        ? "bg-blue-600 text-white shadow-md hover:bg-blue-700 hover:text-white"
                                                        : "text-slate-300 hover:bg-white/5 hover:text-white"
                                                )}
                                            >
                                                <Link href={item.url}>
                                                    <item.icon className={cn("h-5 w-5 shrink-0", isActive ? "text-white" : "text-slate-400 group-hover:text-white")} />
                                                    <span className="font-medium text-[15px]">{title}</span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    );
                                }

                                if (item.type === "collapsible") {
                                    const isAnyChildActive = item.items.some(subItem => location === subItem.url);
                                    const isOpen = openMenus[item.key] || isAnyChildActive;

                                    return (
                                        <Collapsible
                                            key={item.key}
                                            open={isOpen}
                                            onOpenChange={() => toggleMenu(item.key)}
                                            className="group/collapsible"
                                        >
                                            <SidebarMenuItem>
                                                <CollapsibleTrigger asChild>
                                                    <SidebarMenuButton
                                                        className={cn(
                                                            "w-full justify-start gap-4 px-4 py-6 rounded-lg transition-all duration-200 group-data-[state=open]/collapsible:bg-white/5",
                                                            isAnyChildActive
                                                                ? "text-white bg-white/5"
                                                                : "text-slate-300 hover:bg-white/5 hover:text-white"
                                                        )}
                                                    >
                                                        <item.icon className={cn("h-5 w-5 shrink-0", isAnyChildActive ? "text-blue-400" : "text-slate-400 group-hover:text-white")} />
                                                        <span className="font-medium text-[15px] flex-1 text-start">{title}</span>
                                                        <ChevronDown className={cn(
                                                            "h-4 w-4 shrink-0 transition-transform duration-200 opacity-50",
                                                            isOpen && "rotate-180"
                                                        )} />
                                                    </SidebarMenuButton>
                                                </CollapsibleTrigger>
                                                <CollapsibleContent className="data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp overflow-hidden">
                                                    <SidebarMenuSub className="ml-4 mr-0 border-l border-slate-700 my-1 py-1 space-y-0.5">
                                                        {item.items.map((subItem) => {
                                                            const isSubActive = location === subItem.url;
                                                            return (
                                                                <SidebarMenuSubItem key={subItem.url}>
                                                                    <SidebarMenuSubButton
                                                                        asChild
                                                                        isActive={isSubActive}
                                                                        className={cn(
                                                                            "h-10 px-4 rounded-md transition-colors block w-full text-left",
                                                                            isSubActive
                                                                                ? "bg-blue-600/20 text-blue-400 font-medium"
                                                                                : "text-slate-400 hover:text-white hover:bg-white/5"
                                                                        )}
                                                                    >
                                                                        <Link href={subItem.url} className="flex items-center justify-between w-full">
                                                                            <span className="text-sm">{t(subItem.titleKey)}</span>
                                                                            {subItem.badge && (
                                                                                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center">
                                                                                    {subItem.badge}
                                                                                </span>
                                                                            )}
                                                                        </Link>
                                                                    </SidebarMenuSubButton>
                                                                </SidebarMenuSubItem>
                                                            );
                                                        })}
                                                    </SidebarMenuSub>
                                                </CollapsibleContent>
                                            </SidebarMenuItem>
                                        </Collapsible>
                                    );
                                }
                                return null;
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="p-4 bg-black/20">
                {user && (
                    <div className="flex items-center gap-3 px-2 py-2">
                        <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-lg border-2 border-slate-700">
                            {user.fullName.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="font-bold text-sm text-white truncate">{user.fullName}</div>
                            <div className="text-xs text-slate-400">Gérant</div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg"
                            onClick={() => logout()}
                        >
                            <LogOut className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            </SidebarFooter>
        </Sidebar>
    );
}
