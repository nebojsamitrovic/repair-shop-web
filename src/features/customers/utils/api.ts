import { api } from 'api/client'
import type { CustomerRequest, CustomerView, PageResponse, VehicleSummary } from 'api/types'

export const customersApi = {
    list: async (params: Record<string, unknown>) =>
        (await api.get<PageResponse<CustomerView>>('/customers', { params })).data,
    get: async (customerId: string) => (await api.get<CustomerView>(`/customers/${customerId}`)).data,
    vehicles: async (customerId: string) => (await api.get<VehicleSummary[]>(`/customers/${customerId}/vehicles`)).data,
    create: async (body: CustomerRequest) => (await api.post<CustomerView>('/customers', body)).data,
    update: async (customerId: string, body: CustomerRequest) =>
        (await api.patch<CustomerView>(`/customers/${customerId}`, body)).data,
    remove: async (customerId: string) => await api.delete(`/customers/${customerId}`),
}

export const customerKeys = {
    all: ['customers'] as const,
    list: (params: Record<string, unknown>) => ['customers', 'list', params] as const,
    detail: (customerId: string) => ['customers', 'detail', customerId] as const,
    vehicles: (customerId: string) => ['customers', 'vehicles', customerId] as const,
}

export const customerFilterKeys = ['search']
