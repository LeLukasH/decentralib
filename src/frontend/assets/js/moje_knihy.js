import { setupBookDetailModal } from "./book_detail_modal.js";
import { USERS } from "./api/users.js";
import { BOOKS, BOOK_GENRES, BOOK_LANGS } from "./api/books.js";

// --- GLOBÁLNE PREMENNÉ ---
let AVAILABLE_CITIES = []; 
let selectedCityFilter = ""; 
let searchCommitted = { nazov: "", autor: "" }; 

// --- PRE STRÁNKOVANIE ---
const BOOKS_PER_PAGE = 18;
let currentPage = 1;

// --- AKTUÁLNY POUŽÍVATEĽ
let currentUser = JSON.parse(localStorage.getItem('currentUser'));
console.log(currentUser);

// --- PREMENNÉ PRE VYMAZANIE A ZMENU KNIHY
let bookToDelete = null;
let editBookImageFile = null;
let editingBookId = null;

// -------------------------

// ===================================================
// POMOCNÉ FUNKCIE (PRE KNIHY A VLASTNÍKOV)
// ===================================================

function getOwner(book) {
    // Vráti objekt používateľa alebo null
    return USERS.find(u => u.id === book.owner_id) || null;
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

function getIcon(state){
    switch (state) {
        case "locked": 
            return "&#128274";
        case "available":       
            return "&#9989";
        case "booked":     
            return "&#10060";
        default:
            return "";
    }
}

function getContent(book){
    switch (book.is_available) {
        case "locked":      
            return `<button class="button-state" onclick="unlock(${book.id})">Odomknúť &#128275</button>`;
        case "available":       
            return `<button class="button-state" onclick="lock(${book.id})">Zamknúť &#128274</button>`;
        case "booked":     
            return `<br>Doba výpožičky: <br>
                    (tu bude dátum od do)`;
        default:            
            return "";
    }
}

function unlock(bookId){
    const book = BOOKS.find(b => b.id === bookId);
    if (!book) return;

    book.is_available = "available"; //zápis do databázy
    renderBooks();
}

function lock(bookId){
    const book = BOOKS.find(b => b.id === bookId);
    if (!book) return;

    book.is_available = "locked"; //zápis do databázy
    renderBooks();
}

window.lock = lock;
window.unlock = unlock;

function renderBooks() {
    const container = document.getElementById("zoznam-knih");
    container.innerHTML = "";
    
    // 1. Získanie aktívnych filtrov
    const filters = getFilters(); 

    // 2. FILTROVANIE DÁT PODĽA FILTROV
    const filteredBooks = BOOKS.filter(book => {
        const owner = getOwner(book);
        let match = true;
        
        // Ak vlastník neexistuje, knihu ignorujeme
        if (!owner) return false;

        if(currentUser.id !== book.owner_id){
            match = false;
        }

        // Filter: Dostupnosť
        if (filters.lenDostupne && book.is_available !== 'available') {
             match = false;
        }

        if (filters.lenPozicane && book.is_available !== 'booked') {
             match = false;
        }

        if (filters.lenZamknute && book.is_available !== 'locked') {
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
            let icon = getIcon(book.is_available);
            let content = getContent(book);

            card.innerHTML = `
                <h4 class="nazov-knihy">${book.title}</h4>
                <button class="delete-button" onclick="deleteBook(${book.id})">
                    <i class="fa fa-trash-o" style="font-size:20px; color:red"></i>
                </button>

                <div class="karta-content">
                    <img src="${book.image_url}" alt="" width="150" height="200">
                    <div class="karta-info">
                        <p>${book.autor}</p>
                        <p> <span style="font-size:30px;">${icon}</span> <br>${content}</p>
                        <p>
                        <button class="btn-detail" onclick="openEditBookModal(${book.id})">
                            Zobraziť detail
                        </button>
                        </p>
                    </div>
                </div>
            `;

            container.appendChild(card);
        });
    }

    // 5. Vykreslenie stránkovania
    renderPagination(totalBooks);
}          


// ===================================================
// LOGIKA FILTROV A ZOBRAZENIE ZNAČIEK
// ===================================================

function getFilters() {
    const result = {};
    
    const lenDostupne = document.getElementById("len-dostupne").checked;
    if (lenDostupne) result["lenDostupne"] = true;

    const lenPozicane = document.getElementById("len-pozicane").checked;
    if (lenPozicane) result["lenPozicane"] = true;

    const lenZamknute = document.getElementById("len-zamknute").checked;
    if (lenZamknute) result["lenZamknute"] = true;

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

        if (key === "lenDostupne") text = "len dostupné";
        if (key === "lenPozicane") text = "len požičané";
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
    if (key === "lenDostupne") {
        document.getElementById("len-dostupne").checked = false;
    }
    if (key === "lenPozicane") {
        document.getElementById("len-pozicane").checked = false;
    }
    if (key === "lenZamknute") {
        document.getElementById("len-zamknute").checked = false;
    }

    if (key === "nazov") {
        searchCommitted.nazov = "";
        document.querySelector('input[placeholder="Názov"]').value = "";
    }

    if (key === "autor") {
        searchCommitted.autor = "";
        document.querySelector('input[placeholder="Autor"]').value = "";
    }

    renderActiveFilters(); // Vola renderBooks
}

function deleteFilters() {
    document.querySelectorAll('input[type="checkbox"]:checked').forEach(ch => ch.checked = false);
    
    searchCommitted.nazov = "";
    searchCommitted.autor = "";

    document.querySelector('input[placeholder="Názov"]').value = "";
    document.querySelector('input[placeholder="Autor"]').value = "";

    renderActiveFilters(); // Vola renderBooks
}


// NOVÁ KNIHA
function changeNewBookImage() {
    // const input = document.createElement("input");
    // input.type = "file";
    // input.accept = "image/*";

    // input.onchange = () => {
    //     const file = input.files[0];
    //     if (!file) return;

    //     const reader = new FileReader();
    //     reader.onload = e => {
    //         document.getElementById("newBookImage").src = e.target.result;
    //     };

    //     reader.readAsDataURL(file);
    // };

    // input.click();
}

window.changeNewBookImage = changeNewBookImage;

function getNewBookId(){
    // doplniť zistenie ďalšieho id pre knihu
    return 40;
}

function createBookObject() {
    return {
        id: getNewBookId(),
        title: document.getElementById("newBookName").value.trim(),
        autor: document.getElementById("newBookAuthor").value.trim(),
        language: document.getElementById("newBookLang").value.trim(),
        type: document.getElementById("newBookGenre").value.trim(),
        description: document.getElementById("newBookDescription").value.trim(),
        image_url: document.getElementById("newBookImage").src,
        owner_id: currentUser.id,
        is_available: "available"
    };
}

function openNewBookModal(){
    document.getElementById("newBookModal").style.display = "flex";
}

function closeNewBookModal() {
    document.getElementById("newBookModal").style.display = "none";
}

window.closeNewBookModal = closeNewBookModal;
window.openNewBookModal = openNewBookModal;

function saveNewBook() {
    const newBook = createBookObject();

    for (const key in newBook) {
        if (!newBook[key]) {
            alert("Vyplň všetky polia.");
            return;
        }
    }

    // Uloženie do poľa
    BOOKS.push(newBook);

    // uložiť do databázy

    closeNewBookModal();
    clearNewBookInputs();
    renderBooks();

    alert("Kniha bola pridaná.");
}

window.saveNewBook = saveNewBook;

function clearNewBookInputs() {
    document.getElementById("newBookName").value = "";
    document.getElementById("newBookAuthor").value = "";
    document.getElementById("newBookLang").value = "";
    document.getElementById("newBookGenre").value = "";
    document.getElementById("newBookDescription").value = "";
    document.getElementById("newBookImage").src = "../assets/img/img_placeholder.png";
}


// DETAIL KNIHY
function openEditBookModal(bookId) {
    const book = BOOKS.find(b => b.id === bookId);
    if (!book) return;

    editingBookId = bookId;

    document.getElementById("editBookImage").src = book.image_url;
    document.getElementById("editBookName").value = book.title;
    document.getElementById("editBookAuthor").value = book.autor;
    document.getElementById("editBookLang").value = book.language;
    document.getElementById("editBookGenre").value = book.type;
    document.getElementById("editBookDescription").value = book.description;

    // zablokujeme vstupy
    disableAllEditInputs();

    document.getElementById("editBookModal").style.display = "flex";
}

window.openEditBookModal = openEditBookModal;

function closeEditBookModal() {
    document.getElementById("editBookModal").style.display = "none";
    editBookImageFile = null;
}

window.closeEditBookModal = closeEditBookModal;

function disableAllEditInputs() {
    ["editBookName", "editBookAuthor", "editBookLang", "editBookGenre", "editBookDescription"].forEach(id => {
        document.getElementById(id).disabled = true;
    });
}

function enableEdit(id) {
    const element = document.getElementById(id);
    element.disabled = false;
    element.focus();
}
window.enableEdit = enableEdit;

function editChangeImage(){
    // TO DO
    // zmeniť hodnotu editBookImageFile
}
window.editChangeImage = editChangeImage;

async function saveEditedBook() {
    const book = BOOKS.find(b => b.id === editingBookId);
    if (!book) return;

    // kontrola práznych políčok
    const fields = {
        title: document.getElementById("editBookName").value.trim(),
        autor: document.getElementById("editBookAuthor").value.trim(),
        language: document.getElementById("editBookLang").value.trim(),
        type: document.getElementById("editBookGenre").value.trim(),
        description: document.getElementById("editBookDescription").value.trim()
    };

    for (const key in fields) {
        if (!fields[key]) {
            alert("Vyplň všetky polia.");
            return;
        }
    }

    book.title = fields.title;
    book.autor = fields.autor;
    book.language = fields.language;
    book.type = fields.type;
    book.description = fields.description;


    // ak je nový obrázok 
    if (editBookImageFile) {

       /// book.image_url = nový obrázok;
    }

    // Uloženie do databázy

    closeEditBookModal();
    renderBooks();

    alert("Kniha bola aktualizovaná.");
}

window.saveEditedBook = saveEditedBook;


// VYMAZANIE KNIHY
function deleteBook(id) {
    const book = BOOKS.find(b => b.id === id);
    bookToDelete = id;

    document.getElementById("deleteText").textContent =`Naozaj chcete odstrániť knihu "${book.title}"?`;
    document.getElementById("deleteModal").style.display = "block";
}

window.deleteBook = deleteBook;

// tlačidlo Zrušiť
document.getElementById("cancelDelete").onclick = function () {
    document.getElementById("deleteModal").style.display = "none";
    bookToDelete = null;
};

// tlačidlo Odstrániť
document.getElementById("confirmDelete").onclick = function () {
    if (bookToDelete !== null) {
        console.log("Zmazať knihu s ID:", bookToDelete); 

        const index = BOOKS.findIndex(book => book.id === bookToDelete);

        if (index !== -1) {
            BOOKS.splice(index, 1);   
        }
        //vymazať knihu s ID bookToDelete z databázy

        renderBooks();
        bookToDelete = null;
    }

    document.getElementById("deleteModal").style.display = "none";
    alert("Kniha bola vymazaná.");
};



/* INPUTY */
document.addEventListener("input", function(e) {
    // Spustí prekreslenie pri zmene checkboxov, number inputoch (hodnotenie)
    if (e.target.type === "checkbox") { 
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

document.getElementById("vymaz-filtre").addEventListener("click", deleteFilters);

document.getElementById("hladaj").addEventListener("click", function(){
    searchCommitted.nazov = document.getElementById("nazov")?.value || "";
    searchCommitted.autor = document.getElementById("autor")?.value || "";
    renderActiveFilters();
});


/* IBA 1 AKTÍVNY CHECKBOX*/
const dostupne = document.getElementById("len-dostupne");
const pozicane = document.getElementById("len-pozicane");
const zamknute = document.getElementById("len-zamknute");

[dostupne, pozicane, zamknute].forEach(ch => {
    ch.addEventListener("change", () => {
        if (ch.checked) {
            [dostupne, pozicane, zamknute]
                .filter(other => other !== ch)
                .forEach(other => other.checked = false);
        }
        renderActiveFilters(); // aby sa hneď aplikovali zmeny
    });
});

// ===================================================
// ŠTARTOVACÍ KÓD
// ===================================================

renderActiveFilters(); // Spustí prvé renderovanie kníh, filtrov a stránkovania
