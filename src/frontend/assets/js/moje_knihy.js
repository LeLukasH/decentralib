import { setupBookDetailModal } from "./book_detail_modal.js";
import { USERS } from "./api/allData.js";
import { BOOKS, BOOK_GENRES, BOOK_LANGS } from "./api/allData.js";

// Importy pre Firebase (ak sa používajú pre ukladanie stavu knihy)
import { db } from "./firebase.js"; 
import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

// --- GLOBÁLNE PREMENNÉ ---
let AVAILABLE_CITIES = []; 
let selectedCityFilter = ""; 
// searchCommitted slúži na uchovanie potvrdenej hodnoty vyhľadávania
let searchCommitted = { nazov: "", autor: "" }; 
let currentUser = null; // Nová premenná pre prihláseného používateľa
let currentUserId = null; // ID prihláseného používateľa

// --- PRE STRÁNKOVANIE ---
const BOOKS_PER_PAGE = 18;
let currentPage = 1;
// -------------------------

// ===================================================
// POMOCNÉ FUNKCIE (PRE KNIHY A VLASTNÍKOV)
// ===================================================

function getOwner(book) {
    // Vráti objekt používateľa alebo null
    return USERS.find(u => u.id === book.owner_id) || null;
}

function getOwnerNick(book) {
    const owner = getOwner(book);
    return owner ? owner.nick : "neznámy";
}

function getOwnerReputation(book) {
    const owner = getOwner(book);
    return owner ? owner.reputation : "—";
}

function getOwnerLocation(book) {
    const owner = getOwner(book);
    return owner ? owner.location : "—";
}

function getBookStatus(book) {
    return book.status;
}

function isBooklok(book) {
   return String(book.status );
}

/**
 * Vráti textový popis a ikonu pre stav knihy.
 * @param {string} status - Stav knihy ('available', 'unavailable', 'locked').
 * @returns {string} HTML kód s ikonou a textom.
 */
function iconForStateL(status) {
    switch (status) {
        case 'available':
            return '&#9989; Dostupná'; // Check mark
        case 'unavailable':
            return '&#10060; Požičaná'; // X mark
        case 'locked':
            return '&#128274; Zamknutá'; // Lock icon
        default:
            return status;
    }
}


// ===================================================
// VYKRESLOVANIE (RENDERBOOKS A RENDERPAGINATION)
// ===================================================

/**
 * Vykreslí navigačné prvky pre stránkovanie.
 * @param {number} totalBooks - Celkový počet kníh po aplikovaní filtrov.
 */
function renderPagination(totalBooks) {
    const totalPages = Math.ceil(totalBooks / BOOKS_PER_PAGE);
    let paginationContainer = document.getElementById("pagination-container");

    if (!paginationContainer) {
        paginationContainer = document.createElement('div');
        paginationContainer.id = 'pagination-container';
        paginationContainer.className = 'pagination-controls';
        
        const listSekcia = document.querySelector('.list-knih-sekcia');
        // Pridáme na koniec sekcie, ak existuje
        if (listSekcia) listSekcia.appendChild(paginationContainer);
        else document.body.appendChild(paginationContainer); 
    }

    paginationContainer.innerHTML = ''; 

    if (totalPages <= 1) return;

    // Tlačidlo Späť (Šípka <<)
    const prevButton = createPaginationButton("«", currentPage > 1, () => {
        currentPage--;
        renderBooks();
    });
    prevButton.classList.add('nav-arrow'); 
    paginationContainer.appendChild(prevButton);

    // Vytvorenie číselných strán (max 5 viditeľných)
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    
    // Zabezpečí, aby sa zobrazilo 5 stránok, ak je to možné
    if (endPage - startPage < maxPagesToShow - 1) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        const pageButton = createPaginationButton(i, true, () => {
            currentPage = i;
            renderBooks();
        });
        if (i === currentPage) {
            pageButton.classList.add('active');
        }
        paginationContainer.appendChild(pageButton);
    }

    // Tlačidlo Ďalej (Šípka >>)
    const nextButton = createPaginationButton("»", currentPage < totalPages, () => {
        currentPage++;
        renderBooks();
    });
    nextButton.classList.add('nav-arrow'); 
    paginationContainer.appendChild(nextButton);
    
    // Posunieme scroll na vrch pre lepšiu UX
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Pomocná funkcia na vytvorenie tlačidla.
 */
function createPaginationButton(text, isEnabled, onClick) {
    const button = document.createElement('button');
    button.textContent = text;
    button.disabled = !isEnabled;
    button.onclick = onClick;
    button.className = 'pagination-button';
    return button;
}

