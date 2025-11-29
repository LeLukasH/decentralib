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
                <div class="header-user">
                    ${
                        currentUser
                        ? `<h2>${displayName}</h2>
                           <img src="${profilePic}" class="pouzivatel-hlavicka-obr">
                           <button id="signOutBtn">Sign Out</button>`
                        : `<button id="signInBtn">Sign In</button>`
                    }
                </div>
            </header>
        `;

        // Pridáme listener na sign out
        const signOutBtn = this.querySelector('#signOutBtn');
        if (signOutBtn) {
            signOutBtn.addEventListener('click', logout);
        }

        // Sign in tlačidlo
        const signInBtn = this.querySelector('#signInBtn');
        if (signInBtn) {
            signInBtn.addEventListener('click', () => {
                window.location.href = 'auth/login.html';
            });
        }
    }
}

class MyFooter extends HTMLElement {
	connectedCallback() {
		this.innerHTML = `
		<footer>
			Vytvorili <strong>Adrián Kýška, Lukáš Heldák, Jozef Blaško, Mária Cerulíková, Veronika Horňáková </strong> v rámci predmetu Metodológie tvorby webu.<br>
			<strong>Posledne aktualizované:</strong> 26.11.2025<br>
		</footer>`
	}
}

customElements.define('my-header', MyHeader)
customElements.define('my-footer', MyFooter)