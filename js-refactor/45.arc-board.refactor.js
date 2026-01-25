// ============================================
// ARC BOARD - Canvas System (Milanote-inspired)
// ============================================

// ============================================
// CONFIGURATION & TYPES
// ============================================

const ARC_BOARD_CONFIG = {
    minZoom: 0.25,
    maxZoom: 2,
    zoomStep: 0.1,
    gridSize: 24,
    defaultColumnWidth: 280,
    minColumnWidth: 200,
    maxColumnWidth: 500,
    canvasWidth: 3000,
    canvasHeight: 2000,
    snapToGrid: true
};

// Catégories d'arcs prédéfinies
const ARC_CATEGORIES = {
    intrigue: { label: 'Intrigue principale', icon: 'book-open', color: '#e74c3c' },
    subplot: { label: 'Intrigue secondaire', icon: 'file-text', color: '#16a085' },
    character: { label: 'Arc personnage', icon: 'user', color: '#3498db' },
    relationship: { label: 'Relation', icon: 'heart', color: '#e91e63' },
    theme: { label: 'Thème', icon: 'message-circle', color: '#9b59b6' },
    mystery: { label: 'Mystère', icon: 'search', color: '#607d8b' },
    worldbuilding: { label: 'Worldbuilding', icon: 'globe', color: '#1976d2' }
};

// Types de cartes
const CARD_TYPES = {
    note: { label: 'Note', icon: 'file-text' },
    image: { label: 'Image', icon: 'image' },
    link: { label: 'Lien', icon: 'link' },
    todo: { label: 'Tâches', icon: 'check-square' },
    comment: { label: 'Commentaire', icon: 'message-square' },
    table: { label: 'Tableau', icon: 'table' },
    audio: { label: 'Audio', icon: 'music' },
    divider: { label: 'Séparateur', icon: 'minus' },
    scene: { label: 'Scène liée', icon: 'book-open' }
};

// ============================================
// STATE MANAGEMENT
// ============================================

let arcBoardState = {
    currentArcId: null,
    zoom: 1,
    panX: 0,
    panY: 0,
    isPanning: false,
    panStartX: 0,
    panStartY: 0,
    selectedItems: [],
    connectionSource: null,  // Pour le mode connexion simplifié
    isDragging: false,
    dragItem: null,
    dragStartX: 0,
    dragStartY: 0,
    isResizing: false,
    resizeItem: null,
    clipboard: null,
    contextPanelOpen: false,
    activeTool: 'select',
    showingArcForm: false,
    showingCategoryForm: false,
    editingArcId: null,  // ID de l'arc en cours d'édition (null = création)
};

// ============================================
// INITIALIZATION
// ============================================

// [MVVM : Model]
// Initialise les structures de données de l'Arc Board si elles n'existent pas (catégories et arcs).
function initArcBoard() {
    // Initialiser les catégories custom si pas existantes
    if (!project.arcCategories) {
        project.arcCategories = {};
    }

    // Initialiser les arcs si pas existants
    if (!project.narrativeArcs) {
        project.narrativeArcs = [];
    }
}

// ============================================
// SIDEBAR TREEVIEW (Liste des arcs par catégorie)
// ============================================

// [MVVM : View]
// Affiche la barre latérale contenant la liste des arcs narratifs groupés par catégorie.
function renderArcsBoardSidebar() {
    const list = document.getElementById('arcsList');
    if (!list) return;

    initArcBoard();

    const arcs = project.narrativeArcs || [];

    let html = '';

    // Formulaire de création d'arc (si actif)
    if (arcBoardState.showingArcForm) {
        html += renderInlineArcForm();
    }

    // Formulaire de création de catégorie (si actif)
    if (arcBoardState.showingCategoryForm) {
        html += renderInlineCategoryForm();
    }

    if (arcs.length === 0 && !arcBoardState.showingArcForm && !arcBoardState.showingCategoryForm) {
        html += `
            <div class="sidebar-empty">
                <div class="sidebar-empty-icon"><i data-lucide="layout-dashboard"></i></div>
                <p>Aucun arc narratif</p>
            </div>
        `;
    } else if (arcs.length > 0) {
        // Fusionner catégories prédéfinies et custom
        const allCategories = { ...ARC_CATEGORIES, ...project.arcCategories };

        // Grouper les arcs par catégorie
        const arcsByCategory = {};
        const uncategorized = [];

        arcs.forEach(arc => {
            const cat = arc.category || 'uncategorized';
            if (cat === 'uncategorized' || !allCategories[cat]) {
                uncategorized.push(arc);
            } else {
                if (!arcsByCategory[cat]) arcsByCategory[cat] = [];
                arcsByCategory[cat].push(arc);
            }
        });

        // Rendre les arcs non catégorisés en premier
        if (uncategorized.length > 0) {
            const isExpanded = !project.collapsedArcCategories || !project.collapsedArcCategories.includes('uncategorized');
            html += `
                <div class="sidebar-tree-category" data-category="uncategorized">
                    <div class="sidebar-tree-header" onclick="toggleArcCategory('uncategorized')">
                        <span class="sidebar-tree-toggle">
                            <i data-lucide="${isExpanded ? 'chevron-down' : 'chevron-right'}"></i>
                        </span>
                        <span class="sidebar-tree-icon" style="color: var(--text-muted)">
                            <i data-lucide="folder"></i>
                        </span>
                        <span class="sidebar-tree-label">Non catégorisé</span>
                        <span class="sidebar-tree-count">${uncategorized.length}</span>
                    </div>
                    <div class="sidebar-tree-children ${isExpanded ? '' : 'collapsed'}">
                        ${uncategorized.map(arc => renderArcTreeItem(arc)).join('')}
                    </div>
                </div>
            `;
        }

        // Rendre chaque catégorie
        Object.entries(allCategories).forEach(([catKey, catData]) => {
            const categoryArcs = arcsByCategory[catKey] || [];
            if (categoryArcs.length === 0) return;

            const isExpanded = !project.collapsedArcCategories || !project.collapsedArcCategories.includes(catKey);

            html += `
                <div class="sidebar-tree-category" data-category="${catKey}">
                    <div class="sidebar-tree-header" onclick="toggleArcCategory('${catKey}')">
                        <span class="sidebar-tree-toggle">
                            <i data-lucide="${isExpanded ? 'chevron-down' : 'chevron-right'}"></i>
                        </span>
                        <span class="sidebar-tree-icon" style="color: ${catData.color}">
                            <i data-lucide="${catData.icon}"></i>
                        </span>
                        <span class="sidebar-tree-label">${catData.label}</span>
                        <span class="sidebar-tree-count">${categoryArcs.length}</span>
                    </div>
                    <div class="sidebar-tree-children ${isExpanded ? '' : 'collapsed'}">
                        ${categoryArcs.map(arc => renderArcTreeItem(arc)).join('')}
                    </div>
                </div>
            `;
        });
    }

    // Bouton pour créer une catégorie (si pas en mode formulaire)
    if (!arcBoardState.showingCategoryForm && !arcBoardState.showingArcForm) {
        html += `
            <div class="sidebar-tree-add" onclick="showInlineCategoryForm()">
                <i data-lucide="folder-plus"></i>
                <span>Nouvelle catégorie</span>
            </div>
        `;
    }

    list.innerHTML = html;
    if (typeof lucide !== 'undefined') lucide.createIcons();

    // Focus sur le premier input si formulaire affiché
    if (arcBoardState.showingArcForm) {
        const input = document.getElementById('inlineArcTitle');
        if (input) input.focus();
    } else if (arcBoardState.showingCategoryForm) {
        const input = document.getElementById('inlineCategoryName');
        if (input) input.focus();
    }
}
// ============================================
// FORMULAIRE INLINE - CRÉATION DE CATÉGORIE
// ============================================

// [MVVM : View]
// Génère le code HTML du formulaire de création de catégorie.
function renderInlineCategoryForm() {
    return `
        <div class="sidebar-inline-form">
            <div class="sidebar-inline-form-header">
                <i data-lucide="folder-plus"></i>
                <span>Nouvelle catégorie</span>
                <button class="sidebar-inline-form-close" onclick="cancelInlineCategoryForm()">
                    <i data-lucide="x"></i>
                </button>
            </div>
            <div class="sidebar-inline-form-body">
            <input type="hidden" id="inlineArcId" value="">
                <div class="sidebar-inline-form-group">
                    <label>Nom *</label>
                    <input type="text" id="inlineCategoryName" class="sidebar-inline-input" 
                           placeholder="Ex: Arcs de croissance"
                           onkeydown="handleInlineCategoryKeydown(event)">
                </div>
                <div class="sidebar-inline-form-group">
                    <label>Couleur</label>
                    <div class="sidebar-inline-color-row">
                        <input type="color" id="inlineCategoryColor" value="#6c757d" class="sidebar-inline-color">
                    </div>
                </div>
                <div class="sidebar-inline-form-actions">
                    <button class="btn-secondary btn-sm" onclick="cancelInlineCategoryForm()">Annuler</button>
                    <button class="btn-primary btn-sm" onclick="confirmInlineCategoryForm()">
                        <i data-lucide="plus"></i> Créer
                    </button>
                </div>
            </div>
        </div>
    `;
}

// [MVVM : Other]
// Group: Coordinator | Naming: ArcBoardCoordinator
// Définit l'état pour afficher le formulaire de création de catégorie et rafraîchit la sidebar.
function showInlineCategoryForm() {
    arcBoardState.showingCategoryForm = true;
    arcBoardState.showingArcForm = false;
    renderArcsBoardSidebar();
}

// Remplacer l'ancienne fonction
// [MVVM : Other]
// Raccourci vers showInlineCategoryForm pour compatibilité.
function showAddCategoryModal() {
    showInlineCategoryForm();
}

// [MVVM : ViewModel]
// Annule l'affichage du formulaire de création de catégorie.
function cancelInlineCategoryForm() {
    arcBoardState.showingCategoryForm = false;
    renderArcsBoardSidebar();
}

// [MVVM : ViewModel]
// Gère les touches Enter et Escape dans le formulaire de catégorie.
function handleInlineCategoryKeydown(event) {
    if (event.key === 'Enter') {
        confirmInlineCategoryForm();
    } else if (event.key === 'Escape') {
        cancelInlineCategoryForm();
    }
}

// [MVVM : Other]
// Group: Use Case | Naming: ConfirmCategoryUseCase
// Valide et crée une nouvelle catégorie dans les données du projet.
function confirmInlineCategoryForm() {
    const name = document.getElementById('inlineCategoryName').value.trim();
    const color = document.getElementById('inlineCategoryColor').value;

    if (!name) {
        document.getElementById('inlineCategoryName').classList.add('error');
        document.getElementById('inlineCategoryName').focus();
        return;
    }

    const key = name.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_');

    if (!project.arcCategories) project.arcCategories = {};

    project.arcCategories[key] = {
        label: name,
        icon: 'folder',
        color: color,
        custom: true
    };

    saveProject();
    arcBoardState.showingCategoryForm = false;
    renderArcsBoardSidebar();
}


// [MVVM : View]
// Génère le code HTML du formulaire de création/édition d'arc narratif.
function renderInlineArcForm() {
    const allCategories = { ...ARC_CATEGORIES, ...project.arcCategories };
    const categoryOptions = Object.entries(allCategories).map(([key, cat]) =>
        `<option value="${key}">${cat.label}</option>`
    ).join('');

    // Vérifier si on est en mode édition
    const editingArc = arcBoardState.editingArcId
        ? project.narrativeArcs.find(a => a.id === arcBoardState.editingArcId)
        : null;

    const isEditing = !!editingArc;
    const formTitle = isEditing ? `Modifier l'arc` : 'Nouvel arc narratif';
    const formIcon = isEditing ? 'settings' : 'sparkles';
    const buttonText = isEditing ? 'Enregistrer' : 'Créer';
    const buttonIcon = isEditing ? 'save' : 'plus';

    // Valeurs par défaut ou valeurs de l'arc existant
    const arcId = editingArc?.id || '';
    const arcTitle = editingArc?.title || '';
    const arcCategory = editingArc?.category || 'intrigue';
    const arcColor = editingArc?.color || '#e74c3c';

    return `
        <div class="sidebar-inline-form" id="arc-form-panel">
            <div class="sidebar-inline-form-header">
                <i data-lucide="${formIcon}"></i>
                <span>${formTitle}</span>
                <button class="sidebar-inline-form-close" onclick="cancelInlineArcForm()">
                    <i data-lucide="x"></i>
                </button>
            </div>
            <div class="sidebar-inline-form-body">
                <input type="hidden" id="inlineArcId" value="${arcId}"> 
                <div class="sidebar-inline-form-group">
                    <label>Titre *</label>
                    <input type="text" id="inlineArcTitle" class="sidebar-inline-input" 
                           placeholder="Ex: La quête de rédemption"
                           value="${arcTitle.replace(/"/g, '&quot;')}"
                           onkeydown="handleInlineArcKeydown(event)">
                </div>
                <div class="sidebar-inline-form-group">
                    <label>Catégorie</label>
                    <select id="inlineArcCategory" class="sidebar-inline-select" onchange="updateInlineArcColor()">
                        ${Object.entries(allCategories).map(([key, cat]) =>
        `<option value="${key}" ${key === arcCategory ? 'selected' : ''}>${cat.label}</option>`
    ).join('')}
                    </select>
                </div>
                <div class="sidebar-inline-form-group">
                    <label>Couleur</label>
                    <div class="sidebar-inline-color-row">
                        <input type="color" id="inlineArcColor" value="${arcColor}" class="sidebar-inline-color">
                        <span id="inlineArcColorHex" class="sidebar-inline-color-hex">${arcColor}</span>
                    </div>
                </div>
                <div class="sidebar-inline-form-actions">
                    <button class="btn-secondary btn-sm" onclick="cancelInlineArcForm()">Annuler</button>
                    <button class="btn-primary btn-sm" onclick="confirmInlineArcForm()">
                        <i data-lucide="${buttonIcon}"></i> ${buttonText}
                    </button>
                </div>
            </div>
        </div>
    `;
}


