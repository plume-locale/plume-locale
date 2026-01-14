/**
 * Timeline Handlers
 * Responsible for event handling and CRUD operations on timeline events
 */

const TimelineHandlers = (() => {
    let currentDetailId = null;
    let autosaveDebounce = null;

    function attachListHandlers() {
        const listContainer = document.querySelector('.timeline-list');
        if (!listContainer) return;

        listContainer.addEventListener('click', (e) => {
            const timelineItem = e.target.closest('.timeline-item');
            if (!timelineItem) return;

            const eventId = timelineItem.dataset.eventId;
            if (e.target.classList.contains('timeline-item-delete')) {
                deleteEvent(eventId);
            } else {
                openEventDetail(eventId);
            }
        });
    }

    function openAddTimelineModal() {
        const html = TimelineRender.renderAddTimelineModal();
        ModalUI.open('Nouvel événement', html, () => {
            const form = document.getElementById('add-event-form');
            if (form) {
                form.addEventListener('submit', handleAddEvent);
            }
        });
    }

    function handleAddEvent(e) {
        e.preventDefault();

        const title = document.getElementById('event-title-input').value.trim();
        const type = document.getElementById('event-type-input').value;
        const date = document.getElementById('event-date-input').value;
        const location = document.getElementById('event-location-input').value.trim();

        if (!title) return;

        const newEvent = {
            id: `event-${Date.now()}`,
            title,
            type: type || 'event',
            date: date ? new Date(date).toISOString() : null,
            location: location || '',
            description: '',
            characters: [],
            createdAt: new Date().toISOString()
        };

        const project = StateManager.getState().project;
        if (!project.timeline) {
            project.timeline = [];
        }

        project.timeline.push(newEvent);
        StateManager.setState({ project });
        StorageService.saveProject(project);
        EventBus.emit('timeline:created', newEvent);

        ModalUI.close();
        TimelineView.render();
    }

    function openEventDetail(eventId) {
        const project = StateManager.getState().project;
        const event = project.timeline?.find(e => e.id === eventId);

        if (!event) return;

        currentDetailId = eventId;
        const html = TimelineRender.renderTimelineDetail(event);
        ModalUI.open('Détails de l\'événement', html, () => {
            attachEventDetailHandlers(eventId);
        });
    }

    function attachEventDetailHandlers(eventId) {
        const form = document.querySelector('.detail-view');
        if (!form) return;

        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('change', () => saveEventDetail(eventId));
            input.addEventListener('input', () => {
                clearTimeout(autosaveDebounce);
                autosaveDebounce = setTimeout(() => saveEventDetail(eventId), 1000);
            });
        });
    }

    function saveEventDetail(eventId) {
        const project = StateManager.getState().project;
        const event = project.timeline?.find(e => e.id === eventId);

        if (!event) return;

        const titleInput = document.getElementById('event-title');
        const typeSelect = document.getElementById('event-type');
        const dateInput = document.getElementById('event-date');
        const locationInput = document.getElementById('event-location');
        const descriptionInput = document.getElementById('event-description');
        const charactersInput = document.getElementById('event-characters');

        if (titleInput) event.title = titleInput.value.trim();
        if (typeSelect) event.type = typeSelect.value;
        if (dateInput) event.date = dateInput.value ? new Date(dateInput.value).toISOString() : null;
        if (locationInput) event.location = locationInput.value.trim();
        if (descriptionInput) event.description = descriptionInput.value.trim();
        if (charactersInput) {
            event.characters = charactersInput.value.split(',').map(c => c.trim()).filter(c => c);
        }

        StateManager.setState({ project });
        StorageService.saveProject(project);
        EventBus.emit('timeline:updated', event);
    }

    function deleteEvent(eventId) {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) return;

        const project = StateManager.getState().project;
        project.timeline = project.timeline?.filter(e => e.id !== eventId) || [];

        StateManager.setState({ project });
        StorageService.saveProject(project);
        EventBus.emit('timeline:deleted', eventId);
        TimelineView.render();

        if (currentDetailId === eventId) {
            ModalUI.close();
        }
    }

    function filterByType(type) {
        const project = StateManager.getState().project;
        const events = project.timeline || [];
        return events.filter(e => e.type === type);
    }

    function filterByDateRange(startDate, endDate) {
        const project = StateManager.getState().project;
        const events = project.timeline || [];

        return events.filter(e => {
            if (!e.date) return false;
            const eventDate = new Date(e.date);
            const start = new Date(startDate);
            const end = new Date(endDate);
            return eventDate >= start && eventDate <= end;
        });
    }

    function filterByCharacter(characterName) {
        const project = StateManager.getState().project;
        const events = project.timeline || [];

        return events.filter(e =>
            e.characters && e.characters.some(c => c.toLowerCase().includes(characterName.toLowerCase()))
        );
    }

    function searchEvents(query) {
        const project = StateManager.getState().project;
        const events = project.timeline || [];
        const lowerQuery = query.toLowerCase();

        return events.filter(e =>
            e.title.toLowerCase().includes(lowerQuery) ||
            e.description?.toLowerCase().includes(lowerQuery) ||
            e.location?.toLowerCase().includes(lowerQuery)
        );
    }

    function sortByDate(order = 'asc') {
        const project = StateManager.getState().project;
        const events = project.timeline || [];

        return [...events].sort((a, b) => {
            const dateA = new Date(a.date || 0);
            const dateB = new Date(b.date || 0);
            return order === 'asc' ? dateA - dateB : dateB - dateA;
        });
    }

    return {
        attachListHandlers,
        openAddTimelineModal,
        openEventDetail,
        deleteEvent,
        filterByType,
        filterByDateRange,
        filterByCharacter,
        searchEvents,
        sortByDate
    };
})();
