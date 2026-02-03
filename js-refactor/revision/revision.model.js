/*
 * REVISION MODULE - MODEL
 * Defines the data structure for annotations.
 */

const RevisionModel = {
    /**
     * Creates a new annotation object.
     */
    createAnnotation({ type, text, context, id = Date.now() }) {
        return {
            id,
            type, // 'comment', 'question', 'todo', 'note'
            text,
            context: context || '',
            completed: false,
            createdAt: new Date().toISOString()
        };
    },

    /**
     * Returns the human-readable label for an annotation type.
     */
    getAnnotationTypeLabel(type) {
        const labels = {
            comment: 'Commentaire',
            todo: 'TODO',
            note: 'Note',
            question: 'Question'
        };
        return labels[type] || type;
    }
};
