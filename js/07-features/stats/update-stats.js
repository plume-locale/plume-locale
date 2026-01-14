// Migration of js/11.updateStats.js -> features/stats/update-stats.js

function updateStats() {
    const totalActs = project.acts.length;
    const totalChapters = project.acts.reduce((sum, act) => sum + act.chapters.length, 0);
    const totalWords = project.acts.reduce((sum, act) => {
        return sum + act.chapters.reduce((chSum, chapter) => {
            return chSum + chapter.scenes.reduce((sceneSum, scene) => {
                return sceneSum + getWordCount(scene.content);
            }, 0);
        }, 0);
    }, 0);

    // Update header stats
    const headerWords = document.getElementById('headerTotalWords');
    const headerChapters = document.getElementById('headerTotalChapters');
    if (headerWords) headerWords.textContent = `${totalWords} mots`;
    if (headerChapters) headerChapters.textContent = `${totalChapters} chapitres`;
    
    // Update project title in header
    const headerTitle = document.getElementById('headerProjectTitle');
    if (headerTitle) headerTitle.textContent = project.title;

    // Emit an event so other modules can react
    try { if (typeof EventBus !== 'undefined') EventBus.emit('stats:updated', { totalWords, totalChapters, totalActs }); } catch (e) { /* ignore */ }
}

// Export for CommonJS/ESM or global usage in browser
if (typeof window !== 'undefined') window.updateStats = updateStats;
// Migrated from js/11.updateStats.js

function updateStats() {
    const totalActs = project.acts.length;
    const totalChapters = project.acts.reduce((sum, act) => sum + act.chapters.length, 0);
    const totalWords = project.acts.reduce((sum, act) => {
        return sum + act.chapters.reduce((chSum, chapter) => {
            return chSum + chapter.scenes.reduce((sceneSum, scene) => {
                return sceneSum + getWordCount(scene.content);
            }, 0);
        }, 0);
    }, 0);

    const headerWords = document.getElementById('headerTotalWords');
    const headerChapters = document.getElementById('headerTotalChapters');
    if (headerWords) headerWords.textContent = `${totalWords} mots`;
    if (headerChapters) headerChapters.textContent = `${totalChapters} chapitres`;
    const headerTitle = document.getElementById('headerProjectTitle');
    if (headerTitle) headerTitle.textContent = project.title;
}
