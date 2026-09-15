import { useQueryClient } from '@tanstack/react-query'
import { App, Badge, Button, Card, Empty, Flex, List, Typography } from 'antd'
import { useTranslation } from 'react-i18next'

import type { NotificationView } from 'api/types'
import { ErrorBlock, PageHeader } from 'components'
import { useMutation, useQuery } from 'hooks'
import { palette } from 'theme'
import { formatDateTime } from 'utils/format'
import { notificationKeys, notificationsApi } from '../utils/api'

const Notifications = () => {
    const { t } = useTranslation()
    const { message } = App.useApp()
    const queryClient = useQueryClient()

    const { data, isFetching, error } = useQuery({
        queryKey: ['notifications', 'list'],
        queryFn: async () => await notificationsApi.list({ size: 50 }),
    })

    const invalidate = async () => await queryClient.invalidateQueries({ queryKey: notificationKeys.all })

    const markRead = useMutation({
        mutationFn: async (id: string) => await notificationsApi.markRead(id),
        onSuccess: invalidate,
    })

    const markAllRead = useMutation({
        mutationFn: async () => await notificationsApi.markAllRead(),
        onSuccess: async () => {
            message.success(t('notifications.all_read'))
            await invalidate()
        },
    })

    const unread = data?.items.filter((item) => !item.read).length ?? 0

    return (
        <>
            <PageHeader
                title={t('pages.notifications.title')}
                subtitle={t('notifications.unread', { count: unread })}
                extra={
                    <Button
                        disabled={unread === 0}
                        loading={markAllRead.isPending}
                        onClick={() => markAllRead.mutate()}
                    >
                        {t('notifications.mark_all_read')}
                    </Button>
                }
            />

            {error ? <ErrorBlock error={error} /> : null}

            <Card styles={{ body: { padding: 0 } }}>
                <List<NotificationView>
                    loading={isFetching}
                    dataSource={data?.items}
                    locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
                    renderItem={(item) => (
                        <List.Item
                            style={{ padding: '14px 20px', background: item.read ? undefined : 'rgba(0,113,227,0.03)' }}
                            actions={
                                item.read
                                    ? []
                                    : [
                                          <Button
                                              key={'read'}
                                              type={'link'}
                                              size={'small'}
                                              onClick={() => markRead.mutate(item.id)}
                                          >
                                              {t('notifications.mark_read')}
                                          </Button>,
                                      ]
                            }
                        >
                            <List.Item.Meta
                                avatar={<Badge dot={!item.read} color={palette.accent} />}
                                title={<Typography.Text style={{ fontWeight: 500 }}>{item.title}</Typography.Text>}
                                description={
                                    <Flex vertical gap={2}>
                                        {item.body ? <Typography.Text>{item.body}</Typography.Text> : null}
                                        <Typography.Text type={'secondary'} style={{ fontSize: 12 }}>
                                            {formatDateTime(item.createdAt)}
                                        </Typography.Text>
                                    </Flex>
                                }
                            />
                        </List.Item>
                    )}
                />
            </Card>
        </>
    )
}

export default Notifications
