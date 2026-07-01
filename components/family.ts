import { ChildEntry, Person } from './types'

/** Builds an id → Person lookup once, instead of repeated Array.find() scans. */
export function buildPersonMap(persons: Person[]): Map<string, Person> {
  return new Map(persons.map(p => [p.id, p]))
}

/** First + last initial, for avatar fallbacks when no photo exists. */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/)
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? parts[parts.length - 1][0] : ''
  return (first + last).toUpperCase()
}

const BRANCH_CLASSES: Record<number, string> = { 4: 'br-a', 5: 'br-b', 6: 'br-c', 7: 'br-d' }

/**
 * Every ahnentafel number >= 4 descends from exactly one of the four
 * great-great-grandparent couples (ahnentafel 4–7 — the Hustad/Husberg/
 * Simensen/Werner lines), found by right-shifting down to that generation.
 * Ahnentafel 2 and 3 (Farfar, Farmor) are one generation too shallow for
 * that shift, but each still belongs to one line by surname — the same one
 * as their own father (ahnentafel 2n) — so they inherit it from there.
 * Used to color-code cards by family branch. Returns '' only for 1 (Far),
 * the trunk itself.
 */
export function branchClass(ahnentafel: number): string {
  if (ahnentafel < 2) return ''
  if (ahnentafel < 4) return branchClass(ahnentafel * 2)
  const depth = Math.floor(Math.log2(ahnentafel))
  const quadrant = ahnentafel >> (depth - 2)
  return BRANCH_CLASSES[quadrant] ?? ''
}

/**
 * Descendants of a person are derived by reverse-scanning fatherId/motherId
 * across the whole dataset, not from the `children` array — most `children`
 * entries are display-only text with no matching Person record (see
 * ChildEntry), so fatherId/motherId is the only reliable structural link.
 */
export function childrenOf(personId: string, persons: Person[]): Person[] {
  return persons.filter(p => p.fatherId === personId || p.motherId === personId)
}

/** Extracts a 4-digit year from date strings like "12. apr 1969" or "ca. 1816". */
export function parseYear(dateStr?: string): number | null {
  if (!dateStr) return null
  const match = dateStr.match(/\d{4}/)
  return match ? parseInt(match[0], 10) : null
}

/**
 * Resolves a ChildEntry to display text and, when it references a real
 * Person record, the id to navigate to. Falls back to the raw string (or the
 * note, if a referenced id can't be resolved) so a bad id never disappears
 * silently — see scripts/validate-family.mjs for catching that earlier.
 */
export function resolveChildEntry(
  entry: ChildEntry,
  byId: Map<string, Person>
): { text: string; personId?: string } {
  if (typeof entry === 'string') return { text: entry }

  const person = byId.get(entry.id)
  if (!person) return { text: entry.note ?? entry.id }

  const dates = [person.born, person.died].filter(Boolean).join(' – ')
  const base = [person.name, dates && `f. ${dates}`].filter(Boolean).join(' · ')
  return { text: entry.note ? `${base} — ${entry.note}` : base, personId: person.id }
}

/**
 * Siblings of `current` are the *other* entries in a parent's children list.
 * Matching by id (when available) instead of substring-matching names avoids
 * false exclusions when siblings share a first name.
 */
export function getSiblings(current: Person, father?: Person, mother?: Person): ChildEntry[] {
  const parentWithChildren = [father, mother].find(p => p?.children && p.children.length > 0)
  if (!parentWithChildren?.children) return []
  return parentWithChildren.children.filter(
    entry => typeof entry === 'string' || entry.id !== current.id
  )
}

/** Finds the person the rest of the tree is centered on ("proband"). */
export function findRoot(persons: Person[]): Person | undefined {
  return persons.find(p => p.highlight === 'me') ?? persons.find(p => p.ahnentafel === 1)
}

