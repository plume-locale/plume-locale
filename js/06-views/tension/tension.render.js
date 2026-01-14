/**
 * Tension Render
 * Responsible for generating HTML templates for the tension view
 */

const TensionRender = (() => {
    function renderTensionChart(scenes) {
        if (!scenes || scenes.length === 0) {
            return renderEmptyTension();
        }

        const sorted = [...scenes].sort((a, b) => {
            const orderA = a.order || 999;
            const orderB = b.order || 999;
            return orderA - orderB;
        });

        const max = Math.max(...sorted.map(s => s.tension || 0), 5);
        const chartHeight = 200;

        const bars = sorted.map((scene, idx) => {
            const height = ((scene.tension || 0) / max) * chartHeight;
            return `
                <div class="tension-bar-container" data-scene-id="${scene.id}">
                    <div class="tension-bar" style="height:${height}px;" title="${scene.title}: ${scene.tension || 0}">
                        <span class="tension-value">${scene.tension || 0}</span>
                    </div>
                    <label class="tension-label">${escapeHtml(scene.title.substring(0, 10))}</label>
                </div>
            `;
        }).join('');

        return `
            <div class="tension-chart">
                <div class="tension-bars">
                    ${bars}
                </div>
            </div>
        `;
    }

    function renderTensionList(scenes) {
        if (!scenes || scenes.length === 0) {
            return renderEmptyTension();
        }

        const sorted = [...scenes].sort((a, b) => {
            const orderA = a.order || 999;
            const orderB = b.order || 999;
            return orderA - orderB;
        });

        return `
            <div class="tension-list">
                ${sorted.map(scene => renderTensionItem(scene)).join('')}
            </div>
        `;
    }

    function renderTensionItem(scene) {
        const tension = scene.tension || 0;
        const level = getTensionLevel(tension);

        return `
            <div class="tension-item" data-scene-id="${scene.id}">
                <div class="tension-item-header">
                    <h4 class="tension-item-title">${escapeHtml(scene.title)}</h4>
                    <span class="tension-indicator ${level}">${tension}</span>
                </div>
                <div class="tension-slider-container">
                    <input type="range" class="tension-slider" min="0" max="10" value="${tension}" 
                           data-scene-id="${scene.id}">
                </div>
                <p class="tension-level-text">${getTensionLabel(tension)}</p>
                <button class="tension-item-edit" title="Détails">Éditer</button>
            </div>
        `;
    }

    function renderTensionDetail(scene) {
        return `
            <div class="detail-view">
                <div class="detail-header">
                    <input type="text" id="scene-title" class="detail-title-input" value="${escapeHtml(scene.title)}" 
                           placeholder="Titre de la scène">
                </div>

                <div class="detail-section">
                    <div class="detail-section-title">Niveau de tension</div>
                    <div class="tension-control">
                        <input type="range" id="scene-tension" min="0" max="10" value="${scene.tension || 0}" 
                               class="tension-slider-large">
                        <span id="tension-value-display" class="tension-value-display">${scene.tension || 0}</span>
                    </div>
                </div>

                <div class="detail-section">
                    <div class="detail-section-title">Type d'événement</div>
                    <select id="scene-event-type" class="form-input">
                        <option value="exposition" ${scene.eventType === 'exposition' ? 'selected' : ''}>Exposition</option>
                        <option value="rising" ${scene.eventType === 'rising' ? 'selected' : ''}>Montée</option>
                        <option value="climax" ${scene.eventType === 'climax' ? 'selected' : ''}>Climax</option>
                        <option value="falling" ${scene.eventType === 'falling' ? 'selected' : ''}>Descente</option>
                        <option value="resolution" ${scene.eventType === 'resolution' ? 'selected' : ''}>Résolution</option>
                    </select>
                </div>

                <div class="detail-section">
                    <div class="detail-section-title">Éléments de tension</div>
                    <textarea id="scene-tension-elements" class="form-input" rows="4" 
                              placeholder="Menaces, conflits, révélations">${escapeHtml(scene.tensionElements || '')}</textarea>
                </div>

                <div class="detail-section">
                    <div class="detail-section-title">Notes d'écriture</div>
                    <textarea id="scene-notes" class="form-input" rows="4" 
                              placeholder="Notes pour l'écriture">${escapeHtml(scene.notes || '')}</textarea>
                </div>
            </div>
        `;
    }

    function renderEmptyTension() {
        return `
            <div style="padding: 2rem 1rem; text-align: center; color: var(--text-muted); font-size: 0.85rem;">
                <i data-lucide="zap" style="width:32px;height:32px;margin-bottom:0.5rem;opacity:0.5;"></i>
                <p>Aucune scène pour le graphique de tension</p>
            </div>
        `;
    }

    function getTensionLevel(tension) {
        if (tension <= 2) return 'low';
        if (tension <= 5) return 'medium';
        if (tension <= 7) return 'high';
        return 'critical';
    }

    function getTensionLabel(tension) {
        const labels = {
            0: 'Aucune tension',
            1: 'Très basse',
            2: 'Basse',
            3: 'Basse-moyenne',
            4: 'Moyenne',
            5: 'Moyenne',
            6: 'Moyenne-haute',
            7: 'Haute',
            8: 'Très haute',
            9: 'Critique',
            10: 'Maximale'
        };
        return labels[tension] || 'Inconnue';
    }

    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    return {
        renderTensionChart,
        renderTensionList,
        renderTensionItem,
        renderTensionDetail,
        renderEmptyTension,
        getTensionLevel,
        getTensionLabel,
        escapeHtml
    };
})();
