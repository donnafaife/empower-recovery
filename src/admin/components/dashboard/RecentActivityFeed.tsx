import { Fragment } from 'react'
import { Activity, Eye, Inbox, UserPlus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/admin/components/ui/card'
import { Skeleton } from '@/admin/components/ui/skeleton'
import { EmptyState } from '@/admin/components/shared/EmptyState'
import { formatRelativeTime, labelForPage } from '@/admin/lib/format'
import type { RecentActivity } from '@/admin/types'

interface FeedRow {
  id: string
  icon: typeof Activity
  text: string
  meta?: string
  createdAt: string
}

function buildFeed(activity: RecentActivity): FeedRow[] {
  const rows: FeedRow[] = [
    ...activity.visitors.map((v) => ({
      id: `visitor-${v.id}`,
      icon: UserPlus,
      text: `New visitor from ${[v.city, v.country].filter(Boolean).join(', ') || 'an unknown location'}`,
      meta: v.browser ?? undefined,
      createdAt: v.createdAt,
    })),
    ...activity.pageViews.map((p) => ({
      id: `pageview-${p.id}`,
      icon: Eye,
      text: labelForPage(p.page),
      createdAt: p.createdAt,
    })),
    ...activity.events.map((e) => ({
      id: `event-${e.id}`,
      icon: Activity,
      text: `Event: ${e.eventName}`,
      createdAt: e.createdAt,
    })),
    ...activity.leads.map((l) => ({
      id: `lead-${l.id}`,
      icon: Inbox,
      text: `New lead from ${l.name}`,
      meta: l.email,
      createdAt: l.createdAt,
    })),
  ]

  return rows.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 15)
}

export function RecentActivityFeed({ activity, loading }: { activity: RecentActivity | null; loading: boolean }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : !activity || buildFeed(activity).length === 0 ? (
          <EmptyState title="No activity yet" description="Visitor and lead activity will appear here as it happens." />
        ) : (
          <ul className="divide-y divide-border">
            {buildFeed(activity).map((row) => (
              <Fragment key={row.id}>
                <li className="flex items-start gap-3 py-2.5">
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <row.icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-foreground">{row.text}</p>
                    {row.meta ? <p className="truncate text-xs text-muted-foreground">{row.meta}</p> : null}
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">{formatRelativeTime(row.createdAt)}</span>
                </li>
              </Fragment>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
