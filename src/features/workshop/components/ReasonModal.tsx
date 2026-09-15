import { Input, Modal } from 'antd'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

interface Props {
    title: string
    pending: boolean
    onCancel: () => void
    onConfirm: (reason: string) => void
}

/** Cancelling work is a decision, and a decision is asked to say why. Mounted only while asking. */
const ReasonModal = ({ title, pending, onCancel, onConfirm }: Props) => {
    const { t } = useTranslation()
    const [reason, setReason] = useState('')

    return (
        <Modal
            open
            title={title}
            okText={t('actions.save')}
            cancelText={t('actions.cancel')}
            okButtonProps={{ disabled: reason.trim().length === 0 }}
            confirmLoading={pending}
            onCancel={onCancel}
            onOk={() => onConfirm(reason.trim())}
        >
            <Input.TextArea
                autoFocus
                rows={3}
                value={reason}
                placeholder={t('workshop.reason_placeholder')}
                onChange={(event) => setReason(event.target.value)}
            />
        </Modal>
    )
}

export default ReasonModal
