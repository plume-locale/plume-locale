/**
 * [MVVM : Characters ViewModel]
 * Logique métier et préparation des données pour l'interface des personnages.
 */

/**
 * [MVVM : Purpose] 
 * Centraliser la logique de manipulation des personnages et isoler la Vue des détails du Repository.
 */

/**
 * Coordination pour ajouter un personnage.
 */
function addCharacterViewModel(name, role, description) {
    if (!name) return { success: false, message: 'Le nom est obligatoire' };

    const characterData = {
        name: name,
        role: role,
        physicalDescription: description
    };

    const newCharacter = CharacterModel.create(characterData);
    CharacterRepository.add(newCharacter);

    return {
        success: true,
        character: newCharacter,
        sideEffects: {
            shouldSave: true,
            shouldOpen: newCharacter.id
        }
    };
}

/**
 * Coordination pour supprimer un personnage.
 */
function deleteCharacterViewModel(id) {
    CharacterRepository.remove(id);
    return {
        success: true,
        sideEffects: {
            shouldSave: true,
            shouldResetView: true
        }
    };
}

/**
 * Groupement des personnages par race pour l'affichage dans la liste.
 */
function getGroupedCharactersViewModel() {
    const characters = CharacterRepository.getAll();
    const races = CharacterRepository.getRaces();

    const groups = {};
    races.forEach(race => groups[race] = []);
    groups['Non classé'] = [];

    characters.forEach(char => {
        // Migration au vol si besoin pour l'affichage
        const migrated = CharacterModel.migrate(char);
        const raceKey = (migrated.race && races.includes(migrated.race)) ? migrated.race : 'Non classé';

        if (!groups[raceKey]) groups[raceKey] = [];
        groups[raceKey].push(migrated);
    });

    // Tri alphabétique dans chaque groupe
    Object.keys(groups).forEach(key => {
        groups[key].sort((a, b) => {
            const nameA = (a.name || '').toLowerCase();
            const nameB = (b.name || '').toLowerCase();
            return nameA.localeCompare(nameB, 'fr');
        });
    });

    return groups;
}

/**
 * Prépare les données pour la fiche détaillée d'un personnage.
 */
function getCharacterDetailViewModel(id) {
    const rawChar = CharacterRepository.getById(id);
    if (!rawChar) return null;

    const character = CharacterModel.migrate(rawChar);
    const races = CharacterRepository.getRaces();
    const linkedScenes = getLinkedScenesViewModel(id);

    return {
        character,
        races,
        linkedScenes
    };
}

/**
 * Récupère les scènes où le personnage apparaît.
 */
function getLinkedScenesViewModel(characterId) {
    if (typeof findScenesWithCharacter !== 'function') return [];

    // findScenesWithCharacter utilise probablement déjà project, 
    // mais on l'encapsule ici pour que la Vue n'ait pas à le savoir.
    const scenes = findScenesWithCharacter(characterId);

    return scenes.map(scene => {
        const acts = typeof ActRepository !== 'undefined' ? ActRepository.getAll() : (project.acts || []);
        const actIndex = acts.findIndex(a => a.id === scene.actId);

        return {
            actId: scene.actId,
            chapterId: scene.chapterId,
            sceneId: scene.sceneId,
            sceneTitle: scene.sceneTitle,
            actTitle: scene.actTitle,
            chapterTitle: scene.chapterTitle,
            actNumber: actIndex !== -1 ? (actIndex + 1) : '?',
            chapterNumber: scene.chapterId ? '?' : '?' // On pourrait affiner en cherchant dans l'acte
        };
    });
}

/**
 * Mise à jour générique d'un champ.
 */
function updateCharacterFieldViewModel(id, field, value) {
    const updates = { [field]: value };
    const char = CharacterRepository.getById(id);
    if (!char) return { success: false };

    // Logique spéciale pour le nom complet -> split
    if (field === 'name') {
        const parts = (value || '').trim().split(' ');
        updates.firstName = parts[0] || '';
        updates.lastName = parts.slice(1).join(' ') || '';
    }
    // Logique spéciale pour les composants du nom -> join
    else if (field === 'firstName' || field === 'lastName') {
        const fName = field === 'firstName' ? value : char.firstName;
        const lName = field === 'lastName' ? value : char.lastName;
        updates.name = `${fName || ''} ${lName || ''}`.trim() || 'Sans nom';
    }

    const nextValue = CharacterRepository.update(id, updates);
    return {
        success: !!nextValue,
        sideEffects: {
            shouldSave: true,
            shouldRefreshList: (field === 'firstName' || field === 'lastName' || field === 'race' || field === 'name')
        }
    };
}

