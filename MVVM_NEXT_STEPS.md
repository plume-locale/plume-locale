# MVVM Refactoring - Next Steps

## Progress Summary

### Completed ✅
- [x] Models Layer (5 models: Character, Scene, Location, Arc, Project)
- [x] Services Layer (4 services: character, scene, location, arc)
- [x] Characters View (complete MVVM: render, handlers, view)
- [x] Structure View (complete MVVM: render, handlers, view, drag-drop)
- [x] Comprehensive Documentation (6 guides)

### In Progress 🚀
- [ ] LocationView refactoring
- [ ] TimelineView refactoring
- [ ] Other view refactoring
- [ ] Utilities layer

## Next View: LocationView

### File Structure to Create
```
js/06-views/locations/
├── locations.render.js     (400+ lines)
├── locations.handlers.js   (300+ lines)
└── locations.view.js       (150+ lines)
```

### Current Location Code
- Main file: `js/17.world.js` (large monolithic file)
- Service ready: `js/03-services/location.service.js` ✅

### Render Functions Needed
```javascript
// Main views
- renderLocationsList(locations, filters)
- renderLocationCard(location, index)
- renderLocationDetail(location)
- renderLocationEditor(location)
- renderLocationMap(locations)

// Modals
- renderAddLocationModal()
- renderEditLocationModal(location)
- renderDeleteConfirm(location)

// Helpers
- getLocationTypeIcon(type)
- getRegionColor(region)
- formatLocationStats(location)
```

### Handler Functions Needed
```javascript
// CRUD
- handleCreateLocation()
- handleUpdateLocation()
- handleDeleteLocation()

// Interaction
- selectLocation(locationId)
- filterByType(type)
- filterByRegion(region)
- searchLocations(query)

// Relationships
- linkCharacter(locationId, characterId)
- unlinkCharacter(locationId, characterId)
- linkScene(locationId, sceneId)
- unlinkScene(locationId, sceneId)
```

### View Functions Needed
```javascript
- init()
- render()
- openDetail(locationId)
- bindEvents()
- destroy()
- loadFilters()
- saveFilters()
```

## Views to Refactor (Priority Order)

### Priority 1: Display/List Views (Simpler)
1. **LocationView** - Uses LocationService ✅
2. **NotesView** - Simple list + detail
3. **CodexView** - Simple list + detail
4. **TodosView** - Checkbox list + detail

### Priority 2: Complex Views (Multiple Operations)
5. **TimelineView** - Timeline navigation + editor
6. **CorkboardView** - Canvas-like pinning
7. **MindmapView** - Node-based visualization
8. **PlotView** - Complex structure visualization

### Priority 3: Analysis/Report Views
9. **StatsView** - Read-only data visualization
10. **RevisionView** - Diff visualization
11. **RelationsView** - Graph visualization
12. **CharacterArcView** - Timeline visualization

## Quick Refactoring Template

Each view should follow this pattern:

### 1. Create Render Module (js/06-views/{view}/{view}.render.js)
```javascript
const {ViewName}Render = (() => {
    // Pure rendering functions
    // Return HTML strings only
    // No DOM manipulation
    
    return {
        // Public API
    };
})();
```

### 2. Create Handlers Module (js/06-views/{view}/{view}.handlers.js)
```javascript
const {ViewName}Handlers = (() => {
    // Event handling
    // Service integration
    // State updates
    
    return {
        // Public API
    };
})();
```

### 3. Refactor View Module (js/06-views/{view}/{view}.view.js)
```javascript
const {ViewName}View = (() => {
    // Lifecycle management
    // State binding
    // Render orchestration
    
    return {
        init,
        render,
        bindEvents,
        destroy
    };
})();
```

## Implementation Order Recommendation

### Week 1
- [ ] Refactor LocationView (most important for world-building)
- [ ] Refactor NotesView (simple pattern to reinforce)

### Week 2
- [ ] Refactor TimelineView
- [ ] Refactor TodosView

