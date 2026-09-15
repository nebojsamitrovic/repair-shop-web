import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, Flex, Input, InputNumber, Typography } from 'antd'
import { useTranslation } from 'react-i18next'

import type { ServicePartRequest } from 'api/types'
import { palette } from 'theme'
import { formatMoney } from 'utils/format'

interface Props {
    /** Optional so the editor also works as an antd Form.Item child, which injects both. */
    value?: ServicePartRequest[]
    onChange?: (parts: ServicePartRequest[]) => void
    currency: string
    disabled?: boolean
}

/**
 * Part — quantity — price each, one row per line, added and removed with + and −. The row's amount
 * and the total are shown as the desk types, but the backend computes them again and its figure
 * is the one that counts.
 */
const PartsEditor = ({ value = [], onChange = () => {}, currency, disabled = false }: Props) => {
    const { t } = useTranslation()

    const update = (index: number, patch: Partial<ServicePartRequest>) =>
        onChange(value.map((part, i) => (i === index ? { ...part, ...patch } : part)))
    const remove = (index: number) => onChange(value.filter((_, i) => i !== index))
    const add = () => onChange([...value, { description: '', quantity: 1, unitPrice: 0 }])

    const amount = (part: ServicePartRequest) => (Number(part.quantity) || 0) * (Number(part.unitPrice) || 0)
    const total = value.reduce((sum, part) => sum + amount(part), 0)

    return (
        <Flex vertical gap={8}>
            <Flex gap={8} style={{ fontSize: 12, color: palette.textTertiary, paddingInline: 4 }}>
                <span style={{ flex: 1 }}>{t('fields.part')}</span>
                <span style={{ width: 90 }}>{t('fields.quantity')}</span>
                <span style={{ width: 120 }}>{t('fields.unit_price')}</span>
                <span style={{ width: 110, textAlign: 'right' }}>{t('fields.amount')}</span>
                <span style={{ width: 32 }} />
            </Flex>

            {value.length === 0 ? (
                <Typography.Text type={'secondary'} style={{ paddingInline: 4 }}>
                    {t('workshop.no_parts')}
                </Typography.Text>
            ) : null}

            {value.map((part, index) => (
                <Flex key={index} gap={8} align={'center'}>
                    <Input
                        style={{ flex: 1 }}
                        value={part.description}
                        disabled={disabled}
                        placeholder={t('fields.part')}
                        maxLength={255}
                        onChange={(event) => update(index, { description: event.target.value })}
                    />
                    <InputNumber
                        style={{ width: 90 }}
                        min={0.01}
                        step={1}
                        value={part.quantity}
                        disabled={disabled}
                        onChange={(quantity) => update(index, { quantity: quantity ?? 1 })}
                    />
                    <InputNumber
                        style={{ width: 120 }}
                        min={0}
                        step={0.5}
                        value={part.unitPrice}
                        disabled={disabled}
                        onChange={(unitPrice) => update(index, { unitPrice: unitPrice ?? 0 })}
                    />
                    <Typography.Text style={{ width: 110, textAlign: 'right' }}>
                        {formatMoney(amount(part), currency)}
                    </Typography.Text>
                    <Button
                        type={'text'}
                        danger
                        disabled={disabled}
                        icon={<MinusCircleOutlined />}
                        aria-label={t('actions.remove')}
                        onClick={() => remove(index)}
                        style={{ width: 32 }}
                    />
                </Flex>
            ))}

            <Flex justify={'space-between'} align={'center'}>
                <Button type={'dashed'} icon={<PlusOutlined />} disabled={disabled} onClick={add}>
                    {t('workshop.add_part')}
                </Button>
                <Typography.Text strong>
                    {t('workshop.parts_total')}: {formatMoney(total, currency)}
                </Typography.Text>
            </Flex>
        </Flex>
    )
}

export default PartsEditor
