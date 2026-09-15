import dayjs from 'dayjs'

import { currentIntlLocale } from 'lang'

const EMPTY = '—'

/** Format money, never compute with it — every figure shown is already a BigDecimal from the backend. */
export const formatMoney = (amount: number | string | null | undefined, currency = 'EUR'): string => {
    if (amount === null || amount === undefined || amount === '') return EMPTY
    const value = typeof amount === 'string' ? Number(amount) : amount
    if (Number.isNaN(value)) return EMPTY
    return new Intl.NumberFormat(currentIntlLocale(), {
        style: 'currency',
        currency,
        maximumFractionDigits: 2,
    }).format(value)
}

export const formatPercent = (value: number | null | undefined): string =>
    value === null || value === undefined
        ? EMPTY
        : `${new Intl.NumberFormat(currentIntlLocale(), { maximumFractionDigits: 2 }).format(value)}%`

export const formatNumber = (value: number | null | undefined): string =>
    value === null || value === undefined ? EMPTY : new Intl.NumberFormat(currentIntlLocale()).format(value)

/** Timestamps are Instants in UTC; they become local, in the active language, exactly here. */
export const formatDate = (value: string | null | undefined): string => (value ? dayjs(value).format('L') : EMPTY)

export const formatDateTime = (value: string | null | undefined): string =>
    value ? dayjs(value).format('L HH:mm') : EMPTY

/** Sizes come from object storage in bytes; nobody reads a photo that way. */
export const formatBytes = (bytes: number | null | undefined): string => {
    if (bytes === null || bytes === undefined) return EMPTY
    const units = ['B', 'kB', 'MB', 'GB']
    const unit = Math.min(units.length - 1, Math.floor(Math.log10(Math.max(bytes, 1)) / 3))
    const value = bytes / 1000 ** unit
    return `${new Intl.NumberFormat(currentIntlLocale(), { maximumFractionDigits: unit === 0 ? 0 : 1 }).format(value)} ${units[unit]}`
}

/** Last resort for an untranslated code; anything read regularly belongs in `enums` — see `useEnumLabel`. */
export const formatEnum = (value: string | null | undefined): string =>
    value ? value.charAt(0) + value.slice(1).toLowerCase().replace(/_/g, ' ') : EMPTY
