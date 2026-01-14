/**
 * Characters Handlers
 * Responsible for handling all user interactions in the characters view
 */

const CharactersHandlers = (() => {
    /**
     * Attach event listeners to the characters list
     */
    function attachListHandlers() {
        const container = document.getElementById('charactersList');
        if (!container) return;

        // Event delegation for list items
        container.addEventListener('click', async (e) => {
            const listItem = e.target.closest('.character-list-item');
            if (listItem) {
                const characterId = parseInt(listItem.dataset.characterId);
                CharactersView.openDetail(characterId);
            }
        });
    }

    /**
     * Attach event listeners to the add character modal
     */
    function attachAddModalHandlers() {
        const form = document.getElementById('add-character-form');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await handleAddCharacter();
        });
    }

    /**
     * Attach event listeners to the character detail sheet
     */
    function attachDetailHandlers() {
        // Edit handlers for inline fields would go here
        // This is a simple example - more complex logic can be added
    }

    /**
     * Handle adding a new character
     */
    async function handleAddCharacter() {
        const name = document.getElementById('character-name')?.value.trim();
        const role = document.getElementById('character-role')?.value.trim();
        const description = document.getElementById('character-description')?.value.trim();

        if (!name) {
            alert('Le nom du personnage est requis');
            return;
        }

        try {
            const characterData = {
                name: name,
                firstName: name.split(' ')[0] || '',
                lastName: name.split(' ').slice(1).join(' ') || '',
                role: role || '',
                physicalDescription: description || '',
                color: generateRandomColor(),
                avatarEmoji: '🙂'
            };

            await CharacterService.create(characterData);
            
            // Close modal and refresh
            ModalUI.close();
            await CharactersView.render();
        } catch (error) {
            console.error('Error creating character:', error);
            alert('Erreur lors de la création du personnage');
        }
    }

    /**
     * Handle deleting a character
     * @param {number} characterId - Character ID
     */
    async function handleDelete(characterId) {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce personnage ? Cette action ne peut pas être annulée.')) {
            return;
        }

        try {
            await CharacterService.remove(characterId);
            await CharactersView.render();
        } catch (error) {
            console.error('Error deleting character:', error);
            alert('Erreur lors de la suppression du personnage');
        }
    }

    /**
     * Handle changing character avatar
     * @param {number} characterId - Character ID
     */
    function changeAvatar(characterId) {
        const character = CharacterService.findById(characterId);
        if (!character) return;

        const emojiPicker = [
            '😀', '😃', '😄', '😁', '😆', '😊', '😇', '🙂',
            '🤗', '🤩', '😍', '😘', '😚', '😙', '😗', '😌',
            '😔', '😍', '😔', '🤐', '😐', '😑', '😶', '🙄',
            '🧐', '🤨', '😏', '😒', '🙁', '☹️', '😲', '😞',
            '😖', '😢', '😭', '😤', '😠', '😡', '🤬', '😈',
            '👿', '💀', '☠️', '💩', '🤡', '👹', '👺', '👻'
        ];

        let html = '<div class="emoji-picker" style="display: grid; grid-template-columns: repeat(8, 1fr); gap: 0.5rem; padding: 1rem;">';
        emojiPicker.forEach(emoji => {
            html += `<button type="button" onclick="CharactersHandlers.setAvatar(${characterId}, '${emoji}')" style="
                background: none;
                border: 1px solid var(--border-color);
                padding: 0.5rem;
                font-size: 1.5em;
                cursor: pointer;
                border-radius: 4px;
                transition: all 0.2s;
            " onmouseover="this.style.background = 'var(--bg-secondary)'" onmouseout="this.style.background = 'none'">
                ${emoji}
            </button>`;
        });
        html += '</div>';

        ModalUI.open('emoji-picker-modal', html);
    }

    /**
     * Set character avatar
     * @param {number} characterId - Character ID
     * @param {string} emoji - Emoji character
     */
    async function setAvatar(characterId, emoji) {
        try {
            await CharacterService.update(characterId, { avatarEmoji: emoji });
            ModalUI.close();
            CharactersView.openDetail(characterId);
        } catch (error) {
            console.error('Error setting avatar:', error);
            alert('Erreur lors de la modification de l\'avatar');
        }
    }

    /**
     * Handle inline editing of character fields
     * @param {number} characterId - Character ID
     * @param {string} fieldName - Field name
     * @param {string} newValue - New value
     */
    async function handleFieldUpdate(characterId, fieldName, newValue) {
        try {
            await CharacterService.update(characterId, { [fieldName]: newValue });
        } catch (error) {
            console.error('Error updating character field:', error);
            alert('Erreur lors de la mise à jour');
        }
    }

    /**
     * Open character relationship modal
     * @param {number} characterId - Character ID
     */
    function openRelationshipsModal(characterId) {
        const character = CharacterService.findById(characterId);
        if (!character) return;

        const relationships = character.relations || [];
        const otherCharacters = CharacterService.findAll()
            .filter(c => c.id !== characterId);

        let html = `
            <div class="modal-content relationships-modal">
                <h2>Relations du personnage</h2>
                <div style="margin-bottom: 2rem;">
                    <h3>Ajouter une relation</h3>
                    <div style="display: grid; gap: 1rem;">
                        <div class="form-group">
                            <label for="related-character">Personnage lié</label>
                            <select id="related-character">
                                <option value="">Sélectionner un personnage...</option>
                                ${otherCharacters.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="relationship-type">Type de relation</label>
                            <select id="relationship-type">
                                <option value="family">Famille</option>
                                <option value="friend">Ami(e)</option>
                                <option value="enemy">Ennemi(e)</option>
                                <option value="ally">Allié(e)</option>
                                <option value="rival">Rival(e)</option>
                                <option value="romance">Romance</option>
                                <option value="mentor">Mentor</option>
                                <option value="other">Autre</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="relationship-description">Description</label>
                            <textarea id="relationship-description" rows="3" placeholder="Décrivez la relation..."></textarea>
                        </div>
                        <button onclick="CharactersHandlers.addRelationship(${characterId})" style="padding: 0.5rem 1.5rem;">Ajouter</button>
                    </div>
                </div>

                <h3>Relations existantes</h3>
                <div style="max-height: 300px; overflow-y: auto;">
                    ${relationships.length > 0 ? relationships.map(rel => {
                        const relatedChar = CharacterService.findById(rel.characterId);
                        return `
                            <div style="
                                padding: 1rem;
                                border: 1px solid var(--border-color);
                                border-radius: 4px;
                                margin-bottom: 0.5rem;
                                display: flex;
                                justify-content: space-between;
                                align-items: center;
                            ">
                                <div>
                                    <div style="font-weight: 500;">${relatedChar?.name || 'Inconnu'}</div>
                                    <div style="font-size: 0.85rem; color: var(--text-muted);">${rel.type}</div>
                                    ${rel.description ? `<p style="margin: 0.5rem 0 0 0; font-size: 0.9rem;">${rel.description}</p>` : ''}
                                </div>
                                <button onclick="CharactersHandlers.removeRelationship(${characterId}, ${rel.characterId})" style="background: none; border: none; cursor: pointer;">×</button>
                            </div>
                        `;
                    }).join('') : '<p style="color: var(--text-muted);">Aucune relation</p>'}
                </div>
            </div>
        `;

        ModalUI.open('relationships-modal', html);
    }

    /**
     * Add a relationship between characters
     * @param {number} characterId - Character ID
     */
    async function addRelationship(characterId) {
        const relatedId = parseInt(document.getElementById('related-character')?.value);
        const type = document.getElementById('relationship-type')?.value;
        const description = document.getElementById('relationship-description')?.value;

        if (!relatedId || !type) {
            alert('Veuillez sélectionner un personnage et un type de relation');
            return;
        }

        try {
            await CharacterService.addRelationship(characterId, relatedId, {
                type,
                description
            });
            CharactersHandlers.openRelationshipsModal(characterId);
        } catch (error) {
            console.error('Error adding relationship:', error);
            alert('Erreur lors de l\'ajout de la relation');
        }
    }

    /**
     * Remove a relationship
     * @param {number} characterId - Character ID
     * @param {number} relatedId - Related character ID
     */
    async function removeRelationship(characterId, relatedId) {
        try {
            const character = CharacterService.findById(characterId);
            character.relations = (character.relations || []).filter(r => r.characterId !== relatedId);
            await CharacterService.update(characterId, { relations: character.relations });
            CharactersHandlers.openRelationshipsModal(characterId);
        } catch (error) {
            console.error('Error removing relationship:', error);
            alert('Erreur lors de la suppression de la relation');
        }
    }

    /**
     * Helper function to generate random color
     * @returns {string} Hex color
     */
    function generateRandomColor() {
        const colors = ['#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c', '#e67e22', '#34495e'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    // Public API
    return {
        attachListHandlers,
        attachAddModalHandlers,
        attachDetailHandlers,
        handleAddCharacter,
        handleDelete,
        changeAvatar,
        setAvatar,
        handleFieldUpdate,
        openRelationshipsModal,
        addRelationship,
        removeRelationship
    };
})();
    const newRace = prompt("Nom de la nouvelle race :");
    if (newRace && newRace.trim() !== "") {
        const formattedRace = newRace.trim();
        
        if (!project.races.includes(formattedRace)) {
            project.races.push(formattedRace);
            project.races.sort();
            saveProject();
            updateCharacterField(charId, 'race', formattedRace);
            openCharacterDetail(charId);
            renderCharactersList();
        } else {
            alert("Cette race existe déjà !");
        }
    }
}

