/**
 * Plot Render
 * Responsible for generating HTML templates for the plot view
 */

const PlotRender = (() => {
    function renderPlotStructure(plots) {
        if (!plots || plots.length === 0) {
            return renderEmptyPlot();
        }

        return `
            <div class="plot-structure">
                ${plots.map(plot => renderPlotItem(plot)).join('')}
            </div>
        `;
    }

    function renderPlotItem(plot) {
        const status = plot.status || 'planning';
        const progress = calculatePlotProgress(plot);

        return `
            <div class="plot-item" data-plot-id="${plot.id}">
                <div class="plot-header">
                    <h3 class="plot-title">${escapeHtml(plot.title)}</h3>
                    <span class="plot-status ${status}">${getStatusLabel(status)}</span>
                </div>

                <div class="plot-details">
                    <div class="plot-detail-row">
                        <span class="label">Type:</span>
                        <span class="value">${getPlotTypeLabel(plot.type)}</span>
                    </div>
                    <div class="plot-detail-row">
                        <span class="label">Importance:</span>
                        <span class="value">${getImportanceLabel(plot.importance)}</span>
                    </div>
                </div>

                <div class="plot-elements">
                    <div class="element">
                        <span class="element-label">Exposition</span>
                        <p class="element-text">${escapeHtml(plot.exposition || 'Non défini')}</p>
                    </div>
                    <div class="element">
                        <span class="element-label">Point d'accroche</span>
                        <p class="element-text">${escapeHtml(plot.incitingIncident || 'Non défini')}</p>
                    </div>
                    <div class="element">
                        <span class="element-label">Climax</span>
                        <p class="element-text">${escapeHtml(plot.climax || 'Non défini')}</p>
                    </div>
                    <div class="element">
                        <span class="element-label">Résolution</span>
                        <p class="element-text">${escapeHtml(plot.resolution || 'Non défini')}</p>
                    </div>
                </div>

                <div class="plot-progress">
                    <div class="progress-label">Avancement: ${progress}%</div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%;"></div>
                    </div>
                </div>

                <div class="plot-actions">
                    <button class="plot-edit-btn" title="Éditer">Éditer</button>
                    <button class="plot-delete-btn" title="Supprimer">×</button>
                </div>
            </div>
        `;
    }

    function renderPlotDetail(plot) {
        return `
            <div class="detail-view">
                <div class="detail-header">
                    <input type="text" id="plot-title" class="detail-title-input" value="${escapeHtml(plot.title)}" 
                           placeholder="Titre de la ligne d'intrigue">
                </div>

                <div class="detail-section">
                    <div class="detail-section-title">Type</div>
                    <select id="plot-type" class="form-input">
                        <option value="main" ${plot.type === 'main' ? 'selected' : ''}>Intrigue principale</option>
                        <option value="secondary" ${plot.type === 'secondary' ? 'selected' : ''}>Intrigue secondaire</option>
                        <option value="subplot" ${plot.type === 'subplot' ? 'selected' : ''}>Sous-intrigue</option>
                        <option value="character" ${plot.type === 'character' ? 'selected' : ''}>Arc personnel</option>
                    </select>
                </div>

                <div class="detail-section">
                    <div class="detail-section-title">Importance</div>
                    <select id="plot-importance" class="form-input">
                        <option value="critical" ${plot.importance === 'critical' ? 'selected' : ''}>Critique</option>
                        <option value="high" ${plot.importance === 'high' ? 'selected' : ''}>Haute</option>
                        <option value="medium" ${plot.importance === 'medium' ? 'selected' : ''}>Moyenne</option>
                        <option value="low" ${plot.importance === 'low' ? 'selected' : ''}>Basse</option>
                    </select>
                </div>

                <div class="detail-section">
                    <div class="detail-section-title">Statut</div>
                    <select id="plot-status" class="form-input">
                        <option value="planning" ${plot.status === 'planning' ? 'selected' : ''}>Planification</option>
                        <option value="writing" ${plot.status === 'writing' ? 'selected' : ''}>Écriture</option>
                        <option value="revision" ${plot.status === 'revision' ? 'selected' : ''}>Révision</option>
                        <option value="complete" ${plot.status === 'complete' ? 'selected' : ''}>Complété</option>
                    </select>
                </div>

                <div class="detail-section">
                    <div class="detail-section-title">Exposition</div>
                    <textarea id="plot-exposition" class="form-input" rows="3" 
                              placeholder="Comment le conflit est établi">${escapeHtml(plot.exposition || '')}</textarea>
                </div>

                <div class="detail-section">
                    <div class="detail-section-title">Point d'accroche</div>
                    <textarea id="plot-inciting" class="form-input" rows="3" 
                              placeholder="L'incident qui lance l'intrigue">${escapeHtml(plot.incitingIncident || '')}</textarea>
                </div>

                <div class="detail-section">
                    <div class="detail-section-title">Climax</div>
                    <textarea id="plot-climax" class="form-input" rows="3" 
                              placeholder="Le point de tension maximale">${escapeHtml(plot.climax || '')}</textarea>
                </div>

                <div class="detail-section">
                    <div class="detail-section-title">Résolution</div>
                    <textarea id="plot-resolution" class="form-input" rows="3" 
                              placeholder="Comment l'intrigue se résout">${escapeHtml(plot.resolution || '')}</textarea>
                </div>

                <div class="detail-section">
                    <div class="detail-section-title">Personnages impliqués</div>
                    <input type="text" id="plot-characters" class="form-input" 
                           value="${escapeHtml(plot.characters ? plot.characters.join(', ') : '')}" 
                           placeholder="Noms séparés par des virgules">
                </div>
            </div>
        `;
    }

    function renderAddPlotModal() {
        return `
            <form id="add-plot-form">
                <div class="modal-field">
                    <label>Titre de l'intrigue *</label>
                    <input type="text" id="plot-title-input" class="form-input" 
                           placeholder="Ex: Secret de famille" required autofocus>
                </div>

                <div class="modal-field">
                    <label>Type</label>
                    <select id="plot-type-input" class="form-input">
                        <option value="main">Intrigue principale</option>
                        <option value="secondary">Intrigue secondaire</option>
                        <option value="subplot">Sous-intrigue</option>
                        <option value="character">Arc personnel</option>
                    </select>
                </div>

                <div class="modal-field">
                    <label>Importance</label>
                    <select id="plot-importance-input" class="form-input">
                        <option value="high">Haute</option>
                        <option value="medium">Moyenne</option>
                        <option value="low">Basse</option>
                    </select>
                </div>

                <div class="modal-actions">
                    <button type="button" class="btn-secondary" onclick="ModalUI.close()">Annuler</button>
                    <button type="submit" class="btn">Créer</button>
                </div>
            </form>
        `;
    }

    function renderEmptyPlot() {
        return `
            <div style="padding: 2rem 1rem; text-align: center; color: var(--text-muted); font-size: 0.85rem;">
                <i data-lucide="book-open" style="width:32px;height:32px;margin-bottom:0.5rem;opacity:0.5;"></i>
                <p>Aucune ligne d'intrigue</p>
            </div>
        `;
    }

    function calculatePlotProgress(plot) {
        let filled = 0;
        const fields = ['exposition', 'incitingIncident', 'climax', 'resolution'];
        fields.forEach(field => {
            if (plot[field]) filled++;
        });
        return Math.round((filled / fields.length) * 100);
    }

    function getPlotTypeLabel(type) {
        const labels = {
            'main': 'Intrigue principale',
            'secondary': 'Intrigue secondaire',
            'subplot': 'Sous-intrigue',
            'character': 'Arc personnel'
        };
        return labels[type] || type;
    }

    function getImportanceLabel(importance) {
        const labels = {
            'critical': 'Critique',
            'high': 'Haute',
            'medium': 'Moyenne',
            'low': 'Basse'
        };
        return labels[importance] || importance;
    }

    function getStatusLabel(status) {
        const labels = {
            'planning': 'Planification',
            'writing': 'Écriture',
            'revision': 'Révision',
            'complete': 'Complété'
        };
        return labels[status] || status;
    }

    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    return {
        renderPlotStructure,
        renderPlotItem,
        renderPlotDetail,
        renderAddPlotModal,
        renderEmptyPlot,
        calculatePlotProgress,
        escapeHtml
    };
})();
