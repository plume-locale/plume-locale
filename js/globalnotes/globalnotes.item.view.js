/**
 * [MVVM : globalnotes Item View]
 * Responsible for rendering individual items on the board.
 */

const GlobalNotesItemView = {
    render: function (item) {
        console.log('Rendering item:', item.id, 'Type:', item.type, 'In column:', !!item.columnId);
        let style = "";
        const isInColumn = !!item.columnId;

        if (!isInColumn) {
            style = `left: ${item.x}px; top: ${item.y}px; width: ${item.width}px; height: ${item.height === 'auto' ? 'auto' : item.height + 'px'}; z-index: ${item.zIndex}; background-color: ${item.config.color}; border: ${item.config.borderThickness}px ${item.config.borderStyle || 'solid'} ${item.config.borderColor || 'transparent'};`;
        } else {
            style = `position: relative; width: 100% !important; margin-bottom: 12px; height: auto; background-color: ${item.config.color}; left: 0; top: 0; border: ${item.config.borderThickness}px ${item.config.borderStyle || 'solid'} ${item.config.borderColor || 'transparent'};`;
        }

        return `
            <div class="globalnotes-item globalnotes-item-${item.type} ${item.config.isLocked ? 'locked' : ''} ${isInColumn ? 'in-column' : ''}" 
                 data-id="${item.id}" 
                 data-type="${item.type}"
                 style="${style}"
                 onmousedown="GlobalNotesHandlers.onItemMouseDown(event, '${item.id}')"
                 ondblclick="GlobalNotesHandlers.onItemDbClick(event, '${item.id}')">
                
                <div class="item-inner">
                    ${GlobalNotesItemView.renderItemContent(item)}
                </div>
                
                ${!isInColumn ? `<div class="resizer resizer-br" onmousedown="GlobalNotesHandlers.onResizeStart(event, '${item.id}')"></div>` : ''}
            </div>
        `;
    },

    renderItemContent: function (item) {
        console.log('Rendering content for item type:', item.type, item.id);
        const data = item.data || {};

        switch (item.type) {
            case 'note':
                return `
                    <div class="item-content" contenteditable="true" 
                         onblur="GlobalNotesViewModel.updateItemData('${item.id}', { content: this.innerHTML })">
                        ${data.content || ''}
                    </div>
                `;
            case 'board':
                return `
                    <div class="globalnotes-board-link">
                        <div class="board-icon-circle">
                            <i data-lucide="folder"></i>
                        </div>
                        <div class="board-name" contenteditable="true" 
                             onmousedown="event.stopPropagation()"
                             onblur="GlobalNotesHandlers.renameBoard('${item.id}', this.innerText, event)">
                            ${data.title || 'Untitled Board'}
                        </div>
                    </div>
                `;
            case 'image':
                return `
                    <div class="item-image-container">
                        ${data.url ? `<img src="${data.url}" />` : `
                            <div class="image-placeholder" 
                                 onmousedown="event.stopPropagation()"
                                 onclick="GlobalNotesHandlers.promptImageUrl('${item.id}')">
                                <i data-lucide="image"></i>
                                <span>Add Image URL</span>
                            </div>
                        `}
                        <div class="item-caption" contenteditable="true" 
                             onblur="GlobalNotesViewModel.updateItemData('${item.id}', { caption: this.innerText })">
                            ${data.caption || 'Add caption...'}
                        </div>
                    </div>
                `;
            case 'link':
                return `
                    <div class="link-preview" onclick="window.open('${data.url}', '_blank')">
                        ${data.image ? `<img src="${data.image}" class="link-image" />` : `
                            <div class="link-icon-fallback"><i data-lucide="external-link"></i></div>
                        `}
                        <div class="link-details">
                            <div class="link-title">${data.title || 'Link Title'}</div>
                            <div class="link-url-text">${this.truncate(data.url, 40)}</div>
                        </div>
                    </div>
                `;
            case 'column':
                const children = GlobalNotesViewModel.getItemsInColumn(item.id);
                return `
                    <div class="column-container">
                        <div class="column-header">
                            <div class="column-title" contenteditable="true" 
                                 onblur="GlobalNotesViewModel.updateItemData('${item.id}', { title: this.innerText })">
                                ${data.title || 'Column'}
                            </div>
                            <i data-lucide="more-horizontal" class="column-more"></i>
                        </div>
                        <div class="column-items-dropzone" data-column-id="${item.id}">
                            ${children.map(child => GlobalNotesItemView.render(child)).join('')}
                        </div>
                    </div>
                `;
            case 'checklist':
                return `
                    <div class="checklist-container">
                        <div class="checklist-header" contenteditable="true" onblur="GlobalNotesViewModel.updateItemData('${item.id}', { title: this.innerText })">
                            ${data.title || 'Checklist'}
                        </div>
                        <div class="checklist-items">
                            ${(data.items || []).map((li, idx) => `
                                <div class="checklist-row">
                                    <div class="check-box ${li.checked ? 'checked' : ''}" 
                                         onmousedown="event.stopPropagation()"
                                         onclick="GlobalNotesHandlers.toggleChecklistItem('${item.id}', ${idx})">
                                        ${li.checked ? '<i data-lucide="check"></i>' : ''}
                                    </div>
                                    <span class="checklist-text" contenteditable="true" 
                                          onmousedown="event.stopPropagation()"
                                          onblur="GlobalNotesHandlers.updateChecklistItem('${item.id}', ${idx}, this.innerText)">${li.text}</span>
                                </div>
                            `).join('')}
                        </div>
                        <button class="btn-add-list" 
                                onmousedown="event.stopPropagation()"
                                onclick="GlobalNotesHandlers.addChecklistItem('${item.id}')">
                            <i data-lucide="plus"></i> Add item
                        </button>
                    </div>
                `;
            case 'audio':
                return `
                    <div class="item-audio">
                        <div class="audio-icon"><i data-lucide="music"></i></div>
                        <div class="audio-info">
                            <div class="audio-title">${data.title || 'Audio File'}</div>
                            <audio controls src="${data.url}"></audio>
                        </div>
                    </div>
                `;
            case 'video':
                return `
                    <div class="item-video">
                        ${data.url ? `
                            <iframe src="${data.url.replace('watch?v=', 'embed/')}" frameborder="0" allowfullscreen></iframe>
                        ` : `
                            <div class="video-placeholder" onclick="GlobalNotesHandlers.promptVideoUrl('${item.id}')">
                                <i data-lucide="video"></i>
                                <span>Add Video URL</span>
                            </div>
                        `}
                        <div class="video-title" contenteditable="true" onblur="GlobalNotesViewModel.updateItemData('${item.id}', { title: this.innerText })">
                            ${data.title || 'Video'}
                        </div>
                    </div>
                `;
            case 'file':
                return `
                    <div class="item-file" 
                         onmousedown="event.stopPropagation()"
                         onclick="GlobalNotesHandlers.triggerFileUpload('${item.id}')">
                        <div class="file-icon"><i data-lucide="file-text"></i></div>
                        <div class="file-info">
                            <div class="file-name">${data.name || 'document.pdf'}</div>
                            <div class="file-meta">${data.size || '0 KB'} • ${data.type || 'File'}</div>
                        </div>
                    </div>
                `;
            case 'color':
                return `
                    <div class="item-color-swatch">
                        <div class="color-preview-circle" 
                             style="background: ${item.config.color || '#4361ee'}"
                             onmousedown="event.stopPropagation()"
                             onclick="GlobalNotesHandlers.promptColorChange('${item.id}')"></div>
                        <div class="color-label" contenteditable="true" 
                             onmousedown="event.stopPropagation()"
                             onblur="GlobalNotesViewModel.updateItemData('${item.id}', { label: this.innerText })">
                             ${data.label || 'Primary'}
                        </div>
                        <div class="color-hex">${item.config.color || '#4361ee'}</div>
                    </div>
                `;
            case 'table':
                return `
                <div class="item-table-container">
                    <table class="globalnotes-table">
                        ${Array.from({ length: data.rows }).map((_, r) => `
                            <tr>
                                ${Array.from({ length: data.cols }).map((_, c) => `
                                    <td contenteditable="true" onblur="GlobalNotesHandlers.updateTableData('${item.id}', ${r}, ${c}, this.innerText)">
                                        ${data.data[r][c] || ''}
                                    </td>
                                `).join('')}
                            </tr>
                        `).join('')}
                    </table>
                </div>
            `;
            case 'comment':
                return `
                <div class="item-comment">
                    <div class="comment-author">${data.author || 'User'}</div>
                    <div class="comment-text" contenteditable="true" onblur="GlobalNotesViewModel.updateItemData('${item.id}', { text: this.innerText })">
                        ${data.text || 'Add a comment...'}
                    </div>
                </div>
            `;
            case 'map':
                return `
                <div class="item-map-container">
                    <div class="map-placeholder">
                        <i data-lucide="map"></i>
                        <div class="map-info" 
                             onmousedown="event.stopPropagation()"
                             onclick="GlobalNotesHandlers.editMapItem('${item.id}')">
                            <span class="map-title-label">${data.title || 'Location'}</span>
                            <div class="map-coords">${data.lat || 0}, ${data.lng || 0}</div>
                        </div>
                        <div class="map-edit-hint">Click to set coords</div>
                    </div>
                </div>
            `;
            case 'heading':
                return `
                <div class="item-heading" contenteditable="true" onblur="GlobalNotesViewModel.updateItemData('${item.id}', { text: this.innerText })">
                    ${data.text || 'Section Title'}
                </div>
            `;
            case 'sketch':
                return `
                <div class="item-sketch" onmousedown="event.stopPropagation()">
                    <div class="sketch-toolbar">
                        <div class="sketch-tools">
                            <div class="sketch-color active" style="background: #333" onmousedown="event.stopPropagation(); GlobalNotesHandlers.setSketchColor('${item.id}', '#333', this)"></div>
                            <div class="sketch-color" style="background: #ef4444" onmousedown="event.stopPropagation(); GlobalNotesHandlers.setSketchColor('${item.id}', '#ef4444', this)"></div>
                            <div class="sketch-color" style="background: #3b82f6" onmousedown="event.stopPropagation(); GlobalNotesHandlers.setSketchColor('${item.id}', '#3b82f6', this)"></div>
                            <div class="sketch-color" style="background: #10b981" onmousedown="event.stopPropagation(); GlobalNotesHandlers.setSketchColor('${item.id}', '#10b981', this)"></div>
                        </div>
                        <button class="btn-clear-sketch" onmousedown="event.stopPropagation(); GlobalNotesHandlers.clearSketch('${item.id}')">
                            <i data-lucide="trash-2"></i>
                        </button>
                    </div>
                    <canvas class="sketch-canvas"
                            data-color="#333"
                            onmousedown="GlobalNotesHandlers.startSketch(event, '${item.id}')"
                            onmousemove="GlobalNotesHandlers.drawSketch(event, '${item.id}')"
                            onmouseup="GlobalNotesHandlers.endSketch('${item.id}', this)"
                            onmouseleave="GlobalNotesHandlers.endSketch('${item.id}', this)"
                            style="width: 100%; height: 100%; display: block;"></canvas>
                </div>
            `;
            case 'line':
                return `
                <div class="item-line-container">
                    <svg width="100%" height="100%" style="overflow: visible;">
                        <line x1="0" y1="0" x2="${item.width}" y2="${item.height}" stroke="currentColor" stroke-width="${data.thickness || 2}" />
                        ${data.arrowhead ? `<path d="M ${item.width - 10} ${item.height - 10} L ${item.width} ${item.height} L ${item.width - 10} ${item.height + 10}" fill="none" stroke="currentColor" />` : ''}
                    </svg>
                </div>
            `;
            case 'document':
                return `
                <div class="item-document" onclick="GlobalNotesHandlers.openDocument('${item.id}')">
                    <i data-lucide="file-text"></i>
                    <div class="doc-title">${data.title || 'Document'}</div>
                </div>
            `;
            default:
                return `<div>${item.type}</div>`;
        }
    },

    truncate: function (str, n) {
        if (!str) return '';
        return (str.length > n) ? str.substr(0, n - 1) + '&hellip;' : str;
    }
};

window.GlobalNotesItemView = GlobalNotesItemView;