// [MVVM : View]
// Génère le code HTML pour un arc individuel dans l'arborescence de la barre latérale.
function renderArcTreeItem(arc) {
    const isActive = arcBoardState.currentArcId === arc.id;
    const allCategories = { ...ARC_CATEGORIES, ...project.arcCategories };
    const catData = allCategories[arc.category] || { color: '#999' };

    return `
        <div class="sidebar-tree-item ${isActive ? 'active' : ''}" 
             onclick="openArcBoard('${arc.id}')" 
             data-arc-id="${arc.id}">
            <span class="sidebar-tree-item-dot" style="background: ${arc.color || catData.color}"></span>
            <span class="sidebar-tree-item-title">${arc.title || 'Sans titre'}</span>
            <button class="sidebar-tree-item-menu" onclick="event.stopPropagation(); showArcContextMenu(event, '${arc.id}')">
                <i data-lucide="more-horizontal"></i>
            </button>
        </div>
    `;
}
// [MVVM : Other]
// Group: Coordinator | Naming: ArcBoardCoordinator
// Prépare l'état pour afficher le formulaire de création ou modification d'un arc.
function showInlineArcForm(arcId = null) {
    // Nettoyer l'ID des guillemets doubles et simples (Mesure de sécurité)
    if (typeof arcId === 'string') {
        arcId = arcId.replace(/['\"]/g, '').trim();
        if (arcId === '') arcId = null;
    }

    // Stocker l'ID de l'arc à éditer (null = mode création)
    arcBoardState.editingArcId = arcId;
    arcBoardState.showingArcForm = true;
    arcBoardState.showingCategoryForm = false;

    // Rendre la sidebar (le formulaire sera pré-rempli automatiquement)
    renderArcsBoardSidebar();

    // Focus sur le champ titre
    const input = document.getElementById('inlineArcTitle');
    if (input) input.focus();
}

// [MVVM : ViewModel]
// Annule l'affichage du formulaire d'arc.
function cancelInlineArcForm() {
    arcBoardState.showingArcForm = false;
    arcBoardState.editingArcId = null;
    renderArcsBoardSidebar();
}

// [MVVM : ViewModel]
// Gère les touches clavier dans le formulaire d'arc.
function handleInlineArcKeydown(event) {
    if (event.key === 'Enter') {
        confirmInlineArcForm();
    } else if (event.key === 'Escape') {
        cancelInlineArcForm();
    }
}

// [MVVM : View]
// Met à jour dynamiquement la couleur sélectionnée dans le formulaire selon la catégorie choisie.
function updateInlineArcColor() {
    const category = document.getElementById('inlineArcCategory').value;
    const allCategories = { ...ARC_CATEGORIES, ...project.arcCategories };
    if (allCategories[category]) {
        document.getElementById('inlineArcColor').value = allCategories[category].color;
        document.getElementById('inlineArcColorHex').textContent = allCategories[category].color;
    }
}

// [MVVM : Other]
// Group: Use Case | Naming: ConfirmArcBoardUseCase
// Valide et enregistre (création ou modification) un arc narratif.
function confirmInlineArcForm() {
    // 1. Récupérer l'ID, le titre, la catégorie et la couleur
    const arcId = document.getElementById('inlineArcId').value; // Récupère l'ID caché
    const title = document.getElementById('inlineArcTitle').value.trim();
    const category = document.getElementById('inlineArcCategory').value;
    const color = document.getElementById('inlineArcColor').value;

    if (!title) {
        document.getElementById('inlineArcTitle').classList.add('error');
        document.getElementById('inlineArcTitle').focus();
        return;
    }

    // Réinitialiser la classe d'erreur
    document.getElementById('inlineArcTitle').classList.remove('error');

    let targetArc;

    if (arcId) {
        // --- MODE ÉDITION : Mise à jour de l'arc existant ---
        targetArc = project.narrativeArcs.find(a => a.id === arcId);
        if (targetArc) {
            targetArc.title = title;
            targetArc.category = category;
            targetArc.color = color;
            targetArc.updated = new Date().toISOString();
        } else {
            console.error('Arc to edit not found:', arcId);
            return;
        }

    } else {
        // --- MODE CRÉATION : Code existant pour créer un nouvel arc ---
        const newArcId = generateUniqueId('arc');
        targetArc = {
            id: newArcId,
            title: title,
            category: category,
            color: color,
            description: '',
            created: new Date().toISOString(),
            updated: new Date().toISOString(),
            board: {
                items: [],
                connections: []
            },
            type: category,
            importance: 'major',
            relatedCharacters: [],
            resolution: { type: 'ongoing', sceneId: null },
            scenePresence: []
        };

        if (!project.narrativeArcs) project.narrativeArcs = [];
        project.narrativeArcs.push(targetArc);
    }

    saveProject();

    arcBoardState.showingArcForm = false;
    arcBoardState.editingArcId = null;
    renderArcsBoardSidebar();

    // Après édition/création, passer à l'arc concerné
    openArcBoard(targetArc.id);
}


// [MVVM : Other]
// Group: Coordinator | Naming: ArcBoardCoordinator
// Bascule l'état d'expansion d'une catégorie d'arcs dans la barre latérale.
function toggleArcCategory(categoryKey) {
    if (!project.collapsedArcCategories) {
        project.collapsedArcCategories = [];
    }

    const index = project.collapsedArcCategories.indexOf(categoryKey);
    if (index === -1) {
        project.collapsedArcCategories.push(categoryKey);
    } else {
        project.collapsedArcCategories.splice(index, 1);
    }

    saveProject();
    renderArcsBoardSidebar();
}

// ============================================
// CRÉATION D'ARC
// ============================================

// [MVVM : ViewModel]
// Déclenche l'affichage du formulaire de création d'arc.
function createNewArcBoard() {
    showInlineArcForm();
}

// [MVVM : View]
// Ferme la modale de création d'arc si l'utilisateur clique en dehors.
function closeCreateArcModal(event) {
    if (event && event.target !== event.currentTarget) return;
    const modal = document.getElementById('createArcModal');
    if (modal) modal.remove();
}

// [MVVM : Other]
// Group: Use Case | Naming: ConfirmArcBoardUseCase
// (Ancien système) Valide et crée un nouvel arc narratif.
function confirmCreateArc() {
    const title = document.getElementById('newArcTitle').value.trim();
    const category = document.getElementById('newArcCategory').value;
    const color = document.getElementById('newArcColor').value;
    const description = document.getElementById('newArcDescription').value.trim();

    if (!title) {
        alert('Veuillez entrer un titre pour l\'arc');
        document.getElementById('newArcTitle').focus();
        return;
    }

    const newArc = {
        id: 'arc_' + Date.now(),
        title: title,
        category: category,
        color: color,
        description: description,
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
        // Board data
        board: {
            items: [],
            connections: []
        },
        // Legacy compatibility
        type: category,
        importance: 'major',
        relatedCharacters: [],
        resolution: { type: 'ongoing', sceneId: null },
        scenePresence: []
    };

    if (!project.narrativeArcs) project.narrativeArcs = [];
    project.narrativeArcs.push(newArc);
    saveProject();

    closeCreateArcModal();
    renderArcsBoardSidebar();
    openArcBoard(newArc.id);
}

// ============================================
// OUVERTURE DU BOARD D'UN ARC
// ============================================

// [MVVM : Other]
// Group: Coordinator | Naming: ArcBoardCoordinator
// Initialise et affiche le board complet d'un arc narratif spécifique.
function openArcBoard(arcId) {
    const arc = project.narrativeArcs.find(a => a.id === arcId);
    if (!arc) return;

    // Initialiser le board si nécessaire
    if (!arc.board) {
        arc.board = {
            items: [],
            connections: []
        };
    }

    arcBoardState.currentArcId = arcId;
    arcBoardState.selectedItems = [];
    arcBoardState.zoom = 1;
    arcBoardState.panX = 0;
    arcBoardState.panY = 0;

    renderArcsBoardSidebar();
    renderArcBoardCanvas(arc);
}

// ============================================
// RENDU DU CANVAS
// ============================================

// [MVVM : View]
// Rendu principal de l'interface du canvas Arc Board (toolbar, wrapper, canvas).
function renderArcBoardCanvas(arc) {
    const view = document.getElementById('editorView');
    if (!view) return;

    view.innerHTML = `
        <div class="arc-board-container">
            <!-- Toolbar gauche -->
            <div class="arc-board-toolbar">
                <button class="arc-toolbar-btn ${arcBoardState.activeTool === 'select' ? 'active' : ''}" 
                        data-tooltip="Sélection" onclick="setArcTool('select')">
                    <i data-lucide="mouse-pointer-2"></i>
                </button>
                <button class="arc-toolbar-btn ${arcBoardState.activeTool === 'pan' ? 'active' : ''}" 
                        data-tooltip="Déplacer" onclick="setArcTool('pan')">
                    <i data-lucide="hand"></i>
                </button>
                
                <div class="arc-toolbar-separator"></div>
                
                <button class="arc-toolbar-btn" data-tooltip="Note" onclick="addArcItem('note')">
                    <i data-lucide="file-text"></i>
                </button>
                <button class="arc-toolbar-btn" data-tooltip="Colonne" onclick="addArcItem('column')">
                    <i data-lucide="columns-3"></i>
                </button>
                <button class="arc-toolbar-btn" data-tooltip="Lien" onclick="addArcItem('link')">
                    <i data-lucide="link"></i>
                </button>
                <button class="arc-toolbar-btn" data-tooltip="Tâches" onclick="addArcItem('todo')">
                    <i data-lucide="check-square"></i>
                </button>
                <button class="arc-toolbar-btn" data-tooltip="Commentaire" onclick="addArcItem('comment')">
                    <i data-lucide="message-square"></i>
                </button>
                <button class="arc-toolbar-btn" data-tooltip="Tableau" onclick="addArcItem('table')">
                    <i data-lucide="table"></i>
                </button>
                
                <div class="arc-toolbar-separator"></div>
                
                <button class="arc-toolbar-btn" data-tooltip="Image" onclick="addArcItem('image')">
                    <i data-lucide="image"></i>
                </button>
                <button class="arc-toolbar-btn" data-tooltip="Upload" onclick="triggerArcUpload()">
                    <i data-lucide="upload"></i>
                </button>
                
                <div class="arc-toolbar-separator"></div>
                
                <button class="arc-toolbar-btn ${arcBoardState.activeTool === 'connect' ? 'active' : ''}" 
                        data-tooltip="Connexion (cliquer sur source puis cible)" onclick="toggleConnectionMode()">
                    <i data-lucide="git-branch"></i>
                </button>
                
                <div style="flex:1"></div>
                
                <button class="arc-toolbar-btn" data-tooltip="Supprimer sélection" onclick="deleteSelectedItems()">
                    <i data-lucide="trash-2"></i>
                </button>
            </div>
            
            <!-- Canvas principal -->
            <div class="arc-board-canvas-wrapper">
                <div class="arc-board-canvas" id="arcBoardCanvas"
                     onmousedown="handleCanvasMouseDown(event)"
                     onmousemove="handleCanvasMouseMove(event)"
                     onmouseup="handleCanvasMouseUp(event)"
                     onwheel="handleCanvasWheel(event)"
                     oncontextmenu="handleCanvasContextMenu(event)"
                     ondrop="handleCanvasDrop(event)"
                     ondragover="handleCanvasDragOver(event)"
                     ondragleave="handleCanvasDragLeave(event)">
                    
                    <div class="arc-board-content" id="arcBoardContent" 
                         style="transform: scale(${arcBoardState.zoom}) translate(${arcBoardState.panX}px, ${arcBoardState.panY}px)">
                        
                        <!-- Layer des connexions SVG -->
                        <div class="arc-connections-layer" id="arcConnectionsLayer">
                            <svg id="arcConnectionsSvg">
                                <defs>
                                    <marker id="arrowhead" markerWidth="10" markerHeight="7" 
                                            refX="9" refY="3.5" orient="auto">
                                        <polygon points="0 0, 10 3.5, 0 7" class="arc-connection-arrow"/>
                                    </marker>
                                </defs>
                            </svg>
                        </div>
                        
                        <!-- Items du board -->
                        <div id="arcBoardItems"></div>
                        
                    </div>
                    
                    <!-- Message mode connexion -->
                    <div class="arc-connection-mode-hint" id="connectionModeHint" style="display:none">
                        <i data-lucide="git-branch"></i>
                        <span id="connectionHintText">Cliquez sur l'élément source</span>
                        <button onclick="cancelConnectionMode()"><i data-lucide="x"></i> Annuler</button>
                    </div>
                    
                    ${arc.board.items.length === 0 ? `
                        <div class="arc-board-empty">
                            <div class="arc-board-empty-icon"><i data-lucide="layout-dashboard"></i></div>
                            <div class="arc-board-empty-title">Board vide</div>
                            <div class="arc-board-empty-text">
                                Utilisez la barre d'outils à gauche pour ajouter<br>
                                des colonnes, notes, images et plus encore.
                            </div>
                        </div>
                    ` : ''}
                </div>
                
                <!-- Zoom controls -->
                <div class="arc-zoom-controls">
                    <button class="arc-zoom-btn" onclick="zoomArcBoard(-1)" title="Zoom arrière">
                        <i data-lucide="zoom-out"></i>
                    </button>
                    <span class="arc-zoom-level" id="arcZoomLevel">${Math.round(arcBoardState.zoom * 100)}%</span>
                    <button class="arc-zoom-btn" onclick="zoomArcBoard(1)" title="Zoom avant">
                        <i data-lucide="zoom-in"></i>
                    </button>
                    <button class="arc-zoom-btn" onclick="resetArcZoom()" title="Réinitialiser">
                        <i data-lucide="maximize-2"></i>
                    </button>
                </div>
            </div>
            
            <!-- Panneau contextuel (droite) -->
            <div class="arc-board-context-panel ${arcBoardState.contextPanelOpen ? '' : 'collapsed'}" id="arcContextPanel">
                <div class="arc-context-header">
                    <div class="arc-context-title">
                        <i data-lucide="sliders-horizontal"></i>
                        <span>Propriétés</span>
                    </div>
                    <button class="arc-context-close" onclick="toggleArcContextPanel()">
                        <i data-lucide="x"></i>
                    </button>
                </div>
                <div class="arc-context-body" id="arcContextBody">
                    <!-- Contenu dynamique selon sélection -->
                    ${renderArcContextDefault(arc)}
                </div>
            </div>
        </div>
        
        <!-- Input file caché pour upload -->
        <input type="file" id="arcFileInput" style="display:none" accept="image/*" onchange="handleArcFileUpload(event)">
    `;

    if (typeof lucide !== 'undefined') lucide.createIcons();

    // Rendre les items existants
    renderArcBoardItems(arc);
    renderArcConnections(arc);
}

// ============================================
// RENDU DES ITEMS
// ============================================

// [MVVM : View]
// Rendu de tous les éléments (items) physiques présents sur le board.
function renderArcBoardItems(arc) {
    const container = document.getElementById('arcBoardItems');
    if (!container || !arc.board) return;

    container.innerHTML = arc.board.items.map(item => renderArcItem(item)).join('');

    if (typeof lucide !== 'undefined') lucide.createIcons();

    // Masquer l'empty state si items présents
    const emptyState = document.querySelector('.arc-board-empty');
    if (emptyState) {
        emptyState.style.display = arc.board.items.length > 0 ? 'none' : 'block';
    }
}

// [MVVM : View]
// Dispatcher de rendu pour un item du board selon son type.
function renderArcItem(item) {
    const isSelected = arcBoardState.selectedItems.includes(item.id);

    switch (item.type) {
        case 'column':
            return renderArcColumn(item, isSelected);
        case 'note':
            return renderArcNote(item, isSelected);
        case 'image':
            return renderArcImage(item, isSelected);
        case 'link':
            return renderArcLink(item, isSelected);
        case 'todo':
            return renderArcTodo(item, isSelected);
        case 'comment':
            return renderArcComment(item, isSelected);
        case 'table':
            return renderArcTable(item, isSelected);
        default:
            return '';
    }
}

// [MVVM : View]
// Génère le code HTML d'une colonne sur le board.
function renderArcColumn(item, isSelected) {
    const cardsHtml = (item.cards || []).map(card => renderArcCard(card, item.id)).join('');
    const cardCount = (item.cards || []).length;

    return `
        <div class="arc-column ${isSelected ? 'selected' : ''}"
             id="item-${item.id}"
             data-item-id="${item.id}"
             data-item-type="column"
             style="left: ${item.x}px; top: ${item.y}px; width: ${item.width || ARC_BOARD_CONFIG.defaultColumnWidth}px"
             onclick="selectArcItem(event, '${item.id}')">
            
            <div class="arc-column-header" onmousedown="handleItemMouseDown(event, '${item.id}')">
                <input type="text" class="arc-column-title" value="${item.title || ''}"
                       placeholder="Titre de la colonne"
                       onchange="updateArcItemTitle('${item.id}', this.value)"
                       onclick="event.stopPropagation()">
                <span class="arc-column-meta">${cardCount} carte${cardCount > 1 ? 's' : ''}</span>
            </div>
            
            <div class="arc-column-body" 
                 ondrop="handleCardDrop(event, '${item.id}')"
                 ondragover="handleCardDragOver(event)"
                 ondragleave="handleCardDragLeave(event)">
                ${cardsHtml}
                <div class="arc-card-add" onclick="event.stopPropagation(); addCardToColumn('${item.id}')">
                    <i data-lucide="plus"></i> Ajouter une carte
                </div>
            </div>
            
            <div class="arc-column-resize" onmousedown="startColumnResize(event, '${item.id}')"></div>
        </div>
    `;
}

// [MVVM : View]
// Génère le code HTML d'une carte à l'intérieur d'une colonne.
function renderArcCard(card, columnId) {
    // Bouton de suppression commun à toutes les cartes
    const deleteBtn = `
        <button class="arc-card-delete" onclick="deleteArcCard(event, '${columnId}', '${card.id}')" title="Supprimer">
            <i data-lucide="x"></i>
        </button>
    `;

    // Poignée de drag - SEUL élément draggable de la carte
    const dragHandle = `
        <div class="arc-card-drag-handle"
             draggable="true"
             ondragstart="handleCardDragStart(event, '${card.id}', '${columnId}')"
             ondragend="handleCardDragEnd(event)"
             title="Glisser pour déplacer">
            <i data-lucide="grip-vertical"></i>
        </div>
    `;

    switch (card.type) {
        case 'note':
            return `
                <div class="arc-card arc-card-note" data-card-id="${card.id}"
                     onclick="selectArcCard(event, '${card.id}', '${columnId}')">
                    ${dragHandle}
                    ${deleteBtn}
                    <div class="arc-card-content" contenteditable="true"
                         onblur="updateArcCardContent('${columnId}', '${card.id}', this.innerHTML)"
                         onclick="event.stopPropagation()">${card.content || ''}</div>
                </div>
            `;

        case 'image':
            return `
                <div class="arc-card arc-card-image" data-card-id="${card.id}"
                     onclick="selectArcCard(event, '${card.id}', '${columnId}')">
                    ${dragHandle}
                    ${deleteBtn}
                    ${card.src ?
                    `<img src="${card.src}" alt="">` :
                    `<div class="arc-card-upload" onclick="triggerCardImageUpload('${columnId}', '${card.id}')">
                            <i data-lucide="cloud-upload"></i>
                            <span>Ajouter une image</span>
                        </div>`
                }
                    ${card.caption ? `<div class="arc-card-caption">${card.caption}</div>` : ''}
                </div>
            `;

        case 'link':
            return `
                <div class="arc-card arc-card-link" data-card-id="${card.id}"
                     onclick="selectArcCard(event, '${card.id}', '${columnId}')">
                    ${dragHandle}
                    ${deleteBtn}
                    ${card.url ? `
                        <div class="arc-link-preview">
                            ${card.previewImage ? `<div class="arc-link-preview-image" style="background-image:url(${card.previewImage})"></div>` : ''}
                            <div class="arc-link-preview-info">
                                <div class="arc-link-preview-title">${card.title || card.url}</div>
                                <div class="arc-link-preview-url">${card.url}</div>
                            </div>
                        </div>
                    ` : `
                        <div class="arc-link-input">
                            <i data-lucide="link"></i>
                            <input type="text" placeholder="Entrer une URL" draggable="false"
                                   onkeypress="handleLinkInput(event, '${columnId}', '${card.id}')"
                                   onmousedown="event.stopPropagation()"
                                   onclick="event.stopPropagation()">
                        </div>
                    `}
                </div>
            `;

        case 'todo':
            const todosHtml = (card.items || []).map((todo, idx) => `
                <div class="arc-todo-item">
                    <div class="arc-todo-checkbox ${todo.completed ? 'checked' : ''}"
                         onclick="toggleArcTodo('${columnId}', '${card.id}', ${idx})">
                        ${todo.completed ? '<i data-lucide="check"></i>' : ''}
                    </div>
                    <input type="text" class="arc-todo-text ${todo.completed ? 'completed' : ''}" draggable="false"
                           value="${todo.text || ''}"
                           onchange="updateArcTodoText('${columnId}', '${card.id}', ${idx}, this.value)"
                           onmousedown="event.stopPropagation()"
                           onclick="event.stopPropagation()">
                </div>
            `).join('');

            return `
                <div class="arc-card arc-card-todo" data-card-id="${card.id}"
                     onclick="selectArcCard(event, '${card.id}', '${columnId}')">
                    ${dragHandle}
                    ${deleteBtn}
                    <input type="text" class="arc-card-title" value="${card.title || ''}"
                           placeholder="Titre de la liste"
                           onchange="updateArcCardTitle('${columnId}', '${card.id}', this.value)"
                           onmousedown="event.stopPropagation()"
                           onclick="event.stopPropagation()">
                    <div class="arc-todo-list">
                        ${todosHtml}
                    </div>
                    <div class="arc-todo-add" onclick="addArcTodoItem('${columnId}', '${card.id}'); event.stopPropagation();" draggable="false">
                        <i data-lucide="plus"></i> Ajouter une tâche...
                    </div>
                    ${card.assignee ? `<button class="arc-todo-assign" draggable="false">${card.assignee}</button>` :
                    `<button class="arc-todo-assign" draggable="false" onclick="assignArcTodo('${columnId}', '${card.id}'); event.stopPropagation();">Assigner à</button>`}
                </div>
            `;

        case 'audio':
            return `
                <div class="arc-card arc-card-audio" data-card-id="${card.id}"
                     onclick="selectArcCard(event, '${card.id}', '${columnId}')">
                    ${dragHandle}
                    ${deleteBtn}
                    <div class="arc-audio-placeholder">
                        <i data-lucide="music"></i>
                        <span>${card.url ? 'Audio embed' : 'Coller un lien Spotify ou SoundCloud'}</span>
                    </div>
                </div>
            `;

        case 'scene':
            const statusLabels = {
                'setup': 'Introduction',
                'development': 'Développement',
                'climax': 'Point culminant',
                'resolution': 'Résolution'
            };
            const intensityDots = '●'.repeat(card.intensity || 3) + '○'.repeat(5 - (card.intensity || 3));
            const sceneTitle = card.sceneTitle || 'Scène sans titre';
            const breadcrumb = card.breadcrumb || sceneTitle;
            const status = statusLabels[card.status] || 'Développement';
            const notes = card.notes || '';

            return `
                <div class="arc-card arc-card-scene" data-card-id="${card.id}" data-scene-id="${card.sceneId || ''}"
                     onclick="selectArcCard(event, '${card.id}', '${columnId}')">
                    ${dragHandle}
                    ${deleteBtn}
                    <div class="arc-card-scene-header">
                        <i data-lucide="book-open"></i>
                        <div class="arc-card-scene-title-wrapper">
                            <div class="arc-card-scene-breadcrumb">${breadcrumb}</div>
                            <div class="arc-card-scene-title">${sceneTitle}</div>
                        </div>
                    </div>
                    <div class="arc-card-scene-meta">
                        <div class="arc-card-scene-intensity">
                            <span class="arc-card-scene-label">Intensité:</span>
                            <span class="arc-card-scene-value">${intensityDots}</span>
                        </div>
                        <div class="arc-card-scene-status">
                            <span class="arc-card-scene-label">Statut:</span>
                            <span class="arc-card-scene-value">${status}</span>
                        </div>
                        ${notes ? `<div class="arc-card-scene-notes">${notes}</div>` : ''}
                    </div>
                    <button class="arc-card-scene-open" draggable="false" onclick="openSceneFromCard(event, '${card.sceneId || ''}'); event.stopPropagation();">
                        <i data-lucide="external-link"></i> Ouvrir la scène
                    </button>
                </div>
            `;

        default:
            return `
                <div class="arc-card arc-card-note" data-card-id="${card.id}"
                     onclick="selectArcCard(event, '${card.id}', '${columnId}')">
                    ${dragHandle}
                    ${deleteBtn}
                    <div class="arc-card-content">${card.content || ''}</div>
                </div>
            `;
    }
}

// Fonction pour supprimer une carte
// [MVVM : Other]
// Supprime une carte d'une colonne et met à jour les données du projet.
function deleteArcCard(event, columnId, cardId) {
    event.stopPropagation();
    event.preventDefault();

    const arc = project.narrativeArcs.find(a => a.id === arcBoardState.currentArcId);
    if (!arc) return;

    const column = arc.board.items.find(i => i.id === columnId);
    if (!column || !column.cards) return;

    // Si c'est une carte scene, retirer le columnId du presence
    const card = column.cards.find(c => c.id === cardId);
    if (card && card.type === 'scene' && card.sceneId && arc.scenePresence) {
        const presence = arc.scenePresence.find(p => p.sceneId == card.sceneId);
        if (presence) {
            presence.columnId = null;
        }
    }

    column.cards = column.cards.filter(c => c.id !== cardId);

    saveProject();
    renderArcBoardItems(arc);
}

// [MVVM : ViewModel]
// Ouvre une scène depuis une carte scene du arc-board
function openSceneFromCard(event, sceneId) {
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }

    if (!sceneId) {
        console.error('No scene ID provided');
        return;
    }

    // Trouver l'acte et le chapitre contenant cette scène
    // Utiliser == au lieu de === pour gérer les conversions de type (number vs string)
    for (const act of project.acts) {
        for (const chapter of act.chapters) {
            const scene = chapter.scenes.find(s => s.id == sceneId);
            if (scene) {
                // Basculer vers la vue éditeur
                switchView('editor');
                // Ouvrir la scène
                openScene(act.id, chapter.id, scene.id);
                return;
            }
        }
    }

    console.error('Scene not found:', sceneId);
}

// [MVVM : View]
// Génère le code HTML d'une note flottante.
function renderArcNote(item, isSelected) {
    return `
        <div class="arc-floating-item arc-floating-note ${isSelected ? 'selected' : ''}"
             id="item-${item.id}"
             data-item-id="${item.id}"
             data-item-type="note"
             style="left: ${item.x}px; top: ${item.y}px; width: ${item.width || 250}px"
             draggable="true"
             ondragstart="handleFloatingDragStart(event, '${item.id}')"
             ondragend="handleFloatingDragEnd(event)"
             onmousedown="handleItemMouseDown(event, '${item.id}')"
             onclick="selectArcItem(event, '${item.id}')">
            <div class="arc-card-content" contenteditable="true"
                 onblur="updateArcItemContent('${item.id}', this.innerHTML)"
                 onclick="event.stopPropagation()">${item.content || ''}</div>
        </div>
    `;
}

// [MVVM : View]
// Génère le code HTML d'une image flottante.
function renderArcImage(item, isSelected) {
    return `
        <div class="arc-floating-item arc-floating-image ${isSelected ? 'selected' : ''}"
             id="item-${item.id}"
             data-item-id="${item.id}"
             data-item-type="image"
             style="left: ${item.x}px; top: ${item.y}px"
             draggable="true"
             ondragstart="handleFloatingDragStart(event, '${item.id}')"
             ondragend="handleFloatingDragEnd(event)"
             onmousedown="handleItemMouseDown(event, '${item.id}')"
             onclick="selectArcItem(event, '${item.id}')">
            ${item.src ?
            `<img src="${item.src}" alt="" style="max-width: ${item.width || 300}px" draggable="false">` :
            `<div class="arc-card-upload" style="padding: 40px" onclick="triggerItemImageUpload('${item.id}')">
                    <i data-lucide="cloud-upload"></i>
                    <span>Ajouter une image</span>
                </div>`
        }
        </div>
    `;
}

// [MVVM : View]
// Génère le code HTML d'un lien flottant.
function renderArcLink(item, isSelected) {
    return `
        <div class="arc-floating-item ${isSelected ? 'selected' : ''}"
             id="item-${item.id}"
             data-item-id="${item.id}"
             data-item-type="link"
             style="left: ${item.x}px; top: ${item.y}px; width: 280px"
             draggable="true"
             ondragstart="handleFloatingDragStart(event, '${item.id}')"
             ondragend="handleFloatingDragEnd(event)"
             onmousedown="handleItemMouseDown(event, '${item.id}')"
             onclick="selectArcItem(event, '${item.id}')">
            <div class="arc-card arc-card-link" style="margin:0">
                ${item.url ? `
                    <div class="arc-link-preview">
                        <div class="arc-link-preview-info">
                            <div class="arc-link-preview-title">${item.title || item.url}</div>
                            <div class="arc-link-preview-url">${item.url}</div>
                        </div>
                    </div>
                ` : `
                    <div class="arc-link-input">
                        <i data-lucide="link"></i>
                        <input type="text" placeholder="Entrer une URL"
                               onkeypress="handleFloatingLinkInput(event, '${item.id}')"
                               onclick="event.stopPropagation()">
                    </div>
                `}
            </div>
        </div>
    `;
}

// [MVVM : View]
// Génère le code HTML d'une liste de tâches flottante.
function renderArcTodo(item, isSelected) {
    const todosHtml = (item.items || []).map((todo, idx) => `
        <div class="arc-todo-item">
            <div class="arc-todo-checkbox ${todo.completed ? 'checked' : ''}"
                 onclick="toggleFloatingTodo('${item.id}', ${idx})">
                ${todo.completed ? '<i data-lucide="check"></i>' : ''}
            </div>
            <input type="text" class="arc-todo-text ${todo.completed ? 'completed' : ''}"
                   value="${todo.text || ''}"
                   onchange="updateFloatingTodoText('${item.id}', ${idx}, this.value)"
                   onclick="event.stopPropagation()">
        </div>
    `).join('');

    return `
        <div class="arc-floating-item ${isSelected ? 'selected' : ''}"
             id="item-${item.id}"
             data-item-id="${item.id}"
             data-item-type="todo"
             style="left: ${item.x}px; top: ${item.y}px; width: 260px"
             draggable="true"
             ondragstart="handleFloatingDragStart(event, '${item.id}')"
             ondragend="handleFloatingDragEnd(event)"
             onmousedown="handleItemMouseDown(event, '${item.id}')"
             onclick="selectArcItem(event, '${item.id}')">
            <div class="arc-card arc-card-todo" style="margin:0">
                <input type="text" class="arc-card-title" value="${item.title || ''}"
                       placeholder="Liste de tâches"
                       onchange="updateArcItemTitle('${item.id}', this.value)"
                       onclick="event.stopPropagation()">
                <div class="arc-todo-list">${todosHtml}</div>
                <div class="arc-todo-add" onclick="addFloatingTodoItem('${item.id}'); event.stopPropagation();">
                    <i data-lucide="plus"></i> Ajouter une tâche...
                </div>
            </div>
        </div>
    `;
}

// [MVVM : View]
// Génère le code HTML d'un commentaire flottant.
function renderArcComment(item, isSelected) {
    return `
        <div class="arc-floating-item ${isSelected ? 'selected' : ''}"
             id="item-${item.id}"
             data-item-id="${item.id}"
             data-item-type="comment"
             style="left: ${item.x}px; top: ${item.y}px; width: 220px"
             draggable="true"
             ondragstart="handleFloatingDragStart(event, '${item.id}')"
             ondragend="handleFloatingDragEnd(event)"
             onmousedown="handleItemMouseDown(event, '${item.id}')"
             onclick="selectArcItem(event, '${item.id}')">
            <div class="arc-card arc-card-comment" style="margin:0">
                <div class="arc-card-content" contenteditable="true"
                     onblur="updateArcItemContent('${item.id}', this.innerHTML)"
                     onclick="event.stopPropagation()">${item.content || ''}</div>
            </div>
        </div>
    `;
}

// [MVVM : View]
// Génère le code HTML d'un tableau flottant.
function renderArcTable(item, isSelected) {
    const rows = item.rows || 3;
    const cols = item.cols || 3;
    const data = item.data || [];

    let tableHtml = '<table>';
    for (let r = 0; r < rows; r++) {
        tableHtml += '<tr>';
        for (let c = 0; c < cols; c++) {
            const cellData = data[r] && data[r][c] ? data[r][c] : '';
            const tag = r === 0 ? 'th' : 'td';
            tableHtml += `<${tag} contenteditable="true" 
                           onblur="updateArcTableCell('${item.id}', ${r}, ${c}, this.textContent)"
                           onclick="event.stopPropagation()">${cellData}</${tag}>`;
        }
        tableHtml += '</tr>';
    }
    tableHtml += '</table>';

    return `
        <div class="arc-floating-item ${isSelected ? 'selected' : ''}"
             id="item-${item.id}"
             data-item-id="${item.id}"
             data-item-type="table"
             style="left: ${item.x}px; top: ${item.y}px"
             draggable="true"
             ondragstart="handleFloatingDragStart(event, '${item.id}')"
             ondragend="handleFloatingDragEnd(event)"
             onmousedown="handleItemMouseDown(event, '${item.id}')"
             onclick="selectArcItem(event, '${item.id}')">
            <div class="arc-card arc-card-table" style="margin:0">
                ${tableHtml}
            </div>
        </div>
    `;
}

// ============================================
// PANNEAU CONTEXTUEL
// ============================================

// [MVVM : View]
// Rendu par défaut du panneau contextuel (informations de l'arc et stats).
function renderArcContextDefault(arc) {
    const allCategories = { ...ARC_CATEGORIES, ...project.arcCategories };
    const catData = allCategories[arc.category] || { label: 'Non catégorisé', color: '#999' };

    return `
        <div class="arc-context-section">
            <div class="arc-context-section-title">Arc actuel</div>
            <div style="margin-bottom:12px">
                <input type="text" class="form-input" value="${arc.title}"
                       onchange="updateCurrentArcTitle(this.value)"
                       style="font-weight:600">
            </div>
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
                <span style="width:12px;height:12px;border-radius:50%;background:${arc.color}"></span>
                <span style="font-size:13px;color:var(--text-secondary)">${catData.label}</span>
            </div>
        </div>
        
        <div class="arc-context-section">
            <div class="arc-context-section-title">Ajouter au board</div>
            <div class="arc-context-tools">
                <div class="arc-context-tool" onclick="addArcItem('column')">
                    <i data-lucide="columns-3"></i>
                    <span>Colonne</span>
                </div>
                <div class="arc-context-tool" onclick="addArcItem('note')">
                    <i data-lucide="file-text"></i>
                    <span>Note</span>
                </div>
                <div class="arc-context-tool" onclick="addArcItem('image')">
                    <i data-lucide="image"></i>
                    <span>Image</span>
                </div>
                <div class="arc-context-tool" onclick="addArcItem('todo')">
                    <i data-lucide="check-square"></i>
                    <span>Tâches</span>
                </div>
            </div>
        </div>
        
        <div class="arc-context-section">
            <div class="arc-context-section-title">Statistiques</div>
            <div style="font-size:13px;color:var(--text-secondary)">
                <div style="margin-bottom:4px">${arc.board.items.length} élément${arc.board.items.length > 1 ? 's' : ''}</div>
                <div>${arc.board.connections ? arc.board.connections.length : 0} connexion${(arc.board.connections?.length || 0) > 1 ? 's' : ''}</div>
            </div>
        </div>
    `;
}

// [MVVM : Other]
// Détermine et affiche le contenu du panneau contextuel selon l'item sélectionné.
function renderArcContextForItem(item) {
    const body = document.getElementById('arcContextBody');
    if (!body) return;

    let html = '';

    switch (item.type) {
        case 'column':
            html = renderColumnContextPanel(item);
            break;
        case 'note':
        case 'comment':
            html = renderTextContextPanel(item);
            break;
        case 'image':
            html = renderImageContextPanel(item);
            break;
        case 'todo':
            html = renderTodoContextPanel(item);
            break;
        case 'table':
            html = renderTableContextPanel(item);
            break;
        default:
            html = renderDefaultContextPanel(item);
    }

    body.innerHTML = html;
    if (typeof lucide !== 'undefined') lucide.createIcons();

    // Ouvrir le panneau si fermé
    if (!arcBoardState.contextPanelOpen) {
        toggleArcContextPanel();
    }
}

// [MVVM : View]
// Rendu des contrôles contextuels pour une colonne.
function renderColumnContextPanel(item) {
    return `
        <div class="arc-context-section">
            <div class="arc-context-section-title">Colonne</div>
            <div class="form-group">
                <label style="font-size:12px">Titre</label>
                <input type="text" class="form-input" value="${item.title || ''}"
                       onchange="updateArcItemTitle('${item.id}', this.value)">
            </div>
            <div class="form-group">
                <label style="font-size:12px">Largeur (px)</label>
                <input type="number" class="form-input" value="${item.width || ARC_BOARD_CONFIG.defaultColumnWidth}"
                       min="${ARC_BOARD_CONFIG.minColumnWidth}" max="${ARC_BOARD_CONFIG.maxColumnWidth}"
                       onchange="updateArcItemWidth('${item.id}', this.value)">
            </div>
        </div>
        
        <div class="arc-context-section">
            <div class="arc-context-section-title">Ajouter une carte</div>
            <div class="arc-context-tools">
                <div class="arc-context-tool" onclick="addCardToColumn('${item.id}', 'note')">
                    <i data-lucide="file-text"></i>
                    <span>Note</span>
                </div>
                <div class="arc-context-tool" onclick="addCardToColumn('${item.id}', 'image')">
                    <i data-lucide="image"></i>
                    <span>Image</span>
                </div>
                <div class="arc-context-tool" onclick="addCardToColumn('${item.id}', 'link')">
                    <i data-lucide="link"></i>
                    <span>Lien</span>
                </div>
                <div class="arc-context-tool" onclick="addCardToColumn('${item.id}', 'todo')">
                    <i data-lucide="check-square"></i>
                    <span>Tâches</span>
                </div>
            </div>
        </div>
        
        <div class="arc-context-section">
            <button class="arc-context-delete" onclick="deleteArcItem('${item.id}')">
                <i data-lucide="trash-2"></i> Supprimer la colonne
            </button>
        </div>
    `;
}

// [MVVM : View]
// Rendu des contrôles contextuels pour du texte (formatage, alignement).
function renderTextContextPanel(item) {
    return `
        <div class="arc-context-section">
            <div class="arc-context-section-title">Mise en forme</div>
            <div class="arc-context-format-bar">
                <button class="arc-format-btn" onclick="formatArcText('bold')" title="Gras">
                    <i data-lucide="bold"></i>
                </button>
                <button class="arc-format-btn" onclick="formatArcText('italic')" title="Italique">
                    <i data-lucide="italic"></i>
                </button>
                <button class="arc-format-btn" onclick="formatArcText('strikethrough')" title="Barré">
                    <i data-lucide="strikethrough"></i>
                </button>
                <button class="arc-format-btn" onclick="formatArcText('underline')" title="Souligné">
                    <i data-lucide="underline"></i>
                </button>
            </div>
        </div>
        
        <div class="arc-context-section">
            <div class="arc-context-section-title">Listes</div>
            <div class="arc-context-format-bar">
                <button class="arc-format-btn" onclick="formatArcText('insertUnorderedList')" title="Liste à puces">
                    <i data-lucide="list"></i>
                </button>
                <button class="arc-format-btn" onclick="formatArcText('insertOrderedList')" title="Liste numérotée">
                    <i data-lucide="list-ordered"></i>
                </button>
            </div>
        </div>
        
        <div class="arc-context-section">
            <div class="arc-context-section-title">Alignement</div>
            <div class="arc-context-format-bar">
                <button class="arc-format-btn" onclick="formatArcText('justifyLeft')" title="Gauche">
                    <i data-lucide="align-left"></i>
                </button>
                <button class="arc-format-btn" onclick="formatArcText('justifyCenter')" title="Centre">
                    <i data-lucide="align-center"></i>
                </button>
                <button class="arc-format-btn" onclick="formatArcText('justifyRight')" title="Droite">
                    <i data-lucide="align-right"></i>
                </button>
            </div>
        </div>
        
        <div class="arc-context-section">
            <div class="arc-context-section-title">Code</div>
            <div class="arc-context-format-bar">
                <button class="arc-format-btn" onclick="insertArcCode()" title="Code">
                    <i data-lucide="code"></i>
                </button>
            </div>
        </div>
        
        <div class="arc-context-section">
            <button class="arc-context-delete" onclick="deleteArcItem('${item.id}')">
                <i data-lucide="trash-2"></i> Supprimer
            </button>
        </div>
    `;
}

// [MVVM : View]
// Rendu des contrôles contextuels pour une image.
function renderImageContextPanel(item) {
    return `
        <div class="arc-context-section">
            <div class="arc-context-section-title">Image</div>
            <button class="btn-secondary" style="width:100%" onclick="triggerItemImageUpload('${item.id}')">
                <i data-lucide="upload"></i> Changer l'image
            </button>
        </div>
        
        <div class="arc-context-section">
            <div class="arc-context-section-title">Taille</div>
            <div class="form-group">
                <label style="font-size:12px">Largeur max (px)</label>
                <input type="number" class="form-input" value="${item.width || 300}"
                       min="100" max="800"
                       onchange="updateArcItemWidth('${item.id}', this.value)">
            </div>
        </div>
        
        <div class="arc-context-section">
            <button class="arc-context-delete" onclick="deleteArcItem('${item.id}')">
                <i data-lucide="trash-2"></i> Supprimer
            </button>
        </div>
    `;
}

// [MVVM : View]
// Rendu des contrôles contextuels pour une liste de tâches.
function renderTodoContextPanel(item) {
    return `
        <div class="arc-context-section">
            <div class="arc-context-section-title">Liste de tâches</div>
            <div class="form-group">
                <label style="font-size:12px">Titre</label>
                <input type="text" class="form-input" value="${item.title || ''}"
                       onchange="updateArcItemTitle('${item.id}', this.value)">
            </div>
        </div>
        
        <div class="arc-context-section">
            <button class="btn-secondary" style="width:100%" onclick="addFloatingTodoItem('${item.id}')">
                <i data-lucide="plus"></i> Ajouter une tâche
            </button>
        </div>
        
        <div class="arc-context-section">
            <button class="arc-context-delete" onclick="deleteArcItem('${item.id}')">
                <i data-lucide="trash-2"></i> Supprimer
            </button>
        </div>
    `;
}

// [MVVM : View]
// Rendu des contrôles contextuels pour un tableau.
function renderTableContextPanel(item) {
    return `
        <div class="arc-context-section">
            <div class="arc-context-section-title">Tableau</div>
            <div class="form-row" style="display:flex;gap:8px">
                <div class="form-group" style="flex:1">
                    <label style="font-size:12px">Lignes</label>
                    <input type="number" class="form-input" value="${item.rows || 3}"
                           min="1" max="20"
                           onchange="updateArcTableSize('${item.id}', 'rows', this.value)">
                </div>
                <div class="form-group" style="flex:1">
                    <label style="font-size:12px">Colonnes</label>
                    <input type="number" class="form-input" value="${item.cols || 3}"
                           min="1" max="10"
                           onchange="updateArcTableSize('${item.id}', 'cols', this.value)">
                </div>
            </div>
        </div>
        
        <div class="arc-context-section">
            <button class="arc-context-delete" onclick="deleteArcItem('${item.id}')">
                <i data-lucide="trash-2"></i> Supprimer
            </button>
        </div>
    `;
}

// [MVVM : View]
// Rendu par défaut pour les types d'items non spécifiés.
function renderDefaultContextPanel(item) {
    return `
        <div class="arc-context-section">
            <div class="arc-context-section-title">Élément</div>
            <p style="font-size:13px;color:var(--text-secondary)">Type: ${item.type}</p>
        </div>
        
        <div class="arc-context-section">
            <button class="arc-context-delete" onclick="deleteArcItem('${item.id}')">
                <i data-lucide="trash-2"></i> Supprimer
            </button>
        </div>
    `;
}

// [MVVM : Other]
// Bascule la visibilité du panneau contextuel à droite.
function toggleArcContextPanel() {
    const panel = document.getElementById('arcContextPanel');
    if (!panel) return;

    arcBoardState.contextPanelOpen = !arcBoardState.contextPanelOpen;
    panel.classList.toggle('collapsed', !arcBoardState.contextPanelOpen);
}

// ============================================
// CONNEXIONS - SYSTÈME SIMPLIFIÉ
// ============================================

// Mode connexion : clic sur source, puis clic sur cible
// [MVVM : Other]
// Active ou désactive le mode de création de connexions.
function toggleConnectionMode() {
    if (arcBoardState.activeTool === 'connect') {
        cancelConnectionMode();
    } else {
        arcBoardState.activeTool = 'connect';
        arcBoardState.connectionSource = null;

        // Update UI
        document.querySelectorAll('.arc-toolbar-btn').forEach(btn => btn.classList.remove('active'));
        const connectBtn = document.querySelector('.arc-toolbar-btn[onclick="toggleConnectionMode()"]');
        if (connectBtn) connectBtn.classList.add('active');

        // Afficher le hint
        const hint = document.getElementById('connectionModeHint');
        if (hint) {
            hint.style.display = 'flex';
            document.getElementById('connectionHintText').textContent = 'Cliquez sur l\'élément source';
        }

        // Ajouter classe au canvas
        const canvas = document.getElementById('arcBoardCanvas');
        if (canvas) canvas.classList.add('connection-mode');

        // Highlight tous les éléments connectables
        document.querySelectorAll('.arc-column, .arc-floating-item').forEach(el => {
            el.classList.add('connectable');
        });

        if (typeof lucide !== 'undefined') lucide.createIcons();
    }
}

// [MVVM : Other]
// Annule le mode connexion et réinitialise l'état associé.
function cancelConnectionMode() {
    arcBoardState.activeTool = 'select';
    arcBoardState.connectionSource = null;

    // Update UI
    document.querySelectorAll('.arc-toolbar-btn').forEach(btn => btn.classList.remove('active'));
    const selectBtn = document.querySelector('.arc-toolbar-btn[onclick="setArcTool(\'select\')"]');
    if (selectBtn) selectBtn.classList.add('active');

    // Masquer le hint
    const hint = document.getElementById('connectionModeHint');
    if (hint) hint.style.display = 'none';

    // Retirer classe du canvas
    const canvas = document.getElementById('arcBoardCanvas');
    if (canvas) canvas.classList.remove('connection-mode');

    // Retirer highlight
    document.querySelectorAll('.arc-column, .arc-floating-item').forEach(el => {
        el.classList.remove('connectable', 'connection-source', 'connection-target');
    });
}

// [MVVM : Other]
// Gère la logique de sélection source/cible pour créer une connexion entre deux éléments.
function handleConnectionClick(itemId) {
    if (arcBoardState.activeTool !== 'connect') return false;

    const arc = project.narrativeArcs.find(a => a.id === arcBoardState.currentArcId);
    if (!arc) return false;

    if (!arcBoardState.connectionSource) {
        // Premier clic : sélectionner la source
        arcBoardState.connectionSource = itemId;

        // Update UI
        const sourceEl = document.getElementById(`item-${itemId}`);
        if (sourceEl) {
            sourceEl.classList.add('connection-source');
            sourceEl.classList.remove('connectable');
        }

        document.getElementById('connectionHintText').textContent = 'Cliquez sur l\'élément cible';

        // Les autres éléments deviennent des cibles potentielles
        document.querySelectorAll('.arc-column, .arc-floating-item').forEach(el => {
            if (el.id !== `item-${itemId}`) {
                el.classList.add('connection-target');
            }
        });

        return true;
    } else {
        // Deuxième clic : créer la connexion
        if (arcBoardState.connectionSource === itemId) {
            // Clic sur le même élément = annuler
            cancelConnectionMode();
            return true;
        }

        // Vérifier si connexion existe déjà
        const exists = arc.board.connections && arc.board.connections.some(c =>
            (c.from === arcBoardState.connectionSource && c.to === itemId) ||
            (c.from === itemId && c.to === arcBoardState.connectionSource)
        );

        if (!exists) {
            // Calculer les meilleurs côtés pour la connexion
            const sides = calculateBestConnectionSides(arcBoardState.connectionSource, itemId);

            // Créer la connexion
            const newConnection = {
                id: 'conn_' + Date.now(),
                from: arcBoardState.connectionSource,
                fromSide: sides.fromSide,
                to: itemId,
                toSide: sides.toSide
            };

            if (!arc.board.connections) arc.board.connections = [];
            arc.board.connections.push(newConnection);

            saveProject();
            renderArcConnections(arc);
        }

        // Réinitialiser pour une nouvelle connexion
        arcBoardState.connectionSource = null;
        document.getElementById('connectionHintText').textContent = 'Cliquez sur l\'élément source';

        document.querySelectorAll('.arc-column, .arc-floating-item').forEach(el => {
            el.classList.remove('connection-source', 'connection-target');
            el.classList.add('connectable');
        });

        return true;
    }
}

// [MVVM : Other]
// Calcule géométriquement les meilleurs côtés (top, bottom, left, right) pour relier deux éléments.
function calculateBestConnectionSides(fromId, toId) {
    const fromEl = document.getElementById(`item-${fromId}`);
    const toEl = document.getElementById(`item-${toId}`);

    if (!fromEl || !toEl) return { fromSide: 'right', toSide: 'left' };

    const fromRect = fromEl.getBoundingClientRect();
    const toRect = toEl.getBoundingClientRect();

    const fromCenterX = fromRect.left + fromRect.width / 2;
    const fromCenterY = fromRect.top + fromRect.height / 2;
    const toCenterX = toRect.left + toRect.width / 2;
    const toCenterY = toRect.top + toRect.height / 2;

    const dx = toCenterX - fromCenterX;
    const dy = toCenterY - fromCenterY;

    let fromSide, toSide;

    // Déterminer la direction principale
    if (Math.abs(dx) > Math.abs(dy)) {
        // Connexion horizontale
        if (dx > 0) {
            fromSide = 'right';
            toSide = 'left';
        } else {
            fromSide = 'left';
            toSide = 'right';
        }
    } else {
        // Connexion verticale
        if (dy > 0) {
            fromSide = 'bottom';
            toSide = 'top';
        } else {
            fromSide = 'top';
            toSide = 'bottom';
        }
    }

    return { fromSide, toSide };
}

// [MVVM : View]
// Dessine toutes les connexions SVG sur le board pour l'arc actuel.
function renderArcConnections(arc) {
    const svg = document.getElementById('arcConnectionsSvg');
    if (!svg) return;

    // Conserver les defs
    const defs = svg.querySelector('defs');
    svg.innerHTML = '';
    if (defs) svg.appendChild(defs);

    if (!arc.board.connections || arc.board.connections.length === 0) return;

    const content = document.getElementById('arcBoardContent');
    if (!content) return;

    arc.board.connections.forEach(conn => {
        const fromEl = document.getElementById(`item-${conn.from}`);
        const toEl = document.getElementById(`item-${conn.to}`);

        if (!fromEl || !toEl) return;

        // Obtenir les positions relatives au content
        const fromPos = getElementPosition(fromEl, conn.fromSide);
        const toPos = getElementPosition(toEl, conn.toSide);

        // Créer la courbe Bézier
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const d = createBezierPath(fromPos, toPos, conn.fromSide, conn.toSide);

        path.setAttribute('d', d);
        path.setAttribute('class', `arc-connection-line ${arcBoardState.selectedItems.includes(conn.id) ? 'selected' : ''}`);
        path.setAttribute('data-connection-id', conn.id);
        path.setAttribute('marker-end', 'url(#arrowhead)');
        path.style.pointerEvents = 'stroke';
        path.onclick = (e) => {
            e.stopPropagation();
            selectArcConnection(e, conn.id);
        };

        svg.appendChild(path);
    });
}

// [MVVM : Other]
// Calcule la position (x, y) d'un point d'ancrage sur le bord d'un élément.
function getElementPosition(element, side) {
    // Obtenir la position depuis le style (left/top)
    const x = parseInt(element.style.left) || 0;
    const y = parseInt(element.style.top) || 0;
    const w = element.offsetWidth;
    const h = element.offsetHeight;

    switch (side) {
        case 'top': return { x: x + w / 2, y: y };
        case 'bottom': return { x: x + w / 2, y: y + h };
        case 'left': return { x: x, y: y + h / 2 };
        case 'right': return { x: x + w, y: y + h / 2 };
        default: return { x: x + w / 2, y: y + h / 2 };
    }
}

// [MVVM : Other]
// Génère la chaîne de caractères (path) pour une courbe de Bézier entre deux points.
function createBezierPath(from, to, fromSide, toSide) {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const offset = Math.min(80, Math.max(40, dist / 3));

    let cp1 = { x: from.x, y: from.y };
    let cp2 = { x: to.x, y: to.y };

    switch (fromSide) {
        case 'top': cp1.y -= offset; break;
        case 'bottom': cp1.y += offset; break;
        case 'left': cp1.x -= offset; break;
        case 'right': cp1.x += offset; break;
    }

    switch (toSide) {
        case 'top': cp2.y -= offset; break;
        case 'bottom': cp2.y += offset; break;
        case 'left': cp2.x -= offset; break;
        case 'right': cp2.x += offset; break;
    }

    return `M ${from.x} ${from.y} C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${to.x} ${to.y}`;
}

// [MVVM : Other]
// Sélectionne une connexion et met à jour l'état visuel.
function selectArcConnection(event, connId) {
    event.stopPropagation();
    arcBoardState.selectedItems = [connId];

    // Désélectionner les items
    document.querySelectorAll('.arc-column, .arc-floating-item').forEach(el => {
        el.classList.remove('selected');
    });

    // Highlight la connexion
    document.querySelectorAll('.arc-connection-line').forEach(line => {
        line.classList.remove('selected');
    });

    const line = document.querySelector(`[data-connection-id="${connId}"]`);
    if (line) line.classList.add('selected');
}

// [MVVM : Other]
// Supprime tous les éléments (items et connexions) actuellement sélectionnés.
function deleteSelectedItems() {
    const arc = project.narrativeArcs.find(a => a.id === arcBoardState.currentArcId);
    if (!arc) return;

    if (arcBoardState.selectedItems.length === 0) {
        alert('Sélectionnez un élément à supprimer');
        return;
    }

    arcBoardState.selectedItems.forEach(id => {
        // Vérifier si c'est une connexion
        if (arc.board.connections) {
            const connIndex = arc.board.connections.findIndex(c => c.id === id);
            if (connIndex !== -1) {
                arc.board.connections.splice(connIndex, 1);
                return;
            }
        }

        // Sinon c'est un item
        const itemIndex = arc.board.items.findIndex(i => i.id === id);
        if (itemIndex !== -1) {
            arc.board.items.splice(itemIndex, 1);

            // Supprimer les connexions liées
            if (arc.board.connections) {
                arc.board.connections = arc.board.connections.filter(c =>
                    c.from !== id && c.to !== id
                );
            }
        }
    });

    arcBoardState.selectedItems = [];
    saveProject();
    renderArcBoardItems(arc);
    renderArcConnections(arc);
}

// ============================================
// ÉVÉNEMENTS CANVAS
// ============================================

// [MVVM : ViewModel]
// Gère l'événement mousedown sur le canvas (début du pan ou désélection).
function handleCanvasMouseDown(event) {
    // Clic sur le fond du canvas
    if (event.target.id === 'arcBoardCanvas' || event.target.id === 'arcBoardContent' ||
        event.target.classList.contains('arc-board-content') || event.target.id === 'arcBoardItems') {

        if (arcBoardState.activeTool === 'pan' || event.button === 1) {
            // Mode pan
            arcBoardState.isPanning = true;
            arcBoardState.panStartX = event.clientX - arcBoardState.panX;
            arcBoardState.panStartY = event.clientY - arcBoardState.panY;
            document.getElementById('arcBoardCanvas').classList.add('dragging');
        } else if (arcBoardState.activeTool === 'connect') {
            // Clic sur le fond en mode connexion = annuler
            cancelConnectionMode();
        } else {
            // Désélectionner
            deselectAllArcItems();
        }
    }
}

// [MVVM : ViewModel]
// Gère le mouvement de la souris sur le canvas (pan, drag d'item, resize).
function handleCanvasMouseMove(event) {
    if (arcBoardState.isPanning) {
        arcBoardState.panX = event.clientX - arcBoardState.panStartX;
        arcBoardState.panY = event.clientY - arcBoardState.panStartY;
        updateCanvasTransform();
    }

    if (arcBoardState.isDragging && arcBoardState.dragItem) {
        handleItemDrag(event);
    }

    if (arcBoardState.isResizing && arcBoardState.resizeItem) {
        handleColumnResizeDrag(event);
    }
}

// [MVVM : ViewModel]
// Gère la fin des interactions souris sur le canvas.
function handleCanvasMouseUp(event) {
    if (arcBoardState.isPanning) {
        arcBoardState.isPanning = false;
        document.getElementById('arcBoardCanvas')?.classList.remove('dragging');
    }

    if (arcBoardState.isDragging) {
        endItemDrag(event);
    }

    if (arcBoardState.isResizing) {
        endColumnResize(event);
    }
}

// [MVVM : ViewModel]
// Gère le zoom via la molette de la souris (avec Ctrl).
function handleCanvasWheel(event) {
    if (event.ctrlKey || event.metaKey) {
        event.preventDefault();
        const delta = event.deltaY > 0 ? -ARC_BOARD_CONFIG.zoomStep : ARC_BOARD_CONFIG.zoomStep;
        zoomArcBoard(delta > 0 ? 1 : -1);
    }
}

// [MVVM : ViewModel]
// Empêche le menu contextuel par défaut et affiche celui du canvas.
function handleCanvasContextMenu(event) {
    event.preventDefault();
    showCanvasContextMenu(event);
}

// [MVVM : View]
// Applique physiquement les transformations CSS (scale et translate) au DOM du canvas.
function updateCanvasTransform() {
    const content = document.getElementById('arcBoardContent');
    if (content) {
        content.style.transform = `scale(${arcBoardState.zoom}) translate(${arcBoardState.panX}px, ${arcBoardState.panY}px)`;
    }
}

// ============================================
// ZOOM
// ============================================

// [MVVM : Other]
// Modifie le facteur de zoom du board et met à jour l'affichage.
function zoomArcBoard(direction) {
    const newZoom = arcBoardState.zoom + (direction * ARC_BOARD_CONFIG.zoomStep);
    arcBoardState.zoom = Math.max(ARC_BOARD_CONFIG.minZoom, Math.min(ARC_BOARD_CONFIG.maxZoom, newZoom));

    updateCanvasTransform();

    const zoomLevel = document.getElementById('arcZoomLevel');
    if (zoomLevel) {
        zoomLevel.textContent = `${Math.round(arcBoardState.zoom * 100)}%`;
    }
}

// [MVVM : Other]
// Réinitialise le zoom à 100% et recentre le canvas.
function resetArcZoom() {
    arcBoardState.zoom = 1;
    arcBoardState.panX = 0;
    arcBoardState.panY = 0;
    updateCanvasTransform();

    const zoomLevel = document.getElementById('arcZoomLevel');
    if (zoomLevel) {
        zoomLevel.textContent = '100%';
    }
}

// ============================================
// OUTILS
// ============================================

// [MVVM : Other]
// Définit l'outil actif (sélection, pan, connexion) et met à jour les curseurs et boutons.
function setArcTool(tool) {
    arcBoardState.activeTool = tool;

    // Update toolbar buttons
    document.querySelectorAll('.arc-toolbar-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    const activeBtn = document.querySelector(`.arc-toolbar-btn[onclick="setArcTool('${tool}')"]`);
    if (activeBtn) activeBtn.classList.add('active');

    // Update cursor
    const canvas = document.getElementById('arcBoardCanvas');
    if (canvas) {
        canvas.classList.remove('dragging', 'connecting');
        if (tool === 'pan') canvas.style.cursor = 'grab';
        else if (tool === 'connect') canvas.style.cursor = 'crosshair';
        else canvas.style.cursor = 'default';
    }
}

// ============================================
// AJOUT D'ITEMS
// ============================================

// [MVVM : Other]
// Crée et ajoute un nouvel élément (colonne, note, image, etc.) sur le board.
function addArcItem(type) {
    const arc = project.narrativeArcs.find(a => a.id === arcBoardState.currentArcId);
    if (!arc) return;

    // Position au centre visible du canvas
    const canvas = document.getElementById('arcBoardCanvas');
    const rect = canvas.getBoundingClientRect();
    const x = (rect.width / 2 - arcBoardState.panX) / arcBoardState.zoom;
    const y = (rect.height / 2 - arcBoardState.panY) / arcBoardState.zoom;

    // Snap to grid
    const snappedX = ARC_BOARD_CONFIG.snapToGrid ? Math.round(x / ARC_BOARD_CONFIG.gridSize) * ARC_BOARD_CONFIG.gridSize : x;
    const snappedY = ARC_BOARD_CONFIG.snapToGrid ? Math.round(y / ARC_BOARD_CONFIG.gridSize) * ARC_BOARD_CONFIG.gridSize : y;

    let newItem = {
        id: 'item_' + Date.now(),
        type: type,
        x: snappedX,
        y: snappedY
    };

    switch (type) {
        case 'column':
            newItem.title = 'Nouvelle colonne';
            newItem.width = ARC_BOARD_CONFIG.defaultColumnWidth;
            newItem.cards = [];
            break;
        case 'note':
            newItem.content = '';
            newItem.width = 250;
            break;
        case 'image':
            newItem.src = '';
            newItem.width = 300;
            break;
        case 'link':
            newItem.url = '';
            newItem.title = '';
            break;
        case 'todo':
            newItem.title = 'Liste de tâches';
            newItem.items = [];
            break;
        case 'comment':
            newItem.content = '';
            break;
        case 'table':
            newItem.rows = 3;
            newItem.cols = 3;
            newItem.data = [];
            break;
    }

    arc.board.items.push(newItem);
    saveProject();

    renderArcBoardItems(arc);
    selectArcItem(null, newItem.id);
}

// [MVVM : Other]
// Ajoute une nouvelle carte d'un type spécifique à une colonne donnée.
function addCardToColumn(columnId, cardType = 'note') {
    const arc = project.narrativeArcs.find(a => a.id === arcBoardState.currentArcId);
    if (!arc) return;

    const column = arc.board.items.find(item => item.id === columnId);
    if (!column || column.type !== 'column') return;

    if (!column.cards) column.cards = [];

    const newCard = {
        id: 'card_' + Date.now(),
        type: cardType
    };

    switch (cardType) {
        case 'note':
            newCard.content = '';
            break;
        case 'image':
            newCard.src = '';
            newCard.caption = '';
            break;
        case 'link':
            newCard.url = '';
            newCard.title = '';
            break;
        case 'todo':
            newCard.title = '';
            newCard.items = [];
            break;
        case 'audio':
            newCard.url = '';
            break;
        case 'scene':
            newCard.sceneId = '';
            newCard.sceneTitle = '';
            newCard.breadcrumb = '';
            newCard.intensity = 3;
            newCard.status = 'development';
            newCard.notes = '';
            break;
    }

    column.cards.push(newCard);
    saveProject();
    renderArcBoardItems(arc);
}

// ============================================
// SÉLECTION
// ============================================

// [MVVM : Other]
// Gère la sélection d'un item sur le board (simple ou multi-sélection avec Ctrl).
function selectArcItem(event, itemId) {
    if (event) event.stopPropagation();

    // Si on est en mode connexion, gérer la connexion
    if (arcBoardState.activeTool === 'connect') {
        handleConnectionClick(itemId);
        return;
    }

    const arc = project.narrativeArcs.find(a => a.id === arcBoardState.currentArcId);
    if (!arc) return;

    // Multi-sélection avec Ctrl/Cmd
    if (event && (event.ctrlKey || event.metaKey)) {
        const index = arcBoardState.selectedItems.indexOf(itemId);
        if (index === -1) {
            arcBoardState.selectedItems.push(itemId);
        } else {
            arcBoardState.selectedItems.splice(index, 1);
        }
    } else {
        arcBoardState.selectedItems = [itemId];
    }

    // Update UI
    document.querySelectorAll('.arc-column, .arc-floating-item').forEach(el => {
        el.classList.remove('selected');
    });

    // Désélectionner les connexions
    document.querySelectorAll('.arc-connection-line').forEach(line => {
        line.classList.remove('selected');
    });

    arcBoardState.selectedItems.forEach(id => {
        const el = document.getElementById(`item-${id}`);
        if (el) el.classList.add('selected');
    });

    // Update context panel
    if (arcBoardState.selectedItems.length === 1) {
        const item = arc.board.items.find(i => i.id === itemId);
        if (item) renderArcContextForItem(item);
    }
}

// [MVVM : ViewModel]
// Sélectionne une carte (actuellement en sélectionnant sa colonne parente).
function selectArcCard(event, cardId, columnId) {
    event.stopPropagation();
    // Pour l'instant, sélectionner la colonne parente
    selectArcItem(event, columnId);
}

// [MVVM : Other]
// Désélectionne tous les éléments du board et réinitialise le panneau contextuel.
function deselectAllArcItems() {
    arcBoardState.selectedItems = [];

    document.querySelectorAll('.arc-column, .arc-floating-item').forEach(el => {
        el.classList.remove('selected');
    });

    document.querySelectorAll('.arc-connection-line').forEach(line => {
        line.classList.remove('selected');
    });

    // Reset context panel
    const arc = project.narrativeArcs.find(a => a.id === arcBoardState.currentArcId);
    if (arc) {
        const body = document.getElementById('arcContextBody');
        if (body) body.innerHTML = renderArcContextDefault(arc);
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }
}

// ============================================
// DRAG & DROP ITEMS
// ============================================

// [MVVM : ViewModel]
// Gère le début du drag d'un item (initialisation des positions).
function handleItemMouseDown(event, itemId) {
    // Ne pas intercepter si on clique sur des éléments interactifs
    if (event.target.classList.contains('arc-column-resize')) return;
    if (event.target.closest('.arc-connection-point')) return;
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA' || event.target.contentEditable === 'true') return;

    // Ne pas intercepter le drag des cartes dans les colonnes (qui utilisent l'API HTML5 drag & drop)
    const cardElement = event.target.closest('.arc-card');
    if (cardElement && cardElement.hasAttribute('draggable') && !event.target.closest('.arc-floating-item')) {
        // C'est une carte draggable dans une colonne, ne pas intercepter
        return;
    }

    event.stopPropagation();

    arcBoardState.isDragging = true;
    arcBoardState.dragItem = itemId;
    arcBoardState.dragStartX = event.clientX;
    arcBoardState.dragStartY = event.clientY;

    const el = document.getElementById(`item-${itemId}`);
    if (el) {
        el.classList.add('dragging');
        arcBoardState.dragItemStartX = parseInt(el.style.left) || 0;
        arcBoardState.dragItemStartY = parseInt(el.style.top) || 0;
    }
}

// [MVVM : ViewModel]
// Gère le déplacement d'un item pendant le drag.
function handleItemDrag(event) {
    if (!arcBoardState.isDragging || !arcBoardState.dragItem) return;

    const dx = (event.clientX - arcBoardState.dragStartX) / arcBoardState.zoom;
    const dy = (event.clientY - arcBoardState.dragStartY) / arcBoardState.zoom;

    let newX = arcBoardState.dragItemStartX + dx;
    let newY = arcBoardState.dragItemStartY + dy;

    // Snap to grid
    if (ARC_BOARD_CONFIG.snapToGrid) {
        newX = Math.round(newX / ARC_BOARD_CONFIG.gridSize) * ARC_BOARD_CONFIG.gridSize;
        newY = Math.round(newY / ARC_BOARD_CONFIG.gridSize) * ARC_BOARD_CONFIG.gridSize;
    }

    const el = document.getElementById(`item-${arcBoardState.dragItem}`);
    if (el) {
        el.style.left = `${newX}px`;
        el.style.top = `${newY}px`;
    }

    // Update connections in real-time
    const arc = project.narrativeArcs.find(a => a.id === arcBoardState.currentArcId);
    if (arc) renderArcConnections(arc);
}

// [MVVM : Other]
// Termine le drag d'un item et enregistre sa nouvelle position.
function endItemDrag(event) {
    if (!arcBoardState.isDragging || !arcBoardState.dragItem) return;

    const el = document.getElementById(`item-${arcBoardState.dragItem}`);
    if (el) {
        el.classList.remove('dragging');

        // Save new position
        const arc = project.narrativeArcs.find(a => a.id === arcBoardState.currentArcId);
        if (arc) {
            const item = arc.board.items.find(i => i.id === arcBoardState.dragItem);
            if (item) {
                item.x = parseInt(el.style.left) || 0;
                item.y = parseInt(el.style.top) || 0;
                saveProject();
            }
        }
    }

    arcBoardState.isDragging = false;
    arcBoardState.dragItem = null;
}

// ============================================
// RESIZE COLONNES
// ============================================

// [MVVM : ViewModel]
// Initialise le redimensionnement d'une colonne.
function startColumnResize(event, columnId) {
    event.stopPropagation();
    event.preventDefault();

    arcBoardState.isResizing = true;
    arcBoardState.resizeItem = columnId;
    arcBoardState.resizeStartX = event.clientX;

    const el = document.getElementById(`item-${columnId}`);
    if (el) {
        arcBoardState.resizeStartWidth = parseInt(el.style.width) || ARC_BOARD_CONFIG.defaultColumnWidth;
    }
}

// [MVVM : ViewModel]
// Gère le redimensionnement dynamique d'une colonne pendant le drag.
function handleColumnResizeDrag(event) {
    if (!arcBoardState.isResizing || !arcBoardState.resizeItem) return;

    const dx = (event.clientX - arcBoardState.resizeStartX) / arcBoardState.zoom;
    let newWidth = arcBoardState.resizeStartWidth + dx;

    newWidth = Math.max(ARC_BOARD_CONFIG.minColumnWidth, Math.min(ARC_BOARD_CONFIG.maxColumnWidth, newWidth));

    const el = document.getElementById(`item-${arcBoardState.resizeItem}`);
    if (el) {
        el.style.width = `${newWidth}px`;
    }
}

// [MVVM : Other]
// Termine le redimensionnement d'une colonne et enregistre sa largeur.
function endColumnResize(event) {
    if (!arcBoardState.isResizing || !arcBoardState.resizeItem) return;

    const el = document.getElementById(`item-${arcBoardState.resizeItem}`);
    if (el) {
        const arc = project.narrativeArcs.find(a => a.id === arcBoardState.currentArcId);
        if (arc) {
            const item = arc.board.items.find(i => i.id === arcBoardState.resizeItem);
            if (item) {
                item.width = parseInt(el.style.width) || ARC_BOARD_CONFIG.defaultColumnWidth;
                saveProject();
            }
        }
    }

    arcBoardState.isResizing = false;
    arcBoardState.resizeItem = null;
}

// ============================================
// MISE À JOUR DES ITEMS
// ============================================

// [MVVM : Other]
// Met à jour le titre d'un item dans les données du projet.
function updateArcItemTitle(itemId, title) {
    const arc = project.narrativeArcs.find(a => a.id === arcBoardState.currentArcId);
    if (!arc) return;

    const item = arc.board.items.find(i => i.id === itemId);
    if (item) {
        item.title = title;
        saveProject();
    }
}

// [MVVM : Other]
// Met à jour le contenu textuel d'un item.
function updateArcItemContent(itemId, content) {
    const arc = project.narrativeArcs.find(a => a.id === arcBoardState.currentArcId);
    if (!arc) return;

    const item = arc.board.items.find(i => i.id === itemId);
    if (item) {
        item.content = content;
        saveProject();
    }
}

// [MVVM : Other]
// Met à jour la largeur d'un item et rafraîchit l'affichage.
function updateArcItemWidth(itemId, width) {
    const arc = project.narrativeArcs.find(a => a.id === arcBoardState.currentArcId);
    if (!arc) return;

    const item = arc.board.items.find(i => i.id === itemId);
    if (item) {
        item.width = parseInt(width);
        saveProject();
        renderArcBoardItems(arc);
    }
}

// [MVVM : Other]
// Met à jour le titre global de l'arc narratif actuel.
function updateCurrentArcTitle(title) {
    const arc = project.narrativeArcs.find(a => a.id === arcBoardState.currentArcId);
    if (arc) {
        arc.title = title;
        arc.updated = new Date().toISOString();
        saveProject();
        renderArcsBoardSidebar();
    }
}

// ============================================
// CARTES - MISE À JOUR
// ============================================

// [MVVM : Other]
// Met à jour le contenu d'une carte spécifique.
function updateArcCardContent(columnId, cardId, content) {
    const arc = project.narrativeArcs.find(a => a.id === arcBoardState.currentArcId);
    if (!arc) return;

    const column = arc.board.items.find(i => i.id === columnId);
    if (!column || !column.cards) return;

    const card = column.cards.find(c => c.id === cardId);
    if (card) {
        card.content = content;
        saveProject();
    }
}

// [MVVM : Other]
// Met à jour le titre d'une carte spécifique.
function updateArcCardTitle(columnId, cardId, title) {
    const arc = project.narrativeArcs.find(a => a.id === arcBoardState.currentArcId);
    if (!arc) return;

    const column = arc.board.items.find(i => i.id === columnId);
    if (!column || !column.cards) return;

    const card = column.cards.find(c => c.id === cardId);
    if (card) {
        card.title = title;
        saveProject();
    }
}

// ============================================
// TO-DO FUNCTIONS
// ============================================

// [MVVM : Other]
// Ajoute une tâche à une carte de type to-do.
function addArcTodoItem(columnId, cardId) {
    const arc = project.narrativeArcs.find(a => a.id === arcBoardState.currentArcId);
    if (!arc) return;

    const column = arc.board.items.find(i => i.id === columnId);
    if (!column || !column.cards) return;

    const card = column.cards.find(c => c.id === cardId);
    if (!card) return;

    if (!card.items) card.items = [];
    card.items.push({ text: '', completed: false });

    saveProject();
    renderArcBoardItems(arc);
}

// [MVVM : Other]
// Bascule l'état de complétion d'une tâche dans une carte.
function toggleArcTodo(columnId, cardId, todoIndex) {
    const arc = project.narrativeArcs.find(a => a.id === arcBoardState.currentArcId);
    if (!arc) return;

    const column = arc.board.items.find(i => i.id === columnId);
    if (!column || !column.cards) return;

    const card = column.cards.find(c => c.id === cardId);
    if (!card || !card.items || !card.items[todoIndex]) return;

    card.items[todoIndex].completed = !card.items[todoIndex].completed;

    saveProject();
    renderArcBoardItems(arc);
}

// [MVVM : Other]
// Met à jour le texte d'une tâche dans une carte.
function updateArcTodoText(columnId, cardId, todoIndex, text) {
    const arc = project.narrativeArcs.find(a => a.id === arcBoardState.currentArcId);
    if (!arc) return;

    const column = arc.board.items.find(i => i.id === columnId);
    if (!column || !column.cards) return;

    const card = column.cards.find(c => c.id === cardId);
    if (!card || !card.items || !card.items[todoIndex]) return;

    card.items[todoIndex].text = text;
    saveProject();
}

// Floating todo functions
// [MVVM : Other]
// Ajoute une tâche à un item flottant de type to-do.
function addFloatingTodoItem(itemId) {
    const arc = project.narrativeArcs.find(a => a.id === arcBoardState.currentArcId);
    if (!arc) return;

    const item = arc.board.items.find(i => i.id === itemId);
    if (!item) return;

    if (!item.items) item.items = [];
    item.items.push({ text: '', completed: false });

    saveProject();
    renderArcBoardItems(arc);
}

// [MVVM : Other]
// Bascule l'état de complétion d'une tâche dans un item flottant.
function toggleFloatingTodo(itemId, todoIndex) {
    const arc = project.narrativeArcs.find(a => a.id === arcBoardState.currentArcId);
    if (!arc) return;

    const item = arc.board.items.find(i => i.id === itemId);
    if (!item || !item.items || !item.items[todoIndex]) return;

    item.items[todoIndex].completed = !item.items[todoIndex].completed;

    saveProject();
    renderArcBoardItems(arc);
}

// [MVVM : Other]
// Met à jour le texte d'une tâche dans un item flottant.
function updateFloatingTodoText(itemId, todoIndex, text) {
    const arc = project.narrativeArcs.find(a => a.id === arcBoardState.currentArcId);
    if (!arc) return;

    const item = arc.board.items.find(i => i.id === itemId);
    if (!item || !item.items || !item.items[todoIndex]) return;

    item.items[todoIndex].text = text;
    saveProject();
}

// ============================================
// TABLE FUNCTIONS
// ============================================

// [MVVM : Other]
// Met à jour la valeur d'une cellule dans un tableau.
function updateArcTableCell(itemId, row, col, value) {
    const arc = project.narrativeArcs.find(a => a.id === arcBoardState.currentArcId);
    if (!arc) return;

    const item = arc.board.items.find(i => i.id === itemId);
    if (!item) return;

    if (!item.data) item.data = [];
    if (!item.data[row]) item.data[row] = [];

    item.data[row][col] = value;
    saveProject();
}

// [MVVM : Other]
// Modifie les dimensions (lignes ou colonnes) d'un tableau.
function updateArcTableSize(itemId, dimension, value) {
    const arc = project.narrativeArcs.find(a => a.id === arcBoardState.currentArcId);
    if (!arc) return;

    const item = arc.board.items.find(i => i.id === itemId);
    if (!item) return;

    item[dimension] = parseInt(value);
    saveProject();
    renderArcBoardItems(arc);
}

// ============================================
// LINK FUNCTIONS
// ============================================

// [MVVM : Other]
// Gère l'entrée d'une URL pour une carte lien dans une colonne.
function handleLinkInput(event, columnId, cardId) {
    if (event.key !== 'Enter') return;

    const url = event.target.value.trim();
    if (!url) return;

    const arc = project.narrativeArcs.find(a => a.id === arcBoardState.currentArcId);
    if (!arc) return;

    const column = arc.board.items.find(i => i.id === columnId);
    if (!column || !column.cards) return;

    const card = column.cards.find(c => c.id === cardId);
    if (!card) return;

    card.url = url;
    card.title = url; // Could be fetched from URL later

    saveProject();
    renderArcBoardItems(arc);
}

// [MVVM : Other]
// Gère l'entrée d'une URL pour un item lien flottant.
function handleFloatingLinkInput(event, itemId) {
    if (event.key !== 'Enter') return;

    const url = event.target.value.trim();
    if (!url) return;

    const arc = project.narrativeArcs.find(a => a.id === arcBoardState.currentArcId);
    if (!arc) return;

    const item = arc.board.items.find(i => i.id === itemId);
    if (!item) return;

    item.url = url;
    item.title = url;

    saveProject();
    renderArcBoardItems(arc);
}

// ============================================
// IMAGE UPLOAD
// ============================================

// [MVVM : View]
// Déclenche le clic sur l'input file masqué pour l'upload global au board.
function triggerArcUpload() {
    document.getElementById('arcFileInput')?.click();
}

// [MVVM : View]
// Déclenche l'upload d'image pour un item spécifique.
function triggerItemImageUpload(itemId) {
    const input = document.getElementById('arcFileInput');
    if (input) {
        input.dataset.targetItem = itemId;
        input.dataset.targetType = 'item';
        input.click();
    }
}

// [MVVM : View]
// Déclenche l'upload d'image pour une carte spécifique dans une colonne.
function triggerCardImageUpload(columnId, cardId) {
    const input = document.getElementById('arcFileInput');
    if (input) {
        input.dataset.targetColumn = columnId;
        input.dataset.targetCard = cardId;
        input.dataset.targetType = 'card';
        input.click();
    }
}

// [MVVM : Other]
// Lit le fichier uploadé et met à jour l'élément cible (item ou carte) avec l'image Base64.
function handleArcFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        const src = e.target.result;
        const input = event.target;

        if (input.dataset.targetType === 'card') {
            updateCardImage(input.dataset.targetColumn, input.dataset.targetCard, src);
        } else if (input.dataset.targetType === 'item') {
            updateItemImage(input.dataset.targetItem, src);
        } else {
            // Créer un nouveau item image
            addArcItem('image');
            setTimeout(() => {
                const arc = project.narrativeArcs.find(a => a.id === arcBoardState.currentArcId);
                if (arc && arc.board.items.length > 0) {
                    const lastItem = arc.board.items[arc.board.items.length - 1];
                    if (lastItem.type === 'image') {
                        lastItem.src = src;
                        saveProject();
                        renderArcBoardItems(arc);
                    }
                }
            }, 100);
        }

        // Reset input
        input.value = '';
        delete input.dataset.targetItem;
        delete input.dataset.targetColumn;
        delete input.dataset.targetCard;
        delete input.dataset.targetType;
    };
    reader.readAsDataURL(file);
}

