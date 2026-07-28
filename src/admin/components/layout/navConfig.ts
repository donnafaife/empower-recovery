import { Footprints, Inbox, LayoutDashboard, type LucideIcon } from 'lucide-react'

export interface NavItem {
  label: string
  to: string
  icon: LucideIcon
}

// Only lists destinations that have a real page and route today. Telemetry,
// Users, and Settings pages don't exist yet (no page to link to); the
// previous "Analytics" entry duplicated what the Visitors page already
// covers. Add entries back here as those pages get built.
export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Leads', to: '/admin/leads', icon: Inbox },
  { label: 'Visitors', to: '/admin/visitors', icon: Footprints },
]
