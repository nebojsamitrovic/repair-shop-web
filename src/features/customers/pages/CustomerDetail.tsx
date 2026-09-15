import { EditOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, Card, Col, Descriptions, Row, Skeleton, Table, Tag, Typography, type TableProps } from 'antd'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useParams } from 'react-router-dom'

import type { VehicleSummary } from 'api/types'
import { ErrorBlock, PageHeader, ProtectedComponent } from 'components'
import { useQuery } from 'hooks'
import useEnumLabel from 'lang/useEnumLabel'
import { pathTo, Routes } from 'routes/config'
import { formatDate, formatNumber } from 'utils/format'
import CustomerDrawer from '../components/CustomerDrawer'
import { customerKeys, customersApi } from '../utils/api'

const CustomerDetail = () => {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const enumLabel = useEnumLabel()
    const { customerId } = useParams<{ customerId: string }>()
    const [editing, setEditing] = useState(false)

    const customer = useQuery({
        queryKey: customerKeys.detail(customerId ?? ''),
        queryFn: async () => await customersApi.get(customerId as string),
        enabled: Boolean(customerId),
    })

    const vehicles = useQuery({
        queryKey: customerKeys.vehicles(customerId ?? ''),
        queryFn: async () => await customersApi.vehicles(customerId as string),
        enabled: Boolean(customerId),
    })

    if (customer.error) return <ErrorBlock error={customer.error} />
    if (customer.isLoading || !customer.data) return <Skeleton active />

    const person = customer.data

    const columns: TableProps<VehicleSummary>['columns'] = [
        {
            title: t('fields.vehicle'),
            key: 'vehicle',
            render: (_, row) => (
                <Link to={pathTo(Routes.Vehicle, { vehicleId: row.id })} style={{ fontWeight: 500 }}>
                    {row.label}
                </Link>
            ),
        },
        { title: t('fields.plate'), dataIndex: 'registrationPlate', width: 130 },
        {
            title: t('fields.mileage'),
            dataIndex: 'mileage',
            width: 130,
            align: 'right',
            render: (mileage?: number | null) => (mileage == null ? '—' : `${formatNumber(mileage)} km`),
        },
        {
            title: t('fields.fuel_type'),
            dataIndex: 'fuelType',
            width: 120,
            render: (fuel?: string | null) => enumLabel('fuel_type', fuel),
        },
    ]

    return (
        <>
            <PageHeader
                title={person.displayName}
                subtitle={person.email ?? person.phone ?? undefined}
                extra={
                    <ProtectedComponent permission={'customer:update'}>
                        <Button icon={<EditOutlined />} onClick={() => setEditing(true)}>
                            {t('actions.edit')}
                        </Button>
                    </ProtectedComponent>
                }
            />

            <Row gutter={[16, 16]}>
                <Col xs={24} lg={10}>
                    <Card title={t('customers.details')}>
                        <Descriptions column={1} size={'small'} bordered>
                            <Descriptions.Item label={t('fields.company')}>
                                {person.companyName ?? '—'}
                            </Descriptions.Item>
                            <Descriptions.Item label={t('fields.email')}>{person.email ?? '—'}</Descriptions.Item>
                            <Descriptions.Item label={t('fields.phone')}>{person.phone ?? '—'}</Descriptions.Item>
                            <Descriptions.Item label={t('fields.language')}>
                                <Tag>{enumLabel('locale', person.locale)}</Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label={t('fields.created_at')}>
                                {formatDate(person.createdAt)}
                            </Descriptions.Item>
                            <Descriptions.Item label={t('fields.notes')}>
                                <Typography.Text>{person.notes ?? '—'}</Typography.Text>
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>
                </Col>

                <Col xs={24} lg={14}>
                    <Card
                        title={t('customers.vehicles')}
                        extra={
                            <ProtectedComponent permission={'vehicle:create'}>
                                <Button
                                    size={'small'}
                                    icon={<PlusOutlined />}
                                    onClick={() => navigate(`${Routes.VehicleNew.path}?customerId=${person.id}`)}
                                >
                                    {t('vehicles.add')}
                                </Button>
                            </ProtectedComponent>
                        }
                    >
                        <Table<VehicleSummary>
                            rowKey={'id'}
                            size={'small'}
                            loading={vehicles.isFetching}
                            dataSource={vehicles.data}
                            columns={columns}
                            pagination={false}
                            locale={{ emptyText: t('customers.no_vehicles') }}
                        />
                    </Card>
                </Col>
            </Row>

            <CustomerDrawer open={editing} customer={person} onClose={() => setEditing(false)} />
        </>
    )
}

export default CustomerDetail
