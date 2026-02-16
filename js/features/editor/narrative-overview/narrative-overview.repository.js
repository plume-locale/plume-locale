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

                chapter.scenes.forEach(scene => {
                    const scenePassages = this.extractScenePassages(
                        scene,
                        act,
                        chapter,
                        globalPosition
                    );
                    passages.push(...scenePassages);
                    globalPosition += scenePassages.length;
                });
            });
        });

        return passages;
    },

    /**
     * Extrait les passages d'une scène spécifique
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

        // Extraire les structure blocks
        const structureBlocks = tempDiv.querySelectorAll('.structure-block');
        structureBlocks.forEach((block, index) => {
            const labelEl = block.querySelector('.structure-block-label');
            const label = labelEl ? labelEl.textContent.trim() : 'SCENE BEAT';

            const color = block.style.getPropertyValue('--accent-color') || '#ff8c42';

            const contentEl = block.querySelector('.structure-block-content');
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
        });

        // Extraire passages réguliers (texte hors structure blocks)
        const regularPassages = this.extractRegularPassages(tempDiv, act, chapter, scene);
        regularPassages.forEach((passageData, index) => {
            passages.push(NarrativeOverviewModel.createPassage(
                NarrativeOverviewModel.PASSAGE_TYPES.REGULAR,
                {
                    ...passageData,
                    position: startPosition + passages.length
                }
            ));
        });

        // Trier par ordre d'apparition dans le DOM
        // (pour l'instant, structure blocks d'abord, puis regular - peut être amélioré)
        return passages;
    },

    /**
     * Extrait les passages réguliers (texte hors structure blocks)
     *
     * @param {HTMLElement} contentDiv - Conteneur HTML de la scène
     * @param {Object} act - Objet acte
     * @param {Object} chapter - Objet chapitre
     * @param {Object} scene - Objet scène
     * @returns {Array} Liste de données de passages réguliers
     */
    extractRegularPassages(contentDiv, act, chapter, scene) {
        const passages = [];

        // Supprimer temporairement les structure blocks pour ne pas les compter
        const clonedDiv = contentDiv.cloneNode(true);
        const blocksToRemove = clonedDiv.querySelectorAll('.structure-block');
        blocksToRemove.forEach(block => block.remove());

        // Récupérer tous les éléments de type paragraphe ou div avec du texte
        const textElements = clonedDiv.querySelectorAll('p, div');

        textElements.forEach(element => {
            const text = element.textContent.trim();

            // Ignorer les éléments vides ou trop courts
            if (text.length < 20) return;

            // Vérifier que ce n'est pas un élément système (séparateurs, etc.)
            if (element.classList.contains('scene-separator') ||
                element.classList.contains('chapter-separator') ||
                element.classList.contains('editor-act-separator')) {
                return;
            }

            passages.push({
                actId: act.id,
                actTitle: act.title,
                chapterId: chapter.id,
                chapterTitle: chapter.title,
                sceneId: scene.id,
                sceneTitle: scene.title,
                content: this.generatePreview(text),
                fullContent: text,
                wordCount: this.countWords(text)
            });
        });

        // Si aucun élément structuré trouvé, extraire le texte brut
        if (passages.length === 0 && clonedDiv.textContent.trim().length > 20) {
            const text = clonedDiv.textContent.trim();
            passages.push({
                actId: act.id,
                actTitle: act.title,
                chapterId: chapter.id,
                chapterTitle: chapter.title,
                sceneId: scene.id,
                sceneTitle: scene.title,
                content: this.generatePreview(text),
                fullContent: text,
                wordCount: this.countWords(text)
            });
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
