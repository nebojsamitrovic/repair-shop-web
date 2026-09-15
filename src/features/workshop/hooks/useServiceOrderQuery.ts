import { useQuery } from 'hooks'
import { workshopApi, workshopKeys } from '../utils/api'

const useServiceOrderQuery = (orderId: string | undefined) =>
    useQuery({
        queryKey: workshopKeys.detail(orderId ?? ''),
        queryFn: async () => await workshopApi.get(orderId as string),
        enabled: Boolean(orderId),
    })

export default useServiceOrderQuery
