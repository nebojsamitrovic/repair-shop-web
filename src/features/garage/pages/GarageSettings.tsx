import { useQueryClient } from '@tanstack/react-query'
import { Alert, App, Button, Card, Col, Form, Input, InputNumber, Row, Select, Skeleton, Typography } from 'antd'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import {
    LABOUR_PRICING_MODES,
    LOCALES,
    type GarageSettings as Settings,
    type UpdateGarageSettingsRequest,
} from 'api/types'
import { useSession } from 'auth/session'
import { ErrorBlock, PageHeader } from 'components'
import { useMutation, useQuery } from 'hooks'
import useEnumLabel from 'lang/useEnumLabel'
import { formatMoney } from 'utils/format'
import LogoCard from '../components/LogoCard'
import { garageApi, garageKeys } from '../utils/api'

/**
 * What the administrator decides once for the whole garage: how far a car goes between services,
 * and what an hour of work costs. The intervals drive the reminders; the rate is what a quote
 * prints. An order copies the pricing when it opens, so changing it here never reprices old work.
 */
const GarageSettings = () => {
    const { t } = useTranslation()
    const enumLabel = useEnumLabel()
    const { can } = useSession()
    const { message } = App.useApp()
    const queryClient = useQueryClient()
    const [form] = Form.useForm<UpdateGarageSettingsRequest>()
    const mode = Form.useWatch('labourPricingMode', form)

    const settings = useQuery({ queryKey: garageKeys.settings, queryFn: garageApi.settings })

    const save = useMutation({
        mutationFn: garageApi.updateSettings,
        onSuccess: (saved: Settings) => {
            message.success(t('garage.saved'))
            queryClient.setQueryData(garageKeys.settings, saved)
        },
    })

    useEffect(() => {
        if (settings.data) form.setFieldsValue(settings.data)
    }, [settings.data, form])

    if (settings.error) return <ErrorBlock error={settings.error} />
    if (settings.isLoading || !settings.data) return <Skeleton active />

    const editable = can('settings:manage')
    const current = settings.data

    return (
        <>
            <PageHeader title={t('pages.garage.title')} subtitle={t('garage.subtitle')} />

            {save.error ? (
                <div style={{ marginBottom: 16 }}>
                    <ErrorBlock error={save.error} />
                </div>
            ) : null}

            <div style={{ marginBottom: 16 }}>
                <LogoCard editable={editable} />
            </div>

            <Form<UpdateGarageSettingsRequest>
                form={form}
                layout={'vertical'}
                requiredMark={false}
                disabled={!editable}
                onFinish={(values) => save.mutate(values)}
            >
                <Row gutter={[16, 16]}>
                    <Col xs={24} lg={12}>
                        <Card title={t('garage.intervals.title')}>
                            <Typography.Paragraph type={'secondary'}>{t('garage.intervals.hint')}</Typography.Paragraph>
                            <Form.Item
                                name={'smallServiceIntervalKm'}
                                label={t('garage.intervals.small')}
                                rules={[{ required: true, message: t('validation.required') }]}
                            >
                                <InputNumber min={1000} step={1000} style={{ width: '100%' }} addonAfter={'km'} />
                            </Form.Item>
                            <Form.Item
                                name={'bigServiceIntervalKm'}
                                label={t('garage.intervals.big')}
                                rules={[{ required: true, message: t('validation.required') }]}
                            >
                                <InputNumber min={1000} step={1000} style={{ width: '100%' }} addonAfter={'km'} />
                            </Form.Item>
                        </Card>
                    </Col>

                    <Col xs={24} lg={12}>
                        <Card title={t('garage.pricing.title')}>
                            <Typography.Paragraph type={'secondary'}>{t('garage.pricing.hint')}</Typography.Paragraph>
                            <Form.Item name={'labourPricingMode'} label={t('garage.pricing.mode')}>
                                <Select
                                    options={LABOUR_PRICING_MODES.map((item) => ({
                                        value: item,
                                        label: enumLabel('labour_pricing_mode', item),
                                    }))}
                                />
                            </Form.Item>
                            <Row gutter={12}>
                                <Col span={12}>
                                    <Form.Item name={'hourlyRate'} label={t('fields.hourly_rate')}>
                                        <InputNumber min={0} step={0.5} style={{ width: '100%' }} />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item name={'fixedRate'} label={t('fields.fixed_rate')}>
                                        <InputNumber min={0} step={0.5} style={{ width: '100%' }} />
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Form.Item name={'currency'} label={t('fields.currency')} rules={[{ len: 3 }]}>
                                <Input maxLength={3} style={{ width: 120, textTransform: 'uppercase' }} />
                            </Form.Item>
                            <Alert
                                type={'info'}
                                showIcon
                                message={t('garage.pricing.active', {
                                    mode: enumLabel('labour_pricing_mode', mode ?? current.labourPricingMode),
                                    rate: formatMoney(current.activeRate, current.currency),
                                })}
                            />
                        </Card>
                    </Col>

                    <Col xs={24}>
                        <Card title={t('garage.contact.title')}>
                            <Typography.Paragraph type={'secondary'}>{t('garage.contact.hint')}</Typography.Paragraph>
                            <Row gutter={12}>
                                <Col xs={24} md={8}>
                                    <Form.Item name={'defaultLocale'} label={t('garage.contact.default_language')}>
                                        <Select
                                            options={LOCALES.map((locale) => ({
                                                value: locale,
                                                label: enumLabel('locale', locale),
                                            }))}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={8}>
                                    <Form.Item
                                        name={'contactEmail'}
                                        label={t('fields.email')}
                                        rules={[{ type: 'email', message: t('validation.email') }]}
                                    >
                                        <Input />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={8}>
                                    <Form.Item name={'contactPhone'} label={t('fields.phone')}>
                                        <Input />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                </Row>

                {editable ? (
                    <Button type={'primary'} htmlType={'submit'} loading={save.isPending} style={{ marginTop: 16 }}>
                        {t('actions.save')}
                    </Button>
                ) : null}
            </Form>
        </>
    )
}

export default GarageSettings
