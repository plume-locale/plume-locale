// Migrated from js/15.characters.js

// Note: file migrated into view folder; further refactor into render/handlers/state files recommended.

// View Management

// Si la liste des races n'existe pas, on en crée une par défaut
if (!project.races) {
    project.races = ['Humain', 'Elfe', 'Nain', 'Orc', 'Autre'];
}

function addNewRace(charId) {
    const newRace = prompt("Nom de la nouvelle race :");
    if (newRace && newRace.trim() !== "") {
        const formattedRace = newRace.trim();
        
        // Ajouter à la liste globale si elle n'existe pas déjà
        if (!project.races.includes(formattedRace)) {
            project.races.push(formattedRace);
            project.races.sort(); // Trier alphabétiquement
            
            // Sauvegarder le projet global
            saveProject();
            
            // Assigner cette nouvelle race au personnage en cours
            updateCharacterField(charId, 'race', formattedRace);
            
            // Rafraîchir l'affichage
            openCharacterDetail(charId);
            renderCharacterList();
        } else {
            alert("Cette race existe déjà !");
        }
    }
}

// Character Management
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
        // État civil
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
        // Header
        name: name,
        role: role || '',
        roleImportance: 3, // 1-5 stars
        avatarEmoji: '🙂',
        avatarImage: '',
        // Physique
        height: '',
        weight: '',
        bodyType: '',
        hairColor: '',
        eyeColor: '',
        voice: '',
        clothing: '',
        accessories: '',
        physicalDescription: description || '',
        // Caractère
        qualities: [], // tags array
        flaws: [], // tags array
        tastes: '',
        habits: '',
        fears: '',
        // Personnalité radar (0-20)
        personality: {
            intelligence: 10,
            force: 10,
            robustesse: 10,
            empathie: 10,
            perception: 10,
            agilite: 10,
            sociabilite: 10
        },
        // Profil
        education: '',
        wealth: 50, // 0-100 slider
        secrets: '',
        beliefs: '',
        importantPlaces: '',
        catchphrases: '',
        // Évolution
        goals: '',
        past: '',
        present: '',
        future: '',
        // Inventaire & Possessions
        inventory: [], // [{id, name, quantity, description}]
        possessions: [], // [{id, name, quantity, description}]
        // Autres
        notes: '',
        // Legacy fields for compatibility
        appearance: '',
        background: '',
        relationships: '',
        linkedScenes: [],
        linkedElements: []
    };

    project.characters.push(character);
    
    // Clear inputs
    document.getElementById('characterNameInput').value = '';
    document.getElementById('characterRoleInput').value = '';
    document.getElementById('characterDescInput').value = '';
    
    closeModal('addCharacterModal');
    saveProject();
    renderCharactersList();
    
    // Open the new character detail
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
    
    // 1. Gestion du cas vide
    if (!project.characters || project.characters.length === 0) {
        container.innerHTML = '<div style="padding: 1rem; text-align: center; color: var(--text-muted); font-size: 0.85rem;">Aucun personnage</div>';
        return;
    }

    // 2. Initialisation des groupes
    // On s'assure que la liste des races existe dans le projet
    if (!project.races) {
        project.races = ['Humain', 'Elfe', 'Nain', 'Orc', 'Autre']; // Valeurs par défaut si besoin
    }

    // On prépare l'objet de regroupement
    const groups = {};
    
    // On initialise les clés pour respecter l'ordre défini dans project.races
    project.races.forEach(race => {
        groups[race] = [];
    });
    // On ajoute le groupe fourre-tout à la fin
    groups['Non classé'] = [];

    // 3. Distribution des personnages dans les groupes
    project.characters.forEach(char => {
        migrateCharacterData(char); // On garde votre migration
        
        // Si la race du perso existe et fait partie de notre liste officielle -> on l'utilise
        // Sinon -> 'Non classé'
        const raceKey = (char.race && project.races.includes(char.race)) ? char.race : 'Non classé';
        
        // Sécurité au cas où project.races a changé mais le perso a une vieille race
        if (!groups[raceKey]) groups[raceKey] = [];
        
        groups[raceKey].push(char);
    });

    // 4. Construction du HTML
    let html = '<div class="treeview-children" style="margin-left: 0; border-left: none; padding-left: 0;">';
    
    // On parcourt chaque groupe (Race)
    Object.keys(groups).forEach(raceName => {
        const charsInGroup = groups[raceName];

        // On n'affiche le groupe que s'il contient des personnages
        if (charsInGroup.length > 0) {
            
            // Tri alphabétique interne au groupe
            charsInGroup.sort((a, b) => {
                const nameA = (a.name || a.firstName || '').toLowerCase();
                const nameB = (b.name || b.firstName || '').toLowerCase();
                return nameA.localeCompare(nameB, 'fr');
            });

            // En-tête de la race (Style visuel simple pour séparer)
            html += `
                <div style="
                    padding: 6px 12px;
                    background: var(--bg-secondary, rgba(255,255,255,0.05));
                    color: var(--text-muted);
                    font-size: 0.75rem;
                    font-weight: bold;
                    text-transform: uppercase;
                    border-top: 1px solid var(--border-color);
                    border-bottom: 1px solid var(--border-color);
                    margin-top: 8px;
                    margin-bottom: 4px;
                    display: flex; 
                    justify-content: space-between;
                ">
                    <span>${raceName}</span>
                    <span style="opacity: 0.6;">${charsInGroup.length}</span>
                </div>
            `;

            // Liste des personnages du groupe
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

    // IMPORTANT : Rafraîchir les icônes Lucide car on a réécrit le DOM
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function toggleTreeviewGroup(groupKey) {
    const collapsedState = JSON.parse(localStorage.getItem('plume_treeview_collapsed') || '{}');
    collapsedState[groupKey] = !collapsedState[groupKey];
    localStorage.setItem('plume_treeview_collapsed', JSON.stringify(collapsedState));
    
    // Re-render the appropriate list
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
    
    // 1. Initialiser les races si elles n'existent pas
    if (!project.races) {
        project.races = ['Humain', 'Elfe', 'Nain', 'Orc', 'Autre'];
    }

    // Ensure new fields exist for legacy characters
    migrateCharacterData(character);
    
    // Handle split view mode
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
    // On appelle la fonction de rendu (modifiée ci-dessous)
    editorView.innerHTML = renderCharacterSheet(character, false);
    
    // Initialize radar chart
    setTimeout(() => {
        initCharacterRadar(character);
        lucide.createIcons();
    }, 50);
}

function migrateCharacterData(char) {
    // Migrate legacy characters to new structure
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
    if (!char.avatarEmoji) char.avatarEmoji = '🙂';
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
    const metaInfo = [];
    if (character.age) metaInfo.push(`${character.age}${character.birthPlace ? ', né à ' + character.birthPlace : ''}`);
    if (character.residence) metaInfo.push(character.residence);
    const racesList = project.races || ['Humain', 'Elfe', 'Nain', 'Orc', 'Autre'];
    const raceOptions = racesList.map(r => 
        `<option value="${r}" ${character.race === r ? 'selected' : ''}>${r}</option>`
    ).join('');
    
    return `
        <div class="character-sheet" data-character-id="${character.id}">
            <!-- Header -->
            <div class="character-sheet-header">
                <div class="character-avatar" onclick="changeCharacterAvatar(${character.id})" title="Changer l'avatar">
                    ${character.avatarImage
                        ? `<img src="${character.avatarImage}" alt="${character.name}">`
                        : `<i data-lucide="user" style="width:80px;height:80px;"></i>`}
                </div>
                <div class="character-header-info">
                    <h2 contenteditable="true" onblur="updateCharacterName(${character.id}, this.textContent)">${character.firstName}${character.lastName ? ' ' + character.lastName : ''}</h2>
                    <ul class="character-meta">
                        ${metaInfo.map(m => `<li>${m}</li>`).join('')}
                    </ul>
                </div>
                <button class="character-close-btn" onclick="switchView('editor')" title="Fermer">×</button>
            </div>
            

            <!-- Grille des sections -->
