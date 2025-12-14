import { setupBookDetailModal } from "./book_detail_modal.js";
import { USERS, BOOKS, BOOK_GENRES, BOOK_LANGS } from "./api/allData.js";

// --- GLOBÁLNE PREMENNÉ ---
let AVAILABLE_CITIES = []; 
let selectedCityFilter = ""; 
let searchCommitted = { nazov: "", autor: "" }; 

// --- PRE STRÁNKOVANIE ---
const BOOKS_PER_PAGE = 18;
let currentPage = 1;
// -------------------------



// zmena textu buttonu, na zaklade aktualneho textu
// nasledne sa to bude dat prerobit na obrazok alebo ikonu
// toto nejde dobre pretoze
// ta druha funkcia je asynchronna
 function zmenButtonText(button) {
        // Get the current text of the button
        console.log();
        const currentText = button.textContent;
        console.log(`Current text: ${currentText}`);
        // Check the current text and change it to the opposite
        if (currentText === 'UNLOCK') {
            button.textContent = 'LOCK'; 
        } 
        if (currentText === 'LOCK') {
            button.textContent = 'UNLOCK'; 
        } 
        
        else {
            //pass;  // Change text from Green to Red
        }
    }




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

function isBookAvailable(book) {
    return book.is_available === "yes";
// totot asi bolo treba prepisat
   // return book.is_available ;

}

function isBooklok(book) {
    //return book.is_available === "yes";
// totot asi bolo treba prepisat
 
   return String(book.is_available );

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

 


     let userJSON = JSON.parse(localStorage.getItem('currentUser'));

     let idForFilter = userJSON.id;


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


        // nech ukazuje iba vlastne knihy
        if (  book.owner_id !== idForFilter) {
             match = false;
        }

        // Filter: Dostupnosť
        if (filters.lenDostupne && book.is_available !== 'available') {
             match = false;
        }

// moj filter pre nedostupne
        if (filters.lenNedostupne && book.is_available !== 'booked') {
             match = false;
             //match = true;
        }
// moj filter pre zamknute
        if (filters.lenZamknute && book.is_available !== 'locked') {
             match = false;
             //match = true;
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

    function iconForStateL(state) {
        // ikona namiesto textu 
    switch (state) {
        case "locked":      return "🔒";
        case "available":   return "📗";
        case "booked":      return "📕";
        case "unavailable": return "🚫";
        default:            return "❓";
    }
}



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
            const dostupne = isBookAvailable(book);

// for 3 different 
            const lok = isBooklok(book);


            const owner = getOwner(book);

            card.innerHTML = `
                <h4>${book.title}</h4>
                <div class="karta-content">
                    <img src="${book.image_url}" alt="" width="130" height="200">
                    <div class="karta-info">
                        <p>${book.autor}</p>
                         <!-- 
                        <p style="font-size: 16px;">
                            ${getOwnerNick(book)}
                            <span style='font-size:25px; color:yellow'>&#9733;</span>
                            ${getOwnerReputation(book)}
                        </p>
                        <p>${getOwnerLocation(book)}</p>

-->

                       <!-- TODO: funguje to, prerobit nech ukazuje ikonu  --> 
                        <div class="${lok  ? "locked" : "availible"}">
                                ${iconForStateL(lok)}

                        </div>
                        
        <button 
         id="btn-forbook-${book.id}"
            class="updateButton" 
            onclick="window.ChangeA(${book.id});  "                       
            style="visibility: ${lok !== 'booked' ? 'visible' : 'hidden'}"                         
 >                   
                        <!-- ikona zamka   --> 
                  ${lok === 'locked'               
? '🔓' : '🔒'}

                         </button>

 

                    </div>
                </div>
            `;

            container.appendChild(card);
        });

            console.log(`books rendered`);

    }

    // 5. Vykreslenie stránkovania
    renderPagination(totalBooks);
}          

function generateFilterOptions() {
    return;
    //TODO delete

}


// ===================================================
// LOGIKA FILTROV A ZOBRAZENIE ZNAČIEK
// ===================================================

