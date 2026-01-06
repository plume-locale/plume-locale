        // ============================================
        // AUTO-DÉTECTION DES PERSONNAGES ET LIEUX
        // ============================================
        
        let autoDetectTimeout = null;
        
        function autoDetectLinksDebounced() {
            clearTimeout(autoDetectTimeout);
            autoDetectTimeout = setTimeout(() => {
                autoDetectLinks();
            }, 800); // Délai de 800ms après arrêt de la frappe
        }
        
        function autoDetectLinks() {
            if (!currentActId || !currentChapterId || !currentSceneId) return;
            
            const act = project.acts.find(a => a.id === currentActId);
            if (!act) return;
            const chapter = act.chapters.find(c => c.id === currentChapterId);
            if (!chapter) return;
            const scene = chapter.scenes.find(s => s.id === currentSceneId);
            if (!scene) return;
            
            // Obtenir le texte brut de la scène
            const editor = document.querySelector('.editor-textarea');
            if (!editor) return;
            
            const temp = document.createElement('div');
            temp.innerHTML = editor.innerHTML;
            const sceneText = temp.textContent || temp.innerText || '';
            
            // Normaliser le texte pour la recherche (sans accents, minuscule)
            const normalizedText = normalizeForSearch(sceneText);
            
            // Initialiser les tableaux si nécessaire
            if (!scene.linkedCharacters) scene.linkedCharacters = [];
            if (!scene.linkedElements) scene.linkedElements = [];
            
            let hasChanges = false;
            
            // === PERSONNAGES ===
            project.characters.forEach(char => {
                const charNameNormalized = normalizeForSearch(char.name);
                // Vérifier si le nom apparaît comme mot complet
                const regex = new RegExp('\\b' + escapeRegex(charNameNormalized) + '\\b', 'i');
                const isInText = regex.test(normalizedText);
                const isLinked = scene.linkedCharacters.includes(char.id);
                
                if (isInText && !isLinked) {
                    // Ajouter automatiquement
                    scene.linkedCharacters.push(char.id);
                    hasChanges = true;
                } else if (!isInText && isLinked) {
                    // Retirer automatiquement
                    const index = scene.linkedCharacters.indexOf(char.id);
                    if (index > -1) {
                        scene.linkedCharacters.splice(index, 1);
                        hasChanges = true;
                    }
                }
            });
            
            // === LIEUX/ÉLÉMENTS ===
            project.world.forEach(elem => {
                const elemNameNormalized = normalizeForSearch(elem.name);
                // Vérifier si le nom apparaît comme mot complet
                const regex = new RegExp('\\b' + escapeRegex(elemNameNormalized) + '\\b', 'i');
                const isInText = regex.test(normalizedText);
                const isLinked = scene.linkedElements.includes(elem.id);
                
                if (isInText && !isLinked) {
                    // Ajouter automatiquement
                    scene.linkedElements.push(elem.id);
                    hasChanges = true;
                } else if (!isInText && isLinked) {
                    // Retirer automatiquement
                    const index = scene.linkedElements.indexOf(elem.id);
                    if (index > -1) {
                        scene.linkedElements.splice(index, 1);
                        hasChanges = true;
                    }
                }
            });
            
            // Mettre à jour l'affichage si des changements ont eu lieu
            if (hasChanges) {
                saveProject();
                refreshLinksPanel();
            }
        }
        
        // Normaliser le texte pour la recherche (retirer accents, minuscule)
        function normalizeForSearch(text) {
            return text
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, ''); // Retire les accents
        }
        
        // Échapper les caractères spéciaux regex
        function escapeRegex(string) {
            return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        }
        
        // Rafraîchir le panneau des liens dans l'éditeur
        function refreshLinksPanel() {
            const linksPanel = document.getElementById('linksPanel');
            if (!linksPanel) return;
            
            const act = project.acts.find(a => a.id === currentActId);
            if (!act) return;
            const chapter = act.chapters.find(c => c.id === currentChapterId);
            if (!chapter) return;
            const scene = chapter.scenes.find(s => s.id === currentSceneId);
            if (!scene) return;
            
            const flexDivs = linksPanel.querySelectorAll('[style*="flex: 1"]');
            
            // Rafraîchir les personnages
            if (flexDivs.length >= 1) {
                const charDiv = flexDivs[0];
                const quickLinks = charDiv.querySelector('.quick-links');
                if (quickLinks) {
                    quickLinks.innerHTML = `
                        ${renderSceneCharacters(currentActId, currentChapterId, scene)}
                        <button class="btn btn-small" onclick="openCharacterLinker(${currentActId}, ${currentChapterId}, ${currentSceneId})" style="font-size: 0.75rem; padding: 0.3rem 0.6rem;">+ Lier</button>
                    `;
                }
            }
            
            // Rafraîchir les lieux/éléments
            if (flexDivs.length >= 2) {
                const locationDiv = flexDivs[1];
                const quickLinks = locationDiv.querySelector('.quick-links');
                if (quickLinks) {
                    quickLinks.innerHTML = `
                        ${renderSceneElements(currentActId, currentChapterId, scene)}
                        <button class="btn btn-small" onclick="openElementLinker(${currentActId}, ${currentChapterId}, ${currentSceneId})" style="font-size: 0.75rem; padding: 0.3rem 0.6rem;">+ Lier</button>
                    `;
                }
            }
            
            // Réinitialiser les icônes Lucide
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }

        // Rich Text Formatting
        function formatText(command, value = null) {
            document.execCommand(command, false, value);
            document.querySelector('.editor-textarea').focus();
        }
