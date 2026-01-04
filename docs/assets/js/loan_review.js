import { db } from "./firebase.js";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

// HTML elements
const loanDataDiv = document.getElementById("loanData");
const borrowerDataDiv = document.getElementById("borrowerData");
const ownerDataDiv = document.getElementById("ownerData");
const bookDataDiv = document.getElementById("bookData");
const loanIdInput = document.getElementById("loanId");
const reviewForm = document.getElementById("reviewForm");
const reviewMsg = document.getElementById("reviewMsg");

// Get loan_id from URL
const params = new URLSearchParams(window.location.search);
const loanId = params.get("loan_id");
if (!loanId) {
  alert("No loan_id provided in URL");
  throw new Error("Missing loan_id");
}

// Helper: get user by id field
async function getUserById(userId) {
  const q = query(collection(db, "users"), where("id", "==", userId));
  const snap = await getDocs(q);
  if (!snap.empty) {
    return snap.docs[0].data();
  }
  return null;
}

// Helper: get book by id field
async function getBookById(bookId) {
  const q = query(collection(db, "books"), where("id", "==", bookId));
  const snap = await getDocs(q);
  if (!snap.empty) {
    return snap.docs[0].data();
  }
  return null;
}

// Load all loan-related data
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
    <p>Loan ID: ${loanId}</p>
    <p>Book ID: ${loan.book_id}</p>
    <p>Borrower ID: ${loan.borrower_id}</p>
    <p>Owner ID: ${loan.owner_id}</p>
    <p>Status: ${loan.status}</p>
    <p>From: ${loan.date_from}</p>
    <p>To: ${loan.date_to}</p>
    <p>Created at: ${loan.created_at}</p>
  `;
  loanIdInput.value = loanId;

  // --- Borrower ---
  const borrower = await getUserById(loan.borrower_id);
  if (borrower) {
    borrowerDataDiv.innerHTML = `
      <p style="display: none;" >${borrower.first_name} ${borrower.last_name}</p>
      <p>Nick: ${borrower.nick}</p>
      <p>Email: ${borrower.email}</p>
      <p>Location: ${borrower.location}</p>
      <p>Reputation: ${borrower.reputation || "-"}</p>
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
      <p >Email: ${owner.email}</p>
      <p style="display: none;" >Location: ${owner.location}</p>
      <p style="display: none;" >Reputation: ${owner.reputation || "-"}</p>
    `;
  } else {
    ownerDataDiv.textContent = "Owner info not found.";
  }

  // --- Book ---
  const book = await getBookById(loan.book_id);
  if (book) {
    bookDataDiv.innerHTML = `
      <p> Názov : ${book.title}</p>
      <p style="display: none;" > Autor: ${book.autor}</p>
      <p style="display: none;" >Type: ${book.type}</p>
      <p style="display: none;" >Language: ${book.language}</p>
      <p style="display: none;">Status: ${book.status}</p>
      <p  > Popis : ${book.description}</p>
      <img style="display: none;" src="${book.image_url}" width="150">
    `;


  } else {
    bookDataDiv.textContent = "Book info not found.";
  }
}

loadLoanDetails();

// --- Review submission ---
reviewForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const rating = parseInt(document.getElementById("rating").value);
  const text = document.getElementById("reviewText").value.trim();
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  if (!currentUser) {
    reviewMsg.textContent = "You must be logged in to submit a review.";
    return;
  }

  if (!rating || rating < 1 || rating > 5 || !text) {
    reviewMsg.textContent = "Please enter valid rating (1-5) and text.";
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
    reviewMsg.textContent = "Review submitted successfully!";
    reviewForm.reset();
    loanIdInput.value = loanId;
  } catch (err) {
    console.error(err);
    reviewMsg.textContent = "Failed to submit review.";
  }
});

// vypocitat user rating


async function recalculateAllUserReputations(db) {
  // 1. Read all reviews
  const reviewsSnap = await getDocs(collection(db, "reviews"));

  // 2. Aggregate ratings per user
  const stats = {}; 
  // stats[userId] = { total, count }

  reviewsSnap.forEach(reviewDoc => {
    const { user_id, rating } = reviewDoc.data();

    if (!stats[user_id]) {
      stats[user_id] = { total: 0, count: 0 };
    }

    stats[user_id].total += rating;
    stats[user_id].count += 1;
  });

  // 3. Read all users
  const usersSnap = await getDocs(collection(db, "users"));

  // 4. Update each user's reputation
  for (const userDoc of usersSnap.docs) {
    const userData = userDoc.data();
    const userId = userData.id;
    const userRef = doc(db, "users", userDoc.id);

    if (stats[userId]) {
      const reputation = stats[userId].total / stats[userId].count;
      await updateDoc(userRef, { reputation });
    } else {
      await updateDoc(userRef, { reputation: null });
    }
  }
}

await recalculateAllUserReputations(db);






// pre hviezdicky na hodnoteni





const stars = document.querySelectorAll("#starRating span");
const ratingInput = document.getElementById("rating");

stars.forEach(star => {
  star.addEventListener("click", () => {
    const value = star.dataset.value;
    ratingInput.value = value;

    stars.forEach(s => {
      s.classList.toggle("active", s.dataset.value <= value);
    });
  });

});
