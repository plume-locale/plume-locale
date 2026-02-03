

// View Management

// Si la liste des races n'existe pas, on en crée une par défaut
if (!project.races) {
    project.races = ['Humain', 'Elfe', 'Nain', 'Orc', 'Autre'];
}

// [MVVM : Other]
// Logique métier et interaction utilisateur (prompt) - Mixte
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
// [MVVM : View]
// Manipulation directe du DOM pour afficher la modale
function openAddCharacterModal() {
    document.getElementById('addCharacterModal').classList.add('active');
    setTimeout(() => document.getElementById('characterNameInput').focus(), 100);
}

// [MVVM : ViewModel]
// Gère la création, l'initialisation et la sauvegarde d'un personnage
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
        avatarEmoji: '??',
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

// [MVVM : ViewModel]
// Gère la suppression et la mise à jour de l'état global
function deleteCharacter(id) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce personnage ?')) return;
    project.characters = project.characters.filter(c => c.id !== id);
    saveProject();
    renderCharactersList();
    showEmptyState();
}

// [MVVM : View]
// Génération du HTML pour la liste des personnages
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

// [MVVM : ViewModel]
// Gère l'état de repliement des groupes dans le localStorage
function toggleTreeviewGroup(groupKey) {
    const collapsedState = JSON.parse(localStorage.getItem('plume_treeview_collapsed') || '{}');
    collapsedState[groupKey] = !collapsedState[groupKey];
    localStorage.setItem('plume_treeview_collapsed', JSON.stringify(collapsedState));

    // Re-render the appropriate list
    if (groupKey.startsWith('chars_')) renderCharactersList();
    else if (groupKey.startsWith('world_')) renderWorldList();
    else if (groupKey.startsWith('codex_')) renderCodexList();
}

// [MVVM : View]
// Génération du HTML pour les scènes liées
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

// [MVVM : ViewModel]
// Coordination de l'affichage du détail d'un personnage
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

// [MVVM : Other]
// Migration et normalisation des données (Model/ViewModel)
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

