import { useQueryClient } from '@tanstack/react-query'
import { App } from 'antd'
import { useTranslation } from 'react-i18next'

import { useSession } from 'auth/session'
import { useMutation } from 'hooks'
import { roleKeys, rolesApi } from '../utils/api'

/**
 * The caller may be editing a role they hold themselves, in which case their own menu is now wrong;
 * re-reading the session is what stops the screen from hiding something they were just granted.
 */
const useSaveRolePermissions = (roleId: string) => {
    const { t } = useTranslation()
    const { message } = App.useApp()
    const { refresh } = useSession()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (permissions: string[]) => await rolesApi.replacePermissions(roleId, permissions),
        onSuccess: async () => {
            message.success(t('roles.saved'))
            await queryClient.invalidateQueries({ queryKey: roleKeys.all })
            await refresh()
        },
        onError: (error) => message.error(error.message),
    })
}

export default useSaveRolePermissions
