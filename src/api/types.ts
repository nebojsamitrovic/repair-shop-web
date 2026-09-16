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
    /** Short-lived signed link to the garage's logo; absent until one is uploaded. */
    logoUrl?: string | null
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

/** Where to PUT the logo, and the key to register it under afterwards. */
export interface LogoUpload {
    uploadUrl: string
    storageKey: string
    expiresAt: string
}

export interface GarageLogo {
    /** Short-lived link to the logo, or absent when the garage is shown by name. */
    url?: string | null
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
    /** Their Viber subscriber id; set once they opened the garage's bot. */
    viberId?: string | null
    /** viber://pa?… link that opens the garage's bot as this customer; absent when Viber is off. */
    viberLink?: string | null
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
    viberId?: string
}

export interface ViberSettings {
    enabled: boolean
    /** The token itself is never returned. */
    tokenSet: boolean
    botUri?: string | null
    webhookUrl: string
}

export interface ConfigureViberRequest {
    enabled: boolean
    /** Omitted keeps the token on record; empty removes it. */
    authToken?: string
    botUri?: string
}

export interface ViberWebhook {
    url: string
    answer: string
}

export const FUEL_TYPES = ['PETROL', 'DIESEL', 'HYBRID', 'ELECTRIC', 'LPG', 'CNG', 'OTHER'] as const
export type FuelType = (typeof FUEL_TYPES)[number]

export const SERVICE_TYPES = ['SMALL_SERVICE', 'BIG_SERVICE', 'REPAIR', 'DIAGNOSTICS'] as const
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

/** One owner of a car, and for how long they had it. */
export interface VehicleOwner {
    id: string
    customerId: string
    customerName?: string | null
    ownedFrom: string
    /** Absent while this is the owner. */
    ownedUntil?: string | null
    current: boolean
    note?: string | null
}

export interface VehicleDetail {
    summary: VehicleSummary
    customer: CustomerView
    notes?: string | null
    maintenance: Maintenance
    reminders: ServiceReminder[]
    /** Every owner the garage has known, newest first. */
    owners: VehicleOwner[]
}

export interface ChangeOwnerRequest {
    customerId: string
    /** The day it changed hands; today when omitted. */
    on?: string
    note?: string
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

/** One line of parts. The amount is computed by the backend; the form only shows it. */
export interface ServicePart {
    description: string
    quantity: number
    unitPrice: number
    amount: number
    /** The part on the shelf this line took, when it did. */
    stockItemId?: string | null
}

/** What is sent: no amount, the backend computes it. */
export interface ServicePartRequest {
    description: string
    quantity: number
    unitPrice?: number
    /** Set when the part comes off the shelf; the backend takes it from stock. */
    stockItemId?: string
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
    parts: ServicePart[]
    attachments: ServiceAttachment[]
    /** Absent until the customer accepts the quote from the link in their email. */
    quoteApproval?: QuoteApproval | null
}

export interface QuoteApproval {
    approvedAt: string
    approvedBy: string
    /** The total as it stood then; compare with the order's total. */
    approvedTotal: number
}

/** The quote as the customer sees it from the link in their email. */
export interface PublicQuote {
    garageName: string
    garagePhone?: string | null
    garageEmail?: string | null
    reference: string
    customerName?: string | null
    language: Locale
    vehicleLabel: string
    registrationPlate: string
    type: ServiceType
    description?: string | null
    mileage?: number | null
    labour: Labour
    parts: ServicePart[]
    partsTotal: number
    total: number
    currency: string
    status: ServiceOrderStatus
    canApprove: boolean
    approval?: QuoteApproval | null
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
    /** How this job is priced; the garage's setting when omitted. */
    labourPricingMode?: LabourPricingMode
    /** Per hour, or the agreed price of the job under FIXED. */
    labourRate?: number
    parts?: ServicePartRequest[]
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
    /** Replaces the whole list when present. */
    parts?: ServicePartRequest[]
}

/** One finished job as the service book lists it. */
export interface ServiceBookEntry {
    orderId: string
    type: ServiceType
    /** The day the work was finished. */
    on: string
    mileage?: number | null
    description?: string | null
    closingNote?: string | null
    mechanicName?: string | null
    locationName?: string | null
    parts: ServicePart[]
    labourCost: number
    partsTotal: number
    total: number
}

/** The car's history of finished work: what the customer is handed or emailed. */
export interface ServiceBook {
    vehicleId: string
    vehicleLabel: string
    registrationPlate: string
    vin?: string | null
    customerId?: string | null
    customerName?: string | null
    mileage?: number | null
    currency: string
    serviceCount: number
    totalSpent: number
    firstServiceOn?: string | null
    lastServiceOn?: string | null
    entries: ServiceBookEntry[]
    generatedAt: string
}

export interface SendDocumentRequest {
    /** The customer's address on file when omitted. */
    to?: string
    lang?: Locale
}

export interface DocumentSent {
    recipient: string
}

export interface AddAttachmentRequest {
    kind: AttachmentKind
    storageKey: string
    originalName?: string
    contentType: string
    sizeBytes: number
}

/* ---------- appointments ---------- */

export const APPOINTMENT_STATUSES = ['SCHEDULED', 'CONVERTED', 'CANCELLED', 'NO_SHOW'] as const
export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number]

