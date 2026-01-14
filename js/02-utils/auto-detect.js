// Migrated from js/08.auto-detect.js

// AUTO-DÉTECTION DES PERSONNAGES ET LIEUX

let autoDetectTimeout = null;

function autoDetectLinksDebounced() {
    clearTimeout(autoDetectTimeout);
    autoDetectTimeout = setTimeout(() => {
        autoDetectLinks();
    }, 800);
}

function getCurrentScene() {
    if (!currentActId || !currentChapterId || !currentSceneId) return null;
    const act = project.acts.find(a => a.id === currentActId);
    if (!act) return null;
    const chapter = act.chapters.find(c => c.id === currentChapterId);
    if (!chapter) return null;
    return chapter.scenes.find(s => s.id === currentSceneId);
}

function removeIdfromArray(arr, id) {
    const index = arr.indexOf(id);
    if (index > -1) {
        arr.splice(index, 1);
        return true;
    }
    return false;
}

function autoDetectLinks() {
    const scene = getCurrentScene();
    if (!scene) return;
    const editor = document.querySelector('.editor-textarea');
    if (!editor) return;
    const temp = document.createElement('div');
    temp.innerHTML = editor.innerHTML;
    const sceneText = temp.textContent || temp.innerText || '';
    const normalizedText = normalizeForSearch(sceneText);
    if (!scene.confirmedPresentCharacters) scene.confirmedPresentCharacters = [];
    if (!scene.suggestedCharacters) scene.suggestedCharacters = [];
    if (!scene.confirmedAbsentCharacters) scene.confirmedAbsentCharacters = [];
    if (scene.linkedCharacters && scene.linkedCharacters.length > 0 && scene.confirmedPresentCharacters.length === 0) {
         scene.confirmedPresentCharacters = [...scene.linkedCharacters];
         scene.linkedCharacters = [];
    }
    if (!scene.linkedElements) scene.linkedElements = [];
    let hasChanges = false;

    const lastNameCounts = {};
    project.characters.forEach(char => {
        const normalizedLastName = normalizeForSearch(char.lastName || '');
        if (normalizedLastName) {
            lastNameCounts[normalizedLastName] = (lastNameCounts[normalizedLastName] || 0) + 1;
        }
    });
    const ambiguousLastNames = new Set(Object.keys(lastNameCounts).filter(name => lastNameCounts[name] > 1));

    project.characters.forEach(char => {
        const namesToDetect = [];
        if (char.name && char.name.trim()) namesToDetect.push(char.name.trim());
        if (char.firstName && char.firstName.trim()) namesToDetect.push(char.firstName.trim());
        if (char.nickname && char.nickname.trim()) namesToDetect.push(char.nickname.trim());
        if (char.lastName && char.lastName.trim()) {
            const normalizedLastName = normalizeForSearch(char.lastName);
            if (!ambiguousLastNames.has(normalizedLastName)) {
                namesToDetect.push(char.lastName.trim());
            }
        }
        const uniqueNamesNormalized = [...new Set(namesToDetect)].filter(n => n && n.trim()).map(name => normalizeForSearch(name));
        let isInText = false;
        for (const name of uniqueNamesNormalized) {
            const regex = new RegExp('\\b' + escapeRegex(name) + '\\b', 'i');
            if (regex.test(normalizedText)) { isInText = true; break; }
        }
        const isConfirmedPresent = scene.confirmedPresentCharacters.includes(char.id);
        const isSuggested = scene.suggestedCharacters.includes(char.id);
        const isConfirmedAbsent = scene.confirmedAbsentCharacters.includes(char.id);
        if (isInText) {
            if (!isConfirmedPresent && !isConfirmedAbsent && !isSuggested) {
                scene.suggestedCharacters.push(char.id);
                hasChanges = true;
            }
        } else {
            if (isSuggested) {
                removeIdfromArray(scene.suggestedCharacters, char.id);
                hasChanges = true;
            }
        }
    });

    project.world.forEach(elem => {
        const elemNameNormalized = normalizeForSearch(elem.name);
        const regex = new RegExp('\\b' + escapeRegex(elemNameNormalized) + '\\b', 'i');
        const isInText = regex.test(normalizedText);
        const isLinked = scene.linkedElements.includes(elem.id);
        if (isInText && !isLinked) {
            scene.linkedElements.push(elem.id);
            hasChanges = true;
        } else if (!isInText && isLinked) {
            const index = scene.linkedElements.indexOf(elem.id);
            if (index > -1) { scene.linkedElements.splice(index, 1); hasChanges = true; }
        }
    });

    if (hasChanges) { saveProject(); refreshLinksPanel(); }
}

