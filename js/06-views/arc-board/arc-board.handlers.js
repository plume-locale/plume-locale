// ============================================
// ARC BOARD HANDLERS - Gestionnaires Arc Board
// ============================================

const ArcBoardHandlers = (function() {
    'use strict';

    function attachHandlers(container) {
        if (!container) return;
        DOMUtils.delegate(container, 'click', '[data-action]', _handleAction);
    }

    function _handleAction(e) {
        const target = e.target.closest('[data-action]');
        const action = target?.dataset.action;
        const arcId = target?.dataset.arcId ? parseInt(target.dataset.arcId) : null;
        const category = target?.dataset.category;

        switch (action) {
            case 'add-arc':
                ArcBoardView.openAddModal();
                break;
            case 'edit-arc':
                if (arcId) ArcBoardView.openEditModal(arcId);
                break;
            case 'delete-arc':
                if (arcId) ArcBoardView.deleteArc(arcId);
                break;
            case 'filter':
                if (category) ArcBoardView.setFilter(category);
                break;
        }
    }

    function attachFormHandlers(modal, mode, arc = null) {
        const form = modal.querySelector('.arc-form');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await _handleFormSubmit(form, mode, arc);
        });

        const cancelBtn = form.querySelector('[data-action="cancel"]');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                ModalUI.close('add-arc');
                ModalUI.close('edit-arc');
            });
        }
    }

    async function _handleFormSubmit(form, mode, arc) {
        try {
            const formData = new FormData(form);
            const data = {
                title: formData.get('title').trim(),
                description: formData.get('description').trim(),
                category: formData.get('category'),
                priority: formData.get('priority'),
                color: formData.get('color')
            };

            if (!data.title) {
                ToastUI.error('Erreur', 'Le titre est obligatoire');
                return;
            }

            const state = StateManager.getState();
            const project = state.project;

            if (!project) {
                ToastUI.error('Erreur', 'Aucun projet chargé');
                return;
            }

            if (!project.arcs) {
                project.arcs = [];
            }

            if (mode === 'add') {
                const newArc = new Arc({
                    ...data,
                    id: Date.now(),
                    status: 'planned',
                    scenes: [],
                    milestones: []
                });

                project.arcs.push(newArc.toJSON());
                ToastUI.success('Arc créé', `"${data.title}" a été créé.`);

            } else if (mode === 'edit' && arc) {
                const existingArc = project.arcs.find(a => a.id === arc.id);
                if (existingArc) {
                    Object.assign(existingArc, data);
                    existingArc.updatedAt = Date.now();
                    ToastUI.success('Arc modifié', `"${data.title}" a été modifié.`);
                }
            }

            StateManager.setState({ project });
            await StorageService.saveProject(project);

            ModalUI.close('add-arc');
            ModalUI.close('edit-arc');

        } catch (error) {
            ToastUI.error('Erreur', error.message);
        }
    }

    return { attachHandlers, attachFormHandlers };
})();

window.ArcBoardHandlers = ArcBoardHandlers;
