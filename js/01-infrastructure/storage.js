// ============================================
// STORAGE SERVICE - Gestion de la persistance
// ============================================

/**
 * StorageService - Service de persistance des données
 *
 * Responsabilités :
 * - Gérer IndexedDB et localStorage
 * - Sauvegarder et charger les projets
 * - Migration des données
 * - Monitoring du stockage
 *
 * Usage :
 *   await StorageService.init();
 *   await StorageService.saveProject(project);
 *   const project = await StorageService.loadProject(id);
 */

const StorageService = (function() {
    'use strict';

    // Configuration
    const DB_NAME = 'PlumeDB';
    const DB_VERSION = 2;
    const STORE_PROJECTS = 'projects';
    const STORE_SETTINGS = 'settings';

    // État
    let _db = null;
    let _useLocalStorage = false;
    let _initialized = false;

    /**
     * Initialise le service de storage
     * @returns {Promise<boolean>}
     */
    async function init() {
        if (_initialized) {
            console.log('[Storage] Already initialized');
            return true;
        }

        try {
            console.log('[Storage] Initializing...');

            // Vérifier si IndexedDB est disponible
            if (!window.indexedDB) {
                console.warn('[Storage] IndexedDB not available, using localStorage');
                _useLocalStorage = true;
                _initialized = true;
                return true;
            }

            // Vérifier si idb est chargé
            if (typeof idb === 'undefined') {
                console.warn('[Storage] idb library not loaded, using localStorage');
                _useLocalStorage = true;
                _initialized = true;
                return true;
            }

            // Ouvrir ou créer la base de données
            _db = await idb.openDB(DB_NAME, DB_VERSION, {
                upgrade(db, oldVersion, newVersion) {
                    console.log(`[Storage] Upgrading DB from v${oldVersion} to v${newVersion}`);

                    // Créer les object stores
                    if (!db.objectStoreNames.contains(STORE_PROJECTS)) {
                        db.createObjectStore(STORE_PROJECTS, { keyPath: 'id' });
                        console.log('[Storage] Created "projects" store');
                    }

                    if (!db.objectStoreNames.contains(STORE_SETTINGS)) {
                        db.createObjectStore(STORE_SETTINGS);
                        console.log('[Storage] Created "settings" store');
                    }
                }
            });

            console.log('[Storage] ✓ IndexedDB initialized');

            // Migrer depuis localStorage si nécessaire
            await _migrateFromLocalStorage();

            _initialized = true;
            EventBus.emit('storage:ready');

            return true;

        } catch (error) {
            console.error('[Storage] Initialization error:', error);
            console.warn('[Storage] Falling back to localStorage');
            _useLocalStorage = true;
            _initialized = true;
            return true;
        }
    }

    /**
     * Migre les données depuis localStorage vers IndexedDB
     * @private
     */
    async function _migrateFromLocalStorage() {
        try {
            // Vérifier si déjà migré
            const migrated = await _db.get(STORE_SETTINGS, 'migrated_from_localStorage');
            if (migrated) {
                console.log('[Storage] Already migrated from localStorage');
                return;
            }

            console.log('[Storage] Checking for localStorage data...');

            // Récupérer anciennes données
            const oldData = localStorage.getItem('novelcraft_project');
            const oldProjects = localStorage.getItem('novelcraft_projects');
            const oldCurrentId = localStorage.getItem('novelcraft_currentProjectId');

            if (!oldData && !oldProjects) {
                console.log('[Storage] No data to migrate');
                await _db.put(STORE_SETTINGS, true, 'migrated_from_localStorage');
                return;
            }

            console.log('[Storage] Migrating data...');

            // Migrer le projet actuel
            if (oldData) {
                try {
                    const projectData = JSON.parse(oldData);

                    if (!projectData.id) {
                        projectData.id = Date.now();
                    }
                    if (!projectData.createdAt) {
                        projectData.createdAt = Date.now();
                    }
                    if (!projectData.updatedAt) {
                        projectData.updatedAt = Date.now();
                    }

                    await _db.put(STORE_PROJECTS, projectData);
                    console.log('[Storage] ✓ Migrated main project:', projectData.title);
                } catch (e) {
                    console.error('[Storage] Error migrating project:', e);
                }
            }

            // Migrer la liste des projets
            if (oldProjects) {
                try {
                    const projectsList = JSON.parse(oldProjects);
                    for (const proj of projectsList) {
                        const existing = await _db.get(STORE_PROJECTS, proj.id);
                        if (!existing) {
                            await _db.put(STORE_PROJECTS, proj);
                            console.log('[Storage] ✓ Migrated project:', proj.title);
                        }
                    }
                } catch (e) {
                    console.error('[Storage] Error migrating projects list:', e);
                }
            }

            // Migrer les settings
            if (oldCurrentId) {
                await _db.put(STORE_SETTINGS, oldCurrentId, 'currentProjectId');
            }

            await _db.put(STORE_SETTINGS, true, 'migrated_from_localStorage');
            console.log('[Storage] ✓ Migration complete');

        } catch (error) {
            console.error('[Storage] Migration error:', error);
        }
    }

    /**
     * Sauvegarde un projet
     * @param {Project} project - Projet à sauvegarder
     * @returns {Promise<boolean>}
     */
    async function saveProject(project) {
        try {
            const projectData = project instanceof Project ? project.toJSON() : project;
            projectData.updatedAt = Date.now();

            if (_useLocalStorage) {
                return _saveToLocalStorage(projectData);
            } else {
                await _db.put(STORE_PROJECTS, projectData);
                EventBus.emit('project:saved', projectData);
                return true;
            }
        } catch (error) {
            console.error('[Storage] Error saving project:', error);
            EventBus.emit('storage:error', { operation: 'save', error });
            return false;
        }
    }

    /**
     * Charge un projet
     * @param {number} projectId - ID du projet
     * @returns {Promise<Project|null>}
     */
    async function loadProject(projectId) {
        try {
            let projectData;

            if (_useLocalStorage) {
                projectData = _loadFromLocalStorage(projectId);
            } else {
                projectData = await _db.get(STORE_PROJECTS, projectId);
            }

            if (!projectData) {
                return null;
            }

            const project = new Project(projectData);
            EventBus.emit('project:loaded', project);

            return project;

        } catch (error) {
            console.error('[Storage] Error loading project:', error);
            EventBus.emit('storage:error', { operation: 'load', error });
            return null;
        }
    }

    /**
     * Liste tous les projets
     * @returns {Promise<Array>}
     */
    async function listProjects() {
        try {
            if (_useLocalStorage) {
                return _listFromLocalStorage();
            } else {
                const projects = await _db.getAll(STORE_PROJECTS);
                return projects.map(p => ({
                    id: p.id,
                    title: p.title,
                    description: p.description,
                    createdAt: p.createdAt,
                    updatedAt: p.updatedAt,
                    wordCount: _calculateWordCount(p)
                }));
            }
        } catch (error) {
            console.error('[Storage] Error listing projects:', error);
            return [];
        }
    }

    /**
     * Supprime un projet
     * @param {number} projectId
     * @returns {Promise<boolean>}
     */
    async function deleteProject(projectId) {
        try {
            if (_useLocalStorage) {
                return _deleteFromLocalStorage(projectId);
            } else {
                await _db.delete(STORE_PROJECTS, projectId);
                EventBus.emit('project:deleted', projectId);
                return true;
            }
        } catch (error) {
            console.error('[Storage] Error deleting project:', error);
            return false;
        }
    }

    /**
     * Sauvegarde un setting
     * @param {string} key
     * @param {*} value
     * @returns {Promise<boolean>}
     */
    async function saveSetting(key, value) {
        try {
            if (_useLocalStorage) {
                localStorage.setItem(`plume_setting_${key}`, JSON.stringify(value));
            } else {
                await _db.put(STORE_SETTINGS, value, key);
            }
            return true;
        } catch (error) {
            console.error('[Storage] Error saving setting:', error);
            return false;
        }
    }

    /**
     * Charge un setting
     * @param {string} key
     * @param {*} defaultValue
     * @returns {Promise<*>}
     */
    async function loadSetting(key, defaultValue = null) {
        try {
            if (_useLocalStorage) {
                const value = localStorage.getItem(`plume_setting_${key}`);
                return value ? JSON.parse(value) : defaultValue;
            } else {
                const value = await _db.get(STORE_SETTINGS, key);
                return value !== undefined ? value : defaultValue;
            }
        } catch (error) {
            console.error('[Storage] Error loading setting:', error);
            return defaultValue;
        }
    }

    /**
     * Exporte un projet en JSON
     * @param {number} projectId
     * @returns {Promise<string>}
     */
    async function exportProject(projectId) {
        const project = await loadProject(projectId);
        if (!project) return null;

        return JSON.stringify(project.toJSON(), null, 2);
    }

    /**
     * Importe un projet depuis JSON
     * @param {string} jsonData
     * @returns {Promise<Project|null>}
     */
    async function importProject(jsonData) {
        try {
            const data = JSON.parse(jsonData);

            // Générer un nouvel ID pour éviter les conflits
            data.id = Date.now();
            data.createdAt = Date.now();
            data.updatedAt = Date.now();

            const project = new Project(data);
            await saveProject(project);

            EventBus.emit('project:imported', project);
            return project;

        } catch (error) {
            console.error('[Storage] Error importing project:', error);
            return null;
        }
    }

    /**
     * Calcule l'usage du stockage
     * @returns {Promise<Object>}
     */
    async function getStorageInfo() {
        if (_useLocalStorage) {
            return _getLocalStorageInfo();
        }

        try {
            if (navigator.storage && navigator.storage.estimate) {
                const estimate = await navigator.storage.estimate();
                return {
                    usage: estimate.usage,
                    quota: estimate.quota,
                    percentage: Math.round((estimate.usage / estimate.quota) * 100),
                    usageFormatted: _formatBytes(estimate.usage),
                    quotaFormatted: _formatBytes(estimate.quota)
                };
            }
        } catch (error) {
            console.error('[Storage] Error getting storage info:', error);
        }

        return null;
    }

    /**
     * Helpers pour localStorage
     * @private
     */
    function _saveToLocalStorage(projectData) {
        try {
            localStorage.setItem(`plume_project_${projectData.id}`, JSON.stringify(projectData));

            // Mettre à jour la liste
            const list = _listFromLocalStorage();
            const existing = list.findIndex(p => p.id === projectData.id);

            if (existing === -1) {
                list.push({
                    id: projectData.id,
                    title: projectData.title,
                    updatedAt: projectData.updatedAt
                });
            } else {
                list[existing] = {
                    id: projectData.id,
                    title: projectData.title,
                    updatedAt: projectData.updatedAt
                };
            }

            localStorage.setItem('plume_projects_list', JSON.stringify(list));
            return true;
        } catch (error) {
            console.error('[Storage] localStorage save error:', error);
            return false;
        }
    }

    function _loadFromLocalStorage(projectId) {
        try {
            const data = localStorage.getItem(`plume_project_${projectId}`);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('[Storage] localStorage load error:', error);
            return null;
        }
    }

    function _listFromLocalStorage() {
        try {
            const list = localStorage.getItem('plume_projects_list');
            return list ? JSON.parse(list) : [];
        } catch (error) {
            return [];
        }
    }

    function _deleteFromLocalStorage(projectId) {
        try {
            localStorage.removeItem(`plume_project_${projectId}`);

            const list = _listFromLocalStorage();
            const filtered = list.filter(p => p.id !== projectId);
            localStorage.setItem('plume_projects_list', JSON.stringify(filtered));

            return true;
        } catch (error) {
            return false;
        }
    }

    function _getLocalStorageInfo() {
        let total = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                total += localStorage[key].length + key.length;
            }
        }

        return {
            usage: total,
            quota: 5 * 1024 * 1024, // Approximation 5MB
            percentage: Math.round((total / (5 * 1024 * 1024)) * 100),
            usageFormatted: _formatBytes(total),
            quotaFormatted: '~5 MB'
        };
    }

    function _calculateWordCount(projectData) {
        let total = 0;
        projectData.acts?.forEach(act => {
            act.chapters?.forEach(chapter => {
                chapter.scenes?.forEach(scene => {
                    total += TextUtils.countWords(scene.content || '');
                });
            });
        });
        return total;
    }

    function _formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }

    /**
     * Vérifie si le service est initialisé
     * @returns {boolean}
     */
    function isInitialized() {
        return _initialized;
    }

    /**
     * Vérifie si on utilise localStorage
     * @returns {boolean}
     */
    function isUsingLocalStorage() {
        return _useLocalStorage;
    }

    // API publique
    return {
        init,
        saveProject,
        loadProject,
        listProjects,
        deleteProject,
        saveSetting,
        loadSetting,
        exportProject,
        importProject,
        getStorageInfo,
        isInitialized,
        isUsingLocalStorage
    };
})();

// Exposer globalement
window.StorageService = StorageService;
