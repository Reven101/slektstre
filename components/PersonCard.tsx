'use client'

import Image from 'next/image'
import { Person } from './types'
import { branchClass, initials } from './family'

interface PersonCardProps {
  person: Person
  role: string
  onClick: (person: Person) => void
  searchState?: 'match' | 'dimmed' | ''
}

export default function PersonCard({ person, role, onClick, searchState = '' }: PersonCardProps) {
  const cls = [
    'p-card',
    person.highlight ?? '',
    person.ghost ? 'ghost' : '',
    !person.highlight ? branchClass(person.ahnentafel) : '',
    searchState,
  ].filter(Boolean).join(' ')

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
      {person.photo ? (
        <Image
          className="p-photo"
          src={person.photo}
          alt=""
          width={40}
          height={40}
        />
      ) : (
        <div className="p-avatar-fallback" aria-hidden="true">{initials(person.name)}</div>
      )}
      <div className="p-body">
        <div className="p-role">{role}</div>
        <div className="p-name">{person.name}</div>
        {person.maiden && <div className="p-maiden">f. {person.maiden}</div>}
        {dates && <div className="p-dates">{dates}</div>}
        {person.place && <div className="p-place">{person.place}</div>}
        {person.highlight === 'warn' && person.occupation && (
          <span className="p-tag">{person.occupation}</span>
        )}
        {!person.highlight && person.occupation && (
          <div className="p-occ">{person.occupation}</div>
        )}
        {person.highlight === 'me' && (
          <span className="p-me-tag">Din far</span>
        )}
      </div>
    </div>
  )
}
