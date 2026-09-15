import { Navigate, Outlet } from 'react-router-dom'

import { useSession } from 'auth/session'
import { Routes } from 'routes/config'

interface Props {
    /** Any one of these is enough. Empty means signed in is enough. */
    permissions?: string[]
}

/** Convenience, not security — the backend checks the same permission again and is the authority. */
const ProtectedRoute = ({ permissions = [] }: Props) => {
    const { status, canAny } = useSession()

    if (status !== 'ready') return <Navigate to={Routes.Login.path} replace />
    if (!canAny(permissions)) return <Navigate to={Routes.Forbidden.path} replace />

    return <Outlet />
}

export default ProtectedRoute
