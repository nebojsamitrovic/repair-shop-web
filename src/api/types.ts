/**
 * A stand-in until `npm run api:gen` writes `src/api/schema.d.ts`; re-export from there once it exists.
 * Nullable fields are optional because the backend serialises with `non_null`: a null is absent from the
 * JSON, not present as null, so `=== null` would never match one.
 */

/** The pagination envelope every collection endpoint returns. Note: `items`, not Spring's `content`. */
export interface PageResponse<T> {
    items: T[]
    page: number
    size: number
    totalElements: number
    totalPages: number
    first: boolean
    last: boolean
}

export interface TenantSummary {
    id: string
    name: string
    slug: string
    status: 'ACTIVE' | 'SUSPENDED'
}

export interface CurrentUser {
    id: string
    firebaseUid: string
    email: string
    firstName?: string | null
    lastName?: string | null
    status: 'ACTIVE' | 'SUSPENDED'
    tenant: TenantSummary
    roles: string[]
    /** Effective permissions, for hiding controls. Never the security boundary. */
    permissions: string[]
}

export interface BootstrapRequest {
    companyName?: string
    firstName?: string
    lastName?: string
}

export const ROLE_CODES = ['OWNER', 'ADMIN', 'MECHANIC', 'RECEPTION'] as const
export type RoleCode = (typeof ROLE_CODES)[number]

export const LOCALES = ['sr', 'en'] as const
export type Locale = (typeof LOCALES)[number]

/* ---------- garage ---------- */

export const LABOUR_PRICING_MODES = ['HOURLY', 'FIXED'] as const
export type LabourPricingMode = (typeof LABOUR_PRICING_MODES)[number]

export interface LocationView {
    id: string
    name: string
    address?: string | null
    city?: string | null
    phone?: string | null
    email?: string | null
    active: boolean
}

export interface LocationRequest {
    name: string
    address?: string
    city?: string
    phone?: string
    email?: string
}

export interface GarageSettings {
    smallServiceIntervalKm: number
    bigServiceIntervalKm: number
    labourPricingMode: LabourPricingMode
    hourlyRate: number
    fixedRate: number
    /** The rate in effect under the current mode. */
    activeRate: number
    currency: string
    defaultLocale: Locale
    contactEmail?: string | null
    contactPhone?: string | null
}

export type UpdateGarageSettingsRequest = Partial<Omit<GarageSettings, 'activeRate'>>

/* ---------- customers and vehicles ---------- */

export interface CustomerView {
    id: string
    firstName?: string | null
    lastName?: string | null
    companyName?: string | null
    /** The company if there is one, otherwise the person. */
    displayName: string
    email?: string | null
    phone?: string | null
    locale: Locale
    notes?: string | null
    vehicleCount: number
    createdAt: string
}

export interface CustomerRequest {
    firstName?: string
    lastName?: string
    companyName?: string
    email?: string
    phone?: string
    locale?: Locale
    notes?: string
}

export const FUEL_TYPES = ['PETROL', 'DIESEL', 'HYBRID', 'ELECTRIC', 'LPG', 'CNG', 'OTHER'] as const
export type FuelType = (typeof FUEL_TYPES)[number]

export const SERVICE_TYPES = ['SMALL_SERVICE', 'BIG_SERVICE', 'REPAIR'] as const
export type ServiceType = (typeof SERVICE_TYPES)[number]

export interface VehicleSummary {
    id: string
    customerId: string
    customerName?: string | null
    registrationPlate: string
    vin?: string | null
    make: string
    model: string
    modelYear?: number | null
    /** Make, model and year, as the car is named everywhere. */
    label: string
    engine?: string | null
    fuelType?: FuelType | null
    mileage?: number | null
    mileageRecordedAt?: string | null
    annualMileage?: number | null
    createdAt: string
}

export interface Maintenance {
    lastSmallServiceKm?: number | null
    lastSmallServiceAt?: string | null
    lastBigServiceKm?: number | null
    lastBigServiceAt?: string | null
    smallServiceIntervalKm: number
    bigServiceIntervalKm: number
    nextSmallServiceKm?: number | null
    expectedSmallOn?: string | null
    nextBigServiceKm?: number | null
    expectedBigOn?: string | null
    /** The one service the customer will be reminded about next. */
    nextDueType?: ServiceType | null
    nextDueKm?: number | null
    nextDueOn?: string | null
}

export interface ServiceReminder {
    id: string
    serviceType: ServiceType
    dueAtMileage: number
    expectedOn: string
    sentAt: string
}

export interface VehicleDetail {
    summary: VehicleSummary
    customer: CustomerView
    notes?: string | null
    maintenance: Maintenance
    reminders: ServiceReminder[]
}

export interface CreateVehicleRequest {
    customerId: string
    registrationPlate: string
    vin?: string
    make: string
    model: string
    modelYear?: number
    engine?: string
    fuelType?: FuelType
    mileage?: number
    mileageRecordedAt?: string
    annualMileage?: number
    notes?: string
}

export type UpdateVehicleRequest = Partial<Omit<CreateVehicleRequest, 'mileage' | 'mileageRecordedAt'>>

export interface RecordMileageRequest {
    mileage: number
    recordedOn?: string
}

/* ---------- workshop ---------- */

export const SERVICE_ORDER_STATUSES = ['OPEN', 'IN_PROGRESS', 'DONE', 'CANCELLED'] as const
export type ServiceOrderStatus = (typeof SERVICE_ORDER_STATUSES)[number]

export const SERVICE_ITEM_KINDS = ['PART', 'CONSUMABLE', 'EXTERNAL', 'OTHER'] as const
export type ServiceItemKind = (typeof SERVICE_ITEM_KINDS)[number]

