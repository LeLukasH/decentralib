import { setupBookDetailModal } from "./book_detail_modal.js";
import { USERS, BOOKS} from "./api/allData.js";

function getOwner(book) {
        return USERS.find(u => u.id === book.owner_id) || null;
}

function getOwnerNick(book) {
        const owner = getOwner(book);
        return owner ? owner.nick : "neznámy";
}

function getBook(bookId){
    return BOOKS.find(u => u.id === bookId) || null;
}

const params = new URLSearchParams(window.location.search);
const book_id = parseInt(params.get("book"));
const book = getBook(book_id);

const owner = getOwnerNick(book);
const book_name = book.title;

document.getElementById("success-message").textContent = `Používateľ ${owner} obdržal vašu žiadosť o vypožičanie knihy ${book_name} .`;