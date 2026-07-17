# Tekninen dokumentaatio

Tämä dokumentti kuvaa "Benvenuto"-sovelluksen todellisen teknisen toteutuksen: pinon,
tiedostorakenteen, rajapinnat ja keskeiset päätökset. Tuotesuunnitelma (alkuperäinen PRD)
on tiedostossa [product-plan.md](./product-plan.md). Tehtävähistoria ja tämänhetkinen
tilanne on tiedostossa [../TODO.md](../TODO.md).

## Teknologiapino

| Osa-alue        | Valinta                                                        |
|-----------------|-----------------------------------------------------------------|
| Framework       | Next.js 16 (App Router, TypeScript)                             |
| Tyylit          | Tailwind CSS v4                                                  |
| LLM-integraatio | Vercel AI SDK (`ai` v7, `@ai-sdk/react` v4)                      |
| LLM-tarjoajat   | OpenAI (`@ai-sdk/openai`) ja Anthropic (`@ai-sdk/anthropic`), valittavissa ympäristömuuttujalla |
| Markdown-render | `react-markdown` (chat-viestien lihavoinnit/muotoilut)          |
| Paketinhallinta | npm                                                               |

Node.js-versiovaatimus: AI SDK -paketit ilmoittavat `engines.node >= 22`, mutta paikallinen
kehitysympäristö on tällä hetkellä Node 20.16. Tämä aiheuttaa `EBADENGINE`-varoituksia
asennuksen yhteydessä, mutta ei ole toistaiseksi estänyt asennusta tai ajoa. Jos ajonaikaisia
ongelmia ilmenee, ensimmäinen tarkistettava asia on Node-version päivitys ≥22.

## Tiedostorakenne

```
app/
  api/chat/route.ts     — API-reitti, joka striimaa LLM-vastauksen
  layout.tsx             — juuri-layout (fontit, html/body)
  page.tsx               — pääsivu: tilanvalitsin + chat-paneeli
  globals.css            — Tailwind-tuonti ja teema-muuttujat
components/
  ChatPanel.tsx          — chat-ikkuna, viestilista, syötekenttä (client component)
lib/
  prompts.ts             — kolmen tilan system promptit + tilametatiedot
docs/
  product-plan.md        — alkuperäinen tuotesuunnitelma (PRD)
  technical-documentation.md — tämä tiedosto
TODO.md                  — tehtävähistoria ja -tilanne
```

## Tilat (Modes) ja system promptit

`lib/prompts.ts` määrittelee tyypin `Mode = "grammar" | "conversation" | "phonetics"` sekä:

- `MODES`: taulukko UI:ta varten (`id`, `label`, `description`) — käytetään tilanvalitsimen
  painikkeissa.
