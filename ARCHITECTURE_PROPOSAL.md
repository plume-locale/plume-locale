# 🏗️ Proposition d'Architecture - Plume Locale

## Philosophie

**Principes directeurs :**
- **Séparation des préoccupations** : UI / Logique / Données
- **Single Responsibility** : Chaque module fait une seule chose
- **DRY** : Pas de duplication, utilitaires réutilisables
- **Testabilité** : Logique découplée du DOM
- **Maintenabilité** : Structure claire et prévisible

---

## 📁 Nouvelle Structure de Dossiers

```
js/
├── 00-core/                    # Cœur de l'application
│   ├── 00.app.js              # Point d'entrée et orchestration
│   ├── 01.state.js            # Gestion de l'état global (store)
│   ├── 02.events.js           # Bus d'événements centralisé
│   └── 03.router.js           # Navigation entre vues
│
├── 01-infrastructure/          # Couche infrastructure
│   ├── storage.js             # Persistance (IndexedDB + localStorage)
│   ├── storage-monitoring.js  # Monitoring du stockage
│   ├── migration.js           # Migrations de données
│   └── logger.js              # Logging et debugging
│
├── 02-utils/                   # Utilitaires réutilisables
│   ├── dom.js                 # Helpers DOM (query, create, append)
│   ├── text.js                # Formatage texte (wordCount, normalize)
│   ├── array.js               # Manipulation tableaux
│   ├── date.js                # Formatage dates
│   ├── color.js               # Gestion couleurs
│   └── validators.js          # Validation de données
│
├── 03-services/               # Logique métier (Business Logic)
│   ├── project.service.js     # Gestion projets
│   ├── scene.service.js       # Logique scènes
│   ├── character.service.js   # Logique personnages
│   ├── location.service.js    # Logique lieux
│   ├── arc.service.js         # Logique arcs narratifs
│   ├── stats.service.js       # Calculs statistiques
│   ├── search.service.js      # Recherche globale
│   ├── export.service.js      # Export de données
│   └── auto-detect.service.js # Détection automatique
│
├── 04-models/                 # Modèles de données
│   ├── Project.js             # Modèle Projet
│   ├── Scene.js               # Modèle Scène
│   ├── Character.js           # Modèle Personnage
│   ├── Location.js            # Modèle Lieu
│   ├── Arc.js                 # Modèle Arc
│   └── Note.js                # Modèle Note
│
├── 05-ui/                     # Composants UI réutilisables
│   ├── modal.js               # Système de modales
│   ├── toast.js               # Notifications
│   ├── dropdown.js            # Menus déroulants
│   ├── sidebar.js             # Barre latérale
│   ├── toolbar.js             # Barre d'outils
│   └── forms.js               # Composants formulaires
│
├── 06-views/                  # Vues principales (MVC-style)
│   ├── structure/
│   │   ├── structure.view.js      # Controller de la vue
│   │   ├── structure.render.js    # Rendu HTML
│   │   ├── structure.handlers.js  # Événements
│   │   └── structure.state.js     # État local
│   │
│   ├── characters/
│   │   ├── characters.view.js
│   │   ├── characters.render.js
│   │   ├── characters.handlers.js
│   │   └── characters.templates.js
│   │
│   ├── locations/
│   │   ├── locations.view.js
│   │   ├── locations.render.js
│   │   └── locations.handlers.js
│   │
│   ├── timeline/
│   │   ├── timeline.view.js
│   │   ├── timeline.render.js
│   │   ├── timeline-metro.render.js
│   │   └── timeline.handlers.js
│   │
│   ├── corkboard/
│   │   ├── corkboard.view.js
│   │   ├── corkboard.render.js
│   │   └── corkboard.handlers.js
│   │
│   ├── mindmap/
│   │   ├── mindmap.view.js
│   │   ├── mindmap.canvas.js      # Logique canvas
│   │   ├── mindmap.render.js
│   │   └── mindmap.handlers.js
│   │
│   ├── arc-board/
│   │   ├── arc-board.view.js
│   │   ├── arc-board.canvas.js
│   │   ├── arc-board.render.js
│   │   ├── arc-board.handlers.js
│   │   └── arc-board.state.js
│   │
│   ├── storygrid/
│   │   ├── storygrid.view.js
│   │   ├── storygrid.canvas.js
│   │   ├── storygrid.render.js
│   │   ├── storygrid.handlers.js
│   │   └── storygrid.config.js
│   │
│   ├── relations-graph/
│   │   ├── relations-graph.view.js
│   │   ├── relations-graph.render.js
│   │   └── relations-graph.handlers.js
│   │
│   ├── stats/
│   │   ├── stats.view.js
│   │   └── stats.render.js
│   │
│   ├── notes/
│   │   ├── notes.view.js
│   │   └── notes.render.js
│   │
│   ├── codex/
│   │   ├── codex.view.js
│   │   └── codex.render.js
│   │
│   ├── todos/
│   │   ├── todos.view.js
│   │   └── todos.render.js
│   │
│   ├── plot/
│   │   ├── plot.view.js
│   │   └── plot.render.js
│   │
│   ├── tension/
│   │   ├── tension.view.js
│   │   └── tension.render.js
│   │
│   ├── revision/
│   │   ├── revision.view.js
│   │   └── revision.render.js
│   │
│   └── map/
│       ├── map.view.js
│       └── map.render.js
│
├── 07-features/               # Fonctionnalités transversales
│   ├── split-view/
│   │   ├── split-view.js
│   │   ├── split-view.render.js
│   │   └── split-view.handlers.js
│   │
│   ├── focus-mode/
│   │   ├── focus-mode.js
│   │   └── focus-mode.handlers.js
│   │
│   ├── drag-drop/
│   │   ├── drag-drop-acts.js
│   │   └── drag-drop.handlers.js
│   │
│   ├── undo-redo/
│   │   ├── undo-redo.js
│   │   └── history-manager.js
│   │
│   ├── snapshots/
│   │   ├── snapshots.js
│   │   └── scene-versions.js
│   │
│   ├── diff/
│   │   └── diff.js
│   │
│   ├── search/
│   │   ├── global-search.js
│   │   └── search.handlers.js
│   │
│   ├── import-export/
│   │   ├── import.js
│   │   ├── export.js
│   │   └── export-formats.js
│   │
│   └── theme/
│       ├── theme-manager.js
│       └── color-palette.js
│
├── 08-mobile/                 # Spécifique mobile
│   ├── mobile-menu.js
│   ├── mobile-swipe.js
│   ├── touch-events.js
│   ├── floating-editor.js
│   └── sidebar-views.js
│
└── 09-keyboard/               # Raccourcis clavier
    ├── keyboard-shortcuts.js
    └── keyboard-registry.js
```

