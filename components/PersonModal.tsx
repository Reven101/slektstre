'use client'

import { useEffect, useState, useMemo } from 'react'
import { Person } from './types'

interface PersonModalProps {
  person: Person
  allPersons: Person[]
  onClose: () => void
  onNavigate: (person: Person) => void
}

const DA_BASE = 'https://www.digitalarkivet.no/en/view/8/'

export default function PersonModal({ person, allPersons, onClose, onNavigate }: PersonModalProps) {
  const [transitioning, setTransitioning] = useState(false)
  const [current, setCurrent] = useState(person)

  const byId = (id?: string) => allPersons.find(p => p.id === id)
  const father = byId(current.fatherId)
  const mother  = byId(current.motherId)
  const spouse  = byId(current.spouseId)

  const siblings = useMemo(() => {
    const parentWithChildren = [father, mother].find(p => p?.children && p.children.length > 0)
    if (!parentWithChildren?.children) return []
    const firstName = current.name.split(' ')[0]
    return parentWithChildren.children.filter(c => !c.toLowerCase().includes(firstName.toLowerCase()))
  }, [father, mother, current])

  const dates   = [current.born, current.died].filter(Boolean).join(' – ')
  const married = current.marriedDate
    ? `Gift ${current.marriedDate}`
    : current.marriedYear
    ? `Gift ${current.marriedYear}`
    : null

  const navigate = (p: Person) => {
    setTransitioning(true)
    setTimeout(() => {
      setCurrent(p)
      onNavigate(p)
      setTransitioning(false)
    }, 140)
  }

  useEffect(() => {
    setCurrent(person)
  }, [person])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Informasjon om ${current.name}`}
    >
      <div
        className={`modal-panel${transitioning ? ' transitioning' : ''}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-pull" aria-hidden="true" />

        {/* HEADER */}
        <div className="modal-header">
          <div>
            <div className="modal-title">{current.name}</div>
            {current.maiden && (
              <div className="modal-maiden">f. {current.maiden}</div>
            )}
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Lukk">✕</button>
        </div>

        {/* META */}
        <div className="modal-meta">
          {dates && (
            <div>
              <div className="modal-meta-label">Levetid</div>
              <div className="modal-meta-value gold">{dates}</div>
            </div>
          )}
          {current.place && (
            <div>
              <div className="modal-meta-label">Sted</div>
              <div className="modal-meta-value">{current.place}</div>
            </div>
          )}
          {current.occupation && (
            <div>
              <div className="modal-meta-label">Yrke / tittel</div>
              <div className="modal-meta-value">{current.occupation}</div>
            </div>
          )}
          {spouse && (
            <div>
              <div className="modal-meta-label">Ektefelle</div>
              <div className="modal-meta-value">
                <span
                  onClick={() => navigate(spouse)}
                  style={{ cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: '3px' }}
                >
                  {spouse.name}
                </span>
                {married && <><br /><span style={{ fontSize: '.82rem', opacity: .7 }}>{married}</span></>}
              </div>
            </div>
          )}
        </div>

        {/* FORELDRE */}
        {(father || mother) && (
          <div className="modal-section">
            <div className="modal-section-title">Foreldre</div>
            <div className="modal-chips">
              {father && (
                <div className="modal-chip" onClick={() => navigate(father)}>
                  Far:&nbsp;{father.name}{father.born ? ` · f. ${father.born}` : ''}
                </div>
              )}
              {mother && (
                <div className="modal-chip" onClick={() => navigate(mother)}>
                  Mor:&nbsp;{mother.name}{mother.born ? ` · f. ${mother.born}` : ''}
                </div>
              )}
            </div>
          </div>
        )}

        {/* BIOGRAFI */}
        {current.notes && current.notes.length > 0 && (
          <div className="modal-section modal-notes">
            <div className="modal-section-title">
              Om {current.name.split(' ')[0]}
            </div>
            {current.notes.map((note, i) => (
              <p key={i}>{note}</p>
            ))}
          </div>
        )}

        {/* SØSKEN */}
        {siblings.length > 0 && (
          <div className="modal-section">
            <div className="modal-section-title">Søsken</div>
            <div className="modal-chips">
              {siblings.map((sib, i) => (
                <div key={i} className="modal-chip static">{sib}</div>
              ))}
            </div>
          </div>
        )}

        {/* BARN */}
        {current.children && current.children.length > 0 && (
          <div className="modal-section">
            <div className="modal-section-title">Barn</div>
            <div className="modal-chips">
              {current.children.map((child, i) => (
                <div key={i} className="modal-chip static">{child}</div>
              ))}
            </div>
          </div>
        )}

        {/* KILDER */}
        {current.sources && current.sources.length > 0 && (
          <div className="modal-sources">
            <strong>Kilder:&nbsp;</strong>
            {current.sources.map((src, i) => (
              <span key={i}>
                {src.sourceId ? (
                  <a href={`${DA_BASE}${src.sourceId}`} target="_blank" rel="noopener noreferrer">
                    {src.label}
                  </a>
                ) : (
                  src.label
                )}
                {i < (current.sources?.length ?? 0) - 1 ? ' · ' : ''}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
