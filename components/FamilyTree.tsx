'use client'

import { useState, useMemo, useEffect } from 'react'
import { Person, FamilyData } from './types'
import PersonCard from './PersonCard'
import PersonModal from './PersonModal'
import RootedTree from './RootedTree'
import PlacesMap from './PlacesMap'
import Timeline from './Timeline'
import { branchClass, buildPersonMap } from './family'
import { pct, mergeStep, stems } from './treeLayout'

interface FamilyTreeProps {
  data: FamilyData
}

const ROLES: Record<number, string> = {
  1: 'Far',
  2: 'Farfar', 3: 'Farmor',
  4: 'Oldefar (ff)', 5: 'Oldemor (ff)', 6: 'Oldefar (fm)', 7: 'Oldemor (fm)',
  8: 'Tippoldefar (fff)', 9: 'Tippoldemor (fff)', 10: 'Tippoldefar (ffm)', 11: 'Tippoldemor (ffm)',
  12: 'Tippoldefar (fmf)', 13: 'Tippoldemor (fmf)', 14: 'Tippoldefar (fmm)', 15: 'Tippoldemor (fmm)',
  16: 'Tipp-tippoldefar (fff)', 17: 'Tipp-tippoldemor (fff)',
  18: 'Tipp-tippoldefar (ffm)', 19: 'Tipp-tippoldemor (ffm)',
  20: 'Tipp-tippoldefar (fmf)', 21: 'Tipp-tippoldemor (fmf)',
  22: 'Tipp-tippoldefar (fmm)', 23: 'Tipp-tippoldemor (fmm)',
  24: 'Tipp-tippoldefar (mff)', 25: 'Tipp-tippoldemor (mff)',
  26: 'Tipp-tippoldefar (mfm)', 27: 'Tipp-tippoldemor (mfm)',
  28: 'Tipp-tippoldefar (mmf)', 29: 'Tipp-tippoldemor (mmf)',
  30: 'Tipp-tippoldefar (mmm)', 31: 'Tipp-tippoldemor (mmm)',
}
// Generasjon 7 (ahnentafel 32–63): 32 personer er for mange til å gi hver sin
// unike stiavkode uten at etiketten blir uleselig i et lite kort, så denne
// tieren dropper parentesen og bruker bare rollenavnet (samme konvensjon som
// slektskapskalkulatoren i family.ts).
for (let n = 32; n <= 63; n++) {
  ROLES[n] = n % 2 === 0 ? 'Tipp-tipp-tippoldefar' : 'Tipp-tipp-tippoldemor'
}
// Generasjon 7 (ahnentafel 64–127): ingen faste kort i selve treet ennå (verken
// desktop- eller mobilvisningen render noe forbi 63), men "Utforsk"-fanen kan
// avdekke dem ett trykk om gangen, så de trenger en rolleetikett når de vises der.
for (let n = 64; n <= 127; n++) {
  ROLES[n] = n % 2 === 0 ? 'Tipp-tipp-tipp-tippoldefar' : 'Tipp-tipp-tipp-tippoldemor'
}

function matchesPerson(p: Person, q: string): boolean {
  const s = q.toLowerCase()
  return (
    p.name.toLowerCase().includes(s) ||
    (p.maiden ?? '').toLowerCase().includes(s) ||
    (p.place ?? '').toLowerCase().includes(s) ||
    (p.occupation ?? '').toLowerCase().includes(s) ||
    (p.born ?? '').includes(s)
  )
}

