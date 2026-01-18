import { db } from "./firebase.js";
import { collection, addDoc, serverTimestamp, query, where, getDocs, doc, updateDoc } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
import { LOANS, USERS, BOOKS } from "./api/allData.js";

let currentRating = 0;
let currentLoanId = null;
let reviewedUserId = null;

// -----------------------------
// CREATE REVIEW MODAL IF NOT EXISTS
// -----------------------------
function ensureReviewModalExists() {
    let modal = document.getElementById("reviewModal");
    if (modal) return modal;

    modal = document.createElement("div");
    modal.id = "reviewModal";
    modal.className = "review-modal hidden";

    modal.innerHTML = `
        <div class="review-modal-backdrop"></div>

        <div class="review-modal-content">
            <h2>Hodnotenie používateľa</h2>
            <span id="reviewModalTitle"></span>
            <span id="reviewModalSubtitle"></span>

            <div class="review-rating">
                <span data-value="1">★</span>
                <span data-value="2">★</span>
                <span data-value="3">★</span>
                <span data-value="4">★</span>
                <span data-value="5">★</span>
            </div>

            <textarea
                id="reviewText"
                placeholder="Napíšte krátke hodnotenie (nepovinné)"
            ></textarea>

            <div class="review-modal-actions">
                <button id="cancelReview">Zrušiť</button>
                <button id="submitReview" disabled>Odoslať</button>
            </div>

            <div id="debugReviewUI" style="margin-top:10px;color:red;font-size:0.9rem;"></div>
        </div>
    `;

    document.body.appendChild(modal);
    return modal;
}

// -----------------------------
// OPEN REVIEW MODAL
// -----------------------------
export async function openReviewModal({ loan_id, user_id }) {
    currentLoanId = loan_id;
    reviewedUserId = user_id;
    currentRating = 0;

    const modal = ensureReviewModalExists();

    const backdrop = modal.querySelector(".review-modal-backdrop");
    if (backdrop) backdrop.onclick = closeReviewModal;

    const reviewText = modal.querySelector("#reviewText");
    const submitButton = modal.querySelector("#submitReview");
    const title = modal.querySelector("#reviewModalTitle");
    const subTitle = modal.querySelector("#reviewModalSubtitle");
    const ratingStars = modal.querySelectorAll(".review-rating span");
    const debugEl = modal.querySelector("#debugReviewUI");

    if (!reviewText || !submitButton || !title || !subTitle || !ratingStars) return;

    reviewText.value = "";
    submitButton.disabled = true;

    ratingStars.forEach(star => star.classList.remove("active"));

    modal.classList.remove("hidden");

    const loan = LOANS.find(l => l.id == loan_id);
    const user = USERS.find(u => u.id == user_id);
    const book = BOOKS.find(b => b.id == loan?.book_id);

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

        try {
            await addDoc(collection(db, "reviews"), {
                loan_id: currentLoanId,
                user_id: Number(reviewedUserId),
                reviewer_id: currentUser.id,
                rating: currentRating,
                text,
                created_at: serverTimestamp()
            });

            // fetch all reviews of this user
            const reviewsQuery = query(
                collection(db, "reviews"),
                where("user_id", "==", reviewedUserId)
            );
            const snapshot = await getDocs(reviewsQuery);
            const allReviews = snapshot.docs.map(d => d.data());

            const count = allReviews.length;
            const sum = allReviews.reduce((acc, r) => acc + r.rating, 0);
            const avg = count ? (sum / count) : 0;
            const avgRounded = Math.round(avg * 100) / 100;

            const userDoc = USERS.find(u => u.id == reviewedUserId);
            if (!userDoc) return;

            const userRef = doc(db, "users", userDoc.email);
            await updateDoc(userRef, {
                reputation: avgRounded,
                reviews_count: count
            });

            const modalContent = modal.querySelector(".review-modal-content");

            // hide original content
            modalContent.querySelectorAll("*").forEach(el => el.style.display = "none");

            // show thank you
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

        } catch (err) {
            if (debugEl) debugEl.textContent = `Chyba pri odosielaní hodnotenia: ${err.message}`;
        }
    };
}

// -----------------------------
// CLOSE MODAL
// -----------------------------
function closeReviewModal() {
    const modal = document.getElementById("reviewModal");
    if (modal) modal.classList.add("hidden");
}
