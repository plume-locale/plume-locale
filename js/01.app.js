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

