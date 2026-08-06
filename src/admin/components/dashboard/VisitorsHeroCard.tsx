import { Users } from 'lucide-react'
import { Card, CardContent } from '@/admin/components/ui/card'
import { Skeleton } from '@/admin/components/ui/skeleton'
import { formatNumber } from '@/admin/lib/format'

interface VisitorsHeroCardProps {
  value?: number
  loading?: boolean
}

// A big single-number summary card, the way Instagram's dashboard leads with
// one large stat rather than a dense grid.
export function VisitorsHeroCard({ value, loading }: VisitorsHeroCardProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-2 p-8 text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Users className="h-5 w-5" />
        </div>
        {loading ? (
          <Skeleton className="h-10 w-24" />
        ) : (
          <p className="text-4xl font-semibold tracking-tight text-foreground">{formatNumber(value)}</p>
        )}
        <p className="text-sm font-medium text-muted-foreground">Visitors this month</p>
      </CardContent>
    </Card>
  )
}
