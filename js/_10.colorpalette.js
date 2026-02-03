
// Color palette for quick selection
// [MVVM : Model]
// Source de données pour la palette de couleurs
const colorPalette = [
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

// Initialize color pickers
// ============================================
// SIDEBAR RESIZE
// ============================================

// [MVVM : View]
// Gère la logique UI et les événements du redimensionnement de la sidebar
function initSidebarResize() {
    const sidebar = document.querySelector('.sidebar');
    const resizeHandle = document.getElementById('sidebarResizeHandle');
    const appContainer = document.querySelector('.app-container');

    if (!sidebar || !resizeHandle) return;

    let isResizing = false;
    let startX = 0;
    let startWidth = 0;

    resizeHandle.addEventListener('mousedown', (e) => {
        isResizing = true;
        startX = e.clientX;
        startWidth = sidebar.offsetWidth;

        document.body.style.cursor = 'ew-resize';
        document.body.style.userSelect = 'none';

        e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
        if (!isResizing) return;

        const diff = e.clientX - startX;
        const newWidth = startWidth + diff;

        // Respecter min et max width
        if (newWidth >= 200 && newWidth <= 600) {
            sidebar.style.width = newWidth + 'px';
            appContainer.style.gridTemplateColumns = `${newWidth}px 1fr`;
        }
    });

    document.addEventListener('mouseup', () => {
        if (isResizing) {
            isResizing = false;
            document.body.style.cursor = '';
            document.body.style.userSelect = '';

            // Sauvegarder la largeur dans localStorage
            localStorage.setItem('sidebarWidth', sidebar.offsetWidth);
        }
    });

    // Charger la largeur sauvegardée
    const savedWidth = localStorage.getItem('sidebarWidth');
    if (savedWidth) {
        const width = parseInt(savedWidth);
        if (width >= 200 && width <= 600) {
            sidebar.style.width = width + 'px';
            appContainer.style.gridTemplateColumns = `${width}px 1fr`;
        }
    }
}

// [MVVM : View]
// Génère les éléments UI pour les sélecteurs de couleurs
function initializeColorPickers() {
    const textColorGrid = document.getElementById('textColorGrid');
    const bgColorGrid = document.getElementById('backgroundColorGrid');

    // Vérifier que les éléments existent
    if (!textColorGrid || !bgColorGrid) {
        console.log('Color pickers not found in DOM, skipping initialization');
        return;
    }

    colorPalette.forEach(color => {
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
}

// Toggle color picker dropdown
// [MVVM : View]
// Contrôle la visibilité et le positionnement de l'UI du sélecteur de couleur
function toggleColorPicker(type, event) {
    const textPicker = document.getElementById('textColorPicker');
    const bgPicker = document.getElementById('backgroundColorPicker');

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

// Apply text color
// [MVVM : View]
// Met à jour la couleur du texte dans l'éditeur et synchronise les inputs UI
function applyTextColor(color) {
    document.execCommand('foreColor', false, color);
    document.getElementById('textColorInput').value = color;
    document.getElementById('textColorHex').value = color.toUpperCase();
    document.querySelector('.editor-textarea').focus();
}

// Apply background color
// [MVVM : View]
// Met à jour la couleur de fond dans l'éditeur et synchronise les inputs UI
function applyBackgroundColor(color) {
    document.execCommand('hiliteColor', false, color);
    document.getElementById('bgColorInput').value = color;
    document.getElementById('bgColorHex').value = color.toUpperCase();
    document.querySelector('.editor-textarea').focus();
}

// Close color pickers when clicking outside
document.addEventListener('click', function (event) {
    if (!event.target.closest('.color-picker-wrapper')) {
        document.querySelectorAll('.color-picker-dropdown').forEach(picker => {
            picker.classList.remove('active');
        });
    }
});

// [MVVM : View]
// Gère les raccourcis clavier au sein de l'éditeur
function handleEditorKeydown(event) {
    // Handle keyboard shortcuts
    if (event.ctrlKey || event.metaKey) {
        switch (event.key.toLowerCase()) {
            case 'b':
                event.preventDefault();
                formatText('bold');
                break;
            case 'i':
                event.preventDefault();
                formatText('italic');
                break;
            case 'u':
                event.preventDefault();
                formatText('underline');
                break;
        }
    }
}