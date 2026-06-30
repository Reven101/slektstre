'use client'

import { Person } from './types'

interface PersonCardProps {
  person: Person
  role: string
  onClick: (person: Person) => void
}

export default function PersonCard({ person, role, onClick }: PersonCardProps) {
  const cls = ['p-card', person.highlight ?? '', person.ghost ? 'ghost' : '']
    .filter(Boolean)
    .join(' ')

  const dates = [person.born, person.died].filter(Boolean).join(' – ')

  return (
    <div
      className={cls}
      onClick={() => onClick(person)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick(person)}
      aria-label={`Åpne informasjon om ${person.name}`}
    >
      <div className="p-role">{role}</div>
      <div className="p-name">{person.name}</div>
      {person.maiden && <div className="p-maiden">f. {person.maiden}</div>}
      {dates && <div className="p-dates">{dates}</div>}
      {person.place && <div className="p-place">{person.place}</div>}
      {person.occupation && person.highlight === 'warn' && (
        <span className="p-tag">{person.occupation}</span>
      )}
      {person.occupation && !person.highlight && (
        <div className="p-occ">{person.occupation}</div>
      )}
      {person.highlight === 'me' && (
        <span className="p-me-tag">Proband</span>
      )}
    </div>
  )
}
