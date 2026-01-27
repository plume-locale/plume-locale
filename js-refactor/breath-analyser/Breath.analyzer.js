import { createParagraph } from './BreathTypes.js';

function wordCount(text) {
    return text.split(/\s+/).filter(Boolean).length;
}

function splitParagraphs(text) {
    return text
        .split(/\n{2,}/)
        .map(p => p.trim())
        .filter(Boolean);
}

function calculateParagraphTension(paragraph) {
    let tension = 0;
    const content = paragraph.toLowerCase();

    const tensionWords = getTensionWords?.() || {
        high: [], medium: [], low: []
    };

    tensionWords.high.forEach(w => content.includes(w) && (tension += 3));
    tensionWords.medium.forEach(w => content.includes(w) && (tension += 1.5));
    tensionWords.low.forEach(w => content.includes(w) && (tension -= 2));

    const wc = wordCount(content);
    tension += wc < 60 ? 6 : wc < 120 ? 4 : 2;

    const p = (content.match(/[!?]/g) || []).length;
    const s = (content.match(/\.\.\./g) || []).length;

    tension += Math.min(10, p * 0.4 + s * 0.8);

    return Math.max(0, Math.min(100, tension));
}

export function analyzeText(text) {
    return splitParagraphs(text).map((p, i) =>
        createParagraph({
            index: i,
            text: p,
            tension: calculateParagraphTension(p),
            isDialogue: p.startsWith("—") || p.startsWith("«")
        })
    );
}
