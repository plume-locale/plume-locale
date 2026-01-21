// ============================================
// CORK BOARD FUNCTIONS
// ============================================

let corkBoardFilter = {
    type: 'all', // 'all', 'act', 'chapter'
    actId: null,
    chapterId: null
};

// [MVVM : View]
// Rend le menu latéral ou le panneau de configuration du Cork Board
function renderCorkBoard() {
    const container = document.getElementById('corkboardList');

    // Construire les options de chapitres
    let chaptersOptions = '';
    if (corkBoardFilter.actId) {
        const act = project.acts.find(a => a.id === parseInt(corkBoardFilter.actId));
        if (act) {
            chaptersOptions = act.chapters.map(ch =>
                `<option value="${ch.id}" ${corkBoardFilter.chapterId == ch.id ? 'selected' : ''}>${ch.title}</option>`
            ).join('');
        }
    }

    container.innerHTML = `
                <div style="padding: 1.5rem;">
                    <div style="margin-bottom: 1.5rem;">
                        <h3 style="margin-bottom: 0.5rem;"><i data-lucide="layout-grid" style="width:18px;height:18px;vertical-align:middle;margin-right:6px;"></i>Tableau Cork Board</h3>
                        <p style="font-size: 0.85rem; color: var(--text-muted);">
                            Organisez vos scènes visuellement
                        </p>
                    </div>
                    
                    <div style="margin-bottom: 1rem;">
                        <label style="font-size: 0.85rem; color: var(--text-muted); display: block; margin-bottom: 0.5rem;">
                            Filtrer par acte :
                        </label>
                        <select id="corkActFilter" class="form-input" onchange="updateCorkActFilter(this.value)">
                            <option value="all" ${corkBoardFilter.type === 'all' ? 'selected' : ''}>Tous les actes</option>
                            ${project.acts.map(act =>
        `<option value="${act.id}" ${corkBoardFilter.actId == act.id ? 'selected' : ''}>${act.title}</option>`
    ).join('')}
                        </select>
                    </div>
                    
                    ${corkBoardFilter.actId ? `
                        <div style="margin-bottom: 1rem;">
                            <label style="font-size: 0.85rem; color: var(--text-muted); display: block; margin-bottom: 0.5rem;">
                                Filtrer par chapitre :
                            </label>
                            <select id="corkChapterFilter" class="form-input" onchange="updateCorkChapterFilter(this.value)">
                                <option value="all">Tous les chapitres de cet acte</option>
                                ${chaptersOptions}
                            </select>
                        </div>
                    ` : ''}
                    
                    <button class="btn btn-primary" style="width: 100%;" onclick="openCorkBoardView()">
                        Ouvrir le tableau
                    </button>
                </div>
            `;
}

// [MVVM : ViewModel]
// Met à jour le filtre par acte et rafraîchit la vue
function updateCorkActFilter(actId) {
    if (actId === 'all') {
        corkBoardFilter = { type: 'all', actId: null, chapterId: null };
    } else {
        corkBoardFilter = { type: 'act', actId: parseInt(actId), chapterId: null };
    }
    renderCorkBoard();
}

// [MVVM : ViewModel]
// Met à jour le filtre par chapitre et rafraîchit la vue
function updateCorkChapterFilter(chapterId) {
    if (chapterId === 'all') {
        corkBoardFilter.type = 'act';
        corkBoardFilter.chapterId = null;
    } else {
        corkBoardFilter.type = 'chapter';
        corkBoardFilter.chapterId = parseInt(chapterId);
    }
    renderCorkBoard();
}

// [MVVM : ViewModel]
// Filtre et ouvre la vue plein écran du Cork Board
function filterAndRefreshCork(actId, chapterId) {
    if (actId === 'all') {
        corkBoardFilter = { type: 'all', actId: null, chapterId: null };
    } else if (chapterId === 'all' || !chapterId) {
        corkBoardFilter = { type: 'act', actId: parseInt(actId), chapterId: null };
    } else {
        corkBoardFilter = { type: 'chapter', actId: parseInt(actId), chapterId: parseInt(chapterId) };
    }
    openCorkBoardView();
}


// [MVVM : ViewModel]
// Ferme la vue Cork Board et retourne à la vue précédente
function closeCorkBoardView() {
    switchView('corkboard');
    renderCorkBoard();
}

