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

            {/* Connector 6→5: two-level Y-shapes */}
            <div className="connector" style={{ height: 70 }}>
              {/* L1: vertical from each individual card center */}
              {([2.95,9.13,15.52,21.70,28.07,34.25,40.64,46.82,53.19,59.37,65.75,71.94,78.31,84.49,90.87,97.06] as number[]).map((l, i) =>
                conn({ top: 0, left: `${l}%`, width: '1.5px', height: 20 }, `c${i}`)
              )}
              {/* L1: within-couple horizontals */}
              {conn({ top: 19, left: '2.95%',  right: '90.87%', height: '1.5px' }, 'ch0')}
              {conn({ top: 19, left: '15.52%', right: '78.30%', height: '1.5px' }, 'ch1')}
              {conn({ top: 19, left: '28.07%', right: '65.75%', height: '1.5px' }, 'ch2')}
              {conn({ top: 19, left: '40.64%', right: '53.18%', height: '1.5px' }, 'ch3')}
              {conn({ top: 19, left: '53.19%', right: '40.63%', height: '1.5px' }, 'ch4')}
              {conn({ top: 19, left: '65.75%', right: '28.06%', height: '1.5px' }, 'ch5')}
              {conn({ top: 19, left: '78.31%', right: '15.51%', height: '1.5px' }, 'ch6')}
              {conn({ top: 19, left: '90.87%', right: '2.94%',  height: '1.5px' }, 'ch7')}
              {/* L1→L2: gen-side center stems */}
              {([6.04,18.60,31.16,43.72,56.28,68.84,81.40,93.96] as number[]).map((l, i) =>
                conn({ top: 19, left: `${l}%`, width: '1.5px', height: 22 }, `gs${i}`)
              )}
              {/* L2: group-pair horizontals */}
              {conn({ top: 40, left: '6.04%',  right: '81.40%', height: '1.5px' }, 'gh0')}
              {conn({ top: 40, left: '31.16%', right: '56.28%', height: '1.5px' }, 'gh1')}
              {conn({ top: 40, left: '56.28%', right: '31.16%', height: '1.5px' }, 'gh2')}
              {conn({ top: 40, left: '81.40%', right: '6.04%',  height: '1.5px' }, 'gh3')}
              {/* L2→gen5: stems down to oldeforeldre */}
              {([12.32,37.44,62.56,87.68] as number[]).map((l, i) =>
                conn({ top: 40, left: `${l}%`, width: '1.5px', height: 30 }, `s${i}`)
              )}
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

            {/* Connector 5→4: two Y-shapes */}
            <div className="connector" style={{ height: 36 }}>
              {/* Left Y: (8,9)@12.5% + (10,11)@37.5% → (4,5)@25% */}
              {conn({ top: 0, left: '12.5%', width: '1.5px', height: 18 })}
              {conn({ top: 0, left: '37.5%', width: '1.5px', height: 18 })}
              {conn({ top: 17, left: '12.5%', right: '62.5%', height: '1.5px' })}
              {conn({ top: 17, left: '25%', width: '1.5px', height: 19 })}
              {/* Right Y: (12,13)@62.5% + (14,15)@87.5% → (6,7)@75% */}
              {conn({ top: 0, left: '62.5%', width: '1.5px', height: 18 })}
              {conn({ top: 0, left: '87.5%', width: '1.5px', height: 18 })}
              {conn({ top: 17, left: '62.5%', right: '12.5%', height: '1.5px' })}
              {conn({ top: 17, left: '75%', width: '1.5px', height: 19 })}
            </div>

            {/* GEN 4 — Besteforeldre */}
            <div className="gen">
              <div className="gen-label">Besteforeldre</div>
              <div className="gen-row">
                <div className="gen-side">{card(4)}{card(5)}</div>
                <div className="gen-side">{card(6)}{card(7)}</div>
              </div>
            </div>

            {/* Connector 4→3: straight verticals, no cross-connection */}
            <div className="connector" style={{ height: 32 }}>
              {conn({ top: 0, left: '25%', width: '1.5px', height: 32 })}
              {conn({ top: 0, left: '75%', width: '1.5px', height: 32 })}
            </div>

            {/* GEN 3 — Foreldre */}
            <div className="gen">
              <div className="gen-label">Foreldre</div>
              <div className="gen-row" style={{ justifyContent: 'space-around' }}>
                <div className="gen-side" style={{ flex: '0 1 auto' }}>{card(2)}</div>
                <div className="gen-side" style={{ flex: '0 1 auto' }}>{card(3)}</div>
              </div>
            </div>

            {/* Connector 3→1: Tom@25% + Hilde@75% → Simen@50% */}
            <div className="connector" style={{ height: 32 }}>
              {conn({ top: 0, left: '25%', width: '1.5px', height: 16 })}
              {conn({ top: 0, left: '75%', width: '1.5px', height: 16 })}
              {conn({ top: 15, left: '25%', right: '25%', height: '1.5px' })}
              {conn({ top: 15, left: '50%', width: '1.5px', height: 17 })}
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
