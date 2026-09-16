export interface RouteDefinition {
    path: string
    pageTitle: string
    permissions: string[]
}

export const Routes = {
    Login: { path: '/login', pageTitle: 'pages.login.title', permissions: [] },
    Onboarding: { path: '/onboarding', pageTitle: 'pages.onboarding.title', permissions: [] },

    Dashboard: { path: '/dashboard', pageTitle: 'pages.dashboard.title', permissions: ['dashboard:read'] },

    Workshop: { path: '/workshop', pageTitle: 'pages.workshop.title', permissions: ['service:read'] },
    Appointments: { path: '/appointments', pageTitle: 'pages.appointments.title', permissions: ['service:read'] },

    Vehicles: { path: '/vehicles', pageTitle: 'pages.vehicles.title', permissions: ['vehicle:read'] },
    VehicleNew: { path: '/vehicles/new', pageTitle: 'pages.vehicle_new.title', permissions: ['vehicle:create'] },
    Vehicle: { path: '/vehicles/:vehicleId', pageTitle: 'pages.vehicle.title', permissions: ['vehicle:read'] },

    Customers: { path: '/customers', pageTitle: 'pages.customers.title', permissions: ['customer:read'] },
    Customer: { path: '/customers/:customerId', pageTitle: 'pages.customer.title', permissions: ['customer:read'] },

    Notes: { path: '/notes', pageTitle: 'pages.notes.title', permissions: ['note:read'] },

    Notifications: { path: '/notifications', pageTitle: 'pages.notifications.title', permissions: [] },

    Garage: { path: '/settings/garage', pageTitle: 'pages.garage.title', permissions: ['settings:read'] },
    Locations: { path: '/settings/locations', pageTitle: 'pages.locations.title', permissions: ['location:read'] },
    Roles: { path: '/settings/roles', pageTitle: 'pages.roles.title', permissions: ['role:read'] },
    Users: { path: '/settings/users', pageTitle: 'pages.users.title', permissions: ['user:read'] },
    Invitations: { path: '/settings/invitations', pageTitle: 'pages.invitations.title', permissions: ['user:read'] },
    AuditLog: { path: '/settings/audit-log', pageTitle: 'pages.audit_log.title', permissions: ['audit:read'] },

    /** Reached from a link in an email, signed in or not. */
    PublicQuote: { path: '/q/:token', pageTitle: 'pages.public_quote.title', permissions: [] },

    Forbidden: { path: '/403', pageTitle: 'pages.forbidden.title', permissions: [] },
    NotFound: { path: '/404', pageTitle: 'pages.not_found.title', permissions: [] },
} as const satisfies Record<string, RouteDefinition>

export type RouteName = keyof typeof Routes

export const pathTo = (route: RouteDefinition, params: Record<string, string> = {}): string =>
    Object.entries(params).reduce((path, [key, value]) => path.replace(`:${key}`, value), route.path)
