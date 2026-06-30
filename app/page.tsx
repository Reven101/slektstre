import familyData from '@/data/family.json'
import FamilyTree from '@/components/FamilyTree'
import { FamilyData } from '@/components/types'

export default function Home() {
  const data = familyData as FamilyData

  return (
    <>
      <header className="site-header">
        <p className="eyebrow">Slektstre</p>
        <h1>Simen Hustad</h1>
        <p className="subtitle">
          Seks generasjoner&nbsp;&nbsp;·&nbsp;&nbsp;Hustad&nbsp;/&nbsp;Husberg&nbsp;/&nbsp;Simensen&nbsp;/&nbsp;Werner
        </p>
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
              Sandvollan ble egen kommune 1907, slått tilbake til Inderøy 1964.<br />
              Hustad er også navn på sognet (Sandvollan/Hustad-soknet).
            </div>
          </div>
          <div className="info-card">
            <div className="info-card-title">Werners Magasin, Drammen</div>
            <div className="info-card-body">
              Grunnlagt 1875 av Eduard Werner (1851–1923).<br />
              Tollbodgaten 4, Drammen — ca. 50 ansatte på 1930-tallet.<br />
              Kobber- og blikkenslagerarbeid, signalamper til NSB,<br />
              lanterner til marinen, glass, steintøy, porselen, keramikk.<br />
              Drevet av familien i fire generasjoner:<br />
              Eduard → Ferdinand → Edvard jr. (1903–1955) → Kjell (1909–1980).
            </div>
          </div>
          <div className="info-card warn">
            <div className="info-card-title">Tormod K. Hustad — kontekst</div>
            <div className="info-card-body">
              NS-statsråd 1940–44. Dømt for landssvik etter krigen.<br />
              Arkitekt, utdannet NTH 1914. Vant designkonkurransen om NTH-ringen.<br />
              Historien er en del av familiens fulle bilde.
            </div>
          </div>
        </div>
      </div>

      <div className="source-text">
        <strong>Kilder (åpne, nettbaserte):</strong>{' '}
        Digitalarkivet – Døpte og begravede 1849, Inderøy (pd00000041361884) ·{' '}
        Digitalarkivet – Fødte og døpte 1821, Inderøy (pd00000041360861) ·{' '}
        Digitalarkivet – Vielse, Inderøy (pv00000008831226) ·{' '}
        Digitalarkivet – Folketelling 1891 Inderøy herred ·{' '}
        Wikipedia EN/NO: <em>Tormod Kristoffer Hustad</em>, <em>Tørris Hustad</em>, <em>Peder Konrad Hustad</em> ·{' '}
        KulturNav: Tormod Hustad ·{' '}
        Drammen Byleksikon: <em>Werners Magasin, Eduard</em> ·{' '}
        Lokalhistoriewiki: <em>Erling Simensen</em> ·{' '}
        Geni.com · Hemneslekt.net · Geneanet ·{' '}
        <em>Kan inneholde unøyaktigheter — verifiser mot primærkilder.</em>
      </div>
    </>
  )
}
