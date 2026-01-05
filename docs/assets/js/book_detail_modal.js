import { db } from "./firebase.js";
import { addDoc, collection, doc, updateDoc } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
import { BOOKS } from "./api/allData.js";
import { refreshHeader } from "./utils.js";

// Global variable to hold the book ID currently being edited
let currentEditingBookId = null; 
let allBooksRef = null;
let allUsersRef = null;

// ===================================================
// 1. DETAIL MODAL LOGIKA (Pôvodný kód)
// ===================================================

export function setupBookDetailModal(USERS, BOOKS) {
    // Uloží referencie pre neskoršie použitie v edit modale
    allBooksRef = BOOKS;
    allUsersRef = USERS;

    const modal = document.getElementById("bookDetailModal");
    const closeModal = modal.querySelector(".close-button");

    const quickBorrowModal = document.getElementById("quickBorrowModal");

    // --- Pomocné funkcie pre VLASTNÍKA (prevzaté z home.js) ---
    function getOwner(book) {
        return USERS.find(u => u.id === book.owner_id) || null;
    }
    // ... (ostatné pomocné funkcie pre vlastníka sú rovnaké) ...
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
    
    function getOwnerRatingCount(book) {
        const owner = getOwner(book);
        return owner ? (owner.rating_count || 4) : 0; 
    }
    // -----------------------------------------------------------

    function toggleDescription() {
        const descriptionText = document.getElementById("modal-description-full");
        const toggleButton = document.getElementById("toggle-description-button");
        
        descriptionText.classList.toggle('expanded');
        
        if (descriptionText.classList.contains('expanded')) {
            toggleButton.textContent = 'Zbaliť popis (-)';
        } else {
            toggleButton.textContent = 'Čítať celý popis (...)';
        }
    }

    let currentUser = null;
    try {
        currentUser = JSON.parse(localStorage.getItem('currentUser'));
    } catch (e) {
        currentUser = null;
    }


    window.showBookDetail = function(bookId) {
        const book = BOOKS.find(b => b.id === bookId);
        if (!book) {
            console.error("Kniha s ID " + bookId + " nebola nájdená.");
            return;
        }

        // 1. Získanie dát a nastavenie info polí
        const ownerNick = getOwnerNick(book);
        const ownerRating = getOwnerReputation(book);
        const ownerLocation = getOwnerLocation(book);
        const ownerRatingCount = getOwnerRatingCount(book);
        
        // ... (Nastavenie elementov DOM - rovnaké ako Váš kód) ...
        document.getElementById("modal-title").textContent = book.title;
        document.getElementById("modal-image").src = book.image_url;
        document.getElementById("modal-author").textContent = book.autor;
        
        document.getElementById("modal-owner").textContent = ownerNick;
        document.getElementById("modal-rating").textContent = ownerRating;
        document.getElementById("modal-location").textContent = ownerLocation;
        
        document.getElementById("modal-count").textContent = `Počet hodnotení: ${ownerRatingCount}`; 
        document.getElementById("modal-language").textContent = book.language || "Neznámy";
        document.getElementById("modal-genre").textContent = book.type || "Neznámy";

        const borrowDetails = modal.querySelector("details");
        borrowDetails.style.display = "none";

        // Kontrola stavu požičania a vlastníctva
        if(currentUser == null){
            document.getElementById("borrow-button-description").textContent = "Na požičanie knihy sa prihláste.";
            //document.getElementById("request-borrow").disabled = true;
        }else if(currentUser.id == getOwner(book).id){
            document.getElementById("borrow-button-description").textContent = "Toto je vaša vlastná kniha.";
           // document.getElementById("request-borrow").disabled = true;
        }else if(book.status != "available"){
           document.getElementById("borrow-button-description").textContent =  "Kniha je momentálne požičaná.";
        }else{
            borrowDetails.style.display = "block";

            document.getElementById("borrow-button-description").textContent = "";
           // document.getElementById("request-borrow").disabled = false;
        }

        document.getElementById("request-borrow").onclick = () => createLoanRequest(bookId, document.getElementById("date-from").value, document.getElementById("date-to").value, document.getElementById("form-borrow"));

        // Logika pre Popis
        const descriptionText = document.getElementById("modal-description-full");
        const toggleButton = document.getElementById("toggle-description-button");
        const descriptionValue = book.description || "Popis nie je k dispozícii.";
        
        descriptionText.textContent = descriptionValue;
        
        const MAX_LENGTH = 250; 

        if (descriptionValue.length > MAX_LENGTH) {
            toggleButton.style.display = 'block';
            toggleButton.textContent = 'Čítať celý popis (...)';
            descriptionText.classList.remove('expanded'); 
            toggleButton.onclick = toggleDescription;
        } else {
            toggleButton.style.display = 'none';
            descriptionText.classList.add('expanded'); 
        }

        // Nastavenie minimálnych dát pre formulár
        const dateFromInput = document.getElementById("date-from");
        const dateToInput = document.getElementById("date-to");
        
        const today = new Date().toISOString().split('T')[0];
        dateFromInput.setAttribute("min", today);
        dateFromInput.value = today; 
        dateToInput.setAttribute("min", today);


        // Zobrazenie modálneho okna
        modal.style.display = "block";
    };

    // Zatvorenie kliknutím na X
    closeModal.onclick = function() {
        modal.style.display = "none";
    };

    // Zatvorenie kliknutím mimo modalu
    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = "none";
        }
        if (event.target === quickBorrowModal) {
            quickBorrowModal.style.display = "none";
        }
    };
    
    // Zatvorenie stlačením ESC
    document.addEventListener("keydown", function(e) {
        if (e.key === "Escape" && modal.style.display === "block") {
            modal.style.display = "none";
        }
    });

    if(quickBorrowModal != null){
        window.openQuickBorrow = function(bookId) {
            
            const book = BOOKS.find(b => b.id === bookId);

            if (!book) {
                console.error("Kniha s ID " + bookId + " nebola nájdená.");
                return;
            }

            document.getElementById("quickBorrowTitle").textContent = `Požičanie knihy: ${book.title}`;

            const dateFrom = document.getElementById("quick-date-from");
            const dateTo = document.getElementById("quick-date-to");

            const today = new Date().toISOString().split("T")[0];
            dateFrom.setAttribute("min", today);
            dateFrom.value = today; 
            dateTo.setAttribute("min", today);
            // dateFrom.min = today;
            // dateFrom.value = today;
            // dateTo.min = today;
            // dateTo.value = "";

            const form = document.getElementById("quick-borrow-form");
            // form.onsubmit = function(e) {
            //     e.preventDefault();
            //     window.createLoanRequest(
            //         bookId,
            //         dateFrom.value,
            //         dateTo.value,
            //         form
            //     );
            // };

            document.getElementById("quick-request-borrow").onclick = () => createLoanRequest(bookId, dateFrom.value, dateTo.value,form);

            quickBorrowModal.style.display = "block";
        };

        document.getElementById("quickBorrowClose").onclick = () => {
            quickBorrowModal.style.display = "none";
        };
    }


}

