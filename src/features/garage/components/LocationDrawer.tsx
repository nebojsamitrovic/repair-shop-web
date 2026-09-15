import { useQueryClient } from '@tanstack/react-query'
import { App, Button, Drawer, Flex, Form, Input } from 'antd'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import type { LocationRequest, LocationView } from 'api/types'
import { ErrorBlock } from 'components'
import { useMutation } from 'hooks'
import { garageApi, garageKeys } from '../utils/api'

interface Props {
    open: boolean
    location?: LocationView
    onClose: () => void
}

const LocationDrawer = ({ open, location, onClose }: Props) => {
    const { t } = useTranslation()
    const { message } = App.useApp()
    const queryClient = useQueryClient()
    const [form] = Form.useForm<LocationRequest>()

    const save = useMutation({
        mutationFn: async (body: LocationRequest) =>
            location ? await garageApi.updateLocation(location.id, body) : await garageApi.createLocation(body),
        onSuccess: async () => {
            message.success(t('locations.saved'))
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: garageKeys.locations }),
                queryClient.invalidateQueries({ queryKey: ['directory', 'locations'] }),
            ])
            onClose()
        },
    })

    useEffect(() => {
        if (!open) return
        form.resetFields()
        if (location) form.setFieldsValue(location as LocationRequest)
    }, [open, location, form])

    return (
        <Drawer
            open={open}
            onClose={onClose}
            width={440}
            title={location ? t('locations.edit') : t('locations.add')}
            footer={
                <Flex gap={8} justify={'flex-end'}>
                    <Button onClick={onClose}>{t('actions.cancel')}</Button>
                    <Button type={'primary'} loading={save.isPending} onClick={() => form.submit()}>
                        {t('actions.save')}
                    </Button>
                </Flex>
            }
        >
            {save.error ? (
                <div style={{ marginBottom: 16 }}>
                    <ErrorBlock error={save.error} />
                </div>
            ) : null}
            <Form<LocationRequest>
                form={form}
                layout={'vertical'}
                requiredMark={false}
                onFinish={(values) => save.mutate(values)}
            >
                <Form.Item
                    name={'name'}
                    label={t('fields.name')}
                    rules={[{ required: true, max: 128, message: t('validation.required') }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item name={'address'} label={t('fields.address')} rules={[{ max: 255 }]}>
                    <Input />
                </Form.Item>
                <Form.Item name={'city'} label={t('fields.city')} rules={[{ max: 128 }]}>
                    <Input />
                </Form.Item>
                <Form.Item name={'phone'} label={t('fields.phone')} rules={[{ max: 64 }]}>
                    <Input />
                </Form.Item>
                <Form.Item
                    name={'email'}
                    label={t('fields.email')}
                    rules={[{ type: 'email', max: 255, message: t('validation.email') }]}
                >
                    <Input />
                </Form.Item>
            </Form>
        </Drawer>
    )
}

export default LocationDrawer
