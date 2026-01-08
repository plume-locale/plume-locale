// ============================================
// VALIDATORS - Utilitaires de validation
// ============================================

/**
 * Validators - Fonctions de validation de données
 *
 * Responsabilités :
 * - Validation de types
 * - Validation de formats
 * - Validation de règles métier
 */

const Validators = (function() {
    'use strict';

    /**
     * Valide qu'une valeur n'est pas vide
     * @param {*} value
     * @returns {boolean}
     */
    function required(value) {
        if (value === null || value === undefined) {
            return false;
        }

        if (typeof value === 'string') {
            return value.trim() !== '';
        }

        if (Array.isArray(value)) {
            return value.length > 0;
        }

        return true;
    }

    /**
     * Valide qu'une string a une longueur minimale
     * @param {string} value
     * @param {number} min
     * @returns {boolean}
     */
    function minLength(value, min) {
        if (!value || typeof value !== 'string') {
            return false;
        }

        return value.length >= min;
    }

    /**
     * Valide qu'une string a une longueur maximale
     * @param {string} value
     * @param {number} max
     * @returns {boolean}
     */
    function maxLength(value, max) {
        if (!value || typeof value !== 'string') {
            return true; // Vide est valide pour maxLength
        }

        return value.length <= max;
    }

    /**
     * Valide qu'un nombre est dans une plage
     * @param {number} value
     * @param {number} min
     * @param {number} max
     * @returns {boolean}
     */
    function between(value, min, max) {
        if (typeof value !== 'number') {
            return false;
        }

        return value >= min && value <= max;
    }

    /**
     * Valide un format email
     * @param {string} email
     * @returns {boolean}
     */
    function email(email) {
        if (!email || typeof email !== 'string') {
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Valide une URL
     * @param {string} url
     * @returns {boolean}
     */
    function url(url) {
        if (!url || typeof url !== 'string') {
            return false;
        }

        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Valide un format de couleur hexadécimale
     * @param {string} hex
     * @returns {boolean}
     */
    function hexColor(hex) {
        if (!hex || typeof hex !== 'string') {
            return false;
        }

        return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
    }

    /**
     * Valide qu'un nombre est positif
     * @param {number} value
     * @returns {boolean}
     */
    function positive(value) {
        return typeof value === 'number' && value > 0;
    }

    /**
     * Valide qu'un nombre est positif ou zéro
     * @param {number} value
     * @returns {boolean}
     */
    function positiveOrZero(value) {
        return typeof value === 'number' && value >= 0;
    }

    /**
     * Valide qu'un nombre est un entier
     * @param {number} value
     * @returns {boolean}
     */
    function integer(value) {
        return typeof value === 'number' && Number.isInteger(value);
    }

    /**
     * Valide qu'une valeur correspond à une expression régulière
     * @param {string} value
     * @param {RegExp} regex
     * @returns {boolean}
     */
    function pattern(value, regex) {
        if (!value || typeof value !== 'string') {
            return false;
        }

        return regex.test(value);
    }

    /**
     * Valide qu'une date est valide
     * @param {Date|string|number} date
     * @returns {boolean}
     */
    function validDate(date) {
        const d = date instanceof Date ? date : new Date(date);
        return !isNaN(d.getTime());
    }

    /**
     * Valide qu'une date est dans le futur
     * @param {Date|string|number} date
     * @returns {boolean}
     */
    function futureDate(date) {
        if (!validDate(date)) {
            return false;
        }

        const d = date instanceof Date ? date : new Date(date);
        return d.getTime() > Date.now();
    }

    /**
     * Valide qu'une date est dans le passé
     * @param {Date|string|number} date
     * @returns {boolean}
     */
    function pastDate(date) {
        if (!validDate(date)) {
            return false;
        }

        const d = date instanceof Date ? date : new Date(date);
        return d.getTime() < Date.now();
    }

    /**
     * Valide un nom de personnage
     * @param {string} name
     * @returns {Object} {valid: boolean, error: string}
     */
    function characterName(name) {
        if (!required(name)) {
            return { valid: false, error: 'Le nom est requis' };
        }

        if (!minLength(name, 1)) {
            return { valid: false, error: 'Le nom doit contenir au moins 1 caractère' };
        }

        if (!maxLength(name, 100)) {
            return { valid: false, error: 'Le nom ne peut pas dépasser 100 caractères' };
        }

        return { valid: true, error: null };
    }

    /**
     * Valide un titre de scène
     * @param {string} title
     * @returns {Object} {valid: boolean, error: string}
     */
    function sceneTitle(title) {
        if (!required(title)) {
            return { valid: false, error: 'Le titre est requis' };
        }

        if (!minLength(title, 1)) {
            return { valid: false, error: 'Le titre doit contenir au moins 1 caractère' };
        }

        if (!maxLength(title, 200)) {
            return { valid: false, error: 'Le titre ne peut pas dépasser 200 caractères' };
        }

        return { valid: true, error: null };
    }

    /**
     * Valide un nom de projet
     * @param {string} name
     * @returns {Object} {valid: boolean, error: string}
     */
    function projectName(name) {
        if (!required(name)) {
            return { valid: false, error: 'Le nom du projet est requis' };
        }

        if (!minLength(name, 3)) {
            return { valid: false, error: 'Le nom doit contenir au moins 3 caractères' };
        }

        if (!maxLength(name, 100)) {
            return { valid: false, error: 'Le nom ne peut pas dépasser 100 caractères' };
        }

        return { valid: true, error: null };
    }

    /**
     * Valide un objet selon un schéma
     * @param {Object} data - Données à valider
     * @param {Object} schema - Schéma de validation
     * @returns {Object} {valid: boolean, errors: Object}
     *
     * Exemple de schéma :
     * {
     *   name: { required: true, minLength: 3 },
     *   email: { email: true },
     *   age: { positive: true, integer: true }
     * }
     */
    function validate(data, schema) {
        const errors = {};
        let valid = true;

        for (const [field, rules] of Object.entries(schema)) {
            const value = data[field];

            if (rules.required && !required(value)) {
                errors[field] = 'Ce champ est requis';
                valid = false;
                continue;
            }

            if (rules.minLength && !minLength(value, rules.minLength)) {
                errors[field] = `Minimum ${rules.minLength} caractères`;
                valid = false;
            }

            if (rules.maxLength && !maxLength(value, rules.maxLength)) {
                errors[field] = `Maximum ${rules.maxLength} caractères`;
                valid = false;
            }

            if (rules.email && !email(value)) {
                errors[field] = 'Email invalide';
                valid = false;
            }

            if (rules.url && !url(value)) {
                errors[field] = 'URL invalide';
                valid = false;
            }

            if (rules.hexColor && !hexColor(value)) {
                errors[field] = 'Couleur hexadécimale invalide';
                valid = false;
            }

            if (rules.positive && !positive(value)) {
                errors[field] = 'Doit être un nombre positif';
                valid = false;
            }

            if (rules.integer && !integer(value)) {
                errors[field] = 'Doit être un nombre entier';
                valid = false;
            }

            if (rules.between && !between(value, rules.between[0], rules.between[1])) {
                errors[field] = `Doit être entre ${rules.between[0]} et ${rules.between[1]}`;
                valid = false;
            }

            if (rules.custom && typeof rules.custom === 'function') {
                const result = rules.custom(value);
                if (!result.valid) {
                    errors[field] = result.error;
                    valid = false;
                }
            }
        }

        return { valid, errors };
    }

    // API publique
    return {
        required,
        minLength,
        maxLength,
        between,
        email,
        url,
        hexColor,
        positive,
        positiveOrZero,
        integer,
        pattern,
        validDate,
        futureDate,
        pastDate,
        characterName,
        sceneTitle,
        projectName,
        validate
    };
})();

// Exposer globalement
window.Validators = Validators;
