import {
    useQuery as tanstackUseQuery,
    type QueryKey,
    type UseQueryOptions,
    type UseQueryResult,
} from '@tanstack/react-query'

import type { AppError } from 'api/errors'

/** TanStack's useQuery, pre-typed with the one error type the API can produce. */
const useQuery = <TQueryFnData = unknown, TData = TQueryFnData, TQueryKey extends QueryKey = QueryKey>(
    options: UseQueryOptions<TQueryFnData, AppError, TData, TQueryKey>
): UseQueryResult<TData, AppError> => tanstackUseQuery(options)

export default useQuery
