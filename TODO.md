# TODO / Projektihistoria — Benvenuto

Tämä tiedosto seuraa mitä on tehty, mitä on kesken ja mitä on suunniteltu. Tuotesuunnitelma:
[docs/product-plan.md](docs/product-plan.md). Tekninen kuvaus: [docs/technical-documentation.md](docs/technical-documentation.md).

Päivitä tätä tiedostoa aina kun tehtävän tila muuttuu (siirrä rivi oikeaan osioon), älä vain
lisää uusia rivejä loppuun.

## Tehty (2026-07-17)

- [x] Next.js-projekti skaffattu (TypeScript, Tailwind v4, App Router, npm)
- [x] Asennettu `ai`, `@ai-sdk/react`, `@ai-sdk/openai`, `@ai-sdk/anthropic`, `zod`, `react-markdown`
- [x] `lib/prompts.ts`: kolmen tilan (`grammar`/`conversation`/`phonetics`) system-promptit ja `MODES`-metadata
- [x] `app/api/chat/route.ts`: provider-vaihdettava (`LLM_PROVIDER` env) streaming-API-reitti
- [x] `components/ChatPanel.tsx`: chat-UI (`useChat`, `DefaultChatTransport`, viestien värit, Markdown-render)
- [x] `docs/product-plan.md` ja `docs/technical-documentation.md` kirjoitettu
- [x] Asennettu `@tailwindcss/typography`, lisätty `@plugin "@tailwindcss/typography";` `app/globals.css`:ään
- [x] `app/page.tsx`: tilanvalitsin (3 painiketta) rakennettu, rendersoi `<ChatPanel mode={activeMode} key={activeMode} />`
- [x] `app/layout.tsx`: `html`/`body` `h-full` täyskorkeaan flex-layoutiin, metadata (title/description/lang) päivitetty
- [x] `.env.local.example` lisätty (`LLM_PROVIDER`, `OPENAI_API_KEY`, `OPENAI_MODEL`, `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL`)
- [x] `README.md` päivitetty asennus- ja ajo-ohjeilla
- [x] Korjattu TS-virhe: `convertToModelMessages` palauttaa `Promise<ModelMessage[]>` (AI SDK v7) — lisätty `await`
- [x] `npx tsc --noEmit` ja `npx eslint .` menevät läpi puhtaasti
- [x] `npm run dev` käynnistetty ja todennettu: sivu renderöityy, kaikki kolme tilaa (Kielioppi/Keskustelu/Ääntäminen)
      näkyvät otsikossa, ja `/api/chat` käsittelee virhetilanteen (puuttuva API-avain) siististi streamatulla
      `error`-eventillä kaatumatta

- [x] Korjattu vanhentunut oletusmalli `.env.local.example`/`app/api/chat/route.ts`:ssä
      (`claude-3-5-haiku-20241022` → `claude-haiku-4-5`) — löydetty arkkitehtuurisuunnittelun
      sivuhuomiona 2026-07-17

## Kesken / seuraavaksi (v1)

- [ ] Päästä-päähän-testaus oikealla LLM-vastauksella vaatii API-avaimen `.env.local`-tiedostoon
      (`OPENAI_API_KEY` tai `ANTHROPIC_API_KEY` + `LLM_PROVIDER`). Ei vielä tehty — käyttäjä päätti
      2026-07-17 jättää rakenteellisen testauksen (rendausvarmistus, typecheck, lint, virheenkäsittely)
      toistaiseksi riittäväksi ilman avainta.
- [ ] Kun avain lisätään: testaa kaikki kolme tilaa selaimessa oikealla keskustelulla (myös molemmilla
      providereilla, jos molempiin on avaimet)

## Laajennus v2 (päätetty 2026-07-17)

Käyttäjä päätti laajentaa sovellusta merkittävästi: sanasto & kertaus, kielioppikirjasto, ääni
(TTS/STT) ja tietopainotteinen dashboard-UI. Tausta ja rajaukset: [docs/product-plan.md](docs/product-plan.md)
§7. Yksityiskohtaiset suunnitelmat: [docs/architecture-v2.md](docs/architecture-v2.md) (tekninen) ja
[docs/ux-dashboard-design.md](docs/ux-dashboard-design.md) (UX/layout). Alla olevat epiikat noudattavat
architecture-v2.md §7:n migraatiopolkua — tee järjestyksessä, koska myöhemmät epiikat nojaavat aiempiin.

### Epic 1 — DB-perusta ✅ (2026-07-17)

- [x] Asenna `drizzle-orm`, `drizzle-kit`, `better-sqlite3` (+ `@types/better-sqlite3`)
- [x] `lib/db/schema.ts`: `messages`-taulu
- [x] `lib/db/client.ts`: better-sqlite3 + drizzle-instanssi (singleton, hot-reload-turvallinen via
      `globalThis`, ajaa migraatiot ohjelmallisesti alustuksessa)
- [x] `data/*.sqlite`(+`-journal`/`-wal`/`-shm`) `.gitignore`:iin, `drizzle.config.ts` + ensimmäinen
      migraatio (`drizzle/0000_magenta_zzzax.sql`, generoitu `npx drizzle-kit generate`)
- [x] `app/api/chat/route.ts`: persistoi käyttäjän/assistentin viestit `onFinish`-hookissa
      (poimii viimeisimmän user-viestin `parts`-taulukosta, batch-insert Drizzlellä)
- [x] Verifioitu: `npx tsc --noEmit` ja `npx eslint .` puhtaasti läpi; ad-hoc-ajolla vahvistettu
      migraation idempotenssi ja `messages`-taulun skeema oikeasta `.sqlite`-tiedostosta

### Epic 2 — Sanaston poimintaputki ✅ (2026-07-17)

- [x] `lib/db/schema.ts`: `vocabCards`- ja `reviewLog`-taulut (SRS-kentät, ks. architecture-v2.md §2.2),
      migraatio `drizzle/0001_talented_eternity.sql`
- [x] `lib/extraction/extractVocab.ts`: `generateObject` + Zod-skeema, mode-kohtainen extraction-prompti
      (huom: Zod-kentät `nullable()` eikä `optional()` — OpenAI structured output vaatii kaikki
      kentät `required`-listassa; valinnaisuus ilmaistu `null`-arvolla)
- [x] `lib/ai/model.ts`: `resolveModel()` siirretty jaettuun moduuliin (käytössä chat-reitissä ja
      extraction-putkessa)
