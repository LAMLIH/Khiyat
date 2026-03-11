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
    Factory,
    Building2
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

import logo from "@/assets/logo-dark.png";

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

    const hostname = window.location.hostname;
    const isSaaSAdminSubdomain = hostname.startsWith("admin.");

    const saasAdminMenu: SidebarItem[] = [
        {
            type: "simple",
            titleKey: "Dashboard Admin",
            url: "/",
            icon: LayoutDashboard,
        },
        {
            type: "simple",
            titleKey: "Gestion Clients",
            url: "/tenants",
            icon: Building2,
        },
    ];

    const tenantMenu: SidebarItem[] = [
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
                    badge: 5,
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
            titleKey: "common.finance",
            icon: Wallet,
            items: [
                {
                    titleKey: "common.expenses",
                    url: "/expenses",
                    icon: ShoppingBag,
                },
                {
                    titleKey: "common.invoices",
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

    const menuStructure = isSaaSAdminSubdomain ? saasAdminMenu : tenantMenu;

    return (
        <Sidebar
            variant="sidebar"
            side={isRTL ? "right" : "left"}
            {...props}
        >
            <SidebarHeader className="h-20 flex justify-center border-sidebar-border/20 border-b">
                <div className="flex flex-col items-center gap-0.5 px-4 py-2">
                    <span className="font-lalezar text-3xl tracking-wide text-white drop-shadow-sm leading-none">خياط برو</span>
                    <span className="text-[10px] text-white/70 font-medium tracking-widest uppercase">بصمتك في الأناقة</span>
                </div>
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
                                                tooltip={title}
                                            >
                                                <Link href={item.url}>
                                                    <item.icon />
                                                    <span>{title}</span>
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
                                                    <SidebarMenuButton tooltip={title} isActive={isAnyChildActive}>
                                                        <item.icon />
                                                        <span>{title}</span>
                                                        <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                                                    </SidebarMenuButton>
                                                </CollapsibleTrigger>
                                                <CollapsibleContent className="data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp overflow-hidden">
                                                    <SidebarMenuSub className="ml-4 mr-0 border-l border-white/20 my-1 py-1 space-y-0.5">
                                                        {item.items.map((subItem) => {
                                                            const isSubActive = location === subItem.url;
                                                            return (
                                                                <SidebarMenuSubItem key={subItem.url}>
                                                                    <SidebarMenuSubButton
                                                                        asChild
                                                                        isActive={isSubActive}
                                                                    >
                                                                        <Link href={subItem.url}>
                                                                            <span>{t(subItem.titleKey)}</span>
                                                                            {subItem.badge && (
                                                                                <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
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

            <SidebarFooter>
                {user && (
                    <div className="flex items-center justify-between gap-2 p-2">
                        <div className="flex items-center gap-2 min-w-0">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted border">
                                <span className="text-xs font-semibold">{user.fullName.substring(0, 2).toUpperCase()}</span>
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-sm font-semibold truncate leading-none">{user.fullName}</span>
                                <span className="text-xs text-muted-foreground truncate leading-none mt-1">{user.username}</span>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => logout()}
                        >
                            <LogOut className="h-4 w-4 text-muted-foreground" />
                        </Button>
                    </div>
                )}
            </SidebarFooter>
        </Sidebar>
    );
}
