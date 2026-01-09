/**
 * Plot Service
 * Analyse d'intrigue et courbe de tension dramatique
 */

const PlotService = (() => {
    'use strict';

    let plotPoints = [];

    function calculateSceneTension(scene, actIndex, totalActs, chapterIndex, totalChapters, sceneIndex, totalScenes) {
        let tension = 0;
        const content = (scene.content || '').toLowerCase();
        const title = (scene.title || '').toLowerCase();
        
        // 1. ANALYSE LEXICALE (0-40 points)
        const tensionWords = window.getTensionWords ? getTensionWords() : TensionWordsService.DEFAULT_TENSION_WORDS;
        const highWords = tensionWords.high;
        const mediumWords = tensionWords.medium;
        const lowWords = tensionWords.low;
        
        let lexicalScore = 0;
        highWords.forEach(word => {
            if (content.includes(word) || title.includes(word)) lexicalScore += 3;
        });
        mediumWords.forEach(word => {
            if (content.includes(word) || title.includes(word)) lexicalScore += 1.5;
        });
        lowWords.forEach(word => {
            if (content.includes(word) || title.includes(word)) lexicalScore -= 2;
        });
        
        tension += Math.max(0, Math.min(40, lexicalScore));
        
        // 2. ANALYSE DE LA LONGUEUR (0-10 points)
        const wordCount = content.split(/\s+/).filter(w => w.length > 0).length;
        if (wordCount < 200) tension += 8;
        else if (wordCount < 500) tension += 5;
        else if (wordCount < 1000) tension += 3;
        else tension += 2;
        
        // 3. PONCTUATION EXPRESSIVE (0-10 points)
        const exclamations = (content.match(/!/g) || []).length;
        const questions = (content.match(/\?/g) || []).length;
        const suspensions = (content.match(/\.\.\./g) || []).length;
        
        tension += Math.min(10, (exclamations * 0.5 + questions * 0.3 + suspensions * 0.8));
        
        // 4. STRUCTURE NARRATIVE (0-40 points)
        const actProgress = actIndex / Math.max(totalActs - 1, 1);
        const chapterProgress = chapterIndex / Math.max(totalChapters - 1, 1);
        const sceneProgress = sceneIndex / Math.max(totalScenes - 1, 1);
        
        if (totalActs >= 3) {
            if (actIndex === 0) {
                tension += 10 + (chapterProgress * 15);
            } else if (actIndex === totalActs - 1) {
                if (sceneProgress < 0.7) {
                    tension += 35 + (sceneProgress * 5);
                } else {
                    tension += 40 - ((sceneProgress - 0.7) * 50);
                }
            } else {
                tension += 20 + (actProgress * 15);
            }
        } else {
            tension += 20 + (sceneProgress * 20);
        }
        
        if (sceneIndex === totalScenes - 1) {
            tension += 5;
        }
        
        return Math.max(15, Math.min(95, tension));
    }

    function generatePlotPoints(project) {
        plotPoints = [];
        let position = 0;
        const totalActs = project.acts.length;
        
        project.acts.forEach((act, actIndex) => {
            const totalChapters = act.chapters.length;
            act.chapters.forEach((chapter, chapIndex) => {
                const totalScenes = chapter.scenes.length;
                chapter.scenes.forEach((scene, sceneIndex) => {
                    const intensity = calculateSceneTension(
                        scene, actIndex, totalActs, chapIndex, totalChapters, sceneIndex, totalScenes
                    );
                    
                    plotPoints.push({
                        position: position++,
                        intensity: intensity,
                        title: scene.title,
                        actId: act.id,
                        chapterId: chapter.id,
                        sceneId: scene.id,
                        description: act.title + ' > ' + chapter.title,
                        wordCount: scene.content ? scene.content.split(/\s+/).filter(w => w.length > 0).length : 0
                    });
                });
            });
        });
        
        return plotPoints;
    }

    function getPlotPoints() {
        return plotPoints;
    }

    function resetPlotPoints() {
        plotPoints = [];
    }

    function updatePointIntensity(pointIndex, newIntensity) {
        if (pointIndex >= 0 && pointIndex < plotPoints.length) {
            plotPoints[pointIndex].intensity = newIntensity;
        }
    }

    return {
        calculateSceneTension,
        generatePlotPoints,
        getPlotPoints,
        resetPlotPoints,
        updatePointIntensity
    };
})();

window.PlotService = PlotService;

console.log('[Plot] Service initialisé');
