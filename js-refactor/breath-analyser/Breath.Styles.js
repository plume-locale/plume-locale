
let injected = false;

export function injectBreathStyles() {
    if (injected) return;
    injected = true;

    const style = document.createElement('style');
    style.textContent = `
        .breath-row { display:flex; margin-bottom:.8em }
        .breath-marker { width:5px; margin-right:12px; border-radius:3px }
        .breath-text { line-height:1.7; white-space:pre-wrap }
        .breath-cut { text-align:center; font-size:.8rem; color:#999; cursor:pointer }
        .breath-cut:hover { color:#555 }
    `;
    document.head.appendChild(style);
}