/**
 * Vykreslí zoznam kníh na základe filtrov a stránkovania.
 */
function renderBooks() {

    if (!currentUserId) {
        // Ak nie je používateľ prihlásený, nezobrazujeme knihy
        return;
    }

    const container = document.getElementById("zoznam-knih");
    container.innerHTML = "";
    
    // 1. Získanie aktívnych filtrov
    const filters = getFilters(); 

    // 2. FILTROVANIE DÁT PODĽA FILTROV A VYHĽADÁVANIA
    const filteredBooks = BOOKS.filter(book => {
        const owner = getOwner(book);
        let match = true;
        
        // Ak vlastník neexistuje, knihu ignorujeme
        if (!owner) return false;


        // Hlavný filter: Zobraziť iba vlastné knihy
        if ( book.owner_id !== currentUserId) {
             match = false;
        }

        // Filter 1: Dostupnosť (len-dostupne)
        if (filters.lenDostupne && book.status !== 'available') {
             match = false;
        }

        // Filter 2: Nedostupnosť/Požičané (len-nedostupne, status='unavailable')
        if (filters.lenNedostupne && book.status !== 'unavailable') {
             match = false;
        }

        // Filter 3: Zamknuté (len-zamknute)
        if (filters.lenZamknute && book.status !== 'locked') {
             match = false;
        }
        
        // Filter 4: Vyhľadávanie podľa Názvu 
        if (searchCommitted.nazov) {
            const searchName = searchCommitted.nazov.toLowerCase();
            if (!book.title.toLowerCase().includes(searchName)) {
                match = false;
            }
        }

        // Filter 5: Vyhľadávanie podľa Autora
        if (searchCommitted.autor) {
            const searchAuthor = searchCommitted.autor.toLowerCase();
            if (!book.autor.toLowerCase().includes(searchAuthor)) {
                match = false;
            }
        }


        return match;
    });

    const totalBooks = filteredBooks.length;
    
    // Korekcia stránky po filtrovaní
    const totalPages = Math.ceil(totalBooks / BOOKS_PER_PAGE);
    if (currentPage > totalPages && totalPages > 0) {
        currentPage = totalPages;
        renderBooks(); 
        return;
    }
    
    // 3. Aplikovanie stránkovania
    const startIndex = (currentPage - 1) * BOOKS_PER_PAGE;
    const endIndex = startIndex + BOOKS_PER_PAGE;
    const booksToRender = filteredBooks.slice(startIndex, endIndex);

    // 4. Vykreslenie kariet
    if (booksToRender.length === 0 && totalBooks > 0) {
        container.innerHTML = `<p class="no-results">Na aktuálnej stránke sa nenašli žiadne výsledky.</p>`;
    } else if (totalBooks === 0) {
        container.innerHTML = `<p class="no-results">Žiadne knihy nespĺňajú kritériá filtrovania.</p>`;
    } else {
        booksToRender.forEach(book => {
            const card = document.createElement("div");
            card.className = "karta-knihy";
            
            const lok = isBooklok(book); // Aktuálny stav knihy

            // Určíme, aká ikona a text bude na tlačidle.
            // Unavailable (Požičaná) kniha sa nedá prepínať.
            const isLocked = lok === 'locked';
            const buttonIcon = isLocked ? '🔓' : '🔒'; 
            const buttonVisible = lok !== 'unavailable' ? 'visible' : 'hidden'; 

            card.innerHTML = `
                <h4>${book.title}</h4>
                <div class="karta-content">
                    <img src="${book.image_url}" alt="" width="130" height="200">
                    <div class="karta-info">
                        <p>Autor: ${book.autor}</p>
                        
                                                <div class="book-status ${lok}">
                            ${iconForStateL(lok)}
                        </div>
                        
                                                <button 
                            id="btn-forbook-${book.id}"
                            class="updateButton" 
                            onclick="window.ChangeA(${book.id});"                       
                            style="visibility: ${buttonVisible}"
                        >                   
                            ${buttonIcon} 
                        </button>
                    </div>
                </div>
            `;

            container.appendChild(card);
        });
    }

    // 5. Vykreslenie stránkovania
    renderPagination(totalBooks);
}          

