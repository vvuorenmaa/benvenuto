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

## 7. Laajennus v2 (2026-07-17)

Ensimmäinen toimiva versio (pelkkä kolmen tilan chat) todettiin toiminnalliseksi mutta
visuaalisesti ja sisällöllisesti suppeaksi. Käyttäjä päätti laajentaa sovellusta merkittävästi
ennen jatkokehitystä. Päätökset:

**Uudet ominaisuusalueet (priorisointijärjestyksessä):**

1. **Sanasto & kertaus** — keskusteluista automaattisesti poimitut sanat/lauseet, spaced
   repetition (SRS) -kertauskortit, selattava oma sanavarasto.
2. **Kielioppikirjasto** — selattava/haettava referenssi (aikamuodot, pronominit, säännöt,
   esimerkit), linkittyy chatissa käsiteltyihin aiheisiin.
3. **Ääni (TTS/STT)** — tuodaan mukaan nyt, ei enää "Phase 2" -asiana: tekoälyn vastausten
   kuunteleminen ja puhuttu vastaaminen kirjoittamisen sijaan.
4. **Pelillistäminen (streakit/XP)** — tiedostettu tarve, mutta matala prioriteetti juuri nyt.
   Arkkitehtuurissa varataan tälle tila (ks. architecture-v2.md §7), mutta sitä ei suunnitella
   eikä toteuteta yksityiskohtaisesti tässä vaiheessa.

**Visuaalinen suunta:** nykyinen täysin pelkistetty chat-näkymä ("miedosti sanottuna tylsä")
korvataan **tietopainotteisella dashboardilla** — sivupalkki + kontekstipaneelit, jotka tuovat
edistymisen, sanaston ja kielioppivihjeet näkyville chatin rinnalle. Ei pelillistä/Duolingo-
tyylistä ulkoasua, ei myöskään täysin minimalistista lähestymistapaa.

**Yksityiskohtaiset suunnitelmat:**

* Tekninen arkkitehtuuri (tietovarasto, datamalli, uudet API-reitit, TTS/STT-valinnat,
  migraatiopolku): [architecture-v2.md](./architecture-v2.md)
* UX/käyttöliittymäsuunnitelma (sivurakenne, layout, näkymät, design-kieli, responsiivisuus):
  [ux-dashboard-design.md](./ux-dashboard-design.md)
* Konkreettiset tehtävät: [../TODO.md](../TODO.md)

## 8. Laajennus v3 (2026-07-18)

v2-laajennus (sanasto/SRS, kielioppikirjasto, ääni, dashboard) valmistui ja käyttäjä testasi
sovellusta. Testauksesta nousi kaksi konkreettista puutetta, ja käyttäjä pyysi lisäksi vapaasti
uusia ominaisuusideoita harkittavaksi.