export const ATTACHMENT_KINDS = ['FAULT_PHOTO', 'INVOICE', 'DOCUMENT'] as const
export type AttachmentKind = (typeof ATTACHMENT_KINDS)[number]

export interface ServiceOrderSummary {
    id: string
    type: ServiceType
    status: ServiceOrderStatus
    vehicleId: string
    vehicleLabel?: string | null
    registrationPlate?: string | null
    customerId?: string | null
    customerName?: string | null
    locationId: string
    locationName?: string | null
    mechanicUserId: string
    mechanicName?: string | null
    mileage?: number | null
    description?: string | null
    /** Labour plus every line, in the order's currency. */
    total: number
    currency: string
    openedAt: string
    closedAt?: string | null
}

export interface ServiceItem {
    id: string
    kind: ServiceItemKind
    description: string
    quantity: number
    unitPrice: number
    amount: number
    currency: string
}

export interface ServiceAttachment {
    id: string
    kind: AttachmentKind
    originalName?: string | null
    contentType: string
    sizeBytes: number
    /** Short-lived signed link. Absent when no object storage is configured. */
    url?: string | null
    uploadedByUserId?: string | null
    createdAt: string
}

export interface AttachmentUpload {
    /** PUT the bytes here, with the same content type that was asked for. */
    uploadUrl: string
    storageKey: string
    expiresAt: string
}

export interface PresignAttachmentRequest {
    fileName: string
    contentType: string
    sizeBytes: number
}

export interface Labour {
    pricingMode: LabourPricingMode
    rate: number
    hours?: number | null
    cost: number
    currency: string
}

export interface ServiceOrderDetail {
    summary: ServiceOrderSummary
    annualMileage?: number | null
    closingNote?: string | null
    startedAt?: string | null
    openedByUserId: string
    /** What the order may do next. Render the buttons from this, not from a guess. */
    allowedTransitions: ServiceOrderStatus[]
    labour: Labour
    partsTotal: number
    items: ServiceItem[]
    attachments: ServiceAttachment[]
}

export interface OpenServiceOrderRequest {
    vehicleId: string
    type: ServiceType
    locationId?: string
    /** The caller when omitted; otherwise somebody holding MECHANIC. */
    mechanicUserId?: string
    mileage?: number
    annualMileage?: number
    description?: string
    labourHours?: number
}

export interface UpdateServiceOrderRequest {
    locationId?: string
    mechanicUserId?: string
    mileage?: number
    annualMileage?: number
    description?: string
    labourHours?: number
    labourPricingMode?: LabourPricingMode
    labourRate?: number
}

export interface AddServiceItemRequest {
    kind: ServiceItemKind
    description: string
    quantity: number
    unitPrice: number
}

export interface AddAttachmentRequest {
    kind: AttachmentKind
    storageKey: string
    originalName?: string
    contentType: string
    sizeBytes: number
}

/* ---------- notes ---------- */

export interface NoteAttachment {
    id: string
    originalName?: string | null
    contentType: string
    sizeBytes: number
    url?: string | null
    createdAt: string
}

export interface MechanicNote {
    id: string
    authorUserId: string
    authorName?: string | null
    title: string
    body?: string | null
    make?: string | null
    model?: string | null
    vehicleId?: string | null
    /** Comma-separated. */
    tags?: string | null
    /** Whether the caller may change or remove this note. */
    editable: boolean
    attachments: NoteAttachment[]
    createdAt: string
    updatedAt: string
}

export interface NoteRequest {
    title?: string
    body?: string
    make?: string
    model?: string
    vehicleId?: string
    tags?: string
}

export interface AddNoteAttachmentRequest {
    storageKey: string
    originalName?: string
    contentType: string
    sizeBytes: number
}

/* ---------- dashboard ---------- */

export interface DashboardView {
    workshop: {
        openOrders: number
        inProgress: number
        doneThisMonth: number
        revenueThisMonth: number
        currency: string
    }
    customers: {
        customers: number
        vehicles: number
        dueWithin30Days: number
        remindersThisMonth: number
    }
    /** One row per month, oldest first, gaps included, so a chart has no holes. */
    ordersByMonth: { month: string; count: number; revenue: number }[]
    ordersByType: Partial<Record<ServiceType, number>>
    dueSoon: {
        vehicleId: string
        registrationPlate: string
        label: string
        customerName?: string | null
        type: ServiceType
        atMileage: number
        expectedOn: string
        /** Negative when overdue. */
        daysLeft: number
    }[]
    recentOrders: ServiceOrderSummary[]
}

/* ---------- platform ---------- */

export interface NotificationView {
    id: string
    type: string
    title: string
    body?: string | null
    entityType?: string | null
    entityId?: string | null
    read: boolean
    readAt?: string | null
    createdAt: string
}

export interface UserResponse {
    id: string
    email: string
    firstName?: string | null
    lastName?: string | null
    status: 'ACTIVE' | 'SUSPENDED'
    membershipStatus: string
    roles: string[]
    createdAt: string
}

export interface InvitationView {
    id: string
    email: string
    roles: string[]
    status: string
    expiresAt: string
    createdAt: string
    /** Only returned once, when the invitation is created. */
    token?: string | null
}

export interface AuditLogView {
    id: string
    userId?: string | null
    action: string
    entityType: string
    entityId?: string | null
    oldValue?: string | null
    newValue?: string | null
    createdAt: string
}

export interface RoleView {
    id: string
    code: string
    name: string
    description?: string | null
    /** One of the roles this garage was created with, rather than one it added. */
    shipped: boolean
    permissions: string[]
}

export interface PermissionEntry {
    code: string
    description?: string | null
}

export interface CreateRoleRequest {
    code: string
    name: string
    description?: string
    /** Start from what this role grants, which is how a system role gets narrowed. */
    copyFromRoleCode?: string
}
