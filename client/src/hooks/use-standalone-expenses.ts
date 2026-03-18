import { useState, useEffect } from "react";
import { useTenant } from "./use-tenant";

export interface StandaloneExpense {
    id: string;
    description: string;
    amount: number;
    category: string;
    date: string;
    notes?: string;
}

export function useStandaloneExpenses() {
    const { tenantId } = useTenant();
    const storageKey = `standalone_expenses_${tenantId ?? "default"}`;

    const [expenses, setExpenses] = useState<StandaloneExpense[]>([]);

    // Load from storage when tenantId is known
    useEffect(() => {
        try {
            const stored = localStorage.getItem(storageKey);
            setExpenses(stored ? JSON.parse(stored) : []);
        } catch {
            setExpenses([]);
        }
    }, [storageKey]);

    // Persist when expenses change
    useEffect(() => {
        if (tenantId !== null) {
            localStorage.setItem(storageKey, JSON.stringify(expenses));
        }
    }, [expenses, storageKey, tenantId]);

    const addExpense = (data: Omit<StandaloneExpense, "id">) => {
        const expense: StandaloneExpense = {
            ...data,
            id: `exp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        };
        setExpenses(prev => [expense, ...prev]);
        return expense;
    };

    const updateExpense = (id: string, data: Partial<Omit<StandaloneExpense, "id">>) => {
        setExpenses(prev => prev.map(e => (e.id === id ? { ...e, ...data } : e)));
    };

    const deleteExpense = (id: string) => {
        setExpenses(prev => prev.filter(e => e.id !== id));
    };

    const totalAmount = expenses.reduce((s, e) => s + e.amount, 0);

    return { expenses, addExpense, updateExpense, deleteExpense, totalAmount };
}
