'use client'

import { useMemo, useState } from 'react'
import { Person } from './types'
import { derivePlaces } from './places'

interface PlacesMapProps {
  persons: Person[]
  onSelect: (person: Person) => void
}

const WIDTH = 320
const HEIGHT = 420
const PADDING = 36

export default function PlacesMap({ persons, onSelect }: PlacesMapProps) {
  const { points, lines } = useMemo(() => derivePlaces(persons), [persons])
  const [activeKey, setActiveKey] = useState<string | null>(null)

  if (points.length === 0) return null

  const lats = points.map(p => p.lat)
  const lngs = points.map(p => p.lng)
  const latMin = Math.min(...lats)
  const latMax = Math.max(...lats)
  const lngMin = Math.min(...lngs)
  const lngMax = Math.max(...lngs)
  const latSpan = latMax - latMin || 1
  const lngSpan = lngMax - lngMin || 1

  const project = (lat: number, lng: number) => ({
    x: PADDING + ((lng - lngMin) / lngSpan) * (WIDTH - 2 * PADDING),
    y: PADDING + ((latMax - lat) / latSpan) * (HEIGHT - 2 * PADDING),
  })

  const byKey = new Map(points.map(p => [p.key, p]))
  const maxCount = Math.max(...points.map(p => p.persons.length))
  const radius = (n: number) => 4 + (n / maxCount) * 7

  const active = activeKey ? byKey.get(activeKey) : null

  return (
    <div className="places-map">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="places-map-svg" role="img" aria-label="Kart over familiens steder">
        {lines.map((l, i) => {
          const from = byKey.get(l.fromKey)
          const to = byKey.get(l.toKey)
          if (!from || !to) return null
          const p1 = project(from.lat, from.lng)
          const p2 = project(to.lat, to.lng)
          return (
            <line
              key={i}
              x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
              className="places-map-line"
              strokeWidth={0.5 + Math.min(l.count, 4) * 0.4}
            />
          )
        })}
        {points.map(p => {
          const { x, y } = project(p.lat, p.lng)
          const r = radius(p.persons.length)
          const isActive = activeKey === p.key
          return (
            <g
              key={p.key}
              onClick={() => setActiveKey(isActive ? null : p.key)}
              className="places-map-marker"
              role="button"
              tabIndex={0}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActiveKey(isActive ? null : p.key) } }}
              aria-label={`${p.label}, ${p.persons.length} person${p.persons.length !== 1 ? 'er' : ''}`}
            >
              <title>{`${p.label} (${p.persons.length})`}</title>
              <circle cx={x} cy={y} r={r} className={`places-map-dot${isActive ? ' active' : ''}`} />
            </g>
          )
        })}
      </svg>

      {active && (
        <div className="places-map-popover">
          <div className="places-map-popover-title">{active.label}</div>
          <div className="modal-chips">
            {active.persons.map(p => (
              <div key={p.id} className="modal-chip" onClick={() => onSelect(p)}>{p.name}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
