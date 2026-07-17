# Benvenuto — Laajennuksen tekninen arkkitehtuurisuunnitelma (v2)

> Suunnitteludokumentti, ei vielä toteutettu. Täydentää [technical-documentation.md](./technical-documentation.md):tä
> kuvaamalla kolmen uuden ominaisuuskokonaisuuden (sanasto & kertaus, kielioppikirjasto, ääni)
> arkkitehtuurin. Tuotetason kuvaus ja päätöshistoria: [product-plan.md](./product-plan.md) §7,
> [../TODO.md](../TODO.md). UX-vastine: [ux-dashboard-design.md](./ux-dashboard-design.md).
>
> Lähtökohta: yksi käyttäjä, lokaali käyttö, ei tarvetta auth/multi-tenant-ratkaisuille.

## 1. Tietovarasto/persistenssi-valinta

**Valinta: SQLite-tiedosto + Drizzle ORM + `better-sqlite3`-ajuri.**

Perustelu:

- **SQLite yksinkertaisimpana riittävänä ratkaisuna.** Yksi käyttäjä, lokaali kone, ei rinnakkaisia kirjoittajia → ei tarvita PostgreSQL/MySQL-palvelinta, verkkoyhteyksiä tai Dockeria. Yksi tiedosto (`data/benvenuto.sqlite`, `.gitignore`:ssa) riittää.
- **`better-sqlite3`** on synkroninen ja natiivi — sopii erinomaisesti Next.js:n Node-runtime-API-reitteihin (ei tarvita `async`-kikkailua tietokantakutsuihin), ja se on kypsä, hyvin ylläpidetty kirjasto. Node-versio paikallisessa ympäristössä on 20.16 — natiivin `node:sqlite`-moduulin sijaan (joka vaatisi Node 22+) `better-sqlite3` toimii suoraan nykyisellä asennuksella.
- **Drizzle vs. Prisma vs. raaka SQL:** Koska uusia toisiinsa liittyviä tauluja tulee useampi (sanakortit + SRS-kentät, kertauslogi, viestihistoria), täysin ilman ORM:ää kirjoitettu SQL alkaisi olla virhealtista (varsinkin SM-2-kertaustilan päivityslogiikassa). Drizzle valitaan Prisman sijaan, koska:
  - Ei erillistä generointivaihetta eikä raskasta query-engine-binääriä — pelkkiä TS-tiedostoja + `drizzle-kit` migraatioihin.
  - API on lähellä SQL:ää (helppo lukea/debugata), sopii hyvin `better-sqlite3`:n synkroniseen malliin ilman ylimääräistä abstraktiokerrosta.
  - Prisma olisi teknisesti toimiva, mutta sen Studio-GUI ja raskaampi tooling ovat ylimitoitettuja yhden käyttäjän hobby-projektiin — mainitaan vaihtoehtona, ei suositella.
- **Ei erillistä session-/auth-tallennusta.** Kaikki data on yhden käyttäjän dataa; ei tarvita `user_id`-sarakkeita mihinkään tauluun.

## 2. Datamalli

Kaksi eri persistenssistrategiaa eri sisältötyypeille:

- **Dynaaminen, käyttäjän toiminnasta syntyvä data** (viestit, sanakortit, SRS-tila, kertauslogi) → SQLite.
- **Staattinen referenssisisältö** (kielioppikirjasto) → **git-versioitu koodi/data (TS/JSON tai MDX), ei tietokantataulua.** Perustelu kohdassa 2.3.

### 2.1 Viestihistoria (kevyt, kirjoitusta varten — ei UI:n resurssoinnin lähde)

```ts
// lib/db/schema.ts
export const messages = sqliteTable("messages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  mode: text("mode").notNull(),               // 'grammar' | 'conversation' | 'phonetics'
  role: text("role").notNull(),                // 'user' | 'assistant'
  content: text("content").notNull(),
  createdAt: integer("created_at").notNull(),  // unix ms
});
```

Tämä on tarkoituksella **kirjoituspainotteinen loki** — se syötetään sanaston poimintaan (kohta 3), mutta sitä ei toistaiseksi käytetä chatin UI:n palauttamiseen. `app/page.tsx`:n nykyinen `key={activeMode}`-reset (PRD:n vaatimus "tilan vaihto resetoi chatin") säilyy ennallaan. Historiaikkunan hydratointi UI:hin olisi looginen jatke, mutta ei kuulu näihin vaadittuihin ominaisuuksiin — jätetään tietoiseksi myöhemmäksi päätökseksi.

