import { Card, Flex, Typography } from 'antd'
import type { ReactNode } from 'react'

import { palette } from 'theme'

interface Props {
    icon: ReactNode
    label: string
    value: string
    hint?: string
    /** A tile that asks for attention is tinted; the rest stay quiet. */
    tone?: 'accent' | 'warning' | 'success' | 'neutral'
    onClick?: () => void
}

const tones = {
    accent: {
        bg: 'linear-gradient(160deg, rgba(0, 113, 227, 0.18), rgba(0, 113, 227, 0.06))',
        fg: palette.accent,
        ring: 'rgba(0, 113, 227, 0.2)',
    },
    warning: {
        bg: 'linear-gradient(160deg, rgba(178, 80, 0, 0.18), rgba(178, 80, 0, 0.06))',
        fg: palette.warning,
        ring: 'rgba(178, 80, 0, 0.2)',
    },
    success: {
        bg: 'linear-gradient(160deg, rgba(36, 138, 61, 0.18), rgba(36, 138, 61, 0.06))',
        fg: palette.success,
        ring: 'rgba(36, 138, 61, 0.2)',
    },
    neutral: {
        bg: 'linear-gradient(160deg, rgba(0, 0, 0, 0.07), rgba(0, 0, 0, 0.02))',
        fg: palette.textSecondary,
        ring: palette.border,
    },
} as const

/** A hero number: one figure, its name, and a line that says what it means. Not a chart. */
const StatTile = ({ icon, label, value, hint, tone = 'neutral', onClick }: Props) => (
    <Card
        hoverable={Boolean(onClick)}
        onClick={onClick}
        styles={{ body: { padding: '18px 20px' } }}
        style={{ height: '100%', cursor: onClick ? 'pointer' : 'default' }}
    >
        <Flex gap={14} align={'flex-start'}>
            <Flex
                align={'center'}
                justify={'center'}
                style={{
                    width: 40,
                    height: 40,
                    flex: '0 0 40px',
                    borderRadius: 12,
                    background: tones[tone].bg,
                    border: `1px solid ${tones[tone].ring}`,
                    boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.6)',
                    color: tones[tone].fg,
                    fontSize: 18,
                }}
            >
                {icon}
            </Flex>
            <Flex vertical style={{ minWidth: 0 }}>
                <Typography.Text type={'secondary'} style={{ fontSize: 13 }}>
                    {label}
                </Typography.Text>
                <Typography.Text style={{ fontSize: 26, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                    {value}
                </Typography.Text>
                {hint ? (
                    <Typography.Text type={'secondary'} style={{ fontSize: 12 }}>
                        {hint}
                    </Typography.Text>
                ) : null}
            </Flex>
        </Flex>
    </Card>
)

export default StatTile
