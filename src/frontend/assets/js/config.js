// ===================================================
// DYNAMICKÉ GENERÁTOROVÉ FUNKCIE
// ===================================================

/**
 * Získa unikátne hodnoty z daného poľa objektov pre špecifický kľúč.
 * @param {Array<Object>} data Pole kníh alebo používateľov.
 * @param {string} key Kľúč, ktorého hodnoty chceme získať.
 * @returns {Array<string>} Pole unikátnych, zoradených hodnôt.
 */
function getUniqueSortedValues(data, key) {
    // Použijeme Set pre získanie unikátnych hodnôt a potom zoradíme
    // Filter zabezpečí, že hodnoty nie sú undefined alebo null
    return [...new Set(data.map(item => item[key]).filter(value => value))].sort();
}

// ===================================================
// DÁTOVÝ MODEL: POUŽÍVATELIA
// ===================================================

export const USERS = [
  {
    id: 1,
    first_name: "Martin",
    last_name: "Kovac",
    nick: "marty",
    password: "pass123",
    email: "martin.kovac@example.com",
    location: "Bratislava",
    profile_pic: "https://picsum.photos/seed/user1/200",
    reputation: 4.8
  },
  {
    id: 2,
    first_name: "Eva",
    last_name: "Novakova",
    nick: "eva_n",
    password: "secret456",
    email: "eva.novakova@example.com",
    location: "Bratislava3",
    profile_pic: "https://picsum.photos/seed/user2/200",
    reputation: 4.5
  },
  {
    id: 3,
    first_name: "Peter",
    last_name: "Hrasko",
    nick: "petko",
    password: "mypassword",
    email: "peter.hrasko@example.com",
    location: "Zilina",
    profile_pic: "https://picsum.photos/seed/user3/200",
    reputation: 4.2
  }
];

// ===================================================
// DÁTOVÝ MODEL: KNIHY
// ===================================================

