/**
 * Timeline Render
 * Responsible for generating HTML templates for the timeline view
 */

const TimelineRender = (() => {
    function renderTimelineList(events) {
        if (!events || events.length === 0) {
            return renderEmptyTimeline();
        }

        // Group events by date
        const grouped = {};
        const sortedEvents = [...events].sort((a, b) => {
            const dateA = new Date(a.date || '');
            const dateB = new Date(b.date || '');
            return dateA - dateB;
        });

        sortedEvents.forEach(event => {
            const date = event.date || 'Sans date';
            if (!grouped[date]) {
                grouped[date] = [];
            }
            grouped[date].push(event);
        });

        const groupedHtml = Object.entries(grouped).map(([date, dateEvents]) => `
            <div class="timeline-group">
                <h3 class="timeline-group-date">${formatDate(date)}</h3>
                <div class="timeline-items">
                    ${dateEvents.map(event => renderTimelineItem(event)).join('')}
                </div>
            </div>
        `).join('');

        return `<div class="timeline-list">${groupedHtml}</div>`;
    }

    function renderTimelineItem(event) {
        const type = event.type || 'event';

        return `
            <div class="timeline-item" data-event-id="${event.id}" data-type="${type}">
                <div class="timeline-item-dot"></div>
                <div class="timeline-item-content">
                    <h4 class="timeline-item-title">${escapeHtml(event.title)}</h4>
                    ${event.location ? `<p class="timeline-item-location">${escapeHtml(event.location)}</p>` : ''}
                    <button class="timeline-item-delete" onclick="event.stopPropagation();" title="Supprimer">×</button>
                </div>
            </div>
        `;
    }

    function renderTimelineDetail(event) {
        return `
            <div class="detail-view">
                <div class="detail-header">
                    <input type="text" id="event-title" class="detail-title-input" value="${escapeHtml(event.title)}" 
                           placeholder="Titre de l'événement">
                </div>

                <div class="detail-section">
                    <div class="detail-section-title">Type</div>
                    <select id="event-type" class="form-input">
                        <option value="event" ${event.type === 'event' ? 'selected' : ''}>Événement</option>
                        <option value="milestone" ${event.type === 'milestone' ? 'selected' : ''}>Jalon</option>
                        <option value="plot-point" ${event.type === 'plot-point' ? 'selected' : ''}>Point de l'intrigue</option>
                        <option value="character-arc" ${event.type === 'character-arc' ? 'selected' : ''}>Arc du personnage</option>
                    </select>
                </div>

                <div class="detail-section">
                    <div class="detail-section-title">Date</div>
                    <input type="date" id="event-date" class="form-input" value="${event.date ? event.date.split('T')[0] : ''}">
                </div>

                <div class="detail-section">
                    <div class="detail-section-title">Lieu</div>
                    <input type="text" id="event-location" class="form-input" value="${escapeHtml(event.location || '')}" 
                           placeholder="Lieu de l'événement">
                </div>

                <div class="detail-section">
                    <div class="detail-section-title">Description</div>
                    <textarea id="event-description" class="form-input" rows="8" 
                              placeholder="Description détaillée">${escapeHtml(event.description || '')}</textarea>
                </div>

                <div class="detail-section">
                    <div class="detail-section-title">Personnages impliqués</div>
                    <input type="text" id="event-characters" class="form-input" 
                           value="${escapeHtml(event.characters ? event.characters.join(', ') : '')}" 
                           placeholder="Noms séparés par des virgules">
                </div>
            </div>
        `;
    }

    function renderAddTimelineModal() {
        return `
            <form id="add-event-form">
                <div class="modal-field">
                    <label>Titre de l'événement *</label>
                    <input type="text" id="event-title-input" class="form-input" placeholder="Ex: Révélation du secret" required autofocus>
                </div>

                <div class="modal-field">
                    <label>Type</label>
                    <select id="event-type-input" class="form-input">
                        <option value="event">Événement</option>
                        <option value="milestone">Jalon</option>
                        <option value="plot-point">Point de l'intrigue</option>
                        <option value="character-arc">Arc du personnage</option>
                    </select>
                </div>

                <div class="modal-field">
                    <label>Date</label>
                    <input type="date" id="event-date-input" class="form-input">
                </div>

                <div class="modal-field">
                    <label>Lieu</label>
                    <input type="text" id="event-location-input" class="form-input" placeholder="Ex: Château Noir">
                </div>

                <div class="modal-actions">
                    <button type="button" class="btn-secondary" onclick="ModalUI.close()">Annuler</button>
                    <button type="submit" class="btn">Créer</button>
                </div>
            </form>
        `;
    }

    function renderEmptyTimeline() {
        return `
            <div style="padding: 2rem 1rem; text-align: center; color: var(--text-muted); font-size: 0.85rem;">
                <i data-lucide="calendar" style="width:32px;height:32px;margin-bottom:0.5rem;opacity:0.5;"></i>
                <p>Aucun événement sur la timeline</p>
            </div>
        `;
    }

    function formatDate(dateStr) {
        if (!dateStr || dateStr === 'Sans date') return 'Sans date';

        try {
            const date = new Date(dateStr);
            if (isNaN(date)) return dateStr;

            return date.toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch {
            return dateStr;
        }
    }

    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    return {
        renderTimelineList,
        renderTimelineItem,
        renderTimelineDetail,
        renderAddTimelineModal,
        renderEmptyTimeline,
        formatDate,
        escapeHtml
    };
})();