---

## 🏛️ Architecture en Couches

```
┌─────────────────────────────────────────────────┐
│                    VIEWS                         │  Vue (UI)
│  Orchestration, rendu, événements utilisateur   │
└──────────────────┬──────────────────────────────┘
                   │ appelle
┌──────────────────▼──────────────────────────────┐
│                  SERVICES                        │  Logique Métier
│  Règles métier, calculs, transformations        │
└──────────────────┬──────────────────────────────┘
                   │ utilise
┌──────────────────▼──────────────────────────────┐
│                   MODELS                         │  Modèles de Données
│  Structure des données, validation               │
└──────────────────┬──────────────────────────────┘
                   │ persiste via
┌──────────────────▼──────────────────────────────┐
│              INFRASTRUCTURE                      │  Persistance
│  Storage, API, fichiers                         │
└─────────────────────────────────────────────────┘

       Tout le monde peut utiliser ↓

┌─────────────────────────────────────────────────┐
│                   UTILS                          │  Utilitaires
│  Fonctions pures, helpers                       │
└─────────────────────────────────────────────────┘
```

---

## 📐 Pattern Architectural : MVC Adapté

### **Exemple concret : Vue "Personnages"**

#### **1. Model** (`04-models/Character.js`)
```javascript
// RESPONSABILITÉ : Structure de données et validation

class Character {
    constructor(data = {}) {
        this.id = data.id || Date.now();
        this.name = data.name || '';
        this.description = data.description || '';
        this.color = data.color || '#3498db';
        this.aliases = data.aliases || [];
        this.relations = data.relations || [];
        this.scenes = data.scenes || [];
        this.createdAt = data.createdAt || Date.now();
        this.updatedAt = data.updatedAt || Date.now();
    }

    validate() {
        if (!this.name || this.name.trim() === '') {
            throw new Error('Le nom du personnage est requis');
        }
        return true;
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            color: this.color,
            aliases: this.aliases,
            relations: this.relations,
            scenes: this.scenes,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}
```

