/**
 * Export Service
 * Export du récit en différents formats (DOCX, Markdown, TXT, HTML, EPUB)
 */

const ExportService = (() => {
    'use strict';

    let selectionState = {};

    function openModal() {
        const state = StateManager.getState();
        const project = state.project;
        
        // Initialize selection
        selectionState = {};
        project.acts.forEach(act => {
            selectionState['act-' + act.id] = true;
            act.chapters.forEach(chapter => {
                selectionState['chapter-' + chapter.id] = true;
                chapter.scenes.forEach(scene => {
                    selectionState['scene-' + scene.id] = true;
                });
            });
        });
        
        if (window.EventBus) EventBus.emit('export:opened');
    }

    function executeExport(format, options) {
        const state = StateManager.getState();
        const project = state.project;
        
        switch(format) {
            case 'markdown':
                return exportAsMarkdown(project, options);
            case 'txt':
                return exportAsTXT(project, options);
            case 'html':
                return exportAsHTML(project, options);
            case 'docx':
                return exportAsDOCX(project, options);
            case 'epub':
                return exportAsEPUB(project, options);
            default:
                console.error('[Export] Format inconnu:', format);
        }
    }

    function exportAsMarkdown(project, options) {
        let content = '# ' + project.title + '\n\n';
        
        project.acts.forEach((act, actIndex) => {
            if (!selectionState['act-' + act.id]) return;
            
            if (options.includeActTitles) {
                content += '## Acte ' + (actIndex + 1) + ': ' + act.title + '\n\n';
            }
            
            act.chapters.forEach((chapter, chapIndex) => {
                if (!selectionState['chapter-' + chapter.id]) return;
                
                content += '### Chapitre ' + (chapIndex + 1) + ': ' + chapter.title + '\n\n';
                
                chapter.scenes.forEach((scene, sceneIndex) => {
                    if (!selectionState['scene-' + scene.id]) return;
                    
                    if (options.includeSceneSubtitles && scene.title) {
                        content += '#### ' + scene.title + '\n\n';
                    }
                    
                    if (options.exportProse && scene.content) {
                        content += scene.content + '\n\n';
                    }
                    
                    if (sceneIndex < chapter.scenes.length - 1) {
                        const divider = options.sceneDivider || '***';
                        content += divider + '\n\n';
                    }
                });
            });
        });
        
        downloadFile(content, project.title + '.md', 'text/markdown');
    }

    function exportAsTXT(project, options) {
        let content = project.title + '\n\n';
        
        project.acts.forEach((act, actIndex) => {
            if (!selectionState['act-' + act.id]) return;
            
            if (options.includeActTitles) {
                content += 'ACTE ' + (actIndex + 1) + ': ' + act.title + '\n\n';
            }
            
            act.chapters.forEach((chapter, chapIndex) => {
                if (!selectionState['chapter-' + chapter.id]) return;
                
                content += 'Chapitre ' + (chapIndex + 1) + ': ' + chapter.title + '\n\n';
                
                chapter.scenes.forEach((scene, sceneIndex) => {
                    if (!selectionState['scene-' + scene.id]) return;
                    
                    if (options.exportProse && scene.content) {
                        const textContent = stripHTML(scene.content);
                        content += textContent + '\n\n';
                    }
                    
                    const divider = options.sceneDivider || '***';
                    content += divider + '\n\n';
                });
            });
        });
        
        downloadFile(content, project.title + '.txt', 'text/plain');
    }

    function exportAsHTML(project, options) {
        let html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>' + project.title + '</title></head><body>';
        html += '<h1>' + project.title + '</h1>';
        
        project.acts.forEach((act, actIndex) => {
            if (!selectionState['act-' + act.id]) return;
            
            if (options.includeActTitles) {
                html += '<h2>Acte ' + (actIndex + 1) + ': ' + act.title + '</h2>';
            }
            
            act.chapters.forEach((chapter, chapIndex) => {
                if (!selectionState['chapter-' + chapter.id]) return;
                
                html += '<h3>Chapitre ' + (chapIndex + 1) + ': ' + chapter.title + '</h3>';
                
                chapter.scenes.forEach((scene) => {
                    if (!selectionState['scene-' + scene.id]) return;
                    
                    if (options.exportProse && scene.content) {
                        html += '<div>' + scene.content + '</div>';
                    }
                });
            });
        });
        
        html += '</body></html>';
        downloadFile(html, project.title + '.html', 'text/html');
    }

    function exportAsDOCX(project, options) {
        console.log('[Export] DOCX export nécessite une bibliothèque externe');
        alert('Export DOCX nécessite une bibliothèque tierce. Utilisez Markdown ou HTML.');
    }

    function exportAsEPUB(project, options) {
        console.log('[Export] EPUB export nécessite une bibliothèque externe');
        alert('Export EPUB nécessite une bibliothèque tierce. Utilisez HTML.');
    }

    function stripHTML(html) {
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    }

    function downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    return {
        openModal,
        executeExport,
        getSelectionState: () => selectionState,
        setSelectionState: (state) => { selectionState = state; }
    };
})();

window.ExportService = ExportService;
window.openExportNovelModal = () => ExportService.openModal();
window.executeNovelExport = () => ExportService.executeExport('markdown', {});

console.log('[Export] Service initialisé');
