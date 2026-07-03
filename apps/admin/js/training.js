// apps/admin/js/training.js

if (typeof window.Icons === 'undefined') {
    window.Icons = {
        edit: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34"/><polygon points="18 2 22 6 12 16 8 16 8 12 18 2"/></svg>`,
        delete: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>`,
        users: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
        instructor: `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/><path d="M17 11l4 2-4 2"/><path d="M7 11l-4 2 4 2"/></svg>`,
        chat: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
        schedule: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
        telegram: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>`,
        settings: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H5.78a1.65 1.65 0 0 0-1.51 1 1.65 1.65 0 0 0 .33 1.82l.03.03A10 10 0 0 0 12 17.66a10 10 0 0 0 6.37-2.63l.03-.03z"/></svg>`,
        copy: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`,
        landing: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
        lessons: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`
    };
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

let currentCity = null;
let currentCourse = null;
let currentLevel = 'cities';

async function getCities() { return window.siteData?.getCities() || []; }
async function getCourses() { return window.siteData?.getCourses() || []; }
async function getHeroes() { return window.siteData?.getHeroes() || []; }
async function saveCities(cities) { await window.siteData?.updateCities(cities); }
async function saveCourses(courses) { await window.siteData?.updateCourses(courses); }
async function saveHeroes(heroes) { await window.siteData?.updateHeroes(heroes); }

async function addCity() {
    const name = prompt('Название города:');
    if (!name) return;
    const cities = await getCities();
    cities.push({ id: Date.now(), name, members: 0, description: '' });
    await saveCities(cities);
    await renderTraining();
}

async function editCity(id) {
    const cities = await getCities();
    const city = cities.find(c => c.id === id);
    if (!city) return;
    const newName = prompt('Новое название:', city.name);
    if (newName) city.name = newName;
    const newMembers = prompt('Количество участников:', city.members);
    if (newMembers) city.members = parseInt(newMembers);
    const newDesc = prompt('Описание:', city.description);
    if (newDesc !== null) city.description = newDesc;
    await saveCities(cities);
    await renderTraining();
}

async function deleteCity(id) {
    if (!confirm('Удалить город?')) return;
    let cities = await getCities();
    cities = cities.filter(c => c.id !== id);
    await saveCities(cities);
    if (currentCity === id) { currentLevel = 'cities'; currentCity = null; }
    await renderTraining();
}

async function addCourse() {
    const cities = await getCities();
    const city = currentCity ? cities.find(c => c.id === currentCity) : null;
    if (!city) return;
    const title = prompt('Название курса:');
    if (!title) return;
    const courses = await getCourses();
    courses.push({
        id: Date.now(), city: city.name, title,
        newPrice: parseInt(prompt('Цена:', '35000')) || 35000,
        level: prompt('Уровень (Начальный/Продвинутый/Элитный):', 'Начальный'),
        levelColor: '#10B981', duration: prompt('Длительность:', '4 месяца'),
        instructor: prompt('Инструктор:', 'Капитан Соколов'),
        instructorRank: prompt('Звание инструктора:', 'Инструктор'),
        description: prompt('Описание:'), schedule: prompt('Расписание:', 'Вт/Чт 19:00-21:00'),
        places: parseInt(prompt('Мест:', '12')) || 12
    });
    await saveCourses(courses);
    await renderTraining();
}

async function deleteCourse(id) {
    if (!confirm('Удалить курс?')) return;
    let courses = await getCourses();
    courses = courses.filter(c => c.id !== id);
    await saveCourses(courses);
    if (currentCourse === id) { currentLevel = 'city'; currentCourse = null; }
    await renderTraining();
}

async function copyCourse(id) {
    const courses = await getCourses();
    const original = courses.find(c => c.id === id);
    if (original) {
        courses.push({ ...original, id: Date.now(), title: original.title + ' (копия)' });
        await saveCourses(courses);
        await renderTraining();
        alert('Курс скопирован!');
    }
}

async function renderTraining() {
    const container = document.getElementById('trainingSection');
    if (!container) return;
    if (currentLevel === 'cities') await renderCities(container);
    else if (currentLevel === 'city') await renderCity(container);
    else if (currentLevel === 'course') await renderCourseEditor(container);
    else if (currentLevel === 'heroes') await renderAllHeroes(container);
}

async function renderCities(container) {
    const cities = await getCities();
    container.innerHTML = `
        <div class="section-header"><h2>Города</h2><button class="btn-primary" id="addCityBtn">+ Добавить город</button></div>
        <div class="cities-grid">${cities.map(city => `
            <div class="city-card" data-city-id="${city.id}">
                <div class="city-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg></div>
                <div class="city-name">${escapeHtml(city.name)}</div>
                <div class="city-stats">${(city.members || 0).toLocaleString()} участников</div>
                <div class="city-description">${escapeHtml(city.description || '')}</div>
                <div class="city-actions"><button class="icon-btn edit-city" data-id="${city.id}">${window.Icons.edit}</button><button class="icon-btn danger delete-city" data-id="${city.id}">${window.Icons.delete}</button></div>
            </div>`).join('')}</div>
    `;
    document.getElementById('addCityBtn')?.addEventListener('click', addCity);
    document.querySelectorAll('.city-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.icon-btn')) {
                currentCity = parseInt(card.dataset.cityId);
                currentLevel = 'city';
                renderTraining();
            }
        });
    });
    document.querySelectorAll('.edit-city').forEach(btn => btn.addEventListener('click', (e) => { e.stopPropagation(); editCity(parseInt(btn.dataset.id)); }));
    document.querySelectorAll('.delete-city').forEach(btn => btn.addEventListener('click', (e) => { e.stopPropagation(); deleteCity(parseInt(btn.dataset.id)); }));
}

