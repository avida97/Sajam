// Sadržaj centra za pomoć. Raspored je iz Figme („Help Kupovina“ 783:18130, „Help Text“ 803:16345),
// a tekstovi su napisani za Sajam (MVP: dogovor kroz poruke, bez plaćanja kroz platformu, bez naknada).
// Primeri iz dizajna (Vinted, ponude, zaštita kupca) ne važe za Sajam, pa nisu preneti.

export type HelpSectionKey = "nalog" | "kupovina" | "prodaja";
export type HelpIcon = "torba" | "razgovor" | "kartica" | "kolica";

export type HelpArticle = {
  slug: string;
  title: string;
  intro: string;
  sections: Array<{ heading: string; paragraphs: string[] }>;
};

export type HelpTopic = { title: string; icon: HelpIcon; articles: HelpArticle[] };

export const HELP_SECTIONS: Array<{ key: HelpSectionKey; label: string }> = [
  { key: "nalog", label: "Moj nalog" },
  { key: "kupovina", label: "Kupovina" },
  { key: "prodaja", label: "Prodaja" },
];

export const HELP: Record<HelpSectionKey, HelpTopic[]> = {
  kupovina: [
    {
      title: "Pronalaženje proizvoda",
      icon: "torba",
      articles: [
        {
          slug: "trazenje-artikala",
          title: "Traženje proizvoda",
          intro:
            "Na Sajmu možeš da tražiš knjige, muziku, igre, mange i stripove i opremu. Pretraga gleda naslov, autora, izdavača i ISBN.",
          sections: [
            {
              heading: "Kako da pretražim",
              paragraphs: [
                "Upiši reč u polje za pretragu na vrhu stranice i pritisni Enter. Ne moraš da pišeš kvačice ni velika slova: „cica“ pronalazi i „Čiča“, a „djordje“ pronalazi i „Đorđe“.",
                "Za knjige možeš da upišeš i ISBN, sa crticama ili bez njih.",
              ],
            },
            {
              heading: "Kako da suzim rezultate",
              paragraphs: [
                "Na stranici rezultata izaberi kategoriju, pa filtere sa leve strane: stanje, jezik i grad. Rezultate možeš da poređaš po ceni, azbučno ili od najnovijih.",
              ],
            },
            {
              heading: "Pregledanje po kategorijama",
              paragraphs: [
                "Ako ne tražiš nešto određeno, otvori kategoriju iz menija (na primer Knjige) i izaberi potkategoriju i žanr.",
              ],
            },
          ],
        },
        {
          slug: "omiljeni-artikli",
          title: "Kako da sačuvam proizvod u omiljene",
          intro:
            "Klikni na srce na kartici proizvoda ili na stranici oglasa. Proizvod se čuva na tvojoj listi Omiljeno, do koje stižeš preko srca u gornjem meniju.",
          sections: [
            {
              heading: "Da li mi treba nalog",
              paragraphs: [
                "Da. Omiljeni proizvodi se čuvaju uz tvoj nalog, pa ih vidiš na svakom uređaju na kom se prijaviš.",
              ],
            },
            {
              heading: "Šta se dešava kad se proizvod proda",
              paragraphs: [
                "Proizvod ostaje na listi i dobija oznaku Rezervisano ili Prodato, da znaš da više nije dostupan. Uklanjaš ga ponovnim klikom na srce.",
              ],
            },
          ],
        },
      ],
    },
    {
      title: "Dogovor sa prodavcem",
      icon: "razgovor",
      articles: [
        {
          slug: "pisanje-prodavcu",
          title: "Kako da pišem prodavcu",
          intro:
            "Na Sajmu se kupovina dogovara porukama. Na stranici oglasa klikni Pitaj prodavca i otvoriće se razgovor o tom proizvodu.",
          sections: [
            {
              heading: "Šta da pitam",
              paragraphs: [
                "Dobro je pitati za stanje proizvoda, da li je još dostupan, kako prodavac šalje i kako želi da primi uplatu. Možeš da izabereš i neku od ponuđenih poruka.",
              ],
            },
            {
              heading: "Gde vidim odgovore",
              paragraphs: [
                "Svi razgovori su na stranici Poruke. Kad stigne nova poruka, pored tvoje slike u meniju pojavljuje se crveni broj.",
              ],
            },
          ],
        },
        {
          slug: "rezervisanje-artikla",
          title: "Rezervisanje proizvoda",
          intro:
            "Kad se dogovorite, prodavac označava oglas kao Rezervisano. Tako drugi kupci vide da je proizvod zauzet.",
          sections: [
            {
              heading: "Koliko traje rezervacija",
              paragraphs: [
                "Rezervacija traje dok prodavac ne označi oglas kao Prodato ili ga ne vrati na Dostupno. Ako dogovor propadne, javi prodavcu porukom.",
              ],
            },
          ],
        },
        {
          slug: "kupovina-vise-artikala",
          title: "Kupovina više proizvoda od jednog prodavca",
          intro:
            "Ako ti se kod istog prodavca sviđa više proizvoda, pitaj u poruci da li može da ih pošalje zajedno. Tako često plaćaš samo jednu poštarinu.",
          sections: [],
        },
        {
          slug: "ocenjivanje-prodavca",
          title: "Ocenjivanje prodavca",
          intro:
            "Kad prodavac označi da je proizvod prodat tebi, stiže ti obaveštenje sa pozivom za ocenu.",
          sections: [
            {
              heading: "Kako da ocenim",
              paragraphs: [
                "Otvori obaveštenje ili razgovor i klikni Oceni prodavca. Izaberi od jedne do pet zvezdica, označi šta ti se svidelo i po želji napiši komentar.",
                "Oceniti može samo kupac kome je prodaja označena, i to jednom po proizvodu.",
              ],
            },
          ],
        },
      ],
    },
    {
      title: "Plaćanje",
      icon: "kartica",
      articles: [
        {
          slug: "kako-se-placa",
          title: "Kako se plaća na Sajmu",
          intro:
            "Sajam za sada ne naplaćuje kupovinu preko sajta. Kupac i prodavac se porukama dogovaraju kako će platiti.",
          sections: [
            {
              heading: "Najčešći načini",
              paragraphs: [
                "Pouzećem (plaćaš kuriru kad stigne paket), uplatom na tekući račun pre slanja ili gotovinom pri ličnom preuzimanju. Koje načine prodavac prihvata piše na stranici oglasa, pod Plaćanje.",
              ],
            },
            {
              heading: "Saveti",
              paragraphs: [
                "Ako prvi put kupuješ od nekog prodavca, pouzeće ili lično preuzimanje su najsigurniji. Pogledaj i ocene prodavca na profilu.",
              ],
            },
          ],
        },
        {
          slug: "naknade-za-kupce",
          title: "Da li kupac plaća naknadu",
          intro: "Ne. Kupovina na Sajmu je besplatna: plaćaš samo cenu proizvoda i poštarinu, ako je ima.",
          sections: [],
        },
      ],
    },
    {
      title: "Slanje i preuzimanje",
      icon: "kolica",
      articles: [
        {
          slug: "nacini-slanja",
          title: "Načini slanja",
          intro:
            "Svaki prodavac na oglasu, pod Slanje, navodi da li šalje poštom ili prihvata lično preuzimanje. Poštarinu po pravilu plaća kupac, osim ako se drugačije ne dogovorite.",
          sections: [
            {
              heading: "Praćenje paketa",
              paragraphs: [
                "Zamoli prodavca da ti posle slanja pošalje broj pošiljke. Sa njim pratiš paket na sajtu kurirske službe.",
              ],
            },
          ],
        },
        {
          slug: "licno-preuzimanje",
          title: "Lično preuzimanje",
          intro:
            "Ako ste iz istog grada, možete da se dogovorite za lično preuzimanje. Grad prodavca piše na oglasu.",
          sections: [
            {
              heading: "Saveti",
              paragraphs: [
                "Nađite se na javnom mestu, pregledaj proizvod pre plaćanja i dogovor drži u porukama na Sajmu.",
              ],
            },
          ],
        },
        {
          slug: "artikal-nije-kao-u-opisu",
          title: "Proizvod nije kao u opisu",
          intro:
            "Kupovina na Sajmu je dogovor između tebe i prodavca, pa se ovakve situacije rešavaju direktno sa prodavcem. Većina nesporazuma se reši brzo, jednom porukom.",
          sections: [
            {
              heading: "Piši prodavcu",
              paragraphs: [
                "Javi se prodavcu kroz poruke na Sajmu, opiši šta nije u redu i pošalji fotografije. Zajedno se dogovorite šta je najbolje rešenje, na primer povraćaj proizvoda, razmena ili umanjenje cene.",
              ],
            },
            {
              heading: "Ostavi ocenu",
              paragraphs: [
                "Kada se kupovina završi, oceni prodavca u skladu sa svojim iskustvom. Iskrena ocena pomaže drugim kupcima da znaju šta mogu da očekuju.",
              ],
            },
            {
              heading: "Ako postoji ozbiljan problem",
              paragraphs: [
                "Ako prodavac ne odgovara, namerno je opisao proizvod pogrešno ili sumnjaš na prevaru, prijavi nam to preko kontakt forme i navedi ID oglasa (piše na dnu stranice oglasa). Pogledaćemo prijavu i preduzeti mere prema nalogu prodavca ako je potrebno.",
              ],
            },
          ],
        },
      ],
    },
  ],
  prodaja: [
    {
      title: "Objavljivanje oglasa",
      icon: "torba",
      articles: [
        {
          slug: "kako-da-objavim-oglas",
          title: "Kako da objavim oglas",
          intro:
            "Klikni Započni prodaju u gornjem desnom uglu, izaberi kategoriju i popuni oglas. Oglas je vidljiv odmah posle objave.",
          sections: [
            {
              heading: "Šta je obavezno",
              paragraphs: [
                "Fotografija, naslov, potkategorija, stanje, cena i grad. Ostala polja nisu obavezna, ali kupci češće pišu kad je oglas detaljan.",
              ],
            },
            {
              heading: "Brže popunjavanje za knjige",
              paragraphs: [
                "Upiši ili skeniraj ISBN, ili počni da kucaš naslov. Sajam sam popunjava autora, izdavača, godinu, jezik i žanr, a ti samo proveriš podatke.",
                "Sažetak (o čemu se radi u knjizi) se popunjava iz baze knjiga. Ako knjige nema u bazi, klikni Napiši sažetak uz pomoć AI. Sažetak uvek možeš da izmeniš pre objave, a u Opis upiši stanje i oštećenja svog primerka.",
              ],
            },
            {
              heading: "Izmena i brisanje",
              paragraphs: [
                "Svi tvoji oglasi su na stranici Moji oglasi. Tu menjaš oglas, status ili ga brišeš.",
              ],
            },
          ],
        },
        {
          slug: "skeniranje-isbn",
          title: "Skeniranje ISBN-a",
          intro:
            "ISBN je broj iznad ili ispod bar-koda na poleđini knjige. Na telefonu klikni Skeniraj pored polja ISBN i usmeri kameru ka bar-kodu.",
          sections: [
            {
              heading: "Na računaru",
              paragraphs: [
                "Na računaru klikni Skeniraj i telefonom skeniraj prikazani QR kod. Forma se otvara na telefonu i tamo skeniraš bar-kod.",
              ],
            },
          ],
        },
        {
          slug: "dobre-fotografije",
          title: "Saveti za dobre fotografije",
          intro:
            "Slikaj proizvod na dnevnom svetlu, na mirnoj pozadini. Prva fotografija je naslovna i nju kupci vide u rezultatima.",
          sections: [
            {
              heading: "Šta da slikam",
              paragraphs: [
                "Prednju i zadnju stranu, hrbat i sva oštećenja. Kupci više veruju oglasu na kom se vidi pravo stanje.",
              ],
            },
          ],
        },
        {
          slug: "stanje-artikla",
          title: "Kako da odredim stanje proizvoda",
          intro:
            "Na formi za prodaju izaberi stanje: Novo, Kao novo ili Korišćeno. Biraj iskreno i opiši oštećenja u opisu: kupci to cene, a „Kao u opisu“ je jedna od oznaka koje biraju kad te ocenjuju.",
          sections: [],
        },
      ],
    },
    {
      title: "Dogovor sa kupcem",
      icon: "razgovor",
      articles: [
        {
          slug: "odgovaranje-na-poruke",
          title: "Odgovaranje na poruke",
          intro:
            "Kad ti kupac piše, dobijaš obaveštenje i crveni broj pored svoje slike u meniju. Razgovore vidiš na stranici Poruke.",
          sections: [
            {
              heading: "Zašto je brz odgovor važan",
              paragraphs: [
                "Kupci često pišu više prodavaca. Ko odgovori prvi, obično i proda. Brzi odgovori su i jedna od oznaka koje kupci biraju kad te ocenjuju.",
              ],
            },
          ],
        },
        {
          slug: "rezervisano-i-prodato",
          title: "Rezervisano i prodato",
          intro:
            "Kad se dogovoriš sa kupcem, na stranici Moji oglasi promeni status u Rezervisano. Posle prodaje izaberi Prodato.",
          sections: [
            {
              heading: "Biranje kupca",
              paragraphs: [
                "Kad izabereš Prodato, Sajam pita kome je proizvod prodat. Ponuđeni su svi koji su ti pisali o tom oglasu. Izabrani kupac dobija poziv da te oceni.",
                "Ako je proizvod prodat van Sajma, izaberi Nekom van Sajma.",
              ],
            },
            {
              heading: "Podsetnik za rezervisane oglase",
              paragraphs: [
                "Ako oglas dugo stoji kao Rezervisano, Sajam ti šalje obaveštenje da proveriš da li je prodat.",
              ],
            },
          ],
        },
      ],
    },
    {
      title: "Plaćanje i naknade",
      icon: "kartica",
      articles: [
        {
          slug: "naknade",
          title: "Naknade za prodaju",
          intro: "Prodaja na Sajmu je trenutno besplatna. Nema naknade za objavu oglasa ni provizije na prodaju.",
          sections: [],
        },
        {
          slug: "kako-kupac-placa",
          title: "Kako kupac plaća",
          intro:
            "Način plaćanja dogovarate porukama. Na oglasu označi koje načine prihvataš: pouzeće, uplatu na račun ili gotovinu pri preuzimanju.",
          sections: [
            {
              heading: "Saveti",
              paragraphs: [
                "Proizvod pošalji tek kad stigne uplata, osim kad šalješ pouzećem. Nikome ne šalji podatke o kartici ni lozinke.",
              ],
            },
          ],
        },
      ],
    },
    {
      title: "Slanje",
      icon: "kolica",
      articles: [
        {
          slug: "slanje-paketa",
          title: "Slanje paketa",
          intro:
            "Dobro spakuj proizvod: knjige i ploče stavi u kartonsku kutiju ili tvrdi koverat, a igre i opremu obmotaj folijom sa mehurićima.",
          sections: [
            {
              heading: "Posle slanja",
              paragraphs: [
                "Pošalji kupcu broj pošiljke u poruci, pa označi oglas kao Prodato.",
              ],
            },
          ],
        },
      ],
    },
  ],
  nalog: [
    {
      title: "Nalog i prijava",
      icon: "torba",
      articles: [
        {
          slug: "registracija-i-prijava",
          title: "Registracija i prijava",
          intro:
            "Jedan nalog služi i za kupovinu i za prodaju. Nalog praviš imejlom ili Google nalogom, preko dugmeta za prijavu u gornjem meniju.",
          sections: [
            {
              heading: "Potvrda imejla",
              paragraphs: [
                "Posle registracije imejlom stiže poruka sa linkom za potvrdu. Ako je ne vidiš, pogledaj i folder za neželjenu poštu.",
              ],
            },
          ],
        },
        {
          slug: "zaboravljena-lozinka",
          title: "Zaboravljena lozinka",
          intro:
            "U prozoru za prijavu imejlom klikni Zaboravljena lozinka? i upiši imejl. Stiže ti link za novu lozinku.",
          sections: [
            {
              heading: "Prijava preko Google-a",
              paragraphs: [
                "Ako se prijavljuješ Google nalogom, lozinka za Sajam ti ne treba. Lozinku menjaš u Google nalogu.",
              ],
            },
          ],
        },
        {
          slug: "izmena-profila",
          title: "Izmena profila",
          intro:
            "Klikni na svoju sliku u meniju i izaberi Podešavanja profila. Tu menjaš ime i prezime, korisničko ime, grad, opis i fotografiju.",
          sections: [
            {
              heading: "Zašto je grad važan",
              paragraphs: [
                "Grad iz profila se sam upisuje u nove oglase, a kupci po njemu traže proizvode u blizini.",
              ],
            },
          ],
        },
        {
          slug: "brisanje-naloga",
          title: "Brisanje naloga",
          intro:
            "Pošalji nam zahtev preko kontakt forme sa imejlom kojim se prijavljuješ. Nalog i oglasi se brišu, a recenzije koje su drugi ostavili ostaju bez tvog imena.",
          sections: [],
        },
      ],
    },
    {
      title: "Ocene i recenzije",
      icon: "razgovor",
      articles: [
        {
          slug: "kako-rade-ocene",
          title: "Kako rade ocene",
          intro:
            "Posle prodaje kupac može da oceni prodavca sa jednom do pet zvezdica i da doda komentar. Ocene se vide na profilu prodavca.",
          sections: [
            {
              heading: "Ko može da ostavi ocenu",
              paragraphs: [
                "Samo kupac kome je prodaja označena, jednom po proizvodu. Tako su ocene uvek vezane za stvarnu kupovinu.",
              ],
            },
            {
              heading: "Pozitivne ocene",
              paragraphs: [
                "Ocene sa četiri i pet zvezdica računaju se kao pozitivne. Procenat pozitivnih ocena piše na profilu i na oglasima prodavca.",
              ],
            },
          ],
        },
      ],
    },
    {
      title: "Bezbednost",
      icon: "kartica",
      articles: [
        {
          slug: "bezbedna-kupovina",
          title: "Saveti za bezbednu kupovinu i prodaju",
          intro:
            "Većina dogovora na Sajmu prođe bez problema. Ovih nekoliko pravila pomaže da tako i ostane.",
          sections: [
            {
              heading: "Dogovor drži na Sajmu",
              paragraphs: [
                "Razgovaraj kroz poruke na Sajmu. Ako zatreba, možemo da pogledamo razgovor i pomognemo.",
              ],
            },
            {
              heading: "Ne šalji osetljive podatke",
              paragraphs: [
                "Niko sa Sajma neće tražiti tvoju lozinku ni podatke o kartici. Ne otvaraj linkove za „plaćanje“ koje ti neko pošalje u poruci.",
              ],
            },
            {
              heading: "Prijavi sumnjiv oglas",
              paragraphs: [
                "Ako ti nešto izgleda sumnjivo, pošalji nam zahtev preko kontakt forme i navedi ID oglasa.",
              ],
            },
          ],
        },
      ],
    },
    {
      title: "Obaveštenja",
      icon: "kolica",
      articles: [
        {
          slug: "obavestenja",
          title: "Obaveštenja",
          intro:
            "Zvonce u gornjem meniju pokazuje nova obaveštenja: poruke, pozive za ocenu, nove recenzije i podsetnike za rezervisane oglase.",
          sections: [
            {
              heading: "Kako da ih pročitam",
              paragraphs: [
                "Klikni na zvonce. Svako obaveštenje ima dugme koje te vodi dalje, na primer Odgovori ili Oceni prodavca.",
              ],
            },
          ],
        },
      ],
    },
  ],
};