#### **2. Service** (`03-services/character.service.js`)
```javascript
// RESPONSABILITÉ : Logique métier pour les personnages

const CharacterService = {

    // CRUD Operations
    async create(characterData) {
        const character = new Character(characterData);
        character.validate();

        const state = StateManager.getState();
        state.project.characters.push(character);

        await StorageService.saveProject(state.project);
        EventBus.emit('character:created', character);

        return character;
    },

    async update(characterId, updates) {
        const character = this.findById(characterId);
        if (!character) throw new Error('Personnage introuvable');

        Object.assign(character, updates);
        character.updatedAt = Date.now();
        character.validate();

        await StorageService.saveProject(StateManager.getState().project);
        EventBus.emit('character:updated', character);

        return character;
    },

    async delete(characterId) {
        const state = StateManager.getState();
        const index = state.project.characters.findIndex(c => c.id === characterId);

        if (index === -1) throw new Error('Personnage introuvable');

        const character = state.project.characters.splice(index, 1)[0];

        // Nettoyer les références
        this.removeReferences(characterId);

        await StorageService.saveProject(state.project);
        EventBus.emit('character:deleted', characterId);

        return character;
    },

    // Queries
    findById(characterId) {
        const state = StateManager.getState();
        return state.project.characters.find(c => c.id === characterId);
    },

    findAll() {
        const state = StateManager.getState();
        return state.project.characters || [];
    },

    findByName(name) {
        const normalizedName = TextUtils.normalize(name);
        return this.findAll().filter(c =>
            TextUtils.normalize(c.name).includes(normalizedName)
        );
    },

    // Business Logic
    getCharacterScenes(characterId) {
        const state = StateManager.getState();
        return state.project.scenes.filter(scene =>
            scene.characters && scene.characters.includes(characterId)
        );
    },

    getCharacterStats(characterId) {
        const scenes = this.getCharacterScenes(characterId);
        const totalWords = scenes.reduce((sum, scene) =>
            sum + (scene.content?.split(/\s+/).length || 0), 0
        );

        return {
            sceneCount: scenes.length,
            wordCount: totalWords,
            firstAppearance: scenes[0]?.id,
            lastAppearance: scenes[scenes.length - 1]?.id
        };
    },

    removeReferences(characterId) {
        const state = StateManager.getState();

        // Retirer des scènes
        state.project.scenes.forEach(scene => {
            if (scene.characters) {
                scene.characters = scene.characters.filter(id => id !== characterId);
            }
        });

        // Retirer des relations d'autres personnages
        state.project.characters.forEach(char => {
            if (char.relations) {
                char.relations = char.relations.filter(r => r.characterId !== characterId);
            }
        });
    }
};
```

