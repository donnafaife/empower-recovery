import { apiGet, apiPatch, apiPost, buildQueryString, downloadCsv } from '@/admin/lib/apiClient'
import type {
  AnalyticsSummary,
  CurrentUserResponse,
  DashboardHealth,
  DashboardStats,
  Lead,
  LeadListResponse,
  LeadStatus,
  LoginResponse,
  RecentActivity,
  AdminUserListItem,
  SessionDetailResponse,
  VisitorDetail,
  VisitorListResponse,
  VisitorSessionListResponse,
  VisitorSortBy,
  VisitorType,
  BrowserName,
  DeviceType,
} from '@/admin/types'

// One function per real backend route (backend/src/routes/*.ts) - nothing
// here calls an endpoint that doesn't exist in the backend.

export function login(email: string, password: string) {
  return apiPost<LoginResponse>('/api/auth/login', { email, password })
}

export interface ChangePasswordParams {
  token?: string | null
  email?: string
  currentPassword: string
  newPassword: string
}

// Signed-in callers pass a token (the backend identifies them from it and
// ignores email); signed-out callers (the login page) pass email instead.
export function changePassword({ token, email, currentPassword, newPassword }: ChangePasswordParams) {
  return apiPost<null>('/api/auth/change-password', { email, currentPassword, newPassword }, token)
}

export function getCurrentUser(token: string) {
  return apiGet<CurrentUserResponse>('/api/users/me', token)
}

export function getUsers(token: string) {
  return apiGet<AdminUserListItem[]>('/api/users', token)
}

export function getAnalyticsSummary(token: string) {
  return apiGet<AnalyticsSummary>('/api/analytics/summary', token)
}

export function getDashboardStats(token: string) {
  return apiGet<DashboardStats>('/api/admin/dashboard/stats', token)
}

export function getDashboardHealth(token: string) {
  return apiGet<DashboardHealth>('/api/admin/dashboard/health', token)
}

export function getRecentActivity(token: string) {
  return apiGet<RecentActivity>('/api/admin/dashboard/recent-activity', token)
}

export interface LeadListParams {
  page?: number
  pageSize?: number
  search?: string
  status?: LeadStatus
  sortBy?: 'newest' | 'oldest' | 'updated'
}

export function getLeads(token: string, params: LeadListParams = {}) {
  return apiGet<LeadListResponse>(`/api/admin/leads${buildQueryString(params)}`, token)
}

export function getLeadById(token: string, id: string) {
  return apiGet<{ lead: Lead }>(`/api/admin/leads/${id}`, token)
}

export function updateLeadStatus(token: string, id: string, status: LeadStatus) {
  return apiPatch<{ lead: Lead }>(`/api/admin/leads/${id}/status`, { status }, token)
}

export function updateLeadNotes(token: string, id: string, notes: string) {
  return apiPatch<{ lead: Lead }>(`/api/admin/leads/${id}/notes`, { notes }, token)
}

export function exportLeadsCsv(token: string, params: Pick<LeadListParams, 'search' | 'status'> = {}) {
  return downloadCsv(`/api/admin/leads/export${buildQueryString(params)}`, token, 'leads.csv')
}

export interface VisitorListParams {
  page?: number
  pageSize?: number
  search?: string
  country?: string
  region?: string
  city?: string
  browser?: BrowserName
  device?: DeviceType
  dateFrom?: string
  dateTo?: string
  visitorType?: VisitorType
  sortBy?: VisitorSortBy
}

export function getVisitors(token: string, params: VisitorListParams = {}) {
  return apiGet<VisitorListResponse>(`/api/admin/analytics/visitors${buildQueryString(params)}`, token)
}

export function getVisitorById(token: string, id: string) {
  return apiGet<{ visitor: VisitorDetail }>(`/api/admin/analytics/visitors/${id}`, token)
}

export function getVisitorSessions(token: string, id: string, params: { page?: number; pageSize?: number } = {}) {
  return apiGet<VisitorSessionListResponse>(`/api/admin/analytics/visitors/${id}/sessions${buildQueryString(params)}`, token)
}

export function getSessionById(token: string, id: string) {
  return apiGet<SessionDetailResponse>(`/api/admin/analytics/sessions/${id}`, token)
}
