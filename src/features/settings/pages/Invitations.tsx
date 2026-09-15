import { useQueryClient } from '@tanstack/react-query'
import { App, Button, Card, Flex, Form, Input, Popconfirm, Select, Table, Tag, Typography, type TableProps } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ROLE_CODES, type InvitationView } from 'api/types'
import { ErrorBlock, PageHeader, ProtectedComponent } from 'components'
import { useMutation, useQuery, useTableQuery } from 'hooks'
import { formatDate } from 'utils/format'
import { invitationKeys, invitationsApi } from '../utils/api'

interface InviteForm {
    email: string
    roles: string[]
}

const Invitations = () => {
    const { t } = useTranslation()
    const { message } = App.useApp()
    const queryClient = useQueryClient()
    const [form] = Form.useForm<InviteForm>()
    const [inviting, setInviting] = useState(false)

    const { params, onTableChange, paginationFor } = useTableQuery<InvitationView>({ filterKeys: [] })
    const { data, isFetching, error } = useQuery({
        queryKey: ['invitations', params],
        queryFn: async () => await invitationsApi.list(params),
        placeholderData: (previous) => previous,
    })

    const invalidate = async () => await queryClient.invalidateQueries({ queryKey: invitationKeys.all })

    const create = useMutation({
        mutationFn: async (body: InviteForm) => await invitationsApi.create(body),
        onSuccess: async () => {
            message.success(t('invitations.sent'))
            form.resetFields()
            setInviting(false)
            await invalidate()
        },
        onError: (mutationError) => message.error(mutationError.message),
    })

    const revoke = useMutation({
        mutationFn: async (id: string) => await invitationsApi.revoke(id),
        onSuccess: async () => {
            message.success(t('invitations.revoked'))
            await invalidate()
        },
        onError: (mutationError) => message.error(mutationError.message),
    })

    const columns: TableProps<InvitationView>['columns'] = [
        {
            title: t('fields.email'),
            dataIndex: 'email',
            render: (email: string) => <Typography.Text style={{ fontWeight: 500 }}>{email}</Typography.Text>,
        },
        {
            title: t('fields.roles'),
            dataIndex: 'roles',
            width: 260,
            render: (roles: string[]) => (
                <Flex gap={4} wrap>
                    {roles.map((role) => (
                        <Tag key={role}>{role}</Tag>
                    ))}
                </Flex>
            ),
        },
        {
            title: t('fields.status'),
            dataIndex: 'status',
            width: 120,
            render: (status: string) => <Tag color={status === 'PENDING' ? 'blue' : 'default'}>{status}</Tag>,
        },
        { title: t('fields.expires_at'), dataIndex: 'expiresAt', width: 130, render: formatDate },
        {
            key: 'actions',
            width: 110,
            align: 'right',
            render: (_, row) =>
                row.status !== 'PENDING' ? null : (
                    <ProtectedComponent permission={'user:invite'}>
                        <Popconfirm title={t('invitations.confirm_revoke')} onConfirm={() => revoke.mutate(row.id)}>
                            <Button size={'small'} danger>
                                {t('invitations.revoke')}
                            </Button>
                        </Popconfirm>
                    </ProtectedComponent>
                ),
        },
    ]

    return (
        <>
            <PageHeader
                title={t('pages.invitations.title')}
                subtitle={t('invitations.subtitle', { count: data?.totalElements ?? 0 })}
                extra={
                    <ProtectedComponent permission={'user:invite'}>
                        <Button type={'primary'} icon={<PlusOutlined />} onClick={() => setInviting((open) => !open)}>
                            {t('invitations.invite')}
                        </Button>
                    </ProtectedComponent>
                }
            />

            {inviting ? (
                <Card size={'small'} style={{ marginBottom: 16 }}>
                    {create.error ? (
                        <div style={{ marginBottom: 12 }}>
                            <ErrorBlock error={create.error} />
                        </div>
                    ) : null}
                    <Form<InviteForm>
                        form={form}
                        layout={'inline'}
                        onFinish={(values) => create.mutate(values)}
                        initialValues={{ roles: ['MECHANIC'] }}
                    >
                        <Form.Item
                            name={'email'}
                            rules={[{ required: true, type: 'email', message: t('validation.email') }]}
                        >
                            <Input style={{ width: 260 }} placeholder={t('fields.email')} />
                        </Form.Item>
                        <Form.Item name={'roles'} rules={[{ required: true, message: t('validation.required') }]}>
                            <Select
                                mode={'multiple'}
                                style={{ minWidth: 240 }}
                                placeholder={t('fields.roles')}
                                options={ROLE_CODES.map((role) => ({ value: role, label: role }))}
                            />
                        </Form.Item>
                        <Button type={'primary'} htmlType={'submit'} loading={create.isPending}>
                            {t('invitations.send')}
                        </Button>
                    </Form>
                </Card>
            ) : null}

            {error ? <ErrorBlock error={error} /> : null}

            <Table<InvitationView>
                rowKey={'id'}
                dataSource={data?.items}
                columns={columns}
                loading={isFetching}
                pagination={paginationFor(data?.totalElements)}
                onChange={onTableChange}
                scroll={{ x: 820 }}
            />
        </>
    )
}

export default Invitations
