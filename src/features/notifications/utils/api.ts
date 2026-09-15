import { api } from 'api/client'
import type { NotificationView, PageResponse } from 'api/types'

export const notificationsApi = {
    list: async (params: Record<string, unknown>) =>
        (await api.get<PageResponse<NotificationView>>('/notifications', { params })).data,
    markRead: async (id: string) => (await api.post<NotificationView>(`/notifications/${id}/read`)).data,
    markAllRead: async () => await api.post('/notifications/read-all'),
}

export const notificationKeys = { all: ['notifications'] as const }
