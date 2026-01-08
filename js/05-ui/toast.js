// ============================================
// TOAST UI - Système de notifications
// ============================================

/**
 * ToastUI - Notifications toast
 *
 * Usage :
 *   ToastUI.success('Sauvegardé !');
 *   ToastUI.error('Erreur de sauvegarde');
 *   ToastUI.info('Information');
 *   ToastUI.warning('Attention !');
 */

const ToastUI = (function() {
    'use strict';

    let _container = null;
    let _toasts = [];

    /**
     * Initialise le container de toasts
     * @private
     */
    function _init() {
        if (_container) return;

        _container = DOMUtils.create('div', {
            className: 'toast-container',
            id: 'toast-container'
        });

        document.body.appendChild(_container);
    }

    /**
     * Affiche un toast
     * @param {string} message - Message
     * @param {string} type - Type (success, error, warning, info)
     * @param {Object} options - Options
     */
    function show(message, type = 'info', options = {}) {
        _init();

        const {
            duration = 3000,
            action = null,
            actionText = 'Action',
            closable = true
        } = options;

        const icons = {
            success: '✓',
            error: '✗',
            warning: '⚠',
            info: 'ℹ'
        };

        const toastId = Date.now();

        const toastHTML = `
            <div class="toast toast-${type}" data-toast-id="${toastId}">
                <div class="toast-icon">${icons[type] || icons.info}</div>
                <div class="toast-content">
                    <div class="toast-message">${DOMUtils.escape(message)}</div>
                    ${action ? `<button class="toast-action" data-action="toast-action">${actionText}</button>` : ''}
                </div>
                ${closable ? '<button class="toast-close" data-action="toast-close">&times;</button>' : ''}
            </div>
        `;

        const toastElement = DOMUtils.parseHTML(toastHTML);
        _container.appendChild(toastElement);

        // Stocker le toast
        const toast = {
            id: toastId,
            element: toastElement,
            timeout: null
        };

        _toasts.push(toast);

        // Animation d'entrée
        setTimeout(() => {
            toastElement.classList.add('toast-show');
        }, 10);

        // Événement de fermeture
        if (closable) {
            toastElement.querySelector('[data-action="toast-close"]')?.addEventListener('click', () => {
                _removeToast(toastId);
            });
        }

        // Événement d'action
        if (action && typeof action === 'function') {
            toastElement.querySelector('[data-action="toast-action"]')?.addEventListener('click', () => {
                action();
                _removeToast(toastId);
            });
        }

        // Auto-fermeture
        if (duration > 0) {
            toast.timeout = setTimeout(() => {
                _removeToast(toastId);
            }, duration);
        }

        return toastId;
    }

    /**
     * Retire un toast
     * @private
     */
    function _removeToast(toastId) {
        const toast = _toasts.find(t => t.id === toastId);
        if (!toast) return;

        // Annuler le timeout
        if (toast.timeout) {
            clearTimeout(toast.timeout);
        }

        // Animation de sortie
        toast.element.classList.remove('toast-show');
        toast.element.classList.add('toast-hide');

        setTimeout(() => {
            toast.element.remove();
            _toasts = _toasts.filter(t => t.id !== toastId);
        }, 300);
    }

    /**
     * Toast de succès
     * @param {string} message
     * @param {Object} options
     */
    function success(message, options = {}) {
        return show(message, 'success', options);
    }

    /**
     * Toast d'erreur
     * @param {string} message
     * @param {Object} options
     */
    function error(message, options = {}) {
        return show(message, 'error', { duration: 5000, ...options });
    }

    /**
     * Toast d'avertissement
     * @param {string} message
     * @param {Object} options
     */
    function warning(message, options = {}) {
        return show(message, 'warning', { duration: 4000, ...options });
    }

    /**
     * Toast d'information
     * @param {string} message
     * @param {Object} options
     */
    function info(message, options = {}) {
        return show(message, 'info', options);
    }

    /**
     * Ferme un toast spécifique
     * @param {number} toastId
     */
    function close(toastId) {
        _removeToast(toastId);
    }

    /**
     * Ferme tous les toasts
     */
    function closeAll() {
        _toasts.forEach(toast => {
            _removeToast(toast.id);
        });
    }

    // API publique
    return {
        show,
        success,
        error,
        warning,
        info,
        close,
        closeAll
    };
})();

// Exposer globalement
window.ToastUI = ToastUI;
