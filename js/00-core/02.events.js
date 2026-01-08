// ============================================
// EVENT BUS - Communication découplée
// ============================================

/**
 * EventBus - Système de publication/souscription pour la communication entre modules
 *
 * Responsabilités :
 * - Permettre aux modules de communiquer sans couplage direct
 * - Gérer les événements de l'application
 * - Supporter les événements asynchrones
 *
 * Usage :
 *   EventBus.on('character:created', (character) => { ... });
 *   EventBus.emit('character:created', character);
 *   EventBus.off('character:created', handler);
 *
 * Conventions de nommage des événements :
 * - Format: 'entity:action' (ex: 'character:created', 'scene:updated')
 * - Actions courantes: created, updated, deleted, selected, loaded
 */

const EventBus = (function() {
    'use strict';

    // Map des événements
    // Format: Map<eventName, Array<{callback, once}>>
    const _events = new Map();

    // Historique des événements (pour debugging)
    const _history = [];
    const MAX_HISTORY = 100;

    // Mode debug
    let _debug = false;

    /**
     * Souscrit à un événement
     * @param {string} event - Nom de l'événement
     * @param {Function} callback - Fonction à appeler
     * @returns {Function} Fonction pour se désabonner
     */
    function on(event, callback) {
        if (typeof callback !== 'function') {
            throw new Error('Callback must be a function');
        }

        if (!_events.has(event)) {
            _events.set(event, []);
        }

        const listener = { callback, once: false };
        _events.get(event).push(listener);

        if (_debug) {
            console.log(`[EventBus] Subscribed to "${event}"`);
        }

        // Retourne une fonction pour se désabonner
        return function unsubscribe() {
            off(event, callback);
        };
    }

    /**
     * Souscrit à un événement une seule fois
     * @param {string} event - Nom de l'événement
     * @param {Function} callback - Fonction à appeler
     * @returns {Function} Fonction pour se désabonner
     */
    function once(event, callback) {
        if (typeof callback !== 'function') {
            throw new Error('Callback must be a function');
        }

        if (!_events.has(event)) {
            _events.set(event, []);
        }

        const listener = { callback, once: true };
        _events.get(event).push(listener);

        if (_debug) {
            console.log(`[EventBus] Subscribed once to "${event}"`);
        }

        return function unsubscribe() {
            off(event, callback);
        };
    }

    /**
     * Se désabonne d'un événement
     * @param {string} event - Nom de l'événement
     * @param {Function} callback - Fonction à retirer (optionnel, retire tous si non fourni)
     */
    function off(event, callback) {
        if (!_events.has(event)) return;

        if (callback) {
            // Retirer un callback spécifique
            const listeners = _events.get(event);
            const index = listeners.findIndex(l => l.callback === callback);
            if (index > -1) {
                listeners.splice(index, 1);
                if (_debug) {
                    console.log(`[EventBus] Unsubscribed from "${event}"`);
                }
            }

            // Nettoyer si plus de listeners
            if (listeners.length === 0) {
                _events.delete(event);
            }
        } else {
            // Retirer tous les callbacks pour cet événement
            _events.delete(event);
            if (_debug) {
                console.log(`[EventBus] Removed all listeners for "${event}"`);
            }
        }
    }

    /**
     * Émet un événement
     * @param {string} event - Nom de l'événement
     * @param {*} data - Données à passer aux listeners
     */
    function emit(event, data) {
        if (_debug) {
            console.log(`[EventBus] Emitting "${event}"`, data);
        }

        // Ajouter à l'historique
        _addToHistory(event, data);

        if (!_events.has(event)) return;

        const listeners = _events.get(event).slice(); // Copie pour éviter les modifications pendant l'itération
        const toRemove = [];

        listeners.forEach((listener, index) => {
            try {
                listener.callback(data);

                // Marquer pour suppression si 'once'
                if (listener.once) {
                    toRemove.push(index);
                }
            } catch (error) {
                console.error(`[EventBus] Error in listener for "${event}":`, error);
            }
        });

        // Retirer les listeners 'once'
        if (toRemove.length > 0) {
            const currentListeners = _events.get(event);
            toRemove.reverse().forEach(index => {
                currentListeners.splice(index, 1);
            });

            if (currentListeners.length === 0) {
                _events.delete(event);
            }
        }
    }

    /**
     * Émet un événement de manière asynchrone
     * @param {string} event - Nom de l'événement
     * @param {*} data - Données à passer aux listeners
     * @returns {Promise} Promise résolue quand tous les listeners ont été appelés
     */
    async function emitAsync(event, data) {
        if (_debug) {
            console.log(`[EventBus] Emitting async "${event}"`, data);
        }

        _addToHistory(event, data);

        if (!_events.has(event)) return;

        const listeners = _events.get(event).slice();
        const toRemove = [];

        for (let i = 0; i < listeners.length; i++) {
            const listener = listeners[i];
            try {
                await listener.callback(data);

                if (listener.once) {
                    toRemove.push(i);
                }
            } catch (error) {
                console.error(`[EventBus] Error in async listener for "${event}":`, error);
            }
        }

        // Retirer les listeners 'once'
        if (toRemove.length > 0) {
            const currentListeners = _events.get(event);
            toRemove.reverse().forEach(index => {
                currentListeners.splice(index, 1);
            });

            if (currentListeners.length === 0) {
                _events.delete(event);
            }
        }
    }

    /**
     * Vérifie si un événement a des listeners
     * @param {string} event - Nom de l'événement
     * @returns {boolean}
     */
    function hasListeners(event) {
        return _events.has(event) && _events.get(event).length > 0;
    }

    /**
     * Récupère le nombre de listeners pour un événement
     * @param {string} event - Nom de l'événement
     * @returns {number}
     */
    function listenerCount(event) {
        return _events.has(event) ? _events.get(event).length : 0;
    }

    /**
     * Liste tous les événements enregistrés
     * @returns {Array<string>}
     */
    function getEvents() {
        return Array.from(_events.keys());
    }

    /**
     * Retire tous les listeners de tous les événements
     */
    function clear() {
        _events.clear();
        if (_debug) {
            console.log('[EventBus] All listeners cleared');
        }
    }

    /**
     * Active/désactive le mode debug
     * @param {boolean} enabled
     */
    function setDebug(enabled) {
        _debug = enabled;
        console.log(`[EventBus] Debug mode ${enabled ? 'enabled' : 'disabled'}`);
    }

    /**
     * Récupère l'historique des événements
     * @param {number} limit - Nombre d'événements à retourner
     * @returns {Array}
     */
    function getHistory(limit = 10) {
        return _history.slice(-limit);
    }

    /**
     * Ajoute un événement à l'historique
     * @private
     */
    function _addToHistory(event, data) {
        _history.push({
            event,
            data,
            timestamp: Date.now()
        });

        // Limiter la taille de l'historique
        if (_history.length > MAX_HISTORY) {
            _history.shift();
        }
    }

    /**
     * Affiche les statistiques du bus d'événements
     */
    function stats() {
        console.group('[EventBus] Statistics');
        console.log('Total events:', _events.size);
        console.log('Total listeners:', Array.from(_events.values()).reduce((sum, arr) => sum + arr.length, 0));
        console.log('Recent events:', getHistory(5));
        console.table(
            Array.from(_events.entries()).map(([event, listeners]) => ({
                event,
                listeners: listeners.length
            }))
        );
        console.groupEnd();
    }

    // API publique
    return {
        on,
        once,
        off,
        emit,
        emitAsync,
        hasListeners,
        listenerCount,
        getEvents,
        clear,
        setDebug,
        getHistory,
        stats
    };
})();

// Exposer globalement
window.EventBus = EventBus;
