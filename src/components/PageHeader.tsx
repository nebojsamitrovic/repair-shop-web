import { Flex, Typography } from 'antd'
import type { ReactNode } from 'react'

interface Props {
    title: ReactNode
    subtitle?: ReactNode
    extra?: ReactNode
}

const PageHeader = ({ title, subtitle, extra }: Props) => (
    <Flex justify={'space-between'} align={'flex-end'} gap={16} style={{ marginBottom: 28 }}>
        <div>
            <Typography.Title level={2} style={{ margin: 0, letterSpacing: '-0.022em' }}>
                {title}
            </Typography.Title>
            {subtitle ? (
                <Typography.Text type={'secondary'} style={{ fontSize: 15 }}>
                    {subtitle}
                </Typography.Text>
            ) : null}
        </div>
        {extra ? <Flex gap={8}>{extra}</Flex> : null}
    </Flex>
)

export default PageHeader
