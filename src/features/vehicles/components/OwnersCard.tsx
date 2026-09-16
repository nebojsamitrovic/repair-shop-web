import { SwapOutlined } from '@ant-design/icons'
import { Button, Card, Empty, Tag, Timeline, Typography } from 'antd'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import type { VehicleOwner } from 'api/types'
import { ProtectedComponent } from 'components'
import { pathTo, Routes } from 'routes/config'
import { formatDate } from 'utils/format'
import ChangeOwnerModal from './ChangeOwnerModal'

interface Props {
    vehicleId: string
    currentCustomerId: string
    owners: VehicleOwner[]
}

/**
 * Everybody who has owned this car.
 *
 * <p>A timeline rather than a table: the question it answers is "who had it when", and the row that
 * matters most — whoever has it now — is the one at the top.
 */
const OwnersCard = ({ vehicleId, currentCustomerId, owners }: Props) => {
    const { t } = useTranslation()
    const [changing, setChanging] = useState(false)

    return (
        <Card
            title={t('vehicles.owners')}
            extra={
                <ProtectedComponent permission={'vehicle:update'}>
                    <Button icon={<SwapOutlined />} onClick={() => setChanging(true)}>
                        {t('vehicles.change_owner')}
                    </Button>
                </ProtectedComponent>
            }
        >
            {owners.length === 0 ? (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t('vehicles.no_owners')} />
            ) : (
                <Timeline
                    items={owners.map((owner) => ({
                        color: owner.current ? 'green' : 'gray',
                        children: (
                            <>
                                <Link to={pathTo(Routes.Customer, { customerId: owner.customerId })}>
                                    {owner.customerName ?? '—'}
                                </Link>
                                {owner.current ? (
                                    <Tag color={'green'} style={{ marginInlineStart: 8 }}>
                                        {t('vehicles.current_owner')}
                                    </Tag>
                                ) : null}
                                <div>
                                    <Typography.Text type={'secondary'} style={{ fontSize: 12 }}>
                                        {formatDate(owner.ownedFrom)} —{' '}
                                        {owner.ownedUntil ? formatDate(owner.ownedUntil) : t('vehicles.until_today')}
                                    </Typography.Text>
                                </div>
                                {owner.note ? (
                                    <Typography.Text type={'secondary'} style={{ fontSize: 12 }}>
                                        {owner.note}
                                    </Typography.Text>
                                ) : null}
                            </>
                        ),
                    }))}
                />
            )}

            <ChangeOwnerModal
                vehicleId={vehicleId}
                currentCustomerId={currentCustomerId}
                open={changing}
                onClose={() => setChanging(false)}
            />
        </Card>
    )
}

export default OwnersCard
