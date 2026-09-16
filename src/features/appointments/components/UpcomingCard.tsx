import { CalendarOutlined } from '@ant-design/icons'
import { Button, Card, Empty, Flex, Tag, Typography } from 'antd'
import dayjs from 'dayjs'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ProtectedComponent } from 'components'
import { useQuery } from 'hooks'
import useEnumLabel from 'lang/useEnumLabel'
import { formatDate } from 'utils/format'
import { appointmentKeys, appointmentsApi } from '../utils/api'
import AppointmentModal from './AppointmentModal'

interface Props {
    vehicleId: string
}

/** What is still ahead for this car, and the button that puts it in the calendar. */
const UpcomingCard = ({ vehicleId }: Props) => {
    const { t } = useTranslation()
    const enumLabel = useEnumLabel()
    const [booking, setBooking] = useState(false)
    const upcoming = useQuery({
        queryKey: appointmentKeys.upcoming(vehicleId),
        queryFn: async () => await appointmentsApi.upcoming(vehicleId),
    })

    return (
        <Card
            title={t('appointments.upcoming')}
            extra={
                <ProtectedComponent permission={'service:create'}>
                    <Button size={'small'} icon={<CalendarOutlined />} onClick={() => setBooking(true)}>
                        {t('appointments.book')}
                    </Button>
                </ProtectedComponent>
            }
        >
            {(upcoming.data ?? []).length === 0 ? (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t('appointments.none_upcoming')} />
            ) : (
                <Flex vertical gap={8}>
                    {upcoming.data?.map((item) => (
                        <Flex key={item.id} justify={'space-between'} align={'center'} gap={8}>
                            <Typography.Text>
                                <strong>{formatDate(item.startsAt)}</strong> {dayjs(item.startsAt).format('HH:mm')}–
                                {dayjs(item.endsAt).format('HH:mm')}
                            </Typography.Text>
                            <Typography.Text type={'secondary'} ellipsis style={{ flex: 1 }}>
                                {item.mechanicName ?? t('appointments.unassigned')}
                            </Typography.Text>
                            <Tag style={{ marginInlineEnd: 0 }}>{enumLabel('service_type', item.type)}</Tag>
                        </Flex>
                    ))}
                </Flex>
            )}
            <AppointmentModal open={booking} vehicleId={vehicleId} onClose={() => setBooking(false)} />
        </Card>
    )
}

export default UpcomingCard
