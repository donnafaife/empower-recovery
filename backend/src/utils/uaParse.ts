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

// Read-only parsing of the already-collected Session.userAgent string, used
// only when displaying analytics - does not change what telemetry captures.
export function guessBrowserVersion(userAgent: string | undefined): string | undefined {
  if (!userAgent) return undefined;
  const patterns = [/edg\/([\d.]+)/i, /chrome\/([\d.]+)/i, /firefox\/([\d.]+)/i, /version\/([\d.]+).*safari/i];
  for (const pattern of patterns) {
    const match = userAgent.match(pattern);
    if (match) return match[1];
  }
  return undefined;
}

export function guessOS(userAgent: string | undefined): string | undefined {
  if (!userAgent) return undefined;
  if (/windows nt/i.test(userAgent)) return 'Windows';
  if (/mac os x/i.test(userAgent) && !/iphone|ipad/i.test(userAgent)) return 'macOS';
  if (/iphone|ipad|ios/i.test(userAgent)) return 'iOS';
  if (/android/i.test(userAgent)) return 'Android';
  if (/linux/i.test(userAgent)) return 'Linux';
  return undefined;
}
