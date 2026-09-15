import { Button, Col, Form, InputNumber, Row, Select, Statistic, Typography } from 'antd'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { LABOUR_PRICING_MODES, type Labour, type UpdateServiceOrderRequest } from 'api/types'
import useEnumLabel from 'lang/useEnumLabel'
import { formatMoney } from 'utils/format'

interface Props {
    labour: Labour
    editable: boolean
    pending: boolean
    onSave: (values: UpdateServiceOrderRequest) => void
}

/** The work itself, priced the garage's way: hours at a rate, or one flat amount for the job. */
const LabourCard = ({ labour, editable, pending, onSave }: Props) => {
    const { t } = useTranslation()
    const enumLabel = useEnumLabel()
    const [form] = Form.useForm<UpdateServiceOrderRequest>()
    const mode = Form.useWatch('labourPricingMode', form) ?? labour.pricingMode

    useEffect(() => {
        form.setFieldsValue({
            labourHours: labour.hours ?? undefined,
            labourPricingMode: labour.pricingMode,
            labourRate: labour.rate,
        })
    }, [labour, form])

    return (
        <Form<UpdateServiceOrderRequest>
            form={form}
            layout={'vertical'}
            requiredMark={false}
            onFinish={onSave}
            disabled={!editable}
        >
            <Row gutter={12} align={'bottom'}>
                <Col xs={12} md={5}>
                    <Form.Item name={'labourHours'} label={t('fields.hours')}>
                        <InputNumber min={0} step={0.25} style={{ width: '100%' }} />
                    </Form.Item>
                </Col>
                <Col xs={12} md={6}>
                    <Form.Item name={'labourPricingMode'} label={t('garage.pricing.mode')}>
                        <Select
                            options={LABOUR_PRICING_MODES.map((item) => ({
                                value: item,
                                label: enumLabel('labour_pricing_mode', item),
                            }))}
                        />
                    </Form.Item>
                </Col>
                <Col xs={12} md={5}>
                    <Form.Item
                        name={'labourRate'}
                        label={mode === 'HOURLY' ? t('fields.hourly_rate') : t('fields.fixed_rate')}
                    >
                        <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>
                </Col>
                <Col xs={12} md={4}>
                    <Form.Item label={' '}>
                        <Statistic
                            value={formatMoney(labour.cost, labour.currency)}
                            valueStyle={{ fontSize: 18 }}
                            title={t('workshop.labour_cost')}
                        />
                    </Form.Item>
                </Col>
                {editable ? (
                    <Col xs={24} md={4}>
                        <Form.Item label={' '}>
                            <Button block htmlType={'submit'} loading={pending}>
                                {t('actions.save')}
                            </Button>
                        </Form.Item>
                    </Col>
                ) : null}
            </Row>
            <Typography.Text type={'secondary'} style={{ fontSize: 12 }}>
                {t('workshop.labour_hint')}
            </Typography.Text>
        </Form>
    )
}

export default LabourCard
