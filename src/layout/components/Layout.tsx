import { Layout as AntLayout, Skeleton } from 'antd'
import { Suspense, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'

import Header from './Header'
import Sidebar from './Sidebar'

const Layout = () => {
    const [collapsed, setCollapsed] = useState(false)
    const { pathname } = useLocation()

    return (
        <AntLayout style={{ minHeight: '100vh' }}>
            <Sidebar collapsed={collapsed} />
            <AntLayout>
                <Header collapsed={collapsed} onToggle={() => setCollapsed((value) => !value)} />
                <AntLayout.Content style={{ padding: '28px 32px 48px' }}>
                    <div key={pathname} className={'page-enter'} style={{ maxWidth: 1280, margin: '0 auto' }}>
                        <Suspense fallback={<Skeleton active />}>
                            <Outlet />
                        </Suspense>
                    </div>
                </AntLayout.Content>
            </AntLayout>
        </AntLayout>
    )
}

export default Layout
