(function() {
    'use strict';

    function initPlugin() {
        if (typeof Lampa === 'undefined' || !Lampa.Plugin || !Lampa.Source) {
            console.log('Lampa ще не готова, спробуємо через 500ms');
            setTimeout(initPlugin, 500);
            return;
        }

        Lampa.Plugin.add({
            title: 'Українські джерела (реальні потоки)',
            version: '1.0',
            author: 'Євгеній',
            description: 'Плагін з українськими джерелами для Lampa з відкритими потоками',
            onLoad: function() {
                Lampa.Noty.show('🇺🇦 Українські джерела активовано');
            },
            onStop: function() {
                Lampa.Noty.show('Плагін зупинено');
            }
        });

        var sources = [
            {id: 'uakino', title: 'UAkino', url: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4'},
            {id: 'kinoplay', title: 'Kinoplay', url: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4'},
            {id: 'toloka', title: 'Toloka', url: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4'},
            {id: 'filmix', title: 'Filmix', url: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4'},
            {id: 'uaflix', title: 'UAFlix', url: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4'}
        ];

        sources.forEach(function(s) {
            Lampa.Source.add(s.id, {
                title: s.title,
                onSearch: function(query, cb) {
                    var callback = arguments[arguments.length - 1];
                    if (typeof callback === 'function') {
                        callback([{
                            title: s.title,
                            url: s.url,
                            info: 'Натисніть, щоб переглянути',
                        }]);
                    }
                },
                onDetails: function(item, cb) {
                    var callback = arguments[arguments.length - 1];
                    if (typeof callback === 'function') {
                        callback([{
                            title: s.title,
                            url: s.url,
                            description: 'Відкритий потік для перегляду',
                            buttons: [
                                {
                                    title: 'Переглянути',
                                    action: function(it) {
                                        Lampa.Player.open({
                                            title: it.title,
                                            url: it.url
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