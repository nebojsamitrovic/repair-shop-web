import { useQueryClient } from '@tanstack/react-query'
import { App, Col, DatePicker, Form, Input, InputNumber, Modal, Row, Select, TimePicker, Typography } from 'antd'
import dayjs, { type Dayjs } from 'dayjs'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { SERVICE_TYPES, type Appointment, type BookAppointmentRequest, type UpdateAppointmentRequest } from 'api/types'
import { ErrorBlock } from 'components'
import { useDirectory, useMutation } from 'hooks'
import useEnumLabel from 'lang/useEnumLabel'
import { appointmentKeys, appointmentsApi } from '../utils/api'

const DEFAULT_MINUTES = 60
const STEP_MINUTES = 15

/** The form asks for a day, an hour and a length; the request carries the two instants. */
interface AppointmentForm {
    vehicleId: string
    locationId?: string
    mechanicUserId?: string
    type: BookAppointmentRequest['type']
    day: Dayjs
    time: Dayjs
    minutes: number
    note?: string
}

interface Props {
    open: boolean
    /** Fixed when booking from a vehicle's own screen. */
    vehicleId?: string
    /** The day the calendar had selected, for a new booking. */
    day?: Dayjs
    /** Set to move, reassign or annotate an existing booking. */
    appointment?: Appointment
    onClose: () => void
}

const toRequest = (values: AppointmentForm) => {
    const startsAt = values.day.hour(values.time.hour()).minute(values.time.minute()).second(0).millisecond(0)
    return {
        startsAt: startsAt.toISOString(),
        endsAt: startsAt.add(values.minutes, 'minute').toISOString(),
        locationId: values.locationId,
        mechanicUserId: values.mechanicUserId,
        type: values.type,
        note: values.note,
    }
}

const AppointmentModal = ({ open, vehicleId, day, appointment, onClose }: Props) => {
    const { t } = useTranslation()
    const enumLabel = useEnumLabel()
    const { message } = App.useApp()
    const queryClient = useQueryClient()
    const [form] = Form.useForm<AppointmentForm>()
    const { vehicles, locations, mechanics } = useDirectory()

    const save = useMutation({
        mutationFn: async (values: AppointmentForm) =>
            appointment
                ? await appointmentsApi.update(appointment.id, toRequest(values) satisfies UpdateAppointmentRequest)
                : await appointmentsApi.book({ vehicleId: values.vehicleId, ...toRequest(values) }),
        onSuccess: async () => {
            message.success(t(appointment ? 'appointments.updated' : 'appointments.booked'))
            await queryClient.invalidateQueries({ queryKey: appointmentKeys.all })
            onClose()
        },
    })

    useEffect(() => {
        if (!open) return
        form.resetFields()
        if (appointment) {
            const starts = dayjs(appointment.startsAt)
            form.setFieldsValue({
                vehicleId: appointment.vehicleId,
                locationId: appointment.locationId,
                mechanicUserId: appointment.mechanicUserId ?? undefined,
                type: appointment.type,
                day: starts,
                time: starts,
                minutes: dayjs(appointment.endsAt).diff(starts, 'minute'),
                note: appointment.note ?? undefined,
            })
            return
        }
        form.setFieldsValue({
            vehicleId,
            type: 'SMALL_SERVICE',
            locationId: locations.length === 1 ? locations[0].id : undefined,
            day: day ?? dayjs().add(1, 'day'),
            time: dayjs().hour(9).minute(0),
            minutes: DEFAULT_MINUTES,
        })
    }, [open, appointment, vehicleId, day, form, locations])

    const close = () => {
        save.reset()
        onClose()
    }

    return (
        <Modal
            open={open}
            width={640}
            title={t(appointment ? 'appointments.edit' : 'appointments.book')}
            okText={t(appointment ? 'actions.save' : 'appointments.book')}
            cancelText={t('actions.cancel')}
            confirmLoading={save.isPending}
            onCancel={close}
            onOk={() => form.submit()}
        >
            {save.error ? (
                <div style={{ marginBottom: 16 }}>
                    <ErrorBlock error={save.error} />
                </div>
            ) : null}
            <Typography.Paragraph type={'secondary'}>{t('appointments.hint')}</Typography.Paragraph>

            <Form<AppointmentForm>
                form={form}
                layout={'vertical'}
                requiredMark={false}
                onFinish={(values) => save.mutate(values)}
            >
                <Form.Item
                    name={'vehicleId'}
                    label={t('fields.vehicle')}
                    rules={[{ required: true, message: t('validation.required') }]}
                >
                    <Select
                        showSearch
                        disabled={Boolean(vehicleId) || Boolean(appointment)}
                        optionFilterProp={'label'}
                        options={vehicles.map((vehicle) => ({
                            value: vehicle.id,
                            label: `${vehicle.registrationPlate} — ${vehicle.label}${vehicle.customerName ? ` (${vehicle.customerName})` : ''}`,
                        }))}
                    />
                </Form.Item>
                <Row gutter={12}>
                    <Col xs={24} md={12}>
                        <Form.Item
                            name={'type'}
                            label={t('fields.type')}
                            rules={[{ required: true, message: t('validation.required') }]}
                        >
                            <Select
                                options={SERVICE_TYPES.map((type) => ({
                                    value: type,
                                    label: enumLabel('service_type', type),
                                }))}
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                        <Form.Item name={'locationId'} label={t('fields.location')}>
                            <Select
                                allowClear
                                options={locations.map((location) => ({ value: location.id, label: location.name }))}
                            />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={12}>
                    <Col xs={12} md={8}>
                        <Form.Item
                            name={'day'}
                            label={t('fields.date')}
                            rules={[{ required: true, message: t('validation.required') }]}
                        >
                            <DatePicker style={{ width: '100%' }} format={'L'} />
                        </Form.Item>
                    </Col>
                    <Col xs={12} md={8}>
                        <Form.Item
                            name={'time'}
                            label={t('fields.time')}
                            rules={[{ required: true, message: t('validation.required') }]}
                        >
                            <TimePicker style={{ width: '100%' }} format={'HH:mm'} minuteStep={STEP_MINUTES} />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                        <Form.Item
                            name={'minutes'}
                            label={t('fields.duration_minutes')}
                            rules={[{ required: true, message: t('validation.required') }]}
                        >
                            <InputNumber
                                min={STEP_MINUTES}
                                max={12 * 60}
                                step={STEP_MINUTES}
                                style={{ width: '100%' }}
                            />
                        </Form.Item>
                    </Col>
                </Row>
                <Form.Item name={'mechanicUserId'} label={t('fields.mechanic')} extra={t('appointments.mechanic_hint')}>
                    <Select
                        allowClear
                        options={mechanics.map((mechanic) => ({ value: mechanic.id, label: mechanic.name }))}
                    />
                </Form.Item>
                <Form.Item name={'note'} label={t('fields.note')}>
                    <Input.TextArea rows={2} maxLength={2000} />
                </Form.Item>
            </Form>
        </Modal>
    )
}

export default AppointmentModal
