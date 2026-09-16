import { Alert, Button, Checkbox, Col, Form, InputNumber, Row, Statistic, Typography } from 'antd'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import type { Labour, UpdateServiceOrderRequest } from 'api/types'
import { formatMoney } from 'utils/format'

interface Props {
    labour: Labour
    editable: boolean
    pending: boolean
    onSave: (values: UpdateServiceOrderRequest) => void
}

/** What the form holds: the flat-price question as a tick, the way the desk asks it. */
interface LabourForm {
    fixed: boolean
    labourHours?: number
    labourRate?: number
}

/**
 * The work itself, priced the garage's way.
 *
 * <p>By the hour, the desk enters the hours and the price follows; agreed flat, there are no hours
 * to enter and the price is the field. So the tick swaps one field for the other rather than
 * leaving both on screen — and it clears the rate when it does, because the number standing there
 * is a price per hour and it is not the price of the job.
 */
const LabourCard = ({ labour, editable, pending, onSave }: Props) => {
    const { t } = useTranslation()
    const [form] = Form.useForm<LabourForm>()
    const fixed = Form.useWatch('fixed', form) ?? labour.pricingMode === 'FIXED'
    const hours = Form.useWatch('labourHours', form)
    const rate = Form.useWatch('labourRate', form)

    useEffect(() => {
        form.setFieldsValue({
            fixed: labour.pricingMode === 'FIXED',
            labourHours: labour.hours ?? undefined,
            labourRate: labour.rate,
        })
    }, [labour, form])

    const preview = fixed ? (rate ?? 0) : (rate ?? 0) * (hours ?? 0)

    return (
        <Form<LabourForm>
            form={form}
            layout={'vertical'}
            requiredMark={false}
            disabled={!editable}
            onFinish={(values) =>
                onSave({
                    labourPricingMode: values.fixed ? 'FIXED' : 'HOURLY',
                    labourRate: values.labourRate,
                    labourHours: values.fixed ? undefined : (values.labourHours ?? 0),
                })
            }
        >
            <Form.Item name={'fixed'} valuePropName={'checked'} style={{ marginBottom: 12 }}>
                <Checkbox
                    onChange={(event) =>
                        form.setFieldsValue({
                            labourRate:
                                event.target.checked === (labour.pricingMode === 'FIXED') ? labour.rate : undefined,
                        })
                    }
                >
                    {t('workshop.fixed_price')}
                </Checkbox>
            </Form.Item>

            <Row gutter={12} align={'bottom'}>
                {fixed ? (
                    <Col xs={24} md={8}>
                        <Form.Item
                            name={'labourRate'}
                            label={t('fields.labour_price')}
                            rules={[{ required: true, message: t('validation.required') }]}
                        >
                            <InputNumber min={0} autoFocus style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>
                ) : (
                    <>
                        <Col xs={12} md={5}>
                            <Form.Item name={'labourHours'} label={t('fields.hours')}>
                                <InputNumber min={0} step={0.25} style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col xs={12} md={5}>
                            <Form.Item
                                name={'labourRate'}
                                label={t('fields.hourly_rate')}
                                rules={[{ required: true, message: t('validation.required') }]}
                            >
                                <InputNumber min={0} style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                    </>
                )}
                <Col xs={12} md={6}>
                    <Form.Item label={' '}>
                        <Statistic
                            value={formatMoney(preview, labour.currency)}
                            valueStyle={{ fontSize: 18 }}
                            title={t('workshop.labour_cost')}
                        />
                    </Form.Item>
                </Col>
                {editable ? (
                    <Col xs={12} md={5}>
                        <Form.Item label={' '}>
                            <Button block htmlType={'submit'} loading={pending}>
                                {t('actions.save')}
                            </Button>
                        </Form.Item>
                    </Col>
                ) : null}
            </Row>

            {preview !== labour.cost ? (
                <Alert
                    type={'info'}
                    showIcon
                    style={{ marginBottom: 12 }}
                    message={t('workshop.labour_unsaved', {
                        saved: formatMoney(labour.cost, labour.currency),
                    })}
                />
            ) : null}
            <Typography.Text type={'secondary'} style={{ fontSize: 12 }}>
                {t(fixed ? 'workshop.labour_hint_fixed' : 'workshop.labour_hint')}
            </Typography.Text>
        </Form>
    )
}

export default LabourCard
