import { Card, CardContent, CardHeader, CardTitle } from '@/admin/components/ui/card'
import { Skeleton } from '@/admin/components/ui/skeleton'
import { EmptyState } from '@/admin/components/shared/EmptyState'
import { formatNumber } from '@/admin/lib/format'
import type { TopPage } from '@/admin/types'

interface TopPagesListProps {
  pages?: TopPage[]
  loading?: boolean
}

// Ranked list with a proportional bar per row - each bar is relative to the
// single busiest page in the list, not to the total across all pages.
export function TopPagesList({ pages, loading }: TopPagesListProps) {
  const maxViews = pages?.length ? Math.max(...pages.map((p) => p.views)) : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Most Viewed Pages</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        ) : !pages || pages.length === 0 ? (
          <EmptyState title="No page views yet" description="Page views in this date range will appear here." />
        ) : (
          <ul className="space-y-3">
            {pages.map((page, index) => (
              <li key={page.page} className="flex items-center gap-3">
                <span className="w-5 shrink-0 text-sm font-semibold text-muted-foreground">{index + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{page.page}</p>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${maxViews ? Math.round((page.views / maxViews) * 100) : 0}%` }}
                    />
                  </div>
                </div>
                <span className="w-14 shrink-0 text-right text-sm font-semibold text-foreground">
                  {formatNumber(page.views)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
