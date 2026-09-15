import axios from 'axios'

export interface FieldViolation {
    field: string
    message: string
}

export interface ApiErrorBody {
    timestamp: string
    status: number
    code: string
    message: string
    path: string
    errors: FieldViolation[]
}

export const ErrorCode = {
    UserNotRegistered: 'USER_NOT_REGISTERED',
    AuthNotConfigured: 'AUTH_NOT_CONFIGURED',
    AuthRequired: 'AUTH_REQUIRED',
    ConcurrentModification: 'CONCURRENT_MODIFICATION',
    LastOwner: 'LAST_OWNER',
    PlateAlreadyRegistered: 'PLATE_ALREADY_REGISTERED',
    StorageNotConfigured: 'STORAGE_NOT_CONFIGURED',
    Validation: 'VALIDATION_ERROR',
} as const

export class AppError extends Error {
    readonly status: number
    readonly code: string
    readonly violations: FieldViolation[]

    constructor(body: Pick<ApiErrorBody, 'status' | 'code' | 'message'> & Partial<ApiErrorBody>) {
        super(body.message)
        this.name = 'AppError'
        this.status = body.status
        this.code = body.code
        this.violations = body.errors ?? []
    }

    is(code: string) {
        return this.code === code
    }
}

const isApiErrorBody = (data: unknown): data is ApiErrorBody =>
    typeof data === 'object' && data !== null && 'code' in data && 'status' in data

export const toAppError = (error: unknown): AppError => {
    if (error instanceof AppError) return error

    if (axios.isAxiosError(error)) {
        if (isApiErrorBody(error.response?.data)) return new AppError(error.response.data)
        return new AppError({
            status: error.response?.status ?? 0,
            code: error.code === 'ERR_NETWORK' ? 'NETWORK_ERROR' : 'UNEXPECTED_ERROR',
            message: error.message,
        })
    }

    return new AppError({
        status: 0,
        code: 'UNEXPECTED_ERROR',
        message: error instanceof Error ? error.message : String(error),
    })
}

export const violationFor = (error: unknown, field: string): string | undefined =>
    toAppError(error).violations.find((violation) => violation.field === field)?.message
