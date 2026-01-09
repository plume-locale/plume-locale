/**
 * Mobile Views UI
 * Gestion des vues mobiles pour la sidebar
 */

const MobileViewsUI = (() => {
    'use strict';

    // Configuration des vues
    const VIEW_CONFIGS = {
        editor: {
            icon: '📝',
            title: 'Structure de votre roman',
            description: 'Organisez votre roman en actes, chapitres et scènes',
            emptyMessage: 'Aucun acte créé',
            emptySubMessage: 'Commencez par créer votre premier acte pour structurer votre histoire',
            actionButton: '<button class="btn btn-primary" style="font-size: 1.2rem; padding: 1rem 2rem;" onclick="openAddActModal()">+ Créer un acte</button>',
            sidebarHint: 'Utilisez la poignée dorée sur le bord gauche pour naviguer dans votre structure',
            getCount: (project) => project.acts ? project.acts.length : 0,
            isEmpty: (project) => !project.acts || project.acts.length === 0
        },
        characters: {
            icon: '👥',
            title: 'Personnages',
            description: 'Gérez vos personnages et leurs caractéristiques',
            emptyMessage: 'Aucun personnage créé',
            emptySubMessage: 'Créez votre premier personnage pour donner vie à votre histoire',
            actionButton: '<button class="btn btn-primary" style="font-size: 1.2rem; padding: 1rem 2rem;" onclick="openAddCharacterModal()">+ Créer un personnage</button>',
            sidebarHint: 'Utilisez la poignée dorée sur le bord gauche pour voir la liste complète',
            getCount: (project) => project.characters ? project.characters.length : 0,
            isEmpty: (project) => !project.characters || project.characters.length === 0
        },
        world: {
            icon: '🌍',
            title: 'Univers',
            description: 'Créez les éléments de votre monde (lieux, objets, concepts)',
            emptyMessage: 'Aucun élément créé',
            emptySubMessage: 'Ajoutez des lieux, objets ou concepts pour enrichir votre univers',
            actionButton: '<button class="btn btn-primary" style="font-size: 1.2rem; padding: 1rem 2rem;" onclick="openAddWorldModal()">+ Créer un élément</button>',
            sidebarHint: 'Utilisez la poignée dorée sur le bord gauche pour voir tous vos éléments',
            getCount: (project) => project.world ? project.world.length : 0,
            isEmpty: (project) => !project.world || project.world.length === 0
        },
        notes: {
            icon: '📋',
            title: 'Notes',
            description: 'Prenez des notes et organisez vos recherches',
            emptyMessage: 'Aucune note créée',
            emptySubMessage: 'Créez des notes pour garder vos idées et recherches organisées',
            actionButton: '<button class="btn btn-primary" style="font-size: 1.2rem; padding: 1rem 2rem;" onclick="openAddNoteModal()">+ Créer une note</button>',
            sidebarHint: 'Utilisez la poignée dorée sur le bord gauche pour voir toutes vos notes',
            getCount: (project) => project.notes ? project.notes.length : 0,
            isEmpty: (project) => !project.notes || project.notes.length === 0
        },
        codex: {
            icon: '📖',
            title: 'Codex',
            description: 'Wiki de votre univers - glossaire et encyclopédie',
            emptyMessage: 'Aucune entrée dans le codex',
            emptySubMessage: 'Créez des entrées pour documenter votre univers',
            actionButton: '<button class="btn btn-primary" style="font-size: 1.2rem; padding: 1rem 2rem;" onclick="openAddCodexModal()">+ Créer une entrée</button>',
            sidebarHint: 'Utilisez la poignée dorée sur le bord gauche pour parcourir le codex',
            getCount: (project) => project.codex ? project.codex.length : 0,
            isEmpty: (project) => !project.codex || project.codex.length === 0
        }
    };

    /**
     * Génère le HTML pour une vue mobile vide
     * @param {Object} config - Configuration de la vue
     * @param {number} count - Nombre d'éléments
     * @param {boolean} isEmpty - Vue vide ou non
     * @returns {string} HTML généré
     */
    function generateViewHTML(config, count, isEmpty) {
        let html = `
            <div class="empty-state" style="padding: 2rem 1.5rem; text-align: center;">
                <div class="empty-state-icon" style="font-size: 4rem; margin-bottom: 1rem;">
                    ${config.icon}
                </div>
                <div class="empty-state-title" style="font-size: 1.5rem; font-weight: 600; margin-bottom: 0.5rem; color: var(--text-primary);">
                    ${config.title}
                </div>
                <div class="empty-state-text" style="color: var(--text-secondary); margin-bottom: 1.5rem; line-height: 1.6;">
                    ${config.description}
                </div>
        `;

        if (isEmpty) {
            html += `
                <div style="background: var(--bg-secondary); padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem; border-left: 3px solid var(--accent-gold);">
                    <div style="font-weight: 600; margin-bottom: 0.5rem; color: var(--text-primary);">
                        ${config.emptyMessage}
                    </div>
                    <div style="color: var(--text-secondary); font-size: 0.95rem;">
                        ${config.emptySubMessage}
                    </div>
                </div>
                ${config.actionButton}
            `;
        } else {
            html += `
                <div style="background: var(--bg-secondary); padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem;">
                    <div style="font-size: 2rem; font-weight: bold; color: var(--accent-gold); margin-bottom: 0.5rem;">
                        ${count}
                    </div>
                    <div style="color: var(--text-secondary);">
                        ${count === 1 ? 'élément' : 'éléments'}
                    </div>
                </div>
                ${config.actionButton}
            `;
        }

        html += `
                <div style="margin-top: 2rem; padding: 1rem; background: rgba(212, 175, 55, 0.1); border-radius: 8px; border: 1px solid var(--accent-gold);">
                    <div style="font-size: 1.2rem; margin-bottom: 0.5rem;">💡</div>
                    <div style="font-size: 0.9rem; color: var(--text-secondary); line-height: 1.6;">
                        ${config.sidebarHint}
                    </div>
                </div>
            </div>
        `;

        return html;
    }

    /**
     * Rend la vue mobile pour la sidebar
     * @param {string} view - Nom de la vue
     */
    function render(view) {
        const editorView = document.getElementById('editorView');
        if (!editorView) return;

        const config = VIEW_CONFIGS[view];
        if (!config) return;

        // Récupérer le projet actuel
        const state = window.StateManager ? StateManager.getState() : {};
        const project = state.project || window.project || {};

        // Calculer l'état de la vue
        const isEmpty = config.isEmpty(project);
        const count = config.getCount(project);

        // Générer et injecter le HTML
        editorView.innerHTML = generateViewHTML(config, count, isEmpty);
    }

    /**
     * Initialise le service
     */
    function init() {
        // S'abonner aux changements de vue si EventBus existe
        if (window.EventBus) {
            EventBus.on('view:changed', (data) => {
                if (data.view && window.innerWidth <= 768) {
                    render(data.view);
                }
            });
        }

        console.log('[MobileViews] UI initialisée');
    }

    // API publique
    return {
        init,
        render
    };
})();

// Auto-initialisation
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => MobileViewsUI.init());
} else {
    MobileViewsUI.init();
}

// Exposer la fonction render globalement pour compatibilité
window.renderMobileSidebarView = function(view) {
    MobileViewsUI.render(view);
};