// ===================================================
// 2. MODAL PRE ÚPRAVU KNIHY (EXPORTY PRE moje_knihy.js)
// ===================================================

/**
 * EXPORT: Otvorí modál na úpravu knihy
 * @param {number} bookId - ID knihy.
 */
export function openEditBookModal(bookId) {
    const book = allBooksRef.find(b => b.id === bookId);
    const modal = document.getElementById("editBookModal");

    if (!book) {
        console.error("Kniha s ID " + bookId + " nebola nájdená pre editáciu.");
        return;
    }

    currentEditingBookId = bookId; // Uloží ID editovanej knihy

    // Nastavenie hodnôt polí
    document.getElementById("editBookName").value = book.title || "";
    document.getElementById("editBookAuthor").value = book.autor || "";
    document.getElementById("editBookLang").value = book.language || "";
    document.getElementById("editBookGenre").value = book.type || "";
    document.getElementById("editBookDescription").value = book.description || "";
    document.getElementById("editBookImage").src = book.image_url || "../assets/img/img_placeholder.png";

    // Všetky polia sú na začiatku neaktívne
    document.querySelectorAll('#editBookModal input, #editBookModal textarea').forEach(input => {
        input.setAttribute('disabled', 'disabled');
    });

    if (modal) {
        modal.classList.add("active");
        modal.style.display = "flex";
    }
}

/**
 * EXPORT: Zavrie modál na úpravu knihy
 */
export function closeEditBookModal() {
    const modal = document.getElementById("editBookModal");
    if (modal) {
        modal.classList.remove("active");
        modal.style.display = "none";
    }
    currentEditingBookId = null; 
}

