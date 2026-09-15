import { api } from 'api/client'
import type { GarageSettings, LocationRequest, LocationView, UpdateGarageSettingsRequest } from 'api/types'

export const garageApi = {
    settings: async () => (await api.get<GarageSettings>('/settings')).data,
    updateSettings: async (body: UpdateGarageSettingsRequest) =>
        (await api.patch<GarageSettings>('/settings', body)).data,

    locations: async () => (await api.get<LocationView[]>('/locations')).data,
    createLocation: async (body: LocationRequest) => (await api.post<LocationView>('/locations', body)).data,
    updateLocation: async (locationId: string, body: Partial<LocationRequest>) =>
        (await api.patch<LocationView>(`/locations/${locationId}`, body)).data,
    setLocationActive: async (locationId: string, active: boolean) =>
        (await api.post<LocationView>(`/locations/${locationId}/active`, { active })).data,
}

export const garageKeys = {
    settings: ['garage', 'settings'] as const,
    locations: ['garage', 'locations'] as const,
}
