// ==========================================
// PAGE PREVIEW MODAL - Print Preview Style
// ==========================================

/**
 * [MVVM : View Helper]
 * Obtient les dimensions de page selon le format
 */
function getPageDimensions(format) {
    const dimensions = {
        'a4': { width: '21cm', height: '29.7cm', paddingTop: '2.5cm', paddingBottom: '2.5cm', paddingLeft: '2.5cm', paddingRight: '2.5cm' },
        'moyen': { width: '18cm', height: '24cm', paddingTop: '2cm', paddingBottom: '2cm', paddingLeft: '2.2cm', paddingRight: '2.2cm' },
        'a5': { width: '16cm', height: '21cm', paddingTop: '1.5cm', paddingBottom: '1.5cm', paddingLeft: '1.8cm', paddingRight: '1.8cm' },
        'digest': { width: '14.5cm', height: '21.6cm', paddingTop: '1.2cm', paddingBottom: '1.2cm', paddingLeft: '1.5cm', paddingRight: '1.5cm' },
        'pocket': { width: '13cm', height: '18cm', paddingTop: '1cm', paddingBottom: '1cm', paddingLeft: '1.2cm', paddingRight: '1.2cm' }
    };
    return dimensions[format] || dimensions['a4'];
}

let currentPreviewFormat = 'a4';
let currentPreviewPagesPerRow = 2;

/**
 * Ouvre la modale de prévisualisation de page
 */