/**
 * EXPORT: Aktivuje editáciu pre konkrétne pole
 * @param {string} inputId - ID input/textarea poľa, ktoré má byť aktivované.
 */
export function enableEdit(inputId) {
    const input = document.getElementById(inputId);
    if (input) {
        input.removeAttribute('disabled');
        input.focus();
        // Pridá vizuálnu triedu, ak je to potrebné
        input.classList.add('editing-active'); 
    }
}

/**
 * EXPORT: Simuluje zmenu obrázka (len log pre konzolu)
 */
export function editChangeImage() {
    console.log("Simulácia zmeny obrázku pre editovanú knihu.");
    // Tu by sa implementovala logika na nahranie nového obrázku
}

/**
 * EXPORT: Uloží upravené dáta do dátovej štruktúry a do Firebase
 */
export async function saveEditedBook() {
    if (!currentEditingBookId) {
        console.error("Nebolo nájdené ID editovanej knihy.");
        return;
    }

    const book = allBooksRef.find(b => b.id === currentEditingBookId);
    if (!book) return;

    // 1. Získanie dát z formulára
    const updatedData = {
        title: document.getElementById("editBookName").value.trim(),
        autor: document.getElementById("editBookAuthor").value.trim(),
        language: document.getElementById("editBookLang").value.trim(),
        type: document.getElementById("editBookGenre").value.trim(), // Používame 'type' pre žáner, ak súbor allData používa 'type'
        description: document.getElementById("editBookDescription").value.trim(),
        image_url: document.getElementById("editBookImage").src // Predpokladáme, že sa zmenilo cez editChangeImage
    };

    // 2. Aktualizácia lokálnych dát (len pre rýchly UI update)
    Object.assign(book, updatedData);

    // 3. Aktualizácia vo Firebase
    try {
        const bookRef = doc(db, "books", String(currentEditingBookId));
        await updateDoc(bookRef, updatedData);

        console.log(`Kniha ID ${currentEditingBookId} bola úspešne upravená a uložená do Firebase.`);
        closeEditBookModal(); // Zavrie modál po uložení
        // Nutné znova vykresliť zoznam kníh na stránke moje_knihy
        window.renderActiveFilters(); 

    } catch (error) {
        console.error("Chyba pri ukladaní upravenej knihy do Firebase:", error);
        alert("Chyba pri ukladaní zmien.");
    }
}


// ===================================================
// 3. LOGIKA PRE VYTVÁRANIE POŽIČIEK (Pôvodný kód)
// ===================================================

export async function createLoanRequest(bookId, dateFrom, dateTo, form) {
    if (!form.checkValidity()) {
        form.reportValidity(); 
        return;
    }
    
    console.log("Vytváram požiadavku na požičanie knihy ID:", bookId, "od", dateFrom, "do", dateTo);
    
    let loanRef;
    const book = allBooksRef.find(b => b.id === bookId);
    const owner_id = book ? book.owner_id : null;
    const timestamp = new Date().toISOString();
    const raw = localStorage.getItem("currentUser");
    const user = JSON.parse(raw);
    const borrower_id = user.id;

    try {
        loanRef = await addDoc(collection(db, "loans"), {
            book_id: bookId,
            borrower_id: borrower_id,
            owner_id: owner_id,
            date_from: dateFrom,
            date_to: dateTo,
            status: "waiting",
            created_at: timestamp
        });
        
    } catch (error) {
        console.error( error);
        alert("Nastala chyba pri odosielaní požiadavky.");
        return;
    }

    // Vytvorenie notifikácií (ako vo Vašom kóde)
    await addDoc(collection(db, "notifications"), {
        loan_id: loanRef.id,
        type: "loan_request",
        recipient_id: borrower_id,
        sender_id: owner_id,
        is_read: false,
        created_at: timestamp
    });

    await addDoc(collection(db, "notifications"), {
        loan_id: loanRef.id,
        type: "loan_request_approval",
        recipient_id: owner_id,
        sender_id: borrower_id,
        is_read: false,
        created_at: timestamp
    });

    console.log("Požiadavka na požičanie a notifikácie úspešne odoslané.");
    
    window.location.href = "success_page.html?book=" + encodeURIComponent(book.id);
    refreshHeader();
}

window.createLoanRequest = createLoanRequest;