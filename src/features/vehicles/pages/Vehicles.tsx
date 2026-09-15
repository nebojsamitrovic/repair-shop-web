import { PlusOutlined } from '@ant-design/icons'
import { Button, Card, Flex, Input, Table, Tag, type TableProps } from 'antd'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'

import type { VehicleSummary } from 'api/types'
import { ErrorBlock, PageHeader, ProtectedComponent } from 'components'
import { useQuery, useTableQuery } from 'hooks'
import useEnumLabel from 'lang/useEnumLabel'
import { pathTo, Routes } from 'routes/config'
import { formatDate, formatNumber } from 'utils/format'
import { vehicleFilterKeys, vehicleKeys, vehiclesApi } from '../utils/api'

const Vehicles = () => {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const enumLabel = useEnumLabel()
    const { params, filters, setFilters, onTableChange, paginationFor } = useTableQuery<VehicleSummary>({
        filterKeys: vehicleFilterKeys,
    })
    const { data, isFetching, error } = useQuery({
        queryKey: vehicleKeys.list(params),
        queryFn: async () => await vehiclesApi.list(params),
        placeholderData: (previous) => previous,
    })

    const columns: TableProps<VehicleSummary>['columns'] = [
        {
            title: t('fields.plate'),
            dataIndex: 'registrationPlate',
            width: 130,
            sorter: true,
            render: (plate: string, row) => (
                <Link to={pathTo(Routes.Vehicle, { vehicleId: row.id })}>
                    <Tag style={{ fontWeight: 600, fontFamily: 'monospace' }}>{plate}</Tag>
                </Link>
            ),
        },
        { title: t('fields.vehicle'), dataIndex: 'label', sorter: true },
        {
            title: t('fields.customer'),
            dataIndex: 'customerName',
            render: (name: string | null, row) =>
                name ? <Link to={pathTo(Routes.Customer, { customerId: row.customerId })}>{name}</Link> : '—',
        },
        {
            title: t('fields.fuel_type'),
            dataIndex: 'fuelType',
            width: 110,
            render: (fuel?: string | null) => enumLabel('fuel_type', fuel),
        },
        {
            title: t('fields.mileage'),
            dataIndex: 'mileage',
            width: 130,
            align: 'right',
            render: (mileage?: number | null) => (mileage == null ? '—' : `${formatNumber(mileage)} km`),
        },
        {
            title: t('fields.annual_mileage'),
            dataIndex: 'annualMileage',
            width: 130,
            align: 'right',
            render: (km?: number | null) => (km == null ? '—' : `${formatNumber(km)} km`),
        },
        { title: t('fields.created_at'), dataIndex: 'createdAt', width: 120, sorter: true, render: formatDate },
    ]

    return (
        <>
            <PageHeader
                title={t('pages.vehicles.title')}
                subtitle={t('vehicles.subtitle', { count: data?.totalElements ?? 0 })}
                extra={
                    <ProtectedComponent permission={'vehicle:create'}>
                        <Button
                            type={'primary'}
                            icon={<PlusOutlined />}
                            onClick={() => navigate(Routes.VehicleNew.path)}
                        >
                            {t('vehicles.add')}
                        </Button>
                    </ProtectedComponent>
                }
            />

            <Card size={'small'} style={{ marginBottom: 16 }}>
                <Flex gap={12} wrap>
                    <Input.Search
                        allowClear
                        style={{ maxWidth: 360 }}
                        placeholder={t('vehicles.search_placeholder')}
                        defaultValue={(filters.search as string) ?? ''}
                        onSearch={(value) => setFilters({ search: value })}
                    />
                </Flex>
            </Card>

            {error ? <ErrorBlock error={error} /> : null}

            <Table<VehicleSummary>
                rowKey={'id'}
                dataSource={data?.items}
                columns={columns}
                loading={isFetching}
                pagination={paginationFor(data?.totalElements)}
                onChange={onTableChange}
                scroll={{ x: 900 }}
            />
        </>
    )
}

export default Vehicles
