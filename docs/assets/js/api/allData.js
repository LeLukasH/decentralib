import { db } from "../firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
import { getUniqueSortedValues } from "../utils.js";

async function getAll(collectionName) {
  const colRef = collection(db, collectionName);
  const snapshot = await getDocs(colRef);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

// -------------------------------
// INITIAL FETCH
// -------------------------------

export let USERS = await getAll("users");
export let BOOKS = await getAll("books");
export let LOANS = await getAll("loans");
export let NOTIFICATIONS = await getAll("notifications");

export let BOOK_GENRES = getUniqueSortedValues(BOOKS, "type");
export let BOOK_LANGS = getUniqueSortedValues(BOOKS, "language");

// -------------------------------
// REFETCH FUNCTIONS
// -------------------------------

export async function refetchUsers() {
  USERS = await getAll("users");
  return USERS;
}

export async function refetchBooks() {
  BOOKS = await getAll("books");
  BOOK_GENRES = getUniqueSortedValues(BOOKS, "type");
  BOOK_LANGS = getUniqueSortedValues(BOOKS, "language");
  return BOOKS;
}

export async function refetchLoans() {
  LOANS = await getAll("loans");
  return LOANS;
}

export async function refetchNotifications() {
  NOTIFICATIONS = await getAll("notifications");
  return NOTIFICATIONS;
}
