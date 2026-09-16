import { Spin } from 'antd'
import { lazy, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { matchPath, Navigate, Route, Routes as RouterRoutes, useLocation } from 'react-router-dom'

import { useSession } from 'auth/session'
import { ProtectedRoute } from 'components'
import ErrorPage from 'features/errors/ErrorPage'
import Login from 'features/auth/pages/Login'
import Onboarding from 'features/onboarding/pages/Onboarding'
import Layout from 'layout/components/Layout'
import { Routes } from './config'

/*
 * Split per screen, so nothing but login, onboarding and the shell is in the bundle somebody
 * downloads to reach the login form.
 */
const Dashboard = lazy(async () => await import('features/dashboard/pages/Dashboard'))
const Workshop = lazy(async () => await import('features/workshop/pages/Workshop'))
const Vehicles = lazy(async () => await import('features/vehicles/pages/Vehicles'))
const VehicleDetail = lazy(async () => await import('features/vehicles/pages/VehicleDetail'))
const VehicleNew = lazy(async () => await import('features/vehicles/pages/VehicleNew'))
const Customers = lazy(async () => await import('features/customers/pages/Customers'))
const CustomerDetail = lazy(async () => await import('features/customers/pages/CustomerDetail'))
const Notes = lazy(async () => await import('features/notes/pages/Notes'))
const Notifications = lazy(async () => await import('features/notifications/pages/Notifications'))
const GarageSettings = lazy(async () => await import('features/garage/pages/GarageSettings'))
const Locations = lazy(async () => await import('features/garage/pages/Locations'))
const Roles = lazy(async () => await import('features/roles/pages/Roles'))
const Users = lazy(async () => await import('features/settings/pages/Users'))
const Invitations = lazy(async () => await import('features/settings/pages/Invitations'))
const AuditLog = lazy(async () => await import('features/settings/pages/AuditLog'))

/** Where a signed-in person lands: the dashboard if they may see it, otherwise the workshop. */
const Home = () => {
    const { can } = useSession()
    return <Navigate to={can('dashboard:read') ? Routes.Dashboard.path : Routes.Workshop.path} replace />
}

const AppRoutes = () => {
    const { t } = useTranslation()
    const location = useLocation()
    const { status } = useSession()

    useEffect(() => {
        const matched = Object.values(Routes).find((route) => matchPath(route.path, location.pathname))
        if (matched) document.title = `${t(matched.pageTitle)} · RepairShop OS`
    }, [location.pathname, t])

    if (status === 'loading') {
        return (
            <div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
                <Spin size={'large'} />
            </div>
        )
    }

    if (status === 'anonymous' || status === 'unavailable') {
        return (
            <RouterRoutes>
                <Route path={Routes.Login.path} element={<Login />} />
                <Route path={'*'} element={<Navigate to={Routes.Login.path} replace />} />
            </RouterRoutes>
        )
    }

    if (status === 'needs-bootstrap') {
        return (
            <RouterRoutes>
                <Route path={Routes.Onboarding.path} element={<Onboarding />} />
                <Route path={'*'} element={<Navigate to={Routes.Onboarding.path} replace />} />
            </RouterRoutes>
        )
    }

    return (
        <RouterRoutes>
            <Route element={<Layout />}>
                <Route element={<ProtectedRoute permissions={Routes.Dashboard.permissions} />}>
                    <Route path={Routes.Dashboard.path} element={<Dashboard />} />
                </Route>

                <Route element={<ProtectedRoute permissions={Routes.Workshop.permissions} />}>
                    <Route path={Routes.Workshop.path} element={<Workshop />} />
                </Route>

                <Route element={<ProtectedRoute permissions={Routes.VehicleNew.permissions} />}>
                    {/* Before the parametrised one, or "new" reads as a vehicle id. */}
                    <Route path={Routes.VehicleNew.path} element={<VehicleNew />} />
                </Route>
                <Route element={<ProtectedRoute permissions={Routes.Vehicles.permissions} />}>
                    <Route path={Routes.Vehicles.path} element={<Vehicles />} />
                    <Route path={Routes.Vehicle.path} element={<VehicleDetail />} />
                </Route>

                <Route element={<ProtectedRoute permissions={Routes.Customers.permissions} />}>
                    <Route path={Routes.Customers.path} element={<Customers />} />
                    <Route path={Routes.Customer.path} element={<CustomerDetail />} />
                </Route>

                <Route element={<ProtectedRoute permissions={Routes.Notes.permissions} />}>
                    <Route path={Routes.Notes.path} element={<Notes />} />
                </Route>

                <Route path={Routes.Notifications.path} element={<Notifications />} />

                <Route element={<ProtectedRoute permissions={Routes.Garage.permissions} />}>
                    <Route path={Routes.Garage.path} element={<GarageSettings />} />
                </Route>
                <Route element={<ProtectedRoute permissions={Routes.Locations.permissions} />}>
                    <Route path={Routes.Locations.path} element={<Locations />} />
                </Route>
                <Route element={<ProtectedRoute permissions={Routes.Roles.permissions} />}>
                    <Route path={Routes.Roles.path} element={<Roles />} />
                </Route>
                <Route element={<ProtectedRoute permissions={Routes.Users.permissions} />}>
                    <Route path={Routes.Users.path} element={<Users />} />
                    <Route path={Routes.Invitations.path} element={<Invitations />} />
                </Route>
                <Route element={<ProtectedRoute permissions={Routes.AuditLog.permissions} />}>
                    <Route path={Routes.AuditLog.path} element={<AuditLog />} />
                </Route>

                <Route path={Routes.Forbidden.path} element={<ErrorPage status={'403'} />} />
                <Route path={Routes.NotFound.path} element={<ErrorPage status={'404'} />} />
                <Route path={'/'} element={<Home />} />
                <Route path={Routes.Login.path} element={<Home />} />
                <Route path={Routes.Onboarding.path} element={<Home />} />
                <Route path={'*'} element={<Navigate to={Routes.NotFound.path} replace />} />
            </Route>
        </RouterRoutes>
    )
}

export default AppRoutes
