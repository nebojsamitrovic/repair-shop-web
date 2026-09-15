import { Divider, Form, Input, InputNumber, Modal, Select, Typography } from 'antd'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { SERVICE_TYPES, type OpenServiceOrderRequest, type ServiceOrderDetail, type ServiceType } from 'api/types'
import { ErrorBlock } from 'components'
import useEnumLabel from 'lang/useEnumLabel'
import { garageApi, garageKeys } from 'features/garage/utils/api'
import { useDirectory, useQuery } from 'hooks'
import useWorkshopMutation from '../hooks/useWorkshopMutation'
import { workshopApi } from '../utils/api'
import { partsTemplate } from '../utils/templates'
import PartsEditor from './PartsEditor'

interface Props {
    open: boolean
    /** Fixed when the order is opened from a vehicle's own screen. */
    vehicleId?: string
    onClose: () => void
    onOpened: (order: ServiceOrderDetail) => void
}

/**
 * Taking a car in. A service asks the yearly distance because that is what the next reminder is
 * built on; the mechanic is the caller unless a colleague holding MECHANIC is named.
 */
const OpenOrderModal = ({ open, vehicleId, onClose, onOpened }: Props) => {
    const { t } = useTranslation()
    const enumLabel = useEnumLabel()
    const [form] = Form.useForm<OpenServiceOrderRequest>()
    const { vehicles, locations, mechanics } = useDirectory()
    const type = Form.useWatch('type', form) as ServiceType | undefined
    const chosenVehicleId = Form.useWatch('vehicleId', form) as string | undefined
    const settings = useQuery({ queryKey: garageKeys.settings, queryFn: garageApi.settings, staleTime: 5 * 60_000 })

    const create = useWorkshopMutation(
        async (body: OpenServiceOrderRequest) => await workshopApi.open(body),
        'workshop.opened'
    )

    useEffect(() => {
        if (!open) return
        form.resetFields()
        form.setFieldsValue({
            vehicleId,
            type: 'SMALL_SERVICE',
            locationId: locations.length === 1 ? locations[0].id : undefined,
            parts: partsTemplate('SMALL_SERVICE', t),
        })
    }, [open, vehicleId, form, locations, t])

    /* The list follows the type: a service starts with what a service usually needs, a repair with nothing. */
    const onTypeChange = (next: ServiceType) => form.setFieldValue('parts', partsTemplate(next, t))

    /* The car's last known figures, so the desk corrects rather than retypes. */
    useEffect(() => {
        const vehicle = vehicles.find((item) => item.id === chosenVehicleId)
        if (!vehicle) return
        form.setFieldsValue({
            mileage: vehicle.mileage ?? undefined,
            annualMileage: vehicle.annualMileage ?? undefined,
        })
    }, [chosenVehicleId, vehicles, form])

    return (
        <Modal
            open={open}
            width={720}
            title={t('workshop.open_order')}
            okText={t('workshop.open_order')}
            cancelText={t('actions.cancel')}
            confirmLoading={create.isPending}
            onCancel={onClose}
            onOk={() => form.submit()}
        >
            {create.error ? (
                <div style={{ marginBottom: 16 }}>
                    <ErrorBlock error={create.error} />
                </div>
            ) : null}

            <Typography.Paragraph type={'secondary'}>{t('workshop.open_hint')}</Typography.Paragraph>

            <Form<OpenServiceOrderRequest>
                form={form}
                layout={'vertical'}
                requiredMark={false}
                onFinish={(values) =>
                    create.mutate(
                        { ...values, parts: (values.parts ?? []).filter((part) => part.description.trim().length > 0) },
                        {
                            onSuccess: (order) => {
                                onOpened(order)
                                onClose()
                            },
                        }
                    )
                }
            >
                <Form.Item
                    name={'vehicleId'}
                    label={t('fields.vehicle')}
                    rules={[{ required: true, message: t('validation.required') }]}
                >
                    <Select
                        showSearch
                        disabled={Boolean(vehicleId)}
                        optionFilterProp={'label'}
                        options={vehicles.map((vehicle) => ({
                            value: vehicle.id,
                            label: `${vehicle.registrationPlate} — ${vehicle.label}${vehicle.customerName ? ` (${vehicle.customerName})` : ''}`,
                        }))}
                    />
                </Form.Item>
                <Form.Item
                    name={'type'}
                    label={t('fields.type')}
                    rules={[{ required: true, message: t('validation.required') }]}
                >
                    <Select
                        onChange={onTypeChange}
                        options={SERVICE_TYPES.map((item) => ({ value: item, label: enumLabel('service_type', item) }))}
                    />
                </Form.Item>
                {locations.length > 1 ? (
                    <Form.Item
                        name={'locationId'}
                        label={t('fields.location')}
                        rules={[{ required: true, message: t('validation.required') }]}
                    >
                        <Select options={locations.map((location) => ({ value: location.id, label: location.name }))} />
                    </Form.Item>
                ) : null}
                <Form.Item name={'mechanicUserId'} label={t('fields.mechanic')} extra={t('workshop.mechanic_hint')}>
                    <Select
                        allowClear
                        placeholder={t('workshop.mechanic_me')}
                        options={mechanics.map((mechanic) => ({ value: mechanic.id, label: mechanic.name }))}
                    />
                </Form.Item>
                <Form.Item name={'mileage'} label={t('fields.mileage')}>
                    <InputNumber min={0} style={{ width: '100%' }} addonAfter={'km'} />
                </Form.Item>
                <Form.Item
                    name={'annualMileage'}
                    label={t('fields.annual_mileage')}
                    extra={t('vehicles.annual_hint')}
                    rules={[{ required: type !== 'REPAIR', message: t('workshop.annual_required') }]}
                >
                    <InputNumber min={1} step={1000} style={{ width: '100%' }} addonAfter={'km'} />
                </Form.Item>
                <Form.Item name={'description'} label={t('fields.description')}>
                    <Input.TextArea rows={2} />
                </Form.Item>

                <Divider titlePlacement={'start'}>{t('workshop.parts')}</Divider>
                <Typography.Paragraph type={'secondary'} style={{ fontSize: 12 }}>
                    {t('workshop.parts_hint')}
                </Typography.Paragraph>
                {/* A controlled field like any other: the template is set on the form, the desk edits it. */}
                <Form.Item name={'parts'} noStyle>
                    <PartsEditor currency={settings.data?.currency ?? 'EUR'} />
                </Form.Item>
            </Form>
        </Modal>
    )
}

export default OpenOrderModal
