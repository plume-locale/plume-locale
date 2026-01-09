/**
 * Theme Service
 * Gestion des thèmes visuels de l'application
 */

const ThemeService = (() => {
    'use strict';

    const DEFAULT_VARIABLES = {
        '--bg-primary': '#faf9f6',
        '--bg-secondary': '#f5f3ed',
        '--bg-accent': '#2a2622',
        '--text-primary': '#2a2622',
        '--text-secondary': '#5a5550',
        '--text-muted': '#5a5550',
        '--border-color': '#d4cfc5',
        '--primary-color': '#d4af37',
        '--accent-gold': '#d4af37'
    };

    const PRESET_THEMES = {
        'Classique': DEFAULT_VARIABLES,
        'Sombre': {
            '--bg-primary': '#1a1a1a',
            '--bg-secondary': '#252525',
            '--text-primary': '#e8e6e3',
            '--primary-color': '#ffd700'
        },
        'Océan': {
            '--bg-primary': '#e8f4f8',
            '--bg-secondary': '#d0e8f0',
            '--text-primary': '#1e3a52',
            '--primary-color': '#3498db'
        }
    };

    let currentTheme = null;
    let customThemes = [];

    function init() {
        loadCustomThemes();
        loadCurrentTheme();
    }

    function applyTheme(colors) {
        const root = document.documentElement;
        Object.entries(colors).forEach(([variable, value]) => {
            root.style.setProperty(variable, value);
        });
        currentTheme = colors;
        saveCurrentTheme();
        
        if (window.EventBus) EventBus.emit('theme:changed', colors);
    }

    function saveCurrentTheme() {
        localStorage.setItem('plume-current-theme', JSON.stringify(currentTheme));
    }

    function loadCurrentTheme() {
        const saved = localStorage.getItem('plume-current-theme');
        if (saved) {
            try {
                currentTheme = JSON.parse(saved);
                applyTheme(currentTheme);
            } catch (e) {
                console.error('[Theme] Erreur chargement:', e);
            }
        }
    }

    function saveCustomThemes() {
        localStorage.setItem('plume-custom-themes', JSON.stringify(customThemes));
    }

    function loadCustomThemes() {
        const saved = localStorage.getItem('plume-custom-themes');
        if (saved) {
            try {
                customThemes = JSON.parse(saved);
            } catch (e) {
                console.error('[Theme] Erreur custom themes:', e);
            }
        }
    }

    function addCustomTheme(name, colors) {
        customThemes.push({ name, colors });
        saveCustomThemes();
    }

    function deleteCustomTheme(name) {
        customThemes = customThemes.filter(t => t.name !== name);
        saveCustomThemes();
    }

    function exportTheme(colors, name) {
        const theme = { name, colors, version: '1.0' };
        const json = JSON.stringify(theme, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'theme-' + name.toLowerCase().replace(/\s+/g, '-') + '.json';
        a.click();
        URL.revokeObjectURL(url);
    }

    return {
        DEFAULT_VARIABLES,
        PRESET_THEMES,
        init,
        applyTheme,
        addCustomTheme,
        deleteCustomTheme,
        exportTheme,
        getCurrentTheme: () => currentTheme,
        getCustomThemes: () => customThemes
    };
})();

window.ThemeService = ThemeService;
window.themeManager = {
    init: () => ThemeService.init(),
    applyTheme: (colors) => ThemeService.applyTheme(colors),
    presetThemes: ThemeService.PRESET_THEMES
};

console.log('[Theme] Service initialisé');
