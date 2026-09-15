import {
    BookOutlined,
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

const Sidebar = ({ collapsed }: { collapsed: boolean }) => {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const location = useLocation()
    const { canAny } = useSession()

    /* The menu filters itself: an entry whose permission the user lacks is never rendered. */
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
                    paddingInline: collapsed ? 0 : 20,
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    color: palette.text,
                    fontWeight: 600,
                    fontSize: 15,
                    letterSpacing: '-0.01em',
                }}
            >
                {collapsed ? 'RS' : 'RepairShop'}
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
