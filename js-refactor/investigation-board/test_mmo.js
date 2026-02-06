
// Mock window.project and repositories
window = {
    project: {
        characters: [{ id: 'suspect1', name: 'S1' }],
        acts: [] // Start empty
    }
};

// Start with clean store
const store = InvestigationStore;
store._initialized = false;
store.state = {
    cases: [],
    activeCaseId: null,
    facts: [],
    knowledge: [],
    suspectLinks: [],
    currentView: 'dashboard',
    filters: { sceneId: null }
};

// Mock scenes
const mockScenes = [
    { id: 'scene1', title: 'Scene 1' },
    { id: 'scene2', title: 'Scene 2' }
];
store.getScenes = () => mockScenes;

// 1. Create a Suspect Link at Start (Scene NULL)
store.updateSuspectLink({
    suspectId: 'suspect1',
    victimId: 'crime1',
    sceneId: null,
    motive: { level: 2 },
    means: { level: 2 },
    opportunity: { level: 2 }
});

console.log("--- Test 1: Initial State ---");
let link = store.getSuspectLinkAtScene('suspect1', 'crime1', null);
console.log("Start Link:", link ? link.motive.level : 'MISSING', "(Expected: 2)");

// 2. Move to Scene 1 (Should fallback to Start if not exists, but we are creating new)
console.log("--- Test 2: Save at Scene 1 ---");
store.updateSuspectLink({
    suspectId: 'suspect1',
    victimId: 'crime1',
    sceneId: 'scene1',
    motive: { level: 5 }, // Change to 5
    means: { level: 5 },
    opportunity: { level: 5 }
});

link = store.getSuspectLinkAtScene('suspect1', 'crime1', 'scene1');
console.log("Scene 1 Link:", link ? link.motive.level : 'MISSING', "(Expected: 5)");

// Check Start is still 2
link = store.getSuspectLinkAtScene('suspect1', 'crime1', null);
console.log("Start Link check:", link ? link.motive.level : 'MISSING', "(Expected: 2)");


// 3. Move to Scene 2 (Should fallback to Scene 1 initially)
console.log("--- Test 3: Fallback at Scene 2 ---");
// Before creating specific link for scene 2
link = store.getSuspectLinkAtScene('suspect1', 'crime1', 'scene2');
console.log("Scene 2 Fallback:", link ? link.motive.level : 'MISSING', "(Expected: 5 from Scene 1)");

// 4. Save at Scene 2
console.log("--- Test 4: Save at Scene 2 ---");
store.updateSuspectLink({
    suspectId: 'suspect1',
    victimId: 'crime1',
    sceneId: 'scene2',
    motive: { level: 8 }, // Change to 8
    means: { level: 8 },
    opportunity: { level: 8 }
});

link = store.getSuspectLinkAtScene('suspect1', 'crime1', 'scene2');
console.log("Scene 2 Link:", link ? link.motive.level : 'MISSING', "(Expected: 8)");

// Verify history
console.log("--- Verify History ---");
const allLinks = store.getSuspectLinks();
console.log("Total Links:", allLinks.length, "(Expected: 3)");
allLinks.forEach(l => console.log(`Scene: ${l.sceneId} -> Motive: ${l.motive.level}`));