function getFilters() {
    const result = {};
   
    const lenDostupne = document.getElementById("len-dostupne").checked;
    if (lenDostupne) result["lenDostupne"] = true;

    const lenNedostupne = document.getElementById("len-nedostupne").checked;
    if (lenNedostupne) result["lenNedostupne"] = true;

    const lenZamknute = document.getElementById("len-zamknute").checked;
    if (lenZamknute) result["lenZamknute"] = true;
    
    


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

        // new 
        if (key === "lenNedostupne") text = "len nedostupné";
        //if (key === "lenDostupne") text = "len dostupné";
        if (key === "lenZamknute") text = "len skryte";


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
        if (key === "lenNedostupne") {
        document.getElementById("len-nedostupne").checked = false;
    }

            if (key === "lenZamknute") {
        document.getElementById("len-zamknute").checked = false;
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

 

    // Zrušenie checkboxov (žáner, jazyk)
    const checkbox = document.querySelector(`input[type="checkbox"][value="${value}"]`);
    if (checkbox) checkbox.checked = false;

    renderActiveFilters(); // Vola renderBooks
}

function deleteFilters() {
    document.querySelectorAll('input[type="checkbox"]:checked').forEach(ch => ch.checked = false);

    document.getElementById("hodnotenie").value = 0;
    
    // Vymazanie Autocomplete Mesta

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
    return;
    //TODO delete
    const availableOwnerIds = new Set(
        BOOKS.filter(book => book.is_available === "yes")
             .map(book => book.owner_id)
    );

    const cities = USERS.filter(user => availableOwnerIds.has(user.id))
                        .map(user => user.location);

    AVAILABLE_CITIES = [...new Set(cities)].sort();
}

function handleCityAutocomplete(event) {
    //todo delete
    
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

document.querySelectorAll(".dropdown-header").forEach(header => {
    header.addEventListener("click", () => toggleFilter(header));
});

document.getElementById("vymaz-filtre").addEventListener("click", deleteFilters);

// --- LISTENERY PRE MESTO AUTCOMPLETE ---
//document.getElementById("autocomplete-mesto").addEventListener("input", handleCityAutocomplete);

// Skryť výsledky mesta, ak používateľ klikne mimo nich
document.addEventListener('click', function(e) {
    const cityContainer = document.querySelector(".filter-skupina[data-filter='mesto']");
    if (cityContainer && !cityContainer.contains(e.target)) {
        const results = document.getElementById("autocomplete-mesto-results");
        if (results) results.style.display = "none";
    }
});


// ===================================================
// ŠTARTOVACÍ KÓD
// ===================================================
getAvailableCities(); 
generateFilterOptions(); 
renderActiveFilters(); // Spustí prvé renderovanie kníh, filtrov a stránkovania

setupBookDetailModal(USERS, BOOKS);







// ten button nech mani availibility 
//  toto asi musi byt na konci
// na uaciatku generovane

 

    // funkcia nech meni avalibility 

// zaklad generovany

// toto robi to menenie 
window.ChangeA = function(bookId) {
    // Find the book by its ID (you may want to adjust this depending on where BOOKS are stored)
    const book = BOOKS.find(b => b.id === bookId);

    if (!book) {
        console.error("Kniha s ID " + bookId + " nebola nájdená.");
        return;
    }


    // toto je uz osetrene graficky, ale pre istotu
    if (book.owner_id !== JSON.parse(localStorage.getItem('currentUser')).id){
        console.error("menime knihu cudzieho pouzivatela, toto nema byt mozne ani dostupne");
        return;
    }

    // zmena  ikony buttonu,
    //  a zamknutie buttonu nech nespamuju databazu
    let btn = null;
    try {
        // Try to get the button
        btn = document.getElementById(`btn-forbook-${bookId}`);
        
        // If button not found, skip UI update but continue with DB update
        if (!btn) throw new Error("Button not found");

        // --- INSTANT UI UPDATE ---
        if (book.is_available === "locked") {
            btn.textContent = "🔒";   // change to unlocked icon
            book.is_available = "available";
        } else {
            btn.textContent = "🔓";   // change to locked icon
            book.is_available = "locked";
        }

        // Prevent multiple clicks
        btn.disabled = true;

    } catch (uiError) {
        console.warn("UI update failed in ChangeA:", uiError);
        // but DO NOT stop — continue with database update
    }




    console.log(`Current availability of "${book.title}": ${book.is_available}`);

    // toto meni v databaze
    toggleBookAvailability(bookId);

        console.log(`changed yyyy availability of "${book.title}": ${book.is_available}`);
  renderBooks();
};


// vlozime string aktualny stav, vrati stav aky ma byt po kliknuti
function xyz(x){
        let s = String(x)

    switch (s){

    case "locked":
        return "available";
    case "available":
        return "locked";
// oprava grammaticka
    case "yes":
        return "available";
    case "no":
        return "booked";
    case "unavailable":
        return "booked";
    case "availible":
        return  "available";


    default:
        return s;
        }
}


import { db } from "./firebase.js";  // Import db from firebase.js
import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";


// console log zmazat na konci
// toto menit data v firebase
async function toggleBookAvailability(id) {
  // Reference to the Firestore document for the specific book
  id = String(id)
  const bookRef = doc(db, "books", id);

  try {
    // Get the current document snapshot from Firestore
    const docSnapshot = await getDoc(bookRef);

    if (docSnapshot.exists()) {
      // Get the current status of the book
      const currentStatus = docSnapshot.data().is_available;
      console.log(`Book of id =  ${id} availability  is currently  ${currentStatus}`);

      // Toggle the availability (if "available" change to "unavailable" and vice versa)
      //const newStatus = currentStatus === "available" ? "unavailable" : "available";
     const newStatus = xyz(currentStatus)  ;

      // Update the status in Firestore
      await updateDoc(bookRef, { is_available: newStatus });

      console.log(`Book ${id} availability updated to ${newStatus}`);


      
    } else {
      console.error(`No book found with ID ${id}`);
    }
  } catch (error) {
    console.error("Error updating book availability:", error);
  }


  renderBooks() ;
}
