import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Eye, MousePointerClick } from 'lucide-react'
import { PageHeader } from '@/admin/components/shared/PageHeader'
import { ErrorState } from '@/admin/components/shared/ErrorState'
import { LocationBadge } from '@/admin/components/shared/LocationBadge'
import { BrowserBadge, DeviceBadge } from '@/admin/components/shared/DeviceBadge'
import { Card, CardContent, CardHeader, CardTitle } from '@/admin/components/ui/card'
import { Button } from '@/admin/components/ui/button'
import { Skeleton } from '@/admin/components/ui/skeleton'
import { Badge } from '@/admin/components/ui/badge'
import { useApiQuery } from '@/admin/hooks/useApiQuery'
import { useAuth } from '@/admin/hooks/useAuth'
import { getSessionById } from '@/admin/lib/adminApi'
import { formatDateTime, formatDuration, formatNumber } from '@/admin/lib/format'

interface TimelineRow {
  id: string
  kind: 'pageview' | 'event'
  timestamp: string
  primary: string
  secondary?: string
}

export function SessionDetail() {
  const { id } = useParams<{ id: string }>()
  const { token } = useAuth()
  const navigate = useNavigate()

  const { data, loading, error, refetch } = useApiQuery(() => getSessionById(token!, id!), [token, id])

  if (error) {
    return <ErrorState message={error} onRetry={refetch} />
  }

  const timeline: TimelineRow[] = data
    ? [
        ...data.pageViews.map((p) => ({
          id: `pv-${p.id}`,
          kind: 'pageview' as const,
          timestamp: p.timestamp,
          primary: p.page,
          secondary: p.duration ? `Viewed for ${formatDuration(p.duration)}` : undefined,
        })),
        ...data.events.map((e) => ({
          id: `ev-${e.id}`,
          kind: 'event' as const,
          timestamp: e.timestamp,
          primary: e.eventName,
          secondary: e.metadata ? JSON.stringify(e.metadata) : undefined,
        })),
      ].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    : []

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" className="-ml-2" onClick={() => navigate(-1)}>
        <ArrowLeft className="h-3.5 w-3.5" />
        Back
      </Button>

      <PageHeader
        title={loading ? 'Loading session…' : `Session ${id?.slice(0, 8)}`}
        description={
          data ? (
            <span className="inline-flex flex-wrap items-center gap-3">
              <LocationBadge city={data.session.visitor.city} region={data.session.visitor.region} country={data.session.visitor.country} />
              <BrowserBadge browser={data.session.visitor.browser} />
              <DeviceBadge device={data.session.visitor.device} />
            </span>
          ) : undefined
        }
        actions={
          data ? (
            <Button variant="outline" size="sm" onClick={() => navigate(`/admin/visitors/${data.session.visitor.id}`)}>
              View visitor
            </Button>
          ) : undefined
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Started</p>
            {loading ? <Skeleton className="mt-2 h-5 w-28" /> : <p className="mt-1 text-sm font-semibold">{formatDateTime(data?.session.startTime)}</p>}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Duration</p>
            {loading ? <Skeleton className="mt-2 h-5 w-16" /> : <p className="mt-1 text-sm font-semibold">{formatDuration(data?.session.durationSeconds)}</p>}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Page Views</p>
            {loading ? <Skeleton className="mt-2 h-5 w-10" /> : <p className="mt-1 text-sm font-semibold">{formatNumber(data?.session.pageViewCount)}</p>}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Events</p>
            {loading ? <Skeleton className="mt-2 h-5 w-10" /> : <p className="mt-1 text-sm font-semibold">{formatNumber(data?.session.eventCount)}</p>}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : timeline.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No page views or events recorded for this session.</p>
          ) : (
            <ol className="relative space-y-0 border-l border-border pl-6">
              {timeline.map((row) => (
                <li key={row.id} className="relative pb-5 last:pb-0">
                  <span
                    className={`absolute -left-[27px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full ring-4 ring-background ${
                      row.kind === 'pageview' ? 'bg-primary/15 text-primary' : 'bg-accent/15 text-accent'
                    }`}
                  >
                    {row.kind === 'pageview' ? <Eye className="h-2.5 w-2.5" /> : <MousePointerClick className="h-2.5 w-2.5" />}
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={row.kind === 'pageview' ? 'default' : 'secondary'} className="capitalize">
                      {row.kind === 'pageview' ? 'Page view' : 'Event'}
                    </Badge>
                    <p className="text-sm font-medium text-foreground">{row.primary}</p>
                  </div>
                  {row.secondary ? <p className="mt-0.5 truncate text-xs text-muted-foreground">{row.secondary}</p> : null}
                  <p className="mt-0.5 text-xs text-muted-foreground">{formatDateTime(row.timestamp)}</p>
                </li>
              ))}
            </ol>
          )}

          {(data?.pageViewsTruncated || data?.eventsTruncated) ? (
            <p className="mt-4 text-xs text-muted-foreground">
              This session has more rows than shown here — the backend caps session detail at 500 rows per type.
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
