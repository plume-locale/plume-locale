// ============================================
// THRILLER BOARD - Canvas System for Mystery Elements
// ============================================

// ============================================
// CONFIGURATION & TYPES
// ============================================

const THRILLER_BOARD_CONFIG = {
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

// Thriller element types based on the JSON schemas
const THRILLER_TYPES = {
    alibi: {
        label: 'Alibi',
        icon: 'shield-check',
        color: '#27ae60',
        description: 'Alibi de personnage pour un événement'
    },
    backstory: {
        label: 'Événement passé',
        icon: 'history',
        color: '#8e44ad',
        description: 'Informations de contexte du personnage'
    },
    clue: {
        label: 'Indice',
        icon: 'search',
        color: '#e67e22',
        description: 'Preuve ou indice dans le mystère'
    },
    knowledge_state: {
        label: 'État de connaissance',
        icon: 'brain',
        color: '#3498db',
        description: 'Ce qu\'un personnage sait'
    },
    location: {
        label: 'Lieu',
        icon: 'map-pin',
        color: '#16a085',
        description: 'Lieu important dans l\'histoire'
    },
    motive_means_opportunity: {
        label: 'Analyse de suspect',
        icon: 'target',
        color: '#e74c3c',
        description: 'Potentiel du suspect à commettre le crime'
    },
    question: {
        label: 'Question',
        icon: 'help-circle',
        color: '#f39c12',
        description: 'Question mystérieuse à résoudre'
    },
    red_herring: {
        label: 'Fausse piste',
        icon: 'fish',
        color: '#9b59b6',
        description: 'Indice trompeur ou fausse piste'
    },
    reversal: {
        label: 'Révélation',
        icon: 'rotate-ccw',
        color: '#d35400',
        description: 'Rebondissement ou révélation'
    },
    secret: {
        label: 'Secret',
        icon: 'lock',
        color: '#c0392b',
        description: 'Information cachée'
    }
};

// Card types for thriller elements
const THRILLER_CARD_TYPES = {
    note: { label: 'Note', icon: 'file-text' },
    image: { label: 'Image', icon: 'image' },
    link: { label: 'Lien', icon: 'link' },
    todo: { label: 'Tâches', icon: 'check-square' },
    comment: { label: 'Commentaire', icon: 'message-square' },
    table: { label: 'Tableau', icon: 'table' },
    audio: { label: 'Audio', icon: 'music' },
    divider: { label: 'Séparateur', icon: 'minus' }
};

// ============================================
// STATE MANAGEMENT
// ============================================

let thrillerBoardState = {
    elements: [], // Array of thriller elements
    connections: [], // Links between elements
    canvasOffset: { x: 0, y: 0 },
    zoom: 1,
    selectedElements: [],
    contextPanelOpen: true,
    currentFilter: 'clue', // Default to clues tab
    snapToGrid: true
};

// ============================================
// INITIALIZATION
// ============================================

function initThrillerBoard() {
    // Initialize thriller elements array if not exists
    if (!project.thrillerElements) {
        project.thrillerElements = [];
    }
    if (!project.thrillerConnections) {
        project.thrillerConnections = [];
    }

    thrillerBoardState.elements = project.thrillerElements;
    thrillerBoardState.connections = project.thrillerConnections;
}

function renderThrillerBoard() {
    const container = document.getElementById('editorView');
    if (!container) return;

    initThrillerBoard();

    container.innerHTML = `
        <div class="thriller-board-container">
            <!-- Tabs Navigation -->
            <div class="thriller-board-tabs">
                <button class="thriller-tab ${thrillerBoardState.currentFilter === 'clue' ? 'active' : ''}" onclick="selectThrillerTab('clue')">
                    <i data-lucide="search"></i> Indices
                </button>
                <button class="thriller-tab ${thrillerBoardState.currentFilter === 'secret' ? 'active' : ''}" onclick="selectThrillerTab('secret')">
                    <i data-lucide="lock"></i> Secrets
                </button>
                <button class="thriller-tab ${thrillerBoardState.currentFilter === 'alibi' ? 'active' : ''}" onclick="selectThrillerTab('alibi')">
                    <i data-lucide="shield-check"></i> Alibis
                </button>
                <button class="thriller-tab ${thrillerBoardState.currentFilter === 'red_herring' ? 'active' : ''}" onclick="selectThrillerTab('red_herring')">
                    <i data-lucide="fish"></i> Fausses pistes
                </button>
                <button class="thriller-tab ${thrillerBoardState.currentFilter === 'question' ? 'active' : ''}" onclick="selectThrillerTab('question')">
                    <i data-lucide="help-circle"></i> Questions
                </button>
                <button class="thriller-tab ${thrillerBoardState.currentFilter === 'reversal' ? 'active' : ''}" onclick="selectThrillerTab('reversal')">
                    <i data-lucide="rotate-ccw"></i> Révélations
                </button>
                <button class="thriller-tab ${thrillerBoardState.currentFilter === 'location' ? 'active' : ''}" onclick="selectThrillerTab('location')">
                    <i data-lucide="map-pin"></i> Lieux
                </button>
                <button class="thriller-tab ${thrillerBoardState.currentFilter === 'backstory' ? 'active' : ''}" onclick="selectThrillerTab('backstory')">
                    <i data-lucide="history"></i> Événements passés
                </button>
                <button class="thriller-tab ${thrillerBoardState.currentFilter === 'motive_means_opportunity' ? 'active' : ''}" onclick="selectThrillerTab('motive_means_opportunity')">
                    <i data-lucide="target"></i> Suspects
                </button>
            </div>

            <!-- Canvas Area -->
            <div class="thriller-board-canvas-wrapper">
                <div class="thriller-board-canvas" id="thrillerBoardCanvas"
                     onmousedown="handleThrillerCanvasMouseDown(event)"
                     onmousemove="handleThrillerCanvasMouseMove(event)"
                     onmouseup="handleThrillerCanvasMouseUp(event)"
                     onwheel="handleThrillerCanvasWheel(event)">
                    <div class="thriller-board-content" id="thrillerBoardContent">
                        <!-- Elements will be rendered here -->
                    </div>
                </div>
            </div>

            <!-- Context Panel -->
            <div class="thriller-board-context-panel ${thrillerBoardState.contextPanelOpen ? '' : 'collapsed'}" id="thrillerContextPanel">
                <div class="thriller-context-header">
                    <h3>Éléments Thriller</h3>
                    <button class="btn btn-ghost btn-sm" onclick="toggleThrillerContextPanel()">
                        <i data-lucide="chevron-right"></i>
                    </button>
                </div>
                <div class="thriller-context-content" id="thrillerContextContent">
                    <!-- Context content will be populated here -->
                </div>
            </div>
        </div>
    `;

    renderThrillerElements();
    updateThrillerContextPanel();

    // Refresh Lucide icons
    setTimeout(() => {
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }, 50);
}

// ============================================
// ELEMENT MANAGEMENT
// ============================================

function addThrillerElement(type = null) {
    // Use current filter if no type specified
    if (!type) {
        type = thrillerBoardState.currentFilter;
    }

    const elementType = THRILLER_TYPES[type];
    if (!elementType) return;

    // Count existing elements of this type
    const existingCount = thrillerBoardState.elements.filter(el => el.type === type).length;

    const newElement = {
        id: generateId(),
        type: type,
        title: `${elementType.label} ${existingCount + 1}`,
        description: '',
        position: { x: 100, y: 100 },
        size: { width: 280, height: 200 },
        color: elementType.color,
        data: {}, // Element-specific data
        connections: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    thrillerBoardState.elements.push(newElement);
    project.thrillerElements = thrillerBoardState.elements;

    renderThrillerElements();
    saveProject();

    // Open edit modal for the new element
    editThrillerElement(newElement.id);
}

function selectThrillerTab(type) {
    thrillerBoardState.currentFilter = type;
    renderThrillerBoard();
}

function renderThrillerElements() {
    const content = document.getElementById('thrillerBoardContent');
    if (!content) return;

    const filteredElements = thrillerBoardState.elements.filter(el => el.type === thrillerBoardState.currentFilter);
    const currentType = THRILLER_TYPES[thrillerBoardState.currentFilter];

    // Show empty state if no elements
    if (filteredElements.length === 0) {
        content.innerHTML = `
            <div class="thriller-empty-state">
                <div class="thriller-empty-icon" style="color: ${currentType.color}">
                    <i data-lucide="${currentType.icon}"></i>
                </div>
                <h3>Aucun ${currentType.label.toLowerCase()} pour le moment</h3>
                <p>${currentType.description}</p>
                <button class="btn btn-primary" onclick="addThrillerElement()">
                    <i data-lucide="plus"></i>
                    Ajouter premier ${currentType.label.toLowerCase()}
                </button>
            </div>
        `;

        setTimeout(() => {
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }, 50);
        return;
    }

    content.innerHTML = filteredElements.map(element => {
        const typeData = THRILLER_TYPES[element.type];
        return `
            <div class="thriller-element-card"
                 id="thriller-element-${element.id}"
                 style="left: ${element.position.x}px; top: ${element.position.y}px; width: ${element.size.width}px; min-height: ${element.size.height}px;"
                 onclick="selectThrillerElement('${element.id}')"
                 ondblclick="editThrillerElement('${element.id}')">
                <div class="thriller-element-header" style="background-color: ${element.color}">
                    <div class="thriller-element-icon">
                        <i data-lucide="${typeData.icon}"></i>
                    </div>
                    <div class="thriller-element-title">${element.title}</div>
                    <div class="thriller-element-actions">
                        <button class="btn btn-ghost btn-xs" onclick="event.stopPropagation(); deleteThrillerElement('${element.id}')">
                            <i data-lucide="trash-2"></i>
                        </button>
                    </div>
                </div>
                <div class="thriller-element-content">
                    <div class="thriller-element-description">${element.description || 'Aucune description'}</div>
                </div>
            </div>
        `;
    }).join('');

    // Render connections
    renderThrillerConnections();

    setTimeout(() => {
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }, 50);
}

function renderThrillerConnections() {
    // Remove existing connection lines
    document.querySelectorAll('.thriller-connection').forEach(el => el.remove());

    const canvas = document.getElementById('thrillerBoardCanvas');
    if (!canvas) return;

    thrillerBoardState.connections.forEach(connection => {
        const fromElement = thrillerBoardState.elements.find(el => el.id === connection.from);
        const toElement = thrillerBoardState.elements.find(el => el.id === connection.to);

        if (!fromElement || !toElement) return;

        const fromRect = document.getElementById(`thriller-element-${connection.from}`).getBoundingClientRect();
        const toRect = document.getElementById(`thriller-element-${connection.to}`).getBoundingClientRect();
        const canvasRect = canvas.getBoundingClientRect();

        const x1 = fromRect.left + fromRect.width / 2 - canvasRect.left;
        const y1 = fromRect.top + fromRect.height / 2 - canvasRect.top;
        const x2 = toRect.left + toRect.width / 2 - canvasRect.left;
        const y2 = toRect.top + toRect.height / 2 - canvasRect.top;

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
        line.setAttribute('stroke', connection.color || '#666');
        line.setAttribute('stroke-width', '2');
        line.classList.add('thriller-connection');

        canvas.appendChild(line);
    });
}

function editThrillerElement(elementId) {
    const element = thrillerBoardState.elements.find(el => el.id === elementId);
    if (!element) return;

    const typeData = THRILLER_TYPES[element.type];

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 700px;">
            <div class="modal-header">
                <h3>Modifier ${typeData.label}</h3>
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                    <i data-lucide="x"></i>
                </button>
            </div>
            <div class="modal-body">
                <form id="thrillerElementForm" onsubmit="saveThrillerElement(event, '${elementId}')">
                    <div class="form-group">
                        <label for="elementTitle">Titre</label>
                        <input type="text" id="elementTitle" value="${element.title}" required>
                    </div>
                    <div class="form-group">
                        <label for="elementDescription">Description</label>
                        <textarea id="elementDescription" rows="4">${element.description}</textarea>
                    </div>
                    ${renderThrillerElementFields(element)}
                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Annuler</button>
                        <button type="submit" class="btn btn-primary">Sauvegarder</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    setTimeout(() => {
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }, 50);
}

function renderThrillerElementFields(element) {
    // Render specific fields based on element type
    switch (element.type) {
        case 'alibi':
            return `
                <div class="form-row">
                    <div class="form-group" style="flex: 1;">
                        <label for="characterId">Personnage</label>
                        <select id="characterId">
                            <option value="">Sélectionner un personnage</option>
                            ${project.characters.map(char => `<option value="${char.id}" ${element.data.character_id === char.id ? 'selected' : ''}>${char.name}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group" style="flex: 1;">
                        <label for="forEvent">Pour l'événement</label>
                        <input type="text" id="forEvent" value="${element.data.for_event || ''}">
                    </div>
                </div>
                <div class="form-group">
                    <label style="display: flex; align-items: center; gap: 8px;">
                        <input type="checkbox" id="isTrue" ${element.data.is_true ? 'checked' : ''}>
                        Cet alibi est-il vrai ?
                    </label>
                    <small style="color: #666; margin-left: 24px;">Décocher si c'est un faux alibi</small>
                </div>
                <div class="form-section">
                    <h4>Alibi déclaré</h4>
                    <div class="form-row">
                        <div class="form-group" style="flex: 1;">
                            <label for="claimedLocation">Lieu déclaré</label>
                            <input type="text" id="claimedLocation" placeholder="Où ils prétendent avoir été" value="${element.data.claimed_location || ''}">
                        </div>
                        <div class="form-group" style="flex: 1;">
                            <label for="claimedActivity">Activité déclarée</label>
                            <input type="text" id="claimedActivity" placeholder="Ce qu'ils prétendent avoir fait" value="${element.data.claimed_activity || ''}">
                        </div>
                    </div>
                </div>
                <div class="form-section" style="background-color: #fff5f5;">
                    <h4 style="color: #c0392b;">Réalité (cachée)</h4>
                    <div class="form-row">
                        <div class="form-group" style="flex: 1;">
                            <label for="realLocation">Lieu réel</label>
                            <input type="text" id="realLocation" placeholder="Où ils étaient réellement" value="${element.data.real_location || ''}">
                        </div>
                        <div class="form-group" style="flex: 1;">
                            <label for="realActivity">Activité réelle</label>
                            <input type="text" id="realActivity" placeholder="Ce qu'ils ont réellement fait" value="${element.data.real_activity || ''}">
                        </div>
                    </div>
                </div>
                <div class="form-group">
                    <label>Témoins</label>
                    <div class="character-pills-container" id="alibiWitnessesContainer">
                        ${renderCharacterPills(element.data.witnesses || [], 'alibiWitnesses')}
                    </div>
                </div>
                <div class="form-group">
                    <label>Faiblesses / Failles de l'alibi</label>
                    <div id="weaknessesContainer">
                        ${renderListItems(element.data.weaknesses || [], 'weaknesses')}
                    </div>
                    <button type="button" class="btn btn-secondary btn-sm" onclick="addListItem('weaknesses', 'Ajouter une faiblesse...')">
                        <i data-lucide="plus"></i> Ajouter
                    </button>
                </div>
                <div class="form-row">
                    <div class="form-group" style="flex: 1;">
                        <label for="verifiedScene">Vérifié dans la scène</label>
                        <select id="verifiedScene">
                            <option value="">Sélectionner une scène</option>
                            ${renderSceneOptions(element.data.verified_scene)}
                        </select>
                    </div>
                    <div class="form-group" style="flex: 1;">
                        <label for="brokenScene">Brisé dans la scène</label>
                        <select id="brokenScene">
                            <option value="">Quand l'alibi est brisé</option>
                            ${renderSceneOptions(element.data.broken_scene)}
                        </select>
                    </div>
                </div>
            `;

        case 'clue':
            return `
                <div class="form-row">
                    <div class="form-group" style="flex: 1;">
                        <label for="clueType">Type *</label>
                        <select id="clueType">
                            <option value="physical" ${element.data.clue_type === 'physical' ? 'selected' : ''}>Physique</option>
                            <option value="testimonial" ${element.data.clue_type === 'testimonial' ? 'selected' : ''}>Témoignage</option>
                            <option value="circumstantial" ${element.data.clue_type === 'circumstantial' ? 'selected' : ''}>Circonstanciel</option>
                            <option value="digital" ${element.data.clue_type === 'digital' ? 'selected' : ''}>Numérique</option>
                            <option value="forensic" ${element.data.clue_type === 'forensic' ? 'selected' : ''}>Médico-légal</option>
                            <option value="documentary" ${element.data.clue_type === 'documentary' ? 'selected' : ''}>Documentaire</option>
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group" style="flex: 1;">
                        <label for="clueSignificance">Importance</label>
                        <select id="clueSignificance">
                            <option value="minor" ${element.data.significance === 'minor' ? 'selected' : ''}>Mineur</option>
                            <option value="major" ${element.data.significance === 'major' ? 'selected' : ''}>Majeur</option>
                            <option value="critical" ${element.data.significance === 'critical' ? 'selected' : ''}>Critique</option>
                        </select>
                    </div>
                    <div class="form-group" style="flex: 1;">
                        <label style="display: flex; align-items: center; gap: 8px;">
                            <input type="checkbox" id="isGenuine" ${element.data.is_genuine !== false ? 'checked' : ''}>
                            Preuve authentique
                        </label>
                    </div>
                </div>
                <div class="form-group">
                    <label for="whatItSuggests">Ce qu'il suggère</label>
                    <textarea id="whatItSuggests" rows="3">${element.data.what_it_suggests || ''}</textarea>
                </div>
                <div class="form-group">
                    <label>Pointe vers les personnages</label>
                    <div class="character-pills-container" id="clueCharactersContainer">
                        ${renderCharacterPills(element.data.points_to_characters || [], 'clueCharacters')}
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group" style="flex: 1;">
                        <label for="plantedScene">Scène où il est planté</label>
                        <select id="plantedScene">
                            <option value="">Sélectionner</option>
                            ${renderSceneOptions(element.data.planted_scene)}
                        </select>
                    </div>
                    <div class="form-group" style="flex: 1;">
                        <label for="discoveredScene">Scène de découverte</label>
                        <select id="discoveredScene">
                            <option value="">Sélectionner</option>
                            ${renderSceneOptions(element.data.discovered_scene)}
                        </select>
                    </div>
                    <div class="form-group" style="flex: 1;">
                        <label for="readerSeesAt">Le lecteur voit à</label>
                        <select id="readerSeesAt">
                            <option value="">Sélectionner</option>
                            ${renderSceneOptions(element.data.reader_sees_at)}
                        </select>
                    </div>
                </div>
            `;

        case 'secret':
            return `
                <div class="form-group">
                    <label for="secretFullDescription">Description complète</label>
                    <textarea id="secretFullDescription" rows="3" placeholder="Décrire le secret en détail...">${element.data.full_description || ''}</textarea>
                </div>
                <div class="form-row">
                    <div class="form-group" style="flex: 1;">
                        <label for="secretType">Type de secret</label>
                        <select id="secretType">
                            <option value="relationship" ${element.data.secret_type === 'relationship' ? 'selected' : ''}>Relation</option>
                            <option value="identity" ${element.data.secret_type === 'identity' ? 'selected' : ''}>Identité</option>
                            <option value="crime" ${element.data.secret_type === 'crime' ? 'selected' : ''}>Crime</option>
                            <option value="past" ${element.data.secret_type === 'past' ? 'selected' : ''}>Passé</option>
                            <option value="ability" ${element.data.secret_type === 'ability' ? 'selected' : ''}>Capacité</option>
                        </select>
                    </div>
                    <div class="form-group" style="flex: 1;">
                        <label for="secretImportance">Importance</label>
                        <select id="secretImportance">
                            <option value="minor" ${element.data.importance === 'minor' ? 'selected' : ''}>Mineur</option>
                            <option value="major" ${element.data.importance === 'major' ? 'selected' : ''}>Majeur</option>
                            <option value="critical" ${element.data.importance === 'critical' ? 'selected' : ''}>Critique</option>
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group" style="flex: 1;">
                        <label for="holderCharacterId">Détenu par le personnage</label>
                        <select id="holderCharacterId">
                            <option value="">Qui connaît ce secret</option>
                            ${project.characters.map(char => `<option value="${char.id}" ${element.data.holder_character_id === char.id ? 'selected' : ''}>${char.name}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group" style="flex: 1;">
                        <label for="aboutCharacterId">Concernant le personnage</label>
                        <select id="aboutCharacterId">
                            <option value="">Sélectionner</option>
                            ${project.characters.map(char => `<option value="${char.id}" ${element.data.about_character_id === char.id ? 'selected' : ''}>${char.name}</option>`).join('')}
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group" style="flex: 1;">
                        <label for="secretPlantedScene">Planté dans la scène</label>
                        <select id="secretPlantedScene">
                            <option value="">Premiers indices apparaissent</option>
                            ${renderSceneOptions(element.data.planted_scene)}
                        </select>
                    </div>
                    <div class="form-group" style="flex: 1;">
                        <label for="secretRevealedScene">Révélé dans la scène</label>
                        <select id="secretRevealedScene">
                            <option value="">Le secret est révélé</option>
                            ${renderSceneOptions(element.data.revealed_scene)}
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label for="secretCurrentStatus">Statut actuel</label>
                    <select id="secretCurrentStatus">
                        <option value="hidden" ${element.data.current_status === 'hidden' ? 'selected' : ''}>Caché</option>
                        <option value="partially_revealed" ${element.data.current_status === 'partially_revealed' ? 'selected' : ''}>Partiellement révélé</option>
                        <option value="fully_revealed" ${element.data.current_status === 'fully_revealed' ? 'selected' : ''}>Complètement révélé</option>
                    </select>
                </div>
            `;

        case 'backstory':
            return `
                <div class="form-group">
                    <label for="whenItHappened">Quand c'est arrivé *</label>
                    <input type="text" id="whenItHappened" placeholder="ex: il y a 5 ans, juin 2019" value="${element.data.when_it_happened || ''}" required>
                </div>
                <div class="form-row">
                    <div class="form-group" style="flex: 1;">
                        <label for="backstoryType">Type</label>
                        <select id="backstoryType">
                            <option value="other" ${element.data.event_type === 'other' ? 'selected' : ''}>Autre</option>
                            <option value="original_crime" ${element.data.event_type === 'original_crime' ? 'selected' : ''}>Crime d'origine</option>
                            <option value="trauma" ${element.data.event_type === 'trauma' ? 'selected' : ''}>Traumatisme</option>
                            <option value="betrayal" ${element.data.event_type === 'betrayal' ? 'selected' : ''}>Trahison</option>
                            <option value="relationship_start" ${element.data.event_type === 'relationship_start' ? 'selected' : ''}>Début de relation</option>
                            <option value="death" ${element.data.event_type === 'death' ? 'selected' : ''}>Décès</option>
                            <option value="secret_formed" ${element.data.event_type === 'secret_formed' ? 'selected' : ''}>Secret formé</option>
                        </select>
                    </div>
                    <div class="form-group" style="flex: 1;">
                        <label for="backstoryImportance">Importance</label>
                        <select id="backstoryImportance">
                            <option value="minor" ${element.data.importance === 'minor' ? 'selected' : ''}>Mineur</option>
                            <option value="major" ${element.data.importance === 'major' ? 'selected' : ''}>Majeur</option>
                            <option value="critical" ${element.data.importance === 'critical' ? 'selected' : ''}>Critique</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label>Personnages impliqués</label>
                    <div class="character-pills-container" id="backstoryCharactersContainer">
                        ${renderCharacterPills(element.data.characters_involved || [], 'backstoryCharacters')}
                    </div>
                </div>
            `;

        case 'knowledge_state':
            return `
                <div class="form-group">
                    <label for="ksCharacterId">Personnage</label>
                    <select id="ksCharacterId">
                        <option value="">Sélectionner un personnage</option>
                        ${project.characters.map(char => `<option value="${char.id}" ${element.data.character_id === char.id ? 'selected' : ''}>${char.name}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label for="ksAbout">Connaissance concernant</label>
                    <input type="text" id="ksAbout" value="${element.data.about || ''}">
                </div>
                <div class="form-group">
                    <label for="ksDetails">Détails</label>
                    <textarea id="ksDetails" rows="3">${element.data.details || ''}</textarea>
                </div>
            `;

        case 'location':
            return `
                <div class="form-group">
                    <label for="locName">Nom du lieu</label>
                    <input type="text" id="locName" value="${element.data.name || ''}">
                </div>
                <div class="form-group">
                    <label for="locCoordinates">Coordonnées</label>
                    <input type="text" id="locCoordinates" value="${element.data.coordinates || ''}">
                </div>
                <div class="form-group">
                    <label for="locDesc">Description</label>
                    <textarea id="locDesc" rows="3">${element.data.description || ''}</textarea>
                </div>
            `;

        case 'motive_means_opportunity':
            return `
                <div class="form-row">
                    <div class="form-group" style="flex: 1;">
                        <label for="mmCharacterId">Personnage *</label>
                        <select id="mmCharacterId" required>
                            <option value="">Sélectionner un personnage</option>
                            ${project.characters.map(char => `<option value="${char.id}" ${element.data.character_id === char.id ? 'selected' : ''}>${char.name}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group" style="flex: 1;">
                        <label for="forCrimeEvent">Pour crime/événement *</label>
                        <input type="text" id="forCrimeEvent" placeholder="ex: Meurtre de Jean Dupont" value="${element.data.for_crime || ''}" required>
                    </div>
                </div>
                <div class="form-group">
                    <label for="actualGuilt">Culpabilité réelle</label>
                    <select id="actualGuilt">
                        <option value="innocent" ${element.data.actual_guilt === 'innocent' ? 'selected' : ''}>Innocent</option>
                        <option value="guilty" ${element.data.actual_guilt === 'guilty' ? 'selected' : ''}>Coupable</option>
                        <option value="accomplice" ${element.data.actual_guilt === 'accomplice' ? 'selected' : ''}>Complice</option>
                        <option value="unknowing_participant" ${element.data.actual_guilt === 'unknowing_participant' ? 'selected' : ''}>Participant involontaire</option>
                    </select>
                </div>
                <div class="form-section" style="background-color: #fef5e7;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <h4 style="margin: 0;">Mobile</h4>
                        <select id="motiveStrength" style="width: auto; font-size: 14px;">
                            <option value="none" ${element.data.motive_strength === 'none' ? 'selected' : ''}>Aucun</option>
                            <option value="weak" ${element.data.motive_strength === 'weak' ? 'selected' : ''}>Faible</option>
                            <option value="moderate" ${element.data.motive_strength === 'moderate' ? 'selected' : ''}>Modéré</option>
                            <option value="strong" ${element.data.motive_strength === 'strong' ? 'selected' : ''}>Fort</option>
                            <option value="compelling" ${element.data.motive_strength === 'compelling' ? 'selected' : ''}>Convaincant</option>
                        </select>
                    </div>
                    <textarea id="mmMotive" rows="3" placeholder="Pourquoi ils le feraient...">${element.data.motive || ''}</textarea>
                </div>
                <div class="form-section" style="background-color: #ebf5fb;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <h4 style="margin: 0;">Moyens</h4>
                        <label style="display: flex; align-items: center; gap: 8px; margin: 0;">
                            <input type="checkbox" id="hasMeans" ${element.data.has_means ? 'checked' : ''}>
                            A les moyens
                        </label>
                    </div>
                    <textarea id="mmMeans" rows="3" placeholder="Outils, connaissances, capacité à le faire...">${element.data.means || ''}</textarea>
                </div>
                <div class="form-section" style="background-color: #e8f8f5;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <h4 style="margin: 0;">Opportunité</h4>
                        <label style="display: flex; align-items: center; gap: 8px; margin: 0;">
                            <input type="checkbox" id="hasOpportunity" ${element.data.has_opportunity ? 'checked' : ''}>
                            A l'opportunité
                        </label>
                    </div>
                    <textarea id="mmOpportunity" rows="3" placeholder="Quand/où ils auraient pu le faire...">${element.data.opportunity || ''}</textarea>
                </div>
            `;

        case 'question':
            return `
                <div class="form-group">
                    <label for="qText">Question *</label>
                    <textarea id="qText" rows="2" placeholder="Quelle question mystérieuse cela soulève-t-il ?" required>${element.data.question || ''}</textarea>
                </div>
                <div class="form-row">
                    <div class="form-group" style="flex: 1;">
                        <label for="qType">Type</label>
                        <select id="qType">
                            <option value="whodunit" ${element.data.question_type === 'whodunit' ? 'selected' : ''}>Qui l'a fait</option>
                            <option value="how" ${element.data.question_type === 'how' ? 'selected' : ''}>Comment</option>
                            <option value="why" ${element.data.question_type === 'why' ? 'selected' : ''}>Pourquoi</option>
                            <option value="when" ${element.data.question_type === 'when' ? 'selected' : ''}>Quand</option>
                            <option value="where" ${element.data.question_type === 'where' ? 'selected' : ''}>Où</option>
                            <option value="what" ${element.data.question_type === 'what' ? 'selected' : ''}>Quoi</option>
                        </select>
                    </div>
                    <div class="form-group" style="flex: 1;">
                        <label for="qImportance">Importance</label>
                        <select id="qImportance">
                            <option value="minor" ${element.data.importance === 'minor' ? 'selected' : ''}>Mineur</option>
                            <option value="major" ${element.data.importance === 'major' ? 'selected' : ''}>Majeur</option>
                            <option value="critical" ${element.data.importance === 'critical' ? 'selected' : ''}>Critique</option>
                        </select>
                    </div>
                    <div class="form-group" style="flex: 1;">
                        <label for="qStatus">Statut</label>
                        <select id="qStatus">
                            <option value="open" ${element.data.status === 'open' ? 'selected' : ''}>Ouvert</option>
                            <option value="answered" ${element.data.status === 'answered' ? 'selected' : ''}>Répondu</option>
                            <option value="partially_answered" ${element.data.status === 'partially_answered' ? 'selected' : ''}>Partiellement répondu</option>
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group" style="flex: 1;">
                        <label for="qRaisedScene">Soulevée dans la scène</label>
                        <select id="qRaisedScene">
                            <option value="">Sélectionner une scène</option>
                            ${renderSceneOptions(element.data.raised_scene)}
                        </select>
                    </div>
                    <div class="form-group" style="flex: 1;">
                        <label for="qAnsweredScene">Répondue dans la scène</label>
                        <select id="qAnsweredScene">
                            <option value="">Sélectionner une scène</option>
                            ${renderSceneOptions(element.data.answered_scene)}
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label>Scènes de préfiguration</label>
                    <div class="scene-pills-container" id="foreshadowingScenesContainer">
                        ${renderScenePills(element.data.foreshadowing_scenes || [], 'foreshadowingScenes')}
                    </div>
                </div>
                <div class="form-group">
                    <label for="qAnswer">Réponse</label>
                    <textarea id="qAnswer" rows="3" placeholder="Quelle est la réponse à cette question ?">${element.data.answer || ''}</textarea>
                </div>
            `;

        case 'red_herring':
            return `
                <div class="form-group">
                    <label for="whatItSuggestsRH">Ce qu'il suggère</label>
                    <textarea id="whatItSuggestsRH" rows="3" placeholder="À quelle fausse conclusion cela mène-t-il...">${element.data.what_it_suggests || ''}</textarea>
                </div>
                <div class="form-group">
                    <label for="misdirectsTo">Dirige les soupçons vers</label>
                    <select id="misdirectsTo">
                        <option value="">Sélectionner un personnage</option>
                        ${project.characters.map(char => `<option value="${char.id}" ${element.data.misdirects_to === char.id ? 'selected' : ''}>${char.name}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Fausses preuves / Indices trompeurs</label>
                    <div id="misleadingCluesContainer">
                        ${renderListItems(element.data.misleading_clues || [], 'misleadingClues')}
                    </div>
                    <button type="button" class="btn btn-secondary btn-sm" onclick="addListItem('misleadingClues', 'Ajouter un indice trompeur...')">
                        <i data-lucide="plus"></i> Ajouter
                    </button>
                </div>
                <div class="form-group">
                    <label for="intendedReaderImpact">Impact prévu sur le lecteur</label>
                    <textarea id="intendedReaderImpact" rows="3" style="background-color: #f3e8ff;" placeholder="Que doit penser/ressentir le lecteur ?">${element.data.intended_reader_impact || ''}</textarea>
                </div>
                <div class="form-row">
                    <div class="form-group" style="flex: 1;">
                        <label for="introducedScene">Introduit dans la scène</label>
                        <select id="introducedScene">
                            <option value="">Sélectionner une scène</option>
                            ${renderSceneOptions(element.data.introduced_scene)}
                        </select>
                    </div>
                    <div class="form-group" style="flex: 1;">
                        <label for="debunkedScene">Démenti dans la scène</label>
                        <select id="debunkedScene">
                            <option value="">Quand c'est prouvé faux</option>
                            ${renderSceneOptions(element.data.debunked_scene)}
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label for="rhStatus">Statut</label>
                    <select id="rhStatus">
                        <option value="active" ${element.data.status === 'active' ? 'selected' : ''}>Actif</option>
                        <option value="resolved" ${element.data.status === 'resolved' ? 'selected' : ''}>Résolu</option>
                        <option value="abandoned" ${element.data.status === 'abandoned' ? 'selected' : ''}>Abandonné</option>
                    </select>
                </div>
            `;

        case 'reversal':
            return `
                <div class="form-group">
                    <label for="setupBelief">Croyance établie *</label>
                    <textarea id="setupBelief" rows="3" placeholder="Ce que les lecteurs ont été amenés à croire..." required>${element.data.setup_belief || ''}</textarea>
                </div>
                <div class="form-group">
                    <label for="actualTruth">Vérité réelle *</label>
                    <textarea id="actualTruth" rows="3" placeholder="Ce qui est réellement vrai..." required>${element.data.actual_truth || ''}</textarea>
                </div>
                <div class="form-row">
                    <div class="form-group" style="flex: 1;">
                        <label for="reversalType">Type</label>
                        <select id="reversalType">
                            <option value="identity" ${element.data.reversal_type === 'identity' ? 'selected' : ''}>Identité</option>
                            <option value="motive" ${element.data.reversal_type === 'motive' ? 'selected' : ''}>Mobile</option>
                            <option value="victim" ${element.data.reversal_type === 'victim' ? 'selected' : ''}>Victime</option>
                            <option value="ally_is_enemy" ${element.data.reversal_type === 'ally_is_enemy' ? 'selected' : ''}>L'allié est l'ennemi</option>
                            <option value="enemy_is_ally" ${element.data.reversal_type === 'enemy_is_ally' ? 'selected' : ''}>L'ennemi est l'allié</option>
                            <option value="timeline" ${element.data.reversal_type === 'timeline' ? 'selected' : ''}>Chronologie</option>
                            <option value="method" ${element.data.reversal_type === 'method' ? 'selected' : ''}>Méthode</option>
                            <option value="location" ${element.data.reversal_type === 'location' ? 'selected' : ''}>Lieu</option>
                        </select>
                    </div>
                    <div class="form-group" style="flex: 1;">
                        <label for="reversalImpact">Impact</label>
                        <select id="reversalImpact">
                            <option value="minor" ${element.data.impact === 'minor' ? 'selected' : ''}>Mineur</option>
                            <option value="medium" ${element.data.impact === 'medium' ? 'selected' : ''}>Moyen</option>
                            <option value="major_twist" ${element.data.impact === 'major_twist' ? 'selected' : ''}>Rebondissement majeur</option>
                        </select>
                    </div>
                    <div class="form-group" style="flex: 1; display: flex; align-items: center; padding-top: 24px;">
                        <label style="display: flex; align-items: center; gap: 8px; margin: 0;">
                            <input type="checkbox" id="isEarned" ${element.data.is_earned ? 'checked' : ''}>
                            Bien mérité
                        </label>
                    </div>
                </div>
                <div class="form-section">
                    <h4>Scènes de mise en place</h4>
                    <div class="form-group">
                        <label>Scènes qui ont établi la fausse croyance</label>
                        <div class="scene-pills-container" id="setupScenesContainer">
                            ${renderScenePills(element.data.setup_scenes || [], 'setupScenes')}
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="reversalScene">Scène de révélation</label>
                        <select id="reversalScene">
                            <option value="">Sélectionner une scène</option>
                            ${renderSceneOptions(element.data.reversal_scene_id)}
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label for="foreshadowingNotes">Notes de préfiguration</label>
                    <textarea id="foreshadowingNotes" rows="4" placeholder="Comment cela a été préfiguré...">${element.data.foreshadowing_notes || ''}</textarea>
                </div>
            `;

        default:
            return '';
    }
}

function saveThrillerElement(event, elementId) {
    event.preventDefault();

    const element = thrillerBoardState.elements.find(el => el.id === elementId);
    if (!element) return;

    element.title = document.getElementById('elementTitle').value;
    element.description = document.getElementById('elementDescription').value;
    element.updatedAt = new Date().toISOString();

    // Save type-specific data
    switch (element.type) {
        case 'alibi':
            const witnessesContainer = document.getElementById('alibiWitnessesContainer');
            const witnesses = witnessesContainer ?
                Array.from(witnessesContainer.querySelectorAll('.character-pill')).map(pill => pill.dataset.charId) : [];

            const weaknessesContainer = document.getElementById('weaknessesContainer');
            const weaknesses = weaknessesContainer ?
                Array.from(weaknessesContainer.querySelectorAll('.list-item-input')).map(input => input.value).filter(v => v) : [];

            element.data = {
                character_id: document.getElementById('characterId').value,
                for_event: document.getElementById('forEvent').value,
                is_true: document.getElementById('isTrue').checked,
                claimed_location: document.getElementById('claimedLocation').value,
                claimed_activity: document.getElementById('claimedActivity').value,
                real_location: document.getElementById('realLocation').value,
                real_activity: document.getElementById('realActivity').value,
                witnesses: witnesses,
                weaknesses: weaknesses,
                verified_scene: document.getElementById('verifiedScene').value,
                broken_scene: document.getElementById('brokenScene').value
            };
            break;
        case 'clue':
            const clueCharactersContainer = document.getElementById('clueCharactersContainer');
            const clueCharacters = clueCharactersContainer ?
                Array.from(clueCharactersContainer.querySelectorAll('.character-pill')).map(pill => pill.dataset.charId) : [];

            element.data = {
                clue_type: document.getElementById('clueType').value,
                significance: document.getElementById('clueSignificance').value,
                is_genuine: document.getElementById('isGenuine').checked,
                what_it_suggests: document.getElementById('whatItSuggests').value,
                points_to_characters: clueCharacters,
                planted_scene: document.getElementById('plantedScene').value,
                discovered_scene: document.getElementById('discoveredScene').value,
                reader_sees_at: document.getElementById('readerSeesAt').value
            };
            break;
        case 'secret':
            element.data = {
                full_description: document.getElementById('secretFullDescription').value,
                secret_type: document.getElementById('secretType').value,
                importance: document.getElementById('secretImportance').value,
                holder_character_id: document.getElementById('holderCharacterId').value,
                about_character_id: document.getElementById('aboutCharacterId').value,
                planted_scene: document.getElementById('secretPlantedScene').value,
                revealed_scene: document.getElementById('secretRevealedScene').value,
                current_status: document.getElementById('secretCurrentStatus').value
            };
            break;
        case 'backstory':
            const backstoryCharactersContainer = document.getElementById('backstoryCharactersContainer');
            const backstoryCharacters = backstoryCharactersContainer ?
                Array.from(backstoryCharactersContainer.querySelectorAll('.character-pill')).map(pill => pill.dataset.charId) : [];

            element.data = {
                when_it_happened: document.getElementById('whenItHappened') ? document.getElementById('whenItHappened').value : '',
                event_type: document.getElementById('backstoryType') ? document.getElementById('backstoryType').value : 'other',
                importance: document.getElementById('backstoryImportance') ? document.getElementById('backstoryImportance').value : 'minor',
                characters_involved: backstoryCharacters
            };
            break;

        case 'knowledge_state':
            element.data = {
                character_id: document.getElementById('ksCharacterId') ? document.getElementById('ksCharacterId').value : '',
                about: document.getElementById('ksAbout') ? document.getElementById('ksAbout').value : '',
                details: document.getElementById('ksDetails') ? document.getElementById('ksDetails').value : ''
            };
            break;

        case 'location':
            element.data = {
                name: document.getElementById('locName') ? document.getElementById('locName').value : '',
                coordinates: document.getElementById('locCoordinates') ? document.getElementById('locCoordinates').value : '',
                description: document.getElementById('locDesc') ? document.getElementById('locDesc').value : ''
            };
            break;

        case 'motive_means_opportunity':
            element.data = {
                character_id: document.getElementById('mmCharacterId') ? document.getElementById('mmCharacterId').value : '',
                for_crime: document.getElementById('forCrimeEvent') ? document.getElementById('forCrimeEvent').value : '',
                actual_guilt: document.getElementById('actualGuilt') ? document.getElementById('actualGuilt').value : 'innocent',
                motive: document.getElementById('mmMotive') ? document.getElementById('mmMotive').value : '',
                motive_strength: document.getElementById('motiveStrength') ? document.getElementById('motiveStrength').value : 'none',
                means: document.getElementById('mmMeans') ? document.getElementById('mmMeans').value : '',
                has_means: document.getElementById('hasMeans') ? document.getElementById('hasMeans').checked : false,
                opportunity: document.getElementById('mmOpportunity') ? document.getElementById('mmOpportunity').value : '',
                has_opportunity: document.getElementById('hasOpportunity') ? document.getElementById('hasOpportunity').checked : false
            };
            break;

        case 'question':
            const foreshadowingScenesContainer = document.getElementById('foreshadowingScenesContainer');
            const foreshadowingScenes = foreshadowingScenesContainer ?
                Array.from(foreshadowingScenesContainer.querySelectorAll('.scene-pill')).map(pill => pill.dataset.sceneId) : [];

            element.data = {
                question: document.getElementById('qText') ? document.getElementById('qText').value : '',
                question_type: document.getElementById('qType') ? document.getElementById('qType').value : 'whodunit',
                importance: document.getElementById('qImportance') ? document.getElementById('qImportance').value : 'minor',
                status: document.getElementById('qStatus') ? document.getElementById('qStatus').value : 'open',
                raised_scene: document.getElementById('qRaisedScene') ? document.getElementById('qRaisedScene').value : '',
                answered_scene: document.getElementById('qAnsweredScene') ? document.getElementById('qAnsweredScene').value : '',
                foreshadowing_scenes: foreshadowingScenes,
                answer: document.getElementById('qAnswer') ? document.getElementById('qAnswer').value : ''
            };
            break;

        case 'red_herring':
            const misleadingCluesContainer = document.getElementById('misleadingCluesContainer');
            const misleadingClues = misleadingCluesContainer ?
                Array.from(misleadingCluesContainer.querySelectorAll('.list-item-input')).map(input => input.value).filter(v => v) : [];

            element.data = {
                what_it_suggests: document.getElementById('whatItSuggestsRH') ? document.getElementById('whatItSuggestsRH').value : '',
                misdirects_to: document.getElementById('misdirectsTo') ? document.getElementById('misdirectsTo').value : '',
                misleading_clues: misleadingClues,
                intended_reader_impact: document.getElementById('intendedReaderImpact') ? document.getElementById('intendedReaderImpact').value : '',
                introduced_scene: document.getElementById('introducedScene') ? document.getElementById('introducedScene').value : '',
                debunked_scene: document.getElementById('debunkedScene') ? document.getElementById('debunkedScene').value : '',
                status: document.getElementById('rhStatus') ? document.getElementById('rhStatus').value : 'active'
            };
            break;

        case 'reversal':
            const setupScenesContainer = document.getElementById('setupScenesContainer');
            const setupScenes = setupScenesContainer ?
                Array.from(setupScenesContainer.querySelectorAll('.scene-pill')).map(pill => pill.dataset.sceneId) : [];

            element.data = {
                setup_belief: document.getElementById('setupBelief') ? document.getElementById('setupBelief').value : '',
                actual_truth: document.getElementById('actualTruth') ? document.getElementById('actualTruth').value : '',
                reversal_type: document.getElementById('reversalType') ? document.getElementById('reversalType').value : 'identity',
                impact: document.getElementById('reversalImpact') ? document.getElementById('reversalImpact').value : 'medium',
                is_earned: document.getElementById('isEarned') ? document.getElementById('isEarned').checked : false,
                setup_scenes: setupScenes,
                reversal_scene_id: document.getElementById('reversalScene') ? document.getElementById('reversalScene').value : '',
                foreshadowing_notes: document.getElementById('foreshadowingNotes') ? document.getElementById('foreshadowingNotes').value : ''
            };
            break;
    }

    project.thrillerElements = thrillerBoardState.elements;
    renderThrillerElements();
    saveProject();

    event.target.closest('.modal-overlay').remove();
}

function deleteThrillerElement(elementId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) return;

    thrillerBoardState.elements = thrillerBoardState.elements.filter(el => el.id !== elementId);
    thrillerBoardState.connections = thrillerBoardState.connections.filter(conn =>
        conn.from !== elementId && conn.to !== elementId
    );

    project.thrillerElements = thrillerBoardState.elements;
    project.thrillerConnections = thrillerBoardState.connections;

    renderThrillerElements();
    saveProject();
}

// Kept for backwards compatibility, redirects to selectThrillerTab
function filterThrillerElements(filterType) {
    selectThrillerTab(filterType);
}

// ============================================
// CANVAS INTERACTION
// ============================================

function handleThrillerCanvasMouseDown(event) {
    // Handle canvas panning and element interactions
    // Implementation similar to arc-board
}

function handleThrillerCanvasMouseMove(event) {
    // Handle dragging elements
}

function handleThrillerCanvasMouseUp(event) {
    // Handle mouse up events
}

function handleThrillerCanvasWheel(event) {
    // Handle zooming
}

// ============================================
// CONTEXT PANEL
// ============================================

function updateThrillerContextPanel() {
    const content = document.getElementById('thrillerContextContent');
    if (!content) return;

    const elementCounts = {};
    thrillerBoardState.elements.forEach(element => {
        elementCounts[element.type] = (elementCounts[element.type] || 0) + 1;
    });

    content.innerHTML = `
        <div class="thriller-stats">
            <h4>Éléments (${thrillerBoardState.elements.length})</h4>
            ${Object.entries(THRILLER_TYPES).map(([key, type]) => `
                <div class="thriller-stat-item">
                    <span class="thriller-stat-icon" style="color: ${type.color}">
                        <i data-lucide="${type.icon}"></i>
                    </span>
                    <span class="thriller-stat-label">${type.label}</span>
                    <span class="thriller-stat-count">${elementCounts[key] || 0}</span>
                </div>
            `).join('')}
        </div>
        <div class="thriller-recent">
            <h4>Éléments récents</h4>
            ${thrillerBoardState.elements.slice(-5).reverse().map(element => {
                const typeData = THRILLER_TYPES[element.type];
                return `
                    <div class="thriller-recent-item" onclick="editThrillerElement('${element.id}')">
                        <span class="thriller-recent-icon" style="color: ${element.color}">
                            <i data-lucide="${typeData.icon}"></i>
                        </span>
                        <span class="thriller-recent-title">${element.title}</span>
                    </div>
                `;
            }).join('')}
        </div>
    `;

    setTimeout(() => {
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }, 50);
}

function toggleThrillerContextPanel() {
    thrillerBoardState.contextPanelOpen = !thrillerBoardState.contextPanelOpen;
    const panel = document.getElementById('thrillerContextPanel');
    if (panel) {
        panel.classList.toggle('collapsed', !thrillerBoardState.contextPanelOpen);
    }
}

// ============================================
// ZOOM AND NAVIGATION
// ============================================

function zoomThrillerBoard(direction) {
    const newZoom = Math.max(THRILLER_BOARD_CONFIG.minZoom,
        Math.min(THRILLER_BOARD_CONFIG.maxZoom, thrillerBoardState.zoom + direction * THRILLER_BOARD_CONFIG.zoomStep));

    thrillerBoardState.zoom = newZoom;
    updateThrillerZoomDisplay();

    const canvas = document.getElementById('thrillerBoardCanvas');
    if (canvas) {
        canvas.style.transform = `scale(${newZoom})`;
    }
}

function updateThrillerZoomDisplay() {
    const zoomDisplay = document.getElementById('thrillerZoomLevel');
    if (zoomDisplay) {
        zoomDisplay.textContent = `${Math.round(thrillerBoardState.zoom * 100)}%`;
    }
}

function fitThrillerBoardToScreen() {
    // Implementation to fit all elements in view
    thrillerBoardState.zoom = 1;
    thrillerBoardState.canvasOffset = { x: 0, y: 0 };
    updateThrillerZoomDisplay();

    const canvas = document.getElementById('thrillerBoardCanvas');
    if (canvas) {
        canvas.style.transform = 'scale(1) translate(0, 0)';
    }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function selectThrillerElement(elementId) {
    // Handle element selection
    thrillerBoardState.selectedElements = [elementId];
    // Update visual selection
}

function generateId() {
    return 'thriller_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Helper function to render character pills
function renderCharacterPills(selectedCharacters, fieldName) {
    if (!project.characters || project.characters.length === 0) {
        return '<p style="color: #999;">No characters available</p>';
    }

    let html = '<div class="pills-wrapper">';

    // Render selected character pills
    selectedCharacters.forEach(charId => {
        const char = project.characters.find(c => c.id === charId);
        if (char) {
            html += `
                <span class="character-pill" data-char-id="${charId}">
                    ${char.name}
                    <button type="button" class="pill-remove" onclick="removeCharacterPill('${fieldName}', '${charId}')">×</button>
                </span>
            `;
        }
    });

    html += '</div>';

    // Add character selector
    html += `
        <select class="pill-selector" onchange="addCharacterPill('${fieldName}', this.value); this.value='';">
            <option value="">Add character...</option>
            ${project.characters.filter(c => !selectedCharacters.includes(c.id)).map(char =>
                `<option value="${char.id}">${char.name}</option>`
            ).join('')}
        </select>
    `;

    return html;
}

// Helper function to render scene options
function renderSceneOptions(selectedSceneId) {
    if (!project.chapters || project.chapters.length === 0) {
        return '';
    }

    let options = '';
    project.chapters.forEach(chapter => {
        if (chapter.scenes && chapter.scenes.length > 0) {
            chapter.scenes.forEach(scene => {
                const sceneLabel = `${chapter.title}: ${scene.title || 'Scène ' + (chapter.scenes.indexOf(scene) + 1)}`;
                const selected = selectedSceneId === scene.id ? 'selected' : '';
                options += `<option value="${scene.id}" ${selected}>${sceneLabel}</option>`;
            });
        }
    });

    return options;
}

// Helper function to render scene pills
function renderScenePills(selectedScenes, fieldName) {
    if (!project.chapters || project.chapters.length === 0) {
        return '<p style="color: #999;">No scenes available</p>';
    }

    let html = '<div class="pills-wrapper">';

    // Render selected scene pills
    selectedScenes.forEach(sceneId => {
        let sceneLabel = '';
        project.chapters.forEach(chapter => {
            if (chapter.scenes) {
                const scene = chapter.scenes.find(s => s.id === sceneId);
                if (scene) {
                    sceneLabel = `${chapter.title}: Scène ${chapter.scenes.indexOf(scene) + 1}`;
                }
            }
        });

        if (sceneLabel) {
            html += `
                <span class="scene-pill" data-scene-id="${sceneId}">
                    ${sceneLabel}
                    <button type="button" class="pill-remove" onclick="removeScenePill('${fieldName}', '${sceneId}')">×</button>
                </span>
            `;
        }
    });

    html += '</div>';

    // Add scene selector
    html += `
        <select class="pill-selector" onchange="addScenePill('${fieldName}', this.value); this.value='';">
            <option value="">Add scene...</option>
    `;

    project.chapters.forEach(chapter => {
        if (chapter.scenes && chapter.scenes.length > 0) {
            chapter.scenes.forEach(scene => {
                if (!selectedScenes.includes(scene.id)) {
                    const sceneLabel = `${chapter.title}: Scène ${chapter.scenes.indexOf(scene) + 1}`;
                    html += `<option value="${scene.id}">${sceneLabel}</option>`;
                }
            });
        }
    });

    html += '</select>';

    return html;
}

// Helper function to render list items (for weaknesses, misleading clues, etc.)
function renderListItems(items, fieldName) {
    if (!items || items.length === 0) {
        return '';
    }

    return items.map((item, index) => `
        <div class="list-item-row">
            <input type="text" class="list-item-input" value="${item}" data-field="${fieldName}" data-index="${index}" />
            <button type="button" class="btn btn-ghost btn-xs" onclick="removeListItem('${fieldName}', ${index})">
                <i data-lucide="x"></i>
            </button>
        </div>
    `).join('');
}

// Functions to manage character pills
function addCharacterPill(fieldName, charId) {
    if (!charId) return;

    const container = document.getElementById(fieldName + 'Container');
    if (!container) return;

    // Get current selected characters
    const currentPills = Array.from(container.querySelectorAll('.character-pill')).map(pill => pill.dataset.charId);
    currentPills.push(charId);

    // Re-render pills
    container.innerHTML = renderCharacterPills(currentPills, fieldName);

    // Refresh icons
    setTimeout(() => {
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }, 50);
}

function removeCharacterPill(fieldName, charId) {
    const container = document.getElementById(fieldName + 'Container');
    if (!container) return;

    // Get current selected characters
    const currentPills = Array.from(container.querySelectorAll('.character-pill'))
        .map(pill => pill.dataset.charId)
        .filter(id => id !== charId);

    // Re-render pills
    container.innerHTML = renderCharacterPills(currentPills, fieldName);

    // Refresh icons
    setTimeout(() => {
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }, 50);
}

// Functions to manage scene pills
function addScenePill(fieldName, sceneId) {
    if (!sceneId) return;

    const container = document.getElementById(fieldName + 'Container');
    if (!container) return;

    // Get current selected scenes
    const currentPills = Array.from(container.querySelectorAll('.scene-pill')).map(pill => pill.dataset.sceneId);
    currentPills.push(sceneId);

    // Re-render pills
    container.innerHTML = renderScenePills(currentPills, fieldName);

    // Refresh icons
    setTimeout(() => {
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }, 50);
}

function removeScenePill(fieldName, sceneId) {
    const container = document.getElementById(fieldName + 'Container');
    if (!container) return;

    // Get current selected scenes
    const currentPills = Array.from(container.querySelectorAll('.scene-pill'))
        .map(pill => pill.dataset.sceneId)
        .filter(id => id !== sceneId);

    // Re-render pills
    container.innerHTML = renderScenePills(currentPills, fieldName);

    // Refresh icons
    setTimeout(() => {
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }, 50);
}

// Functions to manage list items
function addListItem(fieldName, placeholder) {
    const container = document.getElementById(fieldName + 'Container');
    if (!container) return;

    const newItem = document.createElement('div');
    newItem.className = 'list-item-row';
    newItem.innerHTML = `
        <input type="text" class="list-item-input" placeholder="${placeholder}" data-field="${fieldName}" />
        <button type="button" class="btn btn-ghost btn-xs" onclick="this.parentElement.remove()">
            <i data-lucide="x"></i>
        </button>
    `;

    container.appendChild(newItem);

    // Focus the new input
    newItem.querySelector('input').focus();

    // Refresh icons
    setTimeout(() => {
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }, 50);
}

function removeListItem(fieldName, index) {
    const container = document.getElementById(fieldName + 'Container');
    if (!container) return;

    const items = container.querySelectorAll('.list-item-row');
    if (items[index]) {
        items[index].remove();
    }
}