function displayLoginRequired() {
 
    // Skryjeme formulár filtrovania a vyhľadávania
    const hlavnyPanel = document.querySelector('.hlavny-panel');
    if (hlavnyPanel) hlavnyPanel.style.display = 'none';

    const vysledkyNadpis = document.getElementById("vysledky-nadpis");
    if (vysledkyNadpis) vysledkyNadpis.textContent = 'Moje knihy - Vyžaduje prihlásenie';
    
    // Vymažeme stránkovanie
    const paginationContainer = document.getElementById("pagination-container");
    if (paginationContainer) paginationContainer.innerHTML = '';
}

// ===================================================
// LOGIKA FILTROV A ZOBRAZENIE ZNAČIEK
// ===================================================

function getFilters() {
    const result = {};
   
    const lenDostupne = document.getElementById("len-dostupne").checked;
    if (lenDostupne) result["lenDostupne"] = true;

    // Len požičané (status: unavailable)
    const lenNedostupne = document.getElementById("len-nedostupne").checked;
    if (lenNedostupne) result["lenNedostupne"] = true;

    const lenZamknute = document.getElementById("len-zamknute").checked;
    if (lenZamknute) result["lenZamknute"] = true;
    
    // Vyhľadávanie je prenesené do searchCommitted z event listenerov
    if (searchCommitted.nazov) result["nazov"] = searchCommitted.nazov;
    if (searchCommitted.autor) result["autor"] = searchCommitted.autor;

    return result;
}

function renderActiveFilters() {
    if (!currentUserId) return; // Ak nie je prihlásený, nerenderujeme filtre

    const filters = getFilters();
    const container = document.getElementById("vypis");
    const nadpis = document.getElementById("vysledky-nadpis");
    container.innerHTML = "";

    let activeCount = 0;

    // Po zmene filtrov resetujeme stránku na 1
    currentPage = 1; 

    // Vykreslenie odznakov filtrov
    for (const key in filters) {
        const value = filters[key];
        if (typeof value === 'boolean') {
            createBadge(key, key); // Použijeme kľúč aj ako hodnotu pre boolean filtre
        } else {
            createBadge(key, value);
        }
    }

    function createBadge(key, value) {
        activeCount++;
        const badge = document.createElement("span");
        badge.className = "filter-badge";

        let text = value;

        if (key === "lenDostupne") text = "len dostupné";
        if (key === "lenNedostupne") text = "len požičané"; 
        if (key === "lenZamknute") text = "len zamknuté";
        if (key === "nazov") text = `Názov: ${value}`;
        if (key === "autor") text = `Autor: ${value}`;


        badge.textContent = text + " ";

        const x = document.createElement("span");
        x.className = "close-x";
        x.innerHTML = "&times;";
        x.onclick = () => uncheckByKey(key, value);

        badge.appendChild(x);
        container.appendChild(badge);
    }

    nadpis.textContent = activeCount === 0 ? "Všetky tituly" : "Výsledky pre:";

    const btn = document.getElementById("vymaz-filtre");
    btn.style.display = activeCount >= 1 ? "block" : "none";
    
    // Spustíme renderovanie kníh s novými filtrami a stránkovaním
    renderBooks(); 
}

function uncheckByKey(key, value) {
    // Zrušenie checkboxov
    if (key === "lenDostupne") {
        document.getElementById("len-dostupne").checked = false;
    } else if (key === "lenNedostupne") {
        document.getElementById("len-nedostupne").checked = false;
    } else if (key === "lenZamknute") {
        document.getElementById("len-zamknute").checked = false;
    }

    // Zrušenie vyhľadávania
    if (key === "nazov") {
        searchCommitted.nazov = "";
        document.getElementById("nazov").value = "";
    } else if (key === "autor") {
        searchCommitted.autor = "";
        document.getElementById("autor").value = "";
    }

    renderActiveFilters(); // Vola renderBooks
}

function deleteFilters() {
    document.querySelectorAll('input[type="checkbox"]:checked').forEach(ch => ch.checked = false);

    // Vymazanie vyhľadávania
    searchCommitted.nazov = "";
    searchCommitted.autor = "";

    document.getElementById("nazov").value = "";
    document.getElementById("autor").value = "";
    
    renderActiveFilters(); // Vola renderBooks
}

// ===================================================
// EVENT LISTENERS A INICIALIZÁCIA
// ===================================================

document.addEventListener("input", function(e) {
    // Spustí prekreslenie pri zmene checkboxov
    if (e.target.type === "checkbox") {
        renderActiveFilters(); // Vola renderBooks
    }
});

document.addEventListener("keydown", function(e) {
    // Vyhľadávanie sa vykoná po stlačení Enter
    if (e.key === "Enter") {
        if (e.target.id === "nazov") {
            searchCommitted.nazov = e.target.value.trim();
            renderActiveFilters();
        }
        if (e.target.id === "autor") {
            searchCommitted.autor = e.target.value.trim();
            renderActiveFilters();
        }
    }
});