### 2.2 Sanavarasto & SRS

```ts
export const vocabCards = sqliteTable("vocab_cards", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  italian: text("italian").notNull(),
  finnish: text("finnish").notNull(),
  exampleIt: text("example_it"),
  exampleFi: text("example_fi"),
  context: text("context"),                    // esim. "L'Amico-keskustelusta, kahvila-aihe"
  sourceMode: text("source_mode"),
  sourceMessageId: integer("source_message_id").references(() => messages.id),
  grammarTopicSlug: text("grammar_topic_slug"), // vapaamuotoinen viite kohdan 2.3 staattiseen sisältöön
  createdAt: integer("created_at").notNull(),

  // SM-2-tyylinen SRS-tila
  easeFactor: real("ease_factor").notNull().default(2.5),
  intervalDays: integer("interval_days").notNull().default(0),
  repetitions: integer("repetitions").notNull().default(0),
  dueAt: integer("due_at").notNull(),
  lastReviewedAt: integer("last_reviewed_at"),
  suspended: integer("suspended").notNull().default(0), // "osaan jo" -merkintä
});

export const reviewLog = sqliteTable("review_log", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  cardId: integer("card_id").notNull().references(() => vocabCards.id),
  reviewedAt: integer("reviewed_at").notNull(),
  grade: integer("grade").notNull(),            // 0–5 (SM-2-laatu) tai yksinkertaistettu again/hard/good/easy
  intervalBefore: integer("interval_before"),
  intervalAfter: integer("interval_after"),
});
```

`review_log` ei ole pakollinen SRS:n toimimiselle, mutta se on halpa lisätä nyt ja antaa valmiin datapohjan streak/XP-laskennalle myöhemmin (ks. §7 lopun huomio pelillistämisestä).

### 2.3 Kielioppikirjasto — staattinen sisältö, ei tietokantataulu

**Päätös: kielioppikirjaston sisältö on git-versioitua staattista dataa** (`lib/grammar/topics.ts` -taulukko tai `content/grammar/*.mdx`), ei SQLite-taulu.

Perustelu:
- Sisältö on käsin kirjoitettua referenssimateriaalia (aikamuodot, pronominit, säännöt), ei käyttäjän generoimaa dataa — ei tarvita CRUD-käyttöliittymää eikä tietokantaa sen ylläpitoon.
- Git-versiointi on parempi työkalu tämän tyyppiselle sisällölle kuin tietokantarivit: diffit, historiat, helppo käsin muokata.
- Vältetään kahden totuuden lähteen (staattinen sisältö + DB-synkronointi) ylläpitotaakka — tämä olisi ylirakentamista yhden käyttäjän sovellukseen.
- Haku toteutetaan yksinkertaisella in-memory-suodatuksella (`Array.filter` otsikon/tagien perusteella) — korpus on pieni (kymmeniä aiheita), ei tarvita FTS5-indeksiä. Jos korpus joskus kasvaa isoksi, SQLite FTS5-virtuaalitaulu voidaan lisätä myöhemmin ilman, että sisällön "totuus" siirtyy pois git:stä (build-aikainen indeksointi).

```ts
// lib/grammar/topics.ts
export type GrammarTopic = {
  slug: string;               // 'passato-prossimo'
  title: string;              // "Passato prossimo"
  category: "aikamuodot" | "pronominit" | "säännöt" | "ääntäminen";
  bodyMd: string;              // selitys suomeksi + esimerkit italiaksi, Markdown
  tags: string[];              // ["passato prossimo", "perfetti", "menneisyys"]
};
export const GRAMMAR_TOPICS: GrammarTopic[] = [ /* ... */ ];
```

Sanakortin `grammarTopicSlug`-kenttä (2.2) on löyhä viittaus tähän taulukkoon (ei foreign key -pakotusta tietokannassa, koska toinen puoli ei ole DB:ssä) — sovelluskoodi resolvoi slugin `GRAMMAR_TOPICS`-taulukosta renderöintihetkellä.

## 3. Sanojen/lauseiden automaattinen poiminta keskusteluista

**Punninta: tool calling kesken streamin vs. erillinen jälkikäsittely-LLM-kutsu.**

