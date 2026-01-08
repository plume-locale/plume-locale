// ============================================
// ARRAY UTILS - Utilitaires de manipulation de tableaux
// ============================================

/**
 * ArrayUtils - Helpers pour la manipulation de tableaux
 *
 * Responsabilités :
 * - Opérations courantes sur les tableaux
 * - Recherche et filtrage
 * - Tri et regroupement
 * - Manipulation d'IDs
 */

const ArrayUtils = (function() {
    'use strict';

    /**
     * Retire un élément d'un tableau par valeur
     * @param {Array} array - Tableau source
     * @param {*} value - Valeur à retirer
     * @returns {Array} Nouveau tableau sans la valeur
     */
    function remove(array, value) {
        if (!Array.isArray(array)) {
            return [];
        }

        return array.filter(item => item !== value);
    }

    /**
     * Retire un ID d'un tableau d'IDs
     * @param {Array<number>} array - Tableau d'IDs
     * @param {number} id - ID à retirer
     * @returns {Array<number>}
     */
    function removeId(array, id) {
        if (!Array.isArray(array)) {
            return [];
        }

        return array.filter(itemId => itemId !== id);
    }

    /**
     * Retire un élément par son index
     * @param {Array} array - Tableau source
     * @param {number} index - Index à retirer
     * @returns {Array} Nouveau tableau
     */
    function removeAt(array, index) {
        if (!Array.isArray(array) || index < 0 || index >= array.length) {
            return array;
        }

        return [...array.slice(0, index), ...array.slice(index + 1)];
    }

    /**
     * Trouve un élément par ID
     * @param {Array} array - Tableau d'objets
     * @param {number} id - ID recherché
     * @returns {Object|null}
     */
    function findById(array, id) {
        if (!Array.isArray(array)) {
            return null;
        }

        return array.find(item => item.id === id) || null;
    }

    /**
     * Trouve l'index d'un élément par ID
     * @param {Array} array - Tableau d'objets
     * @param {number} id - ID recherché
     * @returns {number} Index ou -1
     */
    function findIndexById(array, id) {
        if (!Array.isArray(array)) {
            return -1;
        }

        return array.findIndex(item => item.id === id);
    }

    /**
     * Vérifie si un tableau contient un ID
     * @param {Array<number>} array - Tableau d'IDs
     * @param {number} id - ID recherché
     * @returns {boolean}
     */
    function hasId(array, id) {
        if (!Array.isArray(array)) {
            return false;
        }

        return array.includes(id);
    }

    /**
     * Toggle un ID dans un tableau
     * @param {Array<number>} array - Tableau d'IDs
     * @param {number} id - ID à toggler
     * @returns {Array<number>} Nouveau tableau
     */
    function toggleId(array, id) {
        if (!Array.isArray(array)) {
            return [id];
        }

        if (hasId(array, id)) {
            return removeId(array, id);
        } else {
            return [...array, id];
        }
    }

    /**
     * Déduplique un tableau
     * @param {Array} array - Tableau source
     * @returns {Array} Tableau sans doublons
     */
    function unique(array) {
        if (!Array.isArray(array)) {
            return [];
        }

        return [...new Set(array)];
    }

    /**
     * Déduplique par propriété
     * @param {Array} array - Tableau d'objets
     * @param {string} key - Clé pour la déduplication
     * @returns {Array}
     */
    function uniqueBy(array, key) {
        if (!Array.isArray(array)) {
            return [];
        }

        const seen = new Set();
        return array.filter(item => {
            const value = item[key];
            if (seen.has(value)) {
                return false;
            }
            seen.add(value);
            return true;
        });
    }

    /**
     * Regroupe les éléments par propriété
     * @param {Array} array - Tableau d'objets
     * @param {string} key - Clé de regroupement
     * @returns {Object} Objet avec les groupes
     */
    function groupBy(array, key) {
        if (!Array.isArray(array)) {
            return {};
        }

        return array.reduce((groups, item) => {
            const value = item[key];
            if (!groups[value]) {
                groups[value] = [];
            }
            groups[value].push(item);
            return groups;
        }, {});
    }

    /**
     * Compte les occurrences par propriété
     * @param {Array} array - Tableau d'objets
     * @param {string} key - Clé à compter
     * @returns {Object} Objet avec les compteurs
     */
    function countBy(array, key) {
        if (!Array.isArray(array)) {
            return {};
        }

        return array.reduce((counts, item) => {
            const value = item[key];
            counts[value] = (counts[value] || 0) + 1;
            return counts;
        }, {});
    }

    /**
     * Trie par propriété
     * @param {Array} array - Tableau d'objets
     * @param {string} key - Clé de tri
     * @param {string} order - 'asc' ou 'desc'
     * @returns {Array} Nouveau tableau trié
     */
    function sortBy(array, key, order = 'asc') {
        if (!Array.isArray(array)) {
            return [];
        }

        const sorted = [...array].sort((a, b) => {
            const aVal = a[key];
            const bVal = b[key];

            if (aVal < bVal) return order === 'asc' ? -1 : 1;
            if (aVal > bVal) return order === 'asc' ? 1 : -1;
            return 0;
        });

        return sorted;
    }

    /**
     * Trie par plusieurs critères
     * @param {Array} array - Tableau d'objets
     * @param {Array} criteria - [{key, order}]
     * @returns {Array}
     */
    function sortByMultiple(array, criteria) {
        if (!Array.isArray(array) || !Array.isArray(criteria)) {
            return array;
        }

        return [...array].sort((a, b) => {
            for (const { key, order = 'asc' } of criteria) {
                const aVal = a[key];
                const bVal = b[key];

                if (aVal < bVal) return order === 'asc' ? -1 : 1;
                if (aVal > bVal) return order === 'asc' ? 1 : -1;
            }
            return 0;
        });
    }

    /**
     * Divise un tableau en chunks
     * @param {Array} array - Tableau source
     * @param {number} size - Taille des chunks
     * @returns {Array<Array>}
     */
    function chunk(array, size) {
        if (!Array.isArray(array) || size <= 0) {
            return [];
        }

        const chunks = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    }

    /**
     * Aplati un tableau de tableaux
     * @param {Array<Array>} array - Tableau de tableaux
     * @param {number} depth - Profondeur (défaut 1)
     * @returns {Array}
     */
    function flatten(array, depth = 1) {
        if (!Array.isArray(array)) {
            return [];
        }

        return array.flat(depth);
    }

    /**
     * Mélange un tableau (shuffle)
     * @param {Array} array - Tableau source
     * @returns {Array} Nouveau tableau mélangé
     */
    function shuffle(array) {
        if (!Array.isArray(array)) {
            return [];
        }

        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    /**
     * Prend les N premiers éléments
     * @param {Array} array - Tableau source
     * @param {number} count - Nombre d'éléments
     * @returns {Array}
     */
    function take(array, count) {
        if (!Array.isArray(array)) {
            return [];
        }

        return array.slice(0, count);
    }

    /**
     * Prend les N derniers éléments
     * @param {Array} array - Tableau source
     * @param {number} count - Nombre d'éléments
     * @returns {Array}
     */
    function takeLast(array, count) {
        if (!Array.isArray(array)) {
            return [];
        }

        return array.slice(-count);
    }

    /**
     * Intersection de deux tableaux
     * @param {Array} array1
     * @param {Array} array2
     * @returns {Array}
     */
    function intersection(array1, array2) {
        if (!Array.isArray(array1) || !Array.isArray(array2)) {
            return [];
        }

        const set2 = new Set(array2);
        return array1.filter(item => set2.has(item));
    }

    /**
     * Différence entre deux tableaux
     * @param {Array} array1
     * @param {Array} array2
     * @returns {Array} Éléments dans array1 mais pas dans array2
     */
    function difference(array1, array2) {
        if (!Array.isArray(array1) || !Array.isArray(array2)) {
            return array1 || [];
        }

        const set2 = new Set(array2);
        return array1.filter(item => !set2.has(item));
    }

    /**
     * Union de deux tableaux (sans doublons)
     * @param {Array} array1
     * @param {Array} array2
     * @returns {Array}
     */
    function union(array1, array2) {
        if (!Array.isArray(array1)) array1 = [];
        if (!Array.isArray(array2)) array2 = [];

        return unique([...array1, ...array2]);
    }

    /**
     * Somme des valeurs d'un tableau
     * @param {Array<number>} array - Tableau de nombres
     * @returns {number}
     */
    function sum(array) {
        if (!Array.isArray(array)) {
            return 0;
        }

        return array.reduce((total, num) => total + (num || 0), 0);
    }

    /**
     * Moyenne des valeurs d'un tableau
     * @param {Array<number>} array - Tableau de nombres
     * @returns {number}
     */
    function average(array) {
        if (!Array.isArray(array) || array.length === 0) {
            return 0;
        }

        return sum(array) / array.length;
    }

    /**
     * Valeur min d'un tableau
     * @param {Array<number>} array
     * @returns {number}
     */
    function min(array) {
        if (!Array.isArray(array) || array.length === 0) {
            return 0;
        }

        return Math.min(...array);
    }

    /**
     * Valeur max d'un tableau
     * @param {Array<number>} array
     * @returns {number}
     */
    function max(array) {
        if (!Array.isArray(array) || array.length === 0) {
            return 0;
        }

        return Math.max(...array);
    }

    /**
     * Déplace un élément dans un tableau
     * @param {Array} array - Tableau source
     * @param {number} fromIndex - Index source
     * @param {number} toIndex - Index destination
     * @returns {Array} Nouveau tableau
     */
    function move(array, fromIndex, toIndex) {
        if (!Array.isArray(array)) {
            return [];
        }

        const result = [...array];
        const [element] = result.splice(fromIndex, 1);
        result.splice(toIndex, 0, element);
        return result;
    }

    /**
     * Vérifie si tous les éléments sont uniques
     * @param {Array} array
     * @returns {boolean}
     */
    function isUnique(array) {
        if (!Array.isArray(array)) {
            return true;
        }

        return array.length === new Set(array).size;
    }

    /**
     * Vérifie si le tableau est vide
     * @param {Array} array
     * @returns {boolean}
     */
    function isEmpty(array) {
        return !Array.isArray(array) || array.length === 0;
    }

    // API publique
    return {
        remove,
        removeId,
        removeAt,
        findById,
        findIndexById,
        hasId,
        toggleId,
        unique,
        uniqueBy,
        groupBy,
        countBy,
        sortBy,
        sortByMultiple,
        chunk,
        flatten,
        shuffle,
        take,
        takeLast,
        intersection,
        difference,
        union,
        sum,
        average,
        min,
        max,
        move,
        isUnique,
        isEmpty
    };
})();

// Exposer globalement
window.ArrayUtils = ArrayUtils;