#### **3. View Controller** (`06-views/characters/characters.view.js`)
```javascript
// RESPONSABILITÉ : Orchestration de la vue

const CharactersView = {

    async init() {
        this.bindEvents();
        await this.render();
    },

    async render() {
        const characters = CharacterService.findAll();
        const html = CharactersRender.renderList(characters);

        const container = document.getElementById('characters-view');
        container.innerHTML = html;

        // Attacher les event handlers après le rendu
        CharactersHandlers.attachListHandlers();
    },

    async openAddModal() {
        const html = CharactersRender.renderAddModal();
        ModalUI.open('add-character-modal', html);
        CharactersHandlers.attachModalHandlers();
    },

    async openDetailModal(characterId) {
        const character = CharacterService.findById(characterId);
        if (!character) return;

        const stats = CharacterService.getCharacterStats(characterId);
        const html = CharactersRender.renderDetailModal(character, stats);

        ModalUI.open('character-detail-modal', html);
        CharactersHandlers.attachDetailHandlers(characterId);
    },

    bindEvents() {
        // Écouter les événements globaux
        EventBus.on('character:created', () => this.render());
        EventBus.on('character:updated', () => this.render());
        EventBus.on('character:deleted', () => this.render());
    },

    destroy() {
        EventBus.off('character:created');
        EventBus.off('character:updated');
        EventBus.off('character:deleted');
    }
};
```

#### **4. Render** (`06-views/characters/characters.render.js`)
```javascript
// RESPONSABILITÉ : Génération HTML (templates)

const CharactersRender = {

    renderList(characters) {
        if (characters.length === 0) {
            return this.renderEmptyState();
        }

        return `
            <div class="characters-list">
                <div class="characters-header">
                    <h2>Personnages</h2>
                    <button class="btn-add" data-action="add-character">
                        <i class="lucide-plus"></i> Ajouter
                    </button>
                </div>
                <div class="characters-grid">
                    ${characters.map(c => this.renderCard(c)).join('')}
                </div>
            </div>
        `;
    },

    renderCard(character) {
        return `
            <div class="character-card" data-character-id="${character.id}">
                <div class="character-color" style="background: ${character.color}"></div>
                <div class="character-content">
                    <h3>${DOMUtils.escape(character.name)}</h3>
                    <p class="character-description">
                        ${DOMUtils.escape(character.description || 'Pas de description')}
                    </p>
                    ${this.renderAliases(character.aliases)}
                </div>
                <div class="character-actions">
                    <button data-action="edit" data-character-id="${character.id}">
                        <i class="lucide-edit"></i>
                    </button>
                    <button data-action="delete" data-character-id="${character.id}">
                        <i class="lucide-trash"></i>
                    </button>
                </div>
            </div>
        `;
    },

    renderAliases(aliases) {
        if (!aliases || aliases.length === 0) return '';

        return `
            <div class="character-aliases">
                ${aliases.map(alias => `
                    <span class="alias-tag">${DOMUtils.escape(alias)}</span>
                `).join('')}
            </div>
        `;
    },

    renderAddModal() {
        return `
            <div class="modal-content">
                <h2>Nouveau personnage</h2>
                <form id="add-character-form">
                    <div class="form-group">
                        <label for="character-name">Nom *</label>
                        <input type="text" id="character-name" required>
                    </div>
                    <div class="form-group">
                        <label for="character-description">Description</label>
                        <textarea id="character-description" rows="4"></textarea>
                    </div>
                    <div class="form-group">
                        <label for="character-color">Couleur</label>
                        <input type="color" id="character-color" value="#3498db">
                    </div>
                    <div class="form-actions">
                        <button type="button" data-action="cancel">Annuler</button>
                        <button type="submit">Créer</button>
                    </div>
                </form>
            </div>
        `;
    },

    renderDetailModal(character, stats) {
        return `
            <div class="modal-content character-detail">
                <h2>${DOMUtils.escape(character.name)}</h2>

                <div class="character-stats">
                    <div class="stat">
                        <span class="stat-label">Scènes</span>
                        <span class="stat-value">${stats.sceneCount}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Mots</span>
                        <span class="stat-value">${TextUtils.formatWordCount(stats.wordCount)}</span>
                    </div>
                </div>

                <div class="character-info">
                    <h3>Description</h3>
                    <p>${DOMUtils.escape(character.description || 'Aucune description')}</p>
                </div>

                ${this.renderRelations(character)}
                ${this.renderScenesList(stats)}
            </div>
        `;
    },

    renderEmptyState() {
        return `
            <div class="empty-state">
                <i class="lucide-users"></i>
                <h3>Aucun personnage</h3>
                <p>Commencez par créer votre premier personnage</p>
                <button class="btn-primary" data-action="add-character">
                    Créer un personnage
                </button>
            </div>
        `;
    }
};
```

