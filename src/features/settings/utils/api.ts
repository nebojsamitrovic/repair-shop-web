import { api } from 'api/client'
import type { AuditLogView, InvitationView, PageResponse, UserResponse } from 'api/types'

export const usersApi = {
    list: async (params: Record<string, unknown>) =>
        (await api.get<PageResponse<UserResponse>>('/users', { params })).data,
    setRoles: async (userId: string, roles: string[]) =>
        (await api.patch<UserResponse>(`/users/${userId}/roles`, { roles })).data,
    setStatus: async (userId: string, status: string) =>
        (await api.patch<UserResponse>(`/users/${userId}/status`, { status })).data,
    remove: async (userId: string) => await api.delete(`/users/${userId}`),
}

export const invitationsApi = {
    list: async (params: Record<string, unknown>) =>
        (await api.get<PageResponse<InvitationView>>('/users/invitations', { params })).data,
    create: async (body: { email: string; roles: string[] }) =>
        (await api.post<InvitationView>('/users/invitations', body)).data,
    revoke: async (id: string) => await api.delete(`/users/invitations/${id}`),
}

export const auditApi = {
    list: async (params: Record<string, unknown>) =>
        (await api.get<PageResponse<AuditLogView>>('/audit-logs', { params })).data,
}

export const userKeys = { all: ['users'] as const }
export const invitationKeys = { all: ['invitations'] as const }
export const userFilterKeys = ['search', 'role', 'status']
export const auditFilterKeys = ['action', 'entityType', 'userId', 'from', 'to']
