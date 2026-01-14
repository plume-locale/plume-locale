

# MVVM Refactoring - Quick Reference Guide

## Architecture Overview

```
┌─────────────────────────────────────────┐
│            USER INTERFACE               │  📱 View Layer
│  (HTML/CSS rendered by render.js)       │
└────────────────┬────────────────────────┘
                 │ user clicks, types, submits
                 ↓
┌─────────────────────────────────────────┐
│        EVENT HANDLERS                   │  🎮 Handler Layer
│  (handlers.js - pure logic)             │
└────────────────┬────────────────────────┘
                 │ calls service methods
                 ↓
┌─────────────────────────────────────────┐
│        BUSINESS LOGIC                   │  💼 Service Layer
│  (*.service.js - CRUD, queries, rules)  │
└────────────────┬────────────────────────┘
                 │ creates/updates instances
                 ↓
┌─────────────────────────────────────────┐
│          DATA MODELS                    │  📦 Model Layer
│  (*.js classes - structure & validate)  │
└────────────────┬────────────────────────┘
                 │ persists to
                 ↓
┌─────────────────────────────────────────┐
│        STORAGE SERVICE                  │  💾 Storage Layer
│  (IndexedDB, localStorage, files)       │
└─────────────────────────────────────────┘
```

---

## File Structure Pattern

Each major view follows this pattern:

```
06-views/characters/
├── characters.view.js        (60-100 lines)
│   └─ Orchestration, lifecycle
├── characters.render.js      (400-600 lines)
│   └─ Pure HTML generation
└── characters.handlers.js    (300-400 lines)
    └─ Event listeners & handlers
```

---

## Creating a New Service

### Step 1: Define the Model (04-models/)
```javascript
// 04-models/Character.js
class Character {
    constructor(data = {}) {
        this.id = data.id || Date.now();
        this.name = data.name || '';
        // ... more properties
    }
    
    validate() {
        if (!this.name) throw new Error('Name required');
    }
    
    toJSON() {
        return { id: this.id, name: this.name, ... };
    }
}
```

### Step 2: Create the Service (03-services/)
```javascript
// 03-services/character.service.js
const CharacterService = (() => {
    async function create(data) {
        const instance = new Character(data);
        instance.validate();
        // Save and emit events
        await StorageService.save(instance);
        EventBus.emit('character:created', instance);
        return instance;
    }
    
    function findById(id) {
        const state = StateManager.get('project');
        return state.characters?.find(c => c.id === id);
    }
    
    // ... more methods
    
    return {
        create,
        findById,
        // ... public API
    };
})();
```

### Step 3: Create View Render (06-views/name/)
```javascript
// 06-views/characters/characters.render.js
const CharactersRender = (() => {
    function renderList(items) {
        return items.map(item => `
            <div onclick="CharactersView.openDetail(${item.id})">
                ${item.name}
            </div>
        `).join('');
    }
    
    return { renderList, ... };
})();
```

### Step 4: Create View Handlers (06-views/name/)
```javascript
// 06-views/characters/characters.handlers.js
const CharactersHandlers = (() => {
    async function handleAddCharacter() {
        const name = document.getElementById('name').value;
        await CharacterService.create({ name });
        CharactersView.render();
    }
    
    return { handleAddCharacter, ... };
})();
```

### Step 5: Create View Controller (06-views/name/)
```javascript
// 06-views/characters/characters.view.js
const CharactersView = (() => {
    async function render() {
        const items = CharacterService.findAll();
        const html = CharactersRender.renderList(items);
        document.getElementById('container').innerHTML = html;
        CharactersHandlers.attachListeners();
    }
    
    async function openDetail(id) {
        const item = CharacterService.findById(id);
        const html = CharactersRender.renderDetail(item);
        document.getElementById('editor').innerHTML = html;
    }
    
    return { render, openDetail, ... };
})();
```

---

## Common Patterns

### Service Query Pattern
```javascript
// Find by ID
const item = CharacterService.findById(123);

// Find all
const all = CharacterService.findAll();

// Find with filter
const matches = CharacterService.findByName('Aragorn');

// Get related data
const scenes = CharacterService.getCharacterScenes(characterId);
const stats = CharacterService.getCharacterStats(characterId);
```

### Service Mutation Pattern
```javascript
// Create
const newItem = await CharacterService.create(data);

// Update
const updated = await CharacterService.update(id, changes);

// Delete
await CharacterService.remove(id);
```

### Event Subscription Pattern
```javascript
// Listen for events
EventBus.on('character:created', (char) => {
    console.log('New character:', char.name);
});

// Emit events (usually done in service)
EventBus.emit('character:created', newCharacter);

// Clean up
EventBus.off('character:created', handler);
```

