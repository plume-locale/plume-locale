# MVVM Refactoring - Continuation Guide

## 🎯 Current Status

**Phase 1: Foundation ✅ COMPLETE**
- ✅ Models layer created (Character, Scene, Location, Arc, Project)
- ✅ Services layer created (character, scene, location, arc services)
- ✅ Characters view refactored (view, render, handlers)
- ✅ Documentation created

**Phase 2: Views Refactoring 🚀 IN PROGRESS**

---

## 📋 Immediate Next Steps (Priority Order)

### 1. Structure View Refactoring (HIGH PRIORITY)
The structure view is complex but critical. Follow the characters pattern:

**Files to create/modify:**
- `js/06-views/structure/structure.render.js` - Create from scratch
- `js/06-views/structure/structure.view.js` - Refactor/enhance
- `js/06-views/structure/dragndrop-acts.js` - Keep for drag-drop logic

**What to render:**
- Acts (chapters) list
- Scenes within acts
- Add/edit/delete UI
- Drag-and-drop handlers

**Services needed:**
- Scene management (already exists: `scene.service.js`)
- Arc/structure logic (can extend from `arc.service.js`)

**Example structure for structure.view.js:**
```javascript
const StructureView = (() => {
    async function render() {
        const state = StateManager.get('project');
        const html = StructureRender.renderActs(state);
        document.getElementById('structure-view').innerHTML = html;
        StructureHandlers.attachListeners();
    }
    
    async function openSceneEditor(sceneId) {
        const scene = SceneService.findById(sceneId);
        const html = StructureRender.renderSceneEditor(scene);
        document.getElementById('editor-view').innerHTML = html;
    }
    
    return { render, openSceneEditor, ... };
})();
```

### 2. Scene Details Service (HIGH PRIORITY)
Create a comprehensive scene service if not fully implemented:

```javascript
// js/03-services/scene.service.js (already exists, may need enhancement)

// Should support:
- Full CRUD (already done)
- Word count tracking (already done)
- Scene linking/ordering (already done)
- Character/location associations (already done)
- Tension progression (add if missing)
```

### 3. Remaining Views Refactoring (MEDIUM PRIORITY)

Order of implementation (by complexity):
1. **Locations View** - Similar complexity to Characters
2. **Arc Board** - Display arcs, scene progression
3. **Timeline** - Display scenes chronologically
4. **Corkboard** - Visual organization
5. **Stats Views** - Read-only, display statistics
6. **Codex/Notes** - Simple list views
7. **Plot/Tension** - Visualization

---

## 🔧 How to Refactor Each View

### Template: Refactoring a View

Follow this exact pattern for every view:

#### Step 1: Analyze Current Code
```bash
# Read existing view code
# Identify:
# - What data it displays (find/query logic)
# - What user actions (create/update/delete)
# - What renders (HTML generation)
# - What events it needs (subscriptions)
```

#### Step 2: Create Service (if needed)
```javascript
// 03-services/newfeature.service.js
const NewFeatureService = (() => {
    // Implement CRUD
    // Implement queries
    // Emit events
    // Manage state
    return { create, findAll, update, remove, ... };
})();
```

#### Step 3: Create Render File
```javascript
// 06-views/newfeature/newfeature.render.js
const NewFeatureRender = (() => {
    function renderList(items) {
        // Generate HTML for list
        return `<div>...</div>`;
    }
    
    function renderDetail(item) {
        // Generate HTML for detail view
        return `<div>...</div>`;
    }
    
    return { renderList, renderDetail, ... };
})();
```

#### Step 4: Create Handlers File
```javascript
// 06-views/newfeature/newfeature.handlers.js
const NewFeatureHandlers = (() => {
    function attachListHandlers() {
        // Event delegation
        document.addEventListener('click', (e) => {
            // Handle clicks
        });
    }
    
    async function handleCreate() {
        // Get form data
        // Call service
        // Refresh view
    }
    
    return { attachListHandlers, handleCreate, ... };
})();
```

#### Step 5: Create View File
```javascript
// 06-views/newfeature/newfeature.view.js
const NewFeatureView = (() => {
    async function render() {
        const items = NewFeatureService.findAll();
        const html = NewFeatureRender.renderList(items);
        document.getElementById('container').innerHTML = html;
        NewFeatureHandlers.attachListHandlers();
    }
    
    function bindEvents() {
        EventBus.on('item:created', () => render());
        // ... other events
    }
    
    return { render, bindEvents, ... };
})();
```

---

## 🛠️ Implementation Checklist

For each view refactoring, use this checklist:

### Analysis Phase
- [ ] Read original view file completely
- [ ] Identify all queries/searches
- [ ] Identify all mutations (add/edit/delete)
- [ ] Identify all event handlers
- [ ] Identify all renders/templates
- [ ] List all dependencies

### Service Phase (if new entity)
- [ ] Create Model class
- [ ] Create Service IIFE
- [ ] Implement all CRUD
- [ ] Implement all queries
- [ ] Add event emissions
- [ ] Add reference cleanup
- [ ] Export public API

### Render Phase
- [ ] Create render IIFE
- [ ] Create list template
- [ ] Create detail template
- [ ] Create modal templates
- [ ] Create empty state
- [ ] Add helper functions
- [ ] Export all functions

### Handler Phase
- [ ] Create handler IIFE
- [ ] Attach list listeners
- [ ] Attach detail listeners
- [ ] Attach modal listeners
- [ ] Create event handlers
- [ ] Add form validation
- [ ] Call services
- [ ] Handle errors
- [ ] Export public API