- [x] Next.js `after()`-hook `/api/chat`:iin extraction-kutsun ajamiseksi vastauksen striimauksen jälkeen
      (`onFinish` insertoi käyttäjä-/assistentti-viestit erikseen, ottaa assistentin `lastInsertRowid`:n
      talteen, käynnistää `after(() => extractVocab(...))`)
- [x] Manuaalinen tarkistus tehty oikealla LLM-kutsulla (curl `/api/chat`, conversation + phonetics):
      järkeviä sanakortteja syntyi suoraan tietokantaan (esim. "Buongiorno"→"Hyvää huomenta",
      "caffè"→"kahvi" context-selityksellä tuplakonsonantista). Pieni tunnettu artefakti: phonetics-tilassa
      malli pilkkoi kerran sanan kahteen erilliseen Markdown-bold-spaniin (`**caf** **fè**`), josta syntyi
      kaksi erillistä osakorttia — promptin virittämistä myöhemmin, ei koodivirhe.

### Epic 3 — Sanasto-UI ✅ (2026-07-17)

- [x] `/api/vocab` (GET lista + `?due=`/`?q=` suodattimet, POST manuaalinen lisäys) —
      `lib/vocab/status.ts`:n `computeVocabStatus()` laskee `status`-kentän (`new`/`due`/`learned`);
      `?due=true` on tarkoituksella laajempi joukko kuin `status==="due"` (sisältää myös uudet kortit,
      koska niiden `dueAt` on heti nyt — tuleva kertaussessio Epic 4 käyttää tätä)
- [x] `/api/vocab/[id]` (PATCH, DELETE) — Next.js 16:n async `params`-konvention mukaisesti
- [x] `app/(app)/sanasto/page.tsx`: lista, debounced haku, suodatinchipit (Kaikki/Due nyt/Uudet/Opitut
      client-puolella `status`-kentästä), CTA "Aloita kertaus" (näkyy kun due-määrä > 0, linkki
      `/kertaus`:iin — 404 toistaiseksi, Epic 4:n asia), poistopainike per rivi
- [x] Testattu oikealla datalla: API curl-testein (GET/POST/PATCH/DELETE) ja selaimessa Playwrightilla
      (haku, suodatinklikkaus, light+dark-teema, konsolivirheet tarkistettu — ei virheitä)
- [x] a11y-guardian-auditointi tehty ja korjattu uuteen sivuun: `aria-label` hakukenttään,
      `aria-pressed` + fokusrengas suodatinchippeihin, `role="status"`/`aria-live="polite"`
      lataus-/virhe-/tyhjätila-viesteihin. (Huom: samat puutteet — placeholder-only-inputit,
      `aria-pressed`:in puute — havaittiin myös v1:n `app/page.tsx`:ssä/`ChatPanel.tsx`:ssä,
      ei korjattu tässä epiikassa, koska ne ovat olemassa olevaa koodia scopen ulkopuolella;
      mahdollinen erillinen a11y-siivous-tehtävä myöhemmin.)

### Epic 4 — SRS-kertaus ✅ (2026-07-18)

- [x] `lib/db/srs.ts`: SM-2-algoritmi puhtaana funktiona (`computeNextReview`) — HUOM tietoinen
      poikkeama klassisesta SM-2:sta: UI:ssa on vain kolme arviointinappia (Vaikea/Hyvä/Helppo,
      kaikki "onnistunut muistaminen" eri vaikeusasteilla), joten `repetitions` ei koskaan nollaudu
      (ei "again"-nappia). Verifioitu ad-hoc-testillä: intervallit kasvavat odotetusti (1→6→15+ päivää)
      ja `easeFactor` clampautuu minimiin 1.3.
- [x] `/api/vocab/review` (POST arvosana → uusi ease/interval/dueAt, kirjaa `review_log`-rivin)
- [x] `app/(app)/kertaus/page.tsx`: flashcard-kulku (lataus→aloitus→etupuoli→paljastettu→loppu,
      ks. ux-dashboard-design.md §5) — "Seuraava kertaus: huomenna N sanalle" -rivi jätetty
      tietoisesti pois (vaatisi ylimääräistä ennustelaskentaa, ei tämän epiikan laajuudessa)
- [x] Testattu: SM-2-yksikkötestit + oikea API-kutsu curlilla, ja koko flashcard-kulku Playwrightilla
      selaimessa (63 due-korttia, kortin vaihto, kaikki kolme arviointinappia, ei konsolivirheitä)
- [x] a11y-guardian-auditointi tehty ja korjattu: fokushallinta siirtää fokuksen oikeaan nappiin
      jokaisen vaiheenvaihdon jälkeen (`useRef`+`useEffect`, verifioitu Playwrightilla), kortin
      sisältöalue `role="status" aria-live="polite"` (ilmoittaa kortin vaihtumisen/vastauksen
      paljastumisen), progressipalkki `role="progressbar"` + `aria-valuenow`/`aria-valuemax`

### Epic 5 — Kielioppikirjasto ✅ (2026-07-18)

- [x] `lib/grammar/topics.ts`: 5 aihetta — passato prossimo (aikamuodot), pronomi indiretti
      (pronominit), painotus + gli/gn + tuplakonsonantit (ääntäminen). `säännöt`-kategoria
      varattu mutta tyhjä toistaiseksi (ei vielä sisältöä)
- [x] `lib/grammar/search.ts`: `searchGrammarTopics`, `getGrammarTopicsByCategory` (palauttaa
      kaikki 4 kategoriaa avaimina myös tyhjänä), `getGrammarTopicBySlug` — kevyt in-memory-haku
- [x] `app/(app)/kielioppi/page.tsx` (kategoriasarakkeet + reaaliaikainen client-haku, ei API-reittiä
      koska data on staattinen moduulitason import) ja `app/(app)/kielioppi/[aihe]/page.tsx`
      (Server Component, `notFound()` tuntemattomalle slugille, "Liittyvät sanat sanavarastossasi"
      -osio suoralla DB-kyselyllä `grammarTopicSlug`:n perusteella — tyhjä toistaiseksi, Epic 6
      täyttää kentän myöhemmin, osio piilotetaan kun ei osumia)
