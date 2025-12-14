import { logout } from "./auth.js";
import { getNotifications } from "./spravy.js";

class MyHeader extends HTMLElement {
    async connectedCallback() {
        let currentUser = null;
        try {
            currentUser = JSON.parse(localStorage.getItem('currentUser'));
        } catch (e) {
            currentUser = null;
        }

        const profilePic = currentUser?.profile_pic || '../assets/img/user-icon.png';
        const displayName = currentUser
            ? `${currentUser.first_name || ''} ${currentUser.last_name || ''}`.trim()
            : '';

        this.innerHTML = `
            <header>
                <div>
                    <a href="home.html">
                        <img src="../assets/img/DecLibWhite.png" alt="Logo" title="Decentralizovaná knižnica" class="logo">
                        <h1>Decentralizovaná knižnica</h1>
                    </a>
                </div>
                <nav class="hlavne-menu">
                    <a href="home.html" class="navigacne-tlacidlo">Domov</a>

                    <div class="pouzivatel-dropdown sprava-knihy-kontajner"> 
                        <button class="navigacne-tlacidlo dropdown-tlacidlo pouzivatel_tlacidlo">Správa kníh</button>
                        <div class="pouzivatel_obsah sprava-knih-obsah">
                            <a href="moje_knihy.html">Moje knihy</a>
                            <a href="pozicane.html">Požičané</a>
                            <a href="vypozicky.html">Výpožičky</a>
                        </div>
                    </div>
                    <a href="spravy.html" class="navigacne-tlacidlo" id="messagesLink" aria-labelledby="messagesLabel">
                        <span id="messagesLabel">Správy</span>
                        <span class="msg-badge" id="messagesBadge" aria-hidden="true"></span>
                    </a>
                </nav>

                <button class="hamburger">
                    ☰
                </button>

                <div>
                    ${
                        currentUser
                        ? `<div class="pouzivatel-dropdown profil-kontajner">
                               <button class="pouzivatel_tlacidlo">
                                   <h2>${displayName}</h2>
                                   <img src="${profilePic}" class="pouzivatel-hlavicka-obr">
                               </button>
                               <div class="pouzivatel_obsah profil-obsah">
                                   <a href="#">Spravuj účet</a>
                                   <a id="signOutBtn">Odhlás ma</a>
                               </div>
                           </div>`
                        : `<button id="signInBtn">Sign In</button>`
                    }
                </div>
            </header>
        `;

        const messagesCount = await getMessagesCount();
        updateMessagesBadge(messagesCount);
        
        // --- FUNKCIA PRE ZATVÁRANIE OSTATNÝCH DROPDOWNOV ---
        const toggleDropdown = (targetContent) => {
            const allDropdowns = this.querySelectorAll('.pouzivatel_obsah');
            allDropdowns.forEach(content => {
                if (content !== targetContent) {
                    content.classList.remove('show');
                }
            });
            targetContent.classList.toggle('show');
        };
        // ----------------------------------------------------


        // Sign Out listener
        const signOutBtn = this.querySelector('#signOutBtn');
        if (signOutBtn) signOutBtn.addEventListener('click', logout);

        // Sign In listener
        const signInBtn = this.querySelector('#signInBtn');
        if (signInBtn) signInBtn.addEventListener('click', () => {
            window.location.href = 'auth/login.html';
        });

        // Dropdown listener pre používateľa (Profil)
        const userDropdownBtn = this.querySelector('.profil-kontajner .pouzivatel_tlacidlo');
        const userDropdownContent = this.querySelector('.profil-obsah');
        if (userDropdownBtn && userDropdownContent) {
            userDropdownBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleDropdown(userDropdownContent);
            });
        }
        
        // Dropdown listener pre Správu kníh
        const bookDropdownBtn = this.querySelector('.sprava-knihy-kontajner .dropdown-tlacidlo');
        const bookDropdownContent = this.querySelector('.sprava-knih-obsah');
        if (bookDropdownBtn && bookDropdownContent) {
            bookDropdownBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleDropdown(bookDropdownContent);
            });
        }

        // Global click listener na zatvorenie VŠETKÝCH dropdownov
        document.addEventListener('click', (e) => {
             const allDropdowns = this.querySelectorAll('.pouzivatel_obsah');
             const allButtons = this.querySelectorAll('.pouzivatel_tlacidlo, .dropdown-tlacidlo');
             
             let isInsideDropdown = false;
             allDropdowns.forEach(content => {
                 if (content.contains(e.target)) {
                     isInsideDropdown = true;
                 }
             });
             
             let isButton = false;
             allButtons.forEach(button => {
                 if (button.contains(e.target)) {
                     isButton = true;
                 }
             });

             if (!isInsideDropdown && !isButton) {
                allDropdowns.forEach(content => content.classList.remove('show'));
             }
        });


        const hamburger = this.querySelector('.hamburger');
        const menu = this.querySelector('.hlavne-menu');

        hamburger.addEventListener('click', () => {
            menu.classList.toggle('open');
            // Zavri všetky ostatné dropdowny, keď otvoríš/zatvoríš hamburger
            const allDropdowns = this.querySelectorAll('.pouzivatel_obsah');
            allDropdowns.forEach(content => content.classList.remove('show'));
        });

        // Zisti aktuálne meno súboru (napr. "spravy.html")
        const currentPage = window.location.pathname.split('/').pop();

        // Nájdeme všetky navigačné odkazy
        // Teraz cielime na odkazy v novej triede .pouzivatel_obsah
        const links = this.querySelectorAll('.hlavne-menu a, .pouzivatel_obsah a'); 

        // Prejdi všetky odkazy a prefarby ten, ktorý zodpovedá aktuálnej stránke
        links.forEach(link => {
            const linkPage = link.getAttribute('href');
            if (linkPage === currentPage) {
                // Ak je to podkategória (napr. moje_knihy), zafarbíme aj nadradené tlačidlo (Správa kníh)
                if (link.closest('.sprava-knihy-kontajner')) {
                    const parentButton = link.closest('.sprava-knihy-kontajner').querySelector('.dropdown-tlacidlo');
                    if (parentButton) {
                        parentButton.style.color = '#003f87';
                    }
                }
                // Pre všetky ostatné linky (vrátane podkategórií)
                link.style.color = '#003f87';  
            }
        });
    }
}