document.getElementById("hladaj").addEventListener("click", () => {
    // Vyhľadávanie sa vykoná aj po stlačení tlačidla "Hľadaj"
    searchCommitted.nazov = document.getElementById("nazov").value.trim();
    searchCommitted.autor = document.getElementById("autor").value.trim();
    renderActiveFilters();
});

document.getElementById("vymaz-filtre").addEventListener("click", deleteFilters);


// ===================================================
// ŠTARTOVACÍ KÓD
// ===================================================

function initializePage() {
    const userJSONString = localStorage.getItem("currentUser");
    
    if (userJSONString) {
        try {
            currentUser = JSON.parse(userJSONString);
            currentUserId = currentUser.id;
            
            // Zobrazíme hlavný panel a spustíme renderovanie
            const hlavnyPanel = document.querySelector('.hlavny-panel');
            if (hlavnyPanel) hlavnyPanel.style.display = 'flex';
            
            const vysledkyNadpis = document.getElementById("vysledky-nadpis");
            if (vysledkyNadpis) vysledkyNadpis.textContent = 'Všetky tituly';

            renderActiveFilters(); 

            // Nastavenie modálneho okna s detailom knihy (len ak je user prihlásený)
            setupBookDetailModal(USERS, BOOKS); 

        } catch (e) {
            console.error("Chyba pri parsovaní currentUser z localStorage:", e);
            displayLoginRequired();
        }
    } else {
        // Zobrazenie správy pre neprihlásených používateľov
        displayLoginRequired();
    }
}

initializePage();
// ===================================================

// ===================================================
// LOGIKA ZAMYKANIE/ODOMYKANIE (PREPÍNANIE STAVU)
// ===================================================

// Funkcia pre volanie z HTML (onclick)
window.ChangeA = function(bookId) {
    const book = BOOKS.find(b => b.id === bookId);

    if (!book) {
        console.error("Kniha s ID " + bookId + " nebola nájdená.");
        return;
    }

    // Kontrola vlastníctva
    if (book.owner_id !== currentUserId){
        console.error("Chyba: Pokus o zmenu knihy cudzieho používateľa.");
        return;
    }
    
    if (book.status === 'unavailable') {
        console.warn("Kniha je požičaná, stav sa nedá zmeniť.");
        return;
    }

    let btn = null;
    let newStatus = '';
    
    try {
        btn = document.getElementById(`btn-forbook-${bookId}`);
        if (!btn) throw new Error("Button not found");

        // --- INSTANT UI UPDATE ---
        if (book.status === "locked") {
            // Odomknúť: locked -> available
            btn.textContent = "🔒";   
            book.status = "available";
            newStatus = "available";
        } else if (book.status === "available") {
            // Zamknúť: available -> locked
            btn.textContent = "🔓";   
            book.status = "locked";
            newStatus = "locked";
        }

        // Zamedzenie viacnásobnému kliknutiu
        btn.disabled = true;

    } catch (uiError) {
        console.warn("UI update failed in ChangeA:", uiError);
    }

    // Toto mení v databáze (asynchrónna operácia)
    if (newStatus) {
        toggleBookAvailability(bookId, newStatus); 
    }
    
    renderBooks(); 
};


// Pomocná funkcia na zistenie NOVÉHO stavu (ponechaná, aj keď priamo nepoužitá)
function xyz(x){
        let s = String(x)
        switch (s){
            case "locked":
                return "available";
            case "available":
                return "locked";
            default:
                return s; // Necháva iné stavy (unavailable) nezmenené
            }
}


// Toto mení dáta v firebase
async function toggleBookAvailability(id, newStatus) {
  // Reference to the Firestore document for the specific book
  id = String(id)
  const bookRef = doc(db, "books", id);
  let btn = document.getElementById(`btn-forbook-${id}`);

  try {
    // Aktualizovať status vo Firestore
    await updateDoc(bookRef, { status: newStatus });

    console.log(`Kniha ${id} dostupnosť bola aktualizovaná na ${newStatus}`);

  } catch (error) {
    console.error("Chyba pri aktualizácii dostupnosti knihy:", error);
  } finally {
    // Po dokončení DB operácie znovu povoliť tlačidlo
    if (btn) btn.disabled = false;
    
    // Re-render pre zabezpečenie synchronizácie 
    renderBooks() ;
  }
}