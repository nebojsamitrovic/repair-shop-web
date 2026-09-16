import { PlusOutlined } from '@ant-design/icons'
import { Button, Card, Flex, Segmented, Table, Tag, Typography, type TableProps } from 'antd'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'

import { SERVICE_TYPES, type ServiceOrderStatus, type ServiceOrderSummary } from 'api/types'
import { ErrorBlock, PageHeader, ProtectedComponent } from 'components'
import useEnumLabel from 'lang/useEnumLabel'
import { formatDateTime, formatMoney, formatNumber } from 'utils/format'
import OpenOrderModal from '../components/OpenOrderModal'
import ServiceOrderDrawer from '../components/ServiceOrderDrawer'
import useServiceOrdersQuery from '../hooks/useServiceOrdersQuery'

type Scope = 'open' | 'mine' | 'all'

const statusColor: Record<ServiceOrderStatus, string> = {
    OPEN: 'blue',
    IN_PROGRESS: 'gold',
    DONE: 'green',
    CANCELLED: 'default',
}

/** The queue as a mechanic thinks of it: what is still in, and whose it is. */
const Workshop = () => {
    const { t } = useTranslation()
    const enumLabel = useEnumLabel()
    const [scope, setScope] = useState<Scope>('open')
    const [type, setType] = useState<string>('ALL')
    const [opening, setOpening] = useState(false)
    const [searchParams, setSearchParams] = useSearchParams()
    const openOrderId = searchParams.get('order') ?? undefined
    const setOpenOrderId = (orderId?: string) => setSearchParams(orderId ? { order: orderId } : {}, { replace: true })

    const { data, isFetching, error } = useServiceOrdersQuery({
        openOnly: scope !== 'all',
        mine: scope === 'mine',
        type: type === 'ALL' ? undefined : type,
    })

    const columns: TableProps<ServiceOrderSummary>['columns'] = [
        {
            title: t('fields.vehicle'),
            key: 'vehicle',
            render: (_, row) => (
                <Flex vertical>
                    <Flex gap={8} align={'center'}>
                        <Tag style={{ fontFamily: 'monospace', fontWeight: 600 }}>{row.registrationPlate}</Tag>
                        <Typography.Text>{row.vehicleLabel ?? '—'}</Typography.Text>
                    </Flex>
                    <Typography.Text type={'secondary'} style={{ fontSize: 12 }} ellipsis>
                        {row.customerName ?? ''}
                        {row.description ? ` · ${row.description}` : ''}
                    </Typography.Text>
                </Flex>
            ),
        },
        {
            title: t('fields.type'),
            dataIndex: 'type',
            width: 130,
            render: (value: string) => enumLabel('service_type', value),
        },
        {
            title: t('fields.status'),
            dataIndex: 'status',
            width: 120,
            render: (status: ServiceOrderStatus) => (
                <Tag color={statusColor[status]}>{enumLabel('service_order_status', status)}</Tag>
            ),
        },
        {
            title: t('fields.mechanic'),
            dataIndex: 'mechanicName',
            width: 150,
            render: (name?: string | null) => name ?? '—',
        },
        {
            title: t('fields.location'),
            dataIndex: 'locationName',
            width: 130,
            render: (name?: string | null) => name ?? '—',
        },
        {
            title: t('fields.mileage'),
            dataIndex: 'mileage',
            align: 'right',
            width: 110,
            render: (mileage?: number | null) => (mileage == null ? '—' : `${formatNumber(mileage)} km`),
        },
        { title: t('fields.opened_at'), dataIndex: 'openedAt', width: 150, render: formatDateTime },
        {
            title: t('fields.total'),
            dataIndex: 'total',
            align: 'right',
            width: 120,
            render: (total: number, row) => formatMoney(total, row.currency),
        },
    ]

    return (
        <>
            <PageHeader
                title={t('pages.workshop.title')}
                subtitle={t('workshop.subtitle', { count: data?.totalElements ?? 0 })}
                extra={
                    <ProtectedComponent permission={'service:create'}>
                        <Button type={'primary'} icon={<PlusOutlined />} onClick={() => setOpening(true)}>
                            {t('workshop.open_order')}
                        </Button>
                    </ProtectedComponent>
                }
            />

            <Card size={'small'} style={{ marginBottom: 16 }}>
                <Flex gap={12} wrap>
                    <Segmented<Scope>
                        value={scope}
                        onChange={setScope}
                        options={[
                            { value: 'open', label: t('workshop.in_the_shop') },
                            { value: 'mine', label: t('workshop.mine') },
                            { value: 'all', label: t('workshop.all') },
                        ]}
                    />
                    <Segmented
                        value={type}
                        onChange={(value) => setType(String(value))}
                        options={[
                            { value: 'ALL', label: t('workshop.any_type') },
                            ...SERVICE_TYPES.map((item) => ({ value: item, label: enumLabel('service_type', item) })),
                        ]}
                    />
                </Flex>
            </Card>

            {error ? <ErrorBlock error={error} /> : null}

            <Table<ServiceOrderSummary>
                rowKey={'id'}
                dataSource={data?.items}
                columns={columns}
                loading={isFetching}
                pagination={false}
                scroll={{ x: 1100 }}
                onRow={(row) => ({ onClick: () => setOpenOrderId(row.id), style: { cursor: 'pointer' } })}
            />

            <OpenOrderModal
                open={opening}
                onClose={() => setOpening(false)}
                onOpened={(order) => setOpenOrderId(order.summary.id)}
            />
            <ServiceOrderDrawer orderId={openOrderId} onClose={() => setOpenOrderId(undefined)} />
        </>
    )
}

export default Workshop
