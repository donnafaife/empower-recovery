import { MapPin } from 'lucide-react'
import { formatLocation } from '@/admin/lib/format'

export function LocationBadge({
  city,
  region,
  country,
}: {
  city?: string | null
  region?: string | null
  country?: string | null
}) {
  const label = formatLocation(city, region, country)
  if (label === '—') return <span className="text-sm text-muted-foreground">—</span>

  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-foreground">
      <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      {label}
    </span>
  )
}
