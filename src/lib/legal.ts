// Pravne stranice (odluka V 11. 11. 2026): uslovi korišćenja, politika privatnosti i kolačića.
// Tekst opisuje kako sajt stvarno radi u MVP-u (dogovor porukama, bez plaćanja preko Sajma).
// Pre lansiranja ga treba dopuniti podacima o firmi i dati pravniku na pregled.

export type LegalDoc = {
  slug: string;
  title: string;
  updated: string;
  intro: string;
  sections: Array<{ heading: string; paragraphs: string[] }>;
};

const UPDATED = "11. 11. 2026.";

export const LEGAL_DOCS: LegalDoc[] = [
  {
    slug: "uslovi-koriscenja",
    title: "Uslovi korišćenja",
    updated: UPDATED,
    intro:
      "Ovi uslovi važe za svakog ko koristi Sajam, bilo da kupuje, prodaje ili samo razgleda oglase. Korišćenjem sajta prihvataš ove uslove.",
    sections: [
      {
        heading: "Šta je Sajam",
        paragraphs: [
          "Sajam je mesto na kom ljudi objavljuju oglase za polovne i nove knjige, muziku, igre, mange, stripove i opremu, i dogovaraju kupovinu porukama.",
          "Sajam nije prodavac proizvoda iz oglasa i ne učestvuje u kupovini. Kupoprodajni dogovor nastaje direktno između kupca i prodavca, koji se sami dogovaraju o ceni, slanju i načinu plaćanja.",
        ],
      },
      {
        heading: "Nalog",
        paragraphs: [
          "Za objavu oglasa, poruke i ocene potreban je nalog. Jedan nalog služi i za kupovinu i za prodaju.",
          "Odgovoran si za tačnost podataka na nalogu i za sve što se radi preko njega. Lozinku čuvaj za sebe, a ako primetiš da neko drugi koristi tvoj nalog, javi nam se odmah.",
          "Nalog možeš da otvoriš ako imaš najmanje 16 godina. Mlađi mogu da koriste Sajam uz saglasnost roditelja ili staratelja.",
        ],
      },
      {
        heading: "Oglasi",
        paragraphs: [
          "Objava oglasa je trenutno besplatna. Oglas mora da opisuje stvaran proizvod koji imaš i možeš da prodaš, sa tačnim stanjem, cenom i fotografijama proizvoda.",
          "Nije dozvoljeno objavljivati piratske kopije, falsifikate, ukradene stvari, proizvode čija je prodaja zabranjena zakonom, kao ni oglase koji ne nude proizvod (reklame, prikupljanje kontakata i slično).",
          "Objavom oglasa nam daješ dozvolu da tekst i fotografije oglasa prikazujemo na Sajmu i u njegovom predstavljanju, dok je oglas aktivan. Tekst i fotografije ostaju tvoji.",
        ],
      },
      {
        heading: "Kupovina i dogovor",
        paragraphs: [
          "Sajam ne garantuje za stanje, ispravnost ni opis proizvoda, niti za to da će kupac ili prodavac ispuniti dogovor. Pre kupovine postavi prodavcu sva pitanja koja su ti važna.",
          "Ako proizvod nije kao u opisu ili nešto pođe po zlu, rešenje se traži dogovorom kupca i prodavca. Kupci posle kupovine mogu da ocene prodavca.",
        ],
      },
      {
        heading: "Pravila ponašanja",
        paragraphs: [
          "Poštuj druge korisnike. Nisu dozvoljeni uvrede, pretnje, uznemiravanje, neželjene poruke, lažne ocene, prevare i pokušaji da se kupovina odvede na sumnjive stranice ili načine plaćanja.",
          "Oglase, poruke i naloge koji krše pravila možeš da nam prijaviš preko kontakt forme.",
        ],
      },
      {
        heading: "Mere koje Sajam može da preduzme",
        paragraphs: [
          "Ako neko krši ove uslove, možemo da uklonimo oglas, ocenu ili poruku, da privremeno ograničimo nalog ili da ga trajno blokiramo. Kad je moguće, javićemo ti razlog.",
        ],
      },
      {
        heading: "Odgovornost",
        paragraphs: [
          "Trudimo se da Sajam radi bez prekida i grešaka, ali to ne možemo da garantujemo. Sajam ne odgovara za štetu nastalu iz dogovora između korisnika, niti za sadržaj koji objavljuju korisnici.",
        ],
      },
      {
        heading: "Izmene uslova",
        paragraphs: [
          "Ove uslove možemo da menjamo kako se Sajam razvija. O važnim izmenama obaveštavamo unapred, na sajtu ili imejlom. Datum poslednje izmene piše na vrhu stranice.",
          "Na ove uslove primenjuje se pravo Republike Srbije. Pitanja o uslovima možeš da nam pošalješ preko kontakt forme.",
        ],
      },
    ],
  },
  {
    slug: "privatnost",
    title: "Politika privatnosti",
    updated: UPDATED,
    intro:
      "Ovde piše koje podatke o tebi Sajam čuva, zašto ih čuva i kako možeš da ih vidiš, ispraviš ili obrišeš. Podatke obrađujemo u skladu sa Zakonom o zaštiti podataka o ličnosti Republike Srbije.",
    sections: [
      {
        heading: "Koje podatke čuvamo",
        paragraphs: [
          "Podaci naloga: imejl adresa, ime koje prikazuješ, korisničko ime, a ako ih dodaš i grad, opis profila i profilna fotografija. Lozinka se čuva samo u šifrovanom obliku.",
          "Sadržaj koji objavljuješ: oglasi sa fotografijama, poruke koje razmeniš sa drugim korisnicima, ocene i recenzije, omiljeni proizvodi i obaveštenja.",
          "Kontakt forma: ime, prezime, imejl, poruka i ID oglasa, ako ga navedeš.",
          "Tehnički podaci: broj pregleda oglasa i glasovi za članke pomoći čuvaju se bez podataka o tome čiji je glas ili pregled.",
        ],
      },
      {
        heading: "Zašto ih koristimo",
        paragraphs: [
          "Da bi Sajam radio: da imaš nalog, da kupci vide tvoje oglase, da se poruke dostave sagovorniku i da se ocene prikažu na profilu.",
          "Da bismo odgovorili na tvoje zahteve i prijave, i da bismo sprečili prevare i zloupotrebe.",
          "Ako pri registraciji označiš da želiš ponude i novosti o Sajmu, šaljemo ih na tvoj imejl. Tu saglasnost možeš da povučeš bilo kad.",
          "Podatke ne prodajemo i ne delimo ih sa oglašivačima.",
        ],
      },
      {
        heading: "Ko još vidi podatke",
        paragraphs: [
          "Drugi korisnici vide tvoj javni profil (ime, korisničko ime, grad, opis, fotografiju i ocene) i tvoje oglase. Poruke vide samo učesnici razgovora.",
          "Sajam koristi pouzdane pružaoce usluga koji podatke čuvaju i obrađuju samo za nas: Supabase (baza podataka i fotografije, serveri u Frankfurtu, EU) i Vercel (prikaz sajta). Kada tražiš knjigu po naslovu ili ISBN-u, upit se šalje javnim bazama knjiga (Google Books, Open Library), bez podataka o tebi.",
          "Ako se prijaviš Google nalogom, od Google-a dobijamo samo tvoj imejl i ime.",
        ],
      },
      {
        heading: "Koliko dugo ih čuvamo",
        paragraphs: [
          "Podatke naloga čuvamo dok imaš nalog. Kad obrišeš nalog, brišemo podatke naloga i oglase, a ocene koje su ti drugi ostavili ostaju bez tvog imena.",
          "Zahteve iz kontakt forme čuvamo dok je to potrebno da ih rešimo.",
        ],
      },
      {
        heading: "Tvoja prava",
        paragraphs: [
          "Imaš pravo da saznaš koje podatke o tebi čuvamo, da ih ispraviš, da tražiš brisanje ili ograničenje obrade, da dobiješ svoje podatke i da uložiš prigovor. Većinu podataka možeš da izmeniš u podešavanjima profila.",
          "Za sve ostalo piši nam preko kontakt forme. Ako misliš da podatke ne obrađujemo pravilno, možeš da se obratiš Povereniku za informacije od javnog značaja i zaštitu podataka o ličnosti.",
        ],
      },
      {
        heading: "Izmene politike",
        paragraphs: [
          "Kad promenimo ovu politiku, novi datum piše na vrhu stranice, a o važnim izmenama obaveštavamo unapred.",
        ],
      },
    ],
  },
  {
    slug: "kolacici",
    title: "Politika kolačića",
    updated: UPDATED,
    intro:
      "Kolačići su male datoteke koje sajt čuva u tvom pregledaču. Sajam koristi samo one bez kojih sajt ne radi, bez kolačića za reklame i praćenje.",
    sections: [
      {
        heading: "Kolačići koje koristimo",
        paragraphs: [
          "Kolačići za prijavu (počinju sa sb-): pamte tvoju prijavu, da ne moraš da upisuješ lozinku na svakoj stranici. Brišu se kad se odjaviš ili kad sesija istekne.",
        ],
      },
      {
        heading: "Podaci u pregledaču",
        paragraphs: [
          "Osim kolačića, Sajam u pregledaču čuva i dve male oznake: da je glas za članak pomoći već dat, da se ne bi glasalo dvaput, i da je oglas već pogledan u ovoj poseti, da se pregled ne bi brojao više puta. Ove oznake se ne šalju nikome.",
        ],
      },
      {
        heading: "Kolačići za analitiku i reklame",
        paragraphs: [
          "Sajam ih trenutno ne koristi. Ako ih ikad uvedemo, pitaćemo te za saglasnost pre nego što se postave.",
        ],
      },
      {
        heading: "Kako da ih obrišeš",
        paragraphs: [
          "Kolačiće možeš da obrišeš ili blokiraš u podešavanjima pregledača. Ako blokiraš kolačiće za prijavu, nećeš moći da se prijaviš na Sajam.",
        ],
      },
    ],
  },
];

export function findLegal(slug: string) {
  return LEGAL_DOCS.find((d) => d.slug === slug);
}
