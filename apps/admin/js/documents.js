// apps/admin/js/documents.js

if (typeof window.Icons === 'undefined') {
    window.Icons = {
        edit: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34"/><polygon points="18 2 22 6 12 16 8 16 8 12 18 2"/></svg>`,
        delete: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>`
    };
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

let documentsData = [];
let categoriesData = [];

async function loadDocumentsData() {
    if (!window.siteData) return;
    documentsData = window.siteData.getDocuments();
    categoriesData = window.siteData.getDocumentCategories();
}

async function saveDocumentsData() {
    if (!window.siteData) return;
    await window.siteData.updateDocuments(documentsData, categoriesData);
}

async function addDocument() {
    const modal = createModal('Добавить документ', `
        <div class="form-group"><label>Название</label><input type="text" id="docTitle"></div>
        <div class="form-group"><label>Категория</label>
            <select id="docCategory">
                ${categoriesData.map(cat => `<option value="${escapeHtml(cat)}">${escapeHtml(cat)}</option>`).join('')}
                <option value="new">+ Новая категория</option>
            </select>
        </div>
        <div class="form-group" id="newCategoryGroup" style="display: none;"><label>Новая категория</label><input type="text" id="newCategoryName"></div>
        <div class="form-group"><label>Страниц</label><input type="number" id="docPages" value="0"></div>
        <div class="form-group"><label>URL файла</label><input type="text" id="docUrl" placeholder="/docs/file.pdf"></div>
    `, async () => {
        const title = document.getElementById('docTitle')?.value.trim();
        if (!title) { alert('Введите название'); return false; }
        let category = document.getElementById('docCategory')?.value;
        if (category === 'new') {
            const newCat = document.getElementById('newCategoryName')?.value.trim();
            if (!newCat) { alert('Введите название категории'); return false; }
            category = newCat;
            if (!categoriesData.includes(category)) categoriesData.push(category);
        }
        documentsData.push({
            id: Date.now(), title, category,
            pages: parseInt(document.getElementById('docPages')?.value) || 0,
            downloads: 0, fileUrl: document.getElementById('docUrl')?.value.trim() || ''
        });
        await saveDocumentsData();
        renderDocuments();
        return true;
    });
    const catSelect = modal.querySelector('#docCategory');
    const newCatGroup = modal.querySelector('#newCategoryGroup');
    if (catSelect) catSelect.addEventListener('change', (e) => { newCatGroup.style.display = e.target.value === 'new' ? 'block' : 'none'; });
    document.body.appendChild(modal);
}

async function editDocument(id) {
    const doc = documentsData.find(d => d.id === id);
    if (!doc) return;
    const modal = createModal('Редактировать документ', `
        <div class="form-group"><label>Название</label><input type="text" id="docTitle" value="${escapeHtml(doc.title)}"></div>
        <div class="form-group"><label>Категория</label>
            <select id="docCategory">
                ${categoriesData.map(cat => `<option value="${escapeHtml(cat)}" ${doc.category === cat ? 'selected' : ''}>${escapeHtml(cat)}</option>`).join('')}
                <option value="new">+ Новая категория</option>
            </select>
        </div>
        <div class="form-group" id="newCategoryGroup" style="display: none;"><label>Новая категория</label><input type="text" id="newCategoryName"></div>
        <div class="form-group"><label>Страниц</label><input type="number" id="docPages" value="${doc.pages}"></div>
        <div class="form-group"><label>URL файла</label><input type="text" id="docUrl" value="${escapeHtml(doc.fileUrl)}"></div>
    `, async () => {
        const title = document.getElementById('docTitle')?.value.trim();
        if (!title) { alert('Введите название'); return false; }
        let category = document.getElementById('docCategory')?.value;
        if (category === 'new') {
            const newCat = document.getElementById('newCategoryName')?.value.trim();
            if (!newCat) { alert('Введите название категории'); return false; }
            category = newCat;
            if (!categoriesData.includes(category)) categoriesData.push(category);
        }
        doc.title = title; doc.category = category;
        doc.pages = parseInt(document.getElementById('docPages')?.value) || 0;
        doc.fileUrl = document.getElementById('docUrl')?.value.trim() || '';
        await saveDocumentsData();
        renderDocuments();
        return true;
    });
    const catSelect = modal.querySelector('#docCategory');
    const newCatGroup = modal.querySelector('#newCategoryGroup');
    if (catSelect) catSelect.addEventListener('change', (e) => { newCatGroup.style.display = e.target.value === 'new' ? 'block' : 'none'; });
    document.body.appendChild(modal);
}

async function deleteDocument(id) {
    if (confirm('Удалить документ?')) {
        documentsData = documentsData.filter(d => d.id !== id);
        await saveDocumentsData();
        renderDocuments();
    }
}

async function addCategory() {
    const newCat = prompt('Название категории:');
    if (newCat && newCat.trim() && !categoriesData.includes(newCat.trim())) {
        categoriesData.push(newCat.trim());
        await saveDocumentsData();
        renderDocuments();
        alert(`Категория "${newCat}" добавлена`);
    }
}

async function editCategory(oldName) {
    const newName = prompt('Новое название:', oldName);
    if (newName && newName.trim() && newName !== oldName) {
        if (categoriesData.includes(newName.trim())) { alert('Такая категория уже есть'); return; }
        const index = categoriesData.indexOf(oldName);
        if (index !== -1) {
            categoriesData[index] = newName.trim();
            documentsData.forEach(doc => { if (doc.category === oldName) doc.category = newName.trim(); });
            await saveDocumentsData();
            renderDocuments();
            alert(`Категория переименована в "${newName}"`);
        }
    }
}

async function deleteCategory(catName) {
    if (confirm(`Удалить категорию "${catName}"?`)) {
        categoriesData = categoriesData.filter(c => c !== catName);
        documentsData = documentsData.filter(d => d.category !== catName);
        await saveDocumentsData();
        renderDocuments();
    }
}

function renderDocuments() {
    const container = document.getElementById('documentsSection');
    if (!container) return;
    container.innerHTML = `
        <div class="section-header"><h2>Документы</h2><button class="btn-primary" id="addDocBtn">+ Добавить</button></div>
        <div class="stats-grid" style="margin-bottom: 24px;">
            <div class="stat-card"><div class="stat-title">Документов</div><div class="stat-value">${documentsData.length}</div></div>
            <div class="stat-card"><div class="stat-title">Категорий</div><div class="stat-value">${categoriesData.length}</div></div>
            <div class="stat-card"><div class="stat-title">Скачиваний</div><div class="stat-value">${documentsData.reduce((s,d)=>s+(d.downloads||0),0).toLocaleString()}</div></div>
        </div>
        <div class="content-section"><div class="section-title">Категории</div><div style="display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 24px;">
            ${categoriesData.map(cat => `<div class="category-chip"><span>${escapeHtml(cat)}</span><button class="icon-btn edit-cat" data-cat="${cat}">✏️</button><button class="icon-btn danger delete-cat" data-cat="${cat}">🗑️</button></div>`).join('')}
            <button class="btn-outline" id="addCategoryBtn">+ Добавить категорию</button>
        </div></div>
        <div class="content-section"><div class="section-title">Список документов</div>
        <div class="documents-list">${documentsData.length === 0 ? '<div class="empty-state">Нет документов</div>' : ''}
        ${documentsData.map(doc => `
            <div class="document-item">
                <div class="doc-info"><div class="doc-title">${escapeHtml(doc.title)}</div>
                <div class="doc-meta"><span>📁 ${escapeHtml(doc.category)}</span><span>📄 ${doc.pages} стр.</span><span>⬇️ ${(doc.downloads||0).toLocaleString()}</span></div></div>
                <div class="doc-actions"><button class="icon-btn edit-doc" data-id="${doc.id}">${window.Icons.edit}</button><button class="icon-btn danger delete-doc" data-id="${doc.id}">${window.Icons.delete}</button></div>
            </div>`).join('')}</div></div>
    `;
    document.getElementById('addDocBtn')?.addEventListener('click', addDocument);
    document.getElementById('addCategoryBtn')?.addEventListener('click', addCategory);
    document.querySelectorAll('.edit-doc').forEach(btn => btn.addEventListener('click', (e) => { e.stopPropagation(); editDocument(parseInt(btn.dataset.id)); }));
    document.querySelectorAll('.delete-doc').forEach(btn => btn.addEventListener('click', (e) => { e.stopPropagation(); deleteDocument(parseInt(btn.dataset.id)); }));
    document.querySelectorAll('.edit-cat').forEach(btn => btn.addEventListener('click', (e) => { e.stopPropagation(); editCategory(btn.dataset.cat); }));
    document.querySelectorAll('.delete-cat').forEach(btn => btn.addEventListener('click', (e) => { e.stopPropagation(); deleteCategory(btn.dataset.cat); }));
}

function createModal(title, content, onSave) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `<div class="modal-container"><div class="modal-header"><h3>${title}</h3><button class="modal-close">×</button></div><div class="modal-body">${content}</div><div class="modal-footer"><button class="btn-outline modal-cancel">Отмена</button><button class="btn-primary modal-save">Сохранить</button></div></div>`;
    modal.querySelector('.modal-close')?.addEventListener('click', () => modal.remove());
    modal.querySelector('.modal-cancel')?.addEventListener('click', () => modal.remove());
    modal.querySelector('.modal-save')?.addEventListener('click', () => { if (onSave()) modal.remove(); });
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
    return modal;
}

async function initDocuments() {
    if (!window.siteData?.initialized) {
        await new Promise(resolve => { const checkInterval = setInterval(() => { if (window.siteData?.initialized) { clearInterval(checkInterval); resolve(); } }, 50); });
    }
    await loadDocumentsData();
    renderDocuments();
    if (window.siteData?.subscribe) window.siteData.subscribe(async (key) => { if (key === 'documents') { await loadDocumentsData(); renderDocuments(); } });
}

window.initDocuments = initDocuments;