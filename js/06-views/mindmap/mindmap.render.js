/**
 * Mindmap Render
 * Responsible for generating HTML templates for the mindmap view
 */

const MindmapRender = (() => {
    function renderMindmap(nodes, rootId) {
        if (!nodes || nodes.length === 0) {
            return renderEmptyMindmap();
        }

        const root = nodes.find(n => n.id === rootId) || nodes[0];
        if (!root) return renderEmptyMindmap();

        return `
            <div class="mindmap-container">
                <div class="mindmap-canvas" id="mindmap-canvas">
                    ${renderNode(root, nodes, 0)}
                </div>
            </div>
        `;
    }

    function renderNode(node, allNodes, level) {
        const children = node.children ? allNodes.filter(n => node.children.includes(n.id)) : [];
        const hasChildren = children.length > 0;

        return `
            <div class="mindmap-node" data-node-id="${node.id}" data-level="${level}">
                <div class="node-card ${node.type || 'default'}">
                    <div class="node-content">
                        <h4 class="node-title">${escapeHtml(node.title)}</h4>
                        ${node.description ? `<p class="node-desc">${escapeHtml(node.description.substring(0, 50))}</p>` : ''}
                    </div>
                    <div class="node-controls">
                        <button class="node-edit-btn" title="Éditer">✏️</button>
                        <button class="node-add-child-btn" title="Ajouter enfant">+</button>
                        <button class="node-delete-btn" title="Supprimer">×</button>
                    </div>
                </div>

                ${hasChildren ? `
                    <div class="node-children">
                        ${children.map(child => renderNode(child, allNodes, level + 1)).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    }

    function renderNodeDetail(node) {
        return `
            <div class="detail-view">
                <div class="detail-header">
                    <input type="text" id="node-title" class="detail-title-input" 
                           value="${escapeHtml(node.title || '')}" placeholder="Titre">
                </div>

                <div class="detail-section">
                    <div class="detail-section-title">Type</div>
                    <select id="node-type" class="form-input">
                        <option value="default" ${node.type === 'default' ? 'selected' : ''}>Défaut</option>
                        <option value="concept" ${node.type === 'concept' ? 'selected' : ''}>Concept</option>
                        <option value="character" ${node.type === 'character' ? 'selected' : ''}>Personnage</option>
                        <option value="location" ${node.type === 'location' ? 'selected' : ''}>Lieu</option>
                        <option value="event" ${node.type === 'event' ? 'selected' : ''}>Événement</option>
                        <option value="symbol" ${node.type === 'symbol' ? 'selected' : ''}>Symbole</option>
                    </select>
                </div>

                <div class="detail-section">
                    <div class="detail-section-title">Description</div>
                    <textarea id="node-description" class="form-input" rows="6" 
                              placeholder="Description du nœud">${escapeHtml(node.description || '')}</textarea>
                </div>

                <div class="detail-section">
                    <div class="detail-section-title">Notes</div>
                    <textarea id="node-notes" class="form-input" rows="4" 
                              placeholder="Notes personnelles">${escapeHtml(node.notes || '')}</textarea>
                </div>

                <div class="detail-section">
                    <div class="detail-section-title">Lié à</div>
                    <input type="text" id="node-links" class="form-input" 
                           value="${escapeHtml(node.links ? node.links.join(', ') : '')}" 
                           placeholder="IDs d'autres nœuds, séparés par des virgules">
                </div>
            </div>
        `;
    }

    function renderAddNodeModal(parentId) {
        return `
            <form id="add-node-form">
                <div class="modal-field">
                    <label>Titre du nœud *</label>
                    <input type="text" id="node-title-input" class="form-input" 
                           placeholder="Titre" required autofocus>
                </div>

                <div class="modal-field">
                    <label>Type</label>
                    <select id="node-type-input" class="form-input">
                        <option value="default">Défaut</option>
                        <option value="concept">Concept</option>
                        <option value="character">Personnage</option>
                        <option value="location">Lieu</option>
                        <option value="event">Événement</option>
                        <option value="symbol">Symbole</option>
                    </select>
                </div>

                <div class="modal-field">
                    <label>Description</label>
                    <textarea id="node-description-input" class="form-input" rows="3" 
                              placeholder="Description"></textarea>
                </div>

                <input type="hidden" id="node-parent" value="${parentId || ''}">

                <div class="modal-actions">
                    <button type="button" class="btn-secondary" onclick="ModalUI.close()">Annuler</button>
                    <button type="submit" class="btn">Créer</button>
                </div>
            </form>
        `;
    }

    function renderEmptyMindmap() {
        return `
            <div style="padding: 2rem 1rem; text-align: center; color: var(--text-muted); font-size: 0.85rem;">
                <i data-lucide="git-branch" style="width:32px;height:32px;margin-bottom:0.5rem;opacity:0.5;"></i>
                <p>Aucun nœud dans la carte mentale</p>
            </div>
        `;
    }

    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    return {
        renderMindmap,
        renderNode,
        renderNodeDetail,
        renderAddNodeModal,
        renderEmptyMindmap,
        escapeHtml
    };
})();
