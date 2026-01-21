// ============================================
// Module: ui/theme-manager
// Généré automatiquement - Plume Writer
// ============================================

// ===================================
// SYSTÈME DE GESTION DES THÈMES
// ===================================

// Utilitaire : convertir rgba/rgb/hex en hex
// [MVVM : Modèle]
// Utilitaire de conversion de couleur pour le stockage et le traitement des données de thème.
function rgbaToHex(color) {
    if (!color) return '#000000';

    // Si c'est déjà un hex
    if (color.startsWith('#')) {
        return color.length === 7 ? color : color + 'FF';
    }

    // Si c'est rgba ou rgb
    const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (match) {
        const r = parseInt(match[1]);
        const g = parseInt(match[2]);
        const b = parseInt(match[3]);
        return '#' + [r, g, b].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    }

    return '#000000';
}

const themeManager = {
    currentTheme: null,
    customThemes: [],

    defaultVariables: {
        '--bg-primary': '#faf9f6',
        '--bg-secondary': '#f5f3ed',
        '--bg-accent': '#2a2622',
        '--text-primary': '#2a2622',
        '--text-secondary': '#5a5550',
        '--text-muted': '#5a5550', // CORRECTION : Amélioration du contraste (était #8a847d)
        '--border-color': '#d4cfc5',
        '--primary-color': '#d4af37',
        '--primary-hover': '#b8941f',
        '--accent-red': '#c44536',
        '--accent-gold': '#d4af37',
        '--highlight-yellow': 'rgba(255, 235, 59, 0.4)',
        '--highlight-green': 'rgba(76, 175, 80, 0.3)',
        '--highlight-blue': 'rgba(33, 150, 243, 0.3)',
        '--highlight-red': 'rgba(244, 67, 54, 0.3)',
        '--highlight-purple': 'rgba(156, 39, 176, 0.3)'
    },

    presetThemes: {
        'Classique': {
            '--bg-primary': '#faf9f6',
            '--bg-secondary': '#f5f3ed',
            '--bg-accent': '#2a2622',
            '--text-primary': '#2a2622',
            '--text-secondary': '#5a5550',
            '--text-muted': '#5a5550', // CORRECTION
            '--border-color': '#d4cfc5',
            '--primary-color': '#d4af37',
            '--primary-hover': '#b8941f',
            '--accent-red': '#c44536',
            '--accent-gold': '#d4af37',
            '--highlight-yellow': 'rgba(255, 235, 59, 0.4)',
            '--highlight-green': 'rgba(76, 175, 80, 0.3)',
            '--highlight-blue': 'rgba(33, 150, 243, 0.3)',
            '--highlight-red': 'rgba(244, 67, 54, 0.3)',
            '--highlight-purple': 'rgba(156, 39, 176, 0.3)'
        },
        'Sombre': {
            '--bg-primary': '#1a1a1a',
            '--bg-secondary': '#252525',
            '--bg-accent': '#f5f3ed',
            '--text-primary': '#e8e6e3',
            '--text-secondary': '#b8b6b3',
            '--text-muted': '#888683',
            '--border-color': '#3a3a3a',
            '--primary-color': '#ffd700',
            '--primary-hover': '#ffed4e',
            '--accent-red': '#ff6b5a',
            '--accent-gold': '#ffd700',
            '--highlight-yellow': 'rgba(255, 235, 59, 0.3)',
            '--highlight-green': 'rgba(76, 175, 80, 0.25)',
            '--highlight-blue': 'rgba(33, 150, 243, 0.25)',
            '--highlight-red': 'rgba(244, 67, 54, 0.25)',
            '--highlight-purple': 'rgba(156, 39, 176, 0.25)'
        },
        'Océan': {
            '--bg-primary': '#e8f4f8',
            '--bg-secondary': '#d0e8f0',
            '--bg-accent': '#1e3a52',
            '--text-primary': '#1e3a52',
            '--text-secondary': '#2a5270',
            '--text-muted': '#2a5270', // CORRECTION (était #5a7a90)
            '--border-color': '#a8c8d8',
            '--primary-color': '#3498db',
            '--primary-hover': '#2980b9',
            '--accent-red': '#c84a4a',
            '--accent-gold': '#3498db',
            '--highlight-yellow': 'rgba(255, 235, 59, 0.3)',
            '--highlight-green': 'rgba(46, 204, 113, 0.3)',
            '--highlight-blue': 'rgba(52, 152, 219, 0.4)',
            '--highlight-red': 'rgba(231, 76, 60, 0.3)',
            '--highlight-purple': 'rgba(155, 89, 182, 0.3)'
        },
        'Forêt': {
            '--bg-primary': '#f0f4ed',
            '--bg-secondary': '#e1e8dc',
            '--bg-accent': '#2d3e2d',
            '--text-primary': '#2d3e2d',
            '--text-secondary': '#4a5e4a',
            '--text-muted': '#4a5e4a', // CORRECTION (était #7a8a7a)
            '--border-color': '#c1d0bb',
            '--primary-color': '#6b8e23',
            '--primary-hover': '#557a1c',
            '--accent-red': '#c44536',
            '--accent-gold': '#6b8e23',
            '--highlight-yellow': 'rgba(255, 235, 59, 0.3)',
            '--highlight-green': 'rgba(107, 142, 35, 0.4)',
            '--highlight-blue': 'rgba(70, 130, 180, 0.3)',
            '--highlight-red': 'rgba(178, 34, 34, 0.3)',
            '--highlight-purple': 'rgba(147, 112, 219, 0.3)'
        },
        'Crépuscule': {
            '--bg-primary': '#2b2d42',
            '--bg-secondary': '#3a3d54',
            '--bg-accent': '#edf2f4',
            '--text-primary': '#edf2f4',
            '--text-secondary': '#c5cad4',
            '--text-muted': '#8d99ae',
            '--border-color': '#4a4d64',
            '--primary-color': '#ffd166',
            '--primary-hover': '#ffbe3d',
            '--accent-red': '#ef476f',
            '--accent-gold': '#ffd166',
            '--highlight-yellow': 'rgba(255, 209, 102, 0.3)',
            '--highlight-green': 'rgba(6, 214, 160, 0.3)',
            '--highlight-blue': 'rgba(118, 171, 174, 0.3)',
            '--highlight-red': 'rgba(239, 71, 111, 0.3)',
            '--highlight-purple': 'rgba(177, 98, 134, 0.3)'
        },
        'Sépia': {
            '--bg-primary': '#f4ecd8',
            '--bg-secondary': '#e8dcc4',
            '--bg-accent': '#3e2723',
            '--text-primary': '#3e2723',
            '--text-secondary': '#5d4037',
            '--text-muted': '#5d4037', // CORRECTION (était #8d6e63)
            '--border-color': '#d7cdb8',
            '--primary-color': '#a1887f',
            '--primary-hover': '#8d6e63',
            '--accent-red': '#bf360c',
            '--accent-gold': '#a1887f',
            '--highlight-yellow': 'rgba(255, 224, 130, 0.4)',
            '--highlight-green': 'rgba(139, 195, 74, 0.3)',
            '--highlight-blue': 'rgba(121, 134, 203, 0.3)',
            '--highlight-red': 'rgba(191, 54, 12, 0.3)',
            '--highlight-purple': 'rgba(142, 110, 99, 0.3)'
        },
        'Minuit': {
            '--bg-primary': '#0d1b2a',
            '--bg-secondary': '#1b263b',
            '--bg-accent': '#e0e1dd',
            '--text-primary': '#e0e1dd',
            '--text-secondary': '#c0c2be',
            '--text-muted': '#778da9',
            '--border-color': '#2b3a4f',
            '--primary-color': '#457b9d',
            '--primary-hover': '#5a92b5',
            '--accent-red': '#e63946',
            '--accent-gold': '#f1faee',
            '--highlight-yellow': 'rgba(241, 250, 238, 0.2)',
            '--highlight-green': 'rgba(168, 218, 220, 0.2)',
            '--highlight-blue': 'rgba(69, 123, 157, 0.3)',
            '--highlight-red': 'rgba(230, 57, 70, 0.3)',
            '--highlight-purple': 'rgba(163, 177, 138, 0.2)'
        },
        'Pastel': {
            '--bg-primary': '#fff5f7',
            '--bg-secondary': '#ffe8ec',
            '--bg-accent': '#4a4a4a',
            '--text-primary': '#2a2a2a',
            '--text-secondary': '#5a5a5a',
            '--text-muted': '#5a5a5a', // CORRECTION (était #8a8a8a)
            '--border-color': '#ffd4dc',
            '--primary-color': '#ff6b9d',
            '--primary-hover': '#ff5285',
            '--accent-red': '#ff6b9d',
            '--accent-gold': '#c9ada7',
            '--highlight-yellow': 'rgba(255, 223, 186, 0.5)',
            '--highlight-green': 'rgba(186, 220, 180, 0.5)',
            '--highlight-blue': 'rgba(173, 216, 230, 0.5)',
            '--highlight-red': 'rgba(255, 182, 193, 0.5)',
            '--highlight-purple': 'rgba(221, 160, 221, 0.5)'
        },
        // ===================================
        // NOUVEAUX THÈMES AJOUTÉS
        // ===================================
        'Cyberpunk': {
            '--bg-primary': '#0b0c15',
            '--bg-secondary': '#161829',
            '--bg-accent': '#2a2d45',
            '--text-primary': '#00f3ff',
            '--text-secondary': '#b300ff',
            '--text-muted': '#565c8d',
            '--border-color': '#2a2d45',
            '--primary-color': '#00f3ff',
            '--primary-hover': '#00bbcc',
            '--accent-red': '#ff0055',
            '--accent-gold': '#ffee00',
            '--highlight-yellow': 'rgba(255, 238, 0, 0.25)',
            '--highlight-green': 'rgba(0, 243, 255, 0.2)',
            '--highlight-blue': 'rgba(0, 85, 255, 0.3)',
            '--highlight-red': 'rgba(255, 0, 85, 0.3)',
            '--highlight-purple': 'rgba(179, 0, 255, 0.3)'
        },
        'Café': {
            '--bg-primary': '#f5ebe0',
            '--bg-secondary': '#e3d5ca',
            '--bg-accent': '#d5bdaf',
            '--text-primary': '#4a3b32',
            '--text-secondary': '#8d7966',
            '--text-muted': '#8d7966', // Applique aussi la correction ici
            '--border-color': '#d6ccc2',
            '--primary-color': '#d5bdaf',
            '--primary-hover': '#c7a998',
            '--accent-red': '#bc6c25',
            '--accent-gold': '#dda15e',
            '--highlight-yellow': 'rgba(221, 161, 94, 0.3)',
            '--highlight-green': 'rgba(96, 108, 56, 0.3)',
            '--highlight-blue': 'rgba(100, 149, 237, 0.3)',
            '--highlight-red': 'rgba(188, 108, 37, 0.3)',
            '--highlight-purple': 'rgba(156, 102, 68, 0.3)'
        },
        'Nordique': {
            '--bg-primary': '#2e3440',
            '--bg-secondary': '#3b4252',
            '--bg-accent': '#434c5e',
            '--text-primary': '#eceff4',
            '--text-secondary': '#d8dee9',
            '--text-muted': '#6c7a96',
            '--border-color': '#4c566a',
            '--primary-color': '#88c0d0',
            '--primary-hover': '#81a1c1',
            '--accent-red': '#bf616a',
            '--accent-gold': '#ebcb8b',
            '--highlight-yellow': 'rgba(235, 203, 139, 0.25)',
            '--highlight-green': 'rgba(163, 190, 140, 0.25)',
            '--highlight-blue': 'rgba(136, 192, 208, 0.25)',
            '--highlight-red': 'rgba(191, 97, 106, 0.25)',
            '--highlight-purple': 'rgba(180, 142, 173, 0.25)'
        },
        'Terminal': {
            '--bg-primary': '#000000',
            '--bg-secondary': '#0c0c0c',
            '--bg-accent': '#1a1a1a',
            '--text-primary': '#33ff00',
            '--text-secondary': '#24b300',
            '--text-muted': '#156600',
            '--border-color': '#333333',
            '--primary-color': '#33ff00',
            '--primary-hover': '#2bd900',
            '--accent-red': '#ff3333',
            '--accent-gold': '#ffff33',
            '--highlight-yellow': 'rgba(255, 255, 51, 0.2)',
            '--highlight-green': 'rgba(51, 255, 0, 0.2)',
            '--highlight-blue': 'rgba(0, 204, 255, 0.2)',
            '--highlight-red': 'rgba(255, 51, 51, 0.2)',
            '--highlight-purple': 'rgba(204, 51, 255, 0.2)'
        },
        'Sakura': {
            '--bg-primary': '#fff0f5',
            '--bg-secondary': '#ffe6ea',
            '--bg-accent': '#ffc0cb',
            '--text-primary': '#594a4e',
            '--text-secondary': '#8c7b7f',
            '--text-muted': '#8c7b7f', // Applique aussi la correction ici (était #bdacb0)
            '--border-color': '#fadadd',
            '--primary-color': '#ff69b4',
            '--primary-hover': '#ff1493',
            '--accent-red': '#db7093',
            '--accent-gold': '#ffb6c1',
            '--highlight-yellow': 'rgba(255, 250, 205, 0.5)',
            '--highlight-green': 'rgba(152, 251, 152, 0.4)',
            '--highlight-blue': 'rgba(176, 224, 230, 0.5)',
            '--highlight-red': 'rgba(255, 182, 193, 0.5)',
            '--highlight-purple': 'rgba(221, 160, 221, 0.4)'
        },
        'Luxe': {
            '--bg-primary': '#050505',
            '--bg-secondary': '#111111',
            '--bg-accent': '#1a1a1a',
            '--text-primary': '#e0e0e0',
            '--text-secondary': '#a0a0a0',
            '--text-muted': '#505050',
            '--border-color': '#333333',
            '--primary-color': '#cfb53b',
            '--primary-hover': '#e6c94c',
            '--accent-red': '#800020',
            '--accent-gold': '#cfb53b',
            '--highlight-yellow': 'rgba(207, 181, 59, 0.25)',
            '--highlight-green': 'rgba(85, 107, 47, 0.3)',
            '--highlight-blue': 'rgba(70, 130, 180, 0.3)',
            '--highlight-red': 'rgba(139, 0, 0, 0.3)',
            '--highlight-purple': 'rgba(75, 0, 130, 0.3)'
        }
    },

    // [MVVM : ViewModel]
    // Initialise le gestionnaire de thèmes en chargeant les données persistantes.
    init() {
        this.loadCustomThemes();
        this.loadCurrentTheme();
    },

    // [MVVM : Mixte]
    // Applique les couleurs d'un thème au document (Vue) et met à jour l'état interne (Modèle).
    applyTheme(colors) {
        const root = document.documentElement;
        Object.entries(colors).forEach(([variable, value]) => {
            root.style.setProperty(variable, value);
        });
        this.currentTheme = colors;
        this.saveCurrentTheme();
    },

    // [MVVM : Modèle]
    // Sauvegarde le thème actuel dans le stockage local (Persistance).
    saveCurrentTheme() {
        localStorage.setItem('plume_locale-current-theme', JSON.stringify(this.currentTheme));
    },

    // [MVVM : Modèle]
    // Charge le thème actuel depuis le stockage local (Persistance).
    loadCurrentTheme() {
        const saved = localStorage.getItem('plume_locale-current-theme');
        if (saved) {
            try {
                this.currentTheme = JSON.parse(saved);
                this.applyTheme(this.currentTheme);
            } catch (e) {
                console.error('Erreur chargement thème', e);
            }
        }
    },

    // [MVVM : Modèle]
    // Sauvegarde la liste des thèmes personnalisés dans le stockage local (Persistance).
    saveCustomThemes() {
        localStorage.setItem('plume_locale-custom-themes', JSON.stringify(this.customThemes));
    },

    // [MVVM : Modèle]
    // Charge la liste des thèmes personnalisés depuis le stockage local (Persistance).
    loadCustomThemes() {
        const saved = localStorage.getItem('plume_locale-custom-themes');
        if (saved) {
            try {
                this.customThemes = JSON.parse(saved);
            } catch (e) {
                console.error('Erreur chargement thèmes personnalisés', e);
            }
        }
    },

    // [MVVM : Modèle]
    // Ajoute un nouveau thème personnalisé à la collection (Données).
    addCustomTheme(name, colors) {
        this.customThemes.push({ name, colors });
        this.saveCustomThemes();
    },

    // [MVVM : Modèle]
    // Supprime un thème personnalisé de la collection (Données).
    deleteCustomTheme(name) {
        this.customThemes = this.customThemes.filter(t => t.name !== name);
        this.saveCustomThemes();
    },

    // [MVVM : Modèle]
    // Gère l'exportation des données de thème vers un fichier JSON (Persistance/Données).
    exportTheme(colors, name) {
        const theme = {
            name: name,
            colors: colors,
            version: '1.0'
        };

        const json = JSON.stringify(theme, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `theme-${name.toLowerCase().replace(/\s+/g, '-')}.json`;
        a.click();
        URL.revokeObjectURL(url);
    },

    // [MVVM : Modèle]
    // Gère l'importation des données de thème depuis un fichier JSON (Données).
    importTheme(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const theme = JSON.parse(e.target.result);
                    if (theme.colors && theme.name) {
                        resolve(theme);
                    } else {
                        reject(new Error('Format de thème invalide'));
                    }
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = () => reject(new Error('Erreur de lecture du fichier'));
            reader.readAsText(file);
        });
    }
};

