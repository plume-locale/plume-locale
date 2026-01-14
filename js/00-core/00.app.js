// Migrated from js/01.app.js

// Data Structure
let projects = []; // Array of all projects
let currentProjectId = null;
let project = {
    id: null,
    title: "Mon Roman",
    description: "",
    genre: "",
    createdAt: null,
    updatedAt: null,
    acts: [], // Acts contain chapters, chapters contain scenes
    characters: [], // Character database
    world: [], // World elements (locations, objects, concepts)
    timeline: [], // Timeline events
    notes: [], // Standalone notes and research
    codex: [], // Wiki/Codex entries for worldbuilding
    stats: {
        dailyGoal: 500,
        totalGoal: 80000,
        writingSessions: [] // Track writing sessions with word count and date
    },
    versions: [], // Version history snapshots
    relationships: [], // Cross-references between elements
    relations: [], // Character relations with types and colors
    characterPositions: {}, // Custom positions for relations graph
    mapLocations: [], // Geographic map markers
    mapImage: null, // Map image data URL
    visualTimeline: [], // Timeline visualization events
    metroTimeline: [], // Metro-style timeline with character links
    characterColors: {}, // Colors for metro timeline lines
    mindmaps: [] // Custom mindmaps with nodes and links
};

let currentActId = null;
let currentChapterId = null;
let currentSceneId = null;
let activeActId = null;
let activeChapterId = null;
let currentView = 'editor'; // 'editor', 'characters', 'world', 'timeline', 'notes', 'stats', 'codex', 'versions'
let currentMindmapId = null; // ID du mindmap actuellement affiché

// SPLIT VIEW SYSTEM - New Architecture
let splitViewActive = false;
let splitActivePanel = 'left'; // 'left' or 'right' - which panel is currently active
let splitViewState = {
    left: {
        view: 'editor',
        sceneId: null,
        actId: null,
        chapterId: null,
        characterId: null,
        worldId: null,
        noteId: null,
        codexId: null
    },
    right: {
        view: null, // null = empty
        sceneId: null,
        actId: null,
        chapterId: null,
        characterId: null,
        worldId: null,
        noteId: null,
        codexId: null
    },
    ratio: 60,
    persistOnReload: true
};

// TREE STATE - pour mémoriser l'état d'expansion
let expandedActs = new Set(); // IDs des actes dépliés
let expandedChapters = new Set(); // IDs des chapitres dépliés

// REVISION MODE VARIABLES
let revisionMode = false;
let selectedHighlightColor = 'yellow';
let selectedAnnotationType = 'comment';
let currentSelection = null; // 'editor', 'characters', 'world', 'timeline', 'notes', 'stats', 'codex', 'versions'

// UNDO/REDO SYSTEM
let historyStack = []; // Stack pour les états précédents
let redoStack = []; // Stack pour redo
let maxHistorySize = 50; // Garder max 50 états
let isUndoRedoAction = false; // Flag pour éviter de sauvegarder pendant undo/redo
let historyDebounceTimer = null; // Timer pour debounce
let historyDebounceDelay = 2000; // 2 secondes de délai

// Core wiring: initialize StateManager and EventBus when available
(function () {
    const MAX_ATTEMPTS = 50;
    let attempts = 0;

    function tryInit() {
        attempts++;
        if (typeof window.EventBus === 'undefined' || typeof window.StateManager === 'undefined') {
            if (attempts < MAX_ATTEMPTS) return setTimeout(tryInit, 100);
            console.warn('Core wiring: EventBus or StateManager not found after retries.');
            return;
        }

        // Initialize StateManager with current globals
        try {
            StateManager.init({
                projects: typeof projects !== 'undefined' ? projects : [],
                project: typeof project !== 'undefined' ? project : {},
                currentActId: typeof currentActId !== 'undefined' ? currentActId : null,
                currentChapterId: typeof currentChapterId !== 'undefined' ? currentChapterId : null,
                currentSceneId: typeof currentSceneId !== 'undefined' ? currentSceneId : null,
                expandedActs: Array.from(expandedActs || new Set()),
                expandedChapters: Array.from(expandedChapters || new Set()),
                splitViewState: typeof splitViewState !== 'undefined' ? splitViewState : {}
            });

            // Keep globals in sync when some modules update state
            StateManager.on('project', (val) => { project = val; });
            StateManager.on('projects', (val) => { projects = val; });
            StateManager.on('currentActId', (val) => { currentActId = val; });
            StateManager.on('currentChapterId', (val) => { currentChapterId = val; });
            StateManager.on('currentSceneId', (val) => { currentSceneId = val; });

            // Expose a minimal App object
            window.App = window.App || {};
            window.App.ready = true;

            // Notify listeners that the app core is ready
            EventBus.emit('app:ready', { state: StateManager.get() });
        } catch (e) {
            console.error('Error during core wiring:', e);
        }
    }

    tryInit();
})();
