import { Person } from './types'

/**
 * Approximate coordinates for places mentioned in the dataset. Deliberately
 * not a precise coastline map (see PlacesMap.tsx) — just enough to place
 * dots at roughly the right relative positions within Southern Norway /
 * Trøndelag, the region every person in this dataset lived in.
 */
const PLACE_COORDS: Record<string, { lat: number; lng: number; label: string }> = {
  'sandvollan': { lat: 63.95, lng: 11.28, label: 'Sandvollan' },
  'bragstad': { lat: 63.87, lng: 11.15, label: 'Bragstad' },
  'berg i mosaegen': { lat: 63.85, lng: 11.1, label: 'Berg i Mosaegen' },
  'inderøy': { lat: 63.85, lng: 11.2, label: 'Inderøy' },
  'oslo': { lat: 59.91, lng: 10.75, label: 'Oslo' },
  'drammen': { lat: 59.74, lng: 10.2, label: 'Drammen' },
  'sarpsborg': { lat: 59.28, lng: 11.11, label: 'Sarpsborg' },
  'tune': { lat: 59.3, lng: 11.05, label: 'Tune' },
  'borge': { lat: 59.22, lng: 10.93, label: 'Borge' },
  'øvre eiker': { lat: 59.77, lng: 9.88, label: 'Øvre Eiker' },
  'romedal': { lat: 60.7, lng: 11.1, label: 'Romedal' },
  'vaaler soløer': { lat: 60.63, lng: 12.15, label: 'Våler i Solør' },
  'sande': { lat: 59.6, lng: 10.22, label: 'Sande' },
}

/** Historical names / sub-areas that should collapse onto one of the canonical places above. */
const PLACE_ALIASES: Record<string, string> = {
  'kristiania': 'oslo',
  'grønland': 'drammen',
  'strømsgodset': 'drammen',
  'øvre hustad': 'sandvollan',
  'hustad': 'sandvollan',
  'krogshuus': 'sandvollan',
  'haga': 'romedal',
  'eker': 'øvre eiker',
}

const ALL_KEYS = [...Object.keys(PLACE_COORDS), ...Object.keys(PLACE_ALIASES)]

function resolvePlace(name: string): { key: string; lat: number; lng: number; label: string } | null {
  const s = name.trim().toLowerCase()
  if (!s) return null
  let bestMatch: string | null = null
  for (const candidate of ALL_KEYS) {
    if (s.includes(candidate) && (!bestMatch || candidate.length > bestMatch.length)) {
      bestMatch = candidate
    }
  }
  if (!bestMatch) return null
  const key = PLACE_ALIASES[bestMatch] ?? bestMatch
  const coords = PLACE_COORDS[key]
  return { key, ...coords }
}

export type PlacePoint = { key: string; lat: number; lng: number; label: string; persons: Person[] }
export type MigrationLine = { fromKey: string; toKey: string; count: number }

export function derivePlaces(persons: Person[]): { points: PlacePoint[]; lines: MigrationLine[] } {
  const points = new Map<string, PlacePoint>()
  const lines = new Map<string, MigrationLine>()

  for (const person of persons) {
    if (!person.place) continue
    const parts = person.place.split('→').map(s => s.trim()).filter(Boolean)
    const resolvedWithDupes = parts.map(resolvePlace).filter((r): r is NonNullable<typeof r> => r !== null)
    // Collapse consecutive stops that resolved to the same place (e.g. a
    // historical rename like Kristiania → Oslo) into a single stop.
    const resolved = resolvedWithDupes.filter((r, i) => i === 0 || r.key !== resolvedWithDupes[i - 1].key)

    for (const r of resolved) {
      const existing = points.get(r.key)
      if (existing) existing.persons.push(person)
      else points.set(r.key, { ...r, persons: [person] })
    }

    for (let i = 0; i < resolved.length - 1; i++) {
      const a = resolved[i].key
      const b = resolved[i + 1].key
      if (a === b) continue
      const lineKey = [a, b].sort().join('|')
      const existing = lines.get(lineKey)
      if (existing) existing.count++
      else lines.set(lineKey, { fromKey: a, toKey: b, count: 1 })
    }
  }

  return { points: [...points.values()], lines: [...lines.values()] }
}