// [MVVM : View]
// Template HTML principal de la fiche personnage
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
                    <div class="character-sections-grid">
                    
                    ${renderCharacterLinkedScenes(character)}

                    <!-- État Civil -->
                    <div class="character-section" id="section-etat-civil">
                        <div class="character-section-header" onclick="toggleCharacterSection('etat-civil')">
                            <div class="character-section-title">État Civil</div>
                            <span class="character-section-toggle">
                                <i data-lucide="chevron-down" style="width:18px;height:18px;"></i>
                            </span>
                        </div>
                        <div class="character-section-content">
                            <div class="character-field-row">
                                <div class="character-field">
                                    <label class="character-field-label">Prénom</label>
                                    <input type="text" value="${character.firstName || ''}" 
                                           onchange="updateCharacterField(${character.id}, 'firstName', this.value); updateCharacterDisplayName(${character.id})">
                                </div>
                                <div class="character-field">
                                    <label class="character-field-label">Nom de famille</label>
                                    <input type="text" value="${character.lastName || ''}" 
                                           onchange="updateCharacterField(${character.id}, 'lastName', this.value); updateCharacterDisplayName(${character.id})">
                                </div>
                            </div>
                            <div class="character-field-row">
                                <div class="character-field">
                                    <label class="character-field-label">Surnom</label>
                                    <input type="text" value="${character.nickname || ''}" 
                                           onchange="updateCharacterField(${character.id}, 'nickname', this.value)">
                                </div>
                                <div class="character-field">
                                    <label class="character-field-label">Pronoms</label>
                                    <input type="text" value="${character.pronouns || ''}" placeholder="il/lui, elle/elle, iel..."
                                           onchange="updateCharacterField(${character.id}, 'pronouns', this.value)">
                                </div>
                            </div>
                            <div class="character-field-row">
                                <div class="character-field">
                                    <label class="character-field-label">Sexe</label>
                                    <div class="character-radio-group">
                                        <label><input type="radio" name="sex-${character.id}" value="F" ${character.sex === 'F' ? 'checked' : ''} onchange="updateCharacterField(${character.id}, 'sex', 'F')"> Femme</label>
                                        <label><input type="radio" name="sex-${character.id}" value="M" ${character.sex === 'M' ? 'checked' : ''} onchange="updateCharacterField(${character.id}, 'sex', 'M')"> Homme</label>
                                        <label><input type="radio" name="sex-${character.id}" value="A" ${character.sex === 'A' ? 'checked' : ''} onchange="updateCharacterField(${character.id}, 'sex', 'A')"> Autre</label>
                                    </div>
                                </div>
                                <div class="character-field">
                                    <label class="character-field-label">Race</label>
                                    <div style="display: flex; gap: 5px; align-items: center;">
                                        <select class="detail-input" style="flex-grow: 1;"
                                            onchange="updateCharacterField(${character.id}, 'race', this.value); renderCharactersList();">
                                            <option value="">Sélectionner...</option>
                                            ${raceOptions}
                                        </select>
                                        <button onclick="addNewRace(${character.id})" class="btn-icon" title="Créer une nouvelle race" style="width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; padding: 0; cursor: pointer; border: 1px solid var(--border-color); background: var(--bg-secondary); border-radius: 4px;">
                                            <i data-lucide="plus" style="width:14px;height:14px;"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div class="character-field-row">
                                <div class="character-field" style="max-width: 100px;">
                                    <label class="character-field-label">Âge</label>
                                    <input type="text" value="${character.age || ''}" 
                                           onchange="updateCharacterField(${character.id}, 'age', this.value)">
                                </div>
                                <div class="character-field">
                                    <label class="character-field-label">Date de naissance</label>
                                    <input type="text" value="${character.birthDate || ''}" placeholder="JJ/MM/AAAA"
                                           onchange="updateCharacterField(${character.id}, 'birthDate', this.value)">
                                </div>
                                <div class="character-field">
                                    <label class="character-field-label">Lieu de naissance</label>
                                    <input type="text" value="${character.birthPlace || ''}" 
                                           onchange="updateCharacterField(${character.id}, 'birthPlace', this.value)">
                                </div>
                            </div>
                            <div class="character-field-row">
                                <div class="character-field">
                                    <label class="character-field-label">Lieu de résidence</label>
                                    <input type="text" value="${character.residence || ''}" 
                                           onchange="updateCharacterField(${character.id}, 'residence', this.value)">
                                </div>
                                <div class="character-field">
                                    <label class="character-field-label">Occupation</label>
                                    <input type="text" value="${character.occupation || ''}" 
                                           onchange="updateCharacterField(${character.id}, 'occupation', this.value)">
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Physique -->
                    <div class="character-section" id="section-physique">
                        <div class="character-section-header" onclick="toggleCharacterSection('physique')">
                            <div class="character-section-title">Physique</div>
                                <span class="character-section-toggle"><i data-lucide="chevron-down" style="width:18px;height:18px;"></i></span>
                            </div>
                        <div class="character-section-content">
                            <div class="character-field-row">
                                <div class="character-field">
                                    <label class="character-field-label">Taille</label>
                                    <input type="text" value="${character.height || ''}" placeholder="cm"
                                           onchange="updateCharacterField(${character.id}, 'height', this.value)">
                                </div>
                                <div class="character-field">
                                    <label class="character-field-label">Poids</label>
                                    <input type="text" value="${character.weight || ''}" placeholder="kg"
                                           onchange="updateCharacterField(${character.id}, 'weight', this.value)">
                                </div>
                                <div class="character-field">
                                    <label class="character-field-label">Corpulence</label>
                                    <input type="text" value="${character.bodyType || ''}" 
                                           onchange="updateCharacterField(${character.id}, 'bodyType', this.value)">
                                </div>
                            </div>
                            <div class="character-field-row">
                                <div class="character-field">
                                    <label class="character-field-label">Couleur des cheveux</label>
                                    <input type="text" value="${character.hairColor || ''}" 
                                           onchange="updateCharacterField(${character.id}, 'hairColor', this.value)">
                                </div>
                                <div class="character-field">
                                    <label class="character-field-label">Couleur des yeux</label>
                                    <input type="text" value="${character.eyeColor || ''}" 
                                           onchange="updateCharacterField(${character.id}, 'eyeColor', this.value)">
                                </div>
                                <div class="character-field">
                                    <label class="character-field-label">Voix / Manière de parler</label>
                                    <input type="text" value="${character.voice || ''}" 
                                           onchange="updateCharacterField(${character.id}, 'voice', this.value)">
                                </div>
                            </div>
                            <div class="character-field-row">
                                <div class="character-field">
                                    <label class="character-field-label">Tenue</label>
                                    <textarea rows="3" onchange="updateCharacterField(${character.id}, 'clothing', this.value)">${character.clothing || ''}</textarea>
                                </div>
                                <div class="character-field">
                                    <label class="character-field-label">Accessoires</label>
                                    <textarea rows="3" onchange="updateCharacterField(${character.id}, 'accessories', this.value)">${character.accessories || ''}</textarea>
                                </div>
                            </div>
                            <div class="character-field">
                                <label class="character-field-label">Description</label>
                                <textarea rows="4" onchange="updateCharacterField(${character.id}, 'physicalDescription', this.value)">${character.physicalDescription || ''}</textarea>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Évolution - Full width car contient la timeline -->
                    <div class="character-section full-width" id="section-evolution">
                        <div class="character-section-header" onclick="toggleCharacterSection('evolution')">
                            <div class="character-section-title">Évolution</div>
                            <span class="character-section-toggle"><i data-lucide="chevron-down" style="width:18px;height:18px;"></i></span>
                        </div>
                        <div class="character-section-content">
                            <div class="character-field">
                                <label class="character-field-label">Buts / Objectifs</label>
                                <textarea rows="3" onchange="updateCharacterField(${character.id}, 'goals', this.value)">${character.goals || ''}</textarea>
                            </div>
                                
                            <div class="character-timeline">
                                <div class="timeline-card">
                                    <div class="timeline-card-title">Passé</div>
                                    <textarea placeholder="Le personnage avant le début de l'histoire (enfance, souffrances potentielles...)." 
                                              onchange="updateCharacterField(${character.id}, 'past', this.value)">${character.past || ''}</textarea>
                                </div>
                                <div class="timeline-card">
                                    <div class="timeline-card-title">Présent</div>
                                    <textarea placeholder="Le personnage au commencement de l'histoire." 
                                              onchange="updateCharacterField(${character.id}, 'present', this.value)">${character.present || ''}</textarea>
                                </div>
                                <div class="timeline-card">
                                    <div class="timeline-card-title">Futur</div>
                                    <textarea placeholder="Le personnage à la fin de l'histoire." 
                                              onchange="updateCharacterField(${character.id}, 'future', this.value)">${character.future || ''}</textarea>
                                </div>
                            </div>
                        </div>
                    </div>



                    <!-- Caractère - Full width car contient beaucoup de catégories -->
                    <div class="character-section full-width" id="section-caractere">
                        <div class="character-section-header" onclick="toggleCharacterSection('caractere')">
                            <div class="character-section-title">Traits de Caractère</div>
                            <span class="character-section-toggle"><i data-lucide="chevron-down" style="width:18px;height:18px;"></i></span>
                        </div>
                        <div class="character-section-content">
                            <!-- Traits sélectionnés -->
                            <div class="character-field">
                                <label class="character-field-label">Traits sélectionnés</label>
                                <div class="selected-traits-container" id="selectedTraits-${character.id}">
                                    ${(character.traits || []).map((t, i) => `
                                        <span class="selected-trait">${t}<span class="trait-remove" onclick="removeCharacterTrait(${character.id}, ${i})">×</span></span>
                                    `).join('') || '<span class="no-traits">Cliquez sur les traits ci-dessous pour les ajouter</span>'}
                                </div>
                            </div>
                            
                            <!-- Catégories de traits -->
                            <div class="traits-categories">
                                ${renderTraitsCategories(character.id, character.traits || [])}
                            </div>
                            
                            <!-- Champs texte conservés -->
                            <div class="character-field" style="margin-top: 1rem;">
                                <label class="character-field-label">Goûts</label>
                                <textarea rows="2" onchange="updateCharacterField(${character.id}, 'tastes', this.value)">${character.tastes || ''}</textarea>
                            </div>
                            <div class="character-field">
                                <label class="character-field-label">Tics, manies, habitudes</label>
                                <textarea rows="2" onchange="updateCharacterField(${character.id}, 'habits', this.value)">${character.habits || ''}</textarea>
                            </div>
                            <div class="character-field">
                                <label class="character-field-label">Peurs et doutes</label>
                                <textarea rows="2" onchange="updateCharacterField(${character.id}, 'fears', this.value)">${character.fears || ''}</textarea>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Profil -->
                    <div class="character-section" id="section-profil">
                        <div class="character-section-header" onclick="toggleCharacterSection('profil')">
                            <div class="character-section-title">Profil</div>
                            <span class="character-section-toggle"><i data-lucide="chevron-down" style="width:18px;height:18px;"></i></span>
                        </div>
                        <div class="character-section-content">
                            <div class="character-field">
                                <label class="character-field-label">Éducation</label>
                                <textarea rows="3" onchange="updateCharacterField(${character.id}, 'education', this.value)">${character.education || ''}</textarea>
                            </div>
                            <div class="character-field">
                                <label class="character-field-label">Secrets</label>
                                <textarea rows="3" onchange="updateCharacterField(${character.id}, 'secrets', this.value)">${character.secrets || ''}</textarea>
                            </div>
                            <div class="character-field">
                                <label class="character-field-label">Croyances et idéologies</label>
                                <textarea rows="2" onchange="updateCharacterField(${character.id}, 'beliefs', this.value)">${character.beliefs || ''}</textarea>
                            </div>
                            <div class="character-field-row">
                                <div class="character-field">
                                    <label class="character-field-label">Lieux marquants</label>
                                    <input type="text" value="${character.importantPlaces || ''}" 
                                           onchange="updateCharacterField(${character.id}, 'importantPlaces', this.value)">
                                </div>
                                <div class="character-field">
                                    <label class="character-field-label">Phrases ou expressions typiques</label>
                                    <textarea rows="3" onchange="updateCharacterField(${character.id}, 'catchphrases', this.value)">${character.catchphrases || ''}</textarea>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Inventaire -->
                    <div class="character-section" id="section-inventaire">
                        <div class="character-section-header" onclick="toggleCharacterSection('inventaire')">
                            <div class="character-section-title">Inventaire</div>
                            <span class="character-section-toggle"><i data-lucide="chevron-down" style="width:18px;height:18px;"></i></span>
                        </div>
                        <div class="character-section-content">
                            <div id="inventory-list-${character.id}">
                                ${(character.inventory || []).map((item, i) => renderInventoryItem(character.id, 'inventory', item, i)).join('')}
                            </div>
                            <button class="inventory-add-btn" onclick="addInventoryItem(${character.id}, 'inventory')">
                                Ajouter <i data-lucide="plus-circle" style="width:16px;height:16px;"></i>
                            </button>
                        </div>
                    </div>
                    
                    <!-- Autres -->
                    <div class="character-section" id="section-autres">
                        <div class="character-section-header" onclick="toggleCharacterSection('autres')">
                            <div class="character-section-title">Autres</div>
                            <span class="character-section-toggle"><i data-lucide="chevron-down" style="width:18px;height:18px;"></i></span>
                        </div>
                        <div class="character-section-content">
                            <div class="character-field">
                                <textarea rows="5" placeholder="Notes diverses..." 
                                          onchange="updateCharacterField(${character.id}, 'notes', this.value)">${character.notes || ''}</textarea>
                            </div>
                        </div>
                    </div>
                    
                    
                    
                    
                    
                    </div><!-- Fin de character-sections-grid -->
                    

                </div>
            `;
}

// [MVVM : View]
// Template HTML pour un item d'inventaire
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

// [MVVM : View]
// Interaction UI simple pour afficher/masquer des sections
function toggleCharacterSection(sectionName) {
    const section = document.getElementById(`section-${sectionName}`);
    if (section) {
        section.classList.toggle('collapsed');
    }
}

// [MVVM : ViewModel]
// Logique de mise à jour du nom
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

// [MVVM : ViewModel]
// Logique de mise à jour du nom d'affichage
function updateCharacterDisplayName(id) {
    const character = project.characters.find(c => c.id === id);
    if (character) {
        character.name = `${character.firstName || ''} ${character.lastName || ''}`.trim();
        saveProject();
        renderCharactersList();
    }
}

// [MVVM : Other]
// Gestion des tags et mise à jour directe (Mixte)
function handleTagInput(event, charId, field) {
    if (event.key === 'Enter' && event.target.value.trim()) {
        event.preventDefault();
        const character = project.characters.find(c => c.id === charId);
        if (character) {
            if (!character[field]) character[field] = [];
            character[field].push(event.target.value.trim());
            event.target.value = '';
            saveProject();
            // Refresh tags display
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

// [MVVM : ViewModel]
// Logique de suppression d'un tag
function removeCharacterTag(charId, field, index) {
    const character = project.characters.find(c => c.id === charId);
    if (character && character[field]) {
        character[field].splice(index, 1);
        saveProject();
        openCharacterDetail(charId);
    }
}

// Système de traits de caractère
const TRAIT_SECTIONS = {
    'emotional': {
        icon: 'brain-circuit', // Aspect Émotionnel
        label: 'Aspect Émotionnel',
        categories: {
            'adversity': { icon: 'shield-half', label: 'Réaction face à l\'adversité', traits: ['Résilient', 'Fragile', 'Agressif', 'Évasif', 'Persévérant', 'Courageux'] },
            'information': { icon: 'brain', label: 'Traitement de l\'information', traits: ['Analytique', 'Intuitif', 'Réfléchi', 'Impulsif', 'Distrait'] },
            'emotions': { icon: 'heart', label: 'Gestion des émotions', traits: ['Expressif', 'Réservé', 'Explosif', 'Équilibré', 'Empathique', 'Apathique', 'Passionné', 'Téméraire'] },
            'motivations': { icon: 'target', label: 'Motivations principales', traits: ['Ambition', 'Curiosité', 'Besoin de sécurité', 'Besoin d\'approbation', 'Quête de sens'] },
            'social': { icon: 'user-check', label: 'Interactions sociales', traits: ['Leader', 'Suiveur', 'Confiant', 'Timide', 'Solitaire', 'Mystérieux', 'Médiateur', 'Manipulateur', 'Pédagogue'] },
            'change': { icon: 'repeat-2', label: 'Gestion du changement', traits: ['Adaptatif', 'Résistant', 'Enthousiaste', 'Craintif', 'Indécis'] },
            'self': { icon: 'eye', label: 'Vision de soi', traits: ['Confiant', 'Insécure', 'Narcissique', 'Humble', 'Critique'] },
            'intimacy': { icon: 'heart-handshake', label: 'Rapport à l\'intimité', traits: ['Prude', 'Pudique', 'Romantique', 'Discret', 'Réservé', 'Ouvert', 'Extraverti'] },
            'sexuality': { icon: 'flame', label: 'Rapport à la sexualité', traits: ['Sensuel', 'Chaste', 'Timide', 'Décomplexé', 'Romantique', 'Passionné', 'Libertin', 'Asexuel'] },
            'pain': { icon: 'bandage', label: 'Rapport à la douleur', traits: ['Sadique', 'Masochiste', 'Stoïque', 'Sensible', 'Endurant', 'Douillet', 'Vulnérable'] },
            'time': { icon: 'clock', label: 'Rapport au temps', traits: ['Nostalgique', 'Tourné vers l\'avenir', 'Carpe Diem', 'Cynique', 'Patient', 'Impatient'] }
        }
    },
    'evolution': {
        icon: 'trending-up', // Évolution Personnelle
        label: 'Évolution Personnelle',
        categories: {
            'initial': { icon: 'sparkles', label: 'État initial', traits: ['Innocent', 'Naïf', 'Ferme dans ses convictions', 'Curieux', 'Méfiant', 'Mystérieux', 'Téméraire'] },
            'learning': { icon: 'book-open', label: 'Approche face à l\'apprentissage', traits: ['Autodidacte', 'Chercheur de mentors', 'Expérimentateur', 'Sceptique', 'Réfractaire au changement'] },
            'failure': { icon: 'alert-triangle', label: 'Gestion des échecs', traits: ['Persévérant', 'Résilient', 'Facilement découragé', 'Fuyant', 'Auto-compassion', 'Revanchard', 'Défaitiste'] },
            'quest': { icon: 'compass', label: 'Quête personnelle', traits: ['Chercheur d\'identité', 'Chercheur de vérité', 'Chercheur de sensations', 'Chercheur d\'équilibre', 'Chercheur de pouvoir'] },
            'adaptability': { icon: 'shuffle', label: 'Adaptabilité à l\'évolution', traits: ['Flexible', 'Rigide', 'Conservateur', 'Caméléon'] },
            'world': { icon: 'globe', label: 'Interaction avec le monde', traits: ['Explorateur', 'Protecteur', 'Observateur', 'Pionnier', 'Réformateur'] },
            'relationships': { icon: 'user-heart', label: 'Gestion des relations', traits: ['Loyal', 'Solidaire', 'Indépendant', 'Codépendant'] },
            'death': { icon: 'skull', label: 'Rapport à la mort', traits: ['Stoïque', 'Anxieux', 'Fataliste', 'Spirituel', 'Déni'] }
        }
    },
    'daily': {
        icon: 'home', // Au Quotidien
        label: 'Au Quotidien',
        categories: {
            'order': { icon: 'list-checks', label: 'Organisation et ordre', traits: ['Désordonné', 'Méticuleux', 'Négligent', 'Soigneux'] },
            'appearance': { icon: 'shirt', label: 'Apparence et style', traits: ['Coquet', 'Négligé', 'Élégant', 'Décontracté', 'Mystérieux', 'Inspirant'] },
            'physical': { icon: 'dumbbell', label: 'Habileté physique', traits: ['Adroit', 'Maladroit', 'Agile', 'Fort', 'Fragile', 'Précis', 'Souple'] },
            'timeManagement': { icon: 'timer', label: 'Gestion du temps', traits: ['Ponctuel', 'Retardataire', 'Organisé', 'Procrastinateur'] }
        }
    },
    'others': {
        icon: 'users', // Rapport aux Autres
        label: 'Rapport aux Autres',
        categories: {
            'norms': { icon: 'ban', label: 'Réponse aux normes culturelles', traits: ['Conformiste', 'Rebelle', 'Innovateur', 'Traditionaliste', 'Indifférent'] },
            'group': { icon: 'group', label: 'Rapport au groupe', traits: ['Leader', 'Suiveur', 'Autoritaire', 'Solitaire', 'Médiateur', 'Esprit de contradiction'] },
            'maturity': { icon: 'gem', label: 'Maturité émotionnelle', traits: ['Candide', 'Immature', 'Mature', 'Naïf', 'Sage'] },
            'communication': { icon: 'message-square', label: 'Communication', traits: ['Expressif', 'Réservé', 'Enthousiaste', 'Observateur', 'Provocateur', 'Éloquent', 'Persuasif', 'À l\'écoute', 'Franc'] },
            'diversity': { icon: 'dices', label: 'Réaction à la diversité', traits: ['Tolérant', 'Intolérant', 'Curieux', 'Ignorant', 'Ambivalent'] },
            'pressure': { icon: 'gauge', label: 'Gestion de la pression sociale', traits: ['Influençable', 'Résistant', 'Indécis', 'Évitant'] },
            'identity': { icon: 'user-circle', label: 'Quête d\'identité sociale', traits: ['Cherche l\'appartenance', 'Caméléon social', 'Loup solitaire', 'Conformiste', 'Cosmopolite'] },
            'success': { icon: 'trophy', label: 'Vision de la réussite', traits: ['Ambitieux', 'Minimaliste', 'Opportuniste', 'Idéaliste', 'Pessimiste'] },
            'institutions': { icon: 'gavel', label: 'Interactions avec les institutions', traits: ['Respectueux', 'Critique', 'Manipulateur', 'Défenseur', 'Détaché'] }
        }
    },
    'age': {
        icon: 'hourglass', // Personnalité selon l\'Âge
        label: 'Personnalité selon l\'Âge',
        categories: {
            'childhood': { icon: 'baby', label: 'Enfance et adolescence', traits: ['Curieux', 'Rebelle', 'Suiveur', 'Protecteur', 'Rêveur'] },
            'youngAdult': { icon: 'briefcase', label: 'Jeunes adultes', traits: ['Ambitieux', 'Aventurier', 'Stable', 'Introspectif', 'Social', 'Téméraire'] },
            'midLife': { icon: 'building-2', label: 'Milieu de vie', traits: ['Responsable', 'Pédagogue', 'Entrepreneur', 'Nostalgique', 'Philanthrope', 'Mentor', 'Sage', 'Expérimenté', 'Accompli'] },
            'mature': { icon: 'library', label: 'Âge mûr', traits: ['Sage', 'Conservateur', 'Libéré', 'Prudent', 'Gardien de la tradition'] },
            'generations': { icon: 'tree-pine', label: 'Interactions entre générations', traits: ['Respectueux', 'Aime les défier', 'Guide', 'Élève', 'Indifférent'] }
        }
    },
    'moral': {
        icon: 'scale', // La Morale
        label: 'La Morale',
        categories: {
            'virtues': { icon: 'check-circle', label: 'Vertus', traits: ['Courageux', 'Juste', 'Sage', 'Tempéré', 'Tolérant', 'Intègre', 'Honnête', 'Loyal', 'Compatissant', 'Bienveillant', 'Sincère', 'Désintéressé', 'Responsable'] },
            'neutral': { icon: 'circle', label: 'Traits neutres', traits: ['Modéré', 'Prudent', 'Réfléchi', 'Objectif', 'Réaliste', 'Modeste', 'Patient'] },
            'ambiguous': { icon: 'infinity', label: 'Ambiguïté morale', traits: ['Astucieux', 'Manipulateur', 'Séducteur', 'Rusé', 'Stratège', 'Entêté'] },
            'minorVices': { icon: 'alert-circle', label: 'Vices mineurs', traits: ['Paresseux', 'Égoïste', 'Impulsif', 'Moqueur', 'Malhonnête', 'Hypocrite', 'Lâche', 'Cupide', 'Envieux'] },
            'majorVices': { icon: 'skull', label: 'Vices majeurs', traits: ['Cruel', 'Tyrannique', 'Malveillant', 'Traître', 'Violent', 'Sadique'] },
            'redemption': { icon: 'rotate-ccw', label: 'Traits rédempteurs', traits: ['Repentant', 'Humble', 'Reconnaissant', 'Miséricordieux', 'Compatissant'] },
            'moralApproach': { icon: 'compass', label: 'Approche de la moralité', traits: ['Amoral', 'Nihiliste', 'Utilitariste', 'Paragon de vertu'] },
            'values': { icon: 'diamond', label: 'Principes et valeurs', traits: ['Conformiste', 'Conventionnel', 'Éthique', 'Honnête', 'Idéaliste', 'Incorruptible', 'Intransigeant', 'Non-conformiste', 'Pragmatique', 'Rebelle', 'Respectueux', 'Révolutionnaire', 'Traditionnel', 'Transgressif'] }
        }
    },
    'past': {
        icon: 'history', // En Fonction du Passé
        label: 'En Fonction du Passé',
        categories: {
            'privileged': { icon: 'crown', label: 'Enfance privilégiée', traits: ['Confiant', 'Naïf', 'Entreprenant', 'Éduqué'] },
            'trauma': { icon: 'x-circle', label: 'Traumatismes passés', traits: ['Méfiant', 'Résilient', 'Tourmenté', 'Secret', 'Vigilant', 'Mystérieux'] },
            'hardship': { icon: 'pickaxe', label: 'Enfance dans l\'adversité', traits: ['Combattif', 'Ingénieux', 'Méfiant', 'Endurci', 'Tenace'] },
            'nomad': { icon: 'tent', label: 'Passé nomade', traits: ['S\'adapte facilement', 'Curieux', 'Indépendant', 'Nomade', 'Polyglotte'] },
            'educated': { icon: 'microscope', label: 'Éducation formelle', traits: ['Analytique', 'Érudit', 'Précis', 'Structuré', 'Sceptique'] },
            'artist': { icon: 'palette', label: 'Passé d\'artiste', traits: ['Imaginatif', 'Sensible', 'Non-conformiste', 'Passionné', 'Perfectionniste'] },
            'delinquent': { icon: 'handcuffs', label: 'Ancien délinquant', traits: ['Rusé', 'Secret', 'Rebelle', 'Débrouillard', 'Insoumis'] },
            'noble': { icon: 'castle', label: 'Origines nobles', traits: ['Digne', 'Autoritaire', 'Élitiste', 'Gracieux', 'Maniéré', 'Conservateur'] }
        }
    },
    'elements': {
        icon: 'leaf', // Éléments Naturels
        label: 'Éléments Naturels',
        categories: {
            'earth': { icon: 'mountain', label: 'Terre', traits: ['Ancré', 'Résistant', 'Patient', 'Pratique', 'Loyal'] },
            'water': { icon: 'water', label: 'Eau', traits: ['Sensible', 'Profond', 'Réfléchi', 'Adaptable', 'Empathique'] },
            'fire': { icon: 'flame', label: 'Feu', traits: ['Enthousiaste', 'Colérique', 'Charismatique', 'Audacieux', 'Créatif', 'Impulsif'] },
            'air': { icon: 'wind', label: 'Air', traits: ['Analytique', 'Expressif', 'Léger', 'Intuitif', 'Curieux'] },
            'metal': { icon: 'hammer', label: 'Métal', traits: ['Organisé', 'Tenace', 'Réfléchi', 'Précis', 'Discipliné'] },
            'wood': { icon: 'tree-pine', label: 'Bois', traits: ['Innovateur', 'Visionnaire', 'Ambitieux', 'Flexible', 'Énergique'] },
            'space': { icon: 'satellite', label: 'Espace', traits: ['Indépendant', 'Mystérieux', 'Rêveur', 'Explorateur', 'Contemplatif'] },
            'light': { icon: 'sun', label: 'Lumière', traits: ['Lumineux', 'Optimiste', 'Inspirant', 'Chaleureux', 'Rayonnant', 'Bienveillant', 'Leader'] }
        }
    }
};

// [MVVM] View - Génération du HTML pour les catégories de traits
function renderTraitsCategories(charId, selectedTraits) {
    return Object.entries(TRAIT_SECTIONS).map(([sectionKey, section]) => `
                <div class="trait-section" id="trait-section-${sectionKey}">
                    <div class="trait-section-header" onclick="toggleTraitSection('${sectionKey}')">
                        <span>
                            <span class="trait-section-icon"><i data-lucide="${section.icon}" style="width:18px; height:18px; vertical-align: middle;"></i></span>
                            ${section.label}
                        </span>
                        <span class="trait-section-toggle">?</span>
                    </div>
                    <div class="trait-section-content">
                        ${Object.entries(section.categories).map(([catKey, category]) => `
                            <div class="trait-category" id="trait-cat-${sectionKey}-${catKey}">
                                <div class="trait-category-header">
                                    <span>
                                        <span class="trait-category-icon"><i data-lucide="${category.icon}" style="width:14px; height:14px; vertical-align: middle;"></i></span>
                                        ${category.label}
                                    </span>
                                </div>
                                <div class="trait-category-content">
                                    ${category.traits.map(trait => `
                                        <span class="trait-option ${selectedTraits.includes(trait) ? 'selected' : ''}" 
                                            onclick="event.stopPropagation(); toggleCharacterTrait(${charId}, '${trait.replace(/'/g, "\\'")}')">${trait}</span>
                                    `).join('')}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `).join('');
}

