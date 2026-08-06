export type DateRangePreset = 'today' | '7d' | '30d' | '90d' | 'custom'

export interface DateRange {
  dateFrom: Date
  dateTo: Date
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

// Converts a preset like "7d" into an actual { dateFrom, dateTo } pair,
// anchored to "now" - this is the one place that math lives, so every
// caller (Overview's monthly card, Insights' dropdown) stays in sync.
export function presetToRange(preset: Exclude<DateRangePreset, 'custom'>): DateRange {
  const now = new Date()
  const today = startOfDay(now)

  const daysBack: Record<Exclude<DateRangePreset, 'custom'>, number> = {
    today: 0,
    '7d': 6,
    '30d': 29,
    '90d': 89,
  }

  const dateFrom = new Date(today.getTime() - daysBack[preset] * 24 * 60 * 60 * 1000)
  return { dateFrom, dateTo: now }
}

export function currentMonthRange(): DateRange {
  const now = new Date()
  return { dateFrom: new Date(now.getFullYear(), now.getMonth(), 1), dateTo: now }
}
