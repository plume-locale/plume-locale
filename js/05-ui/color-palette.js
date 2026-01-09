/**
 * Color Palette UI
 * Sélecteur de couleurs pour le formatage de texte
 */

const ColorPaletteUI = (() => {
    'use strict';

    // Palette de couleurs complète
    const COLOR_PALETTE = [
        '#000000', '#434343', '#666666', '#999999', '#b7b7b7', '#cccccc', '#d9d9d9', '#efefef',
        '#f3f3f3', '#ffffff', '#980000', '#ff0000', '#ff9900', '#ffff00', '#00ff00', '#00ffff',
        '#4a86e8', '#0000ff', '#9900ff', '#ff00ff', '#e6b8af', '#f4cccc', '#fce5cd', '#fff2cc',
        '#d9ead3', '#d0e0e3', '#c9daf8', '#cfe2f3', '#d9d2e9', '#ead1dc', '#dd7e6b', '#ea9999',
        '#f9cb9c', '#ffe599', '#b6d7a8', '#a2c4c9', '#a4c2f4', '#9fc5e8', '#b4a7d6', '#d5a6bd',
        '#cc4125', '#e06666', '#f6b26b', '#ffd966', '#93c47d', '#76a5af', '#6d9eeb', '#6fa8dc',
        '#8e7cc3', '#c27ba0', '#a61c00', '#cc0000', '#e69138', '#f1c232', '#6aa84f', '#45818e',
        '#3c78d8', '#3d85c6', '#674ea7', '#a64d79', '#85200c', '#990000', '#b45f06', '#bf9000',
        '#38761d', '#134f5c', '#1155cc', '#0b5394', '#351c75', '#741b47', '#5b0f00', '#660000'
    ];

    /**
     * Initialise les grilles de couleurs
     */
    function initializeColorPickers() {
        const textColorGrid = document.getElementById('textColorGrid');
        const bgColorGrid = document.getElementById('backgroundColorGrid');

        // Vérifier que les éléments existent
        if (!textColorGrid || !bgColorGrid) {
            console.log('[ColorPalette] Grilles introuvables, initialisation ignorée');
            return;
        }

        // Vider les grilles existantes
        textColorGrid.innerHTML = '';
        bgColorGrid.innerHTML = '';

        // Créer les swatches de couleur
        COLOR_PALETTE.forEach(color => {
            // Text color swatch
            const textSwatch = document.createElement('div');
            textSwatch.className = 'color-swatch';
            textSwatch.style.backgroundColor = color;
            textSwatch.title = color;
            textSwatch.onclick = () => applyTextColor(color);
            textColorGrid.appendChild(textSwatch);

            // Background color swatch
            const bgSwatch = document.createElement('div');
            bgSwatch.className = 'color-swatch';
            bgSwatch.style.backgroundColor = color;
            bgSwatch.title = color;
            bgSwatch.onclick = () => applyBackgroundColor(color);
            bgColorGrid.appendChild(bgSwatch);
        });

        console.log('[ColorPalette] Palettes initialisées');
    }

    /**
     * Toggle le color picker
     * @param {string} type - Type de couleur ('text' ou 'background')
     * @param {Event} event - Événement de clic
     */
    function toggleColorPicker(type, event) {
        const textPicker = document.getElementById('textColorPicker');
        const bgPicker = document.getElementById('backgroundColorPicker');

        if (!textPicker || !bgPicker) return;

        // Obtenir le bouton cliqué pour positionner la popup
        const button = event ? event.currentTarget : null;

        if (type === 'text') {
            const wasActive = textPicker.classList.contains('active');
            bgPicker.classList.remove('active');

            if (!wasActive && button) {
                const rect = button.getBoundingClientRect();
                textPicker.style.top = (rect.bottom + 5) + 'px';
                textPicker.style.left = rect.left + 'px';
            }
            textPicker.classList.toggle('active');
        } else {
            const wasActive = bgPicker.classList.contains('active');
            textPicker.classList.remove('active');

            if (!wasActive && button) {
                const rect = button.getBoundingClientRect();
                bgPicker.style.top = (rect.bottom + 5) + 'px';
                bgPicker.style.left = rect.left + 'px';
            }
            bgPicker.classList.toggle('active');
        }
    }

    /**
     * Applique une couleur de texte
     * @param {string} color - Couleur au format hexadécimal
     */
    function applyTextColor(color) {
        document.execCommand('foreColor', false, color);

        // Mettre à jour les inputs si disponibles
        const colorInput = document.getElementById('textColorInput');
        const hexInput = document.getElementById('textColorHex');

        if (colorInput) colorInput.value = color;
        if (hexInput) hexInput.value = color.toUpperCase();

        // Focus sur l'éditeur
        const editor = document.querySelector('.editor-textarea');
        if (editor) editor.focus();

        console.log('[ColorPalette] Couleur de texte appliquée:', color);
    }

    /**
     * Applique une couleur de fond
     * @param {string} color - Couleur au format hexadécimal
     */
    function applyBackgroundColor(color) {
        document.execCommand('hiliteColor', false, color);

        // Mettre à jour les inputs si disponibles
        const colorInput = document.getElementById('bgColorInput');
        const hexInput = document.getElementById('bgColorHex');

        if (colorInput) colorInput.value = color;
        if (hexInput) hexInput.value = color.toUpperCase();

        // Focus sur l'éditeur
        const editor = document.querySelector('.editor-textarea');
        if (editor) editor.focus();

        console.log('[ColorPalette] Couleur de fond appliquée:', color);
    }

    /**
     * Ferme tous les color pickers
     */
    function closeAll() {
        document.querySelectorAll('.color-picker-dropdown').forEach(picker => {
            picker.classList.remove('active');
        });
    }

    /**
     * Gère les raccourcis clavier de l'éditeur
     * @param {KeyboardEvent} event - Événement clavier
     */
    function handleEditorKeydown(event) {
        // Handle keyboard shortcuts
        if (event.ctrlKey || event.metaKey) {
            switch(event.key.toLowerCase()) {
                case 'b':
                    event.preventDefault();
                    if (typeof formatText === 'function') formatText('bold');
                    break;
                case 'i':
                    event.preventDefault();
                    if (typeof formatText === 'function') formatText('italic');
                    break;
                case 'u':
                    event.preventDefault();
                    if (typeof formatText === 'function') formatText('underline');
                    break;
            }
        }
    }

    /**
     * Initialise le service de palette de couleurs
     */
    function init() {
        // Initialiser les color pickers
        initializeColorPickers();

        // Fermer les color pickers si on clique à l'extérieur
        document.addEventListener('click', (event) => {
            if (!event.target.closest('.color-picker-wrapper')) {
                closeAll();
            }
        });

        // Ajouter les raccourcis clavier sur l'éditeur
        const editor = document.querySelector('.editor-textarea');
        if (editor) {
            editor.addEventListener('keydown', handleEditorKeydown);
        }

        console.log('[ColorPalette] Service initialisé');
    }

    // API publique
    return {
        init,
        initializeColorPickers,
        toggleColorPicker,
        applyTextColor,
        applyBackgroundColor,
        closeAll,
        handleEditorKeydown
    };
})();

