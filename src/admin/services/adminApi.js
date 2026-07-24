import { request, ApiError, API_BASE_URL } from '../../services/api'

// Same request/error handling as the public site's api.js (see ApiError
// there) - this just adds the Authorization header admin routes need.
function authorizedRequest(path, token, options = {}) {
  return request(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })
}

// Drops undefined/null/empty values so e.g. an unset search box doesn't send
// "?search=" to the backend.
function buildQueryString(params = {}) {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, value)
    }
  })
  const query = searchParams.toString()
  return query ? `?${query}` : ''
}

export function login(email, password) {
  return request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export function getCurrentUser(token) {
  return authorizedRequest('/api/users/me', token)
}

export function getDashboardStats(token) {
  return authorizedRequest('/api/admin/dashboard/stats', token)
}

export function getDashboardHealth(token) {
  return authorizedRequest('/api/admin/dashboard/health', token)
}

export function getDashboardRecentActivity(token) {
  return authorizedRequest('/api/admin/dashboard/recent-activity', token)
}

export function getLeads(token, params) {
  return authorizedRequest(`/api/admin/leads${buildQueryString(params)}`, token)
}

export function getLeadById(token, id) {
  return authorizedRequest(`/api/admin/leads/${id}`, token)
}

export function updateLeadStatus(token, id, status) {
  return authorizedRequest(`/api/admin/leads/${id}/status`, token, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
}

export function updateLeadNotes(token, id, notes) {
  return authorizedRequest(`/api/admin/leads/${id}/notes`, token, {
    method: 'PATCH',
    body: JSON.stringify({ notes }),
  })
}

// A CSV download isn't a JSON response, so this can't go through the shared
// request() helper - it does its own fetch + Blob handling, then triggers a
// browser download via a temporary object-URL link (the standard pattern for
// downloading a file that requires an Authorization header).
export async function exportLeadsCsv(token, params) {
  const response = await fetch(`${API_BASE_URL}/api/admin/leads/export${buildQueryString(params)}`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new ApiError(body?.message || 'Unable to export leads.', response.status, body?.details)
  }

  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'leads.csv'
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
