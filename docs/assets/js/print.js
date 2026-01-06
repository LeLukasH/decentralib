import { db } from "./firebase.js";
import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

/*
 Firestore cannot list all collections automatically.
 You must list them manually.
*/
const COLLECTIONS = [
    "users",
    "books",
    "loans",
    "messages",
    "notifications",
    "reviews"
];

const output = document.getElementById("output");

async function printDatabase() {
    output.innerHTML = "";

    for (const name of COLLECTIONS) {
        const section = document.createElement("section");

        const title = document.createElement("h2");
        title.textContent = name;

        section.appendChild(title);

        try {
            const snap = await getDocs(collection(db, name));

            const data = snap.docs.map(d => ({
                id: d.id,
                ...d.data()
            }));

            const pre = document.createElement("pre");
            pre.textContent = JSON.stringify(data, null, 2);

            section.appendChild(pre);

        } catch (err) {
            const error = document.createElement("pre");
            error.textContent = `ERROR: ${err.message}`;
            section.appendChild(error);
        }

        output.appendChild(section);
    }
}

printDatabase();
