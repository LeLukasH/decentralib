import { db } from "../firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
import { getUniqueSortedValues } from "../utils.js";

export async function getBooks() {
  const booksCol = collection(db, "books");
  const bookSnapshot = await getDocs(booksCol);
  const books = bookSnapshot.docs.map(doc => doc.data());
  return books;
}

export async function getBookGenres() {
  const books = await getBooks();
  const BOOK_GENRES = getUniqueSortedValues(books, 'type');
  return BOOK_GENRES;
}

export async function getBookLanguages() {
  const books = await getBooks();
  const BOOK_LANGS = getUniqueSortedValues(books, 'language');
  return BOOK_LANGS;
}

export const BOOKS = await getBooks();
export const BOOK_GENRES = await getBookGenres();
export const BOOK_LANGS = await getBookLanguages();