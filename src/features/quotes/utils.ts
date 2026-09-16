import { api } from 'api/client'
import type { PublicQuote } from 'api/types'

/** No sign-in: the token in the path is the whole credential. */
export const publicQuoteApi = {
    get: async (token: string) => (await api.get<PublicQuote>(`/public/quotes/${token}`)).data,
    approve: async (token: string, name?: string) =>
        (await api.post<PublicQuote>(`/public/quotes/${token}/approve`, { name })).data,
}
