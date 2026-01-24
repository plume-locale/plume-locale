// ============================================
// ============================================
// ARCS NARRATIFS - INLINE EDITING VERSION
// ============================================

// Arc types avec leurs propriétés
const ARC_TYPES = {
    character: { icon: 'user', label: 'Personnage', color: '#3498db' },
    plot: { icon: 'book-open', label: 'Intrigue', color: '#e74c3c' },
    theme: { icon: 'message-circle', label: 'Thème', color: '#9b59b6' },
    subplot: { icon: 'file-text', label: 'Intrigue secondaire', color: '#16a085' },
    relationship: { icon: 'heart', label: 'Relation', color: '#e91e63' },
    mystery: { icon: 'search', label: 'Mystère', color: '#607d8b' },
    conflict: { icon: 'swords', label: 'Conflit', color: '#ff5722' },
    growth: { icon: 'sprout', label: 'Croissance', color: '#4caf50' },
    redemption: { icon: 'sparkles', label: 'Rédemption', color: '#ffd700' },
    vengeance: { icon: 'flame', label: 'Vengeance', color: '#d32f2f' },
    quest: { icon: 'map', label: 'Quête', color: '#ff9800' },
    discovery: { icon: 'telescope', label: 'Découverte', color: '#00bcd4' },
    transformation: { icon: 'butterfly', label: 'Transformation', color: '#ab47bc' },
    political: { icon: 'crown', label: 'Politique', color: '#795548' },
    philosophical: { icon: 'brain', label: 'Philosophique', color: '#546e7a' },
    comedic: { icon: 'smile', label: 'Comédie', color: '#ffeb3b' },
    tragic: { icon: 'frown', label: 'Tragédie', color: '#424242' },
    action: { icon: 'zap', label: 'Action', color: '#ff6f00' },
    universe: { icon: 'globe', label: 'Univers', color: '#1976d2' },
    linked_characters: { icon: 'users', label: 'Personnages liés', color: '#8e24aa' }
};

// Helper function to render arc type icon
// [MVVM : View]
// Génère le code HTML pour l'icône d'un type d'arc.
function renderArcTypeIcon(iconName, color = null) {
    const colorStyle = color ? `style="color: ${color}"` : '';
    return `<i data-lucide="${iconName}" class="arc-lucide-icon" ${colorStyle}></i>`;
}

// Initialize narrative arcs if not exists
// [MVVM : Model]
// Initialise la structure de données des arcs narratifs dans le projet si elle n'existe pas.
function initNarrativeArcs() {
    if (!project.narrativeArcs) {
        project.narrativeArcs = [];
    }
}

// ============================================
// SIDEBAR FUNCTIONS
// ============================================

