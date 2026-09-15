import { useQueryClient } from '@tanstack/react-query'
import { App } from 'antd'
import { useTranslation } from 'react-i18next'

import type { CreateRoleRequest, RoleView } from 'api/types'
import { useMutation } from 'hooks'
import { roleKeys, rolesApi } from '../utils/api'

const useCreateRole = (onCreated: (role: RoleView) => void) => {
    const { t } = useTranslation()
    const { message } = App.useApp()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (body: CreateRoleRequest) => await rolesApi.create(body),
        onSuccess: async (role) => {
            message.success(t('roles.created'))
            await queryClient.invalidateQueries({ queryKey: roleKeys.all })
            onCreated(role)
        },
    })
}

export default useCreateRole
