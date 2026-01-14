/**
 * Storygrid Render
 * Responsible for generating HTML templates for the storygrid view
 */

const StorygridRender = (() => {
    function renderStorygrid(elements) {
        if (!elements || elements.length === 0) {
            return renderEmptyStorygrid();
        }

        const grid = groupElementsByRow(elements);

        return `
            <div class="storygrid-container">
                <table class="storygrid-table">
                    <thead>
                        <tr>
                            <th>Ligne</th>
                            <th>Début</th>
                            <th>Réaction</th>
                            <th>Décision</th>
                            <th>Fin</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${Object.entries(grid).map(([row, cells]) => renderStorygridRow(row, cells)).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    function renderStorygridRow(row, cells) {
        return `
            <tr class="storygrid-row" data-row="${row}">
                <td class="row-label">${getRowLabel(row)}</td>
                ${['beginning', 'reaction', 'decision', 'end'].map(phase => {
                    const cell = cells[phase] || {};
                    return `
                        <td class="storygrid-cell" data-phase="${phase}" data-row="${row}">
                            <div class="cell-content">
                                ${cell.title ? `<strong>${escapeHtml(cell.title)}</strong>` : '<em>Vide</em>'}
                                ${cell.description ? `<p>${escapeHtml(cell.description)}</p>` : ''}
                            </div>
                            <button class="cell-edit-btn" title="Éditer">✏️</button>
                        </td>
                    `;
                }).join('')}
            </tr>
        `;
    }

    function renderStorygridDetail(element) {
        return `
            <div class="detail-view">
                <div class="detail-header">
                    <input type="text" id="element-title" class="detail-title-input" 
                           value="${escapeHtml(element.title || '')}" 
                           placeholder="Titre de l'élément">
                </div>

                <div class="detail-section">
                    <div class="detail-section-title">Ligne</div>
                    <select id="element-row" class="form-input">
                        <option value="protagonist" ${element.row === 'protagonist' ? 'selected' : ''}>Protagoniste</option>
                        <option value="consequence" ${element.row === 'consequence' ? 'selected' : ''}>Conséquence</option>
                        <option value="expectation" ${element.row === 'expectation' ? 'selected' : ''}>Attente</option>
                        <option value="theme" ${element.row === 'theme' ? 'selected' : ''}>Thème</option>
                    </select>
                </div>

                <div class="detail-section">
                    <div class="detail-section-title">Phase</div>
                    <select id="element-phase" class="form-input">
                        <option value="beginning" ${element.phase === 'beginning' ? 'selected' : ''}>Début</option>
                        <option value="reaction" ${element.phase === 'reaction' ? 'selected' : ''}>Réaction</option>
                        <option value="decision" ${element.phase === 'decision' ? 'selected' : ''}>Décision</option>
                        <option value="end" ${element.phase === 'end' ? 'selected' : ''}>Fin</option>
                    </select>
                </div>

                <div class="detail-section">
                    <div class="detail-section-title">Description</div>
                    <textarea id="element-description" class="form-input" rows="6" 
                              placeholder="Détails de cet élément d'histoire">${escapeHtml(element.description || '')}</textarea>
                </div>

                <div class="detail-section">
                    <div class="detail-section-title">Personnages impliqués</div>
                    <input type="text" id="element-characters" class="form-input" 
                           value="${escapeHtml(element.characters ? element.characters.join(', ') : '')}" 
                           placeholder="Noms séparés par des virgules">
                </div>

                <div class="detail-section">
                    <div class="detail-section-title">Lieux</div>
                    <input type="text" id="element-locations" class="form-input" 
                           value="${escapeHtml(element.locations ? element.locations.join(', ') : '')}" 
                           placeholder="Lieux séparés par des virgules">
                </div>
            </div>
        `;
    }

    function renderAddStorygridModal() {
        return `
            <form id="add-element-form">
                <div class="modal-field">
                    <label>Titre de l'élément *</label>
                    <input type="text" id="element-title-input" class="form-input" 
                           placeholder="Titre" required autofocus>
                </div>

                <div class="modal-field">
                    <label>Ligne</label>
                    <select id="element-row-input" class="form-input">
                        <option value="protagonist">Protagoniste</option>
                        <option value="consequence">Conséquence</option>
                        <option value="expectation">Attente</option>
                        <option value="theme">Thème</option>
                    </select>
                </div>

                <div class="modal-field">
                    <label>Phase</label>
                    <select id="element-phase-input" class="form-input">
                        <option value="beginning">Début</option>
                        <option value="reaction">Réaction</option>
                        <option value="decision">Décision</option>
                        <option value="end">Fin</option>
                    </select>
                </div>

                <div class="modal-field">
                    <label>Description</label>
                    <textarea id="element-description-input" class="form-input" rows="3" 
                              placeholder="Description"></textarea>
                </div>

                <div class="modal-actions">
                    <button type="button" class="btn-secondary" onclick="ModalUI.close()">Annuler</button>
                    <button type="submit" class="btn">Créer</button>
                </div>
            </form>
        `;
    }

    function renderEmptyStorygrid() {
        return `
            <div style="padding: 2rem 1rem; text-align: center; color: var(--text-muted); font-size: 0.85rem;">
                <i data-lucide="grid-3x3" style="width:32px;height:32px;margin-bottom:0.5rem;opacity:0.5;"></i>
                <p>Aucun élément de story grid</p>
            </div>
        `;
    }

    function groupElementsByRow(elements) {
        const grid = {
            protagonist: { beginning: null, reaction: null, decision: null, end: null },
            consequence: { beginning: null, reaction: null, decision: null, end: null },
            expectation: { beginning: null, reaction: null, decision: null, end: null },
            theme: { beginning: null, reaction: null, decision: null, end: null }
        };

        elements.forEach(element => {
            if (grid[element.row] && grid[element.row][element.phase]) {
                grid[element.row][element.phase] = element;
            }
        });

        return grid;
    }

    function getRowLabel(row) {
        const labels = {
            'protagonist': 'Protagoniste',
            'consequence': 'Conséquence',
            'expectation': 'Attente',
            'theme': 'Thème'
        };
        return labels[row] || row;
    }

    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    return {
        renderStorygrid,
        renderStorygridRow,
        renderStorygridDetail,
        renderAddStorygridModal,
        renderEmptyStorygrid,
        groupElementsByRow,
        escapeHtml
    };
})();
