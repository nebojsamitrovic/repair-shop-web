import { PrinterOutlined } from '@ant-design/icons'
import { App, Button, Descriptions, Divider, Drawer, Dropdown, Flex, Skeleton, Tag, Typography } from 'antd'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import type { ServiceOrderStatus, ServicePart, ServicePartRequest, UpdateServiceOrderRequest } from 'api/types'
import { ErrorBlock, ProtectedComponent } from 'components'
import { LANGUAGES } from 'lang'
import useEnumLabel from 'lang/useEnumLabel'
import { pathTo, Routes } from 'routes/config'
import { formatDateTime, formatMoney, formatNumber } from 'utils/format'
import useServiceOrderQuery from '../hooks/useServiceOrderQuery'
import useWorkshopMutation from '../hooks/useWorkshopMutation'
import { workshopApi } from '../utils/api'
import AttachmentsSection from './AttachmentsSection'
import LabourCard from './LabourCard'
import PartsEditor from './PartsEditor'
import ReasonModal from './ReasonModal'

interface Props {
    orderId?: string
    onClose: () => void
}

const statusColor: Record<ServiceOrderStatus, string> = {
    OPEN: 'blue',
    IN_PROGRESS: 'gold',
    DONE: 'green',
    CANCELLED: 'default',
}

const strip = (parts: ServicePart[]): ServicePartRequest[] =>
    parts.map(({ description, quantity, unitPrice }) => ({ description, quantity, unitPrice }))

interface PartsSectionProps {
    parts: ServicePart[]
    currency: string
    editable: boolean
    pending: boolean
    onSave: (parts: ServicePartRequest[]) => void
}

/** The editor holds a copy; what the backend has is the truth until Save. */
const PartsSection = ({ parts, currency, editable, pending, onSave }: PartsSectionProps) => {
    const { t } = useTranslation()
    const [draft, setDraft] = useState<ServicePartRequest[]>(() => strip(parts))
    const dirty = JSON.stringify(draft) !== JSON.stringify(strip(parts))

    return (
        <>
            <PartsEditor value={draft} onChange={setDraft} currency={currency} disabled={!editable} />
            {editable ? (
                <ProtectedComponent permission={'service:update'}>
                    <Flex justify={'flex-end'} style={{ marginTop: 12 }}>
                        <Button
                            type={'primary'}
                            disabled={!dirty}
                            loading={pending}
                            onClick={() => onSave(draft.filter((part) => part.description.trim().length > 0))}
                        >
                            {t('workshop.save_parts')}
                        </Button>
                    </Flex>
                </ProtectedComponent>
            ) : null}
        </>
    )
}

