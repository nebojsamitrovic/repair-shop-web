import { CarOutlined, EditOutlined, PlusOutlined, StopOutlined, UserDeleteOutlined } from '@ant-design/icons'
import { useQueryClient } from '@tanstack/react-query'
import { App, Badge, Button, Calendar, Card, Col, Dropdown, Empty, Flex, Row, Select, Tag, Typography } from 'antd'
import dayjs, { type Dayjs } from 'dayjs'
import { useMemo, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import type { Appointment, AppointmentStatus } from 'api/types'
import { ErrorBlock, PageHeader, ProtectedComponent } from 'components'
import { useDirectory, useMutation, useQuery } from 'hooks'
import useEnumLabel from 'lang/useEnumLabel'
import { Routes } from 'routes/config'
import { formatDate } from 'utils/format'
import AppointmentModal from '../components/AppointmentModal'
import ArrivalModal from '../components/ArrivalModal'
import { appointmentKeys, appointmentsApi } from '../utils/api'

const statusColor: Record<AppointmentStatus, string> = {
    SCHEDULED: 'blue',
    CONVERTED: 'green',
    CANCELLED: 'default',
    NO_SHOW: 'red',
}

/** A month at a glance on the left, the chosen day in full on the right. */
const Appointments = () => {
    const { t } = useTranslation()
    const enumLabel = useEnumLabel()
    const navigate = useNavigate()
    const { message } = App.useApp()
    const queryClient = useQueryClient()
    const { locations, mechanics } = useDirectory()
    const [day, setDay] = useState<Dayjs>(dayjs())
    const [month, setMonth] = useState<Dayjs>(dayjs())
    const [locationId, setLocationId] = useState<string>()
    const [mechanicUserId, setMechanicUserId] = useState<string>()
    const [booking, setBooking] = useState(false)
    const [editing, setEditing] = useState<Appointment>()
    const [arriving, setArriving] = useState<Appointment>()

    const range = useMemo(
        () => ({
            from: month.startOf('month').startOf('week').toISOString(),
            to: month.endOf('month').endOf('week').toISOString(),
            locationId,
            mechanicUserId,
        }),
        [month, locationId, mechanicUserId]
    )
    const { data, error } = useQuery({
        queryKey: appointmentKeys.window(range),
        queryFn: async () => await appointmentsApi.list(range),
    })

    const byDay = useMemo(() => {
        const map = new Map<string, Appointment[]>()
        for (const appointment of data ?? []) {
            const key = dayjs(appointment.startsAt).format('YYYY-MM-DD')
            map.set(key, [...(map.get(key) ?? []), appointment])
        }
        return map
    }, [data])
    const ofDay = byDay.get(day.format('YYYY-MM-DD')) ?? []

    const close = useMutation({
        mutationFn: async ({ id, noShow }: { id: string; noShow: boolean }) =>
            noShow ? await appointmentsApi.noShow(id) : await appointmentsApi.cancel(id),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: appointmentKeys.all })
        },
        onError: (failure) => message.error(failure.message),
    })

    const cellRender = (date: Dayjs, info: { type: string; originNode: ReactNode }) => {
        if (info.type !== 'date') return info.originNode
        const scheduled = (byDay.get(date.format('YYYY-MM-DD')) ?? []).filter((item) => item.status === 'SCHEDULED')
        if (scheduled.length === 0) return null
        return (
            <Flex vertical gap={2}>
                {scheduled.slice(0, 3).map((item) => (
                    <Typography.Text key={item.id} ellipsis style={{ fontSize: 12 }}>
                        <Badge status={'processing'} /> {dayjs(item.startsAt).format('HH:mm')} {item.registrationPlate}
                    </Typography.Text>
                ))}
                {scheduled.length > 3 ? (
                    <Typography.Text type={'secondary'} style={{ fontSize: 12 }}>
                        +{scheduled.length - 3}
                    </Typography.Text>
                ) : null}
            </Flex>
        )
    }

    return (
        <>
            <PageHeader
                title={t('pages.appointments.title')}
                subtitle={t('pages.appointments.subtitle')}
                extra={
                    <ProtectedComponent permission={'service:create'}>
                        <Button type={'primary'} icon={<PlusOutlined />} onClick={() => setBooking(true)}>
                            {t('appointments.book')}
                        </Button>
                    </ProtectedComponent>
                }
            />
            {error ? <ErrorBlock error={error} /> : null}

            <Flex gap={8} wrap style={{ marginBottom: 16 }}>
                <Select
                    allowClear
                    placeholder={t('fields.location')}
                    style={{ minWidth: 180 }}
                    value={locationId}
                    onChange={setLocationId}
                    options={locations.map((location) => ({ value: location.id, label: location.name }))}
                />
                <Select
                    allowClear
                    placeholder={t('fields.mechanic')}
                    style={{ minWidth: 180 }}
                    value={mechanicUserId}
                    onChange={setMechanicUserId}
                    options={mechanics.map((mechanic) => ({ value: mechanic.id, label: mechanic.name }))}
                />
            </Flex>

            <Row gutter={[16, 16]}>
                <Col xs={24} xl={15}>
                    <Card>
                        <Calendar
                            value={day}
                            cellRender={cellRender}
                            onSelect={(date) => setDay(date)}
                            onPanelChange={(date) => {
                                setMonth(date)
                                setDay(date)
                            }}
                        />
                    </Card>
                </Col>
                <Col xs={24} xl={9}>
                    <Card
                        title={formatDate(day.toISOString())}
                        extra={
                            <ProtectedComponent permission={'service:create'}>
                                <Button size={'small'} icon={<PlusOutlined />} onClick={() => setBooking(true)}>
                                    {t('appointments.book')}
                                </Button>
                            </ProtectedComponent>
                        }
                    >
                        {ofDay.length === 0 ? (
                            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t('appointments.empty_day')} />
                        ) : (
                            <Flex vertical gap={12}>
                                {ofDay.map((item) => (
                                    <Card key={item.id} size={'small'} styles={{ body: { padding: 12 } }}>
                                        <Flex justify={'space-between'} align={'flex-start'} gap={8}>
                                            <Flex vertical gap={2} style={{ minWidth: 0 }}>
                                                <Flex gap={8} align={'center'}>
                                                    <Typography.Text strong>
                                                        {dayjs(item.startsAt).format('HH:mm')}–
                                                        {dayjs(item.endsAt).format('HH:mm')}
                                                    </Typography.Text>
                                                    <Tag
                                                        color={statusColor[item.status]}
                                                        style={{ marginInlineEnd: 0 }}
                                                    >
                                                        {enumLabel('appointment_status', item.status)}
                                                    </Tag>
                                                </Flex>
                                                <Typography.Text>
                                                    <Tag style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                                                        {item.registrationPlate}
                                                    </Tag>
                                                    {item.vehicleLabel}
                                                </Typography.Text>
                                                <Typography.Text type={'secondary'} style={{ fontSize: 12 }}>
                                                    {enumLabel('service_type', item.type)}
                                                    {item.customerName ? ` · ${item.customerName}` : ''}
                                                    {item.customerPhone ? ` · ${item.customerPhone}` : ''}
                                                </Typography.Text>
                                                <Typography.Text type={'secondary'} style={{ fontSize: 12 }}>
                                                    {item.mechanicName ?? t('appointments.unassigned')}
                                                    {item.locationName ? ` · ${item.locationName}` : ''}
                                                </Typography.Text>
                                                {item.note ? (
                                                    <Typography.Text style={{ fontSize: 12 }}>
                                                        {item.note}
                                                    </Typography.Text>
                                                ) : null}
                                            </Flex>
                                            {item.status === 'SCHEDULED' ? (
                                                <ProtectedComponent permission={'service:create'}>
                                                    <Dropdown.Button
                                                        size={'small'}
                                                        type={'primary'}
                                                        onClick={() => setArriving(item)}
                                                        menu={{
                                                            items: [
                                                                {
                                                                    key: 'edit',
                                                                    icon: <EditOutlined />,
                                                                    label: t('actions.edit'),
                                                                    onClick: () => setEditing(item),
                                                                },
                                                                {
                                                                    key: 'no-show',
                                                                    icon: <UserDeleteOutlined />,
                                                                    label: t('appointments.no_show'),
                                                                    onClick: () =>
                                                                        close.mutate({ id: item.id, noShow: true }),
                                                                },
                                                                {
                                                                    key: 'cancel',
                                                                    icon: <StopOutlined />,
                                                                    danger: true,
                                                                    label: t('appointments.cancel'),
                                                                    onClick: () =>
                                                                        close.mutate({ id: item.id, noShow: false }),
                                                                },
                                                            ],
                                                        }}
                                                    >
                                                        <CarOutlined /> {t('appointments.arrived')}
                                                    </Dropdown.Button>
                                                </ProtectedComponent>
                                            ) : item.serviceOrderId ? (
                                                <Button
                                                    size={'small'}
                                                    onClick={() =>
                                                        navigate(`${Routes.Workshop.path}?order=${item.serviceOrderId}`)
                                                    }
                                                >
                                                    {t('appointments.open_order')}
                                                </Button>
                                            ) : null}
                                        </Flex>
                                    </Card>
                                ))}
                            </Flex>
                        )}
                    </Card>
                </Col>
            </Row>

            <AppointmentModal open={booking} day={day} onClose={() => setBooking(false)} />
            <AppointmentModal open={Boolean(editing)} appointment={editing} onClose={() => setEditing(undefined)} />
            <ArrivalModal
                appointment={arriving}
                onClose={() => setArriving(undefined)}
                onOpened={(order) => navigate(`${Routes.Workshop.path}?order=${order.summary.id}`)}
            />
        </>
    )
}

export default Appointments
