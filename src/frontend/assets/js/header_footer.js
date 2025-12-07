import { logout } from "./auth.js";

class MyHeader extends HTMLElement {
    connectedCallback() {
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
                    <img src="../assets/img/DecLibWhite.png" alt="Logo" title="Decentralizovaná knižnica" class="logo">
                    <h1>Decentralizovaná knižnica</h1>
                </div>
                <nav class="hlavne-menu">
                    <a href="home.html" class="navigacne-tlacidlo">Domov</a>
                    <a href="moje_knihy.html" class="navigacne-tlacidlo">Moje knihy</a>
                    <a href="pozicane.html" class="navigacne-tlacidlo">Mám požičané</a>
                    <a href="spravy.html" class="navigacne-tlacidlo">Správy</a>
                </nav>

                <button class="hamburger">
                    ☰
                </button>

                <div>
                    ${
                        currentUser
                        ? `<div class="pouzivatel-dropdown">
                               <button class="pouzivatel_tlacidlo">
									<h2>${displayName}</h2>
                                   	<img src="${profilePic}" class="pouzivatel-hlavicka-obr">
                               </button>
                               <div class="pouzivatel_obsah">
                                   <a href="#">Spravuj účet</a>
                                   <a id="signOutBtn">Odhlás ma</a>
                               </div>
                           </div>`
                        : `<button id="signInBtn">Sign In</button>`
                    }
                </div>
            </header>
        `;

        // Sign Out listener
        const signOutBtn = this.querySelector('#signOutBtn');
        if (signOutBtn) signOutBtn.addEventListener('click', logout);

        // Sign In listener
        const signInBtn = this.querySelector('#signInBtn');
        if (signInBtn) signInBtn.addEventListener('click', () => {
            window.location.href = 'auth/login.html';
        });

        // Dropdown listener
        const dropdownBtn = this.querySelector('.pouzivatel_tlacidlo');
        const dropdownContent = this.querySelector('.pouzivatel_obsah');
        if (dropdownBtn && dropdownContent) {
            dropdownBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // aby klik neodchádzal von
                dropdownContent.classList.toggle('show');
            });

            // Klik mimo dropdown zatvorí menu
            document.addEventListener('click', () => {
                dropdownContent.classList.remove('show');
            });
        }

        const hamburger = this.querySelector('.hamburger');
        const menu = this.querySelector('.hlavne-menu');

        hamburger.addEventListener('click', () => {
        menu.classList.toggle('open');
        });

        // Zisti aktuálne meno súboru (napr. "spravy.html")
        const currentPage = window.location.pathname.split('/').pop();

        // Nájdeme všetky navigačné odkazy
        const links = this.querySelectorAll('.hlavne-menu a');

        // Prejdi všetky odkazy a skry ten, ktorý zodpovedá aktuálnej stránke
        links.forEach(link => {
            const linkPage = link.getAttribute('href');
            if (linkPage === currentPage) {
                link.style.color = '#003f87';  // zmeň farbu tlačidla
            }
        });
    }
}

class MyFooter extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <footer>
            Vytvorili <strong>Adrián Kýška, Lukáš Heldák, Jozef Blaško, Mária Cerulíková, Veronika Horňáková </strong> v rámci predmetu Metodológie tvorby webu.<br>
            <strong>Posledne aktualizované:</strong> 26.11.2025<br>
        </footer>`;
    }
}

customElements.define('my-header', MyHeader);
customElements.define('my-footer', MyFooter);
