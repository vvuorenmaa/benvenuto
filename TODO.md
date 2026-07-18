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
