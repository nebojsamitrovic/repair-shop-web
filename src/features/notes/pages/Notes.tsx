import { PaperClipOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, Card, Checkbox, Flex, Input, List, Tag, Typography } from 'antd'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { MechanicNote } from 'api/types'
import { ErrorBlock, PageHeader, ProtectedComponent } from 'components'
import { useQuery, useTableQuery } from 'hooks'
import { formatDateTime } from 'utils/format'
import NoteDrawer from '../components/NoteDrawer'
import { noteFilterKeys, noteKeys, notesApi } from '../utils/api'

/** The mechanics' notebook, searchable by car and by what a note says. */
const Notes = () => {
    const { t } = useTranslation()
    const { params, filters, setFilters, paginationFor } = useTableQuery<MechanicNote>({
        filterKeys: noteFilterKeys,
        defaultSort: 'updatedAt,desc',
    })
    const { data, isFetching, error } = useQuery({
        queryKey: noteKeys.list(params),
        queryFn: async () => await notesApi.list(params),
        placeholderData: (previous) => previous,
    })
    const [openId, setOpenId] = useState<string>()
    const [drawerOpen, setDrawerOpen] = useState(false)

    const open = (noteId?: string) => {
        setOpenId(noteId)
        setDrawerOpen(true)
    }

    const pagination = paginationFor(data?.totalElements)

    return (
        <>
            <PageHeader
                title={t('pages.notes.title')}
                subtitle={t('notes.subtitle', { count: data?.totalElements ?? 0 })}
                extra={
                    <ProtectedComponent permission={'note:create'}>
                        <Button type={'primary'} icon={<PlusOutlined />} onClick={() => open()}>
                            {t('notes.add')}
                        </Button>
                    </ProtectedComponent>
                }
            />

            <Card size={'small'} style={{ marginBottom: 16 }}>
                <Flex gap={12} wrap align={'center'}>
                    <Input.Search
                        allowClear
                        style={{ maxWidth: 320 }}
                        placeholder={t('notes.search_placeholder')}
                        defaultValue={(filters.search as string) ?? ''}
                        onSearch={(value) => setFilters({ search: value })}
                    />
                    <Input
                        allowClear
                        style={{ maxWidth: 160 }}
                        placeholder={t('fields.make')}
                        defaultValue={(filters.make as string) ?? ''}
                        onBlur={(event) => setFilters({ make: event.target.value })}
                        onPressEnter={(event) => setFilters({ make: (event.target as HTMLInputElement).value })}
                    />
                    <Input
                        allowClear
                        style={{ maxWidth: 160 }}
                        placeholder={t('fields.model')}
                        defaultValue={(filters.model as string) ?? ''}
                        onBlur={(event) => setFilters({ model: event.target.value })}
                        onPressEnter={(event) => setFilters({ model: (event.target as HTMLInputElement).value })}
                    />
                    <Checkbox
                        checked={filters.mine === 'true'}
                        onChange={(event) => setFilters({ mine: event.target.checked ? 'true' : undefined })}
                    >
                        {t('notes.mine')}
                    </Checkbox>
                </Flex>
            </Card>

            {error ? <ErrorBlock error={error} /> : null}

            <List<MechanicNote>
                loading={isFetching}
                dataSource={data?.items}
                locale={{ emptyText: t('notes.empty') }}
                pagination={{
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    total: pagination.total,
                    showSizeChanger: true,
                    onChange: (page, pageSize) => setFilters({ page: page - 1, size: pageSize }),
                }}
                renderItem={(note) => (
                    <Card size={'small'} style={{ marginBottom: 12, cursor: 'pointer' }} onClick={() => open(note.id)}>
                        <Flex justify={'space-between'} gap={16}>
                            <Flex vertical gap={4} style={{ minWidth: 0 }}>
                                <Typography.Text strong>{note.title}</Typography.Text>
                                <Typography.Paragraph type={'secondary'} ellipsis={{ rows: 2 }} style={{ margin: 0 }}>
                                    {note.body ?? ''}
                                </Typography.Paragraph>
                                <Flex gap={6} wrap>
                                    {note.make || note.model ? (
                                        <Tag color={'blue'}>{[note.make, note.model].filter(Boolean).join(' ')}</Tag>
                                    ) : null}
                                    {(note.tags ?? '')
                                        .split(',')
                                        .filter(Boolean)
                                        .map((tag) => (
                                            <Tag key={tag}>{tag}</Tag>
                                        ))}
                                    {note.attachments.length > 0 ? (
                                        <Tag icon={<PaperClipOutlined />}>{note.attachments.length}</Tag>
                                    ) : null}
                                </Flex>
                            </Flex>
                            <Typography.Text type={'secondary'} style={{ fontSize: 12, whiteSpace: 'nowrap' }}>
                                {note.authorName ?? '—'} · {formatDateTime(note.updatedAt)}
                            </Typography.Text>
                        </Flex>
                    </Card>
                )}
            />

            <NoteDrawer
                open={drawerOpen}
                noteId={openId}
                onClose={() => setDrawerOpen(false)}
                onCreated={(note) => setOpenId(note.id)}
            />
        </>
    )
}

export default Notes
