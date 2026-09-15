import { Tooltip } from 'antd'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'

import type { DashboardView } from 'api/types'
import { palette } from 'theme'
import { formatMoney } from 'utils/format'

interface Props {
    months: DashboardView['ordersByMonth']
    currency: string
}

const WIDTH = 560
const HEIGHT = 180
const PAD = { top: 22, right: 8, bottom: 26, left: 8 }

/**
 * One series, six bars: orders opened per month. One hue, thin marks with rounded ends anchored to
 * the baseline, a recessive baseline, the current month and the peak labelled, everything on hover.
 */
const OrdersByMonth = ({ months, currency }: Props) => {
    const { t } = useTranslation()
    const max = Math.max(1, ...months.map((month) => month.count))
    const plotWidth = WIDTH - PAD.left - PAD.right
    const plotHeight = HEIGHT - PAD.top - PAD.bottom
    const slot = plotWidth / months.length
    const barWidth = Math.min(36, slot * 0.5)
    const baseline = PAD.top + plotHeight
    const peak = months.reduce((best, month) => (month.count > best.count ? month : best), months[0])

    return (
        <svg
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            width={'100%'}
            height={HEIGHT}
            role={'img'}
            aria-label={t('dashboard.orders_by_month')}
        >
            <line x1={PAD.left} x2={WIDTH - PAD.right} y1={baseline} y2={baseline} stroke={palette.border} />
            {months.map((month, index) => {
                const height = (month.count / max) * plotHeight
                const x = PAD.left + slot * index + (slot - barWidth) / 2
                const y = baseline - height
                const isLatest = index === months.length - 1
                const labelled = month.count > 0 && (isLatest || month === peak)
                return (
                    <Tooltip
                        key={month.month}
                        title={`${dayjs(month.month).format('MMMM YYYY')} · ${t('dashboard.orders_count', { count: month.count })} · ${formatMoney(month.revenue, currency)}`}
                    >
                        <g style={{ cursor: 'default' }}>
                            {/* A hit target wider than the mark, so a two-pixel bar is not hard to hover. */}
                            <rect
                                x={PAD.left + slot * index}
                                y={PAD.top}
                                width={slot}
                                height={plotHeight}
                                fill={'transparent'}
                            />
                            {month.count > 0 ? (
                                <path
                                    d={`M ${x} ${baseline} v ${-(height - 4)} a 4 4 0 0 1 4 -4 h ${barWidth - 8} a 4 4 0 0 1 4 4 v ${height - 4} z`}
                                    fill={isLatest ? palette.accent : 'rgba(0, 113, 227, 0.45)'}
                                />
                            ) : (
                                <rect x={x} y={baseline - 2} width={barWidth} height={2} rx={1} fill={palette.border} />
                            )}
                            {labelled ? (
                                <text
                                    x={x + barWidth / 2}
                                    y={y - 6}
                                    textAnchor={'middle'}
                                    fontSize={11}
                                    fill={palette.textSecondary}
                                >
                                    {month.count}
                                </text>
                            ) : null}
                            <text
                                x={PAD.left + slot * index + slot / 2}
                                y={HEIGHT - 8}
                                textAnchor={'middle'}
                                fontSize={11}
                                fill={isLatest ? palette.text : palette.textTertiary}
                            >
                                {dayjs(month.month).format('MMM')}
                            </text>
                        </g>
                    </Tooltip>
                )
            })}
        </svg>
    )
}

export default OrdersByMonth
