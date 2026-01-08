// ============================================
// MODAL UI - Système de modales
// ============================================

/**
 * ModalUI - Gestion des modales de l'application
 *
 * Responsabilités :
 * - Afficher/masquer des modales
 * - Gestion du contenu dynamique
 * - Dialogs de confirmation
 * - Prompts
 *
 * Usage :
 *   ModalUI.open('my-modal', '<div>Contenu</div>');
 *   ModalUI.close();
 *   const confirmed = await ModalUI.confirm('Êtes-vous sûr ?');
 *   const value = await ModalUI.prompt('Votre nom ?');
 */

const ModalUI = (function() {
    'use strict';

    let _currentModal = null;
    let _modalStack = [];
    let _resolveCallback = null;

    /**
     * Ouvre une modale
     * @param {string} id - ID de la modale
     * @param {string} content - Contenu HTML
     * @param {Object} options - Options
     */
    function open(id, content, options = {}) {
        const {
            title = '',
            className = '',
            closeOnBackdrop = true,
            closeButton = true,
            width = 'medium', // small, medium, large, full
            onClose = null
        } = options;

        // Créer le HTML de la modale
        const modalHTML = `
            <div class="modal-backdrop" data-modal-id="${id}">
                <div class="modal-container modal-${width} ${className}">
                    ${closeButton ? '<button class="modal-close" data-action="close-modal">&times;</button>' : ''}
                    ${title ? `<div class="modal-header"><h2>${DOMUtils.escape(title)}</h2></div>` : ''}
                    <div class="modal-body">
                        ${content}
                    </div>
                </div>
            </div>
        `;

        // Créer l'élément
        const modalElement = DOMUtils.parseHTML(modalHTML);

        // Ajouter au DOM
        document.body.appendChild(modalElement);

        // Event listeners
        if (closeButton) {
            modalElement.querySelector('[data-action="close-modal"]')?.addEventListener('click', () => {
                close();
            });
        }

        if (closeOnBackdrop) {
            modalElement.querySelector('.modal-backdrop')?.addEventListener('click', (e) => {
                if (e.target.classList.contains('modal-backdrop')) {
                    close();
                }
            });
        }

        // Empêcher le scroll du body
        document.body.style.overflow = 'hidden';

        // Stocker la modale courante
        _currentModal = {
            id,
            element: modalElement,
            onClose
        };

        _modalStack.push(_currentModal);

        // Focus sur le premier input si présent
        setTimeout(() => {
            const firstInput = modalElement.querySelector('input, textarea');
            if (firstInput) {
                firstInput.focus();
            }
        }, 100);

        // Émettre l'événement
        EventBus.emit('modal:opened', { id });

        return modalElement;
    }

    /**
     * Ferme la modale courante
     */
    function close() {
        if (!_currentModal) return;

        const { element, onClose } = _currentModal;

        // Callback avant fermeture
        if (onClose && typeof onClose === 'function') {
            onClose();
        }

        // Retirer du DOM avec animation
        element.classList.add('modal-closing');

        setTimeout(() => {
            element.remove();

            // Retirer du stack
            _modalStack.pop();

            // Si plus de modales, restaurer le scroll
            if (_modalStack.length === 0) {
                document.body.style.overflow = '';
                _currentModal = null;
            } else {
                _currentModal = _modalStack[_modalStack.length - 1];
            }

            // Émettre l'événement
            EventBus.emit('modal:closed');

            // Résoudre la promesse si présente
            if (_resolveCallback) {
                _resolveCallback(null);
                _resolveCallback = null;
            }
        }, 200);
    }

    /**
     * Ferme toutes les modales
     */
    function closeAll() {
        while (_modalStack.length > 0) {
            close();
        }
    }

    /**
     * Affiche une confirmation
     * @param {string} message - Message
     * @param {string} detail - Détails (optionnel)
     * @param {Object} options - Options
     * @returns {Promise<boolean>}
     */
    function confirm(message, detail = '', options = {}) {
        const {
            confirmText = 'Confirmer',
            cancelText = 'Annuler',
            danger = false
        } = options;

        return new Promise((resolve) => {
            const content = `
                <div class="modal-confirm">
                    <p class="modal-confirm-message">${DOMUtils.escape(message)}</p>
                    ${detail ? `<p class="modal-confirm-detail">${DOMUtils.escape(detail)}</p>` : ''}
                    <div class="modal-confirm-actions">
                        <button class="btn btn-secondary" data-action="cancel">${cancelText}</button>
                        <button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" data-action="confirm">${confirmText}</button>
                    </div>
                </div>
            `;

            const modalEl = open('confirm-modal', content, {
                title: 'Confirmation',
                closeOnBackdrop: false,
                width: 'small'
            });

            // Événements
            modalEl.querySelector('[data-action="confirm"]')?.addEventListener('click', () => {
                close();
                resolve(true);
            });

            modalEl.querySelector('[data-action="cancel"]')?.addEventListener('click', () => {
                close();
                resolve(false);
            });

            _resolveCallback = resolve;
        });
    }

    /**
     * Affiche un prompt
     * @param {string} message - Message
     * @param {string} defaultValue - Valeur par défaut
     * @param {Object} options - Options
     * @returns {Promise<string|null>}
     */
    function prompt(message, defaultValue = '', options = {}) {
        const {
            placeholder = '',
            confirmText = 'OK',
            cancelText = 'Annuler',
            inputType = 'text',
            validation = null
        } = options;

        return new Promise((resolve) => {
            const content = `
                <div class="modal-prompt">
                    <p class="modal-prompt-message">${DOMUtils.escape(message)}</p>
                    <input
                        type="${inputType}"
                        class="modal-prompt-input"
                        value="${DOMUtils.escape(defaultValue)}"
                        placeholder="${DOMUtils.escape(placeholder)}"
                    />
                    <div class="modal-prompt-error" style="display: none;"></div>
                    <div class="modal-prompt-actions">
                        <button class="btn btn-secondary" data-action="cancel">${cancelText}</button>
                        <button class="btn btn-primary" data-action="confirm">${confirmText}</button>
                    </div>
                </div>
            `;

            const modalEl = open('prompt-modal', content, {
                title: message,
                closeOnBackdrop: false,
                width: 'small'
            });

            const input = modalEl.querySelector('.modal-prompt-input');
            const errorEl = modalEl.querySelector('.modal-prompt-error');
            const confirmBtn = modalEl.querySelector('[data-action="confirm"]');

            const handleConfirm = () => {
                const value = input.value.trim();

                // Validation
                if (validation && typeof validation === 'function') {
                    const validationResult = validation(value);
                    if (!validationResult.valid) {
                        errorEl.textContent = validationResult.error;
                        errorEl.style.display = 'block';
                        return;
                    }
                }

                close();
                resolve(value);
            };

            // Événements
            confirmBtn.addEventListener('click', handleConfirm);

            modalEl.querySelector('[data-action="cancel"]')?.addEventListener('click', () => {
                close();
                resolve(null);
            });

            // Enter pour confirmer
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    handleConfirm();
                }
            });

            _resolveCallback = resolve;
        });
    }

    /**
     * Affiche une alerte
     * @param {string} message - Message
     * @param {string} type - Type (info, success, warning, error)
     */
    function alert(message, type = 'info') {
        const icons = {
            info: 'ℹ️',
            success: '✅',
            warning: '⚠️',
            error: '❌'
        };

        const content = `
            <div class="modal-alert modal-alert-${type}">
                <div class="modal-alert-icon">${icons[type]}</div>
                <p class="modal-alert-message">${DOMUtils.escape(message)}</p>
                <div class="modal-alert-actions">
                    <button class="btn btn-primary" data-action="ok">OK</button>
                </div>
            </div>
        `;

        return new Promise((resolve) => {
            const modalEl = open('alert-modal', content, {
                closeOnBackdrop: false,
                width: 'small'
            });

            modalEl.querySelector('[data-action="ok"]')?.addEventListener('click', () => {
                close();
                resolve();
            });

            _resolveCallback = resolve;
        });
    }

    /**
     * Vérifie si une modale est ouverte
     * @returns {boolean}
     */
    function isOpen() {
        return _currentModal !== null;
    }

    /**
     * Récupère l'ID de la modale courante
     * @returns {string|null}
     */
    function getCurrentId() {
        return _currentModal?.id || null;
    }

    // Écouter Escape pour fermer
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isOpen()) {
            close();
        }
    });

    // API publique
    return {
        open,
        close,
        closeAll,
        confirm,
        prompt,
        alert,
        isOpen,
        getCurrentId
    };
})();

// Exposer globalement
window.ModalUI = ModalUI;