- [x] **Bugikorjaus tehty samalla**: `remark-gfm`-riippuvuus puuttui, jolloin Markdown-taulukot
      (kielioppisisällön "Esimerkkejä"-osiot) renderöityivät raakana tekstinä eivätkä taulukkoina.
      Asennettu `remark-gfm`, lisätty `remarkPlugins={[remarkGfm]}` SEKÄ uuteen aihe-sivuun ETTÄ
      `components/ChatPanel.tsx`:ään (sama piilevä bugi olisi vaikuttanut myös chat-vastausten
      mahdollisiin taulukoihin)
- [x] Testattu Playwrightilla selaimessa (etusivu, kategoriasarakkeet, haku, aihe-sivu, taulukon
      renderöinti korjauksen jälkeen, 404-tapaus) — ei konsolivirheitä
- [x] a11y-guardian-auditointi tehty ja korjattu: "liittyvät sanat"-chippien `aria-label` lisätty
      kontekstiksi, tyhjän kategorian viestille `role="status" aria-live="polite"`

### Epic 6 — Kielioppi↔chat-linkitys ✅ (2026-07-18)

- [x] `lib/grammar/search.ts`: `findMatchingGrammarTopic(text)` — puhdas, ei-LLM tag-osumafunktio
      (eniten osuvia tageja voittaa), käytettävissä sekä palvelimella että clientillä
- [x] `lib/extraction/extractVocab.ts` kytketty: laskee osuman KERRAN per assistentin vastaus ja
      täyttää `vocabCards.grammarTopicSlug`:n (aiemmin kovakoodattu `null`) — sulkee Epic 5:n
      "Liittyvät sanat sanavarastossasi" -osion kehän, todennettu toimivaksi oikealla datalla
- [x] `components/GrammarTopicLink.tsx`: "→ Aiheen nimi" -chippi, näkyy vain kun osuma löytyy,
      kytketty `ChatPanel.tsx`:ään assistentin viestikuplan alapuolelle (ei käyttäjän viesteihin)
- [x] Testattu koko ketju päästä päähän oikealla keskustelulla selaimessa: chat-viesti passato
      prossimosta → "→ Passato prossimo" -chippi näkyy viestin alla → linkki `/kielioppi/passato-prossimo`
      → sivun "Liittyvät sanat" -osio näyttää nyt oikeasti poimittuja sanakortteja. Ei konsolivirheitä
      (myös ei-osuvalla viestillä testattu, ei riko mitään).
- [x] a11y-guardian: ei korjattavaa (unicode-nuoli linkkitekstissä on WCAG-yhteensopiva sellaisenaan)

### Epic 7 — Ääni: STT ✅ (2026-07-18)

- [x] `components/MicButton.tsx`: `MediaRecorder`-nauhoitus (idle/recording/transcribing-tilakone),
      ei automaattilähetystä, vapauttaa mikrofonin (`stream.getTracks().stop()`) nauhoituksen jälkeen
- [x] `/api/stt` (AI SDK `transcribe()` + `openai.transcription("whisper-1")`, ks. architecture-v2.md §5
      — EI selaimen `SpeechRecognition`, koska se korjaa ääntämisvirheet piiloon; ristiriidassa
      Fonetista-tilan tarkoituksen kanssa). HUOM tekninen löydös: `transcribe()` (ai@7.0.30) päättelee
      audion mediatyypin automaattisesti tavusignatuurista, ei erillistä `mediaType`-parametria
- [x] Transkriptio täyttää syöttökentän (yhdistetään olemassa olevaan tekstiin), käyttäjä tarkistaa
      ennen lähetystä; STT käyttää AINA OpenAI:ta riippumatta `LLM_PROVIDER`-asetuksesta (Anthropic ei
      tarjoa transkriptiomalleja)
- [x] Testattu oikealla äänidatalla: `ffmpeg`-generoidut WAV/webm-näytteet API-tasolla, ja koko
      selainkulku (idle→recording→transcribing→idle, placeholder "Kuuntelen...", tekstikentän täyttö)
      Playwrightilla Chromiumin fake-mikrofonilipuilla (`--use-fake-device-for-media-stream`)
- [x] a11y-guardian: lisätty `aria-live="polite"`-tilailmoitus (sr-only) tilanvaihdoista ja
      `motion-reduce:animate-none` pulssianimaatioihin

### Epic 8 — Ääni: TTS ✅ (2026-07-18)

- [x] `/api/tts` (AI SDK `generateSpeech()` + `openai.speech("tts-1")`, palvelinpuolinen — ei selaimen
      `speechSynthesis`, laatuperustelu ks. architecture-v2.md §5). HUOM: valittu `tts-1` eikä uudempi
      `gpt-4o-mini-tts`, koska jälkimmäinen ei tue numeerista `speed`-parametria (vain
      luonnollisen kielen `instructions`) — hidastettu ääntäminen on ydinvaatimus. `speed` rajattu
      sovelluskerroksessa OpenAI:n dokumentoituun 0.25–4.0-alueeseen
- [x] `components/AudioPlayButton.tsx`: toistopainike assistentin viestikuplien yläreunassa (kuplan
      sisällä, tekstisisällön yläpuolella, per ux-dashboard-design.md §3), moduulitason
      in-memory-audiovälimuisti (`Map<messageId, blobUrl>`), tilat idle/loading/playing
      (soi→pause-ikonivaihto, klikkaus playing-tilassa pysäyttää toiston)
- [x] Testattu oikealla API-kutsulla (mp3-tiedosto todennettu `file`-komennolla, `speed`-parametrin
      vaikutus vahvistettu tiedostokoon kasvulla) ja koko selainkulku Playwrightilla (chat-vastaus →
      toistopainike → `/api/tts` 200 `audio/mpeg` → tila "Pysäytä toisto")
- [x] a11y-guardian: lisätty `aria-live="polite"`-tilailmoitus (sr-only) samalla mallilla kuin
      `MicButton.tsx`:ssä; painikkeen sijainti kuplan yläreunassa ja `new Audio()`-toteutus
      (ei natiivi-media-näppäinten tukea) todettu hyväksyttäviksi hobbysovelluksen kontekstissa

### Epic 9 — Dashboard-kehys ✅ (2026-07-18) — VIIMEINEN v2-epiikka, v2-laajennus valmis

- [x] `app/(app)/layout.tsx`: sivupalkkikehys (topbar on kontekstuaalinen, jokainen sivu renderöi
      oman otsikkonsa kuten ennenkin — ei jaettua topbar-komponenttia, ks. perustelu alla).
      `app/page.tsx` siirretty `git mv`:llä `app/(app)/page.tsx`:ksi (historia säilyi).
      Mode-tilan URL-query-synkronointi (ux-dashboard-design.md §1:n maininta) jätettiin
      TIETOISESTI pois — ei ollut TODO.md:n eksplisiittisellä listalla, `useState<Mode>` riittää.
