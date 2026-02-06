/**
 * [MVVM : Investigation Crime Web View]
 * Visualisation "Toile d'Araignée" centrée sur le Crime.
 * Affiche les suspects et leurs liaisons MMO (Mobile, Means, Opportunity).
 */

const InvestigationCrimeWebView = {
    state: {
        selectedIncidentId: null
    },

    // Updated render method to support 'all' mode
    render: function (container) {
        const activeCase = InvestigationStore.getActiveCase();
        const facts = InvestigationStore.getFacts();

        // 1. Identification des Incidents pour le selecteur
        const groups = {
            'Major': facts.filter(f => ['crime', 'body', 'disappearance'].includes(f.type)),
            'Events': facts.filter(f => f.type === 'event'),
            'Others': facts.filter(f => !['crime', 'body', 'disappearance', 'event'].includes(f.type))
        };
        const allCandidates = [...groups['Major'], ...groups['Events'], ...groups['Others']];

        // Init State
        if (!this.state.selectedIncidentId && allCandidates.length > 0) {
            this.state.selectedIncidentId = allCandidates[0].id;
        }
        // Validation (allow 'all' as valid selection)
        if (this.state.selectedIncidentId !== 'all' && this.state.selectedIncidentId && !allCandidates.find(i => i.id === this.state.selectedIncidentId)) {
            this.state.selectedIncidentId = allCandidates.length > 0 ? allCandidates[0].id : null;
        }

        const suspects = InvestigationStore.getCharacters();
        const scenes = InvestigationStore.getScenesWithContext();
        const currentSceneId = InvestigationStore.state.filters.sceneId || (scenes.length > 0 ? scenes[scenes.length - 1].id : null);

        // --- EMPTY STATE ---
        if (allCandidates.length === 0) {
            container.innerHTML = `
                <div class="investigation-crime-web">
                     <div class="empty-state-card">
                        <i data-lucide="activity" size="48"></i>
                        <h4>${Localization.t('investigation.crimeweb.empty.title') || 'Aucune analyse possible'}</h4>
                        <p>${Localization.t('investigation.crimeweb.empty.desc') || 'Ajoutez un Crime ou un Événement majeur dans le registre pour commencer.'}</p>
                    </div>
                </div>`;
            return;
        }

        container.innerHTML = `
            <div class="investigation-analysis-view">
                <!-- HEADER & TOOLBAR -->
                <div class="analysis-toolbar">
                    <div class="analysis-header-row">
                        <div class="analysis-selector-group">
                            <label>Sujet de l'Enquête :</label>
                            <div class="select-wrapper">
                                <i data-lucide="target"></i>
                                <select id="analysisIncidentSelect" onchange="InvestigationCrimeWebView.setIncident(this.value)">
                                    <option value="all" ${this.state.selectedIncidentId === 'all' ? 'selected' : ''}>-- Bilan Global (Tous les sujets) --</option>
                                    ${groups['Major'].length > 0 ? `<optgroup label="Crimes majeurs">${groups['Major'].map(i => `<option value="${i.id}" ${i.id === this.state.selectedIncidentId ? 'selected' : ''}>${i.label}</option>`).join('')}</optgroup>` : ''}
                                    ${groups['Events'].length > 0 ? `<optgroup label="Événements">${groups['Events'].map(i => `<option value="${i.id}" ${i.id === this.state.selectedIncidentId ? 'selected' : ''}>${i.label}</option>`).join('')}</optgroup>` : ''}
                                    ${groups['Others'].length > 0 ? `<optgroup label="Autres indices">${groups['Others'].map(i => `<option value="${i.id}" ${i.id === this.state.selectedIncidentId ? 'selected' : ''}>${i.label}</option>`).join('')}</optgroup>` : ''}
                                </select>
                            </div>
                        </div>
                        
                        ${this.state.selectedIncidentId === 'all' ? `
                             <div class="analysis-filter-group">
                                <label class="checkbox-label" title="Masquer les lignes sans activité MMO">
                                    <input type="checkbox" id="filterEmptyMMO" 
                                           ${this.state.hideEmptyMMO ? 'checked' : ''} 
                                           onchange="InvestigationCrimeWebView.toggleEmptyFilter(this.checked)">
                                    Masquer si vide
                                </label>
                             </div>
                        ` : ''}
                    </div>

                    <div class="analysis-timeline-container">
                        ${this.renderVisualTimeline(scenes, currentSceneId)}
                    </div>
                </div>

                <!-- MAIN ANALYSIS TABLE -->
                <div class="analysis-content">
                    ${this.renderAnalysisTable(suspects, allCandidates, currentSceneId)}
                </div>
            </div>
        `;

        if (typeof lucide !== 'undefined') lucide.createIcons();
    },

    toggleEmptyFilter: function (checked) {
        this.state.hideEmptyMMO = checked;
        this.render(document.querySelector('.investigation-crime-web') || document.getElementById('investigationContent'));
    },

    setIncident: function (id) {
        this.state.selectedIncidentId = id;
        this.render(document.querySelector('.investigation-crime-web') || document.getElementById('investigationContent'));
    },

    onSceneClick: function (sceneId) {
        InvestigationStore.state.filters.sceneId = sceneId;
        console.log("🕰️ Scene Jump ->", sceneId);
        if (window.InvestigationView && window.InvestigationView.renderActiveView) {
            window.InvestigationView.renderActiveView('crime-web');
        } else {
            window.renderInvestigationBoard();
        }
    },

    renderVisualTimeline: function (scenes, currentSceneId) {
        if (!scenes || scenes.length === 0) return '';

        // Group by Act
        const acts = [];
        let currentAct = null;

        scenes.forEach((scene, index) => {
            const actKey = scene.actTitle || 'Acte 1';
            let act = acts.find(a => a.title === actKey);
            if (!act) {
                act = { title: actKey, chapters: [] };
                acts.push(act);
            }

            // Group by Chapter within Act
            const chapKey = scene.chapterTitle || 'Chapitre 1';
            let chapter = act.chapters.find(c => c.title === chapKey);
            if (!chapter) {
                chapter = { title: chapKey, scenes: [] };
                act.chapters.push(chapter);
            }

            chapter.scenes.push({ ...scene, globalIndex: index });
        });

        // Generate HTML
        let html = '<div class="visual-timeline-track">';

        // Current Scene Info Display
        // Use loose equality (==) because currentSceneId might be string from HTML attribute while scene.id is number
        const currentScene = scenes.find(s => s.id == currentSceneId) || scenes[scenes.length - 1];
        const currentSceneIndex = scenes.findIndex(s => s.id == currentSceneId);

        // Progress Bar
        const progressPercent = ((currentSceneIndex + 1) / scenes.length) * 100;

        html += `
            <div class="timeline-meta-header">
                <span class="tm-label"><i data-lucide="clock"></i> État des connaissances :</span>
                <span class="tm-value">${currentScene ? currentScene.title : 'Début'}</span>
                <span class="tm-context">(${currentScene ? (currentScene.actTitle + ' > ' + currentScene.chapterTitle) : ''})</span>
            </div>
        `;

        html += '<div class="timeline-acts-container">';

        acts.forEach(act => {
            html += `<div class="timeline-act-block">`;
            html += `<div class="act-label">${act.title}</div>`;
            html += `<div class="act-chapters-row">`;

            act.chapters.forEach(chapter => {
                html += `<div class="timeline-chapter-block">`;
                // html += `<div class="chapter-label">${chapter.title}</div>`; // Optional: tooltip only to save space?
                html += `<div class="chapter-scenes-row">`;

                chapter.scenes.forEach(scene => {
                    const isPast = scene.globalIndex <= currentSceneIndex;
                    const isActive = scene.id == currentSceneId;
                    const classes = `ts-node ${isPast ? 'active' : ''} ${isActive ? 'current' : ''}`;

                    html += `<div class="${classes}" 
                                  onclick="InvestigationCrimeWebView.onSceneClick('${scene.id}')"
                                  title="${scene.title} (${chapter.title})">
                             </div>`;
                });

                html += `</div></div>`; // End chapter
            });

            html += `</div></div>`; // End act
        });

        html += '</div></div>'; // End container

        return html;
    },

    renderAnalysisTable: function (suspects, incidents, sceneId) {
        if (suspects.length === 0) return `<div class="web-empty">${Localization.t('investigation.crimeweb.no_characters')}</div>`;

        // Handle Single vs All
        const isAllMode = this.state.selectedIncidentId === 'all';
        const targetIncidents = isAllMode ? incidents : [incidents.find(i => i.id === this.state.selectedIncidentId)];

        return `
            <div class="analysis-table-container">
                <table class="analysis-table">
                    <thead>
                        <tr>
                            <th class="th-suspect">${Localization.t('investigation.registry.table.characters') || 'Suspect'}</th>
                            <th class="th-mmo">${Localization.t('investigation.mmo.motive') || 'Mobile'}</th>
                            <th class="th-mmo">${Localization.t('investigation.mmo.means') || 'Moyens'}</th>
                            <th class="th-mmo">${Localization.t('investigation.mmo.opportunity') || 'Opportunité'}</th>
                            <th class="th-score">Score</th>
                            <th class="th-action"></th>
                        </tr>
                    </thead>
                    <tbody>
                        ${suspects.map(suspect => this.renderSuspectBlock(suspect, targetIncidents, sceneId, isAllMode)).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },

    renderSuspectBlock: function (suspect, incidents, sceneId, isAllMode) {
        // If not ALL mode, just render the single row as before
        if (!isAllMode) {
            return this.renderAnalysisRow(suspect, incidents[0], sceneId, false);
        }

        // ALL MODE:
        // Render Main Suspect Row (Header)
        // Then nested rows for each incident

        // Calculate Global activity to decide if we show the block (if filter is ON)
        let hasActivity = false;
        const rowsHtml = incidents.map(incident => {
            const rowHtml = this.renderAnalysisRow(suspect, incident, sceneId, true);
            if (rowHtml) hasActivity = true; // renderAnalysisRow returns null if hidden by filter (logic below)
            return rowHtml;
        }).join('');

        if (this.state.hideEmptyMMO && !hasActivity) return ''; // Hide entire suspect if no activity

        return `
            <tr class="suspect-header-row">
                <td colspan="6">
                    <div class="suspect-header-cell">
                        <div class="suspect-avatar-micro" style="background-color: ${suspect.color || 'var(--primary-color)'}">
                             ${suspect.name.charAt(0)}
                        </div>
                        <span class="suspect-name-header">${suspect.name}</span>
                    </div>
                </td>
            </tr>
            ${rowsHtml}
        `;
    },

    renderAnalysisRow: function (suspect, incident, sceneId, isNested) {
        const link = InvestigationStore.getSuspectLinkAtScene(suspect.id, incident.id, sceneId) || {};
        const motive = (link.motive && link.motive.level) || 0;
        const means = (link.means && link.means.level) || 0;
        const opportunity = (link.opportunity && link.opportunity.level) || 0;
        const avg = Math.round((motive + means + opportunity) / 3 * 10);

        // Filter Logic: If hideEmptyMMO is TRUE, and all values are 0, return null
        if (this.state.hideEmptyMMO && motive === 0 && means === 0 && opportunity === 0) {
            return null; // Don't render this row
        }

        let scoreClass = 'low';
        if (avg >= 40) scoreClass = 'medium';
        if (avg >= 70) scoreClass = 'high';

        const rowClass = isNested ? 'analysis-row nested-row' : 'analysis-row';
        const nameCellContent = isNested ?
            `<span class="nested-incident-label"><i data-lucide="corner-down-right"></i> ${incident.label}</span>` :
            `<div class="suspect-cell-compact">
                <div class="suspect-avatar-micro" style="background-color: ${suspect.color || 'var(--primary-color)'}">${suspect.name.charAt(0)}</div>
                <span class="suspect-name-table">${suspect.name}</span>
             </div>`;

        return `
            <tr class="${rowClass}" onclick="InvestigationCrimeWebView.openMMOModal('${suspect.id}')">
                <td class="td-suspect">
                    ${nameCellContent}
                </td>
                
                <td class="td-mmo">
                    <div class="mmo-bar-compact">
                        <div class="mmo-track"><div class="mmo-fill motive" style="width: ${motive * 10}%"></div></div>
                        <span class="mmo-val">${motive}</span>
                    </div>
                </td>
                
                <td class="td-mmo">
                    <div class="mmo-bar-compact">
                        <div class="mmo-track"><div class="mmo-fill means" style="width: ${means * 10}%"></div></div>
                        <span class="mmo-val">${means}</span>
                    </div>
                </td>
                
                <td class="td-mmo">
                    <div class="mmo-bar-compact">
                        <div class="mmo-track"><div class="mmo-fill opportunity" style="width: ${opportunity * 10}%"></div></div>
                        <span class="mmo-val">${opportunity}</span>
                    </div>
                </td>

                <td class="td-score">
                    <div class="score-badge ${scoreClass}">${avg}%</div>
                </td>

                <td class="td-action">
                    <button class="btn-icon-sm" onclick="event.stopPropagation(); InvestigationCrimeWebView.editSpecificMMO('${suspect.id}', '${incident.id}')"><i data-lucide="edit-3"></i></button>
                </td>
            </tr>
        `;
    },

    editSpecificMMO: function (suspectId, incidentId) {
        // Wrapper to force specific incident ID when in nested mode
        this.state.tempOverrideIncidentId = incidentId;
        this.openMMOModal(suspectId);
        this.state.tempOverrideIncidentId = null;
    },

    // --- MMO Modal ---

    openMMOModal: function (suspectId) {
        const facts = InvestigationStore.getFacts();
        const crime = facts.find(f => f.type === 'crime' || f.type === 'body') || { id: 'crime_placeholder' };

        // Get Scene Context
        const scenes = InvestigationStore.getScenes();
        const currentSceneId = InvestigationStore.state.filters.sceneId || (scenes.length > 0 ? scenes[scenes.length - 1].id : null);
        const currentScene = scenes.find(s => s.id === currentSceneId) || { title: Localization.t('investigation.crimeweb.start') };

        // Use selected incident from state OR optional override (for nested view)
        const incidentId = this.state.tempOverrideIncidentId || this.state.selectedIncidentId || (crime ? crime.id : null);

        // Find existing link FOR THIS SCENE
        const link = InvestigationStore.getSuspectLinkAtScene(suspectId, incidentId, currentSceneId) || {};

        const suspect = InvestigationStore.getCharacters().find(c => c.id == suspectId);
        const incidentLabel = InvestigationStore.getFacts().find(f => f.id == incidentId)?.label || 'Incident';

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
                        <button class="btn btn-primary" onclick="InvestigationCrimeWebView.saveMMO('${suspectId}', '${incidentId}', '${currentSceneId || ''}')">${Localization.t('investigation.dashboard.save')}</button>
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
