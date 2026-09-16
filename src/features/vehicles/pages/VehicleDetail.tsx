import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons'
import {
    App,
    Button,
    Card,
    Col,
    Descriptions,
    Drawer,
    Flex,
    Form,
    Popconfirm,
    Row,
    Skeleton,
    Table,
    Tag,
    type TableProps,
} from 'antd'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useParams } from 'react-router-dom'

import type { CreateVehicleRequest, ServiceOrderStatus, ServiceOrderSummary, UpdateVehicleRequest } from 'api/types'
import { ErrorBlock, PageHeader, ProtectedComponent } from 'components'
import UpcomingCard from 'features/appointments/components/UpcomingCard'
import OpenOrderModal from 'features/workshop/components/OpenOrderModal'
import ServiceOrderDrawer from 'features/workshop/components/ServiceOrderDrawer'
import { useMutation, useQuery } from 'hooks'
import useEnumLabel from 'lang/useEnumLabel'
import { pathTo, Routes } from 'routes/config'
import { formatDate, formatDateTime, formatMoney, formatNumber } from 'utils/format'
import MaintenanceCard from '../components/MaintenanceCard'
import MileageModal from '../components/MileageModal'
import OwnersCard from '../components/OwnersCard'
import ServiceBookCard from '../components/ServiceBookCard'
import VehicleForm from '../components/VehicleForm'
import useVehicleMutation from '../hooks/useVehicleMutation'
import { vehicleKeys, vehiclesApi } from '../utils/api'

const statusColor: Record<ServiceOrderStatus, string> = {
    OPEN: 'blue',
    IN_PROGRESS: 'gold',
    DONE: 'green',
    CANCELLED: 'default',
}

