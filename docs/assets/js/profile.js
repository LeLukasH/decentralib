import { db } from "./firebase.js";
import {
  collection,
  doc,
  getDoc,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

// HTML elements
const userDataDiv = document.getElementById("userData");
const reviewsContainer = document.getElementById("reviewsContainer");

// Current logged-in user
const currentUser = JSON.parse(localStorage.getItem("currentUser"));
if (!currentUser) {
  alert("You must be logged in to see your profile.");
  throw new Error("No user logged in");
}

// Display basic user info
userDataDiv.innerHTML = `
  <p>Name: ${currentUser.first_name} ${currentUser.last_name}</p>
  <p>Nick: ${currentUser.nick}</p>
  <p>Email: ${currentUser.email}</p>
  <p>Location: ${currentUser.location}</p>
  <p>Reputation: ${currentUser.reputation || "-"}</p>
`;

// Fetch all reviews about this user
async function loadReviewsAboutUser() {
  const reviewSnap = await getDocs(collection(db, "reviews"));
  if (reviewSnap.empty) {
    reviewsContainer.textContent = "Nemáte žiadne recenzie.";
    return;
  }

  reviewsContainer.innerHTML = "";

  for (const docSnap of reviewSnap.docs) {
    const review = docSnap.data();

    // Get loan info
    const loanRef = doc(db, "loans", review.load_id);
    const loanSnap = await getDoc(loanRef);
    if (!loanSnap.exists()) continue;

    const loan = loanSnap.data();

    // Check if current user is borrower or owner of this loan
    if (loan.borrower_id !== currentUser.id && loan.owner_id !== currentUser.id) continue;

    // Show the review
    const reviewDiv = document.createElement("div");
    reviewDiv.style.border = "1px solid #ccc";
    reviewDiv.style.margin = "10px 0";
    reviewDiv.style.padding = "10px";

    reviewDiv.innerHTML = `
      <p><strong>Loan ID:</strong> ${review.load_id}</p>
      <p><strong>Rating:</strong> ${review.rating}</p>
      <p><strong>Review:</strong> ${review.text}</p>
      <p><strong>Submitted:</strong> ${review.timestamp?.toDate ? review.timestamp.toDate().toLocaleString() : "-"}</p>
      <p><strong>Loan Role:</strong> ${loan.borrower_id === currentUser.id ? "Borrower" : "Owner"}</p>
    `;

    reviewsContainer.appendChild(reviewDiv);
  }
}

loadReviewsAboutUser();
