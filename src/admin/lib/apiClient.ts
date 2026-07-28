import type { ApiEnvelope, ApiErrorBody } from '@/admin/types'

// Same env var the public site uses (src/services/api.js) - one source of
// truth for "where is the backend" across the whole frontend.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'

export class ApiError extends Error {
  status: number
  details?: unknown

  constructor(message: string, status: number, details?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

// Set once by AuthProvider on mount. Lets any API call anywhere - not just
// ones that happen to run inside a component that can see AuthContext -
// trigger a logout the instant the backend says the token is no longer
// valid (expired, revoked, wrong role), without apiClient importing
// AuthContext and creating a circular dependency.
let unauthorizedHandler: (() => void) | null = null
export function setUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler
}

interface RequestOptions extends RequestInit {
  token?: string | null
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { token, headers, ...rest } = options

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  })

  const body = await response.json().catch(() => null)

  if (!response.ok) {
    if ((response.status === 401 || response.status === 403) && token) {
      unauthorizedHandler?.()
    }
    const errorBody = body as ApiErrorBody | null
    throw new ApiError(errorBody?.message || 'Something went wrong. Please try again.', response.status, errorBody?.details)
  }

  return (body as ApiEnvelope<T>).data
}

export function apiGet<T>(path: string, token?: string | null) {
  return request<T>(path, { method: 'GET', token })
}

export function apiPost<T>(path: string, body?: unknown, token?: string | null) {
  return request<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined, token })
}

export function apiPatch<T>(path: string, body?: unknown, token?: string | null) {
  return request<T>(path, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined, token })
}

// Drops undefined/null/empty values so an unset filter never sends
// "?search=" to the backend.
export function buildQueryString<T extends object>(params: T = {} as T) {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value))
    }
  })
  const query = searchParams.toString()
  return query ? `?${query}` : ''
}

// CSV downloads aren't JSON, so they can't go through request() - this does
// its own fetch + Blob handling and triggers a browser download via a
// temporary object-URL link.
export async function downloadCsv(path: string, token: string, filename: string) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new ApiError((body as ApiErrorBody | null)?.message || 'Unable to export.', response.status)
  }

  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