// [MVVM : ViewModel]
// Ouvre la vue plein écran du Cork Board et initialise les composants
function openCorkBoardView() {
    // Ouvrir la vue Cork Board dans l'éditeur
    const editorView = document.getElementById('editorView');
    editorView.innerHTML = renderCorkBoardFullView();

    // Setup drag and drop
    setupCorkBoardDragAndDrop();
}

// [MVVM : View]
// Génère le HTML complet pour la vue du tableau d'affichage (Cork Board)
function renderCorkBoardFullView() {
    // Collecter toutes les scènes selon le filtre
    let scenes = [];

    if (corkBoardFilter.type === 'all') {
        project.acts.forEach(act => {
            act.chapters.forEach(chapter => {
                chapter.scenes.forEach(scene => {
                    scenes.push({
                        ...scene,
                        actId: act.id,
                        actTitle: act.title,
                        chapterId: chapter.id,
                        chapterTitle: chapter.title
                    });
                });
            });
        });
    } else if (corkBoardFilter.type === 'act') {
        const act = project.acts.find(a => a.id === corkBoardFilter.actId);
        if (act) {
            act.chapters.forEach(chapter => {
                chapter.scenes.forEach(scene => {
                    scenes.push({
                        ...scene,
                        actId: act.id,
                        actTitle: act.title,
                        chapterId: chapter.id,
                        chapterTitle: chapter.title
                    });
                });
            });
        }
    } else if (corkBoardFilter.type === 'chapter') {
        const act = project.acts.find(a => a.id === corkBoardFilter.actId);
        if (act) {
            const chapter = act.chapters.find(c => c.id === corkBoardFilter.chapterId);
            if (chapter) {
                chapter.scenes.forEach(scene => {
                    scenes.push({
                        ...scene,
                        actId: act.id,
                        actTitle: act.title,
                        chapterId: chapter.id,
                        chapterTitle: chapter.title
                    });
                });
            }
        }
    }

    // Vue organisée par actes et chapitres (style plume_locale)
    if (project.acts.length === 0 || (project.acts.length === 1 && project.acts[0].chapters.length === 0)) {
        return `
                    <div class="cork-board-container">
                        <div class="cork-board-header">
                            <div class="cork-board-title"><i data-lucide="layout-grid" style="width:16px;height:16px;vertical-align:middle;margin-right:6px;"></i>Cork Board</div>
                            <button class="btn btn-primary" onclick="closeCorkBoardView()">← Retour</button>
                        </div>
                        <div class="cork-board-empty">
                            <div class="cork-board-empty-icon"><i data-lucide="layout-grid" style="width:48px;height:48px;"></i></div>
                            <div style="font-size: 1.2rem; margin-bottom: 0.5rem;">Aucun chapitre</div>
                            <div style="margin-bottom: 1rem;">Créez votre premier chapitre pour commencer à structurer votre histoire</div>
                            <button class="btn btn-primary" onclick="openAddChapterModal()">+ Créer un chapitre</button>
                        </div>
                    </div>
                `;
    }

    // Compter le total de chapitres
    const totalChapters = project.acts.reduce((sum, act) => sum + act.chapters.length, 0);

    // Vue organisée par actes et chapitres
    let html = `
                <div class="cork-board-container" style="min-height: 100vh; padding: 2rem;">
                    <div class="cork-board-header" style="margin-bottom: 2rem;">
                        <div class="cork-board-title">
                            <i data-lucide="list" style="width:14px;height:14px;vertical-align:middle;margin-right:4px;"></i>Vue Structure Organisée
                        </div>
                        
                        <div style="display: flex; align-items: center; gap: 1rem; margin-left: auto; margin-right: 1rem;">
                            <label style="font-size: 0.8rem; color: var(--text-muted); display: flex; align-items: center; gap: 0.5rem;">
                                <i data-lucide="zoom-in" style="width:16px;height:16px;"></i>
                                <input type="range" 
                                       min="150" 
                                       max="800" 
                                       value="300" 
                                       step="10"
                                       style="width: 120px; cursor: pointer;"
                                       oninput="updateCorkGridSize(this.value)"
                                       title="Ajuster la largeur des colonnes">
                            </label>
                        </div>
                        <div style="display: flex; gap: 0.5rem;">
                            <button class="btn btn-primary" onclick="closeCorkBoardView()">← Retour</button>
                        </div>
                    </div>
                    
                    <div style="display: flex; flex-direction: column; gap: 2rem;">
            `;

    // Générer les actes
    project.acts.forEach((act, actIndex) => {
        const actScenes = scenes.filter(s => s.actId === act.id);
        // Ne pas masquer les actes vides - les afficher quand même

        html += `
                    <div class="structured-act-container">
                        <div class="structured-act-header">
                            <button class="structured-collapse-btn" onclick="toggleStructuredAct(${act.id})">
                                <span class="collapse-icon" id="collapse-icon-${act.id}">▼</span>
                            </button>
                            <span class="structured-act-title">${act.title}</span>
                            <button class="btn btn-primary" onclick="createChapterFromCork(${act.id})">+ Nouveau Chapitre</button>
                            <span class="structured-count">${act.chapters.length} chapitre${act.chapters.length > 1 ? 's' : ''}</span>
                        </div>
                        
                        <div class="structured-chapters-grid" id="act-content-${act.id}">
                `;

        // Générer les chapitres de l'acte
        act.chapters.forEach((chapter, chapIndex) => {
            const chapterScenes = actScenes.filter(s => s.chapterId === chapter.id);

            html += `
                        <div class="structured-chapter-container">
                            <div class="structured-chapter-header">
                                <div style="display: flex; align-items: center; gap: 0.5rem;">
                                    <span class="structured-chapter-icon">::</span>
                                    <span class="structured-chapter-title">${chapter.title}</span>
                                </div>
                            </div>
                            
                            <div class="structured-scenes-list">
                    `;

            // Générer les scènes du chapitre
            chapterScenes.forEach((scene, sceneIndex) => {
                const synopsis = scene.synopsis || '';
                const wordCount = scene.content ? scene.content.split(/\s+/).filter(w => w.length > 0).length : 0;
                const color = scene.corkColor || 'default';

                html += `
                            <div class="structured-scene-card structured-color-${color}" 
                                 data-scene-id="${scene.id}"
                                 data-act-id="${scene.actId}"
                                 data-chapter-id="${scene.chapterId}"
                                 draggable="true"
                                 onclick="openSceneFromCork(${scene.actId}, ${scene.chapterId}, ${scene.id})">
                                <div class="structured-scene-header">
                                    <span class="structured-scene-icon">::</span>
                                    <span class="structured-scene-title">${scene.title}</span>
                                </div>
                                
                                <div class="structured-scene-synopsis" 
                                     contenteditable="true"
                                     onclick="event.stopPropagation()"
                                     onblur="updateSceneSynopsis(${scene.actId}, ${scene.chapterId}, ${scene.id}, this.innerText)"
                                     data-placeholder="Ajouter un résumé...">${synopsis}</div>
                                
                                <div class="structured-scene-meta" style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.5rem;">
                                    ${wordCount} mots
                                </div>
                            </div>
                        `;
            });

            // Bouton + Nouvelle Scène
            html += `
                                <button class="structured-add-scene-btn" onclick="openAddSceneModalFromCork(${act.id}, ${chapter.id})">
                                    <span style="font-size: 1.2rem;">+</span> Nouvelle Scène
                                </button>
                            </div>
                        </div>
                    `;
        });

        // Si l'acte n'a pas de chapitres, afficher un message
        if (act.chapters.length === 0) {
            html += `
                        <div style="padding: 2rem; text-align: center; color: var(--bg-primary); opacity: 0.7; font-style: italic;">
                            Cet acte est vide. Cliquez sur "+ Nouveau Chapitre" pour commencer.
                        </div>
                    `;
        }

        html += `
                        </div>
                    </div>
                `;
    });

    html += `
                    </div>
                    
                    <div class="structured-bottom-actions">
                        <button class="btn btn-primary" onclick="createActFromCork()">+ Ajouter un Acte</button>
                    </div>
                </div>
            `;

    return html;
}

