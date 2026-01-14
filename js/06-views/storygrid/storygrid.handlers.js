/**
 * Storygrid Handlers
 * Responsible for event handling and CRUD operations on storygrid elements
 */

const StorygridHandlers = (() => {
    let currentDetailId = null;
    let autosaveDebounce = null;

    function attachListHandlers() {
        const table = document.querySelector('.storygrid-table');
        if (!table) return;

        table.addEventListener('click', (e) => {
            if (e.target.classList.contains('cell-edit-btn')) {
                const cell = e.target.closest('.storygrid-cell');
                const row = cell.dataset.row;
                const phase = cell.dataset.phase;
                openCellDetail(row, phase);
            }
        });
    }

    function openAddStorygridModal() {
        const html = StorygridRender.renderAddStorygridModal();
        ModalUI.open('Nouvel élément Story Grid', html, () => {
            const form = document.getElementById('add-element-form');
            if (form) {
                form.addEventListener('submit', handleAddElement);
            }
        });
    }

    function handleAddElement(e) {
        e.preventDefault();

        const title = document.getElementById('element-title-input').value.trim();
        const row = document.getElementById('element-row-input').value;
        const phase = document.getElementById('element-phase-input').value;
        const description = document.getElementById('element-description-input').value.trim();

        if (!title) return;

        const newElement = {
            id: `grid-${Date.now()}`,
            title,
            row: row || 'protagonist',
            phase: phase || 'beginning',
            description,
            characters: [],
            locations: [],
            createdAt: new Date().toISOString()
        };

        const project = StateManager.getState().project;
        if (!project.storygrid) {
            project.storygrid = [];
        }

        project.storygrid.push(newElement);
        StateManager.setState({ project });
        StorageService.saveProject(project);
        EventBus.emit('storygrid:created', newElement);

        ModalUI.close();
        StorygridView.render();
    }

    function openCellDetail(row, phase) {
        const project = StateManager.getState().project;
        const elements = project.storygrid || [];
        let element = elements.find(e => e.row === row && e.phase === phase);

        // If cell doesn't exist, create a placeholder
        if (!element) {
            element = {
                id: `grid-${Date.now()}`,
                title: '',
                row,
                phase,
                description: '',
                characters: [],
                locations: [],
                isNew: true
            };
        }

        currentDetailId = element.id;
        const html = StorygridRender.renderStorygridDetail(element);
        ModalUI.open('Éditer élément', html, () => {
            attachElementDetailHandlers(element.id, element.isNew);
        });
    }

    function attachElementDetailHandlers(elementId, isNew) {
        const form = document.querySelector('.detail-view');
        if (!form) return;

        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('change', () => saveElementDetail(elementId, isNew));
            input.addEventListener('input', () => {
                clearTimeout(autosaveDebounce);
                autosaveDebounce = setTimeout(() => saveElementDetail(elementId, isNew), 1000);
            });
        });
    }

    function saveElementDetail(elementId, isNew) {
        const project = StateManager.getState().project;
        let element = project.storygrid?.find(e => e.id === elementId);

        const titleInput = document.getElementById('element-title');
        const rowSelect = document.getElementById('element-row');
        const phaseSelect = document.getElementById('element-phase');
        const descriptionInput = document.getElementById('element-description');
        const charactersInput = document.getElementById('element-characters');
        const locationsInput = document.getElementById('element-locations');

        const newData = {
            id: elementId,
            title: titleInput?.value.trim() || '',
            row: rowSelect?.value || 'protagonist',
            phase: phaseSelect?.value || 'beginning',
            description: descriptionInput?.value.trim() || '',
            characters: charactersInput ? charactersInput.value.split(',').map(c => c.trim()).filter(c => c) : [],
            locations: locationsInput ? locationsInput.value.split(',').map(l => l.trim()).filter(l => l) : [],
            createdAt: new Date().toISOString()
        };

        if (!newData.title) return; // Don't save if empty

        if (!project.storygrid) {
            project.storygrid = [];
        }

        if (isNew || !element) {
            // Add new element
            project.storygrid.push(newData);
            EventBus.emit('storygrid:created', newData);
        } else {
            // Update existing element
            Object.assign(element, newData);
            EventBus.emit('storygrid:updated', newData);
        }

        StateManager.setState({ project });
        StorageService.saveProject(project);
    }

    function deleteElement(elementId) {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) return;

        const project = StateManager.getState().project;
        project.storygrid = project.storygrid?.filter(e => e.id !== elementId) || [];

        StateManager.setState({ project });
        StorageService.saveProject(project);
        EventBus.emit('storygrid:deleted', elementId);
        StorygridView.render();

        if (currentDetailId === elementId) {
            ModalUI.close();
        }
    }

    function filterByRow(row) {
        const project = StateManager.getState().project;
        const elements = project.storygrid || [];
        return elements.filter(e => e.row === row);
    }

    function filterByPhase(phase) {
        const project = StateManager.getState().project;
        const elements = project.storygrid || [];
        return elements.filter(e => e.phase === phase);
    }

    function getStorygridStats() {
        const project = StateManager.getState().project;
        const elements = project.storygrid || [];

        const rows = {};
        const phases = {};

        elements.forEach(e => {
            rows[e.row] = (rows[e.row] || 0) + 1;
            phases[e.phase] = (phases[e.phase] || 0) + 1;
        });

        return {
            total: elements.length,
            byRow: rows,
            byPhase: phases,
            coverage: Math.round((elements.length / 16) * 100) // 4 rows x 4 phases = 16 cells
        };
    }

    return {
        attachListHandlers,
        openAddStorygridModal,
        openCellDetail,
        deleteElement,
        filterByRow,
        filterByPhase,
        getStorygridStats
    };
})();
