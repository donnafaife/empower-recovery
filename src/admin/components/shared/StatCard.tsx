import type { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/admin/components/ui/card'
import { Skeleton } from '@/admin/components/ui/skeleton'
import { cn } from '@/admin/lib/utils'
import { NotAvailable } from '@/admin/components/shared/NotAvailable'

interface StatCardProps {
  label: string
  value?: string | number
  icon: LucideIcon
  loading?: boolean
  hint?: string
  notAvailable?: string
  trend?: { value: string; positive?: boolean }
}

export function StatCard({ label, value, icon: Icon, loading, hint, notAvailable, trend }: StatCardProps) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-5">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-4 w-4" />
          </div>
        </div>

        {notAvailable ? (
          <NotAvailable requires={notAvailable} compact />
        ) : loading ? (
          <Skeleton className="h-7 w-20" />
        ) : (
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-semibold tracking-tight text-foreground">{value}</p>
            {trend ? (
              <span className={cn('text-xs font-medium', trend.positive ? 'text-success' : 'text-muted-foreground')}>
                {trend.value}
              </span>
            ) : null}
          </div>
        )}

        {hint && !notAvailable ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      </CardContent>
    </Card>
  )
}
