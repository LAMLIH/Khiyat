import { QueryClient, QueryFunction } from "@tanstack/react-query";

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
            refetchOnWindowFocus: false,
        },
    },
});

export const getQueryFn: QueryFunction = async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string);
    if (!res.ok) {
        throw new Error(await res.text());
    }
    return res.json();
};

export async function apiRequest(
    method: string,
    url: string,
    data?: unknown,
) {
    const res = await fetch(url, {
        method,
        headers: {
            "Content-Type": "application/json",
        },
        body: data ? JSON.stringify(data) : undefined,
    });

    if (!res.ok) {
        let message = res.statusText;
        try {
            const error = await res.json();
            message = error.message || message;
        } catch {
            const text = await res.text();
            if (text) message = text.slice(0, 100);
        }
        throw new Error(message);
    }

    return res.json();
}