// [MVVM : Other]
// Met à jour la source d'image d'un item flottant et enregistre.
function updateItemImage(itemId, src) {
    const arc = project.narrativeArcs.find(a => a.id === arcBoardState.currentArcId);
    if (!arc) return;

    const item = arc.board.items.find(i => i.id === itemId);
    if (item) {
        item.src = src;
        saveProject();
        renderArcBoardItems(arc);
    }
}

// [MVVM : Other]
// Met à jour la source d'image d'une carte dans une colonne et enregistre.
function updateCardImage(columnId, cardId, src) {
    const arc = project.narrativeArcs.find(a => a.id === arcBoardState.currentArcId);
    if (!arc) return;

    const column = arc.board.items.find(i => i.id === columnId);
    if (!column || !column.cards) return;

    const card = column.cards.find(c => c.id === cardId);
    if (card) {
        card.src = src;
        saveProject();
        renderArcBoardItems(arc);
    }
}

// ============================================
// SUPPRESSION
// ============================================

// [MVVM : Other]
// Supprime un item du board ainsi que toutes ses connexions associées.
function deleteArcItem(itemId) {
    const arc = project.narrativeArcs.find(a => a.id === arcBoardState.currentArcId);
    if (!arc) return;

    // Supprimer l'item
    arc.board.items = arc.board.items.filter(i => i.id !== itemId);

    // Supprimer les connexions liées
    if (arc.board.connections) {
        arc.board.connections = arc.board.connections.filter(c => c.from !== itemId && c.to !== itemId);
    }

    arcBoardState.selectedItems = arcBoardState.selectedItems.filter(id => id !== itemId);

    saveProject();
    renderArcBoardItems(arc);
    renderArcConnections(arc);
    deselectAllArcItems();
}

