import { api } from 'api/client'
import type {
    ConfigureViberRequest,
    GarageLogo,
    ViberSettings,
    ViberWebhook,
    GarageSettings,
    LocationRequest,
    LocationView,
    LogoUpload,
    UpdateGarageSettingsRequest,
} from 'api/types'

export const garageApi = {
    settings: async () => (await api.get<GarageSettings>('/settings')).data,
    updateSettings: async (body: UpdateGarageSettingsRequest) =>
        (await api.patch<GarageSettings>('/settings', body)).data,

    /** Three steps, like every other upload: ask, PUT the bytes, then say which key to use. */
    presignLogo: async (body: { fileName: string; contentType: string; sizeBytes: number }) =>
        (await api.post<LogoUpload>('/settings/logo/upload-url', body)).data,
    changeLogo: async (storageKey: string) => (await api.put<GarageLogo>('/settings/logo', { storageKey })).data,
    removeLogo: async () => (await api.delete<GarageLogo>('/settings/logo')).data,
    viber: async () => (await api.get<ViberSettings>('/settings/viber')).data,
    configureViber: async (body: ConfigureViberRequest) => (await api.put<ViberSettings>('/settings/viber', body)).data,
    registerViberWebhook: async () => (await api.post<ViberWebhook>('/settings/viber/webhook')).data,

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
    viber: ['garage', 'viber'] as const,
}
