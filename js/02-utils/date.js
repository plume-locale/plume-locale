// ============================================
// DATE UTILS - Utilitaires de manipulation de dates
// ============================================

/**
 * DateUtils - Helpers pour le formatage et la manipulation de dates
 *
 * Responsabilités :
 * - Formatage de dates
 * - Calculs sur les dates
 * - Dates relatives ("il y a 2 heures")
 */

const DateUtils = (function() {
    'use strict';

    /**
     * Formate une date
     * @param {Date|number} date - Date ou timestamp
     * @param {string} format - Format désiré ('short', 'long', 'full', 'time')
     * @returns {string}
     */
    function format(date, format = 'short') {
        if (!date) return '';

        const d = date instanceof Date ? date : new Date(date);

        if (isNaN(d.getTime())) return '';

        const options = {
            short: { day: '2-digit', month: '2-digit', year: 'numeric' },
            long: { day: 'numeric', month: 'long', year: 'numeric' },
            full: { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' },
            time: { hour: '2-digit', minute: '2-digit' },
            datetime: { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }
        };

        return d.toLocaleDateString('fr-FR', options[format] || options.short);
    }

    /**
     * Formate une date de manière relative ("il y a 2 heures")
     * @param {Date|number} date - Date ou timestamp
     * @returns {string}
     */
    function relative(date) {
        if (!date) return '';

        const d = date instanceof Date ? date : new Date(date);
        const now = new Date();
        const diffMs = now - d;
        const diffSec = Math.floor(diffMs / 1000);
        const diffMin = Math.floor(diffSec / 60);
        const diffHour = Math.floor(diffMin / 60);
        const diffDay = Math.floor(diffHour / 24);
        const diffWeek = Math.floor(diffDay / 7);
        const diffMonth = Math.floor(diffDay / 30);
        const diffYear = Math.floor(diffDay / 365);

        if (diffSec < 60) {
            return 'à l\'instant';
        } else if (diffMin < 60) {
            return `il y a ${diffMin} minute${diffMin > 1 ? 's' : ''}`;
        } else if (diffHour < 24) {
            return `il y a ${diffHour} heure${diffHour > 1 ? 's' : ''}`;
        } else if (diffDay < 7) {
            return `il y a ${diffDay} jour${diffDay > 1 ? 's' : ''}`;
        } else if (diffWeek < 4) {
            return `il y a ${diffWeek} semaine${diffWeek > 1 ? 's' : ''}`;
        } else if (diffMonth < 12) {
            return `il y a ${diffMonth} mois`;
        } else {
            return `il y a ${diffYear} an${diffYear > 1 ? 's' : ''}`;
        }
    }

    /**
     * Vérifie si une date est aujourd'hui
     * @param {Date|number} date
     * @returns {boolean}
     */
    function isToday(date) {
        if (!date) return false;

        const d = date instanceof Date ? date : new Date(date);
        const today = new Date();

        return d.getDate() === today.getDate() &&
               d.getMonth() === today.getMonth() &&
               d.getFullYear() === today.getFullYear();
    }

    /**
     * Vérifie si une date est hier
     * @param {Date|number} date
     * @returns {boolean}
     */
    function isYesterday(date) {
        if (!date) return false;

        const d = date instanceof Date ? date : new Date(date);
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        return d.getDate() === yesterday.getDate() &&
               d.getMonth() === yesterday.getMonth() &&
               d.getFullYear() === yesterday.getFullYear();
    }

    /**
     * Ajoute des jours à une date
     * @param {Date|number} date
     * @param {number} days - Nombre de jours (peut être négatif)
     * @returns {Date}
     */
    function addDays(date, days) {
        const d = date instanceof Date ? new Date(date) : new Date(date);
        d.setDate(d.getDate() + days);
        return d;
    }

    /**
     * Ajoute des mois à une date
     * @param {Date|number} date
     * @param {number} months
     * @returns {Date}
     */
    function addMonths(date, months) {
        const d = date instanceof Date ? new Date(date) : new Date(date);
        d.setMonth(d.getMonth() + months);
        return d;
    }

    /**
     * Calcule la différence en jours entre deux dates
     * @param {Date|number} date1
     * @param {Date|number} date2
     * @returns {number}
     */
    function diffInDays(date1, date2) {
        const d1 = date1 instanceof Date ? date1 : new Date(date1);
        const d2 = date2 instanceof Date ? date2 : new Date(date2);

        const diffMs = Math.abs(d2 - d1);
        return Math.floor(diffMs / (1000 * 60 * 60 * 24));
    }

    /**
     * Début de la journée (minuit)
     * @param {Date|number} date
     * @returns {Date}
     */
    function startOfDay(date) {
        const d = date instanceof Date ? new Date(date) : new Date(date);
        d.setHours(0, 0, 0, 0);
        return d;
    }

    /**
     * Fin de la journée (23:59:59)
     * @param {Date|number} date
     * @returns {Date}
     */
    function endOfDay(date) {
        const d = date instanceof Date ? new Date(date) : new Date(date);
        d.setHours(23, 59, 59, 999);
        return d;
    }

    /**
     * Génère un timestamp
     * @returns {number}
     */
    function now() {
        return Date.now();
    }

    /**
     * Parse une date depuis un string ISO
     * @param {string} isoString
     * @returns {Date|null}
     */
    function parse(isoString) {
        if (!isoString) return null;

        const date = new Date(isoString);
        return isNaN(date.getTime()) ? null : date;
    }

    // API publique
    return {
        format,
        relative,
        isToday,
        isYesterday,
        addDays,
        addMonths,
        diffInDays,
        startOfDay,
        endOfDay,
        now,
        parse
    };
})();

// Exposer globalement
window.DateUtils = DateUtils;
