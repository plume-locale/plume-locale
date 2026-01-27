import { analyzeText } from '../model/BreathAnalyzer.js';
import { applyBreathingRules } from '../service/BreathAnalysisService.js';

export class BreathViewModel {
    constructor() {
        this.enabled = false;
        this.paragraphs = [];
    }

    toggle(text) {
        this.enabled = !this.enabled;
        if (this.enabled) this.refresh(text);
    }

    refresh(text) {
        this.paragraphs = applyBreathingRules(analyzeText(text));
    }

    getViewState() {
        return {
            enabled: this.enabled,
            paragraphs: this.paragraphs
        };
    }

    confirmCut(index) {
        console.log("Découpe validée au paragraphe", index);
        // Hook vers ton système de scène
    }
}
