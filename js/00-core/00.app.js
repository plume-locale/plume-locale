// ============================================
// APP - Point d'entrée de l'application
// ============================================

/**
 * App - Orchestrateur principal de l'application
 *
 * Responsabilités :
 * - Initialiser tous les modules
 * - Coordonner le démarrage de l'application
 * - Gérer le cycle de vie de l'application
 * - Exposer l'API publique
 *
 * Usage :
 *   App.init() - Initialise l'application
 *   App.getVersion() - Version de l'application
 */

const App = (function() {
    'use strict';

    // Version de l'application
    const VERSION = '2.0.0';

    // État de l'application
    let _initialized = false;
    let _startTime = null;

    /**
     * Initialise l'application
     * @returns {Promise<void>}
     */
    async function init() {
        if (_initialized) {
            console.warn('[App] Application already initialized');
            return;
        }

        _startTime = Date.now();
        console.log(`[App] Initializing Plume Locale v${VERSION}...`);

        try {
            // 1. Vérifier les dépendances
            _checkDependencies();

            // 2. Initialiser l'état global
            _initializeState();

            // 3. Charger le projet depuis le storage
            await _loadProject();

            // 4. Enregistrer les vues
            _registerViews();

            // 5. Configurer les event listeners globaux
            _setupGlobalListeners();

            // 6. Initialiser la vue par défaut
            await _initializeDefaultView();

            _initialized = true;

            const elapsed = Date.now() - _startTime;
            console.log(`[App] Initialized in ${elapsed}ms`);

            // Émettre l'événement d'initialisation
            EventBus.emit('app:ready', { version: VERSION, elapsed });

        } catch (error) {
            console.error('[App] Initialization failed:', error);
            EventBus.emit('app:error', { error });
            throw error;
        }
    }

    /**
     * Vérifie que toutes les dépendances sont chargées
     * @private
     */
    function _checkDependencies() {
        const required = [
            'StateManager',
            'EventBus',
            'Router',
            'DOMUtils',
            'TextUtils',
            'ArrayUtils',
            'DateUtils',
            'ColorUtils',
            'Validators'
        ];

        const missing = required.filter(dep => !window[dep]);

        if (missing.length > 0) {
            throw new Error(`Missing dependencies: ${missing.join(', ')}`);
        }

        console.log('[App] ✓ All dependencies loaded');
    }

    /**
     * Initialise l'état global
     * @private
     */
    function _initializeState() {
        // L'état est déjà initialisé dans StateManager
        // On peut le personnaliser ici si nécessaire
        console.log('[App] ✓ State initialized');
    }

    /**
     * Charge le projet depuis le storage
     * @private
     */
    async function _loadProject() {
        // TODO: Implémenter le chargement du projet
        // Pour l'instant, on simule avec un projet vide

        console.log('[App] ✓ Project loaded');
    }

    /**
     * Enregistre toutes les vues disponibles
     * @private
     */
    function _registerViews() {
        // Enregistrer les vues disponibles
        if (window.CharactersView) {
            Router.register('characters', CharactersView);
            console.log('[App] ✓ Registered CharactersView');
        }

        if (window.LocationsView) {
            Router.register('locations', LocationsView);
            console.log('[App] ✓ Registered LocationsView');
        }

        if (window.NotesView) {
            Router.register('notes', NotesView);
            console.log('[App] ✓ Registered NotesView');
        }

        if (window.ScenesView) {
            Router.register('scenes', ScenesView);
            console.log('[App] ✓ Registered ScenesView');
        }

        // TODO: Enregistrer les autres vues au fur et à mesure de la migration
        // Router.register('structure', StructureView);
        // Router.register('timeline', TimelineView);
        // Router.register('corkboard', CorkboardView);
        // etc.

        console.log('[App] ✓ Views registered');
    }

    /**
     * Configure les event listeners globaux
     * @private
     */
    function _setupGlobalListeners() {
        // Écouter les changements d'état pour le debug
        if (isDevelopment()) {
            StateManager.subscribeAll((newState, oldState, updates) => {
                console.log('[State] Updated:', updates);
            });
        }

        // Sauvegarder automatiquement lors de certains événements
        const autoSaveEvents = [
            'scene:updated',
            'character:created',
            'character:updated',
            'character:deleted',
            'location:created',
            'location:updated',
            'location:deleted'
        ];

        autoSaveEvents.forEach(event => {
            EventBus.on(event, () => {
                if (StateManager.getState().features.autoSaveEnabled) {
                    // TODO: Déclencher la sauvegarde
                    console.log('[App] Auto-save triggered by:', event);
                }
            });
        });

        console.log('[App] ✓ Global listeners configured');
    }

    /**
     * Initialise la vue par défaut
     * @private
     */
    async function _initializeDefaultView() {
        const state = StateManager.getState();
        const defaultView = state.currentView || 'structure';

        // TODO: Naviguer vers la vue par défaut
        // await Router.navigate(defaultView);

        console.log('[App] ✓ Default view initialized:', defaultView);
    }

    /**
     * Récupère la version de l'application
     * @returns {string}
     */
    function getVersion() {
        return VERSION;
    }

    /**
     * Vérifie si l'application est initialisée
     * @returns {boolean}
     */
    function isInitialized() {
        return _initialized;
    }

    /**
     * Vérifie si on est en mode développement
     * @returns {boolean}
     */
    function isDevelopment() {
        return window.location.hostname === 'localhost' ||
               window.location.hostname === '127.0.0.1' ||
               window.location.search.includes('debug=true');
    }

    /**
     * Active le mode debug
     */
    function enableDebug() {
        EventBus.setDebug(true);
        console.log('[App] Debug mode enabled');

        // Exposer des helpers pour le debug
        window.DEBUG = {
            state: () => StateManager.getState(),
            events: () => EventBus.getEvents(),
            router: () => Router.stats(),
            eventBus: () => EventBus.stats(),
            history: () => EventBus.getHistory(20)
        };

        console.log('[App] Debug helpers available via window.DEBUG');
    }

    /**
     * Désactive le mode debug
     */
    function disableDebug() {
        EventBus.setDebug(false);
        delete window.DEBUG;
        console.log('[App] Debug mode disabled');
    }

    /**
     * Réinitialise l'application
     */
    async function reset() {
        console.log('[App] Resetting application...');

        // Réinitialiser l'état
        StateManager.resetState();

        // Nettoyer les événements
        EventBus.clear();

        // Recharger
        await init();

        console.log('[App] Application reset complete');
    }

    /**
     * Affiche des informations sur l'application
     */
    function info() {
        console.group('[App] Information');
        console.log('Version:', VERSION);
        console.log('Initialized:', _initialized);
        console.log('Uptime:', _startTime ? `${Math.floor((Date.now() - _startTime) / 1000)}s` : 'N/A');
        console.log('Development mode:', isDevelopment());
        console.log('Current view:', StateManager.getState().currentView);
        console.log('Registered views:', Router.getViews());
        console.log('Active events:', EventBus.getEvents());
        console.groupEnd();
    }

    // API publique
    return {
        init,
        getVersion,
        isInitialized,
        isDevelopment,
        enableDebug,
        disableDebug,
        reset,
        info,

        // Alias
        version: getVersion
    };
})();

// Exposer globalement
window.App = App;

// Auto-initialisation si on est en mode développement
if (App.isDevelopment()) {
    console.log('[App] Development mode detected');

    // Message de bienvenue dans la console
    console.log('%c🪶 Plume Locale v' + App.getVersion(), 'font-size: 20px; font-weight: bold; color: #3498db;');
    console.log('%cNouvelle architecture - Migration en cours', 'font-size: 12px; color: #95a5a6;');
    console.log('%cUtilisez App.info() pour plus d\'informations', 'font-size: 12px; color: #95a5a6;');
}
