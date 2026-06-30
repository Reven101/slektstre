'use client'

import { useState, useMemo } from 'react'
import { Person, FamilyData } from './types'
import PersonCard from './PersonCard'
import PersonModal from './PersonModal'

interface FamilyTreeProps {
  data: FamilyData
}

const ROLES: Record<number, string> = {
  1: 'Proband',
  2: 'Far', 3: 'Mor',
  4: 'Farfar', 5: 'Farmor', 6: 'Morfar', 7: 'Mormor',
  8: 'Oldefar (ff)', 9: 'Oldemor (ff)', 10: 'Oldefar (fm)', 11: 'Oldemor (fm)',
  12: 'Oldefar (mf)', 13: 'Oldemor (mf)', 14: 'Oldefar (mm)', 15: 'Oldemor (mm)',
  16: 'Tipp-oldefar (fff)', 17: 'Tipp-oldemor (fff)',
  18: 'Tipp-oldefar (ffm)', 19: 'Tipp-oldemor (ffm)',
  20: 'Tipp-oldefar (fmf)', 21: 'Tipp-oldemor (fmf)',
  22: 'Tipp-oldefar (fmm)', 23: 'Tipp-oldemor (fmm)',
  24: 'Tipp-oldefar (mff)', 25: 'Tipp-oldemor (mff)',
  26: 'Tipp-oldefar (mfm)', 27: 'Tipp-oldemor (mfm)',
  28: 'Tipp-oldefar (mmf)', 29: 'Tipp-oldemor (mmf)',
  30: 'Tipp-oldefar (mmm)', 31: 'Tipp-oldemor (mmm)',
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

  const persons = data.persons
  const byAhn = (n: number) => persons.find(p => p.ahnentafel === n)

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
    if (!p) return (
      <div key={n} className="p-card ghost" style={{ flex: 1, minWidth: 120 }}>
        <div className="p-role">{role}</div>
        <div className="p-name">ukjent</div>
      </div>
    )
    return <PersonCard key={p.id} person={p} role={role} onClick={setSelected} searchState={searchState(p)} />
  }

  const conn = (style: React.CSSProperties, key?: React.Key) => (
    <div key={key} className="conn-line" style={style} />
  )

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
      </div>

      <div className="tree-outer">

        {/* ── DESKTOP TREE ── */}
        <div className="tree-desktop">
          <div className="tree">

            {/* GEN 6 — Tipp-oldeforeldre */}
            <div className="gen">
              <div className="gen-label">Tipp-oldeforeldre</div>
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

            {/* Connector 6→5 */}
            <div className="connector" style={{ height: 40 }}>
              {[6.25, 18.75, 31.25, 43.75, 56.25, 68.75, 81.25, 93.75].map((l, i) =>
                conn({ top: 0, left: `${l}%`, width: '1.5px', height: 20 }, `t${i}`)
              )}
              {[12.5, 37.5, 62.5, 87.5].map((c, i) => ([
                conn({ top: 19, left: `${c - 6.25}%`, right: `${100 - c - 6.25}%`, height: '1.5px' }, `h${i}`),
                conn({ top: 20, left: `${c}%`, width: '1.5px', height: 20 }, `v${i}`),
              ]))}
            </div>

            {/* GEN 5 — Oldeforeldre */}
            <div className="gen">
              <div className="gen-label">Oldeforeldre</div>
              <div className="gen-row">
                {[[8,9],[10,11],[12,13],[14,15]].map((pair, i) => (
                  <div key={i} className="gen-side">
                    {pair.map(n => card(n))}
                  </div>
                ))}
              </div>
            </div>

            {/* Connector 5→4 */}
            <div className="connector" style={{ height: 36 }}>
              {conn({ top: 0, left: '12.5%', width: '1.5px', height: 36 })}
              {conn({ top: 0, left: '37.5%', width: '1.5px', height: 36 })}
              {conn({ top: 0, left: '62.5%', width: '1.5px', height: 36 })}
              {conn({ top: 0, left: '87.5%', width: '1.5px', height: 36 })}
              {conn({ bottom: 0, left: '12.5%', right: '62.5%', height: '1.5px' })}
              {conn({ bottom: 0, left: '37.5%', right: '37.5%', height: '1.5px' })}
              {conn({ top: 0, left: '25%', width: '1.5px', height: 36 })}
              {conn({ top: 0, left: '75%', width: '1.5px', height: 36 })}
            </div>

            {/* GEN 4 — Besteforeldre */}
            <div className="gen">
              <div className="gen-label">Besteforeldre</div>
              <div className="gen-row">
                <div className="gen-side">{card(4)}{card(5)}</div>
                <div className="gen-side">{card(6)}{card(7)}</div>
              </div>
            </div>

            {/* Connector 4→3 */}
            <div className="connector" style={{ height: 32 }}>
              {conn({ top: 0, left: '25%', width: '1.5px', height: 32 })}
              {conn({ top: 0, left: '75%', width: '1.5px', height: 32 })}
              {conn({ bottom: 0, left: '25%', right: '25%', height: '1.5px' })}
              {conn({ top: 0, left: '50%', width: '1.5px', height: 32 })}
            </div>

            {/* GEN 3 — Foreldre */}
            <div className="gen">
              <div className="gen-label">Foreldre</div>
              <div className="gen-row" style={{ justifyContent: 'space-around' }}>
                <div className="gen-side" style={{ flex: '0 1 auto' }}>{card(2)}</div>
                <div className="gen-side" style={{ flex: '0 1 auto' }}>{card(3)}</div>
              </div>
            </div>

            {/* Connector 3→1 */}
            <div className="connector" style={{ height: 32 }}>
              {conn({ top: 0, left: '35%', width: '1.5px', height: 32 })}
              {conn({ top: 0, left: '65%', width: '1.5px', height: 32 })}
              {conn({ bottom: 0, left: '35%', right: '35%', height: '1.5px' })}
              {conn({ top: 0, left: '50%', width: '1.5px', height: 32 })}
            </div>

            {/* GEN 1 — Proband */}
            <div className="gen">
              <div className="gen-label">Deg selv</div>
              <div className="gen-center">{card(1)}</div>
            </div>

          </div>
        </div>

        {/* ── MOBILE TREE ── */}
        <div className="tree-mobile">
          <div className="gen-section">
            <div className="gen-label-m">Deg selv</div>
            <div className="gen-cards-row" style={{ gridTemplateColumns: '1fr' }}>
              {card(1)}
            </div>
          </div>

          <div className="gen-section">
            <div className="gen-label-m">Foreldre</div>
            <div className="gen-cards-row">
              {card(2)}{card(3)}
            </div>
          </div>

          <div className="gen-section">
            <div className="gen-label-m">Besteforeldre</div>
            <div className="gen-cards-row">
              {card(4)}{card(5)}{card(6)}{card(7)}
            </div>
          </div>

          <div className="gen-section">
            <div className="gen-label-m">Oldeforeldre</div>
            <div className="gen-cards-row">
              {card(8)}{card(9)}{card(10)}{card(11)}
              {card(12)}{card(13)}{card(14)}{card(15)}
            </div>
          </div>

          <div className="gen-section">
            <div className="gen-label-m">Tipp-oldeforeldre</div>
            <div className="gen-cards-row">
              {([16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31] as number[]).map(n => card(n))}
            </div>
          </div>
        </div>

      </div>

      {selected && (
        <PersonModal
          person={selected}
          allPersons={persons}
          onClose={() => setSelected(null)}
          onNavigate={setSelected}
        />
      )}
    </>
  )
}
