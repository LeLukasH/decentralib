import { db, auth } from './firebase.js';
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import { BOOKS_DATA, USERS_DATA } from './config.js';

async function seedUsers() {
    for (const user of USERS_DATA) {
        const uid = user.email;;

        try {
            // Pokúsime sa vytvoriť používateľa v Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, user.email, user.password);
            console.log(`User ${user.email} created in Auth.`);
        } catch (error) {
            if (error.code === 'auth/email-already-in-use') {
                console.log(`User ${user.email} already exists in Auth, skipping creation.`);
            } else {
                console.error(`Error creating user ${user.email} in Auth:`, error);
                continue; // preskočíme tohto používateľa
            }
        }

        // Odstránime heslo z dát pre Firestore
        const { password, ...userData } = user;

        try {
            // SetDoc s merge:true – vytvorí alebo aktualizuje dokument
            await setDoc(doc(db, 'users', uid), { ...userData });
            console.log(`User ${user.email} set in Firestore.`);
        } catch (error) {
            console.error(`Error setting user ${user.email} in Firestore:`, error);
        }
    }
}

async function seedBooks() {
    for (const book of BOOKS_DATA) {
        try {
            // Použijeme `id` ako dokument ID
            await setDoc(doc(db, 'books', book.id.toString()), book);
            console.log(`Book ${book.title} seeded successfully!`);
        } catch (error) {
            console.error(`Error seeding book ${book.title}:`, error);
        }
    }
}

async function seedAll() {
    await seedUsers();
    await seedBooks();
}

seedAll();