// [MVVM : View]
// Rend le HTML d'une carte individuelle (scène) pour le Cork Board
function renderCorkCard(scene, index) {
    const wordCount = scene.content ? getWordCount(scene.content) : 0;
    const synopsis = scene.synopsis || 'Pas de synopsis';
    const color = scene.corkColor || 'default';

    return `
                <div class="cork-card cork-color-${color}" 
                     data-scene-id="${scene.id}"
                     data-act-id="${scene.actId}"
                     data-chapter-id="${scene.chapterId}"
                     draggable="true">
                    <div class="cork-card-header">
                        <div class="cork-card-number">#${index + 1}</div>
                        <div style="position: relative;">
                            <div class="cork-card-color-tag cork-color-${color}" 
                                 onclick="toggleColorPalette(${scene.id})"></div>
                            <div class="cork-color-palette" id="palette-${scene.id}">
                                <div class="cork-color-option cork-color-yellow" onclick="setCorkColor(${scene.actId}, ${scene.chapterId}, ${scene.id}, 'yellow')"></div>
                                <div class="cork-color-option cork-color-pink" onclick="setCorkColor(${scene.actId}, ${scene.chapterId}, ${scene.id}, 'pink')"></div>
                                <div class="cork-color-option cork-color-blue" onclick="setCorkColor(${scene.actId}, ${scene.chapterId}, ${scene.id}, 'blue')"></div>
                                <div class="cork-color-option cork-color-green" onclick="setCorkColor(${scene.actId}, ${scene.chapterId}, ${scene.id}, 'green')"></div>
                                <div class="cork-color-option cork-color-purple" onclick="setCorkColor(${scene.actId}, ${scene.chapterId}, ${scene.id}, 'purple')"></div>
                                <div class="cork-color-option cork-color-orange" onclick="setCorkColor(${scene.actId}, ${scene.chapterId}, ${scene.id}, 'orange')"></div>
                                <div class="cork-color-option cork-color-red" onclick="setCorkColor(${scene.actId}, ${scene.chapterId}, ${scene.id}, 'red')"></div>
                                <div class="cork-color-option cork-color-teal" onclick="setCorkColor(${scene.actId}, ${scene.chapterId}, ${scene.id}, 'teal')"></div>
                                <div class="cork-color-option cork-color-default" onclick="setCorkColor(${scene.actId}, ${scene.chapterId}, ${scene.id}, 'default')">
                                    <span style="font-size: 1.2rem;">×</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="cork-card-title">${scene.title}</div>
                    
                    <div class="cork-card-synopsis" 
                         contenteditable="true" 
                         onblur="updateSceneSynopsis(${scene.actId}, ${scene.chapterId}, ${scene.id}, this.innerText)"
                         data-placeholder="Cliquez pour ajouter un synopsis...">${synopsis}</div>
                    
                    <div class="cork-card-meta">
                        <span>📍 ${scene.chapterTitle}</span>
                        <span>${wordCount} mots</span>
                    </div>
                    
                    <div class="cork-card-actions">
                        <button class="btn btn-small" onclick="openSceneFromCork(${scene.actId}, ${scene.chapterId}, ${scene.id})">
                            ✏️ Éditer
                        </button>
                    </div>
                </div>
            `;
}

