import { logout } from "./auth.js";
import { getNotificationsCount, getUnreadMessagesCount } from "./header_counts.js";

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
                    <a href="dashboard.html" class="navigacne-tlacidlo">Správa knih</a>
                    <a href="spravy.html" class="navigacne-tlacidlo" id="messagesLink" aria-labelledby="messagesLabel">
                        <span id="messagesLabel">Správy</span>
                        <span class="msg-badge" id="messagesBadge" aria-hidden="true"></span>
                    </a>
                </nav>

                <button class="hamburger">☰</button>

                <a href="notifikacie.html" class="navigation-icon" id="notificationsLink" aria-labelledby="notificationsLabel">
                    <svg id="notificationsLabel" class="icon-bell" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 22a2 2 0 0 0 2-2h-4a2 2 0 0 0 2 2Zm6-6V11a6 6 0 1 0-12 0v5l-2 2v1h16v-1l-2-2Z"/>
                    </svg>
                    <span class="msg-badge" id="notificationsBadge" aria-hidden="true"></span>
                </a>

                <div>
                    ${
                        currentUser
                        ? `<div class="pouzivatel-dropdown profil-kontajner">
                               <button class="pouzivatel_tlacidlo">
                                   <h2>${displayName}</h2>
                                   <img src="${profilePic}" class="pouzivatel-hlavicka-obr">
                               </button>
                               <div class="pouzivatel_obsah profil-obsah">
                                   <a href="profile.html">Spravuj účet</a>
                                   <a id="signOutBtn">Odhlás ma</a>
                               </div>
                           </div>`
                        : `<button id="signInBtn">Sign In</button>`
                    }
                </div>
            </header>
        `;

        const messagesCount = await getUnreadMessagesCount();
        updateMessagesBadge(messagesCount);

        const notificationsCount = await getNotificationsCount();
        updateNotificationsBadge(notificationsCount);
        
        const toggleDropdown = (targetContent) => {
            const allDropdowns = this.querySelectorAll('.pouzivatel_obsah');
            allDropdowns.forEach(content => {
                if (content !== targetContent) content.classList.remove('show');
            });
            targetContent.classList.toggle('show');
        };

        const signOutBtn = this.querySelector('#signOutBtn');
        if (signOutBtn) signOutBtn.addEventListener('click', logout);

        const signInBtn = this.querySelector('#signInBtn');
        if (signInBtn) signInBtn.addEventListener('click', () => {
            window.location.href = 'auth/login.html';
        });

        const userDropdownBtn = this.querySelector('.profil-kontajner .pouzivatel_tlacidlo');
        const userDropdownContent = this.querySelector('.profil-obsah');
        if (userDropdownBtn && userDropdownContent) {
            userDropdownBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleDropdown(userDropdownContent);
            });
        }
        
        document.addEventListener('click', (e) => {
             const allDropdowns = this.querySelectorAll('.pouzivatel_obsah');
             const allButtons = this.querySelectorAll('.pouzivatel_tlacidlo');
             let isInsideDropdown = Array.from(allDropdowns).some(c => c.contains(e.target));
             let isButton = Array.from(allButtons).some(b => b.contains(e.target));
             if (!isInsideDropdown && !isButton) {
                allDropdowns.forEach(content => content.classList.remove('show'));
             }
        });

        const hamburger = this.querySelector('.hamburger');
        const menu = this.querySelector('.hlavne-menu');
        hamburger.addEventListener('click', () => {
            menu.classList.toggle('open');
            this.querySelectorAll('.pouzivatel_obsah').forEach(c => c.classList.remove('show'));
        });

        const currentPage = window.location.pathname.split('/').pop();
        this.querySelectorAll('.hlavne-menu a, .pouzivatel_obsah a').forEach(link => {
            if (link.getAttribute('href') === currentPage) link.style.color = '#003f87';
        });
    }
}

class MyFooter extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <footer>
            <div class="footer-obsah">
                <p class="autori">Vytvorili <strong>Adrián Kýška, Lukáš Heldák, Mária Cerulíková, Veronika Horňáková</strong>...</p>
                <p class="aktualizacia"><strong>Posledne aktualizované:</strong> 12.01.2026</p>
            </div>
        </footer>`;
    }
}

customElements.define('my-header', MyHeader);
customElements.define('my-footer', MyFooter);

function updateMessagesBadge(count) {
    const badge = document.getElementById("messagesBadge");
    if (!badge) return;
    count = Number(count) || 0;
    if (count > 0) {
        badge.textContent = count > 99 ? "99+" : String(count);
        badge.style.display = "inline-flex";
    } else {
        badge.style.display = "none";
    }
}

function updateNotificationsBadge(count) {
    const badge = document.getElementById("notificationsBadge");
    if (!badge) return;
    count = Number(count) || 0;
    if (count > 0) {
        badge.textContent = count > 99 ? "99+" : String(count);
        badge.style.display = "inline-flex";
    } else {
        badge.style.display = "none";
    }
}