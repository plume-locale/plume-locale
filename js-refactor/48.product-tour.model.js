/**
 * [MVVM : Product Tour Model]
 * Factories et structures de données pour le système de visite guidée.
 */

console.log('🎓 Product Tour Model loaded');

// ============================================
// TOUR STATE MODEL
// ============================================

const ProductTourStateModel = {
    /**
     * Crée un état initial pour le tour.
     * @returns {Object} État initial du tour.
     */
    createInitial: function () {
        return {
            completed: false,
            skipped: false,
            currentStep: 0,
            lastShown: null,
            version: '1.0',
            preferences: {
                showOnStartup: true,
                autoAdvance: false
            }
        };
    },

    /**
     * Valide et normalise un état de tour.
     * @param {Object} state - État à valider.
     * @returns {Object} État validé.
     */
    validate: function (state) {
        if (!state || typeof state !== 'object') {
            return this.createInitial();
        }

        return {
            completed: Boolean(state.completed),
            skipped: Boolean(state.skipped),
            currentStep: Number(state.currentStep) || 0,
            lastShown: state.lastShown || null,
            version: state.version || '1.0',
            preferences: {
                showOnStartup: state.preferences?.showOnStartup !== false,
                autoAdvance: Boolean(state.preferences?.autoAdvance)
            }
        };
    },

    /**
     * Migre un état legacy si nécessaire.
     * @param {Object} raw - Données brutes.
     * @returns {Object} État migré.
     */
    migrate: function (raw) {
        if (!raw) return this.createInitial();
        
        // Migration v1.0 -> v1.1 (exemple pour futures versions)
        if (raw.version === '1.0') {
            return this.validate(raw);
        }
        
        return this.validate(raw);
    }
};

// ============================================
// TOUR STEP MODEL
// ============================================

const ProductTourStepModel = {
    /**
     * Crée une définition de step de tour.
     * @param {Object} data - Données du step.
     * @returns {Object} Step validé.
     */
    create: function (data = {}) {
        return {
            element: data.element || null,
            popover: {
                title: data.popover?.title || '',
                description: data.popover?.description || '',
                side: data.popover?.side || 'bottom',
                align: data.popover?.align || 'start'
            },
            onHighlightStarted: data.onHighlightStarted || null,
            onHighlighted: data.onHighlighted || null,
            onDeselected: data.onDeselected || null,
            onNext: data.onNext || null,
            onPrevious: data.onPrevious || null
        };
    },

    /**
     * Valide qu'un élément existe dans le DOM.
     * @param {string} selector - Sélecteur CSS.
     * @returns {boolean} True si l'élément existe.
     */
    validateElement: function (selector) {
        if (!selector) return false;
        try {
            return document.querySelector(selector) !== null;
        } catch (e) {
            console.warn(`Invalid selector: ${selector}`, e);
            return false;
        }
    }
};

// ============================================
// TOUR CONFIG MODEL
// ============================================

const ProductTourConfigModel = {
    /**
     * Crée la configuration Driver.js pour le tour.
     * @returns {Object} Configuration Driver.js.
     */
    createDriverConfig: function () {
        return {
            animate: true,
            opacity: 0.75,
            padding: 10,
            allowClose: true,
            overlayClickNext: false,
            doneBtnText: 'Terminer',
            closeBtnText: 'Fermer',
            nextBtnText: 'Suivant',
            prevBtnText: 'Précédent',
            showProgress: true,
            progressText: 'Étape {{current}} sur {{total}}',
            showButtons: ['next', 'previous', 'close'],
            disableActiveInteraction: false,
            onDestroyStarted: () => {
                // Sera géré par le ViewModel
                if (typeof onTourCompleteVM === 'function') {
                    onTourCompleteVM();
                }
            },
            onDestroyed: () => {
                // Cleanup après fermeture
                if (typeof onTourDestroyedVM === 'function') {
                    onTourDestroyedVM();
                }
            }
        };
    },

    /**
     * Crée la configuration pour mobile.
     * @returns {Object} Configuration mobile.
     */
    createMobileConfig: function () {
        const config = this.createDriverConfig();
        return {
            ...config,
            padding: 5,
            progressText: '{{current}}/{{total}}'
        };
    }
};

// ============================================
// TOUR STEPS DEFINITIONS
// ============================================

