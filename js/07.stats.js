// ==========================================
// HELPER FUNCTIONS - STATS & PROGRESSION
// ==========================================

// [MVVM : ViewModel]
// Formate un nombre pour l'affichage (ex: 1.2k)
function formatWordCount(count) {
    if (count >= 1000) {
        return (count / 1000).toFixed(1).replace('.0', '') + 'k';
    }
    return count.toString();
}

// getSceneStatus supprimée - on utilise directement scene.status

// [MVVM : ViewModel]
// Calcule les statistiques d'un chapitre pour la vue
function getChapterStats(chapter) {
    const totalScenes = chapter.scenes.length;
    const totalWords = chapter.scenes.reduce((sum, s) => sum + (s.wordCount || 0), 0);
    const completedScenes = chapter.scenes.filter(s => (s.status || 'draft') === 'complete').length;
    const progressPercent = totalScenes > 0 ? Math.round((completedScenes / totalScenes) * 100) : 0;
    return { totalScenes, totalWords, completedScenes, progressPercent };
}

// [MVVM : ViewModel]
// Calcule les statistiques d'un acte pour la vue
function getActStats(act) {
    const totalChapters = act.chapters.length;
    const totalScenes = act.chapters.reduce((sum, ch) => sum + ch.scenes.length, 0);
    const totalWords = act.chapters.reduce((sum, ch) =>
        sum + ch.scenes.reduce((s, scene) => s + (scene.wordCount || 0), 0), 0);
    return { totalChapters, totalScenes, totalWords };
}