| | Tool calling kesken streamin | Erillinen jälkikäsittely (`generateObject`) |
|---|---|---|
| Vaikutus persoonien promptteihin | Il Professore / L'Amico / Il Fonetista -promptit pitäisi laajentaa myös extraction-logiikalla → riski roolileikin laadun heikkenemisestä (promptit ovat jo nyt tarkkaan viritettyjä) | Ei vaikutusta olemassa oleviin system-partteihin lainkaan |
| Käyttäjän kokema latenssi | Työkalukutsu keskeyttää/pidentää jokaista vastausta, vaikka mitään tallennettavaa ei olisikaan | Nolla — voidaan ajaa täysin asynkronisesti vastauksen striimauksen jälkeen |
| Datan luotettavuus | Työkalukutsun argumentit roolileikin sisällä, epäluotettavampi skeema | `generateObject` + Zod-skeema = validoitu rakenne suoraan |
| Kustannus/malli | Sama (kalliimpi) malli joutuu tekemään extractionin joka viestillä | Voidaan käyttää halvempaa/pienempää mallia pelkkään poimintaan |
| Joustavuus (batch/throttle) | Vaikea — jokainen viesti käsitellään erikseen mallin sisällä | Helppo — voi ajaa joka N. viestillä tai vain riittävän pitkille vastauksille |

**Suositus: erillinen jälkikäsittely-LLM-kutsu**, ajettuna Next.js 16:n `after()`-APIlla (`next/server`) `app/api/chat/route.ts`:n sisällä, sen jälkeen kun striimattu vastaus on jo lähtenyt käyttäjälle:

```ts
// app/api/chat/route.ts (luonnos)
import { after } from "next/server";
import { extractVocab } from "@/lib/extraction/extractVocab";

const result = streamText({
  model: resolveModel(),
  system: systemPrompt,
  messages: await convertToModelMessages(messages),
  onFinish: async ({ text }) => {
    const userTurn = /* viimeisin käyttäjän viesti */;
    const savedIds = await saveMessages(mode, userTurn, text);
    after(() => extractVocab({ mode, assistantText: text, messageId: savedIds.assistantId }));
  },
});
```

`lib/extraction/extractVocab.ts` käyttää `generateObject`:ia Zod-skeemalla `{ candidates: [{ italian, finnish, exampleIt, context }] }` ja mode-kohtaista extraction-promptia (esim. phonetics-tilassa poimitaan lihavoidut/painotetut sanat eri logiikalla kuin conversation-tilan sanasto-parit). Tämä pitää pääpersoonien promptit koskemattomina ja mahdollistaa halvemman mallin käytön puhtaasti mekaaniseen poimintatehtävään.

Kadenssi: aloita yksinkertaisimmasta (aja joka assistentin vastauksen jälkeen), viritä myöhemmin tarvittaessa (esim. vain riittävän pitkät/sisältörikkaat vastaukset, tai joka 2.–3. viesti) kustannusten hillitsemiseksi.

## 4. Uudet API-reitit

```
app/api/
  chat/route.ts               (olemassa — laajennetaan: viestien persistointi + after()-extraction-hook)
  vocab/
    route.ts                  GET  (lista, ?due=true suodatin kertausnäkymälle, ?q= haku)
                               POST (manuaalinen kortin lisäys)
    [id]/route.ts              PATCH (muokkaa), DELETE
    review/route.ts            POST (SRS-arvosanan kirjaus → laskee uuden ease/interval/dueAt palvelimella)
  grammar/
    route.ts                  GET (haku/suodatus, valinnainen — ks. alla)
  tts/route.ts                 POST { text, speed? } → audio (ks. §5)
  stt/route.ts                 POST audio-blob → { text } (ks. §5)
```

Huomioita:
- `/api/vocab/due` erillisenä reittinä olisi vaihtoehto `/api/vocab?due=true`:lle — suositus: jälkimmäinen (yksi reitti, query-parametrilla suodatus) reittien määrän minimoimiseksi.
- `/api/grammar` on **valinnainen**: koska sisältö on staattinen ja pieni, `app/kielioppi/page.tsx` voi tuoda `GRAMMAR_TOPICS`-taulukon suoraan Server Componentissa ilman API-reittiä lainkaan. Erillinen reitti kannattaa vain jos hakua/suodatusta tarvitaan client-komponentista ilman sivun uudelleenlatausta.

## 5. TTS/STT-integraatio

**TTS: palvelinpuolen mallipohjainen (AI SDK `generateSpeech`), ei selaimen `speechSynthesis`.**

