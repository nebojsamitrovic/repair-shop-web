import { api } from 'api/client'
import type {
    CountStockRequest,
    CreateStockItemRequest,
    PageResponse,
    ReceiveStockRequest,
    StockItem,
    StockMovement,
    UpdateStockItemRequest,
} from 'api/types'

export const stockApi = {
    list: async (params: Record<string, unknown>) =>
        (await api.get<PageResponse<StockItem>>('/stock', { params })).data,
    get: async (itemId: string) => (await api.get<StockItem>(`/stock/${itemId}`)).data,
    movements: async (itemId: string) => (await api.get<StockMovement[]>(`/stock/${itemId}/movements`)).data,
    create: async (body: CreateStockItemRequest) => (await api.post<StockItem>('/stock', body)).data,
    update: async (itemId: string, body: UpdateStockItemRequest) =>
        (await api.patch<StockItem>(`/stock/${itemId}`, body)).data,
    receive: async (itemId: string, body: ReceiveStockRequest) =>
        (await api.post<StockItem>(`/stock/${itemId}/receive`, body)).data,
    count: async (itemId: string, body: CountStockRequest) =>
        (await api.post<StockItem>(`/stock/${itemId}/count`, body)).data,
    remove: async (itemId: string) => await api.delete(`/stock/${itemId}`),
}

export const stockKeys = {
    all: ['stock'] as const,
    list: (params: Record<string, unknown>) => ['stock', 'list', params] as const,
    movements: (itemId: string) => ['stock', 'movements', itemId] as const,
    /** What the parts editor picks from: everything on the shelf, fetched once. */
    shelf: ['stock', 'shelf'] as const,
}

export const stockFilterKeys = ['search', 'condition', 'inStockOnly']