### Week 3
- [ ] Refactor CorkboardView
- [ ] Refactor CodexView

### Week 4
- [ ] Refactor remaining visualization views
- [ ] Create utility helpers
- [ ] Comprehensive testing

## Utility Helpers to Create

### DOMUtils (js/utils/domUtils.js)
```javascript
- escape(html)              // XSS protection
- createElement(type, attrs)
- createEventListener(selector, event, handler)
- remove(element)
- addClass(element, class)
- removeClass(element, class)
- toggleClass(element, class)
- setAttributes(element, attrs)
```

### TextUtils (js/utils/textUtils.js)
```javascript
- capitalize(text)
- slugify(text)
- truncate(text, length)
- countWords(text)
- countLines(text)
- highlight(text, query)
```

### ValidatorUtils (js/utils/validators.js)
```javascript
- isValidTitle(title)
- isValidEmail(email)
- isValidURL(url)
- isValidHex(hex)
- isEmptyString(text)
```

### DateUtils (js/utils/dateUtils.js)
```javascript
- formatDate(date, format)
- parseDate(dateString)
- getDaysBetween(date1, date2)
- isToday(date)
```

## Testing Strategy

### Unit Tests
- Test each render function returns correct HTML
- Test handlers with mocked StateManager
- Test view lifecycle methods

### Integration Tests
- Test render + handlers together
- Test state persistence
- Test event bus integration

### Manual Testing
- See STRUCTURE_VIEW_REFACTORING_COMPLETE.md for template

## Dependencies Checklist

Each view refactoring depends on:
- ✅ StateManager (js/00-core/stateManager.js)
- ✅ EventBus (js/00-core/eventBus.js)
- ✅ StorageService (js/01-infrastructure/storage.js)
- ✅ Appropriate service (character.service, location.service, etc.)
- ✅ ModalUI (if using modals)

## Success Criteria

Each refactored view must:
- [ ] Have zero console errors
- [ ] Pass all existing functionality tests
- [ ] Follow MVVM pattern exactly
- [ ] Have zero code duplication with other views
- [ ] Be documented with JSDoc comments
- [ ] Have public API documented

## Getting Started: LocationView

To start refactoring LocationView:

1. Read js/17.world.js (understand current implementation)
2. Create locations.render.js (copy template structure from structure.render.js)
3. Create locations.handlers.js (follow pattern from structure.handlers.js)
4. Refactor locations.view.js (use structure.view.js as template)
5. Test thoroughly before moving to next view

## Resources

- [STRUCTURE_VIEW_REFACTORING_COMPLETE.md](STRUCTURE_VIEW_REFACTORING_COMPLETE.md) - Reference implementation
- [MVVM_QUICK_REFERENCE.md](MVVM_QUICK_REFERENCE.md) - API patterns
- [characters.render.js](js/06-views/characters/characters.render.js) - Example render module
- [characters.handlers.js](js/06-views/characters/characters.handlers.js) - Example handlers module
- [structure.render.js](js/06-views/structure/structure.render.js) - Another example
- [structure.handlers.js](js/06-views/structure/structure.handlers.js) - Another example

## Questions to Ask

When refactoring each view:

1. What is the primary data entity? (Character, Location, Scene, etc.)
2. Does a service already exist for this data? If not, create one first.
3. What are the main user interactions? (CRUD, filtering, search, etc.)
4. Are there complex visualizations? (Graph, timeline, canvas)
5. What modals/dialogs are needed?
6. What keyboard shortcuts are needed?
7. What data persistence requirements exist?
8. Are there performance considerations? (Large datasets, real-time updates)

## Notes for Team

- All refactoring should follow the MVVM pattern established
- Never mix concerns within a single file
- Pure render functions = predictable, testable code
- Event delegation = better performance
- StateManager integration = centralized state management
- StorageService usage = persistent data
- EventBus usage = loose coupling between modules

Happy refactoring! 🚀
