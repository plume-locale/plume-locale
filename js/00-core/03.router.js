// ============================================
// ROUTER - Navigation entre vues
// ============================================

/**
 * Router - Gestion de la navigation entre les différentes vues
 *
 * Responsabilités :
 * - Gérer le changement de vue
 * - Maintenir l'historique de navigation
 * - Coordonner l'initialisation et la destruction des vues
 *
 * Usage :
 *   Router.register('characters', CharactersView);
 *   Router.navigate('characters');
 *   Router.back();
 *
 * Vues disponibles :
 * - structure, characters, locations, timeline, corkboard, mindmap,
 *   arc-board, storygrid, relations-graph, stats, notes, codex,
 *   todos, plot, tension, revision, map
 */

const Router = (function() {
    'use strict';

    // Registre des vues
    // Format: Map<viewName, {view, init, destroy}>
    const _views = new Map();

    // Vue actuellement active
    let _currentView = null;

    // Historique de navigation
    const _history = [];
    const MAX_HISTORY = 50;

    /**
     * Enregistre une vue
     * @param {string} name - Nom de la vue
     * @param {Object} viewObject - Objet de la vue avec init() et destroy()
     */
    function register(name, viewObject) {
        if (!name) {
            throw new Error('View name is required');
        }

        if (!viewObject || typeof viewObject.init !== 'function') {
            throw new Error('View must have an init() method');
        }

        _views.set(name, viewObject);
    }

    /**
     * Navigue vers une vue
     * @param {string} viewName - Nom de la vue
     * @param {Object} params - Paramètres optionnels à passer à la vue
     * @returns {Promise<boolean>} True si la navigation a réussi
     */
    async function navigate(viewName, params = {}) {
        if (!_views.has(viewName)) {
            console.error(`[Router] View "${viewName}" not found`);
            return false;
        }

        const state = StateManager.getState();
        const previousView = state.currentView;

        // Empêcher la navigation vers la même vue
        if (previousView === viewName && !params.force) {
            console.log(`[Router] Already on view "${viewName}"`);
            return false;
        }

        try {
            // Émettre l'événement avant navigation
            EventBus.emit('view:before-change', { from: previousView, to: viewName });

            // Détruire la vue précédente si elle existe
            if (previousView && _views.has(previousView)) {
                const prevViewObj = _views.get(previousView);
                if (typeof prevViewObj.destroy === 'function') {
                    await prevViewObj.destroy();
                }
            }

            // Mettre à jour l'état
            StateManager.setState({
                previousView: previousView,
                currentView: viewName
            });

            // Masquer toutes les vues
            _hideAllViews();

            // Afficher le container de la nouvelle vue
            _showView(viewName);

            // Initialiser la nouvelle vue
            const viewObj = _views.get(viewName);
            await viewObj.init(params);

            _currentView = viewName;

            // Ajouter à l'historique
            _addToHistory(viewName);

            // Émettre l'événement après navigation
            EventBus.emit('view:changed', { from: previousView, to: viewName });

            return true;

        } catch (error) {
            console.error(`[Router] Error navigating to "${viewName}":`, error);
            EventBus.emit('view:error', { view: viewName, error });
            return false;
        }
    }

    /**
     * Retourne à la vue précédente dans l'historique
     * @returns {Promise<boolean>}
     */
    async function back() {
        if (_history.length < 2) {
            console.log('[Router] No previous view in history');
            return false;
        }

        // Retirer la vue actuelle
        _history.pop();

        // Récupérer la vue précédente
        const previousView = _history[_history.length - 1];

        // Naviguer sans ajouter à l'historique
        _history.pop(); // On retire pour que navigate() ne la duplique pas
        return await navigate(previousView);
    }

    /**
     * Recharge la vue actuelle
     * @returns {Promise<boolean>}
     */
    async function reload() {
        const currentView = StateManager.getState().currentView;
        return await navigate(currentView, { force: true });
    }

    /**
     * Vérifie si une vue est enregistrée
     * @param {string} viewName
     * @returns {boolean}
     */
    function hasView(viewName) {
        return _views.has(viewName);
    }

    /**
     * Récupère la liste des vues enregistrées
     * @returns {Array<string>}
     */
    function getViews() {
        return Array.from(_views.keys());
    }

    /**
     * Récupère la vue actuelle
     * @returns {string|null}
     */
    function getCurrentView() {
        return StateManager.getState().currentView;
    }

    /**
     * Récupère l'historique de navigation
     * @param {number} limit - Nombre d'entrées à retourner
     * @returns {Array<string>}
     */
    function getHistory(limit = 10) {
        return _history.slice(-limit);
    }

    /**
     * Masque toutes les vues
     * @private
     */
    function _hideAllViews() {
        const containers = document.querySelectorAll('[data-view]');
        containers.forEach(container => {
            container.style.display = 'none';
        });
    }

    /**
     * Affiche une vue spécifique
     * @private
     */
    function _showView(viewName) {
        const container = document.querySelector(`[data-view="${viewName}"]`);
        if (container) {
            container.style.display = '';
        } else {
            console.warn(`[Router] Container for view "${viewName}" not found`);
        }
    }

    /**
     * Ajoute une entrée à l'historique
     * @private
     */
    function _addToHistory(viewName) {
        _history.push(viewName);

        // Limiter la taille de l'historique
        if (_history.length > MAX_HISTORY) {
            _history.shift();
        }
    }

    /**
     * Affiche les statistiques du routeur
     */
    function stats() {
        console.group('[Router] Statistics');
        console.log('Current view:', getCurrentView());
        console.log('Registered views:', getViews());
        console.log('History:', getHistory());
        console.groupEnd();
    }

    // API publique
    return {
        register,
        navigate,
        back,
        reload,
        hasView,
        getViews,
        getCurrentView,
        getHistory,
        stats
    };
})();

// Exposer globalement
window.Router = Router;
