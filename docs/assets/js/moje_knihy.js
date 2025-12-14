import { setupBookDetailModal, openEditBookModal, closeEditBookModal, enableEdit, editChangeImage, saveEditedBook } from "./book_detail_modal.js";
import { USERS } from "./api/allData.js";
import { BOOKS, BOOK_GENRES, BOOK_LANGS } from "./api/allData.js";

// Importy pre Firebase (ak sa používajú pre ukladanie stavu knihy)
import { db } from "./firebase.js"; 
import { doc, updateDoc } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

// --- GLOBÁLNE PREMENNÉ ---
let AVAILABLE_CITIES = []; 
let selectedCityFilter = ""; 
let searchCommitted = { nazov: "", autor: "" }; 
let currentUser = null; 
let currentUserId = null; 


// ===================================================
// POMOCNÉ FUNKCIE (PRE KNIHY A VLASTNÍKOV)
// ===================================================

// (Funkcie getOwner, isBooklok, iconForStateL sú rovnaké)

function getOwner(book) {
    return USERS.find(u => u.id === book.owner_id) || null;
}

function isBooklok(book) {
   return String(book.status );
}

function iconForStateL(status) {
    switch (status) {
        case 'available':
            return '&#9989; Dostupná'; 
        case 'unavailable':
            return '&#10060; Požičaná'; 
        case 'locked':
            return '&#128274; Zamknutá'; 
        default:
            return status;
    }
}


// ===================================================
// FUNKCIE PRE MODALY (OPRAVA PRE KLIKANIE Z HTML)
// ===================================================

/**
 * OPRAVA: Funkcie musia byť definované vo window objekte, 
 * aby ich mohol spustiť onclick event z HTML, 
 * pretože tento súbor je importovaný ako modul.
 */
window.openNewBookModal = function() {
    const modal = document.getElementById("newBookModal");
    if (modal) {
        modal.classList.add("active");
        modal.style.display = "flex";
    } else {
        console.error("Chyba: Modál s ID 'newBookModal' nebol nájdený v DOM.");
    }
}

window.closeNewBookModal = function() {
    const modal = document.getElementById("newBookModal");
    if (modal) {
        modal.classList.remove("active");
        modal.style.display = "none";
    }
}

// Ostatné funkcie pre Edit Modal sú exportované z book_detail_modal.js,
// ale pre istotu ich opäť prepojíme s globálnym window objektom:
window.openEditModal = openEditBookModal; 
window.closeEditBookModal = closeEditBookModal;
window.enableEdit = enableEdit; 
window.editChangeImage = editChangeImage;
window.saveEditedBook = saveEditedBook;
window.changeNewBookImage = function() { console.log('Change new book image clicked'); }
window.saveNewBook = function() { console.log('Save new book clicked'); closeNewBookModal(); }


// ===================================================
// VYKRESLOVANIE (RENDERBOOKS)
// ===================================================

function renderBooks() {

    if (!currentUserId) {
        return;
    }

    const container = document.getElementById("zoznam-knih");
    container.innerHTML = "";
    
    const filters = getFilters(); 

    const filteredBooks = BOOKS.filter(book => {
        const owner = USERS.find(u => u.id === book.owner_id);
        let match = true;
        
        if (!owner) return false;
        
        // Zobraziť iba vlastné knihy
        if ( book.owner_id !== currentUserId) {
            match = false;
        }

        // Filtre
        if (filters.lenDostupne && book.status !== 'available') match = false;
        if (filters.lenNedostupne && book.status !== 'unavailable') match = false;
        if (filters.lenZamknute && book.status !== 'locked') match = false;
        
        // Vyhľadávanie
        if (searchCommitted.nazov) {
            if (!book.title.toLowerCase().includes(searchCommitted.nazov.toLowerCase())) match = false;
        }
        if (searchCommitted.autor) {
            if (!book.autor.toLowerCase().includes(searchCommitted.autor.toLowerCase())) match = false;
        }

        return match;
    });

    const totalBooks = filteredBooks.length;
    const booksToRender = filteredBooks;

    if (booksToRender.length === 0 && totalBooks === 0) {
        container.innerHTML = `<p class="no-results">Žiadne knihy nespĺňajú kritériá filtrovania.</p>`;
    } else {
        booksToRender.forEach(book => {
            const card = document.createElement("div");
            card.className = "karta-knihy";
            
            const lok = isBooklok(book); 
            
            // Logika ikon a tlačidiel
            const isLocked = lok === 'locked';
            const buttonIcon = isLocked ? '&#x1f513;' : '&#x1f512;'; // 🔓 vs 🔒
            const tooltipText = isLocked ? 'Odomknúť knihu (Dostupná)' : 'Zamknúť knihu (Nepožičiavaš)';
            const buttonDisabled = lok === 'unavailable'; 
            
            card.innerHTML = `
                <h4>${book.title}</h4>
                <div class="karta-content">
                    <img src="${book.image_url}" alt="" width="130" height="200">
                    <div class="karta-info">
                        <p>Autor: ${book.autor}</p>
                        <p>Žáner: ${book.type}</p>
                        <p>Jazyk: ${book.language}</p>
                        
                        <div class="book-status ${lok}">
                            ${iconForStateL(lok)}
                        </div>
                        
                        <div class="action-buttons">
                            <button 
                                id="btn-edit-${book.id}"
                                class="btn-edit" 
                                onclick="window.openEditModal(${book.id})"
                            >
                                Upraviť knihu
                            </button>
                            
                            <button 
                                id="btn-forbook-${book.id}"
                                class="btn-lock" 
                                onclick="window.ChangeA(${book.id});" 
                                data-tooltip="${tooltipText}"
                                ${buttonDisabled ? 'disabled' : ''}
                            > 
                                ${buttonIcon} 
                            </button>
                        </div>
                    </div>
                </div>
            `;

            container.appendChild(card);
        });
    }
}          

