(function() {
    'use strict';

    function safeLog() {
        try { console.log.apply(console, arguments); } catch(e) {}
    }

    function safeShowNoty(text) {
        try {
            if (window.Lampa && Lampa.Noty && typeof Lampa.Noty.show === 'function') {
                Lampa.Noty.show(text);
            } else {
                safeLog('NOTY:', text);
            }
        } catch(e) { safeLog('noty error', e); }
    }

    // Універсальний виклик callback'у (інколи Lampa передає різні сигнатури)
    function callCallbackFromArgs(args, data) {
        try {
            if (!args || args.length === 0) return;
            var cb = args[args.length - 1];
            if (typeof cb === 'function') {
                try { cb(data); } catch(e) { safeLog('callback error', e); }
            } else if (cb && typeof cb.success === 'function') {
                try { cb.success(data); } catch(e) { safeLog('callback.success error', e); }
            } else {
                safeLog('No callable callback found, args:', args);
            }
        } catch(e) { safeLog('callCallbackFromArgs error', e); }
    }

    try {
        if (typeof window === 'undefined') {
            throw new Error('No window object');
        }

        if (typeof Lampa === 'undefined') {
            // Якщо Lampa не підключено, припиняємо роботу, але не кидаємо фатальну помилку
            safeLog('Lampa not found. Скрипт для Lampa пропущено.');
            return;
        }

        // Перевіряємо існування API
        if (!Lampa.Plugin || !Lampa.Source) {
            safeLog('Lampa.Plugin або Lampa.Source відсутні. Нічого не реєструємо.');
            safeShowNoty('Помилка плагіна: відсутній API Lampa.Plugin або Lampa.Source');
            return;
        }

        // Масив джерел — тільки для реєстрації; кожне джерело має id, title, url (інформативно)
        var sources = [
            {id: 'uakino', title: 'UAkino', url: 'https://uakino.club'},
            {id: 'kinoukr', title: 'KinoUkr', url: 'https://kinoukr.com'},
            {id: 'rezka', title: 'Rezka (UA)', url: 'https://rezka.ag'},
            {id: 'kinoplay', title: 'Kinoplay (UA)', url: 'https://kinoplay.org'},
            {id: 'toloka', title: 'Toloka', url: 'https://toloka.to'},
            {id: 'filmix', title: 'Filmix (UA)', url: 'https://filmix.ac'},
            {id: 'uaflix', title: 'UAFlix', url: 'https://uaflix.biz'}
        ];

        // Додаємо плагін у Lampa (без складної логіки)
        Lampa.Plugin.add({
            title: 'Українські джерела (безпечна версія)',
            version: '1.1.1',
            author: 'Євгеній',
            description: 'Захищена версія плагіна з українськими джерелами — не кидає помилок при завантаженні.',
            onLoad: function() {
                safeShowNoty('🇺🇦 Українські джерела (безпечна версія) активовано');
            },
            onStop: function() {
                safeShowNoty('Плагін зупинено');
            }
        });

        // Реєструємо джерела, але з безпечними callback'ами, які ніколи не кинуть помилку
        sources.forEach(function(s) {
            try {
                Lampa.Source.add(s.id, {
                    title: s.title,
                    // onSearch — безпечний: повертає пояснювальний результат або порожній результат
                    onSearch: function() {
                        // Викликаємо callback (останній аргумент) з масивом результатів
                        var dummy = [
                            {
                                title: s.title + ' — перейдіть на сайт',
                                url: s.url,
                                info: 'Це демонстраційний елемент. Для реальних потоків потрібно реалізувати парсер.'
                            }
                        ];
                        callCallbackFromArgs(arguments, dummy);
                    },
                    // onDetails — безпечний: повертає посилання на сайт як "деталі"
                    onDetails: function() {
                        var details = [
                            {
                                title: s.title,
                                url: s.url,
                                description: 'Відкрийте сайт для перегляду/парсингу.'
                            }
                        ];
                        callCallbackFromArgs(arguments, details);
                    }
                });
                safeLog('Registered source:', s.id);
            } catch(e) {
                safeLog('Error registering source ' + s.id, e);
            }
        });

        safeLog('UA sources plugin loaded successfully (safe mode).');
    } catch (err) {
        safeLog('Plugin fatal error:', err);
        try {
            if (window.Lampa && Lampa.Noty) Lampa.Noty.show('Script error: ' + (err && err.message ? err.message : err));
        } catch(e) {}
    }
})();