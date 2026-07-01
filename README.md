# Slektstre – Simen Hustad

Interaktivt slektstre bygget med Next.js/React.

## Bruk

```
npm install
npm run dev
```

Data om personer og relasjoner ligger i `data/family.json`.

## Teknisk

- Next.js 15 / React 19, TypeScript strict mode.
- `npm run validate` sjekker referanseintegritet (fatherId/motherId/spouseId/children)
  og sirkulære referanser i `data/family.json`. Kjøres automatisk før `npm run build`.

## Arkivert

`slektstre.html` og `index.html` er en tidligere, frittstående HTML-versjon av
slektstreet (før migrering til Next.js). De er **ikke lenger vedlikeholdt** og
kan inneholde utdaterte data — de ligger igjen kun som historisk snapshot.
Next.js-appen i `app/`/`components/`/`data/` er den aktive kilden til sannhet.
