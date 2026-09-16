import { Checkbox, Col, Divider, Form, Input, InputNumber, Modal, Row, Select, Typography } from 'antd'
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

/** The request, plus the way the desk is asked the flat-price question. */
interface OpenOrderForm extends OpenServiceOrderRequest {
    labourFixed?: boolean
}

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
    const [form] = Form.useForm<OpenOrderForm>()
    const { vehicles, locations, mechanics } = useDirectory()
    const type = Form.useWatch('type', form) as ServiceType | undefined
    const chosenVehicleId = Form.useWatch('vehicleId', form) as string | undefined
    const labourFixed = Form.useWatch('labourFixed', form) ?? false
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
            labourFixed: settings.data?.labourPricingMode === 'FIXED',
            labourRate: settings.data?.activeRate,
        })
    }, [open, vehicleId, form, locations, settings.data, t])

    const onTypeChange = (next: ServiceType) => form.setFieldValue('parts', partsTemplate(next, t))

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

            <Form<OpenOrderForm>
                form={form}
                layout={'vertical'}
                requiredMark={false}
                onFinish={({ labourFixed: agreedFlat, ...values }) =>
                    create.mutate(
                        {
                            ...values,
                            labourPricingMode: agreedFlat ? 'FIXED' : 'HOURLY',
                            labourHours: agreedFlat ? undefined : values.labourHours,
                            parts: (values.parts ?? []).filter((part) => part.description.trim().length > 0),
                        },
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
                    rules={[
                        {
                            required: type === 'SMALL_SERVICE' || type === 'BIG_SERVICE',
                            message: t('workshop.annual_required'),
                        },
                    ]}
                >
                    <InputNumber min={1} step={1000} style={{ width: '100%' }} addonAfter={'km'} />
                </Form.Item>
                <Form.Item name={'description'} label={t('fields.description')}>
                    <Input.TextArea rows={2} />
                </Form.Item>

                <Divider titlePlacement={'start'}>{t('workshop.labour')}</Divider>
                <Form.Item name={'labourFixed'} valuePropName={'checked'} style={{ marginBottom: 12 }}>
                    <Checkbox
                        onChange={(event) =>
                            form.setFieldValue(
                                'labourRate',
                                event.target.checked ? settings.data?.fixedRate : settings.data?.hourlyRate
                            )
                        }
                    >
                        {t('workshop.fixed_price')}
                    </Checkbox>
                </Form.Item>
                <Row gutter={12}>
                    {labourFixed ? (
                        <Col xs={24} md={10}>
                            <Form.Item
                                name={'labourRate'}
                                label={t('fields.labour_price')}
                                rules={[{ required: true, message: t('validation.required') }]}
                            >
                                <InputNumber min={0} style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                    ) : (
                        <>
                            <Col xs={12} md={7}>
                                <Form.Item name={'labourHours'} label={t('fields.hours')}>
                                    <InputNumber min={0} step={0.25} style={{ width: '100%' }} />
                                </Form.Item>
                            </Col>
                            <Col xs={12} md={7}>
                                <Form.Item name={'labourRate'} label={t('fields.hourly_rate')}>
                                    <InputNumber min={0} style={{ width: '100%' }} />
                                </Form.Item>
                            </Col>
                        </>
                    )}
                </Row>

                <Divider titlePlacement={'start'}>{t('workshop.parts')}</Divider>
                <Typography.Paragraph type={'secondary'} style={{ fontSize: 12 }}>
                    {t('workshop.parts_hint')}
                </Typography.Paragraph>
                <Form.Item name={'parts'} noStyle>
                    <PartsEditor currency={settings.data?.currency ?? 'EUR'} />
                </Form.Item>
            </Form>
        </Modal>
    )
}

export default OpenOrderModal
