import { LOANS, BOOKS, USERS } from "./api/allData.js";
import { renderUserLink, refreshHeader } from "./utils.js";

// --- KONFIGURÁCIA ZOBRAZENIA ---
let currentPage = 1;
const initialLimit = 4;  
const expandedLimit = 12;
let isExpanded = false;

/**
 * Aktualizuje hornú štatistiku: "Aktívne výpožičky" 
 * (V tvojom HTML ID: count-active-rentals)
 */
function updateBorrowedStat(count) {
    const statEl = document.getElementById("count-active-rentals");
    if (statEl) {
        statEl.innerText = count;
    }
}

export async function getAllLoans() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return [];

    // Filtrujeme iba schválené pôžičky, kde som ja borrower
    return LOANS.filter(loan =>
        String(loan.borrower_id) === String(currentUser.id) &&
        loan.status === 'approved'
    );
}

export async function renderBorrowedBooks() {
    const container = document.getElementById("pozicane-knihy");
    const paginationContainer = document.getElementById("pagination-borrowed");
    const toggleContainer = document.getElementById("toggle-borrowed-books");

    if (!container) return;

    const allLoans = await getAllLoans();
    const totalLoans = allLoans.length;

    // --- AKTUALIZÁCIA ŠTATISTIKY ---
    updateBorrowedStat(totalLoans);

    if (totalLoans === 0) {
        container.innerHTML = `<p class="empty-msg">Momentálne nemáte požičané žiadne knihy.</p>`;
        if (paginationContainer) paginationContainer.innerHTML = "";
        if (toggleContainer) toggleContainer.innerHTML = "";
        return;
    }

    // --- LOGIKA LIMITOV ---
    let itemsPerPage = isExpanded ? expandedLimit : initialLimit;
    const maxPages = Math.ceil(totalLoans / itemsPerPage);
    if (currentPage > maxPages) currentPage = 1;

    const startIndex = (currentPage - 1) * itemsPerPage;
    const loansToDisplay = allLoans.slice(startIndex, startIndex + itemsPerPage);

    container.innerHTML = "";
    loansToDisplay.forEach((loan) => {
        const book = BOOKS.find(b => String(b.id) === String(loan.book_id));
        const owner = USERS.find(u => String(u.id) === String(loan.owner_id));

        if (!book || !owner) return;

        const card = document.createElement("div");
        card.className = "karta-vypozicky";
        card.innerHTML = `
            <div class="karta-info">
                <h4>${book.title}</h4>
                <div class="karta-content">
                    <img src="${book.image_url}" alt="${book.title}" class="karta-img" style="width:100px; height:150px; border-radius: 5px; object-fit: cover;">
                    <div class="karta-detaily">
                        <p><strong>Autor:</strong> ${book.autor}</p>
                        <p><strong>Majiteľ:</strong> ${renderUserLink(owner.id, true, 14)}</p>
                        <p style="font-size: 0.85em; color: #666; margin-top: 5px;">
                            <strong>Termín:</strong><br>
                            ${loan.date_from} — ${loan.date_to}
                        </p>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(card);
    });

    renderBorrowedControls(totalLoans, itemsPerPage, paginationContainer, toggleContainer);
}

function renderBorrowedControls(totalItems, itemsPerPage, paginationContainer, toggleContainer) {
    if (!paginationContainer || !toggleContainer) return;

    toggleContainer.innerHTML = "";
    if (totalItems > 0) {
        const arrow = document.createElement("span");
        arrow.className = "toggle-arrow";
        arrow.style.cssText = "display: inline-block; transition: transform 0.4s; color: #2f70e9; font-size: 20px; cursor: pointer; user-select: none;";
        arrow.style.transform = isExpanded ? "rotate(180deg)" : "rotate(0deg)";
        arrow.innerHTML = "▼";
        arrow.onclick = () => {
            isExpanded = !isExpanded;
            currentPage = 1;
            renderBorrowedBooks();
        };
        toggleContainer.appendChild(arrow);
    }

    paginationContainer.innerHTML = "";
    if (isExpanded && totalItems > expandedLimit) {
        const nav = document.createElement("div");
        nav.style.cssText = "display: flex; gap: 8px; justify-content: center; margin-top: 20px; width: 100%;";
        
        const totalPages = Math.ceil(totalItems / expandedLimit);
        for (let i = 1; i <= totalPages; i++) {
            const pBtn = document.createElement("button");
            pBtn.className = "pBtn-style";
            pBtn.innerText = i;
            pBtn.style.cssText = `
                width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;
                border-radius: 50%; border: 1px solid #2f70e9; cursor: pointer; font-weight: bold;
                background: ${i === currentPage ? '#2f70e9' : 'white'};
                color: ${i === currentPage ? 'white' : '#2f70e9'};
            `;
            pBtn.onclick = () => {
                currentPage = i;
                renderBorrowedBooks();
                document.getElementById("section-borrowed-books").scrollIntoView({ behavior: 'smooth' });
            };
            nav.appendChild(pBtn);
        }
        paginationContainer.appendChild(nav);
    }
}

const checkData = setInterval(() => {
    if (typeof LOANS !== 'undefined' && LOANS.length > 0) {
        if (document.getElementById("pozicane-knihy")) {
            renderBorrowedBooks();
            clearInterval(checkData);
        }
    }
}, 500);