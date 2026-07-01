'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import Image from 'next/image'
import { ChildEntry, Person } from './types'
import { buildPersonMap, describeRelationship, findRoot, getSiblings, initials, resolveChildEntry } from './family'

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'

function NavChip({
  onClick,
  className = 'modal-chip',
  children,
}: {
  onClick: () => void
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      className={className}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
    >
      {children}
    </div>
  )
}

interface PersonModalProps {
  person: Person
  allPersons: Person[]
  onClose: () => void
  onNavigate: (person: Person) => void
  onFocus?: (person: Person) => void
}

const DA_BASE = 'https://www.digitalarkivet.no/en/view/8/'

export default function PersonModal({ person, allPersons, onClose, onNavigate, onFocus }: PersonModalProps) {
  const [transitioning, setTransitioning] = useState(false)
  const [current, setCurrent] = useState(person)
  const [copied, setCopied] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  const shareLink = async () => {
    const url = new URL(window.location.href)
    url.searchParams.set('person', current.id)
    const text = url.toString()
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      window.prompt('Kopier lenken:', text)
    }
  }

  const personById = useMemo(() => buildPersonMap(allPersons), [allPersons])
  const byId = (id?: string) => (id ? personById.get(id) : undefined)
  const father = byId(current.fatherId)
  const mother  = byId(current.motherId)
  const spouse  = byId(current.spouseId)

  const siblings = useMemo(
    () => getSiblings(current, father, mother),
    [father, mother, current]
  )

  const root = useMemo(() => findRoot(allPersons), [allPersons])
  const relationship = useMemo(
    () => (root ? describeRelationship(root, current, personById) : null),
    [root, current, personById]
  )

  const dates   = [current.born, current.died].filter(Boolean).join(' – ')
  const married = current.marriedDate
    ? `Gift ${current.marriedDate}`
    : current.marriedYear
    ? `Gift ${current.marriedYear}`
    : null

  const renderChildEntry = (entry: ChildEntry, key: number) => {
    const { text, personId } = resolveChildEntry(entry, personById)
    const linkedPerson = personId ? personById.get(personId) : undefined
    return linkedPerson ? (
      <NavChip key={key} onClick={() => navigate(linkedPerson)}>{text}</NavChip>
    ) : (
      <div key={key} className="modal-chip static">{text}</div>
    )
  }

  const navigate = (p: Person) => {
    setTransitioning(true)
    setCopied(false)
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
    const previouslyFocused = document.activeElement as HTMLElement | null
    panelRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key !== 'Tab' || !panelRef.current) return

      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      )
      if (focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      previouslyFocused?.focus()
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
        ref={panelRef}
        className={`modal-panel${transitioning ? ' transitioning' : ''}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-pull" aria-hidden="true" />

        {/* HEADER */}
        <div className="modal-header">
          <div className="modal-header-main">
            {current.photo ? (
              <Image className="modal-portrait" src={current.photo} alt="" width={72} height={72} />
            ) : (
              <div className="modal-portrait modal-portrait-fallback" aria-hidden="true">{initials(current.name)}</div>
            )}
            <div>
              <div className="modal-title">{current.name}</div>
              {current.maiden && (
                <div className="modal-maiden">f. {current.maiden}</div>
              )}
            </div>
          </div>
          <div className="modal-header-actions">
            {onFocus && (
              <button
                className="modal-share"
                onClick={() => onFocus(current)}
                aria-label={`Vis treet fokusert på ${current.name}`}
              >
                🌳 Vis herfra
              </button>
            )}
            <button className="modal-share" onClick={shareLink} aria-label="Kopier delbar lenke til denne personen">
              {copied ? '✓ Kopiert' : '🔗 Del'}
            </button>
            <button className="modal-close" onClick={onClose} aria-label="Lukk">✕</button>
          </div>
        </div>

        {/* META */}
        <div className="modal-meta">
          {dates && (
            <div>
              <div className="modal-meta-label">Levetid</div>
              <div className="modal-meta-value gold">{dates}</div>
            </div>
          )}
          {relationship && (
            <div>
              <div className="modal-meta-label">Slektskap med Simen</div>
              <div className="modal-meta-value">{relationship}</div>
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
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      navigate(spouse)
                    }
                  }}
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
                <NavChip onClick={() => navigate(father)}>
                  Far:&nbsp;{father.name}{father.born ? ` · f. ${father.born}` : ''}
                </NavChip>
              )}
              {mother && (
                <NavChip onClick={() => navigate(mother)}>
                  Mor:&nbsp;{mother.name}{mother.born ? ` · f. ${mother.born}` : ''}
                </NavChip>
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
              {siblings.map(renderChildEntry)}
            </div>
          </div>
        )}

        {/* BARN */}
        {current.children && current.children.length > 0 && (
          <div className="modal-section">
            <div className="modal-section-title">Barn</div>
            <div className="modal-chips">
              {current.children.map(renderChildEntry)}
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