// ============================================
// FORMATAGE TEXTE
// ============================================

// [MVVM : Other]
// Applique une commande de formatage de texte (gras, italique, etc.) au texte sélectionné.
function formatArcText(command) {
    document.execCommand(command, false, null);
}

// [MVVM : Other]
// Insère une balise code dans l'éditeur de texte actuel.
function insertArcCode() {
    document.execCommand('insertHTML', false, '<code></code>');
}

// ============================================
// DRAG & DROP BIDIRECTIONNEL
// ============================================

let dragData = {
    type: null,        // 'card' ou 'floating'
    itemId: null,      // ID de l'élément flottant OU de la carte
    sourceColumnId: null, // ID de la colonne source (si carte)
    element: null      // Référence à l'élément DOM
};

// Démarrer le drag d'une carte (dans une colonne)
// [MVVM : ViewModel]
// Initialise le transfert de données pour le drag d'une carte.
function handleCardDragStart(event, cardId, columnId) {
    event.stopPropagation();

    dragData = {
        type: 'card',
        itemId: cardId,
        sourceColumnId: columnId,
        element: event.target
    };

    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', JSON.stringify({
        type: 'card',
        cardId: cardId,
        columnId: columnId
    }));

    event.target.classList.add('dragging');

    // Montrer les zones de drop
    setTimeout(() => {
        document.querySelectorAll('.arc-column-body').forEach(el => {
            el.classList.add('drop-target');
        });
        document.getElementById('arcBoardContent')?.classList.add('drop-zone-active');
    }, 0);
}

