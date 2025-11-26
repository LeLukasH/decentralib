import { USERS } from "./config.js";

function showMessage(message, type = 'error') {
    const container = document.querySelector('.login-message');
    if (container) container.remove();

    const div = document.createElement('div');
    div.className = `login-message ${type}`;
    div.textContent = message;

    // Insert after the title (h2) instead of first child
    const title = document.querySelector('.login-container h2');
    if (title && title.parentNode) {
        title.insertAdjacentElement('afterend', div);
    } else {
        // fallback to top if title not found
        const formContainer = document.querySelector('.login-container');
        formContainer.insertBefore(div, formContainer.firstChild);
    }
} 

export function login() {
    const email = document.getElementById("email")?.value || "";
    const password = document.getElementById("password")?.value || "";

    const user = USERS.find(u => u.email === email && u.password === password);

    if (!user) {
        showMessage("Nesprávny email alebo heslo.", 'error');
        return;
    }

    localStorage.setItem("currentUser", JSON.stringify(user));
    showMessage("Prihlásenie úspešné! Presmerovanie…", 'success');

    setTimeout(() => {
        window.location.href = "../home.html";
    }, 1000);
}

export function register() {
    showMessage("Registrácia je momentálne vypnutá.", 'error');
}

export function sendReset() {
    const email = document.getElementById("email")?.value || "";
    if (!email) {
        showMessage("Zadajte platný email.", 'error');
        return;
    }
    showMessage(`Mock: reset link by bol odoslaný na: ${email}`, 'success');
    setTimeout(() => {
        window.location.href = "login.html";
    }, 1500);
}

// Expose globally for inline onclick handlers in HTML
window.login = login;
window.register = register;
window.sendReset = sendReset;
