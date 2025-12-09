// Exportujeme funkciu, ktorú budeme volať z home.js
export function setupBookDetailModal(USERS, BOOKS) {
    const modal = document.getElementById("bookDetailModal");
    const closeModal = modal.querySelector(".close-button");

    // --- Pomocné funkcie pre VLASTNÍKA (prevzaté z home.js) ---
    function getOwner(book) {
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
    
    // Nová funkcia na získanie počtu hodnotení pre vlastníka 
    function getOwnerRatingCount(book) {
        const owner = getOwner(book);
        // Predpokladáme, že USERS má pole 'rating_count'
        return owner ? (owner.rating_count || 4) : 0; 
    }
    // -----------------------------------------------------------

    /**
     * TOGGLE FUNKCIA: Zbalí/rozbalí popis a zmení text tlačidla.
     */
    function toggleDescription() {
        const descriptionText = document.getElementById("modal-description-full");
        const toggleButton = document.getElementById("toggle-description-button");
        
        // Prepínanie triedy pre zobrazenie/skrytie (CSS sa postará o výšku)
        descriptionText.classList.toggle('expanded');
        
        if (descriptionText.classList.contains('expanded')) {
            toggleButton.textContent = 'Zbaliť popis (-)';
        } else {
            toggleButton.textContent = 'Čítať celý popis (...)';
        }
    }


    /**
     * Načíta detaily knihy do modálneho okna a zobrazí ho.
     * Táto funkcia je prístupná globálne cez window.showBookDetail()
     * @param {number} bookId - ID knihy.
     */
    window.showBookDetail = function(bookId) {
        const book = BOOKS.find(b => b.id === bookId);
        if (!book) {
            console.error("Kniha s ID " + bookId + " nebola nájdená.");
            return;
        }

        // 1. Získanie dát vlastníka a nastavenie ostatných info polí
        const ownerNick = getOwnerNick(book);
        const ownerRating = getOwnerReputation(book);
        const ownerLocation = getOwnerLocation(book);
        const ownerRatingCount = getOwnerRatingCount(book);
        
        document.getElementById("modal-title").textContent = book.title;
        document.getElementById("modal-image").src = book.image_url;
        document.getElementById("modal-author").textContent = book.autor;
        
        document.getElementById("modal-owner").textContent = ownerNick;
        document.getElementById("modal-rating").textContent = ownerRating;
        document.getElementById("modal-location").textContent = ownerLocation;
        
        document.getElementById("modal-count").textContent = `Počet hodnotení: ${ownerRatingCount}`; 
        document.getElementById("modal-language").textContent = book.language || "Neznámy";
        document.getElementById("modal-genre").textContent = book.type || "Neznámy";

        document.getElementById("request-borrow").onclick = () => createLoanRequest(bookId, document.getElementById("date-from").value, document.getElementById("date-to").value);

        
        // === KĽÚČOVÁ LOGIKA PRE POPIS A TLAČIDLO ===
        const descriptionText = document.getElementById("modal-description-full");
        const toggleButton = document.getElementById("toggle-description-button");
        const descriptionValue = book.description || "Popis nie je k dispozícii.";
        
        descriptionText.textContent = descriptionValue;
        
        // Definovanie maximálnej dĺžky textu, po ktorej sa aktivuje roll-up
        const MAX_LENGTH = 250; 

        if (descriptionValue.length > MAX_LENGTH) {
            // Text je dlhý: Zobraziť tlačidlo, nastaviť na zbalený stav
            toggleButton.style.display = 'block';
            toggleButton.textContent = 'Čítať celý popis (...)';
            descriptionText.classList.remove('expanded'); 
            toggleButton.onclick = toggleDescription;
        } else {
            // Text je krátky: Skryť tlačidlo, nastaviť na plné zobrazenie
            toggleButton.style.display = 'none';
            descriptionText.classList.add('expanded'); 
        }
        // ============================================


        // Nastavenie minimálnych dát pre formulár
        const dateFromInput = document.getElementById("date-from");
        const dateToInput = document.getElementById("date-to");
        
        const today = new Date().toISOString().split('T')[0];
        dateFromInput.setAttribute("min", today);
        dateFromInput.value = today; // Predvolená hodnota
        dateToInput.setAttribute("min", today);


        // 3. Zobrazenie modálneho okna
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
    };
    
    // Zatvorenie stlačením ESC
    document.addEventListener("keydown", function(e) {
        if (e.key === "Escape" && modal.style.display === "block") {
            modal.style.display = "none";
        }
    });

}

import { db } from "./firebase.js";
import { doc, addDoc, getDoc, getDocs, collection } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
import { BOOKS } from "./api/books.js";

export async function createLoanRequest(bookId, dateFrom, dateTo) {
    console.log("Vytváram požiadavku na požičanie knihy ID:", bookId, "od", dateFrom, "do", dateTo);
    
    let loanRef;
    // Create Loan
    const book = BOOKS.find(b => b.id === bookId);
    const owner_id = book ? book.owner_id : null;
    const timestamp = new Date().toISOString();
    const raw = localStorage.getItem("currentUser");
    const user = JSON.parse(raw);
    const borrower_id = user.id;
    try {
        // Uloženie do Firestore
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

    console.log("Notifikacia 1");

    await addDoc(collection(db, "notifications"), {
        loan_id: loanRef.id,
        type: "loan_request",
        recipient_id: borrower_id,
        is_read: false,
        created_at: timestamp
    });

    console.log("Notifikacia 2");

    await addDoc(collection(db, "notifications"), {
        loan_id: loanRef.id,
        type: "loan_request_approval",
        recipient_id: owner_id,
        is_read: false,
        created_at: timestamp
    });

    alert("Vaša požiadavka na požičanie knihy bola odoslaná.");
}

window.createLoanRequest = createLoanRequest;