// Démarrer le drag d'un élément flottant
// [MVVM : ViewModel]
// Initialise le transfert de données pour le drag d'un item flottant.
function handleFloatingDragStart(event, itemId) {
    event.stopPropagation();

    dragData = {
        type: 'floating',
        itemId: itemId,
        sourceColumnId: null,
        element: event.target.closest('.arc-floating-item')
    };

    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', JSON.stringify({
        type: 'floating',
        itemId: itemId
    }));

    if (dragData.element) {
        dragData.element.classList.add('dragging');
    }

    // Montrer les zones de drop (colonnes)
    setTimeout(() => {
        document.querySelectorAll('.arc-column-body').forEach(el => {
            el.classList.add('drop-target');
        });
    }, 0);
}

// Fin du drag
function handleCardDragEnd(event) {
    event.target.classList.remove('dragging');

    // Nettoyer les zones de drop
    document.querySelectorAll('.arc-column-body').forEach(el => {
        el.classList.remove('drop-target', 'drop-hover');
    });
    document.getElementById('arcBoardContent')?.classList.remove('drop-zone-active');
    document.getElementById('arcBoardCanvas')?.classList.remove('drop-hover');

    dragData = { type: null, itemId: null, sourceColumnId: null, element: null };
}

// [MVVM : View]
// Réinitialise les styles visuels après le drag d'un item flottant.
function handleFloatingDragEnd(event) {
    if (dragData.element) {
        dragData.element.classList.remove('dragging');
    }

    document.querySelectorAll('.arc-column-body').forEach(el => {
        el.classList.remove('drop-target', 'drop-hover');
    });
    document.getElementById('arcBoardCanvas')?.classList.remove('drop-hover');

    dragData = { type: null, itemId: null, sourceColumnId: null, element: null };
}