- `SYSTEM_PROMPTS`: `Record<Mode, string>` — jokaiselle tilalle oma system-prompti
  (Il Professore / L'Amico / Il Fonetista), suomeksi ohjeistettu, italiaksi
  esimerkkien osalta, PRD:n kohdan 3 mukaisesti.

Poikkeama alkuperäisestä PRD:stä: PRD:ssä API-reitin kuvattiin ottavan vastaan
`systemPrompt`-merkkijonon suoraan clientilta. Toteutuksessa client lähettää sen sijaan
lyhyen `mode`-tunnisteen (`grammar`/`conversation`/`phonetics`), ja **palvelin** valitsee
vastaavan system-promptin `SYSTEM_PROMPTS`-objektista. Tämä on tietoturvallisempi ja
yksinkertaisempi ratkaisu: client ei voi injektoida mielivaltaista system-promptia, ja
promptien sisältö pysyy yhdessä paikassa (`lib/prompts.ts`).

## API-reitti: `app/api/chat/route.ts`

- Ottaa `POST`-pyynnön bodystä `{ messages: UIMessage[], mode: Mode }`.
- Valitsee LLM-mallin `resolveModel()`-funktiolla ympäristömuuttujan `LLM_PROVIDER`
  perusteella (`"openai"` oletuksena, tai `"anthropic"`).
  - OpenAI: malli ympäristömuuttujasta `OPENAI_MODEL`, oletus `gpt-4o-mini`.
  - Anthropic: malli ympäristömuuttujasta `ANTHROPIC_MODEL`, oletus `claude-3-5-haiku-20241022`.
- Kutsuu `streamText()` AI SDK:sta annetulla system-promptilla ja
  `convertToModelMessages(messages)`-muunnetuilla viesteillä.
- Palauttaa vastauksen `result.toUIMessageStreamResponse()`-metodilla, joka striimaa
  vastauksen selaimelle AI SDK:n UI-message-protokollan mukaisesti.
- `maxDuration = 30` rajoittaa streamin kestoa (Next.js route-segmentin asetus).

Provider-avaimet luetaan automaattisesti ympäristömuuttujista `OPENAI_API_KEY` /
`ANTHROPIC_API_KEY` (AI SDK:n oletuskäytäntö singleton-providereille `openai(...)` /
`anthropic(...)`).

## Client: `components/ChatPanel.tsx`

- Client component (`"use client"`), käyttää `@ai-sdk/react`:n `useChat`-hookia.
- Luo `DefaultChatTransport`-instanssin, jolle annetaan `api: "/api/chat"` ja
  `body: { mode }`. Transport uudelleenluodaan `useMemo`:lla aina kun `mode` vaihtuu.
- `page.tsx` rendersoi `<ChatPanel mode={activeMode} key={activeMode} />` — `key`-propin
  ansiosta React purkaa ja luo komponentin kokonaan uudelleen tilan vaihtuessa, mikä
  toteuttaa PRD:n vaatimuksen "tilan vaihtaminen resetoi chatin".
- Viestit renderöidään `message.parts`-taulukon kautta (AI SDK v5+ -rakenne: viesti ei ole
  enää pelkkä `content`-merkkijono, vaan `parts`-lista, joista tässä käytetään vain
  `type === "text"` -osia). Teksti renderöidään `react-markdown`:lla, jotta esim.
  ääntämistilan `**painotukset**` näkyvät lihavoituna.
- Käyttäjän viestit oikealla (sininen tausta), tekoälyn viestit vasemmalla (harmaa tausta),
  PRD:n UX-kuvauksen mukaisesti.
- `status`-kentän (`submitted` / `streaming` / `ready` / `error`) avulla estetään
  tuplalähetykset ja näytetään kevyt "…"-latausindikaattori.

## Ympäristömuuttujat

Tarvittavat/valinnaiset muuttujat (`.env.local`):

| Muuttuja            | Pakollinen                          | Kuvaus                                      |
|---------------------|--------------------------------------|----------------------------------------------|
| `LLM_PROVIDER`       | Ei (oletus `openai`)                 | `openai` tai `anthropic`                     |
| `OPENAI_API_KEY`     | Kyllä, jos `LLM_PROVIDER=openai`      | OpenAI-avain                                 |
| `OPENAI_MODEL`       | Ei (oletus `gpt-4o-mini`)            | OpenAI-mallin nimi                           |
| `ANTHROPIC_API_KEY`  | Kyllä, jos `LLM_PROVIDER=anthropic`   | Anthropic-avain                              |
| `ANTHROPIC_MODEL`    | Ei (oletus `claude-3-5-haiku-20241022`) | Anthropic-mallin nimi                     |

Esimerkkitiedosto: `.env.local.example` (ks. TODO — tekemättä toistaiseksi).

## Tunnetut keskeneräisyydet / avoimet päätökset

Katso ajantasainen tilanne [../TODO.md](../TODO.md). Lyhyesti:

- `app/page.tsx` on vielä `create-next-app`:n oletussisällöllä — tilanvalitsin-UI puuttuu.
- `.env.local.example` puuttuu.
- `@tailwindcss/typography`-plugin asennus on kesken (tarvitaan `prose`-luokkien käyttöön
  Markdown-sisällön tyylittelyssä `ChatPanel.tsx`:ssä) — vaihtoehtoisesti tyylit voidaan
  toteuttaa ilman plugin-riippuvuutta.
- Sovellusta ei ole vielä ajettu/testattu selaimessa kolmella eri tilalla.
- Phase 2 -ominaisuudet (TTS, STT, lokaali Ollama-reitti) eivät ole vielä alkaneet.
