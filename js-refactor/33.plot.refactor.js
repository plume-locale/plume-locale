
// plotPoints is declared in 01.app.refactor.js

// Algorithme d'analyse de tension basé sur le contenu
// [MVVM : Model]
// Calcule le score de tension d'une scène en fonction de son contenu, de sa longueur, 
// de sa ponctuation et de sa position dans la structure narrative.
function calculateSceneTension(scene, actIndex, totalActs, chapterIndex, totalChapters, sceneIndex, totalScenes) {
    if (typeof calculateLiveTension === 'function') {
        // Obtenir les IDs pour le contexte
        const act = project.acts[actIndex];
        const chapter = act ? act.chapters[chapterIndex] : null;

        if (act && chapter && scene) {
            const context = {
                actId: act.id,
                chapterId: chapter.id,
                sceneId: scene.id
            };
            const result = calculateLiveTension(scene.content || '', context);
            return result.score;
        }
    }

    // Fallback si calculateLiveTension n'est pas disponible (ou données manquantes)
    let tension = 25;
    const content = (scene.content || '').toLowerCase();
    const wordCount = content.split(/\s+/).filter(w => w.length > 0).length;

    // Simplification extrême pour le fallback
    if (wordCount < 500) tension += 10;

    return tension;
}

// [MVVM : View]
// Génère et affiche l'interface graphique du graphique d'intrigue (SVG) dans le conteneur principal.
function renderPlotView() {
    const container = document.getElementById('editorView');
    if (!container) {
        console.error('editorView container not found');
        return;
    }
    // Initialiser les points d'intrigue avec calcul intelligent
    if (plotPoints.length === 0 && project.acts.length > 0) {
        let position = 0;
        const totalActs = project.acts.length;

        project.acts.forEach((act, actIndex) => {
            const totalChapters = act.chapters.length;

            act.chapters.forEach((chapter, chapIndex) => {
                const totalScenes = chapter.scenes.length;

                chapter.scenes.forEach((scene, sceneIndex) => {
                    const intensity = calculateSceneTension(
                        scene,
                        actIndex,
                        totalActs,
                        chapIndex,
                        totalChapters,
                        sceneIndex,
                        totalScenes
                    );

                    plotPoints.push({
                        position: position++,
                        intensity: intensity,
                        title: scene.title,
                        actId: act.id,
                        chapterId: chapter.id,
                        sceneId: scene.id,
                        description: `${act.title} > ${chapter.title} > ${scene.title}`,
                        wordCount: scene.content ? scene.content.split(/\s+/).filter(w => w.length > 0).length : 0
                    });
                });
            });
        });
    }

    // Générer le graphique SVG
    const svgWidth = 1000; // Plus large pour la précision
    const svgHeight = 700;
    const paddingX = 60;   // Padding horizontal réduit
    const paddingYTop = 40; // Haut réduit
    const paddingYBottom = 180; // Beaucoup plus de place en bas pour les noms

    const plotWidth = svgWidth - paddingX * 2;
    const plotHeight = svgHeight - paddingYTop - paddingYBottom;
    const axisY = svgHeight - paddingYBottom;

    let pathData = '';
    let pointsHTML = '';
    let gridLines = '';

    // Lignes de grille
    for (let i = 0; i <= 4; i++) {
        const y = paddingYTop + (plotHeight / 4) * i;
        gridLines += `<line x1="${paddingX}" y1="${y}" x2="${svgWidth - paddingX}" y2="${y}" stroke="var(--border-color)" stroke-width="1" opacity="0.3" stroke-dasharray="5,5"/>`;
        gridLines += `<text x="${paddingX - 10}" y="${y + 5}" text-anchor="end" font-size="12" fill="var(--text-muted)">${100 - i * 25}%</text>`;
    }

    // Générer la courbe et les étiquettes d'axes
    let structuralLabels = '';
    let currentActRef = null;
    let currentChapterRef = null;

    if (plotPoints.length > 0) {
        plotPoints.forEach((point, index) => {
            const x = paddingX + (plotWidth / Math.max(plotPoints.length - 1, 1)) * index;
            const y = paddingYTop + plotHeight - (point.intensity / 100) * plotHeight;

            if (index === 0) {
                pathData = `M ${x} ${y}`;
            } else {
                pathData += ` L ${x} ${y}`;
            }

            // --- ÉTIQUETTES AXE X (Breadcrumbs) ---
            // On ne l'affiche que si ça change (ou pour le premier point)
            const structuralInfo = point.description.split(' > ');
            const actTitle = structuralInfo[0];
            const chapterTitle = structuralInfo[1];
            const sceneTitle = structuralInfo[2];

            if (actTitle !== currentActRef) {
                // Changement d'acte : Marqueur fort
                structuralLabels += `
                    <line x1="${x}" y1="${axisY}" x2="${x}" y2="${axisY + 40}" stroke="var(--accent-gold)" stroke-width="2" />
                    <text x="${x + 5}" y="${axisY + 15}" fill="var(--accent-gold)" font-weight="bold" font-size="12" transform="rotate(45 ${x + 5} ${axisY + 15})">${actTitle}</text>
                `;
                currentActRef = actTitle;
            }

            if (chapterTitle !== currentChapterRef) {
                // Chapitre : on affiche le titre avec une rotation plus forte si nécessaire
                structuralLabels += `
                    <line x1="${x}" y1="${axisY}" x2="${x}" y2="${axisY + 10}" stroke="var(--border-color)" stroke-width="1" />
                    <text x="${x}" y="${axisY + 50}" fill="var(--text-muted)" font-size="10" transform="rotate(60 ${x} ${axisY + 50})">${chapterTitle}</text>
                `;
                currentChapterRef = chapterTitle;
            }

            // Points cliquables avec zone de clic élargie pour ouverture facile
            pointsHTML += `
                        <g style="cursor: pointer;" onclick="openPlotPoint(${point.actId}, ${point.chapterId}, ${point.sceneId})" oncontextmenu="event.preventDefault(); openPlotPoint(${point.actId}, ${point.chapterId}, ${point.sceneId})">
                            <circle cx="${x}" cy="${y}" r="12" fill="transparent" />
                            <circle cx="${x}" cy="${y}" r="6" fill="var(--accent-gold)" stroke="white" stroke-width="2" class="plot-point-dot" />
                            <title>${point.description}
--------------------------------
Tension: ${Math.round(point.intensity)}%
--------------------------------
Clic pour ouvrir la scène</title>
                        </g>
                    `;
        });
    }

    container.innerHTML = `
                <div style="padding: 2rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                        <div>
                            <h3 style="margin: 0;"><i data-lucide="trending-up" style="width:18px;height:18px;vertical-align:middle;margin-right:6px;"></i>Graphique d'Intrigue</h3>
                            <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.5rem;">
                                📊 ${plotPoints.length} point(s) d'intrigue • 🎯 Tension moyenne: ${plotPoints.length > 0 ? Math.round(plotPoints.reduce((sum, p) => sum + p.intensity, 0) / plotPoints.length) : 0}%
                            </div>
                        </div>
                        <button onclick="openTensionWordsEditor()" 
                                style="padding: 10px 18px; background: #3a7bc8; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.9rem; font-weight: 500; transition: all 0.2s; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"
                                onmouseover="this.style.background='#2d6bb3'; this.style.boxShadow='0 4px 8px rgba(0,0,0,0.15)'"
                                onmouseout="this.style.background='#3a7bc8'; this.style.boxShadow='0 2px 4px rgba(0,0,0,0.1)'">
                            ✏️ Personnaliser les mots de tension
                        </button>
                    </div>
                    <div class="visualization-toolbar">
                        <button class="viz-tool-btn active">Vue d'ensemble</button>
                        <button class="viz-tool-btn" onclick="analyzePlotCurve()">🔍 Analyser la courbe</button>
                        <button class="viz-tool-btn" onclick="showPlotSuggestions()"><i data-lucide="lightbulb" style="width:14px;height:14px;vertical-align:middle;margin-right:4px;"></i>Suggestions</button>
                        <button class="viz-tool-btn" onclick="resetPlotPoints()">🔄 Recalculer</button>
                        <button class="viz-tool-btn" onclick="exportPlot()">📤 Exporter</button>
                    </div>
                    <div class="visualization-canvas">
                        <div class="plot-graph">
                            <svg width="100%" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}" id="plotSvg">
                                <!-- Grille -->
                                ${gridLines}
                                
                                <!-- Courbe -->
                                <path d="${pathData}" fill="none" stroke="var(--accent-gold)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
                                
                                <!-- Points -->
                                ${pointsHTML}
                                
                                <!-- Axes -->
                                <line x1="${paddingX}" y1="${axisY}" x2="${svgWidth - paddingX}" y2="${axisY}" 
                                      stroke="var(--text-primary)" stroke-width="2"/>
                                <line x1="${paddingX}" y1="${paddingYTop}" x2="${paddingX}" y2="${axisY}" 
                                      stroke="var(--text-primary)" stroke-width="2"/>
                                
                                <!-- Structural Labels -->
                                ${structuralLabels}
                                
                                <!-- Labels -->
                                <text x="${svgWidth / 2}" y="${svgHeight - 10}" text-anchor="middle" fill="var(--text-muted)" font-size="11" opacity="0.4">
                                    Progression du récit →
                                </text>
                                <text x="20" y="${axisY / 2}" text-anchor="middle" fill="var(--text-muted)" font-size="13" 
                                      transform="rotate(-90 20 ${axisY / 2})">
                                    ← Tension dramatique
                                </text>
                            </svg>
                        </div>
                    </div>
                    <div style="margin-top: 1rem; padding: 1rem; background: var(--bg-secondary); border-radius: 4px;">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                            <div>
                                <p style="font-size: 0.9rem; color: var(--text-secondary); line-height: 1.6; margin: 0;">
                                    💡 <strong>Utilisation:</strong><br>
                                    • <strong>Clic</strong> sur un point → Ouvrir la scène pour l'éditer<br>
                                • <strong>Affichage</strong> → Survoler un point pour voir : Acte > Chapitre > Scène<br>
                                • <strong>Intégration</strong> → La tension est calculée automatiquement selon votre texte<br>
                                • <strong>Analyser</strong> → Obtenez un rapport complet sur votre courbe<br>
                                • <strong>Suggestions</strong> → Conseils personnalisés pour améliorer l'intrigue
                                </p>
                            </div>
                            <div style="padding: 0.75rem; background: var(--bg-primary); border-radius: 4px; border: 1px solid var(--border-color);">
                                <div style="font-size: 0.85rem; font-weight: 600; margin-bottom: 0.5rem; color: var(--text-primary);">Calcul de la tension :</div>
                                <div style="font-size: 0.75rem; line-height: 1.6; color: var(--text-secondary);">
                                    • Analyse lexicale (mots-clés personnalisables)<br>
                                    • Longueur de la scène<br>
                                    • Ponctuation expressive<br>
                                    • Position narrative (structure en 3 actes)
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
}

// [MVVM : ViewModel]
// Bascule vers la vue éditeur et ouvre la scène correspondante au point d'intrigue sélectionné.
function openPlotPoint(actId, chapterId, sceneId) {
    switchView('editor');
    openScene(actId, chapterId, sceneId);
}

// [MVVM : ViewModel]
// Effectue une analyse statistique et narrative de la courbe de tension actuelle pour fournir un rapport.
function analyzePlotCurve() {
    if (plotPoints.length === 0) {
        alert('Aucun point à analyser. Créez d\'abord des scènes.');
        return;
    }

    // Analyse de la courbe
    const tensions = plotPoints.map(p => p.intensity);
    const avg = tensions.reduce((a, b) => a + b, 0) / tensions.length;
    const max = Math.max(...tensions);
    const min = Math.min(...tensions);
    const maxIndex = tensions.indexOf(max);
    const minIndex = tensions.indexOf(min);

    // Calcul de la variance (mesure de variation)
    const variance = tensions.reduce((sum, t) => sum + Math.pow(t - avg, 2), 0) / tensions.length;
    const stdDev = Math.sqrt(variance);

    // Détection du climax
    const lastThird = Math.floor(plotPoints.length * 0.66);
    const climaxInLastThird = maxIndex >= lastThird;

    // Analyse de la progression
    const firstHalf = tensions.slice(0, Math.floor(tensions.length / 2));
    const secondHalf = tensions.slice(Math.floor(tensions.length / 2));
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    const isRising = secondAvg > firstAvg;

    // Compter les pics (variations > 20%)
    let peaks = 0;
    for (let i = 1; i < tensions.length - 1; i++) {
        if (tensions[i] > tensions[i - 1] + 20 && tensions[i] > tensions[i + 1] + 20) {
            peaks++;
        }
    }

    // Rapport d'analyse
    let analysis = `📊 ANALYSE DE VOTRE COURBE D'INTRIGUE\n\n`;

    analysis += `📈 STATISTIQUES\n`;
    analysis += `• Tension moyenne : ${Math.round(avg)}%\n`;
    analysis += `• Tension max : ${Math.round(max)}% (${plotPoints[maxIndex].title})\n`;
    analysis += `• Tension min : ${Math.round(min)}% (${plotPoints[minIndex].title})\n`;
    analysis += `• Amplitude : ${Math.round(max - min)}%\n`;
    analysis += `• Variation : ${stdDev < 10 ? 'Faible' : stdDev < 20 ? 'Modérée' : 'Forte'}\n`;
    analysis += `• Nombre de pics : ${peaks}\n\n`;

    analysis += `🎯 ÉVALUATION NARRATIVE\n`;

    // Évaluation de la tension moyenne
    if (avg < 40) {
        analysis += `⚠️ Tension moyenne BASSE (${Math.round(avg)}%)\n`;
        analysis += `   → Votre histoire manque peut-être de conflits\n`;
    } else if (avg > 70) {
        analysis += `⚠️ Tension moyenne ÉLEVÉE (${Math.round(avg)}%)\n`;
        analysis += `   → Le lecteur risque la fatigue. Ajoutez des pauses\n`;
    } else {
        analysis += `✅ Tension moyenne équilibrée (${Math.round(avg)}%)\n`;
    }

    // Évaluation du climax
    if (climaxInLastThird) {
        analysis += `✅ Climax bien placé (dernier tiers du récit)\n`;
    } else {
        analysis += `⚠️ Climax trop tôt (${Math.round((maxIndex / plotPoints.length) * 100)}% du récit)\n`;
        analysis += `   → Le climax devrait être vers 70-80%\n`;
    }

    // Évaluation de la progression
    if (isRising) {
        analysis += `✅ Tension croissante (bon rythme)\n`;
    } else {
        analysis += `⚠️ Tension décroissante en moyenne\n`;
        analysis += `   → La seconde moitié perd en intensité\n`;
    }

    // Évaluation de la variation
    if (stdDev < 10) {
        analysis += `⚠️ Courbe trop PLATE\n`;
        analysis += `   → Créez plus de contraste entre action et repos\n`;
    } else if (stdDev > 25) {
        analysis += `⚠️ Courbe très IRRÉGULIÈRE\n`;
        analysis += `   → Peut-être intentionnel (action frénétique)?\n`;
    } else {
        analysis += `✅ Variation équilibrée\n`;
    }

    // Évaluation des pics
    if (peaks === 0) {
        analysis += `⚠️ Aucun pic majeur détecté\n`;
        analysis += `   → Ajoutez des moments de tension forte\n`;
    } else if (peaks > plotPoints.length / 3) {
        analysis += `⚠️ Trop de pics (${peaks})\n`;
        analysis += `   → Le lecteur n'a pas le temps de souffler\n`;
    } else {
        analysis += `✅ Nombre de pics approprié (${peaks})\n`;
    }

    analysis += `\n💡 Cliquez sur "Suggestions" pour des conseils détaillés`;

    alert(analysis);
}

