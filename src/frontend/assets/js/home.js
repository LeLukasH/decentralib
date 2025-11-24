import {  USERS, BOOKS, BOOK_GENRES, BOOK_LANGS, CITIES} from "./config.js";


function renderBooks() {
    const container = document.getElementById("zoznam-knih");
    container.innerHTML = "";

    BOOKS.forEach(book => {
        const card = document.createElement("div");
        card.className = "karta-knihy";
        const dostupne = isBookAvailable(book);

        card.innerHTML = `
            <h4>${book.title}</h4>
            <div class="karta-content">
                <img src="${book.image_url}" alt="" width="130" height="200">
                <div class="karta-info">
                    <p>${book.autor}</p>
                    <p style="font-size: 16px;">
                        ${getOwnerNick(book)}
                        <span style='font-size:25px; color:yellow'>&#9733;</span>
                        ${getOwnerReputation(book)}
                    </p>
                    <p>${getOwnerLocation(book)}</p>
                    <div class="${dostupne ? "dostupne" : "pozicane"}">
                        ${dostupne ? "Dostupné" : "Požičané"}
                    </div>
                    <a href="detail-knihy.html?id=${book.book_id}" class="btn-detail">
                        Zobraziť detail
                    </a>
                </div>
            </div>
        `;

        container.appendChild(card);
    });
}           

function getOwner(book) {
    return USERS.find(u => u.user_id === book.owner_id) || null;
}

function getOwnerNick(book) {
    const owner = getOwner(book);
    return owner ? owner.nick : "neznámy";
}

function getOwnerReputation(book) {
    const owner = getOwner(book);
    return owner ? owner.reputation : "—";
}

function getOwnerLocation(book) {
    const owner = getOwner(book);
    return owner ? owner.location : "—";
}

function isBookAvailable(book) {
    return book.is_available === "yes";
}


function generateFilterOptions() {
    const genreContainer = document.getElementById("dropdown-zaner");
    genreContainer.innerHTML = "";
    var genres = "";
    BOOK_GENRES.forEach(g => {
        genres += `
            <div class="option">
                <input type="checkbox" value="${g}"> ${g}
            </div>
        `;
    });
    genreContainer.innerHTML = genres;

    const languageContainer = document.getElementById("dropdown-jazyk");
    languageContainer.innerHTML = "";
    var languages = "";
    BOOK_LANGS.forEach(l => {
        languages += `
            <div class="option">
                <input type="checkbox" value="${l}"> ${l}
            </div>
        `;
    });
    languageContainer.innerHTML = languages;

    const cityContainer = document.getElementById("dropdown-mesto");
    cityContainer.innerHTML = "";
    var cities = "";
    CITIES.forEach(c => {
        cities += `
            <div class="option">
                <input type="checkbox" value="${c}"> ${c}
            </div>
        `;
    });
    cityContainer.innerHTML = cities;
}


let searchCommitted = { nazov: "", autor: "" }; // uchová hodnoty po stlačení enteru 

function getFilters() {
    const result = {};

    const groups = document.querySelectorAll(".filter-skupina[data-filter]");
    groups.forEach(group => {
        const name = group.dataset.filter;
        const checked = group.querySelectorAll('input[type="checkbox"]:checked');
        const values = Array.from(checked).map(ch => ch.value);
        result[name] = values;
    });
    
    const lenDostupne = document.getElementById("len-dostupne").checked;
    if (lenDostupne) result["lenDostupne"] = true;

    const vzd = document.getElementById("vzdialenost").value;
    if (vzd.trim() !== "") result["vzdialenost"] = vzd;

    const rating = document.getElementById("hodnotenie").value;
    if (rating !== "0") result["hodnotenie"] = rating;

    if (searchCommitted.nazov !== "") result["nazov"] = searchCommitted.nazov;
    if (searchCommitted.autor !== "") result["autor"] = searchCommitted.autor;

    console.log(result);
    return result;
}

function renderActiveFilters() {
    const filters = getFilters();
    const container = document.getElementById("vypis");
    const nadpis = document.getElementById("vysledky-nadpis");
    container.innerHTML = "";

    let activeCount = 0;

    for (const key in filters) {
        const value = filters[key];

        if (Array.isArray(value)) {
            value.forEach(v => createBadge(key, v));
        } else {
            createBadge(key, value);
        }
    }

    function createBadge(key, value) {
        console.log(key, value);
        activeCount++;
        const badge = document.createElement("span");
        badge.className = "filter-badge";

        let text = value;

        if (key === "vzdialenost") text = `do ${value} km`;
        if (key === "hodnotenie") text = `hodnotenie: ${value}+`;
        if (key === "lenDostupne") text = "len dostupné";

        badge.textContent = text + " ";

        const x = document.createElement("span");
        x.className = "close-x";
        x.innerHTML = "&times;";
        x.onclick = () => uncheckByKey(key, value);

        badge.appendChild(x);
        container.appendChild(badge);
    }

    nadpis.textContent = activeCount === 0 ? "Všetky tituly" : "Výsledky pre:";

    const btn = document.getElementById("vymaz-filtre");
    btn.style.display = activeCount >= 2 ? "block" : "none";
}

function uncheckByKey(key, value) {
    if (key === "lenDostupne") {
        document.getElementById("len-dostupne").checked = false;
    }

    if (key === "vzdialenost") {
        document.getElementById("vzdialenost").value = "";
    }

    if (key === "hodnotenie") {
        document.getElementById("hodnotenie").value = 0;
    }

    if (key === "nazov") {
        searchCommitted.nazov = "";
        document.querySelector('input[placeholder="Názov"]').value = "";
    }

    if (key === "autor") {
        searchCommitted.autor = "";
        document.querySelector('input[placeholder="Autor"]').value = "";
    }

    const checkbox = document.querySelector(`input[type="checkbox"][value="${value}"]`);
    if (checkbox) checkbox.checked = false;

    renderActiveFilters();
}

function deleteFilters() {
    document.querySelectorAll('input[type="checkbox"]:checked').forEach(ch => ch.checked = false);

    document.getElementById("vzdialenost").value = "";
    document.getElementById("hodnotenie").value = 0;

    searchCommitted.nazov = "";
    searchCommitted.autor = "";

    document.querySelector('input[placeholder="Názov"]').value = "";
    document.querySelector('input[placeholder="Autor"]').value = "";

    renderActiveFilters();
}

function toggleFilter(header) {
    const body = header.nextElementSibling;
    header.classList.toggle("open");
    body.style.display = body.style.display === "block" ? "none" : "block";
}

document.addEventListener("input", function(e) {
    if (e.target.type === "checkbox" || e.target.type === "number" || e.target.id === "hodnotenie") {
        renderActiveFilters();
    }
});

document.addEventListener("keydown", function(e) {
    if (e.key === "Enter") {
        if (e.target.placeholder === "Názov") {
            searchCommitted.nazov = e.target.value.trim();
        }
        if (e.target.placeholder === "Autor") {
            searchCommitted.autor = e.target.value.trim();
        }
        renderActiveFilters();
    }
});

document.querySelectorAll(".dropdown-header").forEach(header => {
    header.addEventListener("click", () => toggleFilter(header));
});

document.getElementById("vymaz-filtre").addEventListener("click", deleteFilters);

generateFilterOptions();
renderBooks();
renderActiveFilters();
