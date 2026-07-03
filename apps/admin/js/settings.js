// apps/admin/js/settings.js

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

let settingsData = {};

async function loadSettings() {
    if (!window.siteData) return;
    settingsData = window.siteData.getConfig();
}

async function saveSettings() {
    if (!window.siteData) return;
    await window.siteData.updateConfig(settingsData);
}

function renderSettings() {
    const container = document.getElementById('settingsSection');
    if (!container) return;
    
    container.innerHTML = `
        <div class="content-section">
            <div class="section-title">Общие настройки сайта</div>
            <div class="settings-form">
                <div class="form-group">
                    <label>Название сайта</label>
                    <input type="text" id="siteName" value="${escapeHtml(settingsData.siteName || 'УТЦ ВОЕВОДА')}">
                </div>
                <div class="form-group">
                    <label>Описание сайта</label>
                    <textarea id="siteDescription" rows="3">${escapeHtml(settingsData.siteDescription || 'Сообщество патриотов России')}</textarea>
                </div>
                <div class="form-group">
                    <label>Телефон</label>
                    <input type="text" id="contactPhone" value="${escapeHtml(settingsData.contacts?.phone || '+7 (999) 123-45-67')}">
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" id="contactEmail" value="${escapeHtml(settingsData.contacts?.email || 'info@voevoda.ru')}">
                </div>
                <div class="form-group">
                    <label>Адрес</label>
                    <input type="text" id="contactAddress" value="${escapeHtml(settingsData.contacts?.address || 'г. Москва, ул. Военная, д. 1')}">
                </div>
                <div class="form-group">
                    <label>VK</label>
                    <input type="url" id="socialVk" value="${escapeHtml(settingsData.social?.vk || 'https://vk.com/voevoda')}">
                </div>
                <div class="form-group">
                    <label>Telegram</label>
                    <input type="url" id="socialTg" value="${escapeHtml(settingsData.social?.tg || 'https://t.me/voevoda')}">
                </div>
                <div class="form-group">
                    <label>Odnoklassniki</label>
                    <input type="url" id="socialOk" value="${escapeHtml(settingsData.social?.ok || 'https://ok.ru/voevoda')}">
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Доход (₽)</label>
                        <input type="number" id="statRevenue" value="${settingsData.stats?.revenue || 1522400}">
                    </div>
                    <div class="form-group">
                        <label>Участники</label>
                        <input type="number" id="statParticipants" value="${settingsData.stats?.participants || 12899}">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Посещения</label>
                        <input type="number" id="statVisits" value="${settingsData.stats?.visits || 45283}">
                    </div>
                    <div class="form-group">
                        <label>Среднее время (мин)</label>
                        <input type="number" id="statAvgTime" value="${settingsData.stats?.avgTime || 24}">
                    </div>
                </div>
                <div class="settings-actions">
                    <button class="btn-primary" id="saveSettingsBtn">Сохранить настройки</button>
                    <button class="btn-outline" id="resetSettingsBtn">Сбросить</button>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('saveSettingsBtn')?.addEventListener('click', async () => {
        settingsData = {
            siteName: document.getElementById('siteName')?.value.trim() || 'УТЦ ВОЕВОДА',
            siteDescription: document.getElementById('siteDescription')?.value.trim() || '',
            contacts: {
                phone: document.getElementById('contactPhone')?.value.trim() || '',
                email: document.getElementById('contactEmail')?.value.trim() || '',
                address: document.getElementById('contactAddress')?.value.trim() || ''
            },
            social: {
                vk: document.getElementById('socialVk')?.value.trim() || '',
                tg: document.getElementById('socialTg')?.value.trim() || '',
                ok: document.getElementById('socialOk')?.value.trim() || ''
            },
            stats: {
                revenue: parseInt(document.getElementById('statRevenue')?.value) || 0,
                participants: parseInt(document.getElementById('statParticipants')?.value) || 0,
                visits: parseInt(document.getElementById('statVisits')?.value) || 0,
                avgTime: parseInt(document.getElementById('statAvgTime')?.value) || 0
            }
        };
        await saveSettings();
        alert('Настройки сохранены');
        if (window.updateSummaryStats) window.updateSummaryStats();
    });
    
    document.getElementById('resetSettingsBtn')?.addEventListener('click', async () => {
        if (confirm('Сбросить настройки к значениям по умолчанию?')) {
            settingsData = {
                siteName: "УТЦ ВОЕВОДА",
                siteDescription: "Сообщество патриотов России на базе всероссийской сети центров военной и служебно-прикладной подготовки",
                contacts: { phone: "+7 (999) 123-45-67", email: "info@voevoda.ru", address: "г. Москва, ул. Военная, д. 1" },
                social: { vk: "https://vk.com/voevoda", tg: "https://t.me/voevoda", ok: "https://ok.ru/voevoda" },
                stats: { revenue: 1522400, participants: 12899, visits: 45283, avgTime: 24 }
            };
            await saveSettings();
            renderSettings();
            alert('Настройки сброшены');
            if (window.updateSummaryStats) window.updateSummaryStats();
        }
    });
}

async function initSettings() {
    if (!window.siteData?.initialized) {
        await new Promise(resolve => { 
            const checkInterval = setInterval(() => { 
                if (window.siteData?.initialized) { 
                    clearInterval(checkInterval); 
                    resolve(); 
                } 
            }, 50); 
        });
    }
    await loadSettings();
    renderSettings();
    if (window.siteData?.subscribe) {
        window.siteData.subscribe(async (key) => { 
            if (key === 'config') { 
                await loadSettings(); 
                renderSettings(); 
            } 
        });
    }
}

window.initSettings = initSettings;