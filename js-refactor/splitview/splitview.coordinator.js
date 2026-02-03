// ==========================================
// SPLIT VIEW SYSTEM - Coordinator
// ==========================================

/** [MVVM : Other] - Logique de routage de rendu vers les différentes vues spécifiques (Mixte) */
function renderViewInSplitPanel(view, container, state, panel) {
    // Technique: créer un faux editorView temporaire pour que les fonctions de rendu existantes fonctionnent
    const realEditorView = document.getElementById('editorView');

    // Créer un conteneur temporaire avec l'ID editorView
    const tempContainer = document.createElement('div');
    tempContainer.id = 'editorView';
    tempContainer.style.cssText = 'height: 100%; overflow: auto;';
    container.innerHTML = '';
    container.appendChild(tempContainer);

    // Temporairement masquer le vrai editorView et changer son ID
    if (realEditorView) {
        realEditorView.id = 'editorView-backup';
    }

    // Fonction pour restaurer après le rendu
    const restoreEditorView = () => {
        // Restaurer l'ID du vrai editorView
        if (realEditorView) {
            realEditorView.id = 'editorView';
        }
        // Le tempContainer garde le contenu rendu mais perd son ID
        tempContainer.id = 'splitPanelContent-' + panel;
    };

    switch (view) {
        case 'editor':
            if (state.sceneId) {
                const act = project.acts.find(a => a.id === state.actId);
                const chapter = act?.chapters.find(c => c.id === state.chapterId);
                const scene = chapter?.scenes.find(s => s.id === state.sceneId);
                if (act && chapter && scene) {
                    renderEditorInContainer(act, chapter, scene, container, panel);
                    restoreEditorView();
                    return; // On sort car renderEditorInContainer gère tout
                }
            } else {
                tempContainer.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon"><i data-lucide="pencil" style="width:48px;height:48px;stroke-width:1;"></i></div>
                        <div class="empty-state-title">Sélectionnez une scène</div>
                        <div class="empty-state-text">Choisissez une scène dans la barre latérale</div>
                    </div>
                `;
            }
            break;

        case 'characters':
            if (state.characterId) {
                if (typeof getCharacterDetailViewModel === 'function') {
                    const data = getCharacterDetailViewModel(state.characterId);
                    if (data) {
                        const { character, races, linkedScenes } = data;
                        if (typeof renderCharacterSheet === 'function') {
                            tempContainer.innerHTML = renderCharacterSheet(character, races, linkedScenes);
                            setTimeout(() => {
                                if (typeof initCharacterRadar === 'function') initCharacterRadar(character);
                                if (typeof lucide !== 'undefined') lucide.createIcons();
                            }, 100);
                        }
                    }
                }
            } else {
                tempContainer.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon"><i data-lucide="users" style="width:48px;height:48px;stroke-width:1.5;"></i></div>
                        <div class="empty-state-title">Personnages</div>
                        <div class="empty-state-text">Sélectionnez un personnage dans la barre latérale</div>
                    </div>
                `;
            }
            break;

        case 'world':
            if (state.worldId) {
                const elem = project.world?.find(e => e.id === state.worldId);
                if (elem) {
                    if (typeof renderWorldDetailFull === 'function') {
                        renderWorldDetailFull(elem, tempContainer);
                    } else if (typeof renderWorldDetailInContainer === 'function') {
                        renderWorldDetailInContainer(elem, tempContainer);
                    }
                }
            } else {
                tempContainer.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon"><i data-lucide="globe" style="width:48px;height:48px;stroke-width:1.5;"></i></div>
                        <div class="empty-state-title">Univers</div>
                        <div class="empty-state-text">Sélectionnez un élément dans la barre latérale</div>
                    </div>
                `;
            }
            break;

        case 'notes':
            if (state.noteId) {
                const note = project.notes?.find(n => n.id === state.noteId);
                if (note) {
                    if (typeof renderNoteDetailInContainer === 'function') {
                        renderNoteDetailInContainer(note, tempContainer);
                    }
                }
            } else {
                tempContainer.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon"><i data-lucide="sticky-note" style="width:48px;height:48px;stroke-width:1.5;"></i></div>
                        <div class="empty-state-title">Notes</div>
                        <div class="empty-state-text">Sélectionnez une note dans la barre latérale</div>
                    </div>
                `;
            }
            break;

        case 'mindmap':
            if (typeof renderMindmapView === 'function') {
                renderMindmapView();
            }
            break;

        case 'corkboard':
            if (typeof openCorkBoardView === 'function') {
                openCorkBoardView();
            } else if (typeof renderCorkboardInSplitPanel === 'function') {
                renderCorkboardInSplitPanel(tempContainer.id);
            }
            break;

        case 'stats':
            if (typeof renderStats === 'function') {
                renderStats();
            } else if (typeof renderStatsInSplitPanel === 'function') {
                renderStatsInSplitPanel(tempContainer.id);
            }
            break;

        case 'analysis':
            if (typeof renderAnalysis === 'function') {
                renderAnalysis();
            }
            break;

        case 'map':
            if (typeof renderMapView === 'function') {
                renderMapView();
            }
            break;

        case 'codex':
            if (state.codexId) {
                const entry = project.codex?.find(c => c.id === state.codexId);
                if (entry) {
                    tempContainer.innerHTML = `
                        <div class="detail-view">
                            <div class="detail-header">
                                <div style="display: flex; align-items: center; gap: 1rem; flex: 1;">
                                    <input type="text" class="form-input" value="${entry.title}" 
                                           style="font-size: 1.8rem; font-weight: 600; font-family: 'Noto Serif JP', serif; padding: 0.5rem;"
                                           onchange="typeof updateCodexField === 'function' ? updateCodexField(${entry.id}, 'title', this.value) : null"
                                           placeholder="Titre de l'entrée">
                                    <span style="font-size: 0.8rem; padding: 0.4rem 0.8rem; background: var(--accent-gold); color: var(--bg-primary); border-radius: 2px;">${entry.category}</span>
                                </div>
                            </div>
                            
                            <div class="detail-section">
                                <div class="detail-section-title">Catégorie</div>
                                <select class="form-input" onchange="typeof updateCodexField === 'function' ? updateCodexField(${entry.id}, 'category', this.value) : null">
                                    <option value="Culture" ${entry.category === 'Culture' ? 'selected' : ''}>Culture</option>
                                    <option value="Histoire" ${entry.category === 'Histoire' ? 'selected' : ''}>Histoire</option>
                                    <option value="Technologie" ${entry.category === 'Technologie' ? 'selected' : ''}>Technologie</option>
                                    <option value="Géographie" ${entry.category === 'Géographie' ? 'selected' : ''}>Géographie</option>
                                    <option value="Politique" ${entry.category === 'Politique' ? 'selected' : ''}>Politique</option>
                                    <option value="Magie/Pouvoir" ${entry.category === 'Magie/Pouvoir' ? 'selected' : ''}>Magie/Pouvoir</option>
                                    <option value="Religion" ${entry.category === 'Religion' ? 'selected' : ''}>Religion</option>
                                    <option value="Société" ${entry.category === 'Société' ? 'selected' : ''}>Société</option>
                                    <option value="Autre" ${entry.category === 'Autre' ? 'selected' : ''}>Autre</option>
                                </select>
                            </div>

                            <div class="detail-section">
                                <div class="detail-section-title">Résumé</div>
                                <textarea class="form-input" rows="3" 
                                          onchange="typeof updateCodexField === 'function' ? updateCodexField(${entry.id}, 'summary', this.value) : null">${entry.summary || ''}</textarea>
                            </div>

                            <div class="detail-section">
                                <div class="detail-section-title">Contenu détaillé</div>
                                <textarea class="form-input" rows="20" 
                                          oninput="typeof updateCodexField === 'function' ? updateCodexField(${entry.id}, 'content', this.value) : null">${entry.content || ''}</textarea>
                            </div>
                        </div>
                    `;
                }
            } else {
                tempContainer.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon"><i data-lucide="book-open" style="width:48px;height:48px;stroke-width:1.5;"></i></div>
                        <div class="empty-state-title">Codex</div>
                        <div class="empty-state-text">Sélectionnez une entrée dans la barre latérale</div>
                    </div>
                `;
            }
            break;

        case 'plot':
            if (typeof renderPlotView === 'function') {
                renderPlotView();
            } else if (typeof renderPlotInSplitPanel === 'function') {
                renderPlotInSplitPanel(tempContainer);
            }
            break;

        case 'relations':
            if (typeof renderRelationsView === 'function') {
                renderRelationsView();
            } else if (typeof renderRelationsInSplitPanel === 'function') {
                renderRelationsInSplitPanel(tempContainer);
            }
            break;

        case 'timelineviz':
            if (typeof renderTimelineVizList === 'function' && typeof renderMetroSVG === 'function') {
                const charCount = project.characters?.length || 0;
                if (charCount === 0) {
                    tempContainer.innerHTML = `
                        <div class="metro-empty-state">
                            <i data-lucide="users" style="width: 64px; height: 64px; opacity: 0.3;"></i>
                            <h3 style="margin: 1rem 0 0.5rem;">Aucun personnage</h3>
                            <p style="margin-bottom: 1.5rem;">Créez d'abord des personnages dans l'onglet "Personnages".</p>
                        </div>
                    `;
                } else {
                    tempContainer.innerHTML = `
                        <div style="padding: 1rem; height: 100%; overflow: auto;">
                            <div class="metro-toolbar" style="margin-bottom: 1rem;">
                                <button class="btn btn-primary" onclick="typeof openMetroEventModal === 'function' ? openMetroEventModal() : null">
                                    <i data-lucide="plus" style="width: 16px; height: 16px;"></i>
                                    Nouvel événement
                                </button>
                                <button class="btn" onclick="typeof sortMetroByDate === 'function' ? sortMetroByDate() : null">
                                    <i data-lucide="calendar" style="width: 16px; height: 16px;"></i>
                                    Trier par date
                                </button>
                            </div>
                            
                            <div class="metro-timeline-container" id="metroTimelineContainer-split-${panel}">
                                ${renderMetroSVG()}
                            </div>
                            
                            <div class="metro-legend" style="margin-top: 1rem;">
                                ${project.characters.map(char => `
                                    <div class="metro-legend-item" onclick="typeof openMetroColorPicker === 'function' ? openMetroColorPicker(${char.id}) : null" style="cursor: pointer;" title="Cliquer pour changer la couleur">
                                        <div class="metro-legend-line" style="background: ${project.characterColors[char.id] || '#999'};"></div>
                                        <span>${char.name}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `;
                }
            }
            break;

        case 'versions':
            if (typeof renderVersionsList === 'function') {
                renderVersionsList();
            }
            break;

        case 'todos':
            if (typeof renderTodosList === 'function') {
                renderTodosList();
            }
            break;

        case 'timeline':
            if (typeof renderTimelineList === 'function') {
                renderTimelineList();
            } else if (typeof renderTimelineInSplitPanel === 'function') {
                renderTimelineInSplitPanel(tempContainer);
            }
            break;

        default:
            tempContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon"><i data-lucide="${viewIcons[view] || 'file'}" style="width:48px;height:48px;stroke-width:1.5;"></i></div>
                    <div class="empty-state-title">${viewLabels[view] || view}</div>
                    <div class="empty-state-text">Cette vue est disponible</div>
                </div>
            `;
    }

    // Restaurer l'ID du vrai editorView
    restoreEditorView();

    if (typeof lucide !== 'undefined') lucide.createIcons();
}

/** [View] - Génère le HTML des détails d'un élément de l'univers pour un conteneur */
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
                           onchange="typeof updateWorldField === 'function' ? updateWorldField(${element.id}, 'name', this.value) : null" style="width: 100%;">
                </div>

                <div class="detail-section" style="margin-bottom: 1.5rem;">
                    <div class="detail-section-title" style="font-size: 0.9rem; font-weight: 600; color: var(--text-muted); margin-bottom: 0.5rem;">Type</div>
                    <select class="form-input" onchange="typeof updateWorldField === 'function' ? updateWorldField(${element.id}, 'type', this.value) : null" style="width: 100%;">
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
                              onchange="typeof updateWorldField === 'function' ? updateWorldField(${element.id}, 'description', this.value) : null">${element.description || ''}</textarea>
                </div>

                <div class="detail-section" style="margin-bottom: 1.5rem;">
                    <div class="detail-section-title" style="font-size: 0.9rem; font-weight: 600; color: var(--text-muted); margin-bottom: 0.5rem;">Détails</div>
                    <textarea class="form-input" rows="6" style="width: 100%; resize: vertical;"
                              onchange="typeof updateWorldField === 'function' ? updateWorldField(${element.id}, 'details', this.value) : null">${element.details || ''}</textarea>
                </div>

                <div class="detail-section" style="margin-bottom: 1.5rem;">
                    <div class="detail-section-title" style="font-size: 0.9rem; font-weight: 600; color: var(--text-muted); margin-bottom: 0.5rem;">Histoire</div>
                    <textarea class="form-input" rows="6" style="width: 100%; resize: vertical;"
                              onchange="typeof updateWorldField === 'function' ? updateWorldField(${element.id}, 'history', this.value) : null">${element.history || ''}</textarea>
                </div>

                <div class="detail-section" style="margin-bottom: 1.5rem;">
                    <div class="detail-section-title" style="font-size: 0.9rem; font-weight: 600; color: var(--text-muted); margin-bottom: 0.5rem;">Notes</div>
                    <textarea class="form-input" rows="4" style="width: 100%; resize: vertical;"
                              onchange="typeof updateWorldField === 'function' ? updateWorldField(${element.id}, 'notes', this.value) : null">${element.notes || ''}</textarea>
                </div>
            </div>
        </div>
    `;
}

/** [View] - Génère le HTML des détails d'une note pour un conteneur */
function renderNoteDetailInContainer(note, container) {
    container.innerHTML = `
        <div class="detail-view" style="height: 100%; display: flex; flex-direction: column; overflow: hidden;">
            <div class="detail-header" style="padding: 1rem; background: var(--bg-secondary); border-bottom: 1px solid var(--border-color);">
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <input type="text" class="form-input" value="${note.title || ''}" 
                           style="font-size: 1.3rem; font-weight: 600; flex: 1; border: none; background: transparent;"
                           onchange="typeof updateNoteField === 'function' ? updateNoteField(${note.id}, 'title', this.value) : null"
                           placeholder="Titre de la note">
                    <select class="form-input" onchange="typeof updateNoteField === 'function' ? updateNoteField(${note.id}, 'category', this.value) : null" style="width: auto;">
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
                           onchange="typeof updateNoteTags === 'function' ? updateNoteTags(${note.id}, this.value) : null"
                           placeholder="Tags (séparés par des virgules)">
                </div>
            </div>
            <div style="flex: 1; padding: 1rem; overflow: hidden;">
                <textarea class="form-input" 
                          style="width: 100%; height: 100%; resize: none; font-size: 1rem; line-height: 1.7; border: none; background: var(--bg-primary);"
                          oninput="typeof updateNoteField === 'function' ? updateNoteField(${note.id}, 'content', this.value) : null"
                          placeholder="Contenu de la note...">${note.content || ''}</textarea>
            </div>
            <div style="padding: 0.5rem 1rem; font-size: 0.75rem; color: var(--text-muted); background: var(--bg-secondary); border-top: 1px solid var(--border-color);">
                Créée le ${new Date(note.createdAt).toLocaleDateString('fr-FR')} • 
                Modifiée le ${new Date(note.updatedAt).toLocaleDateString('fr-FR')}
            </div>
        </div>
    `;
}

/** [View] - Génère le HTML de la vue "Tableau de liège" en mode split */
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
                                <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.5rem;">${typeof getWordCount === 'function' ? getWordCount(scene.content || '') : 0} mots</div>
                            </div>
                        `).join('')
        ).join('')
    ).join('')}
            </div>
        </div>
    `;
}

/** [Mixte] - Agrège les données (Model) et génère le HTML des statistiques (View) */
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
                totalWords += typeof getWordCount === 'function' ? getWordCount(scene.content || '') : 0;
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

/** [View] - Génère le graphique SVG de l'intrigue pour un conteneur */
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
                        onclick="typeof openScene === 'function' ? openScene(${point.actId}, ${point.chapterId}, ${point.sceneId}) : null">
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

/** [View] - Génère le HTML des relations entre personnages pour un conteneur */
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
            <button class="btn btn-primary" onclick="typeof openAddRelationModal === 'function' ? openAddRelationModal() : null" style="margin-top: 1rem;">+ Ajouter une relation</button>
        </div>
    `;
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

/** [View] - Génère le HTML de la chronologie pour un conteneur */
function renderTimelineInSplitPanel(container) {
    const events = project.timeline || [];

    if (events.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon"><i data-lucide="calendar-range" style="width:48px;height:48px;stroke-width:1.5;"></i></div>
                <div class="empty-state-title">Timeline</div>
                <div class="empty-state-text">Aucun événement dans la chronologie</div>
                <button class="btn btn-primary" onclick="typeof openAddTimelineModal === 'function' ? openAddTimelineModal() : null" style="margin-top: 1rem;">+ Ajouter un événement</button>
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
                <button class="btn btn-small" onclick="typeof openAddTimelineModal === 'function' ? openAddTimelineModal() : null">+ Événement</button>
            </div>
            <div>${eventsHTML}</div>
        </div>
    `;
    if (typeof lucide !== 'undefined') lucide.createIcons();
}
