# UX/UI-laajennussuunnitelma: Tietopainotteinen dashboard (v2)

> Suunnitteludokumentti, ei vielä toteutettu. Kuvaa nykyisen minimalistisen chat-käyttöliittymän
> (`app/page.tsx` + `components/ChatPanel.tsx`) laajennuksen tietopainotteiseksi dashboardiksi,
> joka tuo sanaston, kielioppikirjaston ja edistymisen näkyväksi chatin rinnalle — säilyttäen
> nykyisen väripaletin (`blue-600` aktiiviväri, `neutral-*` tumma/vaalea-skaala) ja Tailwind v4
> -utility-konventiot. Tekninen vastine: [architecture-v2.md](./architecture-v2.md). Tuotetason
> kuvaus: [product-plan.md](./product-plan.md) §7. Tehtävälistaus: [../TODO.md](../TODO.md).

## 1. Sivu-/reittirakenne

Nykyinen sovellus on yksi reitti (`/`), joka renderöi tilanvalitsimen ja `ChatPanel`in. Laajennuksessa otetaan käyttöön App Routerin route group jaetulle kehysrakenteelle (sivupalkki + yläpalkki pysyvät, sisältö vaihtuu):

```
app/
  (app)/
    layout.tsx          — jaettu kehys: sivupalkki + topbar, kääröö kaikki alla olevat
    page.tsx             — Keskustelu (nyk. sisältö app/page.tsx:stä, oletusreitti "/")
    sanasto/
      page.tsx           — Sanavarasto-selaus
    kertaus/
      page.tsx           — SRS-kertaussessio
    kielioppi/
      page.tsx           — Kielioppikirjaston etusivu (kategoriat + haku)
      [aihe]/
        page.tsx          — Yksittäisen kielioppiaiheen sivu (esim. /kielioppi/passato-prossimo)
```

Navigointi päänäkymien välillä tapahtuu pysyvästä vasemmasta sivupalkista (ei enää yläpalkin nappi-riviä pääasiallisena navigaationa — nykyiset kolme tilanvalintanappia ovat *chatin sisäinen* alavalikko, eivät sovellustason navigaatio, ks. §3). Chat-tila (`Mode`) säilytetään URL-queryna Keskustelu-näkymässä (esim. `/?mode=grammar`), jotta selaimen taka/eteenpäin-navigaatio ja bookmarkkaus toimivat — pieni lisäys nykyiseen `useState<Mode>`-toteutukseen (`app/page.tsx`), ei arkkitehtuurimuutos.

Kertaus on nostettu omaksi ylätason reitiksi (`/kertaus`) vaikka se on looginen alitoiminto sanastolle, koska se on prioriteetissa korkealla ja käyttäjä haluaa sille nopean pääsyn suoraan sivupalkista — silti sanasto-näkymässä on aina näkyvä pikakutsu kertaukseen (§4).

## 2. Yleinen layout-runko

Kehys: **vasen sivupalkki** (päänavigaatio) + **yläpalkki** (kontekstuaalinen: otsikko, chatissa tilavalitsin, sanasto/kielioppi-näkymissä haku) + **pääsisältö** + **oikea kontekstipaneeli** (näkyy vain Keskustelu-näkymässä).

Desktop, Keskustelu-näkymä:

```
┌──────────┬─────────────────────────────────────────────────┬───────────────────────┐
│ Benvenuto│  [Kielioppi] [Keskustelu] [Ääntäminen]      🔥 7 │  Tässä keskustelussa   │
├──────────┤                                                   ├───────────────────────┤
│ 💬 Keskus.│                                                   │ Uusia sanoja: 3       │
│ 📚 Sanasto│         (chat-viestit, ei muutu nykyisestä)        │  • passato prossimo    │
│ 🔄 Kertaus│                                                   │  • in giro             │
│    (5)   │                                                   │                       │
│ 📖 Kielio.│                                                   │ Liittyvä kielioppi     │
│          │                                                   │  → Passato prossimo    │
│          │                                                   │    [Avaa aihe →]      │
│          ├─────────────────────────────────────────────────┤                       │
│          │ [🎤]  [ textarea................... ] [Lähetä]  │                       │
└──────────┴─────────────────────────────────────────────────┴───────────────────────┘
```

Desktop, Sanasto/Kertaus/Kielioppi-näkymät: oikea kontekstipaneeli poistuu (data on jo pääsisällössä), pääsisältö laajenee koko leveydelle sivupalkin ja topbarin väliin. Topbar vaihtaa sisältöä näkymän mukaan (esim. Sanastossa hakukenttä + suodatinchipit, Kielioppikirjastossa hakukenttä).

