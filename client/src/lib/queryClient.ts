import { QueryClient, QueryFunction } from "@tanstack/react-query";

export const getQueryFn: QueryFunction = async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string);
    if (!res.ok) {
        throw new Error(await res.text());
    }
    return res.json();
};

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            queryFn: getQueryFn,
            retry: false,
            refetchOnWindowFocus: false,
        },
    },
});

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
            const body = await res.clone().text();
            try {
                const error = JSON.parse(body);
                message = error.message || message;
            } catch {
                if (body) message = body.slice(0, 100);
            }
        } catch {
            // Fallback to statusText
        }
        throw new Error(message);
    }

    return res.json();
}
