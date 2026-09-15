import { QueryClient } from '@tanstack/react-query'

import { toAppError } from 'api/errors'

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
            retry: (failureCount, error) => {
                const { status } = toAppError(error)
                /* Retrying a 401/403/404/409 only delays showing the user what happened. */
                if (status >= 400 && status < 500) return false
                return failureCount < 2
            },
        },
        mutations: { retry: false },
    },
})