#### **5. Handlers** (`06-views/characters/characters.handlers.js`)
```javascript
// RESPONSABILITÉ : Gestion des événements UI

const CharactersHandlers = {

    attachListHandlers() {
        // Délégation d'événements pour la liste
        const container = document.getElementById('characters-view');

        container.addEventListener('click', async (e) => {
            const action = e.target.closest('[data-action]')?.dataset.action;

            if (action === 'add-character') {
                await CharactersView.openAddModal();
            }
            else if (action === 'edit') {
                const characterId = parseInt(e.target.closest('[data-character-id]').dataset.characterId);
                await CharactersView.openDetailModal(characterId);
            }
            else if (action === 'delete') {
                const characterId = parseInt(e.target.closest('[data-character-id]').dataset.characterId);
                await this.handleDelete(characterId);
            }
        });

        // Double-clic pour ouvrir le détail
        container.addEventListener('dblclick', async (e) => {
            const card = e.target.closest('.character-card');
            if (card) {
                const characterId = parseInt(card.dataset.characterId);
                await CharactersView.openDetailModal(characterId);
            }
        });
    },

    attachModalHandlers() {
        const form = document.getElementById('add-character-form');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleCreate();
        });

        form.querySelector('[data-action="cancel"]').addEventListener('click', () => {
            ModalUI.close();
        });
    },

    attachDetailHandlers(characterId) {
        // Event handlers pour la modale de détail
        const modal = document.querySelector('.character-detail');

        modal.addEventListener('click', async (e) => {
            const action = e.target.closest('[data-action]')?.dataset.action;

            if (action === 'edit-field') {
                const field = e.target.dataset.field;
                await this.handleEditField(characterId, field);
            }
        });
    },

    async handleCreate() {
        const name = document.getElementById('character-name').value.trim();
        const description = document.getElementById('character-description').value.trim();
        const color = document.getElementById('character-color').value;

        try {
            await CharacterService.create({ name, description, color });
            ModalUI.close();
            ToastUI.success('Personnage créé avec succès');
        } catch (error) {
            ToastUI.error(error.message);
        }
    },

    async handleDelete(characterId) {
        const character = CharacterService.findById(characterId);
        const confirmed = await ModalUI.confirm(
            `Supprimer "${character.name}" ?`,
            'Cette action est irréversible.'
        );

        if (confirmed) {
            try {
                await CharacterService.delete(characterId);
                ToastUI.success('Personnage supprimé');
            } catch (error) {
                ToastUI.error(error.message);
            }
        }
    },

    async handleEditField(characterId, field) {
        const character = CharacterService.findById(characterId);
        const newValue = await ModalUI.prompt(`Modifier ${field}`, character[field]);

        if (newValue !== null) {
            try {
                await CharacterService.update(characterId, { [field]: newValue });
                ToastUI.success('Modifié avec succès');
            } catch (error) {
                ToastUI.error(error.message);
            }
        }
    }
};
```

---

## 🧩 Modules Clés

