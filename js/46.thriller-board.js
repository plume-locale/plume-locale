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
                <div class="form-group">
                    <label for="characterId">Personnage</label>
                    <select id="characterId">
                        <option value="">Sélectionner un personnage</option>
                        ${project.characters.map(char => `<option value="${char.id}" ${element.data.character_id === char.id ? 'selected' : ''}>${char.name}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label for="forEvent">Événement couvert</label>
                    <input type="text" id="forEvent" value="${element.data.for_event || ''}">
                </div>
                <div class="form-group">
                    <label for="claimedLocation">Lieu prétendu</label>
                    <input type="text" id="claimedLocation" value="${element.data.claimed_location || ''}">
                </div>
                <div class="form-group">
                    <label for="isTrue">Est-ce vrai ?</label>
                    <select id="isTrue">
                        <option value="true" ${element.data.is_true ? 'selected' : ''}>Vrai</option>
                        <option value="false" ${!element.data.is_true ? 'selected' : ''}>Faux</option>
                    </select>
                </div>
            `;

        case 'clue':
            return `
                <div class="form-group">
                    <label for="clueType">Type d'indice</label>
                    <select id="clueType">
                        <option value="physical" ${element.data.clue_type === 'physical' ? 'selected' : ''}>Physique</option>
                        <option value="testimonial" ${element.data.clue_type === 'testimonial' ? 'selected' : ''}>Témoignage</option>
                        <option value="circumstantial" ${element.data.clue_type === 'circumstantial' ? 'selected' : ''}>Circonstanciel</option>
                        <option value="digital" ${element.data.clue_type === 'digital' ? 'selected' : ''}>Numérique</option>
                        <option value="forensic" ${element.data.clue_type === 'forensic' ? 'selected' : ''}>Scientifique</option>
                        <option value="documentary" ${element.data.clue_type === 'documentary' ? 'selected' : ''}>Documentaire</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="isGenuine">Est authentique ?</label>
                    <select id="isGenuine">
                        <option value="true" ${element.data.is_genuine !== false ? 'selected' : ''}>Oui</option>
                        <option value="false" ${element.data.is_genuine === false ? 'selected' : ''}>Non (fabriqué)</option>
                    </select>
                </div>
            `;

        case 'secret':
            return `
                <div class="form-group">
                    <label for="holderCharacterId">Détenteur du secret</label>
                    <select id="holderCharacterId">
                        <option value="">Sélectionner un personnage</option>
                        ${project.characters.map(char => `<option value="${char.id}" ${element.data.holder_character_id === char.id ? 'selected' : ''}>${char.name}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label for="aboutCharacterId">Secret concernant</label>
                    <select id="aboutCharacterId">
                        <option value="">Sélectionner un personnage</option>
                        ${project.characters.map(char => `<option value="${char.id}" ${element.data.about_character_id === char.id ? 'selected' : ''}>${char.name}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label for="secretType">Type de secret</label>
                    <select id="secretType">
                        <option value="identity" ${element.data.secret_type === 'identity' ? 'selected' : ''}>Identité</option>
                        <option value="crime" ${element.data.secret_type === 'crime' ? 'selected' : ''}>Crime</option>
                        <option value="relationship" ${element.data.secret_type === 'relationship' ? 'selected' : ''}>Relation</option>
                        <option value="past" ${element.data.secret_type === 'past' ? 'selected' : ''}>Passé</option>
                        <option value="ability" ${element.data.secret_type === 'ability' ? 'selected' : ''}>Capacité</option>
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
                    <label for="qText">Question</label>
                    <input type="text" id="qText" value="${element.data.question || ''}">
                </div>
                <div class="form-group">
                    <label for="qResolved">Résolue ?</label>
                    <select id="qResolved">
                        <option value="false" ${!element.data.resolved ? 'selected' : ''}>Non</option>
                        <option value="true" ${element.data.resolved ? 'selected' : ''}>Oui</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="qAnswer">Réponse (si connue)</label>
                    <textarea id="qAnswer" rows="3">${element.data.answer || ''}</textarea>
                </div>
            `;

        case 'red_herring':
            return `
                <div class="form-group">
                    <label for="rhReason">Raison / Origine</label>
                    <input type="text" id="rhReason" value="${element.data.reason || ''}">
                </div>
                <div class="form-group">
                    <label for="rhNotes">Notes</label>
                    <textarea id="rhNotes" rows="3">${element.data.notes || ''}</textarea>
                </div>
                <div class="form-group">
                    <label for="rhDeliberate">Délibéré ?</label>
                    <select id="rhDeliberate">
                        <option value="false" ${!element.data.deliberate ? 'selected' : ''}>Non</option>
                        <option value="true" ${element.data.deliberate ? 'selected' : ''}>Oui</option>
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
            element.data = {
                character_id: document.getElementById('characterId').value,
                for_event: document.getElementById('forEvent').value,
                claimed_location: document.getElementById('claimedLocation').value,
                is_true: document.getElementById('isTrue').value === 'true'
            };
            break;
        case 'clue':
            element.data = {
                clue_type: document.getElementById('clueType').value,
                is_genuine: document.getElementById('isGenuine').value === 'true'
            };
            break;
        case 'secret':
            element.data = {
                holder_character_id: document.getElementById('holderCharacterId').value,
                about_character_id: document.getElementById('aboutCharacterId').value,
                secret_type: document.getElementById('secretType').value
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
            element.data = {
                question: document.getElementById('qText') ? document.getElementById('qText').value : '',
                resolved: document.getElementById('qResolved') ? document.getElementById('qResolved').value === 'true' : false,
                answer: document.getElementById('qAnswer') ? document.getElementById('qAnswer').value : ''
            };
            break;

        case 'red_herring':
            element.data = {
                reason: document.getElementById('rhReason') ? document.getElementById('rhReason').value : '',
                notes: document.getElementById('rhNotes') ? document.getElementById('rhNotes').value : '',
                deliberate: document.getElementById('rhDeliberate') ? document.getElementById('rhDeliberate').value === 'true' : false
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