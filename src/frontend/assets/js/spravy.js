import { db } from "./firebase.js";
import { collection, query, where, getDocs , doc, updateDoc} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
import { refreshHeader } from "./utils.js";
import { USERS, BOOKS } from "./api/allData.js";

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
        const row = document.createElement("div");

        row.className = "notification-row" + (note.is_read ? " read" : "");

        row.innerHTML = `
            <div class="notification-title">${getTextFromNotification(note) || "Notifikácia"}</div>
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
    const book = BOOKS.find(b => b.id === notification.book_id);
    const borrowerName = notification.borrower_id;
    switch (notification.type) {
        case "loan_request":
            return `Zadali ste novú požiadavku na požičanie knihy.`;
        case "loan_request_approval":
            return "Dostali ste požiadavku na požičanie knihy.";
        default:
            return "Neznáma notifikácia.";
    }
}

renderNotifications();