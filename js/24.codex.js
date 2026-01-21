// ============================================
// Module: views/codex
// Généré automatiquement - Plume Writer
// ============================================

// [MVVM : View]
// Affiche une modale et manipule le DOM (purement interface).
function openAddCodexModal() {
    document.getElementById('addCodexModal').classList.add('active');
    setTimeout(() => document.getElementById('codexTitleInput').focus(), 100);
}

// [MVVM : ViewModel]
// Traite l'entrée utilisateur et met à jour le Model (project.codex).
function addCodexEntry() {
    const title = document.getElementById('codexTitleInput').value.trim();
    const category = document.getElementById('codexCategoryInput').value;
    const summary = document.getElementById('codexSummaryInput').value.trim();

    if (!title) return;

    const entry = {
        id: Date.now(),
        title: title,
        category: category,
        summary: summary || '',
        content: '',
        relatedTo: [] // IDs of related characters, world elements, etc.
    };

    project.codex.push(entry);

    // Clear inputs
    document.getElementById('codexTitleInput').value = '';
    document.getElementById('codexSummaryInput').value = '';

    closeModal('addCodexModal');
    saveProject();
    renderCodexList();
}

// [MVVM : ViewModel]
// Modifie le Model (suppression) et déclenche sauvegarde + rafraîchissement.
function deleteCodexEntry(id) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette entrée ?')) return;
    project.codex = project.codex.filter(c => c.id !== id);
    saveProject();
    renderCodexList();
    showEmptyState();
}

