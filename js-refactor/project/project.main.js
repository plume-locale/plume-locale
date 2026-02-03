/**
 * [MVVM : Project Main]
 * Point d'entrée pour le module projet.
 */

(async function () {
    // Attendre que la DB soit initialisée si nécessaire (géré par 04.init.js normalement)
    // Mais on peut init le ViewModel ici
    await ProjectViewModel.init();
    ProjectHandlers.init();

    console.log('🚀 Module Projet initialisé');
})();

// Fonction de chargement initiale (appelée par l'app)
async function loadAllProjects() {
    await ProjectViewModel.init();
}
