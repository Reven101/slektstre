'use client'

import { useEffect } from 'react'
import { Person } from './types'

interface PersonModalProps {
  person: Person
  allPersons: Person[]
  onClose: () => void
  onNavigate: (person: Person) => void
}

const DA_BASE = 'https://www.digitalarkivet.no/en/view/8/'

export default function PersonModal({ person, allPersons, onClose, onNavigate }: PersonModalProps) {
  const byId = (id?: string) => allPersons.find(p => p.id === id)
  const father = byId(person.fatherId)
  const mother  = byId(person.motherId)
  const spouse  = byId(person.spouseId)

  const dates   = [person.born, person.died].filter(Boolean).join(' – ')
  const married = person.marriedDate
    ? `Gift ${person.marriedDate}`
    : person.marriedYear
    ? `Gift ${person.marriedYear}`
    : null

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
      aria-label={`Informasjon om ${person.name}`}
    >
      <div className="modal-panel" onClick={e => e.stopPropagation()}>

        {/* pull indicator — mobile only */}
        <div className="modal-pull" aria-hidden="true" />

        {/* ── HEADER ── */}
        <div className="modal-header">
          <div>
            <div className="modal-title">{person.name}</div>
            {person.maiden && (
              <div className="modal-maiden">f. {person.maiden}</div>
            )}
          </div>
          <button
            className="modal-close"
            onClick={onClose}
            aria-label="Lukk"
          >
            ✕
          </button>
        </div>

        {/* ── META GRID ── */}
        <div className="modal-meta">
          {dates && (
            <div>
              <div className="modal-meta-label">Levetid</div>
              <div className="modal-meta-value gold">{dates}</div>
            </div>
          )}
          {person.place && (
            <div>
              <div className="modal-meta-label">Sted</div>
              <div className="modal-meta-value">{person.place}</div>
            </div>
          )}
          {person.occupation && (
            <div>
              <div className="modal-meta-label">Yrke / tittel</div>
              <div className="modal-meta-value">{person.occupation}</div>
            </div>
          )}
          {spouse && (
            <div>
              <div className="modal-meta-label">Ektefelle</div>
              <div className="modal-meta-value">
                <span
                  onClick={() => onNavigate(spouse)}
                  style={{ cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: '3px' }}
                >
                  {spouse.name}
                </span>
                {married ? <><br /><span style={{ fontSize: '.8rem', opacity: .7 }}>{married}</span></> : null}
              </div>
            </div>
          )}
        </div>

        {/* ── FORELDRE ── */}
        {(father || mother) && (
          <div className="modal-section">
            <div className="modal-section-title">Foreldre</div>
            <div className="modal-chips">
              {father && (
                <div className="modal-chip" onClick={() => onNavigate(father)}>
                  Far:&nbsp;{father.name}{father.born ? ` · f. ${father.born}` : ''}
                </div>
              )}
              {mother && (
                <div className="modal-chip" onClick={() => onNavigate(mother)}>
                  Mor:&nbsp;{mother.name}{mother.born ? ` · f. ${mother.born}` : ''}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── BIOGRAFI ── */}
        {person.notes && person.notes.length > 0 && (
          <div className="modal-section modal-notes">
            <div className="modal-section-title">
              Om {person.name.split(' ')[0]}
            </div>
            {person.notes.map((note, i) => (
              <p key={i}>{note}</p>
            ))}
          </div>
        )}

        {/* ── BARN ── */}
        {person.children && person.children.length > 0 && (
          <div className="modal-section">
            <div className="modal-section-title">Barn</div>
            <div className="modal-chips">
              {person.children.map((child, i) => (
                <div key={i} className="modal-chip static">{child}</div>
              ))}
            </div>
          </div>
        )}

        {/* ── KILDER ── */}
        {person.sources && person.sources.length > 0 && (
          <div className="modal-sources">
            <strong>Kilder:&nbsp;</strong>
            {person.sources.map((src, i) => (
              <span key={i}>
                {src.sourceId ? (
                  <a
                    href={`${DA_BASE}${src.sourceId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {src.label}
                  </a>
                ) : (
                  src.label
                )}
                {i < (person.sources?.length ?? 0) - 1 ? ' · ' : ''}
              </span>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
