// ============================================
// STATE MANAGER - Gestion centralisée de l'état
// ============================================

/**
 * StateManager - Gestionnaire d'état global avec réactivité
 *
 * Responsabilités :
 * - Stocker l'état global de l'application
 * - Notifier les listeners lors des changements d'état
 * - Fournir un accès contrôlé à l'état
 *
 * Usage :
 *   StateManager.setState({ currentView: 'characters' });
 *   const view = StateManager.getState().currentView;
 *   StateManager.subscribe('currentView', (newView) => { ... });
 */

const StateManager = (function() {
    'use strict';

    // État initial de l'application
    let _state = {
        // Projet actuel
        project: null,
        currentProjectId: null,

        // Navigation
        currentView: 'structure',
        previousView: null,

        // Sélections
        currentActId: null,
        currentChapterId: null,
        currentSceneId: null,

        // Split view
        splitView: {
            active: false,
            leftSceneId: null,
            rightSceneId: null,
            ratio: 0.5
        },

        // UI State
        ui: {
            sidebarOpen: true,
            focusMode: false,
            theme: 'light',
            expandedActs: new Set(),
            expandedChapters: new Set()
        },

        // Features
        features: {
            autoSaveEnabled: true,
            autoDetectEnabled: true,
            spellCheckEnabled: false
        }
    };

    // Map des listeners par chemin
    // Format: Map<path, Array<callback>>
    const _listeners = new Map();

    // Map des listeners globaux (appelés à chaque changement)
    const _globalListeners = [];

    /**
     * Récupère l'état complet
     * @returns {Object} L'état actuel
     */
    function getState() {
        return _state;
    }

    /**
     * Met à jour l'état et notifie les listeners
     * @param {Object} updates - Objet contenant les mises à jour
     * @param {boolean} silent - Si true, ne notifie pas les listeners
     */
    function setState(updates, silent = false) {
        const oldState = { ..._state };

        // Deep merge pour les objets imbriqués
        _state = _deepMerge(_state, updates);

        if (!silent) {
            _notifyListeners(oldState, _state, updates);
        }
    }

    /**
     * Réinitialise l'état à sa valeur initiale
     */
    function resetState() {
        const oldState = { ..._state };

        _state = {
            project: null,
            currentProjectId: null,
            currentView: 'structure',
            previousView: null,
            currentActId: null,
            currentChapterId: null,
            currentSceneId: null,
            splitView: {
                active: false,
                leftSceneId: null,
                rightSceneId: null,
                ratio: 0.5
            },
            ui: {
                sidebarOpen: true,
                focusMode: false,
                theme: 'light',
                expandedActs: new Set(),
                expandedChapters: new Set()
            },
            features: {
                autoSaveEnabled: true,
                autoDetectEnabled: true,
                spellCheckEnabled: false
            }
        };

        _notifyListeners(oldState, _state, {});
    }

    /**
     * Souscrit aux changements d'une propriété spécifique
     * @param {string} path - Chemin vers la propriété (ex: 'currentView' ou 'ui.theme')
     * @param {Function} callback - Fonction appelée lors du changement
     * @returns {Function} Fonction pour se désabonner
     */
    function subscribe(path, callback) {
        if (typeof callback !== 'function') {
            throw new Error('Callback must be a function');
        }

        if (!_listeners.has(path)) {
            _listeners.set(path, []);
        }

        _listeners.get(path).push(callback);

        // Retourne une fonction pour se désabonner
        return function unsubscribe() {
            const callbacks = _listeners.get(path);
            if (callbacks) {
                const index = callbacks.indexOf(callback);
                if (index > -1) {
                    callbacks.splice(index, 1);
                }
            }
        };
    }

    /**
     * Souscrit à tous les changements d'état
     * @param {Function} callback - Fonction appelée à chaque changement
     * @returns {Function} Fonction pour se désabonner
     */
    function subscribeAll(callback) {
        if (typeof callback !== 'function') {
            throw new Error('Callback must be a function');
        }

        _globalListeners.push(callback);

        return function unsubscribe() {
            const index = _globalListeners.indexOf(callback);
            if (index > -1) {
                _globalListeners.splice(index, 1);
            }
        };
    }

    /**
     * Notifie les listeners des changements
     * @private
     */
    function _notifyListeners(oldState, newState, updates) {
        // Notifier les listeners globaux
        _globalListeners.forEach(callback => {
            try {
                callback(newState, oldState, updates);
            } catch (error) {
                console.error('Error in global state listener:', error);
            }
        });

        // Notifier les listeners spécifiques
        _listeners.forEach((callbacks, path) => {
            const oldValue = _getValueByPath(oldState, path);
            const newValue = _getValueByPath(newState, path);

            // Comparer les valeurs (pour les Set, on compare la taille et le contenu)
            if (!_areEqual(oldValue, newValue)) {
                callbacks.forEach(callback => {
                    try {
                        callback(newValue, oldValue);
                    } catch (error) {
                        console.error(`Error in state listener for "${path}":`, error);
                    }
                });
            }
        });
    }

    /**
     * Récupère une valeur par son chemin
     * @private
     * @param {Object} obj - Objet source
     * @param {string} path - Chemin (ex: 'ui.theme')
     * @returns {*} La valeur trouvée
     */
    function _getValueByPath(obj, path) {
        return path.split('.').reduce((acc, part) => acc?.[part], obj);
    }

    /**
     * Deep merge de deux objets
     * @private
     */
    function _deepMerge(target, source) {
        const output = { ...target };

        for (const key in source) {
            if (source.hasOwnProperty(key)) {
                if (source[key] instanceof Set) {
                    output[key] = new Set(source[key]);
                } else if (source[key] instanceof Map) {
                    output[key] = new Map(source[key]);
                } else if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                    output[key] = _deepMerge(target[key] || {}, source[key]);
                } else {
                    output[key] = source[key];
                }
            }
        }

        return output;
    }

    /**
     * Compare deux valeurs (gère les Set et objets)
     * @private
     */
    function _areEqual(a, b) {
        if (a === b) return true;

        if (a instanceof Set && b instanceof Set) {
            if (a.size !== b.size) return false;
            for (const item of a) {
                if (!b.has(item)) return false;
            }
            return true;
        }

        return false;
    }

    // API publique
    return {
        getState,
        setState,
        resetState,
        subscribe,
        subscribeAll
    };
})();

// Exposer globalement
window.StateManager = StateManager;