// Dragover sur une colonne
// [MVVM : View]
// Gère le survol d'une colonne pendant un drag (feedback visuel).
function handleCardDragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    event.currentTarget.classList.add('drop-hover');
}

// [MVVM : View]
// Gère la sortie de survol d'une colonne pendant un drag.
function handleCardDragLeave(event) {
    event.currentTarget.classList.remove('drop-hover');
}

// Drop sur une colonne - accepte cartes ET éléments flottants
// [MVVM : Other]
// Gère le drop sur une colonne (déplacement de carte ou conversion d'item flottant en carte).
function handleCardDrop(event, targetColumnId) {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.classList.remove('drop-hover');

    try {
        const arc = project.narrativeArcs.find(a => a.id === arcBoardState.currentArcId);
        if (!arc) return;

        const targetColumn = arc.board.items.find(i => i.id === targetColumnId);
        if (!targetColumn) return;

        if (!targetColumn.cards) targetColumn.cards = [];

        if (dragData.type === 'card') {
            // Déplacer une carte d'une colonne à une autre
            if (dragData.sourceColumnId === targetColumnId) return; // Même colonne

            const sourceColumn = arc.board.items.find(i => i.id === dragData.sourceColumnId);
            if (!sourceColumn || !sourceColumn.cards) return;

            const cardIndex = sourceColumn.cards.findIndex(c => c.id === dragData.itemId);
            if (cardIndex === -1) return;

            const [card] = sourceColumn.cards.splice(cardIndex, 1);
            targetColumn.cards.push(card);

            // Si c'est une carte scene, mettre à jour le columnId dans arc.scenePresence
            if (card.type === 'scene' && card.sceneId && arc.scenePresence) {
                const presence = arc.scenePresence.find(p => p.sceneId == card.sceneId);
                if (presence) {
                    presence.columnId = targetColumnId;
                }
            }

        } else if (dragData.type === 'floating') {
            // Convertir un élément flottant en carte
            const floatingIndex = arc.board.items.findIndex(i => i.id === dragData.itemId);
            if (floatingIndex === -1) return;

            const [floatingItem] = arc.board.items.splice(floatingIndex, 1);

            // Supprimer les connexions liées à cet élément
            if (arc.board.connections) {
                arc.board.connections = arc.board.connections.filter(c =>
                    c.from !== floatingItem.id && c.to !== floatingItem.id
                );
            }

            // Convertir en carte
            const newCard = convertFloatingToCard(floatingItem);
            targetColumn.cards.push(newCard);
        }

        saveProject();
        renderArcBoardItems(arc);
        renderArcConnections(arc);
    } finally {
        // TOUJOURS réinitialiser dragData, même en cas d'erreur ou de return précoce
        dragData = { type: null, itemId: null, sourceColumnId: null, element: null };
    }
}

