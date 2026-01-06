// ===================================================
// DÁTOVÝ MODEL: POUŽÍVATELIA
// ===================================================

export const USERS_DATA = [
  {
    id: 1,
    first_name: "Martin",
    last_name: "Kovac",
    nick: "marty",
    password: "pass123",
    email: "martin.kovac@example.com",
    location: "Bratislava",
    profile_pic: "https://picsum.photos/seed/user1/200",
    reputation: 4.8,
    reviews_count: 0,
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
    reputation: 4.5,
    reviews_count: 0,
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
    reputation: 4.2,
    reviews_count: 0,
  }
];

// ===================================================
// DÁTOVÝ MODEL: KNIHY
// ===================================================

export const BOOKS_DATA = [
  { id: 1, title: "The Silent Forest", autor: "Mark Holloway", description: "Mystery novel set deep in the wilderness. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?", language: "Anglický", type: "Beletria", owner_id: 1, image_url: "https://picsum.photos/seed/book1/300", status: "locked" },

  { id: 2, title: "Beyond the Horizon", autor: "Elena Brooks", description: "Inspiring story about chasing dreams.", language: "Anglický", type: "Dráma", owner_id: 2, image_url: "https://picsum.photos/seed/book2/300", status: "unavailable" },

  { id: 3, title: "Mesto v Tme", autor: "Jozef Benko", description: "Slovenský triler z mestského prostredia.", language: "Slovenský", type: "Triler", owner_id: 3, image_url: "https://picsum.photos/seed/book3/300", status: "available" },

  { id: 4, title: "The Last Empire", autor: "Richard Flannery", description: "Epic fantasy about a crumbling kingdom.", language: "Anglický", type: "Fantasy", owner_id: 1, image_url: "https://picsum.photos/seed/book4/300", status: "locked" },

  { id: 5, title: "Ocean of Memories", autor: "Hanna Rivera", description: "Romantic story intertwined with past secrets.", language: "Anglický", type: "Romantika", owner_id: 2, image_url: "https://picsum.photos/seed/book5/300", status: "available" },

  { id: 6, title: "Tajomstvo Hradu", autor: "Marek Ruman", description: "Dobrodružný príbeh zo stredoveku.", language: "Slovenský", type: "Dobrodružné", owner_id: 1, image_url: "https://picsum.photos/seed/book6/300", status: "unavailable" },

  { id: 7, title: "Digital Future", autor: "Alan Pierce", description: "Exploration of technology's impact on society.", language: "Anglický", type: "Náučné", owner_id: 3, image_url: "https://picsum.photos/seed/book7/300", status: "available" },

  { id: 8, title: "Cold Night", autor: "Sarah Holden", description: "Crime novel set in a frozen Scandinavian town.", language: "Anglický", type: "Krimi", owner_id: 2, image_url: "https://picsum.photos/seed/book8/300", status: "locked" },

  { id: 9, title: "Zabudnuté Hory", autor: "Tomas Hlavac", description: "Príbehy zo slovenských hôr.", language: "Slovenský", type: "Cestopis", owner_id: 1, image_url: "https://picsum.photos/seed/book9/300", status: "available" },

  { id: 10, title: "Quantum Echoes", autor: "Liam Hart", description: "Sci-fi román o paralelných svetoch.", language: "Anglický", type: "Sci-fi", owner_id: 3, image_url: "https://picsum.photos/seed/book10/300", status: "unavailable" },

  { id: 11, title: "City of Ashes", autor: "Emily Rhodes", description: "Urban fantasy with dark undertones.", language: "Anglický", type: "Fantasy", owner_id: 2, image_url: "https://picsum.photos/seed/book11/300", status: "available" },

  { id: 12, title: "Pod Slnkom", autor: "Juraj Novak", description: "Slovenská romantická novela.", language: "Slovenský", type: "Romantika", owner_id: 1, image_url: "https://picsum.photos/seed/book12/300", status: "locked" },

  { id: 13, title: "The Painted Sky", autor: "Isabelle Grant", description: "Emotional story about family and identity.", language: "Anglický", type: "Dráma", owner_id: 3, image_url: "https://picsum.photos/seed/book13/300", status: "available" },

  { id: 14, title: "Frozen Lies", autor: "Nathan Cole", description: "Detective story set in Canada.", language: "Anglický", type: "Krimi", owner_id: 1, image_url: "https://picsum.photos/seed/book14/300", status: "unavailable" },

  { id: 15, title: "Shadow Walker", autor: "Kara Miles", description: "Dark fantasy with strong character development.", language: "Anglický", type: "Fantasy", owner_id: 2, image_url: "https://picsum.photos/seed/book15/300", status: "available" },

  { id: 16, title: "Nebesá", autor: "Silvia Grmanová", description: "Slovenská filozofická próza.", language: "Slovenský", type: "Filozofia", owner_id: 3, image_url: "https://picsum.photos/seed/book16/300", status: "locked" },

  { id: 17, title: "Iron Stars", autor: "Michael Turner", description: "Military sci-fi epic.", language: "Anglický", type: "Sci-fi", owner_id: 1, image_url: "https://picsum.photos/seed/book17/300", status: "available" },

  { id: 18, title: "Dolina Ticha", autor: "Roman Varga", description: "Príbeh o živote na vidieku.", language: "Slovenský", type: "Dráma", owner_id: 2, image_url: "https://picsum.photos/seed/book18/300", status: "locked" },

  { id: 19, title: "Edge of Reality", autor: "Sophie Lang", description: "Psychological thriller with surreal elements.", language: "Anglický", type: "Triler", owner_id: 3, image_url: "https://picsum.photos/seed/book19/300", status: "available" },

  { id: 20, title: "The Forgotten Stars", autor: "Daniel Price", description: "Sci-fi novel about lost civilizations.", language: "Anglický", type: "Sci-fi", owner_id: 1, image_url: "https://picsum.photos/seed/book20/300", status: "unavailable" },

  { id: 21, title: "Vietor v Korunách", autor: "Simona Králová", description: "Prírodopisná esej o stromoch.", language: "Slovenský", type: "Náučné", owner_id: 1, image_url: "https://picsum.photos/seed/book21/300", status: "available" },

  { id: 22, title: "Broken Path", autor: "Harvey Quinn", description: "Dark drama about relationships and healing.", language: "Anglický", type: "Dráma", owner_id: 2, image_url: "https://picsum.photos/seed/book22/300", status: "locked" },

  { id: 23, title: "Crystal Kingdom", autor: "Lara Bright", description: "Magical adventure in an icy realm.", language: "Anglický", type: "Fantasy", owner_id: 3, image_url: "https://picsum.photos/seed/book23/300", status: "available" },

  { id: 24, title: "Svetlá Noci", autor: "Adam Šulek", description: "Mestská poézia plná emócií.", language: "Slovenský", type: "Poézia", owner_id: 2, image_url: "https://picsum.photos/seed/book24/300", status: "unavailable" },

  { id: 25, title: "Whispers of the Past", autor: "Clara Jensen", description: "Historical mystery with strong atmosphere.", language: "Anglický", type: "Historické", owner_id: 1, image_url: "https://picsum.photos/seed/book25/300", status: "locked" },

  { id: 26, title: "Nad Ránom", autor: "Peter Ferianc", description: "Slovenský psychologický román.", language: "Slovenský", type: "Psychologické", owner_id: 3, image_url: "https://picsum.photos/seed/book26/300", status: "available" },

  { id: 27, title: "Rising Dust", autor: "Henry Miller", description: "Post-apocalyptic survival story.", language: "Anglický", type: "Sci-fi", owner_id: 2, image_url: "https://picsum.photos/seed/book27/300", status: "unavailable" },

  { id: 28, title: "Morský Vlna", autor: "Katarína Pospíšilová", description: "Poetické príbehy inšpirované morom.", language: "Slovenský", type: "Poézia", owner_id: 1, image_url: "https://picsum.photos/seed/book28/300", status: "available" },

  { id: 29, title: "The Ivory Tower", autor: "William Hayes", description: "Political thriller with unexpected twists.", language: "Anglický", type: "Triler", owner_id: 3, image_url: "https://picsum.photos/seed/book29/300", status: "locked" },

  { id: 30, title: "Vlci Severu", autor: "Ivan Holub", description: "Dobrodružná cesta naprieč severskou divočinou.", language: "Slovenský", type: "Dobrodružné", owner_id: 2, image_url: "https://picsum.photos/seed/book30/300", status: "available" },

  { id: 31, title: "Heart of Winter", autor: "Samantha Lee", description: "Emotional tale set in a frozen landscape.", language: "Anglický", type: "Dráma", owner_id: 1, image_url: "https://picsum.photos/seed/book31/300", status: "locked" },

  { id: 32, title: "Zlatý Prameň", autor: "Martin Šebo", description: "Fantastický príbeh o magickom prameni.", language: "Slovenský", type: "Fantasy", owner_id: 2, image_url: "https://picsum.photos/seed/book32/300", status: "available" },

  { id: 33, title: "La Ciudad Perdida", autor: "Carlos Mendoza", description: "Aventura sobre una ciudad olvidada por el tiempo.", language: "Španielsky", type: "Dobrodružné", owner_id: 3, image_url: "https://picsum.photos/seed/book33/300", status: "unavailable" },

  { id: 34, title: "Stille Wasser", autor: "Helena Krüger", description: "Psychologischer Roman voller Geheimnisse.", language: "Nemecký", type: "Psychologické", owner_id: 1, image_url: "https://picsum.photos/seed/book34/300", status: "available" },

  { id: 35, title: "Fallen Skies", autor: "David Monroe", description: "Sci-fi príbeh o kolapse mimozemskej civilizácie.", language: "Anglický", type: "Sci-fi", owner_id: 2, image_url: "https://picsum.photos/seed/book35/300", status: "locked" },

  { id: 36, title: "Tajné Dvory", autor: "Lucia Adamcová", description: "Mysteriózny román z prostredia starých kaštieľov.", language: "Slovenský", type: "Triler", owner_id: 3, image_url: "https://picsum.photos/seed/book36/300", status: "available" },

  { id: 37, title: "Sombras del Mar", autor: "Ana Valdés", description: "Romantická dráma na pobreží Stredomoria.", language: "Španielsky", type: "Romantika", owner_id: 1, image_url: "https://picsum.photos/seed/book37/300", status: "unavailable" },

  { id: 38, title: "Ewiger Schnee", autor: "Markus Adler", description: "Dobrodružný román zo severných hôr.", language: "Nemecký", type: "Dobrodružné", owner_id: 2, image_url: "https://picsum.photos/seed/book38/300", status: "available" },

  { id: 39, title: "Ashen Roads", autor: "Helen Corwin", description: "Post-apokalyptický príbeh o prežití.", language: "Anglický", type: "Sci-fi", owner_id: 3, image_url: "https://picsum.photos/seed/book39/300", status: "locked" },

  { id: 40, title: "Kráľovstvo Tieňov", autor: "Patrik Roštek", description: "Slovenská fantasy o zapomenutom kráľovstve.", language: "Slovenský", type: "Fantasy", owner_id: 1, image_url: "https://picsum.photos/seed/book40/300", status: "available" },

  { id: 41, title: "Voces en la Lluvia", autor: "Lucía Romero", description: "Mysteriózna novela o hlasoch v daždi.", language: "Španielsky", type: "Triler", owner_id: 2, image_url: "https://picsum.photos/seed/book41/300", status: "locked" },

  { id: 42, title: "Sturmlicht", autor: "Erik Schneider", description: "Fantasy o mágii skrytej v búrkach.", language: "Nemecký", type: "Fantasy", owner_id: 3, image_url: "https://picsum.photos/seed/book42/300", status: "available" },

  { id: 43, title: "Midnight Train", autor: "Robert King", description: "Temné krimi o sérií nevyriešených zmiznutí.", language: "Anglický", type: "Krimi", owner_id: 1, image_url: "https://picsum.photos/seed/book43/300", status: "available" },

  { id: 44, title: "Sen o Jazere", autor: "Tatiana Šindelová", description: "Romantický príbeh plný spomienok.", language: "Slovenský", type: "Romantika", owner_id: 2, image_url: "https://picsum.photos/seed/book44/300", status: "unavailable" },

  { id: 45, title: "Laberinto Eterno", autor: "Fernando Ruiz", description: "Temný mysteriózny triler.", language: "Španielsky", type: "Triler", owner_id: 3, image_url: "https://picsum.photos/seed/book45/300", status: "available" },

  { id: 46, title: "Feuerherz", autor: "Sabrina Wolf", description: "Historický román plný intríg.", language: "Nemecký", type: "Historické", owner_id: 1, image_url: "https://picsum.photos/seed/book46/300", status: "locked" },

  { id: 47, title: "Fallen Night", autor: "John Avery", description: "Fantasy s temným nádychom a prastarými bytosťami.", language: "Anglický", type: "Fantasy", owner_id: 2, image_url: "https://picsum.photos/seed/book47/300", status: "available" },

  { id: 48, title: "Svet bez Farieb", autor: "Denis Polák", description: "Psychologická poviedka o strate vnímania reality.", language: "Slovenský", type: "Psychologické", owner_id: 3, image_url: "https://picsum.photos/seed/book48/300", status: "locked" },

  { id: 49, title: "Espejo del Alma", autor: "María Pérez", description: "Filozofická úvaha o identite.", language: "Španielsky", type: "Filozofia", owner_id: 1, image_url: "https://picsum.photos/seed/book49/300", status: "available" },

  { id: 50, title: "Mondschatten", autor: "Johann Bauer", description: "Temná fantasy o neviditeľných bytostiach.", language: "Nemecký", type: "Fantasy", owner_id: 2, image_url: "https://picsum.photos/seed/book50/300", status: "unavailable" },

  { id: 51, title: "Silent Harbour", autor: "Grace Hollow", description: "Romantické krimi z malého prístavu.", language: "Anglický", type: "Krimi", owner_id: 3, image_url: "https://picsum.photos/seed/book51/300", status: "available" },

  { id: 52, title: "Hmla nad Ránom", autor: "Štefan Paulík", description: "Slovenská dráma o nevyspytateľných vzťahoch.", language: "Slovenský", type: "Dráma", owner_id: 1, image_url: "https://picsum.photos/seed/book52/300", status: "locked" },

  { id: 53, title: "Cantos del Viento", autor: "Diego Navarro", description: "Poetická zbierka o vetre a duši.", language: "Španielsky", type: "Poézia", owner_id: 2, image_url: "https://picsum.photos/seed/book53/300", status: "available" },

  { id: 54, title: "Blut der Sterne", autor: "Angela Roth", description: "Epické sci-fi o galaktickej vojne.", language: "Nemecký", type: "Sci-fi", owner_id: 3, image_url: "https://picsum.photos/seed/book54/300", status: "unavailable" },

  { id: 55, title: "Iron River", autor: "Mark Jenkins", description: "Dobrodružný cestopis z divočiny.", language: "Anglický", type: "Cestopis", owner_id: 1, image_url: "https://picsum.photos/seed/book55/300", status: "available" },

  { id: 56, title: "Tajná Komnata", autor: "Michaela Hricová", description: "Mysteriózne dobrodružstvo v starom dome.", language: "Slovenský", type: "Dobrodružné", owner_id: 2, image_url: "https://picsum.photos/seed/book56/300", status: "locked" },

  { id: 57, title: "Sombras de Cristal", autor: "Javier Ruiz", description: "Fantasy o magických kryštáloch.", language: "Španielsky", type: "Fantasy", owner_id: 3, image_url: "https://picsum.photos/seed/book57/300", status: "available" },

  { id: 58, title: "Schwarzer Pfad", autor: "Bruno Weiss", description: "Temný triler v zasnežených Alpách.", language: "Nemecký", type: "Triler", owner_id: 1, image_url: "https://picsum.photos/seed/book58/300", status: "unavailable" },

  { id: 59, title: "Last Dawn", autor: "Ellie Moore", description: "Post-apokalyptická dráma o novej nádeji.", language: "Anglický", type: "Dráma", owner_id: 2, image_url: "https://picsum.photos/seed/book59/300", status: "available" },

  { id: 60, title: "Opustené Mesto", autor: "Filip Gregor", description: "Slovenský triler z prázdnych ulíc.", language: "Slovenský", type: "Triler", owner_id: 3, image_url: "https://picsum.photos/seed/book60/300", status: "locked" },

  { id: 61, title: "Cielos Rotos", autor: "Elena Navarro", description: "Sci-fi o roztrhanom nebi a padajúcich svetoch.", language: "Španielsky", type: "Sci-fi", owner_id: 1, image_url: "httpsum.photos/seed/book61/300", status: "available" },

  { id: 62, title: "Feuer im Nebel", autor: "Klaus Sommer", description: "Mysteriózna historická dráma.", language: "Nemecký", type: "Historické", owner_id: 2, image_url: "https://picsum.photos/seed/book62/300", status: "unavailable" },

  { id: 63, title: "The Gray Choir", autor: "Nathan Ellis", description: "Fantasy o tajomnej sekte v horách.", language: "Anglický", type: "Fantasy", owner_id: 3, image_url: "https://picsum.photos/seed/book63/300", status: "available" },

  { id: 64, title: "Morské Tiene", autor: "Zuzana Blahová", description: "Slovenská dobrodružná novela pri mori.", language: "Slovenský", type: "Dobrodružné", owner_id: 1, image_url: "https://picsum.photos/seed/book64/300", status: "locked" },

  { id: 65, title: "El Jardín Oculto", autor: "Paula Ortega", description: "Romantický príbeh o tajnej záhrade.", language: "Španielsky", type: "Romantika", owner_id: 2, image_url: "https://picsum.photos/seed/book65/300", status: "available" },

  { id: 66, title: "Wilde Schatten", autor: "Nina Hartmann", description: "Dobrodružné krimi v nemeckých lesoch.", language: "Nemecký", type: "Krimi", owner_id: 3, image_url: "https://picsum.photos/seed/book66/300", status: "unavailable" },

  { id: 67, title: "Starborn Cycle", autor: "Jonathan Wade", description: "Epické sci-fi o hviezdnych cestovateľoch.", language: "Anglický", type: "Sci-fi", owner_id: 1, image_url: "https://picsum.photos/seed/book67/300", status: "available" },

  { id: 68, title: "Sen Pod Hradom", autor: "Matej Kardoš", description: "Slovenská fantasy plná snov a mágie.", language: "Slovenský", type: "Fantasy", owner_id: 2, image_url: "https://picsum.photos/seed/book68/300", status: "locked" },

  { id: 69, title: "Espejo de Arena", autor: "Marco Gil", description: "Dobrodružstvo v púšti plnej tajomstiev.", language: "Španielsky", type: "Dobrodružné", owner_id: 3, image_url: "https://picsum.photos/seed/book69/300", status: "available" },

  { id: 70, title: "Kältepunkt", autor: "Fritz Geller", description: "Atmosférické sci-fi z mrazivého sveta.", language: "Nemecký", type: "Sci-fi", owner_id: 1, image_url: "https://picsum.photos/seed/book70/300", status: "unavailable" },

  { id: 71, title: "Broken Petals", autor: "Olivia Hart", description: "Dojemná dráma o strate a opätovnom nájdení seba.", language: "Anglický", type: "Dráma", owner_id: 2, image_url: "https://picsum.photos/seed/book71/300", status: "available" },

  { id: 72, title: "Noc na Pláni", autor: "Stano Javor", description: "Krimi z opustenej slovenskej vlakovej trate.", language: "Slovenský", type: "Krimi", owner_id: 3, image_url: "https://picsum.photos/seed/book72/300", status: "locked" },

  { id: 73, title: "Casa de Sombras", autor: "Laura Díaz", description: "Mysteriózna dráma o dome plnom tajomstiev.", language: "Španielsky", type: "Dráma", owner_id: 1, image_url: "https://picsum.photos/seed/book73/300", status: "available" },

  { id: 74, title: "Dunkle Krone", autor: "Rico Brandt", description: "Fantasy o prekliatej kráľovskej korune.", language: "Nemecký", type: "Fantasy", owner_id: 2, image_url: "https://picsum.photos/seed/book74/300", status: "unavailable" },

  { id: 75, title: "Shattered Code", autor: "Blake Turner", description: "Techno-triler o zneužití umelej inteligencie.", language: "Anglický", type: "Triler", owner_id: 3, image_url: "https://picsum.photos/seed/book75/300", status: "available" },

  { id: 76, title: "Príbeh Starého Domu", autor: "Gabriela Šimková", description: "Slovenská mysteriózna poviedka.", language: "Slovenský", type: "Mystery", owner_id: 1, image_url: "https://picsum.photos/seed/book76/300", status: "locked" },

  { id: 77, title: "Ruta de los Astros", autor: "Hugo Serrano", description: "Poetické sci-fi o hviezdnych cestách.", language: "Španielsky", type: "Sci-fi", owner_id: 2, image_url: "https://picsum.photos/seed/book77/300", status: "available" },

  { id: 78, title: "Schnee der Erinnerung", autor: "Anna Bergmann", description: "Romantická dráma zasadená do Álp.", language: "Nemecký", type: "Romantika", owner_id: 3, image_url: "https://picsum.photos/seed/book78/300", status: "unavailable" },

  { id: 79, title: "Echoes of Ember", autor: "Charles Nolan", description: "Fantasy o magických plameňoch a starej prorokyni.", language: "Anglický", type: "Fantasy", owner_id: 1, image_url: "https://picsum.photos/seed/book79/300", status: "available" },

  { id: 80, title: "Les Murmures de la Nuit", autor: "Élodie Marchand", description: "Mystérieux roman sur un village où les ombres semblent vivre vlastným životom.", language: "Francúzština", type: "Triler", owner_id: 1, image_url: "https://picsum.photos/seed/book80/300", status: "available" },

  { id: 81, title: "Le Jardin Oublié", autor: "Marc Delacroix", description: "Poetický príbeh o spomienkach skrytých v opustenom parku.", language: "Francúzština", type: "Dráma", owner_id: 2, image_url: "https://picsum.photos/seed/book81/300", status: "locked" },

  { id: 82, title: "L'Étoile Brisée", autor: "Amélie Rousseau", description: "Fantasy román o padnutej hviezde, ktorá mení osudy ľudí.", language: "Francúzština", type: "Fantasy", owner_id: 3, image_url: "https://picsum.photos/seed/book82/300", status: "available" },

  { id: 83, title: "Le Vent du Sud", autor: "Henri Lamotte", description: "Romantická dráma odohrávajúca sa na francúzskom vidieku.", language: "Francúzština", type: "Romantika", owner_id: 1, image_url: "https://picsum.photos/seed/book83/300", status: "unavailable" },

  { id: 84, title: "La Dernière Marée", autor: "Sophie Villard", description: "Napínavý príbeh o tajomstve, ktoré odhalí odliv.", language: "Francúzština", type: "Krimi", owner_id: 2, image_url: "https://picsum.photos/seed/book84/300", status: "available" },

  { id: 85, title: "Le Chant des Cendres", autor: "Lucien Morel", description: "Postapokalyptický román o prežití v spálenej Európe.", language: "Francúzština", type: "Sci-fi", owner_id: 3, image_url: "https://picsum.photos/seed/book85/300", status: "locked" },

  { id: 86, title: "Sous la Pluie Rouge", autor: "Claire Dubois", description: "Psychologický triler o žene, ktorá stráca kontrolu nad realitou.", language: "Francúzština", type: "Triler", owner_id: 1, image_url: "https://picsum.photos/seed/book86/300", status: "available" },

  { id: 87, title: "Le Château des Brumes", autor: "François Valette", description: "Gotický príbeh o zámku, kde miznú návštevníci.", language: "Francúzština", type: "Historické", owner_id: 2, image_url: "https://picsum.photos/seed/book87/300", status: "locked" },

  { id: 88, title: "Par-delà les Rivières", autor: "Nadine Lefèvre", description: "Filozofická úvaha o putovaní a ľudskej duši.", language: "Francúzština", type: "Filozofia", owner_id: 3, image_url: "https://picsum.photos/seed/book88/300", status: "available" },

  { id: 89, title: "Le Masque d'Or", autor: "Jean-Claude Marot", description: "Dobrodružstvo o zlodejovi, ktorý hľadá legendárny artefakt.", language: "Francúzština", type: "Dobrodružné", owner_id: 1, image_url: "https://picsum.photos/seed/book89/300", status: "unavailable" },

  { id: 90, title: "La Porte Sombre", autor: "Isabelle Fournier", description: "Mystický príbeh o bráne do iného sveta.", language: "Francúzština", type: "Fantasy", owner_id: 2, image_url: "https://picsum.photos/seed/book90/300", status: "available" },

  { id: 91, title: "L'Ombre du Temps", autor: "Gabriel Montreuil", description: "Sci-fi o cestovaní časom a následkoch malých rozhodnutí.", language: "Francúzština", type: "Sci-fi", owner_id: 3, image_url: "https://picsum.photos/seed/book91/300", status: "locked" },

  { id: 92, title: "Les Petites Lumières", autor: "Adèle Charpentier", description: "Citlivá novela o medziľudských vzťahoch v malom meste.", language: "Francúzština", type: "Dráma", owner_id: 1, image_url: "https://picsum.photos/seed/book92/300", status: "available" },

  { id: 93, title: "L'Île des Secrets", autor: "Olivier Martin", description: "Dobrodružný príbeh na tajomnom ostrove plnom záhad.", language: "Francúzština", type: "Dobrodružné", owner_id: 2, image_url: "https://picsum.photos/seed/book93/300", status: "locked" },

  { id: 94, title: "La Lune Silencieuse", autor: "Camille Giraud", description: "Sci-fi noveľa o prvej kolónii na Mesiaci.", language: "Francúzština", type: "Sci-fi", owner_id: 3, image_url: "https://picsum.photos/seed/book94/300", status: "available" },

  { id: 95, title: "Les Couleurs du Vent", autor: "Renée Lambert", description: "Poetický príbeh plný symboliky a melanchólie.", language: "Francúzština", type: "Poézia", owner_id: 1, image_url: "https://picsum.photos/seed/book95/300", status: "unavailable" },

  { id: 96, title: "La Ville des Songes", autor: "Thierry Beaumont", description: "Mestská fantasy, kde sny vstupujú do reality.", language: "Francúzština", type: "Fantasy", owner_id: 2, image_url: "https://picsum.photos/seed/book96/300", status: "available" },

  { id: 97, title: "Le Dernier Voyageur", autor: "Hugo Dumas", description: "Cestopis o mužovi, ktorý sa pokúša nájsť svoj vnútorný pokoj.", language: "Francúzština", type: "Cestopis", owner_id: 3, image_url: "https://picsum.photos/seed/book97/300", status: "locked" },

  { id: 98, title: "La Chambre Rouge", autor: "Émilie Poirier", description: "Intenzívny psychologický príbeh o zavretých dverách a tajomstvách.", language: "Francúzština", type: "Psychologické", owner_id: 1, image_url: "https://picsum.photos/seed/book98/300", status: "available" },

  { id: 99, title: "Les Sables Mouvants", autor: "Bastien Moreau", description: "Napínavý krimi príbeh o zmiznutí v púšti.", language: "Francúzština", type: "Krimi", owner_id: 2, image_url: "https://picsum.photos/seed/book99/300", status: "unavailable" }

];