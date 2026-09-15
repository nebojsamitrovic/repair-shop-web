import { useQueryClient } from '@tanstack/react-query'
import { App } from 'antd'
import { useTranslation } from 'react-i18next'

import { useMutation } from 'hooks'
import { noteKeys } from '../utils/api'

const useNoteMutation = <TData, TVariables>(
    mutationFn: (variables: TVariables) => Promise<TData>,
    successKey?: string
) => {
    const { t } = useTranslation()
    const { message } = App.useApp()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn,
        onSuccess: async () => {
            if (successKey) message.success(t(successKey))
            await queryClient.invalidateQueries({ queryKey: noteKeys.all })
        },
        onError: (error) => message.error(error.message),
    })
}

export default useNoteMutation