- [x] `components/Sidebar.tsx`: desktop-sivupalkki (`md:flex`) + mobiili-alapalkki (`md:hidden`,
      sama komponentti/data), aktiivi-tila `pathname.startsWith()`-logiikalla (erikoistapaus `/`:lle),
      due-määrä-badge Kertaus-kohdassa (client-fetch `/api/vocab?due=true`, refetch `pathname`:n
      muuttuessa). Streak-/XP-indikaattori TIETOISESTI jätetty pois — ei oikeaa dataa vielä
      (pelillistäminen on backlogissa), keksityn luvun näyttäminen olisi harhaanjohtavaa.
- [x] `components/ContextPanel.tsx`: oikea kontekstipaneeli VAIN Keskustelu-näkymässä (`lg:flex`
      desktopissa, kelluva painike + bottom sheet alle `lg`:n). "Uusia sanoja" (StatTile + lista,
      suodatettu istunnon aloitusajan mukaan, refetch 2.5s viiveellä assistentin vastauksen jälkeen)
      ja "Liittyvä kielioppi" (`findMatchingGrammarTopic` samalla logiikalla kuin `GrammarTopicLink`).
      Bottom sheet: `role="dialog" aria-modal="true"` + oikea Tab-fokusloukku + Escape-sulkeminen +
      fokuksen palautus. Todennettu päästä päähän oikealla keskustelulla: chat-chippi ja
      kontekstipaneelin "Liittyvä kielioppi" näyttävät saman aiheen synkronoidusti.
- [x] `components/StatTile.tsx`: jaettu design-kielen komponentti (§7), käytössä kontekstipaneelissa
      ja retrofitattu kertaus-sivun session-loppu-yhteenvetoon (sanasto-sivun otsikko jätettiin
      ennalleen — StatTile ei sopinut luontevasti kapealle otsikkoriville)
- [x] Responsiivisuus (§8): alapalkki-navigaatio + bottom sheet toteutettu ja testattu Playwrightilla
      kolmella leveydellä (mobiili 500px, tablet 900px, desktop 1400px) — löytyi ja korjattiin
      todellinen bugi: kelluva kontekstipainike meni päällekkäin Lähetä-napin kanssa kapeilla
      näytöillä (tarkistettu bounding boxeilla, ei vain silmämääräisesti), korjattu offsetit
- [x] Täysi `npm run build` -tuotantobuild vihreä, kaikki reitit (`/`, `/sanasto`, `/kertaus`,
      `/kielioppi`, `/kielioppi/[aihe]`) todennettu 200:ksi rakenteellisen siirron jälkeen
- [x] a11y-guardian: focus-trap toteutettu ja verifioitu Playwrightilla (15× Tab ei koskaan
      karannut sheetin ulkopuolelle, Escape palautti fokuksen oikein), mobiilinavin due-badge
      -saavutettavuus korjattu (`aria-label` sisälsi lukumäärän, joka oli aiemmin piilotettu
      ruudunlukijalta). Kaksoisnavigaatio-huomio (sama nav kahdesti DOM:ssa CSS-breakpointeilla
      piilotettuna) todettu vaarattomaksi — Tailwindin `hidden`-luokka on `display:none`, joka
      poistaa elementin saavutettavuuspuusta/tab-järjestyksestä automaattisesti selaimessa,
      ei vaadi lisä-JS:ää.

## v2-laajennus valmis (2026-07-18)

Kaikki 9 epiikkaa (DB-perusta → sanaston poiminta → sanasto-UI → SRS-kertaus → kielioppikirjasto →
kielioppi↔chat-linkitys → STT → TTS → dashboard-kehys) on toteutettu, testattu ja committoitu
`main`-haaraan. Ks. "Backlogissa, ei osa v2-laajuutta" -osio jäljellä olevista tietoisesti
rajatuista kohteista (pelillistäminen, lokaali LLM).

### Backlogissa, ei osa v2-laajuutta

- [ ] Pelillistäminen (streakit, XP): arkkitehtuuri varaa tälle tilan (`review_log` riittää
      streak/XP-laskentaan ilman skeemamuutoksia), mutta ei suunnitella/toteuteta yksityiskohtaisesti
      juuri nyt — käyttäjän oma priorisointi 2026-07-17
- [ ] Lokaali LLM -reitti Ollaman kautta (esim. Llama 3.1 / Gemma 2), täysin offline-/ilmaiskäyttöä
      varten — alkuperäisen PRD:n Phase 2 -kohta, ei aikataulutettu

## Laajennus v3 (suunniteltu 2026-07-18, ei vielä toteutettu)

Käyttäjä testasi v2-laajennusta ja nosti kaksi konkreettista puutetta + yhden lisähuomion, ja pyysi
avoimesti lisää ominaisuusideoita. Tausta ja perustelut: [docs/product-plan.md](docs/product-plan.md)
§8. TÄMÄ ON VASTA DOKUMENTOITU SUUNNITELMA — mitään alla olevista epiikoista ei ole aloitettu, kaikki
rivit ovat `[ ]`-tilassa. Toteutus tehdään myöhemmin epiikka kerrallaan, kun käyttäjä antaa luvan
(sama malli kuin v2:n epiikat, sama agenttityönjako: ux-designer UI-tekstit/komponentit, sisällön
kirjoitus tarpeen mukaan, a11y-guardian-tarkistus lopuksi, testaus ja commit joka epiikan jälkeen).

### Epic 10 — Kertauksen selkeytys

- [ ] Aloitusruutuun (`app/(app)/kertaus/page.tsx`:n "start"-vaihe) lyhyt selittävä kappale: kertaus
      on itsetestausta, yritä muistaa suomennos mielessäsi ennen "Näytä vastaus" -painiketta
- [ ] Kortin etupuolelle (front-vaihe) pieni ohjeteksti/muistutus samasta asiasta (esim.
      `text-xs text-zinc-500` -rivi kortin yläpuolella: "Mieti suomennos ennen kuin paljastat sen")
- [ ] Kolmelle arviointinapille (Vaikea/Hyvä/Helppo) lyhyt selite siitä mitä NE TARKOITTAVAT käyttäjän
      OMAN muistamiskokemuksen kannalta (ei tekninen SRS-selitys) — esim. pieni `text-xs`-alarivi
      jokaisen napin alla: Vaikea = "En muistanut / jouduin arvaamaan", Hyvä = "Muistin pienellä
      miettimisellä", Helppo = "Muistin heti"