// [MVVM : Vue]
// Crée et affiche l'interface utilisateur (modal) du gestionnaire de thèmes.
function openThemeManager() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.style.zIndex = '10000';

    const currentColors = {};
    Object.keys(themeManager.defaultVariables).forEach(variable => {
        const value = getComputedStyle(document.documentElement).getPropertyValue(variable);
        currentColors[variable] = value.trim();
    });

    modal.innerHTML = `
                <div class="modal-content" style="max-width: 1000px; max-height: 90vh; overflow: hidden; display: flex; flex-direction: column;">
                    <div class="modal-header">
                        <h2>🎨 Gestionnaire de Thèmes</h2>
                        <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">✕</button>
                    </div>
                    
                    <div style="flex: 1; overflow-y: auto; padding: 1.5rem;">
                        <!-- Thèmes prédéfinis -->
                        <div style="margin-bottom: 2rem;">
                            <h3 style="margin-bottom: 1rem; font-size: 1.2rem; color: var(--accent-gold);">
                                📚 Thèmes Prédéfinis
                            </h3>
                            <div id="presetThemesList" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem;">
                            </div>
                        </div>
                        
                        <!-- Thèmes personnalisés -->
                        <div style="margin-bottom: 2rem;">
                            <h3 style="margin-bottom: 1rem; font-size: 1.2rem; color: var(--accent-gold);">
                                ✨ Mes Thèmes Personnalisés
                            </h3>
                            <div id="customThemesList" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem;">
                            </div>
                        </div>
                        
                        <!-- Éditeur de couleurs -->
                        <div style="border-top: 2px solid var(--border-color); padding-top: 1.5rem;">
                            <h3 style="margin-bottom: 1rem; font-size: 1.2rem; color: var(--accent-gold);">
                                🎨 Éditeur de Thème
                            </h3>
                            
                            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
                                ${Object.entries(themeManager.defaultVariables).map(([variable, defaultValue]) => {
        const label = variable.replace('--', '').split('-').map(w =>
            w.charAt(0).toUpperCase() + w.slice(1)
        ).join(' ');

        const currentValue = currentColors[variable] || defaultValue;
        const hexColor = rgbaToHex(currentValue);

        return `
                                        <div class="color-input-group">
                                            <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; font-size: 0.9rem;">
                                                ${label}
                                            </label>
                                            <div style="display: flex; gap: 0.5rem; align-items: center;">
                                                <input 
                                                    type="color" 
                                                    data-variable="${variable}"
                                                    value="${hexColor}"
                                                    style="width: 50px; height: 40px; border: 2px solid var(--border-color); border-radius: 4px; cursor: pointer;"
                                                >
                                                <input 
                                                    type="text" 
                                                    data-variable-text="${variable}"
                                                    value="${currentValue}"
                                                    placeholder="${currentValue}"
                                                    style="flex: 1; padding: 0.5rem; border: 1px solid var(--border-color); border-radius: 4px; font-family: 'Source Code Pro', monospace; font-size: 0.85rem;"
                                                >
                                            </div>
                                        </div>
                                    `;
    }).join('')}
                            </div>
                            
                            <!-- Actions de l'éditeur -->
                            <div style="display: flex; gap: 0.75rem; flex-wrap: wrap; padding-top: 1rem; border-top: 1px solid var(--border-color);">
                                <button onclick="applyCurrentEditorColors()" class="btn-primary">
                                    ✓ Appliquer les Couleurs
                                </button>
                                <button onclick="saveThemeAsCustom()" class="btn-primary" style="background: var(--accent-gold);">
                                    💾 Sauvegarder comme Thème
                                </button>
                                <button onclick="exportCurrentTheme()" class="btn-secondary">
                                    📤 Exporter en JSON
                                </button>
                                <button onclick="importThemeFile()" class="btn-secondary">
                                    📥 Importer depuis JSON
                                </button>
                                <button onclick="resetToDefault()" class="btn-secondary" style="margin-left: auto;">
                                    🔄 Réinitialiser
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;

    document.body.appendChild(modal);

    // Remplir les thèmes prédéfinis
    renderPresetThemes();
    renderCustomThemes();

    // Lier les changements de couleur en temps réel
    modal.querySelectorAll('input[type="color"]').forEach(input => {
        input.addEventListener('input', (e) => {
            const variable = e.target.dataset.variable;
            const color = e.target.value;
            const textInput = modal.querySelector(`input[data-variable-text="${variable}"]`);
            textInput.value = color;
            document.documentElement.style.setProperty(variable, color);
        });
    });

    modal.querySelectorAll('input[data-variable-text]').forEach(input => {
        input.addEventListener('change', (e) => {
            const variable = e.target.dataset.variableText;
            const color = e.target.value;
            document.documentElement.style.setProperty(variable, color);

            // Mettre à jour le color picker si possible
            const hexColor = rgbaToHex(color);
            const colorInput = modal.querySelector(`input[data-variable="${variable}"]`);
            if (colorInput && hexColor.match(/^#[0-9A-F]{6}$/i)) {
                colorInput.value = hexColor;
            }
        });
    });
}

// [MVVM : Vue]
// Génère et affiche la liste des thèmes prédéfinis dans l'interface.
function renderPresetThemes() {
    const container = document.getElementById('presetThemesList');
    container.innerHTML = Object.entries(themeManager.presetThemes).map(([name, colors]) => `
                <div class="theme-card" style="border: 2px solid var(--border-color); border-radius: 8px; padding: 1rem; cursor: pointer; transition: all 0.2s;"
                     onmouseover="this.style.borderColor='var(--accent-gold)'"
                     onmouseout="this.style.borderColor='var(--border-color)'"
                     onclick="applyPresetTheme('${name}')">
                    <div style="font-weight: 600; margin-bottom: 0.75rem; font-size: 1rem;">
                        ${name}
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 0.25rem;">
                        ${Object.values(colors).slice(0, 10).map(color => `
                            <div style="width: 100%; padding-bottom: 100%; background: ${color}; border-radius: 2px; border: 1px solid rgba(0,0,0,0.1);"></div>
                        `).join('')}
                    </div>
                </div>
            `).join('');
}

// [MVVM : Vue]
// Génère et affiche la liste des thèmes personnalisés dans l'interface.
function renderCustomThemes() {
    const container = document.getElementById('customThemesList');
    if (themeManager.customThemes.length === 0) {
        container.innerHTML = '<p style="color: var(--text-muted); font-style: italic;">Aucun thème personnalisé</p>';
        return;
    }

    container.innerHTML = themeManager.customThemes.map(theme => `
                <div class="theme-card" style="border: 2px solid var(--border-color); border-radius: 8px; padding: 1rem; position: relative;">
                    <button onclick="deleteCustomTheme('${theme.name}')" 
                            style="position: absolute; top: 0.5rem; right: 0.5rem; background: var(--accent-red); color: white; border: none; border-radius: 4px; width: 24px; height: 24px; cursor: pointer; font-size: 0.9rem;"
                            title="Supprimer">✕</button>
                    <div style="font-weight: 600; margin-bottom: 0.75rem; font-size: 1rem; padding-right: 2rem;">
                        ${theme.name}
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 0.25rem; margin-bottom: 0.75rem;">
                        ${Object.values(theme.colors).slice(0, 10).map(color => `
                            <div style="width: 100%; padding-bottom: 100%; background: ${color}; border-radius: 2px; border: 1px solid rgba(0,0,0,0.1);"></div>
                        `).join('')}
                    </div>
                    <button onclick="applyCustomTheme('${theme.name}')" class="btn-secondary" style="width: 100%; padding: 0.5rem; font-size: 0.85rem;">
                        Appliquer
                    </button>
                </div>
            `).join('');
}

// [MVVM : ViewModel]
// Logique de coordination pour appliquer un thème prédéfini et mettre à jour l'éditeur.
function applyPresetTheme(name) {
    const colors = themeManager.presetThemes[name];
    themeManager.applyTheme(colors);
    showNotification(`✓ Thème "${name}" appliqué`);

    // Mettre à jour l'éditeur
    Object.entries(colors).forEach(([variable, value]) => {
        const colorInput = document.querySelector(`input[data-variable="${variable}"]`);
        const textInput = document.querySelector(`input[data-variable-text="${variable}"]`);
        if (colorInput && textInput) {
            textInput.value = value;
            const hexColor = rgbaToHex(value);
            if (hexColor.match(/^#[0-9A-F]{6}$/i)) {
                colorInput.value = hexColor;
            }
        }
    });
}

// [MVVM : ViewModel]
// Logique de coordination pour appliquer un thème personnalisé et mettre à jour l'éditeur.
function applyCustomTheme(name) {
    const theme = themeManager.customThemes.find(t => t.name === name);
    if (theme) {
        themeManager.applyTheme(theme.colors);
        showNotification(`✓ Thème "${name}" appliqué`);

        // Mettre à jour l'éditeur
        Object.entries(theme.colors).forEach(([variable, value]) => {
            const colorInput = document.querySelector(`input[data-variable="${variable}"]`);
            const textInput = document.querySelector(`input[data-variable-text="${variable}"]`);
            if (colorInput && textInput) {
                textInput.value = value;
                const hexColor = rgbaToHex(value);
                if (hexColor.match(/^#[0-9A-F]{6}$/i)) {
                    colorInput.value = hexColor;
                }
            }
        });
    }
}

// [MVVM : ViewModel]
// Logique de transition pour supprimer un thème et mettre à jour l'interface.
function deleteCustomTheme(name) {
    if (confirm(`Supprimer le thème "${name}" ?`)) {
        themeManager.deleteCustomTheme(name);
        renderCustomThemes();
        showNotification(`✓ Thème "${name}" supprimé`);
    }
}

// [MVVM : ViewModel]
// Récupère les valeurs de l'éditeur pour les appliquer au document.
function applyCurrentEditorColors() {
    const colors = {};
    document.querySelectorAll('input[data-variable-text]').forEach(input => {
        const variable = input.dataset.variableText;
        colors[variable] = input.value;
    });
    themeManager.applyTheme(colors);
    showNotification('✓ Couleurs appliquées');
}

// [MVVM : ViewModel]
// Gère le flux de sauvegarde d'un nouveau thème personnalisé.
function saveThemeAsCustom() {
    const name = prompt('Nom du thème :');
    if (!name) return;

    // Vérifier si le nom existe déjà
    if (themeManager.customThemes.find(t => t.name === name)) {
        if (!confirm(`Un thème nommé "${name}" existe déjà. Remplacer ?`)) {
            return;
        }
        themeManager.deleteCustomTheme(name);
    }

    const colors = {};
    document.querySelectorAll('input[data-variable-text]').forEach(input => {
        const variable = input.dataset.variableText;
        colors[variable] = input.value;
    });

    themeManager.addCustomTheme(name, colors);
    renderCustomThemes();
    showNotification(`✓ Thème "${name}" sauvegardé`);
}

// [MVVM : ViewModel]
// Prépare et lance l'exportation du thème actuellement édité.
function exportCurrentTheme() {
    const name = prompt('Nom du thème pour l\'export :', 'Mon Thème');
    if (!name) return;

    const colors = {};
    document.querySelectorAll('input[data-variable-text]').forEach(input => {
        const variable = input.dataset.variableText;
        colors[variable] = input.value;
    });

    themeManager.exportTheme(colors, name);
    showNotification(`✓ Thème "${name}" exporté`);
}

// [MVVM : ViewModel]
// Coordonne l'importation de fichier et la décision de l'utilisateur.
function importThemeFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
        try {
            const file = e.target.files[0];
            const theme = await themeManager.importTheme(file);

            // Demander si on veut l'appliquer ou le sauvegarder
            const choice = confirm(`Thème "${theme.name}" importé.\n\nOK = Appliquer maintenant\nAnnuler = Sauvegarder dans mes thèmes`);

            if (choice) {
                themeManager.applyTheme(theme.colors);
                showNotification(`✓ Thème "${theme.name}" appliqué`);
            } else {
                // Vérifier si le nom existe
                if (themeManager.customThemes.find(t => t.name === theme.name)) {
                    if (!confirm(`Un thème nommé "${theme.name}" existe déjà. Remplacer ?`)) {
                        return;
                    }
                    themeManager.deleteCustomTheme(theme.name);
                }
                themeManager.addCustomTheme(theme.name, theme.colors);
                renderCustomThemes();
                showNotification(`✓ Thème "${theme.name}" sauvegardé`);
            }

            // Mettre à jour l'éditeur
            Object.entries(theme.colors).forEach(([variable, value]) => {
                const colorInput = document.querySelector(`input[data-variable="${variable}"]`);
                const textInput = document.querySelector(`input[data-variable-text="${variable}"]`);
                if (colorInput && textInput) {
                    textInput.value = value;
                    const hexColor = rgbaToHex(value);
                    if (hexColor.match(/^#[0-9A-F]{6}$/i)) {
                        colorInput.value = hexColor;
                    }
                }
            });

        } catch (error) {
            alert(`Erreur lors de l'import : ${error.message}`);
        }
    };
    input.click();
}

// [MVVM : ViewModel]
// Restaure les couleurs par défaut du document et de l'éditeur.
function resetToDefault() {
    if (confirm('Revenir au thème par défaut ?')) {
        themeManager.applyTheme(themeManager.defaultVariables);
        showNotification('✓ Thème par défaut restauré');

        // Mettre à jour l'éditeur
        Object.entries(themeManager.defaultVariables).forEach(([variable, value]) => {
            const colorInput = document.querySelector(`input[data-variable="${variable}"]`);
            const textInput = document.querySelector(`input[data-variable-text="${variable}"]`);
            if (colorInput && textInput) {
                textInput.value = value;
                const hexColor = rgbaToHex(value);
                if (hexColor.match(/^#[0-9A-F]{6}$/i)) {
                    colorInput.value = hexColor;
                }
            }
        });
    }
}

