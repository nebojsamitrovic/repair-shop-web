/**
 * The single axios instance. Two interceptors and nothing else: attach the Firebase token going
 * out, and give an expired one exactly one chance to refresh coming back.
 */
import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'

import { getIdToken } from 'auth/firebase'
import { config } from 'utils/config'
import { ErrorCode, type ApiErrorBody } from './errors'

interface RetriableRequest extends InternalAxiosRequestConfig {
    _retried?: boolean
}

export const api = axios.create({
    baseURL: `${config.apiBaseUrl}/api/v1`,
    headers: { 'Content-Type': 'application/json' },
})

let onSessionLost: () => void = () => {}

/** The session provider registers what to do when a token can no longer be refreshed. */
export const setSessionLostHandler = (handler: () => void) => {
    onSessionLost = handler
}

api.interceptors.request.use(async (request) => {
    const token = await getIdToken()
    if (token) request.headers.Authorization = `Bearer ${token}`
    return request
})

api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError<ApiErrorBody>) => {
        const request = error.config as RetriableRequest | undefined
        const isUnauthorized = error.response?.status === 401

        const code = error.response?.data?.code
        const isRefreshable = isUnauthorized && code !== ErrorCode.AuthNotConfigured

        if (!isRefreshable || !request || request._retried) throw error

        const token = await getIdToken(true)
        if (!token) {
            onSessionLost()
            throw error
        }

        request._retried = true
        request.headers.Authorization = `Bearer ${token}`
        return await api.request(request)
    }
)
