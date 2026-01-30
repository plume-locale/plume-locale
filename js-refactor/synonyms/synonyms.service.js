// ============================================================
// synonyms.service.js - Service API pour les synonymes
// ============================================================
// [MVVM : Service] - Appels API externes (Datamuse, etc.)

/**
 * Service de synonymes - Gère les appels API
 * [MVVM : Service]
 */
const SynonymsService = {
    /**
     * Recherche des synonymes pour un mot
     * @param {string} word - Mot à rechercher
     * @returns {Promise<Array>} Liste de synonymes
     * [MVVM : Service]
     */
    async fetchSynonyms(word) {
        return this._fetchFromDatamuse(word, 'synonymsEndpoint');
    },

    /**
     * Recherche des mots similaires (son/orthographe)
     * @param {string} word - Mot à rechercher
     * @returns {Promise<Array>} Liste de mots similaires
     * [MVVM : Service]
     */
    async fetchSimilar(word) {
        return this._fetchFromDatamuse(word, 'similarEndpoint');
    },

    /**
     * Recherche des rimes
     * @param {string} word - Mot à rechercher
     * @returns {Promise<Array>} Liste de rimes
     * [MVVM : Service]
     */
    async fetchRhymes(word) {
        return this._fetchFromDatamuse(word, 'rhymesEndpoint');
    },

    /**
     * Recherche des antonymes
     * @param {string} word - Mot à rechercher
     * @returns {Promise<Array>} Liste d'antonymes
     * [MVVM : Service]
     */
    async fetchAntonyms(word) {
        return this._fetchFromDatamuse(word, 'antonymsEndpoint');
    },

    /**
     * Recherche générique selon le type
     * @param {string} word - Mot à rechercher
     * @param {string} type - Type de recherche
     * @returns {Promise<Array>} Résultats
     * [MVVM : Service]
     */
    async fetch(word, type = SynonymsConfig.searchTypes.SYNONYMS) {
        switch (type) {
            case SynonymsConfig.searchTypes.SYNONYMS:
                return this.fetchSynonyms(word);
            case SynonymsConfig.searchTypes.SIMILAR:
                return this.fetchSimilar(word);
            case SynonymsConfig.searchTypes.RHYMES:
                return this.fetchRhymes(word);
            case SynonymsConfig.searchTypes.ANTONYMS:
                return this.fetchAntonyms(word);
            default:
                return this.fetchSynonyms(word);
        }
    },

    /**
     * Appel interne à l'API Datamuse
     * @param {string} word - Mot à rechercher
     * @param {string} endpointKey - Clé de l'endpoint dans la config
     * @returns {Promise<Array>} Résultats formatés
     * [MVVM : Service]
     */
    async _fetchFromDatamuse(word, endpointKey) {
        const config = SynonymsConfig.apis.datamuse;

        if (!config.enabled) {
            throw new Error('API Datamuse désactivée');
        }

        const cleanWord = word.toLowerCase().trim();
        if (!cleanWord) {
            return [];
        }

        const url = config.baseUrl + config[endpointKey](cleanWord);

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), config.timeout);

            const response = await fetch(url, {
                method: 'GET',
                signal: controller.signal,
                headers: {
                    'Accept': 'application/json'
                }
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }

            const data = await response.json();

            // Transformer les résultats bruts en objets SynonymResult
            return data.map(item => SynonymResult.create(item));

        } catch (error) {
            if (error.name === 'AbortError') {
                throw new Error('Délai d\'attente dépassé');
            }
            throw error;
        }
    },

    /**
     * Vérifie si le service est disponible (connexion internet)
     * @returns {boolean}
     * [MVVM : Service]
     */
    isOnline() {
        return navigator.onLine;
    },

    /**
     * Teste la connexion à l'API
     * @returns {Promise<boolean>}
     * [MVVM : Service]
     */
    async testConnection() {
        try {
            const results = await this.fetchSynonyms('test');
            return true;
        } catch (error) {
            console.warn('[SynonymsService] Test de connexion échoué:', error.message);
            return false;
        }
    }
};

// Export pour utilisation dans d'autres modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SynonymsService };
}
