import crypto from 'crypto';

// A bare SHA-256 hash of an IPv4 address is reversible in seconds (there are
// only ~4.3 billion possible addresses to brute-force), so a secret salt is
// required for this to actually protect visitor privacy. Falls back to
// JWT_SECRET only so local/dev setups still work without extra config.
const salt = process.env.TELEMETRY_IP_SALT ?? process.env.JWT_SECRET ?? 'development-secret';

export function hashIp(ip: string): string {
  return crypto.createHash('sha256').update(`${salt}:${ip}`).digest('hex');
}