const ProductTourStepsModel = {
    /**
     * Retourne tous les steps du tour selon le contexte.
     * @returns {Array} Liste des steps.
     */
    getAllSteps: function () {
        const isMobile = window.innerWidth < 768;
        return isMobile ? this.getMobileSteps() : this.getDesktopSteps();
    },

    /**
     * Steps pour desktop (tour complet).
     * @returns {Array} Steps desktop.
     */
    getDesktopSteps: function () {
        return [
            // Stage 1: Welcome & Orientation
            {
                element: '#headerProjectTitle',
                popover: {
                    title: '🪶 Bienvenue dans Plume',
                    description: `
                        <p>Plume est votre espace d'écriture complet pour créer des histoires captivantes.</p>
                        <p>Cette visite guidée vous présentera les fonctionnalités principales en quelques minutes.</p>
                        <p><strong>Vous pouvez quitter à tout moment en appuyant sur Échap.</strong></p>
                    `,
                    side: 'bottom',
                    align: 'start'
                },
                onHighlightStarted: () => {
                    // Ensure we're on the editor view
                    if (typeof currentView !== 'undefined' && currentView !== 'editor') {
                        if (typeof switchView === 'function') {
                            switchView('editor');
                        }
                    }
                }
            },
            {
                element: '#headerProjectTitle',
                popover: {
                    title: 'Titre du Projet',
                    description: `
                        <p>Cliquez sur le titre pour renommer votre projet.</p>
                        <p>Chaque projet est sauvegardé automatiquement dans votre navigateur.</p>
                    `,
                    side: 'bottom',
                    align: 'start'
                }
            },
            {
                element: '.header-nav',
                popover: {
                    title: 'Navigation Principale',
                    description: `
                        <p>La barre de navigation vous permet d'accéder à toutes les fonctionnalités :</p>
                        <ul>
                            <li><strong>Structure</strong> : Écriture et organisation</li>
                            <li><strong>Personnages</strong> : Base de données des personnages</li>
                            <li><strong>Univers</strong> : Lieux et éléments du monde</li>
                            <li><strong>Visualisations</strong> : Graphiques et cartes</li>
                        </ul>
                    `,
                    side: 'bottom',
                    align: 'center'
                }
            },
            {
                element: '.header-actions',
                popover: {
                    title: 'Actions Rapides',
                    description: `
                        <p>Accédez rapidement aux fonctions essentielles :</p>
                        <ul>
                            <li><strong>Annuler/Rétablir</strong> : Historique des modifications</li>
                            <li><strong>Timer Pomodoro</strong> : Gestion du temps d'écriture</li>
                            <li><strong>Thèmes</strong> : Personnalisation de l'interface</li>
                            <li><strong>Projets</strong> : Gestion de vos projets</li>
                        </ul>
                    `,
                    side: 'bottom',
                    align: 'end'
                }
            },

            // Stage 2: Core Writing Features
            {
                element: '.sidebar',
                popover: {
                    title: 'Structure du Projet',
                    description: `
                        <p>La barre latérale affiche la structure de votre histoire :</p>
                        <ul>
                            <li><strong>Actes</strong> : Grandes parties de votre récit</li>
                            <li><strong>Chapitres</strong> : Subdivisions des actes</li>
                            <li><strong>Scènes</strong> : Unités d'écriture individuelles</li>
                        </ul>
                        <p>Cliquez sur une scène pour l'éditer.</p>
                    `,
                    side: 'right',
                    align: 'start'
                }
            },
            {
                element: '#sceneEditor',
                popover: {
                    title: 'Éditeur de Scène',
                    description: `
                        <p>L'éditeur principal pour écrire vos scènes.</p>
                        <p>Fonctionnalités disponibles :</p>
                        <ul>
                            <li>Formatage de texte riche</li>
                            <li>Détection automatique des personnages</li>
                            <li>Compteur de mots en temps réel</li>
                            <li>Sauvegarde automatique</li>
                        </ul>
                    `,
                    side: 'left',
                    align: 'start'
                }
            },

            // Stage 3: Completion
            {
                element: '#headerProjectTitle',
                popover: {
                    title: '🎉 Visite Terminée !',
                    description: `
                        <p>Vous connaissez maintenant les bases de Plume !</p>
                        <p>Explorez les autres sections pour découvrir encore plus de fonctionnalités :</p>
                        <ul>
                            <li>Personnages et Univers</li>
                            <li>Visualisations et graphiques</li>
                            <li>Outils d'analyse et statistiques</li>
                        </ul>
                        <p><strong>Bon courage pour votre écriture ! ✍️</strong></p>
                    `,
                    side: 'bottom',
                    align: 'start'
                }
            }
        ];
    },

    /**
     * Steps pour mobile (tour simplifié).
     * @returns {Array} Steps mobile.
     */
    getMobileSteps: function () {
        return [
            {
                element: '#headerProjectTitle',
                popover: {
                    title: '🪶 Bienvenue',
                    description: `
                        <p>Plume est votre espace d'écriture complet.</p>
                        <p>Découvrez les fonctionnalités principales.</p>
                    `,
                    side: 'bottom',
                    align: 'start'
                }
            },
            {
                element: '.sidebar',
                popover: {
                    title: 'Structure',
                    description: `
                        <p>Organisez votre histoire en actes, chapitres et scènes.</p>
                    `,
                    side: 'right',
                    align: 'start'
                }
            },
            {
                element: '#sceneEditor',
                popover: {
                    title: 'Éditeur',
                    description: `
                        <p>Écrivez vos scènes avec sauvegarde automatique.</p>
                    `,
                    side: 'left',
                    align: 'start'
                }
            },
            {
                element: '#headerProjectTitle',
                popover: {
                    title: '🎉 C\'est parti !',
                    description: `
                        <p>Vous êtes prêt à écrire votre histoire !</p>
                    `,
                    side: 'bottom',
                    align: 'start'
                }
            }
        ];
    },

    /**
     * Filtre les steps pour ne garder que ceux dont les éléments existent.
     * @param {Array} steps - Steps à filtrer.
     * @returns {Array} Steps filtrés.
     */
    filterValidSteps: function (steps) {
        return steps.filter(step => {
            if (!step.element) return true; // Steps sans élément (modals, etc.)
            return ProductTourStepModel.validateElement(step.element);
        });
    }
};
