# PROJEKTISUUNNITELMA: "Benvenuto" – Henkilökohtainen Italian kielen tekoälyvalmentaja

> Tämä on projektin alkuperäinen tuotesuunnitelma (PRD). Se on säilytetty sellaisenaan
> referenssiksi. Toteutuksen todellinen tila ja tekniset yksityiskohdat löytyvät
> tiedostosta [technical-documentation.md](./technical-documentation.md), ja tehtävien
> historia/tilanne tiedostosta [../TODO.md](../TODO.md).

## 1. Yleiskuvaus ja tavoite

Sovelluksen tavoitteena on toimia interaktiivisena jatko-askeleena Duolingon suorittaneelle opiskelijalle. Sovellus ei opeta pelkkiä irrallisia sanoja, vaan keskittyy soveltavaan kielitaitoon: **kielioppiin**, **luonnolliseen keskusteluun** ja **ääntämisen hahmottamiseen**.

Sovellus toteutetaan Next.js-sovelluksena lokaaliin ympäristöön, ja se hyödyntää LLM-rajapintoja (esim. OpenAI tai Anthropic) Vercel AI SDK:n kautta.

## 2. Käyttäjäprofiili (Persona)

* **Käyttäjä:** Suomenkielinen italian opiskelija.
* **Taso:** Duolingo suoritettu (A2-B1 -taso). Ymmärtää perussanastoa hyvin, mutta lauseenmuodostus lennosta ja monimutkaisempi kielioppi (menneet aikamuodot, pronominit) kaipaavat harjoitusta.
* **Tarve:** Saada virheet korjatuksi suomeksi selitettynä, mutta mahdollisuus puhua aitoa italiaa ilman pelkoa virheistä.

## 3. Keskeiset toiminnalliset tilat (Modes)

Sovelluksessa on kolme päätoiminnallisuutta, joita ohjataan dynaamisilla **System Prompteilla**:

### A. Kielioppitila (Il Professore)

* **Toiminta:** Tekoäly toimii säästeliäänä opettajana.
* **Sääntö:** Jos käyttäjä tekee virheen, tekoäly ei anna suoraa vastausta, vaan antaa suomenkielisen vihjeen ja pyytää yrittämään uudelleen (*scaffolding*-metodi).
* **Kieli:** Ohjeet ja palaute suomeksi, tehtävät ja esimerkit italiaksi.

### B. Keskustelutila (L'Amico)

* **Toiminta:** Tekoäly simuloi italialaista ystävää rennossa chatissa (esim. kahvilassa tai matkasuunnitelmia tehdessä).
* **Sääntö:** Tekoäly puhuu vain italiaa (B1-taso), pitää viestit lyhyinä (2-3 lausetta) ja päättää viestin aina kysymykseen.
* **Virheiden käsittely:** Kielioppivirheet poimitaan talteen ja näytetään ystävällisesti viestin *lopussa* erillisessä "kulissien takana" -osiossa suomeksi, jotta itse keskustelun virtaus ei katkea.

### C. Ääntämistila (Il Fonetista)

* **Toiminta:** Keskittyy suomalaisten tyypillisiin ääntämysongelmiin italiassa (esim. *gli*, *gn*, tuplakonsonantit ja painotukset).
* **Sääntö:** Tekoäly visualisoi ääntämistä tekstin kautta. Se korostaa tavupainotuksia (esim. ca**fè**, la**sa**gne) ja selittää suomeksi "rautalangasta vääntäen", miten kieli ja suu asetetaan oikeaoppisesti.

## 4. Käyttöliittymä ja UX-rakenne (UI Wireframe Concept)

Käyttöliittymän tulee olla puhdas, minimalistinen ja scannattava (esim. Tailwind CSS).

* **Sivupalkki / Yläpalkki (Navigation):**
  * Kolme isoa painiketta tilan vaihtamiseen: `Kielioppi`, `Keskustelu`, `Ääntäminen`.
  * Tilan vaihtaminen resetoi chatin tai ladataan uutena istuntona.

* **Chat-ikkuna (Main Chat Area):**
  * Selkeä erottelu käyttäjän viestien (oikea reuna, sininen tausta) ja tekoälyn viestien välillä (vasen reuna, harmaa tausta).
  * Tekoälyn viestien sisällä tuki Markdown-muotoilulle (lihavoinnit foneettisille painotuksille).

* **Syötekenttä (Input area):**
  * Tekstikenttä kirjoittamista varten.
  * Lähetys-painike.
  * *(Tulevaisuutta varten: valmius mikrofonipainikkeelle).*

## 5. Tekninen arkkitehtuuriluonnos koodarille

Avustavalle koodi-tekoälylle annetaan tehtäväksi toteuttaa seuraava rakenne:

1. **Promptien eriyttäminen (`/lib/prompts.ts`):**
   * Kaikki system promptit tallennetaan yhteen objektiin, josta niitä kutsutaan tilan (`activeMode`) mukaan.

2. **Käyttöliittymä (`/app/page.tsx`):**
   * Käytetään Vercel AI SDK:n `useChat`-hookia.
   * Lähetetään valitun tilan prompti API-pyynnön `body`-objektissa.

3. **API-reitti (`/app/api/chat/route.ts`):**
   * Otetaan vastaan `messages` ja `systemPrompt`.
   * Streamataan vastaus selaimelle käyttäen modernia LLM-mallia (esim. `gpt-4o-mini` tai vastaava tehokas/edullinen malli).

## 6. Jatkokehityksen tiekartta (Phase 2)

Kun perusmalli toimii lokaalisti, sovellukseen on tarkoitus lisätä:

* **Text-to-Speech (TTS):** Selaimen puhesyntetisaattori lukemaan italiankieliset vastaukset ääneen.
* **Speech-to-Text (STT):** Mahdollisuus vastata puhumalla kirjoittamisen sijaan.
* **Lokaali LLM:** Vaihtoehtoinen API-reitti, joka käyttää Ollamaa (esim. Llama 3.1 tai Gemma 2), jolloin sovellus toimii täysin ilmaisena ja offline-tilassa.
