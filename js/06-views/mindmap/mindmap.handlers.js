/**
 * Mindmap Handlers
 * Responsible for event handling and CRUD operations on mindmap nodes
 */

const MindmapHandlers = (() => {
    let currentDetailId = null;
    let autosaveDebounce = null;

    function attachListHandlers() {
        const canvas = document.getElementById('mindmap-canvas');
        if (!canvas) return;

        canvas.addEventListener('click', (e) => {
            if (e.target.classList.contains('node-edit-btn')) {
                const node = e.target.closest('.mindmap-node');
                openNodeDetail(node.dataset.nodeId);
            } else if (e.target.classList.contains('node-delete-btn')) {
                const node = e.target.closest('.mindmap-node');
                deleteNode(node.dataset.nodeId);
            } else if (e.target.classList.contains('node-add-child-btn')) {
                const node = e.target.closest('.mindmap-node');
                openAddNodeModal(node.dataset.nodeId);
            }
        });
    }

    function openAddNodeModal(parentId) {
        const html = MindmapRender.renderAddNodeModal(parentId);
        ModalUI.open('Nouveau nœud', html, () => {
            const form = document.getElementById('add-node-form');
            if (form) {
                form.addEventListener('submit', handleAddNode);
            }
        });
    }

    function handleAddNode(e) {
        e.preventDefault();

        const title = document.getElementById('node-title-input').value.trim();
        const type = document.getElementById('node-type-input').value;
        const description = document.getElementById('node-description-input').value.trim();
        const parentId = document.getElementById('node-parent').value;

        if (!title) return;

        const newNode = {
            id: `node-${Date.now()}`,
            title,
            type: type || 'default',
            description,
            notes: '',
            links: [],
            children: [],
            parent: parentId || null,
            createdAt: new Date().toISOString()
        };

        const project = StateManager.getState().project;
        if (!project.mindmap) {
            project.mindmap = [];
        }

        project.mindmap.push(newNode);

        // Update parent if exists
        if (parentId) {
            const parent = project.mindmap.find(n => n.id === parentId);
            if (parent && !parent.children.includes(newNode.id)) {
                parent.children.push(newNode.id);
            }
        }

        StateManager.setState({ project });
        StorageService.saveProject(project);
        EventBus.emit('mindmap:created', newNode);

        ModalUI.close();
        MindmapView.render();
    }

    function openNodeDetail(nodeId) {
        const project = StateManager.getState().project;
        const node = project.mindmap?.find(n => n.id === nodeId);

        if (!node) return;

        currentDetailId = nodeId;
        const html = MindmapRender.renderNodeDetail(node);
        ModalUI.open('Détails du nœud', html, () => {
            attachNodeDetailHandlers(nodeId);
        });
    }

    function attachNodeDetailHandlers(nodeId) {
        const form = document.querySelector('.detail-view');
        if (!form) return;

        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('change', () => saveNodeDetail(nodeId));
            input.addEventListener('input', () => {
                clearTimeout(autosaveDebounce);
                autosaveDebounce = setTimeout(() => saveNodeDetail(nodeId), 1000);
            });
        });
    }

    function saveNodeDetail(nodeId) {
        const project = StateManager.getState().project;
        const node = project.mindmap?.find(n => n.id === nodeId);

        if (!node) return;

        const titleInput = document.getElementById('node-title');
        const typeSelect = document.getElementById('node-type');
        const descriptionInput = document.getElementById('node-description');
        const notesInput = document.getElementById('node-notes');
        const linksInput = document.getElementById('node-links');

        if (titleInput) node.title = titleInput.value.trim();
        if (typeSelect) node.type = typeSelect.value;
        if (descriptionInput) node.description = descriptionInput.value.trim();
        if (notesInput) node.notes = notesInput.value.trim();
        if (linksInput) {
            node.links = linksInput.value.split(',').map(id => id.trim()).filter(id => id);
        }

        StateManager.setState({ project });
        StorageService.saveProject(project);
        EventBus.emit('mindmap:updated', node);
    }

    function deleteNode(nodeId) {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce nœud et tous ses enfants ?')) return;

        const project = StateManager.getState().project;
        const nodesToDelete = getNodeAndChildren(nodeId, project.mindmap);

        project.mindmap = project.mindmap?.filter(n => !nodesToDelete.includes(n.id)) || [];

        // Remove from children arrays
        project.mindmap.forEach(node => {
            if (node.children) {
                node.children = node.children.filter(id => !nodesToDelete.includes(id));
            }
            if (node.links) {
                node.links = node.links.filter(id => !nodesToDelete.includes(id));
            }
        });

        StateManager.setState({ project });
        StorageService.saveProject(project);
        EventBus.emit('mindmap:deleted', nodeId);
        MindmapView.render();

        if (currentDetailId === nodeId) {
            ModalUI.close();
        }
    }

    function getNodeAndChildren(nodeId, nodes) {
        const result = [nodeId];
        const node = nodes?.find(n => n.id === nodeId);

        if (node && node.children) {
            node.children.forEach(childId => {
                result.push(...getNodeAndChildren(childId, nodes));
            });
        }

        return result;
    }

    function getAllNodes() {
        const project = StateManager.getState().project;
        return project.mindmap || [];
    }

    function getRootNodes() {
        const project = StateManager.getState().project;
        const nodes = project.mindmap || [];
        return nodes.filter(n => !n.parent || n.parent === '');
    }

    function getNodeStats() {
        const nodes = getAllNodes();
        const roots = getRootNodes();

        return {
            total: nodes.length,
            roots: roots.length,
            byType: {
                default: nodes.filter(n => n.type === 'default' || !n.type).length,
                concept: nodes.filter(n => n.type === 'concept').length,
                character: nodes.filter(n => n.type === 'character').length,
                location: nodes.filter(n => n.type === 'location').length,
                event: nodes.filter(n => n.type === 'event').length,
                symbol: nodes.filter(n => n.type === 'symbol').length
            }
        };
    }

    return {
        attachListHandlers,
        openAddNodeModal,
        openNodeDetail,
        deleteNode,
        getAllNodes,
        getRootNodes,
        getNodeStats
    };
})();
