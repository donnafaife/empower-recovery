import { Badge } from '@/admin/components/ui/badge'
import type { HealthStatus, LeadStatus } from '@/admin/types'

const LEAD_STATUS_STYLE: Record<LeadStatus, { label: string; variant: 'default' | 'success' | 'warning' | 'muted' }> = {
  NEW: { label: 'New', variant: 'default' },
  CONTACTED: { label: 'Contacted', variant: 'warning' },
  QUALIFIED: { label: 'Qualified', variant: 'warning' },
  CONVERTED: { label: 'Converted', variant: 'success' },
  CLOSED: { label: 'Closed', variant: 'muted' },
}

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  const style = LEAD_STATUS_STYLE[status]
  return <Badge variant={style.variant}>{style.label}</Badge>
}

const HEALTH_STYLE: Record<HealthStatus, { variant: 'success' | 'warning' | 'destructive' }> = {
  healthy: { variant: 'success' },
  warning: { variant: 'warning' },
  error: { variant: 'destructive' },
}

export function HealthBadge({ status }: { status: HealthStatus }) {
  const style = HEALTH_STYLE[status]
  return (
    <Badge variant={style.variant} className="capitalize">
      {status}
    </Badge>
  )
}

export function RoleBadge({ role }: { role: string }) {
  return (
    <Badge variant={role === 'SUPER_ADMIN' ? 'default' : 'secondary'} className="capitalize">
      {role.replace('_', ' ').toLowerCase()}
    </Badge>
  )
}
