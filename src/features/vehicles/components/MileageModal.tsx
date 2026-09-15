import { DatePicker, Form, InputNumber, Modal } from 'antd'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'

import type { RecordMileageRequest } from 'api/types'
import { ErrorBlock } from 'components'
import useVehicleMutation from '../hooks/useVehicleMutation'
import { vehiclesApi } from '../utils/api'

interface Props {
    vehicleId: string
    current?: number | null
    open: boolean
    onClose: () => void
}

/** A reading taken outside a service — at the desk, over the phone. Never lower than the last. */
const MileageModal = ({ vehicleId, current, open, onClose }: Props) => {
    const { t } = useTranslation()
    const [form] = Form.useForm<{ mileage: number; recordedOn?: dayjs.Dayjs }>()
    const record = useVehicleMutation(
        async (body: RecordMileageRequest) => await vehiclesApi.recordMileage(vehicleId, body),
        'vehicles.mileage_recorded'
    )

    return (
        <Modal
            open={open}
            title={t('vehicles.record_mileage')}
            okText={t('actions.save')}
            cancelText={t('actions.cancel')}
            confirmLoading={record.isPending}
            onCancel={onClose}
            onOk={() => form.submit()}
            destroyOnHidden
        >
            {record.error ? (
                <div style={{ marginBottom: 16 }}>
                    <ErrorBlock error={record.error} />
                </div>
            ) : null}
            <Form
                form={form}
                layout={'vertical'}
                requiredMark={false}
                initialValues={{ mileage: current ?? undefined }}
                onFinish={(values) =>
                    record.mutate(
                        { mileage: values.mileage, recordedOn: values.recordedOn?.format('YYYY-MM-DD') },
                        { onSuccess: onClose }
                    )
                }
            >
                <Form.Item
                    name={'mileage'}
                    label={t('fields.mileage')}
                    rules={[{ required: true, message: t('validation.required') }]}
                >
                    <InputNumber min={current ?? 0} style={{ width: '100%' }} addonAfter={'km'} />
                </Form.Item>
                <Form.Item
                    name={'recordedOn'}
                    label={t('fields.mileage_recorded_at')}
                    extra={t('vehicles.reading_today')}
                >
                    <DatePicker style={{ width: '100%' }} maxDate={dayjs()} />
                </Form.Item>
            </Form>
        </Modal>
    )
}

export default MileageModal
