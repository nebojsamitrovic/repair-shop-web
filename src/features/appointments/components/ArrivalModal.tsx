import { useQueryClient } from '@tanstack/react-query'
import { Form, Input, InputNumber, Modal, Typography } from 'antd'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import type { Appointment, ArrivalRequest, ServiceOrderDetail } from 'api/types'
import { ErrorBlock } from 'components'
import useWorkshopMutation from 'features/workshop/hooks/useWorkshopMutation'
import { useDirectory } from 'hooks'
import { appointmentKeys, appointmentsApi } from '../utils/api'

interface Props {
    appointment?: Appointment
    onClose: () => void
    onOpened: (order: ServiceOrderDetail) => void
}

/** The car is here. What was booked is known; the desk adds what it sees at the door. */
const ArrivalModal = ({ appointment, onClose, onOpened }: Props) => {
    const { t } = useTranslation()
    const queryClient = useQueryClient()
    const [form] = Form.useForm<ArrivalRequest>()
    const { vehicles } = useDirectory()
    const isService = appointment?.type === 'SMALL_SERVICE' || appointment?.type === 'BIG_SERVICE'

    const open = useWorkshopMutation(
        async (body: ArrivalRequest) => await appointmentsApi.openOrder(appointment?.id ?? '', body),
        'workshop.opened'
    )

    useEffect(() => {
        if (!appointment) return
        const vehicle = vehicles.find((item) => item.id === appointment.vehicleId)
        form.resetFields()
        form.setFieldsValue({
            mileage: vehicle?.mileage ?? undefined,
            annualMileage: vehicle?.annualMileage ?? undefined,
            description: appointment.note ?? undefined,
        })
    }, [appointment, vehicles, form])

    return (
        <Modal
            open={Boolean(appointment)}
            title={t('appointments.arrived')}
            okText={t('workshop.open_order')}
            cancelText={t('actions.cancel')}
            confirmLoading={open.isPending}
            onCancel={onClose}
            onOk={() => form.submit()}
        >
            {open.error ? (
                <div style={{ marginBottom: 16 }}>
                    <ErrorBlock error={open.error} />
                </div>
            ) : null}
            <Typography.Paragraph type={'secondary'}>
                {appointment?.registrationPlate} — {appointment?.vehicleLabel}
            </Typography.Paragraph>
            <Form<ArrivalRequest>
                form={form}
                layout={'vertical'}
                requiredMark={false}
                onFinish={(values) =>
                    open.mutate(values, {
                        onSuccess: async (order) => {
                            await queryClient.invalidateQueries({ queryKey: appointmentKeys.all })
                            onOpened(order)
                            onClose()
                        },
                    })
                }
            >
                <Form.Item name={'mileage'} label={t('fields.mileage')}>
                    <InputNumber min={0} style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item
                    name={'annualMileage'}
                    label={t('fields.annual_mileage')}
                    rules={[{ required: isService, message: t('workshop.annual_required') }]}
                >
                    <InputNumber min={1} style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item name={'description'} label={t('fields.description')}>
                    <Input.TextArea rows={3} maxLength={4000} />
                </Form.Item>
            </Form>
        </Modal>
    )
}

export default ArrivalModal
