import { useQueryClient } from '@tanstack/react-query'
import { App } from 'antd'
import { useTranslation } from 'react-i18next'

import type { CustomerRequest } from 'api/types'
import { useMutation } from 'hooks'
import { customerKeys, customersApi } from '../utils/api'

/** One hook for both create and update: the drawer decides which by whether it was given an id. */
const useSaveCustomer = (customerId?: string) => {
    const { t } = useTranslation()
    const { message } = App.useApp()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (body: CustomerRequest) =>
            customerId ? await customersApi.update(customerId, body) : await customersApi.create(body),
        onSuccess: async () => {
            message.success(t('customers.saved'))
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: customerKeys.all }),
                queryClient.invalidateQueries({ queryKey: ['directory', 'customers'] }),
            ])
        },
    })
}

export default useSaveCustomer