// [MVVM : View]
// Rend le HTML de la liste des arcs narratifs dans la barre latérale.
function renderArcsList() {
    const list = document.getElementById('arcsList');
    if (!list) return;

    initNarrativeArcs();
    const arcs = project.narrativeArcs || [];

    if (arcs.length === 0) {
        list.innerHTML = `
                    <div class="sidebar-empty">
                        <div class="sidebar-empty-icon"><i data-lucide="drama"></i></div>
                        <p>Aucun arc narratif</p>
                    </div>
                `;
        if (typeof lucide !== 'undefined') lucide.createIcons();
        return;
    }

    // Group by importance
    const majorArcs = arcs.filter(a => a.importance === 'major');
    const minorArcs = arcs.filter(a => a.importance === 'minor');

    let html = '';

    if (majorArcs.length > 0) {
        html += '<div class="sidebar-group-title">Arcs Majeurs</div>';
        html += majorArcs.map(arc => {
            const typeData = ARC_TYPES[arc.type] || ARC_TYPES.plot;
            const sceneCount = arc.scenePresence ? arc.scenePresence.length : 0;
            return `
                        <div class="sidebar-item" onclick="openArcDetail('${arc.id}')" data-arc-id="${arc.id}">
                            <div class="sidebar-item-header">
                                <span class="sidebar-item-icon" style="color: ${arc.color}"><i data-lucide="${typeData.icon}"></i></span>
                                <span class="sidebar-item-title">${arc.title}</span>
                            </div>
                            <div class="sidebar-item-meta">
                                <span>${sceneCount} scène${sceneCount > 1 ? 's' : ''}</span>
                            </div>
                        </div>
                    `;
        }).join('');
    }

    if (minorArcs.length > 0) {
        html += '<div class="sidebar-group-title">Arcs Mineurs</div>';
        html += minorArcs.map(arc => {
            const typeData = ARC_TYPES[arc.type] || ARC_TYPES.plot;
            const sceneCount = arc.scenePresence ? arc.scenePresence.length : 0;
            return `
                        <div class="sidebar-item" onclick="openArcDetail('${arc.id}')" data-arc-id="${arc.id}">
                            <div class="sidebar-item-header">
                                <span class="sidebar-item-icon" style="color: ${arc.color}"><i data-lucide="${typeData.icon}"></i></span>
                                <span class="sidebar-item-title">${arc.title}</span>
                            </div>
                            <div class="sidebar-item-meta">
                                <span>${sceneCount} scène${sceneCount > 1 ? 's' : ''}</span>
                            </div>
                        </div>
                    `;
        }).join('');
    }

    list.innerHTML = html;

    // Initialize Lucide icons for the new content
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// [MVVM : View]
// Rend le HTML de l'état initial ou vide de la vue des arcs.
function renderArcsWelcome() {
    const view = document.getElementById('editorView');
    if (!view) return;

    initNarrativeArcs();
    const arcs = project.narrativeArcs || [];

    if (arcs.length === 0) {
        view.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon"><i data-lucide="drama"></i></div>
                        <div class="empty-state-title">Gérez vos arcs narratifs</div>
                        <div class="empty-state-text">
                            Les arcs narratifs vous permettent de suivre l'évolution de vos personnages,<br>
                            intrigues et thèmes à travers votre roman.
                        </div>
                        <button class="btn btn-primary" onclick="createNewArc()">
                            <i data-lucide="sparkles"></i> Créer votre premier arc
                        </button>
                    </div>
                `;
        if (typeof lucide !== 'undefined') lucide.createIcons();
        return;
    }

    view.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon"><i data-lucide="drama"></i></div>
                    <div class="empty-state-title">Sélectionnez un arc</div>
                    <div class="empty-state-text">
                        Choisissez un arc dans la barre latérale pour voir ses détails<br>
                        et sa progression à travers votre roman.
                    </div>
                </div>
            `;
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

// ============================================
// ARC DETAIL VIEW
// ============================================

// [MVVM : ViewModel]
// Gère l'ouverture des détails d'un arc en basculant vers l'éditeur.
function openArcDetail(arcId) {
    // Passer directement en mode édition quand on clique sur un arc
    const arc = project.narrativeArcs.find(a => a.id === arcId);
    if (!arc) return;
    renderArcEditor(arc, false);
}

// ============================================
// INLINE EDITOR
// ============================================

// [MVVM : ViewModel]
// Initialise un nouvel objet arc et affiche l'éditeur pour sa création.
function createNewArc() {
    const newArc = {
        id: 'arc_' + Date.now(),
        title: '',
        type: 'character',
        color: ARC_TYPES.character.color,
        description: '',
        relatedCharacters: [],
        importance: 'major',
        resolution: { type: 'ongoing', sceneId: null },
        scenePresence: [],
        created: new Date().toISOString().split('T')[0],
        updated: new Date().toISOString().split('T')[0]
    };

    renderArcEditor(newArc, true);
}

// [MVVM : View]
// Génère et affiche le formulaire d'édition (création ou modification) d'un arc.
function renderArcEditor(arc, isNew = false) {
    const view = document.getElementById('editorView');
    if (!view) return;

    const typeData = ARC_TYPES[arc.type] || ARC_TYPES.character;

    // Get character options
    const characterOptions = project.characters && project.characters.length > 0
        ? project.characters.map(char => {
            const selected = arc.relatedCharacters.includes(char.id) ? 'selected' : '';
            return `<option value="${char.id}" ${selected}>${char.name}</option>`;
        }).join('')
        : '<option disabled>Aucun personnage créé</option>';

    const arcTypesHTML = Object.entries(ARC_TYPES).map(([key, data]) => {
        const selected = arc.type === key ? 'selected' : '';
        return `
                    <div class="arc-type-card ${selected}" data-type="${key}" onclick="selectArcTypeInEditor('${key}')">
                        <span class="arc-type-icon"><i data-lucide="${data.icon}"></i></span>
                        <span class="arc-type-label">${data.label}</span>
                    </div>
                `;
    }).join('');

    view.innerHTML = `
                <div class="arc-editor-view">
                    <div class="arc-editor-header">
                        <h2><i data-lucide="${isNew ? 'sparkles' : 'pencil'}"></i> ${isNew ? 'Créer un arc narratif' : 'Modifier l\'arc'}</h2>
                        <div class="arc-editor-actions-header">
                            <button class="btn-secondary" onclick="cancelArcEdit()">Annuler</button>
                            <button class="btn-primary" onclick="saveArcFromEditor(${isNew})">
                                <i data-lucide="${isNew ? 'sparkles' : 'save'}"></i> ${isNew ? 'Créer' : 'Enregistrer'}
                            </button>
                        </div>
                    </div>

                    <div class="arc-editor-form">
                        <div class="arc-editor-section">
                            <h3><i data-lucide="pin"></i> Informations de base</h3>

                            <div class="form-group">
                                <label>Titre de l'arc *</label>
                                <input type="text" id="arcTitleInput" class="form-input" 
                                    value="${arc.title}" placeholder="Ex: La vengeance de Kaito">
                            </div>

                            <div class="form-group">
                                <label>Description</label>
                                <textarea id="arcDescriptionInput" class="form-textarea" 
                                    placeholder="Décrivez l'arc narratif...">${arc.description}</textarea>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label>Couleur de l'arc</label>
                                    <div class="color-picker-group">
                                        <input type="color" id="arcColorPicker" value="${arc.color}" 
                                            onchange="document.getElementById('arcColorText').value = this.value">
                                        <input type="text" id="arcColorText" class="form-input-small" 
                                            value="${arc.color}" 
                                            onchange="document.getElementById('arcColorPicker').value = this.value">
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="arc-editor-section">
                            <h3><i data-lucide="drama"></i> Type d'arc narratif *</h3>
                            <div class="arc-types-grid">
                                ${arcTypesHTML}
                            </div>
                        </div>

                        <div class="arc-editor-section">
                            <h3><i data-lucide="users"></i> Personnages liés</h3>
                            <select id="arcCharactersSelect" class="form-select" multiple size="5">
                                ${characterOptions}
                            </select>
                            <p class="form-help">Maintenez Ctrl (ou Cmd) pour sélectionner plusieurs personnages</p>
                        </div>

                        <div class="arc-editor-section">
                            <h3><i data-lucide="scale"></i> Importance & Résolution</h3>

                            <div class="form-row">
                                <div class="form-group">
                                    <label>Importance</label>
                                    <select id="arcImportanceSelect" class="form-select">
                                        <option value="major" ${arc.importance === 'major' ? 'selected' : ''}>Majeur</option>
                                        <option value="minor" ${arc.importance === 'minor' ? 'selected' : ''}>Mineur</option>
                                    </select>
                                </div>

                                <div class="form-group">
                                    <label>Statut de résolution</label>
                                    <select id="arcResolutionSelect" class="form-select">
                                        <option value="ongoing" ${arc.resolution.type === 'ongoing' ? 'selected' : ''}>En cours</option>
                                        <option value="resolved" ${arc.resolution.type === 'resolved' ? 'selected' : ''}>Résolu</option>
                                        <option value="abandoned" ${arc.resolution.type === 'abandoned' ? 'selected' : ''}>Abandonné</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;

    // Store current arc in global var
    window.currentEditingArc = arc;
    window.currentEditingArcIsNew = isNew;

    // Initialize Lucide icons for the new content
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// [MVVM : Other]
// Group: Coordinator | Naming: ArcCoordinator
// Gère la sélection visuelle d'un type d'arc et met à jour les données temporaires de l'éditeur.
function selectArcTypeInEditor(type) {
    // Update UI
    document.querySelectorAll('.arc-type-card').forEach(card => {
        card.classList.remove('selected');
    });
    const selected = document.querySelector(`[data-type="${type}"]`);
    if (selected) selected.classList.add('selected');

    // Update color
    const typeData = ARC_TYPES[type];
    if (typeData) {
        document.getElementById('arcColorPicker').value = typeData.color;
        document.getElementById('arcColorText').value = typeData.color;
    }

    // Update global var
    window.currentEditingArc.type = type;
}

// [MVVM : Other]
// Group: Use Case | Naming: SaveArcUseCase
// Récupère les données du formulaire, les valide et les enregistre dans le modèle.
function saveArcFromEditor(isNew) {
    const arc = window.currentEditingArc;
    if (!arc) return;

    // Get values from form
    arc.title = document.getElementById('arcTitleInput').value.trim();
    arc.description = document.getElementById('arcDescriptionInput').value.trim();
    arc.color = document.getElementById('arcColorPicker').value;
    arc.importance = document.getElementById('arcImportanceSelect').value;
    arc.resolution.type = document.getElementById('arcResolutionSelect').value;

    // Get selected characters
    const select = document.getElementById('arcCharactersSelect');
    arc.relatedCharacters = Array.from(select.selectedOptions).map(opt => opt.value);

    // Validation
    if (!arc.title) {
        alert('Veuillez entrer un titre pour l\'arc');
        document.getElementById('arcTitleInput').focus();
        return;
    }

    // Save
    if (isNew) {
        project.narrativeArcs.push(arc);
    } else {
        const index = project.narrativeArcs.findIndex(a => a.id === arc.id);
        if (index !== -1) {
            project.narrativeArcs[index] = arc;
        }
    }

    arc.updated = new Date().toISOString().split('T')[0];
    saveProject();

    // Refresh sidebar and show detail
    renderArcsList();
    openArcDetail(arc.id);
}

// [MVVM : ViewModel]
// Prépare l'édition d'un arc existant en ouvrant l'éditeur.
function editArcInline(arcId) {
    const arc = project.narrativeArcs.find(a => a.id === arcId);
    if (!arc) return;
    renderArcEditor(arc, false);
}

// [MVVM : ViewModel]
// Annule l'édition en cours et revient à la vue d'accueil.
function cancelArcEdit() {
    const arcs = project.narrativeArcs || [];
    if (arcs.length > 0) {
        renderArcsWelcome();
        renderArcsList();
    } else {
        renderArcsWelcome();
    }
}

// ============================================
// DELETE ARC
// ============================================

// [MVVM : Other]
// Group: Use Case | Naming: DeleteArcUseCase
// Supprime un arc du modèle après confirmation et rafraîchit la vue.
function deleteNarrativeArc(arcId) {
    const arc = project.narrativeArcs.find(a => a.id === arcId);
    if (!arc) return;

    if (!confirm(`Voulez-vous vraiment supprimer l'arc "${arc.title}" ?\n\nCette action est irréversible.`)) {
        return;
    }

    project.narrativeArcs = project.narrativeArcs.filter(a => a.id !== arcId);
    saveProject();

    renderArcsList();
    renderArcsWelcome();
}

// ============================================
// SCENE PANEL (For editing arcs in a scene)
// ============================================

// [MVVM : View]
// Alterne la visibilité du panneau des arcs pour une scène.
function toggleArcScenePanel() {
    const panel = document.getElementById('arcScenePanel');
    const toolBtn = document.getElementById('toolArcsBtn');
    const sidebarBtn = document.getElementById('sidebarArcsBtn');
    if (!panel) return;

    panel.classList.toggle('hidden');
    if (!panel.classList.contains('hidden')) {
        renderArcScenePanel();
        if (toolBtn) toolBtn.classList.add('active');
        if (sidebarBtn) sidebarBtn.classList.add('active');
    } else {
        if (toolBtn) toolBtn.classList.remove('active');
        if (sidebarBtn) sidebarBtn.classList.remove('active');
    }
}

// [MVVM : View]
// Affiche le panneau de gestion des arcs narratifs pour la scène courante.
function renderArcScenePanel() {
    const content = document.getElementById('arcScenePanelContent');
    if (!content) return;

    // Vérifier qu'une scène est sélectionnée
    if (!currentSceneId || !currentChapterId || !currentActId) {
        content.innerHTML = `
            <div class="arc-panel-empty">
                <p>Sélectionnez une scène pour voir ses arcs</p>
            </div>
        `;
        return;
    }

    // Récupérer la scène courante
    const act = project.acts.find(a => a.id === currentActId);
    const chapter = act ? act.chapters.find(c => c.id === currentChapterId) : null;
    const scene = chapter ? chapter.scenes.find(s => s.id === currentSceneId) : null;

    if (!scene) {
        content.innerHTML = `
            <div class="arc-panel-empty">
                <p>Scène introuvable</p>
            </div>
        `;
        return;
    }

    initNarrativeArcs();
    const arcs = project.narrativeArcs || [];

    // Get arcs present in this scene
    const arcsInScene = arcs.filter(arc =>
        arc.scenePresence && arc.scenePresence.some(p => p.sceneId === scene.id)
    );

    if (arcsInScene.length === 0 && arcs.length === 0) {
        content.innerHTML = `
                    <div class="arc-panel-empty">
                        <div class="arc-panel-empty-icon"><i data-lucide="drama"></i></div>
                        <p>Aucun arc narratif créé</p>
                    </div>
                `;
        if (typeof lucide !== 'undefined') lucide.createIcons();
        return;
    }

    let html = `
                <div class="arc-scene-info">
                    <div class="arc-scene-info-title">Scène actuelle</div>
                    <div>${scene.title}</div>
                </div>
            `;

    // Show arcs in scene
    if (arcsInScene.length > 0) {
        arcsInScene.forEach(arc => {
            const presence = arc.scenePresence.find(p => p.sceneId === scene.id);
            if (!presence) return;

            const typeData = ARC_TYPES[arc.type] || ARC_TYPES.plot;

            html += `
                        <div class="arc-in-scene" data-arc-id="${arc.id}">
                            <div class="arc-in-scene-header">
                                <div class="arc-in-scene-title">
                                    <span style="color: ${arc.color}"><i data-lucide="${typeData.icon}"></i></span> ${arc.title}
                                </div>
                                <button class="arc-in-scene-remove" onclick="removeArcFromScene('${arc.id}')" title="Retirer">×</button>
                            </div>

                            <div class="arc-in-scene-control">
                                <label class="arc-in-scene-label">Intensité</label>
                                <input type="range" min="1" max="5" value="${presence.intensity}" 
                                    class="arc-intensity-slider" 
                                    oninput="updateArcIntensity('${arc.id}', this.value)">
                                <div class="arc-intensity-value">${presence.intensity}/5</div>
                            </div>

                            <div class="arc-in-scene-control">
                                <label class="arc-in-scene-label">Statut</label>
                                <select class="arc-status-select" onchange="updateArcStatus('${arc.id}', this.value)">
                                    <option value="setup" ${presence.status === 'setup' ? 'selected' : ''}>Introduction</option>
                                    <option value="development" ${presence.status === 'development' ? 'selected' : ''}>Développement</option>
                                    <option value="climax" ${presence.status === 'climax' ? 'selected' : ''}>Point culminant</option>
                                    <option value="resolution" ${presence.status === 'resolution' ? 'selected' : ''}>Résolution</option>
                                </select>
                            </div>

                            <div class="arc-in-scene-control">
                                <label class="arc-in-scene-label">Colonne du arc-board</label>
                                <select class="arc-column-select" onchange="updateArcColumn('${arc.id}', this.value)">
                                    <option value="">Arc général (aucune colonne)</option>
                                    ${(arc.board && arc.board.items ? arc.board.items.filter(item => item.type === 'column').map(column =>
                                        `<option value="${column.id}" ${presence.columnId === column.id ? 'selected' : ''}>${column.title || 'Colonne sans titre'}</option>`
                                    ).join('') : '')}
                                </select>
                            </div>

                            <div class="arc-in-scene-control">
                                <label class="arc-in-scene-label">Notes</label>
                                <textarea class="arc-notes-textarea"
                                    placeholder="Notes pour cette scène..."
                                    onblur="updateArcNotes('${arc.id}', this.value)">${presence.notes || ''}</textarea>
                            </div>
                        </div>
                    `;
        });
    }

    // Add arc button
    const availableArcs = arcs.filter(arc => !arcsInScene.includes(arc));
    if (availableArcs.length > 0) {
        html += `
                    <select id="arcToAddSelect" class="arc-panel-add-select">
                        <option value="">-- Ajouter un arc --</option>
                        ${availableArcs.map(arc => {
            const typeData = ARC_TYPES[arc.type] || ARC_TYPES.plot;
            return `<option value="${arc.id}">${typeData.label} - ${arc.title}</option>`;
        }).join('')}
                    </select>
                    <button class="arc-panel-add-btn" onclick="addArcToCurrentScene()">+ Ajouter l'arc</button>
                `;
    }

    content.innerHTML = html;

    // Initialize Lucide icons for the new content
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// [MVVM : Other]
// Group: Use Case | Naming: AddArcToSceneUseCase
// Ajoute un arc existant à la scène courante et met à jour le modèle.
function addArcToCurrentScene() {
    const select = document.getElementById('arcToAddSelect');
    if (!select) return;

    const arcId = select.value;
    if (!arcId) return;

    if (!currentSceneId || !currentChapterId || !currentActId) return;

    const arc = project.narrativeArcs.find(a => a.id === arcId);
    if (!arc) return;

    if (!arc.scenePresence) arc.scenePresence = [];

    arc.scenePresence.push({
        actId: currentActId,
        chapterId: currentChapterId,
        sceneId: currentSceneId,
        intensity: 3,
        notes: '',
        status: 'development'
    });

    saveProject();
    renderArcScenePanel();
}

// [MVVM : Other]
// Group: Use Case | Naming: RemoveArcFromSceneUseCase
// Retire un arc de la scène courante et met à jour le modèle.
function removeArcFromScene(arcId) {
    if (!currentSceneId) return;

    const arc = project.narrativeArcs.find(a => a.id === arcId);
    if (!arc) return;

    arc.scenePresence = arc.scenePresence.filter(p => p.sceneId !== currentSceneId);
    saveProject();
    renderArcScenePanel();
}

// [MVVM : Other]
// Group: Use Case | Naming: UpdateArcIntensityUseCase
// Met à jour l'intensité d'un arc dans une scène (Model) et rafraîchit l'affichage (View).
function updateArcIntensity(arcId, intensity) {
    if (!currentSceneId) return;

    const arc = project.narrativeArcs.find(a => a.id === arcId);
    if (!arc) return;

    const presence = arc.scenePresence.find(p => p.sceneId === currentSceneId);
    if (presence) {
        presence.intensity = parseInt(intensity);

        // Update display
        const arcDiv = document.querySelector(`[data-arc-id="${arcId}"]`);
        if (arcDiv) {
            const valueDiv = arcDiv.querySelector('.arc-intensity-value');
            if (valueDiv) valueDiv.textContent = `${intensity}/5`;
        }

        // Synchroniser avec la carte scene dans le arc-board si elle existe
        if (presence.columnId && arc.board && arc.board.items) {
            const column = arc.board.items.find(item => item.id === presence.columnId && item.type === 'column');
            if (column && column.cards) {
                const sceneCard = column.cards.find(card => card.type === 'scene' && card.sceneId === currentSceneId);
                if (sceneCard) {
                    sceneCard.intensity = parseInt(intensity);
                }
            }
        }

        saveProject();
    }
}

// [MVVM : ViewModel]
// Met à jour le statut d'avancement d'un arc pour la scène courante.
function updateArcStatus(arcId, status) {
    if (!currentSceneId) return;

    const arc = project.narrativeArcs.find(a => a.id === arcId);
    if (!arc) return;

    const presence = arc.scenePresence.find(p => p.sceneId === currentSceneId);
    if (presence) {
        presence.status = status;

        // Synchroniser avec la carte scene dans le arc-board si elle existe
        if (presence.columnId && arc.board && arc.board.items) {
            const column = arc.board.items.find(item => item.id === presence.columnId && item.type === 'column');
            if (column && column.cards) {
                const sceneCard = column.cards.find(card => card.type === 'scene' && card.sceneId === currentSceneId);
                if (sceneCard) {
                    sceneCard.status = status;
                }
            }
        }

        saveProject();
    }
}

// [MVVM : ViewModel]
// Enregistre les notes spécifiques à un arc pour la scène courante.
function updateArcNotes(arcId, notes) {
    if (!currentSceneId) return;

    const arc = project.narrativeArcs.find(a => a.id === arcId);
    if (!arc) return;

    const presence = arc.scenePresence.find(p => p.sceneId === currentSceneId);
    if (presence) {
        presence.notes = notes;

        // Synchroniser avec la carte scene dans le arc-board si elle existe
        if (presence.columnId && arc.board && arc.board.items) {
            const column = arc.board.items.find(item => item.id === presence.columnId && item.type === 'column');
            if (column && column.cards) {
                const sceneCard = column.cards.find(card => card.type === 'scene' && card.sceneId === currentSceneId);
                if (sceneCard) {
                    sceneCard.notes = notes;
                }
            }
        }

        saveProject();
    }
}

// [MVVM : ViewModel]
// Met à jour la colonne du arc-board liée à cette scène pour cet arc
function updateArcColumn(arcId, columnId) {
    if (!currentSceneId) return;

    const arc = project.narrativeArcs.find(a => a.id === arcId);
    if (!arc) return;

    const presence = arc.scenePresence.find(p => p.sceneId === currentSceneId);
    if (!presence) return;

    // Récupérer l'ancienne columnId
    const oldColumnId = presence.columnId;

    // Mettre à jour le columnId dans presence
    presence.columnId = columnId || null;

    // Initialiser arc.board si nécessaire
    if (!arc.board) {
        arc.board = { items: [], connections: [] };
    }

    // Récupérer les informations de la scène
    const act = project.acts.find(a => a.id === currentActId);
    const chapter = act ? act.chapters.find(c => c.id === currentChapterId) : null;
    const scene = chapter ? chapter.scenes.find(s => s.id === currentSceneId) : null;

    if (!scene) return;

    // Supprimer l'ancienne carte scene de l'ancienne colonne si elle existe
    if (oldColumnId) {
        const oldColumn = arc.board.items.find(item => item.id === oldColumnId && item.type === 'column');
        if (oldColumn && oldColumn.cards) {
            oldColumn.cards = oldColumn.cards.filter(card => !(card.type === 'scene' && card.sceneId === currentSceneId));
        }
    }

    // Si une nouvelle colonne est sélectionnée, créer/mettre à jour la carte scene
    if (columnId) {
        const column = arc.board.items.find(item => item.id === columnId && item.type === 'column');
        if (column) {
            if (!column.cards) column.cards = [];

            // Vérifier si une carte scene pour cette scène existe déjà dans cette colonne
            let sceneCard = column.cards.find(card => card.type === 'scene' && card.sceneId === currentSceneId);

            if (sceneCard) {
                // Mettre à jour la carte existante
                sceneCard.sceneTitle = scene.title;
                sceneCard.intensity = presence.intensity;
                sceneCard.status = presence.status;
                sceneCard.notes = presence.notes;
            } else {
                // Créer une nouvelle carte scene
                sceneCard = {
                    id: 'card_' + Date.now(),
                    type: 'scene',
                    sceneId: currentSceneId,
                    sceneTitle: scene.title,
                    intensity: presence.intensity,
                    status: presence.status,
                    notes: presence.notes
                };
                column.cards.push(sceneCard);
            }
        }
    }

    saveProject();
    renderArcScenePanel();
}

init();
themeManager.init();

// Initialize Lucide icons
if (typeof lucide !== 'undefined') {
    lucide.createIcons();
}

