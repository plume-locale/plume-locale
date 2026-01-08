// ============================================
// COLOR UTILS - Utilitaires de manipulation de couleurs
// ============================================

/**
 * ColorUtils - Helpers pour la manipulation de couleurs
 *
 * Responsabilités :
 * - Conversion entre formats (hex, rgb, hsl)
 * - Ajustement de luminosité et saturation
 * - Génération de palettes
 * - Calcul de contraste
 */

const ColorUtils = (function() {
    'use strict';

    /**
     * Convertit hex en RGB
     * @param {string} hex - Couleur hexadécimale (#RGB ou #RRGGBB)
     * @returns {Object} {r, g, b}
     */
    function hexToRgb(hex) {
        const cleaned = hex.replace('#', '');

        let r, g, b;
        if (cleaned.length === 3) {
            r = parseInt(cleaned[0] + cleaned[0], 16);
            g = parseInt(cleaned[1] + cleaned[1], 16);
            b = parseInt(cleaned[2] + cleaned[2], 16);
        } else {
            r = parseInt(cleaned.substring(0, 2), 16);
            g = parseInt(cleaned.substring(2, 4), 16);
            b = parseInt(cleaned.substring(4, 6), 16);
        }

        return { r, g, b };
    }

    /**
     * Convertit RGB en hex
     * @param {number} r - Rouge (0-255)
     * @param {number} g - Vert (0-255)
     * @param {number} b - Bleu (0-255)
     * @returns {string}
     */
    function rgbToHex(r, g, b) {
        const toHex = (value) => {
            const hex = Math.round(value).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        };

        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }

    /**
     * Convertit RGB en HSL
     * @param {number} r - Rouge (0-255)
     * @param {number} g - Vert (0-255)
     * @param {number} b - Bleu (0-255)
     * @returns {Object} {h, s, l}
     */
    function rgbToHsl(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0; // achromatic
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

            switch (max) {
                case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
                case g: h = ((b - r) / d + 2) / 6; break;
                case b: h = ((r - g) / d + 4) / 6; break;
            }
        }

        return {
            h: Math.round(h * 360),
            s: Math.round(s * 100),
            l: Math.round(l * 100)
        };
    }

    /**
     * Convertit HSL en RGB
     * @param {number} h - Teinte (0-360)
     * @param {number} s - Saturation (0-100)
     * @param {number} l - Luminosité (0-100)
     * @returns {Object} {r, g, b}
     */
    function hslToRgb(h, s, l) {
        h = h / 360;
        s = s / 100;
        l = l / 100;

        let r, g, b;

        if (s === 0) {
            r = g = b = l; // achromatic
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };

            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;

            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }

        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255)
        };
    }

    /**
     * Éclaircit une couleur
     * @param {string} hex - Couleur hexadécimale
     * @param {number} amount - Pourcentage (0-100)
     * @returns {string} Couleur hexadécimale
     */
    function lighten(hex, amount) {
        const rgb = hexToRgb(hex);
        const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

        hsl.l = Math.min(100, hsl.l + amount);

        const newRgb = hslToRgb(hsl.h, hsl.s, hsl.l);
        return rgbToHex(newRgb.r, newRgb.g, newRgb.b);
    }

    /**
     * Assombrit une couleur
     * @param {string} hex - Couleur hexadécimale
     * @param {number} amount - Pourcentage (0-100)
     * @returns {string} Couleur hexadécimale
     */
    function darken(hex, amount) {
        const rgb = hexToRgb(hex);
        const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

        hsl.l = Math.max(0, hsl.l - amount);

        const newRgb = hslToRgb(hsl.h, hsl.s, hsl.l);
        return rgbToHex(newRgb.r, newRgb.g, newRgb.b);
    }

    /**
     * Ajuste la saturation d'une couleur
     * @param {string} hex - Couleur hexadécimale
     * @param {number} amount - Pourcentage (-100 à +100)
     * @returns {string}
     */
    function saturate(hex, amount) {
        const rgb = hexToRgb(hex);
        const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

        hsl.s = Math.max(0, Math.min(100, hsl.s + amount));

        const newRgb = hslToRgb(hsl.h, hsl.s, hsl.l);
        return rgbToHex(newRgb.r, newRgb.g, newRgb.b);
    }

    /**
     * Calcule la luminosité d'une couleur (0-1)
     * @param {string} hex - Couleur hexadécimale
     * @returns {number}
     */
    function luminance(hex) {
        const rgb = hexToRgb(hex);

        const r = rgb.r / 255;
        const g = rgb.g / 255;
        const b = rgb.b / 255;

        const rL = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
        const gL = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
        const bL = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);

        return 0.2126 * rL + 0.7152 * gL + 0.0722 * bL;
    }

    /**
     * Calcule le contraste entre deux couleurs
     * @param {string} hex1
     * @param {string} hex2
     * @returns {number} Ratio de contraste (1-21)
     */
    function contrast(hex1, hex2) {
        const lum1 = luminance(hex1);
        const lum2 = luminance(hex2);

        const lighter = Math.max(lum1, lum2);
        const darker = Math.min(lum1, lum2);

        return (lighter + 0.05) / (darker + 0.05);
    }

    /**
     * Détermine si une couleur est claire ou foncée
     * @param {string} hex
     * @returns {string} 'light' ou 'dark'
     */
    function getBrightness(hex) {
        return luminance(hex) > 0.5 ? 'light' : 'dark';
    }

    /**
     * Retourne la meilleure couleur de texte (blanc ou noir) pour un fond
     * @param {string} bgColor - Couleur de fond
     * @returns {string} '#000000' ou '#ffffff'
     */
    function getTextColor(bgColor) {
        return luminance(bgColor) > 0.5 ? '#000000' : '#ffffff';
    }

    /**
     * Génère une couleur aléatoire
     * @returns {string} Couleur hexadécimale
     */
    function random() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    /**
     * Génère une palette de couleurs complémentaires
     * @param {string} hex - Couleur de base
     * @returns {Array<string>} Tableau de couleurs
     */
    function generatePalette(hex) {
        const rgb = hexToRgb(hex);
        const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

        const palette = [
            hex, // Original
            rgbToHex(...Object.values(hslToRgb((hsl.h + 120) % 360, hsl.s, hsl.l))), // Triadique 1
            rgbToHex(...Object.values(hslToRgb((hsl.h + 240) % 360, hsl.s, hsl.l))), // Triadique 2
            lighten(hex, 20), // Plus clair
            darken(hex, 20)   // Plus foncé
        ];

        return palette;
    }

    /**
     * Valide un format hexadécimal
     * @param {string} hex
     * @returns {boolean}
     */
    function isValidHex(hex) {
        return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
    }

    /**
     * Convertit une couleur en format CSS
     * @param {string} hex
     * @param {number} alpha - Opacité (0-1)
     * @returns {string}
     */
    function toCss(hex, alpha = 1) {
        const rgb = hexToRgb(hex);

        if (alpha < 1) {
            return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
        }

        return hex;
    }

    // API publique
    return {
        hexToRgb,
        rgbToHex,
        rgbToHsl,
        hslToRgb,
        lighten,
        darken,
        saturate,
        luminance,
        contrast,
        getBrightness,
        getTextColor,
        random,
        generatePalette,
        isValidHex,
        toCss
    };
})();

// Exposer globalement
window.ColorUtils = ColorUtils;
