import type { TFunction } from 'i18next'

import type { ServicePartRequest, ServiceType } from 'api/types'

/**
 * What a service usually needs, so the desk corrects a list rather than typing one. A major
 * service is everything a small one is, plus the belts and the pump. Prices are left for the desk.
 */
const SMALL = ['oil_filter', 'oil', 'air_filter', 'cabin_filter', 'fuel_filter'] as const
const BIG = ['timing_belt_kit', 'v_belt_kit', 'water_pump'] as const

export const partsTemplate = (type: ServiceType, t: TFunction): ServicePartRequest[] => {
    const keys = type === 'SMALL_SERVICE' ? [...SMALL] : type === 'BIG_SERVICE' ? [...SMALL, ...BIG] : []
    return keys.map((key) => ({ description: t(`workshop.parts_template.${key}`), quantity: 1, unitPrice: 0 }))
}
