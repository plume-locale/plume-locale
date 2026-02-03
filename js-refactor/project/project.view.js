/**
 * [MVVM : Project View]
 * Gère le rendu HTML et les interactions visuelles des projets.
 */

const ProjectView = {
    /**
     * Met à jour le titre du projet dans le header.
     * @param {string} title 
     */
    updateHeader(title) {
        const headerTitle = document.getElementById('headerProjectTitle');
        if (headerTitle) headerTitle.textContent = title;
    },

    /**
     * Affiche la liste des projets dans la modale.
     * @param {Array} projects 
     * @param {number|string} currentId 
     */
    renderList(projects, currentId) {
        const container = document.getElementById('projectsList');
        if (!container) return;

        if (!projects || projects.length === 0) {
            container.innerHTML = '<div style="padding: 2rem; text-align: center; color: var(--text-muted);">Aucun projet</div>';
            return;
        }

        container.innerHTML = projects.map(proj => {
            const isActive = proj.id === currentId;

            // Calcul rapide des stats
            const actCount = proj.acts ? proj.acts.length : 0;
            let chapterCount = 0;
            let sceneCount = 0;
            let wordCount = 0;

            if (proj.acts) {
                proj.acts.forEach(act => {
                    if (act.chapters) {
                        chapterCount += act.chapters.length;
                        act.chapters.forEach(chap => {
                            if (chap.scenes) {
                                sceneCount += chap.scenes.length;
                                chap.scenes.forEach(scene => {
                                    const text = scene.content ? ProjectModel.stripHTML(scene.content) : '';
                                    if (text.trim().length > 0) {
                                        const words = text.trim().match(/[\w\u00C0-\u00FF]+(?:[''’][\w\u00C0-\u00FF]+)*/g);
                                        if (words) wordCount += words.length;
                                    }
                                });
                            }
                        });
                    }
                });
            }

            const charCount = proj.characters ? proj.characters.length : 0;
            const worldCount = proj.world ? proj.world.length : 0;
            const codexCount = proj.codex ? proj.codex.length : 0;

            return `
                <div class="project-card ${isActive ? 'active' : ''}" onclick="ProjectViewModel.switchTo(${proj.id}); ProjectView.closeProjectsModal();">
                    <div class="project-card-header">
                        <div>
                            <div class="project-card-title">${proj.title}</div>
                            ${proj.genre ? `<span class="project-card-genre">${proj.genre}</span>` : ''}
                        </div>
                        ${isActive ? '<span style="color: var(--accent-red); font-weight: 600;">● Actif</span>' : ''}
                    </div>
                    ${proj.description ? `<div class="project-card-desc">${proj.description}</div>` : ''}
                    
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); gap: 0.5rem; margin-top: 1rem; padding-top: 0.75rem; border-top: 1px solid var(--border-color); font-size: 0.8rem; color: var(--text-muted);">
                        <div style="display: flex; align-items: center; gap: 6px;" title="Nombre de mots total">
                            <i data-lucide="align-left" style="width: 14px; height: 14px; color: var(--accent-gold);"></i> 
                            <span style="font-weight: 600;">${wordCount.toLocaleString('fr-FR')}</span> mots
                        </div>
                        <div style="display: flex; align-items: center; gap: 6px;" title="Nombre d'actes">
                            <i data-lucide="book" style="width: 14px; height: 14px;"></i> 
                            <span>${actCount} actes</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 6px;" title="Nombre de chapitres">
                            <i data-lucide="bookmark" style="width: 14px; height: 14px;"></i> 
                            <span>${chapterCount} chapitres</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 6px;" title="Nombre de scènes">
                            <i data-lucide="file-text" style="width: 14px; height: 14px;"></i> 
                            <span>${sceneCount} scènes</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 6px;" title="Personnages">
                            <i data-lucide="users" style="width: 14px; height: 14px;"></i> 
                            <span>${charCount} pers.</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 6px;" title="Entrées Univers">
                            <i data-lucide="globe" style="width: 14px; height: 14px;"></i> 
                            <span>${worldCount} univ.</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 6px;" title="Entrées Codex">
                            <i data-lucide="book-open" style="width: 14px; height: 14px;"></i> 
                            <span>${codexCount} codex</span>
                        </div>
                    </div>

                    <div class="project-card-actions">
                        <button class="btn btn-small" onclick="event.stopPropagation(); ProjectViewModel.export(${proj.id})"><i data-lucide="upload" style="width:12px;height:12px;margin-right:4px;vertical-align:middle;"></i> Exporter</button>
                        <button class="btn btn-small" onclick="event.stopPropagation(); ProjectViewModel.delete(${proj.id})"><i data-lucide="trash-2" style="width:12px;height:12px;margin-right:4px;vertical-align:middle;"></i> Supprimer</button>
                    </div>
                </div>`;
        }).join('');

        if (typeof lucide !== 'undefined') lucide.createIcons();
    },

    /**
     * Ouvre la modale de création.
     */
    openNewModal() {
        const modal = document.getElementById('newProjectModal');
        if (modal) {
            modal.classList.add('active');
            setTimeout(() => document.getElementById('newProjectTitle')?.focus(), 100);
        }
    },

    /**
     * Ferme la modale de création.
     */
    closeNewModal() {
        closeModal('newProjectModal');
    },

    /**
     * Ferme la modale de gestion des projets.
     */
    closeProjectsModal() {
        closeModal('projectsModal');
    },

    /**
     * Rendu de l'interface d'analyse.
     */
    renderAnalysis() {
        const editorView = document.getElementById('editorView');
        if (!editorView) return;

        editorView.innerHTML = `
            <div style="height: 100%; overflow-y: auto; padding: 2rem 3rem;">
                <h2 style="margin-bottom: 2rem; color: var(--accent-gold);">
                    <i data-lucide="scan-search" style="width:24px;height:24px;vertical-align:middle;margin-right:8px;"></i>Analyse du texte
                </h2>
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
            </div>`;

        if (typeof lucide !== 'undefined') lucide.createIcons();

        setTimeout(() => {
            document.getElementById('analysisScope')?.addEventListener('change', () => ProjectViewModel.runAnalysis());
            ProjectViewModel.runAnalysis();
        }, 0);
    },

    /**
     * Rendu si aucun texte à analyser.
     */
    renderAnalysisEmpty() {
        const container = document.getElementById('analysisResults');
        if (container) {
            container.innerHTML = '<div style="padding: 2rem; text-align: center; color: var(--text-muted);">Aucun texte à analyser</div>';
        }
    },

    /**
     * Affiche les résultats détaillés de l'analyse.
     */
    displayAnalysisResults(analysis) {
        const container = document.getElementById('analysisResults');
        if (!container) return;

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
                                <div style="height: 100%; width: ${analysis.sentenceLength.distribution.reduce((s, d) => s + d.count, 0) > 0 ? (r.count * 100 / analysis.sentenceLength.distribution.reduce((s, d) => s + d.count, 0)) : 0}%; background: var(--accent-gold);"></div>
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

        if (typeof lucide !== 'undefined') lucide.createIcons();
    },

    /**
     * Rendu d'une scène dans un conteneur spécifique (preview).
     */
    renderSceneInContainer(act, chapter, scene, containerId) {
        const container = document.getElementById(containerId);
        if (!container || !scene || !act || !chapter) return;

        const wordCount = typeof getWordCount === 'function' ? getWordCount(scene.content || '') : 0;

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
            </div>`;
    }
};