Sivupalkki (kapea, ~14–16rem, ikoni+teksti):
- Ylhäällä "Benvenuto"-otsikko/logo.
- Neljä navigointikohtaa: Keskustelu, Sanasto, Kertaus (numerobadge "due"-määrälle), Kielioppi.
- Alhaalla: pieni, huomaamaton streak-/XP-indikaattori (esim. `🔥 7 päivää` pienellä `text-xs text-neutral-500`), varattu paikka pelillistämiselle — ei laajenneta tästä enempää nyt.

Kapea ikkuna (alle ~768px, ks. §8): sivupalkki muuttuu alapalkki-navigaatioksi, oikea kontekstipaneeli muuttuu vetolaatikoksi (bottom sheet).

## 3. Chat-näkymän laajennus

`ChatPanel.tsx`:n nykyinen rakenne (viestilista + `<form>`-syöttöpalkki) säilyy pääosin — lisäykset tehdään ilman että ne vievät tilaa keskustelun luettavuudelta:

**Mikrofonipainike**: sijoitetaan syöttöpalkkiin (`<form className="flex items-end gap-2 ...">`) tekstikentän *vasemmalle* puolelle, omana ikoninappinaan (pyöreä, samankokoinen kuin Lähetä-nappi, esim. `rounded-full` harmaa oletustilassa, punainen/pulsoiva tallennuksen aikana). STT ei lähetä automaattisesti: puheentunnistuksen tulos kirjoitetaan `textarea`-kenttään (samaan `input`-stateen kuin normaali kirjoitus), jolloin käyttäjä näkee ja voi korjata tekstin ennen "Lähetä"-painiketta. Tallennuksen aikana textarea-placeholder vaihtuu ("Kuuntelen...") ja mikrofonikuvake animoituu.

**Toistopainike (TTS)**: pieni, hillitty ikoninappi (kaiutin-ikoni, `text-xs`/`text-sm`, matala kontrasti `text-neutral-400 hover:text-neutral-600`) sijoitetaan jokaisen tekoälyn viestikuplan *yläreunaan oikealle*, kuplan sisällä mutta sen tekstisisällön yläpuolelle omalla rivillään — ei tekstin sisään, ei sen väliin. Ei näytetä käyttäjän omien viestien yhteydessä.

```
┌───────────────────────────────┐
│ 🔊                             │  ← toisto, hillitty, kuplan sisällä ylhäällä
│ Ciao! Come stai oggi?          │
│ Cosa hai fatto questo weekend? │
└───────────────────────────────┘
   → Passato prossimo            ← kielioppilinkki-chippi kuplan ALAPUOLELLA (kuplan ulkopuolella)
```

**Kielioppiaiheen linkki**: näkyy pienenä, hillittynä pillinä/chippinä *kuplan alapuolella* (ei kuplan sisällä, jotta se ei sekoitu itse vastaukseen), tyyliltään esim. `text-xs text-blue-600 dark:text-blue-400 hover:underline` + nuoli-ikoni, muoto "→ Passato prossimo". Klikkaus vie `/kielioppi/passato-prossimo`-sivulle. Näkyy vain kun kyseiseen viestiin liittyy tunnistettu kielioppiaihe (metadata-kentästä message-oliossa) — jos ei tunnistettua aihetta, chippiä ei renderöidä.

## 4. Sanavarasto-näkymä

```
┌─────────────────────────────────────────────────────────┐
│  Sanasto                                     42 sanaa   │
│  [🔎 Hae sana tai lause...]                              │
│  ( Kaikki )( Due nyt · 5 )( Uudet )( Opitut )            │
│  ─────────────────────────────────────────────────────   │
│  [ Aloita kertaus (5 due) ]                              │
│  ─────────────────────────────────────────────────────   │
│  passato prossimo               🟡 Due nyt   Keskustelu │
│  "olen tehnyt" -tyyppinen menneisyyden aikamuoto          │
│  ─────────────────────────────────────────────────────   │
│  in giro                        🟢 Opittu    Keskustelu │
│  "liikkeellä, kaupungilla"                                │
│  ─────────────────────────────────────────────────────   │
│  cafè                           🔵 Uusi      Ääntäminen  │
│  kahvila; painotus toisella tavulla: ca**fè**             │
└─────────────────────────────────────────────────────────┘
```

