# Benvenuto

Henkilökohtainen italian kielen tekoälyvalmentaja suomenkieliselle Duolingon suorittaneelle
opiskelijalle. Kolme tilaa: Kielioppi (Il Professore), Keskustelu (L'Amico) ja Ääntäminen
(Il Fonetista).

- Tuotesuunnitelma: [docs/product-plan.md](docs/product-plan.md)
- Tekninen dokumentaatio: [docs/technical-documentation.md](docs/technical-documentation.md)
- Tehtävähistoria / TODO: [TODO.md](TODO.md)

## Käyttöönotto

1. Asenna riippuvuudet:

   ```bash
   npm install
   ```

2. Kopioi ympäristömuuttujat ja täytä vähintään yksi API-avain:

   ```bash
   cp .env.local.example .env.local
   ```

   `.env.local`:

   ```env
   LLM_PROVIDER=openai        # tai "anthropic"
   OPENAI_API_KEY=sk-...      # tarvitaan jos LLM_PROVIDER=openai
   ANTHROPIC_API_KEY=sk-ant-...# tarvitaan jos LLM_PROVIDER=anthropic
   ```

3. Käynnistä kehityspalvelin:

   ```bash
   npm run dev
   ```

4. Avaa [http://localhost:3000](http://localhost:3000) ja valitse yläpalkista tila
   (Kielioppi / Keskustelu / Ääntäminen).

## Rakenne

Ks. [docs/technical-documentation.md](docs/technical-documentation.md) tiedostorakenteesta,
API-reitistä ja arkkitehtuurivalinnoista.
