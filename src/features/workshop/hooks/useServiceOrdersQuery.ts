import { useQuery } from 'hooks'
import { QUEUE_SIZE, workshopApi, workshopKeys } from '../utils/api'

const useServiceOrdersQuery = (params: Record<string, unknown>) => {
    const query = { ...params, size: QUEUE_SIZE }
    return useQuery({
        queryKey: workshopKeys.queue(query),
        queryFn: async () => await workshopApi.list(query),
        placeholderData: (previous) => previous,
    })
}

export default useServiceOrdersQuery
