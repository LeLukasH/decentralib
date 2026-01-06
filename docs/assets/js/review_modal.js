import { db } from "./firebase.js";
import { collection, addDoc, serverTimestamp, query, where, getDocs, doc, updateDoc } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
import { LOANS, USERS, BOOKS } from "./api/allData.js";

let currentRating = 0;
let currentLoanId = null;
let reviewedUserId = null;

export async function openReviewModal({ loan_id, user_id }) {
    currentLoanId = loan_id;
    reviewedUserId = user_id;
    currentRating = 0;

    const modal = document.getElementById("reviewModal");
    if (!modal) return;

    const reviewText = modal.querySelector("#reviewText");
    const submitButton = modal.querySelector("#submitReview");
    const title = modal.querySelector("#reviewModalTitle");
    const subTitle = modal.querySelector("#reviewModalSubtitle");
    const ratingStars = modal.querySelectorAll(".rating span");

    if (!reviewText || !submitButton || !title || !subTitle || !ratingStars) return;

    reviewText.value = "";
    submitButton.disabled = true;

    ratingStars.forEach(star => star.classList.remove("active"));

    modal.classList.remove("hidden");

    const loan = LOANS.find(l => l.id == loan_id);
    const user = USERS.find(u => u.id == user_id);
    const book = BOOKS.find(b => b.id == loan.book_id);

    title.textContent = user ? `${user.first_name} ${user.last_name}` : `Neznámy používateľ ${user_id}`;
    subTitle.textContent = `(Požička knihy „${book ? book.title : "Neznáma kniha"}”)`;

    // ===== rating stars event =====
    ratingStars.forEach(star => {
        star.onclick = () => {
            currentRating = Number(star.dataset.value);
            ratingStars.forEach(s => s.classList.toggle("active", Number(s.dataset.value) <= currentRating));
            submitButton.disabled = false;
        };
    });

    // ===== buttons event =====
    const cancelBtn = modal.querySelector("#cancelReview");
    if (cancelBtn) cancelBtn.onclick = closeReviewModal;

    submitButton.onclick = async () => {
        const currentUser = JSON.parse(localStorage.getItem("currentUser"));
        if (!currentUser) return;

        const text = reviewText.value;

        await addDoc(collection(db, "reviews"), {
            loan_id: currentLoanId,
            user_id: reviewedUserId,
            reviewer_id: currentUser.id,
            rating: currentRating,
            text,
            created_at: serverTimestamp()
        });

        // 2️⃣ Fetch all reviews of this user
        const reviewsQuery = query(
            collection(db, "reviews"),
            where("user_id", "==", String(reviewedUserId))
        );
        const snapshot = await getDocs(reviewsQuery);
        const allReviews = snapshot.docs.map(d => d.data());

        // 3️⃣ Compute average rating and count
        const count = allReviews.length;
        const sum = allReviews.reduce((acc, r) => acc + r.rating, 0);
        const avg = count ? (sum / count) : 0;

        const user = USERS.find(u => u.id == reviewedUserId);
        if (!user) return;

        // 4️⃣ Update user reputation
        const userRef = doc(db, "users", user.email); // assumes user doc id = reviewedUserId
        await updateDoc(userRef, {
            reputation: avg,
            reviews_count: count
        });

        const modalContent = modal.querySelector(".modal-content");

        // schovať pôvodný obsah
        modalContent.querySelectorAll("*").forEach(el => el.style.display = "none");

        // vytvoriť div s Dakujeme
        const thankYouDiv = document.createElement("div");
        thankYouDiv.id = "thankYouMessage";
        thankYouDiv.textContent = "Hodnotenie odoslané ✅";
        thankYouDiv.style.textAlign = "center";
        thankYouDiv.style.fontSize = "1.3rem";
        thankYouDiv.style.fontWeight = "bold";
        modalContent.appendChild(thankYouDiv);

        setTimeout(() => {
            modal.classList.add("hidden");
            thankYouDiv.remove();
            modalContent.querySelectorAll("*").forEach(el => el.style.display = "");
            reviewText.value = "";
            currentRating = 0;
            ratingStars.forEach(star => star.classList.remove("active"));
            submitButton.disabled = true;
        }, 1500);
    };
}

function closeReviewModal() {
    const modal = document.getElementById("reviewModal");
    if (modal) modal.classList.add("hidden");
}
