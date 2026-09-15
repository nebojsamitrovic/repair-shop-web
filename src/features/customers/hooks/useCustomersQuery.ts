import { useQuery } from 'hooks'
import { customerKeys, customersApi } from '../utils/api'

const useCustomersQuery = (params: Record<string, unknown>) =>
    useQuery({
        queryKey: customerKeys.list(params),
        queryFn: async () => await customersApi.list(params),
        placeholderData: (previous) => previous,
    })

export default useCustomersQuery