const VehicleDetail = () => {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const enumLabel = useEnumLabel()
    const { message } = App.useApp()
    const queryClient = useQueryClient()
    const { vehicleId } = useParams<{ vehicleId: string }>()
    const [form] = Form.useForm<CreateVehicleRequest>()
    const [editing, setEditing] = useState(false)
    const [readingOpen, setReadingOpen] = useState(false)
    const [opening, setOpening] = useState(false)
    const [openOrderId, setOpenOrderId] = useState<string>()

    const vehicle = useQuery({
        queryKey: vehicleKeys.detail(vehicleId ?? ''),
        queryFn: async () => await vehiclesApi.get(vehicleId as string),
        enabled: Boolean(vehicleId),
    })
    const history = useQuery({
        queryKey: vehicleKeys.history(vehicleId ?? ''),
        queryFn: async () => await vehiclesApi.history(vehicleId as string),
        enabled: Boolean(vehicleId),
    })

    const update = useVehicleMutation(
        async (body: UpdateVehicleRequest) => await vehiclesApi.update(vehicleId as string, body),
        'vehicles.saved'
    )
    const remove = useMutation({
        mutationFn: async () => await vehiclesApi.remove(vehicleId as string),
        onSuccess: async () => {
            message.success(t('vehicles.deleted'))
            await queryClient.invalidateQueries({ queryKey: vehicleKeys.all })
            navigate(Routes.Vehicles.path)
        },
        onError: (error) => message.error(error.message),
    })

    useEffect(() => {
        if (editing && vehicle.data) {
            form.resetFields()
            form.setFieldsValue({
                ...vehicle.data.summary,
                notes: vehicle.data.notes ?? undefined,
            } as CreateVehicleRequest)
        }
    }, [editing, vehicle.data, form])

    if (vehicle.error) return <ErrorBlock error={vehicle.error} />
    if (vehicle.isLoading || !vehicle.data) return <Skeleton active />

    const { summary, customer, maintenance, reminders, owners } = vehicle.data

    const columns: TableProps<ServiceOrderSummary>['columns'] = [
        { title: t('fields.opened_at'), dataIndex: 'openedAt', width: 150, render: formatDateTime },
        {
            title: t('fields.type'),
            dataIndex: 'type',
            width: 130,
            render: (type: string) => enumLabel('service_type', type),
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
            title: t('fields.mileage'),
            dataIndex: 'mileage',
            width: 110,
            align: 'right',
            render: (mileage?: number | null) => (mileage == null ? '—' : `${formatNumber(mileage)} km`),
        },
        { title: t('fields.mechanic'), dataIndex: 'mechanicName', render: (name?: string | null) => name ?? '—' },
        {
            title: t('fields.total'),
            dataIndex: 'total',
            width: 120,
            align: 'right',
            render: (total: number, row) => formatMoney(total, row.currency),
        },
    ]

    return (
        <>
            <PageHeader
                title={
                    <Flex align={'center'} gap={12}>
                        {summary.label}
                        <Tag style={{ fontFamily: 'monospace', fontWeight: 600 }}>{summary.registrationPlate}</Tag>
                    </Flex>
                }
                subtitle={<Link to={pathTo(Routes.Customer, { customerId: customer.id })}>{customer.displayName}</Link>}
                extra={
                    <>
                        <ProtectedComponent permission={'service:create'}>
                            <Button type={'primary'} icon={<PlusOutlined />} onClick={() => setOpening(true)}>
                                {t('workshop.open_order')}
                            </Button>
                        </ProtectedComponent>
                        <ProtectedComponent permission={'vehicle:update'}>
                            <Button onClick={() => setReadingOpen(true)}>{t('vehicles.record_mileage')}</Button>
                        </ProtectedComponent>
                        <ProtectedComponent permission={'vehicle:update'}>
                            <Button icon={<EditOutlined />} onClick={() => setEditing(true)}>
                                {t('actions.edit')}
                            </Button>
                        </ProtectedComponent>
                        <ProtectedComponent permission={'vehicle:delete'}>
                            <Popconfirm
                                title={t('vehicles.confirm_delete')}
                                onConfirm={() => remove.mutate()}
                                okButtonProps={{ danger: true }}
                            >
                                <Button danger icon={<DeleteOutlined />} />
                            </Popconfirm>
                        </ProtectedComponent>
                    </>
                }
            />

            <Row gutter={[16, 16]}>
                <Col xs={24} lg={10}>
                    <Card title={t('vehicles.details')}>
                        <Descriptions column={1} size={'small'} bordered>
                            <Descriptions.Item label={t('fields.vin')}>{summary.vin ?? '—'}</Descriptions.Item>
                            <Descriptions.Item label={t('fields.engine')}>{summary.engine ?? '—'}</Descriptions.Item>
                            <Descriptions.Item label={t('fields.fuel_type')}>
                                {enumLabel('fuel_type', summary.fuelType)}
                            </Descriptions.Item>
                            <Descriptions.Item label={t('fields.mileage')}>
                                {summary.mileage == null ? '—' : `${formatNumber(summary.mileage)} km`}
                                {summary.mileageRecordedAt ? ` · ${formatDate(summary.mileageRecordedAt)}` : ''}
                            </Descriptions.Item>
                            <Descriptions.Item label={t('fields.phone')}>{customer.phone ?? '—'}</Descriptions.Item>
                            <Descriptions.Item label={t('fields.email')}>{customer.email ?? '—'}</Descriptions.Item>
                            <Descriptions.Item label={t('fields.notes')}>{vehicle.data.notes ?? '—'}</Descriptions.Item>
                        </Descriptions>
                    </Card>
                </Col>
                <Col xs={24} lg={14}>
                    <MaintenanceCard
                        maintenance={maintenance}
                        reminders={reminders}
                        annualMileage={summary.annualMileage}
                    />
                </Col>
                <Col xs={24}>
                    <ServiceBookCard
                        vehicleId={summary.id}
                        customerEmail={customer.email}
                        onOpenOrder={setOpenOrderId}
                    />
                </Col>
                <Col xs={24} lg={14}>
                    <Card title={t('vehicles.history')}>
                        <Table<ServiceOrderSummary>
                            rowKey={'id'}
                            size={'small'}
                            loading={history.isFetching}
                            dataSource={history.data}
                            columns={columns}
                            pagination={false}
                            locale={{ emptyText: t('workshop.no_orders') }}
                            onRow={(row) => ({ onClick: () => setOpenOrderId(row.id), style: { cursor: 'pointer' } })}
                        />
                    </Card>
                </Col>
                <Col xs={24} lg={10}>
                    <Flex vertical gap={16}>
                        <UpcomingCard vehicleId={summary.id} />
                        <OwnersCard vehicleId={summary.id} currentCustomerId={customer.id} owners={owners} />
                    </Flex>
                </Col>
            </Row>

            <Drawer
                open={editing}
                onClose={() => setEditing(false)}
                width={720}
                title={t('vehicles.edit')}
                footer={
                    <Flex gap={8} justify={'flex-end'}>
                        <Button onClick={() => setEditing(false)}>{t('actions.cancel')}</Button>
                        <Button type={'primary'} loading={update.isPending} onClick={() => form.submit()}>
                            {t('actions.save')}
                        </Button>
                    </Flex>
                }
            >
                {update.error ? (
                    <div style={{ marginBottom: 16 }}>
                        <ErrorBlock error={update.error} />
                    </div>
                ) : null}
                <VehicleForm
                    form={form}
                    editing
                    onFinish={(values) => update.mutate(values, { onSuccess: () => setEditing(false) })}
                />
            </Drawer>

            <MileageModal
                vehicleId={summary.id}
                current={summary.mileage}
                open={readingOpen}
                onClose={() => setReadingOpen(false)}
            />
            <OpenOrderModal
                open={opening}
                vehicleId={summary.id}
                onClose={() => setOpening(false)}
                onOpened={(order) => setOpenOrderId(order.summary.id)}
            />
            <ServiceOrderDrawer orderId={openOrderId} onClose={() => setOpenOrderId(undefined)} />
        </>
    )
}

export default VehicleDetail
