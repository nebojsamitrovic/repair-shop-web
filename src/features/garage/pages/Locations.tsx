import { EditOutlined, PlusOutlined } from '@ant-design/icons'
import { App, Button, Flex, Popconfirm, Table, Tag, type TableProps } from 'antd'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'

import type { LocationView } from 'api/types'
import { ErrorBlock, PageHeader, ProtectedComponent } from 'components'
import { useMutation, useQuery } from 'hooks'
import LocationDrawer from '../components/LocationDrawer'
import { garageApi, garageKeys } from '../utils/api'

/** Where the garage works. Closed rather than deleted: the orders done there still point at it. */
const Locations = () => {
    const { t } = useTranslation()
    const { message } = App.useApp()
    const queryClient = useQueryClient()
    const [editing, setEditing] = useState<LocationView | undefined>()
    const [drawerOpen, setDrawerOpen] = useState(false)

    const locations = useQuery({ queryKey: garageKeys.locations, queryFn: garageApi.locations })

    const setActive = useMutation({
        mutationFn: async ({ id, active }: { id: string; active: boolean }) =>
            await garageApi.setLocationActive(id, active),
        onSuccess: async () => {
            message.success(t('locations.saved'))
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: garageKeys.locations }),
                queryClient.invalidateQueries({ queryKey: ['directory', 'locations'] }),
            ])
        },
        onError: (error) => message.error(error.message),
    })

    const open = (location?: LocationView) => {
        setEditing(location)
        setDrawerOpen(true)
    }

    const columns: TableProps<LocationView>['columns'] = [
        { title: t('fields.name'), dataIndex: 'name', render: (name: string) => <strong>{name}</strong> },
        {
            title: t('fields.address'),
            key: 'address',
            render: (_, row) => [row.address, row.city].filter(Boolean).join(', ') || '—',
        },
        { title: t('fields.phone'), dataIndex: 'phone', width: 160, render: (phone?: string | null) => phone ?? '—' },
        {
            title: t('fields.status'),
            dataIndex: 'active',
            width: 120,
            render: (active: boolean) => (
                <Tag color={active ? 'green' : 'default'}>{active ? t('locations.open') : t('locations.closed')}</Tag>
            ),
        },
        {
            key: 'actions',
            width: 180,
            align: 'right',
            render: (_, row) => (
                <ProtectedComponent permission={'location:manage'}>
                    <Flex gap={4} justify={'flex-end'}>
                        <Button type={'text'} size={'small'} icon={<EditOutlined />} onClick={() => open(row)} />
                        <Popconfirm
                            title={row.active ? t('locations.confirm_close') : t('locations.confirm_reopen')}
                            onConfirm={() => setActive.mutate({ id: row.id, active: !row.active })}
                        >
                            <Button type={'link'} size={'small'} danger={row.active}>
                                {row.active ? t('locations.close') : t('locations.reopen')}
                            </Button>
                        </Popconfirm>
                    </Flex>
                </ProtectedComponent>
            ),
        },
    ]

    return (
        <>
            <PageHeader
                title={t('pages.locations.title')}
                subtitle={t('locations.subtitle')}
                extra={
                    <ProtectedComponent permission={'location:manage'}>
                        <Button type={'primary'} icon={<PlusOutlined />} onClick={() => open()}>
                            {t('locations.add')}
                        </Button>
                    </ProtectedComponent>
                }
            />
            {locations.error ? <ErrorBlock error={locations.error} /> : null}
            <Table<LocationView>
                rowKey={'id'}
                dataSource={locations.data}
                columns={columns}
                loading={locations.isFetching}
                pagination={false}
                locale={{ emptyText: t('locations.empty') }}
            />
            <LocationDrawer open={drawerOpen} location={editing} onClose={() => setDrawerOpen(false)} />
        </>
    )
}

export default Locations