- [ ] Palaute arvioinnin jälkeen: näytä lyhyesti mitä arviointi teki ajoitukselle, esim. pieni
      toast/teksti "Näet tämän sanan uudelleen ~N päivän päästä" käyttäen `/api/vocab/review`:n JO
      palauttamaa `intervalDays`-arvoa (data on olemassa, ei vaadi backend-muutoksia — vain UI:n
      pitää käyttää sitä, joka tällä hetkellä heitetään pois `.then()`-ketjussa)
- [ ] Pieni "Miten tämä toimii?" -info-linkki/painike kertaus-sivun aloitusruudussa, joka avaa lyhyen
      selityksen koko konseptista (spaced repetition -periaate: helpot/oikein muistetut sanat
      palaavat harvemmin, vaikeat useammin) — kevyt, ei raskas onboarding-modaali/tour-kirjasto

### Epic 11 — Kielioppikirjaston laaja laajennus ✅ (2026-07-18)

- [x] Lisätty 18 uutta aihetta `lib/grammar/topics.ts`:iin (5→23 yhteensä), täyttäen tyhjän
      "Säännöt"-kategorian (0→7) ja laajentaen muita: aikamuodot 1→7, pronominit 1→5, ääntäminen 3→4.
      Sama rakenne/tyyli kuin alkuperäiset 5 aihetta (Mikä se on / Muodostus / Poikkeukset /
      Esimerkkejä, suomeksi selitetty, italiankieliset esimerkit, `tags`-kentät). Sisältö kirjoitettiin
      kahdessa erässä tarkkojen kielioppifaktojen pohjalta (annettu agenteille eksplisiittisesti, ei
      jätetty mallin oman tietämyksen varaan) — pistokoetarkistettu oikeaksi (mm. artikkeloidut
      prepositiot -taulukko, imperfetto vs. passato prossimo -kontrasti).
      - *Aikamuodot* (+6): presente-indicativo, imperfetto, futuro-semplice, condizionale-presente,
        imperativo, trapassato-prossimo
      - *Pronominit* (+4): pronomi-diretti, pronomi-possessivi, ci-ne, pronomi-riflessivi
      - *Säännöt* (+7, oli tyhjä): artikkelit, prepositiot-artikoloidut, monikko,
        adjektiivit-taipuminen, komparatiivi-superlatiivi, ce-ci-sono, negaatio
      - *Ääntäminen* (+1): c-g-aanteet
- [x] `lib/grammar/search.ts`:n `getGrammarTopicsByCategory()` verifioitu toimivaksi oikein isommalla
      aihemäärällä (aikamuodot=7, pronominit=5, säännöt=7, ääntäminen=4)
- [x] `app/(app)/kielioppi/page.tsx`:n `grid-cols-4`-layout testattu visuaalisesti Playwrightilla
      23 aiheella — kestää hyvin, ei tarvinnut layout-muutosta
- [x] Täysi `npm run build` vihreä, selaintestattu (etusivu, haku, uusi aihesivu
      `/kielioppi/prepositiot-artikoloidut`) — ei konsolivirheitä, taulukot renderöityvät oikein

### Epic 12 — Keskustelun säilyttäminen sivunvaihdon yli ✅ (2026-07-19)

- [x] Käyttäjän huomio: keskustelu katosi jos Keskustelu-näkymästä siirtyi toiselle sivulle (esim.
      juuri `GrammarTopicLink`/kontekstipaneelin "Avaa aihe" -linkin kautta Kielioppiin) ja palasi
      takaisin — `ChatPanel.tsx`:n `useChat()`-tila on paikallinen komponenttitila joka tuhoutuu
      `app/(app)/page.tsx`:n unmounttautuessa. Viestit TALLENNETAAN kyllä DB:hen (Epic 1), mutta niitä
      ei ladattu takaisin UI:hin.
- [x] Toteutettu ratkaisu: **`sessionStorage`-pohjainen persistenssi**, EI Context-provideria
      `app/(app)/layout.tsx`-tasolle (alkuperäinen ehdotus hylättiin — `app/(app)/page.tsx` unmounttautuu
      joka tapauksessa sisarsivujen välillä, joten Context ei olisi selviytynyt siitä; sessionStorage
      selviää, koska se on selaimen persistenssiä eikä React-komponenttitilaa). Uusi
      `lib/chat/sessionStorage.ts` tarjoaa kolme puhdasta funktiota, avaimena `benvenuto:chat:<mode>`:
      `loadStoredMessages(mode)`, `saveStoredMessages(mode, messages)`, `clearStoredMessages(mode)`
      (kaikki `UIMessage[]`-tyypitettyjä, `Mode`-avaimella, ei `any`:a).
      `components/ChatPanel.tsx` lukee alkutilan mountissa `useState(() => loadStoredMessages(mode))`
      -lazy-initializerillä (sama kaava kuin `sessionStartedAt`:ssa Epic 9:ssä; `useRef` olisi
      toiminut yhtä hyvin tälle tarkoitukselle — molemmat ovat kelvollisia tapoja lukea kertaalleen
      mountissa luettava alkuarvo, `useState`-versio valittu yhdenmukaisuuden vuoksi olemassa olevan
      koodityylin kanssa) ja antaa sen `useChat({ transport, messages: initialMessages })`:lle (`ai` v7 /
      `@ai-sdk/react` v4 `ChatInit`-optio, luetaan vain kerran per mount), sekä tallentaa `messages`-
      taulukon sessionStorageen `useEffect`:llä aina kun se muuttuu. Tämä toimii koska
      `app/(app)/page.tsx` jo käyttää `<ChatPanel key={activeMode} .../>` — sama `mode`, uusi
      route-mount, `messages`-optio toimii aitona alkutilana eikä reaktiivisena propina.
