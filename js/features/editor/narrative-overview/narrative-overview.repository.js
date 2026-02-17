/**
 * [MVVM : Repository]
 * Narrative Overview - Data extraction from project
 *
 * Extrait tous les passages du projet (livre entier).
 * Parse le contenu HTML de chaque scène pour identifier :
 * - Les blocs de structure (.structure-block)
 * - Le texte régulier (hors blocs de structure)
 */

const NarrativeOverviewRepository = {

    /**
     * Extrait tous les passages de tout le livre
     *
     * @returns {Array} Liste de tous les passages en ordre chronologique
     */
    extractAllPassages() {
        if (typeof project === 'undefined' || !project || !project.acts) {
            console.warn('[NarrativeOverviewRepository] Project not loaded');
            return [];
        }

        const passages = [];
        let globalPosition = 0;

        project.acts.forEach(act => {
            if (!act.chapters || !Array.isArray(act.chapters)) return;

            act.chapters.forEach(chapter => {
                if (!chapter.scenes || !Array.isArray(chapter.scenes)) return;

                // Accumulateur pour les scènes consécutives sans structure block
                let regularAccumulator = null;

                chapter.scenes.forEach(scene => {
                    const hasStructureBlocks = this.sceneHasStructureBlocks(scene);

                    if (hasStructureBlocks) {
                        // Flush l'accumulateur de scènes régulières avant
                        if (regularAccumulator) {
                            passages.push(NarrativeOverviewModel.createPassage(
                                NarrativeOverviewModel.PASSAGE_TYPES.REGULAR,
                                {
                                    ...regularAccumulator,
                                    position: globalPosition
                                }
                            ));
                            globalPosition++;
                            regularAccumulator = null;
                        }

                        // Extraire les structure blocks de cette scène
                        const scenePassages = this.extractScenePassages(
                            scene,
                            act,
                            chapter,
                            globalPosition
                        );
                        passages.push(...scenePassages);
                        globalPosition += scenePassages.length;
                    } else {
                        // Scène sans structure block : accumuler
                        const sceneText = this.extractPlainText(scene);
                        if (sceneText.length < 20) return;

                        if (!regularAccumulator) {
                            // Démarrer un nouveau bloc régulier
                            regularAccumulator = {
                                actId: act.id,
                                actTitle: act.title,
                                chapterId: chapter.id,
                                chapterTitle: chapter.title,
                                sceneId: scene.id,
                                sceneTitle: scene.title,
                                content: this.generatePreview(sceneText),
                                fullContent: sceneText,
                                wordCount: this.countWords(sceneText)
                            };
                        } else {
                            // Fusionner avec le bloc régulier existant
                            regularAccumulator.fullContent += '\n\n' + sceneText;
                            regularAccumulator.content = this.generatePreview(regularAccumulator.fullContent);
                            regularAccumulator.wordCount += this.countWords(sceneText);
                            // Mettre à jour le titre pour refléter la plage
                            regularAccumulator.sceneTitle = regularAccumulator.sceneTitle + ' → ' + scene.title;
                        }
                    }
                });

                // Flush l'accumulateur restant en fin de chapitre
                if (regularAccumulator) {
                    passages.push(NarrativeOverviewModel.createPassage(
                        NarrativeOverviewModel.PASSAGE_TYPES.REGULAR,
                        {
                            ...regularAccumulator,
                            position: globalPosition
                        }
                    ));
                    globalPosition++;
                    regularAccumulator = null;
                }
            });
        });

        return passages;
    },

    /**
     * Vérifie si une scène contient des structure blocks
     *
     * @param {Object} scene - Objet scène
     * @returns {boolean} True si la scène contient au moins un structure block
     */
    sceneHasStructureBlocks(scene) {
        if (!scene.content || scene.content.trim() === '') return false;

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = scene.content;
        return tempDiv.querySelectorAll('.structure-block').length > 0;
    },

    /**
     * Extrait le texte brut d'une scène (hors structure blocks)
     *
     * @param {Object} scene - Objet scène
     * @returns {string} Texte brut de la scène
     */
    extractPlainText(scene) {
        if (!scene.content || scene.content.trim() === '') return '';

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = scene.content;

        // Retirer les structure blocks
        const blocks = tempDiv.querySelectorAll('.structure-block');
        blocks.forEach(block => block.remove());

        return tempDiv.textContent.trim();
    },

    /**
     * Extrait les passages d'une scène (structure blocks + texte intercalé).
     * Les scènes sans structure blocks sont gérées par l'accumulateur dans extractAllPassages().
     *
     * @param {Object} scene - Objet scène
     * @param {Object} act - Objet acte parent
     * @param {Object} chapter - Objet chapitre parent
     * @param {number} startPosition - Position de départ pour cette scène
     * @returns {Array} Liste des passages de cette scène
     */
    extractScenePassages(scene, act, chapter, startPosition) {
        if (!scene.content || scene.content.trim() === '') {
            return [];
        }

        const passages = [];
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = scene.content;

        // Parcourir les enfants directs dans l'ordre du DOM
        // pour intercaler structure blocks et texte régulier
        const children = Array.from(tempDiv.children);
        let regularTextBuffer = '';

        children.forEach(child => {
            if (child.classList && child.classList.contains('structure-block')) {
                // Flush le texte régulier accumulé avant ce structure block
                if (regularTextBuffer.trim().length >= 20) {
                    passages.push(NarrativeOverviewModel.createPassage(
                        NarrativeOverviewModel.PASSAGE_TYPES.REGULAR,
                        {
                            actId: act.id,
                            actTitle: act.title,
                            chapterId: chapter.id,
                            chapterTitle: chapter.title,
                            sceneId: scene.id,
                            sceneTitle: scene.title,
                            content: this.generatePreview(regularTextBuffer.trim()),
                            fullContent: regularTextBuffer.trim(),
                            position: startPosition + passages.length,
                            wordCount: this.countWords(regularTextBuffer.trim())
                        }
                    ));
                    regularTextBuffer = '';
                }

                // Extraire le structure block
                const labelEl = child.querySelector('.structure-block-label');
                const label = labelEl ? labelEl.textContent.trim() : 'SCENE BEAT';
                const color = child.style.getPropertyValue('--accent-color') || '#ff8c42';
                const contentEl = child.querySelector('.structure-block-content');
                const fullContent = contentEl ? contentEl.textContent.trim() : '';
                const preview = this.generatePreview(fullContent);

                passages.push(NarrativeOverviewModel.createPassage(
                    NarrativeOverviewModel.PASSAGE_TYPES.STRUCTURE_BLOCK,
                    {
                        actId: act.id,
                        actTitle: act.title,
                        chapterId: chapter.id,
                        chapterTitle: chapter.title,
                        sceneId: scene.id,
                        sceneTitle: scene.title,
                        content: preview,
                        fullContent: fullContent,
                        label: label,
                        color: color,
                        position: startPosition + passages.length,
                        wordCount: this.countWords(fullContent)
                    }
                ));
            } else {
                // Élément régulier : accumuler le texte
                const text = child.textContent.trim();
                if (text.length > 0 &&
                    !(child.classList && (
                        child.classList.contains('scene-separator') ||
                        child.classList.contains('chapter-separator') ||
                        child.classList.contains('editor-act-separator')
                    ))) {
                    regularTextBuffer += (regularTextBuffer ? '\n' : '') + text;
                }
            }
        });

        // Flush le texte régulier restant après le dernier structure block
        if (regularTextBuffer.trim().length >= 20) {
            passages.push(NarrativeOverviewModel.createPassage(
                NarrativeOverviewModel.PASSAGE_TYPES.REGULAR,
                {
                    actId: act.id,
                    actTitle: act.title,
                    chapterId: chapter.id,
                    chapterTitle: chapter.title,
                    sceneId: scene.id,
                    sceneTitle: scene.title,
                    content: this.generatePreview(regularTextBuffer.trim()),
                    fullContent: regularTextBuffer.trim(),
                    position: startPosition + passages.length,
                    wordCount: this.countWords(regularTextBuffer.trim())
                }
            ));
        }

        return passages;
    },


    /**
     * Génère un aperçu de texte (premiers N caractères)
     *
     * @param {string} text - Texte complet
     * @param {number} maxLength - Longueur maximale de l'aperçu
     * @returns {string} Aperçu tronqué avec ellipse si nécessaire
     */
    generatePreview(text, maxLength = 80) {
        if (!text) return '';

        const cleaned = text.trim();
        if (cleaned.length <= maxLength) return cleaned;

        return cleaned.substring(0, maxLength).trim() + '...';
    },

    /**
     * Compte les mots dans un texte
     *
     * @param {string} text - Texte à analyser
     * @returns {number} Nombre de mots
     */
    countWords(text) {
        if (!text) return 0;

        // Utilise l'expression régulière Unicode pour détecter les mots
        // Supporte les caractères accentués et non-latins
        const matches = text.match(/[\p{L}]+/gu);
        return matches ? matches.length : 0;
    },

    /**
     * Récupère un passage par son ID
     *
     * @param {string} passageId - ID du passage
     * @param {Array} passages - Liste de passages (optionnel, sinon recharge)
     * @returns {Object|null} Passage trouvé ou null
     */
    getPassageById(passageId, passages = null) {
        const allPassages = passages || this.extractAllPassages();
        return allPassages.find(p => p.id === passageId) || null;
    }
};
