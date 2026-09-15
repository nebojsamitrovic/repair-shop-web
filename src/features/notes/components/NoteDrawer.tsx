import { DeleteOutlined, FileOutlined, InboxOutlined, PaperClipOutlined } from '@ant-design/icons'
import {
    Button,
    Drawer,
    Flex,
    Form,
    Image,
    Input,
    List,
    Modal,
    Popconfirm,
    Progress,
    Select,
    Tag,
    Typography,
    Upload,
    type UploadFile,
} from 'antd'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { MechanicNote, NoteRequest } from 'api/types'
import { ErrorBlock } from 'components'
import { useDirectory, useQuery } from 'hooks'
import { formatBytes, formatDateTime } from 'utils/format'
import useNoteMutation from '../hooks/useNoteMutation'
import useUploadNoteFiles from '../hooks/useUploadNoteFiles'
import { noteKeys, notesApi } from '../utils/api'

interface Props {
    open: boolean
    /** Absent when writing a new one. */
    noteId?: string
    onClose: () => void
    onCreated: (note: MechanicNote) => void
}

/** One note: read by everybody, written by its author. Files are added once the note exists. */
const NoteDrawer = ({ open, noteId, onClose, onCreated }: Props) => {
    const { t } = useTranslation()
    const [form] = Form.useForm<NoteRequest>()
    const { vehicles } = useDirectory()
    const [attaching, setAttaching] = useState(false)
    const [files, setFiles] = useState<UploadFile[]>([])

    const note = useQuery({
        queryKey: noteKeys.detail(noteId ?? ''),
        queryFn: async () => await notesApi.get(noteId as string),
        enabled: Boolean(noteId) && open,
    })
    const editable = noteId ? (note.data?.editable ?? false) : true

    const save = useNoteMutation(
        async (body: NoteRequest) => (noteId ? await notesApi.update(noteId, body) : await notesApi.create(body)),
        'notes.saved'
    )
    const remove = useNoteMutation(async () => await notesApi.remove(noteId as string), 'notes.deleted')
    const removeFile = useNoteMutation(
        async (attachmentId: string) => await notesApi.removeAttachment(noteId as string, attachmentId),
        'attachments.removed'
    )
    const closeAttach = () => {
        setFiles([])
        setAttaching(false)
    }
    const upload = useUploadNoteFiles(noteId ?? '', closeAttach)

    useEffect(() => {
        if (!open) return
        form.resetFields()
        if (note.data) form.setFieldsValue(note.data as NoteRequest)
    }, [open, note.data, form])

    return (
        <Drawer
            open={open}
            onClose={onClose}
            width={640}
            title={noteId ? (note.data?.title ?? t('notes.note')) : t('notes.add')}
            footer={
                editable ? (
                    <Flex gap={8} justify={'space-between'}>
                        {noteId ? (
                            <Popconfirm
                                title={t('notes.confirm_delete')}
                                okButtonProps={{ danger: true }}
                                onConfirm={() => remove.mutate(undefined, { onSuccess: onClose })}
                            >
                                <Button danger icon={<DeleteOutlined />}>
                                    {t('actions.remove')}
                                </Button>
                            </Popconfirm>
                        ) : (
                            <span />
                        )}
                        <Flex gap={8}>
                            <Button onClick={onClose}>{t('actions.cancel')}</Button>
                            <Button type={'primary'} loading={save.isPending} onClick={() => form.submit()}>
                                {t('actions.save')}
                            </Button>
                        </Flex>
                    </Flex>
                ) : null
            }
        >
            {save.error ? (
                <div style={{ marginBottom: 16 }}>
                    <ErrorBlock error={save.error} />
                </div>
            ) : null}
            {note.data ? (
                <Typography.Paragraph type={'secondary'}>
                    {t('notes.by', { name: note.data.authorName ?? '—', date: formatDateTime(note.data.updatedAt) })}
                </Typography.Paragraph>
            ) : null}

            <Form<NoteRequest>
                form={form}
                layout={'vertical'}
                requiredMark={false}
                disabled={!editable}
                onFinish={(values) =>
                    save.mutate(values, {
                        onSuccess: (saved) => {
                            if (!noteId) onCreated(saved)
                        },
                    })
                }
            >
                <Form.Item
                    name={'title'}
                    label={t('fields.title')}
                    rules={[{ required: true, max: 255, message: t('validation.required') }]}
                >
                    <Input />
                </Form.Item>
                <Flex gap={12}>
                    <Form.Item name={'make'} label={t('fields.make')} style={{ flex: 1 }} rules={[{ max: 64 }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name={'model'} label={t('fields.model')} style={{ flex: 1 }} rules={[{ max: 64 }]}>
                        <Input />
                    </Form.Item>
                </Flex>
                <Form.Item name={'vehicleId'} label={t('fields.vehicle')} extra={t('notes.vehicle_hint')}>
                    <Select
                        allowClear
                        showSearch
                        optionFilterProp={'label'}
                        options={vehicles.map((vehicle) => ({
                            value: vehicle.id,
                            label: `${vehicle.registrationPlate} — ${vehicle.label}`,
                        }))}
                    />
                </Form.Item>
                <Form.Item name={'tags'} label={t('fields.tags')} extra={t('notes.tags_hint')} rules={[{ max: 255 }]}>
                    <Input />
                </Form.Item>
                <Form.Item name={'body'} label={t('fields.body')}>
                    <Input.TextArea rows={10} />
                </Form.Item>
            </Form>

            {noteId && note.data ? (
                <>
                    <Flex justify={'space-between'} align={'center'} style={{ marginTop: 8, marginBottom: 8 }}>
                        <Typography.Text strong>{t('attachments.title')}</Typography.Text>
                        {editable ? (
                            <Button size={'small'} icon={<PaperClipOutlined />} onClick={() => setAttaching(true)}>
                                {t('attachments.attach')}
                            </Button>
                        ) : null}
                    </Flex>
                    <List
                        size={'small'}
                        dataSource={note.data.attachments}
                        locale={{ emptyText: t('attachments.empty') }}
                        renderItem={(attachment) => (
                            <List.Item
                                actions={
                                    editable
                                        ? [
                                              <Popconfirm
                                                  key={'remove'}
                                                  title={t('attachments.confirm_remove')}
                                                  onConfirm={() => removeFile.mutate(attachment.id)}
                                              >
                                                  <Button
                                                      type={'text'}
                                                      size={'small'}
                                                      danger
                                                      icon={<DeleteOutlined />}
                                                  />
                                              </Popconfirm>,
                                          ]
                                        : []
                                }
                            >
                                <Flex gap={12} align={'center'}>
                                    {attachment.url && attachment.contentType.startsWith('image/') ? (
                                        <Image
                                            src={attachment.url}
                                            width={48}
                                            height={48}
                                            style={{ objectFit: 'cover', borderRadius: 6 }}
                                        />
                                    ) : (
                                        <FileOutlined style={{ fontSize: 22 }} />
                                    )}
                                    <Flex vertical>
                                        {attachment.url ? (
                                            <a href={attachment.url} target={'_blank'} rel={'noreferrer'}>
                                                {attachment.originalName ?? attachment.id}
                                            </a>
                                        ) : (
                                            <Typography.Text>
                                                {attachment.originalName ?? attachment.id}
                                            </Typography.Text>
                                        )}
                                        <Typography.Text type={'secondary'} style={{ fontSize: 12 }}>
                                            <Tag>{attachment.contentType}</Tag>
                                            {formatBytes(attachment.sizeBytes)}
                                        </Typography.Text>
                                    </Flex>
                                </Flex>
                            </List.Item>
                        )}
                    />
                </>
            ) : null}

            <Modal
                open={attaching}
                title={t('attachments.attach')}
                okText={t('attachments.attach_count', { count: files.length })}
                cancelText={t('actions.cancel')}
                okButtonProps={{ disabled: files.length === 0 }}
                confirmLoading={upload.isPending}
                onCancel={closeAttach}
                onOk={() => upload.mutate(files.map((file) => file.originFileObj ?? (file as unknown as File)))}
            >
                <Upload.Dragger
                    multiple
                    accept={'image/*,application/pdf,.txt,.csv,.doc,.docx,.xls,.xlsx'}
                    fileList={files}
                    beforeUpload={(_, chosen) => {
                        setFiles((current) => [...current, ...chosen])
                        return false
                    }}
                    onRemove={(file) => setFiles((current) => current.filter((item) => item.uid !== file.uid))}
                >
                    <p className={'ant-upload-drag-icon'}>
                        <InboxOutlined />
                    </p>
                    <p className={'ant-upload-text'}>{t('attachments.pick_file')}</p>
                    <p className={'ant-upload-hint'}>{t('notes.limits')}</p>
                </Upload.Dragger>
                {upload.progress ? (
                    <Progress
                        style={{ marginTop: 16 }}
                        percent={Math.round((upload.progress.done / upload.progress.total) * 100)}
                        format={() => `${upload.progress?.done ?? 0}/${upload.progress?.total ?? 0}`}
                    />
                ) : null}
            </Modal>
        </Drawer>
    )
}

export default NoteDrawer