- [x] Havaittu ja korjattu lisäongelma verifioinnin aikana: koska `app/(app)/page.tsx` unmounttautuu
      KOKONAAN sisarreittien välillä, myös sen oma `activeMode`-React-tila resetoituisi hardkoodattuun
      oletukseensa (`"grammar"`) ilman erillistä korjausta — paluu `/`:iin olisi näyttänyt Kielioppi-
      välilehden (tyhjä) eikä Keskustelu-välilehteä jossa tallennettu keskustelu oikeasti sijaitsee.
      Korjattu lisäämällä `lib/chat/sessionStorage.ts`:iin `loadActiveMode(fallback)`/`saveActiveMode(mode)`
      (avain `benvenuto:chat:activeMode`, `isMode()`-tyyppivartija validoi `MODES`-listaa vasten). Home
      lukee alkuarvon `useState<Mode>(() => loadActiveMode("grammar"))`:lla ja `handleModeSelect`
      kutsuu `saveActiveMode(nextMode)` ennen `setActiveMode`:a. Tämä EI muuta `activeMode`-tilan tai
      `key`-remount-mekanismin toimintatapaa — ainoastaan sen alkuarvon lähdettä — joten
      tilanvaihtologiikka (alla) pysyy identtisenä.
- [x] Tilanvaihto-käyttäytyminen SÄILYY ennallaan (tietoinen PRD-päätös, ei muutettu): mode-painikkeen
      klikkaus (`app/(app)/page.tsx`:n `handleModeSelect`) kutsuu `clearStoredMessages` sekä nykyiselle
      ETTÄ kohdetilalle ENNEN `setActiveMode`-kutsua, joten Kielioppi/Keskustelu/Ääntäminen-vaihto
      nollaa keskustelun edelleen JOKA SUUNTAAN (myös samaan tilaan takaisin vaihdettaessa
      mode-painikkeilla). AINOASTAAN reitin (`/` → sisarsivu → `/`) välinen sivunavigointi SAMASSA
      tilassa säilyttää keskustelun, koska se ei koskaan kutsu `clearStoredMessages`.
- [x] HUOM: tämä on ERI ominaisuus kuin alempi "chat-historian selaus" -ideakandidaatti (joka koskisi
      VANHOJEN, päättyneiden keskustelujen selaamista DB:stä) — tässä on kyse vain KESKEN olevan
      istunnon säilymisestä saman selainsession sisällä.
- [x] Verifioitu: `npx tsc --noEmit` ja `npx eslint .` puhtaita, Playwright-selaintesti
      (chromium, headless) läpäisty päästä päähän: viesti + assistentin vastaus säilyvät
      `/` → `/kielioppi` → `/`-navigoinnissa, ja mode-painikkeen klikkaus tyhjentää molemmat tilat.

### Epic 13 — Kertaus: aktiivinen tuottaminen + automaattinen tarkistus ✅ (2026-07-19)

Käyttäjän parannusehdotus: nykyinen kertaus on puhtaasti itsearviointia (käyttäjä muistaa mielessään,
arvioi itse rehellisyyttä). Uusi malli: vastaus PITÄÄ kirjoittaa tai sanoa, ja järjestelmä TARKISTAA
sen automaattisesti. Päätökset (käyttäjän valinnat AskUserQuestion-kierroksesta):

- **Vastaustapa**: sekä kirjoitus (tekstikenttä) että puhe (olemassa oleva `MicButton`/STT-infra
  valinnaisena) — käyttäjä valitsee kumman haluaa per kortti.
- **Tarkistustapa**: kevyt `generateObject`-LLM-tarkistus (sama malli/kaava kuin `extractVocab.ts`:ssä)
  — hyväksyy synonyymit/eri sanamuodot, EI tarkkaa merkkijonovertailua (liian tiukka suomennoksille
  joilla on monta oikeaa muotoilua, esim. "olen syönyt" vs. "söin").
- **Suhde arviointiin**: automaattinen tarkistus MÄÄRÄÄ gradeuksen suoraan (oikein→"good",
  väärin→"hard") — korvaa nykyisen Vaikea/Hyvä/Helppo-itsearvioinnin kokonaan tässä kortin kohdassa.
- **Suunta**: EI muutosta — kortin etupuoli näyttää edelleen italian sanan, vastataan suomeksi.

Tehtävät:

- [x] `lib/checking/checkAnswer.ts`: `generateObject` + Zod-skeema (`{ correct: boolean, feedback:
      string }`), prompti joka vertaa käyttäjän vastausta tallennettuun `finnish`-kenttään merkityksen
      perusteella, `resolveModel()`. Tyhjä vastaus tunnistetaan ja ohitetaan ilman LLM-kutsua.
      Testattu oikealla API-kutsulla: hyväksyy synonyymit/lyhennetyt muodot ("huomenta" ~
      "Hyvää huomenta"), hylkää väärän taivutusmuodon (esim. "syön" kun kysyttiin perusmuotoa
      "syödä") — tarkistus ei ole liian löysä.
- [x] `app/api/vocab/check-answer/route.ts`: POST `{ cardId, answer }` → `{ correct, correctAnswer,
      feedback }`. Ei koske SRS-tilaan — `/api/vocab/review` hoitaa sen erikseen. Virhepolut (404
      tuntemattomalle cardId:lle, 400 virheelliselle bodylle) testattu.
- [x] `app/(app)/kertaus/page.tsx`: tilakone `loading|start|answering|checking|revealed|done`.
      Tekstikenttä + `MicButton` + "Tarkista"-nappi + "En tiedä / Näytä vastaus" -pakoluukku
      `answering`-vaiheessa. `revealed`-vaihe näyttää Check/X-ikonin + "Oikein!"/"Väärin", käyttäjän
      oman vastauksen, oikean suomennoksen aina, LLM-palautteen, ja "Seuraava kortti" -napin joka
      kutsuu `/api/vocab/review`:ia automaattisesti määrätyllä gradeuksella (oikein→"good",
      väärin→"hard"). Epic 10:n lisäykset (selittävä teksti, "Miten tämä toimii?", intervalDays-toast)
      säilytetty ja tekstit päivitetty uutta mallia vastaaviksi.
- [x] Testattu päästä päähän Playwrightilla (aloitus→vastaus→tarkistus→paljastus→seuraava kortti→
      "en tiedä" -pakoluukku), ei konsolivirheitä. `npm run build` vihreä.
- [x] a11y-guardian-tarkistus tehty ja korjattu: `aria-live="polite"`-alue oli liian laaja (koko
      kortti, mukaan lukien muuttumaton italian sana) — rajattu koskemaan vain dynaamista
      tulossisältöä (`display: contents` -wrapperilla, ei riko flex-layoutia). Fokussiirto
      "Seuraava kortti" -nappiin arvioitiin riittäväksi (live-region ilmoittaa tuloksen
      riippumatta fokuksen sijainnista).

