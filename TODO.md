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

## Kesken / seuraavaksi

- [ ] Päästä-päähän-testaus oikealla LLM-vastauksella vaatii API-avaimen `.env.local`-tiedostoon
      (`OPENAI_API_KEY` tai `ANTHROPIC_API_KEY` + `LLM_PROVIDER`). Ei vielä tehty — käyttäjä päätti
      2026-07-17 jättää rakenteellisen testauksen (rendausvarmistus, typecheck, lint, virheenkäsittely)
      toistaiseksi riittäväksi ilman avainta.
- [ ] Kun avain lisätään: testaa kaikki kolme tilaa selaimessa oikealla keskustelulla (myös molemmilla
      providereilla, jos molempiin on avaimet)

## Suunniteltu — Phase 2 (PRD kohta 6)

- [ ] Text-to-Speech (TTS): selaimen `SpeechSynthesis`-API lukemaan tekoälyn italiankieliset
      vastaukset ääneen
- [ ] Speech-to-Text (STT): mikrofonipainike + selaimen `SpeechRecognition`-API tai vastaava
- [ ] Lokaali LLM -reitti: vaihtoehtoinen provider Ollaman kautta (esim. Llama 3.1 / Gemma 2)
      täysin offline-/ilmaiskäyttöä varten

## Päätökset ja poikkeamat alkuperäisestä PRD:stä

- Client lähettää API:lle `mode`-tunnisteen (ei valmista `systemPrompt`-merkkijonoa).
  Palvelin valitsee promptin `lib/prompts.ts`:stä. Syy: turvallisempi (client ei voi
  injektoida mielivaltaista system-promptia) ja pitää promptit yhdessä paikassa.
  Ks. [docs/technical-documentation.md](docs/technical-documentation.md#tilat-modes-ja-system-promptit).
- LLM-tarjoaja on valittavissa ympäristömuuttujalla `LLM_PROVIDER` (`openai`/`anthropic`)
  PRD:n "esim. OpenAI tai Anthropic" -maininnan pohjalta, käyttäjän pyynnöstä 2026-07-17.
