/**
 * [MVVM : Todos Module]
 * Module de gestion des TODOs - Architecture MVVM strict avec CRUD.
 * 
 * Structure:
 * - Model: TodoModel (structure des données)
 * - Repository: TodoRepository (opérations CRUD)
 * - ViewModel: Fonctions *ViewModel (logique métier)
 * - View: Fonctions render*, toggle*, close*, handle* (interface utilisateur)
 * 
 * Ce fichier est divisé en 4 fichiers séparés pour une meilleure maintenabilité:
 * - 29.todos.model.js
 * - 29.todos.repository.js
 * - 29.todos.viewmodel.js
 * - 29.todos.view.js
 */

// ============================================
// INCLUSION DES MODULES MVVM
// ============================================

// Les modules sont chargés séparément via les fichiers:
// - 29.todos.model.js      : Définition de la structure des données
// - 29.todos.repository.js : Opérations CRUD sur les TODOs
// - 29.todos.viewmodel.js  : Logique métier et coordination
// - 29.todos.view.js       : Rendu et gestion des événements

// ============================================
// COMPATIBILITÉ - FONCTIONS OBSOLÈTES (DEPRECATED)
// ============================================
// Ces fonctions sont conservées pour la compatibilité avec le code existant
// mais délèguent maintenant aux nouvelles fonctions MVVM.

/**
 * @deprecated Utilisez goToTodoSceneViewModel + processTodoSideEffects
 * [MVVM : Compatibility]
 * Ouvre une scène spécifique et ferme le panneau.
 */
function goToTodoScene(actId, chapterId, sceneId) {
    const viewModel = navigateToTodoSceneViewModel(actId, chapterId, sceneId);
    processTodoSideEffects(viewModel);
}

/**
 * @deprecated Utilisez toggleTodoViewModel + processTodoSideEffects
 * [MVVM : Compatibility]
 * Bascule l'état d'un TODO depuis le panneau.
 */
function toggleTodoFromPanel(actId, chapterId, sceneId, todoId) {
    const result = toggleTodoViewModel(actId, chapterId, sceneId, todoId);
    processTodoSideEffects(result);
}

/**
 * @deprecated Utilisez toggleTodoViewModel + processTodoSideEffects
 * [MVVM : Compatibility]
 * Bascule l'état d'un TODO depuis la liste.
 */
function toggleTodoFromList(todoId, actId, chapterId, sceneId) {
    const result = toggleTodoViewModel(actId, chapterId, sceneId, todoId);
    
    if (result.success) {
        saveProject();
        renderTodosList();
        if (typeof renderActsList === 'function') {
            renderActsList();
        }
    }
}

/**
 * @deprecated Utilisez navigateToTodoSceneViewModel + processTodoSideEffects
 * [MVVM : Compatibility]
 * Change la vue et ouvre la scène correspondante à un TODO.
 */
function openSceneFromTodo(actId, chapterId, sceneId) {
    const viewModel = navigateToTodoSceneViewModel(actId, chapterId, sceneId);
    processTodoSideEffects(viewModel);
}

/**
 * @deprecated Utilisez getSceneTodosStatsViewModel
 * [MVVM : Compatibility]
 * Retourne le nombre total d'annotations pour une scène.
 */
function getSceneAnnotationCount(scene) {
    const annotations = getVersionAnnotations(scene);
    return annotations.length;
}

/**
 * @deprecated Utilisez getSceneTodosStatsViewModel
 * [MVVM : Compatibility]
 * Retourne le nombre de TODOs non terminés pour une scène.
 */
function getSceneTodoCount(scene) {
    const annotations = getVersionAnnotations(scene);
    return annotations.filter(a => a.type === 'todo' && !a.completed).length;
}

/**
 * @deprecated Utilisez ensureTodosStructureViewModel
 * [MVVM : Compatibility]
 * Initialise les annotations dans les scènes existantes (migration vers versions).
 */
function ensureAnnotationsStructure() {
    const result = ensureTodosStructureViewModel();
    if (result.migrated) {
        saveProject();
        console.log('Migration des annotations vers les versions effectuée');
    }
}

// ============================================
// EXTENSIONS DU SYSTÈME EXISTANT
// ============================================

/**
 * [MVVM : View Extension]
 * Extension du rendu de l'éditeur pour ajouter le bouton révision.
 */
