import { api } from 'api/client'
import type {
    AddAttachmentRequest,
    AttachmentUpload,
    OpenServiceOrderRequest,
    PageResponse,
    PresignAttachmentRequest,
    ServiceAttachment,
    ServiceOrderDetail,
    ServiceOrderStatus,
    ServiceOrderSummary,
    UpdateServiceOrderRequest,
} from 'api/types'

export const workshopApi = {
    list: async (params: Record<string, unknown>) =>
        (await api.get<PageResponse<ServiceOrderSummary>>('/service-orders', { params })).data,
    get: async (orderId: string) => (await api.get<ServiceOrderDetail>(`/service-orders/${orderId}`)).data,
    open: async (body: OpenServiceOrderRequest) => (await api.post<ServiceOrderDetail>('/service-orders', body)).data,
    update: async (orderId: string, body: UpdateServiceOrderRequest) =>
        (await api.patch<ServiceOrderDetail>(`/service-orders/${orderId}`, body)).data,
    changeStatus: async (orderId: string, status: ServiceOrderStatus, note?: string) =>
        (await api.post<ServiceOrderDetail>(`/service-orders/${orderId}/status`, { status, note })).data,
    presignAttachment: async (orderId: string, body: PresignAttachmentRequest) =>
        (await api.post<AttachmentUpload>(`/service-orders/${orderId}/attachments/upload-url`, body)).data,
    addAttachment: async (orderId: string, body: AddAttachmentRequest) =>
        (await api.post<ServiceAttachment>(`/service-orders/${orderId}/attachments`, body)).data,
    removeAttachment: async (orderId: string, attachmentId: string) =>
        await api.delete(`/service-orders/${orderId}/attachments/${attachmentId}`),
    /** The PDF, as bytes; the caller opens it in a tab. */
    quote: async (orderId: string, lang?: string) =>
        (await api.get<Blob>(`/service-orders/${orderId}/quote`, { params: { lang }, responseType: 'blob' })).data,
    remove: async (orderId: string) => await api.delete(`/service-orders/${orderId}`),
}

export const workshopKeys = {
    all: ['service-orders'] as const,
    queue: (params: Record<string, unknown>) => ['service-orders', 'queue', params] as const,
    detail: (orderId: string) => ['service-orders', 'detail', orderId] as const,
}

/** A workshop has a handful of open orders, not a page of them. */
export const QUEUE_SIZE = 100