// Drop sur le canvas - convertir une carte en élément flottant
// [MVVM : Other]
// Gère le drop sur le canvas (conversion d'une carte en item flottant à la position du drop).
function handleCanvasDrop(event) {
    // Ne pas traiter si on drop sur une colonne
    if (event.target.closest('.arc-column-body')) return;
    if (event.target.closest('.arc-column')) return;

    event.preventDefault();

    // Retirer le feedback visuel
    document.getElementById('arcBoardCanvas')?.classList.remove('drop-hover');

    try {
        if (dragData.type !== 'card') return;

        const arc = project.narrativeArcs.find(a => a.id === arcBoardState.currentArcId);
        if (!arc) return;

        const sourceColumn = arc.board.items.find(i => i.id === dragData.sourceColumnId);
        if (!sourceColumn || !sourceColumn.cards) return;

        const cardIndex = sourceColumn.cards.findIndex(c => c.id === dragData.itemId);
        if (cardIndex === -1) return;

        const [card] = sourceColumn.cards.splice(cardIndex, 1);

        // Calculer la position du drop
        const content = document.getElementById('arcBoardContent');
        const contentRect = content.getBoundingClientRect();
        const x = (event.clientX - contentRect.left) / arcBoardState.zoom;
        const y = (event.clientY - contentRect.top) / arcBoardState.zoom;

        // Snap to grid
        const snappedX = ARC_BOARD_CONFIG.snapToGrid ? Math.round(x / ARC_BOARD_CONFIG.gridSize) * ARC_BOARD_CONFIG.gridSize : x;
        const snappedY = ARC_BOARD_CONFIG.snapToGrid ? Math.round(y / ARC_BOARD_CONFIG.gridSize) * ARC_BOARD_CONFIG.gridSize : y;

        // Convertir la carte en élément flottant
        const floatingItem = convertCardToFloating(card, snappedX, snappedY);
        arc.board.items.push(floatingItem);

        saveProject();
        renderArcBoardItems(arc);
    } finally {
        // TOUJOURS réinitialiser dragData, même en cas d'erreur ou de return précoce
        dragData = { type: null, itemId: null, sourceColumnId: null, element: null };
    }
}

// Dragover sur le canvas
// [MVVM : View]
// Gère le dragover sur le canvas pour permettre le drop de cartes.
function handleCanvasDragOver(event) {
    // Permettre le drop seulement pour les cartes (pas les éléments flottants)
    if (dragData.type === 'card') {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';

        // Ne pas montrer le feedback si on est sur une colonne
        if (!event.target.closest('.arc-column')) {
            document.getElementById('arcBoardCanvas')?.classList.add('drop-hover');
        }
    }
}

// Dragleave sur le canvas
// [MVVM : View]
// Réinitialise le feedback visuel quand le drag quitte le canvas.
function handleCanvasDragLeave(event) {
    // Vérifier qu'on quitte vraiment le canvas
    if (!event.relatedTarget || !event.currentTarget.contains(event.relatedTarget)) {
        document.getElementById('arcBoardCanvas')?.classList.remove('drop-hover');
    }
}

// Convertir un élément flottant en carte
// [MVVM : Model]
// Logique de conversion : transforme les données d'un item flottant en structure de carte.
function convertFloatingToCard(floatingItem) {
    const card = {
        id: 'card_' + Date.now(),
        type: floatingItem.type
    };

    switch (floatingItem.type) {
        case 'note':
            card.content = floatingItem.content || '';
            break;
        case 'comment':
            card.type = 'note'; // Les commentaires deviennent des notes
            card.content = floatingItem.content || '';
            break;
        case 'todo':
            card.title = floatingItem.title || '';
            card.items = floatingItem.items || [];
            break;
        case 'image':
            card.src = floatingItem.src || '';
            card.caption = floatingItem.caption || '';
            break;
        case 'link':
            card.url = floatingItem.url || '';
            card.title = floatingItem.title || '';
            break;
        case 'table':
            card.type = 'note';
            card.content = 'Tableau converti';
            break;
        default:
            card.type = 'note';
            card.content = floatingItem.content || '';
    }

    return card;
}

