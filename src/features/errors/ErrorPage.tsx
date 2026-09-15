import { Button, Result } from 'antd'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { Routes } from 'routes/config'

const ErrorPage = ({ status }: { status: '403' | '404' }) => {
    const { t } = useTranslation()
    const navigate = useNavigate()

    return (
        <Result
            status={status}
            title={status}
            subTitle={t(status === '403' ? 'pages.forbidden.description' : 'pages.not_found.description')}
            extra={
                <Button type={'primary'} onClick={() => navigate(Routes.Dashboard.path)}>
                    {t('actions.back_home')}
                </Button>
            }
        />
    )
}

export default ErrorPage
