// apps/admin/js/summary.js

let summaryData = {
    revenue: 0,
    participants: 0,
    visits: 0,
    avgTime: 0
};

function loadSummaryData() {
    if (!window.siteData) return;
    
    const config = window.siteData.getConfig();
    if (config && config.stats) {
        summaryData.revenue = config.stats.revenue || 0;
        summaryData.visits = config.stats.visits || 0;
        summaryData.avgTime = config.stats.avgTime || 0;
    }
    
    const cities = window.siteData.getCities();
    summaryData.participants = cities.reduce((sum, c) => sum + (c.members || 0), 0);
}

function renderSummary() {
    const container = document.getElementById('summarySection');
    if (!container) return;
    
    loadSummaryData();
    
    const cities = window.siteData?.getCities() || [];
    const courses = window.siteData?.getCourses() || [];
    const heroes = window.siteData?.getHeroes() || [];
    
    container.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-title">Доход</div>
                <div class="stat-value">${summaryData.revenue.toLocaleString()} ₽</div>
                <div class="stat-change positive">↑ 12% за месяц</div>
            </div>
            <div class="stat-card">
                <div class="stat-title">Участники</div>
                <div class="stat-value" id="totalParticipants">${summaryData.participants.toLocaleString()}</div>
                <div class="stat-change positive">↑ 8% за месяц</div>
            </div>
            <div class="stat-card">
                <div class="stat-title">Посещения</div>
                <div class="stat-value">${summaryData.visits.toLocaleString()}</div>
                <div class="stat-change positive">↑ 15% за месяц</div>
            </div>
            <div class="stat-card">
                <div class="stat-title">Среднее время</div>
                <div class="stat-value">${summaryData.avgTime} мин</div>
                <div class="stat-change positive">↑ 3 мин</div>
            </div>
        </div>
        
        <div class="buttons-grid">
            <div class="admin-btn" data-action="cities">
                <h3>Города</h3>
                <p>Города, мероприятия, участники</p>
                <div><span class="count" id="citiesCount">${cities.length}</span><span class="sub">городов</span></div>
            </div>
            <div class="admin-btn" data-action="courses">
                <h3>Учебный центр</h3>
                <p>Курсы, домашние задания</p>
                <div><span class="count" id="coursesCount">${courses.length}</span><span class="sub">курсов</span></div>
            </div>
            <div class="admin-btn" data-action="heroes">
                <h3>Герои и Лидеры</h3>
                <p>Добавление и редактирование</p>
                <div><span class="count" id="heroesCount">${heroes.length}</span><span class="sub">записи</span></div>
            </div>
            <div class="admin-btn" data-action="competitions">
                <h3>Соревнования</h3>
                <p>Соревнования, участники</p>
                <div><span class="count">124</span><span class="sub">участника</span></div>
            </div>
            <div class="admin-btn" data-action="path">
                <h3>Путь Воеводы</h3>
                <p>Создание, редактирование</p>
                <div><span class="count">1 522</span><span class="sub">участника</span></div>
            </div>
            <div class="admin-btn" data-action="awards">
                <h3>Звания и награды</h3>
                <p>Добавление и редактирование</p>
                <div><span class="count">124</span><span class="sub">награды</span></div>
            </div>
            <div class="admin-btn" data-action="journal">
                <h3>Журнал</h3>
                <p>Статьи, новости, блог</p>
                <div><span class="count">124</span><span class="sub">публикации</span></div>
            </div>
            <div class="admin-btn" data-action="communities">
                <h3>Сообщества</h3>
                <p>Управление сообществами</p>
                <div><span class="count">18</span><span class="sub">сообществ</span></div>
            </div>
            <div class="admin-btn" data-action="users">
                <h3>Пользователи</h3>
                <p>Назначение ролей и управление</p>
                <div><span class="count">12 899</span><span class="sub">пользователей</span></div>
            </div>
        </div>
    `;
    
    document.querySelectorAll('.admin-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.getAttribute('data-action');
            if (action === 'cities' || action === 'courses') {
                const trainingSection = document.getElementById('trainingSection');
                const summarySection = document.getElementById('summarySection');
                if (trainingSection && summarySection) {
                    summarySection.style.display = 'none';
                    trainingSection.style.display = 'block';
                    document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
                    document.querySelector('.nav-item[data-section="training"]')?.classList.add('active');
                }
            } else if (action === 'heroes') {
                const trainingSection = document.getElementById('trainingSection');
                const summarySection = document.getElementById('summarySection');
                if (trainingSection && summarySection) {
                    summarySection.style.display = 'none';
                    trainingSection.style.display = 'block';
                    document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
                    document.querySelector('.nav-item[data-section="training"]')?.classList.add('active');
                    if (window.showAllHeroes) window.showAllHeroes();
                }
            } else {
                alert(`Функция "${action}" в разработке`);
            }
        });
    });
}

function initSummary() {
    if (window.siteData && window.siteData.initialized) {
        renderSummary();
    } else {
        const checkInterval = setInterval(() => {
            if (window.siteData && window.siteData.initialized) {
                clearInterval(checkInterval);
                renderSummary();
            }
        }, 100);
    }
    
    if (window.siteData && window.siteData.subscribe) {
        window.siteData.subscribe((key, data) => {
            if (key === 'cities' || key === 'courses' || key === 'heroes' || key === 'config') {
                renderSummary();
            }
        });
    }
}

window.initSummary = initSummary;