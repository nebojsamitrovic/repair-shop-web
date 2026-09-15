import { Routes, type RouteDefinition } from 'routes/config'

export interface NavigationItem {
    key: string
    labelKey: string
    icon: 'tool' | 'car' | 'team' | 'book' | 'shop' | 'setting' | 'user' | 'mail' | 'history' | 'key'
    route: RouteDefinition
}

export interface NavigationGroup {
    key: string
    labelKey: string | null
    items: NavigationItem[]
}

/** The sidebar. Each entry carries its own permission, so the menu filters itself. */
export const navigation: NavigationGroup[] = [
    {
        key: 'main',
        labelKey: null,
        items: [
            { key: 'workshop', labelKey: 'nav.workshop', icon: 'tool', route: Routes.Workshop },
            { key: 'vehicles', labelKey: 'nav.vehicles', icon: 'car', route: Routes.Vehicles },
            { key: 'customers', labelKey: 'nav.customers', icon: 'team', route: Routes.Customers },
            { key: 'notes', labelKey: 'nav.notes', icon: 'book', route: Routes.Notes },
        ],
    },
    {
        key: 'settings',
        labelKey: 'nav.settings',
        items: [
            { key: 'garage', labelKey: 'nav.garage', icon: 'setting', route: Routes.Garage },
            { key: 'locations', labelKey: 'nav.locations', icon: 'shop', route: Routes.Locations },
            { key: 'users', labelKey: 'nav.users', icon: 'user', route: Routes.Users },
            { key: 'roles', labelKey: 'nav.roles', icon: 'key', route: Routes.Roles },
            { key: 'invitations', labelKey: 'nav.invitations', icon: 'mail', route: Routes.Invitations },
            { key: 'audit-log', labelKey: 'nav.audit_log', icon: 'history', route: Routes.AuditLog },
        ],
    },
]
