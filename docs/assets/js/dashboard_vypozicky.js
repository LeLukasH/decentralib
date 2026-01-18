import { db } from "./firebase.js";
import { doc, updateDoc, addDoc, collection } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
import { LOANS, BOOKS, USERS, refetchLoans, refetchBooks } from "./api/allData.js";
import { renderUserLink, refreshHeader } from "./utils.js";
import { openReviewModal } from "./review_modal.js";

// --- STAVY PRE STRÁNKOVANIE ---
let pageWaiting = 1;
let pageLent = 1;

const INITIAL_LIMIT = 4;   
const EXPANDED_LIMIT = 12; 

let isExpandedWaiting = false; 
let isExpandedLent = false;

const currentUser = JSON.parse(localStorage.getItem('currentUser'));

/**
 * AKTUALIZÁCIA ŠTATISTIKY: Aktívne pôžičky (vpravo)
 * Počíta knihy, ktoré som požičal iným (approved + unavailable)
 */
function updateLendingStat(lentCount) {
    const lentEl = document.getElementById('count-total-borrows'); 
    if (lentEl) lentEl.innerText = lentCount;
}

export function renderDashboardLoans() {
    if (!currentUser) return;

    // Filtrovanie
    const waitingLoans = LOANS.filter(l => l.owner_id === currentUser.id && l.status === "waiting");
    
    const lentLoans = LOANS.filter(l => {
        const book = BOOKS.find(b => b.id === l.book_id);
        return l.owner_id === currentUser.id && l.status === "approved" && book?.status === "unavailable";
    });

    // Aktualizujeme už len túto jednu štatistiku (Aktívne pôžičky)
    updateLendingStat(lentLoans.length);

    // Render sekcie: Čaká na rozhodnutie
    renderSection({
        data: waitingLoans,
        containerId: "zoznam-cakajucich",
        paginationId: "pagination-cakajuce",
        toggleId: "toggle-cakajuce",
        currentPage: pageWaiting,
        isExpanded: isExpandedWaiting,
        cardCreator: createCakajucaCard,
        onPageChange: (p) => { pageWaiting = p; renderDashboardLoans(); },
        onToggle: () => { isExpandedWaiting = !isExpandedWaiting; pageWaiting = 1; renderDashboardLoans(); }
    });

    // Render sekcie: Požičané odo mňa
    renderSection({
        data: lentLoans,
        containerId: "zoznam-schvalenych",
        paginationId: "pagination-schvalene",
        toggleId: "toggle-schvalene",
        currentPage: pageLent,
        isExpanded: isExpandedLent,
        cardCreator: createSchvalenaCard,
        onPageChange: (p) => { pageLent = p; renderDashboardLoans(); },
        onToggle: () => { isExpandedLent = !isExpandedLent; pageLent = 1; renderDashboardLoans(); }
    });
}

// --- KARTY ---

function createSchvalenaCard(loan) {
    const book = BOOKS.find(b => b.id === loan.book_id) || {};
    const borrower = USERS.find(u => u.id === loan.borrower_id) || {};
    return `
        <div class="karta-vypozicky" data-id="${loan.id}">
            <div class="karta-content">
                <img src="${book.image_url}" alt="" width="100" height="150" class="karta-img">
                <div class="karta-info">
                    <h4>${book.title}</h4>
                    <p><strong>Autor:</strong> ${book.autor}</p>
                    <p><strong>Požičal si:</strong> ${renderUserLink(borrower.id, true, 14)}</p>
                    <p><strong>Od:</strong> ${loan.date_from} <strong>Do:</strong> ${loan.date_to}</p>
                </div>
            </div>
            <button class="btn-vratenie" onclick="window.processLoan('${loan.id}', 'returned')">
                Potvrdiť vrátenie
            </button>
        </div>`;
}

