import { DeleteOutlined, EditOutlined, HistoryOutlined, PlusOutlined } from '@ant-design/icons'
import { useQueryClient } from '@tanstack/react-query'
import {
    App,
    Button,
    Card,
    Checkbox,
    Drawer,
    Flex,
    Input,
    Popconfirm,
    Select,
    Table,
    Tag,
    Typography,
    type TableProps,
} from 'antd'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { STOCK_CONDITIONS, type MovementKind, type StockItem, type StockMovement } from 'api/types'
import { ErrorBlock, PageHeader, ProtectedComponent } from 'components'
import { useMutation, useQuery, useTableQuery } from 'hooks'
import useEnumLabel from 'lang/useEnumLabel'
import { formatDateTime, formatMoney, formatNumber } from 'utils/format'
import QuantityModal, { type QuantityAction } from '../components/QuantityModal'
import StockItemDrawer from '../components/StockItemDrawer'
import { stockApi, stockFilterKeys, stockKeys } from '../utils/api'

const conditionColor: Record<StockItem['condition'], string> = {
    USED: 'default',
    REFURBISHED: 'gold',
    NEW: 'green',
}

const movementColor: Record<MovementKind, string> = {
    RECEIVED: 'green',
    FITTED: 'blue',
    RETURNED: 'gold',
    ADJUSTED: 'default',
}

