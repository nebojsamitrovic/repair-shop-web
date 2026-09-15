import {
    BellOutlined,
    CalendarOutlined,
    CarOutlined,
    CheckCircleOutlined,
    EuroOutlined,
    TeamOutlined,
    ToolOutlined,
    WarningOutlined,
} from '@ant-design/icons'
import { Card, Col, Empty, Flex, List, Progress, Row, Skeleton, Tag, Typography } from 'antd'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'

import { SERVICE_TYPES, type ServiceOrderStatus } from 'api/types'
import { useSession } from 'auth/session'
import { ErrorBlock, PageHeader } from 'components'
import ServiceOrderDrawer from 'features/workshop/components/ServiceOrderDrawer'
import { useQuery } from 'hooks'
import useEnumLabel from 'lang/useEnumLabel'
import { pathTo, Routes } from 'routes/config'
import { palette } from 'theme'
import { formatDate, formatDateTime, formatMoney, formatNumber } from 'utils/format'
import OrdersByMonth from '../components/OrdersByMonth'
import StatTile from '../components/StatTile'
import { dashboardApi, dashboardKeys } from '../utils/api'

const statusColor: Record<ServiceOrderStatus, string> = {
    OPEN: 'blue',
    IN_PROGRESS: 'gold',
    DONE: 'green',
    CANCELLED: 'default',
}

