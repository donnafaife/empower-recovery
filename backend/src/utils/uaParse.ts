// Small heuristics for a rough browser/device label. Not a full user-agent
// parser (that would mean adding a new dependency) - good enough for a
// dashboard label, not meant to be exact.

export function guessDevice(userAgent: string | undefined): string {
  if (!userAgent) return 'unknown';
  if (/ipad|tablet/i.test(userAgent)) return 'tablet';
  if (/mobile|android|iphone/i.test(userAgent)) return 'mobile';
  return 'desktop';
}

export function guessBrowser(userAgent: string | undefined): string {
  if (!userAgent) return 'unknown';
  if (/edg\//i.test(userAgent)) return 'Edge';
  if (/chrome\//i.test(userAgent) && !/chromium/i.test(userAgent)) return 'Chrome';
  if (/firefox\//i.test(userAgent)) return 'Firefox';
  if (/safari\//i.test(userAgent) && !/chrome/i.test(userAgent)) return 'Safari';
  return 'Other';
}
