import React, { createContext, useContext } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { type User, type InsertUser } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (credentials: Pick<InsertUser, "username" | "password">) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const { toast } = useToast();

    const { data: user, isLoading } = useQuery<User>({
        queryKey: ["/api/user"],
        queryFn: async () => {
            const res = await fetch("/api/user");
            if (res.status === 401) return null as any;
            if (!res.ok) throw new Error("Failed to fetch user");
            return res.json();
        },
        retry: false,
    });

    const loginMutation = useMutation({
        mutationFn: async (credentials: Pick<InsertUser, "username" | "password">) => {
            return apiRequest("POST", "/api/login", credentials);
        },
        onSuccess: (user: User) => {
            queryClient.setQueryData(["/api/user"], user);
            toast({
                title: "Connexion réussie",
                description: `Bienvenue, ${user.fullName}`,
            });
        },
        onError: (error: Error) => {
            toast({
                title: "Échec de la connexion",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    const logoutMutation = useMutation({
        mutationFn: async () => {
            await apiRequest("POST", "/api/logout");
        },
        onSuccess: () => {
            queryClient.setQueryData(["/api/user"], null);
            toast({
                title: "Déconnexion réussie",
                description: "À bientôt !",
            });
        },
    });

    return (
        <AuthContext.Provider
            value={{
                user: user || null,
                isLoading,
                login: async (creds) => {
                    await loginMutation.mutateAsync(creds);
                },
                logout: async () => {
                    await logoutMutation.mutateAsync();
                },
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
