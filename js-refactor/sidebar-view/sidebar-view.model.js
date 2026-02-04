/**
 * @file sidebar-view.model.js
 * @description Modèle contenant la configuration statique pour les vues de la barre latérale.
 */

const SidebarViewModelData = {
    // Configuration des différentes vues
    VIEW_CONFIG: {
        editor: {
            icon: '📝',
            title: 'Structure de votre roman',
            description: 'Organisez votre roman en actes, chapitres et scènes',
            emptyMessage: 'Aucun acte créé',
            emptySubMessage: 'Commencez par créer votre premier acte pour structurer votre histoire',
            actionButton: '<button class="btn btn-primary" style="font-size: 1.2rem; padding: 1rem 2rem;" onclick="openAddActModal()">+ Créer un acte</button>',
            sidebarHint: 'Utilisez la poignée dorée sur le bord gauche pour naviguer dans votre structure'
        },
        characters: {
            icon: '👥',
            title: 'Personnages',
            description: 'Gérez vos personnages et leurs caractéristiques',
            emptyMessage: 'Aucun personnage créé',
            emptySubMessage: 'Créez votre premier personnage pour donner vie à votre histoire',
            actionButton: '<button class="btn btn-primary" style="font-size: 1.2rem; padding: 1rem 2rem;" onclick="openAddCharacterModal()">+ Créer un personnage</button>',
            sidebarHint: 'Utilisez la poignée dorée sur le bord gauche pour voir la liste complète'
        },
        world: {
            icon: '🌍',
            title: 'Univers',
            description: 'Créez les éléments de votre monde (lieux, objets, concepts)',
            emptyMessage: 'Aucun élément créé',
            emptySubMessage: 'Ajoutez des lieux, objets ou concepts pour enrichir votre univers',
            actionButton: '<button class="btn btn-primary" style="font-size: 1.2rem; padding: 1rem 2rem;" onclick="openAddWorldModal()">+ Créer un élément</button>',
            sidebarHint: 'Utilisez la poignée dorée sur le bord gauche pour voir tous vos éléments'
        },
        notes: {
            icon: '📋',
            title: 'Notes',
            description: 'Prenez des notes et organisez vos recherches',
            emptyMessage: 'Aucune note créée',
            emptySubMessage: 'Créez des notes pour garder vos idées et recherches organisées',
            actionButton: '<button class="btn btn-primary" style="font-size: 1.2rem; padding: 1rem 2rem;" onclick="openAddNoteModal()">+ Créer une note</button>',
            sidebarHint: 'Utilisez la poignée dorée sur le bord gauche pour voir toutes vos notes'
        },
        codex: {
            icon: '📖',
            title: 'Codex',
            description: 'Wiki de votre univers - glossaire et encyclopédie',
            emptyMessage: 'Aucune entrée dans le codex',
            emptySubMessage: 'Créez des entrées pour documenter votre univers',
            actionButton: '<button class="btn btn-primary" style="font-size: 1.2rem; padding: 1rem 2rem;" onclick="openAddCodexModal()">+ Créer une entrée</button>',
            sidebarHint: 'Utilisez la poignée dorée sur le bord gauche pour parcourir le codex'
        }
    }
};