export const BOOKS = [
  {
    id: 1,
    title: "The Silent Forest",
    autor: "Mark Holloway",
    description: "Mystery novel set deep in the wilderness. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?",
    language: "Anglický",
    type: "Beletria",
    owner_id: 1,
    image_url: "https://picsum.photos/seed/book1/300",
    is_available: "yes"
  },
  {
    id: 2,
    title: "Beyond the Horizon",
    autor: "Elena Brooks",
    description: "Inspiring story about chasing dreams.",
    language: "Anglický",
    type: "Dráma",
    owner_id: 2,
    image_url: "https://picsum.photos/seed/book2/300",
    is_available: "no"
  },
  {
    id: 3,
    title: "Mesto v Tme",
    autor: "Jozef Benko",
    description: "Slovenský triler z mestského prostredia.",
    language: "Slovenský",
    type: "Triler",
    owner_id: 3,
    image_url: "https://picsum.photos/seed/book3/300",
    is_available: "yes"
  },
  {
    id: 4,
    title: "The Last Empire",
    autor: "Richard Flannery",
    description: "Epic fantasy about a crumbling kingdom.",
    language: "Anglický",
    type: "Fantasy",
    owner_id: 1,
    image_url: "https://picsum.photos/seed/book4/300",
    is_available: "yes"
  },
  {
    id: 5,
    title: "Ocean of Memories",
    autor: "Hanna Rivera",
    description: "Romantic story intertwined with past secrets.",
    language: "Anglický",
    type: "Romantika",
    owner_id: 2,
    image_url: "https://picsum.photos/seed/book5/300",
    is_available: "yes"
  },
  {
    id: 6,
    title: "Tajomstvo Hradu",
    autor: "Marek Ruman",
    description: "Dobrodružný príbeh zo stredoveku.",
    language: "Slovenský",
    type: "Dobrodružné",
    owner_id: 1,
    image_url: "https://picsum.photos/seed/book6/300",
    is_available: "no"
  },
  {
    id: 7,
    title: "Digital Future",
    autor: "Alan Pierce",
    description: "Exploration of technology's impact on society.",
    language: "Anglický",
    type: "Náučné",
    owner_id: 3,
    image_url: "https://picsum.photos/seed/book7/300",
    is_available: "yes"
  },
  {
    id: 8,
    title: "Cold Night",
    autor: "Sarah Holden",
    description: "Crime novel set in a frozen Scandinavian town.",
    language: "Anglický",
    type: "Krimi",
    owner_id: 2,
    image_url: "https://picsum.photos/seed/book8/300",
    is_available: "no"
  },
  {
    id: 9,
    title: "Zabudnuté Hory",
    autor: "Tomas Hlavac",
    description: "Príbehy zo slovenských hôr.",
    language: "Slovenský",
    type: "Cestopis",
    owner_id: 1,
    image_url: "https://picsum.photos/seed/book9/300",
    is_available: "yes"
  },
  {
    id: 10,
    title: "Quantum Echoes",
    autor: "Liam Hart",
    description: "Sci-fi román o paralelných svetoch.",
    language: "Anglický",
    type: "Sci-fi",
    owner_id: 3,
    image_url: "https://picsum.photos/seed/book10/300",
    is_available: "yes"
  },
  {
    id: 11,
    title: "City of Ashes",
    autor: "Emily Rhodes",
    description: "Urban fantasy with dark undertones.",
    language: "Anglický",
    type: "Fantasy",
    owner_id: 2,
    image_url: "https://picsum.photos/seed/book11/300",
    is_available: "no"
  },
  {
    id: 12,
    title: "Pod Slnkom",
    autor: "Juraj Novak",
    description: "Slovenská romantická novela.",
    language: "Slovenský",
    type: "Romantika",
    owner_id: 1,
    image_url: "https://picsum.photos/seed/book12/300",
    is_available: "yes"
  },
  {
    id: 13,
    title: "The Painted Sky",
    autor: "Isabelle Grant",
    description: "Emotional story about family and identity.",
    language: "Anglický",
    type: "Dráma",
    owner_id: 3,
    image_url: "https://picsum.photos/seed/book13/300",
    is_available: "yes"
  },
  {
    id: 14,
    title: "Frozen Lies",
    autor: "Nathan Cole",
    description: "Detective story set in Canada.",
    language: "Anglický",
    type: "Krimi",
    owner_id: 1,
    image_url: "https://picsum.photos/seed/book14/300",
    is_available: "no"
  },
  {
    id: 15,
    title: "Shadow Walker",
    autor: "Kara Miles",
    description: "Dark fantasy with strong character development.",
    language: "Anglický",
    type: "Fantasy",
    owner_id: 2,
    image_url: "https://picsum.photos/seed/book15/300",
    is_available: "yes"
  },
  {
    id: 16,
    title: "Nebesá", 
    autor: "Silvia Grmanová",
    description: "Slovenská filozofická próza.",
    language: "Slovenský",
    type: "Filozofia",
    owner_id: 3,
    image_url: "https://picsum.photos/seed/book16/300",
    is_available: "yes"
  },
  {
    id: 17,
    title: "Iron Stars",
    autor: "Michael Turner",
    description: "Military sci-fi epic.",
    language: "Anglický",
    type: "Sci-fi",
    owner_id: 1,
    image_url: "https://picsum.photos/seed/book17/300",
    is_available: "yes"
  },
  {
    id: 18,
    title: "Dolina Ticha",
    autor: "Roman Varga",
    description: "Príbeh o živote na vidieku.",
    language: "Slovenský",
    type: "Dráma",
    owner_id: 2,
    image_url: "https://picsum.photos/seed/book18/300",
    is_available: "yes"
  },
  {
    id: 19,
    title: "Edge of Reality",
    autor: "Sophie Lang",
    description: "Psychological thriller with surreal elements.",
    language: "Anglický",
    type: "Triler",
    owner_id: 3,
    image_url: "https://picsum.photos/seed/book19/300",
    is_available: "no"
  },
  {
    id: 20,
    title: "The Forgotten Stars",
    autor: "Daniel Price",
    description: "Sci-fi novel about lost civilizations.",
    language: "Anglický",
    type: "Sci-fi",
    owner_id: 1,
    image_url: "https://picsum.photos/seed/book20/300",
    is_available: "yes"
  },
  {
    id: 21,
    title: "Vietor v Korunách",
    autor: "Simona Králová",
    description: "Prírodopisná esej o stromoch.",
    language: "Slovenský",
    type: "Náučné",
    owner_id: 1,
    image_url: "https://picsum.photos/seed/book21/300",
    is_available: "yes"
  },
  {
    id: 22,
    title: "Broken Path",
    autor: "Harvey Quinn",
    description: "Dark drama about relationships and healing.",
    language: "Anglický",
    type: "Dráma",
    owner_id: 2,
    image_url: "https://picsum.photos/seed/book22/300",
    is_available: "no"
  },
  {
    id: 23,
    title: "Crystal Kingdom",
    autor: "Lara Bright",
    description: "Magical adventure in an icy realm.",
    language: "Anglický",
    type: "Fantasy",
    owner_id: 3,
    image_url: "https://picsum.photos/seed/book23/300",
    is_available: "yes"
  },
  {
    id: 24,
    title: "Svetlá Noci",
    autor: "Adam Šulek",
    description: "Mestská poézia plná emócií.",
    language: "Slovenský",
    type: "Poézia",
    owner_id: 2,
    image_url: "https://picsum.photos/seed/book24/300",
    is_available: "yes"
  },
  {
    id: 25,
    title: "Whispers of the Past",
    autor: "Clara Jensen",
    description: "Historical mystery with strong atmosphere.",
    language: "Anglický",
    type: "Historické",
    owner_id: 1,
    image_url: "https://picsum.photos/seed/book25/300",
    is_available: "no"
  },
  {
    id: 26,
    title: "Nad Ránom",
    autor: "Peter Ferianc",
    description: "Slovenský psychologický román.",
    language: "Slovenský",
    type: "Psychologické",
    owner_id: 3,
    image_url: "https://picsum.photos/seed/book26/300",
    is_available: "yes"
  },
  {
    id: 27,
    title: "Rising Dust",
    autor: "Henry Miller",
    description: "Post-apocalyptic survival story.",
    language: "Anglický",
    type: "Sci-fi",
    owner_id: 2,
    image_url: "httpsum.photos/seed/book27/300",
    is_available: "yes"
  },
  {
    id: 28,
    title: "Morský Vlna",
    autor: "Katarína Pospíšilová",
    description: "Poetické príbehy inšpirované morom.",
    language: "Slovenský",
    type: "Poézia",
    owner_id: 1,
    image_url: "https://picsum.photos/seed/book28/300",
    is_available: "yes"
  },
  {
    id: 29,
    title: "The Ivory Tower",
    autor: "William Hayes",
    description: "Political thriller with unexpected twists.",
    language: "Anglický",
    type: "Triler",
    owner_id: 3,
    image_url: "https://picsum.photos/seed/book29/300",
    is_available: "no"
  },
  {
    id: 30,
    title: "Vlci Severu",
    autor: "Ivan Holub",
    description: "Dobrodružná cesta naprieč severskou divočinou.",
    language: "Slovenský",
    type: "Dobrodružné",
    owner_id: 2,
    image_url: "https://picsum.photos/seed/book30/300",
    is_available: "yes"
  }
];

// ===================================================
// EXPORTNÉ POLIA PRE FILTRE (DYNAMICKY VYGENEROVANÉ)
// ===================================================

export const BOOK_GENRES = getUniqueSortedValues(BOOKS, 'type');
export const BOOK_LANGS = getUniqueSortedValues(BOOKS, 'language');