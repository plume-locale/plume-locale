
        // View Management (définie tôt pour être accessible partout)
        function switchView(view) {
            // Si split view actif, changer la vue du panneau actif
            if (splitViewActive) {
                switchSplitPanelView(splitActivePanel, view);
                return;
            }
            
            currentView = view;
            
            // Update header nav buttons
            document.querySelectorAll('[id^="header-tab-"]').forEach(btn => {
                btn.classList.remove('active');
            });
            const headerBtn = document.getElementById(`header-tab-${view}`);
            if (headerBtn) {
                headerBtn.classList.add('active');
            }
            
            // Éléments spécifiques à la vue Structure
            const structureOnlyElements = [
                'projectProgressBar',  // Barre de progression
                'statusFilters',       // Filtres Brouillon/En cours/Terminé/À réviser
                'sceneTools'           // Boutons Versions/Annotations/TODOs
            ];
            
            // Masquer/Afficher les éléments Structure uniquement
            structureOnlyElements.forEach(id => {
                const el = document.getElementById(id);
                if (el) {
                    el.style.display = (view === 'editor') ? '' : 'none';
                }
            });
            
            // Update tree collapse toolbar visibility (for views with collapsible groups)
            const treeCollapseToolbar = document.getElementById('treeCollapseToolbar');
            const viewsWithGroups = ['editor', 'world', 'notes', 'codex'];
            if (treeCollapseToolbar) {
                treeCollapseToolbar.style.display = viewsWithGroups.includes(view) ? '' : 'none';
            }
            
            // Gérer la sidebar des versions (à droite)
            const sidebarVersions = document.getElementById('sidebarVersions');
            if (sidebarVersions) {
                // Toujours cacher par défaut lors du changement de vue
                // L'utilisateur peut l'ouvrir manuellement s'il le souhaite
                if (view !== 'editor') {
                    sidebarVersions.classList.add('hidden');
                }
                // Si on est en vue editor, ne rien changer (garde l'état actuel)
            }
            
            // Cacher toutes les listes de la sidebar
            const sidebarLists = [
                'chaptersList', 'charactersList', 'worldList', 'timelineList', 
                'notesList', 'codexList', 'arcsList', 'statsList', 'versionsList', 'analysisList',
                'todosList', 'corkboardList', 'mindmapList', 'plotList', 
                'relationsList', 'mapList', 'timelineVizList', 'storyGridList', 'noSidebarMessage'
            ];
            
            sidebarLists.forEach(listId => {
                const el = document.getElementById(listId);
                if (el) el.style.display = 'none';
            });
            
            // Vues qui utilisent la sidebar (listes à gauche)
            const sidebarViews = {
                'editor': 'chaptersList',
                'characters': 'charactersList',
                'world': 'worldList',
                'notes': 'notesList',
                'codex': 'codexList',
                'arcs': 'arcsList',
                'mindmap': 'mindmapList',
                'timelineviz': 'timelineVizList'
            };
            
            // Vues qui utilisent editorView entièrement (visualisations plein écran sans sidebar)
            const editorViewVues = ['stats', 'analysis', 'versions', 'todos', 'timeline', 'corkboard', 'plot', 'relations', 'map', 'thriller'];
            
            // Labels pour les vues sans sidebar
            const viewLabelsNoSidebar = {
                'stats': 'Statistiques',
                'analysis': 'Analyse',
                'versions': 'Versions',
                'todos': 'TODOs',
                'timeline': 'Timeline',
                'corkboard': 'Tableau',
                'plot': 'Intrigue',
                'relations': 'Relations',
                'map': 'Carte',
                'thriller': 'Thriller',
                'storygrid': 'Story Grid'
            };
            
            // Afficher la bonne liste sidebar si applicable
            if (sidebarViews[view]) {
                const listEl = document.getElementById(sidebarViews[view]);
                if (listEl) listEl.style.display = 'block';
            } else if (editorViewVues.includes(view)) {
                // Afficher le message pour les vues sans sidebar
                const noSidebarEl = document.getElementById('noSidebarMessage');
                if (noSidebarEl) {
                    const viewLabel = viewLabelsNoSidebar[view] || 'Cette vue';
                    noSidebarEl.innerHTML = `
                        <div style="padding: 2rem 1rem; text-align: center; color: var(--text-muted);">
                            <i data-lucide="layout-dashboard" style="width: 48px; height: 48px; opacity: 0.3; margin-bottom: 1rem;"></i>
                            <div style="font-size: 0.9rem; line-height: 1.6;">
                                <strong>${viewLabel}</strong> utilise tout l'espace disponible.
                            </div>
                            <div style="font-size: 0.85rem; margin-top: 0.5rem; opacity: 0.8;">
                                La barre latérale n'est pas utilisée dans cette vue.
                            </div>
                        </div>
                    `;
                    noSidebarEl.style.display = 'block';
                    
                    // Refresh icons
                    setTimeout(() => {
                        if (typeof lucide !== 'undefined') lucide.createIcons();
                    }, 50);
                }
            }
            
            // Sur mobile, créer une vue centrale pour les vues sidebar
            const isMobile = window.innerWidth <= 900;
            const editorView = document.getElementById('editorView');
            
            if (isMobile && sidebarViews[view]) {
                // Créer une vue mobile pour les vues avec sidebar
                renderMobileSidebarView(view);
            } else if (editorViewVues.includes(view)) {
                // Ces vues remplissent l'editorView
                if (editorView) {
                    // Le contenu sera rempli par les fonctions de rendu
                }
            }
            
            // Update sidebar actions
            const actionsHTML = {
                editor: '<button class="btn btn-primary" onclick="openAddActModal()">+ Acte</button><button class="btn btn-primary" onclick="openAddChapterModal()">+ Chapitre</button><button class="btn btn-primary" onclick="openAddSceneModalQuick()">+ Scène</button>',
                characters: '<button class="btn btn-primary" onclick="openAddCharacterModal()">+ Personnage</button>',
                world: '<button class="btn btn-primary" onclick="openAddWorldModal()">+ Élément</button>',
                notes: '<button class="btn btn-primary" onclick="openAddNoteModal()">+ Note</button>',
                codex: '<button class="btn btn-primary" onclick="openAddCodexModal()">+ Entrée</button>',
                arcs: '<button class="btn btn-primary" onclick="createNewArc()">+ Arc narratif</button>'
            };
            const sidebarActions = document.getElementById('sidebarActions');
            if (sidebarActions) {
                sidebarActions.innerHTML = actionsHTML[view] || '';
            }
            
            // Render appropriate content based on view
            renderViewContent(view, 'editorView');
            
            // Refresh Lucide icons after view change
            setTimeout(() => {
                if (typeof lucide !== 'undefined') lucide.createIcons();
            }, 50);
        }
        
        // Fonction pour rendre le contenu d'une vue dans un conteneur donné
        function renderViewContent(view, containerId) {
            const container = document.getElementById(containerId);
            if (!container) return;
            
            switch(view) {
                case 'editor':
                    if (currentActId && currentChapterId && currentSceneId) {
                        // Use renderEditor for the main editor view (not split mode)
                        if (containerId === 'editorView' && !splitViewActive) {
                            const act = project.acts.find(a => a.id === currentActId);
                            if (act) {
                                const chapter = act.chapters.find(c => c.id === currentChapterId);
                                if (chapter) {
                                    const scene = chapter.scenes.find(s => s.id === currentSceneId);
                                    if (scene) {
                                        renderEditor(act, chapter, scene);
                                    }
                                }
                            }
                        } else {
                            // Use simplified version for split-view panels
                            renderSceneInContainer(currentActId, currentChapterId, currentSceneId, containerId);
                        }
                    } else if (project.acts.length === 0 || (project.acts.length === 1 && project.acts[0].chapters.length === 0)) {
                        container.innerHTML = `
                            <div class="empty-state">
                                <div class="empty-state-icon">✏️</div>
                                <div class="empty-state-title">Commencez votre histoire</div>
                                <div class="empty-state-text">Créez votre premier chapitre pour commencer à écrire.</div>
                                <button class="btn btn-primary" onclick="openAddChapterModal()">+ Créer un chapitre</button>
                            </div>
                        `;
                    } else {
                        container.innerHTML = `
                            <div class="empty-state">
                                <div class="empty-state-icon">✏️</div>
                                <div class="empty-state-title">Sélectionnez une scène</div>
                                <div class="empty-state-text">Choisissez une scène dans la barre latérale pour commencer à écrire.</div>
                            </div>
                        `;
                    }
                    break;
                case 'characters':
                    if (typeof renderCharactersList === 'function') renderCharactersList();
                    renderCharacterWelcome();
                    break;
                case 'world':
                    if (typeof renderWorldList === 'function') renderWorldList();
                    renderWorldWelcome();
                    break;
                case 'notes':
                    if (typeof renderNotesList === 'function') renderNotesList();
                    renderNotesWelcome();
                    break;
                case 'codex':
                    if (typeof renderCodexList === 'function') renderCodexList();
                    renderCodexWelcome();
                    break;
                case 'stats':
                    if (typeof renderStats === 'function') renderStats();
                    break;
                case 'analysis':
                    if (typeof renderAnalysis === 'function') renderAnalysis();
                    break;
                case 'versions':
                    if (typeof renderVersionsList === 'function') renderVersionsList();
                    break;
                case 'todos':
                    if (typeof renderTodosList === 'function') renderTodosList();
                    break;
                case 'corkboard':
                    if (typeof openCorkBoardView === 'function') openCorkBoardView();
                    break;
                case 'mindmap':
                    if (typeof renderMindmapView === 'function') renderMindmapView();
                    break;
                case 'plot':
                    if (typeof renderPlotView === 'function') renderPlotView();
                    break;
                case 'relations':
                    if (typeof renderRelationsView === 'function') renderRelationsView();
                    break;
                case 'map':
                    if (typeof renderMapView === 'function') renderMapView();
                    break;
                case 'timelineviz':
                    if (typeof renderTimelineVizView === 'function') renderTimelineVizView();
                    break;
                case 'arcs':
                    if (typeof renderArcsList === 'function') renderArcsList();
                    renderArcsWelcome();
                    break;
                case 'storygrid':
                    if (typeof renderStoryGrid === 'function') renderStoryGrid();
                    break;
                case 'thriller':
                    if (typeof renderThrillerBoard === 'function') renderThrillerBoard();
                    break;
                default:
                    container.innerHTML = `
                        <div class="empty-state">
                            <div class="empty-state-icon"><i data-lucide="layout" style="width:48px;height:48px;stroke-width:1;"></i></div>
                            <div class="empty-state-title">Panneau vide</div>
                            <div class="empty-state-text">Cliquez sur l'en-tête pour choisir une vue</div>
                        </div>
                    `;
            }
        }
        
        // Render scene in a specific container (for split view)
        function renderSceneInContainer(actId, chapterId, sceneId, containerId) {
            const container = document.getElementById(containerId);
            if (!container) return;
            
            const act = project.acts.find(a => a.id === actId);
            if (!act) return;
            const chapter = act.chapters.find(c => c.id === chapterId);
            if (!chapter) return;
            const scene = chapter.scenes.find(s => s.id === sceneId);
            if (!scene) return;
            
            const wordCount = getWordCount(scene.content || '');
            
            container.innerHTML = `
                <div class="split-scene-view" style="height: 100%; display: flex; flex-direction: column;">
                    <div style="padding: 0.75rem 1rem; background: var(--bg-secondary); border-bottom: 1px solid var(--border-color);">
                        <div style="font-size: 0.8rem; color: var(--text-muted);">${act.title} > ${chapter.title}</div>
                        <div style="font-size: 1.1rem; font-weight: 600;">${scene.title || 'Sans titre'}</div>
                        <div style="font-size: 0.75rem; color: var(--text-muted);">${wordCount} mots</div>
                    </div>
                    <div class="editor-textarea" 
                         contenteditable="true" 
                         data-container="${containerId}"
                         data-scene-id="${scene.id}"
                         data-chapter-id="${chapter.id}"
                         data-act-id="${act.id}"
                         oninput="updateSplitSceneContent(this)"
                         style="flex: 1; padding: 1.5rem; overflow-y: auto; outline: none; line-height: 1.8; font-size: 1.1rem;"
                    >${scene.content || ''}</div>
                </div>
            `;
        }

        let lastSavedState = null; // Dernier état sauvegardé pour détecter les changements

        // Projects Management
        function openProjectsModal() {
            renderProjectsList();
            document.getElementById('projectsModal').classList.add('active');
        }

        function openNewProjectModal() {
            document.getElementById('newProjectModal').classList.add('active');
            setTimeout(() => document.getElementById('newProjectTitle').focus(), 100);
        }

        function createNewProject() {
            const title = document.getElementById('newProjectTitle').value.trim();
            const description = document.getElementById('newProjectDesc').value.trim();
            const genre = document.getElementById('newProjectGenre').value;
            const template = document.getElementById('newProjectTemplate').value;

            if (!title) {
                alert('Veuillez entrer un titre pour le projet');
                return;
            }

            const newProject = {
                id: Date.now(),
                title: title,
                description: description,
                genre: genre,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                acts: [],
                characters: [],
                world: [],
                timeline: [],
                notes: [],
                codex: [],
                stats: { dailyGoal: 500, totalGoal: 80000, writingSessions: [] },
                versions: [],
                relationships: []
            };

            // Apply template if selected
            if (template === 'fantasy') {
                newProject.acts = [
                    { id: Date.now(), title: "Acte I - Le Monde Ordinaire", chapters: [] },
                    { id: Date.now() + 1, title: "Acte II - L'Aventure", chapters: [] },
                    { id: Date.now() + 2, title: "Acte III - Le Retour", chapters: [] }
                ];
                newProject.stats.dailyGoal = 1000;
                newProject.stats.totalGoal = 120000;
            } else if (template === 'thriller') {
                newProject.acts = [
                    { id: Date.now(), title: "Acte I - L'Incident", chapters: [] },
                    { id: Date.now() + 1, title: "Acte II - La Tension", chapters: [] },
                    { id: Date.now() + 2, title: "Acte III - Le Dénouement", chapters: [] }
                ];
                newProject.stats.dailyGoal = 800;
                newProject.stats.totalGoal = 90000;
            } else if (template === 'scifi') {
                newProject.acts = [
                    { id: Date.now(), title: "Acte I - Découverte", chapters: [] },
                    { id: Date.now() + 1, title: "Acte II - Exploration", chapters: [] },
                    { id: Date.now() + 2, title: "Acte III - Révélation", chapters: [] }
                ];
                newProject.stats.dailyGoal = 1000;
                newProject.stats.totalGoal = 150000;
            }

            projects.push(newProject);
            saveAllProjects();
            
            document.getElementById('newProjectTitle').value = '';
            document.getElementById('newProjectDesc').value = '';
            document.getElementById('newProjectGenre').value = '';
            document.getElementById('newProjectTemplate').value = '';
            
            closeModal('newProjectModal');
            switchToProject(newProject.id);
            closeModal('projectsModal');
        }

        function switchToProject(projectId) {
            currentProjectId = projectId;
            project = projects.find(p => p.id === projectId);
            
            if (!project) return;

            const headerTitle = document.getElementById('headerProjectTitle');
            if (headerTitle) headerTitle.textContent = project.title;
            
            currentActId = null;
            currentChapterId = null;
            currentSceneId = null;
            
            switchView('editor');
            renderActsList();
            showEmptyState();
            
            localStorage.setItem('plume_locale_current_project', projectId);
        }

        function deleteProject(projectId) {
            const proj = projects.find(p => p.id === projectId);
            if (!proj) return;

            if (!confirm(`Supprimer "${proj.title}" ?\n\nIrréversible !`)) return;

            projects = projects.filter(p => p.id !== projectId);
            saveAllProjects();

            if (currentProjectId === projectId) {
                if (projects.length > 0) {
                    switchToProject(projects[0].id);
                } else {
                    createDefaultProject();
                }
            }

            renderProjectsList();
        }

        function exportProjectIndividual(projectId) {
            const proj = projects.find(p => p.id === projectId);
            if (!proj) return;

            const dataStr = JSON.stringify(proj, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${proj.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
        }

        function importProject() {
            document.getElementById('importProjectInput').click();
        }

        function handleProjectImport(event) {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const imported = JSON.parse(e.target.result);
                    if (!imported.title) throw new Error('Format invalide');

                    imported.id = Date.now();
                    imported.title += " (Importé)";
                    imported.createdAt = new Date().toISOString();
                    imported.updatedAt = new Date().toISOString();

                    projects.push(imported);
                    saveAllProjects();
                    renderProjectsList();
                    alert(`✅ "${imported.title}" importé !`);
                } catch (error) {
                    alert('❌ Erreur: ' + error.message);
                }
                event.target.value = '';
            };
            reader.readAsText(file);
        }

        function renderProjectsList() {
            const container = document.getElementById('projectsList');
            
            if (projects.length === 0) {
                container.innerHTML = '<div style="padding: 2rem; text-align: center; color: var(--text-muted);">Aucun projet</div>';
                return;
            }

            container.innerHTML = projects.map(proj => {
                const wordCount = proj.acts.reduce((sum, act) => sum + act.chapters.reduce((ch, chapter) => ch + chapter.scenes.reduce((sc, scene) => sc + getWordCount(scene.content), 0), 0), 0);
                const isActive = proj.id === currentProjectId;

                return `
                    <div class="project-card ${isActive ? 'active' : ''}" onclick="switchToProject(${proj.id}); closeModal('projectsModal');">
                        <div class="project-card-header">
                            <div>
                                <div class="project-card-title">${proj.title}</div>
                                ${proj.genre ? `<span class="project-card-genre">${proj.genre}</span>` : ''}
                            </div>
                            ${isActive ? '<span style="color: var(--accent-red); font-weight: 600;">● Actif</span>' : ''}
                        </div>
                        ${proj.description ? `<div class="project-card-desc">${proj.description}</div>` : ''}
                        <div class="project-card-stats">
                            <span>${wordCount.toLocaleString('fr-FR')} mots</span>
                            <span>${proj.acts.length} actes</span>
                            <span>${proj.characters.length} personnages</span>
                        </div>
                        <div class="project-card-actions">
                            <button class="btn btn-small" onclick="event.stopPropagation(); exportProjectIndividual(${proj.id})">📤 Exporter</button>
                            <button class="btn btn-small" onclick="event.stopPropagation(); deleteProject(${proj.id})">🗑️ Supprimer</button>
                        </div>
                    </div>
                `;
            }).join('');
        }

        async function saveAllProjects() {
            try {
                if (currentProjectId) {
                    const index = projects.findIndex(p => p.id === currentProjectId);
                    if (index >= 0) {
                        projects[index] = { ...project, updatedAt: new Date().toISOString() };
                    }
                }
                
                // Sauvegarder tous les projets dans IndexedDB
                for (const proj of projects) {
                    await saveProjectToDB(proj);
                }
                
                // Sauvegarder le projet actuel
                await saveSetting('currentProjectId', currentProjectId);
                
                console.log('💾 Tous les projets sauvegardés');
            } catch (error) {
                console.error('❌ Erreur sauvegarde projets:', error);
            }
        }

        async function loadAllProjects() {
            try {
                // Charger tous les projets depuis IndexedDB
                const loadedProjects = await loadAllProjectsFromDB();
                
                if (loadedProjects && loadedProjects.length > 0) {
                    projects = loadedProjects;
                    
                    // Charger le dernier projet utilisé
                    const savedId = await loadSetting('currentProjectId');
                    
                    if (savedId) {
                        currentProjectId = savedId;
                        project = projects.find(p => p.id === currentProjectId);
                    }
                    
                    // Si projet non trouvé, prendre le premier
                    if (!project && projects.length > 0) {
                        project = projects[0];
                        currentProjectId = project.id;
                    }
                } else {
                    // Aucun projet trouvé, créer un projet par défaut
                    createDefaultProject();
                    await saveProjectToDB(project);
                }
                
                ensureProjectStructure();
                
                if (project?.title) {
                    const headerTitle = document.getElementById('headerProjectTitle');
                    if (headerTitle) headerTitle.textContent = project.title;
                }
                
                console.log('✅ Projets chargés:', projects.length);
            } catch (error) {
                console.error('❌ Erreur chargement projets:', error);
                createDefaultProject();
            }
        }

        function createDefaultProject() {
            project = {
                id: Date.now(),
                title: "Mon Roman",
                description: "",
                genre: "",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                acts: [],
                characters: [],
                world: [],
                timeline: [],
                notes: [],
                codex: [],
                stats: { dailyGoal: 500, totalGoal: 80000, writingSessions: [] },
                versions: [],
                relationships: []
            };
            projects = [project];
            currentProjectId = project.id;
        }

        function ensureProjectStructure() {
            if (!project) return;
            project.characters = project.characters || [];
            project.world = project.world || [];
            project.timeline = project.timeline || [];
            project.notes = project.notes || [];
            project.codex = project.codex || [];
            project.stats = project.stats || { dailyGoal: 500, totalGoal: 80000, writingSessions: [] };
            project.versions = project.versions || [];
            project.relationships = project.relationships || [];
        }

        const originalSaveProject = saveProject;
        saveProject = function() {
            saveAllProjects();
        };

        // Text Analysis Tools
        function renderAnalysis() {
            const editorView = document.getElementById('editorView');
            if (!editorView) {
                console.error('editorView not found');
                return;
            }
            
            editorView.innerHTML = `
                <div style="height: 100%; overflow-y: auto; padding: 2rem 3rem;">
                    <h2 style="margin-bottom: 2rem; color: var(--accent-gold);"><i data-lucide="scan-search" style="width:24px;height:24px;vertical-align:middle;margin-right:8px;"></i>Analyse du texte</h2>
                    
                    <div style="background: var(--bg-secondary); padding: 2rem; border-radius: 8px; margin-bottom: 2rem;">
                        <label style="display: block; font-weight: 600; margin-bottom: 1rem; font-size: 1rem;">Portée de l'analyse :</label>
                        <select id="analysisScope" class="form-input" style="width: 100%; max-width: 400px; font-size: 1rem;">
                            <option value="current">Scène actuelle</option>
                            <option value="chapter">Chapitre actuel</option>
                            <option value="act">Acte actuel</option>
                            <option value="all">Tout le projet</option>
                        </select>
                    </div>
                    
                    <div id="analysisResults"></div>
                </div>
            `;
            
            // Attach event listener after DOM is updated
            setTimeout(() => {
                const scopeSelect = document.getElementById('analysisScope');
                if (scopeSelect) {
                    scopeSelect.addEventListener('change', runTextAnalysis);
                }
                runTextAnalysis();
            }, 0);
        }

        function runTextAnalysis() {
            const scope = document.getElementById('analysisScope')?.value || 'current';
            const text = getTextForAnalysis(scope);
            
            if (!text || text.trim().length === 0) {
                document.getElementById('analysisResults').innerHTML = '<div style="padding: 2rem; text-align: center; color: var(--text-muted);">Aucun texte à analyser</div>';
                return;
            }

            const analysis = {
                wordCount: getWordCount(text),
                repetitions: detectRepetitions(text),
                readability: calculateReadability(text),
                wordFrequency: calculateWordFrequency(text),
                sentenceLength: calculateSentenceLength(text),
                narrativeDistribution: analyzeNarrativeDistribution(text)
            };

            displayAnalysisResults(analysis);
        }

        function getTextForAnalysis(scope) {
            console.log('getTextForAnalysis called with scope:', scope);
            console.log('currentActId:', currentActId, 'currentChapterId:', currentChapterId, 'currentSceneId:', currentSceneId);
            
            if (scope === 'current' && currentSceneId) {
                const act = project.acts.find(a => a.id === currentActId);
                if (!act) return '';
                const chapter = act.chapters.find(c => c.id === currentChapterId);
                if (!chapter) return '';
                const scene = chapter.scenes.find(s => s.id === currentSceneId);
                if (!scene) return '';
                console.log('Current scene text length:', stripHTML(scene.content).length);
                return stripHTML(scene.content);
            } else if (scope === 'chapter') {
                if (!currentChapterId) {
                    // Try to use first chapter of first act
                    if (project.acts.length > 0 && project.acts[0].chapters.length > 0) {
                        const chapter = project.acts[0].chapters[0];
                        const text = chapter.scenes.map(s => stripHTML(s.content)).join('\n\n');
                        console.log('Using first chapter, text length:', text.length);
                        return text;
                    }
                    return '';
                }
                const act = project.acts.find(a => a.id === currentActId);
                if (!act) return '';
                const chapter = act.chapters.find(c => c.id === currentChapterId);
                if (!chapter) return '';
                const text = chapter.scenes.map(s => stripHTML(s.content)).join('\n\n');
                console.log('Chapter text length:', text.length);
                return text;
            } else if (scope === 'act') {
                if (!currentActId) {
                    // Try to use first act
                    if (project.acts.length > 0) {
                        const act = project.acts[0];
                        const text = act.chapters.flatMap(ch => ch.scenes.map(s => stripHTML(s.content))).join('\n\n');
                        console.log('Using first act, text length:', text.length);
                        return text;
                    }
                    return '';
                }
                const act = project.acts.find(a => a.id === currentActId);
                if (!act) return '';
                const text = act.chapters.flatMap(ch => ch.scenes.map(s => stripHTML(s.content))).join('\n\n');
                console.log('Act text length:', text.length);
                return text;
            } else if (scope === 'all') {
                const text = project.acts.flatMap(a => a.chapters.flatMap(ch => ch.scenes.map(s => stripHTML(s.content)))).join('\n\n');
                console.log('All project text length:', text.length);
                return text;
            }
            return '';
        }

        function stripHTML(html) {
            const div = document.createElement('div');
            div.innerHTML = html;
            return div.textContent || div.innerText || '';
        }

        function detectRepetitions(text) {
            // Correction pour inclure les caractères accentués français et autres Unicode
            const words = text.toLowerCase().match(/[\p{L}]{4,}/gu) || []; 
            const frequency = {};
            words.forEach(word => frequency[word] = (frequency[word] || 0) + 1);
            
            const repeated = Object.entries(frequency)
                .filter(([word, count]) => count >= 5)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10);
            
            return repeated;
        }

        function calculateReadability(text) {
            const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
            // Correction pour inclure les caractères accentués français et autres Unicode
            const words = text.match(/[\p{L}]+/gu) || []; 
            const syllables = words.reduce((sum, word) => sum + countSyllables(word), 0);
            
            if (sentences.length === 0 || words.length === 0) return { score: 0, level: 'N/A' };
            
            // Flesch Reading Ease (adapted for French)
            const avgWordsPerSentence = words.length / sentences.length;
            const avgSyllablesPerWord = syllables / words.length;
            const score = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord);
            
            let level = '';
            if (score >= 90) level = 'Très facile';
            else if (score >= 80) level = 'Facile';
            else if (score >= 70) level = 'Assez facile';
            else if (score >= 60) level = 'Standard';
            else if (score >= 50) level = 'Assez difficile';
            else if (score >= 30) level = 'Difficile';
            else level = 'Très difficile';
            
            return { score: Math.max(0, Math.min(100, score)).toFixed(1), level };
        }

        function countSyllables(word) {
            word = word.toLowerCase();
            const vowels = /[aeiouyàâäéèêëïîôùûü]/g;
            const matches = word.match(vowels);
            if (!matches) return 1;
            
            let count = matches.length;
            // Adjustments for French
            if (word.endsWith('e')) count--;
            if (word.match(/[aeiouy]{2,}/)) count--;
            return Math.max(1, count);
        }

        function calculateWordFrequency(text) {
            // Correction pour inclure les caractères accentués français et autres Unicode
            const words = text.toLowerCase().match(/[\p{L}]{3,}/gu) || []; 
            const stopWords = new Set(['le', 'la', 'les', 'un', 'une', 'des', 'de', 'du', 'et', 'ou', 'où', 'qui', 'que', 'quoi', 'dont', 'ce', 'cette', 'ces', 'son', 'sa', 'ses', 'mon', 'ma', 'mes', 'ton', 'ta', 'tes', 'notre', 'nos', 'votre', 'vos', 'leur', 'leurs', 'je', 'tu', 'il', 'elle', 'nous', 'vous', 'ils', 'elles', 'on', 'ne', 'pas', 'plus', 'dans', 'sur', 'pour', 'par', 'avec', 'sans', 'est', 'était', 'être', 'avoir', 'fait', 'faire', 'dit', 'dire', 'peut', 'bien', 'tout', 'tous', 'comme', 'très', 'aussi', 'encore', 'mais', 'donc', 'ainsi']);
            
            const frequency = {};
            words.forEach(word => {
                if (!stopWords.has(word)) {
                    frequency[word] = (frequency[word] || 0) + 1;
                }
            });
            
            return Object.entries(frequency)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 15);
        }

        function calculateSentenceLength(text) {
            const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
            const lengths = sentences.map(s => s.trim().split(/\s+/).length);
            
            if (lengths.length === 0) return { avg: 0, min: 0, max: 0, distribution: [] };
            
            const avg = lengths.reduce((a, b) => a + b, 0) / lengths.length;
            const min = Math.min(...lengths);
            const max = Math.max(...lengths);
            
            // Distribution
            const ranges = [
                { label: '1-5 mots', count: lengths.filter(l => l >= 1 && l <= 5).length },
                { label: '6-10 mots', count: lengths.filter(l => l >= 6 && l <= 10).length },
                { label: '11-15 mots', count: lengths.filter(l => l >= 11 && l <= 15).length },
                { label: '16-20 mots', count: lengths.filter(l => l >= 16 && l <= 20).length },
                { label: '20+ mots', count: lengths.filter(l => l > 20).length }
            ];
            
            return { avg: avg.toFixed(1), min, max, distribution: ranges };
        }

        function analyzeNarrativeDistribution(text) {
            const dialogRegex = /[«"—–]\s*[^»"—–]{10,}?\s*[»"—–]/g;
            const dialogs = text.match(dialogRegex) || [];
            const dialogLength = dialogs.join('').length;
            const totalLength = text.length;
            
            const dialogPercent = totalLength > 0 ? (dialogLength / totalLength * 100).toFixed(1) : 0;
            const narrativePercent = totalLength > 0 ? (100 - dialogPercent).toFixed(1) : 0;
            
            return {
                dialogue: dialogPercent,
                narrative: narrativePercent,
                dialogCount: dialogs.length
            };
        }

        function displayAnalysisResults(analysis) {
            const container = document.getElementById('analysisResults');
            
            container.innerHTML = `
                <div style="margin-top: 1rem;">
                    <!-- General Stats -->
                    <div style="background: var(--bg-primary); padding: 1rem; border-radius: 4px; border: 1px solid var(--border-color); margin-bottom: 1rem;">
                        <div style="font-weight: 700; font-size: 1rem; margin-bottom: 0.75rem; color: var(--accent-gold);"><i data-lucide="bar-chart-3" style="width:16px;height:16px;vertical-align:middle;margin-right:6px;"></i>Statistiques générales</div>
                        <div style="font-size: 1.2rem; font-weight: 600;">${analysis.wordCount.toLocaleString('fr-FR')} mots</div>
                    </div>

                    <!-- Readability -->
                    <div style="background: var(--bg-primary); padding: 1rem; border-radius: 4px; border: 1px solid var(--border-color); margin-bottom: 1rem;">
                        <div style="font-weight: 700; font-size: 1rem; margin-bottom: 0.75rem; color: var(--accent-gold);"><i data-lucide="book-open" style="width:16px;height:16px;vertical-align:middle;margin-right:6px;"></i>Lisibilité (Flesch)</div>
                        <div style="font-size: 1.1rem; margin-bottom: 0.25rem;">Score: <strong>${analysis.readability.score}</strong> / 100</div>
                        <div style="color: var(--text-muted);">Niveau: ${analysis.readability.level}</div>
                        <div style="margin-top: 0.5rem; font-size: 0.75rem; color: var(--text-muted); line-height: 1.4;">
                            Plus le score est élevé, plus le texte est facile à lire. 60-70 = Standard, 70-80 = Facile.
                        </div>
                    </div>

                    <!-- Sentence Length -->
                    <div style="background: var(--bg-primary); padding: 1rem; border-radius: 4px; border: 1px solid var(--border-color); margin-bottom: 1rem;">
                        <div style="font-weight: 700; font-size: 1rem; margin-bottom: 0.75rem; color: var(--accent-gold);"><i data-lucide="ruler" style="width:16px;height:16px;vertical-align:middle;margin-right:6px;"></i>Longueur des phrases</div>
                        <div style="display: flex; gap: 1rem; margin-bottom: 0.75rem;">
                            <div><strong>Moyenne:</strong> ${analysis.sentenceLength.avg} mots</div>
                            <div><strong>Min:</strong> ${analysis.sentenceLength.min}</div>
                            <div><strong>Max:</strong> ${analysis.sentenceLength.max}</div>
                        </div>
                        <div style="font-size: 0.8rem; font-weight: 600; margin-bottom: 0.5rem;">Distribution:</div>
                        ${analysis.sentenceLength.distribution.map(r => `
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem;">
                                <span style="font-size: 0.75rem;">${r.label}</span>
                                <div style="flex: 1; margin: 0 0.5rem; height: 8px; background: var(--bg-secondary); border-radius: 4px; overflow: hidden;">
                                    <div style="height: 100%; width: ${r.count * 100 / analysis.sentenceLength.distribution.reduce((s, d) => s + d.count, 0)}%; background: var(--accent-gold);"></div>
                                </div>
                                <span style="font-size: 0.75rem; font-weight: 600; min-width: 30px; text-align: right;">${r.count}</span>
                            </div>
                        `).join('')}
                    </div>

                    <!-- Narrative Distribution -->
                    <div style="background: var(--bg-primary); padding: 1rem; border-radius: 4px; border: 1px solid var(--border-color); margin-bottom: 1rem;">
                        <div style="font-weight: 700; font-size: 1rem; margin-bottom: 0.75rem; color: var(--accent-gold);"><i data-lucide="message-circle" style="width:16px;height:16px;vertical-align:middle;margin-right:6px;"></i>Distribution narrative</div>
                        <div style="display: flex; gap: 1rem; margin-bottom: 0.75rem;">
                            <div><strong>Dialogues:</strong> ${analysis.narrativeDistribution.dialogue}%</div>
                            <div><strong>Narration:</strong> ${analysis.narrativeDistribution.narrative}%</div>
                        </div>
                        <div style="height: 20px; background: var(--bg-secondary); border-radius: 4px; overflow: hidden; display: flex;">
                            <div style="height: 100%; width: ${analysis.narrativeDistribution.dialogue}%; background: #4CAF50;" title="Dialogues"></div>
                            <div style="height: 100%; width: ${analysis.narrativeDistribution.narrative}%; background: var(--accent-gold);" title="Narration"></div>
                        </div>
                        <div style="margin-top: 0.5rem; font-size: 0.75rem; color: var(--text-muted);">
                            ${analysis.narrativeDistribution.dialogCount} segments de dialogue détectés
                        </div>
                    </div>

                    <!-- Word Frequency -->
                    <div style="background: var(--bg-primary); padding: 1rem; border-radius: 4px; border: 1px solid var(--border-color); margin-bottom: 1rem;">
                        <div style="font-weight: 700; font-size: 1rem; margin-bottom: 0.75rem; color: var(--accent-gold);"><i data-lucide="type" style="width:16px;height:16px;vertical-align:middle;margin-right:6px;"></i>Mots les plus fréquents</div>
                        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 0.5rem;">
                            ${analysis.wordFrequency.map(([word, count]) => `
                                <div style="padding: 0.4rem 0.6rem; background: var(--bg-secondary); border-radius: 2px; font-size: 0.75rem;">
                                    <strong>${word}</strong>: ${count}×
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Repetitions -->
                    <div style="background: var(--bg-primary); padding: 1rem; border-radius: 4px; border: 1px solid var(--border-color);">
                        <div style="font-weight: 700; font-size: 1rem; margin-bottom: 0.75rem; color: var(--accent-red);"><i data-lucide="alert-triangle" style="width:16px;height:16px;vertical-align:middle;margin-right:6px;"></i>Répétitions à surveiller (5+ occurrences)</div>
                        ${analysis.repetitions.length > 0 ? `
                            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 0.5rem;">
                                ${analysis.repetitions.map(([word, count]) => `
                                    <div style="padding: 0.4rem 0.6rem; background: rgba(196, 69, 54, 0.1); border: 1px solid var(--accent-red); border-radius: 2px; font-size: 0.75rem;">
                                        <strong>${word}</strong>: ${count}×
                                    </div>
                                `).join('')}
                            </div>
                        ` : '<div style="color: var(--text-muted); font-size: 0.85rem;">Aucune répétition excessive détectée</div>'}
                    </div>
                </div>
            `;
        }
