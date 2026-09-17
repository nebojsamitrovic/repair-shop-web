import { CheckCircleFilled } from '@ant-design/icons'
import {
    Alert,
    Button,
    Card,
    Descriptions,
    Flex,
    Form,
    Input,
    Skeleton,
    Table,
    Typography,
    type TableProps,
} from 'antd'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'

import type { ServicePart } from 'api/types'
import { ErrorBlock } from 'components'
import { useMutation, useQuery } from 'hooks'
import { isLanguage, setLanguage } from 'lang'
import useEnumLabel from 'lang/useEnumLabel'
import { formatDateTime, formatMoney, formatNumber } from 'utils/format'
import { publicQuoteApi } from '../utils'

/**
 * What the customer opens from the email: the quote, and one button. No account, no menu — the
 * token in the address is the whole credential, and this page is in the language the quote was
 * written for.
 */
const PublicQuote = () => {
    const { t } = useTranslation()
    const enumLabel = useEnumLabel()
    const { token = '' } = useParams()
    const [form] = Form.useForm<{ name?: string }>()

    const quote = useQuery({
        queryKey: ['public-quote', token],
        queryFn: async () => await publicQuoteApi.get(token),
        retry: false,
    })
    const approve = useMutation({
        mutationFn: async (name?: string) => await publicQuoteApi.approve(token, name),
    })
    const data = approve.data ?? quote.data

    useEffect(() => {
        if (data?.language && isLanguage(data.language)) setLanguage(data.language)
    }, [data?.language])

    const columns: TableProps<ServicePart>['columns'] = [
        { title: t('fields.item'), dataIndex: 'description' },
        { title: t('fields.quantity'), dataIndex: 'quantity', width: 80, align: 'right', render: formatNumber },
        {
            title: t('fields.unit_price'),
            dataIndex: 'unitPrice',
            width: 130,
            align: 'right',
            render: (value: number) => formatMoney(value, data?.currency),
        },
        {
            title: t('fields.amount'),
            dataIndex: 'amount',
            width: 130,
            align: 'right',
            render: (value: number) => formatMoney(value, data?.currency),
        },
    ]

    return (
        <div style={{ minHeight: '100vh', padding: '32px 16px' }}>
            <div style={{ maxWidth: 720, margin: '0 auto' }}>
                {quote.error ? (
                    <Card>
                        <ErrorBlock error={quote.error} />
                    </Card>
                ) : !data ? (
                    <Card>
                        <Skeleton active />
                    </Card>
                ) : (
                    <Card>
                        <Flex vertical gap={4} style={{ marginBottom: 20 }}>
                            <Typography.Title level={3} style={{ margin: 0 }}>
                                {data.garageName}
                            </Typography.Title>
                            <Typography.Text type={'secondary'}>
                                {[data.garagePhone, data.garageEmail].filter(Boolean).join(' · ')}
                            </Typography.Text>
                        </Flex>

                        <Typography.Title level={4} style={{ marginTop: 0 }}>
                            {t('quote.public_title', { reference: data.reference })}
                        </Typography.Title>
                        <Typography.Paragraph>
                            {t('quote.public_greeting', { name: data.customerName ?? '' })}
                        </Typography.Paragraph>

                        <Descriptions column={{ xs: 1, sm: 2 }} size={'small'} style={{ marginBottom: 16 }}>
                            <Descriptions.Item label={t('fields.vehicle')}>
                                {data.vehicleLabel} · {data.registrationPlate}
                            </Descriptions.Item>
                            <Descriptions.Item label={t('fields.type')}>
                                {enumLabel('service_type', data.type)}
                            </Descriptions.Item>
                            {data.mileage != null ? (
                                <Descriptions.Item label={t('fields.mileage')}>
                                    {formatNumber(data.mileage)} km
                                </Descriptions.Item>
                            ) : null}
                        </Descriptions>
                        {data.description ? (
                            <Typography.Paragraph style={{ whiteSpace: 'pre-wrap' }}>
                                {data.description}
                            </Typography.Paragraph>
                        ) : null}

                        {data.parts.length > 0 ? (
                            <Table<ServicePart>
                                rowKey={(_, index) => String(index)}
                                size={'small'}
                                pagination={false}
                                dataSource={data.parts}
                                columns={columns}
                                style={{ marginBottom: 16 }}
                            />
                        ) : null}

                        <Descriptions column={1} size={'small'} bordered style={{ marginBottom: 24 }}>
                            <Descriptions.Item label={t('workshop.parts_total')}>
                                {formatMoney(data.partsTotal, data.currency)}
                            </Descriptions.Item>
                            <Descriptions.Item label={t('workshop.labour')}>
                                {data.labour.pricingMode === 'FIXED'
                                    ? formatMoney(data.labour.cost, data.currency)
                                    : data.labour.hours
                                      ? `${formatNumber(data.labour.hours)} h × ${formatMoney(data.labour.rate, data.currency)} = ${formatMoney(data.labour.cost, data.currency)}`
                                      : t('quote.labour_open')}
                            </Descriptions.Item>
                            <Descriptions.Item label={<strong>{t('fields.total')}</strong>}>
                                <strong>{formatMoney(data.total, data.currency)}</strong>
                            </Descriptions.Item>
                        </Descriptions>

                        {data.approval ? (
                            <Alert
                                type={'success'}
                                showIcon
                                icon={<CheckCircleFilled />}
                                message={t('quote.approved_title')}
                                description={t('quote.approved_text', {
                                    by: data.approval.approvedBy,
                                    at: formatDateTime(data.approval.approvedAt),
                                    total: formatMoney(data.approval.approvedTotal, data.currency),
                                })}
                            />
                        ) : data.canApprove ? (
                            <Form form={form} layout={'inline'} onFinish={({ name }) => approve.mutate(name)}>
                                <Form.Item name={'name'} style={{ flex: 1, minWidth: 200 }}>
                                    <Input placeholder={t('quote.your_name')} maxLength={255} />
                                </Form.Item>
                                <Form.Item>
                                    <Button
                                        type={'primary'}
                                        size={'large'}
                                        htmlType={'submit'}
                                        loading={approve.isPending}
                                    >
                                        {t('quote.approve')}
                                    </Button>
                                </Form.Item>
                            </Form>
                        ) : (
                            <Alert type={'info'} showIcon message={t('quote.closed')} />
                        )}
                        {approve.error ? (
                            <div style={{ marginTop: 16 }}>
                                <ErrorBlock error={approve.error} />
                            </div>
                        ) : null}
                    </Card>
                )}
            </div>
        </div>
    )
}

export default PublicQuote
