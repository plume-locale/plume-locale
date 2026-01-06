        // ============================================
        // RELATIONS GRAPH FUNCTIONS
        // ============================================
        
        function renderRelationsView() {
            const editorView = document.getElementById('editorView');
            if (!editorView) {
                console.error('editorView not found');
                return;
            }
            
            // S'assurer que relations existe
            if (!project.relations) project.relations = [];
            
            // S'assurer que les positions personnalisées existent
            if (!project.characterPositions) project.characterPositions = {};
            
            // Types de relations avec couleurs
            const relationTypes = {
                'amour': { color: '#e91e63', label: '❤️ Amour', icon: '❤️' },
                'amitie': { color: '#4caf50', label: '🤝 Amitié', icon: '🤝' },
                'rivalite': { color: '#f44336', label: '⚔️ Rivalité', icon: '⚔️' },
                'famille': { color: '#2196f3', label: '👨‍👩‍👧 Famille', icon: '👨‍👩‍👧' },
                'mentor': { color: '#ff9800', label: '📚 Mentor', icon: '📚' },
                'ennemi': { color: '#9c27b0', label: '💀 Ennemi', icon: '💀' },
                'alliance': { color: '#00bcd4', label: '🤜🤛 Alliance', icon: '🤜🤛' },
                'neutre': { color: '#757575', label: '😐 Neutre', icon: '😐' }
            };
            
            let graphHTML = '';
            if (project.characters.length >= 2) {
                const centerX = 400;
                const centerY = 350;
                const radius = 220;
                
                // Calculer les positions (personnalisées ou par défaut en cercle)
                const positions = project.characters.map((char, i) => {
                    if (project.characterPositions[char.id]) {
                        return project.characterPositions[char.id];
                    } else {
                        const angle = (i / project.characters.length) * 2 * Math.PI;
                        return {
                            x: centerX + radius * Math.cos(angle),
                            y: centerY + radius * Math.sin(angle)
                        };
                    }
                });
                
                // SVG pour les lignes de relation
                let svgLines = '<svg id="relationsSvg" style="position: absolute; width: 100%; height: 100%; top: 0; left: 0; pointer-events: none;">';
                
                // Dessiner les relations existantes
                project.relations.forEach(rel => {
                    const char1 = project.characters.find(c => c.id === rel.char1Id);
                    const char2 = project.characters.find(c => c.id === rel.char2Id);
                    
                    if (char1 && char2) {
                        const i1 = project.characters.indexOf(char1);
                        const i2 = project.characters.indexOf(char2);
                        
                        const x1 = positions[i1].x;
                        const y1 = positions[i1].y;
                        const x2 = positions[i2].x;
                        const y2 = positions[i2].y;
                        
                        const relType = relationTypes[rel.type] || relationTypes['neutre'];
                        
                        svgLines += `
                            <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" 
                                  stroke="${relType.color}" 
                                  stroke-width="3" 
                                  opacity="0.7"
                                  style="cursor: pointer;"
                                  onclick="editRelation('${rel.id}')"/>
                            <text x="${(x1 + x2) / 2}" y="${(y1 + y2) / 2 - 10}" 
                                  fill="${relType.color}" 
                                  font-size="20" 
                                  text-anchor="middle"
                                  style="pointer-events: none;">${relType.icon}</text>
                        `;
                    }
                });
                
                svgLines += '</svg>';
                
                // Positionner les personnages (draggables)
                project.characters.forEach((char, i) => {
                    const pos = positions[i];
                    
                    graphHTML += `
                        <div id="char-node-${char.id}" 
                             class="char-node-draggable"
                             data-char-id="${char.id}"
                             style="position: absolute; left: ${pos.x}px; top: ${pos.y}px; transform: translate(-50%, -50%); text-align: center; cursor: move;"
                             onmousedown="startDragCharacter(event, ${char.id})"
                             onclick="handleCharacterClick(event, ${char.id})">
                            <div style="width: 70px; height: 70px; border-radius: 50%; background: var(--accent-gold); 
                                        display: flex; align-items: center; justify-content: center; font-size: 2rem;
                                        border: 3px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                                        ${selectedCharsForRelation.includes(char.id) ? 'border-color: var(--accent-red); border-width: 5px;' : ''}
                                        transition: transform 0.2s;">
                                ${char.avatar || '👤'}
                            </div>
                            <div style="margin-top: 0.5rem; font-weight: 600; font-size: 0.9rem; background: var(--bg-accent); color: white;
                                        padding: 0.25rem 0.5rem; border-radius: 4px; white-space: nowrap; pointer-events: none;">${char.name}</div>
                        </div>
                    `;
                });
                
                graphHTML = svgLines + graphHTML;
            } else {
                graphHTML = `
                    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center;">
                        <div style="font-size: 4rem; margin-bottom: 1rem;"><i data-lucide="users" style="width:64px;height:64px;"></i></div>
                        <div style="font-size: 1.3rem; font-weight: 600; margin-bottom: 0.5rem;">Aucune relation à afficher</div>
                        <div style="color: var(--text-muted); margin-bottom: 1rem;">Créez au moins 2 personnages pour visualiser leurs relations</div>
                        <button class="btn btn-primary" onclick="switchView('characters')">+ Créer des personnages</button>
                    </div>
                `;
            }
            
            editorView.innerHTML = `
                <div style="height: 100%; overflow-y: auto; padding: 2rem 3rem;">
                    <h2 style="margin-bottom: 2rem; color: var(--accent-gold);"><i data-lucide="network" style="width:24px;height:24px;vertical-align:middle;margin-right:8px;"></i>Carte des Relations</h2>
                    
                    ${project.characters.length >= 2 ? `
                        <div style="margin-bottom: 2rem; display: flex; gap: 1rem; flex-wrap: wrap;">
                            <div style="flex: 1; min-width: 300px; padding: 1.5rem; background: var(--bg-secondary); border-radius: 8px; border-left: 4px solid var(--accent-gold);">
                                <div style="font-weight: 600; margin-bottom: 0.5rem;"><i data-lucide="pen-line" style="width:14px;height:14px;vertical-align:middle;margin-right:4px;"></i>Créer une relation:</div>
                                <div style="font-size: 0.9rem; color: var(--text-secondary); line-height: 1.6;">
                                    1. Cliquez sur un premier personnage<br>
                                    2. Cliquez sur un second personnage<br>
                                    3. Choisissez le type de relation
                                </div>
                            </div>
                            <div style="flex: 1; min-width: 300px; padding: 1.5rem; background: var(--bg-secondary); border-radius: 8px; border-left: 4px solid var(--accent-red);">
                                <div style="font-weight: 600; margin-bottom: 0.5rem;">🖱️ Déplacer les personnages:</div>
                                <div style="font-size: 0.9rem; color: var(--text-secondary); line-height: 1.6;">
                                    Faites glisser les personnages pour réorganiser le graphe<br>
                                    Les liens suivent automatiquement
                                </div>
                            </div>
                        </div>
                        <div style="margin-bottom: 1rem; display: flex; gap: 0.5rem;">
                            <button class="btn btn-small" onclick="resetCharacterPositions()">🔄 Réinitialiser positions</button>
                            <button class="btn btn-small" onclick="autoArrangeCharacters()"><i data-lucide="sparkles" style="width:14px;height:14px;vertical-align:middle;margin-right:4px;"></i>Arranger automatiquement</button>
                        </div>
                    ` : ''}
                    
                    <div id="relationsGraph" style="position: relative; height: 700px; background: var(--bg-secondary); border-radius: 8px; margin-bottom: 2rem;">
                        ${graphHTML}
                    </div>
                    
                    ${project.characters.length >= 2 ? `
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
                            ${Object.entries(relationTypes).map(([key, rel]) => `
                                <div style="display: flex; align-items: center; gap: 0.75rem; padding: 1rem; background: var(--bg-secondary); border-radius: 8px; border-left: 4px solid ${rel.color};">
                                    <div style="font-size: 1.5rem;">${rel.icon}</div>
                                    <div style="flex: 1;">
                                        <div style="font-weight: 600; font-size: 0.95rem;">${rel.label.split(' ')[1]}</div>
                                        <div style="font-size: 0.75rem; color: var(--text-muted);">${getRelationCount(key)} relation(s)</div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                    
                    ${project.relations && project.relations.length > 0 ? `
                        <div style="background: var(--bg-secondary); padding: 1.5rem; border-radius: 8px;">
                            <h3 style="margin-bottom: 1rem; color: var(--text-primary);"><i data-lucide="list" style="width:18px;height:18px;vertical-align:middle;margin-right:6px;"></i>Liste des relations (${project.relations.length})</h3>
                            <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                                ${project.relations.map(rel => {
                                    const char1 = project.characters.find(c => c.id === rel.char1Id);
                                    const char2 = project.characters.find(c => c.id === rel.char2Id);
                                    const relType = relationTypes[rel.type] || relationTypes['neutre'];
                                    return char1 && char2 ? `
                                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: var(--bg-primary); border-radius: 4px; border-left: 4px solid ${relType.color};">
                                            <div style="display: flex; align-items: center; gap: 1rem;">
                                                <span style="font-size: 1.5rem;">${relType.icon}</span>
                                                <span style="font-weight: 600;">${char1.name}</span>
                                                <span style="color: var(--text-muted);">↔</span>
                                                <span style="font-weight: 600;">${char2.name}</span>
                                                ${rel.description ? `<span style="color: var(--text-muted); font-size: 0.85rem;">· ${rel.description}</span>` : ''}
                                            </div>
                                            <div style="display: flex; gap: 0.5rem;">
                                                <button class="btn btn-small" onclick="editRelation('${rel.id}')">✏️</button>
                                                <button class="btn btn-small" onclick="deleteRelation('${rel.id}')">🗑️</button>
                                            </div>
                                        </div>
                                    ` : '';
                                }).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
            `;
            
            // Ajouter les événements de hover sur les personnages
            setTimeout(() => {
                document.querySelectorAll('.char-node-draggable').forEach(node => {
                    node.addEventListener('mouseenter', () => {
                        node.querySelector('div').style.transform = 'scale(1.1)';
                    });
                    node.addEventListener('mouseleave', () => {
                        node.querySelector('div').style.transform = 'scale(1)';
                    });
                });
            }, 0);
        }
        
        // Variables pour le drag-and-drop
        let draggedCharId = null;
        let dragStartX = 0;
        let dragStartY = 0;
        let isDragging = false;
        let dragMoved = false;
        
        function startDragCharacter(event, charId) {
            event.preventDefault();
            draggedCharId = charId;
            dragStartX = event.clientX;
            dragStartY = event.clientY;
            isDragging = true;
            dragMoved = false;
            
            document.addEventListener('mousemove', dragCharacter);
            document.addEventListener('mouseup', stopDragCharacter);
        }
        
        function dragCharacter(event) {
            if (!isDragging || !draggedCharId) return;
            
            const deltaX = event.clientX - dragStartX;
            const deltaY = event.clientY - dragStartY;
            
            // Considérer comme un drag si mouvement > 5px
            if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
                dragMoved = true;
            }
            
            const node = document.getElementById(`char-node-${draggedCharId}`);
            if (!node) return;
            
            const graph = document.getElementById('relationsGraph');
            const graphRect = graph.getBoundingClientRect();
            
            // Position actuelle
            const currentLeft = parseFloat(node.style.left);
            const currentTop = parseFloat(node.style.top);
            
            // Nouvelle position
            let newLeft = currentLeft + deltaX;
            let newTop = currentTop + deltaY;
            
            // Limiter aux bords du graphe
            newLeft = Math.max(50, Math.min(graphRect.width - 50, newLeft));
            newTop = Math.max(50, Math.min(graphRect.height - 50, newTop));
            
            node.style.left = newLeft + 'px';
            node.style.top = newTop + 'px';
            
            dragStartX = event.clientX;
            dragStartY = event.clientY;
            
            // Mettre à jour les lignes SVG
            updateRelationLines();
        }
        
        function stopDragCharacter(event) {
            if (!isDragging) return;
            
            document.removeEventListener('mousemove', dragCharacter);
            document.removeEventListener('mouseup', stopDragCharacter);
            
            if (dragMoved) {
                // Sauvegarder la nouvelle position
                const node = document.getElementById(`char-node-${draggedCharId}`);
                if (node) {
                    if (!project.characterPositions) project.characterPositions = {};
                    project.characterPositions[draggedCharId] = {
                        x: parseFloat(node.style.left),
                        y: parseFloat(node.style.top)
                    };
                    saveProject();
                    showNotification('📍 Position sauvegardée');
                }
            }
            
            isDragging = false;
            draggedCharId = null;
            dragMoved = false;
        }
        
        function handleCharacterClick(event, charId) {
            // Ne pas traiter comme un clic si c'était un drag
            if (dragMoved) {
                event.stopPropagation();
                return;
            }
            
            selectCharacterForRelation(charId);
        }
        
        function updateRelationLines() {
            const svg = document.getElementById('relationsSvg');
            if (!svg) return;
            
            const relationTypes = {
                'amour': { color: '#e91e63', icon: '❤️' },
                'amitie': { color: '#4caf50', icon: '🤝' },
                'rivalite': { color: '#f44336', icon: '⚔️' },
                'famille': { color: '#2196f3', icon: '👨‍👩‍👧' },
                'mentor': { color: '#ff9800', icon: '📚' },
                'ennemi': { color: '#9c27b0', icon: '💀' },
                'alliance': { color: '#00bcd4', icon: '🤜🤛' },
                'neutre': { color: '#757575', icon: '😐' }
            };
            
            let svgContent = '';
            
            project.relations.forEach(rel => {
                const char1 = project.characters.find(c => c.id === rel.char1Id);
                const char2 = project.characters.find(c => c.id === rel.char2Id);
                
                if (char1 && char2) {
                    const node1 = document.getElementById(`char-node-${char1.id}`);
                    const node2 = document.getElementById(`char-node-${char2.id}`);
                    
                    if (node1 && node2) {
                        const x1 = parseFloat(node1.style.left);
                        const y1 = parseFloat(node1.style.top);
                        const x2 = parseFloat(node2.style.left);
                        const y2 = parseFloat(node2.style.top);
                        
                        const relType = relationTypes[rel.type] || relationTypes['neutre'];
                        
                        svgContent += `
                            <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" 
                                  stroke="${relType.color}" 
                                  stroke-width="3" 
                                  opacity="0.7"
                                  style="cursor: pointer;"
                                  onclick="editRelation('${rel.id}')"/>
                            <text x="${(x1 + x2) / 2}" y="${(y1 + y2) / 2 - 10}" 
                                  fill="${relType.color}" 
                                  font-size="20" 
                                  text-anchor="middle"
                                  style="pointer-events: none;">${relType.icon}</text>
                        `;
                    }
                }
            });
            
            svg.innerHTML = svgContent;
        }
        
        function resetCharacterPositions() {
            if (confirm('Réinitialiser toutes les positions des personnages ?')) {
                project.characterPositions = {};
                saveProject();
                renderRelationsView();
                showNotification('🔄 Positions réinitialisées');
            }
        }
        
        function autoArrangeCharacters() {
            // Arranger en cercle avec plus d'espace
            const centerX = 400;
            const centerY = 350;
            const radius = 220;
            
            project.characterPositions = {};
            project.characters.forEach((char, i) => {
                const angle = (i / project.characters.length) * 2 * Math.PI;
                project.characterPositions[char.id] = {
                    x: centerX + radius * Math.cos(angle),
                    y: centerY + radius * Math.sin(angle)
                };
            });
            
            saveProject();
            renderRelationsView();
            showNotification('✨ Personnages arrangés automatiquement');
        }
        
        // Variables pour la sélection de personnages
        let selectedCharsForRelation = [];
        
        function selectCharacterForRelation(charId) {
            if (selectedCharsForRelation.includes(charId)) {
                // Désélectionner
                selectedCharsForRelation = selectedCharsForRelation.filter(id => id !== charId);
            } else {
                selectedCharsForRelation.push(charId);
            }
            
            // Si 2 personnages sélectionnés, demander le type de relation
            if (selectedCharsForRelation.length === 2) {
                createRelationModal();
            } else {
                renderRelationsView();
            }
        }
        
        function createRelationModal() {
            const char1 = project.characters.find(c => c.id === selectedCharsForRelation[0]);
            const char2 = project.characters.find(c => c.id === selectedCharsForRelation[1]);
            
            const relationTypes = {
                'amour': { color: '#e91e63', label: '❤️ Amour' },
                'amitie': { color: '#4caf50', label: '🤝 Amitié' },
                'rivalite': { color: '#f44336', label: '⚔️ Rivalité' },
                'famille': { color: '#2196f3', label: '👨‍👩‍👧 Famille' },
                'mentor': { color: '#ff9800', label: '📚 Mentor' },
                'ennemi': { color: '#9c27b0', label: '💀 Ennemi' },
                'alliance': { color: '#00bcd4', label: '🤜🤛 Alliance' },
                'neutre': { color: '#757575', label: '😐 Neutre' }
            };
            
            const modalHTML = `
                <div class="modal active" id="relationModal" onclick="if(event.target===this) closeRelationModal()">
                    <div class="modal-content" style="max-width: 500px;">
                        <h2 style="margin-bottom: 1.5rem;"><i data-lucide="link" style="width:20px;height:20px;vertical-align:middle;margin-right:6px;"></i>Créer une relation</h2>
                        
                        <div style="margin-bottom: 1.5rem; padding: 1rem; background: var(--bg-secondary); border-radius: 8px; text-align: center;">
                            <span style="font-weight: 600; font-size: 1.1rem;">${char1.name}</span>
                            <span style="margin: 0 1rem; color: var(--text-muted);">↔</span>
                            <span style="font-weight: 600; font-size: 1.1rem;">${char2.name}</span>
                        </div>
                        
                        <div style="margin-bottom: 1.5rem;">
                            <label style="display: block; font-weight: 600; margin-bottom: 0.75rem;">Type de relation:</label>
                            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem;">
                                ${Object.entries(relationTypes).map(([key, rel]) => `
                                    <button class="btn" onclick="selectRelationType('${key}')" 
                                            id="relType-${key}"
                                            style="justify-content: flex-start; text-align: left; padding: 0.75rem;">
                                        <div style="width: 4px; height: 100%; background: ${rel.color}; position: absolute; left: 0; top: 0; bottom: 0;"></div>
                                        ${rel.label}
                                    </button>
                                `).join('')}
                            </div>
                        </div>
                        
                        <div style="margin-bottom: 1.5rem;">
                            <label style="display: block; font-weight: 600; margin-bottom: 0.5rem;">Description (optionnel):</label>
                            <input type="text" class="form-input" id="relationDescription" placeholder="Ex: Frère et sœur, alliés depuis l'enfance...">
                        </div>
                        
                        <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
                            <button class="btn" onclick="closeRelationModal()">Annuler</button>
                            <button class="btn btn-primary" onclick="saveRelation()" id="saveRelationBtn" disabled>Créer la relation</button>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }
        
        let selectedRelationType = null;
        
        function selectRelationType(type) {
            selectedRelationType = type;
            
            // Mettre à jour l'UI
            document.querySelectorAll('[id^="relType-"]').forEach(btn => {
                btn.classList.remove('btn-primary');
            });
            document.getElementById(`relType-${type}`).classList.add('btn-primary');
            document.getElementById('saveRelationBtn').disabled = false;
        }
        
        function saveRelation() {
            if (!selectedRelationType) return;
            
            const description = document.getElementById('relationDescription').value;
            
            if (!project.relations) project.relations = [];
            
            project.relations.push({
                id: 'rel_' + Date.now(),
                char1Id: selectedCharsForRelation[0],
                char2Id: selectedCharsForRelation[1],
                type: selectedRelationType,
                description: description,
                createdAt: new Date().toISOString()
            });
            
            saveProject();
            closeRelationModal();
            selectedCharsForRelation = [];
            selectedRelationType = null;
            renderRelationsView();
            showNotification('🔗 Relation créée');
        }
        
        function closeRelationModal() {
            const modal = document.getElementById('relationModal');
            if (modal) modal.remove();
            selectedCharsForRelation = [];
            selectedRelationType = null;
            renderRelationsView();
        }
        
        function getRelationCount(type) {
            if (!project.relations) return 0;
            return project.relations.filter(r => r.type === type).length;
        }
        
        function editRelation(relId) {
            const relation = project.relations.find(r => r.id === relId);
            if (!relation) return;
            
            // Pour l'instant, juste permettre de changer la description
            const newDesc = prompt('Modifier la description:', relation.description || '');
            if (newDesc !== null) {
                relation.description = newDesc;
                saveProject();
                renderRelationsView();
                showNotification('✏️ Relation modifiée');
            }
        }
        
        function deleteRelation(relId) {
            if (confirm('Supprimer cette relation ?')) {
                project.relations = project.relations.filter(r => r.id !== relId);
                saveProject();
                renderRelationsView();
                showNotification('🗑️ Relation supprimée');
            }
        }
        
        function exportRelations() {
            alert('Export graphique des relations à venir');
        }