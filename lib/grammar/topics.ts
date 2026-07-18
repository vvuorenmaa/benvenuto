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
];
