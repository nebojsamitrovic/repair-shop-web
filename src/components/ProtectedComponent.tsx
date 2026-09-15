import type { ReactElement } from 'react'

import { useSession } from 'auth/session'

interface Props {
    permission: string
    children: ReactElement
    /** Shown instead when the permission is missing. Nothing, by default. */
    fallback?: ReactElement | null
}

/** Hides one control the caller may not use. `<ProtectedComponent permission="vehicle:create">`. */
const ProtectedComponent = ({ permission, children, fallback = null }: Props) => {
    const { can } = useSession()
    return can(permission) ? children : fallback
}

export default ProtectedComponent
