// ============================================
// ARC MODEL - Modèle de données Arc narratif
// ============================================

/**
 * Arc - Modèle représentant un arc narratif
 */

class Arc {
    constructor(data = {}) {
        this.id = data.id || Date.now();
        this.title = data.title || 'Nouvel arc';
        this.description = data.description || '';
        this.category = data.category || 'plot'; // plot, character, theme, subplot
        this.color = data.color || '#3498db';

        // Structure de l'arc
        this.scenes = data.scenes || []; // IDs des scènes liées
        this.milestones = data.milestones || []; // Étapes importantes

        // Métadonnées
        this.status = data.status || 'planned'; // planned, in-progress, completed
        this.priority = data.priority || 'medium'; // low, medium, high

        // Timestamps
        this.createdAt = data.createdAt || Date.now();
        this.updatedAt = data.updatedAt || Date.now();
    }

    validate() {
        if (!Validators.required(this.title)) {
            throw new Error('Le titre de l\'arc est requis');
        }
        return true;
    }

    toJSON() {
        return {
            id: this.id,
            title: this.title,
            description: this.description,
            category: this.category,
            color: this.color,
            scenes: this.scenes,
            milestones: this.milestones,
            status: this.status,
            priority: this.priority,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }

    clone() {
        return new Arc(JSON.parse(JSON.stringify(this.toJSON())));
    }

    touch() {
        this.updatedAt = Date.now();
    }

    addScene(sceneId) {
        if (!this.scenes.includes(sceneId)) {
            this.scenes.push(sceneId);
            this.touch();
        }
    }

    removeScene(sceneId) {
        this.scenes = ArrayUtils.removeId(this.scenes, sceneId);
        this.touch();
    }

    addMilestone(milestone) {
        this.milestones.push({
            id: Date.now(),
            title: milestone.title || '',
            description: milestone.description || '',
            sceneId: milestone.sceneId || null,
            completed: milestone.completed || false,
            createdAt: Date.now()
        });
        this.touch();
    }
}

window.Arc = Arc;