// [MVVM : View]
// Affiche ou masque la palette de couleurs pour une scène
function toggleColorPalette(sceneId) {
    // Fermer toutes les autres palettes
    document.querySelectorAll('.cork-color-palette').forEach(p => {
        if (p.id !== `palette-${sceneId}`) {
            p.classList.remove('visible');
        }
    });

    const palette = document.getElementById(`palette-${sceneId}`);
    if (palette) {
        palette.classList.toggle('visible');
    }
}

// [MVVM : ViewModel]
// Définit la couleur d'une scène dans le modèle et met à jour la vue
function setCorkColor(actId, chapterId, sceneId, color) {
    const act = project.acts.find(a => a.id === actId);
    if (!act) return;

    const chapter = act.chapters.find(c => c.id === chapterId);
    if (!chapter) return;

    const scene = chapter.scenes.find(s => s.id === sceneId);
    if (!scene) return;

    scene.corkColor = color;
    saveProject();

    // Fermer la palette et re-render
    toggleColorPalette(sceneId);
    openCorkBoardView();
}

// [MVVM : ViewModel]
// Met à jour le synopsis d'une scène dans le modèle
function updateSceneSynopsis(actId, chapterId, sceneId, synopsis) {
    const act = project.acts.find(a => a.id === actId);
    if (!act) return;

    const chapter = act.chapters.find(c => c.id === chapterId);
    if (!chapter) return;

    const scene = chapter.scenes.find(s => s.id === sceneId);
    if (!scene) return;

    scene.synopsis = synopsis;
    saveProject();
}

