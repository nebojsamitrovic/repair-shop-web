import { MailOutlined, PrinterOutlined } from '@ant-design/icons'
import { App, Button, Card, Dropdown, Empty, Flex, Skeleton, Statistic, Table, Tag, type TableProps } from 'antd'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { SendDocumentRequest, ServiceBookEntry } from 'api/types'
import { ErrorBlock } from 'components'
import SendDocumentModal from 'features/workshop/components/SendDocumentModal'
import { useMutation, useQuery } from 'hooks'
import { LANGUAGES } from 'lang'
import useEnumLabel from 'lang/useEnumLabel'
import { formatDate, formatMoney, formatNumber } from 'utils/format'
import { vehicleKeys, vehiclesApi } from '../utils/api'

interface Props {
    vehicleId: string
    /** Shown as the address the book goes to when the desk types none. */
    customerEmail?: string | null
    onOpenOrder: (orderId: string) => void
}

/**
 * The car's service book: everything this garage has finished on it, what each job came to, and
 * what the customer has spent here.
 *
 * <p>Open orders are not in it. A service book is a record of work done — it is the document a
 * customer shows the next buyer — and work still on the ramp is not that yet.
 */
const ServiceBookCard = ({ vehicleId, customerEmail, onOpenOrder }: Props) => {
    const { t } = useTranslation()
    const enumLabel = useEnumLabel()
    const { message } = App.useApp()
    const [printing, setPrinting] = useState(false)
    const [sending, setSending] = useState(false)

    const book = useQuery({
        queryKey: vehicleKeys.serviceBook(vehicleId),
        queryFn: async () => await vehiclesApi.serviceBook(vehicleId),
    })

    const print = async (lang?: string) => {
        setPrinting(true)
        try {
            const blob = await vehiclesApi.serviceBookPdf(vehicleId, lang)
            window.open(URL.createObjectURL(blob), '_blank', 'noopener')
        } catch (error) {
            message.error(error instanceof Error ? error.message : String(error))
        } finally {
            setPrinting(false)
        }
    }

    const send = useMutation({
        mutationFn: async (body: SendDocumentRequest) => await vehiclesApi.emailServiceBook(vehicleId, body),
        onSuccess: (sent) => {
            message.success(t('documents.sent', { recipient: sent.recipient }))
            setSending(false)
        },
        onError: (error) => message.error(error.message),
    })

    const columns: TableProps<ServiceBookEntry>['columns'] = [
        { title: t('fields.date'), dataIndex: 'on', width: 120, render: formatDate },
        {
            title: t('fields.type'),
            dataIndex: 'type',
            width: 140,
            render: (type: string) => <Tag>{enumLabel('service_type', type)}</Tag>,
        },
        {
            title: t('fields.mileage'),
            dataIndex: 'mileage',
            width: 110,
            align: 'right',
            render: (mileage?: number | null) => (mileage == null ? '—' : `${formatNumber(mileage)} km`),
        },
        {
            title: t('fields.description'),
            dataIndex: 'description',
            render: (description: string | null, row) => description ?? row.closingNote ?? '—',
        },
        { title: t('fields.mechanic'), dataIndex: 'mechanicName', width: 150, render: (name?: string) => name ?? '—' },
        {
            title: t('fields.total'),
            dataIndex: 'total',
            width: 120,
            align: 'right',
            render: (total: number) => formatMoney(total, book.data?.currency ?? 'EUR'),
        },
    ]

    return (
        <Card
            title={t('vehicles.service_book')}
            extra={
                <Flex gap={8}>
                    <Dropdown
                        menu={{
                            items: LANGUAGES.map((language) => ({
                                key: language,
                                label: t(`language.${language}`),
                                onClick: () => void print(language),
                            })),
                        }}
                    >
                        <Button icon={<PrinterOutlined />} loading={printing} onClick={() => void print()}>
                            {t('actions.print')}
                        </Button>
                    </Dropdown>
                    <Button icon={<MailOutlined />} onClick={() => setSending(true)}>
                        {t('actions.send_email')}
                    </Button>
                </Flex>
            }
        >
            {book.error ? <ErrorBlock error={book.error} /> : null}
            {book.isLoading || !book.data ? (
                <Skeleton active />
            ) : book.data.serviceCount === 0 ? (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t('vehicles.book_empty')} />
            ) : (
                <>
                    <Flex gap={40} wrap style={{ marginBottom: 16 }}>
                        <Statistic title={t('vehicles.jobs_done')} value={book.data.serviceCount} />
                        <Statistic
                            title={t('vehicles.total_spent')}
                            value={formatMoney(book.data.totalSpent, book.data.currency)}
                        />
                        <Statistic
                            title={t('vehicles.last_service')}
                            value={book.data.lastServiceOn ? formatDate(book.data.lastServiceOn) : '—'}
                        />
                    </Flex>
                    <Table<ServiceBookEntry>
                        rowKey={'orderId'}
                        size={'small'}
                        dataSource={book.data.entries}
                        columns={columns}
                        pagination={false}
                        onRow={(row) => ({
                            onClick: () => onOpenOrder(row.orderId),
                            style: { cursor: 'pointer' },
                        })}
                    />
                </>
            )}

            <SendDocumentModal
                open={sending}
                title={t('documents.send_title', { document: t('vehicles.service_book') })}
                defaultRecipient={customerEmail}
                pending={send.isPending}
                onCancel={() => setSending(false)}
                onSend={(body) => send.mutate(body)}
            />
        </Card>
    )
}

export default ServiceBookCard
