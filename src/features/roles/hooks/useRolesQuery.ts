import { useQuery } from 'hooks'
import { roleKeys, rolesApi } from '../utils/api'

const useRolesQuery = () =>
    useQuery({
        queryKey: roleKeys.list,
        queryFn: async () => await rolesApi.list(),
    })

export default useRolesQuery
