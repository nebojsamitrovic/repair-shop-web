import { Form, Input, Modal, Select, Typography } from 'antd'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { LANGUAGES } from 'lang'
import type { SendDocumentRequest } from 'api/types'

interface Props {
    open: boolean
    title: string
    /** Shown as the placeholder: the address the document goes to if none is typed. */
    defaultRecipient?: string | null
    pending: boolean
    onCancel: () => void
    onSend: (body: SendDocumentRequest) => void
}

/**
 * Sending a printed document to the customer.
 *
 * <p>Both fields are optional on purpose: left alone, the document goes to the address the garage
 * has on file, in the language that customer reads. They are here for the two cases the desk
 * actually meets — a company address given over the counter, and a customer who wants it in the
 * other language.
 */
const SendDocumentModal = ({ open, title, defaultRecipient, pending, onCancel, onSend }: Props) => {
    const { t } = useTranslation()
    const [form] = Form.useForm<SendDocumentRequest>()

    useEffect(() => {
        if (open) form.resetFields()
    }, [open, form])

    return (
        <Modal
            open={open}
            title={title}
            okText={t('actions.send')}
            cancelText={t('actions.cancel')}
            confirmLoading={pending}
            onCancel={onCancel}
            onOk={() => form.submit()}
        >
            <Typography.Paragraph type={'secondary'}>{t('documents.send_hint')}</Typography.Paragraph>
            <Form<SendDocumentRequest> form={form} layout={'vertical'} requiredMark={false} onFinish={onSend}>
                <Form.Item
                    name={'to'}
                    label={t('fields.email')}
                    rules={[{ type: 'email', message: t('validation.email') }]}
                >
                    <Input placeholder={defaultRecipient ?? t('documents.customer_address')} allowClear />
                </Form.Item>
                <Form.Item name={'lang'} label={t('fields.language')}>
                    <Select
                        allowClear
                        placeholder={t('documents.customer_language')}
                        options={LANGUAGES.map((language) => ({ value: language, label: t(`language.${language}`) }))}
                    />
                </Form.Item>
            </Form>
        </Modal>
    )
}

export default SendDocumentModal
