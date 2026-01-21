// ============================================
// NOUVELLES FONCTIONNALITÉS DE VISUALISATION
// ============================================

// Initialiser les données de visualisation si elles n'existent pas
if (!project.mindmapNodes) project.mindmapNodes = [];
if (!project.plotPoints) project.plotPoints = [];
if (!project.relationships) project.relationships = [];
if (!project.mapLocations) project.mapLocations = [];
if (!project.mapImage) project.mapImage = null;
if (!project.visualTimeline) project.visualTimeline = [];

// ============================================
// ========================================
// MINDMAP SYSTEM - Custom drag & drop mindmaps
// ========================================

let mindmapState = {
    zoom: 1,
    panX: 0,
    panY: 0,
    isDragging: false,
    draggedNode: null,
    selectedNode: null,
    isPanning: false,
    lastMouseX: 0,
    lastMouseY: 0,
    linkStart: null,
    libraryCollapsed: false,
    activeLibraryTab: 'characters'
};

// [MVVM : View]
// Gère l'affichage de la liste des mindmaps dans la barre latérale.
function renderMindmapView() {
    const container = document.getElementById('mindmapList');
    if (!container) return;

    // Initialiser mindmaps si nécessaire
    if (!project.mindmaps) {
        project.mindmaps = [];
    }

    container.innerHTML = `
                <div class="mindmap-sidebar-header">
                    <h3 style="margin-bottom: 0.5rem; font-size: 1.1rem;">🗺️ Mindmaps</h3>
                    <button class="btn btn-small" onclick="createNewMindmap()" style="width: 100%;">
                        ➕ Nouvelle Mindmap
                    </button>
                </div>
                <div class="mindmap-list">
                    ${project.mindmaps.length === 0 ? `
                        <div style="padding: 1rem; text-align: center; color: var(--text-muted); font-size: 0.9rem;">
                            Aucune mindmap.<br>Créez-en une !
                        </div>
                    ` : project.mindmaps.map(mm => `
                        <div class="mindmap-item ${currentMindmapId === mm.id ? 'active' : ''}" 
                             onclick="selectMindmap(${mm.id})">
                            <span style="flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                                ${mm.title}
                            </span>
                            <span onclick="event.stopPropagation(); deleteMindmap(${mm.id})" 
                                  style="cursor: pointer; color: var(--accent-red); opacity: 0.7; padding: 0 0.5rem;"
                                  title="Supprimer">×</span>
                        </div>
                    `).join('')}
                </div>
            `;

    renderMindmapCanvas();
}

// [MVVM : ViewModel]
// Commande pour créer une nouvelle mindmap avec un titre saisi par l'utilisateur.
function createNewMindmap() {
    const title = prompt('Nom de la mindmap:', 'Nouvelle mindmap');
    if (!title) return;

    const newMindmap = {
        id: Date.now(),
        title: title,
        nodes: [],
        links: []
    };

    project.mindmaps.push(newMindmap);
    currentMindmapId = newMindmap.id;
    saveProject();
    renderMindmapView();
}

// [MVVM : ViewModel]
// Commande pour supprimer une mindmap après confirmation.
function deleteMindmap(id) {
    if (!confirm('Supprimer cette mindmap ?')) return;

    const index = project.mindmaps.findIndex(mm => mm.id === id);
    if (index !== -1) {
        project.mindmaps.splice(index, 1);
        if (currentMindmapId === id) {
            currentMindmapId = project.mindmaps.length > 0 ? project.mindmaps[0].id : null;
        }
        saveProject();
        renderMindmapView();
    }
}

// [MVVM : ViewModel]
// Gère la sélection d'une mindmap et met à jour l'affichage.
function selectMindmap(id) {
    currentMindmapId = id;
    renderMindmapCanvas();
    // Mettre à jour l'affichage de la sidebar
    document.querySelectorAll('.mindmap-item').forEach(item => {
        item.classList.remove('active');
    });
    event.currentTarget.classList.add('active');
}

// [MVVM : ViewModel]
// Commande pour renommer la mindmap actuellement sélectionnée.
function renameMindmap() {
    const mindmap = project.mindmaps.find(mm => mm.id === currentMindmapId);
    if (!mindmap) return;

    const newTitle = prompt('Nouveau nom:', mindmap.title);
    if (newTitle && newTitle.trim()) {
        mindmap.title = newTitle.trim();
        saveProject();
        renderMindmapView();
    }
}

