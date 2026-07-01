#!/usr/bin/env node
// Checks data/family.json for referential integrity and circular ancestry
// before it reaches the app: a bad id in fatherId/motherId/spouseId/children
// currently just fails silently (the card is dropped, no error surfaces).
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dataPath = join(__dirname, '..', 'data', 'family.json')

const { persons } = JSON.parse(readFileSync(dataPath, 'utf-8'))
const errors = []

const byId = new Map()
for (const p of persons) {
  if (byId.has(p.id)) errors.push(`Duplikat id: "${p.id}"`)
  byId.set(p.id, p)
}

const checkRef = (person, field) => {
  const ref = person[field]
  if (ref != null && !byId.has(ref)) {
    errors.push(`${person.id}: ${field} peker på ukjent id "${ref}"`)
  }
}

for (const p of persons) {
  checkRef(p, 'fatherId')
  checkRef(p, 'motherId')
  checkRef(p, 'spouseId')
  for (const child of p.children ?? []) {
    if (typeof child === 'object' && child.id != null && !byId.has(child.id)) {
      errors.push(`${p.id}: children[] peker på ukjent id "${child.id}"`)
    }
  }
}

// Circular ancestry: walk fatherId/motherId from every person; a person
// should never be their own ancestor.
for (const start of persons) {
  const seen = new Set()
  let frontier = [start.id]
  while (frontier.length > 0) {
    const next = []
    for (const id of frontier) {
      if (seen.has(id)) continue
      seen.add(id)
      const person = byId.get(id)
      if (!person) continue
      for (const parentId of [person.fatherId, person.motherId]) {
        if (!parentId) continue
        if (parentId === start.id) {
          errors.push(`Sirkulær referanse: "${start.id}" er sin egen forfar (via "${id}")`)
        } else {
          next.push(parentId)
        }
      }
    }
    frontier = next
  }
}

if (errors.length > 0) {
  console.error(`family.json: ${errors.length} feil funnet:\n`)
  for (const e of errors) console.error(`  - ${e}`)
  process.exit(1)
}

console.log(`family.json OK — ${persons.length} personer validert.`)
