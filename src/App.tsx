import { QueryClientProvider } from '@tanstack/react-query'
import { App as AntApp, ConfigProvider } from 'antd'
import enGB from 'antd/locale/en_GB'
import srRS from 'antd/locale/sr_RS'
import { useTranslation } from 'react-i18next'
import { BrowserRouter } from 'react-router-dom'

import SessionProvider from 'auth/SessionProvider'
import { currentLanguage } from 'lang'
import AppRoutes from 'routes/AppRoutes'
import { theme } from 'theme'
import { queryClient } from 'utils/query-client'

const antLocales = { sr: srRS, en: enGB }

const App = () => {
    useTranslation()

    return (
        <ConfigProvider theme={theme} locale={antLocales[currentLanguage()]}>
            <AntApp>
                <QueryClientProvider client={queryClient}>
                    <BrowserRouter>
                        <SessionProvider>
                            <AppRoutes />
                        </SessionProvider>
                    </BrowserRouter>
                </QueryClientProvider>
            </AntApp>
        </ConfigProvider>
    )
}

export default App
