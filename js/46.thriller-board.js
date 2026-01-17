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
        description: 'Character alibi for an event'
    },
    backstory: {
        label: 'Backstory',
        icon: 'history',
        color: '#8e44ad',
        description: 'Character background information'
    },
    clue: {
        label: 'Clue',
        icon: 'search',
        color: '#e67e22',
        description: 'Evidence or hint in the mystery'
    },
    knowledge_state: {
        label: 'Knowledge State',
        icon: 'brain',
        color: '#3498db',
        description: 'What a character knows'
    },
    location: {
        label: 'Location',
        icon: 'map-pin',
        color: '#16a085',
        description: 'Important location in the story'
    },
    motive_means_opportunity: {
        label: 'Motive/Means/Opportunity',
        icon: 'target',
        color: '#e74c3c',
        description: 'Suspect\'s potential for committing crime'
    },
    question: {
        label: 'Question',
        icon: 'help-circle',
        color: '#f39c12',
        description: 'Mystery question to be answered'
    },
    red_herring: {
        label: 'Red Herring',
        icon: 'fish',
        color: '#9b59b6',
        description: 'False lead or misleading clue'
    },
    reversal: {
        label: 'Reversal',
        icon: 'rotate-ccw',
        color: '#d35400',
        description: 'Plot twist or revelation'
    },
    secret: {
        label: 'Secret',
        icon: 'lock',
        color: '#c0392b',
        description: 'Hidden information'
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
    currentFilter: 'all',
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
            <!-- Toolbar -->
            <div class="thriller-board-toolbar">
                <div class="thriller-toolbar-left">
                    <button class="btn btn-secondary" onclick="addThrillerElement()">
                        <i data-lucide="plus"></i>
                        Ajouter élément
                    </button>
                    <div class="thriller-filter">
                        <select id="thrillerFilter" onchange="filterThrillerElements(this.value)">
                            <option value="all">Tous les éléments</option>
                            <option value="alibi">Alibis</option>
                            <option value="clue">Indices</option>
                            <option value="secret">Secrets</option>
                            <option value="question">Questions</option>
                            <option value="motive_means_opportunity">Motive/Means/Opportunity</option>
                            <option value="location">Lieux</option>
                            <option value="backstory">Backstories</option>
                            <option value="knowledge_state">États de connaissance</option>
                            <option value="red_herring">Fausses pistes</option>
                            <option value="reversal">Reversements</option>
                        </select>
                    </div>
                </div>
                <div class="thriller-toolbar-center">
                    <button class="btn btn-ghost" onclick="zoomThrillerBoard(-1)">
                        <i data-lucide="zoom-out"></i>
                    </button>
                    <span id="thrillerZoomLevel">100%</span>
                    <button class="btn btn-ghost" onclick="zoomThrillerBoard(1)">
                        <i data-lucide="zoom-in"></i>
                    </button>
                    <button class="btn btn-ghost" onclick="fitThrillerBoardToScreen()">
                        <i data-lucide="maximize"></i>
                    </button>
                </div>
                <div class="thriller-toolbar-right">
                    <button class="btn btn-ghost" onclick="toggleThrillerContextPanel()">
                        <i data-lucide="sidebar"></i>
                    </button>
                </div>
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
    if (!type) {
        // Show type selection modal
        showThrillerTypeSelector();
        return;
    }

    const elementType = THRILLER_TYPES[type];
    if (!elementType) return;

    const newElement = {
        id: generateId(),
        type: type,
        title: `${elementType.label} ${thrillerBoardState.elements.length + 1}`,
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

function showThrillerTypeSelector() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <div class="modal-header">
                <h3>Choisir un type d'élément</h3>
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                    <i data-lucide="x"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="thriller-type-grid">
                    ${Object.entries(THRILLER_TYPES).map(([key, type]) => `
                        <button class="thriller-type-card" onclick="addThrillerElement('${key}'); this.closest('.modal-overlay').remove();">
                            <div class="thriller-type-icon" style="color: ${type.color}">
                                <i data-lucide="${type.icon}"></i>
                            </div>
                            <div class="thriller-type-label">${type.label}</div>
                            <div class="thriller-type-desc">${type.description}</div>
                        </button>
                    `).join('')}
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    setTimeout(() => {
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }, 50);
}

function renderThrillerElements() {
    const content = document.getElementById('thrillerBoardContent');
    if (!content) return;

    const filteredElements = thrillerBoardState.currentFilter === 'all'
        ? thrillerBoardState.elements
        : thrillerBoardState.elements.filter(el => el.type === thrillerBoardState.currentFilter);

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
                        <label for="characterId">Character</label>
                        <select id="characterId">
                            <option value="">Select character</option>
                            ${project.characters.map(char => `<option value="${char.id}" ${element.data.character_id === char.id ? 'selected' : ''}>${char.name}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group" style="flex: 1;">
                        <label for="forEvent">For Event</label>
                        <input type="text" id="forEvent" value="${element.data.for_event || ''}">
                    </div>
                </div>
                <div class="form-group">
                    <label style="display: flex; align-items: center; gap: 8px;">
                        <input type="checkbox" id="isTrue" ${element.data.is_true ? 'checked' : ''}>
                        Is this alibi true?
                    </label>
                    <small style="color: #666; margin-left: 24px;">Toggle off if this is a false alibi</small>
                </div>
                <div class="form-section">
                    <h4>Claimed Alibi</h4>
                    <div class="form-row">
                        <div class="form-group" style="flex: 1;">
                            <label for="claimedLocation">Claimed Location</label>
                            <input type="text" id="claimedLocation" placeholder="Where they claim to have been" value="${element.data.claimed_location || ''}">
                        </div>
                        <div class="form-group" style="flex: 1;">
                            <label for="claimedActivity">Claimed Activity</label>
                            <input type="text" id="claimedActivity" placeholder="What they claim to have done" value="${element.data.claimed_activity || ''}">
                        </div>
                    </div>
                </div>
                <div class="form-section" style="background-color: #fff5f5;">
                    <h4 style="color: #c0392b;">Reality (Hidden)</h4>
                    <div class="form-row">
                        <div class="form-group" style="flex: 1;">
                            <label for="realLocation">Real Location</label>
                            <input type="text" id="realLocation" placeholder="Where they actually were" value="${element.data.real_location || ''}">
                        </div>
                        <div class="form-group" style="flex: 1;">
                            <label for="realActivity">Real Activity</label>
                            <input type="text" id="realActivity" placeholder="What they actually did" value="${element.data.real_activity || ''}">
                        </div>
                    </div>
                </div>
                <div class="form-group">
                    <label>Witnesses</label>
                    <div class="character-pills-container" id="alibiWitnessesContainer">
                        ${renderCharacterPills(element.data.witnesses || [], 'alibiWitnesses')}
                    </div>
                </div>
                <div class="form-group">
                    <label>Weaknesses / Holes in Alibi</label>
                    <div id="weaknessesContainer">
                        ${renderListItems(element.data.weaknesses || [], 'weaknesses')}
                    </div>
                    <button type="button" class="btn btn-secondary btn-sm" onclick="addListItem('weaknesses', 'Add a weakness...')">
                        <i data-lucide="plus"></i> Add
                    </button>
                </div>
                <div class="form-row">
                    <div class="form-group" style="flex: 1;">
                        <label for="verifiedScene">Verified in Scene</label>
                        <select id="verifiedScene">
                            <option value="">Select scene</option>
                            ${renderSceneOptions(element.data.verified_scene)}
                        </select>
                    </div>
                    <div class="form-group" style="flex: 1;">
                        <label for="brokenScene">Broken in Scene</label>
                        <select id="brokenScene">
                            <option value="">When alibi is broken</option>
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
                            <option value="physical" ${element.data.clue_type === 'physical' ? 'selected' : ''}>Physical</option>
                            <option value="testimonial" ${element.data.clue_type === 'testimonial' ? 'selected' : ''}>Testimonial</option>
                            <option value="circumstantial" ${element.data.clue_type === 'circumstantial' ? 'selected' : ''}>Circumstantial</option>
                            <option value="digital" ${element.data.clue_type === 'digital' ? 'selected' : ''}>Digital</option>
                            <option value="forensic" ${element.data.clue_type === 'forensic' ? 'selected' : ''}>Forensic</option>
                            <option value="documentary" ${element.data.clue_type === 'documentary' ? 'selected' : ''}>Documentary</option>
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group" style="flex: 1;">
                        <label for="clueSignificance">Significance</label>
                        <select id="clueSignificance">
                            <option value="minor" ${element.data.significance === 'minor' ? 'selected' : ''}>Minor</option>
                            <option value="major" ${element.data.significance === 'major' ? 'selected' : ''}>Major</option>
                            <option value="critical" ${element.data.significance === 'critical' ? 'selected' : ''}>Critical</option>
                        </select>
                    </div>
                    <div class="form-group" style="flex: 1;">
                        <label style="display: flex; align-items: center; gap: 8px;">
                            <input type="checkbox" id="isGenuine" ${element.data.is_genuine !== false ? 'checked' : ''}>
                            Genuine Evidence
                        </label>
                    </div>
                </div>
                <div class="form-group">
                    <label for="whatItSuggests">What It Suggests</label>
                    <textarea id="whatItSuggests" rows="3">${element.data.what_it_suggests || ''}</textarea>
                </div>
                <div class="form-group">
                    <label>Points To Characters</label>
                    <div class="character-pills-container" id="clueCharactersContainer">
                        ${renderCharacterPills(element.data.points_to_characters || [], 'clueCharacters')}
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group" style="flex: 1;">
                        <label for="plantedScene">Planted Scene</label>
                        <select id="plantedScene">
                            <option value="">Select</option>
                            ${renderSceneOptions(element.data.planted_scene)}
                        </select>
                    </div>
                    <div class="form-group" style="flex: 1;">
                        <label for="discoveredScene">Discovered Scene</label>
                        <select id="discoveredScene">
                            <option value="">Select</option>
                            ${renderSceneOptions(element.data.discovered_scene)}
                        </select>
                    </div>
                    <div class="form-group" style="flex: 1;">
                        <label for="readerSeesAt">Reader Sees At</label>
                        <select id="readerSeesAt">
                            <option value="">Select</option>
                            ${renderSceneOptions(element.data.reader_sees_at)}
                        </select>
                    </div>
                </div>
            `;

        case 'secret':
            return `
                <div class="form-group">
                    <label for="secretFullDescription">Full Description</label>
                    <textarea id="secretFullDescription" rows="3" placeholder="Describe the secret in detail...">${element.data.full_description || ''}</textarea>
                </div>
                <div class="form-row">
                    <div class="form-group" style="flex: 1;">
                        <label for="secretType">Secret Type</label>
                        <select id="secretType">
                            <option value="relationship" ${element.data.secret_type === 'relationship' ? 'selected' : ''}>Relationship</option>
                            <option value="identity" ${element.data.secret_type === 'identity' ? 'selected' : ''}>Identity</option>
                            <option value="crime" ${element.data.secret_type === 'crime' ? 'selected' : ''}>Crime</option>
                            <option value="past" ${element.data.secret_type === 'past' ? 'selected' : ''}>Past</option>
                            <option value="ability" ${element.data.secret_type === 'ability' ? 'selected' : ''}>Ability</option>
                        </select>
                    </div>
                    <div class="form-group" style="flex: 1;">
                        <label for="secretImportance">Importance</label>
                        <select id="secretImportance">
                            <option value="minor" ${element.data.importance === 'minor' ? 'selected' : ''}>Minor</option>
                            <option value="major" ${element.data.importance === 'major' ? 'selected' : ''}>Major</option>
                            <option value="critical" ${element.data.importance === 'critical' ? 'selected' : ''}>Critical</option>
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group" style="flex: 1;">
                        <label for="holderCharacterId">Held by Character</label>
                        <select id="holderCharacterId">
                            <option value="">Who knows this secret</option>
                            ${project.characters.map(char => `<option value="${char.id}" ${element.data.holder_character_id === char.id ? 'selected' : ''}>${char.name}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group" style="flex: 1;">
                        <label for="aboutCharacterId">About Character</label>
                        <select id="aboutCharacterId">
                            <option value="">Select</option>
                            ${project.characters.map(char => `<option value="${char.id}" ${element.data.about_character_id === char.id ? 'selected' : ''}>${char.name}</option>`).join('')}
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group" style="flex: 1;">
                        <label for="secretPlantedScene">Planted in Scene</label>
                        <select id="secretPlantedScene">
                            <option value="">First clues appear</option>
                            ${renderSceneOptions(element.data.planted_scene)}
                        </select>
                    </div>
                    <div class="form-group" style="flex: 1;">
                        <label for="secretRevealedScene">Revealed in Scene</label>
                        <select id="secretRevealedScene">
                            <option value="">Secret is revealed</option>
                            ${renderSceneOptions(element.data.revealed_scene)}
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label for="secretCurrentStatus">Current Status</label>
                    <select id="secretCurrentStatus">
                        <option value="hidden" ${element.data.current_status === 'hidden' ? 'selected' : ''}>Hidden</option>
                        <option value="partially_revealed" ${element.data.current_status === 'partially_revealed' ? 'selected' : ''}>Partially Revealed</option>
                        <option value="fully_revealed" ${element.data.current_status === 'fully_revealed' ? 'selected' : ''}>Fully Revealed</option>
                    </select>
                </div>
            `;

        case 'backstory':
            return `
                <div class="form-group">
                    <label for="bsCharacterId">Personnage</label>
                    <select id="bsCharacterId">
                        <option value="">Sélectionner un personnage</option>
                        ${project.characters.map(char => `<option value="${char.id}" ${element.data.character_id === char.id ? 'selected' : ''}>${char.name}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label for="bsPeriod">Période / Date</label>
                    <input type="text" id="bsPeriod" value="${element.data.period || ''}">
                </div>
                <div class="form-group">
                    <label for="bsSummary">Résumé</label>
                    <textarea id="bsSummary" rows="4">${element.data.summary || ''}</textarea>
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
                <div class="form-group">
                    <label for="mmCharacterId">Suspect</label>
                    <select id="mmCharacterId">
                        <option value="">Sélectionner un personnage</option>
                        ${project.characters.map(char => `<option value="${char.id}" ${element.data.character_id === char.id ? 'selected' : ''}>${char.name}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label for="mmMotive">Mobile</label>
                    <textarea id="mmMotive" rows="2">${element.data.motive || ''}</textarea>
                </div>
                <div class="form-group">
                    <label for="mmMeans">Moyens</label>
                    <textarea id="mmMeans" rows="2">${element.data.means || ''}</textarea>
                </div>
                <div class="form-group">
                    <label for="mmOpportunity">Opportunité</label>
                    <textarea id="mmOpportunity" rows="2">${element.data.opportunity || ''}</textarea>
                </div>
            `;

        case 'question':
            return `
                <div class="form-group">
                    <label for="qText">Question *</label>
                    <textarea id="qText" rows="2" placeholder="What mystery question does this raise?" required>${element.data.question || ''}</textarea>
                </div>
                <div class="form-row">
                    <div class="form-group" style="flex: 1;">
                        <label for="qType">Type</label>
                        <select id="qType">
                            <option value="whodunit" ${element.data.question_type === 'whodunit' ? 'selected' : ''}>Whodunit</option>
                            <option value="how" ${element.data.question_type === 'how' ? 'selected' : ''}>How</option>
                            <option value="why" ${element.data.question_type === 'why' ? 'selected' : ''}>Why</option>
                            <option value="when" ${element.data.question_type === 'when' ? 'selected' : ''}>When</option>
                            <option value="where" ${element.data.question_type === 'where' ? 'selected' : ''}>Where</option>
                            <option value="what" ${element.data.question_type === 'what' ? 'selected' : ''}>What</option>
                        </select>
                    </div>
                    <div class="form-group" style="flex: 1;">
                        <label for="qImportance">Importance</label>
                        <select id="qImportance">
                            <option value="minor" ${element.data.importance === 'minor' ? 'selected' : ''}>Minor</option>
                            <option value="major" ${element.data.importance === 'major' ? 'selected' : ''}>Major</option>
                            <option value="critical" ${element.data.importance === 'critical' ? 'selected' : ''}>Critical</option>
                        </select>
                    </div>
                    <div class="form-group" style="flex: 1;">
                        <label for="qStatus">Status</label>
                        <select id="qStatus">
                            <option value="open" ${element.data.status === 'open' ? 'selected' : ''}>Open</option>
                            <option value="answered" ${element.data.status === 'answered' ? 'selected' : ''}>Answered</option>
                            <option value="partially_answered" ${element.data.status === 'partially_answered' ? 'selected' : ''}>Partially Answered</option>
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group" style="flex: 1;">
                        <label for="qRaisedScene">Raised in Scene</label>
                        <select id="qRaisedScene">
                            <option value="">Select scene</option>
                            ${renderSceneOptions(element.data.raised_scene)}
                        </select>
                    </div>
                    <div class="form-group" style="flex: 1;">
                        <label for="qAnsweredScene">Answered in Scene</label>
                        <select id="qAnsweredScene">
                            <option value="">Select scene</option>
                            ${renderSceneOptions(element.data.answered_scene)}
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label>Foreshadowing Scenes</label>
                    <div class="scene-pills-container" id="foreshadowingScenesContainer">
                        ${renderScenePills(element.data.foreshadowing_scenes || [], 'foreshadowingScenes')}
                    </div>
                </div>
                <div class="form-group">
                    <label for="qAnswer">Answer</label>
                    <textarea id="qAnswer" rows="3" placeholder="What's the answer to this question?">${element.data.answer || ''}</textarea>
                </div>
            `;

        case 'red_herring':
            return `
                <div class="form-group">
                    <label for="whatItSuggestsRH">What it suggests</label>
                    <textarea id="whatItSuggestsRH" rows="3" placeholder="What false conclusion does this lead to...">${element.data.what_it_suggests || ''}</textarea>
                </div>
                <div class="form-group">
                    <label for="misdirectsTo">Misdirects suspicion to</label>
                    <select id="misdirectsTo">
                        <option value="">Select character</option>
                        ${project.characters.map(char => `<option value="${char.id}" ${element.data.misdirects_to === char.id ? 'selected' : ''}>${char.name}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>False Evidence / Misleading Clues</label>
                    <div id="misleadingCluesContainer">
                        ${renderListItems(element.data.misleading_clues || [], 'misleadingClues')}
                    </div>
                    <button type="button" class="btn btn-secondary btn-sm" onclick="addListItem('misleadingClues', 'Add misleading clue...')">
                        <i data-lucide="plus"></i> Add
                    </button>
                </div>
                <div class="form-group">
                    <label for="intendedReaderImpact">Intended Reader Impact</label>
                    <textarea id="intendedReaderImpact" rows="3" style="background-color: #f3e8ff;" placeholder="What should the reader think/feel?">${element.data.intended_reader_impact || ''}</textarea>
                </div>
                <div class="form-row">
                    <div class="form-group" style="flex: 1;">
                        <label for="introducedScene">Introduced in Scene</label>
                        <select id="introducedScene">
                            <option value="">Select scene</option>
                            ${renderSceneOptions(element.data.introduced_scene)}
                        </select>
                    </div>
                    <div class="form-group" style="flex: 1;">
                        <label for="debunkedScene">Debunked in Scene</label>
                        <select id="debunkedScene">
                            <option value="">When it's proven false</option>
                            ${renderSceneOptions(element.data.debunked_scene)}
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label for="rhStatus">Status</label>
                    <select id="rhStatus">
                        <option value="active" ${element.data.status === 'active' ? 'selected' : ''}>Active</option>
                        <option value="resolved" ${element.data.status === 'resolved' ? 'selected' : ''}>Resolved</option>
                        <option value="abandoned" ${element.data.status === 'abandoned' ? 'selected' : ''}>Abandoned</option>
                    </select>
                </div>
            `;

        case 'reversal':
            return `
                <div class="form-group">
                    <label for="rvAbout">Révélation concernant</label>
                    <input type="text" id="rvAbout" value="${element.data.about || ''}">
                </div>
                <div class="form-group">
                    <label for="rvDesc">Description de la révélation</label>
                    <textarea id="rvDesc" rows="3">${element.data.description || ''}</textarea>
                </div>
                <div class="form-group">
                    <label for="rvImpact">Impact</label>
                    <select id="rvImpact">
                        <option value="low" ${element.data.impact === 'low' ? 'selected' : ''}>Faible</option>
                        <option value="medium" ${element.data.impact === 'medium' ? 'selected' : ''}>Moyen</option>
                        <option value="high" ${element.data.impact === 'high' ? 'selected' : ''}>Élevé</option>
                    </select>
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
            element.data = {
                character_id: document.getElementById('bsCharacterId') ? document.getElementById('bsCharacterId').value : '',
                period: document.getElementById('bsPeriod') ? document.getElementById('bsPeriod').value : '',
                summary: document.getElementById('bsSummary') ? document.getElementById('bsSummary').value : ''
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
                motive: document.getElementById('mmMotive') ? document.getElementById('mmMotive').value : '',
                means: document.getElementById('mmMeans') ? document.getElementById('mmMeans').value : '',
                opportunity: document.getElementById('mmOpportunity') ? document.getElementById('mmOpportunity').value : ''
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
            element.data = {
                about: document.getElementById('rvAbout') ? document.getElementById('rvAbout').value : '',
                description: document.getElementById('rvDesc') ? document.getElementById('rvDesc').value : '',
                impact: document.getElementById('rvImpact') ? document.getElementById('rvImpact').value : 'medium'
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

function filterThrillerElements(filterType) {
    thrillerBoardState.currentFilter = filterType;
    renderThrillerElements();
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