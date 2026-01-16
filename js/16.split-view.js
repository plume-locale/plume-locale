// Compatibility shim: delegated to migrated implementation in `js/05-ui/split-view.js` when available.
(function () {
    function ensure(name) {
        if (typeof window[name] === 'function') return;
        window[name] = function () {
            if (window.splitViewMigrated && typeof window[name] === 'function') return window[name].apply(window, arguments);
            console.warn('Split view shim: function "' + name + '" called before migration loaded.');
        };
    }

    const exports = [
        'toggleSplitView','activateSplitView','closeSplitView','updateSplitToggleButton','renderSplitView','setActiveSplitPanel',
        'updateSidebarForSplitPanel','switchSplitPanelView','updateSplitPanelHeader','renderSplitPanelViewContent','renderViewInSplitPanel',
        'renderEditorInContainer','toggleSplitEditorToolbar','formatTextInPanel','renderWorldDetailInContainer','renderNoteDetailInContainer',
        'renderCorkboardInSplitPanel','openSceneFromSplit','renderStatsInSplitPanel','renderPlotInSplitPanel','renderRelationsInSplitPanel',
        'renderTimelineInSplitPanel','openSplitViewSelector','selectSplitPanelView','openSceneInSplitPanel','openCharacterInSplitPanel',
        'openWorldElementInSplitPanel','openNoteInSplitPanel','updateSplitSceneContent','updateSplitNoteContent','startSplitResize','doSplitResize',
        'stopSplitResize','saveSplitViewState','loadSplitViewState','openCharacterBeside','updateCharacterField'
    ];

    exports.forEach(ensure);
})();
                        
                        <!-- Font family and size -->
                        <div class="toolbar-group">
                            <select class="font-family-selector" onchange="formatTextInPanel('${panel}', 'fontName', this.value)" title="Police de caractères">
                                <option value="Crimson Pro">Crimson Pro</option>
                                <option value="Arial">Arial</option>
                                <option value="Georgia">Georgia</option>
                                <option value="Times New Roman">Times New Roman</option>
                                <option value="Courier New">Courier New</option>
                                <option value="Verdana">Verdana</option>
                                <option value="Garamond">Garamond</option>
                                <option value="Palatino">Palatino</option>
                            </select>
                            <select class="font-size-selector" onchange="formatTextInPanel('${panel}', 'fontSize', this.value)" title="Taille de police">
                                <option value="1">Très petit</option>
                                <option value="2">Petit</option>
                                <option value="3" selected>Normal</option>
                                <option value="4">Grand</option>
                                <option value="5">Très grand</option>
                                <option value="6">Énorme</option>
                                <option value="7">Gigantesque</option>
                            </select>
                        </div>
                        
                        <!-- Alignment -->
                        <div class="toolbar-group">
                            <button class="toolbar-btn" onclick="formatTextInPanel('${panel}', 'justifyLeft')" title="Aligner à gauche">
                                ⫷
                            </button>
                            <button class="toolbar-btn" onclick="formatTextInPanel('${panel}', 'justifyCenter')" title="Centrer">
                                ⫶
                            </button>
                            <button class="toolbar-btn" onclick="formatTextInPanel('${panel}', 'justifyRight')" title="Aligner à droite">
                                ⫸
                            </button>
                            <button class="toolbar-btn" onclick="formatTextInPanel('${panel}', 'justifyFull')" title="Justifier">
                                ☰
                            </button>
                        </div>
                        
                        <!-- Headings -->
                        <div class="toolbar-group">
                            <button class="toolbar-btn" onclick="formatTextInPanel('${panel}', 'formatBlock', 'h1')" title="Titre 1">H1</button>
                            <button class="toolbar-btn" onclick="formatTextInPanel('${panel}', 'formatBlock', 'h2')" title="Titre 2">H2</button>
                            <button class="toolbar-btn" onclick="formatTextInPanel('${panel}', 'formatBlock', 'h3')" title="Titre 3">H3</button>
                            <button class="toolbar-btn" onclick="formatTextInPanel('${panel}', 'formatBlock', 'p')" title="Paragraphe">P</button>
                        </div>
                        
                        <!-- Lists and quotes -->
                        <div class="toolbar-group">
                            <button class="toolbar-btn" onclick="formatTextInPanel('${panel}', 'insertUnorderedList')" title="Liste à puces">• Liste</button>
                            <button class="toolbar-btn" onclick="formatTextInPanel('${panel}', 'insertOrderedList')" title="Liste numérotée">1. Liste</button>
                            <button class="toolbar-btn" onclick="formatTextInPanel('${panel}', 'formatBlock', 'blockquote')" title="Citation">❝ Citation</button>
                        </div>
                        
                        <!-- Indentation -->
                        <div class="toolbar-group">
                            <button class="toolbar-btn" onclick="formatTextInPanel('${panel}', 'indent')" title="Augmenter l'indentation">→|</button>
                            <button class="toolbar-btn" onclick="formatTextInPanel('${panel}', 'outdent')" title="Diminuer l'indentation">|←</button>
                        </div>
                        
                        <!-- Superscript, subscript -->
                        <div class="toolbar-group">
                            <button class="toolbar-btn" onclick="formatTextInPanel('${panel}', 'superscript')" title="Exposant">x²</button>
                            <button class="toolbar-btn" onclick="formatTextInPanel('${panel}', 'subscript')" title="Indice">x₂</button>
                        </div>
                        
                        <!-- Other -->
                        <div class="toolbar-group">
                            <button class="toolbar-btn" onclick="formatTextInPanel('${panel}', 'insertHorizontalRule')" title="Ligne horizontale">─</button>
                            <button class="toolbar-btn" onclick="formatTextInPanel('${panel}', 'removeFormat')" title="Supprimer le formatage">✕ Format</button>
                        </div>
                    </div>
                    <div class="links-panel-sticky" id="linksPanel-${panel}">
                        <div style="display: flex; gap: 2rem; align-items: start;">
                            <div style="flex: 1;">
                                <div style="font-size: 0.85rem; font-weight: 600; margin-bottom: 0.5rem; color: var(--text-muted);"><i data-lucide="users" style="width:14px;height:14px;vertical-align:middle;margin-right:4px;"></i>Personnages</div>
                                <div class="quick-links">
                                    ${renderSceneCharacters(act.id, chapter.id, scene)}
                                    <button class="btn btn-small" onclick="openCharacterLinker(${act.id}, ${chapter.id}, ${scene.id})" style="font-size: 0.75rem; padding: 0.3rem 0.6rem;">+ Lier</button>
                                </div>
                            </div>
                            <div style="flex: 1;">
                                <div style="font-size: 0.85rem; font-weight: 600; margin-bottom: 0.5rem; color: var(--text-muted);"><i data-lucide="globe" style="width:14px;height:14px;vertical-align:middle;margin-right:4px;"></i>Lieux/Éléments</div>
                                <div class="quick-links">
                                    ${renderSceneElements(act.id, chapter.id, scene)}
                                    <button class="btn btn-small" onclick="openElementLinker(${act.id}, ${chapter.id}, ${scene.id})" style="font-size: 0.75rem; padding: 0.3rem 0.6rem;">+ Lier</button>
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
                            id="editor-${panel}"
                            data-panel="${panel}"
                            data-scene-id="${scene.id}"
                            data-chapter-id="${chapter.id}"
                            data-act-id="${act.id}"
                            data-placeholder="Commencez à écrire votre scène..."
                            oninput="updateSplitSceneContent(this)"
                            onkeydown="handleEditorKeydown(event)"
                        >${scene.content || ''}</div>
                    </div>
                </div>
            `;
            
            // Initialize lucide icons
            setTimeout(() => {
                if (typeof lucide !== 'undefined') lucide.createIcons();
            }, 50);
        }
        
        // Toggle toolbar visibility in split panel
        function toggleSplitEditorToolbar(panel) {
            const toolbar = document.getElementById('editorToolbar-' + panel);
            if (toolbar) {
                toolbar.classList.toggle('visible');
            }
        }
        
        // Format text in a specific panel's editor
        function formatTextInPanel(panel, command, value = null) {
            const editor = document.getElementById('editor-' + panel);
            if (!editor) return;
            
            // Focus the editor first
            editor.focus();
            
            // Execute the command
            if (value) {
                document.execCommand(command, false, value);
            } else {
                document.execCommand(command, false, null);
            }
        }
        
        // Render full world detail in container
        function renderWorldDetailInContainer(element, container) {
            container.innerHTML = `
                <div class="detail-view" style="height: 100%; overflow-y: auto;">
                    <div class="detail-header" style="position: sticky; top: 0; background: var(--bg-primary); z-index: 10; padding: 1rem; border-bottom: 1px solid var(--border-color);">
                        <div style="display: flex; align-items: center; gap: 1rem;">
                            <div class="detail-title" style="font-size: 1.5rem; font-weight: 600;">${element.name}</div>
                            <span style="font-size: 0.85rem; padding: 0.4rem 0.8rem; background: var(--primary-color); color: white; border-radius: 4px;">${element.type}</span>
                        </div>
                    </div>
                    
                    <div style="padding: 1.5rem;">
                        <div class="detail-section" style="margin-bottom: 1.5rem;">
                            <div class="detail-section-title" style="font-size: 0.9rem; font-weight: 600; color: var(--text-muted); margin-bottom: 0.5rem;">Nom</div>
                            <input type="text" class="form-input" value="${element.name}" 
                                   onchange="updateWorldField(${element.id}, 'name', this.value)" style="width: 100%;">
                        </div>

                        <div class="detail-section" style="margin-bottom: 1.5rem;">
                            <div class="detail-section-title" style="font-size: 0.9rem; font-weight: 600; color: var(--text-muted); margin-bottom: 0.5rem;">Type</div>
                            <select class="form-input" onchange="updateWorldField(${element.id}, 'type', this.value)" style="width: 100%;">
                                <option value="Lieu" ${element.type === 'Lieu' ? 'selected' : ''}>Lieu</option>
                                <option value="Objet" ${element.type === 'Objet' ? 'selected' : ''}>Objet</option>
                                <option value="Concept" ${element.type === 'Concept' ? 'selected' : ''}>Concept</option>
                                <option value="Organisation" ${element.type === 'Organisation' ? 'selected' : ''}>Organisation</option>
                                <option value="Événement" ${element.type === 'Événement' ? 'selected' : ''}>Événement</option>
                            </select>
                        </div>

                        <div class="detail-section" style="margin-bottom: 1.5rem;">
                            <div class="detail-section-title" style="font-size: 0.9rem; font-weight: 600; color: var(--text-muted); margin-bottom: 0.5rem;">Description</div>
                            <textarea class="form-input" rows="6" style="width: 100%; resize: vertical;"
                                      onchange="updateWorldField(${element.id}, 'description', this.value)">${element.description || ''}</textarea>
                        </div>

                        <div class="detail-section" style="margin-bottom: 1.5rem;">
                            <div class="detail-section-title" style="font-size: 0.9rem; font-weight: 600; color: var(--text-muted); margin-bottom: 0.5rem;">Détails</div>
                            <textarea class="form-input" rows="6" style="width: 100%; resize: vertical;"
                                      onchange="updateWorldField(${element.id}, 'details', this.value)">${element.details || ''}</textarea>
                        </div>

                        <div class="detail-section" style="margin-bottom: 1.5rem;">
                            <div class="detail-section-title" style="font-size: 0.9rem; font-weight: 600; color: var(--text-muted); margin-bottom: 0.5rem;">Histoire</div>
                            <textarea class="form-input" rows="6" style="width: 100%; resize: vertical;"
                                      onchange="updateWorldField(${element.id}, 'history', this.value)">${element.history || ''}</textarea>
                        </div>

                        <div class="detail-section" style="margin-bottom: 1.5rem;">
                            <div class="detail-section-title" style="font-size: 0.9rem; font-weight: 600; color: var(--text-muted); margin-bottom: 0.5rem;">Notes</div>
                            <textarea class="form-input" rows="4" style="width: 100%; resize: vertical;"
                                      onchange="updateWorldField(${element.id}, 'notes', this.value)">${element.notes || ''}</textarea>
                        </div>
                    </div>
                </div>
            `;
        }
        
        // Render full note detail in container
        function renderNoteDetailInContainer(note, container) {
            container.innerHTML = `
                <div class="detail-view" style="height: 100%; display: flex; flex-direction: column; overflow: hidden;">
                    <div class="detail-header" style="padding: 1rem; background: var(--bg-secondary); border-bottom: 1px solid var(--border-color);">
                        <div style="display: flex; align-items: center; gap: 1rem;">
                            <input type="text" class="form-input" value="${note.title || ''}" 
                                   style="font-size: 1.3rem; font-weight: 600; flex: 1; border: none; background: transparent;"
                                   onchange="updateNoteField(${note.id}, 'title', this.value)"
                                   placeholder="Titre de la note">
                            <select class="form-input" onchange="updateNoteField(${note.id}, 'category', this.value)" style="width: auto;">
                                <option value="Recherche" ${note.category === 'Recherche' ? 'selected' : ''}>Recherche</option>
                                <option value="Idée" ${note.category === 'Idée' ? 'selected' : ''}>Idée</option>
                                <option value="Référence" ${note.category === 'Référence' ? 'selected' : ''}>Référence</option>
                                <option value="A faire" ${note.category === 'A faire' ? 'selected' : ''}>À faire</option>
                                <option value="Question" ${note.category === 'Question' ? 'selected' : ''}>Question</option>
                                <option value="Autre" ${note.category === 'Autre' ? 'selected' : ''}>Autre</option>
                            </select>
                        </div>
                        <div style="margin-top: 0.5rem;">
                            <input type="text" class="form-input" value="${(note.tags || []).join(', ')}" 
                                   style="font-size: 0.85rem; width: 100%;"
                                   onchange="updateNoteTags(${note.id}, this.value)"
                                   placeholder="Tags (séparés par des virgules)">
                        </div>
                    </div>
                    <div style="flex: 1; padding: 1rem; overflow: hidden;">
                        <textarea class="form-input" 
                                  style="width: 100%; height: 100%; resize: none; font-size: 1rem; line-height: 1.7; border: none; background: var(--bg-primary);"
                                  oninput="updateNoteField(${note.id}, 'content', this.value)"
                                  placeholder="Contenu de la note...">${note.content || ''}</textarea>
                    </div>
                    <div style="padding: 0.5rem 1rem; font-size: 0.75rem; color: var(--text-muted); background: var(--bg-secondary); border-top: 1px solid var(--border-color);">
                        Créée le ${new Date(note.createdAt).toLocaleDateString('fr-FR')} • 
                        Modifiée le ${new Date(note.updatedAt).toLocaleDateString('fr-FR')}
                    </div>
                </div>
            `;
        }
        
        function renderCorkboardInSplitPanel(containerId) {
            const container = document.getElementById(containerId);
            if (!container) return;
            
            container.innerHTML = `
                <div style="padding: 1rem;">
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem;">
                        ${project.acts.map(act => 
                            act.chapters.map(chapter => 
                                chapter.scenes.map(scene => `
                                    <div class="cork-card" onclick="openSceneFromSplit(${act.id}, ${chapter.id}, ${scene.id})" style="background: var(--bg-secondary); padding: 1rem; border-radius: 8px; border: 1px solid var(--border-color); cursor: pointer; transition: transform 0.15s, box-shadow 0.15s;">
                                        <div style="font-weight: 600; margin-bottom: 0.5rem;">${scene.title || 'Sans titre'}</div>
                                        <div style="font-size: 0.8rem; color: var(--text-muted);">${chapter.title}</div>
                                        <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.5rem;">${getWordCount(scene.content || '')} mots</div>
                                    </div>
                                `).join('')
                            ).join('')
                        ).join('')}
                    </div>
                </div>
            `;
        }
        
        // Helper to open a scene from corkboard in split mode
        function openSceneFromSplit(actId, chapterId, sceneId) {
            if (splitViewActive) {
                const state = splitActivePanel === 'left' ? splitViewState.left : splitViewState.right;
                state.view = 'editor';
                state.actId = actId;
                state.chapterId = chapterId;
                state.sceneId = sceneId;
                renderSplitPanelViewContent(splitActivePanel);
                updateSplitPanelHeader(splitActivePanel);
                updateSidebarForSplitPanel(splitActivePanel);
            } else {
                openScene(actId, chapterId, sceneId);
            }
        }
        
        function renderStatsInSplitPanel(containerId) {
            const container = document.getElementById(containerId);
            if (!container) return;
            
            let totalWords = 0;
            let totalScenes = 0;
            let totalChapters = 0;
            
            project.acts.forEach(act => {
                act.chapters.forEach(chapter => {
                    totalChapters++;
                    chapter.scenes.forEach(scene => {
                        totalScenes++;
                        totalWords += getWordCount(scene.content || '');
                    });
                });
            });
            
            container.innerHTML = `
                <div style="padding: 1.5rem;">
                    <h3 style="margin-bottom: 1.5rem;">Statistiques du projet</h3>
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;">
                        <div style="background: var(--bg-secondary); padding: 1.5rem; border-radius: 8px; text-align: center;">
                            <div style="font-size: 2rem; font-weight: 700; color: var(--primary-color);">${totalWords.toLocaleString()}</div>
                            <div style="color: var(--text-muted);">Mots</div>
                        </div>
                        <div style="background: var(--bg-secondary); padding: 1.5rem; border-radius: 8px; text-align: center;">
                            <div style="font-size: 2rem; font-weight: 700; color: var(--primary-color);">${totalScenes}</div>
                            <div style="color: var(--text-muted);">Scènes</div>
                        </div>
                        <div style="background: var(--bg-secondary); padding: 1.5rem; border-radius: 8px; text-align: center;">
                            <div style="font-size: 2rem; font-weight: 700; color: var(--primary-color);">${totalChapters}</div>
                            <div style="color: var(--text-muted);">Chapitres</div>
                        </div>
                        <div style="background: var(--bg-secondary); padding: 1.5rem; border-radius: 8px; text-align: center;">
                            <div style="font-size: 2rem; font-weight: 700; color: var(--primary-color);">${project.characters?.length || 0}</div>
                            <div style="color: var(--text-muted);">Personnages</div>
                        </div>
                    </div>
                </div>
            `;
        }
        
        // Render Plot view in split panel
        function renderPlotInSplitPanel(container) {
            // Initialiser les points d'intrigue si nécessaire
            if (typeof plotPoints === 'undefined' || plotPoints.length === 0) {
                if (typeof initPlotPoints === 'function') {
                    initPlotPoints();
                }
            }
            
            const svgWidth = 600;
            const svgHeight = 350;
            const padding = 50;
            const plotWidth = svgWidth - padding * 2;
            const plotHeight = svgHeight - padding * 2;
            
            let pathData = '';
            let pointsHTML = '';
            let gridLines = '';
            
            // Lignes de grille
            for (let i = 0; i <= 4; i++) {
                const y = padding + (plotHeight / 4) * i;
                gridLines += `<line x1="${padding}" y1="${y}" x2="${svgWidth - padding}" y2="${y}" stroke="var(--border-color)" stroke-width="1" opacity="0.3" stroke-dasharray="5,5"/>`;
            }
            
            // Générer la courbe si plotPoints existe
            if (typeof plotPoints !== 'undefined' && plotPoints.length > 0) {
                plotPoints.forEach((point, index) => {
                    const x = padding + (plotWidth / Math.max(plotPoints.length - 1, 1)) * index;
                    const y = padding + plotHeight - (point.intensity / 100) * plotHeight;
                    
                    if (index === 0) {
                        pathData = `M ${x} ${y}`;
                    } else {
                        pathData += ` L ${x} ${y}`;
                    }
                    
                    pointsHTML += `
                        <circle cx="${x}" cy="${y}" r="5" fill="var(--accent-gold)" stroke="white" stroke-width="2" 
                                style="cursor: pointer;" 
                                onclick="openScene(${point.actId}, ${point.chapterId}, ${point.sceneId})">
                            <title>${point.title} - Tension: ${Math.round(point.intensity)}%</title>
                        </circle>
                    `;
                });
            }
            
            container.innerHTML = `
                <div style="padding: 1.5rem;">
                    <h3 style="margin-bottom: 1rem;"><i data-lucide="trending-up" style="width:18px;height:18px;vertical-align:middle;margin-right:6px;"></i>Graphique d'Intrigue</h3>
                    <div style="background: var(--bg-secondary); border-radius: 8px; padding: 1rem; overflow-x: auto;">
                        <svg viewBox="0 0 ${svgWidth} ${svgHeight}" style="width: 100%; max-width: ${svgWidth}px; height: auto;">
                            ${gridLines}
                            ${pathData ? `<path d="${pathData}" fill="none" stroke="var(--primary-color)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>` : ''}
                            ${pointsHTML}
                        </svg>
                    </div>
                    <div style="margin-top: 1rem; font-size: 0.85rem; color: var(--text-muted);">
                        ${typeof plotPoints !== 'undefined' ? plotPoints.length : 0} points d'intrigue • Cliquez sur un point pour ouvrir la scène
                    </div>
                </div>
            `;
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }
        
        // Render Relations view in split panel
        function renderRelationsInSplitPanel(container) {
            const relationships = project.relationships || [];
            const characters = project.characters || [];
            
            if (characters.length < 2) {
                container.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon"><i data-lucide="heart-handshake" style="width:48px;height:48px;stroke-width:1.5;"></i></div>
                        <div class="empty-state-title">Relations</div>
                        <div class="empty-state-text">Créez au moins 2 personnages pour définir leurs relations</div>
                    </div>
                `;
                if (typeof lucide !== 'undefined') lucide.createIcons();
                return;
            }
            
            let relationsHTML = '';
            if (relationships.length > 0) {
                relationsHTML = relationships.map(rel => {
                    const char1 = characters.find(c => c.id === rel.character1Id);
                    const char2 = characters.find(c => c.id === rel.character2Id);
                    if (!char1 || !char2) return '';
                    
                    return `
                        <div style="background: var(--bg-secondary); padding: 1rem; border-radius: 8px; margin-bottom: 0.75rem;">
                            <div style="display: flex; align-items: center; gap: 1rem;">
                                <span style="font-weight: 600;">${char1.name || char1.firstName || 'Personnage 1'}</span>
                                <span style="color: var(--primary-color);">↔</span>
                                <span style="font-weight: 600;">${char2.name || char2.firstName || 'Personnage 2'}</span>
                            </div>
                            <div style="font-size: 0.9rem; color: var(--text-muted); margin-top: 0.5rem;">${rel.type || 'Relation'}</div>
                            ${rel.description ? `<div style="font-size: 0.85rem; margin-top: 0.5rem;">${rel.description}</div>` : ''}
                        </div>
                    `;
                }).join('');
            } else {
                relationsHTML = '<div style="color: var(--text-muted); text-align: center; padding: 2rem;">Aucune relation définie</div>';
            }
            
            container.innerHTML = `
                <div style="padding: 1.5rem;">
                    <h3 style="margin-bottom: 1rem;"><i data-lucide="heart-handshake" style="width:18px;height:18px;vertical-align:middle;margin-right:6px;"></i>Relations entre personnages</h3>
                    <div>${relationsHTML}</div>
                    <button class="btn btn-primary" onclick="openAddRelationModal()" style="margin-top: 1rem;">+ Ajouter une relation</button>
                </div>
            `;
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }
        
        // Render Timeline view in split panel
        function renderTimelineInSplitPanel(container) {
            const events = project.timeline || [];
            
            if (events.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon"><i data-lucide="calendar-range" style="width:48px;height:48px;stroke-width:1.5;"></i></div>
                        <div class="empty-state-title">Timeline</div>
                        <div class="empty-state-text">Aucun événement dans la chronologie</div>
                        <button class="btn btn-primary" onclick="openAddTimelineModal()" style="margin-top: 1rem;">+ Ajouter un événement</button>
                    </div>
                `;
                if (typeof lucide !== 'undefined') lucide.createIcons();
                return;
            }
            
            // Trier par date si possible
            const sortedEvents = [...events].sort((a, b) => {
                if (a.date && b.date) return new Date(a.date) - new Date(b.date);
                return 0;
            });
            
            const eventsHTML = sortedEvents.map((event, index) => `
                <div style="display: flex; gap: 1rem; margin-bottom: 1.5rem;">
                    <div style="display: flex; flex-direction: column; align-items: center;">
                        <div style="width: 12px; height: 12px; background: var(--primary-color); border-radius: 50%;"></div>
                        ${index < sortedEvents.length - 1 ? '<div style="width: 2px; flex: 1; background: var(--border-color);"></div>' : ''}
                    </div>
                    <div style="flex: 1; background: var(--bg-secondary); padding: 1rem; border-radius: 8px;">
                        <div style="font-weight: 600;">${event.title}</div>
                        ${event.date ? `<div style="font-size: 0.85rem; color: var(--primary-color); margin-top: 0.25rem;">${event.date}</div>` : ''}
                        ${event.description ? `<div style="font-size: 0.9rem; color: var(--text-muted); margin-top: 0.5rem;">${event.description}</div>` : ''}
                    </div>
                </div>
            `).join('');
            
            container.innerHTML = `
                <div style="padding: 1.5rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                        <h3 style="margin: 0;"><i data-lucide="calendar-range" style="width:18px;height:18px;vertical-align:middle;margin-right:6px;"></i>Chronologie</h3>
                        <button class="btn btn-small" onclick="openAddTimelineModal()">+ Événement</button>
                    </div>
                    <div>${eventsHTML}</div>
                </div>
            `;
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }
        
        // View selector for split panels
        let currentSplitSelectorPanel = null;
        
        function openSplitViewSelector(panel) {
            currentSplitSelectorPanel = panel;
            
            const content = document.getElementById('splitSelectorContent');
            if (!content) return;
            
            const currentView = panel === 'left' ? splitViewState.left.view : splitViewState.right.view;
            
            const views = [
                { id: 'editor', label: 'Structure', icon: 'pen-line', desc: 'Écrire vos scènes' },
                { id: 'characters', label: 'Personnages', icon: 'users', desc: 'Fiches personnages' },
                { id: 'world', label: 'Univers', icon: 'globe', desc: 'Lieux et éléments' },
                { id: 'notes', label: 'Notes', icon: 'sticky-note', desc: 'Vos notes' },
                { id: 'codex', label: 'Codex', icon: 'book-open', desc: 'Encyclopédie' },
                { id: 'corkboard', label: 'Tableau', icon: 'layout-grid', desc: 'Vue tableau liège' },
                { id: 'mindmap', label: 'Mindmap', icon: 'git-branch', desc: 'Carte mentale' },
                { id: 'plot', label: 'Intrigue', icon: 'trending-up', desc: 'Arcs narratifs' },
                { id: 'relations', label: 'Relations', icon: 'heart-handshake', desc: 'Liens entre personnages' },
                { id: 'map', label: 'Carte', icon: 'map', desc: 'Carte du monde' },
                { id: 'timelineviz', label: 'Timeline Métro', icon: 'train-track', desc: 'Timeline visuelle' },
                { id: 'timeline', label: 'Timeline', icon: 'calendar-range', desc: 'Timeline classique' },
                { id: 'stats', label: 'Statistiques', icon: 'bar-chart-3', desc: 'Stats du projet' },
                { id: 'analysis', label: 'Analyse', icon: 'trending-up', desc: 'Analyse du texte' },
                { id: 'versions', label: 'Versions', icon: 'file-clock', desc: 'Versions des scènes' },
                { id: 'todos', label: 'TODOs', icon: 'list-todo', desc: 'Liste des tâches' }
            ];
            
            content.innerHTML = `
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; padding: 0.5rem;">
                    ${views.map(v => `
                        <div class="split-view-option ${currentView === v.id ? 'active' : ''}" 
                             onclick="selectSplitPanelView('${v.id}')"
                             style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem; padding: 1rem 0.5rem; border-radius: 8px; cursor: pointer; background: ${currentView === v.id ? 'var(--primary-color)' : 'var(--bg-secondary)'}; color: ${currentView === v.id ? 'white' : 'var(--text-primary)'}; transition: all 0.15s; text-align: center;">
                            <i data-lucide="${v.icon}" style="width:28px;height:28px;"></i>
                            <div>
                                <div style="font-weight: 600; font-size: 0.9rem;">${v.label}</div>
                                <div style="font-size: 0.7rem; opacity: 0.7; margin-top: 0.25rem;">${v.desc}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
            
            document.getElementById('splitSelectorModal').classList.add('active');
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }
        
        function selectSplitPanelView(view) {
            if (!currentSplitSelectorPanel) return;
            
            switchSplitPanelView(currentSplitSelectorPanel, view);
            closeModal('splitSelectorModal');
        }
        
        // Handle scene selection in split view
        function openSceneInSplitPanel(actId, chapterId, sceneId) {
            if (!splitViewActive) return;
            
            const state = splitActivePanel === 'left' ? splitViewState.left : splitViewState.right;
            
            // Only update if the active panel is showing editor view
            if (state.view === 'editor') {
                state.actId = actId;
                state.chapterId = chapterId;
                state.sceneId = sceneId;
                
                // Also update global current IDs
                currentActId = actId;
                currentChapterId = chapterId;
                currentSceneId = sceneId;
                
                renderSplitPanelViewContent(splitActivePanel);
                saveSplitViewState();
            }
        }
        
        // Handle character selection in split view
        function openCharacterInSplitPanel(charId) {
            if (!splitViewActive) return;
            
            const state = splitActivePanel === 'left' ? splitViewState.left : splitViewState.right;
            
            if (state.view === 'characters') {
                state.characterId = charId;
                renderSplitPanelViewContent(splitActivePanel);
                saveSplitViewState();
            }
        }
        
        // Handle world element selection in split view
        function openWorldElementInSplitPanel(elemId) {
            if (!splitViewActive) return;
            
            const state = splitActivePanel === 'left' ? splitViewState.left : splitViewState.right;
            
            if (state.view === 'world') {
                state.worldId = elemId;
                renderSplitPanelViewContent(splitActivePanel);
                saveSplitViewState();
            }
        }
        
        // Handle note selection in split view  
        function openNoteInSplitPanel(noteId) {
            if (!splitViewActive) return;
            
            const state = splitActivePanel === 'left' ? splitViewState.left : splitViewState.right;
            
            if (state.view === 'notes') {
                state.noteId = noteId;
                renderSplitPanelViewContent(splitActivePanel);
                saveSplitViewState();
            }
        }
        
        function updateSplitSceneContent(editor) {
            const sceneId = parseInt(editor.dataset.sceneId);
            const chapterId = parseInt(editor.dataset.chapterId);
            const actId = parseInt(editor.dataset.actId);
            const panel = editor.dataset.panel;
            
            const act = project.acts.find(a => a.id === actId);
            if (!act) return;
            const chapter = act.chapters.find(c => c.id === chapterId);
            if (!chapter) return;
            const scene = chapter.scenes.find(s => s.id === sceneId);
            if (!scene) return;
            
            scene.content = editor.innerHTML;
            const wordCount = getWordCount(editor.innerHTML);
            scene.wordCount = wordCount;
            
            // Update word count display
            const wcDisplay = document.querySelector(`.split-word-count-${panel}`);
            if (wcDisplay) wcDisplay.textContent = wordCount;
            
            saveProject();
        }
        
        function updateSplitNoteContent(textarea) {
            const noteId = parseInt(textarea.dataset.noteId);
            const note = project.notes?.find(n => n.id === noteId);
            if (note) {
                note.content = textarea.value;
                saveProject();
            }
        }
        
        // Resizer functionality
        let isResizing = false;
        
        function startSplitResize(e) {
            isResizing = true;
            
            const resizer = document.getElementById('splitResizer');
            if (resizer) resizer.classList.add('dragging');
            
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
            
            document.addEventListener('mousemove', doSplitResize);
            document.addEventListener('mouseup', stopSplitResize);
            document.addEventListener('touchmove', doSplitResize, { passive: false });
            document.addEventListener('touchend', stopSplitResize);
            
            e.preventDefault();
        }
        
        function doSplitResize(e) {
            if (!isResizing) return;
            
            const container = document.getElementById('splitViewContainer');
            if (!container) return;
            
            const currentX = e.clientX || (e.touches && e.touches[0].clientX);
            const containerRect = container.getBoundingClientRect();
            const containerWidth = containerRect.width;
            
            let newRatio = ((currentX - containerRect.left) / containerWidth) * 100;
            newRatio = Math.max(20, Math.min(80, newRatio));
            
            splitViewState.ratio = newRatio;
            
            const leftPanel = document.getElementById('splitPanelLeft');
            const rightPanel = document.getElementById('splitPanelRight');
            
            if (leftPanel) leftPanel.style.flex = newRatio;
            if (rightPanel) rightPanel.style.flex = 100 - newRatio;
            
            e.preventDefault();
        }
        
        function stopSplitResize() {
            isResizing = false;
            
            const resizer = document.getElementById('splitResizer');
            if (resizer) resizer.classList.remove('dragging');
            
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
            
            document.removeEventListener('mousemove', doSplitResize);
            document.removeEventListener('mouseup', stopSplitResize);
            document.removeEventListener('touchmove', doSplitResize);
            document.removeEventListener('touchend', stopSplitResize);
            
            saveSplitViewState();
        }
        
        function saveSplitViewState() {
            if (splitViewState.persistOnReload) {
                localStorage.setItem('plume_splitViewState', JSON.stringify({
                    active: splitViewActive,
                    activePanel: splitActivePanel,
                    state: splitViewState
                }));
            }
        }
        
        function loadSplitViewState() {
            const saved = localStorage.getItem('plume_splitViewState');
            if (saved) {
                try {
                    const data = JSON.parse(saved);
                    if (data.state && data.state.persistOnReload) {
                        splitViewState = { ...splitViewState, ...data.state };
                        splitActivePanel = data.activePanel || 'left';
                        if (data.active) {
                            splitViewActive = true;
                            setTimeout(() => {
                                renderSplitView();
                                updateSplitToggleButton();
                            }, 500);
                        }
                    }
                } catch (e) {
                    console.error('Error loading split view state:', e);
                }
            }
        }
        
        // Legacy function for compatibility
        function openCharacterBeside(charId) {
            if (!splitViewActive) {
                activateSplitView();
            }
            
            // Set right panel to characters view with this character
            splitViewState.right.view = 'characters';
            splitViewState.right.characterId = charId;
            splitActivePanel = 'right';
            
            renderSplitView();
            showNotification('Personnage ouvert dans le panneau droit');
        }

        function updateCharacterField(id, field, value) {
            const character = project.characters.find(c => c.id === id);
            if (character) {
                character[field] = value;
                saveProject();
                renderCharactersList();
            }
        }

        