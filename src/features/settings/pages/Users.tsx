import { useQueryClient } from '@tanstack/react-query'
import { App, Card, Flex, Input, Select, Table, Tag, Typography, type TableProps } from 'antd'
import { useTranslation } from 'react-i18next'

import { ROLE_CODES, type UserResponse } from 'api/types'
import { ErrorCode } from 'api/errors'
import { ErrorBlock, PageHeader } from 'components'
import { useSession } from 'auth/session'
import { useMutation, useQuery, useTableQuery } from 'hooks'
import { formatDate } from 'utils/format'
import { userFilterKeys, userKeys, usersApi } from '../utils/api'

const Users = () => {
    const { t } = useTranslation()
    const { message } = App.useApp()
    const queryClient = useQueryClient()
    const { can, user: me, refresh } = useSession()

    const { params, filters, setFilters, onTableChange, paginationFor } = useTableQuery<UserResponse>({
        filterKeys: userFilterKeys,
    })
    const { data, isFetching, error } = useQuery({
        queryKey: ['users', 'list', params],
        queryFn: async () => await usersApi.list(params),
        placeholderData: (previous) => previous,
    })

    const setRoles = useMutation({
        mutationFn: async ({ userId, roles }: { userId: string; roles: string[] }) =>
            await usersApi.setRoles(userId, roles),
        onSuccess: async (updated) => {
            message.success(t('users.roles_changed'))
            await queryClient.invalidateQueries({ queryKey: userKeys.all })
            /* A change to your own roles takes effect on the next request, so re-read the session. */
            if (updated.id === me?.id) await refresh()
        },
        onError: (mutationError) =>
            message.error(mutationError.is(ErrorCode.LastOwner) ? t('errors.LAST_OWNER') : mutationError.message),
    })

    const columns: TableProps<UserResponse>['columns'] = [
        {
            title: t('fields.name'),
            key: 'lastName',
            sorter: true,
            render: (_, row) => (
                <Flex vertical>
                    <Typography.Text style={{ fontWeight: 500 }}>
                        {[row.firstName, row.lastName].filter(Boolean).join(' ') || '—'}
                    </Typography.Text>
                    <Typography.Text type={'secondary'} style={{ fontSize: 12 }}>
                        {row.email}
                    </Typography.Text>
                </Flex>
            ),
        },
        {
            title: t('fields.roles'),
            dataIndex: 'roles',
            width: 340,
            render: (roles: string[], row) =>
                can('user:manage-roles') ? (
                    <Select
                        mode={'multiple'}
                        value={roles}
                        style={{ width: '100%' }}
                        options={ROLE_CODES.map((role) => ({ value: role, label: role }))}
                        onChange={(next: string[]) => setRoles.mutate({ userId: row.id, roles: next })}
                    />
                ) : (
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
            render: (status: string) => (
                <Tag color={status === 'ACTIVE' ? 'green' : 'default'}>{t(`enums.user_status.${status}`)}</Tag>
            ),
        },
        { title: t('fields.created_at'), dataIndex: 'createdAt', width: 120, render: formatDate },
    ]

    return (
        <>
            <PageHeader
                title={t('pages.users.title')}
                subtitle={t('users.subtitle', { count: data?.totalElements ?? 0 })}
            />

            <Card size={'small'} style={{ marginBottom: 16 }}>
                <Flex gap={12} wrap>
                    <Input.Search
                        allowClear
                        style={{ width: 280 }}
                        placeholder={t('users.search_placeholder')}
                        defaultValue={(filters.search as string) ?? ''}
                        onSearch={(value) => setFilters({ search: value })}
                    />
                    <Select
                        allowClear
                        style={{ width: 200 }}
                        placeholder={t('fields.role')}
                        value={(filters.role as string) ?? undefined}
                        onChange={(value?: string) => setFilters({ role: value })}
                        options={ROLE_CODES.map((role) => ({ value: role, label: role }))}
                    />
                </Flex>
            </Card>

            {error ? <ErrorBlock error={error} /> : null}

            <Table<UserResponse>
                rowKey={'id'}
                dataSource={data?.items}
                columns={columns}
                loading={isFetching}
                pagination={paginationFor(data?.totalElements)}
                onChange={onTableChange}
                scroll={{ x: 900 }}
            />
        </>
    )
}

export default Users
