// Text Diff Utility - Comparaison de textes
const DiffUtils = (() => {
    function computeDiff(text1, text2) {
        // Algorithme simple de diff mot par mot
        const words1 = text1.split(/\s+/);
        const words2 = text2.split(/\s+/);
        const result = [];
        
        let i = 0, j = 0;
        while (i < words1.length || j < words2.length) {
            if (i >= words1.length) {
                result.push({ type: 'added', text: words2[j++] });
            } else if (j >= words2.length) {
                result.push({ type: 'removed', text: words1[i++] });
            } else if (words1[i] === words2[j]) {
                result.push({ type: 'unchanged', text: words1[i] });
                i++; j++;
            } else {
                result.push({ type: 'removed', text: words1[i++] });
                result.push({ type: 'added', text: words2[j++] });
            }
        }
        
        return result;
    }

    function renderDiff(diff) {
        return diff.map(item => {
            if (item.type === 'added') {
                return '<span style="background: #d4edda; color: #155724;">' + item.text + '</span>';
            } else if (item.type === 'removed') {
                return '<span style="background: #f8d7da; color: #721c24; text-decoration: line-through;">' + item.text + '</span>';
            }
            return item.text;
        }).join(' ');
    }

    return { computeDiff, renderDiff };
})();

window.DiffUtils = DiffUtils;
