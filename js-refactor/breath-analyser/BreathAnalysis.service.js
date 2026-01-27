import { BreathConfig } from '../model/BreathConfig.js';

function canSuggestCut(prev, current, next) {
    if (current.tension > BreathConfig.highTensionThreshold) return false;
    if (prev && current.tension > prev.tension) return false;
    if (current.isDialogue && next?.isDialogue) return false;
    return true;
}

export function applyBreathingRules(paragraphs) {
    let accWords = 0;

    return paragraphs.map((p, i) => {
        accWords += p.text.split(/\s+/).length;

        const prev = paragraphs[i - 1];
        const next = paragraphs[i + 1];

        const cut =
            accWords >= BreathConfig.targetWordsPerPart &&
            canSuggestCut(prev, p, next);

        if (cut) accWords = 0;

        return { ...p, cutSuggested: cut };
    });
}
