// Map Renderer UI - Rendu de cartes pour les lieux
const MapRendererUI = (() => {
    function render(locations) {
        // Version simplifiée du rendu de carte
        if (!locations || locations.length === 0) {
            return '<div style="text-align: center; padding: 2rem; color: var(--text-muted);">Aucun lieu à afficher sur la carte</div>';
        }

        let html = '<div class="map-container" style="position: relative; min-height: 400px; background: var(--bg-secondary); border-radius: 8px;">';
        
        locations.forEach((loc, index) => {
            const x = (loc.mapX || (index * 100 + 50)) % 100;
            const y = (loc.mapY || (index * 80 + 50)) % 100;
            
            html += '<div class="map-marker" style="position: absolute; left: ' + x + '%; top: ' + y + '%; transform: translate(-50%, -50%); cursor: pointer;" onclick="openWorldDetail(' + loc.id + ')">';
            html += '<div style="background: var(--accent-gold); width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>';
            html += '<div style="margin-top: 4px; font-size: 0.75rem; white-space: nowrap; background: rgba(0,0,0,0.7); padding: 2px 6px; border-radius: 4px;">' + loc.name + '</div>';
            html += '</div>';
        });
        
        html += '</div>';
        return html;
    }

    function renderMap() {
        const container = document.getElementById('editorView');
        if (!container) return;
        
        const state = StateManager.getState();
        const project = state.project;
        const locations = (project.world || []).filter(w => w.type === 'lieu');
        
        container.innerHTML = '<div style="padding: 2rem;"><h2>Carte des Lieux</h2>' + render(locations) + '</div>';
    }

    return { render, renderMap };
})();

window.MapRendererUI = MapRendererUI;
window.renderMap = () => MapRendererUI.renderMap();
