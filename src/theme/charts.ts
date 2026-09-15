import { palette } from '.'

/**
 * Chart tokens, validated as a set against the white card surface: lightness band, chroma floor,
 * colour-blind separation (worst pair ΔE 27.7 protan), normal-vision separation and 3:1 contrast.
 * Assign slots in order and never cycle them — a series keeps its colour when a filter changes.
 */
export const chart = {
    series: ['#0071e3', '#eb6834'] as const,

    /* One-step-off-surface, hairline and solid: present enough to read a value against, no more. */
    grid: 'rgba(0, 0, 0, 0.08)',
    axis: palette.textTertiary,
    label: palette.textSecondary,
    surface: palette.surface,

    barSize: 22,
    lineWidth: 2,
    dotRadius: 4,
} as const

export const axisProps = {
    stroke: chart.grid,
    tick: { fill: chart.axis, fontSize: 12 },
    tickLine: false,
} as const

export const tooltipStyle = {
    contentStyle: {
        borderRadius: 10,
        border: `1px solid ${chart.grid}`,
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08)',
        fontSize: 13,
        padding: '8px 12px',
    },
    labelStyle: { color: palette.textSecondary, marginBottom: 4 },
} as const
