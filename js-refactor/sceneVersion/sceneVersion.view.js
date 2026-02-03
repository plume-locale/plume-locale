/*
 * SCENE VERSION MODULE - VIEW
 * Handles DOM manipulation and event binding.
 */

const SceneVersionView = {
    elements: {
        sidebar: 'sidebarVersions',
        toggleBtn: 'headerVersionsToggle',
        toolBtn: 'toolVersionsBtn',
        listContainer: 'sceneVersionsList',
        sceneName: 'versionsSceneName',
        btnNewVersion: 'btnNewVersion',
        editor: 'sceneEditor'
    },

    get(id) {
        return document.getElementById(this.elements[id] || id);
    },

    getEditorContent() {
        const editor = this.get('editor');
        return editor ? editor.innerHTML : null;
    },

    updateSidebarVisibility(isVisible) {
        const sidebar = this.get('sidebar');
        const toggleBtn = this.get('toggleBtn');
        const toolBtn = this.get('toolVersionsBtn'); // Careful here, ID might be direct

        if (isVisible) {
            if (sidebar) sidebar.classList.remove('hidden');
            if (toggleBtn) {
                toggleBtn.classList.add('active');
                toggleBtn.title = 'Masquer les versions de scène';
            }
            if (toolBtn) toolBtn.classList.add('active');
        } else {
            if (sidebar) sidebar.classList.add('hidden');
            if (toggleBtn) {
                toggleBtn.classList.remove('active');
                toggleBtn.title = 'Afficher les versions de scène';
            }
            if (toolBtn) toolBtn.classList.remove('active');
        }
    },

    renderList(scene) {
        const listContainer = this.get('listContainer');
        const sceneNameEl = this.get('sceneName');
        const btnNewVersion = this.get('btnNewVersion');

        if (!listContainer) return;

        // Determine context again just for labels, or pass in
        // Ideally ViewModel passes necessary info. Let's rely on Repository calls if only scene is passed
        // For simplicity, re-fetch context to get titles
        const context = SceneVersionRepository.getCurrentScene();

        if (!context || !context.scene) {
            if (sceneNameEl) sceneNameEl.textContent = 'Aucune scène sélectionnée';
            if (btnNewVersion) btnNewVersion.disabled = true;
            listContainer.innerHTML = `
                <div class="versions-no-scene">
                    <div class="versions-no-scene-icon"><i data-lucide="file-text" style="width:48px;height:48px;opacity:0.3;"></i></div>
                    <div class="versions-no-scene-text">
                        Sélectionnez une scène<br>dans la structure<br>pour voir ses versions
                    </div>
                </div>
            `;
            if (typeof lucide !== 'undefined') lucide.createIcons();
            return;
        }

        const { act, chapter } = context;
        if (sceneNameEl) sceneNameEl.textContent = `${act.title} › ${chapter.title} › ${scene.title}`;
        if (btnNewVersion) btnNewVersion.disabled = false;

        const versions = scene.versions || [];

        if (versions.length === 0) {
            listContainer.innerHTML = `
                <div class="versions-empty">
                    <div class="versions-empty-icon"><i data-lucide="git-branch" style="width:48px;height:48px;"></i></div>
                    <div class="versions-empty-text">
                        Aucune version<br>
                        Créez votre première version pour tester différentes idées
                    </div>
                </div>
            `;
            if (typeof lucide !== 'undefined') lucide.createIcons();
            return;
        }

        // Sort
        const sorted = [...versions].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        let html = '';
        sorted.forEach(version => {
            const date = new Date(version.createdAt);
            const dateStr = date.toLocaleDateString('fr-FR');
            const timeStr = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
            const canCompare = versions.length >= 2;
            const isFinal = version.isFinal === true;
            const finalClass = isFinal ? 'final' : '';
            const activeClass = version.isActive ? 'active' : '';

            // Using global handlers that we will map in main.js
            html += `
                <div class="version-card ${activeClass} ${finalClass}" 
                     onclick="window.SceneVersionApp.switchTo('${version.id}')">
                    <div class="version-card-header">
                        <span class="version-card-number">
                            ${version.number}
                            ${isFinal ? '<span class="version-card-final-badge">Finale</span>' : ''}
                        </span>
                        <div class="version-card-actions">
                            <button class="version-card-btn final ${isFinal ? 'is-final' : ''}" 
                                onclick="event.stopPropagation(); window.SceneVersionApp.toggleFinal('${version.id}')" 
                                title="${isFinal ? 'Retirer comme version finale' : 'Marquer comme version finale'}">
                                <i data-lucide="star" style="width:14px;height:14px;"></i>
                            </button>
                            ${canCompare ? `<button class="version-card-btn compare" onclick="event.stopPropagation(); if(typeof openDiffModal === 'function') openDiffModal(${version.id}); else console.error('openDiffModal not found')" title="Comparer"><i data-lucide="git-compare" style="width:14px;height:14px;"></i></button>` : ''}
                            <button class="version-card-btn" onclick="event.stopPropagation(); window.SceneVersionApp.rename('${version.id}')" title="Renommer"><i data-lucide="pencil" style="width:14px;height:14px;"></i></button>
                            <button class="version-card-btn delete" onclick="event.stopPropagation(); window.SceneVersionApp.delete('${version.id}')" title="Supprimer"><i data-lucide="trash-2" style="width:14px;height:14px;"></i></button>
                        </div>
                    </div>
                    <div class="version-card-date">${dateStr} ${timeStr}</div>
                    <div class="version-card-stats">${(version.wordCount || 0).toLocaleString('fr-FR')} mots</div>
                    ${version.label ? `<div class="version-card-label">${version.label}</div>` : ''}
                </div>
            `;
        });

        listContainer.innerHTML = html;
        if (typeof lucide !== 'undefined') lucide.createIcons();
    },

    reattachAnnotationListeners() {
        const markers = document.querySelectorAll('[data-annotation-id]');
        markers.forEach(marker => {
            const annotationId = parseInt(marker.getAttribute('data-annotation-id'));
            marker.style.cursor = 'pointer';
            marker.onclick = function (e) {
                e.stopPropagation();
                if (typeof highlightAnnotation === 'function') highlightAnnotation(annotationId);
            };
        });
    }
};