// Convertir une carte en élément flottant
// [MVVM : Model]
// Logique de conversion : transforme les données d'une carte en structure d'item flottant.
function convertCardToFloating(card, x, y) {
    const floatingItem = {
        id: 'item_' + Date.now(),
        type: card.type,
        x: x,
        y: y
    };

    switch (card.type) {
        case 'note':
            floatingItem.content = card.content || '';
            floatingItem.width = 250;
            break;
        case 'todo':
            floatingItem.title = card.title || '';
            floatingItem.items = card.items || [];
            break;
        case 'image':
            floatingItem.src = card.src || '';
            floatingItem.width = 300;
            break;
        case 'link':
            floatingItem.url = card.url || '';
            floatingItem.title = card.title || '';
            break;
        default:
            floatingItem.type = 'note';
            floatingItem.content = card.content || '';
            floatingItem.width = 250;
    }

    return floatingItem;
}

// ============================================
// MENU CONTEXTUEL
// ============================================

// [MVVM : View]
// Affiche le menu contextuel personnalisé sur le canvas.
function showCanvasContextMenu(event) {
    removeContextMenu();

    const menu = document.createElement('div');
    menu.className = 'arc-context-menu';
    menu.id = 'arcContextMenu';
    menu.style.left = `${event.clientX}px`;
    menu.style.top = `${event.clientY}px`;

    menu.innerHTML = `
        <div class="arc-context-menu-item" onclick="addArcItemAtPosition(${event.clientX}, ${event.clientY}, 'column')">
            <i data-lucide="columns-3"></i> Ajouter une colonne
        </div>
        <div class="arc-context-menu-item" onclick="addArcItemAtPosition(${event.clientX}, ${event.clientY}, 'note')">
            <i data-lucide="file-text"></i> Ajouter une note
        </div>
        <div class="arc-context-menu-item" onclick="addArcItemAtPosition(${event.clientX}, ${event.clientY}, 'image')">
            <i data-lucide="image"></i> Ajouter une image
        </div>
        <div class="arc-context-menu-separator"></div>
        <div class="arc-context-menu-item" onclick="pasteArcItem()">
            <i data-lucide="clipboard"></i> Coller
        </div>
        <div class="arc-context-menu-separator"></div>
        <div class="arc-context-menu-item" onclick="resetArcZoom()">
            <i data-lucide="maximize-2"></i> Réinitialiser le zoom
        </div>
    `;

    document.body.appendChild(menu);
    if (typeof lucide !== 'undefined') lucide.createIcons();

    // Fermer au clic ailleurs
    setTimeout(() => {
        document.addEventListener('click', removeContextMenu, { once: true });
    }, 10);
}

// [MVVM : View]
// Affiche le menu contextuel personnalisé pour un arc spécifique dans la sidebar.
function showArcContextMenu(event, arcId) {
    removeContextMenu();

    const menu = document.createElement('div');
    menu.className = 'arc-context-menu';
    menu.id = 'arcContextMenu';
    menu.style.left = `${event.clientX}px`;
    menu.style.top = `${event.clientY}px`;

    menu.innerHTML = `
        <div class="arc-context-menu-item" onclick="openArcBoard('${arcId}')">
            <i data-lucide="layout-dashboard"></i> Ouvrir
        </div>
        
        <div class="arc-context-menu-item" onclick="showInlineArcForm('${arcId}')">
            <i data-lucide="settings"></i> Modifier
        </div>
        
        <div class="arc-context-menu-item" onclick="renameArc('${arcId}')">
            <i data-lucide="pencil"></i> Renommer
        </div>
        <div class="arc-context-menu-item" onclick="duplicateArc('${arcId}')">
            <i data-lucide="copy"></i> Dupliquer
        </div>
        <div class="arc-context-menu-separator"></div>
        <div class="arc-context-menu-item danger" onclick="deleteArc('${arcId}')">
            <i data-lucide="trash-2"></i> Supprimer
        </div>
    `;

    document.body.appendChild(menu);
    if (typeof lucide !== 'undefined') lucide.createIcons();

    setTimeout(() => {
        document.addEventListener('click', removeContextMenu, { once: true });
    }, 10);
}

// [MVVM : View]
// Supprime le menu contextuel personnalisé du DOM.
function removeContextMenu() {
    const menu = document.getElementById('arcContextMenu');
    if (menu) menu.remove();
}

// [MVVM : Other]
// Ajoute un nouvel item sur le board à une position spécifique (via menu contextuel).
function addArcItemAtPosition(clientX, clientY, type) {
    removeContextMenu();

    const arc = project.narrativeArcs.find(a => a.id === arcBoardState.currentArcId);
    if (!arc) return;

    const canvasRect = document.getElementById('arcBoardContent').getBoundingClientRect();
    const x = (clientX - canvasRect.left) / arcBoardState.zoom;
    const y = (clientY - canvasRect.top) / arcBoardState.zoom;

    const snappedX = ARC_BOARD_CONFIG.snapToGrid ? Math.round(x / ARC_BOARD_CONFIG.gridSize) * ARC_BOARD_CONFIG.gridSize : x;
    const snappedY = ARC_BOARD_CONFIG.snapToGrid ? Math.round(y / ARC_BOARD_CONFIG.gridSize) * ARC_BOARD_CONFIG.gridSize : y;

    let newItem = {
        id: 'item_' + Date.now(),
        type: type,
        x: snappedX,
        y: snappedY
    };

    switch (type) {
        case 'column':
            newItem.title = 'Nouvelle colonne';
            newItem.width = ARC_BOARD_CONFIG.defaultColumnWidth;
            newItem.cards = [];
            break;
        case 'note':
            newItem.content = '';
            newItem.width = 250;
            break;
        case 'image':
            newItem.src = '';
            newItem.width = 300;
            break;
    }

    arc.board.items.push(newItem);
    saveProject();
    renderArcBoardItems(arc);
}

// ============================================
// GESTION DES ARCS
// ============================================

// [MVVM : Other]
// Supprime définitivement un arc narratif après confirmation.
function deleteArc(arcId) {
    removeContextMenu();

    const arc = project.narrativeArcs.find(a => a.id === arcId);
    if (!arc) return;

    if (!confirm(`Voulez-vous vraiment supprimer l'arc "${arc.title}" ?\n\nCette action est irréversible.`)) {
        return;
    }

    project.narrativeArcs = project.narrativeArcs.filter(a => a.id !== arcId);

    if (arcBoardState.currentArcId === arcId) {
        arcBoardState.currentArcId = null;
        renderArcsWelcomeBoard();
    }

    saveProject();
    renderArcsBoardSidebar();
}

// [MVVM : Other]
// Duplique un arc narratif complet avec de nouveaux identifiants pour tous ses éléments.
function duplicateArc(arcId) {
    removeContextMenu();

    const arc = project.narrativeArcs.find(a => a.id === arcId);
    if (!arc) return;

    const newArc = JSON.parse(JSON.stringify(arc));
    newArc.id = 'arc_' + Date.now();
    newArc.title = arc.title + ' (copie)';
    newArc.created = new Date().toISOString();
    newArc.updated = new Date().toISOString();

    // Regen IDs for items and connections
    const idMap = {};
    newArc.board.items.forEach(item => {
        const oldId = item.id;
        item.id = 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        idMap[oldId] = item.id;

        if (item.cards) {
            item.cards.forEach(card => {
                card.id = 'card_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            });
        }
    });

    if (newArc.board.connections) {
        newArc.board.connections.forEach(conn => {
            conn.id = 'conn_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            conn.from = idMap[conn.from] || conn.from;
            conn.to = idMap[conn.to] || conn.to;
        });
    }

    project.narrativeArcs.push(newArc);
    saveProject();
    renderArcsBoardSidebar();
    openArcBoard(newArc.id);
}

// [MVVM : Other]
// Renomme un arc narratif via une boîte de dialogue prompt.
function renameArc(arcId) {
    removeContextMenu();

    const arc = project.narrativeArcs.find(a => a.id === arcId);
    if (!arc) return;

    const newTitle = prompt('Nouveau nom de l\'arc:', arc.title);
    if (newTitle && newTitle.trim()) {
        arc.title = newTitle.trim();
        arc.updated = new Date().toISOString();
        saveProject();
        renderArcsBoardSidebar();
    }
}

// ============================================
// CATÉGORIES CUSTOM
// ============================================

function showAddCategoryModal() {
    showInlineCategoryForm();
}

// [MVVM : View]
// (Ancien système) Ferme la modale d'ajout de catégorie.
function closeAddCategoryModal(event) {
    if (event && event.target !== event.currentTarget) return;
    const modal = document.getElementById('addCategoryModal');
    if (modal) modal.remove();
}

// [MVVM : Other]
// (Ancien système) Valide et crée une nouvelle catégorie via modale.
function confirmAddCategory() {
    const name = document.getElementById('newCategoryName').value.trim();
    const color = document.getElementById('newCategoryColor').value;

    if (!name) {
        alert('Veuillez entrer un nom pour la catégorie');
        return;
    }

    // Créer une clé à partir du nom
    const key = name.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_');

    if (!project.arcCategories) project.arcCategories = {};

    project.arcCategories[key] = {
        label: name,
        icon: 'folder',
        color: color,
        custom: true
    };

    saveProject();
    closeAddCategoryModal();
    renderArcsBoardSidebar();
}

// ============================================
// WELCOME VIEW
// ============================================

// [MVVM : View]
// Affiche l'écran d'accueil du mode Arc Board si aucun arc n'est ouvert.
function renderArcsWelcomeBoard() {
    const view = document.getElementById('editorView');
    if (!view) return;

    initArcBoard();
    const arcs = project.narrativeArcs || [];

    if (arcs.length === 0) {
        view.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon"><i data-lucide="layout-dashboard"></i></div>
                <div class="empty-state-title">Gérez vos arcs narratifs</div>
                <div class="empty-state-text">
                    Créez des boards visuels pour planifier vos arcs narratifs,<br>
                    organiser vos idées et suivre la progression de votre histoire.
                </div>
                <button class="btn btn-primary" onclick="createNewArcBoard()">
                    <i data-lucide="sparkles"></i> Créer votre premier arc
                </button>
            </div>
        `;
    } else {
        view.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon"><i data-lucide="layout-dashboard"></i></div>
                <div class="empty-state-title">Sélectionnez un arc</div>
                <div class="empty-state-text">
                    Choisissez un arc dans la barre latérale<br>
                    ou créez-en un nouveau.
                </div>
                <button class="btn btn-primary" onclick="createNewArcBoard()">
                    <i data-lucide="plus"></i> Nouvel arc
                </button>
            </div>
        `;
    }

    if (typeof lucide !== 'undefined') lucide.createIcons();
}

// ============================================
// KEYBOARD SHORTCUTS
// ============================================

document.addEventListener('keydown', function (event) {
    // Ne pas interférer si on édite du texte
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA' || event.target.contentEditable === 'true') {
        return;
    }

    // Vérifier qu'on est dans le mode arc board
    if (!arcBoardState.currentArcId) return;

    // Delete/Backspace - supprimer sélection
    if (event.key === 'Delete' || event.key === 'Backspace') {
        if (arcBoardState.selectedItems.length > 0) {
            event.preventDefault();
            arcBoardState.selectedItems.forEach(id => {
                // Check if it's a connection
                const arc = project.narrativeArcs.find(a => a.id === arcBoardState.currentArcId);
                if (arc?.board.connections?.some(c => c.id === id)) {
                    deleteSelectedConnection();
                } else {
                    deleteArcItem(id);
                }
            });
        }
    }

    // Escape - cancel current action
    if (event.key === 'Escape') {
        if (arcBoardState.isConnecting) {
            cancelConnection();
        } else {
            deselectAllArcItems();
        }
    }

    // Ctrl+A - select all
    if ((event.ctrlKey || event.metaKey) && event.key === 'a') {
        event.preventDefault();
        const arc = project.narrativeArcs.find(a => a.id === arcBoardState.currentArcId);
        if (arc) {
            arcBoardState.selectedItems = arc.board.items.map(i => i.id);
            arc.board.items.forEach(item => {
                const el = document.getElementById(`item-${item.id}`);
                if (el) el.classList.add('selected');
            });
        }
    }

    // Ctrl+C - copy
    if ((event.ctrlKey || event.metaKey) && event.key === 'c') {
        if (arcBoardState.selectedItems.length > 0) {
            event.preventDefault();
            copySelectedItems();
        }
    }

    // Ctrl+V - paste
    if ((event.ctrlKey || event.metaKey) && event.key === 'v') {
        if (arcBoardState.clipboard) {
            event.preventDefault();
            pasteArcItem();
        }
    }

    // Ctrl+Z - undo
    if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey) {
        event.preventDefault();
        if (typeof EventBus !== 'undefined') EventBus.emit('history:undo');
        else if (typeof undo === 'function') undo();
    }

    // Ctrl+Y ou Ctrl+Shift+Z - redo
    if ((event.ctrlKey || event.metaKey) && (event.key === 'y' || (event.key === 'z' && event.shiftKey))) {
        event.preventDefault();
        if (typeof EventBus !== 'undefined') EventBus.emit('history:redo');
        else if (typeof redo === 'function') redo();
    }
});

// ============================================
// COPY/PASTE
// ============================================

// [MVVM : Other]
// Copie les éléments sélectionnés dans le presse-papier interne.
function copySelectedItems() {
    const arc = project.narrativeArcs.find(a => a.id === arcBoardState.currentArcId);
    if (!arc) return;

    const itemsToCopy = arc.board.items.filter(i => arcBoardState.selectedItems.includes(i.id));
    arcBoardState.clipboard = JSON.parse(JSON.stringify(itemsToCopy));
}

// [MVVM : Other]
// Colle les éléments du presse-papier sur le board avec un décalage.
function pasteArcItem() {
    removeContextMenu();

    if (!arcBoardState.clipboard || arcBoardState.clipboard.length === 0) return;

    const arc = project.narrativeArcs.find(a => a.id === arcBoardState.currentArcId);
    if (!arc) return;

    const offset = 40;

    arcBoardState.clipboard.forEach(item => {
        const newItem = JSON.parse(JSON.stringify(item));
        newItem.id = 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        newItem.x += offset;
        newItem.y += offset;

        if (newItem.cards) {
            newItem.cards.forEach(card => {
                card.id = 'card_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            });
        }

        arc.board.items.push(newItem);
    });

    saveProject();
    renderArcBoardItems(arc);
}

// ============================================
// INTÉGRATION AVEC L'ANCIEN SYSTÈME
// ============================================

// Override des fonctions existantes pour utiliser le nouveau système
// [MVVM : View]
// Intégration : Redirige vers le nouveau système de rendu de la liste des arcs.
function renderArcsList() {
    renderArcsBoardSidebar();
}

// [MVVM : View]
// Intégration : Redirige vers le nouveau système d'accueil.
function renderArcsWelcome() {
    renderArcsWelcomeBoard();
}

// [MVVM : ViewModel]
// Intégration : Redirige vers la création d'arc du nouveau système.
function createNewArc() {
    showInlineArcForm();
}

// [MVVM : ViewModel]
// Intégration : Redirige vers l'ouverture de board du nouveau système.
function openArcDetail(arcId) {
    openArcBoard(arcId);
}