function openAddCharacterModal() {
    document.getElementById('addCharacterModal').classList.add('active');
    setTimeout(() => document.getElementById('characterNameInput').focus(), 100);
}

function addCharacter() {
    const name = document.getElementById('characterNameInput').value.trim();
    const role = document.getElementById('characterRoleInput').value.trim();
    const description = document.getElementById('characterDescInput').value.trim();
    
    if (!name) return;

    const character = {
        id: Date.now(),
        firstName: name.split(' ')[0] || '',
        lastName: name.split(' ').slice(1).join(' ') || '',
        nickname: '',
        pronouns: '',
        sex: '',
        race: 'Humain',
        age: '',
        birthDate: '',
        birthPlace: '',
        residence: '',
        occupation: '',
        name: name,
        role: role || '',
        roleImportance: 3,
        avatarEmoji: '??',
        avatarImage: '',
        height: '',
        weight: '',
        bodyType: '',
        hairColor: '',
        eyeColor: '',
        voice: '',
        clothing: '',
        accessories: '',
        physicalDescription: description || '',
        qualities: [],
        flaws: [],
        tastes: '',
        habits: '',
        fears: '',
        personality: {
            intelligence: 10,
            force: 10,
            robustesse: 10,
            empathie: 10,
            perception: 10,
            agilite: 10,
            sociabilite: 10
        },
        education: '',
        wealth: 50,
        secrets: '',
        beliefs: '',
        importantPlaces: '',
        catchphrases: '',
        goals: '',
        past: '',
        present: '',
        future: '',
        inventory: [],
        possessions: [],
        notes: '',
        appearance: '',
        background: '',
        relationships: '',
        linkedScenes: [],
        linkedElements: []
    };

    project.characters.push(character);
    
    document.getElementById('characterNameInput').value = '';
    document.getElementById('characterRoleInput').value = '';
    document.getElementById('characterDescInput').value = '';
    
    closeModal('addCharacterModal');
    saveProject();
    renderCharactersList();
    openCharacterDetail(character.id);
}

