import { useQueryClient } from '@tanstack/react-query'
import { App, Button, Card, Flex, Form, Input, Switch, Tag, Typography } from 'antd'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import type { ConfigureViberRequest } from 'api/types'
import { ErrorBlock } from 'components'
import { useMutation, useQuery } from 'hooks'
import { garageApi, garageKeys } from '../utils/api'

interface Props {
    editable: boolean
}

/**
 * The garage's Viber bot: on or off, its token, its public name, and the webhook Viber has to
 * be told about. The token is written here and never shown again; the card only says whether
 * there is one.
 */
const ViberCard = ({ editable }: Props) => {
    const { t } = useTranslation()
    const { message } = App.useApp()
    const queryClient = useQueryClient()
    const [form] = Form.useForm<ConfigureViberRequest>()
    const enabled = Form.useWatch('enabled', form) ?? false

    const viber = useQuery({ queryKey: garageKeys.viber, queryFn: garageApi.viber })

    const save = useMutation({
        mutationFn: async (body: ConfigureViberRequest) =>
            await garageApi.configureViber({
                ...body,
                authToken: body.authToken?.trim() ? body.authToken.trim() : undefined,
            }),
        onSuccess: async () => {
            message.success(t('garage.viber.saved'))
            form.setFieldValue('authToken', undefined)
            await queryClient.invalidateQueries({ queryKey: garageKeys.viber })
        },
    })
    const register = useMutation({
        mutationFn: garageApi.registerViberWebhook,
        onSuccess: (result) => message.success(t('garage.viber.webhook_registered', { answer: result.answer })),
        onError: (error) => message.error(error.message),
    })

    useEffect(() => {
        if (viber.data) form.setFieldsValue({ enabled: viber.data.enabled, botUri: viber.data.botUri ?? undefined })
    }, [viber.data, form])

    return (
        <Card
            title={
                <Flex gap={8} align={'center'}>
                    Viber
                    {viber.data ? (
                        <Tag color={viber.data.enabled ? 'green' : 'default'}>
                            {t(viber.data.enabled ? 'garage.viber.on' : 'garage.viber.off')}
                        </Tag>
                    ) : null}
                </Flex>
            }
        >
            {save.error ? (
                <div style={{ marginBottom: 16 }}>
                    <ErrorBlock error={save.error} />
                </div>
            ) : null}
            <Typography.Paragraph type={'secondary'}>{t('garage.viber.hint')}</Typography.Paragraph>
            <Form<ConfigureViberRequest>
                form={form}
                layout={'vertical'}
                requiredMark={false}
                disabled={!editable}
                onFinish={(values) => save.mutate(values)}
            >
                <Form.Item name={'enabled'} label={t('garage.viber.enabled')} valuePropName={'checked'}>
                    <Switch />
                </Form.Item>
                <Form.Item
                    name={'authToken'}
                    label={t('garage.viber.token')}
                    extra={viber.data?.tokenSet ? t('garage.viber.token_set') : t('garage.viber.token_hint')}
                    rules={[{ required: enabled && !viber.data?.tokenSet, message: t('validation.required') }]}
                >
                    <Input.Password autoComplete={'new-password'} maxLength={128} />
                </Form.Item>
                <Form.Item name={'botUri'} label={t('garage.viber.bot_uri')} extra={t('garage.viber.bot_uri_hint')}>
                    <Input maxLength={64} placeholder={'autocentar'} />
                </Form.Item>
                <Form.Item label={t('garage.viber.webhook')}>
                    <Typography.Text code copyable>
                        {viber.data?.webhookUrl ?? '…'}
                    </Typography.Text>
                </Form.Item>
                <Flex gap={8} wrap>
                    <Button type={'primary'} htmlType={'submit'} loading={save.isPending} disabled={!editable}>
                        {t('actions.save')}
                    </Button>
                    <Button
                        onClick={() => register.mutate()}
                        loading={register.isPending}
                        disabled={!editable || !viber.data?.enabled}
                    >
                        {t('garage.viber.register_webhook')}
                    </Button>
                </Flex>
            </Form>
        </Card>
    )
}

export default ViberCard
