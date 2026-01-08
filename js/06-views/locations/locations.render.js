// ============================================
// LOCATIONS RENDER - Rendu HTML Lieux
// ============================================

/**
 * LocationsRender - Génération du HTML pour la vue Lieux
 */

const LocationsRender = {

    renderList(locations) {
        if (locations.length === 0) {
            return this.renderEmptyState();
        }

        // Grouper par type
        const byType = ArrayUtils.groupBy(locations, 'type');

        return `
            <div class="locations-view">
                <div class="locations-header">
                    <h1>Lieux</h1>
                    <button class="btn btn-primary" data-action="add-location">
                        <i class="lucide-plus"></i> Nouveau lieu
                    </button>
                </div>

                ${Object.entries(byType).map(([type, locs]) =>
                    this._renderGroup(this._getTypeLabel(type), locs)
                ).join('')}
            </div>
        `;
    },

    _renderGroup(title, locations) {
        return `
            <div class="locations-group">
                <h2 class="locations-group-title">${title}</h2>
                <div class="locations-grid">
                    ${locations.map(l => this.renderCard(l)).join('')}
                </div>
            </div>
        `;
    },

    renderCard(location) {
        const stats = location.getStats();

        return `
            <div class="location-card" data-location-id="${location.id}">
                <div class="location-card-header" style="border-left: 4px solid ${location.color}">
                    <div class="location-icon" style="background: ${location.color}20; color: ${location.color}">
                        <i class="lucide-${location.icon}"></i>
                    </div>
                    <div class="location-card-info">
                        <h3 class="location-name">${DOMUtils.escape(location.name)}</h3>
                        <p class="location-type">${this._getTypeLabel(location.type)}</p>
                    </div>
                </div>

                <div class="location-card-body">
                    <p class="location-description">
                        ${location.description ?
                            TextUtils.truncate(DOMUtils.escape(location.description), 120) :
                            '<em>Pas de description</em>'}
                    </p>

                    <div class="location-stats">
                        <span title="Scènes"><i class="lucide-file-text"></i> ${stats.sceneCount}</span>
                        ${stats.hasParent ? '<span title="Hiérarchie"><i class="lucide-layers"></i></span>' : ''}
                        ${stats.hasMapPosition ? '<span title="Sur la carte"><i class="lucide-map"></i></span>' : ''}
                    </div>
                </div>

                <div class="location-card-actions">
                    <button class="btn-icon" data-action="view-location" data-location-id="${location.id}" title="Voir">
                        <i class="lucide-eye"></i>
                    </button>
                    <button class="btn-icon" data-action="edit-location" data-location-id="${location.id}" title="Modifier">
                        <i class="lucide-edit"></i>
                    </button>
                    <button class="btn-icon" data-action="delete-location" data-location-id="${location.id}" title="Supprimer">
                        <i class="lucide-trash-2"></i>
                    </button>
                </div>
            </div>
        `;
    },

    renderEmptyState() {
        return `
            <div class="empty-state">
                <div class="empty-state-icon">
                    <i class="lucide-map-pin" style="font-size: 64px;"></i>
                </div>
                <h2>Aucun lieu</h2>
                <p>Créez votre premier lieu pour construire l'univers de votre histoire.</p>
                <button class="btn btn-primary" data-action="add-location">
                    <i class="lucide-plus"></i> Créer un lieu
                </button>
            </div>
        `;
    },

    renderAddModal() {
        const types = [
            { value: 'place', label: 'Lieu', icon: 'map-pin' },
            { value: 'country', label: 'Pays', icon: 'globe' },
            { value: 'city', label: 'Ville', icon: 'building' },
            { value: 'building', label: 'Bâtiment', icon: 'home' },
            { value: 'room', label: 'Pièce', icon: 'door-open' },
            { value: 'other', label: 'Autre', icon: 'map' }
        ];

        return `
            <form id="add-location-form" class="location-form">
                <div class="form-section">
                    <h3>Informations de base</h3>

                    <div class="form-group">
                        <label for="loc-name">Nom *</label>
                        <input type="text" id="loc-name" required>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="loc-type">Type</label>
                            <select id="loc-type">
                                ${types.map(t => `<option value="${t.value}">${t.label}</option>`).join('')}
                            </select>
                        </div>

                        <div class="form-group">
                            <label for="loc-icon">Icône</label>
                            <select id="loc-icon">
                                ${types.map(t => `<option value="${t.icon}">${t.label}</option>`).join('')}
                            </select>
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="loc-description">Description</label>
                        <textarea id="loc-description" rows="4" placeholder="Décrivez ce lieu..."></textarea>
                    </div>

                    <div class="form-group">
                        <label for="loc-color">Couleur</label>
                        <input type="color" id="loc-color" value="#95a5a6">
                    </div>
                </div>

                <div class="form-section">
                    <h3>Notes</h3>

                    <div class="form-group">
                        <label for="loc-notes">Notes additionnelles</label>
                        <textarea id="loc-notes" rows="4"></textarea>
                    </div>
                </div>

                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" data-action="cancel">Annuler</button>
                    <button type="submit" class="btn btn-primary">Créer</button>
                </div>
            </form>
        `;
    },

    renderDetailModal(location, stats) {
        return `
            <div class="location-detail">
                <div class="location-detail-header" style="border-left: 6px solid ${location.color}">
                    <div class="location-detail-icon" style="background: ${location.color}">
                        <i class="lucide-${location.icon}"></i>
                    </div>
                    <div>
                        <h2>${DOMUtils.escape(location.name)}</h2>
                        <p class="location-detail-type">${this._getTypeLabel(location.type)}</p>
                    </div>
                </div>

                <div class="location-detail-stats">
                    <div class="stat-card">
                        <div class="stat-value">${stats.sceneCount}</div>
                        <div class="stat-label">Scènes</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${TextUtils.formatWordCount(stats.wordCount)}</div>
                        <div class="stat-label">Mots</div>
                    </div>
                </div>

                ${location.description ? `
                    <div class="location-detail-section">
                        <h3>Description</h3>
                        <p>${DOMUtils.escape(location.description)}</p>
                    </div>
                ` : ''}

                ${location.notes ? `
                    <div class="location-detail-section">
                        <h3>Notes</h3>
                        <p>${DOMUtils.escape(location.notes)}</p>
                    </div>
                ` : ''}

                <div class="location-detail-actions">
                    <button class="btn btn-primary" data-action="edit-location-from-detail" data-location-id="${location.id}">
                        <i class="lucide-edit"></i> Modifier
                    </button>
                    <button class="btn btn-danger" data-action="delete-location-from-detail" data-location-id="${location.id}">
                        <i class="lucide-trash-2"></i> Supprimer
                    </button>
                </div>
            </div>
        `;
    },

    renderEditModal(location) {
        return this.renderAddModal()
            .replace('id="add-location-form"', `id="edit-location-form" data-location-id="${location.id}"`)
            .replace('id="loc-name" required>', `id="loc-name" required value="${DOMUtils.escape(location.name)}">`)
            .replace('id="loc-description"', `id="loc-description">${DOMUtils.escape(location.description)}`)
            .replace('id="loc-notes"', `id="loc-notes">${DOMUtils.escape(location.notes)}`)
            .replace(`value="${location.type}"`, `value="${location.type}" selected`)
            .replace(`value="${location.icon}"`, `value="${location.icon}" selected`)
            .replace('id="loc-color" value="#95a5a6"', `id="loc-color" value="${location.color}"`)
            .replace('<button type="submit" class="btn btn-primary">Créer</button>', '<button type="submit" class="btn btn-primary">Sauvegarder</button>');
    },

    _getTypeLabel(type) {
        const labels = {
            place: 'Lieu',
            country: 'Pays',
            city: 'Ville',
            building: 'Bâtiment',
            room: 'Pièce',
            other: 'Autre'
        };
        return labels[type] || type;
    }
};

window.LocationsRender = LocationsRender;