// Najčešće pretrage ispod polja za pretragu („Top searches“ u dizajnu).
export const TOP_SEARCHES: Array<{ label: string; href: string }> = [
  { label: "Naknade", href: "/pomoc/prodaja/naknade" },
  { label: "Plaćanje", href: "/pomoc/kupovina/kako-se-placa" },
  { label: "Nalog", href: "/pomoc/nalog/registracija-i-prijava" },
  { label: "Zaboravljena lozinka", href: "/pomoc/nalog/zaboravljena-lozinka" },
];

export function isHelpSection(s: string): s is HelpSectionKey {
  return s === "nalog" || s === "kupovina" || s === "prodaja";
}

export function findArticle(slug: string) {
  for (const s of HELP_SECTIONS) {
    for (const topic of HELP[s.key]) {
      const article = topic.articles.find((a) => a.slug === slug);
      if (article) return { section: s, topic, article };
    }
  }
  return null;
}

export function articleHref(section: HelpSectionKey, slug: string) {
  return `/pomoc/${section}/${slug}`;
}

function fold(s: string) {
  return s
    .toLowerCase()
    .replace(/đ/g, "dj")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

// Pretraga članaka: svaka reč upita mora da se nađe u naslovu ili tekstu.
export function searchHelp(q: string) {
  const words = fold(q).split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  const out: Array<{ section: HelpSectionKey; topic: string; article: HelpArticle; titleHit: boolean }> = [];
  for (const s of HELP_SECTIONS) {
    for (const topic of HELP[s.key]) {
      for (const a of topic.articles) {
        const title = fold(a.title);
        const text = fold(
          [a.title, a.intro, ...a.sections.flatMap((x) => [x.heading, ...x.paragraphs])].join(" "),
        );
        if (words.every((w) => text.includes(w))) {
          out.push({ section: s.key, topic: topic.title, article: a, titleHit: words.every((w) => title.includes(w)) });
        }
      }
    }
  }
  return out.sort((a, b) => Number(b.titleHit) - Number(a.titleHit));
}

export function headingId(heading: string) {
  return fold(heading)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
