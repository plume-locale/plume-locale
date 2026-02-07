/**
 * Investigation Sidebar View Manager
 * Handles the display of investigation items linked to the current scene in the Structure view.
 */
const InvestigationSidebarUI = {
    activeSceneId: null,

    /**
     * Toggles the investigation sidebar visibility.
     */
    toggleSidebar: function () {
        const sidebar = document.getElementById('sidebarInvestigation');
        const toolBtn = document.getElementById('toolInvestigationBtn');
        const sidebarBtn = document.getElementById('sidebarInvestigationBtn');
        if (!sidebar) return;

        const isHidden = sidebar.classList.toggle('hidden');
        if (!isHidden && typeof currentSceneId !== 'undefined' && currentSceneId) {
            this.renderSidebar(currentSceneId);
            if (toolBtn) toolBtn.classList.add('active');
            if (sidebarBtn) sidebarBtn.classList.add('active');
        } else {
            if (toolBtn) toolBtn.classList.remove('active');
            if (sidebarBtn) sidebarBtn.classList.remove('active');
        }

        // Refresh icons
        if (typeof lucide !== 'undefined') lucide.createIcons();
    },

    /**
     * Renders the investigation cards for a specific scene.
     * @param {string|number} sceneId - The ID of the scene to display items for.
     */
    renderSidebar: function (sceneId) {
        const container = document.getElementById('investigationSidebarList');
        const sceneNameEl = document.getElementById('investigationSidebarSceneName');
        if (!container) return;

        this.activeSceneId = sceneId;

        // Ensure store is initialized (data loaded from project)
        if (typeof InvestigationStore !== 'undefined') {
            InvestigationStore.init();
        }

        // Update scene name in header
        let foundScene = null;
        if (typeof project !== 'undefined') {
            project.acts.forEach(a => {
                a.chapters.forEach(c => {
                    const s = c.scenes.find(sc => sc.id == sceneId);
                    if (s) foundScene = s;
                });
            });
        }

        if (sceneNameEl) {
            sceneNameEl.textContent = foundScene ? foundScene.title : (Localization.t('sidebar.no_scene') || 'Aucune scène sélectionnée');
        }

        if (!sceneId) {
            container.innerHTML = `<div class="empty-state">${Localization.t('sidebar.empty.select_scene') || 'Sélectionnez une scène pour voir son enquête.'}</div>`;
            return;
        }

        if (typeof InvestigationStore === 'undefined') {
            container.innerHTML = '<div class="empty-state">Le module d’enquête n’est pas disponible.</div>';
            return;
        }

        const facts = InvestigationStore.getFacts();
        const allCharacters = InvestigationStore.getCharacters();
        const allLocations = InvestigationStore.getLocations();
        const cardsHTML = [];

        facts.forEach(fact => {
            if (!fact.timeline || fact.timeline.length === 0) return;

            // Filter steps for this scene
            const sceneSteps = fact.timeline.filter(step => step.sceneId == sceneId);

            sceneSteps.forEach(step => {
                const typeLabel = Localization.t('investigation.type.' + fact.type) || fact.type;
                const typeIcons = {
                    clue: 'search',
                    red_herring: 'megaphone-off',
                    event: 'calendar',
                    testimony: 'message-square',
                    object: 'package',
                    rumor: 'message-circle',
                    crime: 'skull',
                    disappearance: 'user-x',
                    coma: 'activity'
                };
                const icon = typeIcons[fact.type] || 'file-text';
                const statusLabel = step.status ? (Localization.t('investigation.evolution.status.' + step.status) || step.status) : '';

                // Extra data for the card
                const relatedChars = (fact.relatedCharacterIds || []).map(id => allCharacters.find(c => c.id == id)).filter(Boolean);
                const relatedLoc = fact.relatedLocationIds?.[0] ? allLocations.find(l => l.id == fact.relatedLocationIds[0]) : null;
                const truthLabel = Localization.t('investigation.truth.' + fact.truthStatus);

                cardsHTML.push(`
                    <div class="sidebar-plot-card investigation-sidebar-card ${fact.isHidden ? 'is-secret' : ''}" onclick="InvestigationSidebarUI.openFactModal('${fact.id}')">
                        <div class="sidebar-plot-card-line">
                            <i data-lucide="${icon}" style="width: 12px; height: 12px; vertical-align: middle; margin-right: 4px"></i>
                            ${typeLabel} ${statusLabel ? `• ${statusLabel}` : ''}
                            ${fact.isHidden ? '<i data-lucide="shield-check" class="secret-icon-sidebar" title="Secret" style="float: right; color: var(--primary-color)"></i>' : ''}
                        </div>
                        
                        <div class="sidebar-plot-card-title">
                            ${fact.label}
                        </div>
                        
                        <div class="sidebar-plot-card-content">${step.description || ''}</div>
                        
                        <div class="sidebar-investigation-meta">
                            <div class="meta-row">
                                <span class="status-pill-compact status-${fact.truthStatus}">${truthLabel}</span>
                                ${relatedLoc ? `
                                    <span class="meta-location">
                                        <i data-lucide="map-pin"></i> ${relatedLoc.name}
                                    </span>
                                ` : ''}
                            </div>
                            
                            ${relatedChars.length > 0 ? `
                                <div class="meta-characters">
                                    <i data-lucide="users"></i>
                                    ${relatedChars.map(c => `<span class="char-tag-compact">${c.name}</span>`).join('')}
                                </div>
                            ` : ''}
                        </div>
                    </div>
                `);
            });
        });

        if (cardsHTML.length === 0) {
            container.innerHTML = `<div class="empty-state">${Localization.t('investigation.timeline.empty') || 'Aucun item d’enquête lié à cette scène.'}</div>`;
        } else {
            container.innerHTML = cardsHTML.join('');
        }

        if (typeof lucide !== 'undefined') lucide.createIcons();
    },

    /**
     * Opens the edit modal for a specific fact.
     * @param {string} factId - The ID of the fact to edit.
     */
    openFactModal: function (factId) {
        if (typeof InvestigationRegistryView !== 'undefined' && InvestigationRegistryView.editFact) {
            InvestigationRegistryView.editFact(factId);
        } else {
            console.error("InvestigationRegistryView.editFact is not available");
        }
    }
};

// Hook into scene changes where possible, though main call is in 00.app.view.js
window.addEventListener('sceneSelected', (e) => {
    const sceneId = e.detail?.sceneId;
    if (!sceneId) return;
    const sidebar = document.getElementById('sidebarInvestigation');
    if (sidebar && !sidebar.classList.contains('hidden')) {
        InvestigationSidebarUI.renderSidebar(sceneId);
    }
});
