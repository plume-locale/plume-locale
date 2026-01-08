// ============================================
// TEXT UTILS - Utilitaires de manipulation de texte
// ============================================

/**
 * TextUtils - Helpers pour le formatage et la manipulation de texte
 *
 * Responsabilités :
 * - Formatage des nombres (word count, etc.)
 * - Normalisation de texte pour la recherche
 * - Troncature et résumés
 * - Manipulation de strings
 */

const TextUtils = (function() {
    'use strict';

    /**
     * Formate un nombre de mots
     * @param {number} count - Nombre de mots
     * @returns {string}
     */
    function formatWordCount(count) {
        if (count === 0 || count === undefined || count === null) {
            return '0 mot';
        }

        if (count === 1) {
            return '1 mot';
        }

        // Formatage avec espaces pour les milliers
        if (count >= 1000) {
            return count.toLocaleString('fr-FR') + ' mots';
        }

        return count + ' mots';
    }

    /**
     * Compte les mots dans un texte
     * @param {string} text - Texte à analyser
     * @returns {number}
     */
    function countWords(text) {
        if (!text || typeof text !== 'string') {
            return 0;
        }

        // Nettoyer le texte et compter les mots
        const cleaned = text.trim();
        if (cleaned === '') {
            return 0;
        }

        // Compter en séparant par espaces/retours à la ligne
        return cleaned.split(/\s+/).filter(word => word.length > 0).length;
    }

    /**
     * Compte les caractères (sans espaces)
     * @param {string} text
     * @returns {number}
     */
    function countCharacters(text) {
        if (!text || typeof text !== 'string') {
            return 0;
        }

        return text.replace(/\s/g, '').length;
    }

    /**
     * Compte les caractères (avec espaces)
     * @param {string} text
     * @returns {number}
     */
    function countCharactersWithSpaces(text) {
        if (!text || typeof text !== 'string') {
            return 0;
        }

        return text.length;
    }

    /**
     * Normalise un texte pour la recherche
     * @param {string} text - Texte à normaliser
     * @returns {string}
     */
    function normalize(text) {
        if (!text || typeof text !== 'string') {
            return '';
        }

        return text
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Retirer les accents
            .replace(/['']/g, "'") // Normaliser les apostrophes
            .trim();
    }

    /**
     * Tronque un texte à une longueur maximale
     * @param {string} text - Texte à tronquer
     * @param {number} maxLength - Longueur maximale
     * @param {string} suffix - Suffixe à ajouter (défaut '...')
     * @returns {string}
     */
    function truncate(text, maxLength, suffix = '...') {
        if (!text || typeof text !== 'string') {
            return '';
        }

        if (text.length <= maxLength) {
            return text;
        }

        return text.substring(0, maxLength - suffix.length) + suffix;
    }

    /**
     * Tronque un texte au dernier mot complet
     * @param {string} text - Texte à tronquer
     * @param {number} maxLength - Longueur approximative
     * @param {string} suffix - Suffixe à ajouter
     * @returns {string}
     */
    function truncateWords(text, maxLength, suffix = '...') {
        if (!text || typeof text !== 'string') {
            return '';
        }

        if (text.length <= maxLength) {
            return text;
        }

        // Trouver le dernier espace avant maxLength
        const truncated = text.substring(0, maxLength);
        const lastSpace = truncated.lastIndexOf(' ');

        if (lastSpace === -1) {
            return truncated + suffix;
        }

        return truncated.substring(0, lastSpace) + suffix;
    }

    /**
     * Met en majuscule la première lettre
     * @param {string} text
     * @returns {string}
     */
    function capitalize(text) {
        if (!text || typeof text !== 'string') {
            return '';
        }

        return text.charAt(0).toUpperCase() + text.slice(1);
    }

    /**
     * Met en majuscule chaque mot
     * @param {string} text
     * @returns {string}
     */
    function capitalizeWords(text) {
        if (!text || typeof text !== 'string') {
            return '';
        }

        return text.split(' ')
            .map(word => capitalize(word))
            .join(' ');
    }

    /**
     * Transforme en slug (URL-friendly)
     * @param {string} text
     * @returns {string}
     */
    function slugify(text) {
        if (!text || typeof text !== 'string') {
            return '';
        }

        return normalize(text)
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    /**
     * Extrait les premiers mots d'un texte
     * @param {string} text
     * @param {number} wordCount - Nombre de mots à extraire
     * @returns {string}
     */
    function excerpt(text, wordCount = 50) {
        if (!text || typeof text !== 'string') {
            return '';
        }

        const words = text.trim().split(/\s+/);

        if (words.length <= wordCount) {
            return text;
        }

        return words.slice(0, wordCount).join(' ') + '...';
    }

    /**
     * Retire les balises HTML d'un texte
     * @param {string} html
     * @returns {string}
     */
    function stripHTML(html) {
        if (!html || typeof html !== 'string') {
            return '';
        }

        const div = document.createElement('div');
        div.innerHTML = html;
        return div.textContent || div.innerText || '';
    }

    /**
     * Remplace les retours à la ligne par des <br>
     * @param {string} text
     * @returns {string}
     */
    function nl2br(text) {
        if (!text || typeof text !== 'string') {
            return '';
        }

        return text.replace(/\n/g, '<br>');
    }

    /**
     * Vérifie si un texte contient un mot/phrase (insensible à la casse)
     * @param {string} text - Texte à analyser
     * @param {string} search - Mot à rechercher
     * @returns {boolean}
     */
    function contains(text, search) {
        if (!text || !search) {
            return false;
        }

        return normalize(text).includes(normalize(search));
    }

    /**
     * Surligne les occurrences d'un mot dans un texte
     * @param {string} text - Texte source
     * @param {string} search - Mot à surligner
     * @param {string} className - Classe CSS pour le surlignage
     * @returns {string}
     */
    function highlight(text, search, className = 'highlight') {
        if (!text || !search) {
            return text;
        }

        const regex = new RegExp(`(${search})`, 'gi');
        return text.replace(regex, `<span class="${className}">$1</span>`);
    }

    /**
     * Calcule un temps de lecture approximatif
     * @param {string} text - Texte à analyser
     * @param {number} wordsPerMinute - Vitesse de lecture (défaut 200)
     * @returns {Object} {minutes, seconds, text}
     */
    function readingTime(text, wordsPerMinute = 200) {
        const words = countWords(text);
        const minutes = Math.floor(words / wordsPerMinute);
        const seconds = Math.round((words % wordsPerMinute) / wordsPerMinute * 60);

        let timeText = '';
        if (minutes > 0) {
            timeText = `${minutes} min`;
            if (seconds > 0) {
                timeText += ` ${seconds} s`;
            }
        } else {
            timeText = `${seconds} s`;
        }

        return {
            minutes,
            seconds,
            text: timeText,
            totalSeconds: minutes * 60 + seconds
        };
    }

    /**
     * Formate un nombre avec séparateurs de milliers
     * @param {number} num
     * @param {string} locale - Locale (défaut fr-FR)
     * @returns {string}
     */
    function formatNumber(num, locale = 'fr-FR') {
        if (num === null || num === undefined) {
            return '0';
        }

        return num.toLocaleString(locale);
    }

    /**
     * Génère un ID unique basé sur un texte
     * @param {string} text
     * @returns {string}
     */
    function generateId(text) {
        const slug = slugify(text);
        const timestamp = Date.now().toString(36);
        return `${slug}-${timestamp}`;
    }

    /**
     * Compare deux textes (sensibilité configurable)
     * @param {string} text1
     * @param {string} text2
     * @param {boolean} caseSensitive - Sensible à la casse
     * @returns {boolean}
     */
    function equals(text1, text2, caseSensitive = false) {
        if (!text1 && !text2) return true;
        if (!text1 || !text2) return false;

        if (caseSensitive) {
            return text1 === text2;
        }

        return normalize(text1) === normalize(text2);
    }

    /**
     * Remplace les variables dans un template
     * @param {string} template - Template avec {{variable}}
     * @param {Object} data - Données à injecter
     * @returns {string}
     */
    function template(template, data) {
        if (!template || typeof template !== 'string') {
            return '';
        }

        return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
            return data.hasOwnProperty(key) ? data[key] : match;
        });
    }

    /**
     * Vérifie si un texte est vide (null, undefined, ou whitespace)
     * @param {string} text
     * @returns {boolean}
     */
    function isEmpty(text) {
        return !text || text.trim() === '';
    }

    /**
     * Nettoie les espaces multiples
     * @param {string} text
     * @returns {string}
     */
    function cleanSpaces(text) {
        if (!text || typeof text !== 'string') {
            return '';
        }

        return text.replace(/\s+/g, ' ').trim();
    }

    // API publique
    return {
        formatWordCount,
        countWords,
        countCharacters,
        countCharactersWithSpaces,
        normalize,
        truncate,
        truncateWords,
        capitalize,
        capitalizeWords,
        slugify,
        excerpt,
        stripHTML,
        nl2br,
        contains,
        highlight,
        readingTime,
        formatNumber,
        generateId,
        equals,
        template,
        isEmpty,
        cleanSpaces
    };
})();

// Exposer globalement
window.TextUtils = TextUtils;
