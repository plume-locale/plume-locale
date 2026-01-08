// ============================================
// SCENES HANDLERS - Gestionnaires d'événements Scènes
// ============================================

/**
 * ScenesHandlers - Gestion des événements pour la vue Scènes
 *
 * Responsabilités :
 * - Gérer les événements utilisateur
 * - Déléguer aux méthodes de la vue
 * - Valider et traiter les formulaires
 */

const ScenesHandlers = (function() {
    'use strict';

    /**
     * Attache tous les handlers à la vue
     * @param {HTMLElement} container
     */
    function attachHandlers(container) {
        if (!container) return;

        // Délégation d'événements pour tous les boutons
        DOMUtils.delegate(container, 'click', '[data-action]', _handleAction);

        // Recherche avec debounce
        const searchInput = container.querySelector('[data-action="search"]');
        if (searchInput) {
            searchInput.addEventListener('input', _debounce((e) => {
                ScenesView.setSearch(e.target.value);
            }, 300));
        }

        // Tri
        const sortSelect = container.querySelector('select[data-action="sort"]');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                ScenesView.setSort(e.target.value);
            });
        }
    }

    /**
     * Gère les actions des boutons
     * @param {Event} e
     */
    function _handleAction(e) {
        const action = e.target.closest('[data-action]')?.dataset.action;
        const sceneId = e.target.closest('[data-scene-id]')?.dataset.sceneId;

        switch (action) {
            case 'add-scene':
                ScenesView.openAddModal();
                break;

            case 'edit-scene':
                if (sceneId) ScenesView.openEditModal(parseInt(sceneId));
                break;

            case 'view-scene':
                if (sceneId) ScenesView.openDetailModal(parseInt(sceneId));
                break;

            case 'delete-scene':
                if (sceneId) ScenesView.deleteScene(parseInt(sceneId));
                break;

            case 'duplicate-scene':
                if (sceneId) ScenesView.duplicateScene(parseInt(sceneId));
                break;

            case 'filter':
                const filter = e.target.dataset.filter;
                if (filter) ScenesView.setFilter(filter);
                break;
        }
    }

    /**
     * Attache les handlers au formulaire
     * @param {HTMLElement} modal - Élément du modal
     * @param {string} mode - 'add' ou 'edit'
     * @param {Object|null} scene - Scène à éditer (null pour création)
     */
    function attachFormHandlers(modal, mode, scene = null) {
        const form = modal.querySelector('.scene-form');
        if (!form) return;

        // Soumission du formulaire
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await _handleFormSubmit(form, mode, scene);
        });

        // Bouton annuler
        const cancelBtn = form.querySelector('[data-action="cancel"]');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                ModalUI.close('add-scene');
                ModalUI.close('edit-scene');
            });
        }
    }

    /**
     * Gère la soumission du formulaire
     * @param {HTMLFormElement} form
     * @param {string} mode
     * @param {Object|null} scene
     */
    async function _handleFormSubmit(form, mode, scene) {
        try {
            const formData = new FormData(form);
            const data = {
                title: formData.get('title').trim(),
                summary: formData.get('summary').trim(),
                content: formData.get('content').trim(),
                notes: formData.get('notes').trim(),
                status: formData.get('status'),
                color: formData.get('color'),
                tension: parseInt(formData.get('tension')) || 5,
                tags: _parseTags(formData.get('tags'))
            };

            // Validation
            if (!data.title) {
                ToastUI.error('Erreur', 'Le titre est obligatoire');
                return;
            }

            if (data.tension < 1 || data.tension > 10) {
                ToastUI.error('Erreur', 'La tension doit être entre 1 et 10');
                return;
            }

            if (mode === 'add') {
                // Création
                const newScene = SceneService.create(data);
                ToastUI.success('Scène créée', `"${newScene.title}" a été créée avec succès.`);
                ModalUI.close('add-scene');

            } else if (mode === 'edit' && scene) {
                // Modification
                const updatedScene = SceneService.update(scene.id, data);
                ToastUI.success('Scène modifiée', `"${updatedScene.title}" a été modifiée avec succès.`);
                ModalUI.close('edit-scene');
            }

        } catch (error) {
            ToastUI.error('Erreur', error.message);
        }
    }

    /**
     * Parse les tags depuis une chaîne
     * @param {string} tagsString
     * @returns {Array}
     */
    function _parseTags(tagsString) {
        if (!tagsString) return [];

        return tagsString
            .split(',')
            .map(tag => tag.trim().toLowerCase())
            .filter(tag => tag.length > 0);
    }

    /**
     * Debounce pour les événements rapides
     * @param {Function} func
     * @param {number} wait
     * @returns {Function}
     */
    function _debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // API publique
    return {
        attachHandlers,
        attachFormHandlers
    };
})();

// Exposer globalement
window.ScenesHandlers = ScenesHandlers;
