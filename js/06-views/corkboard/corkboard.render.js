/**
 * Corkboard Render
 * Responsible for generating HTML templates for the corkboard view
 */

const CorkboardRender = (() => {
    function renderCorkboardGrid(pins) {
        if (!pins || pins.length === 0) {
            return renderEmptyCorkboard();
        }

        const pinsHtml = pins.map(pin => renderCorkboardPin(pin)).join('');

        return `
            <div class="corkboard-grid">
                ${pinsHtml}
            </div>
        `;
    }

    function renderCorkboardPin(pin) {
        const color = pin.color || 'yellow';
        const posStyle = pin.position ? `style="left:${pin.position.x}%;top:${pin.position.y}%;"` : '';

        return `
            <div class="corkboard-pin ${color}" data-pin-id="${pin.id}" draggable="true" ${posStyle}>
                <div class="pin-content">
                    <h4 class="pin-title">${escapeHtml(pin.title)}</h4>
                    <p class="pin-text">${escapeHtml(pin.text || '')}</p>
                    ${pin.category ? `<span class="pin-category">${escapeHtml(pin.category)}</span>` : ''}
                </div>
                <button class="pin-delete" onclick="event.stopPropagation();" title="Supprimer">×</button>
            </div>
        `;
    }

    function renderCorkboardDetail(pin) {
        const colors = ['yellow', 'pink', 'blue', 'green', 'white', 'orange'];

        return `
            <div class="detail-view">
                <div class="detail-header">
                    <input type="text" id="pin-title" class="detail-title-input" value="${escapeHtml(pin.title)}" 
                           placeholder="Titre de l'épingle">
                </div>

                <div class="detail-section">
                    <div class="detail-section-title">Couleur</div>
                    <div class="color-picker">
                        ${colors.map(color => `
                            <button type="button" class="color-option ${color}" 
                                    data-color="${color}"
                                    ${pin.color === color ? 'style="border: 2px solid var(--text);"' : ''}>
                            </button>
                        `).join('')}
                    </div>
                </div>

                <div class="detail-section">
                    <div class="detail-section-title">Catégorie</div>
                    <input type="text" id="pin-category" class="form-input" value="${escapeHtml(pin.category || '')}" 
                           placeholder="Ex: Personnage, Lieu, Intrigue">
                </div>

                <div class="detail-section">
                    <div class="detail-section-title">Contenu</div>
                    <textarea id="pin-text" class="form-input" rows="8" 
                              placeholder="Notes, idées, détails">${escapeHtml(pin.text || '')}</textarea>
                </div>

                <div class="detail-section">
                    <div class="detail-section-title">Lié à</div>
                    <input type="text" id="pin-linked" class="form-input" value="${escapeHtml(pin.linkedTo ? pin.linkedTo.join(', ') : '')}" 
                           placeholder="IDs d'autres épingles, séparés par des virgules">
                </div>
            </div>
        `;
    }

    function renderAddCorkboardModal() {
        const colors = ['yellow', 'pink', 'blue', 'green', 'white', 'orange'];

        return `
            <form id="add-pin-form">
                <div class="modal-field">
                    <label>Titre *</label>
                    <input type="text" id="pin-title-input" class="form-input" placeholder="Titre de l'épingle" required autofocus>
                </div>

                <div class="modal-field">
                    <label>Couleur</label>
                    <div class="color-picker">
                        ${colors.map((color, idx) => `
                            <button type="button" class="color-option ${color}" 
                                    data-color="${color}"
                                    ${idx === 0 ? 'style="border: 2px solid var(--text);"' : ''}>
                            </button>
                        `).join('')}
                    </div>
                </div>

                <div class="modal-field">
                    <label>Catégorie</label>
                    <input type="text" id="pin-category-input" class="form-input" placeholder="Ex: Personnage">
                </div>

                <div class="modal-field">
                    <label>Notes</label>
                    <textarea id="pin-text-input" class="form-input" rows="4" placeholder="Vos notes et idées"></textarea>
                </div>

                <div class="modal-actions">
                    <button type="button" class="btn-secondary" onclick="ModalUI.close()">Annuler</button>
                    <button type="submit" class="btn">Créer</button>
                </div>
            </form>
        `;
    }

    function renderEmptyCorkboard() {
        return `
            <div style="padding: 2rem 1rem; text-align: center; color: var(--text-muted); font-size: 0.85rem;">
                <i data-lucide="layout-grid" style="width:32px;height:32px;margin-bottom:0.5rem;opacity:0.5;"></i>
                <p>Aucune épingle sur le tableau liège</p>
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
        renderCorkboardGrid,
        renderCorkboardPin,
        renderCorkboardDetail,
        renderAddCorkboardModal,
        renderEmptyCorkboard,
        escapeHtml
    };
})();
