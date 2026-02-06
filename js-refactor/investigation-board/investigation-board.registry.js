/**
 * [MVVM : Investigation Registry View]
 * Gestion de la liste des faits, indices et secrets.
 */

const InvestigationRegistryView = {
    render: function (container) {
        const facts = InvestigationStore.getFacts();

        container.innerHTML = `
            <div class="investigation-registry">
                <div class="registry-header">
                    <div class="registry-title-group">
                        <h3>${Localization.t('investigation.registry.title')}</h3>
                        <p>${Localization.t('investigation.registry.desc')}</p>
                    </div>
                    <div class="quick-tip">
                        <i data-lucide="info"></i>
                        <span>${Localization.t('investigation.registry.tip')}</span>
                    </div>
                </div>
                <div class="registry-list">
                    ${facts.length === 0 ? `
                        <div class="empty-state-card">
                            <i data-lucide="search" size="48"></i>
                            <h4>${Localization.t('investigation.registry.empty.title')}</h4>
                            <p>${Localization.t('investigation.registry.empty.desc')}</p>
                            <button class="btn btn-primary" onclick="InvestigationRegistryView.openAddFactModal()">
                                <i data-lucide="plus"></i> ${Localization.t('investigation.registry.empty.action')}
                            </button>
                        </div>
                    ` : ''}
                    ${facts.map(fact => this.renderFactCard(fact)).join('')}
                </div>
            </div>
        `;
    },

    renderFactCard: function (fact) {
        const typeIcons = {
            clue: 'search',
            event: 'calendar',
            testimony: 'message-square',
            object: 'package',
            crime: 'skull',
            disappearance: 'user-x',
            coma: 'activity'
        };
        const icon = typeIcons[fact.type] || 'file-text';

        return `
            <div class="fact-card ${fact.isHidden ? 'is-secret' : ''}" onclick="InvestigationRegistryView.editFact('${fact.id}')">
                <div class="fact-type-icon ${fact.type}">
                    <i data-lucide="${icon}"></i>
                </div>
                <div class="fact-content">
                    <div class="fact-header">
                        <span class="fact-label">${fact.label}</span>
                        ${fact.isHidden ? '<i data-lucide="eye-off" class="secret-hint"></i>' : ''}
                    </div>
                    <p class="fact-description">${fact.description || Localization.t('investigation.case.placeholder.no_description') || '...'}</p>
                </div>
                <div class="fact-actions" style="display: flex; align-items: center; padding-right: 10px;">
                    <button class="btn-icon-danger" style="background:none; border:none; cursor:pointer;" onclick="event.stopPropagation(); InvestigationRegistryView.deleteFact('${fact.id}')" title="${Localization.t('investigation.dashboard.delete')}">
                        <i data-lucide="trash-2" style="width:18px; height:18px; color:var(--text-secondary);"></i>
                    </button>
                </div>
                <div class="fact-truth-sidebar status-${fact.truthStatus}"></div>
            </div>
        `;
    },


    // --- TAB MANAGEMENT ---
    switchTab: function (tabName, btnElement) {
        // Toggle Content
        document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
        const targetContent = document.getElementById('tab-' + tabName);
        if (targetContent) targetContent.classList.add('active');

        // Toggle Buttons
        if (btnElement) {
            document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
            btnElement.classList.add('active');
        }
    },

    openAddFactModal: function (factId = null) {
        const existingFact = factId ? InvestigationStore.getFactById(factId) : null;
        const modalTitle = existingFact ? Localization.t('investigation.case.modal.title_edit') : Localization.t('investigation.registry.empty.action');
        const btnLabel = existingFact ? Localization.t('investigation.dashboard.save') : Localization.t('investigation.dashboard.create');

        // Récupération des données pour les sélecteurs
        const allCharacters = InvestigationStore.getCharacters();
        const allLocations = InvestigationStore.getLocations();
        const allArcs = (window.ArcModel && window.ArcModel.arcs) || [];

        const modalHtml = `
            <div class="modal-overlay" id="fact-modal">
                <div class="modal-container large-modal">
                    <div class="modal-header">
                        <h3>${modalTitle}</h3>
                        <button class="modal-close" onclick="document.getElementById('fact-modal').remove()">×</button>
                    </div>
                    
                    <div class="modal-tabs">
                        <button class="tab-btn active" onclick="InvestigationRegistryView.switchTab('general', this)">${Localization.t('investigation.registry.modal.general')}</button>
                        <button class="tab-btn" onclick="InvestigationRegistryView.switchTab('timeline', this)" ${!existingFact ? 'disabled title="Create fact first"' : ''}>${Localization.t('investigation.registry.modal.evolution')}</button>
                    </div>

                    <div class="modal-body">
                        <!-- TAB GENERAL -->
                        <div id="tab-general" class="tab-content active">
                            <div class="form-row">
                                <div class="form-group flex-1">
                                    <label>${Localization.t('investigation.registry.label.title')}</label>
                                    <input type="text" id="factLabel" value="${existingFact ? existingFact.label : ''}" placeholder="${Localization.t('investigation.registry.placeholder.title')}">
                                </div>
                                <div class="form-group width-auto">
                                    <label>${Localization.t('investigation.registry.label.type')}</label>
                                    <select id="factType">
                                        <option value="clue" ${existingFact?.type === 'clue' ? 'selected' : ''}>${Localization.t('investigation.type.clue')}</option>
                                        <option value="event" ${existingFact?.type === 'event' ? 'selected' : ''}>${Localization.t('investigation.type.event')}</option>
                                        <option value="testimony" ${existingFact?.type === 'testimony' ? 'selected' : ''}>${Localization.t('investigation.type.testimony')}</option>
                                        <option value="object" ${existingFact?.type === 'object' ? 'selected' : ''}>${Localization.t('investigation.type.object')}</option>
                                        <option value="crime" ${existingFact?.type === 'crime' ? 'selected' : ''}>${Localization.t('investigation.type.crime')}</option>
                                        <option value="disappearance" ${existingFact?.type === 'disappearance' ? 'selected' : ''}>${Localization.t('investigation.type.disappearance')}</option>
                                        <option value="coma" ${existingFact?.type === 'coma' ? 'selected' : ''}>${Localization.t('investigation.type.coma')}</option>
                                    </select>
                                </div>
                            </div>

                            <div class="form-group">
                                <label>${Localization.t('investigation.registry.label.description')}</label>
                                <textarea id="factDescription" rows="3">${existingFact ? existingFact.description : ''}</textarea>
                            </div>

                            <div class="form-group">
                                <label>${Localization.t('investigation.registry.label.characters')}</label>
                                <div class="chars-grid" id="charsStart">
                                    ${this.renderMultiSelectOptions(allCharacters, existingFact?.relatedCharacterIds || [])}
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="form-group flex-1">
                                    <label>${Localization.t('investigation.registry.label.location')}</label>
                                    <select id="factLocation">
                                        <option value="">-- ${Localization.t('investigation.case.option.none')} --</option>
                                        ${allLocations.map(loc => `<option value="${loc.id}" ${existingFact?.relatedLocationIds?.includes(loc.id) ? 'selected' : ''}>${loc.name}</option>`).join('')}
                                    </select>
                                </div>
                                <div class="form-group flex-1">
                                    <label>${Localization.t('investigation.registry.label.arc')}</label>
                                    <input type="text" id="factArc" value="${existingFact?.relatedArcId || ''}" placeholder="${Localization.t('investigation.registry.placeholder.arc')}">
                                </div>
                            </div>

                             <div class="form-row">
                                <div class="form-group">
                                    <label>${Localization.t('investigation.registry.label.truth')}</label>
                                    <select id="factStatus">
                                        <option value="verified" ${existingFact?.truthStatus === 'verified' ? 'selected' : ''}>${Localization.t('investigation.truth.verified')}</option>
                                        <option value="disputed" ${existingFact?.truthStatus === 'disputed' ? 'selected' : ''}>${Localization.t('investigation.truth.disputed')}</option>
                                        <option value="false" ${existingFact?.truthStatus === 'false' ? 'selected' : ''}>${Localization.t('investigation.truth.false')}</option>
                                    </select>
                                </div>
                                <div class="form-group checkbox-group" style="padding-top: 25px;">
                                    <input type="checkbox" id="factSecret" ${existingFact?.isHidden ? 'checked' : ''}>
                                    <label for="factSecret">${Localization.t('investigation.registry.label.secret')}</label>
                                </div>
                            </div>
                        </div>

                        <!-- TAB TIMELINE -->
                        <div id="tab-timeline" class="tab-content">
                            <div class="timeline-list">
                                ${this.renderTimeline(existingFact?.timeline || [], factId)}
                            </div>
                            <div class="timeline-actions">
                                <button class="btn btn-secondary btn-sm" onclick="InvestigationRegistryView.openAddTimelineStep('${factId}')">
                                    <i data-lucide="plus"></i> ${Localization.t('investigation.evolution.add')}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div class="modal-footer">
                        ${existingFact ? `<button class="btn btn-danger" style="margin-right: auto;" onclick="InvestigationRegistryView.deleteFact('${factId}')"><i data-lucide="trash-2"></i> ${Localization.t('investigation.dashboard.delete')}</button>` : ''}
                        <button class="btn btn-secondary" onclick="document.getElementById('fact-modal').remove()">${Localization.t('investigation.dashboard.cancel')}</button>
                        <button class="btn btn-primary" onclick="InvestigationRegistryView.saveFact('${factId || ''}')">${btnLabel}</button>
                    </div>
                </div>
            </div>
        `;

        // Inject modal
        const existingModal = document.getElementById('fact-modal');
        if (existingModal) existingModal.remove();
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        if (typeof lucide !== 'undefined') lucide.createIcons();
    },

    /**
     * Renders multi-select options for characters
     */
    renderMultiSelectOptions: function (characters, selectedIds) {
        if (!characters || characters.length === 0) {
            return `<div class="no-items">${Localization.t('investigation.registry.no_characters')}</div>`;
        }
        return characters.map(char => {
            const isSelected = selectedIds.includes(char.id);
            const name = char.name || char.firstName || 'Personnage';
            return `
                <div class="char-select-item ${isSelected ? 'selected' : ''}" 
                     data-id="${char.id}" 
                     onclick="this.classList.toggle('selected')">
                    ${name}
                </div>
            `;
        }).join('');
    },

    // --- TIMELINE MANAGEMENT (CRUD) ---

    // 1. RENDER LIST
    renderTimeline: function (timeline, factId) {
        if (!timeline || timeline.length === 0) {
            return `
                <div class="empty-timeline">
                    <i data-lucide="clock" class="empty-icon"></i>
                    <p>${Localization.t('investigation.registry.empty_timeline')}</p>
                </div>
            `;
        }

        const scenes = InvestigationStore.getScenesWithContext();
        const enrichedSteps = timeline.map(step => {
            const scene = scenes.find(s => (s.id || s.uid) == step.sceneId);
            const character = InvestigationStore.getCharacters().find(c => c.id == step.characterId);
            return {
                ...step,
                scene,
                charName: character ? character.name : Localization.t('investigation.evolution.no_char')
            };
        });

        // Use the same premium UI classes as the main timeline
        return `
            <div class="investigation-timeline premium-modal-timeline">
                <div class="timeline-path">
                    <div class="timeline-vertical-line"></div>
                    ${enrichedSteps.map((step, index) => {
            const statusLabel = Localization.t('investigation.evolution.status.' + step.state) || step.state;
            const scene = step.scene || { title: 'Scène inconnue', actTitle: '?', chapterTitle: '?' };

            return `
                        <div class="evo-step timeline-scene-node" style="animation-delay: ${index * 0.05}s">
                            <div class="evo-marker scene-node-marker"></div>
                            <div class="evo-card scene-node-content">
                                <div class="evo-header scene-node-header">
                                    <div class="scene-node-breadcrumb">
                                        <span class="breadcrumb-item act">${scene.actTitle || '?'}</span>
                                        <i data-lucide="chevron-right"></i>
                                        <span class="breadcrumb-item chapter">${scene.chapterTitle || '?'}</span>
                                        <i data-lucide="chevron-right"></i>
                                        <span class="breadcrumb-item scene">${scene.title}</span>
                                    </div>
                                    <span class="status-pill status-${step.state}">${statusLabel}</span>
                                </div>
                                <div class="evo-body step-card-body">
                                    <div class="evo-actor step-actor">
                                        <strong>${Localization.t('investigation.evolution.step.who')}</strong> ${step.charName}
                                    </div>
                                    <div class="evo-desc step-desc">
                                        ${step.description}
                                    </div>
                                </div>
                                <div class="evo-actions step-card-actions">
                                    <button class="btn-icon-xs" title="${Localization.t('investigation.evolution.edit')}" onclick="InvestigationRegistryView.openEditTimelineStep('${factId}', '${step.id}')">
                                        <i data-lucide="edit-2"></i>
                                    </button>
                                    <button class="btn-icon-xs danger" title="${Localization.t('investigation.evolution.delete')}" onclick="InvestigationRegistryView.deleteTimelineStep('${factId}', '${step.id}')">
                                        <i data-lucide="trash-2"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                        `;
        }).join('')}
                </div>
            </div>
        `;
    },

    // 2. OPEN FORM (ADD or EDIT)
    openEditTimelineStep: function (factId, stepId = null) {
        const fact = InvestigationStore.getFactById(factId);
        if (!fact) return;

        let stepData = {};
        if (stepId) {
            stepData = fact.timeline.find(s => s.id === stepId) || {};
        }

        const scenes = InvestigationStore.getScenesWithContext();
        const characters = InvestigationStore.getCharacters();

        const formHtml = `
            <div class="timeline-editor-overlay" id="timelineEditor">
                <div class="timeline-editor-card">
                    <h4>${stepId ? Localization.t('investigation.evolution.edit') : Localization.t('investigation.evolution.add')}</h4>
                    
                    <div class="form-group">
                        <label>${Localization.t('investigation.evolution.step.who')}</label>
                        <select id="tlChar">
                            <option value="">-- ${Localization.t('investigation.evolution.no_char')} --</option>
                            ${characters.map(c => `<option value="${c.id}" ${c.id == stepData.characterId ? 'selected' : ''}>${c.name}</option>`).join('')}
                        </select>
                    </div>

                    <div class="form-group">
                        <label>${Localization.t('investigation.evolution.step.when')}</label>
                        <select id="tlScene">
                            ${scenes.map(s => {
            const label = `${s.actTitle} > ${s.chapterTitle} > ${s.title}`;
            return `<option value="${s.id || s.uid}" ${(s.id || s.uid) == stepData.sceneId ? 'selected' : ''}>${label}</option>`;
        }).join('')}
                        </select>
                    </div>

                    <div class="form-group">
                        <label>${Localization.t('investigation.evolution.step.state')}</label>
                        <select id="tlStatus">
                            <option value="revealed" ${stepData.state === 'revealed' ? 'selected' : ''}>${Localization.t('investigation.evolution.status.revealed')}</option>
                            <option value="hinted" ${stepData.state === 'hinted' ? 'selected' : ''}>${Localization.t('investigation.evolution.status.hinted')}</option>
                            <option value="obscured" ${stepData.state === 'obscured' ? 'selected' : ''}>${Localization.t('investigation.evolution.status.obscured')}</option>
                            <option value="disputed" ${stepData.state === 'disputed' ? 'selected' : ''}>${Localization.t('investigation.evolution.status.disputed')}</option>
                            <option value="confirmed" ${stepData.state === 'confirmed' ? 'selected' : ''}>${Localization.t('investigation.evolution.status.confirmed')}</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label>${Localization.t('investigation.evolution.step.how')}</label>
                        <textarea id="tlDesc" rows="3">${stepData.description || ''}</textarea>
                    </div>

                    <div class="form-footer">
                        <button class="btn btn-secondary" onclick="document.getElementById('timelineEditor').remove()">${Localization.t('investigation.dashboard.cancel')}</button>
                        <button class="btn btn-primary" onclick="InvestigationRegistryView.saveTimelineStep('${factId}', '${stepId || ''}')">${Localization.t('investigation.dashboard.save')}</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', formHtml);
        if (typeof lucide !== 'undefined') lucide.createIcons();
    },

    openAddTimelineStep: function (factId) {
        this.openEditTimelineStep(factId, null);
    },

    // 3. SAVE Logic
    saveTimelineStep: function (factId, stepId) {
        const charId = document.getElementById('tlChar').value;
        const sceneId = document.getElementById('tlScene').value;
        const state = document.getElementById('tlStatus').value;
        const desc = document.getElementById('tlDesc').value;

        if (!desc) {
            alert(Localization.t('investigation.evolution.step.how') + " required.");
            return;
        }

        const fact = InvestigationStore.getFactById(factId);
        if (!fact) return;

        if (!fact.timeline) fact.timeline = [];

        if (stepId) {
            // Update
            const stepIndex = fact.timeline.findIndex(s => s.id === stepId);
            if (stepIndex !== -1) {
                fact.timeline[stepIndex] = {
                    ...fact.timeline[stepIndex],
                    characterId: charId,
                    sceneId,
                    state,
                    description: desc,
                    updatedAt: Date.now()
                };
            }
        } else {
            // Create
            const newId = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : 'step-' + Date.now() + Math.random().toString(36).substr(2, 9);

            fact.timeline.push({
                id: newId,
                characterId: charId,
                sceneId,
                state,
                description: desc,
                timestamp: Date.now()
            });
        }

        // Save entire fact
        InvestigationStore.updateFact(fact);

        if (charId && sceneId) {
            let matrixState = null;
            switch (state) {
                case 'revealed':
                case 'confirmed':
                    matrixState = 'knows';
                    break;
                case 'hinted':
                case 'disputed':
                    matrixState = 'suspicious';
                    break;
                case 'obscured':
                    matrixState = 'misled';
                    break;
            }

            if (matrixState) {
                InvestigationStore.setKnowledgeState(charId, factId, sceneId, matrixState);
            }
        }

        const editor = document.getElementById('timelineEditor');
        if (editor) editor.remove();

        const container = document.querySelector('.timeline-list');
        if (container) {
            const updatedFact = InvestigationStore.getFactById(factId);
            container.innerHTML = this.renderTimeline(updatedFact ? updatedFact.timeline : [], factId);
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }
    },

    // 4. DELETE
    deleteTimelineStep: function (factId, stepId) {
        if (!confirm(Localization.t('investigation.dashboard.confirm_delete').replace('{0}', 'step'))) return;

        const fact = InvestigationStore.getFactById(factId);
        if (!fact || !fact.timeline) return;

        fact.timeline = fact.timeline.filter(s => s.id !== stepId);
        InvestigationStore.updateFact(fact);

        const container = document.querySelector('.timeline-list');
        if (container) {
            container.innerHTML = this.renderTimeline(fact.timeline, factId);
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }
    },
    saveFact: function (factId) {
        const label = document.getElementById('factLabel').value;
        const type = document.getElementById('factType').value;
        const status = document.getElementById('factStatus').value;
        const desc = document.getElementById('factDescription').value;
        const isSecret = document.getElementById('factSecret').checked;
        const locationId = document.getElementById('factLocation').value;
        const arcId = document.getElementById('factArc').value;

        const charElements = document.querySelectorAll('.char-select-item.selected');
        const charIds = Array.from(charElements).map(el => el.getAttribute('data-id'));

        if (!label) {
            alert(Localization.t('investigation.registry.error.title_required'));
            return;
        }

        const activeCase = InvestigationStore.getActiveCase();
        if (!activeCase && !factId) {
            alert("Erreur: Aucune affaire active sélectionnée.");
            return;
        }

        let existingFact = null;
        if (factId) {
            existingFact = InvestigationStore.getFactById(factId);
        }

        const factData = {
            ...(existingFact || {}),
            id: factId || undefined,
            caseId: activeCase ? activeCase.id : undefined,
            label,
            type,
            description: desc,
            truthStatus: status,
            isHidden: isSecret,
            relatedCharacterIds: charIds,
            relatedLocationIds: locationId ? [locationId] : [],
            relatedArcId: arcId
        };

        try {
            if (factId) {
                InvestigationStore.updateFact(factData);
            } else {
                const newFact = InvestigationStore.createFact(factData);
                InvestigationStore.addFact(newFact);
            }

            document.getElementById('fact-modal').remove();

            if (InvestigationStore.state.currentView === 'registry') {
                window.renderInvestigationBoard();
            }

        } catch (e) {
            console.error("❌ Error saving fact:", e);
            alert("Une erreur est survenue lors de la sauvegarde.");
        }
    },

    deleteFact: function (id) {
        if (confirm(Localization.t('investigation.registry.confirm_delete_fact'))) {
            InvestigationStore.deleteFact(id);
            const modal = document.getElementById('fact-modal');
            if (modal) modal.remove();

            if (InvestigationStore.state.currentView === 'registry') {
                window.renderInvestigationBoard();
            }
        }
    },

    editFact: function (id) {
        this.openAddFactModal(id);
    }
};

window.InvestigationRegistryView = InvestigationRegistryView;
