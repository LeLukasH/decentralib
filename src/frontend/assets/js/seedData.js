// seedBooks.js
import { db } from './firebase.js';
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
import { BOOKS_DATA, USERS_DATA } from './config.js'; // tvoje pole BOOKS

async function seedCollection(collectionName, data) {
    try {
        for (const item of data) {
            const docRef = doc(db, collectionName, item.id.toString());
            await setDoc(docRef, item);
        }
        console.log(`Collection '${collectionName}' seeded successfully!`);
    } catch (error) {
        console.error(`Error seeding collection '${collectionName}':`, error);
    }
}

// -------------------------------
// Seeder funkcia
// -------------------------------
async function seedAll() {
    await seedCollection('users', USERS_DATA);
    await seedCollection('books', BOOKS_DATA);
}

seedAll();