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
    accent: { bg: 'rgba(0, 113, 227, 0.08)', fg: palette.accent },
    warning: { bg: 'rgba(178, 80, 0, 0.09)', fg: palette.warning },
    success: { bg: 'rgba(36, 138, 61, 0.09)', fg: palette.success },
    neutral: { bg: palette.surfaceMuted, fg: palette.textSecondary },
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