async function renderCity(container) {
    const cities = await getCities();
    const city = cities.find(c => c.id === currentCity);
    if (!city) { currentLevel = 'cities'; await renderCities(container); return; }
    const courses = await getCourses();
    const cityCourses = courses.filter(c => c.city === city.name);
    container.innerHTML = `
        <div class="breadcrumbs"><span class="breadcrumb-item" onclick="goToCities()">Учебный центр</span><span class="breadcrumb-separator">/</span><span class="breadcrumb-item active">${escapeHtml(city.name)}</span></div>
        <div class="city-header"><div class="city-info"><h2>${escapeHtml(city.name)}</h2><p>${escapeHtml(city.description || '')}</p><div class="city-stats-large">${window.Icons.users} ${(city.members || 0).toLocaleString()} участников</div></div><button class="btn-primary" id="addCourseBtn">+ Добавить курс</button></div>
        <div class="courses-section"><h3>Курсы</h3><div class="courses-grid">${cityCourses.length === 0 ? '<div class="empty-state">Нет курсов</div>' : ''}${cityCourses.map(course => `
            <div class="course-card" data-course-id="${course.id}">
                <div class="course-image"><div class="folder-icon-blue"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg></div></div>
                <div class="course-info"><h4>${escapeHtml(course.title)}</h4><div class="course-meta"><span class="level-badge" style="background: ${course.levelColor}">${escapeHtml(course.level)}</span><span class="price">${course.newPrice.toLocaleString()} ₽</span></div><p>${escapeHtml((course.description || '').substring(0, 80))}...</p></div>
                <div class="course-actions"><button class="icon-btn edit-course" data-id="${course.id}">${window.Icons.edit}</button><button class="icon-btn danger delete-course" data-id="${course.id}">${window.Icons.delete}</button></div>
            </div>`).join('')}</div></div>
    `;
    document.getElementById('addCourseBtn')?.addEventListener('click', addCourse);
    document.querySelectorAll('.course-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.icon-btn')) {
                currentCourse = parseInt(card.dataset.courseId);
                currentLevel = 'course';
                renderTraining();
            }
        });
    });
    document.querySelectorAll('.edit-course').forEach(btn => btn.addEventListener('click', (e) => { e.stopPropagation(); currentCourse = parseInt(btn.dataset.id); currentLevel = 'course'; renderTraining(); }));
    document.querySelectorAll('.delete-course').forEach(btn => btn.addEventListener('click', (e) => { e.stopPropagation(); deleteCourse(parseInt(btn.dataset.id)); }));
}

