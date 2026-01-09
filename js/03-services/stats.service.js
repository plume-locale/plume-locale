/**
 * Stats Service
 * Calcule et met à jour les statistiques du projet
 */

const StatsService = (() => {
    'use strict';

    /**
     * Compte le nombre de mots dans un texte
     * @param {string} text - Texte à analyser
     * @returns {number} Nombre de mots
     */
    function getWordCount(text) {
        if (!text) return 0;
        // Supprimer les balises HTML si présentes
        const plainText = text.replace(/<[^>]*>/g, ' ');
        // Compter les mots (séparés par espaces)
        const words = plainText.trim().split(/\s+/);
        return words.filter(w => w.length > 0).length;
    }

    /**
     * Calcule les statistiques du projet
     * @param {Object} project - Projet à analyser
     * @returns {Object} Statistiques calculées
     */
    function calculateStats(project) {
        if (!project || !project.acts) {
            return {
                totalActs: 0,
                totalChapters: 0,
                totalScenes: 0,
                totalWords: 0,
                totalCharacters: 0,
                totalLocations: 0,
                totalNotes: 0
            };
        }

        const totalActs = project.acts.length;
        const totalChapters = project.acts.reduce((sum, act) =>
            sum + (act.chapters ? act.chapters.length : 0), 0);

        let totalScenes = 0;
        let totalWords = 0;

        project.acts.forEach(act => {
            if (!act.chapters) return;

            act.chapters.forEach(chapter => {
                if (!chapter.scenes) return;

                totalScenes += chapter.scenes.length;

                chapter.scenes.forEach(scene => {
                    totalWords += getWordCount(scene.content || '');
                });
            });
        });

        return {
            totalActs,
            totalChapters,
            totalScenes,
            totalWords,
            totalCharacters: project.characters ? project.characters.length : 0,
            totalLocations: project.world ? project.world.length : 0,
            totalNotes: project.notes ? project.notes.length : 0
        };
    }

    /**
     * Met à jour les statistiques affichées dans le header
     * @param {Object} project - Projet actuel
     */
    function updateHeaderStats(project) {
        const stats = calculateStats(project);

        // Mettre à jour les éléments du DOM
        const headerWords = document.getElementById('headerTotalWords');
        const headerChapters = document.getElementById('headerTotalChapters');
        const headerTitle = document.getElementById('headerProjectTitle');

        if (headerWords) {
            headerWords.textContent = `${stats.totalWords} mots`;
        }

        if (headerChapters) {
            headerChapters.textContent = `${stats.totalChapters} chapitres`;
        }

        if (headerTitle && project.title) {
            headerTitle.textContent = project.title;
        }
    }

    /**
     * S'abonne aux changements de projet pour mettre à jour les stats automatiquement
     */
    function init() {
        // S'abonner aux changements de projet dans StateManager
        if (window.StateManager) {
            StateManager.subscribe((state) => {
                if (state.project) {
                    updateHeaderStats(state.project);
                }
            });
        }
    }

    // API publique
    return {
        init,
        getWordCount,
        calculateStats,
        updateHeaderStats
    };
})();

// Auto-initialisation
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => StatsService.init());
} else {
    StatsService.init();
}
