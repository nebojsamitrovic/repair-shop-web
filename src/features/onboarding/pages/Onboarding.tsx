import { Button, Card, Flex, Form, Input, Typography } from 'antd'
import { useTranslation } from 'react-i18next'

import { api } from 'api/client'
import type { BootstrapRequest, CurrentUser } from 'api/types'
import { useSession } from 'auth/session'
import { ErrorBlock } from 'components'
import { useMutation } from 'hooks'
import { palette } from 'theme'

/**
 * Where a Firebase identity becomes an application account: bootstrap either joins the garage
 * that invited this email, ignoring the company name, or creates a new one with the caller as OWNER.
 */
const Onboarding = () => {
    const { t } = useTranslation()
    const { signOut, refresh } = useSession()

    const bootstrap = useMutation({
        mutationFn: async (request: BootstrapRequest) => (await api.post<CurrentUser>('/auth/bootstrap', request)).data,
        onSuccess: () => void refresh(),
    })

    return (
        <Flex
            align={'center'}
            justify={'center'}
            style={{ minHeight: '100vh', background: palette.canvas, padding: 24 }}
        >
            <Card style={{ width: 480 }} styles={{ body: { padding: 32 } }}>
                <Typography.Title level={3} style={{ marginTop: 0, marginBottom: 4 }}>
                    {t('onboarding.title')}
                </Typography.Title>
                <Typography.Paragraph type={'secondary'}>{t('onboarding.description')}</Typography.Paragraph>

                {bootstrap.error ? (
                    <div style={{ marginBottom: 16 }}>
                        <ErrorBlock error={bootstrap.error} />
                    </div>
                ) : null}

                <Form<BootstrapRequest> layout={'vertical'} onFinish={(values) => bootstrap.mutate(values)}>
                    <Form.Item name={'firstName'} label={t('fields.first_name')} rules={[{ max: 80 }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name={'lastName'} label={t('fields.last_name')} rules={[{ max: 80 }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name={'companyName'}
                        label={t('fields.company_name')}
                        extra={t('onboarding.company_hint')}
                        rules={[{ max: 120 }]}
                    >
                        <Input />
                    </Form.Item>
                    <Flex gap={8}>
                        <Button type={'primary'} htmlType={'submit'} loading={bootstrap.isPending}>
                            {t('onboarding.submit')}
                        </Button>
                        <Button onClick={() => void signOut()}>{t('actions.sign_out')}</Button>
                    </Flex>
                </Form>
            </Card>
        </Flex>
    )
}

export default Onboarding