- Yläosassa kokonaismäärä + haku + suodatinchipit (Kaikki / Due nyt / Uudet / Opitut), samalla visuaalisella kielellä kuin nykyiset tilanvalintanapit (`rounded-full`, aktiivinen sininen).
- Näkyvä CTA-painike kertaukseen aina kun `due`-määrä > 0.
- Lista (ei korttiruudukko — tietopainotteinen, scannattava, rivipohjainen), jokainen rivi: italiankielinen sana/lause (`font-medium`), lyhyt suomenkielinen selitys/käännös alla, SRS-tila värikoodattuna pienellä pallo+teksti-badgella (uusi=sininen, due=keltainen/amber, opittu=vihreä), ja pieni tagi mistä tilasta/keskustelusta sana on poimittu.
- Rivin klikkaus avaa laajennetun näkymän (accordion tai sivupaneeli) jossa esimerkkilause kontekstista + mahdollinen linkki liittyvään kielioppiaiheeseen.

## 5. Kertausnäkymä (SRS-flashcardit)

Ruutu kerrallaan, minimalistinen keskitetty kortti (kertaussessio on tarkoituksella "tunneli", jotta keskittyminen pysyy kortissa):

**Ruutu 1 – Aloitus:**
```
        Tämän päivän kertaus
        5 sanaa odottaa kertausta

           [ Aloita kertaus ]
```

**Ruutu 2 – Kortin etupuoli (italia):**
```
                 3 / 5  ▓▓▓▓▓▓░░░░
        ┌──────────────────────────┐
        │      passato prossimo    │
        │            🔊            │
        └──────────────────────────┘
           [ Näytä vastaus ]
```

**Ruutu 3 – Paljastettu (suomi + esimerkki), arviointi:**
```
        ┌──────────────────────────┐
        │      passato prossimo    │
        │      ─────────────────    │
        │  "olen tehnyt" -tyyppinen │
        │  menneisyyden aikamuoto   │
        │  "Ho mangiato la pizza." │
        └──────────────────────────┘
        [ Vaikea ]  [ Hyvä ]  [ Helppo ]
```

Arviointinapit vastaavat karkeaa SM-2-tyyppistä SRS-logiikkaa (Vaikea = lyhyt intervalli/toisto pian, Hyvä = normaali kasvava intervalli, Helppo = pitkä intervalli) — arvion painallus siirtää automaattisesti seuraavaan korttiin, ei erillistä "Seuraava"-nappia välissä.

**Ruutu 4 – Session loppu:**
```
        Kertaus valmis! ✅
        5/5 käyty läpi
        Seuraava kertaus: huomenna 3 sanalle

        [ Takaisin sanastoon ]   [ Chattiin ]
```

## 6. Kielioppikirjasto-näkymä

**Etusivu** (kategoriaselaus + haku):

```
┌─────────────────────────────────────────────────────────┐
│  Kielioppikirjasto        [🔎 Hae aihetta...]            │
│                                                            │
│  Aikamuodot          Pronominit         Prepositiot       │
│  ─────────          ────────          ────────           │
│  Passato prossimo    Suorat obj.pron.   di, a, da, in...  │
│  Imperfetto           Epäsuorat pron.                     │
│  Futuro semplice      ci / ne                              │
└─────────────────────────────────────────────────────────┘
```

Kategoriat vaakariveinä/sarakkeina (Aikamuodot, Pronominit, Prepositiot, Artikkelit/substantiivit, Adjektiivit, Muut säännöt), aiheet listattuna kunkin alla lyhyinä riveinä. Hakukenttä suodattaa reaaliaikaisesti kaikkien kategorioiden yli.

**Yksittäisen aiheen sivu** (esim. `/kielioppi/passato-prossimo`):

```
┌─────────────────────────────────────────────────────────┐
│  ← Kielioppikirjasto                                     │
│  Passato prossimo                          [ Aikamuodot ]│
│                                                            │
│  Mikä se on                                               │
│  Suomen "olen tehnyt" -tyyppinen aikamuoto...             │
│                                                            │
│  Muodostus                                                 │
│  avere/essere (preesens) + partisiippi (-ato/-uto/-ito)   │
│                                                            │
│  Esimerkkejä                                               │
│  Ho mangiato la pizza.        Söin/olen syönyt pizzaa.    │
│  Sono andato al mare.         Menin merelle.               │
│                                                            │
│  Liittyvät sanat sanavarastossasi                          │
│  [ mangiato ]  [ andato ]  [ ho fatto ]                    │
└─────────────────────────────────────────────────────────┘
```

