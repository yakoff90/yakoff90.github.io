(function () {    
    'use strict';    
    
    if (!window.Lampa) return;    
    
    /* ================== CONST ================== */    
    
    const STORAGE_LIST   = 'torrserver_multi_list';    
    const STORAGE_ACTIVE = 'torrserver_multi_active';    
    const CHECK_TIMEOUT  = 1500; // Зменшено для швидшої реакції  
    const CACHE_TTL      = 30000; // 30 секунд кешування  
    
    /* ================== STORAGE ================== */    
    
    function getList() {    
        return Lampa.Storage.get(STORAGE_LIST, []);    
    }    
    
    function saveList(list) {    
        Lampa.Storage.set(STORAGE_LIST, list);    
    }    
    
    function getActiveId() {    
        return Lampa.Storage.get(STORAGE_ACTIVE, null);    
    }    
    
    function setActive(id) {    
        Lampa.Storage.set(STORAGE_ACTIVE, id);    
    
        let server = getList().find(s => s.id === id);    
        if (server) {    
            Lampa.Storage.set('torrserver_url', server.url);    
        }    
    }    
    
    function genId() {    
        return Date.now() + Math.floor(Math.random() * 1000);    
    }    
    
    /* ================== CHECK ================== */    
    
    // Кеш для статусів серверів  
    const statusCache = new Map();  
    
    function checkServer(url) {    
        const cached = statusCache.get(url);  
        if (cached && Date.now() - cached.timestamp < CACHE_TTL) {  
            return Promise.resolve(cached.status);  
        }  
          
        return new Promise(resolve => {    
            let controller = new AbortController();    
            let timer = setTimeout(() => controller.abort(), CHECK_TIMEOUT);    
    
            fetch(url + '/echo', { signal: controller.signal })    
                .then(r => {  
                    const status = r && r.ok;  
                    statusCache.set(url, { status, timestamp: Date.now() });  
                    resolve(status);  
                })    
                .catch(() => {  
                    statusCache.set(url, { status: false, timestamp: Date.now() });  
                    resolve(false);  
                })    
                .finally(() => clearTimeout(timer));    
        });    
    }    
    
    // Паралельна перевірка всіх серверів  
    async function updateStatuses() {    
        let list = getList();    
    
        // Створюємо проміси для паралельної перевірки  
        const promises = list.map(async (server) => {  
            server.online = await checkServer(server.url);  
            return server;  
        });  
          
        const updatedList = await Promise.all(promises);  
        saveList(updatedList);  
        return updatedList;  
    }    
    
    // Фонова перевірка статусів без блокування UI  
    async function updateStatusesInBackground() {  
        try {  
            let updatedList = await updateStatuses();  
            // Оновлюємо інтерфейс, якщо він відкритий  
            if (window.currentSelectInstance) {  
                refreshSelectItems(updatedList);  
            }  
        } catch (error) {  
            console.error('Error updating server statuses:', error);  
        }  
    }  
    
    /* ================== AUTO SWITCH ================== */    
    
    async function autoSwitchIfDown() {    
        try {  
            let list = await updateStatuses();    
            let activeId = getActiveId();    
            let active = list.find(s => s.id === activeId);    
    
            if (active && active.online) return;    
    
            let fallback = list.find(s => s.online);    
            if (fallback) {    
                setActive(fallback.id);    
                Lampa.Noty.show('TorrServer змінено автоматично');    
            }  
        } catch (error) {  
            console.error('Error in auto switch:', error);  
        }  
    }    
    
    /* ================== UI ================== */    
    
    // Зберігаємо посилання на поточний інстанс Select для оновлення  
    let currentSelectInstance = null;  
    
    function refreshSelectItems(list) {  
        if (!currentSelectInstance) return;  
          
        let activeId = getActiveId();  
        let items = list.map(s => ({    
            title:    
                (s.online ? '🟢 ' : '🔴 ') +    
                s.name +    
                (s.id === activeId ? ' ✔' : ''),    
            description: s.url,    
            onSelect: () => openServerMenu(s.id)    
        }));    
    
        items.push({    
            title: '+ Додати TorrServer',    
            onSelect: addServer    
        });  
          
        // Оновлюємо елементи в інтерфейсі  
        currentSelectInstance.items = items;  
        currentSelectInstance.build();  
    }  
    
    async function openManager() {    
        let list = getList(); // Отримуємо список без перевірки  
        let activeId = getActiveId();    
    
        // Показуємо інтерфейс негайно  
        let items = list.map(s => ({    
            title: '⚪ ' + s.name + (s.id === activeId ? ' ✔' : ''),    
            description: s.url,    
            onSelect: () => openServerMenu(s.id)    
        }));    
    
        items.push({    
            title: '+ Додати TorrServer',    
            onSelect: addServer    
        });    
    
        currentSelectInstance = Lampa.Select.show({    
            title: 'TorrServer',    
            items,    
            onBack: () => {    
                currentSelectInstance = null;  
                Lampa.Controller.toggle('content');    
            }    
        });  
          
        // Запускаємо фонову перевірку статусів  
        updateStatusesInBackground();  
    }    
    
    function openServerMenu(id) {    
        let list = getList();    
        let s = list.find(i => i.id === id);    
        if (!s) return;    
    
        Lampa.Select.show({    
            title: s.name,    
            items: [    
                {    
                    title: 'Зробити активним',    
                    onSelect: () => {    
                        setActive(id);    
                        Lampa.Noty.show('TorrServer активовано');    
                        Lampa.Controller.toggle('content');    
                    }    
                },    
                {    
                    title: 'Перевірити доступність',    
                    onSelect: async () => {    
                        Lampa.Noty.show('Перевірка...');    
                        try {  
                            let ok = await checkServer(s.url);    
                            Lampa.Noty.show(ok ? 'Сервер ONLINE 🟢' : 'Сервер OFFLINE 🔴');    
                        } catch (error) {  
                            Lampa.Noty.show('Помилка перевірки');  
                        }  
                        Lampa.Controller.toggle('content');    
                    }    
                },    
                {    
                    title: 'Редагувати',    
                    onSelect: () => editServer(s)    
                },    
                {    
                    title: 'Видалити',    
                    onSelect: () => {    
                        saveList(list.filter(i => i.id !== id));    
                        openManager();    
                    }    
                }    
            ],    
            onBack: () => {    
                Lampa.Controller.toggle('content');    
            }    
        });    
    }    
    
    function addServer() {    
        Lampa.Input.edit({    
            title: 'Назва TorrServer',    
            free: true,    
            nosave: true,    
            value: ''    
        }, (name) => {    
            if (name) {    
                Lampa.Input.edit({    
                    title: 'URL TorrServer',    
                    free: true,    
                    nosave: true,    
                    value: 'http://'    
                }, (url) => {    
                    if (url) {    
                        let list = getList();    
                        list.push({    
                            id: genId(),    
                            name,    
                            url,    
                            online: false    
                        });    
                        saveList(list);    
                        openManager();    
                    } else {    
                        Lampa.Controller.toggle('content');    
                    }    
                });    
            } else {    
                Lampa.Controller.toggle('content');    
            }    
        });    
    }    
    
    function editServer(server) {    
        Lampa.Input.edit({    
            title: 'Назва TorrServer',    
            free: true,    
            nosave: true,    
            value: server.name    
        }, (name) => {    
            if (name) {    
                Lampa.Input.edit({    
                    title: 'URL TorrServer',    
                    free: true,    
                    nosave: true,    
                    value: server.url    
                }, (url) => {    
                    if (url) {    
                        let list = getList();    
                        let s = list.find(i => i.id === server.id);    
                        if (s) {    
                            s.name = name;    
                            s.url = url;    
                            // Очищуємо кеш для зміненого URL  
                            statusCache.delete(server.url);  
                            statusCache.delete(url);  
                        }    
                        saveList(list);    
                        openManager();    
                    } else {    
                        Lampa.Controller.toggle('content');    
                    }    
                });    
            } else {    
                Lampa.Controller.toggle('content');    
            }    
        });    
    }    
    
    /* ================== SETTINGS ================== */    
    
    function addToSettings() {    
        Lampa.SettingsApi.addComponent({    
            component: 'multi_torrserver',    
            icon: `<svg height="36" viewBox="0 0 38 36" fill="none" xmlns="http://www.w3.org/2000/svg">    
                <rect x="2" y="8" width="34" height="21" rx="3" stroke="white" stroke-width="3"/>    
                <line x1="13.0925" y1="2.34874" x2="16.3487" y2="6.90754" stroke="white" stroke-width="3" stroke-linecap="round"/>    
                <line x1="1.5" y1="-1.5" x2="9.31665" y2="-1.5" transform="matrix(-0.757816 0.652468 0.652468 0.757816 26.197 2)" stroke="white" stroke-width="3" stroke-linecap="round"/>    
                <line x1="9.5" y1="34.5" x2="29.5" y2="34.5" stroke="white" stroke-width="3" stroke-linecap="round"/>    
            </svg>`,    
            name: 'Мульти TorrServer'    
        });    
    
        Lampa.SettingsApi.addParam({    
            component: 'multi_torrserver',    
            param: {    
                type: 'title'    
            },    
            field: {    
                name: 'Керування TorrServer',    
            }    
        });    
    
        Lampa.SettingsApi.addParam({    
            component: 'multi_torrserver',    
            param: {    
                type: 'button'    
            },    
            field: {    
                name: 'Список серверів',    
                description: 'Додати, редагувати та перемикати TorrServer'    
            },    
            onChange: openManager    
        });    
    }    
    
    /* ================== INIT ================== */    
    
    function init() {    
        if (!Lampa.Storage.get(STORAGE_LIST)) {    
            saveList([]);    
        }    
    
        // Відкладаємо авто-переключення, щоб не блокувати ініціалізацію  
        setTimeout(autoSwitchIfDown, 1000);  
    
        if (window.Lampa && window.Lampa.SettingsApi) {    
            addToSettings();    
        } else {    
            Lampa.Listener.follow('settings', e => {    
                if (e.type === 'ready') addToSettings();    
            });    
        }    
    }    
    
    if (window.appready) init();    
    else {    
        Lampa.Listener.follow('app', e => {    
            if (e.type === 'ready') init();    
        });    
    }    
    
})();
