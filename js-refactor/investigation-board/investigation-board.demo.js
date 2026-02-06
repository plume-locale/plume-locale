
// Demo Data Injection Script: The Midnight Poisoning
function injectDemoData() {
    console.log("💉 Injecting Demo Data: The Midnight Poisoning...");

    // 1. Clear Existing Data (Optional/Safety)
    // InvestigationStore.state.cases = [];

    // 2. Create Characters if missing
    // We assume project characters exist. If not, we mock them.
    let s1 = InvestigationStore.getCharacters().find(c => c.name.includes("Butler"));
    if (!s1) s1 = { id: 101, name: "The Butler", role: "Suspect" };

    let s2 = InvestigationStore.getCharacters().find(c => c.name.includes("Heir"));
    if (!s2) s2 = { id: 102, name: "The Heir", role: "Suspect" };

    // 3. Create Case
    const myCase = InvestigationStore.createCase({
        title: "The Midnight Poisoning",
        status: "Open"
    });
    InvestigationStore.setActiveCase(myCase.id);

    // 4. Create Facts
    const crime = InvestigationStore.createFact({
        type: 'crime',
        label: 'Baron Found Dead',
        description: 'Poisoned in his study at midnight.',
        truthStatus: 'verified'
    });
    InvestigationStore.addFact(crime);

    const clue1 = InvestigationStore.createFact({
        type: 'clue',
        label: 'Empty Vial',
        description: 'Found under the rug.',
        truthStatus: 'suspicious'
    });
    InvestigationStore.addFact(clue1);

    // 5. Create MMO Links (Evolution)

    // Scene: Start (Initial Suspicion)
    InvestigationStore.updateSuspectLink({
        suspectId: s1.id,
        victimId: crime.id,
        sceneId: 'start',
        motive: { level: 2, description: "Loyal servant?" },
        means: { level: 8, description: "Has keys to medicine cabinet." },
        opportunity: { level: 5, description: "Lives in house." }
    });

    // Scene: Scene 1 (The Discovery) - Suspicion Rises
    // Assuming we have scenes, or we manually set ids
    // Let's assume standard Act 1 Scene 1 ID if available, else 'scene_1'
    const scenes = InvestigationStore.getScenes();
    const scene1Id = scenes.length > 0 ? scenes[0].id : 'scene_1';

    InvestigationStore.updateSuspectLink({
        suspectId: s1.id,
        victimId: crime.id,
        sceneId: scene1Id,
        motive: { level: 5, description: "Argued with Baron." },
        means: { level: 8, description: "Has keys." },
        opportunity: { level: 9, description: "Was seen near study." }
    });

    console.log("✅ Demo Data Injected!");
    window.location.reload();
}

// Expose globally
window.injectDemoData = injectDemoData;
