import { Button, Card, Checkbox, Col, Flex, Row, Typography } from 'antd'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { PermissionEntry, RoleView } from 'api/types'
import { ErrorBlock, ProtectedComponent } from 'components'
import { palette } from 'theme'
import useSaveRolePermissions from '../hooks/useSaveRolePermissions'
import { resourceOf } from '../utils/api'

interface Props {
    role: RoleView
    catalogue: PermissionEntry[]
    onCopy: () => void
}

/**
 * Everything a role grants, grouped by what it acts on. Every role here belongs to this garage,
 * including the ones it was created with, so all of them can be changed — and nobody else's are.
 */
const PermissionEditor = ({ role, catalogue, onCopy }: Props) => {
    const { t } = useTranslation()
    /* Seeded once: the page remounts this on a different role, so no tick carries across. */
    const [granted, setGranted] = useState<string[]>(role.permissions)
    const save = useSaveRolePermissions(role.id)

    const groups = useMemo(() => {
        const byResource = new Map<string, PermissionEntry[]>()
        catalogue.forEach((permission) => {
            const resource = resourceOf(permission.code)
            byResource.set(resource, [...(byResource.get(resource) ?? []), permission])
        })
        return [...byResource.entries()]
    }, [catalogue])

    const dirty = granted.length !== role.permissions.length || granted.some((code) => !role.permissions.includes(code))

    const toggle = (code: string, checked: boolean) =>
        setGranted((current) => (checked ? [...current, code] : current.filter((item) => item !== code)))

    return (
        <Card
            title={
                <Flex vertical gap={2}>
                    <Typography.Text style={{ fontWeight: 500 }}>{role.name}</Typography.Text>
                    <Typography.Text type={'secondary'} style={{ fontSize: 12 }}>
                        {role.code}
                    </Typography.Text>
                </Flex>
            }
            extra={
                <ProtectedComponent permission={'role:manage'}>
                    <Flex gap={8}>
                        <Button onClick={onCopy}>{t('roles.copy')}</Button>
                        <Button disabled={!dirty} onClick={() => setGranted(role.permissions)}>
                            {t('roles.reset')}
                        </Button>
                        <Button
                            type={'primary'}
                            disabled={!dirty}
                            loading={save.isPending}
                            onClick={() => save.mutate(granted)}
                        >
                            {t('actions.save')}
                        </Button>
                    </Flex>
                </ProtectedComponent>
            }
        >
            {save.error ? (
                <div style={{ marginBottom: 16 }}>
                    <ErrorBlock error={save.error} />
                </div>
            ) : null}

            {groups.map(([resource, permissions], index) => (
                <div
                    key={resource}
                    style={{
                        paddingTop: index === 0 ? 0 : 18,
                        marginTop: index === 0 ? 0 : 18,
                        borderTop: index === 0 ? undefined : `1px solid ${palette.border}`,
                    }}
                >
                    <Typography.Text type={'secondary'} style={{ fontSize: 12, letterSpacing: '0.04em' }}>
                        {resource.toUpperCase()}
                    </Typography.Text>
                    <Row gutter={[12, 10]} style={{ marginTop: 10 }}>
                        {permissions.map((permission) => (
                            <Col xs={24} sm={12} lg={8} key={permission.code}>
                                <Checkbox
                                    checked={granted.includes(permission.code)}
                                    onChange={(event) => toggle(permission.code, event.target.checked)}
                                >
                                    <Flex vertical>
                                        <Typography.Text>{permission.description ?? permission.code}</Typography.Text>
                                        <Typography.Text type={'secondary'} style={{ fontSize: 11 }}>
                                            {permission.code}
                                        </Typography.Text>
                                    </Flex>
                                </Checkbox>
                            </Col>
                        ))}
                    </Row>
                </div>
            ))}
        </Card>
    )
}

export default PermissionEditor