// [MVVM] View - Interaction UI pour les sections de traits
function toggleTraitSection(sectionKey) {
    const section = document.getElementById(`trait-section-${sectionKey}`);
    if (section) {
        section.classList.toggle('collapsed');
    }
}

// [MVVM] ViewModel - Logique d'ajout/retrait d'un trait
function toggleCharacterTrait(charId, trait) {
    const character = project.characters.find(c => c.id === charId);
    if (!character) return;

    if (!character.traits) character.traits = [];

    const index = character.traits.indexOf(trait);
    if (index > -1) {
        // Retirer le trait
        character.traits.splice(index, 1);
    } else {
        // Ajouter le trait
        character.traits.push(trait);
    }

    saveProject();
    refreshTraitsDisplay(charId);
}

// [MVVM] ViewModel - Logique de suppression d'un trait
function removeCharacterTrait(charId, index) {
    const character = project.characters.find(c => c.id === charId);
    if (!character || !character.traits) return;

    character.traits.splice(index, 1);
    saveProject();
    refreshTraitsDisplay(charId);
}

// [MVVM] View - Mise à jour ciblée du DOM pour les traits
function refreshTraitsDisplay(charId) {
    const character = project.characters.find(c => c.id === charId);
    if (!character) return;

    const traits = character.traits || [];

    // Mettre à jour la zone des traits sélectionnés
    const selectedContainer = document.getElementById(`selectedTraits-${charId}`);
    if (selectedContainer) {
        selectedContainer.innerHTML = traits.length > 0
            ? traits.map((t, i) => `
                        <span class="selected-trait">${t}<span class="trait-remove" onclick="removeCharacterTrait(${charId}, ${i})">×</span></span>
                    `).join('')
            : '<span class="no-traits">Cliquez sur les traits ci-dessous pour les ajouter</span>';
    }

    // Mettre à jour les options dans les catégories
    document.querySelectorAll('.trait-option').forEach(option => {
        const traitName = option.textContent;
        if (traits.includes(traitName)) {
            option.classList.add('selected');
        } else {
            option.classList.remove('selected');
        }
    });
}

