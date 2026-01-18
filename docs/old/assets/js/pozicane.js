import { LOANS, BOOKS, USERS } from "./api/allData.js";
import { renderUserLink } from "./utils.js";

// === Konštanty pre Stránkovanie ===
const BOOKS_PER_PAGE = 12; // 4 stĺpce * 3 riadky
let currentPage = 1;
// ==================================

export async function getAllLoans() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return [];

    // Filtrujeme iba schválené pôžičky, kde je aktuálny užívateľ 'borrower'
    const myLoans = LOANS.filter(loan => 
        loan.borrower_id === currentUser.id && 
        loan.status === 'approved'
    );

    return myLoans;
}

export async function renderBorrowedBooks() {
    const container = document.getElementById("pozicane-knihy");
    if (!container) return;
    
    container.innerHTML = "<p>Načítavam...</p>";
    const allLoans = await getAllLoans();
    const totalLoans = allLoans.length;

    if (totalLoans === 0) {
        container.innerHTML = "<p>Nemáte požičané žiadne knihy.</p>";
        renderPagination(0);
        return;
    }

    // Logika Stránkovania
    const totalPages = Math.ceil(totalLoans / BOOKS_PER_PAGE);
    
    if (currentPage > totalPages && totalPages > 0) {
        currentPage = totalPages;
        return renderBorrowedBooks();
    }
    
    const startIndex = (currentPage - 1) * BOOKS_PER_PAGE;
    const endIndex = startIndex + BOOKS_PER_PAGE;
    
    const loansToRender = allLoans.slice(startIndex, endIndex);

    // Vykreslenie kariet
    container.innerHTML = "";
    
    loansToRender.forEach((loan) => {
        const card = document.createElement("div");
        card.className = "karta-knihy";
        
        const owner = USERS.find(u => u.id === loan.owner_id);
        const book = BOOKS.find(b => b.id === loan.book_id);

        if (!book || !owner) return;

        card.innerHTML = `
            <h4>${book.title}</h4>
            <div class="karta-content">
                <img src="${book.image_url}" alt="${book.title}" width="100" height="140"> 
                <div class="karta-info">
                    <p><strong>Autor:</strong> ${book.autor}</p>
                    <p>
                        <strong>Majiteľ:</strong> ${renderUserLink(owner.id, true, 14)}
                    </p>
                    <p><strong>Lokalita:</strong> ${owner.location}</p>
                    
                    <p><strong>Požičané:</strong></p> 
                    <p><strong>Od:</strong> ${loan.date_from}</p> 
                    <p><strong>Do:</strong> ${loan.date_to}</p>                    
                </div>
            </div>
            `;
        container.appendChild(card);
    });

    renderPagination(totalLoans);
}

// === Funkcie Stránkovania (Ponechané bez zmien) ===

function renderPagination(totalLoans) {
    const totalPages = Math.ceil(totalLoans / BOOKS_PER_PAGE);
    let paginationContainer = document.getElementById("pagination-container");

    if (!paginationContainer) return;

    paginationContainer.innerHTML = ''; 

    if (totalPages <= 1) return;

    const prevButton = createPaginationButton("«", currentPage > 1, () => {
        currentPage--;
        renderBorrowedBooks();
    });
    prevButton.classList.add('nav-arrow'); 
    paginationContainer.appendChild(prevButton);

    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    
    if (endPage - startPage < maxPagesToShow - 1) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        const pageButton = createPaginationButton(i, true, () => {
            currentPage = i;
            renderBorrowedBooks();
        });
        if (i === currentPage) {
            pageButton.classList.add('active');
        }
        paginationContainer.appendChild(pageButton);
    }

    const nextButton = createPaginationButton("»", currentPage < totalPages, () => {
        currentPage++;
        renderBorrowedBooks();
    });
    nextButton.classList.add('nav-arrow'); 
    paginationContainer.appendChild(nextButton);
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function createPaginationButton(text, isEnabled, onClick) {
    const button = document.createElement('button');
    button.textContent = text;
    button.disabled = !isEnabled;
    button.onclick = onClick;
    button.className = 'pagination-button';
    return button;
}

renderBorrowedBooks();