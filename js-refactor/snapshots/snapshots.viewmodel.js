/**
 * Snapshots ViewModel
 * Manages the logic for version control operations.
 */
class SnapshotsViewModel {
    constructor(repository) {
        this.repository = repository;
        // Bind methods to ensure correct 'this' context when called from View
        this.createVersion = this.createVersion.bind(this);
        this.deleteVersion = this.deleteVersion.bind(this);
        this.restoreVersion = this.restoreVersion.bind(this);
        this.compareVersion = this.compareVersion.bind(this);
    }

    getVersions() {
        return this.repository.getAll().sort((a, b) =>
            new Date(b.timestamp) - new Date(a.timestamp)
        );
    }

    createVersion() {
        // Validation logic can be moved here or kept in View if simple prompt
        // For MVVM, usually View handles user input, ViewModel processes it.
        // But prompt() is a blocking UI call, often acceptable in VM for simple apps,
        // though strictly it should be a service or View callback. 
        // We'll stick to the original behavior but wrapped properly.

        const label = prompt('Nom de la version (ex: "Version 1.0", "Avant révision", etc.)');
        if (!label || !label.trim()) return false;

        const currentWordCount = this.repository.getCurrentWordCount();
        const newSnapshot = SnapshotModel.create(label, currentWordCount, project);

        this.repository.add(newSnapshot);
        return true; // Success
    }

    deleteVersion(id) {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette version ?')) return false;
        this.repository.remove(id);
        return true;
    }

    restoreVersion(id) {
        // Confirmation is UI logic, but can be here for simplicity/parity with old code
        if (!confirm('⚠️ ATTENTION: Restaurer cette version va remplacer votre travail actuel. Voulez-vous créer une sauvegarde avant de continuer ?')) {
            return false;
        }

        // Create backup of current state
        // We can reuse logic but we need to bypass prompt for fully automated backup or prompt user?
        // Old code called createVersion() which invoked prompt.
        // Let's call our internal create logic manually or reuse the public one if acceptable.
        // The old code: Create Version -> Prompted.
        // So we just call this.createVersion().
        this.createVersion();

        const version = this.repository.getById(id);
        if (!version) return false;

        this.repository.restoreProject(version.snapshot);
        return true;
    }

    compareVersion(id) {
        const version = this.repository.getById(id);
        if (!version) return null;

        const currentStats = this._calculateStats(this.repository.getCurrentState());
        const versionStats = this._calculateStats(version.snapshot);

        return {
            versionLabel: version.label,
            versionDate: version.timestamp,
            stats: [
                { label: 'Mots', key: 'words', current: currentStats.words, version: versionStats.words },
                { label: 'Actes', key: 'acts', current: currentStats.acts, version: versionStats.acts },
                { label: 'Chapitres', key: 'chapters', current: currentStats.chapters, version: versionStats.chapters },
                { label: 'Scènes', key: 'scenes', current: currentStats.scenes, version: versionStats.scenes },
                { label: 'Personnages', key: 'characters', current: currentStats.characters, version: versionStats.characters },
                { label: 'Lieux', key: 'locations', current: currentStats.locations, version: versionStats.locations },
                { label: 'Notes', key: 'notes', current: currentStats.notes, version: versionStats.notes },
                { label: 'Codex', key: 'codex', current: currentStats.codex, version: versionStats.codex },
                { label: 'Timeline', key: 'timeline', current: currentStats.timeline, version: versionStats.timeline },
                { label: 'Todos', key: 'todos', current: currentStats.todos, version: versionStats.todos }
            ]
        };
    }

    _calculateStats(data) {
        if (!data) return {};

        const acts = data.acts || [];
        let chaptersCount = 0;
        let scenesCount = 0;
        let wordCount = 0;

        acts.forEach(act => {
            const chapters = act.chapters || [];
            chaptersCount += chapters.length;
            chapters.forEach(chapter => {
                const scenes = chapter.scenes || [];
                scenesCount += scenes.length;
                scenes.forEach(scene => {
                    wordCount += (typeof getWordCount === 'function' ? getWordCount(scene.content) : (scene.content || '').split(/\s+/).length);
                });
            });
        });

        // Count todos recursively from all notes/scenes/etc if needed, 
        // but for now let's just count global todos if they exist or notes marked as todo.
        // Assuming simple length for main collections:
        return {
            words: wordCount,
            acts: acts.length,
            chapters: chaptersCount,
            scenes: scenesCount,
            characters: (data.characters || []).length,
            locations: (data.world || []).length,
            notes: (data.notes || []).length,
            codex: (data.codex || []).length,
            timeline: (data.timeline || []).length,
            todos: (data.todos || []).length // Assuming strictly the top level todos array if exists
        };
    }
}
