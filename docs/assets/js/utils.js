/**
 * Získa unikátne hodnoty z daného poľa objektov pre špecifický kľúč.
 * @param {Array<Object>} data Pole kníh alebo používateľov.
 * @param {string} key Kľúč, ktorého hodnoty chceme získať.
 * @returns {Array<string>} Pole unikátnych, zoradených hodnôt.
 */
export function getUniqueSortedValues(data, key) {
    // Použijeme Set pre získanie unikátnych hodnôt a potom zoradíme
    // Filter zabezpečí, že hodnoty nie sú undefined alebo null
    return [...new Set(data.map(item => item[key]).filter(value => value))].sort();
}

export function refreshHeader() {
    const header = document.querySelector('my-header');

    // Remove and re-add
    header.remove();
    document.body.prepend(header); // or wherever it was
}

import { USERS } from "./api/allData.js";

/**
 * Vráti HTML string s odkazom na profil používateľa a jeho reputáciou
 * @param {number} userId - ID používateľa
 * @returns {string} HTML string s menom, linkom a reputáciou
 */
export function renderUserLink(userId, withReputation = true, fontSize = 16) {
    const user = USERS.find(u => u.id === userId);
    if (!user) return `<span>Neznámy používateľ</span>`;

    const reputation = user.reputation?.toFixed(2) || "0.00";

    return `
        <p style="font-size: ${fontSize}px; margin: 0;">
            <a href="profile.html?user_id=${user.id}" style="text-decoration: none;">
                ${user.first_name} ${user.last_name}
            </a>
            ${withReputation ? `<span style="margin-left: 5px; white-space: nowrap;">(<span style="color: #F5A623;">&#9733;</span> ${reputation})</span>` : ''}
        </p>
    `;
}

export function getUrlParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
}

export function debugUI(message) {
    let box = document.getElementById("debug-box");
    if (!box) {
        box = document.createElement("div");
        box.id = "debug-box";
        box.style.position = "fixed";
        box.style.bottom = "10px";
        box.style.right = "10px";
        box.style.zIndex = "99999";
        box.style.background = "#111";
        box.style.color = "#0f0";
        box.style.padding = "10px";
        box.style.fontSize = "12px";
        box.style.maxWidth = "320px";
        box.style.borderRadius = "6px";
        box.style.boxShadow = "0 0 10px rgba(0,0,0,0.4)";
        document.body.appendChild(box);
    }

    const line = document.createElement("div");
    line.textContent = message;
    box.appendChild(line);
}