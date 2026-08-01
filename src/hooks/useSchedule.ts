import { useCallback, useEffect, useRef, useState } from 'react'
import type { GeotabApi } from '../geotab/types'
import { fetchDailySchedule } from '../data/schedule'
import { generateMockSchedule } from '../data/mock'
import type { ScheduleData } from '../data/types'
import { endOfDay, isSameDay, startOfDay } from '../lib/time'

const POLL_MS = 60_000

interface UseScheduleResult {
  data: ScheduleData | null
  loading: boolean
  error: string | null
  refresh: () => void
}

export function useSchedule(api: GeotabApi | null, date: Date): UseScheduleResult {
  const [data, setData] = useState<ScheduleData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const requestId = useRef(0)

  const load = useCallback(() => {
    const id = ++requestId.current
    setLoading(true)
    setError(null)

    const run = api
      ? fetchDailySchedule(api, startOfDay(date), endOfDay(date))
      : Promise.resolve(generateMockSchedule(date))

    run
      .then((result) => {
        if (requestId.current !== id) return
        setData(result)
      })
      .catch((err: unknown) => {
        if (requestId.current !== id) return
        setError(err instanceof Error ? err.message : 'Failed to load schedule data.')
      })
      .finally(() => {
        if (requestId.current !== id) return
        setLoading(false)
      })
  }, [api, date])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (!isSameDay(date, new Date())) return
    const id = setInterval(load, POLL_MS)
    return () => clearInterval(id)
  }, [date, load])

  return { data, loading, error, refresh: load }
}
