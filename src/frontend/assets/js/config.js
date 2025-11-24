export const BOOK_GENRES = [
    "romantické",
    "dobrodružné",
    "historické",
    "detektívne" 
];

export const BOOK_LANGS = [
    "slovenský",
    "anglický",
    "francúzsky",
    "nemecký"
];

export const CITIES = [
    "Bratislava",
    "Pezinok",
    "Nitra",
    "Košice"
];

export const USERS = [
  {
    user_id: 1,
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
    user_id: 2,
    first_name: "Eva",
    last_name: "Novakova",
    nick: "eva_n",
    password: "secret456",
    email: "eva.novakova@example.com",
    location: "Kosice",
    profile_pic: "https://picsum.photos/seed/user2/200",
    reputation: 4.5
  },
  {
    user_id: 3,
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

export const BOOKS = [
  {
    book_id: 1,
    title: "The Silent Forest",
    autor: "Mark Holloway",
    description: "Mystery novel set deep in the wilderness.",
    language: "English",
    type: "Fiction",
    owner_id: 1,
    image_url: "https://picsum.photos/seed/book1/300",
    is_available: "yes"
  },
  {
    book_id: 2,
    title: "Beyond the Horizon",
    autor: "Elena Brooks",
    description: "Inspiring story about chasing dreams.",
    language: "English",
    type: "Drama",
    owner_id: 2,
    image_url: "https://picsum.photos/seed/book2/300",
    is_available: "no"
  },
  {
    book_id: 3,
    title: "Mesto v Tme",
    autor: "Jozef Benko",
    description: "Slovenský triler z mestského prostredia.",
    language: "Slovak",
    type: "Thriller",
    owner_id: 3,
    image_url: "https://picsum.photos/seed/book3/300",
    is_available: "yes"
  },
  {
    book_id: 4,
    title: "The Last Empire",
    autor: "Richard Flannery",
    description: "Epic fantasy about a crumbling kingdom.",
    language: "English",
    type: "Fantasy",
    owner_id: 1,
    image_url: "https://picsum.photos/seed/book4/300",
    is_available: "yes"
  },
  {
    book_id: 5,
    title: "Ocean of Memories",
    autor: "Hanna Rivera",
    description: "Romantic story intertwined with past secrets.",
    language: "English",
    type: "Romance",
    owner_id: 2,
    image_url: "https://picsum.photos/seed/book5/300",
    is_available: "yes"
  },
  {
    book_id: 6,
    title: "Tajomstvo Hradu",
    autor: "Marek Ruman",
    description: "Dobrodružný príbeh zo stredoveku.",
    language: "Slovak",
    type: "Adventure",
    owner_id: 1,
    image_url: "https://picsum.photos/seed/book6/300",
    is_available: "no"
  },
  {
    book_id: 7,
    title: "Digital Future",
    autor: "Alan Pierce",
    description: "Exploration of technology's impact on society.",
    language: "English",
    type: "Non-fiction",
    owner_id: 3,
    image_url: "https://picsum.photos/seed/book7/300",
    is_available: "yes"
  },
  {
    book_id: 8,
    title: "Cold Night",
    autor: "Sarah Holden",
    description: "Crime novel set in a frozen Scandinavian town.",
    language: "English",
    type: "Crime",
    owner_id: 2,
    image_url: "https://picsum.photos/seed/book8/300",
    is_available: "no"
  },
  {
    book_id: 9,
    title: "Zabudnuté Hory",
    autor: "Tomas Hlavac",
    description: "Príbehy zo slovenských hôr.",
    language: "Slovak",
    type: "Travel",
    owner_id: 1,
    image_url: "https://picsum.photos/seed/book9/300",
    is_available: "yes"
  },
  {
    book_id: 10,
    title: "Quantum Echoes",
    autor: "Liam Hart",
    description: "Sci-fi román o paralelných svetoch.",
    language: "English",
    type: "Sci-fi",
    owner_id: 3,
    image_url: "https://picsum.photos/seed/book10/300",
    is_available: "yes"
  },
  {
    book_id: 11,
    title: "City of Ashes",
    autor: "Emily Rhodes",
    description: "Urban fantasy with dark undertones.",
    language: "English",
    type: "Fantasy",
    owner_id: 2,
    image_url: "https://picsum.photos/seed/book11/300",
    is_available: "no"
  },
  {
    book_id: 12,
    title: "Pod Slnkom",
    autor: "Juraj Novak",
    description: "Slovenská romantická novela.",
    language: "Slovak",
    type: "Romance",
    owner_id: 1,
    image_url: "https://picsum.photos/seed/book12/300",
    is_available: "yes"
  },
  {
    book_id: 13,
    title: "The Painted Sky",
    autor: "Isabelle Grant",
    description: "Emotional story about family and identity.",
    language: "English",
    type: "Drama",
    owner_id: 3,
    image_url: "https://picsum.photos/seed/book13/300",
    is_available: "yes"
  },
  {
    book_id: 14,
    title: "Frozen Lies",
    autor: "Nathan Cole",
    description: "Detective story set in Canada.",
    language: "English",
    type: "Crime",
    owner_id: 1,
    image_url: "https://picsum.photos/seed/book14/300",
    is_available: "no"
  },
  {
    book_id: 15,
    title: "Shadow Walker",
    autor: "Kara Miles",
    description: "Dark fantasy with strong character development.",
    language: "English",
    type: "Fantasy",
    owner_id: 2,
    image_url: "https://picsum.photos/seed/book15/300",
    is_available: "yes"
  },
  {
    book_id: 16,
    title: "Nebesá", 
    autor: "Silvia Grmanová",
    description: "Slovenská filozofická próza.",
    language: "Slovak",
    type: "Philosophy",
    owner_id: 3,
    image_url: "https://picsum.photos/seed/book16/300",
    is_available: "yes"
  },
  {
    book_id: 17,
    title: "Iron Stars",
    autor: "Michael Turner",
    description: "Military sci-fi epic.",
    language: "English",
    type: "Sci-fi",
    owner_id: 1,
    image_url: "https://picsum.photos/seed/book17/300",
    is_available: "yes"
  },
  {
    book_id: 18,
    title: "Dolina Ticha",
    autor: "Roman Varga",
    description: "Príbeh o živote na vidieku.",
    language: "Slovak",
    type: "Drama",
    owner_id: 2,
    image_url: "https://picsum.photos/seed/book18/300",
    is_available: "yes"
  },
  {
    book_id: 19,
    title: "Edge of Reality",
    autor: "Sophie Lang",
    description: "Psychological thriller with surreal elements.",
    language: "English",
    type: "Thriller",
    owner_id: 3,
    image_url: "https://picsum.photos/seed/book19/300",
    is_available: "no"
  },
  {
    book_id: 20,
    title: "The Forgotten Stars",
    autor: "Daniel Price",
    description: "Sci-fi novel about lost civilizations.",
    language: "English",
    type: "Sci-fi",
    owner_id: 1,
    image_url: "https://picsum.photos/seed/book20/300",
    is_available: "yes"
  },
  {
    book_id: 21,
    title: "Vietor v Korunách",
    autor: "Simona Králová",
    description: "Prírodopisná esej o stromoch.",
    language: "Slovak",
    type: "Non-fiction",
    owner_id: 1,
    image_url: "https://picsum.photos/seed/book21/300",
    is_available: "yes"
  },
  {
    book_id: 22,
    title: "Broken Path",
    autor: "Harvey Quinn",
    description: "Dark drama about relationships and healing.",
    language: "English",
    type: "Drama",
    owner_id: 2,
    image_url: "https://picsum.photos/seed/book22/300",
    is_available: "no"
  },
  {
    book_id: 23,
    title: "Crystal Kingdom",
    autor: "Lara Bright",
    description: "Magical adventure in an icy realm.",
    language: "English",
    type: "Fantasy",
    owner_id: 3,
    image_url: "https://picsum.photos/seed/book23/300",
    is_available: "yes"
  },
  {
    book_id: 24,
    title: "Svetlá Noci",
    autor: "Adam Šulek",
    description: "Mestská poézia plná emócií.",
    language: "Slovak",
    type: "Poetry",
    owner_id: 2,
    image_url: "https://picsum.photos/seed/book24/300",
    is_available: "yes"
  },
  {
    book_id: 25,
    title: "Whispers of the Past",
    autor: "Clara Jensen",
    description: "Historical mystery with strong atmosphere.",
    language: "English",
    type: "Historical",
    owner_id: 1,
    image_url: "https://picsum.photos/seed/book25/300",
    is_available: "no"
  },
  {
    book_id: 26,
    title: "Nad Ránom",
    autor: "Peter Ferianc",
    description: "Slovenský psychologický román.",
    language: "Slovak",
    type: "Psychological",
    owner_id: 3,
    image_url: "https://picsum.photos/seed/book26/300",
    is_available: "yes"
  },
  {
    book_id: 27,
    title: "Rising Dust",
    autor: "Henry Miller",
    description: "Post-apocalyptic survival story.",
    language: "English",
    type: "Sci-fi",
    owner_id: 2,
    image_url: "httpsum.photos/seed/book27/300",
    is_available: "yes"
  },
  {
    book_id: 28,
    title: "Morský Vlna",
    autor: "Katarína Pospíšilová",
    description: "Poetické príbehy inšpirované morom.",
    language: "Slovak",
    type: "Poetry",
    owner_id: 1,
    image_url: "https://picsum.photos/seed/book28/300",
    is_available: "yes"
  },
  {
    book_id: 29,
    title: "The Ivory Tower",
    autor: "William Hayes",
    description: "Political thriller with unexpected twists.",
    language: "English",
    type: "Thriller",
    owner_id: 3,
    image_url: "https://picsum.photos/seed/book29/300",
    is_available: "no"
  },
  {
    book_id: 30,
    title: "Vlci Severu",
    autor: "Ivan Holub",
    description: "Dobrodružná cesta naprieč severskou divočinou.",
    language: "Slovak",
    type: "Adventure",
    owner_id: 2,
    image_url: "https://picsum.photos/seed/book30/300",
    is_available: "yes"
  }
];


