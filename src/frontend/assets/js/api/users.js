import { db } from "../firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

export async function getUsers() {
  const usersCol = collection(db, "users");
  const userSnapshot = await getDocs(usersCol);
  const users = userSnapshot.docs.map(doc => doc.data());
  return users;
}

export const USERS = await getUsers();