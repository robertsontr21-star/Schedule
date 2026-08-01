export function percentOfDay(ms: number, dayStartMs: number): number {
  const DAY_MS = 24 * 60 * 60 * 1000
  return Math.min(100, Math.max(0, ((ms - dayStartMs) / DAY_MS) * 100))
}

export const HOUR_MARKS = Array.from({ length: 25 }, (_, h) => h)