// Exposer globalement pour compatibilité
window.ColorPaletteUI = ColorPaletteUI;
window.colorPalette = [
    '#000000', '#434343', '#666666', '#999999', '#b7b7b7', '#cccccc', '#d9d9d9', '#efefef',
    '#f3f3f3', '#ffffff', '#980000', '#ff0000', '#ff9900', '#ffff00', '#00ff00', '#00ffff',
    '#4a86e8', '#0000ff', '#9900ff', '#ff00ff', '#e6b8af', '#f4cccc', '#fce5cd', '#fff2cc',
    '#d9ead3', '#d0e0e3', '#c9daf8', '#cfe2f3', '#d9d2e9', '#ead1dc', '#dd7e6b', '#ea9999',
    '#f9cb9c', '#ffe599', '#b6d7a8', '#a2c4c9', '#a4c2f4', '#9fc5e8', '#b4a7d6', '#d5a6bd',
    '#cc4125', '#e06666', '#f6b26b', '#ffd966', '#93c47d', '#76a5af', '#6d9eeb', '#6fa8dc',
    '#8e7cc3', '#c27ba0', '#a61c00', '#cc0000', '#e69138', '#f1c232', '#6aa84f', '#45818e',
    '#3c78d8', '#3d85c6', '#674ea7', '#a64d79', '#85200c', '#990000', '#b45f06', '#bf9000',
    '#38761d', '#134f5c', '#1155cc', '#0b5394', '#351c75', '#741b47', '#5b0f00', '#660000'
];
window.initializeColorPickers = () => ColorPaletteUI.initializeColorPickers();
window.toggleColorPicker = (type, event) => ColorPaletteUI.toggleColorPicker(type, event);
window.applyTextColor = (color) => ColorPaletteUI.applyTextColor(color);
window.applyBackgroundColor = (color) => ColorPaletteUI.applyBackgroundColor(color);
window.handleEditorKeydown = (event) => ColorPaletteUI.handleEditorKeydown(event);

// Auto-initialisation
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ColorPaletteUI.init());
} else {
    ColorPaletteUI.init();
}
