// ============================================
// ARC BOARD - Configuration & Constants
// ============================================

/**
 * Génère un ID unique avec un préfixe
 * @param {string} prefix - Préfixe de l'ID (ex: 'arc', 'item', 'card', 'conn')
 * @returns {string} ID unique
 */
function generateUniqueId(prefix = 'id') {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

const ArcBoardConfig = {
    canvas: {
        minZoom: 0.25,
        maxZoom: 2,
        zoomStep: 0.1,
        width: 3000,
        height: 2000
    },
    grid: {
        size: 24,
        snapEnabled: true
    },
    column: {
        defaultWidth: 280,
        minWidth: 200,
        maxWidth: 500
    },
    item: {
        noteWidth: 250,
        imageWidth: 300,
        linkWidth: 280,
        todoWidth: 260,
        commentWidth: 220
    }
};

// Catégories d'arcs prédéfinies
const ArcCategories = Object.freeze({
    character: { icon: 'user', label: 'Personnage', color: '#3498db' },
    plot: { icon: 'book-open', label: 'Intrigue principale', color: '#e74c3c' },
    theme: { icon: 'message-circle', label: 'Thème', color: '#9b59b6' },
    subplot: { icon: 'file-text', label: 'Intrigue secondaire', color: '#16a085' },
    relationship: { icon: 'heart', label: 'Relation', color: '#e91e63' },
    mystery: { icon: 'search', label: 'Mystère', color: '#607d8b' },
    conflict: { icon: 'swords', label: 'Conflit', color: '#ff5722' },
    growth: { icon: 'sprout', label: 'Croissance', color: '#4caf50' },
    redemption: { icon: 'sparkles', label: 'Rédemption', color: '#ffd700' },
    vengeance: { icon: 'flame', label: 'Vengeance', color: '#d32f2f' },
    quest: { icon: 'map', label: 'Quête', color: '#ff9800' },
    discovery: { icon: 'telescope', label: 'Découverte', color: '#00bcd4' },
    transformation: { icon: 'butterfly', label: 'Transformation', color: '#ab47bc' },
    political: { icon: 'crown', label: 'Politique', color: '#795548' },
    philosophical: { icon: 'brain', label: 'Philosophique', color: '#546e7a' },
    comedic: { icon: 'smile', label: 'Comédie', color: '#ffeb3b' },
    tragic: { icon: 'frown', label: 'Tragédie', color: '#424242' },
    action: { icon: 'zap', label: 'Action', color: '#ff6f00' },
    worldbuilding: { icon: 'globe', label: 'Univers', color: '#1976d2' },
    linked_characters: { icon: 'users', label: 'Personnages liés', color: '#8e24aa' }
});

// Types de cartes supportés
const CardTypes = Object.freeze({
    note: { label: 'Note', icon: 'file-text' },
    image: { label: 'Image', icon: 'image' },
    link: { label: 'Lien', icon: 'link' },
    todo: { label: 'Tâches', icon: 'check-square' },
    comment: { label: 'Commentaire', icon: 'message-square' },
    table: { label: 'Tableau', icon: 'table' },
    audio: { label: 'Audio', icon: 'music' },
    scene: { label: 'Scène liée', icon: 'book-open' }
});

// Types d'items sur le board
const BoardItemTypes = Object.freeze({
    COLUMN: 'column',
    NOTE: 'note',
    IMAGE: 'image',
    LINK: 'link',
    TODO: 'todo',
    COMMENT: 'comment',
    TABLE: 'table',
    SCENE: 'scene'
});

// Outils disponibles
const ToolTypes = Object.freeze({
    SELECT: 'select',
    PAN: 'pan',
    CONNECT: 'connect'
});

// Types de drag
const DragTypes = Object.freeze({
    NONE: null,
    CARD: 'card',
    FLOATING: 'floating',
    COLUMN: 'column',
    UNASSIGNED: 'unassigned',
    TOOLBAR: 'toolbar'
});

// Types d'items disponibles pour création (toolbar et menu)
const CreatableItemTypes = Object.freeze({
    note: { label: 'Note', icon: 'file-text', canBeCard: true },
    column: { label: 'Colonne', icon: 'columns-3', canBeCard: false },
    link: { label: 'Lien', icon: 'link', canBeCard: true },
    todo: { label: 'Tâches', icon: 'check-square', canBeCard: true },
    comment: { label: 'Commentaire', icon: 'message-square', canBeCard: true },
    table: { label: 'Tableau', icon: 'table', canBeCard: true },
    image: { label: 'Image', icon: 'image', canBeCard: true }
});