// [MVVM : View]
// Génère et affiche la liste des actes et chapitres dans le DOM
function renderActsList() {
    const container = document.getElementById('chaptersList');

    console.log('renderActsList called');
    console.log('container:', container);
    console.log('project.acts.length:', project.acts.length);

    if (!container) {
        console.error('chaptersList container not found!');
        return;
    }

    if (project.acts.length === 0) {
        console.log('No acts, showing empty state');
        container.innerHTML = `
                    <div style="padding: 2rem; text-align: center; color: var(--text-muted);">
                        <div style="margin-bottom: 1rem;">Aucun chapitre</div>
                        <button class="btn btn-primary" onclick="openAddChapterModal()">+ Créer un chapitre</button>
                    </div>
                `;
        updateStats();
        return;
    }

    console.log('Acts found:', project.acts);
    console.log('expandedActs:', [...expandedActs]);
    console.log('expandedChapters:', [...expandedChapters]);

    let html = '<div style="padding: 0 0.5rem;">';

    project.acts.forEach((act, actIndex) => {
        const actStats = getActStats(act);

        html += '<div class="act-group" id="act-' + act.id + '" data-act-id="' + act.id + '">';

        // Toujours afficher le header de l'acte
        const actExpanded = expandedActs.has(act.id);
        html += '<div class="act-header" data-act-id="' + act.id + '">';
        html += '<span class="drag-handle" draggable="true" onclick="event.stopPropagation()">⋮⋮</span>';
        html += '<span class="act-icon' + (actExpanded ? ' expanded' : '') + '" onclick="toggleAct(' + act.id + '); event.stopPropagation();" style="cursor: pointer;">▶</span>';
        html += '<span class="auto-number">' + (actIndex + 1) + '.</span>';
        html += '<span class="act-title" ondblclick="event.stopPropagation(); startEditingAct(' + act.id + ', this)" onclick="toggleAct(' + act.id + ')">' + act.title + '</span>';
        html += '<span class="edit-hint">✏️</span>';
        html += '<span class="word-count-badge" title="' + actStats.totalWords.toLocaleString() + ' mots">' + formatWordCount(actStats.totalWords) + '</span>';
        html += '<button class="btn btn-icon btn-small delete-btn" onclick="event.stopPropagation(); deleteAct(' + act.id + ')">×</button>';
        html += '</div>';

        // Visible si dans expandedActs
        const actVisible = expandedActs.has(act.id);
        html += '<div class="act-chapters' + (actVisible ? ' visible' : '') + '">';

        act.chapters.forEach((chapter, chapterIndex) => {
            const chapterStats = getChapterStats(chapter);
            const chapterStatus = chapterStats.progressPercent === 100 ? 'complete' : chapterStats.progressPercent > 0 ? 'progress' : 'draft';

            // Numérotation complète
            const chapterNumber = (actIndex + 1) + '.' + (chapterIndex + 1);

            html += '<div class="chapter-group" id="chapter-' + chapter.id + '" data-chapter-id="' + chapter.id + '" data-act-id="' + act.id + '">';
            html += '<div class="chapter-header" data-chapter-id="' + chapter.id + '" data-act-id="' + act.id + '">';
            html += '<span class="drag-handle" draggable="true" onclick="event.stopPropagation()">⋮⋮</span>';

            // Icône avec classe expanded si le chapitre est déplié
            const chapterExpanded = expandedChapters.has(chapter.id);
            html += '<span class="chapter-icon' + (chapterExpanded ? ' expanded' : '') + '" onclick="toggleChapter(' + act.id + ', ' + chapter.id + '); event.stopPropagation();" style="cursor: pointer;">▶</span>';
            html += '<span class="auto-number">' + chapterNumber + '</span>';
            html += '<span class="chapter-title" ondblclick="event.stopPropagation(); startEditingChapter(' + act.id + ', ' + chapter.id + ', this)" onclick="toggleChapter(' + act.id + ', ' + chapter.id + ')">' + chapter.title + '</span>';
            html += '<span class="edit-hint">✏️</span>';
            html += '<span class="word-count-badge" title="' + chapterStats.totalWords.toLocaleString() + ' mots">' + formatWordCount(chapterStats.totalWords) + '</span>';
            html += '<span class="status-badge status-' + chapterStatus + '" title="' + chapterStats.progressPercent + '%"></span>';
            html += '<span class="chapter-count">' + chapter.scenes.length + '</span>';
            html += '<button class="btn btn-icon btn-small delete-btn" onclick="event.stopPropagation(); deleteChapter(' + act.id + ', ' + chapter.id + ')">×</button>';
            html += '</div>';

            // Visible si dans expandedChapters
            const chapterVisible = expandedChapters.has(chapter.id);
            html += '<div class="scenes-list' + (chapterVisible ? ' visible' : '') + '">';

            chapter.scenes.forEach((scene, sceneIndex) => {
                const sceneStatus = scene.status || 'draft';
                const sceneWords = scene.wordCount || 0;
                const synopsis = scene.synopsis ? scene.synopsis.substring(0, 100) + (scene.synopsis.length > 100 ? '...' : '') : '';
                const tooltipText = scene.synopsis ? scene.synopsis.replace(/"/g, '&quot;').replace(/'/g, '&#39;') : '';

                // Numérotation complète
                const sceneNumber = (actIndex + 1) + '.' + (chapterIndex + 1) + '.' + (sceneIndex + 1);

                html += '<div class="scene-item draggable" draggable="true" data-scene-id="' + scene.id + '" data-chapter-id="' + chapter.id + '" data-act-id="' + act.id + '" onclick="openScene(' + act.id + ', ' + chapter.id + ', ' + scene.id + ')"' + (tooltipText ? ' title="' + tooltipText + '"' : '') + '>';
                html += '<div style="display: flex; align-items: center; gap: 0.4rem; flex: 1; min-width: 0;">';
                html += '<span class="drag-handle">⋮⋮</span>';
                html += '<span class="auto-number">' + sceneNumber + '</span>';
                html += '<div style="flex: 1; min-width: 0; overflow: hidden;">';
                html += '<span ondblclick="event.stopPropagation(); startEditingScene(' + act.id + ', ' + chapter.id + ', ' + scene.id + ', this)" style="display: block;">' + scene.title + '</span>';
                if (synopsis) {
                    html += '<span class="scene-synopsis">' + synopsis + '</span>';
                }
                html += '</div>';
                html += '<span class="edit-hint">✏️</span>';
                html += '</div>';
                html += '<span class="word-count-badge" title="' + sceneWords.toLocaleString() + ' mots">' + formatWordCount(sceneWords) + '</span>';
                html += '<span class="status-badge status-' + sceneStatus + '" onclick="event.stopPropagation(); toggleSceneStatus(' + act.id + ', ' + chapter.id + ', ' + scene.id + ', event)" style="cursor: pointer;" title="Cliquez pour changer le statut"></span>';
                html += '<button class="btn btn-icon btn-small delete-btn" onclick="event.stopPropagation(); deleteScene(' + act.id + ', ' + chapter.id + ', ' + scene.id + ')">×</button>';
                html += '</div>';
            });

            html += '<div class="scene-item" onclick="openAddSceneModal(' + act.id + ', ' + chapter.id + ')" style="opacity: 0.6; font-style: italic;">+ Ajouter une scène</div>';
            html += '</div></div>';
        });

        // Bouton ajouter chapitre
        html += '<div class="scene-item" onclick="openAddChapterModal(' + act.id + ')" style="opacity: 0.6; font-style: italic; margin-left: 1rem;">+ Ajouter un chapitre</div>';
        html += '</div></div>';
    });

    html += '</div>';

    console.log('Generated HTML length:', html.length);
    console.log('First 500 chars:', html.substring(0, 500));

    container.innerHTML = html;

    console.log('Container innerHTML set, children:', container.children.length);

    setupActDragAndDrop();
    setupChapterDragAndDrop();
    setupSceneDragAndDrop();
    updateStats();
    updateProgressBar();
    applyStatusFilters();
    setTimeout(() => restoreTreeState(), 50);
}
// [MVVM : View]
// Génère le HTML pour les liens personnages d'une scène
function renderSceneCharacters(actId, chapterId, scene) {
    if (!scene.linkedCharacters || scene.linkedCharacters.length === 0) {
        return '<span style="font-size: 0.8rem; color: var(--text-muted); font-style: italic;">Aucun personnage lié</span>';
    }

    return scene.linkedCharacters.map(charId => {
        const character = project.characters.find(c => c.id === charId);
        if (!character) return '';
        return `
                    <span class="link-badge" onclick="event.stopPropagation(); switchView('characters'); openCharacterDetail(${charId});">
                        ${character.name}
                        <span class="link-badge-remove" onclick="event.stopPropagation(); toggleCharacterInScene(${actId}, ${chapterId}, ${scene.id}, ${charId}); openScene(${actId}, ${chapterId}, ${scene.id});">×</span>
                    </span>
                `;
    }).join('');
}

// [MVVM : View]
// Génère le HTML pour les liens éléments/lieux d'une scène
function renderSceneElements(actId, chapterId, scene) {
    //if (!scene.linkedElements || scene.linkedElements.length === 0) {
    //    return '<span style="font-size: 0.8rem; color: var(--text-muted); font-style: italic;">Aucun élément lié</span>';
    //}

    //return scene.linkedElements.map(elemId => {
    //    const element = project.world.find(e => e.id === elemId);
    //    if (!element) return '';
    //    return `
    //        <span class="link-badge" onclick="event.stopPropagation(); switchView('world'); openWorldDetail(${elemId});">
    //            ${element.name}
    //            <span class="link-badge-remove" onclick="event.stopPropagation(); toggleElementInScene(${actId}, ${chapterId}, ${scene.id}, ${elemId}); openScene(${actId}, ${chapterId}, ${scene.id});">×</span>
    //       </span>
    //    `;
    //}).join('');
    return '';
}

// [MVVM : View]
// Génère le HTML pour les événements temporels liés à une scène
function renderSceneMetroEvents(sceneId) {
    if (!project.metroTimeline || project.metroTimeline.length === 0) {
        return '<span style="font-size: 0.8rem; color: var(--text-muted); font-style: italic;">Aucun événement</span>';
    }

    // Find all events linked to this scene (use == for loose comparison to handle string/number)
    const linkedEvents = project.metroTimeline.filter(event => event.sceneId == sceneId);

    if (linkedEvents.length === 0) {
        return '<span style="font-size: 0.8rem; color: var(--text-muted); font-style: italic;">Aucun événement lié</span>';
    }

    return linkedEvents.map(event => {
        return `
                    <span class="link-badge" style="background: var(--accent-blue); color: white;" onclick="event.stopPropagation(); openMetroEventFromScene(${event.id});" title="${event.date || 'Sans date'}">
                        <i data-lucide="train-track" style="width:12px;height:12px;vertical-align:middle;margin-right:2px;"></i>
                        ${event.title}
                    </span>
                `;
    }).join('');
}

// [MVVM : View]
// Ouvre la modale pour lier des personnages (Gestion UI)
function openCharacterLinker(actId, chapterId, sceneId) {
    const act = project.acts.find(a => a.id === actId);
    const chapter = act.chapters.find(c => c.id === chapterId);
    const scene = chapter.scenes.find(s => s.id === sceneId);

    document.getElementById('referencesModalTitle').textContent = 'Lier des personnages à cette scène';
    document.getElementById('referencesModalContent').innerHTML = `
                <div class="tag-selector">
                    ${project.characters.map(char => {
        // Utiliser la nouvelle structure confirmedPresentCharacters pour l'état visuel de la modale
        const isLinked = scene.confirmedPresentCharacters && scene.confirmedPresentCharacters.includes(char.id);
        return `
                            <div class="tag-option ${isLinked ? 'selected' : ''}" 
                                 onclick="toggleCharacterLinkerAction(${char.id}); this.classList.toggle('selected');">
                                ${char.name}
                            </div>
                        `;
    }).join('')}
                </div>
                ${project.characters.length === 0 ? '<p style="color: var(--text-muted); margin-top: 1rem;">Aucun personnage créé. Créez des personnages dans l\'onglet Personnages.</p>' : ''}
            `;

    document.getElementById('referencesModal').classList.add('active');
}

// [MVVM : View]
// Ouvre la modale pour lier des éléments (Gestion UI)
function openElementLinker(actId, chapterId, sceneId) {
    const act = project.acts.find(a => a.id === actId);
    const chapter = act.chapters.find(c => c.id === chapterId);
    const scene = chapter.scenes.find(s => s.id === sceneId);

    document.getElementById('referencesModalTitle').textContent = 'Lier des lieux/éléments à cette scène';
    document.getElementById('referencesModalContent').innerHTML = `
                <div class="tag-selector">
                    ${project.world.map(elem => {
        const isLinked = scene.linkedElements && scene.linkedElements.includes(elem.id);
        return `
                            <div class="tag-option ${isLinked ? 'selected' : ''}" 
                                 onclick="toggleElementInScene(${actId}, ${chapterId}, ${sceneId}, ${elem.id}); this.classList.toggle('selected');">
                                ${elem.name} <small>(${elem.type})</small>
                            </div>
                        `;
    }).join('')}
                </div>
                ${project.world.length === 0 ? '<p style="color: var(--text-muted); margin-top: 1rem;">Aucun élément créé. Créez des lieux dans l\'onglet Univers.</p>' : ''}
            `;

    document.getElementById('referencesModal').classList.add('active');
}

// [MVVM : View]
// Génère et affiche l'éditeur de texte complet
function renderEditor(act, chapter, scene) {
    const editorView = document.getElementById('editorView');
    const wordCount = getWordCount(scene.content);

    // Vérifier si une version finale existe
    const hasFinalVersion = scene.versions && scene.versions.some(v => v.isFinal === true);
    const finalVersion = hasFinalVersion ? scene.versions.find(v => v.isFinal === true) : null;
    const finalVersionBadge = hasFinalVersion
        ? `<span style="display: inline-flex; align-items: center; gap: 0.25rem; background: var(--accent-gold); color: var(--bg-accent); font-size: 0.7rem; font-weight: 600; padding: 0.2rem 0.5rem; border-radius: 10px; margin-left: 0.5rem;" title="Version finale : ${finalVersion.number}">⭐ ${finalVersion.number}</span>`
        : '';

    editorView.innerHTML = `
                <div class="editor-fixed-top">
                    <div class="editor-header">
                        <div class="editor-breadcrumb">${act.title} > ${chapter.title}</div>
                        <div style="display: flex; align-items: center; gap: 1rem;">
                            <div class="editor-title" style="flex: 1;">${scene.title}${finalVersionBadge}</div>
                            <button class="btn btn-small" onclick="toggleFocusMode()" title="Mode Focus (F11)" style="white-space: nowrap;">
                                <i data-lucide="maximize" style="width:14px;height:14px;vertical-align:middle;margin-right:4px;"></i>Focus
                            </button>
                        </div>
                        <div class="editor-meta">
                            <span id="sceneWordCount">${wordCount} mots</span>
                            <span>Dernière modification : ${new Date().toLocaleDateString('fr-FR')}</span>
                        </div>
                        <div class="editor-synopsis">
                            <span class="synopsis-label"><i data-lucide="file-text" style="width:12px;height:12px;"></i> Résumé :</span>
                            <input type="text" 
                                   class="synopsis-input" 
                                   value="${(scene.synopsis || '').replace(/"/g, '&quot;')}" 
                                   placeholder="Ajouter un résumé de la scène..."
                                   onchange="updateSceneSynopsis(${act.id}, ${chapter.id}, ${scene.id}, this.value)"
                                   oninput="this.style.width = Math.max(200, this.scrollWidth) + 'px'">
                        </div>
                    </div>
                    <button class="toolbar-mobile-toggle" onclick="toggleEditorToolbar()">
                        <span id="toolbarToggleText"><i data-lucide="pen-line" style="width:14px;height:14px;vertical-align:middle;margin-right:4px;"></i>Afficher les outils de formatage</span>
                    </button>
                    <button class="links-panel-toggle" onclick="toggleLinksPanel()">
                        <span id="linksPanelToggleText"><i data-lucide="chevron-right" style="width:14px;height:14px;vertical-align:middle;margin-right:4px;"></i>Afficher personnages & lieux liés</span>
                    </button>
                    <div class="editor-toolbar" id="editorToolbar">
                        <!-- Basic formatting -->
                        <div class="toolbar-group">
                            <button class="toolbar-btn" data-format="bold" onclick="formatText('bold')" title="Gras (Ctrl+B)">
                                <strong>B</strong>
                            </button>
                            <button class="toolbar-btn" data-format="italic" onclick="formatText('italic')" title="Italique (Ctrl+I)">
                                <em>I</em>
                            </button>
                            <button class="toolbar-btn" data-format="underline" onclick="formatText('underline')" title="Souligné (Ctrl+U)">
                                <u>U</u>
                            </button>
                            <button class="toolbar-btn" data-format="strikethrough" onclick="formatText('strikeThrough')" title="Barré">
                                <s>S</s>
                            </button>
                        </div>
                        
                        <!-- Font family and size -->
                        <div class="toolbar-group">
                            <select class="font-family-selector" onchange="formatText('fontName', this.value)" title="Police de caractères">
                                <option value="Crimson Pro">Crimson Pro</option>
                                <option value="Arial">Arial</option>
                                <option value="Georgia">Georgia</option>
                                <option value="Times New Roman">Times New Roman</option>
                                <option value="Courier New">Courier New</option>
                                <option value="Verdana">Verdana</option>
                                <option value="Garamond">Garamond</option>
                                <option value="Palatino">Palatino</option>
                            </select>
                            <select class="font-size-selector" onchange="formatText('fontSize', this.value)" title="Taille de police">
                                <option value="1">Très petit</option>
                                <option value="2">Petit</option>
                                <option value="3" selected>Normal</option>
                                <option value="4">Grand</option>
                                <option value="5">Très grand</option>
                                <option value="6">Énorme</option>
                                <option value="7">Gigantesque</option>
                            </select>
                        </div>
                        
                        <!-- Text color -->
                        <div class="toolbar-group">
                            <div class="color-picker-wrapper">
                                <button class="toolbar-btn" onclick="toggleColorPicker('text', event)" title="Couleur du texte">
                                    <span style="border-bottom: 3px solid currentColor;">A</span>
                                </button>
                                <div class="color-picker-dropdown" id="textColorPicker">
                                    <div class="color-grid" id="textColorGrid"></div>
                                    <div class="color-input-wrapper">
                                        <input type="color" id="textColorInput" onchange="applyTextColor(this.value)">
                                        <input type="text" id="textColorHex" placeholder="#000000" maxlength="7" onchange="applyTextColor(this.value)">
                                    </div>
                                </div>
                            </div>
                            <div class="color-picker-wrapper">
                                <button class="toolbar-btn" onclick="toggleColorPicker('background', event)" title="Couleur de fond">
                                    <span style="background: yellow; padding: 0 4px;">A</span>
                                </button>
                                <div class="color-picker-dropdown" id="backgroundColorPicker">
                                    <div class="color-grid" id="backgroundColorGrid"></div>
                                    <div class="color-input-wrapper">
                                        <input type="color" id="bgColorInput" onchange="applyBackgroundColor(this.value)">
                                        <input type="text" id="bgColorHex" placeholder="#FFFF00" maxlength="7" onchange="applyBackgroundColor(this.value)">
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Alignment -->
                        <div class="toolbar-group">
                            <button class="toolbar-btn" onclick="formatText('justifyLeft')" title="Aligner à gauche">
                                ⫷
                            </button>
                            <button class="toolbar-btn" onclick="formatText('justifyCenter')" title="Centrer">
                                ⫶
                            </button>
                            <button class="toolbar-btn" onclick="formatText('justifyRight')" title="Aligner à droite">
                                ⫸
                            </button>
                            <button class="toolbar-btn" onclick="formatText('justifyFull')" title="Justifier">
                                ☰
                            </button>
                        </div>
                        
                        <!-- Headings -->
                        <div class="toolbar-group">
                            <button class="toolbar-btn" onclick="formatText('formatBlock', 'h1')" title="Titre 1">H1</button>
                            <button class="toolbar-btn" onclick="formatText('formatBlock', 'h2')" title="Titre 2">H2</button>
                            <button class="toolbar-btn" onclick="formatText('formatBlock', 'h3')" title="Titre 3">H3</button>
                            <button class="toolbar-btn" onclick="formatText('formatBlock', 'p')" title="Paragraphe">P</button>
                        </div>
                        
                        <!-- Lists and quotes -->
                        <div class="toolbar-group">
                            <button class="toolbar-btn" onclick="formatText('insertUnorderedList')" title="Liste à puces">• Liste</button>
                            <button class="toolbar-btn" onclick="formatText('insertOrderedList')" title="Liste numérotée">1. Liste</button>
                            <button class="toolbar-btn" onclick="formatText('formatBlock', 'blockquote')" title="Citation">❝ Citation</button>
                        </div>
                        
                        <!-- Indentation -->
                        <div class="toolbar-group">
                            <button class="toolbar-btn" onclick="formatText('indent')" title="Augmenter l'indentation">→|</button>
                            <button class="toolbar-btn" onclick="formatText('outdent')" title="Diminuer l'indentation">|←</button>
                        </div>
                        
                        <!-- Superscript, subscript -->
                        <div class="toolbar-group">
                            <button class="toolbar-btn" onclick="formatText('superscript')" title="Exposant">x²</button>
                            <button class="toolbar-btn" onclick="formatText('subscript')" title="Indice">x₂</button>
                        </div>
                        
                        <!-- Annotations -->
                        <div class="toolbar-group">
                            <button class="toolbar-btn annotations-toolbar-btn" onclick="toggleAnnotationsPanel()" title="Annotations" id="toolbarAnnotationsBtn"><i data-lucide="message-square"></i></button>
                        </div>
                        
                        <!-- Arcs Narratifs -->
                        <div class="toolbar-group">
                            <button class="toolbar-btn" onclick="toggleArcScenePanel()" title="Arcs narratifs" id="toolbarArcsBtn"><i data-lucide="git-commit-horizontal"></i></button>
                        </div>
                        
                        <!-- Other -->
                        <div class="toolbar-group">
                            <button class="toolbar-btn" onclick="formatText('insertHorizontalRule')" title="Ligne horizontale">─</button>
                            <button class="toolbar-btn" onclick="formatText('removeFormat')" title="Supprimer le formatage">✕ Format</button>
                        </div>
                        
                        <!-- Révision - à la fin -->
                        <div class="toolbar-group">
                            <button class="toolbar-btn" onclick="toggleRevisionMode()" title="Mode Révision (Ctrl+R)" id="toolbarRevisionBtn" style="color: var(--accent-gold); font-weight: 600;">✏️ RÉVISION</button>
                        </div>
                    </div>
                    
                    <div class="links-panel-sticky" id="linksPanel">
                        <div style="display: flex; gap: 2rem; align-items: start;">
                            <div style="flex: 1;">
                                <div style="font-size: 0.85rem; font-weight: 600; margin-bottom: 0.5rem; color: var(--text-muted);"><i data-lucide="users" style="width:14px;height:14px;vertical-align:middle;margin-right:4px;"></i>Personnages</div>
                                <div class="quick-links">
                                    ${renderSceneCharacters(act.id, chapter.id, scene)}
                                    </div>
                            </div>
                            <div style="flex: 1;">
                                <div style="font-size: 0.85rem; font-weight: 600; margin-bottom: 0.5rem; color: var(--text-muted);"><i data-lucide="globe" style="width:14px;height:14px;vertical-align:middle;margin-right:4px;"></i>Lieux/Éléments</div>
                                <div class="quick-links">
                                    ${renderSceneElements(act.id, chapter.id, scene)}
                                    </div>
                            </div>
                            <div style="flex: 1;">
                                <div style="font-size: 0.85rem; font-weight: 600; margin-bottom: 0.5rem; color: var(--text-muted);"><i data-lucide="train-track" style="width:14px;height:14px;vertical-align:middle;margin-right:4px;"></i>Timeline</div>
                                <div class="quick-links">
                                    ${renderSceneMetroEvents(scene.id)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="editor-workspace">
                    <div class="editor-content">
                        <div 
                            class="editor-textarea" 
                            contenteditable="true"
                            spellcheck="true"
                            data-placeholder="Commencez à écrire votre scène..."
                            oninput="updateSceneContent()"
                            onkeydown="handleEditorKeydown(event)"
                        >${scene.content}</div>
                    </div>
                </div>
            `;

    // Focus the editor
    setTimeout(() => {
        const editor = document.querySelector('.editor-textarea');
        if (editor && editor.textContent.trim() === '') {
            editor.focus();
        }
    }, 100);
}

// [MVVM : View]
// Affiche l'état vide de l'éditeur
function showEmptyState() {
    const editorView = document.getElementById('editorView');
    editorView.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">✍️</div>
                    <div class="empty-state-title">Sélectionnez une scène</div>
                    <div class="empty-state-text">
                        Choisissez une scène dans la barre latérale pour commencer à écrire.
                    </div>
                </div>
            `;

    // Reset versions sidebar
    renderSceneVersionsList();
}

// Alias pour renderWelcomeEditor
// [MVVM : View]
// Alias pour l'état vide
function renderWelcomeEditor() {
    showEmptyState();
}

// [MVVM : View]
// Affiche l'écran d'accueil des personnages
function renderCharacterWelcome() {
    const editorView = document.getElementById('editorView');
    editorView.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon"><i data-lucide="users" style="width:48px;height:48px;stroke-width:1.5;"></i></div>
                    <div class="empty-state-title">Personnages</div>
                    <div class="empty-state-text">
                        Sélectionnez un personnage dans la liste pour voir sa fiche,<br>
                        ou créez-en un nouveau.
                    </div>
                </div>
            `;
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

// [MVVM : View]
// Affiche l'écran d'accueil de l'univers
function renderWorldWelcome() {
    const editorView = document.getElementById('editorView');
    editorView.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon"><i data-lucide="globe" style="width:48px;height:48px;stroke-width:1.5;"></i></div>
                    <div class="empty-state-title">Univers</div>
                    <div class="empty-state-text">
                        Sélectionnez un élément dans la liste pour voir ses détails,<br>
                        ou créez un nouvel élément de votre univers.
                    </div>
                </div>
            `;
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

// [MVVM : View]
// Affiche l'écran d'accueil des notes
function renderNotesWelcome() {
    const editorView = document.getElementById('editorView');
    editorView.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon"><i data-lucide="sticky-note" style="width:48px;height:48px;stroke-width:1.5;"></i></div>
                    <div class="empty-state-title">Notes</div>
                    <div class="empty-state-text">
                        Sélectionnez une note dans la liste pour la consulter,<br>
                        ou créez une nouvelle note.
                    </div>
                </div>
            `;
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

// [MVVM : View]
// Affiche l'écran d'accueil du codex
function renderCodexWelcome() {
    const editorView = document.getElementById('editorView');
    editorView.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon"><i data-lucide="book-open" style="width:48px;height:48px;stroke-width:1.5;"></i></div>
                    <div class="empty-state-title">Codex</div>
                    <div class="empty-state-text">
                        Sélectionnez une entrée dans la liste pour la consulter,<br>
                        ou créez une nouvelle entrée de codex.
                    </div>
                </div>
            `;
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

// [MVVM : Other]
// Synchronise la Vue vers le Modèle (Input -> Data) et sauvegarde (Mixte)
function updateSceneContent() {
    const editor = document.querySelector('.editor-textarea');
    const act = project.acts.find(a => a.id === currentActId);
    const chapter = act.chapters.find(c => c.id === currentChapterId);
    const scene = chapter.scenes.find(s => s.id === currentSceneId);

    scene.content = editor.innerHTML;

    const wordCount = getWordCount(editor.innerHTML);
    scene.wordCount = wordCount;

    // Update active version content
    updateSceneContentWithVersion(editor.innerHTML);

    document.getElementById('sceneWordCount').textContent = `${wordCount} mots`;

    saveProject();
    updateStats();
    renderActsList();
    trackWritingSession();

    // Mettre à jour les indicateurs en mode focus
    if (focusModeActive) {
        updateWritingProgress();
    }

    // Auto-détection des personnages et lieux mentionnés dans le texte
    autoDetectLinksDebounced();
}

// [MVVM : Model]
// Utilitaire pur pour compter les mots (Logique métier)
function getWordCount(html) {
    // Create temporary div to strip HTML tags
    const temp = document.createElement('div');
    temp.innerHTML = html;
    const text = temp.textContent || temp.innerText || '';
    return text.split(/\s+/).filter(w => w.length > 0).length;
}

