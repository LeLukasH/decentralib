import { db } from "./firebase.js";
import {
    collection,
    query,
    where,
    getDocs,
    doc,
    updateDoc,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

import { refreshHeader } from "./utils.js";
import { USERS, BOOKS, LOANS } from "./api/allData.js";

/* =========================
   DATA
========================= */

export async function getNotifications() {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!currentUser) return [];

    const q = query(
        collection(db, "notifications"),
        where("recipient_id", "==", currentUser.id)
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
    }));
}

export async function markNotificationAsRead(notificationId) {
    const ref = doc(db, "notifications", notificationId);
    await updateDoc(ref, { is_read: true });
    refreshHeader();
}

export async function deleteNotification(notificationId) {
    const ref = doc(db, "notifications", notificationId);
    await deleteDoc(ref);
    refreshHeader();
}

/* =========================
   RENDER
========================= */

export async function renderNotifications() {
    const container = document.getElementById("notificationsContainer");
    if (!container) return;

    container.innerHTML = "<p>Načítavam...</p>";

    const notifications = (await getNotifications())
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    if (notifications.length === 0) {
        container.innerHTML = "<p>Nemáte žiadne notifikácie.</p>";
        return;
    }

    container.innerHTML = "";

    notifications.forEach(note => {
        const text = getTextFromNotification(note);
        if (!text) return;

        const row = document.createElement("div");
        row.className = "notification-row";

        row.innerHTML = `
            <div class="notification-main ${note.is_read ? "read" : ""}">
                <div class="notification-title">${text}</div>
                <div class="notification-preview">${note.message || ""}</div>
                <div class="notification-date">
                    ${new Date(note.created_at).toLocaleString()}
                </div>
            </div>

            <button class="notification-delete" title="Vymazať notifikáciu">
                ✕
            </button>
        `;

        /* ---- mark as read ---- */
        row.addEventListener("click", async () => {
            if (!note.is_read) {
                await markNotificationAsRead(note.id);
                note.is_read = true;
                row.classList.add("read");
            }
        });

        /* ---- delete ---- */
        const deleteBtn = row.querySelector(".notification-delete");
        deleteBtn.addEventListener("click", async (e) => {
            e.stopPropagation();

            await deleteNotification(note.id);
            row.remove();
        });

        container.appendChild(row);
    });
}

/* =========================
   TEXT RESOLUTION
========================= */

function getTextFromNotification(notification) {
    const loan = LOANS.find(l => l.id === notification.loan_id);
    if (!loan) return null;

    const book = BOOKS.find(b => b.id === loan.book_id);
    const user = USERS.find(u => u.id === notification.sender_id);

    if (!book || !user) return null;

    switch (notification.type) {

        case "loan_request":
            return `Požiadali ste o požičanie knihy "${book.title}" od používateľa ${user.first_name} ${user.last_name}. Stav vašej požiadavky môžete sledovať v sekcii <a href="pozicane.html">Požičané</a>.`;

        case "loan_request_approval":
            return `Máte novú požiadavku na požičanie knihy "${book.title}" od používateľa ${user.first_name} ${user.last_name}. Rozhodnite o akceptácii tejto požiadavky v sekcii <a href="vypozicky.html">Výpožičky</a>.`;

        case "loan_approved_owner":
            return `Potvrdili ste požičanie knihy "${book.title}" používateľovi ${user.first_name} ${user.last_name}. Dohodnite sa na prevzatí knihy prostredníctvom sekcie <a href="spravy.html">Správy</a>.`;

        case "loan_approved_borrower":
            return `Vaša požiadavka na knihu "${book.title}" bola schválená používateľom ${user.first_name} ${user.last_name}. Dohodnite sa na prevzatí knihy prostredníctvom sekcie <a href="spravy.html">Správy</a>.`;

        case "loan_rejected_owner":
            return `Zamietli ste požiadavku na požičanie knihy "${book.title}" od používateľa ${user.first_name} ${user.last_name}.`;

        case "loan_rejected_borrower":
            return `Vaša požiadavka na knihu "${book.title}" bola zamietnutá používateľom ${user.first_name} ${user.last_name}.`;

        case "loan_returned_owner":
            return `Používateľ ${user.first_name} ${user.last_name} vrátil knihu "${book.title}".`;

        case "loan_returned_borrower":
            return `Vrátenie knihy "${book.title}" bolo potvrdené.`;

        default:
            return "Neznáma notifikácia.";
    }
}



/* =========================
   INIT
========================= */

renderNotifications();