function displayLoginRequired() {
    const hlavnyPanel = document.querySelector('.hlavny-panel');
    if (hlavnyPanel) hlavnyPanel.style.display = 'none';

    const vysledkyNadpis = document.getElementById("vysledky-nadpis");
    if (vysledkyNadpis) vysledkyNadpis.textContent = 'Moje knihy - Vyžaduje prihlásenie';
    
    const paginationContainer = document.getElementById("pagination-container");
    if (paginationContainer) paginationContainer.innerHTML = '';
}

// ===================================================
// LOGIKA FILTROV A ZOBRAZENIE ZNAČIEK (PÔVODNÁ)
// ===================================================

function getFilters() {
    const result = {};
   
    const lenDostupne = document.getElementById("len-dostupne").checked;
    if (lenDostupne) result["lenDostupne"] = true;

    const lenNedostupne = document.getElementById("len-nedostupne").checked;
    if (lenNedostupne) result["lenNedostupne"] = true;

    const lenZamknute = document.getElementById("len-zamknute").checked;
    if (lenZamknute) result["lenZamknute"] = true;
    
    if (searchCommitted.nazov) result["nazov"] = searchCommitted.nazov;
    if (searchCommitted.autor) result["autor"] = searchCommitted.autor;

    return result;
}

function renderActiveFilters() {
    if (!currentUserId) return; 

    const filters = getFilters();
    const container = document.getElementById("vypis");
    const nadpis = document.getElementById("vysledky-nadpis");
    container.innerHTML = "";

    let activeCount = 0;

    for (const key in filters) {
        const value = filters[key];
        if (typeof value === 'boolean') {
            createBadge(key, key); 
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
    
    renderBooks(); 
}

function uncheckByKey(key, value) {
    if (key === "lenDostupne") {
        document.getElementById("len-dostupne").checked = false;
    } else if (key === "lenNedostupne") {
        document.getElementById("len-nedostupne").checked = false;
    } else if (key === "lenZamknute") {
        document.getElementById("len-zamknute").checked = false;
    }

    if (key === "nazov") {
        searchCommitted.nazov = "";
        document.getElementById("nazov").value = "";
    } else if (key === "autor") {
        searchCommitted.autor = "";
        document.getElementById("autor").value = "";
    }

    renderActiveFilters(); 
}

function deleteFilters() {
    document.querySelectorAll('input[type="checkbox"]:checked').forEach(ch => ch.checked = false);

    searchCommitted.nazov = "";
    searchCommitted.autor = "";

    document.getElementById("nazov").value = "";
    document.getElementById("autor").value = "";
    
    renderActiveFilters(); 
}

// ===================================================
// EVENT LISTENERS A INICIALIZÁCIA
// ===================================================

document.addEventListener("input", function(e) {
    if (e.target.type === "checkbox") {
        renderActiveFilters(); 
    }
});

document.addEventListener("keydown", function(e) {
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
            
            const hlavnyPanel = document.querySelector('.hlavny-panel');
            if (hlavnyPanel) hlavnyPanel.style.display = 'flex';
            
            const vysledkyNadpis = document.getElementById("vysledky-nadpis");
            if (vysledkyNadpis) vysledkyNadpis.textContent = 'Všetky tituly';

            renderActiveFilters(); 

            // Uistite sa, že setupBookDetailModal je volaný
            setupBookDetailModal(USERS, BOOKS); 

        } catch (e) {
            console.error("Chyba pri parsovaní currentUser z localStorage:", e);
            displayLoginRequired();
        }
    } else {
        displayLoginRequired();
    }
}

initializePage();
// ===================================================


// ===================================================
// LOGIKA ZAMYKANIE/ODOMYKANIE (PÔVODNÁ)
// ===================================================

window.ChangeA = function(bookId) {
    const book = BOOKS.find(b => b.id === bookId);

    if (!book) {
        console.error("Kniha s ID " + bookId + " nebola nájdená.");
        return;
    }

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
        
        if (book.status === "locked") {
            book.status = "available";
            newStatus = "available";
        } else if (book.status === "available") {
            book.status = "locked";
            newStatus = "locked";
        }

        if (btn) btn.disabled = true;

    } catch (uiError) {
        console.warn("UI update failed in ChangeA:", uiError);
    }

    if (newStatus) {
        toggleBookAvailability(bookId, newStatus); 
    }
    
    renderBooks(); 
};

async function toggleBookAvailability(id, newStatus) {
    id = String(id)
    const bookRef = doc(db, "books", id);
    let btn = document.getElementById(`btn-forbook-${id}`);

    try {
        await updateDoc(bookRef, { status: newStatus });

        console.log(`Kniha ${id} dostupnosť bola aktualizovaná na ${newStatus}`);

    } catch (error) {
        console.error("Chyba pri aktualizácii dostupnosti knihy:", error);
    } finally {
        if (btn) btn.disabled = false;
        renderBooks() ;
    }
}