/**
 * Tension Words Service
 * Gestion des mots de tension pour l'analyse d'intrigue
 */

const TensionWordsService = (() => {
    'use strict';

    const DEFAULT_TENSION_WORDS = {
        high: [
            'combat', 'bataille', 'mort', 'tuer', 'danger', 'peur', 'terreur', 'cri', 'hurler',
            'sang', 'blessure', 'fuir', 'course', 'poursuite', 'menace', 'attaque', 'explosion',
            'feu', 'incendie', 'catastrophe', 'urgence', 'panique', 'désespoir', 'tragédie',
            'révélation', 'secret', 'trahison', 'conflit', 'confrontation', 'affrontement',
            'climax', 'crucial', 'décisif', 'critique', 'vital', 'dramatique'
        ],
        medium: [
            'mystère', 'suspense', 'intrigue', 'complot', 'enquête', 'découverte', 'surprise',
            'tension', 'stress', 'angoisse', 'inquiétude', 'doute', 'hésitation', 'dilemme',
            'choix', 'décision', 'tournant', 'changement', 'transformation'
        ],
        low: [
            'calme', 'paix', 'repos', 'détente', 'tranquille', 'paisible', 'serein',
            'conversation', 'discussion', 'réflexion', 'souvenir', 'rêve', 'pensée'
        ]
    };

    function getTensionWords() {
        const stored = localStorage.getItem('tensionWords');
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                console.error('[TensionWords] Erreur chargement:', e);
                return DEFAULT_TENSION_WORDS;
            }
        }
        return DEFAULT_TENSION_WORDS;
    }

    function saveTensionWords(words) {
        localStorage.setItem('tensionWords', JSON.stringify(words));
    }

    function resetToDefault() {
        saveTensionWords(DEFAULT_TENSION_WORDS);
        return DEFAULT_TENSION_WORDS;
    }

    function addWord(type, word) {
        const words = getTensionWords();
        word = word.trim().toLowerCase();
        
        if (!word) return { success: false, message: 'Mot vide' };
        if (words[type].includes(word)) return { success: false, message: 'Mot déjà existant' };
        
        for (const category in words) {
            if (category !== type && words[category].includes(word)) {
                return { success: false, message: 'Existe déjà dans ' + category };
            }
        }
        
        words[type].push(word);
        saveTensionWords(words);
        return { success: true };
    }

    function removeWord(type, word) {
        const words = getTensionWords();
        words[type] = words[type].filter(w => w !== word);
        saveTensionWords(words);
    }

    return {
        getTensionWords,
        saveTensionWords,
        resetToDefault,
        addWord,
        removeWord,
        DEFAULT_TENSION_WORDS
    };
})();

window.TensionWordsService = TensionWordsService;
window.getTensionWords = () => TensionWordsService.getTensionWords();

console.log('[TensionWords] Service initialisé');
