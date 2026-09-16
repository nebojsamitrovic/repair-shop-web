import { api } from 'api/client'
import type {
    ChangeOwnerRequest,
    CreateVehicleRequest,
    DocumentSent,
    PageResponse,
    RecordMileageRequest,
    SendDocumentRequest,
    ServiceBook,
    ServiceOrderSummary,
    UpdateVehicleRequest,
    VehicleDetail,
    VehicleOwner,
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

    owners: async (vehicleId: string) => (await api.get<VehicleOwner[]>(`/vehicles/${vehicleId}/owners`)).data,
    changeOwner: async (vehicleId: string, body: ChangeOwnerRequest) =>
        (await api.post<VehicleDetail>(`/vehicles/${vehicleId}/owner`, body)).data,

    /** The car's finished work: what the book shows, prints and sends. */
    serviceBook: async (vehicleId: string) => (await api.get<ServiceBook>(`/vehicles/${vehicleId}/service-book`)).data,
    serviceBookPdf: async (vehicleId: string, lang?: string) =>
        (
            await api.get<Blob>(`/vehicles/${vehicleId}/service-book/pdf`, {
                params: { lang },
                responseType: 'blob',
            })
        ).data,
    emailServiceBook: async (vehicleId: string, body: SendDocumentRequest) =>
        (await api.post<DocumentSent>(`/vehicles/${vehicleId}/service-book/email`, body)).data,
}

export const vehicleKeys = {
    all: ['vehicles'] as const,
    list: (params: Record<string, unknown>) => ['vehicles', 'list', params] as const,
    detail: (vehicleId: string) => ['vehicles', 'detail', vehicleId] as const,
    history: (vehicleId: string) => ['vehicles', 'history', vehicleId] as const,
    serviceBook: (vehicleId: string) => ['vehicles', 'service-book', vehicleId] as const,
}

export const vehicleFilterKeys = ['search', 'customerId', 'make']
