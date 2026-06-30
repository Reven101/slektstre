export type Person = {
  id: string
  ahnentafel: number
  name: string
  maiden?: string
  gender: 'm' | 'f'
  born?: string
  died?: string
  place?: string
  occupation?: string
  notes?: string[]
  ghost?: boolean
  highlight?: 'warn' | 'me'
  fatherId?: string
  motherId?: string
  spouseId?: string
  marriedDate?: string
  marriedYear?: string
  sources?: { label: string; sourceId?: string }[]
  children?: string[]
}

export type FamilyData = {
  persons: Person[]
}
