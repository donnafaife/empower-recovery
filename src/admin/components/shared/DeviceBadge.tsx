import { AppWindow, Compass, Globe, Laptop, Smartphone, Tablet } from 'lucide-react'
import type { BrowserName, DeviceType } from '@/admin/types'

const DEVICE_ICON: Record<DeviceType, React.ComponentType<{ className?: string }>> = {
  desktop: Laptop,
  mobile: Smartphone,
  tablet: Tablet,
  unknown: Globe,
}

export function DeviceBadge({ device }: { device: DeviceType | null }) {
  const key = device ?? 'unknown'
  const Icon = DEVICE_ICON[key]
  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-foreground">
      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      <span className="capitalize">{key}</span>
    </span>
  )
}

export function BrowserBadge({ browser }: { browser: BrowserName | null }) {
  const label = browser ?? 'unknown'
  const Icon = label === 'Chrome' ? AppWindow : label === 'Safari' ? Compass : Globe
  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-foreground">
      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      {label}
    </span>
  )
}
