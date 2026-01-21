// World Management
        // MVVM: View
        // Raison: Manipule directement le DOM (ouvre la modale et met le focus).
        function openAddWorldModal() {
            document.getElementById('addWorldModal').classList.add('active');
            setTimeout(() => document.getElementById('worldNameInput').focus(), 100);
        }

        // MVVM: Mixte (ViewModel + Model)
        // Raison: Récupère des valeurs depuis la vue, construit/maj le modèle (`project.world`),
        // et déclenche des actions de vue (`renderWorldList`, `closeModal`) et de persistance (`saveProject`).
        /* MVVM: ViewModel - Logique métier pour ajouter un élément (fait le pont entre UI et Model) */
        function addWorldElement() {
            const name = document.getElementById('worldNameInput').value.trim();
            const type = document.getElementById('worldTypeInput').value;
            const description = document.getElementById('worldDescInput').value.trim();
            
            if (!name) return;

            const element = {
                id: Date.now(),
                name: name,
                type: type,
                description: description || '',
                details: '',
                history: '',
                notes: '',
                linkedScenes: [], // Array of scene IDs where this element appears
                linkedElements: [] // Array of {type, id} for related characters/timeline/etc
            };

            project.world.push(element);
            
            // Clear inputs
            document.getElementById('worldNameInput').value = '';
            document.getElementById('worldDescInput').value = '';
            
            closeModal('addWorldModal');
            saveProject();
            renderWorldList();
        }

        // MVVM: Mixte (ViewModel + Model)
        // Raison: Contrôle la logique utilisateur (confirm), modifie le modèle (`project.world`),
        // puis déclenche persistance et mise à jour de la vue.
        /* MVVM: ViewModel - Logique métier pour supprimer un élément */
        function deleteWorldElement(id) {
            if (!confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) return;
            project.world = project.world.filter(w => w.id !== id);
            saveProject();
            renderWorldList();
            showEmptyState();
        }

        // MVVM: View
        // Raison: Génère et met à jour l'interface DOM pour la liste des éléments du monde.
        // Lit le modèle (`project.world`) mais ne modifie pas directement la logique métier.
        /* MVVM: View - Génération dynamique du HTML pour la liste des éléments */
        function renderWorldList() {
            const container = document.getElementById('worldList');
            
            if (project.world.length === 0) {
                container.innerHTML = '<div style="padding: 1rem; text-align: center; color: var(--text-muted); font-size: 0.85rem;">Aucun élément</div>';
                return;
            }
            
            // Group by type
            const groups = {};
            project.world.forEach(elem => {
                const type = elem.type || 'Autre';
                if (!groups[type]) groups[type] = [];
                groups[type].push(elem);
            });
            
            // Icons for each type (Mise à jour avec Lucide Icons)
            const typeIcons = {
                'Lieu': 'map-pin',
                'Objet': 'package', 
                'Concept': 'lightbulb',
                'Organisation': 'users',
                'Événement': 'calendar',
                'Autre': 'more-horizontal'
            };
            
            // Get collapsed state from localStorage
            const collapsedState = JSON.parse(localStorage.getItem('plume_treeview_collapsed') || '{}');
            
            let html = '';
            Object.keys(groups).sort().forEach(type => {
                const groupKey = 'world_' + type;
                const isCollapsed = collapsedState[groupKey] === true;
                
                // Sort elements alphabetically within each group
                const sortedElements = [...groups[type]].sort((a, b) => {
                    return (a.name || '').toLowerCase().localeCompare((b.name || '').toLowerCase(), 'fr');
                });
                
                html += `
                    <div class="treeview-group">
                        <div class="treeview-header" onclick="toggleTreeviewGroup('${groupKey}')">
                            <i data-lucide="${isCollapsed ? 'chevron-right' : 'chevron-down'}" class="treeview-chevron"></i>
                            <span class="treeview-label">${type}</span>
                            <span class="treeview-count">${groups[type].length}</span>
                        </div>
                        <div class="treeview-children ${isCollapsed ? 'collapsed' : ''}">
                            ${sortedElements.map(elem => {
                                const iconName = typeIcons[type] || 'circle'; // Icône par défaut 'circle'
                                
                                return `
                                <div class="treeview-item" onclick="openWorldDetail(${elem.id})">
                                    <span class="treeview-item-icon"><i data-lucide="${iconName}" style="width:14px;height:14px;vertical-align:middle;"></i></span>
                                    <span class="treeview-item-label">${elem.name}</span>
                                    <button class="treeview-item-delete" onclick="event.stopPropagation(); deleteWorldElement(${elem.id})" title="Supprimer">×</button>
                                </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                `;
            });

            container.innerHTML = html;
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }

        // MVVM: ViewModel (générateur de fragment de vue à partir du modèle)
        // Raison: Lit le modèle (`project.acts`, `scenes`) et retourne un fragment HTML réutilisable
        // qui sera inséré dans la vue de détail. Ne modifie pas le modèle.
        /* MVVM: View - Génération HTML pour les scènes liées */
        function renderElementLinkedScenes(element) {
            const scenes = findScenesWithElement(element.id);
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

        // MVVM: ViewModel (coordination entre modèle et vue)
        // Raison: Récupère l'élément depuis le modèle et construit le contenu HTML
        // pour la vue de détail. Gère aussi la logique de split view (état de l'interface).
        /* MVVM: Mixte (View/ViewModel) - Gère la logique d'affichage détaillé et la génération du template HTML */
        function openWorldDetail(id) {
            const element = project.world.find(w => w.id === id);
            if (!element) return;
            
            // Handle split view mode
            if (splitViewActive) {
                const state = splitActivePanel === 'left' ? splitViewState.left : splitViewState.right;
                if (state.view === 'world') {
                    state.worldId = id;
                    renderSplitPanelViewContent(splitActivePanel);
                    saveSplitViewState();
                    return;
                }
            }

            const editorView = document.getElementById('editorView');
            editorView.innerHTML = `
                <div class="detail-view">
                    <div class="detail-header">
                        <div style="display: flex; align-items: center; gap: 1rem;">
                            <div class="detail-title">${element.name}</div>
                            <span style="font-size: 0.9rem; padding: 0.5rem 1rem; background: var(--accent-gold); color: var(--bg-primary); border-radius: 2px;">${element.type}</span>
                        </div>
                        <div style="display: flex; gap: 0.5rem;">
                            <button class="btn btn-small" onclick="showReferencesForElement(${id})"><i data-lucide="link" style="width:14px;height:14px;vertical-align:middle;margin-right:4px;"></i>Voir les références</button>
                            <button class="btn" onclick="switchView('editor')">? Retour à l'éditeur</button>
                        </div>
                    </div>
                    
                    ${renderElementLinkedScenes(element)}
                    
                    <div class="detail-section">
                        <div class="detail-section-title">Informations de base</div>
                        <div class="detail-field">
                            <div class="detail-label">Nom</div>
                            <input type="text" class="form-input" value="${element.name}" 
                                   onchange="updateWorldField(${id}, 'name', this.value)">
                        </div>
                    </div>

                    <div class="detail-section">
                        <div class="detail-section-title">Type</div>
                        <select class="form-input" onchange="updateWorldField(${id}, 'type', this.value)">
                            <option value="Lieu" ${element.type === 'Lieu' ? 'selected' : ''}>Lieu</option>
                            <option value="Objet" ${element.type === 'Objet' ? 'selected' : ''}>Objet</option>
                            <option value="Concept" ${element.type === 'Concept' ? 'selected' : ''}>Concept</option>
                            <option value="Organisation" ${element.type === 'Organisation' ? 'selected' : ''}>Organisation</option>
                            <option value="Événement" ${element.type === 'Événement' ? 'selected' : ''}>Événement</option>
                        </select>
                    </div>

                    <div class="detail-section">
                        <div class="detail-section-title">Description</div>
                        <textarea class="form-input" rows="6" 
                                  onchange="updateWorldField(${id}, 'description', this.value)">${element.description}</textarea>
                    </div>

                    <div class="detail-section">
                        <div class="detail-section-title">Détails</div>
                        <textarea class="form-input" rows="6" 
                                  onchange="updateWorldField(${id}, 'details', this.value)">${element.details}</textarea>
                    </div>

                    <div class="detail-section">
                        <div class="detail-section-title">Histoire</div>
                        <textarea class="form-input" rows="6" 
                                  onchange="updateWorldField(${id}, 'history', this.value)">${element.history}</textarea>
                    </div>

                    <div class="detail-section">
                        <div class="detail-section-title">Notes</div>
                        <textarea class="form-input" rows="4" 
                                  onchange="updateWorldField(${id}, 'notes', this.value)">${element.notes}</textarea>
                    </div>
                </div>
            `;
        }

        // MVVM: ViewModel
        // Raison: Met à jour le modèle (`project.world`) à partir d'actions de la vue,
        // persiste et notifie/rafraîchit la vue.
        /* MVVM: ViewModel - Met à jour les données du Model et déclenche le rafraîchissement de la View */
        function updateWorldField(id, field, value) {
            const element = project.world.find(w => w.id === id);
            if (element) {
                element[field] = value;
                saveProject();
                renderWorldList();
            }
        }