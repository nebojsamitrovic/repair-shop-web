import { useQuery } from 'hooks'
import { roleKeys, rolesApi } from '../utils/api'

/** The catalogue changes only with a release, so it is worth holding on to. */
const usePermissionCatalogue = () =>
    useQuery({
        queryKey: roleKeys.catalogue,
        queryFn: async () => await rolesApi.permissions(),
        staleTime: 10 * 60_000,
    })

export default usePermissionCatalogue
