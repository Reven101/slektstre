export type Person = {
  id: string
  ahnentafel: number
  name: string
  maiden?: string
  gender: 'm' | 'f'
  born?: string
  died?: string
  place?: string
  occupation?: string
  /** Path under /public, e.g. "/photos/tormod.jpg". Omit if no photo exists. */
  photo?: string
  notes?: string[]
  ghost?: boolean
  highlight?: 'warn' | 'me'
  fatherId?: string
  motherId?: string
  spouseId?: string
  marriedDate?: string
  marriedYear?: string
  sources?: { label: string; sourceId?: string }[]
  children?: ChildEntry[]
}

/**
 * A child mentioned on a parent's record. Most children in this dataset are
 * only known by name (no separate Person record exists for them), so they're
 * plain display strings. When a child *does* have its own Person record
 * elsewhere in the dataset, use the `{ id }` form instead of duplicating
 * their name/dates as text — the UI resolves the reference and renders it as
 * a clickable link to that person's own record.
 */
export type ChildEntry = string | { id: string; note?: string }

export type FamilyData = {
  persons: Person[]
}
