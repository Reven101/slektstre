import { ChildEntry, Person } from './types'

/** Builds an id → Person lookup once, instead of repeated Array.find() scans. */
export function buildPersonMap(persons: Person[]): Map<string, Person> {
  return new Map(persons.map(p => [p.id, p]))
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
