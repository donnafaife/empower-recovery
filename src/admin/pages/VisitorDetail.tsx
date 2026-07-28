import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Clock, Eye, Globe, MousePointerClick, RefreshCcw } from 'lucide-react'
import { PageHeader } from '@/admin/components/shared/PageHeader'
import { ErrorState } from '@/admin/components/shared/ErrorState'
import { EmptyState } from '@/admin/components/shared/EmptyState'
import { Pagination } from '@/admin/components/shared/Pagination'
import { LocationBadge } from '@/admin/components/shared/LocationBadge'
import { Card, CardContent, CardHeader, CardTitle } from '@/admin/components/ui/card'
import { Button } from '@/admin/components/ui/button'
import { Badge } from '@/admin/components/ui/badge'
import { Skeleton } from '@/admin/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/admin/components/ui/table'
import { useApiQuery } from '@/admin/hooks/useApiQuery'
import { useAuth } from '@/admin/hooks/useAuth'
import { getVisitorById, getVisitorSessions } from '@/admin/lib/adminApi'
import { formatDateTime, formatDuration, formatNumber } from '@/admin/lib/format'

export function VisitorDetail() {
  const { id } = useParams<{ id: string }>()
  const { token } = useAuth()
  const navigate = useNavigate()
  const [page, setPage] = useState(1)

  const visitor = useApiQuery(() => getVisitorById(token!, id!), [token, id])
  const sessions = useApiQuery(() => getVisitorSessions(token!, id!, { page, pageSize: 10 }), [token, id, page])

  if (visitor.error) {
    return <ErrorState message={visitor.error} onRetry={visitor.refetch} />
  }

  const v = visitor.data?.visitor

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" className="-ml-2" onClick={() => navigate('/admin/visitors')}>
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to visitors
      </Button>

      <PageHeader
        title={visitor.loading ? 'Loading visitor…' : `Visitor ${id?.slice(0, 8)}`}
        description={v ? <LocationBadge city={v.location.city} region={v.location.region} country={v.location.country} /> : undefined}
        actions={
          v?.returningVisitor ? (
            <Badge variant="success">
              <RefreshCcw className="h-3 w-3" /> Returning visitor
            </Badge>
          ) : (
            <Badge variant="secondary">New visitor</Badge>
          )
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Sessions</p>
            {visitor.loading ? <Skeleton className="mt-2 h-6 w-10" /> : <p className="mt-1 text-xl font-semibold">{formatNumber(v?.sessionCount)}</p>}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Page Views</p>
            {visitor.loading ? <Skeleton className="mt-2 h-6 w-10" /> : <p className="mt-1 text-xl font-semibold">{formatNumber(v?.pageViewCount)}</p>}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Events</p>
            {visitor.loading ? <Skeleton className="mt-2 h-6 w-10" /> : <p className="mt-1 text-xl font-semibold">{formatNumber(v?.eventCount)}</p>}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Last Visit</p>
            {visitor.loading ? <Skeleton className="mt-2 h-6 w-24" /> : <p className="mt-1 text-sm font-medium">{formatDateTime(v?.lastVisit)}</p>}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Device</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Browser" value={v?.device.browser ?? '—'} />
            <Row label="Browser version" value={v?.device.browserVersion ?? 'Not collected'} />
            <Row label="Operating system" value={v?.device.os ?? 'Not collected'} />
            <Row label="Device type" value={v?.device.deviceType ?? '—'} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Location</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="City" value={v?.location.city ?? '—'} />
            <Row label="Region" value={v?.location.region ?? '—'} />
            <Row label="Country" value={v?.location.country ?? '—'} />
            <Row label="Timezone" value={v?.location.timezone ?? '—'} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Acquisition</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Referrer" value={v?.referrer ?? 'Direct / none'} />
            <Row label="First visit" value={formatDateTime(v?.firstVisit)} />
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="flex items-center justify-between border-b border-border p-4">
          <h3 className="text-sm font-semibold text-foreground">Sessions</h3>
          <span className="text-xs text-muted-foreground">Landing/exit page and duration are per-session, not per-visitor.</span>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Started</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Landing Page</TableHead>
              <TableHead>Exit Page</TableHead>
              <TableHead className="text-right">Page Views</TableHead>
              <TableHead className="text-right">Events</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessions.loading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((__, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : sessions.data?.sessions.map((session) => (
                  <TableRow
                    key={session.id}
                    className="cursor-pointer"
                    onClick={() => navigate(`/admin/sessions/${session.id}`)}
                  >
                    <TableCell>
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                        {formatDateTime(session.startTime)}
                      </span>
                    </TableCell>
                    <TableCell>{formatDuration(session.durationSeconds)}</TableCell>
                    <TableCell className="max-w-40 truncate" title={session.landingPage ?? undefined}>
                      {session.landingPage ?? '—'}
                    </TableCell>
                    <TableCell className="max-w-40 truncate" title={session.exitPage ?? undefined}>
                      {session.exitPage ?? '—'}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      <span className="inline-flex items-center gap-1">
                        <Eye className="h-3 w-3 text-muted-foreground" />
                        {session.pageViewCount}
                      </span>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      <span className="inline-flex items-center gap-1">
                        <MousePointerClick className="h-3 w-3 text-muted-foreground" />
                        {session.eventCount}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>

        {!sessions.loading && sessions.data?.sessions.length === 0 ? (
          <EmptyState icon={Globe} title="No sessions recorded" />
        ) : null}

        {sessions.data ? <Pagination pagination={sessions.data.pagination} onPageChange={setPage} /> : null}
      </Card>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="truncate font-medium text-foreground">{value}</span>
    </div>
  )
}
