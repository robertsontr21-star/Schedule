import { useMemo, useState } from 'react'
import type { GeotabApi } from '../geotab/types'
import { useSchedule } from '../hooks/useSchedule'
import { useNow } from '../hooks/useNow'
import { startOfDay, isSameDay } from '../lib/time'
import { Toolbar } from './Toolbar'
import { StatTiles } from './StatTiles'
import { ScheduleBoard } from './ScheduleBoard'
import { AlertsPanel } from './AlertsPanel'
import '../app.css'

interface AppProps {
  api: GeotabApi | null
}

export default function App({ api }: AppProps) {
  const [date, setDate] = useState(() => new Date())
  const [search, setSearch] = useState('')
  const nowMs = useNow()
  const { data, loading, error, refresh } = useSchedule(api, date)

  const isToday = isSameDay(date, new Date())
  const dayStartMs = useMemo(() => startOfDay(date).getTime(), [date])

  const filteredDrivers = useMemo(() => {
    if (!data) return []
    const term = search.trim().toLowerCase()
    if (!term) return data.drivers
    return data.drivers.filter((d) => d.driverName.toLowerCase().includes(term))
  }, [data, search])

  return (
    <div className="app-shell">
      <Toolbar
        date={date}
        onDateChange={setDate}
        search={search}
        onSearchChange={setSearch}
        isDemo={data?.isDemo ?? api === null}
        loading={loading}
        lastUpdatedMs={data?.generatedAtMs ?? null}
        onRefresh={refresh}
      />

      {error && (
        <div className="error-banner">
          Couldn't load schedule data: {error}
          <button onClick={refresh}>Retry</button>
        </div>
      )}

      {data && <StatTiles drivers={data.drivers} />}

      <div className="app-main">
        {data ? (
          <ScheduleBoard drivers={filteredDrivers} dayStartMs={dayStartMs} nowMs={nowMs} isToday={isToday} />
        ) : (
          <div className="board board-empty">
            <p>{loading ? 'Loading today’s schedule…' : 'No data yet.'}</p>
          </div>
        )}
        {data && <AlertsPanel drivers={filteredDrivers} />}
      </div>
    </div>
  )
}