function createCakajucaCard(loan) {
    const book = BOOKS.find(b => b.id === loan.book_id) || {};
    const borrower = USERS.find(u => u.id === loan.borrower_id) || {};
    return `
        <div class="karta-vypozicky" data-id="${loan.id}">
            <div class="karta-content">
                <img src="${book.image_url}" alt="" width="100" height="150" class="karta-img">
                <div class="karta-info">
                    <h4>${book.title}</h4>
                    <p><strong>Autor:</strong> ${book.autor}</p>
                    <p><strong>Žiadateľ:</strong> ${renderUserLink(borrower.id, true, 14)}</p>
                    <p><strong>Požadované:</strong> ${loan.date_from} - ${loan.date_to}</p>
                </div>
            </div>
            <div class="vypozicka-akcie-row">
                ${book.status === "available" 
                    ? `<button class="btn-schvalit" onclick="window.processLoan('${loan.id}', 'approved')">Schváliť</button>` 
                    : '<p class="obsadene-info">Kniha je obsadená</p>'}
                <button class="btn-zamietnut" onclick="window.processLoan('${loan.id}', 'rejected')">Zamietnuť</button>
            </div>
        </div>`;
}

// --- UNIVERZÁLNY RENDER ---

function renderSection({ data, containerId, paginationId, toggleId, currentPage, isExpanded, cardCreator, onPageChange, onToggle }) {
    const container = document.getElementById(containerId);
    const toggleCont = document.getElementById(toggleId);
    const paginCont = document.getElementById(paginationId);

    if (!container || !toggleCont) return;

    toggleCont.innerHTML = `<span class="toggle-arrow" style="transform: rotate(${isExpanded ? '180deg' : '0deg'});">▼</span>`;
    toggleCont.onclick = onToggle;

    if (data.length === 0) {
        container.innerHTML = `<p class="empty-msg">Žiadne záznamy.</p>`;
        if (paginCont) paginCont.innerHTML = "";
        return;
    }

    const currentLimit = isExpanded ? EXPANDED_LIMIT : INITIAL_LIMIT;
    const startIndex = (currentPage - 1) * currentLimit;
    const itemsToShow = data.slice(startIndex, startIndex + currentLimit);
    
    container.innerHTML = itemsToShow.map(cardCreator).join('');

    if (paginCont) {
        if (isExpanded && data.length > EXPANDED_LIMIT) {
            const totalPages = Math.ceil(data.length / EXPANDED_LIMIT);
            let html = "";
            for (let i = 1; i <= totalPages; i++) {
                const isActive = i === currentPage;
                html += `<button class="pBtn-style" 
                         style="background: ${isActive ? '#2f70e9' : 'white'}; color: ${isActive ? 'white' : '#2f70e9'};">
                         ${i}</button>`;
            }
            paginCont.innerHTML = html;
            paginCont.querySelectorAll('button').forEach((btn, idx) => {
                btn.onclick = () => onPageChange(idx + 1);
            });
        } else {
            paginCont.innerHTML = "";
        }
    }
}

// --- FIREBASE ---

window.processLoan = async function(loanId, newStatus) {
    const loan = LOANS.find(l => l.id === loanId);
    if (!loan) return;

    const timestamp = new Date().toISOString();
    const loanRef = doc(db, "loans", loanId);
    const bookRef = doc(db, "books", String(loan.book_id));

    try {
        await updateDoc(loanRef, { status: newStatus, created_at: timestamp });

        if (newStatus === "approved") await updateDoc(bookRef, { status: "unavailable" });
        else if (newStatus === "returned") {
            await updateDoc(bookRef, { status: "available" });

            // OTVORENIE HODNOTIACEHO OKNA
            openReviewModal({
                loan_id: loanId,
                user_id: loan.borrower_id
            });
        }

        const baseNotif = { loan_id: loanId, is_read: false, created_at: timestamp };
        await addDoc(collection(db, "notifications"), { ...baseNotif, type: "loan_" + newStatus + "_borrower", recipient_id: loan.borrower_id, sender_id: loan.owner_id });
        await addDoc(collection(db, "notifications"), { ...baseNotif, type: "loan_" + newStatus + "_owner", recipient_id: loan.owner_id, sender_id: loan.borrower_id });

        await refetchLoans();
        await refetchBooks();
        renderDashboardLoans();
        refreshHeader();
    } catch (error) {
        console.error("Chyba:", error);
    }
};

const checkData = setInterval(() => {
    if (typeof LOANS !== 'undefined' && LOANS.length > 0) {
        renderDashboardLoans();
        clearInterval(checkData);
    }
}, 500);