Perustelu: selaimen `SpeechSynthesis`-äänet ovat epäjohdonmukaisia laadultaan käyttöjärjestelmän/selaimen mukaan — vaihtelevat äänet, ei kaikki tarjoa hyvälaatuista italiaa. Koska ääntämisen kuunteleminen on nimenomaan yksi pyydetyistä ydinominaisuuksista (ei vain mukavuuslisä), laatu on tässä tärkeämpää kuin ilmaisuus. Server-side TTS (esim. OpenAI `tts-1`/`gpt-4o-mini-tts`, myöhemmin ElevenLabs paremman monikielisen prosodian vuoksi) antaa:
- Tasalaatuisen äänen riippumatta selaimesta/käyttöjärjestelmästä.
- Kontrollin puhenopeuteen (`generateSpeech`:n `speed`-parametri) — hyödyllinen kielenoppijalle, joka haluaa kuulla sanan hitaammin.
- Triviaalin kustannuksen yhden käyttäjän hobby-skaalassa.

Aloita OpenAI:n TTS-mallilla, koska `@ai-sdk/openai` on jo riippuvuutena; dokumentoi ElevenLabs-vaihtoehto myöhempää äänenlaadun päivitystä varten.

**STT: palvelinpuolen Whisper-luokan malli (AI SDK `transcribe`), ei selaimen `SpeechRecognition`.**

Tämä on tärkein yksittäinen arkkitehtuurihuomio tässä osiossa: **selaimen `SpeechRecognition` (Chrome/Edge-only, pilvipalveluna toimiva) on tunnetusti taipuvainen "korjaamaan" käyttäjän ääntämyksen kohti todennäköisintä sanakirjasanaa** — jos käyttäjä ääntää "gli":n väärin, Chrome saattaa silti palauttaa oikein kirjoitetun sanan kielimallinsa biasin takia. Tämä olisi suoraan ristiriidassa Fonetista-tilan koko tarkoituksen kanssa (ääntämyshaasteiden tunnistaminen), koska sovellus ei koskaan näkisi merkkiä siitä, että käyttäjä ääntää väärin. Lisäksi `SpeechRecognition`in selaintuki on hataraa (ei Firefoxissa, rajallinen Safarissa).

Sen sijaan: `MediaRecorder`-API (hyvä selaintuki kaikkialla) nauhoittaa client-puolella äänen → lähetetään blobina `/api/stt`:hen → palvelin transkriboi AI SDK:n `transcribe()`-funktiolla (esim. OpenAI Whisper). Whisper ei ole täydellinen, mutta on huomattavasti kirjaimellisempi kuin kuluttajatuotteeksi viritetty selain-STT, eikä ole riippuvainen selaimesta/käyttöjärjestelmästä.

**Rajoitus, syytä kirjata näkyviin:** kumpikaan ratkaisu (Whisper tai selain-STT) ei tee varsinaista foneettista ääntämyksen pisteytystä — molemmat tuottavat vain parhaan arvauksen *sanoista*, eivät analysoi ääntämyksen tarkkuutta. Jos syvempi ääntämyspalaute halutaan myöhemmin, luonnollinen seuraava askel olisi äänen natiivisti ymmärtävä malli tai erillinen ääntämyksen pisteytys-API (esim. Azure Pronunciation Assessment). Tämä on tietoisesti rajattu pois v2:n laajuudesta.

**Kytkentä `ChatPanel.tsx`:ään:**
- Mikrofonipainike syöttökentän viereen. Klikkaus → `MediaRecorder` nauhoittaa → POST `/api/stt` → transkriptio täyttää `input`-tekstikentän (**ei lähetetä automaattisesti** — käyttäjä voi tarkistaa/korjata ennen lähetystä, koska transkriptio ei ole täydellinen).
- Kaiutin-/toistopainike jokaisen assistentin viestikuplan yhteyteen. Klikkaus (lazy, ei automaattista esigenerointia) → POST `/api/tts` → palautettu audio soitetaan `<audio>`-elementillä. Kevyt in-memory-välimuisti (React-tila, avaimena `message.id`) estää saman äänen uudelleengeneroinnin.
- Automaattinen ääneenluku voidaan tarjota asetuksena myöhemmin, mutta oletuksena pois päältä.

## 6. Tiedostorakenne-ehdotus

