import {
    useMutation as tanstackUseMutation,
    type UseMutationOptions,
    type UseMutationResult,
} from '@tanstack/react-query'

import type { AppError } from 'api/errors'

/** TanStack's useMutation, pre-typed with the one error type the API can produce. */
const useMutation = <TData = unknown, TVariables = void, TContext = unknown>(
    options: UseMutationOptions<TData, AppError, TVariables, TContext>
): UseMutationResult<TData, AppError, TVariables, TContext> => tanstackUseMutation(options)

export default useMutation
