import { Button, Card, Col, Flex, List, Row, Skeleton, Tag, Typography } from 'antd'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ErrorBlock, PageHeader, ProtectedComponent } from 'components'
import PermissionEditor from '../components/PermissionEditor'
import RoleFormModal from '../components/RoleFormModal'
import usePermissionCatalogue from '../hooks/usePermissionCatalogue'
import useRolesQuery from '../hooks/useRolesQuery'

/** Roles on the left, what the selected one grants on the right. */
const Roles = () => {
    const { t } = useTranslation()
    const roles = useRolesQuery()
    const catalogue = usePermissionCatalogue()
    const [selectedId, setSelectedId] = useState<string>()
    const [creating, setCreating] = useState(false)
    const [copyFrom, setCopyFrom] = useState<string>()

    const error = roles.error ?? catalogue.error
    if (error) return <ErrorBlock error={error} />
    if (roles.isLoading || catalogue.isLoading || !roles.data || !catalogue.data) return <Skeleton active />

    const selected = roles.data.find((role) => role.id === selectedId) ?? roles.data[0]

    const startCopy = (code?: string) => {
        setCopyFrom(code)
        setCreating(true)
    }

    return (
        <>
            <PageHeader
                title={t('pages.roles.title')}
                subtitle={t('roles.subtitle', { count: roles.data.length })}
                extra={
                    <ProtectedComponent permission={'role:manage'}>
                        <Button type={'primary'} onClick={() => startCopy(undefined)}>
                            {t('roles.add')}
                        </Button>
                    </ProtectedComponent>
                }
            />

            <Row gutter={[16, 16]}>
                <Col xs={24} lg={7}>
                    <Card styles={{ body: { padding: 8 } }}>
                        <List
                            dataSource={roles.data}
                            renderItem={(role) => (
                                <List.Item
                                    onClick={() => setSelectedId(role.id)}
                                    style={{
                                        cursor: 'pointer',
                                        padding: '10px 12px',
                                        borderRadius: 8,
                                        border: 'none',
                                        background: role.id === selected?.id ? 'rgba(0, 113, 227, 0.08)' : undefined,
                                    }}
                                >
                                    <Flex vertical gap={2} style={{ width: '100%' }}>
                                        <Flex align={'center'} justify={'space-between'} gap={8}>
                                            <Typography.Text style={{ fontWeight: 500 }}>{role.name}</Typography.Text>
                                            {role.shipped ? null : <Tag color={'blue'}>{t('roles.own')}</Tag>}
                                        </Flex>
                                        <Typography.Text type={'secondary'} style={{ fontSize: 12 }}>
                                            {t('roles.permission_count', { count: role.permissions.length })}
                                        </Typography.Text>
                                    </Flex>
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>

                <Col xs={24} lg={17}>
                    {selected ? (
                        <PermissionEditor
                            key={selected.id}
                            role={selected}
                            catalogue={catalogue.data}
                            onCopy={() => startCopy(selected.code)}
                        />
                    ) : null}
                </Col>
            </Row>

            <RoleFormModal
                open={creating}
                roles={roles.data}
                copyFrom={copyFrom}
                onClose={() => setCreating(false)}
                onCreated={(role) => setSelectedId(role.id)}
            />
        </>
    )
}

export default Roles
