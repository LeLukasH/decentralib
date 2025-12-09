import { db } from "../firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
import { getUniqueSortedValues } from "../utils.js";

async function getData(collectionName) {
  const colRef = collection(db, collectionName);
  const snapshot = await getDocs(colRef);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}


export const USERS = await getData("users");

export const BOOKS = await getData("books");
export const BOOK_GENRES = getUniqueSortedValues(BOOKS, "type");
export const BOOK_LANGS = getUniqueSortedValues(BOOKS, "language");

export const NOTIFICATIONS = await getData("notifications");