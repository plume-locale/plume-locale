export function createParagraph({
    index,
    text,
    tension,
    isDialogue,
    cutSuggested = false
}) {
    return {
        index,
        text,
        tension,
        isDialogue,
        cutSuggested
    };
}
