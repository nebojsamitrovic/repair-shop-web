import { BellOutlined, CarOutlined, ToolOutlined } from '@ant-design/icons'
import { Alert, Button, Card, Col, Flex, Form, Input, Row, Typography } from 'antd'
import { useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { signIn } from 'auth/firebase'
import { useSession } from 'auth/session'
import LanguageSwitch from 'lang/LanguageSwitch'

interface LoginForm {
    email: string
    password: string
}

const highlights: { key: string; icon: ReactNode }[] = [
    { key: 'workshop', icon: <ToolOutlined /> },
    { key: 'reminders', icon: <BellOutlined /> },
    { key: 'notebook', icon: <CarOutlined /> },
]

/** The only screen that talks to Firebase directly; it exchanges a password for an identity, nothing more. */
const Login = () => {
    const { t } = useTranslation()
    const { status } = useSession()
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const onFinish = async ({ email, password }: LoginForm) => {
        setSubmitting(true)
        setError(null)
        try {
            await signIn(email, password)
        } catch {
            /* Firebase deliberately does not say which half was wrong, and neither do we. */
            setError(t('login.failed'))
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Row style={{ minHeight: '100vh' }}>
            {/*
             * The left half says what this is before anybody signs in. It is typography and one
             * drawing rather than a photograph: nothing here has to be downloaded, and a forecourt
             * photo would be somebody else's cars.
             */}
            <Col xs={0} lg={13}>
                <Flex
                    vertical
                    justify={'space-between'}
                    style={{
                        height: '100%',
                        padding: '56px 64px',
                        background: `linear-gradient(150deg, #0a1a2f 0%, #14304f 55%, #0f2740 100%)`,
                        color: '#ffffff',
                    }}
                >
                    <Flex align={'center'} gap={10}>
                        <CarOutlined style={{ fontSize: 20 }} />
                        <Typography.Text style={{ color: '#ffffff', fontWeight: 600, letterSpacing: '-0.01em' }}>
                            Garage Ledger
                        </Typography.Text>
                    </Flex>

                    <div style={{ maxWidth: 520 }}>
                        <Typography.Title
                            level={1}
                            style={{ color: '#ffffff', margin: 0, fontSize: 44, letterSpacing: '-0.03em' }}
                        >
                            {t('login.headline')}
                        </Typography.Title>
                        <Typography.Paragraph
                            style={{ color: 'rgba(255, 255, 255, 0.72)', fontSize: 17, marginTop: 16 }}
                        >
                            {t('login.subheadline')}
                        </Typography.Paragraph>

                        <Flex vertical gap={18} style={{ marginTop: 40 }}>
                            {highlights.map(({ key, icon }) => (
                                <Flex key={key} gap={14} align={'flex-start'}>
                                    <Flex
                                        align={'center'}
                                        justify={'center'}
                                        style={{
                                            width: 34,
                                            height: 34,
                                            flex: '0 0 34px',
                                            borderRadius: 10,
                                            background: 'rgba(255, 255, 255, 0.1)',
                                            color: '#ffffff',
                                        }}
                                    >
                                        {icon}
                                    </Flex>
                                    <div>
                                        <Typography.Text style={{ color: '#ffffff', fontWeight: 500 }}>
                                            {t(`login.highlights.${key}.title`)}
                                        </Typography.Text>
                                        <Typography.Paragraph
                                            style={{
                                                color: 'rgba(255, 255, 255, 0.6)',
                                                fontSize: 13,
                                                margin: 0,
                                            }}
                                        >
                                            {t(`login.highlights.${key}.body`)}
                                        </Typography.Paragraph>
                                    </div>
                                </Flex>
                            ))}
                        </Flex>
                    </div>

                    <Typography.Text style={{ color: 'rgba(255, 255, 255, 0.45)', fontSize: 12 }}>
                        {t('login.footnote')}
                    </Typography.Text>
                </Flex>
            </Col>

            <Col xs={24} lg={11}>
                <Flex vertical align={'center'} justify={'center'} style={{ height: '100%', padding: 24 }}>
                    <Card style={{ width: '100%', maxWidth: 400 }} styles={{ body: { padding: 32 } }}>
                        <Typography.Title level={3} style={{ marginTop: 0, marginBottom: 4 }}>
                            {t('login.title')}
                        </Typography.Title>
                        <Typography.Paragraph type={'secondary'} style={{ marginBottom: 24 }}>
                            {t('login.lead')}
                        </Typography.Paragraph>

                        {status === 'unavailable' ? (
                            <Alert
                                type={'warning'}
                                showIcon
                                style={{ marginBottom: 16 }}
                                message={t('errors.AUTH_NOT_CONFIGURED')}
                            />
                        ) : null}
                        {error ? <Alert type={'error'} showIcon style={{ marginBottom: 16 }} message={error} /> : null}

                        <Form<LoginForm> layout={'vertical'} onFinish={onFinish} requiredMark={false}>
                            <Form.Item
                                name={'email'}
                                label={t('fields.email')}
                                rules={[{ required: true, type: 'email', message: t('validation.email') }]}
                            >
                                <Input autoComplete={'email'} size={'large'} />
                            </Form.Item>
                            <Form.Item
                                name={'password'}
                                label={t('fields.password')}
                                rules={[{ required: true, message: t('validation.required') }]}
                            >
                                <Input.Password autoComplete={'current-password'} size={'large'} />
                            </Form.Item>
                            <Button type={'primary'} htmlType={'submit'} block size={'large'} loading={submitting}>
                                {t('login.submit')}
                            </Button>
                        </Form>

                        <Typography.Paragraph
                            type={'secondary'}
                            style={{ fontSize: 12, marginTop: 20, marginBottom: 0 }}
                        >
                            {t('login.invite_only')}
                        </Typography.Paragraph>
                    </Card>

                    <div style={{ marginTop: 20 }}>
                        <LanguageSwitch />
                    </div>
                </Flex>
            </Col>
        </Row>
    )
}

export default Login
