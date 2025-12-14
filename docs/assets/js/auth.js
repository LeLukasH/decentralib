// ---------------------------------------------------
// IMPORTS
// ---------------------------------------------------
import { auth, db } from "./firebase.js";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import { doc, setDoc, getDoc, getDocs, collection } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

// ---------------------------------------------------
// MESSAGE UI
// ---------------------------------------------------
function showMessage(message, type = 'error') {
    const container = document.querySelector('.auth-message');
    if (container) container.remove();

    const div = document.createElement('div');
    div.className = `auth-message ${type}`;
    div.textContent = message;

    const title = document.querySelector('.auth-container h2');
    if (title && title.parentNode) {
        title.insertAdjacentElement('afterend', div);
    } else {
        const formContainer = document.querySelector('.auth-container');
        formContainer.insertBefore(div, formContainer.firstChild);
    }
}

function clearMessages() {
    document.querySelectorAll('.auth-message').forEach(el => el.remove());
}


// ---------------------------------------------------
// LOGIN
// ---------------------------------------------------
export async function login() {
    clearMessages();

    const email = document.getElementById("email")?.value || "";
    const password = document.getElementById("password")?.value || "";

    try {
        // Firebase Auth login
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Načítanie Firestore dokumentu
        const userDocRef = doc(db, "users", user.email);
        const userDocSnap = await getDoc(userDocRef);

        if (!userDocSnap.exists()) {
            showMessage("Používateľ neexistuje v databáze.", "error");
            return;
        }

        const userData = userDocSnap.data();

        // Uloženie do localStorage
        localStorage.setItem("currentUser", JSON.stringify(userData));

        showMessage("Prihlásenie úspešné!", "success");
        setTimeout(() => { window.location.href = "../home.html"; }, 500);

    } catch (error) {
        console.error("Login error:", error);
        showMessage("Nesprávny email alebo heslo.", "error");
    }
}

export async function logout() {
    try {
        // Odhlásenie z Firebase Auth
        await signOut(auth);
    } catch (e) {
        console.warn("Sign out failed from Firebase:", e);
    }

    // Vymazanie localStorage
    localStorage.removeItem('currentUser');

    // Refresh page, aby sa header znova vyrenderoval
    window.location.reload();
}


// ---------------------------------------------------
// REGISTRATION
// ---------------------------------------------------
export async function register() {
    clearMessages();

    const first_name = document.getElementById("first_name")?.value || "";
    const last_name = document.getElementById("last_name")?.value || "";
    const email = document.getElementById("email")?.value || "";
    const password = document.getElementById("password")?.value || "";
    const password2 = document.getElementById("password2")?.value || "";

    if (!first_name || !last_name || !email || !password || !password2) {
        showMessage("Vyplňte všetky polia.", "error");
        return;
    }

    if (password !== password2) {
        showMessage("Heslá sa nezhodujú.", "error");
        return;
    }

    try {
        // Vytvorenie účtu v Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Automaticky priradíme id podľa počtu existujúcich používateľov
        const usersSnapshot = await getDocs(collection(db, "users"));
        const newId = usersSnapshot.size + 1; // jednoduché číslo id, môžeš prispôsobiť

        // Uloženie do Firestore
        await setDoc(doc(db, "users", user.email), {
            id: newId,
            first_name,
            last_name,
            email,
            password,
            location: null,
            profile_pic: null,
            reputation: null
        });

        showMessage("Registrácia úspešná! Môžete sa prihlásiť.", "success");
        setTimeout(() => { window.location.href = "login.html"; }, 1200);

    } catch (error) {
        console.error("Register error:", error);
        if (error.code === "auth/email-already-in-use") showMessage("Tento email sa už používa.", "error");
        else if (error.code === "auth/weak-password") showMessage("Heslo musí mať aspoň 6 znakov.", "error");
        else showMessage("Registrácia zlyhala.", "error");
    }
}


// ---------------------------------------------------
// PASSWORD RESET
// ---------------------------------------------------
export async function resetPassword() {
    clearMessages();

    const email = document.getElementById("email")?.value || "";

    if (!email) {
        showMessage("Zadajte email.", "error");
        return;
    }

    try {
        await sendPasswordResetEmail(auth, email);
        showMessage("Reset link bol odoslaný na váš email.", "success");

        setTimeout(() => { window.location.href = "login.html"; }, 1500);

    } catch (error) {
        console.error("Reset error:", error);

        if (error.code === "auth/user-not-found") {
            showMessage("Tento email neexistuje.", "error");
        } else {
            showMessage("Nepodarilo sa odoslať reset email.", "error");
        }
    }
}


// ---------------------------------------------------
// GLOBAL FUNCTIONS FOR HTML INLINE onclick=""
// ---------------------------------------------------
window.login = login;
window.register = register;
window.resetPassword = resetPassword;


// ---------------------------------------------------
// ENTER KEY HANDLING
// ---------------------------------------------------
const formInputs = document.querySelectorAll('.login-container input');
formInputs.forEach(input => {
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const path = window.location.pathname.toLowerCase();

            if (path.includes('login.html')) login();
            else if (path.includes('register.html')) register();
            else if (path.includes('forgot-password.html')) sendReset();
        }
    });
});
