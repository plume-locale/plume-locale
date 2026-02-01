/**
 * [MVVM : Todos ViewModel]
 * Logique métier et préparation des données pour l'interface des TODOs.
 * Coordonne les interactions entre le Repository et la View.
 */

/**
 * [MVVM : Purpose]
 * Centraliser la logique de manipulation des TODOs et isoler la Vue des détails du Repository.
 */

// ============================================
// VIEWMODEL - GESTION DU PANNEAU TODOS
// ============================================

/**
 * [MVVM : ViewModel]
 * Récupère les données pour le rendu du panneau TODOs.
 * @returns {Object} Données structurées pour la view.
 */
function getTodosPanelViewModel() {
    const allTodos = TodoRepository.getAll();
    const pendingTodos = allTodos.filter(t => !t.completed);
    const completedTodos = allTodos.filter(t => t.completed);

    return {
        totalCount: allTodos.length,
        pendingCount: pendingTodos.length,
        completedCount: completedTodos.length,
        pendingTodos: pendingTodos,
        completedTodos: completedTodos,
        hasTodos: allTodos.length > 0
    };
}

/**
 * [MVVM : ViewModel]
 * Récupère les données pour la liste complète des TODOs.
 * @returns {Object} Données structurées pour la view.
 */
function getTodosListViewModel() {
    const allTodos = TodoRepository.getAll();
    
    // Trier: non terminés d'abord
    const sortedTodos = [...allTodos].sort((a, b) => {
        if (a.completed === b.completed) return 0;
        return a.completed ? 1 : -1;
    });

    return {
        todos: sortedTodos,
        totalCount: allTodos.length,
        activeCount: allTodos.filter(t => !t.completed).length,
        hasTodos: allTodos.length > 0
    };
}

/**
 * [MVVM : ViewModel]
 * Récupère les statistiques des TODOs pour une scène.
 * @param {number} actId - ID de l'acte.
 * @param {number} chapterId - ID du chapitre.
 * @param {number} sceneId - ID de la scène.
 * @returns {Object} Statistiques des TODOs.
 */
function getSceneTodosStatsViewModel(actId, chapterId, sceneId) {
    const todos = TodoRepository.getByScene(actId, chapterId, sceneId);
    
    return {
        totalCount: todos.length,
        pendingCount: todos.filter(t => !t.completed).length,
        completedCount: todos.filter(t => t.completed).length,
        hasTodos: todos.length > 0
    };
}

// ============================================
// VIEWMODEL - OPÉRATIONS CRUD
// ============================================

/**
 * [MVVM : ViewModel]
 * Bascule l'état d'un TODO et retourne le résultat.
 * @param {number} actId - ID de l'acte.
 * @param {number} chapterId - ID du chapitre.
 * @param {number} sceneId - ID de la scène.
 * @param {number} todoId - ID du TODO.
 * @returns {Object} Résultat de l'opération avec side effects.
 */
function toggleTodoViewModel(actId, chapterId, sceneId, todoId) {
    const updatedTodo = TodoRepository.toggleComplete(actId, chapterId, sceneId, todoId);
    
    if (!updatedTodo) {
        return {
            success: false,
            message: 'TODO introuvable'
        };
    }

    return {
        success: true,
        todo: updatedTodo,
        sideEffects: {
            shouldSave: true,
            shouldRefreshPanel: true,
            shouldRefreshActsList: true,
            shouldUpdateAnnotationsButton: false
        }
    };
}

/**
 * [MVVM : ViewModel]
 * Supprime un TODO.
 * @param {number} actId - ID de l'acte.
 * @param {number} chapterId - ID du chapitre.
 * @param {number} sceneId - ID de la scène.
 * @param {number} todoId - ID du TODO.
 * @returns {Object} Résultat de l'opération.
 */
function deleteTodoViewModel(actId, chapterId, sceneId, todoId) {
    const deleted = TodoRepository.remove(actId, chapterId, sceneId, todoId);
    
    if (!deleted) {
        return {
            success: false,
            message: 'TODO introuvable'
        };
    }

    return {
        success: true,
        sideEffects: {
            shouldSave: true,
            shouldRefreshPanel: true,
            shouldRefreshActsList: true
        }
    };
}

