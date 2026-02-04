/**
 * @file tension.viewmodel.js
 * @description ViewModel pour la gestion de la logique métier du module de tension.
 */

const TensionViewModel = {
    /**
     * Ajoute un mot de tension.
     * @param {string} type - Le type de tension ('high', 'medium', 'low').
     * @param {string} rawWord - Le mot à ajouter.
     * @returns {Object} Résultat de l'opération { success: boolean, message: string }.
     */
    addWord: function (type, rawWord) {
        const word = rawWord.trim().toLowerCase();

        if (!word) {
            return { success: false, message: '⚠️ Veuillez entrer un mot' };
        }

        const words = TensionRepository.getTensionWords();

        // Vérifier si le mot existe déjà dans la catégorie
        if (words[type].includes(word)) {
            return { success: false, message: '⚠️ Ce mot existe déjà dans cette catégorie' };
        }

        // Vérifier si le mot existe dans une autre catégorie
        for (const category in words) {
            if (category !== type && words[category].includes(word)) {
                const categoryName = category === 'high' ? 'haute' : category === 'medium' ? 'moyenne' : 'faible';
                return { success: false, message: `⚠️ Ce mot existe déjà dans la catégorie "${categoryName} tension"` };
            }
        }

        // Ajouter le mot
        words[type].push(word);
        TensionRepository.saveTensionWords(words);

        return { success: true, message: `✓ Mot "${word}" ajouté` };
    },

    /**
     * Supprime un mot de tension.
     * @param {string} type - Le type de tension.
     * @param {number} index - L'index du mot à supprimer.
     * @returns {Object} Résultat { success: boolean, message: string }.
     */
    removeWord: function (type, index) {
        const words = TensionRepository.getTensionWords();
        if (!words[type] || !words[type][index]) {
            return { success: false, message: 'Erreur: Mot introuvable' };
        }

        const removedWord = words[type][index];
        words[type].splice(index, 1);
        TensionRepository.saveTensionWords(words);

        return { success: true, message: `✓ Mot "${removedWord}" supprimé` };
    },

    /**
     * Réinitialise les mots de tension aux valeurs par défaut.
     */
    resetToDefault: function () {
        TensionRepository.saveTensionWords(TensionModel.DEFAULT_TENSION_WORDS);
        return { success: true, message: '✓ Mots de tension réinitialisés aux valeurs par défaut' };
    },

    /**
     * Prépare les données pour l'export.
     */
    prepareExport: function () {
        const words = TensionRepository.getTensionWords();
        const highWords = words.high.join('\n');
        const mediumWords = words.medium.join('\n');
        const lowWords = words.low.join('\n');

        const content = `=== DICTIONNAIRES DE MOTS DE TENSION ===
Exporté le ${new Date().toLocaleString('fr-FR')}

=== HAUTE TENSION (${words.high.length} mots) ===
${highWords}

=== TENSION MOYENNE (${words.medium.length} mots) ===
${mediumWords}

=== FAIBLE TENSION (${words.low.length} mots) ===
${lowWords}
`;
        const filename = `dictionnaires-tension-${new Date().toISOString().slice(0, 10)}.txt`;
        return { content, filename };
    },

    /**
     * Importe des mots depuis un texte.
     * @param {string} text - Le texte à parser.
     * @param {string} type - Le type de tension cible.
     * @param {string} mode - 'replace' ou 'add'.
     * @returns {Object} Résultat de l'import.
     */
    importWordsFromText: function (text, type, mode) {
        let words = [];

        // Séparer par retours à la ligne ET par virgules
        const lines = text.split(/\r?\n/);
        lines.forEach(line => {
            const wordsInLine = line.split(',');
            wordsInLine.forEach(word => {
                const cleaned = word.trim().toLowerCase();
                if (cleaned && cleaned.length > 0) {
                    words.push(cleaned);
                }
            });
        });

        // Supprimer les doublons
        words = [...new Set(words)];

        if (words.length === 0) {
            return { success: false, message: '⚠️ Aucun mot valide trouvé' };
        }

        const tensionWords = TensionRepository.getTensionWords();

        if (mode === 'replace') {
            tensionWords[type] = words;
            TensionRepository.saveTensionWords(tensionWords);
            return { success: true, message: `✓ ${words.length} mots importés (remplacement)` };
        } else {
            const existingWords = new Set(tensionWords[type]);
            let addedCount = 0;

            words.forEach(word => {
                if (!existingWords.has(word)) {
                    tensionWords[type].push(word);
                    addedCount++;
                }
            });

            TensionRepository.saveTensionWords(tensionWords);

            const skippedCount = words.length - addedCount;
            if (addedCount > 0) {
                return { success: true, message: `✓ ${addedCount} mot(s) ajouté(s)${skippedCount > 0 ? ` (${skippedCount} doublon(s) ignoré(s))` : ''}` };
            } else {
                return { success: false, message: `⚠️ Tous les mots existent déjà (${skippedCount} doublon(s))` };
            }
        }
    },

    /**
     * Calcule le score de tension pour le texte donné via le modèle.
     */
    calculateTension: function (text, context) {
        const words = TensionRepository.getTensionWords();
        return TensionModel.calculateLiveTension(text, words, context);
    }
};
