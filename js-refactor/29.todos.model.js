/**
 * [MVVM : Todos Model]
 * Définition de la structure de données et usines pour les TODOs.
 */

const TodoModel = {
    /**
     * Crée un nouvel objet TODO avec les valeurs par défaut.
     * @param {Object} data - Données initiales pour le TODO.
     * @returns {Object} Un nouvel objet TODO.
     */
    create(data = {}) {
        const now = Date.now();
        return {
            id: data.id || now,
            type: 'todo',
            text: data.text || '',
            context: data.context || '',
            completed: data.completed !== undefined ? data.completed : false,
            createdAt: data.createdAt || new Date(now).toISOString(),
            // Références de localisation
            actId: data.actId || null,
            chapterId: data.chapterId || null,
            sceneId: data.sceneId || null,
            // Titres pour l'affichage
            actTitle: data.actTitle || '',
            chapterTitle: data.chapterTitle || '',
            sceneTitle: data.sceneTitle || ''
        };
    },

    /**
     * Migre un ancien objet TODO vers la nouvelle structure.
     * @param {Object} raw - Données brutes du TODO.
     * @returns {Object} TODO migré.
     */
    migrate(raw) {
        if (!raw) return null;
        return this.create(raw);
    },

    /**
     * Vérifie si un TODO est valide.
     * @param {Object} todo - Le TODO à valider.
     * @returns {boolean} True si valide, false sinon.
     */
    isValid(todo) {
        return todo && 
               typeof todo.id === 'number' && 
               typeof todo.text === 'string' && 
               todo.text.trim().length > 0;
    },

    /**
     * Crée une copie d'un TODO.
     * @param {Object} todo - Le TODO à cloner.
     * @returns {Object} Une copie du TODO.
     */
    clone(todo) {
        if (!todo) return null;
        return { ...todo };
    }
};
