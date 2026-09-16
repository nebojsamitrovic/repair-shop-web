import { useQueryClient } from '@tanstack/react-query'
import { App, Form, Input, InputNumber, Modal, Typography } from 'antd'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import type { StockItem } from 'api/types'
import { ErrorBlock } from 'components'
import { useMutation } from 'hooks'
import { formatNumber } from 'utils/format'
import { stockApi, stockKeys } from '../utils/api'

export type QuantityAction = 'receive' | 'count'

interface Props {
    item?: StockItem
    action: QuantityAction
    onClose: () => void
}

interface QuantityForm {
    quantity: number
    unitCost?: number
    note?: string
}

/** Two ways the number changes by hand: more came in, or somebody counted the shelf. */
const QuantityModal = ({ item, action, onClose }: Props) => {
    const { t } = useTranslation()
    const { message } = App.useApp()
    const queryClient = useQueryClient()
    const [form] = Form.useForm<QuantityForm>()

    const save = useMutation({
        mutationFn: async ({ quantity, unitCost, note }: QuantityForm) =>
            action === 'receive'
                ? await stockApi.receive(item?.id ?? '', { quantity, unitCost, note })
                : await stockApi.count(item?.id ?? '', { counted: quantity, note }),
        onSuccess: async () => {
            message.success(t('stock.updated'))
            await queryClient.invalidateQueries({ queryKey: stockKeys.all })
            onClose()
        },
    })

    useEffect(() => {
        if (!item) return
        form.resetFields()
        form.setFieldsValue(
            action === 'receive' ? { quantity: 1, unitCost: item.unitCost ?? undefined } : { quantity: item.quantity }
        )
    }, [item, action, form])

    const close = () => {
        save.reset()
        onClose()
    }

    return (
        <Modal
            open={Boolean(item)}
            title={t(action === 'receive' ? 'stock.receive' : 'stock.count')}
            okText={t('actions.save')}
            cancelText={t('actions.cancel')}
            confirmLoading={save.isPending}
            onCancel={close}
            onOk={() => form.submit()}
        >
            {save.error ? (
                <div style={{ marginBottom: 16 }}>
                    <ErrorBlock error={save.error} />
                </div>
            ) : null}
            <Typography.Paragraph type={'secondary'}>
                {item?.name} · {t('stock.on_shelf', { quantity: formatNumber(item?.quantity ?? 0) })}
            </Typography.Paragraph>
            <Form<QuantityForm>
                form={form}
                layout={'vertical'}
                requiredMark={false}
                onFinish={(values) => save.mutate(values)}
            >
                <Form.Item
                    name={'quantity'}
                    label={t(action === 'receive' ? 'stock.received_quantity' : 'stock.counted_quantity')}
                    rules={[{ required: true, message: t('validation.required') }]}
                >
                    <InputNumber min={action === 'receive' ? 0.01 : 0} style={{ width: '100%' }} autoFocus />
                </Form.Item>
                {action === 'receive' ? (
                    <Form.Item name={'unitCost'} label={t('fields.unit_cost')} extra={t('stock.cost_hint')}>
                        <InputNumber min={0} step={0.5} style={{ width: '100%' }} />
                    </Form.Item>
                ) : null}
                <Form.Item name={'note'} label={t('fields.note')}>
                    <Input maxLength={2000} />
                </Form.Item>
            </Form>
        </Modal>
    )
}

export default QuantityModal
