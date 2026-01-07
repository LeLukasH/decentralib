import { setupBookDetailModal } from "./book_detail_modal.js";
import { USERS, BOOKS, BOOK_GENRES, BOOK_LANGS } from "./api/allData.js";
import { renderUserLink } from "./utils.js";

// --- GLOBÁLNE PREMENNÉ ---
let AVAILABLE_CITIES = []; 
let selectedCityFilter = ""; 
let searchCommitted = { nazov: "", autor: "" }; 

console.log(BOOKS)
console.log(USERS);


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
        // Ak kontajner ešte neexistuje, vytvoríme ho
        paginationContainer = document.createElement('div');
        paginationContainer.id = 'pagination-container';
        paginationContainer.className = 'pagination-controls';
        
        const listSekcia = document.querySelector('.list-knih-sekcia');
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
    prevButton.classList.add('nav-arrow'); // Pre špeciálny štýl šípky
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
    nextButton.classList.add('nav-arrow'); // Pre špeciálny štýl šípky
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

function renderBooks() {
    const container = document.getElementById("zoznam-knih");
    container.innerHTML = "";
    
    // 1. Získanie aktívnych filtrov
    const filters = getFilters(); 

    // 2. FILTROVANIE DÁT PODĽA FILTROV
    const filteredBooks = BOOKS.filter(book => {
        const owner = getOwner(book);

        // Default filter: ignoruj knihy, ktoré sú locked
        if (book.status === 'locked') return false;

        let match = true;
        
        // Ak vlastník neexistuje, knihu ignorujeme
        if (!owner) return false;

        // Ak ja som vlastnik, ignoruj moju knihu
        var currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser != null && owner.id === currentUser.id) return false;

        // Filter: Dostupnosť
        if (filters.lenDostupne && book.status !== 'available') {
             match = false;
        }

        // Filter: Žáner
        if (filters.zaner && filters.zaner.length > 0 && !filters.zaner.includes(book.type)) {
            match = false;
        }
        
        // Filter: Jazyk
        if (filters.jazyk && filters.jazyk.length > 0 && !filters.jazyk.includes(book.language)) {
            match = false;
        }

        // Filter: Mesto
        if (filters.mesto && owner.location !== filters.mesto) {
             match = false;
        }

        // Filter: Hodnotenie
        const minRating = parseFloat(filters.hodnotenie);
        if (minRating > 0 && parseFloat(owner.reputation) < minRating) {
            match = false;
        }
        
        // Filter: Názov (Vyhľadávanie)
        if (filters.nazov && !book.title.toLowerCase().includes(filters.nazov.toLowerCase())) {
             match = false;
        }
        
        // Filter: Autor (Vyhľadávanie)
        if (filters.autor && !book.autor.toLowerCase().includes(filters.autor.toLowerCase())) {
             match = false;
        }
        
        return match;
    });
    console.log("Filtered Books:", filteredBooks);
    const totalBooks = filteredBooks.length;
    
    // Korekcia stránky po filtrovaní (ak sme na neexistujúcej stránke)
    const totalPages = Math.ceil(totalBooks / BOOKS_PER_PAGE);
    if (currentPage > totalPages && totalPages > 0) {
        currentPage = totalPages;
        // Rekurzívne zavolanie, aby sa aplikovala opravená stránka
        renderBooks(); 
        return;
    }
    
    // 3. Aplikovanie stránkovania
    const startIndex = (currentPage - 1) * BOOKS_PER_PAGE;
    const endIndex = startIndex + BOOKS_PER_PAGE;
    const booksToRender = filteredBooks.slice(startIndex, endIndex);

    
    // 4. Vykreslenie kariet
    if (booksToRender.length === 0 && totalBooks > 0) {
        // Ak sa na aktuálnej stránke nič nenašlo (ale celkovo existujú knihy, napr. sme preklikli na prázdnu stranu)
        container.innerHTML = `<p class="no-results">Na aktuálnej stránke sa nenašli žiadne výsledky.</p>`;
    } else if (totalBooks === 0) {
        container.innerHTML = `<p class="no-results">Žiadne knihy nespĺňajú kritériá filtrovania.</p>`;
    } else {
        booksToRender.forEach(book => {
            const card = document.createElement("div");
            card.className = "karta-knihy";
            const dostupne = getBookStatus(book) === "available";
            const owner = getOwner(book);
            var currentUser = JSON.parse(localStorage.getItem('currentUser'));
            const disableButton = (currentUser == null) || (currentUser != null && owner.id === currentUser.id);
            console.log(disableButton);

            card.innerHTML = `
                <h4>${book.title}</h4>
                <div class="karta-content">
                    <img src="${book.image_url}" alt="" width="130" height="200">
                    <div class="karta-info">
                        <p>${book.autor}</p>
                        ${renderUserLink(book.owner_id, true)}
                        <p>${getOwnerLocation(book)}</p>
                        ${dostupne 
                            ? `<button class="btn-borrow" onclick="window.openQuickBorrow(${book.id})" ${disableButton ? `disabled` : ``} >
                                Požičaj
                            </button>`
                            : `<div class="unavailable">
                                Požičané
                            </div>`
                        }
                        <button class="btn-detail" onclick="window.showBookDetail(${book.id})">
                            Zobraziť detail
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

function generateFilterOptions() {
    const genreContainer = document.getElementById("dropdown-zaner");
    genreContainer.innerHTML = "";
    var genres = "";
    BOOK_GENRES.forEach(g => {
        genres += `
            <div class="option">
                <input type="checkbox" value="${g}"> ${g}
            </div>
        `;
    });
    genreContainer.innerHTML = genres;

    const languageContainer = document.getElementById("dropdown-jazyk");
    languageContainer.innerHTML = "";
    var languages = "";
    BOOK_LANGS.forEach(l => {
        languages += `
            <div class="option">
                <input type="checkbox" value="${l}"> ${l}
            </div>
        `;
    });
    languageContainer.innerHTML = languages;
}


// ===================================================
// LOGIKA FILTROV A ZOBRAZENIE ZNAČIEK
// ===================================================

function getFilters() {
    const result = {};

    const groups = document.querySelectorAll(".filter-skupina[data-filter='zaner'], .filter-skupina[data-filter='jazyk']");
    groups.forEach(group => {
        const name = group.dataset.filter;
        const checked = group.querySelectorAll('input[type="checkbox"]:checked');
        const values = Array.from(checked).map(ch => ch.value);
        if (values.length > 0) result[name] = values;
    });
    
    const lenDostupne = document.getElementById("len-dostupne").checked;
    if (lenDostupne) result["lenDostupne"] = true;
    
    const rating = document.getElementById("hodnotenie").value;
    if (rating !== "0") result["hodnotenie"] = rating;
    
    // Filter Mesto
    if (selectedCityFilter !== "") result["mesto"] = selectedCityFilter;

    if (searchCommitted.nazov !== "") result["nazov"] = searchCommitted.nazov;
    if (searchCommitted.autor !== "") result["autor"] = searchCommitted.autor;

    return result;
}

function renderActiveFilters() {
    const filters = getFilters();
    const container = document.getElementById("vypis");
    const nadpis = document.getElementById("vysledky-nadpis");
    container.innerHTML = "";

    let activeCount = 0;

    // Po zmene filtrov resetujeme stránku na 1
    currentPage = 1; 

    for (const key in filters) {
        const value = filters[key];

        if (Array.isArray(value)) {
            value.forEach(v => createBadge(key, v));
        } else {
            createBadge(key, value);
        }
    }

    function createBadge(key, value) {
        activeCount++;
        const badge = document.createElement("span");
        badge.className = "filter-badge";

        let text = value;

        if (key === "hodnotenie") text = `hodnotenie: ${value}+`;
        if (key === "lenDostupne") text = "len dostupné";
        if (key === "mesto") text = `Mesto: ${value}`; 
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
    if (key === "lenDostupne") {
        document.getElementById("len-dostupne").checked = false;
    }

    if (key === "hodnotenie") {
        document.getElementById("hodnotenie").value = 0;
    }

    if (key === "nazov") {
        searchCommitted.nazov = "";
        document.querySelector('input[placeholder="Názov"]').value = "";
    }

    if (key === "autor") {
        searchCommitted.autor = "";
        document.querySelector('input[placeholder="Autor"]').value = "";
    }

    // ZRUŠENIE FILTRA MESTA
    if (key === "mesto") { 
        selectedCityFilter = "";
        document.getElementById("autocomplete-mesto").value = "";
        document.getElementById("autocomplete-mesto-results").style.display = "none";
    }

    // Zrušenie checkboxov (žáner, jazyk)
    const checkbox = document.querySelector(`input[type="checkbox"][value="${value}"]`);
    if (checkbox) checkbox.checked = false;

    renderActiveFilters(); // Vola renderBooks
}

function deleteFilters() {
    document.querySelectorAll('input[type="checkbox"]:checked').forEach(ch => ch.checked = false);

    document.getElementById("hodnotenie").value = 0;
    
    // Vymazanie Autocomplete Mesta
    selectedCityFilter = "";
    const cityInput = document.getElementById("autocomplete-mesto");
    if (cityInput) cityInput.value = "";
    document.getElementById("autocomplete-mesto-results").style.display = "none";
    
    searchCommitted.nazov = "";
    searchCommitted.autor = "";

    document.querySelector('input[placeholder="Názov"]').value = "";
    document.querySelector('input[placeholder="Autor"]').value = "";

    renderActiveFilters(); // Vola renderBooks
}

// ===================================================
// LOGIKA MESTO AUTCOMPLETE
// ===================================================

function getAvailableCities() {
    const availableOwnerIds = new Set(
        BOOKS.filter(book => book.status === "available" && book.status !== "locked")
             .map(book => book.owner_id)
    );

    const cities = USERS.filter(user => availableOwnerIds.has(user.id))
                        .map(user => user.location);

    AVAILABLE_CITIES = [...new Set(cities)].sort();
}

function handleCityAutocomplete(event) {
    const input = event.target;
    const value = input.value.trim().toLowerCase();
    const resultsContainer = document.getElementById("autocomplete-mesto-results");
    
    resultsContainer.innerHTML = "";
    
    if (value.length < 3) {
        resultsContainer.style.display = "none";
        // Ak sa input vyprázdni, filter zrušíme
        if (selectedCityFilter !== "" && value.length === 0) {
            selectedCityFilter = ""; 
            renderActiveFilters(); 
        }
        return; 
    }
    
    const filteredCities = AVAILABLE_CITIES.filter(city => {
        if (typeof city !== 'string' || city === null || city.trim() === '') {
            return false; 
        }

        return city.toLowerCase().includes(value); 
    });
    
    if (filteredCities.length > 0) {
        filteredCities.forEach(city => {
            const option = document.createElement("div");
            option.className = "autocomplete-option";
            option.textContent = city;
            
            option.onclick = () => {
                input.value = city;
                selectedCityFilter = city; 
                resultsContainer.style.display = "none";
                renderActiveFilters(); // Vola renderBooks
            };
            resultsContainer.appendChild(option);
        });
        resultsContainer.style.display = "block";
    } else {
        resultsContainer.style.display = "none";
    }
}


// ===================================================
// EVENT LISTENERS A INICIALIZÁCIA
// ===================================================

function toggleFilter(header) {
    const body = header.nextElementSibling;
    header.classList.toggle("open");
    body.style.display = body.style.display === "block" ? "none" : "block";
}

document.addEventListener("input", function(e) {
    // Spustí prekreslenie pri zmene checkboxov, number inputoch (hodnotenie)
    if (e.target.type === "checkbox" || e.target.type === "number" || e.target.id === "hodnotenie") {
        renderActiveFilters(); // Vola renderBooks
    }
});

document.addEventListener("keydown", function(e) {
    if (e.key === "Enter") {
        if (e.target.placeholder === "Názov") {
            searchCommitted.nazov = e.target.value.trim();
        }
        if (e.target.placeholder === "Autor") {
            searchCommitted.autor = e.target.value.trim();
        }
        renderActiveFilters(); // Vola renderBooks
    }
});

document.getElementById("hladaj-home").addEventListener("click", () => {
    searchCommitted.nazov = document.getElementById("nazov-home").value.trim();
    searchCommitted.autor = document.getElementById("autor-home").value.trim();
    renderActiveFilters();
});

document.querySelectorAll(".dropdown-header").forEach(header => {
    header.addEventListener("click", () => toggleFilter(header));
});

document.getElementById("vymaz-filtre").addEventListener("click", deleteFilters);

// --- LISTENERY PRE MESTO AUTCOMPLETE ---
document.getElementById("autocomplete-mesto").addEventListener("input", handleCityAutocomplete);

// Skryť výsledky mesta, ak používateľ klikne mimo nich
document.addEventListener('click', function(e) {
    const cityContainer = document.querySelector(".filter-skupina[data-filter='mesto']");
    if (cityContainer && !cityContainer.contains(e.target)) {
        const results = document.getElementById("autocomplete-mesto-results");
        if (results) results.style.display = "none";
    }
});

// ==================================================
// RESPONZÍVNY FILTER
// ==================================================

const filter_button = document.getElementById('home-filter');
const filter_orgin = document.querySelector('.filter');

const MOBILE_WIDTH = 800; // breakpoint


// Funkcia: nastaví filter pod tlačidlo
function positionFilter() {
    if (!filter_orgin.classList.contains("open")) return; // Nerob nič, ak filter nie je otvorený

    const rect = filter_button.getBoundingClientRect();

    filter_orgin.style.position = "absolute";
    filter_orgin.style.top = (rect.bottom + window.scrollY) + "px";
    filter_orgin.style.left = (rect.left + window.scrollX) + "px";
}

function resetFilterStyles() {
    filter_orgin.style.position = "";
    filter_orgin.style.top = "";
    filter_orgin.style.left = "";
    //filter_orgin.style.width = "";
    //filter_orgin.style.display = "";
}

filter_button.addEventListener('click', () => {
    filter_orgin.classList.toggle('open');
    if (filter_button.textContent === 'Zobraz filter') {
        filter_button.textContent = 'Skry filter';
    } else {
        filter_button.textContent = 'Zobraz filter';
    }
    if (filter_orgin.classList.contains("open")) {
        positionFilter();
    }
});

// Automatické reposition pri zmene veľkosti okna
window.addEventListener("resize", () => {
    if (window.innerWidth <= MOBILE_WIDTH) {
        positionFilter();
    } else {
        filter_orgin.classList.remove("open");
        filter_button.textContent = 'Zobraz filter';
        resetFilterStyles();
    }
});

// ===================================================
// ŠTARTOVACÍ KÓD
// ===================================================
getAvailableCities(); 
generateFilterOptions(); 
renderActiveFilters(); // Spustí prvé renderovanie kníh, filtrov a stránkovania


setupBookDetailModal(USERS, BOOKS);