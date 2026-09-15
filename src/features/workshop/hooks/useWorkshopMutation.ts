import { useQueryClient } from '@tanstack/react-query'
import { App } from 'antd'
import { useTranslation } from 'react-i18next'

import type { ServiceOrderDetail } from 'api/types'
import { useMutation } from 'hooks'
import { vehicleKeys } from 'features/vehicles/utils/api'
import { workshopKeys } from '../utils/api'

/**
 * Finishing an order moves the car's maintenance clock, so the vehicle is refetched with the
 * order — there is no workshop change worth leaving the car's screen stale for.
 */
const useWorkshopMutation = <TVariables>(
    mutationFn: (variables: TVariables) => Promise<ServiceOrderDetail>,
    successKey?: string
) => {
    const { t } = useTranslation()
    const { message } = App.useApp()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn,
        onSuccess: async (order) => {
            if (successKey) message.success(t(successKey))
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: workshopKeys.all }),
                queryClient.invalidateQueries({ queryKey: vehicleKeys.all }),
            ])
            queryClient.setQueryData(workshopKeys.detail(order.summary.id), order)
        },
        onError: (error) => message.error(error.message),
    })
}

export default useWorkshopMutation
