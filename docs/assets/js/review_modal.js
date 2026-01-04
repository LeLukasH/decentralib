import { db } from "./firebase.js";
import { addDoc, collection, doc, updateDoc } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
import { BOOKS } from "./api/allData.js";
import { refreshHeader } from "./utils.js";


// pre review modal, prerobene z book detail modal a z loan review ktore nebolo modal


// Global variable to hold the book ID currently being edited
let currentEditingBookId = null; 
let allBooksRef = null;
let allUsersRef = null;

// HTML elements
const reviewMsg = document.getElementById("review-texts");




//-----------------
// open modal - nech to berie loan id ked sa to modal okno 

// 
const openModal = () => {
  const params = new URLSearchParams(window.location.search);
  const loanId = params.get("loan_id");

  if (!loanId) {
    alert("nezname loan id");
    throw new Error(" error Missing loan_id");
  }

  // Show modal and use loanId
  showModal(loanId);
    // Display the modal
  modal.style.display = "block";
};


// ===================================================
// 1. DETAIL MODAL LOGIKA (Pôvodný kód)
// ===================================================


// nacitanie informacii o pozicke
async function loadLoanDetails() {
  // --- Loan ---
  const loanRef = doc(db, "loans", loanId);
  const loanSnap = await getDoc(loanRef);
  if (!loanSnap.exists()) {
    loanDataDiv.textContent = "Loan not found.";
    return;
  }
  const loan = loanSnap.data();
  loanDataDiv.innerHTML = `
    <p style="display: none;">Loan ID: ${loanId}</p>
    <p style="display: none;">Book ID: ${loan.book_id}</p>
    <p style="display: none;">Borrower ID: ${loan.borrower_id}</p>
    <p style="display: none;">Owner ID: ${loan.owner_id}</p>
    <p style="display: none;"> Status: ${loan.status}</p>
  `;
  loanIdInput.value = loanId;

  // --- Borrower ---
  const borrower = await getUserById(loan.borrower_id);
  if (borrower) {
    borrowerDataDiv.innerHTML = `
      <p style="display: none;" >${borrower.first_name} ${borrower.last_name}</p>
      <p>Nick: ${borrower.nick}</p>
    `;
  } else {
    borrowerDataDiv.textContent = "Borrower info not found.";
  }

  // --- Owner ---
  const owner = await getUserById(loan.owner_id);
  if (owner) {
    ownerDataDiv.innerHTML = `
      <p style="display: none;" >${owner.first_name} ${owner.last_name}</p>
      <p  >Nick: ${owner.nick}</p>
    `;
  } else {
    ownerDataDiv.textContent = "Owner info not found.";
  }

  // --- Book ---
  const book = await getBookById(loan.book_id);
  if (book) {
    bookDataDiv.innerHTML = `
      <p> Názov : ${book.title}</p>
    `;


  } else {
    bookDataDiv.textContent = "knihu sa nepodarilo najst.";
  }
}

loadLoanDetails();




// --- pridanie hodnotenia ---
reviewForm.addEventListener("review-button", async (e) => {
  e.preventDefault();
  const rating = parseInt(document.getElementById("rating").value);
  const text = document.getElementById("reviewText").value.trim();
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  if (!currentUser) {
    reviewMsg.textContent = "pre hodnotenie je nutne najprv sa prihlasit";
    return;
  }

  if (!rating || rating < 1 || rating > 5 || !text) {
    reviewMsg.textContent = " v hodnotení chýba text";
    return;
  }

  try {
    await addDoc(collection(db, "reviews"), {
      load_id: loanId,
      user_id: currentUser.id,
      rating,
      text,
      timestamp: serverTimestamp()
    });
    reviewMsg.textContent = "Hodnotenie bolo úspešne pridané";
    reviewForm.reset();
    loanIdInput.value = loanId;
  } catch (err) {
    console.error(err);
    reviewMsg.textContent = "Pri hodnotení nastala chyba stránky, skúste znovu ";
  }
});



// toto nech zoberie veci o knihe a vlastnikovy knihy, reuse funkcii z book modal
export function setupBookDetailModal(USERS, BOOKS) {
    // Uloží referencie pre neskoršie použitie v edit modale
    allBooksRef = BOOKS;
    allUsersRef = USERS;

    const modal = document.getElementById("reviewDetailModal");
    const closeModal = modal.querySelector(".close-button");

    const quickBorrowModal = document.getElementById("quickBorrowModal");

    // --- Pomocné funkcie pre VLASTNÍKA (prevzaté z home.js) ---
    function getOwner(book) {
        return USERS.find(u => u.id === book.owner_id) || null;
    }
    // ... (ostatné pomocné funkcie pre vlastníka sú rovnaké) ...
    function getOwnerNick(book) {
        const owner = getOwner(book);
        return owner ? owner.nick : "neznámy vlastník";
    }


    // -----------------------------------------------------------

    window.showBookDetail = function(bookId) {
        const book = BOOKS.find(b => b.id === bookId);
        if (!book) {
            console.error("Kniha s ID " + bookId + " nebola nájdená.");
            return;
        }

        // 1. Získanie dát a nastavenie info polí
        const ownerNick = getOwnerNick(book);
        
        // ... (Nastavenie elementov DOM - rovnaké ako Váš kód) ...
        document.getElementById("modal-title").textContent = book.title;        
        document.getElementById("modal-owner").textContent = ownerNick;
        
        const borrowDetails = modal.querySelector("details");
        borrowDetails.style.display = "none";



       // document.getElementById("review-button").onclick = () => createLoanRequest(bookId, document.getElementById("date-from").value, document.getElementById("date-to").value, document.getElementById("form-borrow"));
        // v review modal toto bude fungovat inak
        

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



    document.getElementById("quickBorrowClose").onclick = () => {
        quickBorrowModal.style.display = "none";
    };


}

// ===================================================
//
// ===================================================







