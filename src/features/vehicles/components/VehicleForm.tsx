import { Col, DatePicker, Form, Input, InputNumber, Row, Select, type FormInstance } from 'antd'
import { useTranslation } from 'react-i18next'

import { FUEL_TYPES, type CreateVehicleRequest } from 'api/types'
import { useDirectory } from 'hooks'
import useEnumLabel from 'lang/useEnumLabel'

interface Props {
    form: FormInstance<CreateVehicleRequest>
    /** Editing: the reading is changed on its own, not on the form. */
    editing?: boolean
    onFinish: (values: CreateVehicleRequest) => void
}

/** The car and, when registering it, where its odometer stands and how far it goes in a year. */
const VehicleForm = ({ form, editing = false, onFinish }: Props) => {
    const { t } = useTranslation()
    const enumLabel = useEnumLabel()
    const { customers } = useDirectory()

    return (
        <Form<CreateVehicleRequest> form={form} layout={'vertical'} requiredMark={false} onFinish={onFinish}>
            {/* The owner is only chosen once, here. Afterwards the car changes hands, which is an
                event with a day and a reason — "Change owner" on the car's page, not a field. */}
            {editing ? null : (
                <Form.Item
                    name={'customerId'}
                    label={t('fields.customer')}
                    rules={[{ required: true, message: t('validation.required') }]}
                >
                    <Select
                        showSearch
                        optionFilterProp={'label'}
                        options={customers.map((customer) => ({ value: customer.id, label: customer.displayName }))}
                    />
                </Form.Item>
            )}
            <Row gutter={12}>
                <Col xs={24} md={8}>
                    <Form.Item
                        name={'registrationPlate'}
                        label={t('fields.plate')}
                        extra={t('vehicles.plate_hint')}
                        rules={[{ required: true, max: 32, message: t('validation.required') }]}
                    >
                        <Input style={{ textTransform: 'uppercase' }} />
                    </Form.Item>
                </Col>
                <Col xs={24} md={16}>
                    <Form.Item
                        name={'vin'}
                        label={t('fields.vin')}
                        extra={t('vehicles.vin_hint')}
                        rules={[{ max: 32 }]}
                    >
                        <Input style={{ textTransform: 'uppercase' }} />
                    </Form.Item>
                </Col>
            </Row>
            <Row gutter={12}>
                <Col xs={24} md={8}>
                    <Form.Item
                        name={'make'}
                        label={t('fields.make')}
                        rules={[{ required: true, max: 64, message: t('validation.required') }]}
                    >
                        <Input />
                    </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                    <Form.Item
                        name={'model'}
                        label={t('fields.model')}
                        rules={[{ required: true, max: 64, message: t('validation.required') }]}
                    >
                        <Input />
                    </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                    <Form.Item name={'modelYear'} label={t('fields.model_year')}>
                        <InputNumber min={1900} max={2100} style={{ width: '100%' }} />
                    </Form.Item>
                </Col>
            </Row>
            <Row gutter={12}>
                <Col xs={24} md={12}>
                    <Form.Item name={'engine'} label={t('fields.engine')} rules={[{ max: 64 }]}>
                        <Input placeholder={'2.0 TDI'} />
                    </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                    <Form.Item name={'fuelType'} label={t('fields.fuel_type')}>
                        <Select
                            allowClear
                            options={FUEL_TYPES.map((fuel) => ({ value: fuel, label: enumLabel('fuel_type', fuel) }))}
                        />
                    </Form.Item>
                </Col>
            </Row>
            <Row gutter={12}>
                {editing ? null : (
                    <>
                        <Col xs={24} md={8}>
                            <Form.Item name={'mileage'} label={t('fields.mileage')}>
                                <InputNumber min={0} style={{ width: '100%' }} addonAfter={'km'} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                            <Form.Item
                                name={'mileageRecordedAt'}
                                label={t('fields.mileage_recorded_at')}
                                extra={t('vehicles.reading_today')}
                                getValueProps={(value) => ({ value: value ? (value as never) : undefined })}
                            >
                                <DatePicker style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                    </>
                )}
                <Col xs={24} md={editing ? 24 : 8}>
                    <Form.Item
                        name={'annualMileage'}
                        label={t('fields.annual_mileage')}
                        extra={t('vehicles.annual_hint')}
                    >
                        <InputNumber min={1} step={1000} style={{ width: '100%' }} addonAfter={'km'} />
                    </Form.Item>
                </Col>
            </Row>
            <Form.Item name={'notes'} label={t('fields.notes')}>
                <Input.TextArea rows={3} />
            </Form.Item>
        </Form>
    )
}

export default VehicleForm
