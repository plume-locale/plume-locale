/**
 * Relation Map Model
 * Defines the data structure for character relations and their positions on the graph.
 */
class RelationMapModel {
    /**
     * @typedef {Object} Relation
     * @property {string} id - Unique identifier for the relation
     * @property {number} char1Id - ID of the first character
     * @property {number} char2Id - ID of the second character
     * @property {string} type - Type of relation (e.g., 'amour', 'amitie')
     * @property {string} description - Optional description of the relation
     * @property {string} createdAt - ISO timestamp of when the relation was created
     */

    /**
     * @typedef {Object} CharacterPosition
     * @property {number} x - X coordinate on the graph
     * @property {number} y - Y coordinate on the graph
     */

    static RELATION_TYPES = {
        'amour': { color: '#e91e63', label: 'Amour', icon: 'heart' },
        'amitie': { color: '#4caf50', label: 'Amitié', icon: 'handshake' },
        'rivalite': { color: '#f44336', label: 'Rivalité', icon: 'swords' },
        'famille': { color: '#2196f3', label: 'Famille', icon: 'house' },
        'mentor': { color: '#ff9800', label: 'Mentor', icon: 'graduation-cap' },
        'ennemi': { color: '#9c27b0', label: 'Ennemi', icon: 'skull' },
        'alliance': { color: '#00bcd4', label: 'Alliance', icon: 'shield' },
        'neutre': { color: '#757575', label: 'Neutre', icon: 'meh' }
    };

    /**
     * Creates a new relation object.
     * @param {number} char1Id 
     * @param {number} char2Id 
     * @param {string} type 
     * @param {string} description 
     * @returns {Relation}
     */
    static createRelation(char1Id, char2Id, type, description = '') {
        return {
            id: 'rel_' + Date.now(),
            char1Id,
            char2Id,
            type: type || 'neutre',
            description,
            createdAt: new Date().toISOString()
        };
    }
}
