import { Form, Input, Modal, Select, Typography } from 'antd'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import type { CreateRoleRequest, RoleView } from 'api/types'
import { ErrorBlock } from 'components'
import useCreateRole from '../hooks/useCreateRole'

interface Props {
    open: boolean
    roles: RoleView[]
    /** Pre-selected in the copy field when the editor sent you here from a system role. */
    copyFrom?: string
    onClose: () => void
    onCreated: (role: RoleView) => void
}

const RoleFormModal = ({ open, roles, copyFrom, onClose, onCreated }: Props) => {
    const { t } = useTranslation()
    const [form] = Form.useForm<CreateRoleRequest>()
    const create = useCreateRole((role) => {
        onCreated(role)
        onClose()
    })

    useEffect(() => {
        if (!open) return
        form.resetFields()
        form.setFieldsValue({ copyFromRoleCode: copyFrom })
    }, [open, copyFrom, form])

    return (
        <Modal
            open={open}
            title={t('roles.add')}
            okText={t('actions.save')}
            cancelText={t('actions.cancel')}
            confirmLoading={create.isPending}
            onCancel={onClose}
            onOk={() => form.submit()}
        >
            {create.error ? (
                <div style={{ marginBottom: 16 }}>
                    <ErrorBlock error={create.error} />
                </div>
            ) : null}

            <Typography.Paragraph type={'secondary'}>{t('roles.add_hint')}</Typography.Paragraph>

            <Form<CreateRoleRequest>
                form={form}
                layout={'vertical'}
                requiredMark={false}
                onFinish={(values) => create.mutate(values)}
            >
                <Form.Item
                    name={'code'}
                    label={t('fields.code')}
                    rules={[
                        { required: true, message: t('validation.required') },
                        { pattern: /^[A-Za-z][A-Za-z0-9_]{1,63}$/, message: t('roles.code_hint') },
                    ]}
                >
                    <Input placeholder={'SERVICE_ADVISOR'} />
                </Form.Item>
                <Form.Item
                    name={'name'}
                    label={t('fields.name')}
                    rules={[{ required: true, max: 255, message: t('validation.required') }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item name={'description'} label={t('fields.description')} rules={[{ max: 255 }]}>
                    <Input />
                </Form.Item>
                <Form.Item name={'copyFromRoleCode'} label={t('roles.copy_from')}>
                    <Select
                        allowClear
                        showSearch
                        optionFilterProp={'label'}
                        options={roles.map((role) => ({ value: role.code, label: role.name }))}
                    />
                </Form.Item>
            </Form>
        </Modal>
    )
}

export default RoleFormModal
