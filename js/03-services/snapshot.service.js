/**
 * Snapshot Service (Versions)
 * Gestion des snapshots/versions du projet
 */

const SnapshotService = (() => {
    'use strict';

    function create(label) {
        const state = StateManager.getState();
        const project = state.project;

        if (!project.versions) project.versions = [];

        const totalWords = StatsService ? StatsService.calculateStats(project).totalWords : 0;

        const snapshot = {
            id: Date.now(),
            label: label || 'Version ' + new Date().toLocaleDateString(),
            timestamp: new Date().toISOString(),
            wordCount: totalWords,
            snapshot: JSON.parse(JSON.stringify({
                acts: project.acts || [],
                characters: project.characters || [],
                world: project.world || [],
                timeline: project.timeline || [],
                notes: project.notes || [],
                codex: project.codex || []
            }))
        };

        project.versions.push(snapshot);
        StateManager.setState({ project });

        if (window.StorageService) {
            StorageService.saveProject(project);
        }

        return snapshot;
    }

    function restore(id) {
        const state = StateManager.getState();
        const project = state.project;

        const version = project.versions?.find(v => v.id === id);
        if (!version) return false;

        // Créer backup avant restauration
        create('Backup avant restauration ' + new Date().toLocaleTimeString());

        // Restaurer
        Object.assign(project, {
            acts: JSON.parse(JSON.stringify(version.snapshot.acts || [])),
            characters: JSON.parse(JSON.stringify(version.snapshot.characters || [])),
            world: JSON.parse(JSON.stringify(version.snapshot.world || [])),
            timeline: JSON.parse(JSON.stringify(version.snapshot.timeline || [])),
            notes: JSON.parse(JSON.stringify(version.snapshot.notes || [])),
            codex: JSON.parse(JSON.stringify(version.snapshot.codex || []))
        });

        StateManager.setState({ project });

        if (window.StorageService) {
            StorageService.saveProject(project);
        }

        if (window.EventBus) {
            EventBus.emit('project:restored', { versionId: id });
        }

        return true;
    }

    function remove(id) {
        const state = StateManager.getState();
        const project = state.project;

        if (!project.versions) return false;

        project.versions = project.versions.filter(v => v.id !== id);
        StateManager.setState({ project });

        if (window.StorageService) {
            StorageService.saveProject(project);
        }

        return true;
    }

    function getAll() {
        const state = StateManager.getState();
        const versions = state.project?.versions || [];
        return [...versions].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    return { create, restore, remove, getAll };
})();

window.SnapshotService = SnapshotService;
window.createVersion = () => {
    const label = prompt('Nom de la version :');
    if (label && label.trim()) {
        SnapshotService.create(label.trim());
        if (window.ToastUI) ToastUI.success('Version créée');
        if (typeof renderVersionsList === 'function') renderVersionsList();
    }
};
window.restoreVersion = (id) => {
    if (confirm('⚠️ Restaurer cette version va créer une sauvegarde. Continuer ?')) {
        SnapshotService.restore(id);
        if (window.ToastUI) ToastUI.success('Version restaurée');
        if (window.Router) Router.navigate('structure');
        else if (typeof switchView === 'function') switchView('editor');
        if (typeof renderActsList === 'function') renderActsList();
    }
};
window.deleteVersion = (id) => {
    if (confirm('Supprimer cette version ?')) {
        SnapshotService.remove(id);
        if (window.ToastUI) ToastUI.success('Version supprimée');
        if (typeof renderVersionsList === 'function') renderVersionsList();
    }
};
window.compareVersion = (id) => {
    const versions = SnapshotService.getAll();
    const version = versions.find(v => v.id === id);
    if (!version) return;

    const state = StateManager.getState();
    const currentWords = StatsService ? StatsService.calculateStats(state.project).totalWords : 0;
    const diff = currentWords - version.wordCount;
    const diffText = diff > 0 ? '+' + diff : '' + diff;

    alert('Comparaison:\n\nSauvegardée: ' + version.wordCount.toLocaleString('fr-FR') + ' mots\nActuelle: ' + currentWords.toLocaleString('fr-FR') + ' mots\nDifférence: ' + diffText + ' mots');
};
