import { db } from "./firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
import {
    query,
    where,
    getDoc,
    updateDoc,
    doc,
    addDoc,
    orderBy,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
import { LOANS, USERS } from "./api/allData.js";
import { refreshHeader } from "./utils.js";

let currentUser = JSON.parse(localStorage.getItem("currentUser"));
let currentChatroom = null;

const chatroomsList = document.getElementById("chatroomsList");
const chatMessages = document.getElementById("chatMessages");
const chatroomHeader = document.getElementById("chatroomHeader");
const messageInput = document.getElementById("messageInput");
const sendMessageForm = document.getElementById("sendMessageForm");
const sendMessageButton = document.getElementById("sendMessageButton");

const chatrooms = [];

async function loadLoans(isBorrower = false) {
    chatroomsList.innerHTML = "";

    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!currentUser) return;

    // Load loans based on role
    const loans = LOANS.filter(loan => 
        isBorrower ? loan.borrower_id === currentUser.id : loan.owner_id === currentUser.id
    );

    if (loans.length === 0) {
        const span = document.createElement("span");
        span.textContent = "Nemáte žiadne výpožičky.";
        chatroomsList.appendChild(span);
        return;
    }

    for (const loan of loans) {
        let bookTitle = "Neznáma";
        if (loan.book_id) {
            const bookRef = doc(db, "books", String(loan.book_id));
            const bookSnap = await getDoc(bookRef);
            if (bookSnap.exists()) {
                bookTitle = bookSnap.data().title || "Neznáma";
            }
        }

        let otherUserName = "Neznámy";
        const userId = isBorrower ? loan.owner_id : loan.borrower_id;
        if (userId) {
            const user = USERS.find(u => u.id === userId);
            if (user) {
                otherUserName = `${user.first_name || ""} ${user.last_name || ""}`.trim() || "Neznámy";
            }
        }

        // Check for unread messages
        let hasUnread = false;
        const messagesRef = collection(db, "messages");
        const unreadQuery = query(
            messagesRef,
            where("loan_id", "==", loan.id),
            where("sender_id", "!=", currentUser.id),
            where("is_read", "==", false)
        );
        const unreadSnap = await getDocs(unreadQuery);
        if (!unreadSnap.empty) hasUnread = true;

        const chatroom = {
            loanId: loan.id,
            name: `Kniha: ${bookTitle} | ${isBorrower ? "Vlastník" : "Požiadal"}: ${otherUserName}`,
            bookTitle,
            username: otherUserName,
            status: loan.status,
            hasUnread
        };
        chatrooms.push(chatroom);

        const li = document.createElement("li");
        li.textContent = chatroom.name;
        li.dataset.id = loan.id;
        if (hasUnread) li.classList.add("unread"); // mark unread

        li.addEventListener("click", () => selectChatroom(chatroom));
        chatroomsList.appendChild(li);

        // auto-select first chatroom if none selected
        if (currentChatroom == null) {
            currentChatroom = chatroom;
            await selectChatroom(chatroom);
        }
    }
}

async function selectChatroom(chatroom) {
    currentChatroom = chatroom;

    chatroomHeader.textContent = `${chatroom.name}`;
    Array.from(chatroomsList.children).forEach(li => {
        li.classList.toggle("active", li.dataset.id === chatroom.loanId);
    });

    sendMessageButton.removeAttribute("disabled");

    await loadMessages();
}

async function loadMessages() {
    if (!currentChatroom) return;
    chatMessages.innerHTML = "";

    const q = query(
        collection(db, "messages"),
        where("loan_id", "==", currentChatroom.loanId),
        orderBy("created_at")
    );

    const snapshot = await getDocs(q);

    for (const docSnap of snapshot.docs) {
        const msg = docSnap.data();

        const div = document.createElement("div");
        div.className = "chat-message " + (msg.sender_id === currentUser.id ? "sent" : "received");
        div.textContent = msg.text;
        chatMessages.appendChild(div);

        // Mark as read if not sent by current user
        if (msg.sender_id !== currentUser.id && !msg.is_read) {
            await markMessageAsRead(docSnap.id);
        }
    }

    chatMessages.scrollTop = chatMessages.scrollHeight;
}

sendMessageForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!currentChatroom) return;

    const text = messageInput.value.trim();
    if (!text) return;

    await addDoc(collection(db, "messages"), {
        loan_id: currentChatroom.loanId,
        text,
        sender_id: currentUser.id,
        created_at: serverTimestamp(),
        is_read: false
    });

    messageInput.value = "";
    await loadMessages();
});

async function markMessageAsRead(messageId) {
    const ref = doc(db, "messages", messageId);
    await updateDoc(ref, { is_read: true });
    refreshHeader();
}



loadLoans();
loadLoans(true);