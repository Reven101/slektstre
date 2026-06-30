'use client'

import { useState } from 'react'
import { Person, FamilyData } from './types'
import PersonCard from './PersonCard'
import PersonModal from './PersonModal'

interface FamilyTreeProps {
  data: FamilyData
}

export default function FamilyTree({ data }: FamilyTreeProps) {
  const [selected, setSelected] = useState<Person | null>(null)
  const persons = data.persons
  const byId = (id: string) => persons.find(p => p.id === id)!
  const byAhn = (n: number) => persons.find(p => p.ahnentafel === n)

  const handleClick = (person: Person) => setSelected(person)
  const handleClose = () => setSelected(null)
  const handleNavigate = (person: Person) => setSelected(person)

  const card = (ahnentafel: number, role: string) => {
    const p = byAhn(ahnentafel)
    if (!p) return <div className="p-card ghost" style={{ flex: 1, minWidth: 120 }}><div className="p-role">{role}</div><div className="p-name" style={{ color: '#A09888' }}>ukjent</div></div>
    return <PersonCard key={p.id} person={p} role={role} onClick={handleClick} />
  }

  return (
    <>
      <div className="tree-container">
        <div className="tree">

          {/* ── GEN 6: Tipp-oldeforeldre ── */}
          <div className="gen">
            <div className="gen-label">Tipp-oldeforeldre</div>
            <div className="gen-row">
              <div className="gen-side">
                {card(16, 'Tipp-oldefar (fff)')}
                {card(17, 'Tipp-oldemor (fff)')}
              </div>
              <div className="gen-side">
                {card(18, 'Tipp-oldefar (ffm)')}
                {card(19, 'Tipp-oldemor (ffm)')}
              </div>
              <div className="gen-side">
                {card(20, 'Tipp-oldefar (fmf)')}
                {card(21, 'Tipp-oldemor (fmf)')}
              </div>
              <div className="gen-side">
                {card(22, 'Tipp-oldefar (fmm)')}
                {card(23, 'Tipp-oldemor (fmm)')}
              </div>
              <div className="gen-side">
                {card(24, 'Tipp-oldefar (mff)')}
                {card(25, 'Tipp-oldemor (mff)')}
              </div>
              <div className="gen-side">
                {card(26, 'Tipp-oldefar (mfm)')}
                {card(27, 'Tipp-oldemor (mfm)')}
              </div>
              <div className="gen-side">
                {card(28, 'Tipp-oldefar (mmf)')}
                {card(29, 'Tipp-oldemor (mmf)')}
              </div>
              <div className="gen-side">
                {card(30, 'Tipp-oldefar (mmm)')}
                {card(31, 'Tipp-oldemor (mmm)')}
              </div>
            </div>
          </div>

          {/* ── Connector 6→5 ── */}
          <div className="connector" style={{ height: 40, position: 'relative' }}>
            {[6.25, 18.75, 31.25, 43.75, 56.25, 68.75, 81.25, 93.75].map((left, i) => (
              <div key={i} style={{ position: 'absolute', top: 0, left: `${left}%`, width: '1.5px', height: 20, background: 'var(--ink)' }} />
            ))}
            {[12.5, 37.5, 62.5, 87.5].map((center, i) => {
              const l = center - 6.25
              const r = 100 - center - 6.25
              return (
                <div key={i}>
                  <div style={{ position: 'absolute', top: 19, left: `${l}%`, right: `${r}%`, height: '1.5px', background: 'var(--ink)' }} />
                  <div style={{ position: 'absolute', top: 20, left: `${center}%`, width: '1.5px', height: 20, background: 'var(--ink)' }} />
                </div>
              )
            })}
          </div>

          {/* ── GEN 5: Oldeforeldre ── */}
          <div className="gen">
            <div className="gen-label">Oldeforeldre</div>
            <div className="gen-row">
              <div className="gen-side">
                {card(8, 'Oldefar (ff)')}
                {card(9, 'Oldemor (ff)')}
              </div>
              <div className="gen-side">
                {card(10, 'Oldefar (fm)')}
                {card(11, 'Oldemor (fm)')}
              </div>
              <div className="gen-side">
                {card(12, 'Oldefar (mf)')}
                {card(13, 'Oldemor (mf)')}
              </div>
              <div className="gen-side">
                {card(14, 'Oldefar (mm)')}
                {card(15, 'Oldemor (mm)')}
              </div>
            </div>
          </div>

          {/* ── Connector 5→4 ── */}
          <div className="connector" style={{ height: 28, position: 'relative' }}>
            {[12.5, 37.5, 62.5, 87.5].map((left, i) => (
              <div key={i} style={{ position: 'absolute', top: 0, left: `${left}%`, width: '1.5px', height: 28, background: 'var(--ink)' }} />
            ))}
            <div style={{ position: 'absolute', bottom: 0, left: '12.5%', right: '62.5%', height: '1.5px', background: 'var(--ink)' }} />
            <div style={{ position: 'absolute', bottom: 0, left: '37.5%', right: '37.5%', height: '1.5px', background: 'var(--ink)' }} />
            <div style={{ position: 'absolute', top: 0, left: '25%', width: '1.5px', height: 28, background: 'var(--ink)' }} />
            <div style={{ position: 'absolute', top: 0, left: '75%', width: '1.5px', height: 28, background: 'var(--ink)' }} />
          </div>

          {/* ── GEN 4: Besteforeldre ── */}
          <div className="gen">
            <div className="gen-label">Besteforeldre</div>
            <div className="gen-row">
              <div className="gen-side">
                {card(4, 'Farfar')}
                {card(5, 'Farmor')}
              </div>
              <div className="gen-side">
                {card(6, 'Morfar')}
                {card(7, 'Mormor')}
              </div>
            </div>
          </div>

          {/* ── Connector 4→3 ── */}
          <div className="connector" style={{ height: 28, position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, left: '25%', width: '1.5px', height: 28, background: 'var(--ink)' }} />
            <div style={{ position: 'absolute', top: 0, left: '75%', width: '1.5px', height: 28, background: 'var(--ink)' }} />
            <div style={{ position: 'absolute', bottom: 0, left: '25%', right: '25%', height: '1.5px', background: 'var(--ink)' }} />
            <div style={{ position: 'absolute', top: 0, left: '50%', width: '1.5px', height: 28, background: 'var(--ink)' }} />
          </div>

          {/* ── GEN 3: Foreldre ── */}
          <div className="gen">
            <div className="gen-label">Foreldre</div>
            <div className="gen-row" style={{ justifyContent: 'space-around' }}>
              <div className="gen-side" style={{ flex: '0 1 auto' }}>
                {card(2, 'Far')}
              </div>
              <div className="gen-side" style={{ flex: '0 1 auto' }}>
                {card(3, 'Mor')}
              </div>
            </div>
          </div>

          {/* ── Connector 3→1 ── */}
          <div className="connector" style={{ height: 28, position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, left: '35%', width: '1.5px', height: 28, background: 'var(--ink)' }} />
            <div style={{ position: 'absolute', top: 0, left: '65%', width: '1.5px', height: 28, background: 'var(--ink)' }} />
            <div style={{ position: 'absolute', bottom: 0, left: '35%', right: '35%', height: '1.5px', background: 'var(--ink)' }} />
            <div style={{ position: 'absolute', top: 0, left: '50%', width: '1.5px', height: 28, background: 'var(--ink)' }} />
          </div>

          {/* ── GEN 1: Simen ── */}
          <div className="gen">
            <div className="gen-label">Deg selv</div>
            <div className="gen-center">
              {card(1, 'Proband')}
            </div>
          </div>

        </div>
      </div>

      {selected && (
        <PersonModal
          person={selected}
          allPersons={persons}
          onClose={handleClose}
          onNavigate={handleNavigate}
        />
      )}
    </>
  )
}