### Render HTML Pattern
```javascript
// Simple list
function renderList(items) {
    return `<div>${items.map(item => item.name).join(', ')}</div>`;
}

// With safe escaping
function renderDetail(item) {
    return `<h2>${DOMUtils.escape(item.name)}</h2>`;
}

// With event delegation
function renderButtons(id) {
    return `
        <button data-action="edit" data-id="${id}">Edit</button>
        <button data-action="delete" data-id="${id}">Delete</button>
    `;
}
```

### Handler Event Pattern
```javascript
function attachListHandlers() {
    document.addEventListener('click', (e) => {
        if (e.target.matches('[data-action="edit"]')) {
            const id = e.target.dataset.id;
            CharactersView.openDetail(id);
        }
    });
}
```

---

## Data Flow Example: Creating a Character

```
1. USER TYPES & CLICKS "CREATE"
   └─ Form submission in modal

2. HANDLER PROCESSES INPUT
   CharactersHandlers.handleAddCharacter()
   └─ Gets form values, validates format

3. CALLS SERVICE
   await CharacterService.create(data)
   └─ Service validates with model
   └─ Service saves to storage
   └─ Service emits event

4. VIEW REACTS TO EVENT
   EventBus.on('character:created')
   └─ Calls CharactersView.render()

5. RENDER GENERATES HTML
   CharactersRender.renderList(characters)
   └─ Creates fresh HTML

6. ATTACH HANDLERS
   CharactersHandlers.attachListHandlers()
   └─ Ready for next interaction
```

---

## State Management

### Global State
```javascript
// Get entire state
const state = StateManager.get();

// Get specific property
const project = StateManager.get('project');

// Set state
StateManager.set('project', updatedProject);

// Listen for changes
StateManager.on('project', (newProject) => {
    console.log('Project changed');
});
```

### Service State
Services work with the global state:
```javascript
// In service
const state = StateManager.get('project');
state.characters.push(newCharacter);
StateManager.set('project', state);
```

---

## Testing Services (No DOM Required)

```javascript
// Test character creation
const char = await CharacterService.create({
    name: 'Test Character'
});
console.assert(char.id, 'Should have ID');
console.assert(char.name === 'Test Character', 'Should have name');

// Test find
const found = CharacterService.findById(char.id);
console.assert(found.name === 'Test Character', 'Should find character');

// Test update
const updated = await CharacterService.update(char.id, {
    role: 'Protagonist'
});
console.assert(updated.role === 'Protagonist', 'Should update role');

// Test delete
await CharacterService.remove(char.id);
const deleted = CharacterService.findById(char.id);
console.assert(!deleted, 'Should be deleted');
```

---

## Best Practices

### ✅ DO

- Keep models simple (just data structure)
- Keep services focused (one entity type)
- Keep handlers short (delegate to service)
- Keep render pure (no side effects)
- Use consistent naming conventions
- Document public APIs
- Validate input in model.validate()
- Emit events for all state changes

### ❌ DON'T

- Don't put DOM manipulation in service
- Don't put business logic in handlers
- Don't put service calls in render
- Don't mutate state directly (use service)
- Don't have circular dependencies
- Don't use global variables (use StateManager)
- Don't put data in localStorage manually (use StorageService)

---

## Quick Checklist for New View

- [ ] Create Model in 04-models/ (if new entity type)
- [ ] Create Service in 03-services/ (if new entity type)
- [ ] Create *.render.js with templates
- [ ] Create *.handlers.js with event listeners
- [ ] Create *.view.js with orchestration
- [ ] Add to HTML in correct script order
- [ ] Test basic CRUD operations
- [ ] Test event subscriptions
- [ ] Ensure proper cleanup on destroy

---

## Common Issues & Solutions

### "Service not defined"
**Cause**: Script loading order
**Fix**: Load models before services, services before views
```html
<script src="04-models/Character.js"></script>
<script src="03-services/character.service.js"></script>
<script src="06-views/characters/characters.render.js"></script>
<script src="06-views/characters/characters.handlers.js"></script>
<script src="06-views/characters/characters.view.js"></script>
```

### "Changes not persisting"
**Cause**: Forgot to call await StorageService.save()
**Fix**: All services should persist changes
```javascript
// In service
await StorageService.saveProject(updatedProject);
```

### "UI not updating"
**Cause**: Forgot to emit event or re-render
**Fix**: Services emit, views listen and re-render
```javascript
EventBus.emit('character:created', char);
// View subscribes: EventBus.on('character:created', () => render())
```

### "Stale references after delete"
**Cause**: Didn't clean up references
**Fix**: Services have removeReferences() for cleanup
```javascript
async function remove(id) {
    removeReferences(id); // Clean up all links
    // ... then delete
}
```

---

## Resources

- **Architecture Proposal**: See ARCHITECTURE_PROPOSAL.md
- **Progress Tracking**: See MVVM_REFACTOR_PROGRESS.md
- **Example Implementation**: See js/06-views/characters/
- **Model Examples**: See js/04-models/
- **Service Examples**: See js/03-services/

---

**Happy Refactoring!** 🚀
