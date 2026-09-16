import { api } from 'api/client'
import type {
    Appointment,
    ArrivalRequest,
    BookAppointmentRequest,
    ServiceOrderDetail,
    UpdateAppointmentRequest,
} from 'api/types'

export interface AppointmentWindow {
    from: string
    to: string
    locationId?: string
    mechanicUserId?: string
    vehicleId?: string
}

export const appointmentsApi = {
    list: async (params: AppointmentWindow) => (await api.get<Appointment[]>('/appointments', { params })).data,
    upcoming: async (vehicleId: string) => (await api.get<Appointment[]>(`/vehicles/${vehicleId}/appointments`)).data,
    book: async (body: BookAppointmentRequest) => (await api.post<Appointment>('/appointments', body)).data,
    update: async (appointmentId: string, body: UpdateAppointmentRequest) =>
        (await api.patch<Appointment>(`/appointments/${appointmentId}`, body)).data,
    cancel: async (appointmentId: string) =>
        (await api.post<Appointment>(`/appointments/${appointmentId}/cancel`)).data,
    noShow: async (appointmentId: string) =>
        (await api.post<Appointment>(`/appointments/${appointmentId}/no-show`)).data,
    openOrder: async (appointmentId: string, body: ArrivalRequest) =>
        (await api.post<ServiceOrderDetail>(`/appointments/${appointmentId}/order`, body)).data,
}

export const appointmentKeys = {
    all: ['appointments'] as const,
    window: (params: AppointmentWindow) => ['appointments', 'window', params] as const,
    upcoming: (vehicleId: string) => ['appointments', 'upcoming', vehicleId] as const,
}
