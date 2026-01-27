import { injectBreathStyles } from './BreathStyles.js';

function tensionColor(t) {
    if (t < 25) return '#e4e4e4';
    if (t < 45) return '#cdbb6a';
    if (t < 65) return '#d9a441';
    if (t < 80) return '#c47b2a';
    return '#9e3a2a';
}

export function renderBreathView(container, state, onCut) {
    injectBreathStyles();
    container.innerHTML = '';

    state.paragraphs.forEach(p => {
        const row = document.createElement('div');
        row.className = 'breath-row';

        const marker = document.createElement('div');
        marker.className = 'breath-marker';
        marker.style.background = tensionColor(p.tension);

        const text = document.createElement('div');
        text.className = 'breath-text';
        text.textContent = p.text;

        row.append(marker, text);
        container.appendChild(row);

        if (p.cutSuggested) {
            const cut = document.createElement('div');
            cut.className = 'breath-cut';
            cut.textContent = '◦ ◦ ◦ Respiration suggérée';
            cut.onclick = () => onCut(p.index);
            container.appendChild(cut);
        }
    });
}
