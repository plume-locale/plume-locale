/**
 * Todos Render
 * Responsible for generating HTML templates for the todos view
 */

const TodosRender = (() => {
    function renderTodosList(todos) {
        if (!todos || todos.length === 0) {
            return renderEmptyTodos();
        }

        const grouped = {
            todo: todos.filter(t => t.status === 'todo'),
            inProgress: todos.filter(t => t.status === 'inProgress'),
            done: todos.filter(t => t.status === 'done')
        };

        return `
            <div class="todos-container">
                <div class="todos-column">
                    <h3 class="todos-column-title">À faire</h3>
                    <div class="todos-list">
                        ${grouped.todo.map(todo => renderTodoItem(todo)).join('')}
                    </div>
                </div>
                <div class="todos-column">
                    <h3 class="todos-column-title">En cours</h3>
                    <div class="todos-list">
                        ${grouped.inProgress.map(todo => renderTodoItem(todo)).join('')}
                    </div>
                </div>
                <div class="todos-column">
                    <h3 class="todos-column-title">Fait</h3>
                    <div class="todos-list">
                        ${grouped.done.map(todo => renderTodoItem(todo)).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    function renderTodoItem(todo) {
        const priority = todo.priority || 'normal';
        const priorityClass = `priority-${priority}`;

        return `
            <div class="todo-item ${priorityClass}" data-todo-id="${todo.id}" draggable="true">
                <div class="todo-item-content">
                    <input type="checkbox" class="todo-checkbox" ${todo.status === 'done' ? 'checked' : ''}>
                    <span class="todo-text">${escapeHtml(todo.text)}</span>
                </div>
                <button class="todo-item-delete" onclick="event.stopPropagation();" title="Supprimer">×</button>
            </div>
        `;
    }

    function renderTodoDetail(todo) {
        return `
            <div class="detail-view">
                <div class="detail-header">
                    <input type="text" id="todo-text" class="detail-title-input" value="${escapeHtml(todo.text)}" 
                           placeholder="Description de la tâche">
                </div>

                <div class="detail-section">
                    <div class="detail-section-title">Statut</div>
                    <select id="todo-status" class="form-input">
                        <option value="todo" ${todo.status === 'todo' ? 'selected' : ''}>À faire</option>
                        <option value="inProgress" ${todo.status === 'inProgress' ? 'selected' : ''}>En cours</option>
                        <option value="done" ${todo.status === 'done' ? 'selected' : ''}>Fait</option>
                    </select>
                </div>

                <div class="detail-section">
                    <div class="detail-section-title">Priorité</div>
                    <select id="todo-priority" class="form-input">
                        <option value="low" ${todo.priority === 'low' ? 'selected' : ''}>Basse</option>
                        <option value="normal" ${todo.priority === 'normal' ? 'selected' : ''}>Normale</option>
                        <option value="high" ${todo.priority === 'high' ? 'selected' : ''}>Haute</option>
                    </select>
                </div>

                <div class="detail-section">
                    <div class="detail-section-title">Description</div>
                    <textarea id="todo-description" class="form-input" rows="6" 
                              placeholder="Description détaillée">${escapeHtml(todo.description || '')}</textarea>
                </div>

                <div class="detail-section">
                    <div class="detail-section-title">Catégorie</div>
                    <input type="text" id="todo-category" class="form-input" value="${escapeHtml(todo.category || '')}" 
                           placeholder="Ex: Écriture, Worldbuilding, Révision">
                </div>
            </div>
        `;
    }

    function renderAddTodoModal() {
        return `
            <form id="add-todo-form">
                <div class="modal-field">
                    <label>Tâche *</label>
                    <input type="text" id="todo-text-input" class="form-input" placeholder="Description de la tâche" required autofocus>
                </div>

                <div class="modal-field">
                    <label>Priorité</label>
                    <select id="todo-priority-input" class="form-input">
                        <option value="normal">Normale</option>
                        <option value="low">Basse</option>
                        <option value="high">Haute</option>
                    </select>
                </div>

                <div class="modal-field">
                    <label>Catégorie</label>
                    <input type="text" id="todo-category-input" class="form-input" placeholder="Ex: Écriture">
                </div>

                <div class="modal-actions">
                    <button type="button" class="btn-secondary" onclick="ModalUI.close()">Annuler</button>
                    <button type="submit" class="btn">Créer</button>
                </div>
            </form>
        `;
    }

    function renderEmptyTodos() {
        return `
            <div style="padding: 2rem 1rem; text-align: center; color: var(--text-muted); font-size: 0.85rem;">
                <i data-lucide="check-square" style="width:32px;height:32px;margin-bottom:0.5rem;opacity:0.5;"></i>
                <p>Aucune tâche</p>
            </div>
        `;
    }

    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    return {
        renderTodosList,
        renderTodoItem,
        renderTodoDetail,
        renderAddTodoModal,
        renderEmptyTodos,
        escapeHtml
    };
})();
