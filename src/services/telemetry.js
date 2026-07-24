// Lightweight, invisible visitor analytics. Every call here is
// fire-and-forget: a failed request must never throw, block rendering, or
// otherwise affect what the visitor sees.

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'

// Persists across visits (until the visitor clears site data) - identifies
// the same browser returning later.
const VISITOR_KEY_STORAGE = 'empower_visitor_key'
// Persists only for this browser tab - identifies one browsing session.
const SESSION_ID_STORAGE = 'empower_session_id'

function getOrCreateVisitorKey() {
  let key = localStorage.getItem(VISITOR_KEY_STORAGE)
  if (!key) {
    key = crypto.randomUUID()
    localStorage.setItem(VISITOR_KEY_STORAGE, key)
  }
  return key
}

async function postJSON(path, body) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!response.ok) return null
  return response.json().catch(() => null)
}

async function startSession() {
  const visitorKey = getOrCreateVisitorKey()
  const result = await postJSON('/api/telemetry/session', {
    visitorKey,
    referrer: document.referrer,
  })

  const sessionId = result?.data?.sessionId
  if (sessionId) sessionStorage.setItem(SESSION_ID_STORAGE, sessionId)
  return sessionId
}

function endSession() {
  const sessionId = sessionStorage.getItem(SESSION_ID_STORAGE)
  if (!sessionId) return

  // keepalive lets this request finish even as the page is unloading -
  // the fetch equivalent of navigator.sendBeacon.
  fetch(`${API_BASE_URL}/api/telemetry/session/${sessionId}/end`, {
    method: 'POST',
    keepalive: true,
  }).catch(() => {})
}

export function trackPageView(page = window.location.pathname) {
  const sessionId = sessionStorage.getItem(SESSION_ID_STORAGE)
  if (!sessionId) return
  postJSON('/api/telemetry/pageview', { sessionId, page }).catch(() => {})
}

export function trackEvent(eventName, metadata) {
  const sessionId = sessionStorage.getItem(SESSION_ID_STORAGE)
  if (!sessionId) return
  postJSON('/api/telemetry/event', { sessionId, eventName, metadata }).catch(() => {})
}

let initialized = false

// Starts (or resumes) a session for this tab and records the initial page
// view. Safe to call more than once - only the first call does anything.
export async function initTelemetry() {
  if (initialized) return
  initialized = true

  try {
    let sessionId = sessionStorage.getItem(SESSION_ID_STORAGE)
    if (!sessionId) {
      sessionId = await startSession()
    }
    if (sessionId) {
      trackPageView()
    }

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') endSession()
    })
  } catch {
    // Telemetry failing to start should never break the site.
  }
}
