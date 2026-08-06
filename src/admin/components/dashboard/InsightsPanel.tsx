import { useMemo, useState } from 'react'
import { RefreshCcw, UserCheck, UserPlus, Users } from 'lucide-react'
import { StatCard } from '@/admin/components/shared/StatCard'
import { TopPagesList } from '@/admin/components/dashboard/TopPagesList'
import { useApiQuery } from '@/admin/hooks/useApiQuery'
import { useAuth } from '@/admin/hooks/useAuth'
import { getDashboardInsights } from '@/admin/lib/adminApi'
import { computeDelta, formatDate, formatNumber } from '@/admin/lib/format'
import { cn } from '@/admin/lib/utils'
import { presetToRange, type DateRange, type DateRangePreset } from '@/admin/lib/dateRange'

const PRESET_LABELS: Record<DateRangePreset, string> = {
  today: 'Today',
  '7d': '7D',
  '30d': '30D',
  '90d': '90D',
  custom: 'Custom',
}

function endOfDay(dateString: string): Date {
  const date = new Date(dateString)
  date.setHours(23, 59, 59, 999)
  return date
}

export function InsightsPanel() {
  const { token } = useAuth()
  const [preset, setPreset] = useState<DateRangePreset>('30d')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')

  const range: DateRange | null = useMemo(() => {
    if (preset === 'custom') {
      if (!customFrom || !customTo) return null
      return { dateFrom: new Date(customFrom), dateTo: endOfDay(customTo) }
    }
    return presetToRange(preset)
  }, [preset, customFrom, customTo])

  const insights = useApiQuery(() => {
    if (!range) return Promise.resolve(null)
    return getDashboardInsights(token!, {
      dateFrom: range.dateFrom.toISOString(),
      dateTo: range.dateTo.toISOString(),
    })
  }, [token, range?.dateFrom.getTime(), range?.dateTo.getTime()])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex gap-1 rounded-lg bg-muted p-1">
          {(Object.keys(PRESET_LABELS) as DateRangePreset[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setPreset(key)}
              className={cn(
                'rounded-md px-3 py-1.5 text-sm font-semibold transition-colors',
                preset === key
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {PRESET_LABELS[key]}
            </button>
          ))}
        </div>

        {preset === 'custom' ? (
          <div className="flex items-center gap-2 text-sm">
            <input
              type="date"
              value={customFrom}
              onChange={(event) => setCustomFrom(event.target.value)}
              className="rounded-md border border-input bg-card px-2 py-1.5 text-sm text-foreground shadow-sm"
            />
            <span className="text-muted-foreground">to</span>
            <input
              type="date"
              value={customTo}
              onChange={(event) => setCustomTo(event.target.value)}
              className="rounded-md border border-input bg-card px-2 py-1.5 text-sm text-foreground shadow-sm"
            />
          </div>
        ) : range ? (
          <span className="rounded-md border border-border bg-card px-3 py-1.5 text-sm font-semibold text-muted-foreground">
            {formatDate(range.dateFrom.toISOString())} – {formatDate(range.dateTo.toISOString())}
          </span>
        ) : null}
      </div>

      {preset === 'custom' && !range ? (
        <p className="text-sm text-muted-foreground">Pick a start and end date to see insights for that range.</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Visitors"
              icon={Users}
              value={formatNumber(insights.data?.visitors)}
              loading={insights.loading}
              hint="Total visits in range"
              trend={
                insights.data ? computeDelta(insights.data.visitors, insights.data.previousVisitors) : undefined
              }
            />
            <StatCard
              label="Unique Visitors"
              icon={UserCheck}
              value={formatNumber(insights.data?.uniqueVisitors)}
              loading={insights.loading}
              trend={
                insights.data
                  ? computeDelta(insights.data.uniqueVisitors, insights.data.previousUniqueVisitors)
                  : undefined
              }
            />
            <StatCard
              label="New Visitors"
              icon={UserPlus}
              value={formatNumber(insights.data?.newVisitors)}
              loading={insights.loading}
              trend={
                insights.data
                  ? computeDelta(insights.data.newVisitors, insights.data.previousNewVisitors)
                  : undefined
              }
            />
            <StatCard
              label="Returning Visitors"
              icon={RefreshCcw}
              value={formatNumber(insights.data?.returningVisitors)}
              loading={insights.loading}
              trend={
                insights.data
                  ? computeDelta(insights.data.returningVisitors, insights.data.previousReturningVisitors)
                  : undefined
              }
            />
          </div>

          <TopPagesList pages={insights.data?.topPages} loading={insights.loading} />
        </>
      )}
    </div>
  )
}
