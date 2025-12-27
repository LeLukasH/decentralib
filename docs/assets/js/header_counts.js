import { db } from "./firebase.js";
import {
    collection,
    query,
    where,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
import { getNotifications } from "./notifikacie.js";

export async function getUnreadMessagesCount() {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!currentUser) return 0;

    // 1️⃣ Get all loans where currentUser is owner or borrower
    const loansRef = collection(db, "loans");
    const ownerQuery = query(loansRef, where("owner_id", "==", currentUser.id));
    const borrowerQuery = query(loansRef, where("borrower_id", "==", currentUser.id));

    const [ownerSnap, borrowerSnap] = await Promise.all([getDocs(ownerQuery), getDocs(borrowerQuery)]);

    const loanIds = [
        ...ownerSnap.docs.map(d => d.id),
        ...borrowerSnap.docs.map(d => d.id)
    ];

    if (loanIds.length === 0) return 0;

    // 2️⃣ Fetch unread messages for each loan separately
    const messagesRef = collection(db, "messages");

    const unreadMessageCounts = await Promise.all(
        loanIds.map(async (loanId) => {
            const q = query(
                messagesRef,
                where("loan_id", "==", loanId),
                where("sender_id", "!=", currentUser.id),
                where("is_read", "==", false)
            );

            const snap = await getDocs(q);
            return snap.size; // number of unread messages for this loan
        })
    );

    // 3️⃣ Sum all counts
    return unreadMessageCounts.reduce((sum, count) => sum + count, 0);
}

export async function getNotificationsCount() {
    const messages = (await getNotifications()).filter(msg => !msg.is_read);
    return messages.length;        // number of docs
}