import {
    BookOutlined,
    CalendarOutlined,
    CarOutlined,
    DashboardOutlined,
    HistoryOutlined,
    InboxOutlined,
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
import { navigation, type NavigationGroup, type NavigationItem } from '../navigation'

const icons: Record<NavigationItem['icon'], ReactNode> = {
    dashboard: <DashboardOutlined />,
    tool: <ToolOutlined />,
    calendar: <CalendarOutlined />,
    inbox: <InboxOutlined />,
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

const MiniRail = ({
    groups,
    selected,
    onSelect,
}: {
    groups: NavigationGroup[]
    selected?: string
    onSelect: (path: string) => void
}) => {
    const { t } = useTranslation()

    return (
        <nav className={'mini-rail'}>
            {groups.map((group, index) => (
                <div key={group.key} className={index === 0 ? undefined : 'mini-rail-group'}>
                    {group.items.map((item) => {
                        const active = item.route.path === selected
                        const label = t(item.labelKey)
                        return (
                            <button
                                key={item.key}
                                type={'button'}
                                className={`mini-rail-item${active ? ' mini-rail-item-active' : ''}`}
                                aria-current={active ? 'page' : undefined}
                                title={label}
                                onClick={() => onSelect(item.route.path)}
                            >
                                <span className={'mini-rail-icon'}>{icons[item.icon]}</span>
                                <span className={'mini-rail-label'}>{label}</span>
                            </button>
                        )
                    })}
                </div>
            ))}
        </nav>
    )
}

const Sidebar = ({ collapsed }: { collapsed: boolean }) => {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const location = useLocation()
    const { canAny, user } = useSession()

    const tenant = user?.tenant

    const groups: NavigationGroup[] = navigation
        .map((group) => ({ ...group, items: group.items.filter((item) => canAny(item.route.permissions)) }))
        .filter((group) => group.items.length > 0)

    const items: ItemType<MenuItemType>[] = groups
        .map((group) => {
            const children = group.items.map((item) => ({
                key: item.route.path,
                icon: icons[item.icon],
                label: t(item.labelKey),
            }))
            return group.labelKey
                ? { key: group.key, label: t(group.labelKey), type: 'group' as const, children }
                : children
        })
        .flat()

    const selected = groups
        .flatMap((group) => group.items)
        .map((item) => item.route.path)
        .filter((path) => location.pathname.startsWith(path))
        .sort((a, b) => b.length - a.length)
        .at(0)

    return (
        <Layout.Sider collapsible collapsed={collapsed} trigger={null} width={240} collapsedWidth={76}>
            <div
                className={[
                    'sidebar-brand',
                    tenant?.logoUrl ? 'sidebar-brand-logo' : '',
                    collapsed ? 'sidebar-brand-collapsed' : '',
                ]
                    .filter(Boolean)
                    .join(' ')}
                style={{ color: palette.sidebarTextStrong }}
                title={tenant?.name}
            >
                {tenant?.logoUrl ? (
                    <img src={tenant.logoUrl} alt={tenant.name} />
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

            {collapsed ? (
                <MiniRail groups={groups} selected={selected} onSelect={(path) => navigate(path)} />
            ) : (
                <Menu
                    mode={'inline'}
                    theme={'dark'}
                    items={items}
                    selectedKeys={selected ? [selected] : []}
                    onClick={({ key }) => navigate(key)}
                    style={{ borderInlineEnd: 'none' }}
                />
            )}
        </Layout.Sider>
    )
}

export default Sidebar
