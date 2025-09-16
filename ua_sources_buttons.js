(function() {
    'use strict';

    function initPlugin() {
        if (typeof Lampa === 'undefined' || !Lampa.Plugin || !Lampa.Source) {
            console.log('Lampa ще не готова, спробуємо через 500ms');
            setTimeout(initPlugin, 500);
            return;
        }

        // Додаємо плагін
        Lampa.Plugin.add({
            title: 'Українські джерела з кнопками',
            version: '1.4',
            author: 'Євгеній',
            description: 'Українські джерела для Lampa з активними кнопками перегляду',
            onLoad: function() {
                Lampa.Noty.show('🇺🇦 Українські джерела активовано (з кнопками)');
            },
            onStop: function() {
                Lampa.Noty.show('Плагін зупинено');
            }
        });

        var sources = [
            {id: 'uakino', title: 'UAkino', url: 'https://uakino.club'},
            {id: 'kinoukr', title: 'KinoUkr', url: 'https://kinoukr.com'},
            {id: 'rezka', title: 'Rezka (UA)', url: 'https://rezka.ag'},
            {id: 'kinoplay', title: 'Kinoplay (UA)', url: 'https://kinoplay.org'},
            {id: 'toloka', title: 'Toloka', url: 'https://toloka.to'},
            {id: 'filmix', title: 'Filmix (UA)', url: 'https://filmix.ac'},
            {id: 'uaflix', title: 'UAFlix', url: 'https://uaflix.biz'}
        ];

        sources.forEach(function(s) {
            Lampa.Source.add(s.id, {
                title: s.title,
                onSearch: function() {
                    var cb = arguments[arguments.length - 1];
                    if (typeof cb === 'function') {
                        cb([{
                            title: s.title,
                            url: s.url,
                            info: 'Натисніть, щоб перейти на сайт',
                            buttons: [
                                {
                                    title: 'Переглянути',
                                    action: function(item) {
                                        Lampa.Player.open({
                                            title: item.title,
                                            url: item.url
                                        });
                                    }
                                }
                            ]
                        }]);
                    }
                },
                onDetails: function() {
                    var cb = arguments[arguments.length - 1];
                    if (typeof cb === 'function') {
                        cb([{
                            title: s.title,
                            url: s.url,
                            description: 'Натисніть кнопку Переглянути, щоб перейти на сайт',
                            buttons: [
                                {
                                    title: 'Переглянути',
                                    action: function(item) {
                                        Lampa.Player.open({
                                            title: item.title,
                                            url: item.url
                                        });
                                    }
                                }
                            ]
                        }]);
                    }
                }
            });
        });
    }

    initPlugin();
})();