import { Button, Drawer, Flex, Form, Input, Select } from 'antd'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { LOCALES, type CustomerRequest, type CustomerView } from 'api/types'
import { ErrorBlock } from 'components'
import useEnumLabel from 'lang/useEnumLabel'
import useSaveCustomer from '../hooks/useSaveCustomer'

interface Props {
    open: boolean
    /** Absent when adding; present when editing. */
    customer?: CustomerView
    onClose: () => void
    onSaved?: (customer: CustomerView) => void
}

/** A person, a company, or both — and the language the garage writes to them in. */
const CustomerDrawer = ({ open, customer, onClose, onSaved }: Props) => {
    const { t } = useTranslation()
    const enumLabel = useEnumLabel()
    const [form] = Form.useForm<CustomerRequest>()
    const save = useSaveCustomer(customer?.id)

    useEffect(() => {
        if (!open) return
        form.resetFields()
        if (customer) form.setFieldsValue(customer as CustomerRequest)
    }, [open, customer, form])

    const onFinish = (values: CustomerRequest) =>
        save.mutate(values, {
            onSuccess: (saved) => {
                onSaved?.(saved)
                onClose()
            },
        })

    return (
        <Drawer
            open={open}
            onClose={onClose}
            width={440}
            title={customer ? t('customers.edit') : t('customers.add')}
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

            <Form<CustomerRequest> form={form} layout={'vertical'} onFinish={onFinish} requiredMark={false}>
                <Form.Item name={'firstName'} label={t('fields.first_name')} rules={[{ max: 128 }]}>
                    <Input />
                </Form.Item>
                <Form.Item name={'lastName'} label={t('fields.last_name')} rules={[{ max: 128 }]}>
                    <Input />
                </Form.Item>
                <Form.Item
                    name={'companyName'}
                    label={t('fields.company')}
                    extra={t('customers.company_hint')}
                    rules={[{ max: 255 }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    name={'email'}
                    label={t('fields.email')}
                    extra={t('customers.email_hint')}
                    rules={[{ type: 'email', max: 255, message: t('validation.email') }]}
                >
                    <Input autoComplete={'off'} />
                </Form.Item>
                <Form.Item name={'phone'} label={t('fields.phone')} rules={[{ max: 64 }]}>
                    <Input autoComplete={'off'} />
                </Form.Item>
                <Form.Item name={'locale'} label={t('fields.language')} extra={t('customers.locale_hint')}>
                    <Select
                        allowClear
                        placeholder={t('customers.locale_default')}
                        options={LOCALES.map((locale) => ({ value: locale, label: enumLabel('locale', locale) }))}
                    />
                </Form.Item>
                <Form.Item name={'notes'} label={t('fields.notes')}>
                    <Input.TextArea rows={4} />
                </Form.Item>
            </Form>
        </Drawer>
    )
}

export default CustomerDrawer
