import { useQueryClient } from '@tanstack/react-query'
import { App } from 'antd'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useMutation } from 'hooks'
import { noteKeys, notesApi } from '../utils/api'

/** Same three steps as on an order: where may it go, PUT it there, record the row. */
const useUploadNoteFiles = (noteId: string, onDone: () => void) => {
    const { t } = useTranslation()
    const { message } = App.useApp()
    const queryClient = useQueryClient()
    const [progress, setProgress] = useState<{ done: number; total: number }>()

    const mutation = useMutation({
        mutationFn: async (files: File[]) => {
            setProgress({ done: 0, total: files.length })
            for (const [index, file] of files.entries()) {
                const contentType = file.type || 'application/octet-stream'
                const target = await notesApi.presignAttachment(noteId, {
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
                await notesApi.addAttachment(noteId, {
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
            await queryClient.invalidateQueries({ queryKey: noteKeys.all })
            onDone()
        },
        onError: async (error) => {
            message.error(error.message)
            await queryClient.invalidateQueries({ queryKey: noteKeys.all })
        },
        onSettled: () => setProgress(undefined),
    })

    return { ...mutation, progress }
}

export default useUploadNoteFiles