// [MVVM : ViewModel]
// Propose des suggestions d'amélioration de l'intrigue basées sur l'analyse de la courbe (zones plates, rythme).
function showPlotSuggestions() {
    if (plotPoints.length === 0) {
        alert('Créez d\'abord des scènes pour obtenir des suggestions.');
        return;
    }

    const tensions = plotPoints.map(p => p.intensity);
    const avg = tensions.reduce((a, b) => a + b, 0) / tensions.length;

    let suggestions = `💡 SUGGESTIONS POUR AMÉLIORER VOTRE INTRIGUE\n\n`;

    // Analyser les zones plates
    let flatZones = [];
    for (let i = 0; i < tensions.length - 2; i++) {
        const range = tensions.slice(i, i + 3);
        const rangeAvg = range.reduce((a, b) => a + b, 0) / range.length;
        const rangeVariance = range.reduce((sum, t) => sum + Math.pow(t - rangeAvg, 2), 0) / range.length;
        if (rangeVariance < 5) {
            flatZones.push(i);
        }
    }

    if (flatZones.length > 0) {
        suggestions += `📉 ZONES PLATES DÉTECTÉES\n`;
        suggestions += `${flatZones.length} séquences manquent de variation.\n`;
        suggestions += `→ Ajoutez un rebondissement ou un obstacle\n`;
        suggestions += `→ Variez le rythme (alternez dialogue et action)\n\n`;
    }

    // Suggestions selon la tension moyenne
    if (avg < 40) {
        suggestions += `🔥 AUGMENTER LA TENSION GLOBALE\n`;
        suggestions += `→ Ajoutez plus de conflits entre personnages\n`;
        suggestions += `→ Créez des obstacles plus grands\n`;
        suggestions += `→ Utilisez des mots plus percutants\n`;
        suggestions += `→ Raccourcissez les scènes d'action\n\n`;
    } else if (avg > 70) {
        suggestions += `😌 CRÉER DES PAUSES\n`;
        suggestions += `→ Ajoutez des scènes de réflexion\n`;
        suggestions += `→ Moments de calme après l'action\n`;
        suggestions += `→ Dialogues intimes ou humoristiques\n`;
        suggestions += `→ Descriptions contemplatives\n\n`;
    }

    // Suggestions de structure
    suggestions += `📐 STRUCTURE RECOMMANDÉE\n`;
    suggestions += `• Début (0-25%) : 20-40% tension\n`;
    suggestions += `• Milieu (25-66%) : 40-60% tension\n`;
    suggestions += `• Fin (66-90%) : 60-90% tension (climax)\n`;
    suggestions += `• Résolution (90-100%) : 20-40% tension\n\n`;

    // Conseils pratiques
    suggestions += `✍️ TECHNIQUES CONCRÈTES\n`;
    suggestions += `→ Pour augmenter la tension :\n`;
    suggestions += `  • Ajoutez des deadlines\n`;
    suggestions += `  • Mettez en danger un personnage aimé\n`;
    suggestions += `  • Révélez un secret\n`;
    suggestions += `  • Créez un dilemme moral\n\n`;
    suggestions += `→ Pour diminuer la tension :\n`;
    suggestions += `  • Résolvez un conflit mineur\n`;
    suggestions += `  • Moment de victoire temporaire\n`;
    suggestions += `  • Scène de camaraderie\n`;
    suggestions += `  • Description paisible\n`;

    alert(suggestions);
}

// [MVVM : ViewModel]
// Réinitialise et recalcule tous les points de tension à partir des données brutes des scènes.
function resetPlotPoints() {
    if (confirm('Recalculer tous les points d\'intrigue ?\n\nLa tension sera recalculée automatiquement pour toutes les scènes.')) {
        plotPoints = [];
        renderPlotView();
        showNotification('✓ Points recalculés automatiquement');
    }
}

// [MVVM : View]
// Affiche une information à l'utilisateur expliquant que les points sont générés automatiquement.
function addPlotPoint() {
    alert('Les points sont générés automatiquement depuis vos scènes.\n\nPour ajuster la tension :\n• Clic gauche sur un point → Modifier manuellement\n• Clic droit sur un point → Ouvrir la scène');
}

// [MVVM : ViewModel]
// Exporte le graphique d'intrigue actuel au format SVG pour un usage externe.
function exportPlot() {
    const svg = document.getElementById('plotSvg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.title}_plot.svg`;
    a.click();
    URL.revokeObjectURL(url);
}
