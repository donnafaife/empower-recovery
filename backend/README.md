# Empower Recovery Backend

## Setup

1. Create a PostgreSQL database.
2. Copy `.env.example` to `.env` and update `DATABASE_URL` and `JWT_SECRET`.
3. Run:

```bash
npx prisma generate
npx prisma db push
```

4. Start the API:

```bash
npm run dev
```

The server will be available at `http://localhost:4000`.

## Visitor geolocation (optional)

Telemetry can resolve a visitor's approximate country, region, city,
timezone, and coordinates from their IP address using MaxMind's free
GeoLite2 City database. This is optional - if the database file isn't
present, geolocation is silently skipped and everything else keeps working.

1. Create a free account at https://www.maxmind.com/en/geolite2/signup.
2. Under your account, generate a license key.
3. Download the **GeoLite2 City** database in **MMDB** format.
4. Place the file at `backend/data/GeoLite2-City.mmdb` (create the `data`
   folder if it doesn't exist). This path is gitignored - each environment
   needs its own copy, and MaxMind's license doesn't allow redistributing it.
5. Restart the server. To use a different path, set `GEOIP_DB_PATH` in `.env`.

MaxMind updates GeoLite2 roughly monthly; re-download periodically to keep
it accurate.
