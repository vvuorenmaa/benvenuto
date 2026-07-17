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

### Epic 2 — Sanaston poimintaputki

- [ ] `lib/db/schema.ts`: `vocabCards`- ja `reviewLog`-taulut (SRS-kentät, ks. architecture-v2.md §2.2)
- [ ] `lib/extraction/extractVocab.ts`: `generateObject` + Zod-skeema, mode-kohtainen extraction-prompti
- [ ] Next.js `after()`-hook `/api/chat`:iin extraction-kutsun ajamiseksi vastauksen striimauksen jälkeen
- [ ] Manuaalinen tarkistus: syntyykö järkeviä sanakortteja suoraan tietokannasta katsottuna (ei UI:ta vielä)

### Epic 3 — Sanasto-UI

- [ ] `/api/vocab` (GET lista + `?due=`/`?q=` suodattimet, POST manuaalinen lisäys)
- [ ] `/api/vocab/[id]` (PATCH, DELETE)
- [ ] `app/(app)/sanasto/page.tsx`: lista, haku, suodatinchipit, CTA kertaukseen

### Epic 4 — SRS-kertaus

- [ ] `lib/db/srs.ts`: SM-2-algoritmi puhtaana funktiona (`computeNextReview`)
- [ ] `/api/vocab/review` (POST arvosana → uusi ease/interval/dueAt)
- [ ] `app/(app)/kertaus/page.tsx`: flashcard-kulku (ks. ux-dashboard-design.md §5)

### Epic 5 — Kielioppikirjasto

- [ ] `lib/grammar/topics.ts`: alkuperäinen aihejoukko (passato prossimo, pronomi indiretti,
      painotukset, gli/gn — PRD:n mainitsemat haasteet)
- [ ] `lib/grammar/search.ts`: kevyt in-memory-haku/suodatus
- [ ] `app/(app)/kielioppi/page.tsx` (kategoriat + haku) ja `app/(app)/kielioppi/[aihe]/page.tsx`

### Epic 6 — Kielioppi↔chat-linkitys

- [ ] Tag-pohjainen osuma assistentin vastauksen ja `GRAMMAR_TOPICS.tags`:n välillä poiminnan yhteydessä
- [ ] `components/GrammarTopicLink.tsx`: chippi viestin alla, näkyy vain kun osuma löytyy

### Epic 7 — Ääni: STT

- [ ] `components/MicButton.tsx`: `MediaRecorder`-nauhoitus, ei automaattilähetystä
- [ ] `/api/stt` (AI SDK `transcribe()`, ks. architecture-v2.md §5 — EI selaimen `SpeechRecognition`,
      koska se korjaa ääntämisvirheet piiloon; ristiriidassa Fonetista-tilan tarkoituksen kanssa)
- [ ] Transkriptio täyttää syöttökentän, käyttäjä tarkistaa ennen lähetystä

### Epic 8 — Ääni: TTS

- [ ] `/api/tts` (AI SDK `generateSpeech()`, palvelinpuolinen — ei selaimen `speechSynthesis`,
      laatuperustelu ks. architecture-v2.md §5)
- [ ] `components/AudioPlayButton.tsx`: toistopainike assistentin viestikuplissa, in-memory-audiovälimuisti

### Epic 9 — Dashboard-kehys

- [ ] `app/(app)/layout.tsx`: sivupalkki + topbar (ks. ux-dashboard-design.md §2), nykyinen
      `app/page.tsx` siirtyy route groupin sisään `(app)/page.tsx`:ksi
- [ ] Sivupalkin navigaatio (Keskustelu/Sanasto/Kertaus/Kielioppi) + due-määrän badge
- [ ] Oikea kontekstipaneeli Keskustelu-näkymässä (uudet sanat, liittyvä kielioppiaihe)
- [ ] Responsiivisuus: alapalkki-navigaatio + bottom sheet -kontekstipaneeli alle `md`-breakpointin
      (ks. ux-dashboard-design.md §8)
- [ ] Design-kielen stat tile -komponentti, SRS-tilojen värikoodaus (sininen/amber/vihreä),
      ks. ux-dashboard-design.md §7

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
