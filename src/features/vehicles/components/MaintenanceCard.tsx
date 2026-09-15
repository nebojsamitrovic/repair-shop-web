import { Alert, Card, Descriptions, Tag, Typography } from 'antd'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'

import type { Maintenance, ServiceReminder } from 'api/types'
import useEnumLabel from 'lang/useEnumLabel'
import { formatDate, formatDateTime, formatNumber } from 'utils/format'

interface Props {
    maintenance: Maintenance
    reminders: ServiceReminder[]
    annualMileage?: number | null
}

const km = (value?: number | null) => (value == null ? '—' : `${formatNumber(value)} km`)

/**
 * Where the car stands and what it is expected to need next: the garage's intervals past the
 * last service, on the day the odometer is expected to get there at the customer's yearly distance.
 */
const MaintenanceCard = ({ maintenance, reminders, annualMileage }: Props) => {
    const { t } = useTranslation()
    const enumLabel = useEnumLabel()

    const dueSoon = maintenance.nextDueOn ? dayjs(maintenance.nextDueOn).diff(dayjs(), 'day') <= 30 : false

    return (
        <Card title={t('vehicles.maintenance.title')}>
            {!maintenance.nextDueType ? (
                <Alert
                    type={'info'}
                    showIcon
                    message={t('vehicles.maintenance.no_history')}
                    style={{ marginBottom: 16 }}
                />
            ) : (
                <Alert
                    type={dueSoon ? 'warning' : 'success'}
                    showIcon
                    style={{ marginBottom: 16 }}
                    message={t('vehicles.maintenance.next', {
                        type: enumLabel('service_type', maintenance.nextDueType),
                        km: formatNumber(maintenance.nextDueKm ?? 0),
                    })}
                    description={
                        maintenance.nextDueOn
                            ? t('vehicles.maintenance.expected', { date: formatDate(maintenance.nextDueOn) })
                            : t('vehicles.maintenance.no_date')
                    }
                />
            )}

            <Descriptions column={2} size={'small'} bordered>
                <Descriptions.Item label={t('fields.annual_mileage')}>{km(annualMileage)}</Descriptions.Item>
                <Descriptions.Item label={t('vehicles.maintenance.intervals')}>
                    {km(maintenance.smallServiceIntervalKm)} / {km(maintenance.bigServiceIntervalKm)}
                </Descriptions.Item>
                <Descriptions.Item label={t('vehicles.maintenance.last_small')}>
                    {km(maintenance.lastSmallServiceKm)}
                    {maintenance.lastSmallServiceAt ? (
                        <Typography.Text type={'secondary'}>
                            {' '}
                            · {formatDate(maintenance.lastSmallServiceAt)}
                        </Typography.Text>
                    ) : null}
                </Descriptions.Item>
                <Descriptions.Item label={t('vehicles.maintenance.last_big')}>
                    {km(maintenance.lastBigServiceKm)}
                    {maintenance.lastBigServiceAt ? (
                        <Typography.Text type={'secondary'}>
                            {' '}
                            · {formatDate(maintenance.lastBigServiceAt)}
                        </Typography.Text>
                    ) : null}
                </Descriptions.Item>
                <Descriptions.Item label={t('vehicles.maintenance.next_small')}>
                    {km(maintenance.nextSmallServiceKm)}
                    {maintenance.expectedSmallOn ? (
                        <Typography.Text type={'secondary'}>
                            {' '}
                            · {formatDate(maintenance.expectedSmallOn)}
                        </Typography.Text>
                    ) : null}
                </Descriptions.Item>
                <Descriptions.Item label={t('vehicles.maintenance.next_big')}>
                    {km(maintenance.nextBigServiceKm)}
                    {maintenance.expectedBigOn ? (
                        <Typography.Text type={'secondary'}> · {formatDate(maintenance.expectedBigOn)}</Typography.Text>
                    ) : null}
                </Descriptions.Item>
            </Descriptions>

            <Typography.Title level={5} style={{ marginTop: 20 }}>
                {t('vehicles.maintenance.reminders')}
            </Typography.Title>
            {reminders.length === 0 ? (
                <Typography.Text type={'secondary'}>{t('vehicles.maintenance.no_reminders')}</Typography.Text>
            ) : (
                reminders.map((reminder) => (
                    <div key={reminder.id} style={{ marginBottom: 6 }}>
                        <Tag>{enumLabel('service_type', reminder.serviceType)}</Tag>
                        {km(reminder.dueAtMileage)} · {formatDate(reminder.expectedOn)}
                        <Typography.Text type={'secondary'}>
                            {' '}
                            — {t('vehicles.maintenance.sent_at', { date: formatDateTime(reminder.sentAt) })}
                        </Typography.Text>
                    </div>
                ))
            )}
        </Card>
    )
}

export default MaintenanceCard
