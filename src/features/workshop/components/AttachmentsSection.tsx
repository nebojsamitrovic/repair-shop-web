import { DeleteOutlined, FileOutlined, InboxOutlined, PaperClipOutlined } from '@ant-design/icons'
import {
    App,
    Button,
    Empty,
    Flex,
    Image,
    Modal,
    Popconfirm,
    Progress,
    Select,
    Tag,
    Typography,
    Upload,
    type UploadFile,
} from 'antd'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ATTACHMENT_KINDS, type AttachmentKind, type ServiceAttachment } from 'api/types'
import { ProtectedComponent } from 'components'
import { useMutation } from 'hooks'
import useEnumLabel from 'lang/useEnumLabel'
import { palette } from 'theme'
import { formatBytes } from 'utils/format'
import useUploadAttachments from '../hooks/useUploadAttachments'
import { workshopApi, workshopKeys } from '../utils/api'

interface Props {
    orderId: string
    attachments: ServiceAttachment[]
    editable: boolean
}

/**
 * Photographs of the fault, the parts invoice, a diagnostic printout. The bytes go straight to
 * object storage with a signed URL and are read back the same way, so the API carries none of
 * them — which is also why a file can be listed here without a link: no storage configured.
 */
const AttachmentsSection = ({ orderId, attachments, editable }: Props) => {
    const { t } = useTranslation()
    const enumLabel = useEnumLabel()
    const { message } = App.useApp()
    const queryClient = useQueryClient()
    const [open, setOpen] = useState(false)
    const [kind, setKind] = useState<AttachmentKind>('FAULT_PHOTO')
    const [files, setFiles] = useState<UploadFile[]>([])

    const close = () => {
        setFiles([])
        setOpen(false)
    }
    const upload = useUploadAttachments(orderId, close)
    const remove = useMutation({
        mutationFn: async (attachmentId: string) => await workshopApi.removeAttachment(orderId, attachmentId),
        onSuccess: async () => {
            message.success(t('attachments.removed'))
            await queryClient.invalidateQueries({ queryKey: workshopKeys.detail(orderId) })
        },
        onError: (error) => message.error(error.message),
    })

    const isImage = (attachment: ServiceAttachment) => attachment.contentType.startsWith('image/')

    return (
        <>
            <Flex justify={'space-between'} align={'center'} style={{ marginBottom: 12 }}>
                <Typography.Text type={'secondary'}>{t('attachments.hint')}</Typography.Text>
                {editable ? (
                    <ProtectedComponent permission={'service:update'}>
                        <Button size={'small'} icon={<PaperClipOutlined />} onClick={() => setOpen(true)}>
                            {t('attachments.attach')}
                        </Button>
                    </ProtectedComponent>
                ) : null}
            </Flex>

            {attachments.length === 0 ? (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t('attachments.empty')} />
            ) : (
                <Image.PreviewGroup>
                    <Flex gap={12} wrap>
                        {attachments.map((attachment) => (
                            <Flex
                                key={attachment.id}
                                vertical
                                gap={6}
                                style={{
                                    width: 170,
                                    padding: 8,
                                    border: `1px solid ${palette.border}`,
                                    borderRadius: 12,
                                }}
                            >
                                {attachment.url && isImage(attachment) ? (
                                    <Image
                                        src={attachment.url}
                                        alt={attachment.originalName ?? attachment.id}
                                        height={110}
                                        style={{ objectFit: 'cover', borderRadius: 8 }}
                                    />
                                ) : (
                                    <a
                                        href={attachment.url ?? undefined}
                                        target={'_blank'}
                                        rel={'noreferrer'}
                                        style={{
                                            height: 110,
                                            borderRadius: 8,
                                            display: 'grid',
                                            placeItems: 'center',
                                            background: palette.surfaceMuted,
                                            color: attachment.url ? palette.accent : palette.textTertiary,
                                        }}
                                    >
                                        <FileOutlined style={{ fontSize: 26 }} />
                                    </a>
                                )}
                                <Tag style={{ alignSelf: 'flex-start' }}>
                                    {enumLabel('attachment_kind', attachment.kind)}
                                </Tag>
                                <Flex justify={'space-between'} align={'center'} gap={6}>
                                    <Flex vertical style={{ minWidth: 0 }}>
                                        <Typography.Text ellipsis style={{ fontSize: 12 }}>
                                            {attachment.originalName ?? attachment.id}
                                        </Typography.Text>
                                        <Typography.Text type={'secondary'} style={{ fontSize: 11 }}>
                                            {formatBytes(attachment.sizeBytes)}
                                        </Typography.Text>
                                    </Flex>
                                    {editable ? (
                                        <ProtectedComponent permission={'service:update'}>
                                            <Popconfirm
                                                title={t('attachments.confirm_remove')}
                                                onConfirm={() => remove.mutate(attachment.id)}
                                            >
                                                <Button type={'text'} size={'small'} danger icon={<DeleteOutlined />} />
                                            </Popconfirm>
                                        </ProtectedComponent>
                                    ) : null}
                                </Flex>
                            </Flex>
                        ))}
                    </Flex>
                </Image.PreviewGroup>
            )}

            <Modal
                open={open}
                width={620}
                title={t('attachments.attach')}
                okText={t('attachments.attach_count', { count: files.length })}
                cancelText={t('actions.cancel')}
                okButtonProps={{ disabled: files.length === 0 }}
                confirmLoading={upload.isPending}
                onCancel={close}
                onOk={() =>
                    upload.mutate({ kind, files: files.map((file) => file.originFileObj ?? (file as unknown as File)) })
                }
            >
                <Flex vertical gap={12}>
                    <Select<AttachmentKind>
                        value={kind}
                        onChange={setKind}
                        options={ATTACHMENT_KINDS.map((item) => ({
                            value: item,
                            label: enumLabel('attachment_kind', item),
                        }))}
                    />
                    <Upload.Dragger
                        multiple
                        accept={'image/*,application/pdf'}
                        fileList={files}
                        /* Held here rather than uploaded by antd: the PUT goes to storage, not to us. */
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
                        <p className={'ant-upload-hint'}>{t('attachments.limits')}</p>
                    </Upload.Dragger>
                    {upload.progress ? (
                        <Progress
                            percent={Math.round((upload.progress.done / upload.progress.total) * 100)}
                            format={() => `${upload.progress?.done ?? 0}/${upload.progress?.total ?? 0}`}
                        />
                    ) : null}
                </Flex>
            </Modal>
        </>
    )
}

export default AttachmentsSection
