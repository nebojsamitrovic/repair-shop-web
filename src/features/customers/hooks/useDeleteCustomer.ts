import { useQueryClient } from '@tanstack/react-query'
import { App } from 'antd'
import { useTranslation } from 'react-i18next'

import { useMutation } from 'hooks'
import { customerKeys, customersApi } from '../utils/api'

const useDeleteCustomer = () => {
    const { t } = useTranslation()
    const { message } = App.useApp()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (customerId: string) => await customersApi.remove(customerId),
        onSuccess: async () => {
            message.success(t('customers.deleted'))
            await queryClient.invalidateQueries({ queryKey: customerKeys.all })
        },
        onError: (error) => message.error(error.message),
    })
}

export default useDeleteCustomer
