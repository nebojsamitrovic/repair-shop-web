import { Card, Input, Table, Tag, Typography, type TableProps } from 'antd'
import { useTranslation } from 'react-i18next'

import type { AuditLogView } from 'api/types'
import { ErrorBlock, PageHeader } from 'components'
import { useQuery, useTableQuery } from 'hooks'
import { formatDateTime } from 'utils/format'
import { auditApi, auditFilterKeys } from '../utils/api'

const AuditLog = () => {
    const { t } = useTranslation()
    const { params, filters, setFilters, onTableChange, paginationFor } = useTableQuery<AuditLogView>({
        filterKeys: auditFilterKeys,
    })
    const { data, isFetching, error } = useQuery({
        queryKey: ['audit-logs', params],
        queryFn: async () => await auditApi.list(params),
        placeholderData: (previous) => previous,
    })

    const columns: TableProps<AuditLogView>['columns'] = [
        { title: t('fields.when'), dataIndex: 'createdAt', sorter: true, width: 160, render: formatDateTime },
        { title: t('fields.action'), dataIndex: 'action', width: 240, render: (action: string) => <Tag>{action}</Tag> },
        { title: t('fields.entity'), dataIndex: 'entityType', width: 130 },
        {
            title: t('fields.change'),
            key: 'change',
            render: (_, row) =>
                row.oldValue || row.newValue ? (
                    <Typography.Text type={'secondary'} style={{ fontSize: 12 }}>
                        {row.oldValue ?? '—'} → {row.newValue ?? '—'}
                    </Typography.Text>
                ) : (
                    '—'
                ),
        },
    ]

    return (
        <>
            <PageHeader
                title={t('pages.audit_log.title')}
                subtitle={t('audit.subtitle', { count: data?.totalElements ?? 0 })}
            />

            <Card size={'small'} style={{ marginBottom: 16 }}>
                <Input.Search
                    allowClear
                    style={{ maxWidth: 360 }}
                    placeholder={t('audit.search_placeholder')}
                    defaultValue={(filters.action as string) ?? ''}
                    onSearch={(value) => setFilters({ action: value })}
                />
            </Card>

            {error ? <ErrorBlock error={error} /> : null}

            <Table<AuditLogView>
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

export default AuditLog
