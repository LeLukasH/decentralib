import { LOANS, BOOKS, USERS } from "./api/allData.js";

export async function getAllLoans() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return [];

    const myLoans = LOANS.filter(loan => loan.borrower_id === currentUser.id && loan.status === 'approved');

    return myLoans;
}

export async function renderBorrowedBooks() {
    const container = document.getElementById("pozicane-knihy");
    if (!container) return;
    
    container.innerHTML = "<p>Načítavam...</p>";
    const loans = await getAllLoans();

    if (loans.length === 0) {
        container.innerHTML = "<p>Nemáte požičané žiadne knihy.</p>";
        return;
    }
    container.innerHTML = "";

    loans.forEach((loan) => {
        const card = document.createElement("div");
        card.className = "karta-knihy";
        const owner = USERS.find(u => u.id === loan.owner_id);
        const book = BOOKS.find(b => b.id === loan.book_id);

        card.innerHTML = `
            <h4>${book.title}</h4>
            <div class="karta-content">
                <img src="${book.image_url}" alt="" width="130" height="200">
                <div class="karta-info">
                    <p>${book.autor}</p>
                    <p style="font-size: 16px;">
                        ${owner.first_name} ${owner.last_name}             
                        <span style='font-size:25px; color:yellow'>&#9733;</span>
                            ${owner.reputation}
                        <p>${owner.location}</p>
                    </p>
                    <p><strong>Požičané od:</strong> ${loan.date_from}</p>
                    <p><strong>Požičané do:</strong> ${loan.date_to}</p>                    
                </div>
            </div>`;
        container.appendChild(card);
    });
}

renderBorrowedBooks();