/** The garage today: what is in, what was earned, who is about to be due, and what just came in. */
const Dashboard = () => {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const enumLabel = useEnumLabel()
    const { user } = useSession()
    const [openOrderId, setOpenOrderId] = useState<string>()

    const { data, isLoading, error } = useQuery({
        queryKey: dashboardKeys.all,
        queryFn: dashboardApi.get,
        refetchInterval: 60_000,
    })

    if (error) return <ErrorBlock error={error} />
    if (isLoading || !data) return <Skeleton active paragraph={{ rows: 8 }} />

    const { workshop, customers } = data
    const hour = new Date().getHours()
    const greeting = hour < 12 ? t('dashboard.morning') : hour < 18 ? t('dashboard.afternoon') : t('dashboard.evening')
    const typeTotal = Object.values(data.ordersByType).reduce((sum, count) => sum + (count ?? 0), 0)

    return (
        <>
            <PageHeader
                title={`${greeting}${user?.firstName ? `, ${user.firstName}` : ''}`}
                subtitle={t('dashboard.subtitle', {
                    garage: user?.tenant.name ?? '',
                    date: formatDate(new Date().toISOString()),
                })}
            />

            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} xl={6}>
                    <StatTile
                        icon={<ToolOutlined />}
                        tone={'accent'}
                        label={t('dashboard.in_the_shop')}
                        value={formatNumber(workshop.openOrders + workshop.inProgress)}
                        hint={t('dashboard.in_progress_hint', { count: workshop.inProgress })}
                        onClick={() => navigate(Routes.Workshop.path)}
                    />
                </Col>
                <Col xs={24} sm={12} xl={6}>
                    <StatTile
                        icon={<CheckCircleOutlined />}
                        tone={'success'}
                        label={t('dashboard.done_this_month')}
                        value={formatNumber(workshop.doneThisMonth)}
                        hint={t('dashboard.finished_orders')}
                    />
                </Col>
                <Col xs={24} sm={12} xl={6}>
                    <StatTile
                        icon={<EuroOutlined />}
                        tone={'success'}
                        label={t('dashboard.revenue_this_month')}
                        value={formatMoney(workshop.revenueThisMonth, workshop.currency)}
                        hint={t('dashboard.revenue_hint')}
                    />
                </Col>
                <Col xs={24} sm={12} xl={6}>
                    <StatTile
                        icon={<WarningOutlined />}
                        tone={customers.dueWithin30Days > 0 ? 'warning' : 'neutral'}
                        label={t('dashboard.due_soon')}
                        value={formatNumber(customers.dueWithin30Days)}
                        hint={t('dashboard.due_soon_hint')}
                        onClick={() => navigate(Routes.Vehicles.path)}
                    />
                </Col>

                <Col xs={24} xl={14}>
                    <Card
                        title={t('dashboard.orders_by_month')}
                        extra={<Typography.Text type={'secondary'}>{t('dashboard.last_six_months')}</Typography.Text>}
                    >
                        <OrdersByMonth months={data.ordersByMonth} currency={workshop.currency} />
                    </Card>
                </Col>
                <Col xs={24} xl={10}>
                    <Card title={t('dashboard.by_type')} style={{ height: '100%' }}>
                        {typeTotal === 0 ? (
                            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t('dashboard.nothing_yet')} />
                        ) : (
                            <Flex vertical gap={14}>
                                {SERVICE_TYPES.map((type) => {
                                    const count = data.ordersByType[type] ?? 0
                                    return (
                                        <div key={type}>
                                            <Flex justify={'space-between'}>
                                                <Typography.Text>{enumLabel('service_type', type)}</Typography.Text>
                                                <Typography.Text type={'secondary'}>
                                                    {t('dashboard.orders_count', { count })}
                                                </Typography.Text>
                                            </Flex>
                                            <Progress
                                                percent={Math.round((count / typeTotal) * 100)}
                                                showInfo={false}
                                                strokeColor={palette.accent}
                                                trailColor={palette.surfaceMuted}
                                                size={['100%', 8]}
                                            />
                                        </div>
                                    )
                                })}
                            </Flex>
                        )}
                        <Flex gap={24} style={{ marginTop: 20 }}>
                            <Flex vertical>
                                <Typography.Text type={'secondary'} style={{ fontSize: 12 }}>
                                    <TeamOutlined /> {t('nav.customers')}
                                </Typography.Text>
                                <Typography.Text strong style={{ fontSize: 18 }}>
                                    {formatNumber(customers.customers)}
                                </Typography.Text>
                            </Flex>
                            <Flex vertical>
                                <Typography.Text type={'secondary'} style={{ fontSize: 12 }}>
                                    <CarOutlined /> {t('nav.vehicles')}
                                </Typography.Text>
                                <Typography.Text strong style={{ fontSize: 18 }}>
                                    {formatNumber(customers.vehicles)}
                                </Typography.Text>
                            </Flex>
                            <Flex vertical>
                                <Typography.Text type={'secondary'} style={{ fontSize: 12 }}>
                                    <BellOutlined /> {t('dashboard.reminders_this_month')}
                                </Typography.Text>
                                <Typography.Text strong style={{ fontSize: 18 }}>
                                    {formatNumber(customers.remindersThisMonth)}
                                </Typography.Text>
                            </Flex>
                        </Flex>
                    </Card>
                </Col>

                <Col xs={24} xl={12}>
                    <Card
                        title={
                            <>
                                <CalendarOutlined /> {t('dashboard.coming_up')}
                            </>
                        }
                    >
                        <List
                            size={'small'}
                            dataSource={data.dueSoon}
                            locale={{ emptyText: t('dashboard.nobody_due') }}
                            renderItem={(due) => (
                                <List.Item>
                                    <Flex justify={'space-between'} align={'center'} style={{ width: '100%' }} gap={12}>
                                        <Flex vertical style={{ minWidth: 0 }}>
                                            <Link to={pathTo(Routes.Vehicle, { vehicleId: due.vehicleId })}>
                                                <Tag style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                                                    {due.registrationPlate}
                                                </Tag>
                                                {due.label}
                                            </Link>
                                            <Typography.Text type={'secondary'} style={{ fontSize: 12 }}>
                                                {due.customerName ?? '—'} · {enumLabel('service_type', due.type)} ·{' '}
                                                {formatNumber(due.atMileage)} km
                                            </Typography.Text>
                                        </Flex>
                                        <Tag
                                            color={due.daysLeft < 0 ? 'red' : due.daysLeft <= 30 ? 'orange' : 'default'}
                                            style={{ margin: 0 }}
                                        >
                                            {due.daysLeft < 0
                                                ? t('dashboard.overdue', { count: -due.daysLeft })
                                                : t('dashboard.in_days', { count: due.daysLeft })}{' '}
                                            · {formatDate(due.expectedOn)}
                                        </Tag>
                                    </Flex>
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>
                <Col xs={24} xl={12}>
                    <Card
                        title={
                            <>
                                <ToolOutlined /> {t('dashboard.recent_orders')}
                            </>
                        }
                        extra={<Link to={Routes.Workshop.path}>{t('dashboard.all_orders')}</Link>}
                    >
                        <List
                            size={'small'}
                            dataSource={data.recentOrders}
                            locale={{ emptyText: t('dashboard.nothing_yet') }}
                            renderItem={(order) => (
                                <List.Item style={{ cursor: 'pointer' }} onClick={() => setOpenOrderId(order.id)}>
                                    <Flex justify={'space-between'} align={'center'} style={{ width: '100%' }} gap={12}>
                                        <Flex vertical style={{ minWidth: 0 }}>
                                            <Typography.Text>
                                                <Tag style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                                                    {order.registrationPlate}
                                                </Tag>
                                                {order.vehicleLabel ?? '—'}
                                            </Typography.Text>
                                            <Typography.Text type={'secondary'} style={{ fontSize: 12 }}>
                                                {enumLabel('service_type', order.type)} · {order.mechanicName ?? '—'} ·{' '}
                                                {formatDateTime(order.openedAt)}
                                            </Typography.Text>
                                        </Flex>
                                        <Flex vertical align={'flex-end'}>
                                            <Tag color={statusColor[order.status]} style={{ margin: 0 }}>
                                                {enumLabel('service_order_status', order.status)}
                                            </Tag>
                                            <Typography.Text strong style={{ fontSize: 13 }}>
                                                {formatMoney(order.total, order.currency)}
                                            </Typography.Text>
                                        </Flex>
                                    </Flex>
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>
            </Row>

            <ServiceOrderDrawer orderId={openOrderId} onClose={() => setOpenOrderId(undefined)} />
        </>
    )
}

export default Dashboard
