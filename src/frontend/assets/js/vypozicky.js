import { LOANS, BOOKS, USERS, refetchLoans } from "./api/allData.js";
import { doc, updateDoc, addDoc, collection } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
import { db } from "./firebase.js";

async function updateLoanStatus(loanId, newStatus) {
    const loanRef = doc(db, "loans", loanId);

    await updateDoc(loanRef, {
        status: newStatus
    });

    console.log(`Loan ${loanId} updated → ${newStatus}`);

    await refetchLoans();
    refreshLists();
    rerenderActiveTab();

    // Send notification to borrower
    const timestamp = new Date().toISOString();
    const loan = LOANS.find(loan => loan.id === loanId);
    const owner_id = loan.owner_id;
    const borrower_id = loan.borrower_id;

    await addDoc(collection(db, "notifications"), {
        loan_id: loanId,
        type: "loan_" + newStatus + "_borrower",
        recipient_id: borrower_id,
        sender_id: owner_id,
        is_read: false,
        created_at: timestamp
    });

    console.log("Notifikacia 1 OK");

    await addDoc(collection(db, "notifications"), {
        loan_id: loanId,
        type: "loan_" + newStatus + "_owner",
        recipient_id: owner_id,
        sender_id: borrower_id,
        is_read: false,
        created_at: timestamp
    });

    console.log("Notifikacia 2 OK");
}

let refreshLists;     // defined globally so updateLoanStatus can call it
let rerenderActiveTab;

