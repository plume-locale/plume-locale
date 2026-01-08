// ============================================
// STRUCTURE HANDLERS - Gestionnaires d'événements Structure
// ============================================

/**
 * StructureHandlers - Gestion des événements pour la vue Structure
 *
 * Responsabilités :
 * - Gérer les événements utilisateur
 * - Traiter les formulaires
 * - Déléguer aux méthodes de la vue
 */

const StructureHandlers = (function() {
    'use strict';

    /**
     * Attache tous les handlers à la vue
     * @param {HTMLElement} container
     */
    function attachHandlers(container) {
        if (!container) return;

        // Délégation d'événements pour tous les boutons
        DOMUtils.delegate(container, 'click', '[data-action]', _handleAction);
    }

    /**
     * Gère les actions des boutons
     * @param {Event} e
     */
    function _handleAction(e) {
        const target = e.target.closest('[data-action]');
        const action = target?.dataset.action;

        if (!action) return;

        const actId = target.dataset.actId ? parseInt(target.dataset.actId) : null;
        const chapterId = target.dataset.chapterId ? parseInt(target.dataset.chapterId) : null;
        const sceneId = target.dataset.sceneId ? parseInt(target.dataset.sceneId) : null;

        switch (action) {
            case 'add-act':
                StructureView.openAddActModal();
                break;

            case 'add-chapter':
                if (actId) StructureView.openAddChapterModal(actId);
                break;

            case 'add-scene':
                if (actId && chapterId) StructureView.openAddSceneModal(actId, chapterId);
                break;

            case 'toggle-act':
                if (actId) StructureView.toggleAct(actId);
                break;

            case 'toggle-chapter':
                if (chapterId) StructureView.toggleChapter(chapterId);
                break;

            case 'delete-act':
                if (actId) StructureView.deleteAct(actId);
                break;

            case 'delete-chapter':
                if (actId && chapterId) StructureView.deleteChapter(actId, chapterId);
                break;

            case 'open-scene':
                if (actId && chapterId && sceneId) {
                    StructureView.openScene(actId, chapterId, sceneId);
                }
                break;

            case 'expand-all':
                StructureView.expandAll();
                break;

            case 'collapse-all':
                StructureView.collapseAll();
                break;
        }
    }

    /**
     * Attache les handlers au formulaire d'acte
     * @param {HTMLElement} modal
     * @param {string} mode - 'add' ou 'edit'
     * @param {Object|null} act
     */
    function attachActFormHandlers(modal, mode, act = null) {
        const form = modal.querySelector('.act-form');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await _handleActFormSubmit(form, mode, act);
        });

        const cancelBtn = form.querySelector('[data-action="cancel"]');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                ModalUI.close('add-act');
                ModalUI.close('edit-act');
            });
        }
    }

    /**
     * Gère la soumission du formulaire d'acte
     * @param {HTMLFormElement} form
     * @param {string} mode
     * @param {Object|null} act
     */
    async function _handleActFormSubmit(form, mode, act) {
        try {
            const formData = new FormData(form);
            const title = formData.get('title').trim();

            if (!title) {
                ToastUI.error('Erreur', 'Le titre est obligatoire');
                return;
            }

            const state = StateManager.getState();
            const project = state.project;

            if (!project) {
                ToastUI.error('Erreur', 'Aucun projet chargé');
                return;
            }

            if (mode === 'add') {
                // Création
                const newAct = {
                    id: Date.now(),
                    title,
                    chapters: []
                };

                if (!project.acts) {
                    project.acts = [];
                }

                project.acts.push(newAct);
                ToastUI.success('Acte créé', `"${title}" a été créé avec succès.`);

            } else if (mode === 'edit' && act) {
                // Modification
                const existingAct = project.acts?.find(a => a.id === act.id);
                if (existingAct) {
                    existingAct.title = title;
                    ToastUI.success('Acte modifié', `"${title}" a été modifié avec succès.`);
                }
            }

            StateManager.setState({ project });
            await StorageService.saveProject(project);

            ModalUI.close('add-act');
            ModalUI.close('edit-act');

        } catch (error) {
            ToastUI.error('Erreur', error.message);
        }
    }

    /**
     * Attache les handlers au formulaire de chapitre
     * @param {HTMLElement} modal
     * @param {string} mode - 'add' ou 'edit'
     * @param {number} actId
     * @param {Object|null} chapter
     */
    function attachChapterFormHandlers(modal, mode, actId, chapter = null) {
        const form = modal.querySelector('.chapter-form');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await _handleChapterFormSubmit(form, mode, actId, chapter);
        });

        const cancelBtn = form.querySelector('[data-action="cancel"]');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                ModalUI.close('add-chapter');
                ModalUI.close('edit-chapter');
            });
        }
    }

    /**
     * Gère la soumission du formulaire de chapitre
     * @param {HTMLFormElement} form
     * @param {string} mode
     * @param {number} actId
     * @param {Object|null} chapter
     */
    async function _handleChapterFormSubmit(form, mode, actId, chapter) {
        try {
            const formData = new FormData(form);
            const title = formData.get('title').trim();

            if (!title) {
                ToastUI.error('Erreur', 'Le titre est obligatoire');
                return;
            }

            const state = StateManager.getState();
            const project = state.project;

            if (!project) {
                ToastUI.error('Erreur', 'Aucun projet chargé');
                return;
            }

            const act = project.acts?.find(a => a.id === actId);
            if (!act) {
                ToastUI.error('Erreur', 'Acte introuvable');
                return;
            }

            if (mode === 'add') {
                // Création
                const newChapter = {
                    id: Date.now(),
                    title,
                    scenes: []
                };

                if (!act.chapters) {
                    act.chapters = [];
                }

                act.chapters.push(newChapter);
                ToastUI.success('Chapitre créé', `"${title}" a été créé avec succès.`);

            } else if (mode === 'edit' && chapter) {
                // Modification
                const existingChapter = act.chapters?.find(c => c.id === chapter.id);
                if (existingChapter) {
                    existingChapter.title = title;
                    ToastUI.success('Chapitre modifié', `"${title}" a été modifié avec succès.`);
                }
            }

            StateManager.setState({ project });
            await StorageService.saveProject(project);

            ModalUI.close('add-chapter');
            ModalUI.close('edit-chapter');

        } catch (error) {
            ToastUI.error('Erreur', error.message);
        }
    }

    /**
     * Attache les handlers au formulaire de scène
     * @param {HTMLElement} modal
     * @param {string} mode - 'add' ou 'edit'
     * @param {number} actId
     * @param {number} chapterId
     * @param {Object|null} scene
     */
    function attachSceneFormHandlers(modal, mode, actId, chapterId, scene = null) {
        const form = modal.querySelector('.scene-form');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await _handleSceneFormSubmit(form, mode, actId, chapterId, scene);
        });

        const cancelBtn = form.querySelector('[data-action="cancel"]');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                ModalUI.close('add-scene-structure');
                ModalUI.close('edit-scene-structure');
            });
        }
    }

    /**
     * Gère la soumission du formulaire de scène
     * @param {HTMLFormElement} form
     * @param {string} mode
     * @param {number} actId
     * @param {number} chapterId
     * @param {Object|null} scene
     */
    async function _handleSceneFormSubmit(form, mode, actId, chapterId, scene) {
        try {
            const formData = new FormData(form);
            const title = formData.get('title').trim();

            if (!title) {
                ToastUI.error('Erreur', 'Le titre est obligatoire');
                return;
            }

            const state = StateManager.getState();
            const project = state.project;

            if (!project) {
                ToastUI.error('Erreur', 'Aucun projet chargé');
                return;
            }

            const act = project.acts?.find(a => a.id === actId);
            if (!act) {
                ToastUI.error('Erreur', 'Acte introuvable');
                return;
            }

            const chapter = act.chapters?.find(c => c.id === chapterId);
            if (!chapter) {
                ToastUI.error('Erreur', 'Chapitre introuvable');
                return;
            }

            if (mode === 'add') {
                // Création via SceneService
                const sceneData = {
                    id: Date.now(),
                    title,
                    content: '',
                    status: 'draft'
                };

                // Ajouter la scène au chapitre
                if (!chapter.scenes) {
                    chapter.scenes = [];
                }
                chapter.scenes.push(sceneData);

                StateManager.setState({ project });
                await StorageService.saveProject(project);

                ToastUI.success('Scène créée', `"${title}" a été créée avec succès.`);

            } else if (mode === 'edit' && scene) {
                // Modification
                const existingScene = chapter.scenes?.find(s => s.id === scene.id);
                if (existingScene) {
                    existingScene.title = title;
                    StateManager.setState({ project });
                    await StorageService.saveProject(project);
                    ToastUI.success('Scène modifiée', `"${title}" a été modifiée avec succès.`);
                }
            }

            ModalUI.close('add-scene-structure');
            ModalUI.close('edit-scene-structure');

        } catch (error) {
            ToastUI.error('Erreur', error.message);
        }
    }

    // API publique
    return {
        attachHandlers,
        attachActFormHandlers,
        attachChapterFormHandlers,
        attachSceneFormHandlers
    };
})();

// Exposer globalement
window.StructureHandlers = StructureHandlers;