function confirmCharacterPresence(charId) {
    const scene = getCurrentScene();
    if (!scene) return;
    removeIdfromArray(scene.suggestedCharacters, charId);
    removeIdfromArray(scene.confirmedAbsentCharacters, charId);
    if (!scene.confirmedPresentCharacters.includes(charId)) scene.confirmedPresentCharacters.push(charId);
    saveProject();
    refreshLinksPanel();
}

function confirmCharacterAbsence(charId) {
    const scene = getCurrentScene();
    if (!scene) return;
    removeIdfromArray(scene.suggestedCharacters, charId);
    removeIdfromArray(scene.confirmedPresentCharacters, charId);
    if (!scene.confirmedAbsentCharacters.includes(charId)) scene.confirmedAbsentCharacters.push(charId);
    saveProject();
    refreshLinksPanel();
}

function refreshLinksPanel() {
    const linksPanel = document.getElementById('linksPanel');
    if (!linksPanel) return;
    const scene = getCurrentScene();
    if (!scene) return;
    const flexDivs = linksPanel.querySelectorAll('[style*="flex: 1"]');

    if (flexDivs.length >= 1) {
        const charDiv = flexDivs[0];
        const quickLinks = charDiv.querySelector('.quick-links');
        if (quickLinks) {
            const allCharacters = project.characters || [];
            const confirmedIds = scene.confirmedPresentCharacters || [];
            const suggestedIds = scene.suggestedCharacters || [];
            const absentIds = scene.confirmedAbsentCharacters || [];
            const presentList = allCharacters.filter(c => confirmedIds.includes(c.id));
            const suggestedList = allCharacters.filter(c => suggestedIds.includes(c.id));
            const absentList = allCharacters.filter(c => absentIds.includes(c.id));
            let html = '';
            html += '<h4 style="margin: 0 0 8px 0; font-size: 0.8rem; opacity: 0.8; text-align: left;"> <i data-lucide="check-circle" style="width: 14px; height: 14px; vertical-align: -2px; margin-right: 4px;"></i> Confirmés Présents</h4>';
            if (presentList.length > 0) {
                html += presentList.map(char => `
                    <div class="link-item present" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            ${getAvatarHTML(char)}
                            <span>${char.name}</span>
                        </div>
                        <button onclick="confirmCharacterAbsence(${char.id})" title="Retirer (Marquer absent)" class="btn-icon">
                            <i data-lucide="x" style="width: 16px; height: 16px;"></i>
                        </button>
                    </div>
                `).join('');
            } else {
                 html += '<p class="text-muted small" style="font-size: 0.75rem; margin-bottom: 12px; opacity: 0.7;">Aucun personnage confirmé présent.</p>';
            }

            html += '<h4 style="margin: 12px 0 8px 0; font-size: 0.8rem; opacity: 0.8; color: var(--accent-color); text-align: left;"><i data-lucide="help-circle" style="width: 14px; height: 14px; vertical-align: -2px; margin-right: 4px;"></i> Suggestions</h4>';
            if (suggestedList.length > 0) {
                 html += suggestedList.map(char => `
                    <div class="link-item suggested" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            ${getAvatarHTML(char)}
                            <span>${char.name}</span>
                        </div>
                        <div style="display: flex; gap: 4px;">
                            <button onclick="confirmCharacterAbsence(${char.id})" title="Ignorer" class="btn-icon">
                                <i data-lucide="x" style="width: 16px; height: 16px;"></i>
                            </button>
                            <button onclick="confirmCharacterPresence(${char.id})" title="Valider" class="btn-icon">
                                <i data-lucide="check" style="width: 16px; height: 16px;"></i>
                            </button>
                        </div>
                    </div>
                `).join('');
            } else {
                 html += '<p class="text-muted small" style="font-size: 0.75rem; margin-bottom: 12px; opacity: 0.7;">Aucune suggestion.</p>';
            }

            html += '<h4 style="margin: 12px 0 8px 0; font-size: 0.8rem; opacity: 0.8; text-align: left;"> <i data-lucide="x-circle" style="width: 14px; height: 14px; vertical-align: -2px; margin-right: 4px;"></i> Confirmés Absents</h4>';
            if (absentList.length > 0) {
                 html += absentList.map(char => `
                    <div class="link-item absent" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            ${getAvatarHTML(char)}
                            <span style="text-decoration: line-through;">${char.name}</span>
                        </div>
                        <button onclick="confirmCharacterPresence(${char.id})" title="Rétablir" class="btn-icon">
                            <i data-lucide="rotate-ccw" style="width: 16px; height: 16px;"></i>
                        </button>
                    </div>
                `).join('');
            } else {
                 html += '<p class="text-muted small" style="font-size: 0.75rem; margin-bottom: 12px; opacity: 0.7;">Aucun personnage ignoré manuellement.</p>';
            }

            html += `
                <div style="margin-top: 10px; text-align: center;">
                    <button class="btn btn-small" onclick="openCharacterLinker(${currentActId}, ${currentChapterId}, ${currentSceneId})" style="font-size: 0.75rem; padding: 4px 8px; width: 100%;">
                        <i data-lucide="plus" style="width: 12px; height: 12px; vertical-align: middle; margin-right: 4px;"></i> Lier manuellement
                    </button>
                </div>
            `;

            quickLinks.innerHTML = html;
        }
    }

    if (flexDivs.length >= 2) {
        const locationDiv = flexDivs[1];
        const quickLinks = locationDiv.querySelector('.quick-links');
        if (quickLinks) {
            const linkedIds = scene.linkedElements || [];
            const linkedElements = (project.world || []).filter(e => linkedIds.includes(e.id));
            let html = '';
            html += `
                <h4 style="margin: 0 0 8px 0; font-size: 0.8rem; opacity: 0.8; text-align: left;"><i data-lucide="globe" style="width:14px;height:14px;vertical-align:-2px;margin-right:4px;"></i> Éléments Liés</h4>
            `;
            if (linkedElements.length > 0) {
                html += linkedElements.map(elem => {
                    const iconName = getElementIcon(elem.type);
                    return `
                        <div class="link-item present" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                            <div style="display: flex; align-items: center; gap: 8px; flex: 1; min-width: 0;">
                                <i data-lucide="${iconName}" style="width: 20px; height: 20px;"></i>
                                <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${elem.name} (${elem.type})">${elem.name}</span>
                            </div>
                            <button onclick="toggleElementInScene(${currentActId}, ${currentChapterId}, ${currentSceneId}, ${elem.id}); openScene(${currentActId}, ${currentChapterId}, ${currentSceneId});" title="Délier" class="btn-icon">
                                <i data-lucide="x" style="width: 16px; height: 16px;"></i>
                            </button>
                        </div>
                    `;
                }).join('');
            } else {
                 html += '<p class="text-muted small" style="font-size: 0.75rem; margin-bottom: 12px; opacity: 0.7;">Aucun lieu ou élément lié.</p>';
            }

            html += `
                <div style="margin-top: 10px; text-align: center;">
                    <button class="btn btn-small" onclick="openElementLinker(${currentActId}, ${currentChapterId}, ${currentSceneId})" style="font-size: 0.75rem; padding: 4px 8px; width: 100%;">
                        <i data-lucide="plus" style="width: 12px; height: 12px; vertical-align: middle; margin-right: 4px;"></i> Lier manuellement
                    </button>
                </div>
            `;
            quickLinks.innerHTML = html;
        }
    }

    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function getElementIcon(type) {
    switch (type.toLowerCase()) {
        case 'lieu':
        case 'place':
            return 'map-pin';
        case 'objet':
        case 'artifact':
            return 'box';
        case 'organisation':
        case 'group':
            return 'landmark';
        case 'concept':
        case 'idée':
            return 'lightbulb';
        default:
            return 'globe';
    }
}

function toggleCharacterLinkerAction(charId) {
    const scene = getCurrentScene();
    if (!scene) return;
    const isConfirmedPresent = scene.confirmedPresentCharacters.includes(charId);
    if (isConfirmedPresent) {
        removeIdfromArray(scene.confirmedPresentCharacters, charId);
    } else {
        scene.confirmedPresentCharacters.push(charId);
        removeIdfromArray(scene.suggestedCharacters, charId);
        removeIdfromArray(scene.confirmedAbsentCharacters, charId);
    }
    saveProject(); 
    refreshLinksPanel(); 
}

function getAvatarHTML(char) {
    if (char.avatarImage) {
        return `<img src="${char.avatarImage}" style="width: 20px; height: 20px; border-radius: 50%; object-fit: cover;">`;
    } else {
        return `<i data-lucide="user" style="width: 16px; height: 16px;"></i>`;
    }
}

function normalizeForSearch(text) {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}

function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function formatText(command, value = null) {
    document.execCommand(command, false, value);
    document.querySelector('.editor-textarea').focus();
}