## Lisäominaisuudet: suunniteltu, ei toteutettu (Epic 14–18, 2026-07-19)

Käyttäjä pyysi käymään "Harkittavat lisäominaisuudet" -backlogin läpi ja tekemään toteutus-
suunnitelmat. Alla olevat viisi epiikkaa on nyt SUUNNITELTU tarkasti (mukaan lukien AskUserQuestion-
kierroksen käyttäjän valinnat), mutta EI VIELÄ TOTEUTETTU — kaikki rivit `[ ]`-tilassa. Tausta ja
perustelut: [docs/product-plan.md](docs/product-plan.md) §9. Ei riippuvuuksia epiikkojen välillä,
toteutusjärjestys on vapaa (suositus: 14 → 18 → 15 → 17 → 16, yksinkertaisimmasta monimutkaisimpaan).

### Epic 14 — Kevyt tilastonäkymä (kertaushistoria) ✅ (2026-07-19)

Ei skeemamuutoksia — käyttää olemassa olevaa `review_log`-taulua. EI pelillistämistä (streak/XP on
jo erikseen tietoisesti alempana backlogissa) — puhtaasti informatiivinen.

- [x] `GET /api/vocab/review-stats`: `todayCount`/`weekCount` (`review_log`-rivien määrä
      tänään/viikossa) + `successRate` (osuus jossa `grade >= 4` — kattaa sekä Epic 13:n automaattiset
      arvot 3/4 että vanhemman datan mahdollisen 5:n, ks. `lib/db/srs.ts`:n `GRADE_QUALITY`).
      Testattu oikealla datalla: `{"todayCount":4,"weekCount":20,"successRate":85}`, vahvistettu
      täsmäävän suoraan tietokannasta laskettuun tulokseen.
- [x] `app/(app)/kertaus/page.tsx`: kolme `StatTile`:a (`components/StatTile.tsx`) "start"-vaiheeseen
      "N sanaa odottaa kertausta" -rivin alle: Tänään / Tällä viikolla / Onnistuminen. Haku rinnakkain
      due-kortti-haun kanssa, epäonnistuessa hiljainen fallback oletusarvoihin (ei kriittinen tieto).
- [x] Ei uutta sivupalkin nav-kohtaa — pysyy osana kertaus-sivua
- [x] Testattu selaimessa Playwrightilla (dark-teema), tsc/eslint puhtaita, ei konsolivirheitä

### Epic 15 — Kielioppikvizit (pieni osajoukko: 8 aihetta)

Käyttäjän valinta: aloitetaan pienellä osajoukolla, EI kaikkia 23 aihetta heti.

- [ ] `lib/grammar/topics.ts`: `GrammarTopic`-tyyppiin valinnainen `quiz?: QuizQuestion[]`
      (`{ question, options, correctIndex, explanation }`). 3–5 kysymystä kahdeksalle aiheelle:
      `passato-prossimo`, `imperfetto`, `pronomi-diretti`, `pronomi-indiretti`, `ci-ne`, `artikkelit`,
      `negaatio`, `c-g-aanteet` (kattaa kaikki 4 kategoriaa + tunnetuimmat sekaannuskohdat)
- [ ] `components/GrammarQuiz.tsx` (uusi): yksi kysymys kerrallaan, klikkaus → heti oikein/väärin
      (`lucide-react` Check/X) + `explanation`, "Seuraava kysymys", lopussa `StatTile`-pistemäärä.
      EI API-reittiä — tarkistus on deterministinen client-vertailu, ei LLM-kutsua tarvita
- [ ] `app/(app)/kielioppi/[aihe]/page.tsx`: renderöi kvizin "Liittyvät sanat"-osion alle VAIN jos
      `topic.quiz` on määritelty (muille 15 aiheelle ei tyhjää kviziosiota)

### Epic 16 — Chat-historian selaus

Suurin/monimutkaisin näistä viidestä — ainoa jossa skeemamigraatio. ERI ominaisuus kuin Epic 12
(joka säilyttää vain KESKEN olevan istunnon `sessionStorage`:ssa) — tämä koskee PÄÄTTYNEIDEN
keskustelujen selaamista pysyvästi tietokannasta. Käyttäjän valinta: `sessionId`-sarake (tarkka
ryhmittely), EI epätarkkaa päivä+tila-heuristiikkaa.

- [ ] `lib/db/schema.ts`: `sessionId: text("session_id")` (nullable) `messages`-tauluun, uusi
      Drizzle-migraatio (`npx drizzle-kit generate`)
- [ ] `components/ChatPanel.tsx`: `useState(() => crypto.randomUUID())` kerran per mount, välitetään
      `DefaultChatTransport`:in bodyyn `mode`:n rinnalla
- [ ] `app/api/chat/route.ts`: lue `sessionId` bodystä, sisällytä `onFinish`-hookin insertteihin
- [ ] `GET /api/chat/sessions` (uusi): listaa istunnot ryhmiteltynä `sessionId`:llä (tila, alkuaika,
      ensimmäisen viestin esikatselu), tuorein ensin
- [ ] `GET /api/chat/sessions/[sessionId]` (uusi): yhden istunnon täysi transkripti
- [ ] `app/(app)/keskustelut/page.tsx` (uusi): istuntolista
- [ ] `app/(app)/keskustelut/[sessionId]/page.tsx` (uusi): täysi transkripti lukutilassa (samat
      kuplatyylit kuin `ChatPanel.tsx`, ei syöttöpalkkia)
- [ ] Navigointi: EI viidettä sivupalkin nav-kohtaa — pieni "Historia"-linkki `app/(app)/page.tsx`:n
      headeriin riittää (voidaan siirtää sivupalkkiin myöhemmin jos käyttö osoittautuu tärkeäksi)

### Epic 17 — Manuaalinen teemakytkin (vaalea/tumma/järjestelmä)

Käyttäjän valinta: kolmitilainen (ei vain kaksitilainen vaalea/tumma). Nykyinen `app/globals.css`
käyttää Tailwind v4:n oletus-mediakysely-pohjaista tumma-tilaa (tarkistettu — ei `@custom-variant`).

- [ ] Asenna `next-themes` (pieni, laajasti käytetty, ratkaisee SSR/hydraatio- ja
      "flash of wrong theme" -ongelmat valmiiksi oikein)
- [ ] `app/globals.css`: `@custom-variant dark (&:where(.dark, .dark *));` jotta `dark:`-luokat
      reagoivat `.dark`-CSS-luokkaan eivätkä enää suoraan `prefers-color-scheme`-mediakyselyyn
