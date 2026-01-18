import { db } from "./firebase.js";
import { doc, updateDoc, collection, addDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
import { BOOKS, USERS } from "./api/allData.js";
import { 
    setupBookDetailModal, 
    openEditBookModal, 
    closeEditBookModal, 
    saveEditedBook, 
    enableEdit, 
    editChangeImage 
} from "./book_detail_modal.js";

// --- GLOBÁLNE PREMENNÉ ---
let currentPage = 1;
const initialLimit = 4;   
const expandedLimit = 12; 
let isExpanded = false; 
let bookToDelete = null;

// --- POMOCNÉ FUNKCIE ---
function iconForStateL(status) {
    switch (status) {
        case 'available': return '&#9989; Dostupná'; 
        case 'unavailable': return '&#10060; Požičaná'; 
        case 'locked': return '&#128274; Zamknutá'; 
        default: return status;
    }
}

function updateStats(myBooksCount) {
    const statsElement = document.getElementById("count-my-books");
    if (statsElement) statsElement.innerText = myBooksCount;
}

// ===================================================
// HLAVNÁ FUNKCIA RENDER
// ===================================================
export function renderMyBooks() {
    const container = document.getElementById("my-books-container");
    const paginationContainer = document.getElementById("pagination-container");
    const toggleContainer = document.getElementById("toggle-my-books");
    const userJSON = localStorage.getItem("currentUser");

    if (!container || !userJSON) return;

    const currentUser = JSON.parse(userJSON);
    // OPRAVA: String porovnanie ID
    const myBooksAll = BOOKS.filter(book => String(book.owner_id) === String(currentUser.id));

    updateStats(myBooksAll.length);

    if (myBooksAll.length === 0) {
        container.innerHTML = `<p class="empty-msg">Zatiaľ ste nepridali žiadne knihy.</p>`;
        if (paginationContainer) paginationContainer.innerHTML = "";
        if (toggleContainer) toggleContainer.innerHTML = "";
        return;
    }

    let itemsPerPage = isExpanded ? expandedLimit : initialLimit;
    const maxPages = Math.ceil(myBooksAll.length / itemsPerPage);
    if (currentPage > maxPages) currentPage = 1;

    const startIndex = (currentPage - 1) * itemsPerPage;
    const booksToDisplay = myBooksAll.slice(startIndex, startIndex + itemsPerPage);

    container.innerHTML = "";
    booksToDisplay.forEach(book => {
        const status = String(book.status || 'available');
        const isLocked = status === 'locked';
        const isUnavailable = status === 'unavailable';
        const lockIcon = isLocked ? '&#x1f513;' : '&#x1f512;'; 
        const tooltipText = isLocked ? 'Odomknúť knihu' : 'Zamknúť knihu';

        const card = document.createElement("div");
        card.className = "karta-vypozicky"; 
        card.innerHTML = `
            <div class="karta-info">
                <h4>${book.title}</h4>
                <div class="karta-content">
                    <img src="${book.image_url}" alt="" width="100" height="150" class="karta-img">
                    <div class="karta-detaily">
                        <p><strong>Autor:</strong> ${book.autor}</p>
                        <p><strong>Žáner:</strong> ${book.type || '-'}</p>
                        <p><strong>Jazyk:</strong> ${book.language || '-'}</p>
                        <hr class="detail-divider">
                        <div class="book-status-row">
                             <span class="dot ${status === 'available' ? 'dot-green' : status === 'locked' ? 'dot-orange' : 'dot-red'}"></span>
                             ${iconForStateL(status)}
                        </div>
                    </div>
                </div>
            </div>
            <div class="action-buttons">
                <button class="request-button btn-edit" onclick="window.openEditModal('${book.id}')" title="Upraviť">
                    <i class="fa fa-pencil"></i>
                </button>
                
                <button class="request-button btn-lock ${isLocked ? 'is-locked' : ''}" 
                        id="btn-forbook-${book.id}" 
                        onclick="window.ChangeA('${book.id}')" 
                        title="${tooltipText}"
                        ${isUnavailable ? 'disabled' : ''}>
                    ${lockIcon}
                </button>

                <button class="request-button btn-delete" onclick="window.deleteBook('${book.id}')" title="Vymazať">
                    <i class="fa fa-trash-o"></i>
                </button>
            </div>`;
        container.appendChild(card);
    });

    renderControls(myBooksAll.length, itemsPerPage, paginationContainer, toggleContainer);

    try {
        setupBookDetailModal(USERS, BOOKS);
    } catch (e) { console.warn("Detail modal setup bypass:", e.message); }
}

// --- WINDOW PROXY FUNKCIE ---

// Oprava: String porovnanie ID pri mazaní
window.deleteBook = function(id) {
    const book = BOOKS.find(b => String(b.id) === String(id));
    if (!book) return;
    
    bookToDelete = id;
    const modal = document.getElementById("deleteModal");
    const text = document.getElementById("deleteText");
    
    if (modal && text) {
        text.textContent = `Naozaj chcete odstrániť knihu "${book.title}"?`;
        modal.style.display = "block";
    } else {
        if (confirm(`Naozaj chcete odstrániť knihu "${book.title}"?`)) {
            window.confirmDeleteAction();
        }
    }
};

window.confirmDeleteAction = async function() {
    if (bookToDelete) {
        try {
            await deleteDoc(doc(db, "books", String(bookToDelete)));
            const index = BOOKS.findIndex(b => String(b.id) === String(bookToDelete));
            if (index > -1) BOOKS.splice(index, 1);
            renderMyBooks();
        } catch (e) { console.error("Chyba pri mazaní:", e); }
    }
    window.closeDeleteModal();
};

window.closeDeleteModal = function() {
    const modal = document.getElementById("deleteModal");
    if (modal) modal.style.display = "none";
    bookToDelete = null;
};

window.ChangeA = async function(bookId) {
    // Oprava: String porovnanie ID
    const book = BOOKS.find(b => String(b.id) === String(bookId));
    if (!book || book.status === 'unavailable') return;

    const newStatus = book.status === 'locked' ? 'available' : 'locked';
    try {
        await updateDoc(doc(db, "books", String(bookId)), { status: newStatus });
        book.status = newStatus;
        renderMyBooks();
    } catch (e) { console.error("Firebase update error:", e); }
};

// PREPOJENIE S MODALOM
window.openEditModal = openEditBookModal;
window.closeEditBookModal = closeEditBookModal;
window.saveEditedBook = async function() {
    await saveEditedBook();
    renderMyBooks();
};

// REGISTRÁCIA RENDERU DO GLOBÁLNEHO OKNA (Dôležité!)
window.renderMyBooks = renderMyBooks;

function renderControls(totalItems, itemsPerPage, paginationContainer, toggleContainer) {
    if (!paginationContainer || !toggleContainer) return;
    toggleContainer.innerHTML = "";
    if (totalItems > initialLimit) {
        const arrow = document.createElement("span");
        arrow.className = "toggle-arrow";
        arrow.style.transform = isExpanded ? "rotate(180deg)" : "rotate(0deg)";
        arrow.innerHTML = "▼";
        arrow.onclick = () => {
            isExpanded = !isExpanded;
            currentPage = 1;
            renderMyBooks();
        };
        toggleContainer.appendChild(arrow);
    }
    paginationContainer.innerHTML = "";
    if (isExpanded && totalItems > expandedLimit) {
        const totalPages = Math.ceil(totalItems / expandedLimit);
        for (let i = 1; i <= totalPages; i++) {
            const pBtn = document.createElement("button");
            pBtn.innerText = i;
            pBtn.className = "pBtn-style"; 
            pBtn.style.background = (i === currentPage) ? '#2f70e9' : 'white';
            pBtn.style.color = (i === currentPage) ? 'white' : '#2f70e9';
            pBtn.onclick = () => {
                currentPage = i;
                renderMyBooks();
            };
            paginationContainer.appendChild(pBtn);
        }
    }
}

function init() {
    const checkData = setInterval(() => {
        if (typeof BOOKS !== 'undefined' && BOOKS.length > 0) {
            if (document.getElementById("my-books-container")) {
                renderMyBooks();
                clearInterval(checkData);
            }
        }
    }, 500);
}
init();