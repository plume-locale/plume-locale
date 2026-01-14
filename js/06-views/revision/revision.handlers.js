/**
 * Revision Handlers
 * Responsible for event handling and CRUD operations on revisions
 */

const RevisionHandlers = (() => {
    let currentDetailId = null;
    let autosaveDebounce = null;

    function attachListHandlers() {
        const listContainer = document.querySelector('.revisions-list');
        if (!listContainer) return;

        listContainer.addEventListener('click', (e) => {
            const revisionItem = e.target.closest('.revision-item');
            if (!revisionItem) return;

            const revisionId = revisionItem.dataset.revisionId;

            if (e.target.classList.contains('revision-view-btn')) {
                openRevisionDetail(revisionId);
            } else if (e.target.classList.contains('revision-delete-btn')) {
                deleteRevision(revisionId);
            } else if (e.target.classList.contains('revision-restore-btn')) {
                restoreRevision(revisionId);
            } else if (e.target.classList.contains('revision-compare-btn')) {
                compareRevisions(revisionId);
            }
        });
    }

    function openAddRevisionModal() {
        const html = RevisionRender.renderAddRevisionModal();
        ModalUI.open('Nouvelle révision', html, () => {
            const form = document.getElementById('add-revision-form');
            if (form) {
                form.addEventListener('submit', handleAddRevision);
            }
        });
    }

    function handleAddRevision(e) {
        e.preventDefault();

        const title = document.getElementById('revision-title-input').value.trim();
        const type = document.getElementById('revision-type-input').value;
        const description = document.getElementById('revision-description-input').value.trim();

        if (!title) return;

        const newRevision = {
            id: `rev-${Date.now()}`,
            title,
            type: type || 'Révision',
            description,
            status: 'active',
            notes: '',
            changes: [],
            timestamp: new Date().toISOString(),
            createdAt: new Date().toISOString()
        };

        const project = StateManager.getState().project;
        if (!project.revisions) {
            project.revisions = [];
        }

        project.revisions.push(newRevision);
        StateManager.setState({ project });
        StorageService.saveProject(project);
        EventBus.emit('revisions:created', newRevision);

        ModalUI.close();
        RevisionView.render();
    }

    function openRevisionDetail(revisionId) {
        const project = StateManager.getState().project;
        const revision = project.revisions?.find(r => r.id === revisionId);

        if (!revision) return;

        currentDetailId = revisionId;
        const html = RevisionRender.renderRevisionDetail(revision);
        ModalUI.open('Détails de la révision', html, () => {
            attachRevisionDetailHandlers(revisionId);
        });
    }

    function attachRevisionDetailHandlers(revisionId) {
        const form = document.querySelector('.detail-view');
        if (!form) return;

        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('change', () => saveRevisionDetail(revisionId));
            input.addEventListener('input', () => {
                clearTimeout(autosaveDebounce);
                autosaveDebounce = setTimeout(() => saveRevisionDetail(revisionId), 1000);
            });
        });
    }

    function saveRevisionDetail(revisionId) {
        const project = StateManager.getState().project;
        const revision = project.revisions?.find(r => r.id === revisionId);

        if (!revision) return;

        const titleInput = document.getElementById('revision-title');
        const typeSelect = document.getElementById('revision-type');
        const statusSelect = document.getElementById('revision-status');
        const descriptionInput = document.getElementById('revision-description');
        const notesInput = document.getElementById('revision-notes');
        const changesInput = document.getElementById('revision-changes');

        if (titleInput) revision.title = titleInput.value.trim();
        if (typeSelect) revision.type = typeSelect.value;
        if (statusSelect) revision.status = statusSelect.value;
        if (descriptionInput) revision.description = descriptionInput.value.trim();
        if (notesInput) revision.notes = notesInput.value.trim();
        if (changesInput) {
            revision.changes = changesInput.value.split(',').map(c => c.trim()).filter(c => c);
        }

        StateManager.setState({ project });
        StorageService.saveProject(project);
        EventBus.emit('revisions:updated', revision);
    }

    function deleteRevision(revisionId) {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette révision ?')) return;

        const project = StateManager.getState().project;
        project.revisions = project.revisions?.filter(r => r.id !== revisionId) || [];

        StateManager.setState({ project });
        StorageService.saveProject(project);
        EventBus.emit('revisions:deleted', revisionId);
        RevisionView.render();

        if (currentDetailId === revisionId) {
            ModalUI.close();
        }
    }

    function restoreRevision(revisionId) {
        const project = StateManager.getState().project;
        const revision = project.revisions?.find(r => r.id === revisionId);

        if (!revision) return;

        if (confirm(`Restaurer la révision "${revision.title}" ? Cette action ne peut pas être annulée.`)) {
            // This would restore the project state to this revision
            // Implementation depends on how snapshots are stored
            EventBus.emit('revisions:restored', revision);
        }
    }

    function compareRevisions(revisionId) {
        const project = StateManager.getState().project;
        const revisions = project.revisions || [];
        const currentIndex = revisions.findIndex(r => r.id === revisionId);

        if (currentIndex < 0) return;

        const current = revisions[currentIndex];
        const previous = currentIndex + 1 < revisions.length ? revisions[currentIndex + 1] : null;

        if (!previous) {
            alert('Aucune révision précédente pour comparer');
            return;
        }

        EventBus.emit('revisions:compared', { current, previous });
    }

    function filterByType(type) {
        const project = StateManager.getState().project;
        const revisions = project.revisions || [];
        return revisions.filter(r => r.type === type);
    }

    function filterByStatus(status) {
        const project = StateManager.getState().project;
        const revisions = project.revisions || [];
        return revisions.filter(r => r.status === status);
    }

    function searchRevisions(query) {
        const project = StateManager.getState().project;
        const revisions = project.revisions || [];
        const lowerQuery = query.toLowerCase();

        return revisions.filter(r =>
            r.title.toLowerCase().includes(lowerQuery) ||
            r.description?.toLowerCase().includes(lowerQuery) ||
            r.notes?.toLowerCase().includes(lowerQuery)
        );
    }

    return {
        attachListHandlers,
        openAddRevisionModal,
        openRevisionDetail,
        deleteRevision,
        restoreRevision,
        compareRevisions,
        filterByType,
        filterByStatus,
        searchRevisions
    };
})();