### View Phase
- [ ] Create view IIFE
- [ ] Create init function
- [ ] Create render function
- [ ] Create detail functions
- [ ] Create modal functions
- [ ] Bind event subscriptions
- [ ] Create destroy function
- [ ] Export public API

### Testing Phase
- [ ] Test create operation
- [ ] Test read/find operations
- [ ] Test update operation
- [ ] Test delete operation
- [ ] Test event emissions
- [ ] Test reference cleanup
- [ ] Test UI rendering
- [ ] Test user interactions

---

## 📝 Specific Instructions for Structure View

The Structure view is the most complex. Here's detailed guidance:

### Current Data Model
```javascript
// Likely structure in project
project.acts = [{
    id: ...,
    title: ...,
    chapters: [{
        id: ...,
        title: ...,
        scenes: [{
            id: ...,
            title: ...,
            content: ...
        }]
    }]
}]
```

### Refactoring Strategy
1. **Don't change the data structure** - It works, just refactor UI
2. **Use existing Scene service** - It already handles scenes
3. **Create Scene service methods for acts/chapters** if missing:
   ```javascript
   SceneService.getScenesByAct(actId)
   SceneService.getScenesByChapter(chapterId)
   ```
4. **Focus on UI refactoring** - Render, handlers, view layers

### Render Examples
```javascript
// Render acts list
function renderActs(acts) {
    return acts.map(act => `
        <div class="act">
            <h3>${act.title}</h3>
            ${act.chapters.map(ch => renderChapter(ch)).join('')}
        </div>
    `).join('');
}

// Render scenes in chapter
function renderChapter(chapter) {
    return `
        <div class="chapter">
            <h4>${chapter.title}</h4>
            ${chapter.scenes.map(scene => renderScene(scene)).join('')}
        </div>
    `;
}

// Render individual scene
function renderScene(scene) {
    return `
        <div class="scene" data-scene-id="${scene.id}">
            <span>${scene.title}</span>
            <span class="word-count">${countWords(scene.content)}</span>
        </div>
    `;
}
```

### Handler Examples
```javascript
// Attach handlers
function attachListHandlers() {
    document.addEventListener('click', (e) => {
        if (e.target.matches('[data-scene-id]')) {
            const sceneId = e.target.dataset.sceneId;
            StructureView.openScene(sceneId);
        }
    });
    
    // Drag and drop
    document.addEventListener('dragstart', (e) => {
        if (e.target.matches('.scene')) {
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('sceneId', e.target.dataset.sceneId);
        }
    });
}

// Handle scene reordering
async function handleSceneDrop(fromIndex, toIndex) {
    await SceneService.reorderScenes(fromIndex, toIndex);
    StructureView.render();
}
```

---

## 🔌 Integration Points

When refactoring, ensure proper integration:

### State Management
```javascript
// Store project state
const state = StateManager.get('project');
state.scenes = updatedScenes;
StateManager.set('project', state);
```

### Event Bus
```javascript
// Services emit events
EventBus.emit('scene:created', scene);
EventBus.emit('scene:updated', scene);

// Views listen
EventBus.on('scene:created', () => StructureView.render());
```

### Storage Service
```javascript
// Services persist
await StorageService.saveProject(project);
```

### Modal Service
```javascript
// Views use modal
ModalUI.open('scene-editor', htmlContent);
ModalUI.close();
```

---

## 🚀 Quick Reference: Files to Create/Modify

### High Priority (Do Next)
```
js/06-views/structure/
├── structure.render.js          ⭐ CREATE
├── structure.view.js            ✏️ ENHANCE
├── structure.handlers.js        ✏️ UPDATE
└── dragndrop-acts.js           (keep existing)
```

### Medium Priority (Do After)
```
js/06-views/locations/
├── locations.render.js          ⭐ CREATE
├── locations.view.js            ⭐ CREATE
└── locations.handlers.js        ⭐ CREATE

js/06-views/timeline/
├── timeline.render.js           ⭐ CREATE
├── timeline.view.js             ⭐ CREATE
└── timeline.handlers.js         ⭐ CREATE
```

### Services Needed
```
js/03-services/
├── character.service.js         ✅ DONE
├── scene.service.js             ✅ DONE
├── location.service.js          ✅ DONE
├── arc.service.js               ✅ DONE
└── project.service.js           (exists, may enhance)
```

---

## 💡 Pro Tips

1. **Start with simple views** (stats, codex) before complex ones
2. **Reuse services** - Don't duplicate logic
3. **Test services first** - Before connecting to UI
4. **Use existing patterns** - Follow the characters view example exactly
5. **Keep renders pure** - No DOM queries, just HTML
6. **Keep handlers simple** - Mostly call services and refresh views
7. **Document APIs** - Comment what each function does
8. **Git commit frequently** - One view per commit

---

## 🎓 Learning Path

If you're learning this architecture:

1. Study the characters view implementation first
2. Understand the service pattern
3. Understand the render pattern
4. Understand the handler pattern
5. Understand the view orchestration pattern
6. Apply to a new simple view (stats, codex)
7. Apply to a complex view (structure, timeline)
8. Create a new view from scratch

---

## 📞 Support

If something is unclear:
- Check MVVM_QUICK_REFERENCE.md
- Check ARCHITECTURE_PROPOSAL.md
- Look at js/06-views/characters/ as example
- Look at js/03-services/ for service patterns
- Check js/04-models/ for model structure

---

**Ready to continue refactoring? Pick a view and follow the template!** 🚀
