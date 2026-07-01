import familyData from '@/data/family.json'
import FamilyTree from '@/components/FamilyTree'
import { FamilyData } from '@/components/types'

export default function Home() {
  const data = familyData as FamilyData

  const knownPersons = data.persons.filter(p => !p.ghost)
  const years = knownPersons
    .flatMap(p => [p.born, p.died])
    .filter(Boolean)
    .map(s => parseInt(s!.slice(-4)))
    .filter(n => !isNaN(n))
  const yearSpan = years.length > 0 ? Math.max(...years) - Math.min(...years) : 0

  // Ahnentafel-nummer n tilhører generasjon floor(log2(n)) + 1 (1=proband,
  // 2–3=besteforeldre, osv.) — utledes fra dataene i stedet for hardkodet tall.
  const ahnentafelNumbers = data.persons.map(p => p.ahnentafel).filter((n): n is number => n != null)
  const generations = ahnentafelNumbers.length > 0
    ? Math.floor(Math.log2(Math.max(...ahnentafelNumbers))) + 1
    : 0

  return (
    <>
      <header className="site-header">
        <span className="eyebrow">Slektstre</span>
        <h1>Halvparten av deg</h1>
        <p className="subtitle">
          Hustad&nbsp;·&nbsp;Husberg&nbsp;·&nbsp;Simensen&nbsp;·&nbsp;Werner
        </p>
        <div className="stat-bar">
          <div className="stat-item">
            <span className="stat-num">{knownPersons.length}</span>
            <span className="stat-label">Personer</span>
          </div>
          <div className="stat-item">
            <span className="stat-num">{generations}</span>
            <span className="stat-label">Generasjoner</span>
          </div>
          <div className="stat-item">
            <span className="stat-num">{yearSpan}</span>
            <span className="stat-label">År historikk</span>
          </div>
        </div>
      </header>

      <FamilyTree data={data} />

      <hr className="page-divider" />

      <div className="page-section">
        <h2 className="section-title">Gårder og bedrifter</h2>
        <div className="info-cards">
          <div className="info-card">
            <div className="info-card-title">Hustad-gården, Sandvollan</div>
            <div className="info-card-body">
              Gammelt gårdsnavn («hus» + «stad»).<br />
              To bruk: Hustad øvre (Tørris-linjen) og Hustad vestre (Ole Sivert-linjen).<br />
              Sandvollan ble egen kommune 1907, slått tilbake til Inderøy 1964.
            </div>
          </div>
          <div className="info-card">
            <div className="info-card-title">Werners Magasin, Drammen</div>
            <div className="info-card-body">
              Grunnlagt 1875 av Eduard Werner (1851–1923).<br />
              Tollbodgaten 4 — ca. 50 ansatte på 1930-tallet.<br />
              Signalamper til NSB, lanterner til marinen, glass og keramikk.<br />
              Drevet av familien i fire generasjoner til 1980.
            </div>
          </div>
        </div>
      </div>

      <div className="source-text">
        <strong>Kilder:</strong>{' '}
        Digitalarkivet – Inderøy kirkebøker 1821 (pd00000041360861), 1849 (pd00000041361884), vielse (pv00000008831226) ·{' '}
        Digitalarkivet – Folketelling 1891 Inderøy herred ·{' '}
        Wikipedia EN/NO: <em>Tormod Kristoffer Hustad</em>, <em>Tørris Hustad</em>, <em>Jens Andersen Hagen</em> ·{' '}
        Drammen Byleksikon · Lokalhistoriewiki · Geni.com · Geneanet ·{' '}
        <em>Kan inneholde unøyaktigheter — verifiser mot primærkilder.</em>
      </div>
    </>
  )
}
