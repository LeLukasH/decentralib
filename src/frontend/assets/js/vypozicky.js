
document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. Konštanty pre Stránkovanie (Pagination) ---
    const ITEMS_PER_ROW = 4; // Zmenené z 5 na 4
    const ROWS_PER_PAGE = 3; 
    const ITEMS_PER_PAGE = ITEMS_PER_ROW * ROWS_PER_PAGE; // 12 kariet na stránku

    // --- 2. Elementy DOM ---
    const btnSchvalene = document.getElementById('btnSchvalene');
    const btnCakajuce = document.getElementById('btnCakajuce');
    const schvaleneVypozicky = document.getElementById('schvaleneVypozicky');
    const cakajuceVypozicky = document.getElementById('cakajuceVypozicky');
    const zoznamSchvalenych = document.getElementById('zoznam-schvalenych');
    const zoznamCakajucich = document.getElementById('zoznam-cakajucich');

    // Inicializácia aktuálnych stránok
    let currentPageSchvalene = 1;
    let currentPageCakajuce = 1;

    // --- 3. Simulované Dáta ---
    // TODO JE TO TU LEN PRE MOJ TEST TREBA TO NÁHRADIŤ REÁLNYMI DÁTAMI Z FIRESTORE
    const dummyDataSchvalene = Array.from({ length: 35 }, (_, i) => ({
        id: i + 1,
        title: `Majster a Margaréta ${i + 1}`,
        author: `Michail Bulgakov`,
        borrower: `Jano Novák ${i % 3 + 1}`,
        borrowerRating: (4.5 + Math.random() * 0.4).toFixed(1),
        dateFrom: `2026-01-${i % 30 + 1}`,
        dateTo: `2026-02-${i % 30 + 15}`,
    }));

    const dummyDataCakajuce = Array.from({ length: 28 }, (_, i) => ({
        id: i + 1,
        title: `Duna - Kniha ${i + 1}`,
        author: `Frank Herbert`,
        requester: `Fero Kováč ${i % 4 + 1}`,
        requesterRating: (4.0 + Math.random() * 0.9).toFixed(1),
        dateFrom: `2026-03-${i % 30 + 1}`,
        dateTo: `2026-03-${i % 30 + 10}`,
    }));


    // --- 4. Funkcie na Tvorbu Kariet ---

    function createSchvalenaCard(item) {
        return `
            <div class="karta-vypozicky" data-id="${item.id}">
                <div class="karta-content">
                    <img src="https://via.placeholder.com/80x120?text=S${item.id}" alt="Obal knihy" width="80" height="120">
                    <div class="karta-info">
                        <h4>${item.title}</h4>
                        <p><strong>Autor:</strong> ${item.author}</p>
                        <p><strong>Požičal si:</strong> ${item.borrower} (<span class="rating-star">&#9733;</span>${item.borrowerRating})</p>
                        <p><strong>Od:</strong> ${item.dateFrom} <strong>Do:</strong> ${item.dateTo}</p>
                    </div>
                </div>
                <button class="request-button schvalena-akcia" style="background-color: #1e8543; margin-top: 10px;">Potvrdiť vrátenie</button>
            </div>
        `;
    }

    function createCakajucaCard(item) {
        return `
            <div class="karta-vypozicky" data-id="${item.id}">
                <div class="karta-content">
                    <img src="https://via.placeholder.com/80x120?text=C${item.id}" alt="Obal knihy" width="80" height="120">
                    <div class="karta-info">
                        <h4>${item.title}</h4>
                        <p><strong>Autor:</strong> ${item.author}</p>
                        <p><strong>Žiadateľ:</strong> ${item.requester} (<span class="rating-star">&#9733;</span>${item.requesterRating})</p>
                        <p><strong>Požadované:</strong> ${item.dateFrom} - ${item.dateTo}</p>
                    </div>
                </div>
                <div class="action-buttons" style="display: flex; gap: 10px; margin-top: 10px;">
                    <button class="request-button cakajuca-schvalit" style="background-color: #2f70e9; flex: 1;">Schváliť</button>
                    <button class="request-button cakajuca-zamietnut" style="background-color: #c62828; flex: 1;">Zamietnuť</button>
                </div>
            </div>
        `;
    }


    // --- 5. Logika Zobrazenia a Stránkovania ---

    function displayList(data, container, currentPage, cardCreator) {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        
        const pageItems = data.slice(startIndex, endIndex);

        // Grid stĺpce riadi VÝHRADNE CSS (vypozicky.css), aby fungovala responzivita
        container.style.display = 'grid'; 
        
        container.innerHTML = pageItems.map(cardCreator).join('');
    }

    function setupPagination(data, paginationId, current, listType) {
        const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);
        const paginationContainer = document.getElementById(paginationId);
        
        if (totalPages <= 1) {
            paginationContainer.innerHTML = '';
            return;
        }

        let html = '';
        
        // Tlačidlo Späť
        html += `<button class="pagination-button nav-arrow" data-page="${current - 1}" data-list="${listType}" ${current === 1 ? 'disabled' : ''}>&lt;</button>`;
        
        // Stránkové čísla
        for (let i = 1; i <= totalPages; i++) {
            const activeClass = i === current ? 'active' : '';
            html += `<button class="pagination-button ${activeClass}" data-page="${i}" data-list="${listType}">${i}</button>`;
        }
        
        // Tlačidlo Ďalej
        html += `<button class="pagination-button nav-arrow" data-page="${current + 1}" data-list="${listType}" ${current === totalPages ? 'disabled' : ''}>&gt;</button>`;

        paginationContainer.innerHTML = html;
        
        // Pridanie event listenerov pre čísla stránok
        paginationContainer.querySelectorAll('.pagination-button').forEach(button => {
            button.addEventListener('click', (e) => {
                if (e.currentTarget.disabled) return;
                
                const newPage = parseInt(e.currentTarget.getAttribute('data-page'));
                const type = e.currentTarget.getAttribute('data-list');
                
                if (type === 'schvalene') {
                    currentPageSchvalene = newPage;
                } else {
                    currentPageCakajuce = newPage;
                }
                renderPagination(type);
            });
        });
    }
    
    function renderPagination(listType) {
        if (listType === 'schvalene') {
            displayList(dummyDataSchvalene, zoznamSchvalenych, currentPageSchvalene, createSchvalenaCard);
            setupPagination(dummyDataSchvalene, 'pagination-schvalene', currentPageSchvalene, 'schvalene');
        } else {
            displayList(dummyDataCakajuce, zoznamCakajucich, currentPageCakajuce, createCakajucaCard);
            setupPagination(dummyDataCakajuce, 'pagination-cakajuce', currentPageCakajuce, 'cakajuce');
        }
    }

    // --- 6. Logika Prepínania Sekcií ---
    
    function prepniZobrazenie(aktivnyTyp) {
        if (aktivnyTyp === 'schvalene') {
            btnSchvalene.classList.add('active');
            schvaleneVypozicky.classList.remove('hidden');
            btnCakajuce.classList.remove('active');
            cakajuceVypozicky.classList.add('hidden');
            renderPagination('schvalene'); 
        } else {
            btnCakajuce.classList.add('active');
            cakajuceVypozicky.classList.remove('hidden');
            btnSchvalene.classList.remove('active');
            schvaleneVypozicky.classList.add('hidden');
            renderPagination('cakajuce'); 
        }
    }

    btnSchvalene.addEventListener('click', () => prepniZobrazenie('schvalene'));
    btnCakajuce.addEventListener('click', () => prepniZobrazenie('cakajuce'));
    
    // --- 7. Inicializácia ---
    prepniZobrazenie('schvalene');
    
    // Voliteľné: Akcie pre tlačidlá 
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('schvalena-akcia')) {
            const card = e.target.closest('.karta-vypozicky');
            console.log(`Akcia: Potvrdiť vrátenie pre ID: ${card.getAttribute('data-id')}`);
        }
        if (e.target.classList.contains('cakajuca-schvalit')) {
            const card = e.target.closest('.karta-vypozicky');
            console.log(`Akcia: Schváliť požiadavku pre ID: ${card.getAttribute('data-id')}`);
        }
        if (e.target.classList.contains('cakajuca-zamietnut')) {
            const card = e.target.closest('.karta-vypozicky');
            console.log(`Akcia: Zamietnuť požiadavku pre ID: ${card.getAttribute('data-id')}`);
        }
    });
});