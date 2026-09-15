import { useQueryClient } from '@tanstack/react-query'
import { App } from 'antd'
import { useTranslation } from 'react-i18next'

import type { VehicleDetail } from 'api/types'
import { useMutation } from 'hooks'
import { vehicleKeys } from '../utils/api'

/** Every change to a car refreshes its lists, its detail and the directory forms pick from. */
const useVehicleMutation = <TVariables>(
    mutationFn: (variables: TVariables) => Promise<VehicleDetail>,
    successKey: string
) => {
    const { t } = useTranslation()
    const { message } = App.useApp()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn,
        onSuccess: async (vehicle) => {
            message.success(t(successKey))
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: vehicleKeys.all }),
                queryClient.invalidateQueries({ queryKey: ['directory', 'vehicles'] }),
                queryClient.invalidateQueries({ queryKey: ['customers'] }),
            ])
            queryClient.setQueryData(vehicleKeys.detail(vehicle.summary.id), vehicle)
        },
    })
}

export default useVehicleMutation
