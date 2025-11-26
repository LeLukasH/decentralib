class MyHeader extends HTMLElement {
	connectedCallback() {
		this.innerHTML = `
		<header>
			<div>		
				<img src="../assets/img/DecLibWhite.png" alt="Logo" title="Decentralizovaná knižnica" class = "logo">
				<h1>Decentralizovaná knižnica</h1>
			</div>
			<div>
				<h2>marty</h2>
				<img src = "https://picsum.photos/seed/user1/200" class="pouzivatel-hlavicka-obr">
			</div>
		</header>`
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