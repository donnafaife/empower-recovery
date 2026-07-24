import path from 'path';
import maxmind, { type CityResponse, type Reader } from 'maxmind';

// Where to find the GeoLite2 City database. This file is not committed to
// git (see backend/.gitignore) - it must be downloaded manually from a free
// MaxMind account. See backend/README.md for setup steps.
const DB_PATH = process.env.GEOIP_DB_PATH ?? path.join(__dirname, '../../data/GeoLite2-City.mmdb');

// Same IP looked up again within this window reuses the cached result
// instead of hitting the database file again.
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const CACHE_MAX_ENTRIES = 5000;

export interface GeoResult {
  country?: string;
  region?: string;
  city?: string;
  timezone?: string;
  latitude?: number;
  longitude?: number;
}

let readerPromise: Promise<Reader<CityResponse> | null> | null = null;
let warnedMissing = false;

function loadReader(): Promise<Reader<CityResponse> | null> {
  if (!readerPromise) {
    readerPromise = maxmind.open<CityResponse>(DB_PATH).catch((error: Error) => {
      if (!warnedMissing) {
        warnedMissing = true;
        console.warn(
          `GeoLite2 database not found at ${DB_PATH} (${error.message}). ` +
            'Visitor geolocation will be skipped until it is installed - see backend/README.md.',
        );
      }
      return null;
    });
  }
  return readerPromise;
}

const cache = new Map<string, { result: GeoResult | null; expiresAt: number }>();

function getCached(ip: string): GeoResult | null | undefined {
  const entry = cache.get(ip);
  if (!entry) return undefined;
  if (entry.expiresAt < Date.now()) {
    cache.delete(ip);
    return undefined;
  }
  return entry.result;
}

function setCached(ip: string, result: GeoResult | null) {
  if (cache.size >= CACHE_MAX_ENTRIES) {
    const oldestKey = cache.keys().next().value;
    if (oldestKey !== undefined) cache.delete(oldestKey);
  }
  cache.set(ip, { result, expiresAt: Date.now() + CACHE_TTL_MS });
}

// Looks up an approximate location for an IP address. Never throws - a
// missing database file, a private/loopback IP, or any other failure all
// resolve to null so telemetry recording always continues regardless.
export async function lookupGeo(ip: string): Promise<GeoResult | null> {
  const cached = getCached(ip);
  if (cached !== undefined) return cached;

  let result: GeoResult | null = null;

  try {
    const reader = await loadReader();
    const record = reader?.get(ip);

    if (record) {
      result = {
        country: record.country?.names?.en,
        region: record.subdivisions?.[0]?.names?.en,
        city: record.city?.names?.en,
        timezone: record.location?.time_zone,
        latitude: record.location?.latitude,
        longitude: record.location?.longitude,
      };
    }
  } catch {
    result = null;
  }

  setCached(ip, result);
  return result;
}
