import { useState, useEffect } from "react";
import { useTenant } from "./use-tenant";

const DEFAULT_CATEGORIES = [
    "Loyer",
    "Électricité",
    "Eau",
    "Internet",
    "Tissu",
    "Fil",
    "Fournitures",
    "Transport",
    "Nettoyage",
    "Autre",
];

export function useExpenseCategories() {
    const { tenantId } = useTenant();
    const storageKey = `expense_categories_${tenantId ?? "default"}`;

    const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);

    // Load from storage when tenantId is known
    useEffect(() => {
        try {
            const stored = localStorage.getItem(storageKey);
            setCategories(stored ? JSON.parse(stored) : DEFAULT_CATEGORIES);
        } catch {
            setCategories(DEFAULT_CATEGORIES);
        }
    }, [storageKey]);

    // Persist whenever categories change (skip if tenantId still null)
    useEffect(() => {
        if (tenantId !== null) {
            localStorage.setItem(storageKey, JSON.stringify(categories));
        }
    }, [categories, storageKey, tenantId]);

    const addCategory = (name: string) => {
        const trimmed = name.trim();
        if (trimmed && !categories.includes(trimmed)) {
            setCategories(prev => [...prev, trimmed]);
        }
    };

    const deleteCategory = (name: string) => {
        setCategories(prev => prev.filter(c => c !== name));
    };

    const updateCategory = (oldName: string, newName: string) => {
        const trimmed = newName.trim();
        if (trimmed && !categories.includes(trimmed)) {
            setCategories(prev => prev.map(c => (c === oldName ? trimmed : c)));
        }
    };

    const resetToDefault = () => setCategories(DEFAULT_CATEGORIES);

    return { categories, addCategory, deleteCategory, updateCategory, resetToDefault };
}
