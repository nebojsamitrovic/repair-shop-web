import { api } from 'api/client'
import type {
    AddNoteAttachmentRequest,
    AttachmentUpload,
    MechanicNote,
    NoteAttachment,
    NoteRequest,
    PageResponse,
    PresignAttachmentRequest,
} from 'api/types'

export const notesApi = {
    list: async (params: Record<string, unknown>) =>
        (await api.get<PageResponse<MechanicNote>>('/notes', { params })).data,
    get: async (noteId: string) => (await api.get<MechanicNote>(`/notes/${noteId}`)).data,
    create: async (body: NoteRequest) => (await api.post<MechanicNote>('/notes', body)).data,
    update: async (noteId: string, body: NoteRequest) => (await api.patch<MechanicNote>(`/notes/${noteId}`, body)).data,
    remove: async (noteId: string) => await api.delete(`/notes/${noteId}`),
    presignAttachment: async (noteId: string, body: PresignAttachmentRequest) =>
        (await api.post<AttachmentUpload>(`/notes/${noteId}/attachments/upload-url`, body)).data,
    addAttachment: async (noteId: string, body: AddNoteAttachmentRequest) =>
        (await api.post<NoteAttachment>(`/notes/${noteId}/attachments`, body)).data,
    removeAttachment: async (noteId: string, attachmentId: string) =>
        await api.delete(`/notes/${noteId}/attachments/${attachmentId}`),
}

export const noteKeys = {
    all: ['notes'] as const,
    list: (params: Record<string, unknown>) => ['notes', 'list', params] as const,
    detail: (noteId: string) => ['notes', 'detail', noteId] as const,
}

export const noteFilterKeys = ['search', 'make', 'model', 'mine', 'vehicleId']