function openPagePreview() {
    const modal = document.getElementById('pagePreviewModal');
    if (!modal) {
        createPagePreviewModal();
    }

    // Récupérer le contenu de l'éditeur actif
    const activeEditor = document.querySelector('.editor-textarea');
    if (!activeEditor) {
        alert('Aucun contenu à prévisualiser');
        return;
    }

    const content = activeEditor.innerHTML;

    // Générer la prévisualisation
    generatePagePreview(content, currentPreviewFormat);

    // Afficher la modale
    document.getElementById('pagePreviewModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

/**
 * Ferme la modale de prévisualisation
 */
function closePagePreview() {
    document.getElementById('pagePreviewModal').classList.remove('active');
    document.body.style.overflow = '';
}

/**
 * Crée la structure HTML de la modale
 */
function createPagePreviewModal() {
    const modalHTML = `
        <div class="modal" id="pagePreviewModal" onclick="if(event.target === this) closePagePreview()">
            <div class="modal-content page-preview-modal">
                <div class="modal-header">
                    <h2><i data-lucide="file-text"></i> ${Localization.t('preview.title')}</h2>
                    <button class="modal-close" onclick="closePagePreview()">
                        <i data-lucide="x"></i>
                    </button>
                </div>
                
                <div class="page-preview-toolbar">
                    <div class="preview-controls">
                        <label>
                            <i data-lucide="file-text" style="width:14px;height:14px;"></i>
                            ${Localization.t('preview.format')}
                            <select id="previewFormatSelect" onchange="changePreviewFormat(this.value)">
                                <option value="a4">${Localization.t('toolbar.page_format.a4')}</option>
                                <option value="moyen">${Localization.t('toolbar.page_format.moyen')}</option>
                                <option value="a5">${Localization.t('toolbar.page_format.a5')}</option>
                                <option value="digest">${Localization.t('toolbar.page_format.digest')}</option>
                                <option value="pocket">${Localization.t('toolbar.page_format.pocket')}</option>
                            </select>
                        </label>
                        
                        <label>
                            <i data-lucide="columns-2" style="width:14px;height:14px;"></i>
                            ${Localization.t('preview.pages_per_row')}
                            <select id="previewPagesPerRowSelect" onchange="changePreviewPagesPerRow(this.value)">
                                <option value="1">1</option>
                                <option value="2" selected>2</option>
                                <option value="3">3</option>
                                <option value="4">4</option>
                            </select>
                        </label>
                        
                        <div class="preview-zoom-controls">
                            <button onclick="zoomPreview(-10)" title="${Localization.t('preview.zoom_out')}">
                                <i data-lucide="zoom-out" style="width:14px;height:14px;"></i>
                            </button>
                            <span id="previewZoomLevel">100%</span>
                            <button onclick="zoomPreview(10)" title="${Localization.t('preview.zoom_in')}">
                                <i data-lucide="zoom-in" style="width:14px;height:14px;"></i>
                            </button>
                        </div>
                    </div>
                    
                    <button class="btn btn-primary" onclick="printPreview()">
                        <i data-lucide="printer" style="width:14px;height:14px;"></i>
                        ${Localization.t('preview.print')}
                    </button>
                </div>
                
                <div class="page-preview-container" id="pagePreviewContainer">
                    <!-- Pages will be generated here -->
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

/**
 * Génère la prévisualisation paginée
 */
function generatePagePreview(content, format) {
    const container = document.getElementById('pagePreviewContainer');
    const dims = getPageDimensions(format);

    // Nettoyer le conteneur
    container.innerHTML = '';

    // Créer un wrapper pour les pages
    const pagesWrapper = document.createElement('div');
    pagesWrapper.className = 'preview-pages-wrapper';
    pagesWrapper.style.cssText = `
        display: grid;
        grid-template-columns: repeat(${currentPreviewPagesPerRow}, 1fr);
        gap: 2rem;
        padding: 2rem;
        justify-items: center;
    `;

    // Créer un élément temporaire pour mesurer le contenu
    const tempDiv = document.createElement('div');
    tempDiv.style.cssText = `
        position: absolute;
        visibility: hidden;
        width: calc(${dims.width} - ${dims.paddingLeft} - ${dims.paddingRight});
        font-size: 11.5pt;
        line-height: 1.45;
        font-family: 'Crimson Pro', serif;
    `;
    tempDiv.innerHTML = content;
    document.body.appendChild(tempDiv);

    // Calculer la hauteur de contenu disponible par page
    const pageContentHeight = `calc(${dims.height} - ${dims.paddingTop} - ${dims.paddingBottom} - 1.5cm)`;
    const pageContentHeightPx = parseFloat(dims.height) * 37.795275591 -
        parseFloat(dims.paddingTop) * 37.795275591 -
        parseFloat(dims.paddingBottom) * 37.795275591 -
        1.5 * 37.795275591;

    // Diviser le contenu en pages
    let currentPage = createPreviewPage(dims, 1);
    let currentPageContent = currentPage.querySelector('.page-text');
    let pageNumber = 1;

    const nodes = Array.from(tempDiv.childNodes);
    let currentHeight = 0;

    nodes.forEach(node => {
        const clone = node.cloneNode(true);
        currentPageContent.appendChild(clone);

        // Vérifier si on dépasse
        if (currentPageContent.scrollHeight > pageContentHeightPx && currentHeight > 0) {
            // Retirer le dernier élément
            currentPageContent.removeChild(clone);

            // Ajouter la page au wrapper
            pagesWrapper.appendChild(currentPage);

            // Créer une nouvelle page
            pageNumber++;
            currentPage = createPreviewPage(dims, pageNumber);
            currentPageContent = currentPage.querySelector('.page-text');
            currentPageContent.appendChild(clone);
            currentHeight = 0;
        }

        currentHeight = currentPageContent.scrollHeight;
    });

    // Ajouter la dernière page
    pagesWrapper.appendChild(currentPage);

    // Nettoyer
    document.body.removeChild(tempDiv);

    // Ajouter au conteneur
    container.appendChild(pagesWrapper);

    if (typeof lucide !== 'undefined') lucide.createIcons();
}

/**
 * Crée une page de prévisualisation
 */
function createPreviewPage(dims, pageNumber) {
    const page = document.createElement('div');
    page.className = 'preview-page';
    page.style.cssText = `
        width: ${dims.width};
        height: ${dims.height};
        background: #ffffff;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        border: 1px solid #ddd;
        position: relative;
        overflow: hidden;
    `;

    const pageText = document.createElement('div');
    pageText.className = 'page-text';
    pageText.style.cssText = `
        width: 100%;
        height: calc(100% - ${dims.paddingTop} - ${dims.paddingBottom} - 1.5cm);
        padding: ${dims.paddingTop} ${dims.paddingRight} 0 ${dims.paddingLeft};
        font-size: 11.5pt;
        line-height: 1.45;
        text-align: justify;
        hyphens: auto;
        color: #2c3e50;
        font-family: 'Crimson Pro', serif;
        overflow: hidden;
    `;

    const pageNum = document.createElement('div');
    pageNum.className = 'page-number';
    pageNum.textContent = pageNumber;
    pageNum.style.cssText = `
        position: absolute;
        bottom: ${dims.paddingBottom};
        left: 50%;
        transform: translateX(-50%);
        font-size: 10pt;
        color: #666;
        font-family: 'Crimson Pro', serif;
    `;

    page.appendChild(pageText);
    page.appendChild(pageNum);

    return page;
}

/**
 * Change le format de prévisualisation
 */
function changePreviewFormat(format) {
    currentPreviewFormat = format;
    const activeEditor = document.querySelector('.editor-textarea');
    if (activeEditor) {
        generatePagePreview(activeEditor.innerHTML, format);
    }
}

/**
 * Change le nombre de pages par ligne
 */
function changePreviewPagesPerRow(count) {
    currentPreviewPagesPerRow = parseInt(count);
    const wrapper = document.querySelector('.preview-pages-wrapper');
    if (wrapper) {
        wrapper.style.gridTemplateColumns = `repeat(${count}, 1fr)`;
    }
}

/**
 * Zoom de la prévisualisation
 */
let currentZoom = 100;
function zoomPreview(delta) {
    currentZoom = Math.max(50, Math.min(200, currentZoom + delta));
    const container = document.getElementById('pagePreviewContainer');
    container.style.transform = `scale(${currentZoom / 100})`;
    container.style.transformOrigin = 'top center';
    document.getElementById('previewZoomLevel').textContent = currentZoom + '%';
}

/**
 * Imprime la prévisualisation
 */
function printPreview() {
    window.print();
}