function init() {
    // --- 1. Konštanty pre Stránkovanie ---
    const ITEMS_PER_ROW = 4;
    const ROWS_PER_PAGE = 3;
    const ITEMS_PER_PAGE = ITEMS_PER_ROW * ROWS_PER_PAGE;

    // --- 2. Elementy DOM ---
    const btnSchvalene = document.getElementById('btnSchvalene');
    const btnCakajuce = document.getElementById('btnCakajuce');
    const schvaleneVypozicky = document.getElementById('schvaleneVypozicky');
    const cakajuceVypozicky = document.getElementById('cakajuceVypozicky');
    const zoznamSchvalenych = document.getElementById('zoznam-schvalenych');
    const zoznamCakajucich = document.getElementById('zoznam-cakajucich');

    let activeTab = "schvalene";

    // Stránky
    let currentPageSchvalene = 1;
    let currentPageCakajuce = 1;

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        console.error("Používateľ nie je prihlásený.");
        return;
    }

    // Mutable arrays
    let schvaleneLoans = [];
    let cakajuceLoans = [];

    // --- REFRESH LISTS FUNCTION ---
    refreshLists = function () {
        schvaleneLoans.length = 0;
        cakajuceLoans.length = 0;

        LOANS.forEach(loan => {
            const book = BOOKS.find(b => b.id === loan.book_id);
            if (!book) return;

            if (loan.owner_id === currentUser.id && loan.status === "approved" && book.status === "unavailable") {
                schvaleneLoans.push(loan);
            }
            if (loan.owner_id === currentUser.id && loan.status === "waiting" && book.status === "available") {
                cakajuceLoans.push(loan);
            }
        });
    };

    refreshLists();

    // --- 4. Tvorba Kariet ---
    function createSchvalenaCard(loan) {
        const book = BOOKS.find(b => b.id === loan.book_id);
        const borrower = USERS.find(u => u.id === loan.borrower_id);
        return `
            <div class="karta-vypozicky" data-id="${loan.id}">
                <div class="karta-content">
                    <img src="${book.image_url}" width="80" height="120">
                    <div class="karta-info">
                        <h4>${book.title}</h4>
                        <p><strong>Autor:</strong> ${book.autor}</p>
                        <p><strong>Požičal si:</strong> ${borrower.first_name} ${borrower.last_name}
                        (<span class="rating-star">&#9733;</span>${borrower.reputation})</p>
                        <p><strong>Od:</strong> ${loan.date_from} <strong>Do:</strong> ${loan.date_to}</p>
                    </div>
                </div>
                <button class="request-button schvalena-akcia" style="background:#1e8543;margin-top:10px;">
                    Potvrdiť vrátenie
                </button>
            </div>
        `;
    }

    function createCakajucaCard(loan) {
        const book = BOOKS.find(b => b.id === loan.book_id);
        const borrower = USERS.find(u => u.id === loan.borrower_id);
        return `
            <div class="karta-vypozicky" data-id="${loan.id}">
                <div class="karta-content">
                    <img src="${book.image_url}" width="80" height="120">
                    <div class="karta-info">
                        <h4>${book.title}</h4>
                        <p><strong>Autor:</strong> ${book.autor}</p>
                        <p><strong>Žiadateľ:</strong> ${borrower.first_name} ${borrower.last_name}
                        (<span class="rating-star">&#9733;</span>${borrower.reputation})</p>
                        <p><strong>Požadované:</strong> ${loan.date_from} - ${loan.date_to}</p>
                    </div>
                </div>
                <div class="action-buttons" style="display:flex;gap:10px;margin-top:10px;">
                    <button class="request-button cakajuca-schvalit" style="background:#2f70e9;flex:1;">Schváliť</button>
                    <button class="request-button cakajuca-zamietnut" style="background:#c62828;flex:1;">Zamietnuť</button>
                </div>
            </div>
        `;
    }

    // --- 5. Zobrazenie + Stránkovanie ---
    function displayList(data, container, currentPage, cardCreator) {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;

        container.style.display = 'grid';
        container.innerHTML = data.slice(startIndex, endIndex).map(cardCreator).join('');
    }

    function setupPagination(data, paginationId, current, listType) {
        const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);
        const paginationContainer = document.getElementById(paginationId);

        if (totalPages <= 1) {
            paginationContainer.innerHTML = '';
            return;
        }

        let html = '';

        html += `<button class="pagination-button nav-arrow" data-page="${current - 1}" data-list="${listType}" ${current === 1 ? 'disabled' : ''}>&lt;</button>`;

        for (let i = 1; i <= totalPages; i++) {
            html += `<button class="pagination-button ${i === current ? 'active' : ''}" data-page="${i}" data-list="${listType}">${i}</button>`;
        }

        html += `<button class="pagination-button nav-arrow" data-page="${current + 1}" data-list="${listType}" ${current === totalPages ? 'disabled' : ''}>&gt;</button>`;

        paginationContainer.innerHTML = html;

        paginationContainer.querySelectorAll('.pagination-button').forEach(button => {
            button.addEventListener('click', (e) => {
                if (button.disabled) return;

                const newPage = parseInt(button.getAttribute('data-page'));
                const type = button.getAttribute('data-list');

                if (type === 'schvalene') currentPageSchvalene = newPage;
                else currentPageCakajuce = newPage;

                renderPagination(type);
            });
        });
    }

    function renderPagination(listType) {
        if (listType === 'schvalene') {
            displayList(schvaleneLoans, zoznamSchvalenych, currentPageSchvalene, createSchvalenaCard);
            setupPagination(schvaleneLoans, 'pagination-schvalene', currentPageSchvalene, 'schvalene');
        } else {
            displayList(cakajuceLoans, zoznamCakajucich, currentPageCakajuce, createCakajucaCard);
            setupPagination(cakajuceLoans, 'pagination-cakajuce', currentPageCakajuce, 'cakajuce');
        }
    }

    // Used by updateLoanStatus()
    rerenderActiveTab = function () {
        renderPagination(activeTab);
    };

    // --- 6. Prepínanie ---
    function prepniZobrazenie(typ) {
        activeTab = typ;

        if (typ === 'schvalene') {
            btnSchvalene.classList.add('active');
            schvaleneVypozicky.classList.remove('hidden');
            btnCakajuce.classList.remove('active');
            cakajuceVypozicky.classList.add('hidden');
        } else {
            btnCakajuce.classList.add('active');
            cakajuceVypozicky.classList.remove('hidden');
            btnSchvalene.classList.remove('active');
            schvaleneVypozicky.classList.add('hidden');
        }

        renderPagination(typ);
    }

    btnSchvalene.addEventListener('click', () => prepniZobrazenie('schvalene'));
    btnCakajuce.addEventListener('click', () => prepniZobrazenie('cakajuce'));

    // --- 7. Inicializácia ---
    prepniZobrazenie('schvalene');

    // --- 8. Click Akcie ---
    document.addEventListener('click', async (e) => {
        const card = e.target.closest('.karta-vypozicky');
        if (!card) return;

        const id = card.getAttribute('data-id');

        if (e.target.classList.contains('schvalena-akcia')) {
            await updateLoanStatus(id, "returned");
            
            const bookId = LOANS.find(loan => loan.id === id).book_id;
            const bookRef = doc(db, "books", bookId);
            await updateDoc(bookRef, {
                status: "available"
            });
        }

        if (e.target.classList.contains('cakajuca-schvalit')) {
            await updateLoanStatus(id, "approved");

            const bookId = LOANS.find(loan => loan.id === id).book_id;
            const bookRef = doc(db, "books", bookId);
            await updateDoc(bookRef, {
                status: "unavailable"
            });
        }

        if (e.target.classList.contains('cakajuca-zamietnut')) {
            await updateLoanStatus(id, "rejected");
        }
    });
}

init();