/** BFS up fatherId/motherId; returns generation-distance from `id` to each ancestor (0 = self). */
function ancestorDistances(id: string, byId: Map<string, Person>): Map<string, number> {
  const dist = new Map<string, number>()
  let frontier = [id]
  let d = 0
  while (frontier.length > 0) {
    const next: string[] = []
    for (const pid of frontier) {
      if (dist.has(pid)) continue
      dist.set(pid, d)
      const p = byId.get(pid)
      if (p?.fatherId) next.push(p.fatherId)
      if (p?.motherId) next.push(p.motherId)
    }
    frontier = next
    d++
  }
  return dist
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
const tippPrefix = (n: number) => Array(n).fill('tipp').join('-')

function ancestorTerm(gender: 'm' | 'f', da: number): string {
  if (da === 1) return gender === 'f' ? 'mor' : 'far'
  if (da === 2) return gender === 'f' ? 'bestemor' : 'bestefar'
  if (da === 3) return gender === 'f' ? 'oldemor' : 'oldefar'
  return `${tippPrefix(da - 3)}olde${gender === 'f' ? 'mor' : 'far'}`
}

function descendantTerm(gender: 'm' | 'f', db: number): string {
  if (db === 1) return gender === 'f' ? 'datter' : 'sønn'
  if (db === 2) return 'barnebarn'
  if (db === 3) return 'oldebarn'
  return `${tippPrefix(db - 3)}oldebarn`
}

function uncleTerm(gender: 'm' | 'f', removed: number): string {
  if (removed === 1) return gender === 'f' ? 'tante' : 'onkel'
  if (removed === 2) return gender === 'f' ? 'grandtante' : 'grandonkel'
  return `${tippPrefix(removed - 2)}oldeforelders ${gender === 'f' ? 'søster' : 'bror'}`
}

function nephewTerm(gender: 'm' | 'f', removed: number): string {
  if (removed === 1) return gender === 'f' ? 'niese' : 'nevø'
  if (removed === 2) return gender === 'f' ? 'grandniese' : 'grandnevø'
  return `${gender === 'f' ? 'barnebarns' : 'barnebarns'} ${descendantTerm(gender, removed - 1)}`
}

const MENNING_WORDS: Record<number, string> = {
  1: 'søskenbarn',
  2: 'tremenning',
  3: 'firmenning',
  4: 'femmenning',
  5: 'seksmenning',
  6: 'sjumenning',
  7: 'åttemenning',
}
const menningTerm = (degree: number) => MENNING_WORDS[degree] ?? `${degree + 1}.-grads slektning`

/**
 * Describes how `target` relates to `root`, purely from fatherId/motherId
 * ancestry — the nearest common ancestor plus the two generation-distances
 * to it (standard consanguinity-table logic) determines the Norwegian term.
 * Returns null if the two share no known ancestor in the dataset, or are
 * the same person.
 */
export function describeRelationship(
  root: Person,
  target: Person,
  byId: Map<string, Person>
): string | null {
  if (root.id === target.id) return null

  const rootDist = ancestorDistances(root.id, byId)
  const targetDist = ancestorDistances(target.id, byId)

  let common: { da: number; db: number } | null = null
  for (const [id, da] of rootDist) {
    const db = targetDist.get(id)
    if (db == null) continue
    if (!common || da + db < common.da + common.db) common = { da, db }
  }
  if (!common) return null

  const { da, db } = common
  const gender = target.gender

  if (db === 0) return capitalize(ancestorTerm(gender, da))
  if (da === 0) return capitalize(descendantTerm(gender, db))

  const degree = Math.min(da, db) - 1
  const removed = Math.abs(da - db)

  if (degree === 0) {
    if (removed === 0) return 'Søsken'
    return capitalize(da > db ? uncleTerm(gender, removed) : nephewTerm(gender, removed))
  }

  const base = menningTerm(degree)
  return removed === 0 ? capitalize(base) : `${capitalize(base)} (forskjøvet ${removed} ledd)`
}