/**
 * Gestion des traits (toggle).
 */
function toggleCharacterTraitViewModel(id, trait) {
    const char = CharacterRepository.getById(id);
    if (!char) return { success: false, message: 'Personnage introuvable' };

    const currentTraits = char.traits || [];
    let newTraits;

    if (currentTraits.includes(trait)) {
        newTraits = currentTraits.filter(t => t !== trait);
    } else {
        newTraits = [...currentTraits, trait];
    }

    const updatedChar = CharacterRepository.update(id, { traits: newTraits });

    return {
        success: !!updatedChar,
        data: updatedChar,
        sideEffects: {
            shouldSave: true,
            shouldRefreshTraits: true
        }
    };
}

/**
 * Ajout d'une nouvelle race.
 */
function addRaceViewModel(raceName, charIdToAssign) {
    if (!raceName || !raceName.trim()) return { success: false };

    const formatted = raceName.trim();
    const added = CharacterRepository.addRace(formatted);

    if (added && charIdToAssign) {
        CharacterRepository.update(charIdToAssign, { race: formatted });
    }

    return {
        success: true,
        alreadyExists: !added,
        sideEffects: {
            shouldSave: true,
            shouldRefreshAll: true
        }
    };
}

/**
 * Inventaire.
 */
function addInventoryItemViewModel(id, listType) {
    const char = CharacterRepository.getById(id);
    if (!char) return { success: false, message: 'Personnage introuvable' };

    const currentList = char[listType] || [];
    const newList = [...currentList, {
        id: Date.now(),
        name: '',
        quantity: 1,
        description: ''
    }];

    const updatedChar = CharacterRepository.update(id, { [listType]: newList });
    return {
        success: !!updatedChar,
        data: updatedChar,
        sideEffects: {
            shouldSave: true,
            shouldRefreshInventory: listType
        }
    };
}

function removeInventoryItemViewModel(id, listType, index) {
    const char = CharacterRepository.getById(id);
    if (!char || !char[listType]) return { success: false, message: 'Personnage ou liste introuvable' };

    const newList = char[listType].filter((_, i) => i !== index);
    const updatedChar = CharacterRepository.update(id, { [listType]: newList });

    return {
        success: !!updatedChar,
        data: updatedChar,
        sideEffects: {
            shouldSave: true,
            shouldRefreshInventory: listType
        }
    };
}

function updateInventoryItemViewModel(id, listType, index, field, value) {
    const char = CharacterRepository.getById(id);
    if (!char || !char[listType] || !char[listType][index]) return { success: false };

    const newList = char[listType].map((item, i) =>
        i === index ? { ...item, [field]: value } : item
    );

    const updatedChar = CharacterRepository.update(id, { [listType]: newList });
    return {
        success: !!updatedChar,
        data: updatedChar,
        sideEffects: {
            shouldSave: true
        }
    };
}

/**
 * Mise à jour des stats de personnalité.
 */
function updatePersonalityStatViewModel(id, stat, value) {
    const character = CharacterRepository.getById(id);
    if (!character || !character.personality) return { success: false };

    const newPersonality = {
        ...character.personality,
        [stat]: parseInt(value)
    };

    const updatedChar = CharacterRepository.update(id, { personality: newPersonality });
    return {
        success: !!updatedChar,
        data: updatedChar,
        sideEffects: {
            shouldSave: true,
            shouldRefreshRadar: true
        }
    };
}

/**
 * Mise à jour de l'avatar.
 */
function updateAvatarViewModel(id, choice) {
    const updates = {};
    if (choice.startsWith('http')) {
        updates.avatarImage = choice;
        updates.avatarEmoji = '';
    } else {
        updates.avatarEmoji = choice;
        updates.avatarImage = '';
    }

    CharacterRepository.update(id, updates);
    return { success: true, sideEffects: { shouldSave: true } };
}
