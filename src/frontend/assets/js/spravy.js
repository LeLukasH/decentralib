import { db } from "./firebase.js";
import { collection, query, where, getDocs , doc, updateDoc} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
import { refreshHeader } from "./utils.js";
import { USERS, BOOKS, LOANS } from "./api/allData.js";

export async function getNotifications() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return [];

    const q = query(
        collection(db, "notifications"),
        where("recipient_id", "==", currentUser.id)
    );

    const querySnapshot = await getDocs(q);

    const messages = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));

    return messages;
}

export async function markNotificationAsRead(notificationId) {
    const ref = doc(db, "notifications", notificationId);
    await updateDoc(ref, { is_read: true });
    refreshHeader();
}

// ----------------- RENDER ----------------------

export async function renderNotifications() {
    const container = document.getElementById("notificationsContainer");
    if (!container) return;
    container.innerHTML = "<p>Načítavam...</p>";

    const notifications = (await getNotifications()).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    if (notifications.length === 0) {
        container.innerHTML = "<p>Nemáte žiadne notifikácie.</p>";
        return;
    }

    container.innerHTML = "";

    notifications.forEach((note) => {
        const text = getTextFromNotification(note);
        if (!text) return;
        const row = document.createElement("div");

        row.className = "notification-row" + (note.is_read ? " read" : "");

        row.innerHTML = `
            <div class="notification-title">${text}</div>
            <div class="notification-preview">${note.message || ""}</div>
            <div class="notification-date">${new Date(note.created_at).toLocaleString()}</div>
        `;

        row.addEventListener("click", async () => {
            if (!note.read) {
                await markNotificationAsRead(note.id);
                row.classList.add("read");
            }
        });

        container.appendChild(row);
    });
}

function getTextFromNotification(notification) {
    const loan = LOANS.find(l => l.id === notification.loan_id);
    if (!loan) return null;

    const book = BOOKS.find(b => b.id === loan.book_id);
    const user = USERS.find(u => u.id === notification.sender_id);

    if (!book || !user) return null;

    switch (notification.type) {

        // === REQUEST SENT BY BORROWER ===
        case "loan_request":
            return `Požiadali ste o požičanie knihy "${book.title}" od používateľa ${user.first_name} ${user.last_name}.`;

        // === OWNER GETS NEW REQUEST ===
        case "loan_request_approval":
            return `Máte novú požiadavku na požičanie knihy "${book.title}" od používateľa ${user.first_name} ${user.last_name}.`;

        // === OWNER APPROVES REQUEST ===
        case "loan_approved_owner":
            return `Potvrdili ste požičanie knihy "${book.title}" používateľovi ${user.first_name} ${user.last_name}.`;

        // === BORROWER GETS APPROVAL ===
        case "loan_approved_borrower":
            return `Vaša požiadavka na knihu "${book.title}" bola schválená používateľom ${user.first_name} ${user.last_name}.`;

        // === OWNER REJECTS REQUEST ===
        case "loan_rejected_owner":
            return `Zamietli ste požiadavku na požičanie knihy "${book.title}" od používateľa ${user.first_name} ${user.last_name}.`;

        // === BORROWER GETS REJECTION ===
        case "loan_rejected_borrower":
            return `Vaša požiadavka na knihu "${book.title}" bola zamietnutá používateľom ${user.first_name} ${user.last_name}.`;

        // === BORROWER RETURNS BOOK – OWNER IS NOTIFIED ===
        case "loan_returned_owner":
            return `Používateľ ${user.first_name} ${user.last_name} potvrdil vrátenie knihy "${book.title}".`;

        // === OWNER CONFIRMS RETURN – BORROWER IS NOTIFIED ===
        case "loan_returned_borrower":
            return `Vrátenie knihy "${book.title}" bolo potvrdené používateľom ${user.first_name} ${user.last_name}.`;

        default:
            return "Neznáma notifikácia.";
    }
}

renderNotifications();