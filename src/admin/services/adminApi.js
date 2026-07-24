import { request } from '../../services/api'

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

export function login(email, password) {
  return request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export function getCurrentUser(token) {
  return authorizedRequest('/api/users/me', token)
}

export function getAnalyticsSummary(token) {
  return authorizedRequest('/api/analytics/summary', token)
}
