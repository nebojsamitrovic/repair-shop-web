import { useTranslation } from 'react-i18next'

export type EnumGroup =
    | 'fuel_type'
    | 'service_type'
    | 'service_order_status'
    | 'appointment_status'
    | 'attachment_kind'
    | 'labour_pricing_mode'
    | 'locale'
    | 'user_status'

/** Translates backend codes rather than prettifying them; an unknown code falls back to a humanised form. */
const useEnumLabel = () => {
    const { t } = useTranslation()

    return (group: EnumGroup, value: string | null | undefined): string => {
        if (!value) return '—'
        const humanised = value.charAt(0) + value.slice(1).toLowerCase().replace(/_/g, ' ')
        return t(`enums.${group}.${value}`, { defaultValue: humanised })
    }
}

export default useEnumLabel