/** The shelf: what is there, what it costs, what it sells for, and the ledger behind each line. */
const Stock = () => {
    const { t } = useTranslation()
    const enumLabel = useEnumLabel()
    const { message } = App.useApp()
    const queryClient = useQueryClient()
    const { params, filters, setFilters, onTableChange, paginationFor } = useTableQuery<StockItem>({
        defaultSort: 'name,asc',
        defaultSize: 50,
        filterKeys: stockFilterKeys,
    })
    const [adding, setAdding] = useState(false)
    const [editing, setEditing] = useState<StockItem>()
    const [quantity, setQuantity] = useState<{ item: StockItem; action: QuantityAction }>()
    const [ledger, setLedger] = useState<StockItem>()

    const { data, isFetching, error } = useQuery({
        queryKey: stockKeys.list(params),
        queryFn: async () => await stockApi.list(params),
        placeholderData: (previous) => previous,
    })
    const movements = useQuery({
        queryKey: stockKeys.movements(ledger?.id ?? ''),
        queryFn: async () => await stockApi.movements(ledger?.id ?? ''),
        enabled: Boolean(ledger),
    })

    const remove = useMutation({
        mutationFn: async (itemId: string) => await stockApi.remove(itemId),
        onSuccess: async () => {
            message.success(t('stock.removed'))
            await queryClient.invalidateQueries({ queryKey: stockKeys.all })
        },
        onError: (failure) => message.error(failure.message),
    })

    const columns: TableProps<StockItem>['columns'] = [
        {
            title: t('fields.part'),
            dataIndex: 'name',
            sorter: true,
            render: (name: string, row) => (
                <Flex vertical>
                    <Typography.Text strong>{name}</Typography.Text>
                    <Typography.Text type={'secondary'} style={{ fontSize: 12 }}>
                        {[row.partNumber, row.fits].filter(Boolean).join(' · ') || '—'}
                    </Typography.Text>
                </Flex>
            ),
        },
        {
            title: t('fields.condition'),
            dataIndex: 'condition',
            width: 120,
            render: (condition: StockItem['condition']) => (
                <Tag color={conditionColor[condition]}>{enumLabel('stock_condition', condition)}</Tag>
            ),
        },
        {
            title: t('fields.quantity'),
            dataIndex: 'quantity',
            width: 100,
            align: 'right',
            sorter: true,
            render: (value: number) => (
                <Typography.Text type={value > 0 ? undefined : 'secondary'} strong={value > 0}>
                    {formatNumber(value)}
                </Typography.Text>
            ),
        },
        {
            title: t('fields.unit_price'),
            dataIndex: 'unitPrice',
            width: 120,
            align: 'right',
            sorter: true,
            render: (value: number, row) => formatMoney(value, row.currency),
        },
        {
            title: t('fields.source'),
            dataIndex: 'source',
            ellipsis: true,
            render: (source?: string | null) => source ?? '—',
        },
        {
            key: 'actions',
            width: 260,
            render: (_, row) => (
                <Flex gap={4} wrap>
                    <ProtectedComponent permission={'stock:manage'}>
                        <>
                            <Button size={'small'} onClick={() => setQuantity({ item: row, action: 'receive' })}>
                                {t('stock.receive')}
                            </Button>
                            <Button size={'small'} onClick={() => setQuantity({ item: row, action: 'count' })}>
                                {t('stock.count')}
                            </Button>
                            <Button size={'small'} icon={<EditOutlined />} onClick={() => setEditing(row)} />
                        </>
                    </ProtectedComponent>
                    <Button size={'small'} icon={<HistoryOutlined />} onClick={() => setLedger(row)} />
                    <ProtectedComponent permission={'stock:manage'}>
                        <Popconfirm title={t('stock.confirm_remove')} onConfirm={() => remove.mutate(row.id)}>
                            <Button size={'small'} danger icon={<DeleteOutlined />} />
                        </Popconfirm>
                    </ProtectedComponent>
                </Flex>
            ),
        },
    ]

    const ledgerColumns: TableProps<StockMovement>['columns'] = [
        { title: t('fields.date'), dataIndex: 'at', width: 150, render: formatDateTime },
        {
            title: t('fields.type'),
            dataIndex: 'kind',
            width: 120,
            render: (kind: MovementKind) => <Tag color={movementColor[kind]}>{enumLabel('movement_kind', kind)}</Tag>,
        },
        {
            title: t('fields.quantity'),
            dataIndex: 'quantity',
            width: 90,
            align: 'right',
            render: (value: number) => (value > 0 ? `+${formatNumber(value)}` : formatNumber(value)),
        },
        { title: t('fields.user'), dataIndex: 'userName', width: 150, render: (name?: string) => name ?? '—' },
        { title: t('fields.note'), dataIndex: 'note', render: (note?: string) => note ?? '—' },
    ]

    return (
        <>
            <PageHeader
                title={t('pages.stock.title')}
                subtitle={t('stock.subtitle', { count: data?.totalElements ?? 0 })}
                extra={
                    <ProtectedComponent permission={'stock:manage'}>
                        <Button type={'primary'} icon={<PlusOutlined />} onClick={() => setAdding(true)}>
                            {t('stock.add')}
                        </Button>
                    </ProtectedComponent>
                }
            />

            <Card size={'small'} style={{ marginBottom: 16 }}>
                <Flex gap={12} wrap align={'center'}>
                    <Input.Search
                        allowClear
                        style={{ maxWidth: 360 }}
                        placeholder={t('stock.search_placeholder')}
                        defaultValue={(filters.search as string) ?? ''}
                        onSearch={(value) => setFilters({ search: value })}
                    />
                    <Select
                        allowClear
                        placeholder={t('fields.condition')}
                        style={{ minWidth: 160 }}
                        value={(filters.condition as string) ?? undefined}
                        onChange={(value) => setFilters({ condition: value })}
                        options={STOCK_CONDITIONS.map((condition) => ({
                            value: condition,
                            label: enumLabel('stock_condition', condition),
                        }))}
                    />
                    <Checkbox
                        checked={filters.inStockOnly === 'true'}
                        onChange={(event) => setFilters({ inStockOnly: event.target.checked ? 'true' : undefined })}
                    >
                        {t('stock.in_stock_only')}
                    </Checkbox>
                </Flex>
            </Card>

            {error ? <ErrorBlock error={error} /> : null}

            <Table<StockItem>
                rowKey={'id'}
                dataSource={data?.items}
                columns={columns}
                loading={isFetching}
                pagination={paginationFor(data?.totalElements)}
                onChange={onTableChange}
                scroll={{ x: 1000 }}
            />

            <StockItemDrawer open={adding} onClose={() => setAdding(false)} />
            <StockItemDrawer open={Boolean(editing)} item={editing} onClose={() => setEditing(undefined)} />
            <QuantityModal
                item={quantity?.item}
                action={quantity?.action ?? 'receive'}
                onClose={() => setQuantity(undefined)}
            />
            <Drawer open={Boolean(ledger)} onClose={() => setLedger(undefined)} width={720} title={ledger?.name}>
                <Table<StockMovement>
                    rowKey={'id'}
                    size={'small'}
                    loading={movements.isFetching}
                    dataSource={movements.data}
                    columns={ledgerColumns}
                    pagination={false}
                />
            </Drawer>
        </>
    )
}

export default Stock