export interface Appointment {
    id: string
    vehicleId: string
    vehicleLabel?: string | null
    registrationPlate?: string | null
    customerId?: string | null
    customerName?: string | null
    customerPhone?: string | null
    locationId: string
    locationName?: string | null
    mechanicUserId?: string | null
    mechanicName?: string | null
    type: ServiceType
    status: AppointmentStatus
    startsAt: string
    endsAt: string
    note?: string | null
    /** The order opened from this booking, once the car came in. */
    serviceOrderId?: string | null
}

export interface BookAppointmentRequest {
    vehicleId: string
    locationId?: string
    mechanicUserId?: string
    type: ServiceType
    startsAt: string
    endsAt: string
    note?: string
}

export interface UpdateAppointmentRequest {
    startsAt?: string
    endsAt?: string
    locationId?: string
    mechanicUserId?: string
    type?: ServiceType
    note?: string
}

/** What the desk learns when the car comes in; the rest is on the booking. */
export interface ArrivalRequest {
    mileage?: number
    annualMileage?: number
    description?: string
}

/* ---------- stock ---------- */

export const STOCK_CONDITIONS = ['USED', 'REFURBISHED', 'NEW'] as const
export type StockCondition = (typeof STOCK_CONDITIONS)[number]

export const MOVEMENT_KINDS = ['RECEIVED', 'FITTED', 'RETURNED', 'ADJUSTED'] as const
export type MovementKind = (typeof MOVEMENT_KINDS)[number]

export interface StockItem {
    id: string
    name: string
    partNumber?: string | null
    fits?: string | null
    condition: StockCondition
    quantity: number
    unitPrice: number
    currency: string
    source?: string | null
    note?: string | null
    locationId?: string | null
    locationName?: string | null
    createdAt: string
    updatedAt: string
}

export interface StockMovement {
    id: string
    kind: MovementKind
    /** Signed: what the shelf gained or lost. */
    quantity: number
    serviceOrderId?: string | null
    userId?: string | null
    userName?: string | null
    note?: string | null
    at: string
}

export interface CreateStockItemRequest {
    name: string
    partNumber?: string
    fits?: string
    condition?: StockCondition
    quantity?: number
    unitPrice: number
    source?: string
    note?: string
    locationId?: string
}

export type UpdateStockItemRequest = Partial<Omit<CreateStockItemRequest, 'quantity'>>

export interface ReceiveStockRequest {
    quantity: number
    note?: string
}

export interface CountStockRequest {
    counted: number
    note?: string
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