### **1. State Manager** (`00-core/01.state.js`)
```javascript
// Gestion centralisée de l'état avec réactivité

const StateManager = {
    _state: {
        project: null,
        currentView: 'structure',
        currentSceneId: null,
        currentActId: null,
        splitView: {
            active: false,
            leftSceneId: null,
            rightSceneId: null
        },
        ui: {
            sidebarOpen: true,
            focusMode: false,
            theme: 'light'
        }
    },

    _listeners: new Map(),

    getState() {
        return this._state;
    },

    setState(updates) {
        const oldState = { ...this._state };
        this._state = { ...this._state, ...updates };
        this._notifyListeners(oldState, this._state);
    },

    subscribe(path, callback) {
        if (!this._listeners.has(path)) {
            this._listeners.set(path, []);
        }
        this._listeners.get(path).push(callback);
    },

    _notifyListeners(oldState, newState) {
        this._listeners.forEach((callbacks, path) => {
            const oldValue = this._getValueByPath(oldState, path);
            const newValue = this._getValueByPath(newState, path);

            if (oldValue !== newValue) {
                callbacks.forEach(cb => cb(newValue, oldValue));
            }
        });
    },

    _getValueByPath(obj, path) {
        return path.split('.').reduce((acc, part) => acc?.[part], obj);
    }
};
```

### **2. Event Bus** (`00-core/02.events.js`)
```javascript
// Bus d'événements pour la communication découplée

const EventBus = {
    _events: new Map(),

    on(event, callback) {
        if (!this._events.has(event)) {
            this._events.set(event, []);
        }
        this._events.get(event).push(callback);
    },

    off(event, callback) {
        if (!this._events.has(event)) return;

        if (callback) {
            const callbacks = this._events.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) callbacks.splice(index, 1);
        } else {
            this._events.delete(event);
        }
    },

    emit(event, data) {
        if (!this._events.has(event)) return;

        this._events.get(event).forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`Error in event listener for "${event}":`, error);
            }
        });
    }
};
```

### **3. DOM Utils** (`02-utils/dom.js`)
```javascript
// Helpers DOM réutilisables

const DOMUtils = {
    query(selector, context = document) {
        return context.querySelector(selector);
    },

    queryAll(selector, context = document) {
        return Array.from(context.querySelectorAll(selector));
    },

    create(tag, attributes = {}, children = []) {
        const element = document.createElement(tag);

        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'className') {
                element.className = value;
            } else if (key === 'dataset') {
                Object.entries(value).forEach(([dataKey, dataValue]) => {
                    element.dataset[dataKey] = dataValue;
                });
            } else {
                element.setAttribute(key, value);
            }
        });

        children.forEach(child => {
            if (typeof child === 'string') {
                element.appendChild(document.createTextNode(child));
            } else {
                element.appendChild(child);
            }
        });

        return element;
    },

    empty(element) {
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
    },

    escape(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    show(element) {
        element.style.display = '';
    },

    hide(element) {
        element.style.display = 'none';
    },

    toggle(element, show) {
        element.style.display = show ? '' : 'none';
    }
};
```

---

## 📋 Plan de Migration Progressif

### **Phase 1 : Infrastructure** (1-2 semaines)
1. ✅ Créer la nouvelle structure de dossiers
2. ✅ Implémenter `StateManager`
3. ✅ Implémenter `EventBus`
4. ✅ Créer tous les fichiers utilitaires (`02-utils/`)
5. ✅ Migrer le système de storage

### **Phase 2 : Services** (2-3 semaines)
1. ✅ Créer les modèles (`04-models/`)
2. ✅ Créer les services (`03-services/`)
   - Commencer par `character.service.js`
   - Puis `scene.service.js`
   - Puis `project.service.js`
3. ✅ Tester chaque service isolément

### **Phase 3 : Vues Simples** (3-4 semaines)
Refactoriser une vue à la fois en commençant par les plus simples :
1. ✅ `notes` (simple)
2. ✅ `todos` (simple)
3. ✅ `characters` (moyenne)
4. ✅ `locations` (moyenne)
5. ✅ `stats` (moyenne)

