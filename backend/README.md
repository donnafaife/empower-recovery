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