// [MVVM : ViewModel]
// Ouvre une scène spécifique dans l'éditeur depuis le Cork Board
function openSceneFromCork(actId, chapterId, sceneId) {
    switchView('editor');
    openScene(actId, chapterId, sceneId);
}

// [MVVM : View]
// Alterne l'affichage d'un acte dans la vue structurée
function toggleStructuredAct(actId) {
    const content = document.getElementById(`act-content-${actId}`);
    const icon = document.getElementById(`collapse-icon-${actId}`);

    if (content.style.display === 'none') {
        content.style.display = 'grid';
        icon.textContent = '▼';
    } else {
        content.style.display = 'none';
        icon.textContent = '▶';
    }
}

// [MVVM : ViewModel]
// Crée un nouveau chapitre au sein d'un acte depuis le Cork Board
function createChapterFromCork(actId) {
    // Sélectionner l'acte
    activeActId = actId;
    currentActId = actId;

    // Trouver l'acte
    const act = project.acts.find(a => a.id === actId);
    if (!act) return;

    // Demander le nom du chapitre
    const chapterTitle = prompt('Nom du nouveau chapitre:', `Chapitre ${act.chapters.length + 1}`);
    if (!chapterTitle || chapterTitle.trim() === '') return;

    // Créer le chapitre
    const newChapter = {
        id: Date.now(),
        title: chapterTitle.trim(),
        scenes: []
    };

    // Ajouter le chapitre à l'acte
    act.chapters.push(newChapter);

    // Sauvegarder
    saveProject();

    // Rafraîchir la sidebar (treeview)
    if (typeof renderActsList === 'function') renderActsList();

    // Rafraîchir la vue Cork Board
    openCorkBoardView();

    // Notification
    showNotification(`✓ Chapitre "${chapterTitle}" créé`);
}

// [MVVM : ViewModel]
// Ouvre la modal pour ajouter une nouvelle scène depuis le Cork Board
function openAddSceneModalFromCork(actId, chapterId) {
    // Trouver l'acte et le chapitre
    const act = project.acts.find(a => a.id === actId);
    if (!act) return;

    const chapter = act.chapters.find(c => c.id === chapterId);
    if (!chapter) return;

    // Demander le nom de la scène
    const sceneTitle = prompt('Nom de la nouvelle scène:', `Scène ${chapter.scenes.length + 1}`);
    if (!sceneTitle || sceneTitle.trim() === '') return;

    // Créer la scène
    const newScene = {
        id: Date.now(),
        title: sceneTitle.trim(),
        content: '',
        synopsis: '',
        characters: [],
        locations: [],
        notes: ''
    };

    // Ajouter la scène au chapitre
    chapter.scenes.push(newScene);

    // Sauvegarder
    saveProject();

    // Rafraîchir la sidebar (treeview)
    if (typeof renderActsList === 'function') renderActsList();

    // Rafraîchir la vue Cork Board
    openCorkBoardView();

    // Notification
    showNotification(`✓ Scène "${sceneTitle}" créée`);
}

// [MVVM : ViewModel]
// Crée un nouvel acte au sein du projet depuis le Cork Board
function createActFromCork() {
    // Demander le nom de l'acte
    const actTitle = prompt('Nom du nouvel acte:', `Acte ${project.acts.length + 1}`);
    if (!actTitle || actTitle.trim() === '') return;

    // Créer l'acte
    const newAct = {
        id: Date.now(),
        title: actTitle.trim(),
        chapters: []
    };

    // Ajouter l'acte au projet
    project.acts.push(newAct);

    // Sauvegarder
    saveProject();

    // Rafraîchir la sidebar (treeview)
    if (typeof renderActsList === 'function') renderActsList();

    // Rafraîchir la vue Cork Board
    openCorkBoardView();

    // Notification
    showNotification(`✓ Acte "${actTitle}" créé`);
}

// [MVVM : Other]
// Affiche le menu contextuel pour une scène
function toggleSceneMenu(sceneId) {
    // À implémenter : menu contextuel pour la scène
    console.log('Toggle menu for scene:', sceneId);
}

// [MVVM : Other]
// Ouvre la modal de création depuis un plan (outline)
function openCreateFromOutlineModal() {
    alert('Fonctionnalité "Create from Outline" à venir');
}