/** One order: the work priced, the parts, the files, the quote — and what it may do next. */
const ServiceOrderDrawer = ({ orderId, onClose }: Props) => {
    const { t } = useTranslation()
    const enumLabel = useEnumLabel()
    const { message } = App.useApp()
    const [asking, setAsking] = useState<{ title: string; confirm: (reason: string) => void }>()
    const [printing, setPrinting] = useState(false)

    const order = useServiceOrderQuery(orderId)
    const detail = order.data
    const editable = detail ? detail.summary.status === 'OPEN' || detail.summary.status === 'IN_PROGRESS' : false

    const changeStatus = useWorkshopMutation(
        async ({ status, reason }: { status: ServiceOrderStatus; reason?: string }) =>
            await workshopApi.changeStatus(orderId as string, status, reason),
        'workshop.status_changed'
    )
    const update = useWorkshopMutation(
        async (body: UpdateServiceOrderRequest) => await workshopApi.update(orderId as string, body),
        'workshop.saved'
    )

    /* The PDF opens in a tab; the browser's own viewer prints it. */
    const printQuote = async (lang?: string) => {
        setPrinting(true)
        try {
            const blob = await workshopApi.quote(orderId as string, lang)
            window.open(URL.createObjectURL(blob), '_blank', 'noopener')
        } catch (error) {
            message.error(error instanceof Error ? error.message : String(error))
        } finally {
            setPrinting(false)
        }
    }

    return (
        <Drawer
            open={Boolean(orderId)}
            onClose={onClose}
            width={820}
            title={
                detail ? (
                    <Flex align={'center'} gap={12}>
                        {enumLabel('service_type', detail.summary.type)}
                        <Tag color={statusColor[detail.summary.status]}>
                            {enumLabel('service_order_status', detail.summary.status)}
                        </Tag>
                    </Flex>
                ) : (
                    t('workshop.order')
                )
            }
            extra={
                detail ? (
                    <Flex gap={8}>
                        <Dropdown
                            menu={{
                                items: LANGUAGES.map((language) => ({
                                    key: language,
                                    label: t(`language.${language}`),
                                    onClick: () => void printQuote(language),
                                })),
                            }}
                        >
                            <Button icon={<PrinterOutlined />} loading={printing} onClick={() => void printQuote()}>
                                {t('workshop.print_quote')}
                            </Button>
                        </Dropdown>
                        {detail.allowedTransitions.map((target) => (
                            <ProtectedComponent
                                key={target}
                                permission={target === 'IN_PROGRESS' ? 'service:update' : 'service:close'}
                            >
                                <Button
                                    type={target === 'DONE' ? 'primary' : 'default'}
                                    danger={target === 'CANCELLED'}
                                    loading={changeStatus.isPending}
                                    onClick={() =>
                                        target === 'CANCELLED'
                                            ? setAsking({
                                                  title: t('workshop.confirm_cancel'),
                                                  confirm: (reason) => changeStatus.mutate({ status: target, reason }),
                                              })
                                            : changeStatus.mutate({ status: target })
                                    }
                                >
                                    {t(`workshop.transition.${target}`)}
                                </Button>
                            </ProtectedComponent>
                        ))}
                    </Flex>
                ) : null
            }
        >
            {order.error ? <ErrorBlock error={order.error} /> : null}
            {order.isLoading || !detail ? (
                <Skeleton active />
            ) : (
                <>
                    <Descriptions column={2} size={'small'} bordered>
                        <Descriptions.Item label={t('fields.vehicle')}>
                            <Link to={pathTo(Routes.Vehicle, { vehicleId: detail.summary.vehicleId })}>
                                {detail.summary.vehicleLabel ?? '—'}
                            </Link>{' '}
                            <Tag style={{ fontFamily: 'monospace' }}>{detail.summary.registrationPlate}</Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label={t('fields.customer')}>
                            {detail.summary.customerId ? (
                                <Link to={pathTo(Routes.Customer, { customerId: detail.summary.customerId })}>
                                    {detail.summary.customerName ?? '—'}
                                </Link>
                            ) : (
                                '—'
                            )}
                        </Descriptions.Item>
                        <Descriptions.Item label={t('fields.mechanic')}>
                            {detail.summary.mechanicName ?? '—'}
                        </Descriptions.Item>
                        <Descriptions.Item label={t('fields.location')}>
                            {detail.summary.locationName ?? '—'}
                        </Descriptions.Item>
                        <Descriptions.Item label={t('fields.mileage')}>
                            {detail.summary.mileage == null ? '—' : `${formatNumber(detail.summary.mileage)} km`}
                        </Descriptions.Item>
                        <Descriptions.Item label={t('fields.annual_mileage')}>
                            {detail.annualMileage == null ? '—' : `${formatNumber(detail.annualMileage)} km`}
                        </Descriptions.Item>
                        <Descriptions.Item label={t('fields.opened_at')}>
                            {formatDateTime(detail.summary.openedAt)}
                        </Descriptions.Item>
                        <Descriptions.Item label={t('fields.closed_at')}>
                            {formatDateTime(detail.summary.closedAt)}
                        </Descriptions.Item>
                        {detail.summary.description ? (
                            <Descriptions.Item label={t('fields.description')} span={2}>
                                {detail.summary.description}
                            </Descriptions.Item>
                        ) : null}
                        {detail.closingNote ? (
                            <Descriptions.Item label={t('fields.closing_note')} span={2}>
                                {detail.closingNote}
                            </Descriptions.Item>
                        ) : null}
                    </Descriptions>

                    <Divider titlePlacement={'start'} style={{ marginTop: 28 }}>
                        {t('workshop.labour')}
                    </Divider>
                    <LabourCard
                        labour={detail.labour}
                        editable={editable}
                        pending={update.isPending}
                        onSave={(values) => update.mutate(values)}
                    />

                    <Divider titlePlacement={'start'} style={{ marginTop: 20 }}>
                        {t('workshop.parts')}
                    </Divider>
                    {/* Keyed by what the backend has, so a save or a refetch starts the editor over from the truth. */}
                    <PartsSection
                        key={JSON.stringify(detail.parts)}
                        parts={detail.parts}
                        currency={detail.summary.currency}
                        editable={editable}
                        pending={update.isPending}
                        onSave={(parts) => update.mutate({ parts })}
                    />

                    <Flex justify={'flex-end'} gap={24} style={{ marginTop: 16 }}>
                        <Typography.Text type={'secondary'}>
                            {t('workshop.labour')}: {formatMoney(detail.labour.cost, detail.summary.currency)}
                        </Typography.Text>
                        <Typography.Text type={'secondary'}>
                            {t('workshop.parts_total')}: {formatMoney(detail.partsTotal, detail.summary.currency)}
                        </Typography.Text>
                        <Typography.Text strong>
                            {t('fields.total')}: {formatMoney(detail.summary.total, detail.summary.currency)}
                        </Typography.Text>
                    </Flex>

                    <Divider titlePlacement={'start'} style={{ marginTop: 20 }}>
                        {t('attachments.title')}
                    </Divider>
                    <AttachmentsSection
                        orderId={detail.summary.id}
                        attachments={detail.attachments}
                        editable={editable}
                    />
                </>
            )}

            {asking ? (
                <ReasonModal
                    title={asking.title}
                    pending={changeStatus.isPending}
                    onCancel={() => setAsking(undefined)}
                    onConfirm={(reason) => {
                        asking.confirm(reason)
                        setAsking(undefined)
                    }}
                />
            ) : null}
        </Drawer>
    )
}

export default ServiceOrderDrawer
