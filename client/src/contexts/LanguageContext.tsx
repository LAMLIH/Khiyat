import React, { createContext, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

type LanguageContextType = {
    language: string;
    setLanguage: (lang: string) => void;
    isRTL: boolean;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const { i18n } = useTranslation();
    const [language, setLangState] = useState(() => {
        const storedLang = i18n.language;
        const hostname = window.location.hostname;
        const parts = hostname.split(".");
        // Check if we are on the admin subdomain
        const isAdminSubdomain = parts[0] === "admin" || parts.includes("admin");
        
        if (isAdminSubdomain) {
            return "fr";
        }
        return storedLang || "ar";
    });
    const isRTL = language === "ar";

    useEffect(() => {
        document.documentElement.dir = isRTL ? "rtl" : "ltr";
        document.documentElement.lang = language;
        // Also ensure i18n is synced (especially on first load)
        if (i18n.language !== language) {
            i18n.changeLanguage(language);
        }
    }, [language, isRTL, i18n]);

    const setLanguage = (lang: string) => {
        i18n.changeLanguage(lang);
        setLangState(lang);
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, isRTL }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
}
