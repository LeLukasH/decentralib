import { db } from "./firebase.js";
import { addDoc, collection, doc, updateDoc } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
import { BOOKS } from "./api/allData.js";
import { refreshHeader } from "./utils.js";

// Global variable to hold the book ID currently being edited
let currentEditingBookId = null; 
let allBooksRef = null;
let allUsersRef = null;

// ===================================================
// 1. DETAIL MODAL LOGIKA
// ===================================================

export function setupBookDetailModal(USERS, BOOKS) {
    // Uloží referencie pre neskoršie použitie v edit modale
    allBooksRef = BOOKS;
    allUsersRef = USERS;

    const modal = document.getElementById("bookDetailModal");
    const closeModal = modal.querySelector(".close-button");

    const quickBorrowModal = document.getElementById("quickBorrowModal");

    // --- Pomocné funkcie pre VLASTNÍKA ---
    function getOwner(book) {
        return USERS.find(u => String(u.id) === String(book.owner_id)) || null;
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
    
    function getOwnerRatingCount(book) {
        const owner = getOwner(book);
        return owner ? (owner.rating_count || 4) : 0; 
    }

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
        // OPRAVA TYPU ID
        const book = BOOKS.find(b => String(b.id) === String(bookId));
        if (!book) {
            console.error("Kniha s ID " + bookId + " nebola nájdená.");
            return;
        }

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

        const borrowDetails = modal.querySelector("details");
        borrowDetails.style.display = "none";

        if(currentUser == null){
            document.getElementById("borrow-button-description").textContent = "Na požičanie knihy sa prihláste.";
        }else if(String(currentUser.id) === String(getOwner(book).id)){
            document.getElementById("borrow-button-description").textContent = "Toto je vaša vlastná kniha.";
        }else if(book.status != "available"){
           document.getElementById("borrow-button-description").textContent =  "Kniha je momentálne požičaná.";
        }else{
            borrowDetails.style.display = "block";
            document.getElementById("borrow-button-description").textContent = "";
        }

        document.getElementById("request-borrow").onclick = () => createLoanRequest(bookId, document.getElementById("date-from").value, document.getElementById("date-to").value, document.getElementById("form-borrow"));

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

        const dateFromInput = document.getElementById("date-from");
        const dateToInput = document.getElementById("date-to");
        const today = new Date().toISOString().split('T')[0];
        dateFromInput.setAttribute("min", today);
        dateFromInput.value = today; 
        dateToInput.setAttribute("min", today);

        modal.style.display = "block";
    };

    closeModal.onclick = function() { modal.style.display = "none"; };

    window.onclick = function(event) {
        if (event.target === modal) modal.style.display = "none";
        if (event.target === quickBorrowModal) quickBorrowModal.style.display = "none";
    };
    
    document.addEventListener("keydown", function(e) {
        if (e.key === "Escape" && modal.style.display === "block") modal.style.display = "none";
    });

    if(quickBorrowModal != null){
        window.openQuickBorrow = function(bookId) {
            const book = BOOKS.find(b => String(b.id) === String(bookId));
            if (!book) return;

            document.getElementById("quickBorrowTitle").textContent = `Požičanie knihy: ${book.title}`;
            const dateFrom = document.getElementById("quick-date-from");
            const dateTo = document.getElementById("quick-date-to");
            const today = new Date().toISOString().split("T")[0];
            
            dateFrom.setAttribute("min", today);
            dateFrom.value = today; 
            dateTo.setAttribute("min", today);

            const form = document.getElementById("quick-borrow-form");
            document.getElementById("quick-request-borrow").onclick = () => createLoanRequest(bookId, dateFrom.value, dateTo.value, form);
            quickBorrowModal.style.display = "block";
        };

        document.getElementById("quickBorrowClose").onclick = () => { quickBorrowModal.style.display = "none"; };
    }
}

// ===================================================
// 2. MODAL PRE ÚPRAVU KNIHY
// ===================================================

export function openEditBookModal(bookId) {
    // OPRAVA TU: String(b.id) === String(bookId)
    const book = allBooksRef.find(b => String(b.id) === String(bookId));
    const modal = document.getElementById("editBookModal");

    if (!book) {
        console.error("Kniha s ID " + bookId + " nebola nájdená pre editáciu.");
        return;
    }

    currentEditingBookId = bookId; 

    document.getElementById("editBookName").value = book.title || "";
    document.getElementById("editBookAuthor").value = book.autor || "";
    document.getElementById("editBookLang").value = book.language || "";
    document.getElementById("editBookGenre").value = book.type || "";
    document.getElementById("editBookDescription").value = book.description || "";
    document.getElementById("editBookImage").src = book.image_url || "../assets/img/img_placeholder.png";

    document.querySelectorAll('#editBookModal input, #editBookModal textarea').forEach(input => {
        input.setAttribute('disabled', 'disabled');
    });

    if (modal) {
        modal.classList.add("active");
        modal.style.display = "flex";
    }
}

export function closeEditBookModal() {
    const modal = document.getElementById("editBookModal");
    if (modal) {
        modal.classList.remove("active");
        modal.style.display = "none";
    }
    currentEditingBookId = null; 
}

export function enableEdit(inputId) {
    const input = document.getElementById(inputId);
    if (input) {
        input.removeAttribute('disabled');
        input.focus();
        input.classList.add('editing-active'); 
    }
}

export function editChangeImage() {
    console.log("Simulácia zmeny obrázku.");
}

export async function saveEditedBook() {
    if (!currentEditingBookId) return;

    const book = allBooksRef.find(b => String(b.id) === String(currentEditingBookId));
    if (!book) return;

    const updatedData = {
        title: document.getElementById("editBookName").value.trim(),
        autor: document.getElementById("editBookAuthor").value.trim(),
        language: document.getElementById("editBookLang").value.trim(),
        type: document.getElementById("editBookGenre").value.trim(),
        description: document.getElementById("editBookDescription").value.trim(),
        image_url: document.getElementById("editBookImage").src
    };

    Object.assign(book, updatedData);

    try {
        const bookRef = doc(db, "books", String(currentEditingBookId));
        await updateDoc(bookRef, updatedData);
        closeEditBookModal();
        
        // UNIVERZÁLNY UPDATE UI
        if (typeof window.renderMyBooks === 'function') {
            window.renderMyBooks();
        } else if (typeof window.renderActiveFilters === 'function') {
            window.renderActiveFilters();
        }

    } catch (error) {
        console.error("Chyba pri ukladaní:", error);
    }
}

// ===================================================
// 3. LOGIKA PRE VYTVÁRANIE POŽIČIEK
// ===================================================

export async function createLoanRequest(bookId, dateFrom, dateTo, form) {
    if (!form.checkValidity()) {
        form.reportValidity(); 
        return;
    }
    
    const book = allBooksRef.find(b => String(b.id) === String(bookId));
    const owner_id = book ? book.owner_id : null;
    const timestamp = new Date().toISOString();
    const user = JSON.parse(localStorage.getItem("currentUser"));
    const borrower_id = user.id;

    try {
        const loanRef = await addDoc(collection(db, "loans"), {
            book_id: bookId,
            borrower_id: borrower_id,
            owner_id: owner_id,
            date_from: dateFrom,
            date_to: dateTo,
            status: "waiting",
            created_at: timestamp
        });

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

        window.location.href = "success_page.html?book=" + encodeURIComponent(book.id);
        refreshHeader();
    } catch (error) {
        console.error(error);
    }
}

window.createLoanRequest = createLoanRequest;