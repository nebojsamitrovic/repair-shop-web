import {
    BookOutlined,
    CalendarOutlined,
    CarOutlined,
    DashboardOutlined,
    HistoryOutlined,
    KeyOutlined,
    MailOutlined,
    SettingOutlined,
    ShopOutlined,
    TeamOutlined,
    ToolOutlined,
    UserOutlined,
} from '@ant-design/icons'
import { Layout, Menu } from 'antd'
import type { ItemType, MenuItemType } from 'antd/es/menu/interface'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'

import { useSession } from 'auth/session'
import { palette } from 'theme'
import { navigation, type NavigationItem } from '../navigation'

const icons: Record<NavigationItem['icon'], ReactNode> = {
    dashboard: <DashboardOutlined />,
    tool: <ToolOutlined />,
    calendar: <CalendarOutlined />,
    car: <CarOutlined />,
    team: <TeamOutlined />,
    book: <BookOutlined />,
    shop: <ShopOutlined />,
    setting: <SettingOutlined />,
    user: <UserOutlined />,
    mail: <MailOutlined />,
    history: <HistoryOutlined />,
    key: <KeyOutlined />,
}

/** Two letters for a collapsed rail: "Auto Centar Nikolić" becomes "AN". */
const initials = (name?: string) =>
    (name ?? '')
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0]?.toUpperCase() ?? '')
        .join('')

const Sidebar = ({ collapsed }: { collapsed: boolean }) => {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const location = useLocation()
    const { canAny, user } = useSession()

    const tenant = user?.tenant

    const items: ItemType<MenuItemType>[] = navigation
        .map((group) => {
            const visible = group.items.filter((item) => canAny(item.route.permissions))
            if (visible.length === 0) return null
            const children = visible.map((item) => ({
                key: item.route.path,
                icon: icons[item.icon],
                label: t(item.labelKey),
            }))
            return group.labelKey
                ? { key: group.key, label: t(group.labelKey), type: 'group' as const, children }
                : children
        })
        .filter((entry) => entry !== null)
        .flat()

    const selected = [...navigation.flatMap((group) => group.items)]
        .map((item) => item.route.path)
        .filter((path) => location.pathname.startsWith(path))
        .sort((a, b) => b.length - a.length)
        .slice(0, 1)

    return (
        <Layout.Sider collapsible collapsed={collapsed} trigger={null} width={236}>
            <div
                style={{
                    height: 52,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    paddingInline: collapsed ? 0 : 20,
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    color: palette.text,
                    fontWeight: 600,
                    fontSize: 15,
                    letterSpacing: '-0.01em',
                    overflow: 'hidden',
                }}
                title={tenant?.name}
            >
                {tenant?.logoUrl ? (
                    <img
                        src={tenant.logoUrl}
                        alt={tenant.name}
                        style={{ maxHeight: 28, maxWidth: collapsed ? 32 : 180, objectFit: 'contain' }}
                    />
                ) : (
                    <span
                        style={{
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                        }}
                    >
                        {collapsed ? initials(tenant?.name) : (tenant?.name ?? '')}
                    </span>
                )}
            </div>
            <Menu
                mode={'inline'}
                items={items}
                selectedKeys={selected}
                onClick={({ key }) => navigate(key)}
                style={{ borderInlineEnd: 'none' }}
            />
        </Layout.Sider>
    )
}

export default Sidebar
