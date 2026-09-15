import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, Card, Flex, Input, Popconfirm, Table, Tag, Typography, type TableProps } from 'antd'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import type { CustomerView } from 'api/types'
import { ErrorBlock, PageHeader, ProtectedComponent } from 'components'
import { useTableQuery } from 'hooks'
import { pathTo, Routes } from 'routes/config'
import { formatDate } from 'utils/format'
import CustomerDrawer from '../components/CustomerDrawer'
import useCustomersQuery from '../hooks/useCustomersQuery'
import useDeleteCustomer from '../hooks/useDeleteCustomer'
import { customerFilterKeys } from '../utils/api'

const Customers = () => {
    const { t } = useTranslation()
    const { params, filters, setFilters, onTableChange, paginationFor } = useTableQuery<CustomerView>({
        filterKeys: customerFilterKeys,
    })
    const { data, isFetching, error } = useCustomersQuery(params)
    const remove = useDeleteCustomer()

    const [editing, setEditing] = useState<CustomerView | undefined>()
    const [drawerOpen, setDrawerOpen] = useState(false)

    const open = (customer?: CustomerView) => {
        setEditing(customer)
        setDrawerOpen(true)
    }

    const columns: TableProps<CustomerView>['columns'] = [
        {
            title: t('fields.name'),
            key: 'lastName',
            sorter: true,
            render: (_, customer) => (
                <Link to={pathTo(Routes.Customer, { customerId: customer.id })} style={{ fontWeight: 500 }}>
                    {customer.displayName}
                </Link>
            ),
        },
        { title: t('fields.email'), dataIndex: 'email', render: (email: string | null) => email ?? '—' },
        { title: t('fields.phone'), dataIndex: 'phone', width: 170, render: (phone: string | null) => phone ?? '—' },
        {
            title: t('fields.language'),
            dataIndex: 'locale',
            width: 90,
            render: (locale: string) => <Tag>{locale.toUpperCase()}</Tag>,
        },
        {
            title: t('fields.vehicles'),
            dataIndex: 'vehicleCount',
            width: 90,
            align: 'right',
            render: (count: number) => <Typography.Text>{count}</Typography.Text>,
        },
        { title: t('fields.created_at'), dataIndex: 'createdAt', width: 130, sorter: true, render: formatDate },
        {
            key: 'actions',
            width: 96,
            align: 'right',
            render: (_, customer) => (
                <Flex gap={4} justify={'flex-end'}>
                    <ProtectedComponent permission={'customer:update'}>
                        <Button type={'text'} size={'small'} icon={<EditOutlined />} onClick={() => open(customer)} />
                    </ProtectedComponent>
                    <ProtectedComponent permission={'customer:delete'}>
                        <Popconfirm
                            title={t('customers.confirm_delete')}
                            onConfirm={() => remove.mutate(customer.id)}
                            okButtonProps={{ danger: true }}
                        >
                            <Button type={'text'} size={'small'} danger icon={<DeleteOutlined />} />
                        </Popconfirm>
                    </ProtectedComponent>
                </Flex>
            ),
        },
    ]

    return (
        <>
            <PageHeader
                title={t('pages.customers.title')}
                subtitle={t('customers.subtitle', { count: data?.totalElements ?? 0 })}
                extra={
                    <ProtectedComponent permission={'customer:create'}>
                        <Button type={'primary'} icon={<PlusOutlined />} onClick={() => open()}>
                            {t('customers.add')}
                        </Button>
                    </ProtectedComponent>
                }
            />

            <Card size={'small'} style={{ marginBottom: 16 }}>
                <Input.Search
                    allowClear
                    style={{ maxWidth: 360 }}
                    placeholder={t('customers.search_placeholder')}
                    defaultValue={(filters.search as string) ?? ''}
                    onSearch={(value) => setFilters({ search: value })}
                />
            </Card>

            {error ? <ErrorBlock error={error} /> : null}

            <Table<CustomerView>
                rowKey={'id'}
                dataSource={data?.items}
                columns={columns}
                loading={isFetching}
                pagination={paginationFor(data?.totalElements)}
                onChange={onTableChange}
                scroll={{ x: 820 }}
            />

            <CustomerDrawer open={drawerOpen} customer={editing} onClose={() => setDrawerOpen(false)} />
        </>
    )
}

export default Customers