```
lib/
  prompts.ts                     (olemassa)
  db/
    schema.ts                    — Drizzle-taulut: messages, vocabCards, reviewLog
    client.ts                    — better-sqlite3 + drizzle-instanssi (singleton, hot-reload-turvallinen)
    srs.ts                       — SM-2-algoritmi puhtaina funktioina (computeNextReview)
  grammar/
    topics.ts                    — staattinen kielioppisisältö
    search.ts                    — kevyt in-memory-haku/suodatus
  extraction/
    extractVocab.ts               — generateObject-pohjainen poimintakutsu + Zod-skeema
  speech/
    tts.ts                        — generateSpeech-wrapperi
    stt.ts                        — transcribe-wrapperi
drizzle/                          — drizzle-kit:in generoimat migraatiot
drizzle.config.ts
data/
  benvenuto.sqlite                — ajonaikainen DB-tiedosto (.gitignore)
app/
  api/
    chat/route.ts                 (olemassa, laajennetaan)
    vocab/route.ts
    vocab/[id]/route.ts
    vocab/review/route.ts
    grammar/route.ts              (valinnainen)
    tts/route.ts
    stt/route.ts
  (app)/
    layout.tsx                    — jaettu sivupalkki+topbar-kehys (ks. ux-dashboard-design.md §2)
    page.tsx                      — Keskustelu (nyk. app/page.tsx)
    sanasto/page.tsx
    kertaus/page.tsx
    kielioppi/page.tsx
    kielioppi/[aihe]/page.tsx
components/
  ChatPanel.tsx                   (olemassa, laajennetaan: mikrofoni + toistopainike)
  VocabCard.tsx
  GrammarTopicLink.tsx            — inline-viittaus kielioppiaiheeseen chatissa
  MicButton.tsx
  AudioPlayButton.tsx
```

## 7. Migraatiopolku nykyisestä

Karkea, inkrementaalinen järjestys — jokainen vaihe tuottaa jotain testattavaa ilman, että seuraavat vaiheet ovat vielä valmiit. Tämä on myös [../TODO.md](../TODO.md):n "Laajennus v2" -epiikkojen pohja:

1. **DB-perusta.** Drizzle + `better-sqlite3`, vain `messages`-taulu, persistointi `/api/chat`:n `onFinish`/`after()`-hookiin. Ei UI-muutoksia.
2. **Sanaston poimintaputki.** `vocabCards`+SRS-kentät, `lib/extraction/extractVocab.ts`, kytke `after()`-hookiin. Ei vielä UI:ta — tarkista suoraan tietokannasta.
3. **Sanasto-UI.** `/sanasto`-listanäkymä (selaa, muokkaa, poista) + `/api/vocab`-reitit.
4. **SRS-kertaus.** `lib/db/srs.ts` (SM-2), `/api/vocab/review`, `/kertaus`-flashcard-näkymä.
5. **Kielioppikirjasto.** Alkuperäinen aihejoukko (passato prossimo, pronomi indiretti, painotukset, gli/gn) staattisena sisältönä, `/kielioppi`-selaus/haku + `/kielioppi/[aihe]`.
6. **Kielioppi↔chat-linkitys.** Tag-pohjainen avainsanaosuma assistentin vastauksen ja `GRAMMAR_TOPICS.tags`:n välillä poiminnan jälkeen → osuvat aiheet klikattavina chippeinä viestin alla.
7. **STT.** `MediaRecorder`-nauhoitus `ChatPanel`iin, `/api/stt` (`transcribe()`), tarkista-ennen-lähetystä-UX.
8. **TTS.** `/api/tts` (`generateSpeech()`), toistopainike viestikupliin, in-memory-audiovälimuisti.
9. **Dashboard-kehys.** `(app)/layout.tsx` sivupalkki+topbar (ks. ux-dashboard-design.md §2), nykyinen `app/page.tsx` siirtyy route groupin sisään.

**Pelillistäminen/streakit/XP (matala prioriteetti, ei suunniteltu yksityiskohtaisesti):** arkkitehtuuri ei sulje tätä pois — `review_log`-taulu (§2.2) tallentaa jo jokaisen kertauksen aikaleiman, mistä streak (peräkkäiset päivät joilla kertausta) ja XP voidaan laskea ilman skeemamuutoksia myöhemmin.

### Kriittiset tiedostot toteutusta varten

- `lib/db/schema.ts`, `lib/db/client.ts`, `lib/db/srs.ts`
- `lib/extraction/extractVocab.ts`
- `app/api/chat/route.ts`
- `components/ChatPanel.tsx`
