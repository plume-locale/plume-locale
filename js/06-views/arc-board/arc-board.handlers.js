/**
 * Arc Board Handlers
 * Responsible for event handling and CRUD operations on narrative arcs
 */

const ArcBoardHandlers = (() => {
    let currentDetailId = null;
    let autosaveDebounce = null;

    function attachListHandlers() {
        const board = document.querySelector('.arc-board');
        if (!board) return;

        board.addEventListener('click', (e) => {
            const track = e.target.closest('.arc-track');
            if (!track) return;

            const arcId = track.dataset.arcId;

            if (e.target.classList.contains('arc-view-btn')) {
                openArcDetail(arcId);
            } else if (e.target.classList.contains('arc-edit-btn')) {
                openArcDetail(arcId);
            } else if (e.target.classList.contains('arc-delete-btn')) {
                deleteArc(arcId);
            } else if (e.target.classList.contains('arc-phase')) {
                const phase = e.target.dataset.phase;
                updateArcPhase(arcId, phase);
            }
        });
    }

    function openAddArcModal() {
        const html = ArcBoardRender.renderAddArcModal();
        ModalUI.open('Nouvel arc narratif', html, () => {
            const form = document.getElementById('add-arc-form');
            if (form) {
                form.addEventListener('submit', handleAddArc);
            }
        });
    }

    function handleAddArc(e) {
        e.preventDefault();

        const title = document.getElementById('arc-title-input').value.trim();
        const type = document.getElementById('arc-type-input').value;
        const description = document.getElementById('arc-description-input').value.trim();

        if (!title) return;

        const newArc = {
            id: `arc-${Date.now()}`,
            title,
            characterId: type || 'main',
            description,
            currentPhase: 'setup',
            status: 'Actif',
            notes: '',
            color: ArcBoardRender.getArcColor(Math.random() * 8),
            createdAt: new Date().toISOString()
        };

        const project = StateManager.getState().project;
        if (!project.arcs) {
            project.arcs = [];
        }

        project.arcs.push(newArc);
        StateManager.setState({ project });
        StorageService.saveProject(project);
        EventBus.emit('arcBoard:created', newArc);

        ModalUI.close();
        ArcBoardView.render();
    }

    function openArcDetail(arcId) {
        const project = StateManager.getState().project;
        const arc = project.arcs?.find(a => a.id === arcId);

        if (!arc) return;

        currentDetailId = arcId;
        const html = ArcBoardRender.renderArcDetail(arc);
        ModalUI.open('Détails de l\'arc', html, () => {
            attachArcDetailHandlers(arcId);
        });
    }

    function attachArcDetailHandlers(arcId) {
        const form = document.querySelector('.detail-view');
        if (!form) return;

        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('change', () => saveArcDetail(arcId));
            input.addEventListener('input', () => {
                clearTimeout(autosaveDebounce);
                autosaveDebounce = setTimeout(() => saveArcDetail(arcId), 1000);
            });
        });
    }

    function saveArcDetail(arcId) {
        const project = StateManager.getState().project;
        const arc = project.arcs?.find(a => a.id === arcId);

        if (!arc) return;

        const titleInput = document.getElementById('arc-title');
        const characterSelect = document.getElementById('arc-character');
        const phaseSelect = document.getElementById('arc-phase');
        const statusSelect = document.getElementById('arc-status');
        const descriptionInput = document.getElementById('arc-description');
        const notesInput = document.getElementById('arc-notes');

        if (titleInput) arc.title = titleInput.value.trim();
        if (characterSelect) arc.characterId = characterSelect.value;
        if (phaseSelect) arc.currentPhase = phaseSelect.value;
        if (statusSelect) arc.status = statusSelect.value;
        if (descriptionInput) arc.description = descriptionInput.value.trim();
        if (notesInput) arc.notes = notesInput.value.trim();

        StateManager.setState({ project });
        StorageService.saveProject(project);
        EventBus.emit('arcBoard:updated', arc);
    }

    function updateArcPhase(arcId, phase) {
        const project = StateManager.getState().project;
        const arc = project.arcs?.find(a => a.id === arcId);

        if (!arc) return;

        arc.currentPhase = phase;
        StateManager.setState({ project });
        StorageService.saveProject(project);
        EventBus.emit('arcBoard:updated', arc);
        ArcBoardView.render();
    }

    function deleteArc(arcId) {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cet arc ?')) return;

        const project = StateManager.getState().project;
        project.arcs = project.arcs?.filter(a => a.id !== arcId) || [];

        StateManager.setState({ project });
        StorageService.saveProject(project);
        EventBus.emit('arcBoard:deleted', arcId);
        ArcBoardView.render();

        if (currentDetailId === arcId) {
            ModalUI.close();
        }
    }

    function filterByStatus(status) {
        const project = StateManager.getState().project;
        const arcs = project.arcs || [];
        return arcs.filter(a => a.status === status);
    }

    function filterByPhase(phase) {
        const project = StateManager.getState().project;
        const arcs = project.arcs || [];
        return arcs.filter(a => a.currentPhase === phase);
    }

    function filterByType(type) {
        const project = StateManager.getState().project;
        const arcs = project.arcs || [];
        return arcs.filter(a => a.characterId === type);
    }

    function getArcStats() {
        const project = StateManager.getState().project;
        const arcs = project.arcs || [];

        return {
            total: arcs.length,
            active: arcs.filter(a => a.status === 'Actif').length,
            completed: arcs.filter(a => a.status === 'Complété').length,
            byPhase: {
                setup: arcs.filter(a => a.currentPhase === 'setup').length,
                development: arcs.filter(a => a.currentPhase === 'development').length,
                climax: arcs.filter(a => a.currentPhase === 'climax').length,
                resolution: arcs.filter(a => a.currentPhase === 'resolution').length
            }
        };
    }

    return {
        attachListHandlers,
        openAddArcModal,
        openArcDetail,
        deleteArc,
        updateArcPhase,
        filterByStatus,
        filterByPhase,
        filterByType,
        getArcStats
    };
})();
