import { useMemo } from 'react'
import { PageHeader } from '@/admin/components/shared/PageHeader'
import { ErrorState } from '@/admin/components/shared/ErrorState'
import { Card, CardContent, CardHeader, CardTitle } from '@/admin/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/admin/components/ui/tabs'
import { RecentActivityFeed } from '@/admin/components/dashboard/RecentActivityFeed'
import { VisitorsHeroCard } from '@/admin/components/dashboard/VisitorsHeroCard'
import { InsightsPanel } from '@/admin/components/dashboard/InsightsPanel'
import { useApiQuery } from '@/admin/hooks/useApiQuery'
import { useAuth } from '@/admin/hooks/useAuth'
import { getDashboardInsights, getDashboardStats, getRecentActivity } from '@/admin/lib/adminApi'
import { formatNumber } from '@/admin/lib/format'
import { currentMonthRange } from '@/admin/lib/dateRange'

export function Dashboard() {
  const { token } = useAuth()

  const stats = useApiQuery(() => getDashboardStats(token!), [token])
  const activity = useApiQuery(() => getRecentActivity(token!), [token])

  // Computed once per page load - "this month" doesn't need to update live.
  const monthRange = useMemo(() => currentMonthRange(), [])
  const monthly = useApiQuery(
    () =>
      getDashboardInsights(token!, {
        dateFrom: monthRange.dateFrom.toISOString(),
        dateTo: monthRange.dateTo.toISOString(),
      }),
    [token],
  )

  if (stats.error && !stats.loading) {
    return <ErrorState message={stats.error} onRetry={stats.refetch} />
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Overview of visitor activity and lead volume." />

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <VisitorsHeroCard value={monthly.data?.uniqueVisitors} loading={monthly.loading} />

            <Card>
              <CardHeader>
                <CardTitle>Active Right Now</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold text-foreground">{formatNumber(stats.data?.activeSessions)}</p>
                <p className="text-xs text-muted-foreground">Sessions active in the last 30 minutes</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Leads</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
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

          <RecentActivityFeed activity={activity.data} loading={activity.loading} />
        </TabsContent>

        <TabsContent value="insights">
          <InsightsPanel />
        </TabsContent>
      </Tabs>
    </div>
  )
}