// [MVVM : Other]
// Affiche les options d'importation
function showImportOptions() {
    alert('Fonctionnalité "Import" à venir');
}

// [MVVM : Other]
// Affiche les actions disponibles
function showActions() {
    alert('Fonctionnalité "Actions" à venir');
}

// [MVVM : View]
// Initialise les fonctions de glisser-déposer pour le Cork Board
function setupCorkBoardDragAndDrop() {
    const cards = document.querySelectorAll('.cork-card, .structured-scene-card');

    cards.forEach(card => {
        card.addEventListener('dragstart', handleCorkDragStart);
        card.addEventListener('dragend', handleCorkDragEnd);
        card.addEventListener('dragover', handleCorkDragOver);
        card.addEventListener('drop', handleCorkDrop);
    });
}

let draggedCorkCard = null;

// [MVVM : ViewModel]
// Gère le début de l'action de glisser pour une carte
function handleCorkDragStart(e) {
    draggedCorkCard = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
}

// [MVVM : ViewModel]
// Gère la fin de l'action de glisser pour une carte
function handleCorkDragEnd(e) {
    this.classList.remove('dragging');
    draggedCorkCard = null;
}

// [MVVM : ViewModel]
// Gère le survol d'une cible potentielle lors du glisser-déposer
function handleCorkDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
}


// [MVVM : View]
// Affiche une notification temporaire à l'écran
function showNotification(message) {
    const notif = document.createElement('div');
    notif.style.cssText = `
                position: fixed;
                top: 2rem;
                right: 2rem;
                background: var(--accent-gold);
                color: white;
                padding: 1rem 2rem;
                border-radius: 4px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                z-index: 10000;
                font-weight: 600;
                animation: slideIn 0.3s ease;
            `;
    notif.textContent = message;
    document.body.appendChild(notif);

    setTimeout(() => {
        notif.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notif.remove(), 300);
    }, 2000);
}

// [MVVM : ViewModel]
// Gère le dépôt d'une carte et met à jour l'ordre des scènes
function handleCorkDrop(e) {
    e.preventDefault();

    if (!draggedCorkCard || draggedCorkCard === this) return;

    // Récupérer les IDs
    const draggedSceneId = parseInt(draggedCorkCard.dataset.sceneId);
    const draggedActId = parseInt(draggedCorkCard.dataset.actId);
    const draggedChapterId = parseInt(draggedCorkCard.dataset.chapterId);

    const targetSceneId = parseInt(this.dataset.sceneId);
    const targetActId = parseInt(this.dataset.actId);
    const targetChapterId = parseInt(this.dataset.chapterId);

    // Vérifier qu'on est dans le même chapitre
    if (draggedChapterId !== targetChapterId) {
        alert('Vous ne pouvez déplacer des scènes que dans le même chapitre.\n\nPour déplacer entre chapitres, utilisez la vue Structure (sidebar).');
        return;
    }

    // Trouver les objets
    const act = project.acts.find(a => a.id === draggedActId);
    if (!act) return;

    const chapter = act.chapters.find(c => c.id === draggedChapterId);
    if (!chapter) return;

    const draggedSceneIndex = chapter.scenes.findIndex(s => s.id === draggedSceneId);
    const targetSceneIndex = chapter.scenes.findIndex(s => s.id === targetSceneId);

    if (draggedSceneIndex === -1 || targetSceneIndex === -1) return;

    // Réorganiser dans le tableau
    const [draggedScene] = chapter.scenes.splice(draggedSceneIndex, 1);
    chapter.scenes.splice(targetSceneIndex, 0, draggedScene);

    // Sauvegarder
    saveProject();
    renderActsList();

    // Rafraîchir le Cork Board
    openCorkBoardView();

    // Notification
    showNotification('✓ Scènes réorganisées');
}

// Fonction pour redimensionner les colonnes dynamiquement
// [MVVM : View]
// Met à jour dynamiquement la taille de la grille du Cork Board
function updateCorkGridSize(value) {
    // On applique la variable à la racine du document pour qu'elle soit accessible partout
    document.documentElement.style.setProperty('--chapter-card-width', value + 'px');

    // Optionnel : Mettre à jour un label si vous en ajoutez un pour afficher la taille
    const label = document.getElementById('gridSizeLabel');
    if (label) label.textContent = value + 'px';
}
// ============================================
// FIN CORK BOARD
// ============================================