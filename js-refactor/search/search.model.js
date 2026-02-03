/**
 * Search Model
 * Définit les structures de données pour le système de recherche globale
 */

/**
 * Utilitaire pour s'assurer qu'une valeur est une chaîne
 * @param {*} value - Valeur à convertir
 * @param {string} defaultValue - Valeur par défaut
 * @returns {string} Chaîne de caractères
 */
const ensureString = (value, defaultValue = '') => {
    if (value === null || value === undefined) return defaultValue;
    return String(value);
};

/**
 * Factory pour créer un résultat de recherche
 * @param {Object} params - Paramètres du résultat
 * @returns {Object} Résultat de recherche formaté
 */
const SearchResultModel = {
    create: (params = {}) => ({
        id: params.id || generateId(),
        type: ensureString(params.type, 'Unknown'),
        title: ensureString(params.title, ''),
        path: ensureString(params.path, ''),
        preview: ensureString(params.preview, ''),
        matchIndex: params.matchIndex || -1,
        relevance: params.relevance || 0,
        action: params.action || (() => { }),
        metadata: params.metadata || {}
    }),

    /**
     * Crée un résultat de recherche pour une scène
     */
    createSceneResult: (scene, act, chapter, query, matchIndex, preview) => {
        return SearchResultModel.create({
            id: scene.id,
            type: 'Scène',
            title: ensureString(scene.title, 'Sans titre'),
            path: `${ensureString(act.title, 'Acte')} > ${ensureString(chapter.title, 'Chapitre')}`,
            preview: ensureString(preview, ''),
            matchIndex: matchIndex,
            action: () => openScene(act.id, chapter.id, scene.id),
            metadata: {
                actId: act.id,
                chapterId: chapter.id,
                sceneId: scene.id
            }
        });
    },

    /**
     * Crée un résultat de recherche pour un personnage
     */
    createCharacterResult: (character, query, preview) => {
        return SearchResultModel.create({
            id: character.id,
            type: 'Personnage',
            title: ensureString(character.name, 'Sans nom'),
            path: ensureString(character.role, 'Personnage'),
            preview: ensureString(preview || character.description, 'Aucune description'),
            action: () => {
                switchView('characters');
                openCharacterDetail(character.id);
            },
            metadata: {
                characterId: character.id,
                role: character.role
            }
        });
    },

    /**
     * Crée un résultat de recherche pour un élément d'univers
     */
    createWorldResult: (element, query, preview) => {
        return SearchResultModel.create({
            id: element.id,
            type: 'Univers',
            title: ensureString(element.name, 'Sans nom'),
            path: ensureString(element.type, 'Élément'),
            preview: ensureString(preview || element.description, 'Aucune description'),
            action: () => {
                switchView('world');
                openWorldDetail(element.id);
            },
            metadata: {
                elementId: element.id,
                elementType: element.type
            }
        });
    },

    /**
     * Crée un résultat de recherche pour un événement de chronologie
     */
    createTimelineResult: (event, query, preview) => {
        return SearchResultModel.create({
            id: event.id,
            type: 'Chronologie',
            title: ensureString(event.title, 'Sans titre'),
            path: ensureString(event.date, 'Événement'),
            preview: ensureString(preview || event.description, 'Aucune description'),
            action: () => {
                switchView('timeline');
                openTimelineDetail(event.id);
            },
            metadata: {
                eventId: event.id,
                date: event.date
            }
        });
    },

    /**
     * Crée un résultat de recherche pour un événement de chronologie métro
     */
    createMetroTimelineResult: (event, query, preview) => {
        return SearchResultModel.create({
            id: event.id,
            type: 'Métro',
            title: ensureString(event.title, 'Sans titre'),
            path: ensureString(event.date, 'Timeline Métro'),
            preview: ensureString(preview || event.description, 'Aucune description'),
            action: () => {
                if (typeof openMetroEventFullView === 'function') {
                    // Injecter l'ID dans le champ caché attendu par openMetroEventFullView
                    let hiddenInput = document.getElementById('metroViewChoiceEventId');
                    if (!hiddenInput) {
                        hiddenInput = document.createElement('input');
                        hiddenInput.type = 'hidden';
                        hiddenInput.id = 'metroViewChoiceEventId';
                        document.body.appendChild(hiddenInput);
                    }
                    hiddenInput.value = event.id;
                    openMetroEventFullView();
                } else {
                    switchView('timelineviz');
                    if (typeof MetroTimelineViewModel !== 'undefined') {
                        setTimeout(() => MetroTimelineViewModel.openEventModal(event.id), 200);
                    }
                }
            },
            metadata: {
                eventId: event.id,
                date: event.date
            }
        });
    },

    /**
     * Crée un résultat de recherche pour une note
     */
    createNoteResult: (note, query, matchIndex, preview) => {
        return SearchResultModel.create({
            id: note.id,
            type: 'Note',
            title: ensureString(note.title, 'Sans titre'),
            path: ensureString(note.category, 'Note'),
            preview: ensureString(preview, ''),
            matchIndex: matchIndex,
            action: () => {
                switchView('notes');
                openNoteDetail(note.id);
            },
            metadata: {
                noteId: note.id,
                category: note.category
            }
        });
    },

    /**
     * Crée un résultat de recherche pour une entrée de codex
     */
    createCodexResult: (entry, query, matchIndex, preview) => {
        return SearchResultModel.create({
            id: entry.id,
            type: 'Codex',
            title: ensureString(entry.title, 'Sans titre'),
            path: ensureString(entry.category, 'Codex'),
            preview: ensureString(preview, ''),
            matchIndex: matchIndex,
            action: () => {
                switchView('codex');
                openCodexDetail(entry.id);
            },
            metadata: {
                entryId: entry.id,
                category: entry.category
            }
        });
    },

    /**
     * Crée un résultat de recherche pour un TODO
     */
    createTodoResult: (todo, query, matchIndex, preview) => {
        return SearchResultModel.create({
            id: todo.id,
            type: 'TODO',
            title: ensureString(todo.text, 'Sans texte'),
            path: `${ensureString(todo.actTitle, 'Acte')} > ${ensureString(todo.chapterTitle, 'Chapitre')} > ${ensureString(todo.sceneTitle, 'Scène')}`,
            preview: ensureString(preview, ''),
            matchIndex: matchIndex,
            action: () => {
                if (typeof openScene === 'function') {
                    openScene(todo.actId, todo.chapterId, todo.sceneId);
                    switchView('editor');
                }
            },
            metadata: {
                todoId: todo.id,
                sceneId: todo.sceneId,
                actId: todo.actId,
                chapterId: todo.chapterId
            }
        });
    }
};

/**
 * Modèle pour l'état de la recherche
 */
const SearchStateModel = {
    create: () => ({
        query: '',
        results: [],
        isActive: false,
        isLoading: false,
        lastSearchTime: null,
        totalResults: 0
    })
};
