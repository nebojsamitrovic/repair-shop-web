import { api } from 'api/client'
import type { CreateRoleRequest, PermissionEntry, RoleView } from 'api/types'

export const rolesApi = {
    list: async () => (await api.get<RoleView[]>('/roles')).data,
    permissions: async () => (await api.get<PermissionEntry[]>('/roles/permissions')).data,
    create: async (body: CreateRoleRequest) => (await api.post<RoleView>('/roles', body)).data,
    replacePermissions: async (roleId: string, permissions: string[]) =>
        (await api.put<RoleView>(`/roles/${roleId}/permissions`, { permissions })).data,
}

export const roleKeys = {
    all: ['roles'] as const,
    list: ['roles', 'list'] as const,
    catalogue: ['roles', 'permissions'] as const,
}

/** `vehicle:repair:manage` belongs with the cars: the resource is what comes before the first colon. */
export const resourceOf = (permissionCode: string) => permissionCode.split(':')[0]
