'use client'

import { useMemo } from 'react'
import { Person } from './types'
import { parseYear } from './family'

interface TimelineProps {
  persons: Person[]
  onSelect: (p: Person) => void
}

const PX_PER_YEAR = 6
const ROW_HEIGHT = 26
const TOP_PADDING = 30
const RIGHT_PADDING = 220
// No recorded death date could mean "still alive" or just "unrecorded" —
// only treat someone born recently enough as living; older, undated people
// get a short assumed span instead of a bar stretching to the present day.
const LIVING_CUTOFF_YEARS = 100
const ASSUMED_LIFESPAN_YEARS = 60

export default function Timeline({ persons, onSelect }: TimelineProps) {
  const rows = useMemo(() => {
    const currentYear = new Date().getFullYear()
    return persons
      .map(person => {
        const born = parseYear(person.born)
        if (born == null) return null
        const died = parseYear(person.died)
        const living = died == null && currentYear - born < LIVING_CUTOFF_YEARS
        const unknownEnd = died == null && !living
        const end = died ?? (living ? currentYear : born + ASSUMED_LIFESPAN_YEARS)
        return { person, born, end, living, unknownEnd }
      })
      .filter((r): r is NonNullable<typeof r> => r !== null)
      .sort((a, b) => a.born - b.born)
  }, [persons])

  if (rows.length === 0) return null

  const minYear = Math.min(...rows.map(r => r.born))
  const maxYear = Math.max(...rows.map(r => r.end))
  const totalWidth = (maxYear - minYear) * PX_PER_YEAR + RIGHT_PADDING
  const totalHeight = TOP_PADDING + rows.length * ROW_HEIGHT + 10

  const gridStep = maxYear - minYear > 150 ? 50 : 25
  const gridYears: number[] = []
  for (let y = Math.ceil(minYear / gridStep) * gridStep; y <= maxYear; y += gridStep) {
    gridYears.push(y)
  }

  return (
    <div className="timeline-wrap">
      <div className="timeline" style={{ width: totalWidth, height: totalHeight }}>
        {gridYears.map(y => (
          <div key={y} className="timeline-gridline" style={{ left: (y - minYear) * PX_PER_YEAR }}>
            <span className="timeline-gridline-label">{y}</span>
          </div>
        ))}
        {rows.map((r, i) => {
          const left = (r.born - minYear) * PX_PER_YEAR
          const width = Math.max((r.end - r.born) * PX_PER_YEAR, 4)
          const cls = [
            'timeline-bar',
            r.person.highlight ?? '',
            r.living ? 'living' : '',
            r.unknownEnd ? 'unknown-end' : '',
          ].filter(Boolean).join(' ')
          const dateLabel = r.living
            ? `f. ${r.born}`
            : r.unknownEnd
            ? `f. ${r.born}, d. ukjent`
            : `${r.born}–${r.end}`
          return (
            <div
              key={r.person.id}
              className={cls}
              style={{ left, width, top: TOP_PADDING + i * ROW_HEIGHT }}
              onClick={() => onSelect(r.person)}
              role="button"
              tabIndex={0}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(r.person) } }}
              aria-label={`${r.person.name}, ${dateLabel}`}
            >
              <span className="timeline-bar-label">{r.person.name} <span className="timeline-bar-dates">({dateLabel})</span></span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
