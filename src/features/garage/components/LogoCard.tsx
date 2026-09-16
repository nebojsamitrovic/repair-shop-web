import { DeleteOutlined, UploadOutlined } from '@ant-design/icons'
import { App, Button, Card, Flex, Popconfirm, Typography, Upload } from 'antd'
import { useTranslation } from 'react-i18next'

import { useSession } from 'auth/session'
import { ErrorBlock } from 'components'
import { useMutation } from 'hooks'
import { garageApi } from '../utils/api'

const ACCEPTED = 'image/png,image/jpeg,image/webp,image/svg+xml'
const MAX_BYTES = 2 * 1024 * 1024

interface Props {
    editable: boolean
}

/**
 * The garage's logo, shown wherever the application would otherwise write its name.
 *
 * <p>Three steps like every other upload — ask where it may go, PUT the bytes there, then say which
 * key to use — so the image never passes through the API. The session is re-read afterwards
 * because the logo arrives with `/auth/me`, which is what the sidebar draws from.
 */
const LogoCard = ({ editable }: Props) => {
    const { t } = useTranslation()
    const { message } = App.useApp()
    const { user, refresh } = useSession()
    const logoUrl = user?.tenant.logoUrl

    const upload = useMutation({
        mutationFn: async (file: File) => {
            const target = await garageApi.presignLogo({
                fileName: file.name,
                contentType: file.type,
                sizeBytes: file.size,
            })
            const response = await fetch(target.uploadUrl, {
                method: 'PUT',
                headers: { 'Content-Type': file.type },
                body: file,
            })
            if (!response.ok) throw new Error(t('attachments.upload_failed', { name: file.name }))
            return await garageApi.changeLogo(target.storageKey)
        },
        onSuccess: async () => {
            message.success(t('garage.logo_saved'))
            await refresh()
        },
        onError: (error) => message.error(error.message),
    })

    const remove = useMutation({
        mutationFn: garageApi.removeLogo,
        onSuccess: async () => {
            message.success(t('garage.logo_removed'))
            await refresh()
        },
        onError: (error) => message.error(error.message),
    })

    return (
        <Card title={t('garage.logo.title')}>
            <Typography.Paragraph type={'secondary'}>{t('garage.logo.hint')}</Typography.Paragraph>
            {upload.error ? (
                <div style={{ marginBottom: 16 }}>
                    <ErrorBlock error={upload.error} />
                </div>
            ) : null}

            <Flex align={'center'} gap={16} wrap>
                {logoUrl ? (
                    <img
                        src={logoUrl}
                        alt={user?.tenant.name}
                        style={{ maxHeight: 56, maxWidth: 240, objectFit: 'contain' }}
                    />
                ) : (
                    <Typography.Text strong style={{ fontSize: 18 }}>
                        {user?.tenant.name}
                    </Typography.Text>
                )}

                {editable ? (
                    <Flex gap={8}>
                        <Upload
                            accept={ACCEPTED}
                            showUploadList={false}
                            beforeUpload={(file) => {
                                if (file.size > MAX_BYTES) {
                                    message.error(t('garage.logo.too_large'))
                                    return Upload.LIST_IGNORE
                                }
                                upload.mutate(file as File)
                                return false
                            }}
                        >
                            <Button icon={<UploadOutlined />} loading={upload.isPending}>
                                {logoUrl ? t('garage.logo.replace') : t('garage.logo.upload')}
                            </Button>
                        </Upload>
                        {logoUrl ? (
                            <Popconfirm title={t('garage.logo.confirm_remove')} onConfirm={() => remove.mutate()}>
                                <Button danger icon={<DeleteOutlined />} loading={remove.isPending} />
                            </Popconfirm>
                        ) : null}
                    </Flex>
                ) : null}
            </Flex>
        </Card>
    )
}

export default LogoCard
