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