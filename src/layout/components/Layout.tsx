import { Layout as AntLayout, Skeleton } from 'antd'
import { Suspense, useState } from 'react'
import { Outlet } from 'react-router-dom'

import Header from './Header'
import Sidebar from './Sidebar'

const Layout = () => {
    const [collapsed, setCollapsed] = useState(false)

    return (
        <AntLayout style={{ minHeight: '100vh' }}>
            <Sidebar collapsed={collapsed} />
            <AntLayout>
                <Header collapsed={collapsed} onToggle={() => setCollapsed((value) => !value)} />
                <AntLayout.Content style={{ padding: '28px 32px 48px' }}>
                    {/* Content stays readable on a wide monitor rather than stretching edge to edge. */}
                    <div style={{ maxWidth: 1280, margin: '0 auto' }}>
                        {/* Screens are split per route; the shell stays put while a chunk arrives. */}
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