- [ ] `app/layout.tsx`: kääri `{children}` `<ThemeProvider attribute="class" defaultTheme="system"
      enableSystem>`:llä
- [ ] `components/ThemeToggle.tsx` (uusi): 3-tilainen kytkin (`lucide-react` Sun/Moon/Monitor),
      sijoitetaan `components/Sidebar.tsx`:ään ilman että se rikkoo due-badge-logiikkaa

### Epic 18 — Sanaston vienti (CSV, vain vienti — ei tuontia) ✅ (2026-07-19)

Käyttäjän valinta: vain vienti nyt, tuonti mahdollinen myöhempi lisäys jos tarve ilmenee.

- [x] `GET /api/vocab/export` (uusi): CSV kaikista `vocabCards`-riveistä (italian, finnish,
      exampleIt, exampleFi, context, sourceMode, createdAt, status), käsinkirjoitettu CSV-escape
      (ei tarvita kirjastoa pelkkään vientiin), `Content-Disposition: attachment`. Testattu oikealla
      datalla (240 riviä), CSV-escape vahvistettu toimivaksi kentille joissa lainausmerkkejä/pilkkuja.
- [x] `app/(app)/sanasto/page.tsx`: "Vie CSV" -linkki (`lucide-react` Download-ikoni) otsikkorivillä
      "{cards.length} sanaa" -tekstin vieressä, pelkkä `<a href="/api/vocab/export" download>`
- [x] Testattu selaimessa Playwrightilla (dark-teema) — linkki näkyy oikeassa paikassa, ei
      konsolivirheitä. tsc/eslint puhtaita.

## Vanha "Harkittavat lisäominaisuudet" -backlog (2026-07-18) — korvattu yllä olevilla epiikoilla

- [ ] Sanaston tuonti (CSV) — TIETOISESTI rajattu pois Epic 18:sta (vain vienti nyt), mahdollinen
      erillinen myöhempi epiikka jos tarve oikeasti ilmenee (esim. laitteen vaihto)

## Visuaalinen uudistus: zinc/indigo-teema (2026-07-18, käyttäjän pyynnöstä v2:n jälkeen)

- [x] Väripaletti vaihdettu koko sovelluksessa (molemmat teemat, vaalea+tumma): `neutral-*`→`zinc-*`,
      accent `blue-*`→`indigo-*`. Juurisyy "pikimustalle" taustalle korjattu: `app/globals.css`:n
      vanha CSS-muuttuja-pohjainen `#0a0a0a`-tausta poistettu, `app/layout.tsx`:n `body` käyttää nyt
      suoraan `bg-zinc-50 dark:bg-zinc-950`-Tailwind-luokkia.
- [x] Kaikki emojit (💬📚🔄📖✅🎉✕) korvattu `lucide-react`-ikoneilla (`MessageSquare`, `BookOpen`,
      `History`, `GraduationCap`, `CheckCircle2`, `PartyPopper`, `X`, `Mic`, `Volume2`/`Pause`, `Info`,
      `Trash2`) kaikissa komponenteissa/sivuissa.
- [x] Chat-tilanvalitsin (`app/(app)/page.tsx`) uudistettu erillisistä pilleistä yhtenäiseksi
      segmented control -tyyliseksi tab-palkiksi. Syöttöpalkki (`ChatPanel.tsx`) uudistettu yhdeksi
      pyöristetyksi kontaineriksi (`focus-within:ring-1`), mic+lähetä ikoninappeina sen sisällä.
      `StatTile.tsx` päivitetty `backdrop-blur`-korteiksi ison numeron kera.
      Sivupalkissa säilyi kaikki neljä nav-kohtaa (käyttäjän vahvistuksella, ei karsittu kolmeen).
- [x] Testattu: täysi `npm run build`, kaikki sivut+molemmat teemat+mobiili Playwrightilla
      (ei konsolivirheitä), a11y-regressiotarkistus (ei uusia regressioita — kontrastitasot
      identtiset aiempaan `neutral`-versioon nähden, vain nimi vaihtui `zinc`:ksi; fokusrenkaan
      ohuus `ChatPanel`:in syöttöpalkissa on käyttäjän oma eksplisiittinen pyyntö, ei bugi)

## Päätökset ja poikkeamat alkuperäisestä PRD:stä

- Client lähettää API:lle `mode`-tunnisteen (ei valmista `systemPrompt`-merkkijonoa).
  Palvelin valitsee promptin `lib/prompts.ts`:stä. Syy: turvallisempi (client ei voi
  injektoida mielivaltaista system-promptia) ja pitää promptit yhdessä paikassa.
  Ks. [docs/technical-documentation.md](docs/technical-documentation.md#tilat-modes-ja-system-promptit).
- LLM-tarjoaja on valittavissa ympäristömuuttujalla `LLM_PROVIDER` (`openai`/`anthropic`)
  PRD:n "esim. OpenAI tai Anthropic" -maininnan pohjalta, käyttäjän pyynnöstä 2026-07-17.
- TTS/STT nostettu alkuperäisen PRD:n "Phase 2" -tiekartasta osaksi v2-laajennusta (ei enää
  myöhempi lisä) — käyttäjän priorisointi 2026-07-17. Toteutustavaksi valittu palvelinpuolinen
  mallipohjainen ratkaisu (AI SDK `generateSpeech`/`transcribe`) selaimen native-APIen
  (`speechSynthesis`/`SpeechRecognition`) sijaan; STT-valinnan perustelu on erityisen tärkeä,
  ks. [docs/architecture-v2.md](docs/architecture-v2.md) §5.
- Kielioppikirjaston sisältö on tietoisesti git-versioitua staattista dataa, ei tietokantataulu
  — vältetään kahden totuuden lähteen ylläpitotaakkaa käsin kirjoitetulle referenssisisällölle.
  Ks. [docs/architecture-v2.md](docs/architecture-v2.md) §2.3.
- Sanojen/lauseiden poiminta keskusteluista tehdään erillisellä jälkikäsittely-LLM-kutsulla
  (`generateObject`, Next.js `after()`), ei tool callingilla kesken streamin — pitää roolileikki-
  promptit (Il Professore/L'Amico/Il Fonetista) koskemattomina ja poiminnan latenssin käyttäjälle
  näkymättömänä. Ks. [docs/architecture-v2.md](docs/architecture-v2.md) §3.
