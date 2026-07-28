import { ServerOff } from 'lucide-react'
import { cn } from '@/admin/lib/utils'

// Used anywhere the design brief asked for a metric/chart the backend does
// not currently expose. Deliberately visible and explicit rather than a
// silent zero or fabricated placeholder data - see the endpoint name in
// `requires` so it's clear exactly what backend work would unlock it.
interface NotAvailableProps {
  requires: string
  className?: string
  compact?: boolean
}

export function NotAvailable({ requires, className, compact = false }: NotAvailableProps) {
  if (compact) {
    return (
      <span className={cn('inline-flex items-center gap-1 text-xs text-muted-foreground', className)} title={`Requires: ${requires}`}>
        <ServerOff className="h-3 w-3" />
        Not available
      </span>
    )
  }

  return (
    <div
      className={cn(
        'flex h-full min-h-40 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/30 p-6 text-center',
        className,
      )}
    >
      <ServerOff className="h-5 w-5 text-muted-foreground" />
      <p className="text-sm font-medium text-foreground">Not available yet</p>
      <p className="max-w-xs text-xs text-muted-foreground">
        This needs a new backend endpoint: <code className="rounded bg-muted px-1 py-0.5 font-mono">{requires}</code>
      </p>
    </div>
  )
}
