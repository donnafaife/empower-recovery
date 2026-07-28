import { Activity, Eye, Inbox, MousePointerClick, RefreshCcw, TrendingUp, UserCheck, Users } from 'lucide-react'
import { PageHeader } from '@/admin/components/shared/PageHeader'
import { StatCard } from '@/admin/components/shared/StatCard'
import { NotAvailable } from '@/admin/components/shared/NotAvailable'
import { ErrorState } from '@/admin/components/shared/ErrorState'
import { Card, CardContent, CardHeader, CardTitle } from '@/admin/components/ui/card'
import { RecentActivityFeed } from '@/admin/components/dashboard/RecentActivityFeed'
import { useApiQuery } from '@/admin/hooks/useApiQuery'
import { useAuth } from '@/admin/hooks/useAuth'
import { getDashboardStats, getRecentActivity, getVisitors } from '@/admin/lib/adminApi'
import { formatNumber } from '@/admin/lib/format'

export function Dashboard() {
  const { token } = useAuth()

  const stats = useApiQuery(() => getDashboardStats(token!), [token])
  const activity = useApiQuery(() => getRecentActivity(token!), [token])
  // "Unique visitors" (all-time) isn't a field /stats returns directly, but
  // it's exactly what the visitors endpoint's pagination.total already is -
  // real data from a real endpoint, just read via its metadata.
  const visitorTotals = useApiQuery(() => getVisitors(token!, { pageSize: 1 }), [token])

  const uniqueVisitors = visitorTotals.data?.pagination.total
  const returningPct =
    stats.data && uniqueVisitors ? Math.round((stats.data.returningVisitors / uniqueVisitors) * 100) : undefined

  if (stats.error && !stats.loading) {
    return <ErrorState message={stats.error} onRetry={stats.refetch} />
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Overview of visitor activity and lead volume." />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Visitors Today"
          icon={Users}
          value={formatNumber(stats.data?.visitorsToday)}
          loading={stats.loading}
        />
        <StatCard
          label="Visitors This Week"
          icon={TrendingUp}
          value={formatNumber(stats.data?.visitorsThisWeek)}
          loading={stats.loading}
        />
        <StatCard
          label="Unique Visitors"
          icon={UserCheck}
          value={formatNumber(uniqueVisitors)}
          loading={visitorTotals.loading}
          hint="All-time"
        />
        <StatCard
          label="Returning Visitors"
          icon={RefreshCcw}
          value={returningPct !== undefined ? `${returningPct}%` : undefined}
          loading={stats.loading || visitorTotals.loading}
          hint="Of all-time unique visitors"
        />
        <StatCard
          label="Avg. Session Duration"
          icon={Activity}
          notAvailable="GET /api/admin/dashboard/stats (session-duration aggregate)"
        />
        <StatCard
          label="Page Views"
          icon={Eye}
          value={formatNumber(stats.data?.totalPageViews)}
          loading={stats.loading}
          hint="All-time total"
        />
        <StatCard label="Bounce Rate" icon={MousePointerClick} notAvailable="GET /api/admin/analytics/bounce-rate" />
        <StatCard label="Most Viewed Page" icon={Inbox} notAvailable="GET /api/admin/analytics/top-pages" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Visitors Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <NotAvailable requires="GET /api/admin/dashboard/timeseries?range=30d (daily visitor counts)" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Right Now</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-3xl font-semibold text-foreground">{formatNumber(stats.data?.activeSessions)}</p>
              <p className="text-xs text-muted-foreground">Sessions active in the last 30 minutes</p>
            </div>
            <div className="grid grid-cols-2 gap-3 border-t border-border pt-4">
              <div>
                <p className="text-lg font-semibold text-foreground">{formatNumber(stats.data?.totalLeads)}</p>
                <p className="text-xs text-muted-foreground">Total leads</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-foreground">{formatNumber(stats.data?.newLeads)}</p>
                <p className="text-xs text-muted-foreground">New leads</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Sessions by Day</CardTitle>
          </CardHeader>
          <CardContent>
            <NotAvailable requires="GET /api/admin/dashboard/timeseries?range=30d (daily session counts)" />
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Top Pages</CardTitle>
          </CardHeader>
          <CardContent>
            <NotAvailable requires="GET /api/admin/analytics/top-pages (page view counts grouped by page)" />
          </CardContent>
        </Card>

        <div className="lg:col-span-1">
          <RecentActivityFeed activity={activity.data} loading={activity.loading} />
        </div>
      </div>
    </div>
  )
}
