/**
 * Snapshots Module Main Entry Point
 * Initializes the MVVM components and exposes the necessary global interface.
 */

// Initialize module when DOM is ready or immediately if deferred
document.addEventListener('DOMContentLoaded', () => {
    // We can initialize here if needed, or lazily when accessed
});

// Create instances
const snapshotsRepository = new SnapshotsRepository();
const snapshotsViewModel = new SnapshotsViewModel(snapshotsRepository);
const snapshotsView = new SnapshotsView(snapshotsViewModel);

// Expose the main entry point expected by the application
window.renderVersionsList = function () {
    snapshotsView.render();
};

// Optional: Expose other methods if external scripts rely on them globally
// Although the View now handles interactions internally, we keep these 
// as a fallback or for console usage.
window.createVersion = function () {
    snapshotsViewModel.createVersion();
    if (document.getElementById(snapshotsView.containerId)?.contains(document.querySelector('.snapshots-container'))) {
        snapshotsView.render();
    }
};

window.deleteVersion = function (id) {
    if (snapshotsViewModel.deleteVersion(id)) {
        snapshotsView.render();
    }
};

window.restoreVersion = function (id) {
    if (snapshotsViewModel.restoreVersion(id)) {
        if (typeof switchView === 'function') switchView('editor');
        if (typeof renderActsList === 'function') renderActsList();
        alert('Version restaurée avec succès !');
    }
};

window.compareVersion = function (id) {
    snapshotsView.handleCompare(id);
};

console.log('Snapshots module initialized (MVVM)');
