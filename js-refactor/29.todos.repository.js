/**
 * [MVVM : Todos Repository]
 * Gestion de la persistance et de l'accès aux données des TODOs.
 * Implémente les opérations CRUD pour les TODOs liés aux scènes.
 */

const TodoRepository = {
    /**
     * Récupère tous les TODOs du projet (de toutes les scènes).
     * @returns {Array} Liste de tous les TODOs avec leurs références de localisation.
     */
    getAll() {
        const todos = [];
        if (!project || !project.acts) return todos;

        project.acts.forEach(act => {
            act.chapters.forEach(chapter => {
                chapter.scenes.forEach(scene => {
                    const annotations = this._getSceneAnnotations(scene);
                    annotations
                        .filter(a => a.type === 'todo')
                        .forEach(todo => {
                            todos.push({
                                ...todo,
                                actId: act.id,
                                actTitle: act.title,
                                chapterId: chapter.id,
                                chapterTitle: chapter.title,
                                sceneId: scene.id,
                                sceneTitle: scene.title
                            });
                        });
                });
            });
        });

        return todos;
    },

    /**
     * Récupère les TODOs d'une scène spécifique.
     * @param {number} actId - ID de l'acte.
     * @param {number} chapterId - ID du chapitre.
     * @param {number} sceneId - ID de la scène.
     * @returns {Array} Liste des TODOs de la scène.
     */
    getByScene(actId, chapterId, sceneId) {
        const scene = this._findScene(actId, chapterId, sceneId);
        if (!scene) return [];

        const annotations = this._getSceneAnnotations(scene);
        return annotations.filter(a => a.type === 'todo');
    },

    /**
     * Récupère un TODO par son ID dans une scène spécifique.
     * @param {number} actId - ID de l'acte.
     * @param {number} chapterId - ID du chapitre.
     * @param {number} sceneId - ID de la scène.
     * @param {number} todoId - ID du TODO.
     * @returns {Object|null} Le TODO trouvé ou null.
     */
    getById(actId, chapterId, sceneId, todoId) {
        const scene = this._findScene(actId, chapterId, sceneId);
        if (!scene) return null;

        const annotations = this._getSceneAnnotations(scene);
        return annotations.find(a => a.id === todoId && a.type === 'todo') || null;
    },

    /**
     * Ajoute un TODO à une scène.
     * @param {number} actId - ID de l'acte.
     * @param {number} chapterId - ID du chapitre.
     * @param {number} sceneId - ID de la scène.
     * @param {Object} todoData - Données du TODO à créer.
     * @returns {Object|null} Le TODO créé ou null en cas d'erreur.
     */
    add(actId, chapterId, sceneId, todoData) {
        const scene = this._findScene(actId, chapterId, sceneId);
        if (!scene) return null;

        const newTodo = TodoModel.create(todoData);
        const annotations = this._getSceneAnnotations(scene);
        annotations.push(newTodo);

        return newTodo;
    },

    /**
     * Met à jour un TODO existant.
     * @param {number} actId - ID de l'acte.
     * @param {number} chapterId - ID du chapitre.
     * @param {number} sceneId - ID de la scène.
     * @param {number} todoId - ID du TODO.
     * @param {Object} updates - Données à mettre à jour.
     * @returns {Object|null} Le TODO mis à jour ou null.
     */
    update(actId, chapterId, sceneId, todoId, updates) {
        const scene = this._findScene(actId, chapterId, sceneId);
        if (!scene) return null;

        const annotations = this._getSceneAnnotations(scene);
        const index = annotations.findIndex(a => a.id === todoId && a.type === 'todo');
        
        if (index === -1) return null;

        annotations[index] = {
            ...annotations[index],
            ...updates,
            id: annotations[index].id, // Préserver l'ID
            type: 'todo' // Préserver le type
        };

        return { ...annotations[index] };
    },

    /**
     * Bascule l'état completed d'un TODO.
     * @param {number} actId - ID de l'acte.
     * @param {number} chapterId - ID du chapitre.
     * @param {number} sceneId - ID de la scène.
     * @param {number} todoId - ID du TODO.
     * @returns {Object|null} Le TODO mis à jour ou null.
     */
    toggleComplete(actId, chapterId, sceneId, todoId) {
        const todo = this.getById(actId, chapterId, sceneId, todoId);
        if (!todo) return null;

        return this.update(actId, chapterId, sceneId, todoId, {
            completed: !todo.completed
        });
    },

    /**
     * Supprime un TODO.
     * @param {number} actId - ID de l'acte.
     * @param {number} chapterId - ID du chapitre.
     * @param {number} sceneId - ID de la scène.
     * @param {number} todoId - ID du TODO.
     * @returns {boolean} True si supprimé, false sinon.
     */
    remove(actId, chapterId, sceneId, todoId) {
        const scene = this._findScene(actId, chapterId, sceneId);
        if (!scene) return false;

        const annotations = this._getSceneAnnotations(scene);
        const initialLength = annotations.length;
        
        const filtered = annotations.filter(a => !(a.id === todoId && a.type === 'todo'));
        
        if (filtered.length < initialLength) {
            // Mettre à jour les annotations de la version active
            const activeVersion = this._getActiveVersion(scene);
            if (activeVersion) {
                activeVersion.annotations = filtered;
            } else {
                scene.annotations = filtered;
            }
            return true;
        }

        return false;
    },

    /**
     * Compte les TODOs d'une scène.
     * @param {number} actId - ID de l'acte.
     * @param {number} chapterId - ID du chapitre.
     * @param {number} sceneId - ID de la scène.
     * @param {boolean} pendingOnly - Ne compter que les TODOs non terminés.
     * @returns {number} Nombre de TODOs.
     */
    count(actId, chapterId, sceneId, pendingOnly = false) {
        const todos = this.getByScene(actId, chapterId, sceneId);
        if (pendingOnly) {
            return todos.filter(t => !t.completed).length;
        }
        return todos.length;
    },

    /**
     * Récupère les TODOs par statut.
     * @param {boolean} completed - Statut de complétion (true = terminés, false = en cours).
     * @returns {Array} Liste des TODOs filtrés.
     */
    getByStatus(completed) {
        const all = this.getAll();
        return all.filter(t => t.completed === completed);
    },

    // ============ Méthodes privées ============

    /**
     * Trouve une scène par ses IDs.
     * @private
     */
    _findScene(actId, chapterId, sceneId) {
        if (!project || !project.acts) return null;

        const act = project.acts.find(a => a.id === actId);
        if (!act) return null;

        const chapter = act.chapters.find(c => c.id === chapterId);
        if (!chapter) return null;

        return chapter.scenes.find(s => s.id === sceneId) || null;
    },

    /**
     * Récupère les annotations de la version active d'une scène.
     * @private
     */
    _getSceneAnnotations(scene) {
        // Utilise les fonctions globales de js/28.revision.js si disponibles
        if (typeof getVersionAnnotations === 'function') {
            return getVersionAnnotations(scene);
        }

        // Fallback: accès direct
        const activeVersion = this._getActiveVersion(scene);
        if (activeVersion) {
            if (!activeVersion.annotations) {
                activeVersion.annotations = [];
            }
            return activeVersion.annotations;
        }

        if (!scene.annotations) {
            scene.annotations = [];
        }
        return scene.annotations;
    },

    /**
     * Récupère la version active d'une scène.
     * @private
     */
    _getActiveVersion(scene) {
        if (!scene.versions || scene.versions.length === 0) {
            return null;
        }
        return scene.versions.find(v => v.isActive) || scene.versions[scene.versions.length - 1];
    }
};
