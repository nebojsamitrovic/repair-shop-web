import { BellOutlined, LogoutOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons'
import { Avatar, Badge, Button, Dropdown, Flex, Layout, Typography } from 'antd'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { api } from 'api/client'
import { useSession } from 'auth/session'
import LanguageSwitch from 'lang/LanguageSwitch'
import { useQuery } from 'hooks'
import { Routes } from 'routes/config'
import { palette } from 'theme'

interface UnreadCount {
    unread: number
}

interface Props {
    collapsed: boolean
    onToggle: () => void
}

const Header = ({ collapsed, onToggle }: Props) => {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { user, signOut } = useSession()

    /* There is no WebSocket or SSE on the backend, so the bell polls. Half a minute is plenty. */
    const { data } = useQuery({
        queryKey: ['notifications', 'unread-count'],
        queryFn: async () => (await api.get<UnreadCount>('/notifications/unread-count')).data,
        refetchInterval: 30_000,
    })

    const name = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.email
    const initials =
        [user?.firstName?.[0], user?.lastName?.[0]].filter(Boolean).join('').toUpperCase() ||
        user?.email?.[0]?.toUpperCase()

    return (
        <Layout.Header>
            <Flex align={'center'} justify={'space-between'} style={{ height: '100%' }}>
                <Flex align={'center'} gap={10}>
                    <Button
                        type={'text'}
                        size={'small'}
                        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        onClick={onToggle}
                        aria-label={t('actions.toggle_menu')}
                    />
                    <Typography.Text style={{ fontWeight: 500 }}>{user?.tenant.name}</Typography.Text>
                </Flex>

                <Flex align={'center'} gap={16}>
                    <LanguageSwitch />
                    <Badge count={data?.unread ?? 0} size={'small'}>
                        <Button
                            type={'text'}
                            size={'small'}
                            icon={<BellOutlined />}
                            onClick={() => navigate(Routes.Notifications.path)}
                            aria-label={t('nav.notifications')}
                        />
                    </Badge>
                    <Dropdown
                        menu={{
                            items: [
                                {
                                    key: 'sign-out',
                                    icon: <LogoutOutlined />,
                                    label: t('actions.sign_out'),
                                    onClick: () => void signOut(),
                                },
                            ],
                        }}
                    >
                        <Flex align={'center'} gap={8} style={{ cursor: 'pointer' }}>
                            <Avatar size={26} style={{ background: palette.accent, fontSize: 12 }}>
                                {initials}
                            </Avatar>
                            <Typography.Text>{name}</Typography.Text>
                        </Flex>
                    </Dropdown>
                </Flex>
            </Flex>
        </Layout.Header>
    )
}

export default Header