**1. Kertaus on epäselvä.** Käyttäjän oma sanamuoto testauksen jälkeen: *"mihin siinä vastataan
ylipäätään, vai onko vaan tarkoitus että jotenkin itselle muistaisi sen"*. Tämä ei ole bugi vaan
puuttuva selitys: sovellus ei koskaan kerro käyttäjälle että kertaus on **aktiivinen itsetestaus**
(klassinen SRS-flashcard-malli — yritä muistaa vastaus mielessäsi ENNEN kuin paljastat sen, sitten
arvioi itse rehellisesti kuinka hyvin muistit). Nykyinen kertaus-näkymä näyttää vain italian sanan →
"Näytä vastaus" → Vaikea/Hyvä/Helppo, ilman ohjetta väliin kuuluvasta mielessä-muistelusta ja ilman
palautetta siitä mitä arviointi käytännössä tekee (milloin sana palaa uudelleen). Korjaus:
selittävä teksti aloitusruutuun + kortin etupuolelle, lyhyt kuvaus mitä kukin arviointinappi
tarkoittaa käyttäjän oman muistamiskokemuksen kannalta, ja palaute arvioinnin jälkeen ("näet tämän
sanan uudelleen ~N päivän päästä"). Ks. tarkka tehtävälistaus [../TODO.md](../TODO.md) Epic 10.

**2. Keskustelu katoaa sivua vaihdettaessa.** Käyttäjän huomio: jos Keskustelu-näkymästä siirtyy
esim. Kielioppi-sivulle (vaikka juuri `GrammarTopicLink`- tai kontekstipaneelin "Avaa aihe" -linkin
kautta) ja palaa takaisin, käynnissä ollut keskustelu on hävinnyt. Syy: `ChatPanel.tsx`:n `useChat()`-
tila on paikallinen komponenttitila, joka tuhoutuu kun `app/(app)/page.tsx` unmountautuu
sivunvaihdossa — viestit TALLENNETAAN kyllä `messages`-tauluun (Epic 1:n `onFinish`-hookissa), mutta
niitä ei koskaan ladata takaisin UI:hin. Tämä on ERI ongelma kuin alla mainittu "chat-historian
selaus" -ideakandidaatti (joka koskisi VANHOJEN, päättyneiden keskustelujen selaamista) — tässä on
kyse siitä että KESKEN OLEVA istunto ei saisi kadota pelkästä sivulla käynnistä. Korjaussuunta:
nosta `useChat`-tila (yksi per `Mode`, koska tilanvaihto tarkoituksella resetoi keskustelun PRD:n
mukaisesti) `app/(app)/layout.tsx`-tason Context-provideriin, joka EI unmounttaudu sisarsivujen
välillä navigoitaessa — vain täysi sivulatauksen uudelleenkäynnistys resetoisi tilan, mikä on
hyväksyttävää. Ks. tarkka tehtävälistaus [../TODO.md](../TODO.md) Epic 12.

**3. Kielioppikirjasto on hyvin suppea.** Vain 5 aihetta, ja koko "Säännöt"-kategoria on tyhjä — ei
vastaa A2-B1-tason oppijan todellista kielioppitarvetta. Päätös: laaja laajennus (~18 uutta aihetta),
täyttäen tyhjän kategorian ja laajentaen aikamuodot/pronominit-kategorioita samalla sisältörakenteella
kuin nykyiset aiheet (Mikä se on / Muodostus / Poikkeukset / Esimerkkejä). Ks. tarkka aihelista
[../TODO.md](../TODO.md) Epic 11.

**Harkittavat lisäominaisuudet (ei sitoumusta, kandidaatteja myöhempään priorisointiin):**

* Kevyt tilastonäkymä/kertaushistoria (ei pelillistämistä — puhtaasti informatiivinen, laskettavissa
  suoraan `review_log`-taulusta ilman skeemamuutoksia)
* Kielioppikvizit per aihe (pieni monivalintakoe joka testaa kielioppisäännön ymmärrystä, erottuu
  vocab-flashcardeista)
* Chat-historian selaus (VANHOJEN, päättyneiden keskustelujen selaaminen jälkikäteen — eri asia kuin
  yllä oleva Epic 12, joka koskee vain KESKEN olevan istunnon säilymistä sivunvaihdon yli. Viestit
  tallennetaan jo `messages`-tauluun mutta niitä ei koskaan näytetä uudelleen käyttäjälle — tämä oli
  tietoisesti jätetty myöhemmäksi päätökseksi jo Epic 1:ssä, ks. [architecture-v2.md](./architecture-v2.md) §2.1)
* Manuaalinen vaalea/tumma-teemakytkin (nyt vain järjestelmäasetuksen mukaan)
* Sanaston vienti/tuonti (CSV), esim. varmuuskopiointiin tai siirtoon toiseen työkaluun

Näiden toteutusjärjestys ja laajuus päätetään myöhemmin — tämä on vasta dokumentoitu suunnitelma,
ei aloitettu toteutus. Ks. [../TODO.md](../TODO.md) "Harkittavat lisäominaisuudet" -osio.
