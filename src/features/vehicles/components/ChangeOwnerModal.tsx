import { DatePicker, Form, Input, Modal, Select, Typography } from 'antd'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'

import type { ChangeOwnerRequest } from 'api/types'
import { ErrorBlock } from 'components'
import { useDirectory } from 'hooks'
import useVehicleMutation from '../hooks/useVehicleMutation'
import { vehiclesApi } from '../utils/api'

interface Props {
    vehicleId: string
    /** Not offered as the new owner: the car is already theirs. */
    currentCustomerId: string
    open: boolean
    onClose: () => void
}

/**
 * The car has been sold, inherited, handed back to the company.
 *
 * <p>The day matters and is asked for: the orders written before it stay the previous owner's, and
 * that is the whole point of keeping the history rather than overwriting a field.
 */
const ChangeOwnerModal = ({ vehicleId, currentCustomerId, open, onClose }: Props) => {
    const { t } = useTranslation()
    const { customers } = useDirectory()
    const [form] = Form.useForm<{ customerId: string; on?: dayjs.Dayjs; note?: string }>()

    const change = useVehicleMutation(
        async (body: ChangeOwnerRequest) => await vehiclesApi.changeOwner(vehicleId, body),
        'vehicles.owner_changed'
    )

    return (
        <Modal
            open={open}
            title={t('vehicles.change_owner')}
            okText={t('actions.save')}
            cancelText={t('actions.cancel')}
            confirmLoading={change.isPending}
            onCancel={onClose}
            onOk={() => form.submit()}
            destroyOnHidden
        >
            {change.error ? (
                <div style={{ marginBottom: 16 }}>
                    <ErrorBlock error={change.error} />
                </div>
            ) : null}
            <Typography.Paragraph type={'secondary'}>{t('vehicles.change_owner_hint')}</Typography.Paragraph>
            <Form
                form={form}
                layout={'vertical'}
                requiredMark={false}
                onFinish={(values) =>
                    change.mutate(
                        {
                            customerId: values.customerId,
                            on: values.on?.format('YYYY-MM-DD'),
                            note: values.note,
                        },
                        { onSuccess: onClose }
                    )
                }
            >
                <Form.Item
                    name={'customerId'}
                    label={t('vehicles.new_owner')}
                    rules={[{ required: true, message: t('validation.required') }]}
                >
                    <Select
                        showSearch
                        optionFilterProp={'label'}
                        options={customers
                            .filter((customer) => customer.id !== currentCustomerId)
                            .map((customer) => ({ value: customer.id, label: customer.displayName }))}
                    />
                </Form.Item>
                <Form.Item name={'on'} label={t('vehicles.changed_hands_on')} extra={t('vehicles.today_when_empty')}>
                    <DatePicker style={{ width: '100%' }} format={'DD.MM.YYYY.'} />
                </Form.Item>
                <Form.Item name={'note'} label={t('fields.note')}>
                    <Input.TextArea rows={2} placeholder={t('vehicles.owner_note_placeholder')} />
                </Form.Item>
            </Form>
        </Modal>
    )
}

export default ChangeOwnerModal
