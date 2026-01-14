/**
 * Arc Board Render
 * Responsible for generating HTML templates for the arc board view
 */

const ArcBoardRender = (() => {
    function renderArcBoard(arcs) {
        if (!arcs || arcs.length === 0) {
            return renderEmptyArcBoard();
        }

        return `
            <div class="arc-board">
                ${arcs.map((arc, idx) => renderArcTrack(arc, idx)).join('')}
            </div>
        `;
    }

    function renderArcTrack(arc, index) {
        const color = arc.color || getArcColor(index);
        const progress = calculateArcProgress(arc);

        return `
            <div class="arc-track" data-arc-id="${arc.id}" style="border-left-color: ${color};">
                <div class="arc-header">
                    <h3 class="arc-title">${escapeHtml(arc.title)}</h3>
                    <span class="arc-status">${arc.status || 'Actif'}</span>
                </div>

                <div class="arc-timeline">
                    ${renderArcPhases(arc)}
                </div>

                <div class="arc-progress">
                    <div class="progress-bar" style="background: ${color}; width: ${progress}%;"></div>
                </div>

                <div class="arc-actions">
                    <button class="arc-view-btn" title="Voir les détails">Détails</button>
                    <button class="arc-edit-btn" title="Éditer">Éditer</button>
                    <button class="arc-delete-btn" title="Supprimer">×</button>
                </div>
            </div>
        `;
    }

    function renderArcPhases(arc) {
        const phases = ['setup', 'development', 'climax', 'resolution'];

        return phases.map(phase => {
            const active = arc.currentPhase === phase ? 'active' : '';
            return `
                <div class="arc-phase ${active}" data-phase="${phase}">${getPhaseLabel(phase)}</div>
            `;
        }).join('');
    }

    function renderArcDetail(arc) {
        return `
            <div class="detail-view">
                <div class="detail-header">
                    <input type="text" id="arc-title" class="detail-title-input" value="${escapeHtml(arc.title)}" 
                           placeholder="Titre de l'arc">
                </div>

                <div class="detail-section">
                    <div class="detail-section-title">Type d'arc</div>
                    <select id="arc-character" class="form-input">
                        <option value="main" ${arc.characterId === 'main' ? 'selected' : ''}>Arc principal</option>
                        <option value="secondary" ${arc.characterId === 'secondary' ? 'selected' : ''}>Arc secondaire</option>
                        <option value="plot" ${arc.characterId === 'plot' ? 'selected' : ''}>Arc d'intrigue</option>
                    </select>
                </div>

                <div class="detail-section">
                    <div class="detail-section-title">Phase actuelle</div>
                    <select id="arc-phase" class="form-input">
                        <option value="setup" ${arc.currentPhase === 'setup' ? 'selected' : ''}>Mise en place</option>
                        <option value="development" ${arc.currentPhase === 'development' ? 'selected' : ''}>Développement</option>
                        <option value="climax" ${arc.currentPhase === 'climax' ? 'selected' : ''}>Climax</option>
                        <option value="resolution" ${arc.currentPhase === 'resolution' ? 'selected' : ''}>Résolution</option>
                    </select>
                </div>

                <div class="detail-section">
                    <div class="detail-section-title">Statut</div>
                    <select id="arc-status" class="form-input">
                        <option value="Actif" ${arc.status === 'Actif' ? 'selected' : ''}>Actif</option>
                        <option value="En attente" ${arc.status === 'En attente' ? 'selected' : ''}>En attente</option>
                        <option value="Complété" ${arc.status === 'Complété' ? 'selected' : ''}>Complété</option>
                        <option value="Rejeté" ${arc.status === 'Rejeté' ? 'selected' : ''}>Rejeté</option>
                    </select>
                </div>

                <div class="detail-section">
                    <div class="detail-section-title">Description</div>
                    <textarea id="arc-description" class="form-input" rows="6" 
                              placeholder="Description de l'arc">${escapeHtml(arc.description || '')}</textarea>
                </div>

                <div class="detail-section">
                    <div class="detail-section-title">Notes</div>
                    <textarea id="arc-notes" class="form-input" rows="4" 
                              placeholder="Notes personnelles">${escapeHtml(arc.notes || '')}</textarea>
                </div>
            </div>
        `;
    }

    function renderAddArcModal() {
        return `
            <form id="add-arc-form">
                <div class="modal-field">
                    <label>Titre de l'arc *</label>
                    <input type="text" id="arc-title-input" class="form-input" 
                           placeholder="Ex: Arc de rédemption" required autofocus>
                </div>

                <div class="modal-field">
                    <label>Type d'arc</label>
                    <select id="arc-type-input" class="form-input">
                        <option value="main">Arc principal</option>
                        <option value="secondary">Arc secondaire</option>
                        <option value="plot">Arc d'intrigue</option>
                    </select>
                </div>

                <div class="modal-field">
                    <label>Description</label>
                    <textarea id="arc-description-input" class="form-input" rows="3" 
                              placeholder="Brève description de l'arc"></textarea>
                </div>

                <div class="modal-actions">
                    <button type="button" class="btn-secondary" onclick="ModalUI.close()">Annuler</button>
                    <button type="submit" class="btn">Créer</button>
                </div>
            </form>
        `;
    }

    function renderEmptyArcBoard() {
        return `
            <div style="padding: 2rem 1rem; text-align: center; color: var(--text-muted); font-size: 0.85rem;">
                <i data-lucide="trending-up" style="width:32px;height:32px;margin-bottom:0.5rem;opacity:0.5;"></i>
                <p>Aucun arc narratif</p>
            </div>
        `;
    }

    function calculateArcProgress(arc) {
        const phases = ['setup', 'development', 'climax', 'resolution'];
        const currentIdx = phases.indexOf(arc.currentPhase || 'setup');
        return ((currentIdx + 1) / phases.length) * 100;
    }

    function getArcColor(index) {
        const colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
            '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'
        ];
        return colors[index % colors.length];
    }

    function getPhaseLabel(phase) {
        const labels = {
            'setup': 'Mise en place',
            'development': 'Développement',
            'climax': 'Climax',
            'resolution': 'Résolution'
        };
        return labels[phase] || phase;
    }

    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    return {
        renderArcBoard,
        renderArcTrack,
        renderArcDetail,
        renderAddArcModal,
        renderEmptyArcBoard,
        calculateArcProgress,
        getArcColor,
        escapeHtml
    };
})();