### **Phase 4 : Vues Complexes** (4-6 semaines)
1. ✅ `structure` (complexe - cœur de l'app)
2. ✅ `corkboard` (complexe)
3. ✅ `timeline` (complexe)
4. ✅ `mindmap` (très complexe)
5. ✅ `arc-board` (très complexe - 3,300 lignes)
6. ✅ `storygrid` (très complexe - 3,200 lignes)

### **Phase 5 : Features Transversales** (2-3 semaines)
1. ✅ Split-view
2. ✅ Focus mode
3. ✅ Undo/redo
4. ✅ Search
5. ✅ Import/export

### **Phase 6 : Mobile & Polish** (1-2 semaines)
1. ✅ Mobile handlers
2. ✅ Keyboard shortcuts
3. ✅ Tests
4. ✅ Optimisations

---

## 🎯 Avantages de Cette Architecture

### **1. Séparation des Préoccupations**
- ✅ Logique métier isolée (Services)
- ✅ UI découplée des données (Views)
- ✅ État centralisé (State Manager)

### **2. Testabilité**
```javascript
// Service testable sans DOM
test('CharacterService.create', () => {
    const char = CharacterService.create({ name: 'Test' });
    expect(char.name).toBe('Test');
});

// Render testable isolément
test('CharactersRender.renderCard', () => {
    const html = CharactersRender.renderCard({ name: 'Test', id: 1 });
    expect(html).toContain('Test');
});
```

### **3. Réutilisabilité**
- Services réutilisables partout
- Composants UI réutilisables
- Utilitaires partagés

### **4. Maintenabilité**
- Structure prévisible
- Fichiers de taille raisonnable (<500 lignes)
- Responsabilités claires

### **5. Scalabilité**
- Facile d'ajouter de nouvelles vues
- Facile d'ajouter de nouvelles fonctionnalités
- Pattern répétable

---

## 📊 Comparaison Avant/Après

| Critère | Avant | Après |
|---------|-------|-------|
| Fichiers | 45 monolithiques | ~120 modulaires |
| Taille moyenne | 570 lignes | 200 lignes |
| Séparation | ❌ Mélangée | ✅ Claire |
| Testabilité | ❌ Difficile | ✅ Facile |
| Réutilisabilité | ❌ Faible | ✅ Élevée |
| État global | ❌ Anarchique | ✅ Centralisé |
| Flux de données | ❌ Implicite | ✅ Explicite |
| Maintenabilité | 4/10 | 9/10 |

---

## 🚀 Ordre de Chargement des Fichiers

```html
<!-- 1. Core -->
<script src="js/00-core/00.app.js"></script>
<script src="js/00-core/01.state.js"></script>
<script src="js/00-core/02.events.js"></script>
<script src="js/00-core/03.router.js"></script>

<!-- 2. Infrastructure -->
<script src="js/01-infrastructure/storage.js"></script>
<script src="js/01-infrastructure/migration.js"></script>

<!-- 3. Utils (peut être chargé en parallèle) -->
<script src="js/02-utils/dom.js"></script>
<script src="js/02-utils/text.js"></script>
<script src="js/02-utils/array.js"></script>
<script src="js/02-utils/date.js"></script>
<script src="js/02-utils/color.js"></script>
<script src="js/02-utils/validators.js"></script>

<!-- 4. Models -->
<script src="js/04-models/Project.js"></script>
<script src="js/04-models/Scene.js"></script>
<script src="js/04-models/Character.js"></script>
<script src="js/04-models/Location.js"></script>
<script src="js/04-models/Arc.js"></script>
<script src="js/04-models/Note.js"></script>

<!-- 5. Services -->
<script src="js/03-services/project.service.js"></script>
<script src="js/03-services/scene.service.js"></script>
<script src="js/03-services/character.service.js"></script>
<script src="js/03-services/location.service.js"></script>
<script src="js/03-services/arc.service.js"></script>
<script src="js/03-services/stats.service.js"></script>
<script src="js/03-services/search.service.js"></script>

<!-- 6. UI Components -->
<script src="js/05-ui/modal.js"></script>
<script src="js/05-ui/toast.js"></script>
<script src="js/05-ui/dropdown.js"></script>

<!-- 7. Views (charger selon la vue active ou lazy-load) -->
<script src="js/06-views/structure/structure.view.js"></script>
<script src="js/06-views/characters/characters.view.js"></script>
<!-- ... autres vues ... -->

<!-- 8. Features -->
<script src="js/07-features/undo-redo/undo-redo.js"></script>
<script src="js/07-features/split-view/split-view.js"></script>
<!-- ... autres features ... -->

<!-- 9. Keyboard & Mobile -->
<script src="js/09-keyboard/keyboard-shortcuts.js"></script>
<script src="js/08-mobile/mobile-menu.js"></script>
```

---

## 💡 Bonnes Pratiques à Suivre

### **1. Chaque fichier = Une responsabilité**
```javascript
// ❌ Mauvais : Tout dans un fichier
function renderCharacters() { ... }
function saveCharacter() { ... }
function calculateCharacterStats() { ... }

// ✅ Bon : Séparé par responsabilité
// characters.render.js
function renderCharacters() { ... }

// characters.service.js
function saveCharacter() { ... }
function calculateCharacterStats() { ... }
```

### **2. Pas de manipulation DOM dans les services**
```javascript
// ❌ Mauvais
CharacterService.create = function(data) {
    const char = new Character(data);
    document.getElementById('list').innerHTML += renderCard(char);
    return char;
};

// ✅ Bon
CharacterService.create = function(data) {
    const char = new Character(data);
    EventBus.emit('character:created', char);
    return char;
};

// La vue écoute l'événement et met à jour le DOM
EventBus.on('character:created', () => CharactersView.render());
```

### **3. Utiliser le State Manager pour l'état global**
```javascript
// ❌ Mauvais : Variable globale
let currentSceneId = 123;

// ✅ Bon : State Manager
StateManager.setState({ currentSceneId: 123 });
const sceneId = StateManager.getState().currentSceneId;
```

### **4. Communication via EventBus**
```javascript
// ❌ Mauvais : Couplage direct
function deleteCharacter(id) {
    CharacterService.delete(id);
    CharactersView.render();
    StatsView.update();
    TimelineView.refresh();
}

// ✅ Bon : Découplage via événements
function deleteCharacter(id) {
    CharacterService.delete(id); // Émet 'character:deleted'
}

// Les vues écoutent
EventBus.on('character:deleted', () => CharactersView.render());
EventBus.on('character:deleted', () => StatsView.update());
EventBus.on('character:deleted', () => TimelineView.refresh());
```

### **5. Templates lisibles**
```javascript
// ❌ Mauvais : Concaténation
html += '<div class="card" id="' + id + '">';
html += '<h3>' + name + '</h3>';
html += '</div>';

// ✅ Bon : Template literals
const template = `
    <div class="card" id="${id}">
        <h3>${DOMUtils.escape(name)}</h3>
    </div>
`;
```

---

## 📝 Conclusion

Cette architecture propose :
- ✅ **Séparation claire** : UI / Logique / Données
- ✅ **Modularité** : Fichiers <500 lignes, responsabilités uniques
- ✅ **Testabilité** : Services isolés du DOM
- ✅ **Maintenabilité** : Structure prévisible et répétable
- ✅ **Scalabilité** : Facile d'ajouter de nouvelles fonctionnalités
- ✅ **Performance** : Possibilité de lazy-loading des vues

**Temps estimé de refactoring complet : 3-4 mois**

**Recommandation :** Commencer par la Phase 1 (Infrastructure) et migrer progressivement les vues une par une, en maintenant la compatibilité avec l'ancien code pendant la transition.
