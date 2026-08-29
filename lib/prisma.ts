import { PrismaClient } from '@prisma/client'

function buildDatabaseUrl(): string | undefined {
  const raw = process.env.DATABASE_URL
  if (!raw) return undefined
  // Neon pooler URLs contain "-pooler" and need pgbouncer mode.
  // Without pgbouncer=true Prisma double-pools on top of PgBouncer and exhausts connections
  // leading to "Timed out fetching a new connection from the connection pool".
  try {
    const url = new URL(raw)
    const isPooler = url.hostname.includes('-pooler')
    if (isPooler) {
      if (!url.searchParams.has('pgbouncer')) url.searchParams.set('pgbouncer', 'true')
      if (!url.searchParams.has('connection_limit')) url.searchParams.set('connection_limit', '5')
      if (!url.searchParams.has('pool_timeout')) url.searchParams.set('pool_timeout', '20')
      if (!url.searchParams.has('connect_timeout')) url.searchParams.set('connect_timeout', '10')
      return url.toString()
    }
  } catch {
    // Fallback to string manipulation if URL parsing fails
    if (raw.includes('-pooler') && !raw.includes('pgbouncer=true')) {
      const sep = raw.includes('?') ? '&' : '?'
      return `${raw}${sep}pgbouncer=true&connection_limit=5&pool_timeout=20&connect_timeout=10`
    }
  }
  return raw
}

const databaseUrl = buildDatabaseUrl()
if (databaseUrl && databaseUrl !== process.env.DATABASE_URL) {
  process.env.DATABASE_URL = databaseUrl
}

// Turbopack / Next.js dev creates many hot-reloaded modules but shares globalThis.
// Using globalThis singleton prevents creating 10+ PrismaClients that each open pool_limit connections
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // Avoid 'query' logging in dev — it holds event loop and makes pool diagnostics noisy
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    // Prisma 5 uses datasources.db.url; Prisma 6 uses datasourceUrl — support both via env mutation above
    // Explicitly pass datasources for Prisma 5.22 compatibility
    ...(databaseUrl ? ({ datasources: { db: { url: databaseUrl } } } as any) : {}),
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
