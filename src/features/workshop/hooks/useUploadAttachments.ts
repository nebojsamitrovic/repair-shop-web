import { useQueryClient } from '@tanstack/react-query'
import { App } from 'antd'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { AttachmentKind } from 'api/types'
import { useMutation } from 'hooks'
import { workshopApi, workshopKeys } from '../utils/api'

/**
 * A file takes three steps: ask where it may go, PUT the bytes there, then record the row. The
 * bytes never touch the API, and a failed upload leaves no file nobody can open — the row is
 * written last, and only for files that actually arrived.
 */
const useUploadAttachments = (orderId: string, onDone: () => void) => {
    const { t } = useTranslation()
    const { message } = App.useApp()
    const queryClient = useQueryClient()
    const [progress, setProgress] = useState<{ done: number; total: number }>()

    const mutation = useMutation({
        mutationFn: async ({ files, kind }: { files: File[]; kind: AttachmentKind }) => {
            setProgress({ done: 0, total: files.length })
            for (const [index, file] of files.entries()) {
                const contentType = file.type || 'application/octet-stream'
                const target = await workshopApi.presignAttachment(orderId, {
                    fileName: file.name,
                    contentType,
                    sizeBytes: file.size,
                })
                const response = await fetch(target.uploadUrl, {
                    method: 'PUT',
                    headers: { 'Content-Type': contentType },
                    body: file,
                })
                if (!response.ok) throw new Error(t('attachments.upload_failed', { name: file.name }))

                await workshopApi.addAttachment(orderId, {
                    kind,
                    storageKey: target.storageKey,
                    originalName: file.name,
                    contentType,
                    sizeBytes: file.size,
                })
                setProgress({ done: index + 1, total: files.length })
            }
            return files.length
        },
        onSuccess: async (count) => {
            message.success(t('attachments.added', { count }))
            await queryClient.invalidateQueries({ queryKey: workshopKeys.detail(orderId) })
            onDone()
        },
        onError: async (error) => {
            message.error(error.message)
            await queryClient.invalidateQueries({ queryKey: workshopKeys.detail(orderId) })
        },
        onSettled: () => setProgress(undefined),
    })

    return { ...mutation, progress }
}

export default useUploadAttachments
