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
import { refreshHeader, getUrlParam } from "./utils.js";

/* =====================================================
   STATE
===================================================== */
let currentUser = JSON.parse(localStorage.getItem("currentUser"));
let currentChatroom = null;
let pendingLoanId = getUrlParam("loanId");

/* =====================================================
   ELEMENTS
===================================================== */
const messagesPage = document.getElementById("messagesPage");
const chatroomsList = document.getElementById("chatroomsList");
const chatMessages = document.getElementById("chatMessages");
const chatroomHeader = document.getElementById("chatroomHeader");
const chatroomTitle = document.getElementById("chatroomTitle");
const backButton = document.getElementById("backButton");
const messageInput = document.getElementById("messageInput");
const sendMessageForm = document.getElementById("sendMessageForm");
const sendMessageButton = document.getElementById("sendMessageButton");

/* =====================================================
   HELPERS
===================================================== */
function isMobile() {
    return window.innerWidth <= 768;
}

/* =====================================================
   LOAD CHATROOMS
===================================================== */
async function loadLoans(isBorrower = false) {
    chatroomsList.innerHTML = "";

    if (!currentUser) return;

    // UPRAVENÝ FILTER: Pridaná podmienka loan.status !== 'returned'
    const loans = LOANS.filter(loan => {
        const matchesUser = isBorrower ? loan.borrower_id === currentUser.id : loan.owner_id === currentUser.id;
        const isApproved = loan.status === 'approved';
        //const isNotReturned = loan.status !== 'returned' && loan.status !== 'rejected';
        return matchesUser && isApproved;
    });

    console.log(loans);
   
    if (loans.length === 0) {
        const span = document.createElement("span");
        span.textContent = "Nemáte žiadne výpožičky.";
        chatroomsList.appendChild(span);
        return;
    }

    for (const loan of loans) {
        /* BOOK */
        let bookTitle = "Neznáma";
        if (loan.book_id) {
            const bookRef = doc(db, "books", String(loan.book_id));
            const bookSnap = await getDoc(bookRef);
            if (bookSnap.exists()) {
                bookTitle = bookSnap.data().title || "Neznáma";
            }
        }

        /* USER */
        let otherUserName = "Neznámy";
        const userId = isBorrower ? loan.owner_id : loan.borrower_id;
        if (userId) {
            const user = USERS.find(u => u.id === userId);
            if (user) {
                otherUserName =
                    `${user.first_name || ""} ${user.last_name || ""}`.trim() || "Neznámy";
            }
        }

        /* UNREAD */
        let hasUnread = false;
        const unreadQuery = query(
            collection(db, "messages"),
            where("loan_id", "==", loan.id),
            where("sender_id", "!=", currentUser.id),
            where("is_read", "==", false)
        );
        const unreadSnap = await getDocs(unreadQuery);
        if (!unreadSnap.empty) hasUnread = true;

        const chatroom = {
            loanId: loan.id,
            name: `Kniha: ${bookTitle} | ${isBorrower ? "Vlastník" : "Požiadal"}: ${otherUserName}`,
            hasUnread
        };

        const li = document.createElement("li");
        const [line1, line2] = chatroom.name.split("|");

        li.innerHTML = `
            <div class="chat-line-1">${line1.trim()}</div>
            <div class="chat-line-2">${line2?.trim() || ""}</div>
        `;
        li.dataset.id = loan.id;
        if (hasUnread) li.classList.add("unread");

        li.addEventListener("click", () => {
            selectChatroom(chatroom);
            chatroom.hasUnread = false;
            li.classList.remove("unread");
        });

        // AUTO OPEN CHATROOM FROM URL
        if (pendingLoanId && String(loan.id) === String(pendingLoanId)) {
            // počkáme na DOM
            setTimeout(() => {
                selectChatroom(chatroom);
                li.classList.remove("unread");
                pendingLoanId = null; // už netreba znovu
            }, 0);
        }
        chatroomsList.appendChild(li);
    }
}

/* =====================================================
   SELECT CHAT
===================================================== */
async function selectChatroom(chatroom) {
    const url = new URL(window.location);
    url.searchParams.set("loanId", chatroom.loanId);
    history.replaceState({}, "", url);

    currentChatroom = chatroom;

    const [line1, line2] = chatroom.name.split("|");

    // Set HTML with two divs (or spans)
    chatroomTitle.innerHTML = `
        <div class="chat-header-line1">${line1.trim()}</div>
        <div class="chat-header-line2">${line2?.trim() || ""}</div>
    `;

    Array.from(chatroomsList.children).forEach(li => {
        li.classList.toggle("active", li.dataset.id === chatroom.loanId);
    });

    sendMessageButton.removeAttribute("disabled");

    /* MOBILE → show chat */
    if (isMobile()) {
        messagesPage.classList.add("show-chat");
    }

    await loadMessages();
}

/* =====================================================
   LOAD MESSAGES
===================================================== */
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
        div.className =
            "chat-message " +
            (msg.sender_id === currentUser.id ? "sent" : "received");

        div.textContent = msg.text;
        chatMessages.appendChild(div);

        if (msg.sender_id !== currentUser.id && !msg.is_read) {
            await markMessageAsRead(docSnap.id);
        }
    }

    chatMessages.scrollTop = chatMessages.scrollHeight;
}

/* =====================================================
   SEND MESSAGE
===================================================== */
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

/* =====================================================
   MARK READ
===================================================== */
async function markMessageAsRead(messageId) {
    const ref = doc(db, "messages", messageId);
    await updateDoc(ref, { is_read: true });
    refreshHeader();
}

/* =====================================================
   BACK BUTTON (MOBILE)
===================================================== */
backButton.addEventListener("click", () => {
    messagesPage.classList.remove("show-chat");
    currentChatroom = null;
    sendMessageButton.setAttribute("disabled", true);
});

/* =====================================================
   INIT
===================================================== */
sendMessageButton.setAttribute("disabled", true);
loadLoans();
loadLoans(true);
