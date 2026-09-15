import { Button, Card, Flex, Form } from 'antd'
import dayjs from 'dayjs'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useSearchParams } from 'react-router-dom'

import type { CreateVehicleRequest } from 'api/types'
import { ErrorBlock, PageHeader } from 'components'
import { pathTo, Routes } from 'routes/config'
import VehicleForm from '../components/VehicleForm'
import useVehicleMutation from '../hooks/useVehicleMutation'
import { vehiclesApi } from '../utils/api'

const VehicleNew = () => {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const [form] = Form.useForm<CreateVehicleRequest>()
    const create = useVehicleMutation(
        async (body: CreateVehicleRequest) => await vehiclesApi.create(body),
        'vehicles.saved'
    )

    /* Arriving from a customer's own page: the owner is already known. */
    useEffect(() => {
        const customerId = searchParams.get('customerId')
        if (customerId) form.setFieldsValue({ customerId })
    }, [searchParams, form])

    const onFinish = (values: CreateVehicleRequest) => {
        const recordedAt = values.mileageRecordedAt as unknown as dayjs.Dayjs | undefined
        create.mutate(
            { ...values, mileageRecordedAt: recordedAt ? recordedAt.format('YYYY-MM-DD') : undefined },
            { onSuccess: (vehicle) => navigate(pathTo(Routes.Vehicle, { vehicleId: vehicle.summary.id })) }
        )
    }

    return (
        <>
            <PageHeader title={t('pages.vehicle_new.title')} subtitle={t('vehicles.new_hint')} />
            {create.error ? (
                <div style={{ marginBottom: 16 }}>
                    <ErrorBlock error={create.error} />
                </div>
            ) : null}
            <Card style={{ maxWidth: 760 }}>
                <VehicleForm form={form} onFinish={onFinish} />
                <Flex gap={8} justify={'flex-end'}>
                    <Button onClick={() => navigate(-1)}>{t('actions.cancel')}</Button>
                    <Button type={'primary'} loading={create.isPending} onClick={() => form.submit()}>
                        {t('actions.save')}
                    </Button>
                </Flex>
            </Card>
        </>
    )
}

export default VehicleNew
