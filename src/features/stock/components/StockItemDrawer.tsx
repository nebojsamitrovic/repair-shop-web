import { useQueryClient } from '@tanstack/react-query'
import { App, Button, Col, Drawer, Flex, Form, Input, InputNumber, Row, Select } from 'antd'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { STOCK_CONDITIONS, type CreateStockItemRequest, type StockItem } from 'api/types'
import { ErrorBlock } from 'components'
import { useDirectory, useMutation } from 'hooks'
import useEnumLabel from 'lang/useEnumLabel'
import { stockApi, stockKeys } from '../utils/api'

interface Props {
    open: boolean
    /** Set to describe or reprice an existing part; the quantity is changed by receiving or counting. */
    item?: StockItem
    onClose: () => void
}

const StockItemDrawer = ({ open, item, onClose }: Props) => {
    const { t } = useTranslation()
    const enumLabel = useEnumLabel()
    const { message } = App.useApp()
    const queryClient = useQueryClient()
    const [form] = Form.useForm<CreateStockItemRequest>()
    const { locations } = useDirectory()

    const save = useMutation({
        mutationFn: async ({ quantity, ...values }: CreateStockItemRequest) =>
            item ? await stockApi.update(item.id, values) : await stockApi.create({ ...values, quantity }),
        onSuccess: async () => {
            message.success(t(item ? 'stock.updated' : 'stock.created'))
            await queryClient.invalidateQueries({ queryKey: stockKeys.all })
            onClose()
        },
    })

    useEffect(() => {
        if (!open) return
        form.resetFields()
        if (item) {
            form.setFieldsValue({
                name: item.name,
                partNumber: item.partNumber ?? undefined,
                fits: item.fits ?? undefined,
                condition: item.condition,
                unitCost: item.unitCost ?? undefined,
                unitPrice: item.unitPrice,
                source: item.source ?? undefined,
                note: item.note ?? undefined,
                locationId: item.locationId ?? undefined,
            })
            return
        }
        form.setFieldsValue({ condition: 'USED', quantity: 1, unitPrice: 0 })
    }, [open, item, form])

    const close = () => {
        save.reset()
        onClose()
    }

    return (
        <Drawer
            open={open}
            onClose={close}
            width={640}
            title={t(item ? 'stock.edit' : 'stock.add')}
            footer={
                <Flex gap={8} justify={'flex-end'}>
                    <Button onClick={close}>{t('actions.cancel')}</Button>
                    <Button type={'primary'} loading={save.isPending} onClick={() => form.submit()}>
                        {t('actions.save')}
                    </Button>
                </Flex>
            }
        >
            {save.error ? (
                <div style={{ marginBottom: 16 }}>
                    <ErrorBlock error={save.error} />
                </div>
            ) : null}
            <Form<CreateStockItemRequest>
                form={form}
                layout={'vertical'}
                requiredMark={false}
                onFinish={(values) => save.mutate(values)}
            >
                <Form.Item
                    name={'name'}
                    label={t('fields.part')}
                    rules={[{ required: true, message: t('validation.required') }]}
                >
                    <Input maxLength={255} placeholder={t('stock.name_placeholder')} />
                </Form.Item>
                <Row gutter={12}>
                    <Col xs={24} md={12}>
                        <Form.Item name={'partNumber'} label={t('fields.part_number')}>
                            <Input maxLength={64} />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                        <Form.Item name={'condition'} label={t('fields.condition')}>
                            <Select
                                options={STOCK_CONDITIONS.map((condition) => ({
                                    value: condition,
                                    label: enumLabel('stock_condition', condition),
                                }))}
                            />
                        </Form.Item>
                    </Col>
                </Row>
                <Form.Item name={'fits'} label={t('fields.fits')} extra={t('stock.fits_hint')}>
                    <Input maxLength={255} placeholder={'Golf V 1.9 TDI 2004–2008'} />
                </Form.Item>
                <Row gutter={12}>
                    {item ? null : (
                        <Col xs={8}>
                            <Form.Item name={'quantity'} label={t('fields.quantity')}>
                                <InputNumber min={0} style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                    )}
                    <Col xs={8}>
                        <Form.Item name={'unitCost'} label={t('fields.unit_cost')}>
                            <InputNumber min={0} step={0.5} style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>
                    <Col xs={8}>
                        <Form.Item
                            name={'unitPrice'}
                            label={t('fields.unit_price')}
                            rules={[{ required: true, message: t('validation.required') }]}
                        >
                            <InputNumber min={0} step={0.5} style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>
                </Row>
                <Form.Item name={'source'} label={t('fields.source')}>
                    <Input maxLength={2000} placeholder={t('stock.source_placeholder')} />
                </Form.Item>
                {locations.length > 1 ? (
                    <Form.Item name={'locationId'} label={t('fields.location')}>
                        <Select
                            allowClear
                            options={locations.map((location) => ({ value: location.id, label: location.name }))}
                        />
                    </Form.Item>
                ) : null}
                <Form.Item name={'note'} label={t('fields.note')}>
                    <Input.TextArea rows={2} maxLength={2000} />
                </Form.Item>
            </Form>
        </Drawer>
    )
}

export default StockItemDrawer
