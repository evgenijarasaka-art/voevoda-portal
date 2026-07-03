// shared/siteData.js
const JSONBIN_CONFIG = {
    binId: "69bb3a24b7ec241ddc7f3f4c",
    apiKey: "$2a$10$wVhOYAYBsyZV1D8jCT1LN.GQD.GdKN0bsmBxKG/.s3I/DTYmqTpR6",
    baseUrl: "https://api.jsonbin.io/v3/b",
};

class SiteDataManager {
    constructor() {
        this.data = { config: null, cities: null, courses: null, heroes: null, documents: null };
        this.initialized = false;
        this.listeners = [];
        this.isAdmin = window.location.pathname.includes('/admin/') || localStorage.getItem('admin_authenticated') === 'true';
    }

    async fetchFromJSONBin() {
        try {
            const response = await fetch(`${JSONBIN_CONFIG.baseUrl}/${JSONBIN_CONFIG.binId}/latest`, {
                headers: { 'X-Master-Key': JSONBIN_CONFIG.apiKey, 'Content-Type': 'application/json' }
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return (await response.json()).record;
        } catch (error) {
            console.error('Error fetching:', error);
            return null;
        }
    }

    async saveToJSONBin() {
        if (!this.isAdmin) return false;
        try {
            await fetch(`${JSONBIN_CONFIG.baseUrl}/${JSONBIN_CONFIG.binId}`, {
                method: 'PUT',
                headers: { 'X-Master-Key': JSONBIN_CONFIG.apiKey, 'Content-Type': 'application/json' },
                body: JSON.stringify(this.data),
            });
            return true;
        } catch (error) {
            console.error('Error saving:', error);
            return false;
        }
    }

    async loadAllData() {
        const cached = localStorage.getItem('site_data');
        if (cached) {
            try { this.data = { ...this.data, ...JSON.parse(cached) }; } catch(e) {}
        }
        const remoteData = await this.fetchFromJSONBin();
        if (remoteData) {
            this.data = { ...this.data, ...remoteData };
            localStorage.setItem('site_data', JSON.stringify(this.data));
        } else {
            this.data = {
                config: { siteName: "УТЦ ВОЕВОДА", contacts: { phone: "+7 (999) 123-45-67" } },
                cities: { cities: [] },
                courses: { courses: [] },
                heroes: { heroes: [] },
                documents: { documents: [], categories: ["Уставы", "Наставления"] }
            };
            if (this.isAdmin) await this.saveToJSONBin();
        }
        this.initialized = true;
        this.notifyListeners('all', this.data);
        return true;
    }

    getConfig() { return this.data.config; }
    getCities() { return this.data.cities?.cities || []; }
    getCourses() { return this.data.courses?.courses || []; }
    getHeroes() { return this.data.heroes?.heroes || []; }
    getDocuments() { return this.data.documents?.documents || []; }
    getDocumentCategories() { return this.data.documents?.categories || []; }

    async updateCities(cities) { this.data.cities.cities = cities; await this.saveToJSONBin(); this.notifyListeners('cities', this.data.cities); }
    async updateCourses(courses) { this.data.courses.courses = courses; await this.saveToJSONBin(); this.notifyListeners('courses', this.data.courses); }
    async updateHeroes(heroes) { this.data.heroes.heroes = heroes; await this.saveToJSONBin(); this.notifyListeners('heroes', this.data.heroes); }
    async updateDocuments(docs, cats) { this.data.documents.documents = docs; this.data.documents.categories = cats; await this.saveToJSONBin(); this.notifyListeners('documents', this.data.documents); }

    subscribe(callback) { this.listeners.push(callback); }
    notifyListeners(key, data) { this.listeners.forEach(cb => cb(key, data)); }

    async init() { 
        await this.loadAllData(); 
        if (!this.isAdmin) {
            setInterval(async () => { 
                const d = await this.fetchFromJSONBin(); 
                if (d) { this.data = { ...this.data, ...d }; this.notifyListeners('all', this.data); } 
            }, 5000);
        }
        return this; 
    }
}

window.siteData = new SiteDataManager();