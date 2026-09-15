import { Button, Col, Form, Input, InputNumber, Row, Select } from 'antd'
import { useTranslation } from 'react-i18next'

import { SERVICE_ITEM_KINDS, type AddServiceItemRequest } from 'api/types'
import useEnumLabel from 'lang/useEnumLabel'

interface Props {
    pending: boolean
    onAdd: (item: AddServiceItemRequest) => void
}

/** A part at a price, or work sent out — the amount follows from the two numbers. Labour is on the order. */
const ItemForm = ({ pending, onAdd }: Props) => {
    const { t } = useTranslation()
    const enumLabel = useEnumLabel()
    const [form] = Form.useForm<AddServiceItemRequest>()

    return (
        <Form<AddServiceItemRequest>
            form={form}
            layout={'vertical'}
            requiredMark={false}
            initialValues={{ kind: 'PART', quantity: 1 }}
            onFinish={(values) => {
                onAdd(values)
                form.resetFields()
            }}
        >
            <Row gutter={12}>
                <Col xs={12} md={5}>
                    <Form.Item name={'kind'} label={t('fields.type')}>
                        <Select
                            options={SERVICE_ITEM_KINDS.map((item) => ({
                                value: item,
                                label: enumLabel('service_item_kind', item),
                            }))}
                        />
                    </Form.Item>
                </Col>
                <Col xs={24} md={9}>
                    <Form.Item
                        name={'description'}
                        label={t('fields.description')}
                        rules={[{ required: true, max: 255, message: t('validation.required') }]}
                    >
                        <Input />
                    </Form.Item>
                </Col>
                <Col xs={12} md={3}>
                    <Form.Item
                        name={'quantity'}
                        label={t('fields.quantity')}
                        rules={[{ required: true, message: t('validation.required') }]}
                    >
                        <InputNumber min={0.01} style={{ width: '100%' }} />
                    </Form.Item>
                </Col>
                <Col xs={12} md={4}>
                    <Form.Item
                        name={'unitPrice'}
                        label={t('fields.unit_price')}
                        rules={[{ required: true, message: t('validation.required') }]}
                    >
                        <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>
                </Col>
                <Col xs={24} md={3}>
                    <Form.Item label={' '}>
                        <Button block htmlType={'submit'} loading={pending}>
                            {t('workshop.add_item')}
                        </Button>
                    </Form.Item>
                </Col>
            </Row>
        </Form>
    )
}

export default ItemForm
