// Base URL for the backend API. Set VITE_API_BASE_URL in a .env file to
// point at a deployed backend; falls back to the local dev server.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'

// Thrown when the backend responds with an error. Carries the field-level
// `details` from the response (if any) so a form can show per-field messages.
export class ApiError extends Error {
  constructor(message, details) {
    super(message)
    this.name = 'ApiError'
    this.details = details
  }
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  // The backend always returns JSON, even on errors, but guard against a
  // non-JSON response (e.g. the server being unreachable) just in case.
  const body = await response.json().catch(() => null)

  if (!response.ok) {
    throw new ApiError(body?.message || 'Something went wrong. Please try again.', body?.details)
  }

  return body
}

export function createLead(lead) {
  return request('/api/leads', {
    method: 'POST',
    body: JSON.stringify(lead),
  })
}
