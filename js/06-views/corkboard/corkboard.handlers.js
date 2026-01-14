/**
 * Corkboard Handlers
 * Responsible for event handling and CRUD operations on corkboard pins
 */

const CorkboardHandlers = (() => {
    let currentDetailId = null;
    let autosaveDebounce = null;
    let draggedPin = null;
    let selectedColor = 'yellow';

    function attachListHandlers() {
        const grid = document.querySelector('.corkboard-grid');
        if (!grid) return;

        // Drag and drop for repositioning
        grid.addEventListener('dragstart', (e) => {
            if (e.target.closest('.corkboard-pin')) {
                draggedPin = e.target.closest('.corkboard-pin');
                draggedPin.style.opacity = '0.7';
                e.dataTransfer.effectAllowed = 'move';
            }
        });

        grid.addEventListener('dragend', (e) => {
            if (draggedPin) {
                draggedPin.style.opacity = '1';
                draggedPin = null;
            }
        });

        grid.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
        });

        grid.addEventListener('drop', (e) => {
            e.preventDefault();
            if (!draggedPin) return;

            const rect = grid.getBoundingClientRect();
            const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
            const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));

            const pinId = draggedPin.dataset.pinId;
            updatePinPosition(pinId, x, y);
        });

        // Click handlers for pins
        grid.addEventListener('click', (e) => {
            const pin = e.target.closest('.corkboard-pin');
            if (!pin) return;

            const pinId = pin.dataset.pinId;
            if (e.target.classList.contains('pin-delete')) {
                deletePin(pinId);
            } else {
                openPinDetail(pinId);
            }
        });
    }

    function openAddCorkboardModal() {
        selectedColor = 'yellow';
        const html = CorkboardRender.renderAddCorkboardModal();
        ModalUI.open('Nouvelle épingle', html, () => {
            const form = document.getElementById('add-pin-form');
            if (form) {
                // Color selection
                const colorButtons = form.querySelectorAll('.color-option');
                colorButtons.forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        e.preventDefault();
                        colorButtons.forEach(b => b.style.border = 'none');
                        selectedColor = e.target.dataset.color;
                        e.target.style.border = '2px solid var(--text)';
                    });
                });

                form.addEventListener('submit', handleAddPin);
            }
        });
    }

    function handleAddPin(e) {
        e.preventDefault();

        const title = document.getElementById('pin-title-input').value.trim();
        const text = document.getElementById('pin-text-input').value.trim();
        const category = document.getElementById('pin-category-input').value.trim();

        if (!title) return;

        const newPin = {
            id: `pin-${Date.now()}`,
            title,
            text,
            category: category || '',
            color: selectedColor || 'yellow',
            position: { x: Math.random() * 80, y: Math.random() * 80 },
            linkedTo: [],
            createdAt: new Date().toISOString()
        };

        const project = StateManager.getState().project;
        if (!project.corkboard) {
            project.corkboard = [];
        }

        project.corkboard.push(newPin);
        StateManager.setState({ project });
        StorageService.saveProject(project);
        EventBus.emit('corkboard:created', newPin);

        ModalUI.close();
        CorkboardView.render();
    }

    function openPinDetail(pinId) {
        const project = StateManager.getState().project;
        const pin = project.corkboard?.find(p => p.id === pinId);

        if (!pin) return;

        currentDetailId = pinId;
        selectedColor = pin.color || 'yellow';
        const html = CorkboardRender.renderCorkboardDetail(pin);
        ModalUI.open('Détails de l\'épingle', html, () => {
            attachPinDetailHandlers(pinId);
        });
    }

    function attachPinDetailHandlers(pinId) {
        const form = document.querySelector('.detail-view');
        if (!form) return;

        // Color selection
        const colorButtons = form.querySelectorAll('.color-option');
        colorButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                colorButtons.forEach(b => b.style.border = 'none');
                selectedColor = e.target.dataset.color;
                e.target.style.border = '2px solid var(--text)';
                savePinDetail(pinId);
            });
        });

        // Auto-save on text inputs
        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('change', () => savePinDetail(pinId));
            input.addEventListener('input', () => {
                clearTimeout(autosaveDebounce);
                autosaveDebounce = setTimeout(() => savePinDetail(pinId), 1000);
            });
        });
    }

    function savePinDetail(pinId) {
        const project = StateManager.getState().project;
        const pin = project.corkboard?.find(p => p.id === pinId);

        if (!pin) return;

        const titleInput = document.getElementById('pin-title');
        const categoryInput = document.getElementById('pin-category');
        const textInput = document.getElementById('pin-text');
        const linkedInput = document.getElementById('pin-linked');

        if (titleInput) pin.title = titleInput.value.trim();
        if (categoryInput) pin.category = categoryInput.value.trim();
        if (textInput) pin.text = textInput.value.trim();
        if (linkedInput) {
            pin.linkedTo = linkedInput.value.split(',').map(id => id.trim()).filter(id => id);
        }

        pin.color = selectedColor || pin.color;

        StateManager.setState({ project });
        StorageService.saveProject(project);
        EventBus.emit('corkboard:updated', pin);
    }

    function updatePinPosition(pinId, x, y) {
        const project = StateManager.getState().project;
        const pin = project.corkboard?.find(p => p.id === pinId);

        if (!pin) return;

        pin.position = { x, y };
        StateManager.setState({ project });
        StorageService.saveProject(project);
        EventBus.emit('corkboard:updated', pin);
        CorkboardView.render();
    }

    function deletePin(pinId) {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette épingle ?')) return;

        const project = StateManager.getState().project;
        project.corkboard = project.corkboard?.filter(p => p.id !== pinId) || [];

        // Remove from linkedTo in other pins
        project.corkboard.forEach(pin => {
            pin.linkedTo = pin.linkedTo?.filter(id => id !== pinId) || [];
        });

        StateManager.setState({ project });
        StorageService.saveProject(project);
        EventBus.emit('corkboard:deleted', pinId);
        CorkboardView.render();

        if (currentDetailId === pinId) {
            ModalUI.close();
        }
    }

    function filterByCategory(category) {
        const project = StateManager.getState().project;
        const pins = project.corkboard || [];
        return pins.filter(p => p.category === category);
    }

    function filterByColor(color) {
        const project = StateManager.getState().project;
        const pins = project.corkboard || [];
        return pins.filter(p => p.color === color);
    }

    function searchPins(query) {
        const project = StateManager.getState().project;
        const pins = project.corkboard || [];
        const lowerQuery = query.toLowerCase();

        return pins.filter(p =>
            p.title.toLowerCase().includes(lowerQuery) ||
            p.text?.toLowerCase().includes(lowerQuery) ||
            p.category?.toLowerCase().includes(lowerQuery)
        );
    }

    function getAllCategories() {
        const project = StateManager.getState().project;
        const pins = project.corkboard || [];
        const categories = new Set();

        pins.forEach(pin => {
            if (pin.category) {
                categories.add(pin.category);
            }
        });

        return Array.from(categories).sort();
    }

    return {
        attachListHandlers,
        openAddCorkboardModal,
        openPinDetail,
        deletePin,
        filterByCategory,
        filterByColor,
        searchPins,
        getAllCategories
    };
})();