async function renderCourseEditor(container) {
    const courses = await getCourses();
    const course = courses.find(c => c.id === currentCourse);
    if (!course) { currentLevel = 'city'; await renderCity(container); return; }
    const cities = await getCities();
    const city = cities.find(c => c.name === course.city);
    const stats = { students: 299, startDate: "4 апреля", participants: 299, payments: 888422, flow: 4, finishDate: "12 июня", places: course.places || 300, debt: 124422, city: course.city, totalBlocks: 20, lessons: 12, tests: 8, duration: course.duration || "3 месяца", filled: 20, homeworks: 24, exams: 12 };
    container.innerHTML = `
        <div class="breadcrumbs"><span class="breadcrumb-item" onclick="goToCities()">Учебный центр</span><span class="breadcrumb-separator">/</span><span class="breadcrumb-item" onclick="goToCity()">${escapeHtml(city?.name || '')}</span><span class="breadcrumb-separator">/</span><span class="breadcrumb-item active">${escapeHtml(course.title)}</span></div>
        <div class="course-editor-full">
            <div class="course-editor-header">
                <div class="course-editor-image"><img src="${course.image || '/military-course.jpg'}" id="courseImage"><button class="upload-btn" id="uploadImageBtn">Загрузить фото</button><input type="file" id="imageUploadInput" style="display: none"></div>
                <div class="course-editor-info"><div class="course-header-actions"><button class="btn-copy-top" id="copyCourseBtn">${window.Icons.copy} Копировать</button><button class="btn-delete-top" id="deleteCourseBtn">${window.Icons.delete} Удалить</button></div>
                <h2>${escapeHtml(course.title)}</h2><div class="course-meta-large"><span class="price-large">${course.newPrice.toLocaleString()} ₽</span></div>
                <p>${escapeHtml(course.description || '')}</p>
                <div class="course-action-buttons"><select id="accessSelect"><option>Доступ сразу</option><option>Доступ по расписанию</option></select><button class="btn-access" id="accessNowBtn">Применить</button></div></div>
            </div>
            <div class="stats-grid-4x2">${Object.entries(stats).map(([k,v]) => `<div class="stat-block"><div class="stat-item"><span class="stat-label">${k}</span><span class="stat-value">${v}</span></div></div>`).join('')}</div>
            <div class="instructor-block"><div class="instructor-avatar">${window.Icons.instructor}</div><div class="instructor-info"><h4>${escapeHtml(course.instructor)}</h4><p>${escapeHtml(course.instructorRank)}</p></div>
            <div class="instructor-buttons"><button class="btn-outline" id="contactBtn">Связаться</button><button class="btn-outline" id="scheduleBtn">Расписание</button><button class="btn-outline" id="telegramBtn">Telegram</button></div></div>
            <div class="footer-buttons"><button class="btn-footer" id="generalBtn">${window.Icons.settings} Настройки</button><button class="btn-footer" id="editContentBtn">${window.Icons.lessons} Обучение</button><button class="btn-footer" id="editLandingBtn">${window.Icons.landing} Лендинг</button></div>
        </div>
    `;
    document.getElementById('uploadImageBtn')?.addEventListener('click', () => document.getElementById('imageUploadInput')?.click());
    document.getElementById('imageUploadInput')?.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = async (ev) => {
                course.image = ev.target.result;
                const courses = await getCourses();
                const idx = courses.findIndex(c => c.id === currentCourse);
                if (idx !== -1) courses[idx] = course;
                await saveCourses(courses);
                document.getElementById('courseImage').src = ev.target.result;
                alert('Фото загружено');
            };
            reader.readAsDataURL(file);
        }
    });
    document.getElementById('accessNowBtn')?.addEventListener('click', () => alert('Доступ открыт'));
    document.getElementById('copyCourseBtn')?.addEventListener('click', () => copyCourse(currentCourse));
    document.getElementById('deleteCourseBtn')?.addEventListener('click', () => deleteCourse(currentCourse));
    document.getElementById('generalBtn')?.addEventListener('click', async () => {
        const newTitle = prompt('Название:', course.title);
        if (newTitle) course.title = newTitle;
        const newPrice = prompt('Цена:', course.newPrice);
        if (newPrice) course.newPrice = parseInt(newPrice);
        const newDesc = prompt('Описание:', course.description);
        if (newDesc !== null) course.description = newDesc;
        const courses = await getCourses();
        const idx = courses.findIndex(c => c.id === currentCourse);
        if (idx !== -1) courses[idx] = course;
        await saveCourses(courses);
        await renderTraining();
    });
    document.getElementById('editContentBtn')?.addEventListener('click', () => alert('Редактирование обучения'));
    document.getElementById('editLandingBtn')?.addEventListener('click', () => alert('Редактирование лендинга'));
    document.getElementById('contactBtn')?.addEventListener('click', () => alert('Связаться с инструктором'));
    document.getElementById('scheduleBtn')?.addEventListener('click', () => alert(`Расписание: ${course.schedule}`));
    document.getElementById('telegramBtn')?.addEventListener('click', () => alert('Telegram-чат'));
}

