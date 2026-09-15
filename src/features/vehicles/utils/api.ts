import { api } from 'api/client'
import type {
    CreateVehicleRequest,
    PageResponse,
    RecordMileageRequest,
    ServiceOrderSummary,
    UpdateVehicleRequest,
    VehicleDetail,
    VehicleSummary,
} from 'api/types'

export const vehiclesApi = {
    list: async (params: Record<string, unknown>) =>
        (await api.get<PageResponse<VehicleSummary>>('/vehicles', { params })).data,
    get: async (vehicleId: string) => (await api.get<VehicleDetail>(`/vehicles/${vehicleId}`)).data,
    create: async (body: CreateVehicleRequest) => (await api.post<VehicleDetail>('/vehicles', body)).data,
    update: async (vehicleId: string, body: UpdateVehicleRequest) =>
        (await api.patch<VehicleDetail>(`/vehicles/${vehicleId}`, body)).data,
    recordMileage: async (vehicleId: string, body: RecordMileageRequest) =>
        (await api.post<VehicleDetail>(`/vehicles/${vehicleId}/mileage`, body)).data,
    remove: async (vehicleId: string) => await api.delete(`/vehicles/${vehicleId}`),
    history: async (vehicleId: string) =>
        (await api.get<ServiceOrderSummary[]>(`/vehicles/${vehicleId}/service-orders`)).data,
}

export const vehicleKeys = {
    all: ['vehicles'] as const,
    list: (params: Record<string, unknown>) => ['vehicles', 'list', params] as const,
    detail: (vehicleId: string) => ['vehicles', 'detail', vehicleId] as const,
    history: (vehicleId: string) => ['vehicles', 'history', vehicleId] as const,
}

export const vehicleFilterKeys = ['search', 'customerId', 'make']