// [MVVM] ViewModel - Mise à jour d'une statistique et rafraîchissement
function updatePersonalityStat(charId, stat, value) {
    const character = project.characters.find(c => c.id === charId);
    if (character && character.personality) {
        character.personality[stat] = parseInt(value);
        saveProject();
        // Update display
        const control = event.target.parentElement;
        const valueSpan = control.querySelector('.radar-value');
        if (valueSpan) valueSpan.textContent = value;
        // Redraw radar
        initCharacterRadar(character);
    }
}

// [MVVM] View - Rendu graphique du radar (Canvas)
function initCharacterRadar(character) {
    const canvas = document.getElementById(`radarChart-${character.id}`);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 50;

    const stats = character.personality;
    const labels = ['Intelligence', 'Force', 'Robustesse', 'Empathie', 'Perception', 'Agilité', 'Sociabilité'];
    const values = [stats.intelligence, stats.force, stats.robustesse, stats.empathie, stats.perception, stats.agilite, stats.sociabilite];
    const numPoints = labels.length;
    const angleStep = (Math.PI * 2) / numPoints;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid circles
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    for (let i = 1; i <= 4; i++) {
        ctx.beginPath();
        const gridRadius = (radius / 4) * i;
        for (let j = 0; j <= numPoints; j++) {
            const angle = (angleStep * j) - Math.PI / 2;
            const x = centerX + Math.cos(angle) * gridRadius;
            const y = centerY + Math.sin(angle) * gridRadius;
            if (j === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
    }

    // Draw axes
    ctx.strokeStyle = '#ccc';
    for (let i = 0; i < numPoints; i++) {
        const angle = (angleStep * i) - Math.PI / 2;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(centerX + Math.cos(angle) * radius, centerY + Math.sin(angle) * radius);
        ctx.stroke();
    }

    // Draw data polygon
    ctx.fillStyle = 'rgba(100, 100, 120, 0.5)';
    ctx.strokeStyle = 'var(--primary-color)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < numPoints; i++) {
        const angle = (angleStep * i) - Math.PI / 2;
        const value = values[i] / 20; // Normalize to 0-1
        const x = centerX + Math.cos(angle) * radius * value;
        const y = centerY + Math.sin(angle) * radius * value;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Draw data points
    ctx.fillStyle = 'var(--primary-color)';
    for (let i = 0; i < numPoints; i++) {
        const angle = (angleStep * i) - Math.PI / 2;
        const value = values[i] / 20;
        const x = centerX + Math.cos(angle) * radius * value;
        const y = centerY + Math.sin(angle) * radius * value;
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();
    }

    // Draw labels
    ctx.fillStyle = 'var(--text-secondary)';
    ctx.font = '12px "Crimson Pro", serif';
    ctx.textAlign = 'center';
    for (let i = 0; i < numPoints; i++) {
        const angle = (angleStep * i) - Math.PI / 2;
        const labelRadius = radius + 30;
        const x = centerX + Math.cos(angle) * labelRadius;
        const y = centerY + Math.sin(angle) * labelRadius;

        // Draw value in brackets
        const displayValue = values[i] === 20 ? '[MAX]' : `[${values[i]}]`;
        ctx.fillText(`${displayValue} ${labels[i]}`, x, y);
    }

    // Draw center cross
    ctx.strokeStyle = '#999';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(centerX - 5, centerY);
    ctx.lineTo(centerX + 5, centerY);
    ctx.moveTo(centerX, centerY - 5);
    ctx.lineTo(centerX, centerY + 5);
    ctx.stroke();
}

// [MVVM] ViewModel - Logique d'ajout d'un item d'inventaire
function addInventoryItem(charId, listType) {
    const character = project.characters.find(c => c.id === charId);
    if (character) {
        if (!character[listType]) character[listType] = [];
        character[listType].push({
            id: Date.now(),
            name: '',
            quantity: 1,
            description: ''
        });
        saveProject();
        // Mettre à jour seulement la liste sans re-rendre toute la fiche
        refreshInventoryList(charId, listType);
    }
}

// [MVVM] ViewModel - Logique de suppression d'un item d'inventaire
function removeInventoryItem(charId, listType, index) {
    const character = project.characters.find(c => c.id === charId);
    if (character && character[listType]) {
        character[listType].splice(index, 1);
        saveProject();
        // Mettre à jour seulement la liste sans re-rendre toute la fiche
        refreshInventoryList(charId, listType);
    }
}

// [MVVM] View - Mise à jour ciblée du DOM pour l'inventaire
function refreshInventoryList(charId, listType) {
    const character = project.characters.find(c => c.id === charId);
    if (!character) return;

    const containerId = `inventory-list-${charId}`;
    const container = document.getElementById(containerId);
    if (!container) {
        // Fallback: re-rendre toute la fiche si le container n'existe pas
        openCharacterDetail(charId);
        return;
    }

    const items = character[listType] || [];

    container.innerHTML = items.map((item, index) => renderInventoryItem(charId, listType, item, index)).join('');

    // Rafraîchir les icônes Lucide
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

// [MVVM] ViewModel - Logique de mise à jour d'un item
function updateInventoryItem(charId, listType, index, field, value) {
    const character = project.characters.find(c => c.id === charId);
    if (character && character[listType] && character[listType][index]) {
        character[listType][index][field] = value;
        saveProject();
    }
}

// [MVVM] ViewModel - Gestion de l'avatar et interaction utilisateur
function changeCharacterAvatar(charId) {
    const character = project.characters.find(c => c.id === charId);
    if (!character) return;

    const choice = prompt('Choisissez un emoji pour l\'avatar (ou collez une URL d\'image) :', character.avatarEmoji || '??');
    if (choice === null) return;

    if (choice.startsWith('http')) {
        character.avatarImage = choice;
        character.avatarEmoji = '';
    } else {
        character.avatarEmoji = choice || '??';
        character.avatarImage = '';
    }

    saveProject();
    openCharacterDetail(charId);
}
