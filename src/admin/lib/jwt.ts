// Decodes (without verifying - the backend is the source of truth on
// validity) the payload of a JWT to read its `exp` claim, purely so the UI
// can proactively auto-logout the moment a token expires instead of waiting
// for the next API call to fail with a 401.
export function getJwtExpiryMs(token: string): number | null {
  try {
    const [, payloadSegment] = token.split('.')
    if (!payloadSegment) return null
    const payload = JSON.parse(atob(payloadSegment.replace(/-/g, '+').replace(/_/g, '/')))
    if (typeof payload.exp !== 'number') return null
    return payload.exp * 1000
  } catch {
    return null
  }
}
