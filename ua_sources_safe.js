(function() {
    'use strict';

    function initPlugin() {
        if (typeof Lampa === 'undefined' || !Lampa.Plugin || !Lampa.Source) {
            console.log('Lampa ще не готова, спробуємо через 500ms');
            setTimeout(initPlugin, 500);
            return;
        }

        Lampa.Plugin.add({
            title: 'Українські джерела (Safe)',
            version: '1.3',
            author: 'Євгеній',
            description: 'Плагін з українськими джерелами для Lampa (безпечна версія)',
            onLoad: function() {
                Lampa.Noty.show('🇺🇦 Українські джерела активовано');
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
                    if (typeof cb === 'function') cb([{title: s.title, url: s.url}]);
                },
                onDetails: function() {
                    var cb = arguments[arguments.length - 1];
                    if (typeof cb === 'function') cb([{title: s.title, url: s.url}]);
                }
            });
        });
    }

    initPlugin();
})();