async function renderAllHeroes(container) {
    const heroes = await getHeroes();
    container.innerHTML = `
        <div class="breadcrumbs"><span class="breadcrumb-item" onclick="goToCities()">Учебный центр</span><span class="breadcrumb-separator">/</span><span class="breadcrumb-item active">Герои и Лидеры</span></div>
        <div class="section-header"><h2>Герои и Лидеры</h2><button class="btn-primary" id="addHeroBtn">+ Добавить героя</button></div>
        <div class="heroes-grid">${heroes.length === 0 ? '<div class="empty-state">Нет героев</div>' : ''}${heroes.map(hero => `
            <div class="hero-card"><div class="hero-avatar"><div class="hero-avatar-icon">${hero.categoryIcon || '⭐'}</div></div>
            <div class="hero-info"><h4>${escapeHtml(hero.name)}</h4><div class="hero-meta"><span class="hero-rank">${escapeHtml(hero.rank)}</span><span class="hero-index">ИВ ${hero.index}</span><span class="hero-rating">★ ${hero.rating}</span></div>
            <p>${escapeHtml(hero.position)}</p><p>${escapeHtml(hero.category)}</p></div>
            <div class="hero-actions"><button class="icon-btn edit-hero" data-id="${hero.id}">${window.Icons.edit}</button><button class="icon-btn danger delete-hero" data-id="${hero.id}">${window.Icons.delete}</button></div></div>`).join('')}</div>
    `;
    document.getElementById('addHeroBtn')?.addEventListener('click', addHero);
    document.querySelectorAll('.edit-hero').forEach(btn => btn.addEventListener('click', (e) => { e.stopPropagation(); editHero(parseInt(btn.dataset.id)); }));
    document.querySelectorAll('.delete-hero').forEach(btn => btn.addEventListener('click', (e) => { e.stopPropagation(); deleteHero(parseInt(btn.dataset.id)); }));
}

async function addHero() {
    const name = prompt('Имя героя:');
    if (!name) return;
    const heroes = await getHeroes();
    heroes.push({ id: Date.now(), name, category: 'Преподаватели', categoryIcon: '⭐', rank: prompt('Звание:'), index: parseInt(prompt('Индекс:')) || 2500, rating: 5.0, position: prompt('Должность:') });
    await saveHeroes(heroes);
    if (currentLevel === 'heroes') await renderAllHeroes(document.getElementById('trainingContent'));
}

async function editHero(id) {
    const heroes = await getHeroes();
    const hero = heroes.find(h => h.id === id);
    if (hero) { hero.name = prompt('Имя:', hero.name) || hero.name; await saveHeroes(heroes); }
    if (currentLevel === 'heroes') await renderAllHeroes(document.getElementById('trainingContent'));
}

async function deleteHero(id) {
    if (!confirm('Удалить героя?')) return;
    let heroes = await getHeroes();
    heroes = heroes.filter(h => h.id !== id);
    await saveHeroes(heroes);
    if (currentLevel === 'heroes') await renderAllHeroes(document.getElementById('trainingContent'));
}

function goToCities() { currentLevel = 'cities'; currentCity = null; renderTraining(); }
function goToCity() { currentLevel = 'city'; renderTraining(); }
function showAllHeroes() { currentLevel = 'heroes'; renderTraining(); }

async function initTraining() {
    if (!window.siteData?.initialized) {
        await new Promise(resolve => { const checkInterval = setInterval(() => { if (window.siteData?.initialized) { clearInterval(checkInterval); resolve(); } }, 50); });
    }
    await renderTraining();
    if (window.siteData?.subscribe) window.siteData.subscribe(async (key) => { if (['cities', 'courses', 'heroes'].includes(key)) await renderTraining(); });
}

window.goToCities = goToCities;
window.goToCity = goToCity;
window.showAllHeroes = showAllHeroes;
window.initTraining = initTraining;