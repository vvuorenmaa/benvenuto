export type GrammarTopic = {
  slug: string;
  title: string;
  category: "aikamuodot" | "pronominit" | "säännöt" | "ääntäminen";
  bodyMd: string;
  tags: string[];
};

export const GRAMMAR_TOPICS: GrammarTopic[] = [
  {
    slug: "passato-prossimo",
    title: "Passato prossimo",
    category: "aikamuodot",
    tags: ["passato prossimo", "perfetti", "menneisyys", "avere", "essere"],
    bodyMd: `## Mikä se on
Passato prossimo on suomen "olen tehnyt" / "tein" -tyyppinen menneen ajan aikamuoto. Sitä käytetään kertomaan yksittäisistä, päättyneistä tapahtumista menneisyydessä — esimerkiksi mitä teit eilen tai viime viikonloppuna.

## Muodostus
Passato prossimo muodostetaan kahdesta osasta:
1. Apuverbi **avere** tai **essere** preesensissä
2. Pääverbin **partisiippi (participio passato)**, joka päättyy yleensä \`-ato\` (-are-verbit), \`-uto\` (-ere-verbit) tai \`-ito\` (-ire-verbit)

Suurin osa verbeistä käyttää apuverbiä **avere**. **Essere**-apuverbiä käyttävät mm. liikeverbit (andare, venire, tornare) ja refleksiiviverbit — näiden kanssa partisiipin pääte taipuu tekijän suvun/luvun mukaan (-o/-a/-i/-e).

## Poikkeukset
Monilla yleisillä verbeillä on epäsäännöllinen partisiippi, esim. fatto (fare), detto (dire), visto (vedere), stato (essere/stare), preso (prendere).

## Esimerkkejä
| Italia | Suomi |
|---|---|
| Ho mangiato la pizza. | Söin/olen syönyt pizzaa. |
| Sono andato al mare. | Menin merelle. |
| Hai visto il film? | Näitkö/oletko nähnyt elokuvan? |
| Abbiamo fatto un errore. | Teimme virheen. |`,
  },
  {
    slug: "pronomi-indiretti",
    title: "Pronomi indiretti (epäsuorat objektipronominit)",
    category: "pronominit",
    tags: ["pronomi indiretti", "epäsuora pronomini", "mi", "ti", "gli", "le"],
    bodyMd: `## Mikä se on
Epäsuorat objektipronominit (pronomi indiretti) vastaavat kysymykseen "kenelle?"/"mille?". Suomessa tämä näkyy usein allatiivi- tai adessiivisijana ("minulle", "hänelle"), italiassa omalla pronominisarjallaan, joka sijoitetaan yleensä ENNEN verbiä.

## Muodostus
| Pronomini | Suomi | Esimerkki |
|---|---|---|
| mi | minulle | Mi piace il caffè. |
| ti | sinulle | Ti scrivo domani. |
| gli | hänelle (mies) | Gli ho detto la verità. |
| le | hänelle (nainen) | Le ho dato un regalo. |
| ci | meille | Ci hanno invitato. |
| vi | teille | Vi mando una foto. |
| gli | heille (myös monikossa nykyisin, "loro" on muodollisempi) | Gli ho scritto. |

## Milloin käytetään
Epäsuora pronomini korvaa "a + henkilö" -rakenteen: "Scrivo a Maria" → "Le scrivo". Tyypillisiä verbejä joiden kanssa epäsuora pronomini esiintyy usein: piacere, dare, dire, scrivere, telefonare, chiedere.

## Poikkeukset
"Gli" on nykypuhekielessä syrjäyttänyt "loro"-pronominin monikon kolmannessa persoonassa lähes kokonaan, vaikka kielioppikirjat opettavat yhä "loro":n verbin jälkeen (esim. "Ho scritto loro").

## Esimerkkejä
| Italia | Suomi |
|---|---|
| Mi piace questo libro. | Pidän tästä kirjasta. (kirjaimellisesti: "se miellyttää minua") |
| Le ho telefonato ieri. | Soitin hänelle (naiselle) eilen. |
| Gli ho chiesto un favore. | Pyysin häneltä (mieheltä) palvelusta. |`,
  },
  {
    slug: "painotus",
    title: "Sanapainotus (painotukset)",
    category: "ääntäminen",
    tags: ["painotus", "tavu", "aksentti", "accento tonico"],
    bodyMd: `## Mikä se on
Italian sanoissa paino on useimmiten toiseksi viimeisellä tavulla (esim. ca-**sa**, ita-**lia**-no), mutta poikkeuksia on paljon, eikä painon paikkaa aina merkitä kirjoituksessa — se pitää vain tietää/oppia korvakuulolla.

## Milloin paino näkyy kirjoituksessa
Paino merkitään aksenttimerkillä (\`à, è, ì, ò, ù\`) VAIN kun paino on sanan VIIMEISELLÄ tavulla, esim. ca**fè**, città, però. Jos aksenttimerkkiä ei ole, paino on yleensä toiseksi viimeisellä tavulla — mutta ei aina!

## Poikkeukset (suomalaiselle erityisen hankalia)
Monissa sanoissa paino on KOLMANNEKSI viimeisellä tavulla ilman mitään merkintää, esim.:
- **ca**mera (huone) — ei "ca-me-**ra**"
- **ta**volo (pöytä)
- di**ffi**cile (vaikea)
- **a**bito (asun / puku)

Näiden ääntäminen väärin (paino viimeiselle/toiseksi viimeiselle tavulle) on hyvin yleinen suomalaisten virhe, koska suomen kielessä paino on aina ensimmäisellä tavulla.

## Esimerkkejä
| Italia | Suomi | Huomio |
|---|---|---|
| ca**fè** | kahvila | paino viimeisellä tavulla, merkitty aksentilla |
| la**sa**gne | lasagne | paino toiseksi viimeisellä tavulla |
| **ca**mera | huone | paino kolmanneksi viimeisellä, ei merkitty |
| pa**rl**ano | he puhuvat | paino kolmanneksi viimeisellä |`,
  },
  {
    slug: "gli-gn",
    title: '"gli" ja "gn" -äänteet',
    category: "ääntäminen",
    tags: ["gli", "gn", "ääntäminen", "palataalinen"],
    bodyMd: `## Mikä se on
"gli" ja "gn" ovat italian kielen kaksi äännettä, joita ei ole suomessa lainkaan ja jotka ovat suomalaisille tyypillisesti vaikeimpia ääntää oikein.

## "gli" — palataalinen l-äänne
"gli" äännetään SUUNNILLEEN kuin suomen "lj" mutta yhtenä äänteenä, ei kahtena erillisenä kirjaimena — kieli painuu litteänä kitalakea vasten koko suun leveydeltä, ei vain kärjellä niin kuin suomen l:ssä. EI äännetä "gli" kuten kirjoitettuna (esim. ei "g-l-i" erikseen).

Esimerkkejä: fi**gli**o (poika), fami**gli**a (perhe), **gli** (hänelle/heille-pronomini).

## "gn" — palataalinen n-äänne
"gn" äännetään suunnilleen kuin suomen "nj" yhtenä äänteenä — vastaa espanjan "ñ":ää tai ranskan "gn":ää (esim. "champagne"). Kielen keskiosa nousee kitalakea vasten.

Esimerkkejä: ba**gn**o (kylpyhuone), so**gn**o (uni), lasa**gn**e (lasagne — huomaa myös painotus, ks. erillinen aihe).

## Käytännön vinkki
Molemmat äänteet syntyvät kielen KESKELTÄ/etuosasta kitalakea vasten, laajalta alueelta — ei pelkällä kärjellä niin kuin suomen l/n. Harjoittele hidastamalla sanaa ja tuntemalla missä kieli koskettaa suulakea.

## Esimerkkejä
| Italia | Suomi |
|---|---|
| famiglia | perhe |
| figlio | poika |
| bagno | kylpyhuone |
| sogno | uni |`,
  },
  {
    slug: "tuplakonsonantit",
    title: "Tuplakonsonantit",
    category: "ääntäminen",
    tags: ["tuplakonsonantti", "geminaatta", "ääntäminen", "kaksoiskonsonantti"],
    bodyMd: `## Mikä se on
Italiassa konsonantin kesto muuttaa sanan merkitystä — tuplakonsonantti (esim. "ff", "tt", "nn") äännetään SELVÄSTI pidempänä kuin yksittäinen konsonantti. Tämä on suomalaiselle periaatteessa tuttu ilmiö (suomessakin on esim. "tuli"/"tulli"), mutta italiassa ero on vielä hienovaraisempi ja esiintyy useammin.

## Milloin tämä on tärkeää
Tuplakonsonantti VOI muuttaa sanan merkityksen kokonaan toiseksi:
- **caffè** (kahvi, ff pitkä) muistuttaa kirjoitusasultaan sanaa "café" muissa kielissä, mutta ääntämys on nimenomaan pitkä ff
- **fatto** (tehty, tt pitkä) vs. **fato** (kohtalo, t lyhyt)
- **sonno** (uni/nukkuminen, nn pitkä) vs. **sono** (olen/he ovat, n lyhyt)

## Käytännön vinkki
Kun näet tuplakonsonantin, pidennä sitä selvästi ääntäessäsi — ikään kuin pysähtyisit hetkeksi konsonantin kohdalla ennen kuin jatkat. Tämä pätee erityisesti keskellä sanaa oleviin tuplakonsonantteihin.

## Esimerkkejä
| Italia | Suomi | Huomio |
|---|---|---|
| fatto | tehty | tt pitkä |
| fato | kohtalo | t lyhyt — vertaa yllä olevaan |
| sonno | uni | nn pitkä |
| sono | olen / he ovat | n lyhyt — vertaa yllä olevaan |
| caffè | kahvi | ff pitkä + paino viimeisellä tavulla |`,
  },
  {
    slug: "presente-indicativo",
    title: "Presente indicativo",
    category: "aikamuodot",
    tags: ["presente", "presente indicativo", "preesens", "verbikonjugaatio"],
    bodyMd: `## Mikä se on
Presente indicativo on suomen preesensiä vastaava aikamuoto: sillä kerrotaan nykyhetken tekemisistä, toistuvista tai yleispätevistä asioista, ja usein myös lähitulevaisuudesta ("Domani parto per Roma" = "Huomenna lähden Roomaan").

## Muodostus
Italian verbit jaetaan kolmeen ryhmään infinitiivin päätteen mukaan (-are, -ere, -ire), ja jokaisella ryhmällä on omat persoonapäätteensä.

**-are-verbit** (esim. parlare, puhua): parlo, parli, parla, parliamo, parlate, parlano

**-ere-verbit** (esim. credere, uskoa): credo, credi, crede, crediamo, credete, credono

**-ire-verbit** (esim. dormire, nukkua): dormo, dormi, dorme, dormiamo, dormite, dormono

## Poikkeukset
Monilla -ire-verbeillä esiintyy infiksi **-isc-** yksikön 1.–3. persoonassa ja monikon 3. persoonassa (mutta ei monikon 1.–2. persoonassa). Esimerkiksi capire (ymmärtää): capisco, capisci, capisce, capiamo, capite, capiscono.

Lisäksi tärkeimmät epäsäännölliset verbit on opeteltava ulkoa:
- **essere** (olla): sono, sei, è, siamo, siete, sono
- **avere** (olla omistavana): ho, hai, ha, abbiamo, avete, hanno
- **andare** (mennä): vado, vai, va, andiamo, andate, vanno
- **fare** (tehdä): faccio, fai, fa, facciamo, fate, fanno

## Esimerkkejä
| Italia | Suomi |
|---|---|
| Parlo italiano. | Puhun italiaa. |
| Capisci la lezione? | Ymmärrätkö oppitunnin? |
| Sono stanco. | Olen väsynyt. |
| Domani vado a Roma. | Huomenna menen Roomaan. |`,
  },
  {
    slug: "imperfetto",
    title: "Imperfetto",
    category: "aikamuodot",
    tags: ["imperfetto", "menneisyys", "passato prossimo ero", "kuvaileva menneisyys"],
    bodyMd: `## Mikä se on
Imperfetto on toinen italian keskeisistä menneen ajan aikamuodoista passato prossimon rinnalla. Siinä missä passato prossimo kertoo yksittäisestä, päättyneestä tapahtumasta, imperfetto kuvaa menneisyyden TAUSTATILANNETTA, TOISTUVAA TAPAA tai jotain, mikä oli käynnissä — ilman selvää alkua tai loppua. Tämä ero on suomalaiselle oppijalle yksi klassisimmista sekaannuskohdista, koska suomen kielessä molemmat kääntyvät usein samalla imperfektimuodolla ("tein", "pelasin").

## Muodostus
- **-are-verbit**: -avo, -avi, -ava, -avamo, -avate, -avano
- **-ere-verbit**: -evo, -evi, -eva, -evamo, -evate, -evano
- **-ire-verbit**: -ivo, -ivi, -iva, -ivamo, -ivate, -ivano

## Poikkeukset
**essere** (olla) on epäsäännöllinen: ero, eri, era, eravamo, eravate, erano.

## Ero passato prossimoon
Vertaa näitä kahta lausetta:
- **"Da bambino giocavo sempre fuori."** (imperfetto) — "Lapsena leikin aina ulkona." Tämä kuvaa TOISTUVAA tapaa, ei yksittäistä kertaa.
- **"Ieri ho giocato a calcio."** (passato prossimo) — "Eilen pelasin jalkapalloa." Tämä on YKSITTÄINEN, päättynyt tapahtuma tiettynä ajankohtana.

Nyrkkisääntö: jos kyse on toistuvasta tavasta, kuvailusta tai taustalla käynnissä olevasta tilanteesta ("oli", "teki silloin tällöin"), käytä imperfettoa. Jos kyse on yksittäisestä, rajatusta tapahtumasta, käytä passato prossimoa.

## Esimerkkejä
| Italia | Suomi |
|---|---|
| Da bambino giocavo sempre fuori. | Lapsena leikin aina ulkona. |
| Ieri ho giocato a calcio. | Eilen pelasin jalkapalloa. |
| Mentre studiavo, squillava il telefono. | Kun opiskelin, puhelin soi. |
| Ero stanco tutti i giorni quella settimana. | Olin väsynyt joka päivä sinä viikkona. |`,
  },
  {
    slug: "futuro-semplice",
    title: "Futuro semplice",
    category: "aikamuodot",
    tags: ["futuro semplice", "tulevaisuus", "futuuri"],
    bodyMd: `## Mikä se on
Futuro semplice on italian yksinkertainen tulevan ajan muoto, joka vastaa suomen "teen" tai "tulen tekemään" -tyyppisiä tulevaisuuden ilmauksia.

## Muodostus
Futuro semplice muodostetaan infinitiivivartalosta (-are-verbeillä a-kirjain muuttuu e:ksi) ja päätteistä **-ò, -ai, -à, -emo, -ete, -anno**.

Esimerkki: parlare → parlerò, parlerai, parlerà, parleremo, parlerete, parleranno

## Poikkeukset
Monilla yleisillä verbeillä on epäsäännöllinen vartalo, johon samat päätteet liitetään:
- essere → sarò
- avere → avrò
- andare → andrò
- fare → farò
- venire → verrò
- potere → potrò
- dovere → dovrò
- volere → vorrò

## Muu käyttötarkoitus
Futuro semplicea käytetään myös ilmaisemaan OLETUSTA tai TODENNÄKÖISYYTTÄ nykyhetkessä, vaikka kyse ei ole varsinaisesta tulevaisuudesta: **"Sarà mezzanotte."** ("Lienee keskiyö." / "Kai kello on jo keskiyö.")

## Esimerkkejä
| Italia | Suomi |
|---|---|
| Domani parlerò con lei. | Huomenna puhun hänen kanssaan. |
| Sarò a casa alle otto. | Olen kotona kello kahdeksan. |
| Verranno anche loro. | Hekin tulevat. |
| Sarà mezzanotte. | Lienee keskiyö. |`,
  },
  {
    slug: "condizionale-presente",
    title: "Condizionale presente",
    category: "aikamuodot",
    tags: ["condizionale", "vorrei", "kohteliaisuus", "konditionaali"],
    bodyMd: `## Mikä se on
Condizionale presente vastaa suomen konditionaalia ("-isi"-muoto). Sitä käytetään erityisesti kohteliaissa pyynnöissä ja toiveissa ("vorrei" = "haluaisin") sekä hypoteettisissa lauseissa.

## Muodostus
Condizionale presente muodostetaan SAMASTA vartalosta kuin futuro semplice, mutta päätteet ovat **-ei, -esti, -ebbe, -emmo, -este, -ebbero**.

Koska vartalo on sama kuin futurossa, myös epäsäännölliset vartalot ovat samat:
- volere → vorrei (haluaisin)
- potere → potrei (voisin)
- dovere → dovrei (pitäisi minun)
- essere → sarei (olisin)

## Esimerkkejä
| Italia | Suomi |
|---|---|
| Vorrei un caffè, per favore. | Haluaisin kahvin, kiitos. |
| Potresti aiutarmi? | Voisitko auttaa minua? |
| Dovresti studiare di più. | Sinun pitäisi opiskella enemmän. |
| Sarei felice di venire. | Olisin iloinen tullessani. |`,
  },
  {
    slug: "imperativo",
    title: "Imperativo",
    category: "aikamuodot",
    tags: ["imperativo", "käskymuoto", "imperatiivi"],
    bodyMd: `## Mikä se on
Imperativo on italian käskymuoto, jota käytetään käskyihin, pyyntöihin ja ohjeisiin — esimerkiksi "Puhu!", "Odota!" tai "Mennään!".

## Muodostus
Tu-, noi- ja voi-muodot ovat pääosin SAMAT kuin presente indicativossa, PAITSI -are-verbien tu-muoto, joka päättyy -a:han eikä -i:hin: **"Parla!"** (ei "Parli!"). Sen sijaan -ere- ja -ire-verbien tu-muoto imperativossa on sama kuin preesensissä (esim. "Prendi!", "Dormi!").

Kielteinen tu-muoto muodostetaan aina rakenteella **non + infinitiivi**, ei kieltämällä käskymuotoa suoraan: **"Non parlare!"** ("Älä puhu!")

Kohteliaisuusmuoto (Lei-muoto) ei käytä varsinaista imperativoa, vaan lainaa muodon konjunktiivista (congiuntivo) — tätä ei tarvitse tässä yhteydessä selittää tarkemmin, riittää tietää että kohtelias käskymuoto poikkeaa tu-muodosta.

## Poikkeukset
Joillakin yleisillä verbeillä on lyhennetty tu-muoto:
- andare → vai / va'
- fare → fai / fa'
- dire → di'
- essere → sii
- avere → abbi

## Esimerkkejä
| Italia | Suomi |
|---|---|
| Parla più piano! | Puhu hitaammin! |
| Non parlare così forte! | Älä puhu niin kovaa! |
| Vai a casa! | Mene kotiin! |
| Sii gentile! | Ole ystävällinen! |`,
  },
  {
    slug: "trapassato-prossimo",
    title: "Trapassato prossimo",
    category: "aikamuodot",
    tags: ["trapassato prossimo", "pluskvamperfekti", "menneisyys"],
    bodyMd: `## Mikä se on
Trapassato prossimo vastaa suomen pluskvamperfektiä ("olin tehnyt"). Sitä käytetään kertomaan tapahtumasta, joka oli ehtinyt tapahtua ENNEN jotain toista menneisyyden tapahtumaa — eli kahden menneen tapahtuman keskinäistä aikajärjestystä.

## Muodostus
Trapassato prossimo muodostetaan apuverbistä **avere** tai **essere** IMPERFEKTISSÄ + pääverbin partisiippi (participio passato): esim. **avevo mangiato** (olin syönyt), **ero andato/andata** (olin mennyt).

Sama sääntö apuverbin valinnasta ja partisiipin taipumisesta pätee kuin passato prossimossa: essere-verbien partisiippi taipuu tekijän suvun ja luvun mukaan.

## Esimerkkejä
| Italia | Suomi |
|---|---|
| Quando sono arrivato, lei era già partita. | Kun saavuin, hän oli jo lähtenyt. |
| Avevo già mangiato quando mi hai chiamato. | Olin jo syönyt kun soitit minulle. |
| Non avevo mai visto un film così bello. | En ollut koskaan nähnyt niin kaunista elokuvaa. |`,
  },
  {
    slug: "pronomi-diretti",
    title: "Pronomi diretti (suorat objektipronominit)",
    category: "pronominit",
    tags: ["pronomi diretti", "suora objektipronomini", "mi ti lo la"],
    bodyMd: `## Mikä se on
Suorat objektipronominit (pronomi diretti) korvaavat suoran objektin, eli ne vastaavat kysymykseen "kenet?" tai "mitä?".

## Muodostus
| Pronomini | Suomi |
|---|---|
| mi | minut |
| ti | sinut |
| lo | hänet/sen (maskuliini) |
| la | hänet/sen (feminiini) |
| ci | meidät |
| vi | teidät |
| li | heidät/ne (maskuliini, monikko) |
| le | heidät/ne (feminiini, monikko) |

Pronomini sijoitetaan yleensä ENNEN verbiä: **"Lo vedo"** ("Näen hänet/sen"). Infinitiivin kanssa pronomini liitetään sen sijaan verbin PERÄÄN yhteen sanaan: **"voglio vederlo"** ("haluan nähdä hänet/sen").

## Poikkeukset
Passato prossimossa partisiippi TAIPUU lo/la/li/le-pronominin suvun ja luvun mukaan: **"L'ho vista"** ("Näin hänet", puhuttaessa naisesta) — huomaa myös "la" supistuu "l'":ksi vokaalin edellä.

## Esimerkkejä
| Italia | Suomi |
|---|---|
| Lo vedo ogni giorno. | Näen hänet/sen joka päivä. |
| Voglio vederlo domani. | Haluan nähdä hänet huomenna. |
| L'ho vista ieri. | Näin hänet (naisen) eilen. |
| Li ho comprati al mercato. | Ostin ne (maskuliini, monikko) torilta. |`,
  },
  {
    slug: "pronomi-possessivi",
    title: "Pronomi possessivit (omistuspronominit)",
    category: "pronominit",
    tags: ["pronomi possessivi", "omistuspronomini", "il mio la mia"],
    bodyMd: `## Mikä se on
Omistuspronominit (pronomi possessivi) ilmaisevat omistussuhdetta, kuten suomen "minun", "sinun", "hänen". Toisin kuin suomessa, italian omistuspronominit taipuvat suvun ja luvun mukaan omistetun asian, ei omistajan, mukaan.

## Muodostus
| Pronomini | Suomi |
|---|---|
| il mio / la mia | minun |
| il tuo / la tua | sinun |
| il suo / la sua | hänen |
| il nostro / la nostra | meidän |
| il vostro / la vostra | teidän |
| il loro / la loro | heidän |

## Poikkeukset
Omistuspronominin edessä on YLEENSÄ artikkeli, PAITSI kun puhutaan lähisukulaisista YKSIKÖSSÄ ilman muuta määrettä: **"mia madre"** ("äitini"), ei "la mia madre". Jos sukulaisnimeen liittyy lisämäärite (esim. adjektiivi), artikkeli PALAA takaisin: **"la mia sorella maggiore"** ("vanhempi sisareni").

## Esimerkkejä
| Italia | Suomi |
|---|---|
| Il mio libro è qui. | Minun kirjani on täällä. |
| Mia madre lavora a Roma. | Äitini työskentelee Roomassa. |
| La mia sorella maggiore studia medicina. | Vanhempi sisareni opiskelee lääketiedettä. |
| Il loro appartamento è grande. | Heidän asuntonsa on iso. |`,
  },
  {
    slug: "ci-ne",
    title: '"Ci" ja "ne"',
    category: "pronominit",
    tags: ["ci", "ne", "partikkelipronomini"],
    bodyMd: `## Mikä se on
"ci" ja "ne" ovat italian partikkelipronomineja, joilla ei ole suoraa yhden sanan vastinetta suomessa — siksi ne koetaan usein hankaliksi. Molemmat korvaavat kokonaisia rakenteita edellisestä puheesta tai tekstistä.

## Muodostus
**"ci"** korvaa rakenteen **"a/in + paikka"**: "Vai a Roma? Sì, **ci** vado." ("Menetkö Roomaan? Kyllä, menen sinne.")

**"ne"** korvaa rakenteen **"di + asia/määrä"**: "Quanti libri hai? **Ne** ho tre." ("Montako kirjaa sinulla on? Minulla on niitä kolme.")

## Poikkeukset
Näitä pidetään tyypillisesti hankalina juuri siksi, ettei suomessa ole vastaavaa yhden sanan pronominia — suomeksi käännös vaatii usein sanan "sinne" tai "niitä", jotka eivät suoraan vastaa italian rakennetta sanasta sanaan.

## Esimerkkejä
| Italia | Suomi |
|---|---|
| Vai a Roma? Sì, ci vado. | Menetkö Roomaan? Kyllä, menen sinne. |
| Quanti libri hai? Ne ho tre. | Montako kirjaa sinulla on? Minulla on niitä kolme. |
| Ci penso io. | Minä hoidan sen (kirj. "ajattelen sitä"). |
| Ne parliamo domani. | Puhumme siitä huomenna. |`,
  },
  {
    slug: "pronomi-riflessivi",
    title: "Pronomi riflessivit (refleksiiviverbit)",
    category: "pronominit",
    tags: ["pronomi riflessivi", "refleksiiviverbi", "alzarsi"],
    bodyMd: `## Mikä se on
Refleksiiviverbit (verbi riflessivi) kuvaavat tekoja, jotka kohdistuvat tekijään itseensä — esimerkiksi peseytyminen, herääminen tai pukeutuminen. Näiden kanssa käytetään refleksiivipronomineja.

## Muodostus
Refleksiivipronominit ovat: **mi, ti, si, ci, vi, si**.

Esimerkki verbistä **alzarsi** (nousta ylös): mi alzo, ti alzi, si alza, ci alziamo, vi alzate, si alzano.

## Poikkeukset
Passato prossimossa refleksiiviverbit käyttävät AINA apuverbiä **essere**, ei koskaan avere — ja partisiippi taipuu tekijän suvun/luvun mukaan: **"Mi sono alzato alle 7."** ("Nousin ylös kello 7.", mies puhujana; naisella "alzata").

## Esimerkkejä
| Italia | Suomi |
|---|---|
| Mi alzo alle sette ogni giorno. | Nousen ylös kello seitsemän joka päivä. |
| Mi sono alzato alle 7. | Nousin ylös kello 7. |
| Si veste velocemente. | Hän pukeutuu nopeasti. |
| Ci laviamo prima di cena. | Peseydymme ennen illallista. |`,
  },
  {
    slug: "artikkelit",
    title: "Määräiset ja epämääräiset artikkelit",
    category: "säännöt",
    tags: ["articolo", "artikkeli", "il lo la", "un uno una", "gli"],
    bodyMd: `## Mikä se on
Italiassa jokaisella substantiivilla on lähes aina edessään artikkeli, joka kertoo suvun ja luvun sekä sen, puhutaanko jostain tietystä (määräinen) vai jostain yleisestä (epämääräinen) asiasta. Suomessa artikkeleita ei ole lainkaan, joten niiden käyttö pitää opetella kokonaan uutena ilmiönä.

## Muodostus
Määräiset artikkelit yksikössä ovat **il / lo / la**, monikossa **i / gli / le**. Epämääräiset artikkelit ovat **un / uno / una**.

Valinta il/lo (ja i/gli, un/uno) välillä ei riipu vain suvusta, vaan myös seuraavan sanan ALKUÄÄNTEESTÄ:
- **lo** / **gli** / **uno** käytetään kun seuraava sana alkaa s+konsonantilla (esim. **studente**), z:lla, gn:llä, ps:llä, x:llä, tai puolivokaalilla y/i+vokaali (esim. **yogurt**, **iena**)
- muissa tapauksissa käytetään **il** / **i** / **un**

## Esimerkkejä
| Italia | Suomi |
|---|---|
| lo studente / gli studenti | opiskelija / opiskelijat |
| uno zaino | reppu |
| il libro / i libri | kirja / kirjat |
| la casa / le case | talo / talot |
| un cane | koira |
| una mela | omena |`,
  },
  {
    slug: "prepositiot-artikoloidut",
    title: "Prepositiot ja artikkeloidut prepositiot",
    category: "säännöt",
    tags: ["preposizioni", "prepositiot", "preposizioni articolate", "del al nel sul", "artikkeloidut prepositiot"],
    bodyMd: `## Mikä se on
Italian perusprepositioita ovat **di, a, da, in, su, con, per, tra/fra**. Kun näistä preposition jälkeen tulee määräinen artikkeli (il, lo, la, i, gli, le), preposition ja artikkelin sana YHDISTYY yhdeksi sanaksi — näitä kutsutaan nimellä preposizioni articolate.

## Muodostus
| + il | + lo | + la | + i | + gli | + le |
|---|---|---|---|---|---|
| **di**: del | dello | della | dei | degli | delle |
| **a**: al | allo | alla | ai | agli | alle |
| **da**: dal | dallo | dalla | dai | dagli | dalle |
| **in**: nel | nello | nella | nei | negli | nelle |
| **su**: sul | sullo | sulla | sui | sugli | sulle |

Yhdistäminen noudattaa samaa logiikkaa kaikilla viidellä prepositiolla: artikkelin alkuosa (l-, ll-, gl- jne.) sulautuu preposition perään. "Con" ja "per" yhdistyvät harvemmin ja vain valinnaisesti, joten niitä ei tarvitse taulukoida yhtä tarkasti.

## Esimerkkejä
| Italia | Suomi |
|---|---|
| Vado al cinema. | Menen elokuviin. |
| Il libro della ragazza. | Tytön kirja. |
| Sono nel giardino. | Olen puutarhassa. |
| Torno dal lavoro alle sei. | Palaan töistä kello kuusi. |`,
  },
  {
    slug: "monikko",
    title: "Substantiivien monikon muodostus",
    category: "säännöt",
    tags: ["plurale", "monikko", "monikon muodostus"],
    bodyMd: `## Mikä se on
Italian substantiivien monikko muodostetaan muuttamalla sanan loppuvokaalia, ei lisäämällä päätettä niin kuin suomessa. Loppuvokaali kertoo sekä suvun että luvun.

## Muodostus
Perussääntö on:
- maskuliini **-o → -i** (esim. libro → libri)
- feminiini **-a → -e** (esim. casa → case)
- molemmat suvut **-e → -i** (esim. maskuliini "fiore" → fiori, feminiini "chiave" → chiavi)

## Poikkeukset
**-co**- ja **-go**-loppuiset sanat vaihtelevat monikossa epäsäännöllisesti: esimerkiksi "amico" monikossa on "amici", mutta "banco" monikossa on "banchi". Tässä on todellista vaihtelua kielenkäytössä, eikä mikään sääntö toimi täysin luotettavasti — sanan paino auttaa usein arvaamaan oikean muodon, mutta ei aina, joten yksittäiset sanat on syytä opetella tapauskohtaisesti.

Kokonaan MUUTTUMATTOMIA monikossa ovat:
- sanat, joissa on painollinen loppuvokaali/aksentti, esim. città, caffè
- lyhennetyt sanat, esim. foto, moto, bici, auto
- monet vieraskieliset lainasanat, esim. bar, sport, film

## Esimerkkejä
| Italia | Suomi |
|---|---|
| libro → libri | kirja → kirjat |
| casa → case | talo → talot |
| amico → amici | ystävä → ystävät |
| banco → banchi | penkki/pankki → penkit/pankit |
| città → città | kaupunki → kaupungit (ei muutu) |
| foto → foto | valokuva → valokuvat (ei muutu) |`,
  },
  {
    slug: "adjektiivit-taipuminen",
    title: "Adjektiivien taipuminen ja sijainti",
    category: "säännöt",
    tags: ["aggettivi", "adjektiivi", "adjektiivin sijainti", "grande vecchio bello"],
    bodyMd: `## Mikä se on
Italian adjektiivit taipuvat suvun ja luvun mukaan yhdenmukaisesti sen substantiivin kanssa, jota ne kuvaavat — aivan toisin kuin suomessa, jossa adjektiivi taipuu vain sijamuodossa.

## Muodostus
Esimerkiksi adjektiivi "alto" (pitkä) taipuu näin: **ragazzo alto** (pitkä poika, yks. mask.), **ragazza alta** (pitkä tyttö, yks. fem.), **ragazzi alti** (pitkiä poikia, mon. mask.), **ragazze alte** (pitkiä tyttöjä, mon. fem.).

## Sijainti
Adjektiivi sijoitetaan yleensä substantiivin JÄLKEEN, esim. **"una casa grande"** ("iso talo"). Kuitenkin jotkin hyvin yleiset ja lyhyet adjektiivit sijoitetaan usein ENNEN substantiivia: **bello, buono, grande, nuovo, vecchio, giovane, piccolo**.

## Poikkeukset
Sijainti voi jopa muuttaa adjektiivin merkitystä:
- **"un uomo grande"** = fyysisesti iso mies, mutta **"un grande uomo"** = suuri/merkittävä mies
- **"una vecchia amica"** = pitkäaikainen ystävä, mutta **"un'amica vecchia"** = iäkäs ystävä

## Esimerkkejä
| Italia | Suomi |
|---|---|
| Il ragazzo è alto. | Poika on pitkä. |
| Una casa grande. | Iso talo. |
| Un uomo grande. | Fyysisesti iso mies. |
| Un grande uomo. | Suuri/merkittävä mies. |
| Una vecchia amica. | Pitkäaikainen ystävä. |
| Un'amica vecchia. | Iäkäs ystävä. |`,
  },
  {
    slug: "komparatiivi-superlatiivi",
    title: "Komparatiivi ja superlatiivi",
    category: "säännöt",
    tags: ["comparativo", "superlativo", "komparatiivi", "superlatiivi", "più meno"],
    bodyMd: `## Mikä se on
Komparatiivilla vertaillaan kahta asiaa keskenään ("enemmän/vähemmän kuin"), ja superlatiivilla ilmaistaan jonkin olevan ääripäässä joko suhteessa muihin tai yleisesti erittäin voimakkaana.

## Muodostus
**Komparatiivi**: **più...di** (enemmän kuin) tai **meno...di** (vähemmän kuin). Esimerkiksi: "Marco è più alto di Luca." (Marco on pidempi kuin Luca.)

**Superlatiivi relatiivinen** (paras/vähiten jossain joukossa): **il/la più...** tai **il/la meno...**, esim. "È il più alto della classe." (Hän on luokan pisin.)

**Superlatiivi absoluuttinen** (erittäin/hyvin): muodostetaan päätteellä **-issimo/-issima**, esim. bello → bellissimo (erittäin kaunis), facile → facilissimo (todella helppo).

## Poikkeukset
Joillakin adjektiiveilla on epäsäännöllinen komparatiivimuoto:
- buono → **migliore** (parempi)
- cattivo → **peggiore** (huonompi)
- grande → **maggiore** (valinnainen, käytetään erityisesti iän tai tärkeyden yhteydessä)
- piccolo → **minore** (valinnainen)

## Esimerkkejä
| Italia | Suomi |
|---|---|
| Marco è più alto di Luca. | Marco on pidempi kuin Luca. |
| È il più alto della classe. | Hän on luokan pisin. |
| Questa torta è bellissima. | Tämä kakku on erittäin kaunis. |
| Questo vino è migliore di quello. | Tämä viini on parempi kuin tuo. |`,
  },
  {
    slug: "ce-ci-sono",
    title: "C'è / Ci sono",
    category: "säännöt",
    tags: ["c'è", "ci sono", "on olemassa"],
    bodyMd: `## Mikä se on
"C'è" ja "ci sono" ovat rakenteita, jotka vastaavat suomen "on"/"on olemassa" -ilmausta silloin, kun kerrotaan jonkin olemassaolosta tai läsnäolosta jossain paikassa.

## Muodostus
Yksikössä käytetään muotoa **c'è**, esim. "C'è un problema." ("On ongelma.") Monikossa käytetään muotoa **ci sono**, esim. "Ci sono molte persone." ("On paljon ihmisiä.")

## Poikkeukset
Kielteinen muoto muodostetaan yksinkertaisesti lisäämällä "non" eteen: **non c'è** / **non ci sono**, esim. "Non c'è tempo." ("Ei ole aikaa.")

## Esimerkkejä
| Italia | Suomi |
|---|---|
| C'è un problema. | On ongelma. |
| Ci sono molte persone. | On paljon ihmisiä. |
| Non c'è tempo. | Ei ole aikaa. |
| Non ci sono più biglietti. | Lippuja ei ole enää. |`,
  },
  {
    slug: "negaatio",
    title: "Negaatio (kieltolauseet)",
    category: "säännöt",
    tags: ["negazione", "negaatio", "kieltolause", "non niente mai nessuno", "kaksoiskielto"],
    bodyMd: `## Mikä se on
Italian kieltolauseen perusrakenne on yksinkertainen: **non** sijoitetaan ennen verbiä, esim. "Non parlo francese." ("En puhu ranskaa.")

## Muodostus
Perusnegaatio: **non + verbi**.

## Poikkeukset
Italiassa käytetään monissa yhteyksissä KAKSOISKIELTOA, toisin kuin suomessa tai englannissa — tämä on tärkeä ja usein yllättävä huomio suomalaiselle oppijalle, koska suomessa kaksoiskielto tekisi lauseesta myöntävän. Italiassa sen sijaan kaksoiskielto on täysin normaali ja pakollinen rakenne:
- **non...niente** (ei mitään)
- **non...mai** (ei koskaan)
- **non...nessuno** (ei kukaan)
- **non...più** (ei enää)

## Esimerkkejä
| Italia | Suomi |
|---|---|
| Non ho niente da dire. | Minulla ei ole mitään sanottavaa. |
| Non vado mai al cinema. | En koskaan mene elokuviin. |
| Non conosco nessuno qui. | En tunne täällä ketään. |
| Non fumo più. | En polta enää. |`,
  },
  {
    slug: "c-g-aanteet",
    title: '"C" ja "G": pehmeät ja kovat äänteet',
    category: "ääntäminen",
    tags: ["c", "g", "ce ci", "ge gi", "che chi", "ääntäminen", "pehmeä kova äänne"],
    bodyMd: `## Mikä se on
Kirjaimet "c" ja "g" äännetään italiassa eri tavalla riippuen siitä, mikä kirjain seuraa niitä — sama kirjain voi siis edustaa kahta täysin eri äännettä. Tämä on suomalaiselle klassinen ääntämishaaste, koska suomen kielessä kirjaimen ääntäminen ei koskaan riipu seuraavasta vokaalista tällä tavalla.

## Muodostus
**"c"**: ca/co/cu äännetään KOVANA k-äänteenä (esim. casa, cosa, cuore). ce/ci äännetään sen sijaan PEHMEÄNÄ "tš"-äänteenä, kuten englannin "ch" sanassa "cheese" (esim. cena, cinema).

**"g"**: ga/go/gu äännetään KOVANA g-äänteenä (esim. gatto, governo, guanto). ge/gi äännetään PEHMEÄNÄ "dž"-äänteenä, kuten englannin "j" sanassa "jam" (esim. gelato, giorno).

## Poikkeukset
Kirjain **"h"** PEHMENTÄÄ säännön takaisin kovaksi e/i:n edellä: **che/chi** äännetään kovana k-äänteenä (esim. "che" äännetään "ke", "chiesa" äännetään "kjeesa"), ja **ghe/ghi** äännetään kovana g-äänteenä (esim. "spaghetti").

Kirjain **"i"** puolestaan ilman omaa ääntämystä pehmentää a/o/u:n edellä: **cia/cio/ciu** ja **gia/gio/giu** äännetään pehmeästi ilman erillistä i-äännettä (esim. "arancia" äännetään suunnilleen "arantsha", ei "arantshia").

## Esimerkkejä
| Italia | Suomi | Huomio |
|---|---|---|
| casa | talo | kova k-äänne (ca) |
| cena | illallinen | pehmeä "tš"-äänne (ce) |
| gatto | kissa | kova g-äänne (ga) |
| giorno | päivä | pehmeä "dž"-äänne (gi) |
| chiesa | kirkko | kova k-äänne h:n ansiosta (chi) |
| spaghetti | spagetti | kova g-äänne h:n ansiosta (ghe) |
| arancia | appelsiini | pehmeä, ei erillistä i-äännettä (cia) |`,
  },
];