// [MVVM : View]
// Rend la liste dans le DOM (groupement, tri, affichage).
function renderCodexList() {
    const container = document.getElementById('codexList');

    if (project.codex.length === 0) {
        container.innerHTML = '<div style="padding: 1rem; text-align: center; color: var(--text-muted); font-size: 0.85rem;">Aucune entrée</div>';
        return;
    }

    // Group by category
    const groups = {};
    project.codex.forEach(entry => {
        const cat = entry.category || 'Autre';
        if (!groups[cat]) groups[cat] = [];
        groups[cat].push(entry);
    });

    // Icons for each category (Mise à jour avec Lucide Icons)
    const catIcons = {
        'Culture': 'palette', // Art/Création
        'Histoire': 'scroll', // Parchemin
        'Technologie': 'cpu', // Processeur/Technologie
        'Géographie': 'globe', // Globe/Carte
        'Politique': 'scale', // Balance (Justice/Politique)
        'Magie/Pouvoir': 'sparkles', // Étincelles/Magie
        'Religion': 'book-open', // Livre ouvert/Écritures
        'Société': 'users', // Utilisateurs/Groupe social
        'Autre': 'file-text' // Document par défaut
    };

    // Get collapsed state from localStorage
    const collapsedState = JSON.parse(localStorage.getItem('plume_treeview_collapsed') || '{}');

    let html = '';
    Object.keys(groups).sort().forEach(category => {
        const groupKey = 'codex_' + category;
        const isCollapsed = collapsedState[groupKey] === true;

        // Sort entries alphabetically within each group
        const sortedEntries = [...groups[category]].sort((a, b) => {
            return (a.title || '').toLowerCase().localeCompare((b.title || '').toLowerCase(), 'fr');
        });

        html += `
                    <div class="treeview-group">
                        <div class="treeview-header" onclick="toggleTreeviewGroup('${groupKey}')">
                            <i data-lucide="${isCollapsed ? 'chevron-right' : 'chevron-down'}" class="treeview-chevron"></i>
                            <span class="treeview-label">${category}</span>
                            <span class="treeview-count">${groups[category].length}</span>
                        </div>
                        <div class="treeview-children ${isCollapsed ? 'collapsed' : ''}">
                            ${sortedEntries.map(entry => {
            const iconName = catIcons[category] || 'file-text'; // Icône par défaut 'file-text'

            return `
                                <div class="treeview-item" onclick="openCodexDetail(${entry.id})">
                                    <span class="treeview-item-icon"><i data-lucide="${iconName}" style="width:14px;height:14px;vertical-align:middle;"></i></span>
                                    <span class="treeview-item-label">${entry.title}</span>
                                    <button class="treeview-item-delete" onclick="event.stopPropagation(); deleteCodexEntry(${entry.id})" title="Supprimer">×</button>
                                </div>
                                `;
        }).join('')}
                        </div>
                    </div>
                `;
    });

    container.innerHTML = html;
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

// [MVVM : Other]
// Charge une entrée et compose le HTML détaillé (Mixte ViewModel + View).
function openCodexDetail(id) {
    const entry = project.codex.find(c => c.id === id);
    if (!entry) return;

    // Handle split view mode
    if (splitViewActive) {
        const state = splitActivePanel === 'left' ? splitViewState.left : splitViewState.right;
        if (state.view === 'codex') {
            state.codexId = id;
            renderSplitPanelViewContent(splitActivePanel);
            saveSplitViewState();
            return;
        }
    }
    const editorView = document.getElementById('editorView');
    editorView.innerHTML = `
                <div class="detail-view">
                    <div class="detail-header">
                        <div style="display: flex; align-items: center; gap: 1rem; flex: 1;">
                            <input type="text" class="form-input" value="${entry.title}" 
                                   style="font-size: 1.8rem; font-weight: 600; font-family: 'Noto Serif JP', serif; padding: 0.5rem;"
                                   onchange="updateCodexField(${id}, 'title', this.value)"
                                   placeholder="Titre de l'entrée">
                            <span style="font-size: 0.8rem; padding: 0.4rem 0.8rem; background: var(--accent-gold); color: var(--bg-primary); border-radius: 2px;">${entry.category}</span>
                        </div>
                        <button class="btn" onclick="switchView('editor')">← Retour à l'éditeur</button>
                    </div>
                    
                    <div class="detail-section">
                        <div class="detail-section-title">Catégorie</div>
                        <select class="form-input" onchange="updateCodexField(${id}, 'category', this.value)">
                            <option value="Culture" ${entry.category === 'Culture' ? 'selected' : ''}>Culture</option>
                            <option value="Histoire" ${entry.category === 'Histoire' ? 'selected' : ''}>Histoire</option>
                            <option value="Technologie" ${entry.category === 'Technologie' ? 'selected' : ''}>Technologie</option>
                            <option value="Géographie" ${entry.category === 'Géographie' ? 'selected' : ''}>Géographie</option>
                            <option value="Politique" ${entry.category === 'Politique' ? 'selected' : ''}>Politique</option>
                            <option value="Magie/Pouvoir" ${entry.category === 'Magie/Pouvoir' ? 'selected' : ''}>Magie/Pouvoir</option>
                            <option value="Religion" ${entry.category === 'Religion' ? 'selected' : ''}>Religion</option>
                            <option value="Société" ${entry.category === 'Société' ? 'selected' : ''}>Société</option>
                            <option value="Autre" ${entry.category === 'Autre' ? 'selected' : ''}>Autre</option>
                        </select>
                    </div>

                    <div class="detail-section">
                        <div class="detail-section-title">Résumé</div>
                        <textarea class="form-input" rows="3" 
                                  onchange="updateCodexField(${id}, 'summary', this.value)">${entry.summary}</textarea>
                    </div>

                    <div class="detail-section">
                        <div class="detail-section-title">Contenu détaillé</div>
                        <textarea class="form-input" rows="20" 
                                  oninput="updateCodexField(${id}, 'content', this.value)">${entry.content}</textarea>
                    </div>
                </div>
            `;
}

// [MVVM : ViewModel]
// Met à jour le Model puis synchronise la View.
function updateCodexField(id, field, value) {
    const entry = project.codex.find(c => c.id === id);
    if (entry) {
        entry[field] = value;
        saveProject();
        renderCodexList();
    }
}

// [MVVM : Other]
// Agrège données du Model et construit la View (modal) (Mixte).
function showReferencesForCharacter(characterId) {
    const character = project.characters.find(c => c.id === characterId);
    if (!character) return;

    const scenes = findScenesWithCharacter(characterId);
    const relatedElements = character.linkedElements || [];

    document.getElementById('referencesModalTitle').textContent = `Références : ${character.name}`;
    document.getElementById('referencesModalContent').innerHTML = `
                <div class="references-section">
                    <div class="references-title"><i data-lucide="file-text" style="width:14px;height:14px;vertical-align:middle;margin-right:4px;"></i>Scènes où ${character.name} apparaît (${scenes.length})</div>
                    ${scenes.length > 0 ? scenes.map(scene => `
                        <div class="reference-item" onclick="openScene(${scene.actId}, ${scene.chapterId}, ${scene.sceneId}); closeModal('referencesModal');">
                            <div>
                                <div style="font-weight: 600;">${scene.sceneTitle}</div>
                                <div style="font-size: 0.8rem; color: var(--text-muted);">${scene.actTitle} > ${scene.chapterTitle}</div>
                            </div>
                            <span>→</span>
                        </div>
                    `).join('') : '<div style="padding: 1rem; color: var(--text-muted);">Aucune scène liée</div>'}
                </div>

                <div class="references-section">
                    <div class="references-title"><i data-lucide="link" style="width:14px;height:14px;vertical-align:middle;margin-right:4px;"></i>Gérer les liens</div>
                    <button class="btn btn-small" onclick="openLinkManagerForCharacter(${characterId})">+ Lier à des scènes</button>
                </div>
            `;

    document.getElementById('referencesModal').classList.add('active');
}

// [MVVM : Model]
// Lecture du Model (recherche pure de données).
function findScenesWithCharacter(characterId) {
    const scenes = [];
    project.acts.forEach(act => {
        act.chapters.forEach(chapter => {
            chapter.scenes.forEach(scene => {
                if (scene.linkedCharacters && scene.linkedCharacters.includes(characterId)) {
                    scenes.push({
                        actId: act.id,
                        actTitle: act.title,
                        chapterId: chapter.id,
                        chapterTitle: chapter.title,
                        sceneId: scene.id,
                        sceneTitle: scene.title
                    });
                }
            });
        });
    });
    return scenes;
}

// [MVVM : Model]
// Lecture du Model (recherche pure de données).
function findScenesWithElement(elementId) {
    const scenes = [];
    project.acts.forEach(act => {
        act.chapters.forEach(chapter => {
            chapter.scenes.forEach(scene => {
                if (scene.linkedElements && scene.linkedElements.includes(elementId)) {
                    scenes.push({
                        actId: act.id,
                        actTitle: act.title,
                        chapterId: chapter.id,
                        chapterTitle: chapter.title,
                        sceneId: scene.id,
                        sceneTitle: scene.title
                    });
                }
            });
        });
    });
    return scenes;
}

// [MVVM : Other]
// Agrège données via helpers et affiche modal (Mixte ViewModel + View).
function showReferencesForElement(elementId) {
    const element = project.world.find(e => e.id === elementId);
    if (!element) return;

    const scenes = findScenesWithElement(elementId);

    document.getElementById('referencesModalTitle').textContent = `Références : ${element.name}`;
    document.getElementById('referencesModalContent').innerHTML = `
                <div class="references-section">
                    <div class="references-title"><i data-lucide="file-text" style="width:14px;height:14px;vertical-align:middle;margin-right:4px;"></i>Scènes où ${element.name} apparaît (${scenes.length})</div>
                    ${scenes.length > 0 ? scenes.map(scene => `
                        <div class="reference-item" onclick="openScene(${scene.actId}, ${scene.chapterId}, ${scene.sceneId}); closeModal('referencesModal');">
                            <div>
                                <div style="font-weight: 600;">${scene.sceneTitle}</div>
                                <div style="font-size: 0.8rem; color: var(--text-muted);">${scene.actTitle} > ${scene.chapterTitle}</div>
                            </div>
                            <span>→</span>
                        </div>
                    `).join('') : '<div style="padding: 1rem; color: var(--text-muted);">Aucune scène liée</div>'}
                </div>

                <div class="references-section">
                    <div class="references-title"><i data-lucide="link" style="width:14px;height:14px;vertical-align:middle;margin-right:4px;"></i>Gérer les liens</div>
                    <button class="btn btn-small" onclick="openLinkManagerForElement(${elementId})">+ Lier à des scènes</button>
                </div>
            `;

    document.getElementById('referencesModal').classList.add('active');
}

// [MVVM : ViewModel]
// Met à jour le Model (liaison/déliaison) puis rafraîchit la View.
function toggleCharacterInScene(sceneActId, sceneChapterId, sceneId, characterId) {
    const act = project.acts.find(a => a.id === sceneActId);
    const chapter = act.chapters.find(c => c.id === sceneChapterId);
    const scene = chapter.scenes.find(s => s.id === sceneId);

    if (!scene.linkedCharacters) scene.linkedCharacters = [];

    const index = scene.linkedCharacters.indexOf(characterId);
    if (index > -1) {
        scene.linkedCharacters.splice(index, 1);
    } else {
        scene.linkedCharacters.push(characterId);
    }

    saveProject();

    // Rafraîchir le panneau de liens dans l'éditeur si la scène est ouverte
    if (currentSceneId === sceneId && currentActId === sceneActId && currentChapterId === sceneChapterId) {
        const linksPanel = document.getElementById('linksPanel');
        if (linksPanel) {
            // Trouver le premier div flex (celui des personnages)
            const flexDivs = linksPanel.querySelectorAll('[style*="flex: 1"]');
            if (flexDivs.length >= 1) {
                const charDiv = flexDivs[0];
                const quickLinks = charDiv.querySelector('.quick-links');
                if (quickLinks) {
                    quickLinks.innerHTML = `
                                ${renderSceneCharacters(sceneActId, sceneChapterId, scene)}
                                <button class="btn btn-small" onclick="openCharacterLinker(${sceneActId}, ${sceneChapterId}, ${sceneId})" style="font-size: 0.75rem; padding: 0.3rem 0.6rem;">+ Lier</button>
                            `;
                }
            }
        }
    }
}

/**
 * Ajoute ou retire un élément (Lieu/Objet) d'une scène.
 * NOTE : Cette fonction se trouve généralement dans 04.modals.js ou 07.stats.js
 */
// MVVM: ViewModel — Met à jour le Model (liaison/déliaison d'éléments) et déclenche rafraîchissement de la View
function toggleElementInScene(sceneActId, sceneChapterId, sceneId, elementId) {
    const act = project.acts.find(a => a.id === sceneActId);
    if (!act) return;
    const chapter = act.chapters.find(c => c.id === sceneChapterId);
    if (!chapter) return;
    const scene = chapter.scenes.find(s => s.id === sceneId);
    if (!scene) return;

    if (!scene.linkedElements) scene.linkedElements = [];

    const index = scene.linkedElements.indexOf(elementId);
    let hasChanged = false; // Drapeau pour s'assurer qu'un changement a eu lieu

    if (index > -1) {
        // L'élément est déjà lié, on le retire (Délier)
        scene.linkedElements.splice(index, 1);
        hasChanged = true;
    } else {
        // L'élément n'est pas lié, on l'ajoute (Lier)
        scene.linkedElements.push(elementId);
        hasChanged = true;
    }

    if (hasChanged) {
        // 1. Sauvegarder les changements
        saveProject();

        // 2. Si la scène est ouverte, on rafraîchit l'affichage complet du panneau des liens
        if (currentSceneId === sceneId && currentActId === sceneActId && currentChapterId === sceneChapterId) {

            // APPEL CLÉ : Rafraîchit l'ensemble des trois colonnes (persos, lieux, timeline)
            refreshLinksPanel();
        }
    }
}