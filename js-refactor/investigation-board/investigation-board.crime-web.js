/**
 * [MVVM : Investigation Crime Web View]
 * Visualisation "Toile d'Araignée" centrée sur le Crime.
 * Affiche les suspects et leurs liaisons MMO (Mobile, Means, Opportunity).
 */

const InvestigationCrimeWebView = {
    render: function (container) {
        const activeCase = InvestigationStore.getActiveCase();
        const facts = InvestigationStore.getFacts();

        // Find the "incident" (formerly crime) fact
        let incident = facts.find(f => f.type === 'crime' || f.type === 'body' || f.type === 'event');

        // Determine icon and generic term based on case context or incident type
        const typeIcons = {
            crime: 'skull',
            body: 'skull',
            event: 'activity',
            disappearance: 'user-x',
            coma: 'activity'
        };
        const icon = (incident ? typeIcons[incident.type] : null) || 'help-circle';
        const labelTerm = incident ? incident.label : Localization.t('investigation.title');

        if (!incident && facts.length === 0) {
            container.innerHTML = `
                <div class="investigation-crime-web">
                     <div class="empty-state-card">
                        <i data-lucide="${icon}" size="48"></i>
                        <h4>${Localization.t('investigation.crimeweb.empty.title')}</h4>
                        <p>${Localization.t('investigation.crimeweb.empty.desc')}</p>
                        <button class="btn btn-primary" onclick="InvestigationStore.setCurrentView('registry')">
                            ${Localization.t('investigation.crimeweb.empty.action')}
                        </button>
                    </div>
                </div>`;
            return;
        }

        const suspects = InvestigationStore.getCharacters();
        if (suspects.length === 0) {
            container.innerHTML = `<div class="web-empty">${Localization.t('investigation.crimeweb.no_characters')}</div>`;
            return;
        }

        // --- SCENE SELECTOR (TIME TRAVEL) ---
        const scenes = InvestigationStore.getScenesWithContext();
        // Determine current scene from filter or default to last scene (latest knowledge)
        const currentSceneId = InvestigationStore.state.filters.sceneId || (scenes.length > 0 ? scenes[scenes.length - 1].id : null);
        const currentScene = scenes.find(s => s.id === currentSceneId) || { title: Localization.t('investigation.crimeweb.start'), actTitle: '', chapterTitle: '' };

        // Group scenes by Act/Chapter for labels
        let timelineMarkersHTML = '';
        let lastChapter = '';
        let lastAct = '';

        scenes.forEach((s, i) => {
            // Correct Math: Scene i (1-based index for user) is at (i+1)/Length * 100
            const percent = ((i + 1) / scenes.length) * 100;

            // Hierarchical Markers
            let markerClass = 'marker'; // Default scene tick
            let labelHTML = '';

            // Check Hierarchy changes
            const isNewAct = s.actTitle !== lastAct;
            const isNewChapter = s.chapterTitle !== lastChapter;

            if (isNewAct) {
                markerClass = 'marker-act';
                lastAct = s.actTitle;
                lastChapter = s.chapterTitle;

                // Show Label ONLY for Acts to prevent overlapping
                labelHTML = `
                    <div class="timeline-act-label" style="left: ${percent}%">
                        <span>${s.actTitle}</span>
                    </div>
                `;
            } else if (isNewChapter) {
                markerClass = 'marker-chapter';
                lastChapter = s.chapterTitle;
                // No text label for chapters, just a taller tick
            }

            // Render Marker + Potential Label
            timelineMarkersHTML += `
                <span class="${markerClass}" style="left: ${percent}%;" title="${s.title}"></span>
                ${labelHTML}
            `;
        });

        // Determine current index (0 for start, 1..N for scenes)
        const sliderValue = currentSceneId ? (scenes.findIndex(s => s.id === currentSceneId) + 1) : 0;

        container.innerHTML = `
            <div class="investigation-crime-web">
                
                <!-- NEW: Scene Timeline Selector -->
                <div class="web-timeline-controls">
                    <div class="web-timeline-header">
                        <div class="web-timeline-info">
                            <i data-lucide="clock"></i>
                            <span class="scene-context">
                                <span class="dim">${currentScene.actTitle || ''} ${currentScene.chapterTitle ? ' > ' + currentScene.chapterTitle + ' > ' : ''}</span> 
                                <strong>${currentScene.title}</strong>
                            </span>
                        </div>
                    </div>

                    <div class="web-timeline-slider-container">
                        <!-- Markers & Labels layer -->
                        <div class="web-timeline-markers">
                            <!-- Start Marker (0%) -->
                            <span class="marker start-marker" style="left: 0%" title="${Localization.t('investigation.crimeweb.start')}"></span>
                            <div class="timeline-chapter-label" style="left: 0%"><span>${Localization.t('investigation.crimeweb.start')}</span></div>
                            
                            ${timelineMarkersHTML}
                        </div>

                        <!-- INPUT Slider -->
                        <input type="range" min="0" max="${scenes.length}" value="${sliderValue}" 
                               class="web-timeline-slider"
                               oninput="InvestigationCrimeWebView.onSceneChange(this.value)">
                    </div>
                </div>

                <div class="web-main-container">
                    <div class="web-grid-wrapper">
                        <div class="web-toolbar">
                             <span class="web-context-badge">${Localization.t('investigation.crimeweb.context').replace('{0}', currentScene.title)}</span>
                             <span>${Localization.t('investigation.crimeweb.incident').replace('{0}', labelTerm)}</span>
                        </div>
                        <div class="web-grid" id="crimeWebGrid">
                            <!-- Suspect Grid Layout -->
                             ${this.renderSuspectGrid(suspects, incident ? incident.id : 'case', currentSceneId)}
                        </div>
                    </div>
                </div>
            </div>
        `;

        if (typeof lucide !== 'undefined') lucide.createIcons();
    },

    onSceneChange: function (value) {
        const scenes = InvestigationStore.getScenesWithContext();
        const index = parseInt(value) - 1;

        let targetSceneId = null;
        if (index >= 0 && index < scenes.length) {
            targetSceneId = scenes[index].id;
        } else if (index < 0) {
            targetSceneId = 'start'; // Explicitly set 'start' to avoid fallback to latest
        }

        InvestigationStore.state.filters.sceneId = targetSceneId;
        console.log("🕰️ Scene Time Travel ->", targetSceneId);

        // Re-render
        if (window.InvestigationView && window.InvestigationView.renderActiveView) {
            window.InvestigationView.renderActiveView('crime-web');
        } else {
            window.renderInvestigationBoard();
        }
    },

    renderSuspectGrid: function (suspects, crimeId, sceneId) {
        if (suspects.length === 0) return '<div class="no-data">' + Localization.t('investigation.matrix.empty_characters') + '</div>';

        return suspects.map(suspect => {
            const link = InvestigationStore.getSuspectLinkAtScene(suspect.id, crimeId, sceneId);

            const motive = (link && link.motive && link.motive.level) || 0;
            const means = (link && link.means && link.means.level) || 0;
            const opportunity = (link && link.opportunity && link.opportunity.level) || 0;

            const avg = Math.round((motive + means + opportunity) / 3 * 10);

            return `
                <div class="suspect-card" onclick="InvestigationCrimeWebView.openMMOModal('${suspect.id}')">
                    <div class="suspect-card-header">
                        <div class="suspect-avatar-small">
                            <i data-lucide="user"></i>
                        </div>
                        <div class="suspect-identity">
                            <div class="suspect-name">${suspect.name}</div>
                            <div class="suspect-role">${suspect.role || Localization.t('investigation.evolution.no_char')}</div>
                        </div>
                        <div class="suspect-score-badge">${avg}%</div>
                    </div>
                    
                    <div class="suspect-mmo-bars">
                        <div class="mmo-bar-row">
                            <span class="mmo-label">${Localization.t('investigation.mmo.motive')}</span>
                            <div class="mmo-progress-track">
                                <div class="mmo-progress-fill motive" style="width: ${motive * 10}%"></div>
                            </div>
                            <span class="mmo-value">${motive}/10</span>
                        </div>
                        <div class="mmo-bar-row">
                            <span class="mmo-label">${Localization.t('investigation.mmo.means')}</span>
                            <div class="mmo-progress-track">
                                <div class="mmo-progress-fill means" style="width: ${means * 10}%"></div>
                            </div>
                            <span class="mmo-value">${means}/10</span>
                        </div>
                        <div class="mmo-bar-row">
                            <span class="mmo-label">${Localization.t('investigation.mmo.opportunity')}</span>
                            <div class="mmo-progress-track">
                                <div class="mmo-progress-fill opportunity" style="width: ${opportunity * 10}%"></div>
                            </div>
                            <span class="mmo-value">${opportunity}/10</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    },

    // --- MMO Modal ---

    openMMOModal: function (suspectId) {
        const facts = InvestigationStore.getFacts();
        const crime = facts.find(f => f.type === 'crime' || f.type === 'body') || { id: 'crime_placeholder' };

        // Get Scene Context
        const scenes = InvestigationStore.getScenes();
        const currentSceneId = InvestigationStore.state.filters.sceneId || (scenes.length > 0 ? scenes[scenes.length - 1].id : null);
        const currentScene = scenes.find(s => s.id === currentSceneId) || { title: Localization.t('investigation.crimeweb.start') };

        // Find existing link FOR THIS SCENE
        const link = InvestigationStore.getSuspectLinkAtScene(suspectId, crime.id, currentSceneId) || {};

        const suspect = InvestigationStore.getCharacters().find(c => c.id == suspectId);

        const motiveLevel = link.motive ? link.motive.level : 0;
        const meansLevel = link.means ? link.means.level : 0;
        const oppLevel = link.opportunity ? link.opportunity.level : 0;

        const modalHtml = `
            <div class="modal-overlay" id="mmoModal">
                <div class="modal-container">
                    <div class="modal-header">
                        <h3>${Localization.t('investigation.mmo.modal.title').replace('{0}', suspect ? suspect.name : '???')}</h3>
                        <div style="font-size:0.9rem; color: var(--text-secondary); margin-top:4px;">
                            <i data-lucide="clock" style="width:14px; display:inline; vertical-align:middle;"></i> 
                            ${Localization.t('investigation.mmo.modal.edition_for').replace('{0}', currentScene.title)}
                        </div>
                        <button class="modal-close" onclick="document.getElementById('mmoModal').remove()">×</button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <label>${Localization.t('investigation.mmo.motive')} - ${Localization.t('investigation.mmo.modal.intensity').replace('{0}', '<span id="val-motive">' + motiveLevel + '</span>')}</label>
                            <input type="range" min="0" max="10" value="${motiveLevel}" oninput="document.getElementById('val-motive').innerText = this.value" id="rangeMotive">
                            <textarea id="descMotive" placeholder="${Localization.t('investigation.mmo.placeholder.motive')}" rows="2">${link.motive ? link.motive.description : ''}</textarea>
                        </div>
                        
                        <div class="form-group">
                            <label>${Localization.t('investigation.mmo.means')} - ${Localization.t('investigation.mmo.modal.intensity').replace('{0}', '<span id="val-means">' + meansLevel + '</span>')}</label>
                            <input type="range" min="0" max="10" value="${meansLevel}" oninput="document.getElementById('val-means').innerText = this.value" id="rangeMeans">
                            <textarea id="descMeans" placeholder="${Localization.t('investigation.mmo.placeholder.means')}" rows="2">${link.means ? link.means.description : ''}</textarea>
                        </div>

                        <div class="form-group">
                            <label>${Localization.t('investigation.mmo.opportunity')} - ${Localization.t('investigation.mmo.modal.intensity').replace('{0}', '<span id="val-opp">' + oppLevel + '</span>')}</label>
                            <input type="range" min="0" max="10" value="${oppLevel}" oninput="document.getElementById('val-opp').innerText = this.value" id="rangeOpp">
                            <textarea id="descOpp" placeholder="${Localization.t('investigation.mmo.placeholder.opportunity')}" rows="2">${link.opportunity ? link.opportunity.description : ''}</textarea>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="document.getElementById('mmoModal').remove()">${Localization.t('investigation.dashboard.cancel')}</button>
                        <button class="btn btn-primary" onclick="InvestigationCrimeWebView.saveMMO('${suspectId}', '${crime.id}', '${currentSceneId || ''}')">${Localization.t('investigation.dashboard.save')}</button>
                    </div>
                </div>
            </div>
        `;

        const existingModal = document.getElementById('mmoModal');
        if (existingModal) existingModal.remove();
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        if (typeof lucide !== 'undefined') lucide.createIcons();
    },

    saveMMO: function (suspectId, crimeId, sceneId) {
        const motiveLevel = parseInt(document.getElementById('rangeMotive').value);
        const motiveDesc = document.getElementById('descMotive').value;
        const meansLevel = parseInt(document.getElementById('rangeMeans').value);
        const meansDesc = document.getElementById('descMeans').value;
        const oppLevel = parseInt(document.getElementById('rangeOpp').value);
        const oppDesc = document.getElementById('descOpp').value;

        // Pass sceneId to update specific snapshot
        InvestigationStore.updateSuspectLink({
            suspectId: suspectId,
            victimId: crimeId,
            sceneId: sceneId || null,
            motive: { level: motiveLevel, description: motiveDesc },
            means: { level: meansLevel, description: meansDesc },
            opportunity: { level: oppLevel, description: oppDesc }
        });

        document.getElementById('mmoModal').remove();

        // Refresh view
        if (window.InvestigationView && window.InvestigationView.renderActiveView) {
            window.InvestigationView.renderActiveView('crime-web');
        }
    }
};

window.InvestigationCrimeWebView = InvestigationCrimeWebView;
