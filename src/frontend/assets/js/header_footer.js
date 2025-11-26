class MyHeader extends HTMLElement {
	connectedCallback() {
		const currentUser = JSON.parse(localStorage.getItem('currentUser')) || { first_name: '', last_name: '', nick: 'Hosť', profile_pic: 'https://picsum.photos/seed/user1/200' };
		
		const displayName = `${currentUser.first_name || ''} ${currentUser.last_name || ''}`.trim();
		const nickDisplay = currentUser.nick ? `(${currentUser.nick})` : '';
		const fullDisplay = displayName ? `${displayName} ${nickDisplay}`.trim() : currentUser.nick;

		this.innerHTML = `
			<header>
				<div>
					<img src="../assets/img/DecLibWhite.png" alt="Logo" title="Decentralizovaná knižnica" class="logo">
					<h1>Decentralizovaná knižnica</h1>
				</div>
				<div>
					<div class="pouzivatel-dropdown">
						<button onclick="showDropdown()" onfocusout="hideDropdown()" class="pouzivatel_tlacidlo"><h2>${fullDisplay}</h2></button>
						<div id="pouzivatel_moznosti" class="pouzivatel_obsah">
							<a href="#">Spravuj účet</a>
    						<a href="#">Odhlás ma</a>
						</div>
					</div>
					<img src="${currentUser.profile_pic}" class="pouzivatel-hlavicka-obr">
				</div>
			</header>`;
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

/* Zobraz moznosti pod tlacidlom s menom*/
function showDropdown() {
  document.getElementById("pouzivatel_moznosti").classList.toggle("show");
}

// schovaj moznosti pod menom
function hideDropdown(){
  console.log("klikol mimo tlačidla");
  var dropdown = document.getElementById("pouzivatel_moznosti");
  if(dropdown.classList.contains('show')){
	dropdown.classList.remove('show');
  }
}

customElements.define('my-header', MyHeader)
customElements.define('my-footer', MyFooter)