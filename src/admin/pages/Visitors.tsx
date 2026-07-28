import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Download, Search } from 'lucide-react'
import { PageHeader } from '@/admin/components/shared/PageHeader'
import { ErrorState } from '@/admin/components/shared/ErrorState'
import { EmptyState } from '@/admin/components/shared/EmptyState'
import { Pagination } from '@/admin/components/shared/Pagination'
import { LocationBadge } from '@/admin/components/shared/LocationBadge'
import { DeviceBadge, BrowserBadge } from '@/admin/components/shared/DeviceBadge'
import { Card, CardContent } from '@/admin/components/ui/card'
import { Input } from '@/admin/components/ui/input'
import { Button } from '@/admin/components/ui/button'
import { Skeleton } from '@/admin/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/admin/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/admin/components/ui/table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/admin/components/ui/tooltip'
import { useApiQuery } from '@/admin/hooks/useApiQuery'
import { useAuth } from '@/admin/hooks/useAuth'
import { useDebouncedValue } from '@/admin/hooks/useDebouncedValue'
import { getVisitors, type VisitorListParams } from '@/admin/lib/adminApi'
import { formatDate } from '@/admin/lib/format'

const ANY_VALUE = '__any__'

export function Visitors() {
  const { token } = useAuth()
  const navigate = useNavigate()

  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [browser, setBrowser] = useState<string>(ANY_VALUE)
  const [device, setDevice] = useState<string>(ANY_VALUE)
  const [visitorType, setVisitorType] = useState<string>(ANY_VALUE)
  const [sortBy, setSortBy] = useState<VisitorListParams['sortBy']>('firstSeen')

  const debouncedSearch = useDebouncedValue(search)

  const params: VisitorListParams = {
    page,
    pageSize: 25,
    search: debouncedSearch || undefined,
    browser: browser === ANY_VALUE ? undefined : (browser as VisitorListParams['browser']),
    device: device === ANY_VALUE ? undefined : (device as VisitorListParams['device']),
    visitorType: visitorType === ANY_VALUE ? undefined : (visitorType as VisitorListParams['visitorType']),
    sortBy,
  }

  const { data, loading, error, refetch } = useApiQuery(
    () => getVisitors(token!, params),
    [token, page, debouncedSearch, browser, device, visitorType, sortBy],
  )

  function updateFilter(setter: (value: string) => void) {
    return (value: string) => {
      setter(value)
      setPage(1)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Visitors"
        description="Anonymous visitor sessions recorded by the public site's telemetry client."
        actions={
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Button variant="outline" disabled>
                  <Download className="h-3.5 w-3.5" />
                  Export CSV
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>Not available — requires GET /api/admin/analytics/visitors/export</TooltipContent>
          </Tooltip>
        }
      />

      <Card>
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search city, country, browser…"
              className="pl-9"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
            />
          </div>

          <Select value={device} onValueChange={updateFilter(setDevice)}>
            <SelectTrigger className="w-full sm:w-36">
              <SelectValue placeholder="Device" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ANY_VALUE}>All devices</SelectItem>
              <SelectItem value="desktop">Desktop</SelectItem>
              <SelectItem value="mobile">Mobile</SelectItem>
              <SelectItem value="tablet">Tablet</SelectItem>
              <SelectItem value="unknown">Unknown</SelectItem>
            </SelectContent>
          </Select>

          <Select value={browser} onValueChange={updateFilter(setBrowser)}>
            <SelectTrigger className="w-full sm:w-36">
              <SelectValue placeholder="Browser" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ANY_VALUE}>All browsers</SelectItem>
              <SelectItem value="Chrome">Chrome</SelectItem>
              <SelectItem value="Firefox">Firefox</SelectItem>
              <SelectItem value="Safari">Safari</SelectItem>
              <SelectItem value="Edge">Edge</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>

          <Select value={visitorType} onValueChange={updateFilter(setVisitorType)}>
            <SelectTrigger className="w-full sm:w-36">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ANY_VALUE}>New & returning</SelectItem>
              <SelectItem value="new">New only</SelectItem>
              <SelectItem value="returning">Returning only</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(v) => updateFilter(setSortBy as (v: string) => void)(v)}>
            <SelectTrigger className="w-full sm:w-40 sm:ml-auto">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="firstSeen">Most recent</SelectItem>
              <SelectItem value="sessionCount">Most sessions</SelectItem>
              <SelectItem value="pageViewCount">Most page views</SelectItem>
              <SelectItem value="eventCount">Most events</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : (
        <Card className="overflow-hidden p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Location</TableHead>
                <TableHead>Browser</TableHead>
                <TableHead>Device</TableHead>
                <TableHead>First Visit</TableHead>
                <TableHead>Last Visit</TableHead>
                <TableHead className="text-right">Sessions</TableHead>
                <TableHead className="text-right">Page Views</TableHead>
                <TableHead className="text-right">Events</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 8 }).map((__, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                : data?.visitors.map((visitor) => (
                    <TableRow
                      key={visitor.id}
                      className="cursor-pointer"
                      onClick={() => navigate(`/admin/visitors/${visitor.id}`)}
                    >
                      <TableCell>
                        <LocationBadge city={visitor.city} region={visitor.region} country={visitor.country} />
                      </TableCell>
                      <TableCell>
                        <BrowserBadge browser={visitor.browser} />
                      </TableCell>
                      <TableCell>
                        <DeviceBadge device={visitor.device} />
                      </TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(visitor.firstVisit)}</TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(visitor.lastVisit)}</TableCell>
                      <TableCell className="text-right tabular-nums">{visitor.sessionCount}</TableCell>
                      <TableCell className="text-right tabular-nums">{visitor.pageViewCount}</TableCell>
                      <TableCell className="text-right tabular-nums">{visitor.eventCount}</TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>

          {!loading && data?.visitors.length === 0 ? (
            <EmptyState title="No visitors match these filters" description="Try adjusting or clearing your search and filters." />
          ) : null}

          {data ? <Pagination pagination={data.pagination} onPageChange={setPage} /> : null}
        </Card>
      )}

      <p className="text-xs text-muted-foreground">
        Operating system, referral source, landing page, exit page, and session duration are shown on each visitor&apos;s
        detail page — the visitor list endpoint doesn&apos;t return those fields directly.
      </p>
    </div>
  )
}
