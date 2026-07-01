'use client'

import { Person } from './types'
import PersonCard from './PersonCard'
import { childrenOf } from './family'
import { pct, mergeStep, stems } from './treeLayout'

interface RootedTreeProps {
  root: Person
  persons: Person[]
  personById: Map<string, Person>
  onSelect: (p: Person) => void
  searchState: (p: Person) => 'match' | 'dimmed' | ''
  onBack: () => void
}

const DESCENDANT_DEPTH = 3

function DescendantNode({
  person,
  persons,
  depth,
  onSelect,
  searchState,
}: {
  person: Person
  persons: Person[]
  depth: number
  onSelect: (p: Person) => void
  searchState: (p: Person) => 'match' | 'dimmed' | ''
}) {
  const kids = depth > 0 ? childrenOf(person.id, persons) : []
  return (
    <div className="desc-node">
      <PersonCard person={person} role="" onClick={onSelect} searchState={searchState(person)} />
      {kids.length > 0 && (
        <div className="desc-children">
          {kids.map(k => (
            <DescendantNode
              key={k.id}
              person={k}
              persons={persons}
              depth={depth - 1}
              onSelect={onSelect}
              searchState={searchState}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function RootedTree({ root, persons, personById, onSelect, searchState, onBack }: RootedTreeProps) {
  const father = root.fatherId ? personById.get(root.fatherId) : undefined
  const mother = root.motherId ? personById.get(root.motherId) : undefined
  const grandparents = [
    father?.fatherId ? personById.get(father.fatherId) : undefined,
    father?.motherId ? personById.get(father.motherId) : undefined,
    mother?.fatherId ? personById.get(mother.fatherId) : undefined,
    mother?.motherId ? personById.get(mother.motherId) : undefined,
  ]
  const gpRoles = ['Farfar', 'Farmor', 'Morfar', 'Mormor']

  const conn = (style: React.CSSProperties, key?: React.Key) => (
    <div key={key} className="conn-line" style={style} />
  )

  const leaves4 = Array.from({ length: 4 }, (_, i) => pct(i, 4))
  const gpVerticals = stems(leaves4, 0, 18, 'rt-gp', conn)
  const gpMerge = mergeStep(leaves4, 17, 'rt-gp', conn)
  const parentVerticals1 = stems(gpMerge.next, 17, 19, 'rt-par', conn)

  const leaves2 = Array.from({ length: 2 }, (_, i) => pct(i, 2))
  const parentVerticals2 = stems(leaves2, 0, 16, 'rt-par2', conn)
  const rootMerge = mergeStep(leaves2, 15, 'rt-par2', conn)
  const rootVerticals = stems(rootMerge.next, 15, 17, 'rt-root', conn)

  const personOrGhost = (p: Person | undefined, role: string) =>
    p ? (
      <PersonCard key={p.id} person={p} role={role} onClick={onSelect} searchState={searchState(p)} />
    ) : (
      <div className="p-card ghost" style={{ flex: 1, minWidth: 120 }}>
        <div className="p-role">{role}</div>
        <div className="p-name">ukjent</div>
      </div>
    )

  const kids = childrenOf(root.id, persons)

  return (
    <div className="rooted-tree">
      <button className="rooted-tree-back" onClick={onBack}>← Tilbake til hovedtreet</button>

      <div className="tree" style={{ minWidth: 'unset', maxWidth: 620, margin: '24px auto 0' }}>
        <div className="gen">
          <div className="gen-label">Besteforeldre</div>
          <div className="gen-row">
            <div className="gen-side">{personOrGhost(grandparents[0], gpRoles[0])}{personOrGhost(grandparents[1], gpRoles[1])}</div>
            <div className="gen-side">{personOrGhost(grandparents[2], gpRoles[2])}{personOrGhost(grandparents[3], gpRoles[3])}</div>
          </div>
        </div>

        <div className="connector" style={{ height: 36 }}>
          {gpVerticals}
          {gpMerge.elements}
          {parentVerticals1}
        </div>

        <div className="gen">
          <div className="gen-label">Foreldre</div>
          <div className="gen-row" style={{ justifyContent: 'space-around' }}>
            <div className="gen-side" style={{ flex: '0 1 auto' }}>{personOrGhost(father, 'Far')}</div>
            <div className="gen-side" style={{ flex: '0 1 auto' }}>{personOrGhost(mother, 'Mor')}</div>
          </div>
        </div>

        <div className="connector" style={{ height: 32 }}>
          {parentVerticals2}
          {rootMerge.elements}
          {rootVerticals}
        </div>

        <div className="gen">
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <PersonCard person={root} role="I fokus" onClick={onSelect} searchState={searchState(root)} />
          </div>
        </div>
      </div>

      {kids.length > 0 && (
        <div className="descendants">
          <div className="gen-label" style={{ textAlign: 'center', margin: '40px 0 8px' }}>Etterkommere</div>
          <div className="desc-children desc-children-root">
            {kids.map(k => (
              <DescendantNode
                key={k.id}
                person={k}
                persons={persons}
                depth={DESCENDANT_DEPTH}
                onSelect={onSelect}
                searchState={searchState}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