Rakenne: otsikko + kategoriabadge, selitysosiot suomeksi selkeillä väliotsikoilla (Mikä se on / Milloin käytetään / Muodostus / Poikkeukset — osiot voivat vaihdella aiheittain), esimerkkitaulukko italia↔suomi rinnakkain, ja alaosassa linkkichip-rivi käyttäjän omaan sanavarastoon liittyvistä korteista (klikkaus vie `/sanasto`-näkymään kyseiseen korttiin suodatettuna). Tämä sulkee §3:n kielioppilinkin kehän: chatista → aihe-sivulle → aihe-sivulta takaisin relevanttiin sanastoon.

## 7. Design-kieli

**Väripaletti**: säilytetään nykyinen perusta — `blue-600` ensisijainen toimintaväri (aktiivinen tila, Lähetä-nappi, linkit, CTA:t), `neutral-50…950` rakenteellinen tumma/vaalea-skaala (`prefers-color-scheme` jo käytössä `globals.css`:ssä). Tietopainotteisuutta varten lisätään **rajattu, tarkoituksenmukainen** merkitysvärikoodaus SRS-tiloille ja badgeille, ei koristeeksi:
- Sininen (`blue-500/600`) = uusi
- Keltainen/amber (`amber-500`) = due/kertausta odottava
- Vihreä (`emerald-500`) = opittu/hallinnassa

Näitä käytetään *vain* pienissä badgeissa/pisteissä/chipeissä (`rounded-full`, `text-xs`), ei suuriksi taustaväreiksi — muuten ulkoasu alkaa näyttää pelilliseltä, mitä käyttäjä ei halua.

**Typografia**: jatketaan Geist Sans/Mono -fontteja. Datanäkymissä (statistiikkakortit, kertauskortin numero, streak) käytetään `font-mono` numeroille erottamaan ne leipätekstistä (esim. "5/12", "🔥 7"). Otsikot `font-semibold`, metatiedot `text-xs text-neutral-500`.

**Statistiikkakortit ("stat tile")**: yhtenäinen pieni komponenttikaava toistetaan kontekstipaneelissa, sanasto-otsikossa ja kertauksen yhteenvedossa: `rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 p-3` sisältäen suuren luvun (`text-xl font-semibold`) + pienen labelin alla (`text-xs text-neutral-500`). Tämä toistuva kaava tuo "dashboard"-tunnun sekoittamatta liikaa erilaisia komponenttityylejä.

**Komponentit**: mitään uutta komponentikirjastoa ei ole pakko ottaa, sillä nykyinen tyyli (utility-luokat suoraan JSX:ssä `ChatPanel.tsx`:n tapaan) riittää pieneen, yhden käyttäjän sovellukseen. Jos toteutusvaiheessa halutaan nopeuttaa toistuvien osien (Badge, Tabs suodattimille, Sheet mobiilin vetolaatikolle, kortin flip-animaatio kertauksessa) rakentamista, **shadcn/ui** on perusteltu lisä juuri näihin — se generoi Tailwind-pohjaisia komponentteja suoraan projektiin (ei runtime-riippuvuutta), mutta tämä on toteutusvaiheen valinta, ei UX-suunnitelman edellytys.

## 8. Responsiivisuus/mobiili

Alle `md`-breakpointin (~768px):

- **Vasen sivupalkki** → kiinteä **alapalkki-navigaatio** (4 ikonia: Keskustelu/Sanasto/Kertaus/Kielioppi, Kertaus-ikonissa due-numero pienenä badgena). Sivupalkin streak-indikaattori siirtyy yläpalkkiin pieneksi ikoniksi otsikon viereen.
- **Yläpalkki**: chat-näkymässä tilanvalintapillit muuttuvat vaakasuunnassa vieritettäväksi riviksi (`overflow-x-auto`) leveyden säästämiseksi.
- **Oikea kontekstipaneeli** (chat) katoaa näkyvistä oletuksena ja korvautuu pienellä kelluvalla painikkeella (esim. info-ikoni oikeassa alakulmassa syöttöpalkin yläpuolella), joka avaa saman sisällön **bottom sheet** -vetolaatikkona ruudun alareunasta.
- **Sanasto/Kielioppi-listat**: yksipalstaisiksi, kategoriasivupalkki (kielioppikirjaston etusivu) muuttuu vaakasuuntaiseksi vieritettäväksi chip-riviksi listan yläpuolella pystysarakkeiden sijaan.
- **Mikrofoni-/toistopainikkeet**: pidetään aina vähintään ~40×40px kosketusalueella riippumatta ruudun leveydestä.

### Kriittiset tiedostot toteutusta varten

- `app/page.tsx`
- `components/ChatPanel.tsx`
- `app/layout.tsx`
- `app/globals.css`
- `lib/prompts.ts`
