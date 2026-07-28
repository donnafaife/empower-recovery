// Types below mirror the *exact* JSON shapes returned by backend/src/routes/*.ts.
// Every field here corresponds to a `select`/response object actually present
// in the route handlers - nothing here is speculative. Where the backend does
// not expose a field the design brief asked for (e.g. User.lastLogin,
// User.status, a visitor-level OS/referrer/landing-page column, any
// time-series or aggregation endpoint), it is intentionally omitted rather
// than invented, and the corresponding UI surfaces an explicit "not
// available" state instead of fabricating a value.

export interface ApiEnvelope<T> {
  success: true
  message: string
  data: T
}

export interface ApiErrorBody {
  success: false
  message: string
  details?: Record<string, string[] | undefined> | unknown
}

export type Role = 'USER' | 'ADMIN' | 'SUPER_ADMIN'
export type LeadStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CONVERTED' | 'CLOSED'

// ---- auth.routes.ts / users.routes.ts ----

export interface AuthUser {
  id: string
  email: string
  name: string
  role: Role
}

export interface LoginResponse {
  user: AuthUser
  token: string
}

export interface CurrentUserResponse {
  user: AuthUser
}

export interface AdminUserListItem {
  id: string
  name: string
  email: string
  role: Role
  createdAt: string
}

// ---- adminDashboard.routes.ts ----

export interface DashboardStats {
  visitorsToday: number
  visitorsThisWeek: number
  returningVisitors: number
  activeSessions: number
  totalPageViews: number
  totalEvents: number
  totalLeads: number
  newLeads: number
}

export type HealthStatus = 'healthy' | 'warning' | 'error'

export interface HealthCheckItem {
  status: HealthStatus
  message: string
}

export interface DashboardHealth {
  backendApi: HealthCheckItem
  database: HealthCheckItem
  telemetry: HealthCheckItem
  geoDatabase: HealthCheckItem
}

export interface RecentActivityVisitor {
  id: string
  browser: string | null
  device: string | null
  country: string | null
  city: string | null
  referrer: string | null
  createdAt: string
}

export interface RecentActivityPageView {
  id: string
  page: string
  duration: number | null
  visitorId: string
  createdAt: string
}

export interface RecentActivityEvent {
  id: string
  eventName: string
  metadata: unknown
  visitorId: string
  createdAt: string
}

export interface RecentActivityLead {
  id: string
  name: string
  email: string
  status: LeadStatus
  createdAt: string
}

export interface RecentActivity {
  visitors: RecentActivityVisitor[]
  pageViews: RecentActivityPageView[]
  events: RecentActivityEvent[]
  leads: RecentActivityLead[]
}

// ---- adminLeads.routes.ts ----

export interface Pagination {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export interface LeadListItem {
  id: string
  name: string
  email: string
  phone: string | null
  status: LeadStatus
  createdAt: string
  updatedAt: string
}

export interface LeadListResponse {
  leads: LeadListItem[]
  pagination: Pagination
}

export interface Lead extends LeadListItem {
  message: string | null
  notes: string | null
}

// ---- adminAnalytics.routes.ts ----

export type BrowserName = 'Chrome' | 'Firefox' | 'Safari' | 'Edge' | 'Other' | 'unknown'
export type DeviceType = 'desktop' | 'mobile' | 'tablet' | 'unknown'
export type VisitorSortBy = 'firstSeen' | 'sessionCount' | 'pageViewCount' | 'eventCount'
export type VisitorType = 'returning' | 'new'

export interface VisitorListItem {
  id: string
  browser: BrowserName | null
  device: DeviceType | null
  country: string | null
  region: string | null
  city: string | null
  firstVisit: string
  lastVisit: string | null
  sessionCount: number
  pageViewCount: number
  eventCount: number
}

export interface VisitorListResponse {
  visitors: VisitorListItem[]
  pagination: Pagination
}

export interface VisitorDetail {
  id: string
  firstVisit: string
  lastVisit: string | null
  returningVisitor: boolean
  sessionCount: number
  pageViewCount: number
  eventCount: number
  referrer: string | null
  device: {
    browser: BrowserName | null
    browserVersion: string | null
    os: string | null
    deviceType: DeviceType | null
    screenSize: null
    language: null
  }
  location: {
    country: string | null
    region: string | null
    city: string | null
    timezone: string | null
    latitude: number | null
    longitude: number | null
  }
}

export interface VisitorSessionListItem {
  id: string
  startTime: string
  endTime: string | null
  durationSeconds: number | null
  referrer: string | null
  landingPage: string | null
  exitPage: string | null
  pageViewCount: number
  eventCount: number
}

export interface VisitorSessionListResponse {
  sessions: VisitorSessionListItem[]
  pagination: Pagination
}

export interface SessionDetailPageView {
  id: string
  page: string
  duration: number | null
  timestamp: string
  secondsSincePreviousPage: number | null
}

export interface SessionDetailEvent {
  id: string
  eventName: string
  metadata: unknown
  timestamp: string
}

export interface SessionDetail {
  id: string
  startTime: string
  endTime: string | null
  durationSeconds: number | null
  referrer: string | null
  visitor: {
    id: string
    country: string | null
    region: string | null
    city: string | null
    browser: BrowserName | null
    device: DeviceType | null
  }
  pageViewCount: number
  eventCount: number
}

export interface SessionDetailResponse {
  session: SessionDetail
  pageViews: SessionDetailPageView[]
  pageViewsTruncated: boolean
  events: SessionDetailEvent[]
  eventsTruncated: boolean
}

// ---- analytics.routes.ts (basic, non-admin-prefixed) ----

export interface AnalyticsSummary {
  users: number
  leads: number
}