class MyFooter extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <footer>
            <div class="footer-obsah">
                <p class="autori">
                    Vytvorili <strong>Adrián Kýška, Lukáš Heldák, Mária Cerulíková, Veronika Horňáková </strong> v rámci predmetu Metodológie tvorby webu.
                </p>
                <p class="aktualizacia">
                    <strong>Posledne aktualizované:</strong> 8.12.2025
                </p>
            </div>
        </footer>`;
    }
}

customElements.define('my-header', MyHeader);
customElements.define('my-footer', MyFooter);

function updateMessagesBadge(messagesCount) {
    const badge = document.getElementById("messagesBadge");
    if (!badge) return;

    if (typeof messagesCount !== "number") {
        // try to coerce if you got a string
        messagesCount = Number(messagesCount) || 0;
    }

    if (messagesCount > 0) {
        // clamp large numbers
        badge.textContent = messagesCount > 99 ? "99+" : String(messagesCount);
        badge.style.display = "inline-flex";

        // style tweak for two+ digits
        if (messagesCount >= 10 && messagesCount <= 99) {
        badge.classList.add("msg-badge--small");
        } else {
        badge.classList.remove("msg-badge--small");
        }

        // for screen-readers: announce count (optional)
        badge.setAttribute("aria-hidden", "false");
        badge.setAttribute("aria-label", `${badge.textContent} neprečítaných správ`);
    } else {
        badge.style.display = "none";
        badge.setAttribute("aria-hidden", "true");
        badge.removeAttribute("aria-label");
    }
}

async function getMessagesCount() {
    const messages = (await getNotifications()).filter(msg => !msg.is_read);
    return messages.length;        // number of docs
}