/**
 * [MVVM : ViewModel]
 * Met à jour le texte d'un TODO.
 * @param {number} actId - ID de l'acte.
 * @param {number} chapterId - ID du chapitre.
 * @param {number} sceneId - ID de la scène.
 * @param {number} todoId - ID du TODO.
 * @param {string} newText - Nouveau texte.
 * @returns {Object} Résultat de l'opération.
 */
function updateTodoTextViewModel(actId, chapterId, sceneId, todoId, newText) {
    if (!newText || newText.trim() === '') {
        return {
            success: false,
            message: 'Le texte ne peut pas être vide'
        };
    }

    const updatedTodo = TodoRepository.update(actId, chapterId, sceneId, todoId, {
        text: newText.trim()
    });

    if (!updatedTodo) {
        return {
            success: false,
            message: 'TODO introuvable'
        };
    }

    return {
        success: true,
        todo: updatedTodo,
        sideEffects: {
            shouldSave: true,
            shouldRefreshPanel: true
        }
    };
}

// ============================================
// VIEWMODEL - NAVIGATION
// ============================================

/**
 * [MVVM : ViewModel]
 * Prépare la navigation vers une scène contenant un TODO.
 * @param {number} actId - ID de l'acte.
 * @param {number} chapterId - ID du chapitre.
 * @param {number} sceneId - ID de la scène.
 * @returns {Object} Données pour la navigation.
 */
function navigateToTodoSceneViewModel(actId, chapterId, sceneId) {
    return {
        actId,
        chapterId,
        sceneId,
        sideEffects: {
            shouldOpenScene: true,
            shouldCloseTodosPanel: true,
            shouldSwitchToEditorView: true
        }
    };
}

// ============================================
// VIEWMODEL - SIDE EFFECTS PROCESSOR
// ============================================

/**
 * [MVVM : ViewModel]
 * Traite les side effects retournés par les opérations ViewModel.
 * @param {Object} result - Résultat d'une opération ViewModel.
 */
function processTodoSideEffects(result) {
    if (!result || !result.sideEffects) return;

    const effects = result.sideEffects;

    if (effects.shouldSave) {
        saveProject();
    }

    if (effects.shouldRefreshPanel) {
        renderTodosPanel();
    }

    if (effects.shouldRefreshTodosList) {
        renderTodosList();
    }

    if (effects.shouldRefreshActsList && typeof renderActsList === 'function') {
        renderActsList();
    }

    if (effects.shouldUpdateAnnotationsButton && typeof updateAnnotationsButton === 'function') {
        updateAnnotationsButton(false);
    }

    if (effects.shouldCloseTodosPanel) {
        closeTodosPanel();
    }

    if (effects.shouldOpenScene && result.actId && result.chapterId && result.sceneId) {
        if (typeof openScene === 'function') {
            openScene(result.actId, result.chapterId, result.sceneId);
        }
    }

    if (effects.shouldSwitchToEditorView && typeof switchView === 'function') {
        switchView('editor');
    }
}

// ============================================
// VIEWMODEL - MIGRATION
// ============================================

/**
 * [MVVM : ViewModel]
 * Assure la migration des annotations TODOs vers le système de versions.
 * @returns {Object} Résultat de la migration.
 */
function ensureTodosStructureViewModel() {
    let needsSave = false;

    if (!project || !project.acts) {
        return { migrated: false, message: 'Projet non initialisé' };
    }

    project.acts.forEach(act => {
        act.chapters.forEach(chapter => {
            chapter.scenes.forEach(scene => {
                // Utilise la fonction globale de migration si disponible
                if (typeof migrateSceneAnnotationsToVersion === 'function') {
                    if (migrateSceneAnnotationsToVersion(scene)) {
                        needsSave = true;
                    }
                }
            });
        });
    });

    return {
        migrated: needsSave,
        message: needsSave ? 'Migration effectuée' : 'Aucune migration nécessaire'
    };
}