function deleteCharacter(id) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce personnage ?')) return;
    project.characters = project.characters.filter(c => c.id !== id);
    saveProject();
    renderCharactersList();
    showEmptyState();
}

function renderCharactersList() {
    const container = document.getElementById('charactersList');
    if (!project.characters || project.characters.length === 0) {
        container.innerHTML = '<div style="padding: 1rem; text-align: center; color: var(--text-muted); font-size: 0.85rem;">Aucun personnage</div>';
        return;
    }

    if (!project.races) project.races = ['Humain', 'Elfe', 'Nain', 'Orc', 'Autre'];
    const groups = {};
    project.races.forEach(race => { groups[race] = []; });
    groups['Non classé'] = [];

    project.characters.forEach(char => {
        migrateCharacterData(char);
        const raceKey = (char.race && project.races.includes(char.race)) ? char.race : 'Non classé';
        if (!groups[raceKey]) groups[raceKey] = [];
        groups[raceKey].push(char);
    });

    let html = '<div class="treeview-children" style="margin-left: 0; border-left: none; padding-left: 0;">';
    Object.keys(groups).forEach(raceName => {
        const charsInGroup = groups[raceName];
        if (charsInGroup.length > 0) {
            charsInGroup.sort((a, b) => {
                const nameA = (a.name || a.firstName || '').toLowerCase();
                const nameB = (b.name || b.firstName || '').toLowerCase();
                return nameA.localeCompare(nameB, 'fr');
            });

            html += `
                <div style="padding: 6px 12px; background: var(--bg-secondary, rgba(255,255,255,0.05)); color: var(--text-muted); font-size: 0.75rem; font-weight: bold; text-transform: uppercase; border-top: 1px solid var(--border-color); border-bottom: 1px solid var(--border-color); margin-top: 8px; margin-bottom: 4px; display: flex; justify-content: space-between;">
                    <span>${raceName}</span>
                    <span style="opacity: 0.6;">${charsInGroup.length}</span>
                </div>
            `;

            charsInGroup.forEach(char => {
                const displayName = char.name || char.firstName || 'Sans nom';
                html += `
                    <div class="treeview-item" onclick="openCharacterDetail(${char.id})">
                        <span class="treeview-item-icon">
                            <i data-lucide="user" style="width:14px;height:14px;vertical-align:middle;"></i>
                        </span>
                        <span class="treeview-item-label">${displayName}</span>
                        <button class="treeview-item-delete" onclick="event.stopPropagation(); deleteCharacter(${char.id})" title="Supprimer">×</button>
                    </div>
                `;
            });
        }
    });
    html += '</div>';
    container.innerHTML = html;

    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function toggleTreeviewGroup(groupKey) {
    const collapsedState = JSON.parse(localStorage.getItem('plume_treeview_collapsed') || '{}');
    collapsedState[groupKey] = !collapsedState[groupKey];
    localStorage.setItem('plume_treeview_collapsed', JSON.stringify(collapsedState));
    
    if (groupKey.startsWith('chars_')) renderCharactersList();
    else if (groupKey.startsWith('world_')) renderWorldList();
    else if (groupKey.startsWith('codex_')) renderCodexList();
}

function renderCharacterLinkedScenes(character) {
    const scenes = findScenesWithCharacter(character.id);
    if (scenes.length === 0) return '';

    return `
        <div class="detail-section">
            <div class="detail-section-title"><i data-lucide="file-text" style="width:14px;height:14px;vertical-align:middle;margin-right:4px;"></i>Apparaît dans ${scenes.length} scène(s)</div>
            <div class="quick-links">
                ${scenes.map(scene => {
                    const actIndex = project.acts.findIndex(a => a.id === scene.actId);
                    const act = project.acts[actIndex];
                    const chapterIndex = act.chapters.findIndex(c => c.id === scene.chapterId);
                    const actNumber = toRoman(actIndex + 1);
                    const chapterNumber = chapterIndex + 1;
                    const breadcrumb = `Acte ${actNumber} › Chapitre ${chapterNumber} › ${scene.sceneTitle}`;
                    
                    return `
                    <span class="link-badge" onclick="openScene(${scene.actId}, ${scene.chapterId}, ${scene.sceneId})" title="${scene.actTitle} - ${scene.chapterTitle}">
                        ${breadcrumb}
                    </span>
                `;
                }).join('')}
            </div>
        </div>
    `;
}

function openCharacterDetail(id) {
    const character = project.characters.find(c => c.id === id);
    if (!character) return;
    
    if (!project.races) {
        project.races = ['Humain', 'Elfe', 'Nain', 'Orc', 'Autre'];
    }

    migrateCharacterData(character);
    
    if (splitViewActive) {
        const state = splitActivePanel === 'left' ? splitViewState.left : splitViewState.right;
        if (state.view === 'characters') {
            state.characterId = id;
            renderSplitPanelViewContent(splitActivePanel);
            saveSplitViewState();
            return;
        }
    }

    const editorView = document.getElementById('editorView');
    editorView.innerHTML = renderCharacterSheet(character, false);
    
    setTimeout(() => {
        initCharacterRadar(character);
        lucide.createIcons();
    }, 50);
}

function migrateCharacterData(char) {
    if (!char.firstName) char.firstName = char.name?.split(' ')[0] || '';
    if (!char.lastName) char.lastName = char.name?.split(' ').slice(1).join(' ') || '';
    if (!char.nickname) char.nickname = '';
    if (!char.pronouns) char.pronouns = '';
    if (!char.sex) char.sex = '';
    if (!char.race) char.race = 'Humain';
    if (!char.birthDate) char.birthDate = '';
    if (!char.birthPlace) char.birthPlace = '';
    if (!char.residence) char.residence = '';
    if (!char.occupation) char.occupation = '';
    if (!char.roleImportance) char.roleImportance = 3;
    if (!char.avatarEmoji) char.avatarEmoji = '??';
    if (!char.avatarImage) char.avatarImage = '';
    if (!char.height) char.height = '';
    if (!char.weight) char.weight = '';
    if (!char.bodyType) char.bodyType = '';
    if (!char.hairColor) char.hairColor = '';
    if (!char.eyeColor) char.eyeColor = '';
    if (!char.voice) char.voice = '';
    if (!char.clothing) char.clothing = '';
    if (!char.accessories) char.accessories = '';
    if (!char.physicalDescription) char.physicalDescription = char.appearance || '';
    if (!char.qualities) char.qualities = [];
    if (!char.flaws) char.flaws = [];
    if (!char.tastes) char.tastes = '';
    if (!char.habits) char.habits = '';
    if (!char.fears) char.fears = '';
    if (!char.personality || typeof char.personality === 'string') {
        const oldPersonality = char.personality || '';
        char.personality = {
            intelligence: 10,
            force: 10,
            robustesse: 10,
            empathie: 10,
            perception: 10,
            agilite: 10,
            sociabilite: 10
        };
        if (oldPersonality) char.notes = (char.notes || '') + '\n\nPersonnalité (ancien):\n' + oldPersonality;
    }
    if (!char.education) char.education = '';
    if (char.wealth === undefined) char.wealth = 50;
    if (!char.secrets) char.secrets = '';
    if (!char.beliefs) char.beliefs = '';
    if (!char.importantPlaces) char.importantPlaces = '';
    if (!char.catchphrases) char.catchphrases = '';
    if (!char.goals) char.goals = '';
    if (!char.past) char.past = char.background || '';
    if (!char.present) char.present = '';
    if (!char.future) char.future = '';
    if (!char.inventory) char.inventory = [];
    if (!char.possessions) char.possessions = [];
}

function renderCharacterSheet(character, compact = false) {
    // This function is intentionally left to the view file (render templates)
    // The handlers file contains logic to prepare data and call render functions.
    return '';
}

function renderInventoryItem(charId, listType, item, index) {
    return `
        <div class="inventory-item" data-index="${index}">
            <button class="inventory-item-delete" onclick="removeInventoryItem(${charId}, '${listType}', ${index})">
                <i data-lucide="trash-2" style="width:14px;height:14px;"></i>
            </button>
            <div class="character-field-row">
                <div class="character-field" style="flex: 2;">
                    <label class="character-field-label">Nom</label>
                    <input type="text" value="${item.name || ''}" 
                           onchange="updateInventoryItem(${charId}, '${listType}', ${index}, 'name', this.value)">
                </div>
                <div class="character-field" style="max-width: 100px;">
                    <label class="character-field-label">Quantité</label>
                    <input type="number" value="${item.quantity || 1}" min="1"
                           onchange="updateInventoryItem(${charId}, '${listType}', ${index}, 'quantity', parseInt(this.value))">
                </div>
            </div>
            <div class="character-field">
                <label class="character-field-label">Description</label>
                <input type="text" value="${item.description || ''}" 
                       onchange="updateInventoryItem(${charId}, '${listType}', ${index}, 'description', this.value)">
            </div>
        </div>
    `;
}

function toggleCharacterSection(sectionName) {
    const section = document.getElementById(`section-${sectionName}`);
    if (section) {
        section.classList.toggle('collapsed');
    }
}

function updateCharacterName(id, newName) {
    const character = project.characters.find(c => c.id === id);
    if (character) {
        const parts = newName.trim().split(' ');
        character.firstName = parts[0] || '';
        character.lastName = parts.slice(1).join(' ') || '';
        character.name = newName.trim();
        saveProject();
        renderCharactersList();
    }
}

function updateCharacterDisplayName(id) {
    const character = project.characters.find(c => c.id === id);
    if (character) {
        character.name = `${character.firstName || ''} ${character.lastName || ''}`.trim();
        saveProject();
        renderCharactersList();
    }
}

function handleTagInput(event, charId, field) {
    if (event.key === 'Enter' && event.target.value.trim()) {
        event.preventDefault();
        const character = project.characters.find(c => c.id === charId);
        if (character) {
            if (!character[field]) character[field] = [];
            character[field].push(event.target.value.trim());
            event.target.value = '';
            saveProject();
            const container = document.getElementById(`${field}-${charId}`);
            if (container) {
                const input = container.querySelector('input');
                container.innerHTML = character[field].map((tag, i) => `
                    <span class="character-tag">${tag}<span class="character-tag-remove" onclick="removeCharacterTag(${charId}, '${field}', ${i})">×</span></span>
                `).join('') + `<input type="text" class="character-tags-input" placeholder="Ajouter..." onkeydown="handleTagInput(event, ${charId}, '${field}')">`;
            }
        }
    }
}

function removeCharacterTag(charId, field, index) {
    const character = project.characters.find(c => c.id === charId);
    if (character && character[field]) {
        character[field].splice(index, 1);
        saveProject();
        openCharacterDetail(charId);
    }
}

// Traits system and radar omitted for brevity; handlers file contains key data operations
function toggleTraitSection(sectionKey) { const section = document.getElementById(`trait-section-${sectionKey}`); if (section) section.classList.toggle('collapsed'); }
function toggleCharacterTrait(charId, trait) { const character = project.characters.find(c => c.id === charId); if (!character) return; if (!character.traits) character.traits = []; const index = character.traits.indexOf(trait); if (index > -1) character.traits.splice(index, 1); else character.traits.push(trait); saveProject(); refreshTraitsDisplay(charId); }
function removeCharacterTrait(charId, index) { const character = project.characters.find(c => c.id === charId); if (!character || !character.traits) return; character.traits.splice(index, 1); saveProject(); refreshTraitsDisplay(charId); }
function refreshTraitsDisplay(charId) { const character = project.characters.find(c => c.id === charId); if (!character) return; const traits = character.traits || []; const selectedContainer = document.getElementById(`selectedTraits-${charId}`); if (selectedContainer) { selectedContainer.innerHTML = traits.length > 0 ? traits.map((t, i) => `<span class="selected-trait">${t}<span class="trait-remove" onclick="removeCharacterTrait(${charId}, ${i})">×</span></span>`).join('') : '<span class="no-traits">Cliquez sur les traits ci-dessous pour les ajouter</span>'; } document.querySelectorAll('.trait-option').forEach(option => { const traitName = option.textContent; if (traits.includes(traitName)) option.classList.add('selected'); else option.classList.remove('selected'); }); }

function updatePersonalityStat(charId, stat, value) { const character = project.characters.find(c => c.id === charId); if (character && character.personality) { character.personality[stat] = parseInt(value); saveProject(); const control = event.target.parentElement; const valueSpan = control.querySelector('.radar-value'); if (valueSpan) valueSpan.textContent = value; initCharacterRadar(character); } }

function initCharacterRadar(character) { /* canvas drawing code intentionally left in view if needed */ }

function addInventoryItem(charId, listType) { const character = project.characters.find(c => c.id === charId); if (character) { if (!character[listType]) character[listType] = []; character[listType].push({ id: Date.now(), name: '', quantity: 1, description: '' }); saveProject(); refreshInventoryList(charId, listType); } }

function removeInventoryItem(charId, listType, index) { const character = project.characters.find(c => c.id === charId); if (character && character[listType]) { character[listType].splice(index, 1); saveProject(); refreshInventoryList(charId, listType); } }

function refreshInventoryList(charId, listType) { const character = project.characters.find(c => c.id === charId); if (!character) return; const containerId = `inventory-list-${charId}`; const container = document.getElementById(containerId); if (!container) { openCharacterDetail(charId); return; } const items = character[listType] || []; container.innerHTML = items.map((item, index) => renderInventoryItem(charId, listType, item, index)).join(''); if (typeof lucide !== 'undefined') lucide.createIcons(); }

function updateInventoryItem(charId, listType, index, field, value) { const character = project.characters.find(c => c.id === charId); if (character && character[listType] && character[listType][index]) { character[listType][index][field] = value; saveProject(); } }

function changeCharacterAvatar(charId) { const character = project.characters.find(c => c.id === charId); if (!character) return; const choice = prompt('Choisissez un emoji pour l\'avatar (ou collez une URL d\'image) :', character.avatarEmoji || '??'); if (choice === null) return; if (choice.startsWith('http')) { character.avatarImage = choice; character.avatarEmoji = ''; } else { character.avatarEmoji = choice || '??'; character.avatarImage = ''; } saveProject(); openCharacterDetail(charId); }