// [MVVM : View]
// Rendu principal de la zone de travail (canvas) de la mindmap.
function renderMindmapCanvas() {
    const editorView = document.getElementById('editorView');
    if (!editorView) return;

    const mindmap = project.mindmaps.find(mm => mm.id === currentMindmapId);

    if (!mindmap) {
        // Afficher un message d'accueil
        editorView.innerHTML = `
                    <div class="mindmap-empty">
                        <div class="mindmap-empty-icon">🗺️</div>
                        <h3 style="margin-bottom: 0.5rem;">Aucune mindmap sélectionnée</h3>
                        <p style="margin-bottom: 1rem;">Créez une mindmap pour commencer à organiser vos idées visuellement.</p>
                        <button class="btn" onclick="createNewMindmap()">➕ Créer une mindmap</button>
                    </div>
                `;
        return;
    }

    editorView.innerHTML = `
                <div class="mindmap-wrapper">
                    <div class="mindmap-main">
                        <div class="mindmap-toolbar">
                            <button class="btn btn-small" onclick="renameMindmap()" title="Renommer">✏️</button>
                            <button class="btn btn-small" onclick="addNoteNode()" title="Ajouter une note"><i data-lucide="sticky-note" style="width:14px;height:14px;"></i></button>
                            <button class="btn btn-small" onclick="resetMindmapView()" title="Réinitialiser la vue"><i data-lucide="target" style="width:14px;height:14px;"></i></button>
                            ${mindmapState.linkStart ? `
                                <button class="btn btn-small" onclick="cancelLinking()" style="background: var(--accent-red); color: white;" title="Annuler la liaison">
                                    <i data-lucide="x" style="width:14px;height:14px;"></i> Annuler
                                </button>
                                <span style="font-size: 0.85rem; color: var(--accent-red); font-weight: 600; animation: pulse-text 1s infinite;">
                                    <i data-lucide="link" style="width:14px;height:14px;vertical-align:middle;margin-right:4px;"></i>
                                    Cliquez sur un autre nœud pour créer le lien
                                </span>
                            ` : `
                                <span style="font-size: 0.75rem; color: var(--text-muted); font-style: italic;">
                                    <i data-lucide="lightbulb" style="width:12px;height:12px;vertical-align:middle;margin-right:4px;"></i>Survolez un nœud et cliquez sur <i data-lucide="link" style="width:12px;height:12px;vertical-align:middle;"></i> pour créer un lien
                                </span>
                            `}
                            <div style="flex: 1;"></div>
                            <span style="font-size: 0.85rem; color: var(--text-muted);">
                                ${mindmap.nodes.length} nœud(s) · ${mindmap.links.length} lien(s)
                            </span>
                        </div>
                        <div class="mindmap-canvas-wrapper ${mindmapState.linkStart ? 'linking-mode' : ''}" id="mindmapCanvasWrapper">
                            <div class="mindmap-canvas" id="mindmapCanvas"
                                 style="transform: scale(${mindmapState.zoom}) translate(${mindmapState.panX}px, ${mindmapState.panY}px);">
                                <svg id="mindmapSvg" style="position: absolute; width: 100%; height: 100%; top: 0; left: 0; pointer-events: painted;">
                                    ${renderMindmapLinks(mindmap)}
                                </svg>
                                ${renderMindmapNodes(mindmap)}
                            </div>
                        </div>
                    </div>
                    <div class="mindmap-library ${mindmapState.libraryCollapsed ? 'collapsed' : ''}">
                        <div class="mindmap-library-toggle" onclick="toggleLibrary()">
                            ${mindmapState.libraryCollapsed ? '◀' : '▶'}
                        </div>
                        <div class="mindmap-library-tabs">
                            <div class="mindmap-library-tab ${mindmapState.activeLibraryTab === 'characters' ? 'active' : ''}"
                                 onclick="setLibraryTab('characters')" title="Personnages"><i data-lucide="users" style="width:16px;height:16px;"></i></div>
                            <div class="mindmap-library-tab ${mindmapState.activeLibraryTab === 'elements' ? 'active' : ''}"
                                 onclick="setLibraryTab('elements')" title="Univers"><i data-lucide="globe" style="width:16px;height:16px;"></i></div>
                            <div class="mindmap-library-tab ${mindmapState.activeLibraryTab === 'codex' ? 'active' : ''}"
                                 onclick="setLibraryTab('codex')" title="Codex"><i data-lucide="book-open" style="width:16px;height:16px;"></i></div>
                            <div class="mindmap-library-tab ${mindmapState.activeLibraryTab === 'structure' ? 'active' : ''}"
                                 onclick="setLibraryTab('structure')" title="Structure"><i data-lucide="list-tree" style="width:16px;height:16px;"></i></div>
                        </div>
                        <div class="mindmap-library-content">
                            ${renderLibraryContent()}
                        </div>
                    </div>
                </div>
            `;

    // Initialiser les événements
    initMindmapEvents();

    // Réinitialiser les icônes Lucide après le rendu
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// [MVVM : View]
// Génère le code HTML pour afficher les nœuds de la mindmap.
function renderMindmapNodes(mindmap) {
    if (!mindmap.nodes || mindmap.nodes.length === 0) {
        return `
                    <div style="position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); 
                                text-align: center; color: var(--text-muted); pointer-events: none;">
                        <div style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.3;">🗺️</div>
                        <p style="font-size: 0.9rem;">Glissez des éléments depuis la bibliothèque →</p>
                    </div>
                `;
    }

    return mindmap.nodes.map(node => {
        const icon = getNodeIcon(node);
        const typeClass = `type-${node.type}`;
        const content = getNodeContent(node);
        const isLinkingSource = mindmapState.linkStart === node.id;

        return `
                    <div class="mindmap-node ${typeClass} ${mindmapState.selectedNode === node.id ? 'selected' : ''} ${isLinkingSource ? 'linking-source' : ''}"
                         data-node-id="${node.id}"
                         style="left: ${node.x}px; top: ${node.y}px; background-color: ${node.color || 'var(--bg-primary)'};">
                        <div class="mindmap-node-header">
                            <span class="mindmap-node-icon">${icon}</span>
                            <span class="mindmap-node-title">${node.title || 'Sans titre'}</span>
                            <span class="mindmap-node-link-btn" onclick="event.stopPropagation(); startLinkFrom(${node.id})" title="Créer un lien"><i data-lucide="link" style="width:12px;height:12px;"></i></span>
                            <span class="mindmap-node-delete" onclick="event.stopPropagation(); deleteNode(${node.id})">×</span>
                        </div>
                        ${content ? `<div class="mindmap-node-content">${content}</div>` : ''}
                    </div>
                `;
    }).join('');
}

// [MVVM : View]
// Génère le code SVG pour afficher les liens entre les nœuds.
function renderMindmapLinks(mindmap) {
    if (!mindmap.links || mindmap.links.length === 0) return '';

    // Créer les markers pour chaque couleur de lien
    const linkColors = new Set(mindmap.links.map(l => l.color || 'var(--accent-gold)'));
    const markers = Array.from(linkColors).map((color, index) => `
                <marker id="arrowhead-${index}" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                    <polygon points="0 0, 10 3, 0 6" fill="${color}" opacity="0.7"/>
                </marker>
            `).join('');

    const colorToMarkerId = {};
    Array.from(linkColors).forEach((color, index) => {
        colorToMarkerId[color] = `arrowhead-${index}`;
    });

    return mindmap.links.map(link => {
        const fromNode = mindmap.nodes.find(n => n.id === link.from);
        const toNode = mindmap.nodes.find(n => n.id === link.to);

        if (!fromNode || !toNode) return '';

        const x1 = fromNode.x + 100; // Centre approximatif du nœud
        const y1 = fromNode.y + 40;
        const x2 = toNode.x + 100;
        const y2 = toNode.y + 40;

        // Calculer la position du label au milieu
        const labelX = (x1 + x2) / 2;
        const labelY = (y1 + y2) / 2;

        const linkColor = link.color || 'var(--accent-gold)';
        const markerId = colorToMarkerId[linkColor];
        const escapedLabel = (link.label || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

        return `
                    <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" 
                          stroke="${linkColor}" stroke-width="4" 
                          opacity="0.7" marker-end="url(#${markerId})"
                          data-link-id="${link.id}"
                          onclick="editLink(${link.id})"
                          style="cursor: pointer; pointer-events: stroke;"/>
                    ${link.label ? `
                        <text x="${labelX}" y="${labelY}" 
                              text-anchor="middle" 
                              dominant-baseline="middle"
                              style="font-size: 12px; fill: ${linkColor}; font-weight: 600; 
                                     cursor: pointer; pointer-events: auto; user-select: none;"
                              onclick="editLink(${link.id})">
                            <tspan x="${labelX}" dy="0" 
                                   style="paint-order: stroke; stroke: var(--bg-primary); 
                                          stroke-width: 3px; stroke-linejoin: round;">
                                ${escapedLabel}
                            </tspan>
                        </text>
                    ` : ''}
                `;
    }).join('') + `
                <defs>
                    ${markers}
                </defs>
            `;
}

// [MVVM : View]
// Génère le contenu HTML de la bibliothèque d'éléments (personnages, univers, etc.).
function renderLibraryContent() {
    const tab = mindmapState.activeLibraryTab;

    if (tab === 'characters') {
        return project.characters.map(char => `
                    <div class="mindmap-library-item" draggable="true" 
                         data-type="character" data-id="${char.id}" data-title="${char.name}">
                        <span class="mindmap-library-item-icon"><i data-lucide="user" style="width:16px;height:16px;"></i></span>
                        <span class="mindmap-library-item-text">${char.name}</span>
                    </div>
                `).join('') || '<div style="padding: 1rem; text-align: center; color: var(--text-muted); font-size: 0.85rem;">Aucun personnage</div>';
    }

    if (tab === 'elements') {
        return project.world.map(elem => {
            const elemType = elem.type || 'Lieu';
            // Icônes Lucide selon le type
            const iconMap = {
                'Lieu': 'map-pin',
                'Objet': 'box',
                'Concept': 'lightbulb',
                'Organisation': 'building-2',
                'Événement': 'zap'
            };
            const iconName = iconMap[elemType] || 'map-pin';

            return `
                    <div class="mindmap-library-item" draggable="true" 
                         data-type="element" 
                         data-element-type="${elemType}"
                         data-id="${elem.id}" 
                         data-title="${elem.name}">
                        <span class="mindmap-library-item-icon"><i data-lucide="${iconName}" style="width:16px;height:16px;"></i></span>
                        <span class="mindmap-library-item-text">${elem.name}</span>
                    </div>
                `;
        }).join('') || '<div style="padding: 1rem; text-align: center; color: var(--text-muted); font-size: 0.85rem;">Aucun élément</div>';
    }

    if (tab === 'codex') {
        return (project.codex || []).map(entry => `
                    <div class="mindmap-library-item" draggable="true" 
                         data-type="codex" 
                         data-id="${entry.id}" 
                         data-title="${entry.title || entry.name || 'Sans titre'}">
                        <span class="mindmap-library-item-icon"><i data-lucide="book-open" style="width:16px;height:16px;"></i></span>
                        <span class="mindmap-library-item-text">${entry.title || entry.name || 'Sans titre'}</span>
                    </div>
                `).join('') || '<div style="padding: 1rem; text-align: center; color: var(--text-muted); font-size: 0.85rem;">Aucune entrée codex</div>';
    }

    if (tab === 'structure') {
        let structureHTML = '';
        project.acts.forEach((act, actIndex) => {
            const actNum = toRoman(actIndex + 1);
            // Ajouter l'acte
            structureHTML += `
                        <div class="mindmap-library-item" draggable="true" 
                             data-type="act" 
                             data-id="${act.id}"
                             data-title="Acte ${actNum}: ${act.title || 'Sans titre'}">
                            <span class="mindmap-library-item-icon"><i data-lucide="folder" style="width:16px;height:16px;"></i></span>
                            <span class="mindmap-library-item-text" style="font-weight: 600;">Acte ${actNum}</span>
                        </div>
                    `;

            act.chapters.forEach((chapter, chapIndex) => {
                const chapNum = chapIndex + 1;
                // Ajouter le chapitre
                structureHTML += `
                            <div class="mindmap-library-item" draggable="true" 
                                 data-type="chapter" 
                                 data-id="${chapter.id}"
                                 data-act="${act.id}"
                                 data-title="A${actNum} › Ch.${chapNum}: ${chapter.title || 'Sans titre'}"
                                 style="margin-left: 0.5rem;">
                                <span class="mindmap-library-item-icon"><i data-lucide="file-text" style="width:16px;height:16px;"></i></span>
                                <span class="mindmap-library-item-text" style="font-size: 0.8rem;">Ch.${chapNum}: ${chapter.title || 'Sans titre'}</span>
                            </div>
                        `;

                chapter.scenes.forEach(scene => {
                    const sceneLabel = scene.title || 'Sans titre';
                    structureHTML += `
                                <div class="mindmap-library-item" draggable="true" 
                                     data-type="scene" 
                                     data-id="${scene.id}"
                                     data-act="${act.id}"
                                     data-chapter="${chapter.id}"
                                     data-title="A${actNum} › C${chapNum} › ${sceneLabel}"
                                     style="margin-left: 1rem;">
                                    <span class="mindmap-library-item-icon"><i data-lucide="pen-line" style="width:16px;height:16px;"></i></span>
                                    <span class="mindmap-library-item-text" style="font-size: 0.75rem;">${sceneLabel}</span>
                                </div>
                            `;
                });
            });
        });
        return structureHTML || '<div style="padding: 1rem; text-align: center; color: var(--text-muted); font-size: 0.85rem;">Aucune structure</div>';
    }

    return '';
}

// [MVVM : View]
// Détermine l'icône à afficher pour un nœud en fonction de son type.
function getNodeIcon(node) {
    if (node.type === 'element') {
        // Icônes Lucide spécifiques selon le type d'élément d'univers
        const elementIconMap = {
            'Lieu': 'map-pin',
            'Objet': 'box',
            'Concept': 'lightbulb',
            'Organisation': 'building-2',
            'Événement': 'zap'
        };
        const iconName = elementIconMap[node.elementType] || 'map-pin';
        return `<i data-lucide="${iconName}" style="width:16px;height:16px;"></i>`;
    }

    const icons = {
        'character': 'user',
        'scene': 'pen-line',
        'note': 'sticky-note',
        'codex': 'book-open',
        'act': 'folder',
        'chapter': 'file-text'
    };
    const iconName = icons[node.type] || 'pin';
    return `<i data-lucide="${iconName}" style="width:16px;height:16px;"></i>`;
}

// [MVVM : ViewModel]
// Extrait le contenu textuel d'un nœud pour l'affichage.
function getNodeContent(node) {
    if (node.type === 'note') {
        return node.content || '';
    }
    return '';
}

// [MVVM : ViewModel]
// Alterne l'état replié/déplié de la bibliothèque.
function toggleLibrary() {
    mindmapState.libraryCollapsed = !mindmapState.libraryCollapsed;
    renderMindmapCanvas();
}

// [MVVM : ViewModel]
// Change l'onglet actif dans la bibliothèque et rafraîchit son contenu.
function setLibraryTab(tab) {
    mindmapState.activeLibraryTab = tab;
    document.querySelectorAll('.mindmap-library-tab').forEach(t => t.classList.remove('active'));
    event.currentTarget.classList.add('active');
    document.querySelector('.mindmap-library-content').innerHTML = renderLibraryContent();
    initLibraryDragEvents();

    // Réinitialiser les icônes Lucide
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// [MVVM : ViewModel]
// Gère l'initialisation ou la finalisation de la création d'un lien entre deux nœuds.
function startLinkFrom(nodeId) {
    if (mindmapState.linkStart === nodeId) {
        // Annuler si on reclique sur le même nœud
        cancelLinking();
    } else if (mindmapState.linkStart && mindmapState.linkStart !== nodeId) {
        // Créer le lien
        const mindmap = project.mindmaps.find(mm => mm.id === currentMindmapId);
        if (!mindmap) return;

        const newLink = {
            id: Date.now(),
            from: mindmapState.linkStart,
            to: nodeId,
            label: '',
            color: '#d4af37' // Couleur or par défaut
        };
        mindmap.links.push(newLink);
        mindmapState.linkStart = null;
        saveProject();
        renderMindmapCanvas();
    } else {
        // Démarrer une nouvelle liaison
        mindmapState.linkStart = nodeId;
        renderMindmapCanvas();
    }
}

// [MVVM : ViewModel]
// Annule le processus de création de lien en cours.
function cancelLinking() {
    mindmapState.linkStart = null;
    renderMindmapCanvas();
}

// [MVVM : ViewModel]
// Commande pour ajouter un nœud de type note à la mindmap.
function addNoteNode() {
    const mindmap = project.mindmaps.find(mm => mm.id === currentMindmapId);
    if (!mindmap) return;

    const content = prompt('Contenu de la note:');
    if (!content) return;

    const newNode = {
        id: Date.now(),
        type: 'note',
        title: 'Note',
        content: content,
        x: 100 + Math.random() * 200,
        y: 100 + Math.random() * 200,
        color: 'var(--bg-primary)'
    };

    mindmap.nodes.push(newNode);
    saveProject();
    renderMindmapCanvas();
}

// [MVVM : ViewModel]
// Commande pour supprimer un nœud et ses liens associés.
function deleteNode(nodeId) {
    const mindmap = project.mindmaps.find(mm => mm.id === currentMindmapId);
    if (!mindmap) return;

    if (!confirm('Supprimer ce nœud ?')) return;

    // Supprimer le nœud
    const nodeIndex = mindmap.nodes.findIndex(n => n.id === nodeId);
    if (nodeIndex !== -1) {
        mindmap.nodes.splice(nodeIndex, 1);
    }

    // Supprimer les liens associés
    mindmap.links = mindmap.links.filter(l => l.from !== nodeId && l.to !== nodeId);

    saveProject();
    renderMindmapCanvas();
}

// [MVVM : Mixte]
// Affiche un modal d'édition pour les liens (Vue) et gère la logique de modification (ViewModel).
function editLink(linkId) {
    const mindmap = project.mindmaps.find(mm => mm.id === currentMindmapId);
    if (!mindmap) return;

    const link = mindmap.links.find(l => l.id === linkId);
    if (!link) return;

    // Couleurs prédéfinies
    const colors = [
        { name: 'Or', value: '#d4af37' },
        { name: 'Rouge', value: '#c44536' },
        { name: 'Bleu', value: '#2196f3' },
        { name: 'Vert', value: '#4caf50' },
        { name: 'Violet', value: '#9c27b0' },
        { name: 'Orange', value: '#ff9800' },
        { name: 'Rose', value: '#e91e63' },
        { name: 'Gris', value: '#757575' }
    ];

    let selectedColor = link.color || '#d4af37';

    // Créer le modal
    const overlay = document.createElement('div');
    overlay.className = 'link-editor-overlay';
    overlay.innerHTML = `
                <div class="link-editor-modal">
                    <div class="link-editor-header">✏️ Éditer le lien</div>
                    
                    <div class="link-editor-field">
                        <label class="link-editor-label">Étiquette</label>
                        <input type="text" class="link-editor-input" id="linkLabelInput" 
                               value="${(link.label || '').replace(/"/g, '&quot;')}" 
                               placeholder="Ex: ennemi de, père de, aime...">
                    </div>
                    
                    <div class="link-editor-field">
                        <label class="link-editor-label">Couleur</label>
                        <div class="link-editor-colors" id="linkColorPicker">
                            ${colors.map(c => `
                                <div class="link-color-option ${c.value === selectedColor ? 'selected' : ''}" 
                                     style="background: ${c.value};"
                                     data-color="${c.value}"
                                     title="${c.name}"></div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="link-editor-buttons">
                        <button class="btn" id="saveLinkBtn" style="flex: 1;">💾 Enregistrer</button>
                        <button class="btn" id="deleteLinkBtn" style="background: var(--accent-red); color: white;">🗑️ Supprimer</button>
                        <button class="btn" id="cancelLinkBtn" style="background: var(--bg-secondary);">✕ Annuler</button>
                    </div>
                </div>
            `;

    if (!document.body) {
        console.error('document.body not available');
        return;
    }

    document.body.appendChild(overlay);

    // Gestionnaires d'événements
    const modal = overlay.querySelector('.link-editor-modal');

    // Empêcher la fermeture au clic sur le modal
    modal.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    // Fermer au clic sur l'overlay
    overlay.addEventListener('click', () => {
        overlay.remove();
    });

    // Sélection de couleur
    document.querySelectorAll('.link-color-option').forEach(opt => {
        opt.addEventListener('click', () => {
            selectedColor = opt.getAttribute('data-color');
            document.querySelectorAll('.link-color-option').forEach(o => o.classList.remove('selected'));
            opt.classList.add('selected');
        });
    });

    // Bouton Enregistrer
    document.getElementById('saveLinkBtn').addEventListener('click', () => {
        const newLabel = document.getElementById('linkLabelInput').value.trim();
        link.label = newLabel;
        link.color = selectedColor;
        saveProject();
        overlay.remove();
        renderMindmapCanvas();
    });

    // Bouton Supprimer
    document.getElementById('deleteLinkBtn').addEventListener('click', () => {
        if (!confirm('Supprimer ce lien ?')) return;
        const linkIndex = mindmap.links.findIndex(l => l.id === linkId);
        if (linkIndex !== -1) {
            mindmap.links.splice(linkIndex, 1);
            saveProject();
            overlay.remove();
            renderMindmapCanvas();
        }
    });

    // Bouton Annuler
    document.getElementById('cancelLinkBtn').addEventListener('click', () => {
        overlay.remove();
    });

    // Focus sur l'input
    document.getElementById('linkLabelInput').focus();
}

// [MVVM : ViewModel]
// Réinitialise le zoom et le panoramique de la vue mindmap.
function resetMindmapView() {
    mindmapState.zoom = 1;
    mindmapState.panX = 0;
    mindmapState.panY = 0;
    renderMindmapCanvas();
}

// [MVVM : View]
// Initialise les écouteurs d'événements pour les interactions avec la mindmap.
function initMindmapEvents() {
    const canvas = document.getElementById('mindmapCanvas');
    const wrapper = document.getElementById('mindmapCanvasWrapper');
    if (!canvas || !wrapper) return;

    // Drag & drop des nœuds (souris + tactile)
    canvas.querySelectorAll('.mindmap-node').forEach(node => {
        node.addEventListener('mousedown', handleNodeMouseDown);
        node.addEventListener('click', handleNodeClick);
        node.addEventListener('touchstart', handleNodeTouchStart, { passive: false });
    });

    // Pan de la canvas (souris)
    wrapper.addEventListener('mousedown', handleCanvasMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    // Pan de la canvas (tactile)
    wrapper.addEventListener('touchstart', handleCanvasTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    // Zoom
    wrapper.addEventListener('wheel', handleWheel);

    // Drop depuis la bibliothèque
    wrapper.addEventListener('dragover', handleDragOver);
    wrapper.addEventListener('drop', handleDrop);

    // Initialiser le drag des items de la bibliothèque
    initLibraryDragEvents();
}

// [MVVM : View]
// Initialise les événements de glisser-déposer pour les éléments de la bibliothèque.
function initLibraryDragEvents() {
    document.querySelectorAll('.mindmap-library-item').forEach(item => {
        // Support souris (desktop)
        item.addEventListener('dragstart', handleLibraryDragStart);

        // Support tactile (mobile)
        item.addEventListener('touchstart', handleLibraryTouchStart, { passive: false });
    });
}

// Variables pour le drag tactile
let touchDragData = null;
let touchDragElement = null;
let touchDragClone = null;

// [MVVM : ViewModel]
// Gère le début du glisser-déposer tactile pour un élément de la bibliothèque.
function handleLibraryTouchStart(e) {
    e.preventDefault();

    const item = e.currentTarget;
    const touch = e.touches[0];

    // Sauvegarder les données
    touchDragData = {
        type: item.getAttribute('data-type'),
        linkedId: item.getAttribute('data-id'),
        title: item.getAttribute('data-title'),
        actId: item.getAttribute('data-act'),
        chapterId: item.getAttribute('data-chapter'),
        elementType: item.getAttribute('data-element-type')
    };

    touchDragElement = item;

    // Créer un clone visuel
    touchDragClone = item.cloneNode(true);
    touchDragClone.style.position = 'fixed';
    touchDragClone.style.left = touch.clientX - 60 + 'px';
    touchDragClone.style.top = touch.clientY - 20 + 'px';
    touchDragClone.style.width = '120px';
    touchDragClone.style.opacity = '0.7';
    touchDragClone.style.pointerEvents = 'none';
    touchDragClone.style.zIndex = '10000';
    touchDragClone.style.transform = 'scale(0.9)';

    if (document.body) {
        document.body.appendChild(touchDragClone);
    }

    // Écouter les mouvements
    document.addEventListener('touchmove', handleLibraryTouchMove, { passive: false });
    document.addEventListener('touchend', handleLibraryTouchEnd);
}

// [MVVM : ViewModel]
// Gère le mouvement du glisser-déposer tactile.
function handleLibraryTouchMove(e) {
    e.preventDefault();

    if (!touchDragClone) return;

    const touch = e.touches[0];
    touchDragClone.style.left = touch.clientX - 60 + 'px';
    touchDragClone.style.top = touch.clientY - 20 + 'px';
}

// [MVVM : ViewModel]
// Gère la fin du glisser-déposer tactile et le drop sur la canvas.
function handleLibraryTouchEnd(e) {
    if (!touchDragClone || !touchDragData) {
        cleanupTouchDrag();
        return;
    }

    const touch = e.changedTouches[0];

    // Vérifier si on est sur la zone de drop
    const wrapper = document.getElementById('mindmapCanvasWrapper');
    if (!wrapper) {
        cleanupTouchDrag();
        return;
    }

    const rect = wrapper.getBoundingClientRect();
    if (touch.clientX >= rect.left && touch.clientX <= rect.right &&
        touch.clientY >= rect.top && touch.clientY <= rect.bottom) {

        // Drop sur la canvas
        const mindmap = project.mindmaps.find(mm => mm.id === currentMindmapId);
        if (mindmap) {
            // Calculer la position en tenant compte du zoom et du pan
            const x = (touch.clientX - rect.left - mindmapState.panX * mindmapState.zoom) / mindmapState.zoom;
            const y = (touch.clientY - rect.top - mindmapState.panY * mindmapState.zoom) / mindmapState.zoom;

            const newNode = {
                id: Date.now(),
                type: touchDragData.type,
                linkedId: touchDragData.linkedId,
                title: touchDragData.title,
                x: x,
                y: y,
                color: 'var(--bg-primary)'
            };

            // Ajouter les données supplémentaires pour les scènes
            if (touchDragData.type === 'scene') {
                newNode.actId = touchDragData.actId;
                newNode.chapterId = touchDragData.chapterId;
            }

            // Ajouter le type d'élément pour les éléments d'univers
            if (touchDragData.type === 'element' && touchDragData.elementType) {
                newNode.elementType = touchDragData.elementType;
            }

            mindmap.nodes.push(newNode);
            saveProject();
            renderMindmapCanvas();
        }
    }

    cleanupTouchDrag();
}

// [MVVM : ViewModel]
// Nettoie les données et les clones visuels après un glisser-déposer tactile.
function cleanupTouchDrag() {
    if (touchDragClone && touchDragClone.parentNode) {
        touchDragClone.parentNode.removeChild(touchDragClone);
    }
    touchDragClone = null;
    touchDragData = null;
    touchDragElement = null;

    document.removeEventListener('touchmove', handleLibraryTouchMove);
    document.removeEventListener('touchend', handleLibraryTouchEnd);
}

// [MVVM : ViewModel]
// Prépare les données à transférer lors du début d'un glisser-déposer (souris).
function handleLibraryDragStart(e) {
    const type = e.currentTarget.getAttribute('data-type');
    const id = e.currentTarget.getAttribute('data-id');
    const title = e.currentTarget.getAttribute('data-title');
    const actId = e.currentTarget.getAttribute('data-act');
    const chapterId = e.currentTarget.getAttribute('data-chapter');
    const elementType = e.currentTarget.getAttribute('data-element-type');

    e.dataTransfer.setData('application/json', JSON.stringify({
        type,
        linkedId: id,
        title,
        actId,
        chapterId,
        elementType
    }));
    e.dataTransfer.effectAllowed = 'copy';
}

// [MVVM : ViewModel]
// Autorise le survol de la zone de drop.
function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
}

// [MVVM : ViewModel]
// Gère le dépôt d'un élément de la bibliothèque sur la canvas.
function handleDrop(e) {
    e.preventDefault();

    const mindmap = project.mindmaps.find(mm => mm.id === currentMindmapId);
    if (!mindmap) return;

    try {
        const data = JSON.parse(e.dataTransfer.getData('application/json'));
        const wrapper = document.getElementById('mindmapCanvasWrapper');
        const canvas = document.getElementById('mindmapCanvas');
        const rect = wrapper.getBoundingClientRect();

        // Calculer la position en tenant compte du zoom et du pan
        const x = (e.clientX - rect.left - mindmapState.panX * mindmapState.zoom) / mindmapState.zoom;
        const y = (e.clientY - rect.top - mindmapState.panY * mindmapState.zoom) / mindmapState.zoom;

        const newNode = {
            id: Date.now(),
            type: data.type,
            linkedId: data.linkedId,
            title: data.title,
            x: x,
            y: y,
            color: 'var(--bg-primary)'
        };

        // Ajouter les données supplémentaires pour les scènes
        if (data.type === 'scene') {
            newNode.actId = data.actId;
            newNode.chapterId = data.chapterId;
        }

        // Ajouter le type d'élément pour les éléments d'univers
        if (data.type === 'element' && data.elementType) {
            newNode.elementType = data.elementType;
        }

        mindmap.nodes.push(newNode);
        saveProject();
        renderMindmapCanvas();
    } catch (err) {
        console.error('Erreur lors du drop:', err);
    }
}

// [MVVM : ViewModel]
// Initialise le déplacement d'un nœud à la souris.
function handleNodeMouseDown(e) {
    e.stopPropagation();

    const mindmap = project.mindmaps.find(mm => mm.id === currentMindmapId);
    if (!mindmap) return;

    const nodeId = parseInt(e.currentTarget.getAttribute('data-node-id'));

    // Mode déplacement uniquement
    mindmapState.isDragging = true;
    mindmapState.draggedNode = nodeId;
    mindmapState.selectedNode = nodeId;

    const node = mindmap.nodes.find(n => n.id === nodeId);
    const canvas = document.getElementById('mindmapCanvas');
    const rect = canvas.getBoundingClientRect();

    mindmapState.dragOffsetX = (e.clientX - rect.left) / mindmapState.zoom - node.x;
    mindmapState.dragOffsetY = (e.clientY - rect.top) / mindmapState.zoom - node.y;

    e.currentTarget.classList.add('dragging');
}

// [MVVM : ViewModel]
// Gère le clic (sélection/liaison) et le double-clic (navigation) sur un nœud.
function handleNodeClick(e) {
    const nodeId = parseInt(e.currentTarget.getAttribute('data-node-id'));
    const mindmap = project.mindmaps.find(mm => mm.id === currentMindmapId);
    if (!mindmap) return;

    const node = mindmap.nodes.find(n => n.id === nodeId);
    if (!node) return;

    // Double-clic pour ouvrir l'élément lié
    if (e.detail === 2 && node.linkedId) {
        if (node.type === 'character') {
            switchView('characters');
            setTimeout(() => openCharacterDetail(node.linkedId), 100);
        } else if (node.type === 'element') {
            switchView('world');
            setTimeout(() => openWorldDetail(node.linkedId), 100);
        } else if (node.type === 'codex') {
            switchView('codex');
            setTimeout(() => {
                if (typeof openCodexDetail === 'function') {
                    openCodexDetail(node.linkedId);
                }
            }, 100);
        } else if (node.type === 'scene' && node.actId && node.chapterId) {
            switchView('editor');
            setTimeout(() => openScene(node.actId, node.chapterId, node.linkedId), 100);
        } else if (node.type === 'chapter' && node.actId) {
            switchView('editor');
            // Trouver la première scène du chapitre
            const act = project.acts.find(a => a.id == node.actId);
            if (act) {
                const chapter = act.chapters.find(c => c.id == node.linkedId);
                if (chapter && chapter.scenes.length > 0) {
                    setTimeout(() => openScene(node.actId, node.linkedId, chapter.scenes[0].id), 100);
                }
            }
        } else if (node.type === 'act') {
            switchView('editor');
            // Trouver le premier chapitre et scène de l'acte
            const act = project.acts.find(a => a.id == node.linkedId);
            if (act && act.chapters.length > 0 && act.chapters[0].scenes.length > 0) {
                setTimeout(() => openScene(node.linkedId, act.chapters[0].id, act.chapters[0].scenes[0].id), 100);
            }
        }
    }

    // Simple clic en mode liaison : créer le lien vers ce nœud
    if (e.detail === 1 && mindmapState.linkStart && mindmapState.linkStart !== nodeId) {
        // Créer le lien immédiatement
        const newLink = {
            id: Date.now(),
            from: mindmapState.linkStart,
            to: nodeId,
            label: '',
            color: '#d4af37'
        };
        mindmap.links.push(newLink);
        mindmapState.linkStart = null;
        saveProject();
        renderMindmapCanvas();
    }
}

// [MVVM : ViewModel]
// Initialise le déplacement panoramique de la canvas.
function handleCanvasMouseDown(e) {
    if (e.target.id === 'mindmapCanvasWrapper' || e.target.id === 'mindmapCanvas') {
        mindmapState.isPanning = true;
        mindmapState.lastMouseX = e.clientX;
        mindmapState.lastMouseY = e.clientY;
        document.getElementById('mindmapCanvas').classList.add('panning');
    }
}

// [MVVM : ViewModel]
// Met à jour la position des nœuds ou de la canvas lors du déplacement de la souris.
function handleMouseMove(e) {
    const mindmap = project.mindmaps.find(mm => mm.id === currentMindmapId);
    if (!mindmap) return;

    if (mindmapState.isDragging && mindmapState.draggedNode) {
        const node = mindmap.nodes.find(n => n.id === mindmapState.draggedNode);
        if (node) {
            const canvas = document.getElementById('mindmapCanvas');
            const rect = canvas.getBoundingClientRect();

            node.x = (e.clientX - rect.left) / mindmapState.zoom - mindmapState.dragOffsetX;
            node.y = (e.clientY - rect.top) / mindmapState.zoom - mindmapState.dragOffsetY;

            // Mise à jour en temps réel
            const nodeElem = document.querySelector(`[data-node-id="${node.id}"]`);
            if (nodeElem) {
                nodeElem.style.left = node.x + 'px';
                nodeElem.style.top = node.y + 'px';
            }

            // Redessiner les liens
            document.getElementById('mindmapSvg').innerHTML = renderMindmapLinks(mindmap);
        }
    } else if (mindmapState.isPanning) {
        const deltaX = e.clientX - mindmapState.lastMouseX;
        const deltaY = e.clientY - mindmapState.lastMouseY;

        mindmapState.panX += deltaX / mindmapState.zoom;
        mindmapState.panY += deltaY / mindmapState.zoom;

        mindmapState.lastMouseX = e.clientX;
        mindmapState.lastMouseY = e.clientY;

        const canvas = document.getElementById('mindmapCanvas');
        canvas.style.transform = `scale(${mindmapState.zoom}) translate(${mindmapState.panX}px, ${mindmapState.panY}px)`;
    }
}

// [MVVM : ViewModel]
// Finalise le déplacement d'un nœud ou de la canvas.
function handleMouseUp(e) {
    if (mindmapState.isDragging) {
        const mindmap = project.mindmaps.find(mm => mm.id === currentMindmapId);
        if (mindmap) {
            saveProject();
        }

        document.querySelectorAll('.mindmap-node').forEach(node => {
            node.classList.remove('dragging');
        });
    }

    if (mindmapState.isPanning) {
        document.getElementById('mindmapCanvas').classList.remove('panning');
    }

    mindmapState.isDragging = false;
    mindmapState.draggedNode = null;
    mindmapState.isPanning = false;
}