(function extendRenderEditor() {
    if (typeof renderEditor !== 'function') return;
    
    const originalRenderEditor = renderEditor;
    window.renderEditor = function(act, chapter, scene) {
        originalRenderEditor(act, chapter, scene);

        // Ajouter le bouton révision dans la toolbar si pas déjà en mode révision
        if (typeof revisionMode !== 'undefined' && !revisionMode) {
            const toolbar = document.getElementById('editorToolbar');
            if (toolbar && !toolbar.querySelector('[onclick*="toggleRevisionMode"]')) {
                const revisionGroup = document.createElement('div');
                revisionGroup.className = 'toolbar-group';
                revisionGroup.innerHTML = `
                    <button class="toolbar-btn" onclick="toggleRevisionMode()" title="Mode Révision (Ctrl+R)">
                        <i data-lucide="pencil" style="width:14px;height:14px;vertical-align:middle;margin-right:4px;"></i>
                        RÉVISION
                    </button>
                `;
                try {
                    toolbar.appendChild(revisionGroup);
                } catch (e) {
                    console.error('Erreur appendChild toolbar:', e);
                }
            }
        }

        // Rafraîchir les icônes Lucide après le rendu
        setTimeout(() => {
            if (typeof lucide !== 'undefined') lucide.createIcons();
            // Réattacher les event listeners sur les marqueurs d'annotation
            if (typeof reattachAnnotationMarkerListeners === 'function') {
                reattachAnnotationMarkerListeners();
            }
        }, 10);
    };
})();

/**
 * [MVVM : View Extension]
 * Extension du rendu de la liste des actes pour afficher les badges de TODOs.
 */
(function extendRenderActsList() {
    if (typeof renderActsList !== 'function') return;
    
    const originalRenderActsList = renderActsList;
    window.renderActsList = function() {
        originalRenderActsList();

        // Ajouter les badges d'annotations aux scènes
        if (project && project.acts) {
            project.acts.forEach(act => {
                act.chapters.forEach(chapter => {
                    chapter.scenes.forEach(scene => {
                        const sceneElement = document.querySelector(`[data-scene-id="${scene.id}"]`);
                        if (!sceneElement) return;

                        const annotations = getVersionAnnotations(scene);
                        if (annotations.length === 0) return;

                        const annotCount = annotations.length;
                        const todoCount = annotations.filter(a => a.type === 'todo' && !a.completed).length;

                        let badgeHTML = `<span class="scene-badge">${annotCount}</span>`;
                        if (todoCount > 0) {
                            badgeHTML += `<span class="scene-badge" style="background: var(--accent-red);">✓${todoCount}</span>`;
                        }

                        const textSpan = sceneElement.querySelector('div > span:not(.drag-handle)');
                        if (textSpan && !textSpan.querySelector('.scene-badge')) {
                            textSpan.innerHTML += badgeHTML;
                        }
                    });
                });
            });
        }
    };
})();

/**
 * [MVVM : View Extension]
 * Extension du rendu du panneau d'annotations pour ajuster sa position.
 */
(function extendRenderAnnotationsPanel() {
    if (typeof renderAnnotationsPanel !== 'function') return;
    
    const originalRenderAnnotationsPanel = renderAnnotationsPanel;
    window.renderAnnotationsPanel = function() {
        originalRenderAnnotationsPanel();
        setTimeout(updateAnnotationsPanelPosition, 50);
    };
})();

/**
 * [MVVM : ViewModel Extension]
 * Extension de l'initialisation pour migrer les annotations.
 */
(function extendInit() {
    // Attendre que le DOM soit prêt
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', runMigration);
    } else {
        runMigration();
    }
    
    function runMigration() {
        // La migration sera effectuée lors du premier chargement du projet
        const originalLoadProject = window.loadProject;
        if (originalLoadProject) {
            window.loadProject = function() {
                originalLoadProject();
                const result = ensureTodosStructureViewModel();
                if (result.migrated) {
                    saveProject();
                    console.log('Migration des annotations vers les versions effectuée');
                }
            };
        }
    }
})();

// ============================================
// NOTES DE MIGRATION
// ============================================

/**
 * Pour utiliser la nouvelle architecture MVVM:
 * 
 * 1. Inclure les fichiers dans l'ordre dans votre HTML:
 *    <script src="js-refactor/29.todos.model.js"></script>
 *    <script src="js-refactor/29.todos.repository.js"></script>
 *    <script src="js-refactor/29.todos.viewmodel.js"></script>
 *    <script src="js-refactor/29.todos.view.js"></script>
 *    <script src="js-refactor/29.todos.refactor.js"></script>
 * 
 * 2. Les fonctions publiques restent les mêmes:
 *    - toggleTodosPanel()
 *    - closeTodosPanel()
 *    - renderTodosPanel()
 *    - renderTodosList()
 * 
 * 3. Les fonctions obsolètes fonctionnent toujours mais délèguent aux nouvelles.
 */
