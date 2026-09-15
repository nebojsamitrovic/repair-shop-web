import { api } from 'api/client'
import type { DashboardView } from 'api/types'

export const dashboardApi = {
    get: async () => (await api.get<DashboardView>('/dashboard')).data,
}

export const dashboardKeys = { all: ['dashboard'] as const }