export default function FamilyTree({ data }: FamilyTreeProps) {
  const [selected, setSelected] = useState<Person | null>(null)
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState<'tree' | 'timeline' | 'explore'>('tree')
  const [activeSection, setActiveSection] = useState(0)
  // Utforsk-fanen: hvilke ahnentafel-numre er "åpnet" (foreldrene deres vist).
  // Starter med noen nivåer åpne så treet ikke ser tomt ut ved første last.
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set([1, 2, 3]))

  const persons = data.persons
  const personById = useMemo(() => buildPersonMap(persons), [persons])

  // Delbare lenker: ?person=<id> åpner modalen direkte ved lasting, og
  // holdes i URL-en mens man navigerer, slik at lenken kan kopieres/deles.
  const selectPerson = (p: Person | null) => {
    setSelected(p)
    const url = new URL(window.location.href)
    if (p) url.searchParams.set('person', p.id)
    else url.searchParams.delete('person')
    window.history.replaceState(null, '', url.toString())
  }

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('person')
    const p = id ? personById.get(id) : undefined
    if (p) setSelected(p)
  }, [personById])

  // Reroot-navigasjon: ?fokus=<id> bytter hovedvisningen til et tre sentrert
  // på en vilkårlig person (forfedre + etterkommere), i stedet for det faste
  // Simen-forankrede ahnentafel-diagrammet.
  const [focusId, setFocusId] = useState<string | null>(null)

  const setFocus = (id: string | null) => {
    setFocusId(id)
    const url = new URL(window.location.href)
    if (id) url.searchParams.set('fokus', id)
    else url.searchParams.delete('fokus')
    window.history.replaceState(null, '', url.toString())
  }

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('fokus')
    if (id && personById.has(id)) setFocusId(id)
  }, [personById])

  // Drives the mobile gen-nav dots: highlights whichever generation section
  // is nearest the top of the viewport as the user scrolls the (long) list.
  useEffect(() => {
    if (viewMode !== 'tree' || focusId) return
    const sections = Array.from({ length: 6 }, (_, i) => document.getElementById(`gen-sec-${i}`))
      .filter((el): el is HTMLElement => !!el)
    if (sections.length === 0) return

    const observer = new IntersectionObserver(
      entries => {
        const visible = entries.filter(e => e.isIntersecting)
        if (visible.length === 0) return
        const topMost = visible.reduce((a, b) => (a.boundingClientRect.top < b.boundingClientRect.top ? a : b))
        const idx = sections.findIndex(el => el === topMost.target)
        if (idx !== -1) setActiveSection(idx)
      },
      { rootMargin: '-10% 0px -70% 0px', threshold: 0 }
    )
    sections.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [viewMode, focusId])

  const byAhnMap = useMemo(() => {
    const m = new Map<number, Person>()
    for (const p of persons) if (p.ahnentafel != null) m.set(p.ahnentafel, p)
    return m
  }, [persons])
  const byAhn = (n: number) => byAhnMap.get(n)

  // "Far og søsken"-raden er meg (ahnentafel 1) + de av min fars barn som
  // ikke er meg selv — utledet fra dataene i stedet for hardkodede id-er.
  const mySiblings = useMemo(() => {
    const me = byAhnMap.get(1)
    const father = me?.fatherId ? personById.get(me.fatherId) : undefined
    return (father?.children ?? [])
      .filter((c): c is { id: string; note?: string } => typeof c !== 'string' && c.id !== me?.id)
      .map(c => personById.get(c.id))
      .filter((p): p is Person => !!p)
  }, [byAhnMap, personById])

  const matchSet = useMemo(() => {
    if (!search.trim()) return null
    return new Set(persons.filter(p => matchesPerson(p, search.trim())).map(p => p.id))
  }, [search, persons])

  const matchCount = matchSet?.size ?? 0

  const searchState = (p: Person): 'match' | 'dimmed' | '' => {
    if (!matchSet) return ''
    return matchSet.has(p.id) ? 'match' : 'dimmed'
  }

  const card = (n: number) => {
    const p = byAhn(n)
    const role = ROLES[n] ?? ''
    // 'placeholder' marks a slot with no record at all ("ukjent"), distinct from
    // 'ghost' which real PersonCards also get when person.ghost flags them as
    // less certain — only placeholders should be dimmed on mobile, not real people.
    if (!p) return (
      <div key={n} className={['p-card', 'ghost', 'placeholder', branchClass(n)].filter(Boolean).join(' ')} style={{ flex: 1, minWidth: 120 }}>
        <div className="p-avatar-spacer" aria-hidden="true" />
        <div className="p-body">
          <div className="p-role">{role}</div>
          <div className="p-name">ukjent</div>
        </div>
      </div>
    )
    return <PersonCard key={p.id} person={p} role={role} onClick={selectPerson} searchState={searchState(p)} />
  }

  const toggleExpanded = (n: number) => {
    setExpandedNodes(prev => {
      const next = new Set(prev)
      if (next.has(n)) next.delete(n)
      else next.add(n)
      return next
    })
  }

  // "Utforsk"-fanen: viser bare Simen til å begynne med, og avdekker
  // foreldrene til en person ett trykk om gangen i stedet for å rendre alle
  // personene med en gang — samme ahnentafel-tallene som resten av treet (n's
  // foreldre er 2n og 2n+1), bare tegnet som et nedtrekkbart forgreiningstre.
  const renderExplorerNode = (n: number, key: React.Key): React.ReactNode => {
    const isExpanded = expandedNodes.has(n)
    const canExpand = n <= 63
    return (
      <div className="explore-node" key={key}>
        <div className="explore-row">
          {card(n)}
          {canExpand && (
            <button
              className={`explore-toggle${isExpanded ? ' expanded' : ''}`}
              onClick={() => toggleExpanded(n)}
              aria-expanded={isExpanded}
              aria-label={isExpanded ? 'Skjul foreldrene' : 'Vis foreldrene'}
              title={isExpanded ? 'Skjul foreldrene' : 'Vis foreldrene'}
            >
              +
            </button>
          )}
        </div>
        {isExpanded && canExpand && (
          <div className="explore-children">
            {renderExplorerNode(n * 2, 'father')}
            {renderExplorerNode(n * 2 + 1, 'mother')}
          </div>
        )}
      </div>
    )
  }

  // Mobile-only: the same generations as the desktop tree, flattened into a
  // list so each can get a scroll-anchor id (for the gen-nav jump dots below)
  // and a running generation number (for the gen-badge in its header).
  const mobileGens: { label: string; content: React.ReactNode }[] = [
    {
      label: 'Din kjære far og hans søsken',
      content: (
        <>
          {mySiblings.map(p => (
            <PersonCard key={p.id} person={p} role={p.gender === 'f' ? 'Tante' : 'Onkel'} onClick={selectPerson} searchState={searchState(p)} />
          ))}
          {card(1)}
        </>
      ),
    },
    { label: 'Besteforeldre', content: <>{card(2)}{card(3)}</> },
    { label: 'Oldeforeldre', content: <>{card(4)}{card(5)}{card(6)}{card(7)}</> },
    { label: 'Tippoldeforeldre', content: <>{[8, 9, 10, 11, 12, 13, 14, 15].map(n => card(n))}</> },
    { label: 'Tipp-tippoldeforeldre', content: <>{Array.from({ length: 16 }, (_, i) => i + 16).map(n => card(n))}</> },
    { label: 'Tipp-tipp-tippoldeforeldre', content: <>{Array.from({ length: 32 }, (_, i) => i + 32).map(n => card(n))}</> },
  ]

  const conn = (style: React.CSSProperties, key?: React.Key) => (
    <div key={key} className="conn-line" style={style} />
  )

  // Connector 7→6: 32 leaves merge one level (→16 couple-midpoints), landing
  // directly on GEN 6's 16 individual card positions (also pct(i,16)).
  const leaves32 = Array.from({ length: 32 }, (_, i) => pct(i, 32))
  const conn76Verticals1 = stems(leaves32, 0, 20, 'c76-lvl0', conn)
  const conn76Merge = mergeStep(leaves32, 19, 'c76-lvl0', conn)
  const conn76Verticals2 = stems(conn76Merge.next, 19, 22, 'c76-lvl1', conn)

  // Connector 6→5: 16 leaves merge two levels (→8 couple-midpoints →4 group-midpoints)
  const leaves16 = Array.from({ length: 16 }, (_, i) => pct(i, 16))
  const conn65Verticals1 = stems(leaves16, 0, 20, 'c65-lvl0', conn)
  const conn65Merge1 = mergeStep(leaves16, 19, 'c65-lvl0', conn)
  const conn65Verticals2 = stems(conn65Merge1.next, 19, 22, 'c65-lvl1', conn)
  const conn65Merge2 = mergeStep(conn65Merge1.next, 40, 'c65-lvl1', conn)
  const conn65Verticals3 = stems(conn65Merge2.next, 40, 30, 'c65-lvl2', conn)

  // Connector 5→4: 4 leaves merge one level (two independent Y-shapes, no cross-bridge)
  const leaves4 = Array.from({ length: 4 }, (_, i) => pct(i, 4))
  const conn54Verticals1 = stems(leaves4, 0, 18, 'c54-lvl0', conn)
  const conn54Merge = mergeStep(leaves4, 17, 'c54-lvl0', conn)
  const conn54Verticals2 = stems(conn54Merge.next, 17, 19, 'c54-lvl1', conn)

  // Connector 4→3: 2 leaves, straight verticals, no merge
  const leaves2 = Array.from({ length: 2 }, (_, i) => pct(i, 2))
  const conn43Verticals = stems(leaves2, 0, 32, 'c43', conn)

  // Connector 3→1: 2 leaves merge into 1 (Tom + Hilde → Simen)
  const conn31Verticals1 = stems(leaves2, 0, 16, 'c31-lvl0', conn)
  const conn31Merge = mergeStep(leaves2, 15, 'c31-lvl0', conn)
  const conn31Verticals2 = stems(conn31Merge.next, 15, 17, 'c31-lvl1', conn)

  return (
    <>
      {/* SEARCH */}
      <div style={{ padding: '24px 24px 0', maxWidth: 1200, margin: '0 auto' }}>
        <div className="search-wrap">
          <input
            className="search-input"
            type="search"
            placeholder="Søk etter person, sted eller yrke…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            aria-label="Søk i slektstreet"
          />
          {search && (
            <button className="search-clear" onClick={() => setSearch('')} aria-label="Nullstill søk">
              ✕
            </button>
          )}
        </div>
        <div className="search-count">
          {search && matchCount > 0 && `${matchCount} person${matchCount !== 1 ? 'er' : ''} funnet`}
          {search && matchCount === 0 && 'Ingen treff'}
        </div>
        <div className="view-toggle">
          <button
            className={`view-toggle-btn${viewMode === 'tree' ? ' active' : ''}`}
            onClick={() => setViewMode('tree')}
          >
            Slektstre
          </button>
          <button
            className={`view-toggle-btn${viewMode === 'timeline' ? ' active' : ''}`}
            onClick={() => setViewMode('timeline')}
          >
            Tidslinje
          </button>
          <button
            className={`view-toggle-btn${viewMode === 'explore' ? ' active' : ''}`}
            onClick={() => setViewMode('explore')}
          >
            Utforsk
          </button>
        </div>
      </div>

      {viewMode === 'timeline' ? (
        <div className="page-section" style={{ marginTop: 8 }}>
          <Timeline persons={persons} onSelect={selectPerson} />
        </div>
      ) : viewMode === 'explore' ? (
        <div className="page-section" style={{ marginTop: 8 }}>
          <p className="explore-hint">Trykk på <strong>+</strong> for å avdekke neste generasjon bakover.</p>
          <div className="explore-tree tree-mobile">
            {renderExplorerNode(1, 'root')}
          </div>
        </div>
      ) : focusId && personById.get(focusId) ? (
        <RootedTree
          root={personById.get(focusId)!}
          persons={persons}
          personById={personById}
          onSelect={selectPerson}
          searchState={searchState}
          onBack={() => setFocus(null)}
        />
      ) : (
      <div className="tree-outer">

        {/* ── DESKTOP TREE ── */}
        <div className="tree-desktop">
          <div className="tree">

            {/* GEN 7 — Tipp-tipp-tippoldeforeldre */}
            <div className="gen">
              <div className="gen-label">Tipp-tipp-tippoldeforeldre</div>
              <div className="gen-row">
                {Array.from({ length: 32 }, (_, i) => i + 32).reduce<number[][]>((acc, n, i) => {
                  if (i % 2 === 0) acc.push([n])
                  else acc[acc.length - 1].push(n)
                  return acc
                }, []).map((pair, i) => (
                  <div key={i} className="gen-side">
                    {pair.map(n => card(n))}
                  </div>
                ))}
              </div>
            </div>

            {/* Connector 7→6: one-level merge, positions computed from leaf count */}
            <div className="connector" style={{ height: 42 }}>
              {conn76Verticals1}
              {conn76Merge.elements}
              {conn76Verticals2}
            </div>

            {/* GEN 6 — Tipp-tippoldeforeldre */}
            <div className="gen">
              <div className="gen-label">Tipp-tippoldeforeldre</div>
              <div className="gen-row">
                {([16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31] as number[]).reduce<number[][]>((acc, n, i) => {
                  if (i % 2 === 0) acc.push([n])
                  else acc[acc.length - 1].push(n)
                  return acc
                }, []).map((pair, i) => (
                  <div key={i} className="gen-side">
                    {pair.map(n => card(n))}
                  </div>
                ))}
              </div>
            </div>

            {/* Connector 6→5: two-level Y-shapes, positions computed from leaf count */}
            <div className="connector" style={{ height: 70 }}>
              {conn65Verticals1}
              {conn65Merge1.elements}
              {conn65Verticals2}
              {conn65Merge2.elements}
              {conn65Verticals3}
            </div>

            {/* GEN 5 — Tippoldeforeldre */}
            <div className="gen">
              <div className="gen-label">Tippoldeforeldre</div>
              <div className="gen-row">
                {[[8,9],[10,11],[12,13],[14,15]].map((pair, i) => (
                  <div key={i} className="gen-side">
                    {pair.map(n => card(n))}
                  </div>
                ))}
              </div>
            </div>

            {/* Connector 5→4: two Y-shapes */}
            <div className="connector" style={{ height: 36 }}>
              {conn54Verticals1}
              {conn54Merge.elements}
              {conn54Verticals2}
            </div>

            {/* GEN 4 — Oldeforeldre */}
            <div className="gen">
              <div className="gen-label">Oldeforeldre</div>
              <div className="gen-row">
                <div className="gen-side">{card(4)}{card(5)}</div>
                <div className="gen-side">{card(6)}{card(7)}</div>
              </div>
            </div>

            {/* Connector 4→3: straight verticals, no cross-connection */}
            <div className="connector" style={{ height: 32 }}>
              {conn43Verticals}
            </div>

            {/* GEN 3 — Besteforeldre */}
            <div className="gen">
              <div className="gen-label">Besteforeldre</div>
              <div className="gen-row" style={{ justifyContent: 'space-around' }}>
                <div className="gen-side" style={{ flex: '0 1 auto' }}>{card(2)}</div>
                <div className="gen-side" style={{ flex: '0 1 auto' }}>{card(3)}</div>
              </div>
            </div>

            {/* Connector 3→1: Tom + Hilde → Simen */}
            <div className="connector" style={{ height: 32 }}>
              {conn31Verticals1}
              {conn31Merge.elements}
              {conn31Verticals2}
            </div>

            {/* GEN 1 — Far og søsken */}
            <div className="gen">
              <div className="gen-label">Din kjære far og hans søsken</div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
                {mySiblings.map(p => (
                  <PersonCard key={p.id} person={p} role={p.gender === 'f' ? 'Tante' : 'Onkel'} onClick={selectPerson} searchState={searchState(p)} />
                ))}
                {card(1)}
              </div>
            </div>

          </div>
        </div>

        {/* ── MOBILE TREE ── */}
        <div className="tree-mobile">
          {mobileGens.map((g, i) => (
            <div key={g.label} id={`gen-sec-${i}`} className="gen-section">
              <div className="gen-label-m">
                <span className="gen-badge">{i + 1}</span>
                {g.label}
              </div>
              <div className="gen-cards-row">{g.content}</div>
            </div>
          ))}
        </div>

      </div>
      )}

      {viewMode === 'tree' && !focusId && (
        <nav className="gen-nav" aria-label="Hopp til generasjon">
          {mobileGens.map((g, i) => (
            <button
              key={g.label}
              className={`gen-nav-dot${i === activeSection ? ' active' : ''}`}
              onClick={() => document.getElementById(`gen-sec-${i}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              aria-label={g.label}
              title={g.label}
            />
          ))}
        </nav>
      )}

      <div className="page-section" style={{ marginTop: 40 }}>
        <h2 className="section-title">Hvor slekten kommer fra</h2>
        <PlacesMap persons={persons} onSelect={selectPerson} />
      </div>

      {selected && (
        <PersonModal
          person={selected}
          allPersons={persons}
          onClose={() => selectPerson(null)}
          onNavigate={selectPerson}
          onFocus={p => {
            selectPerson(null)
            setFocus(p.id)
          }}
        />
      )}
    </>
  )
}
