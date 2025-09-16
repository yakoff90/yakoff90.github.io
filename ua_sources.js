(function() {
    Lampa.Plugin.add({
        title: 'Українські джерела',
        version: '1.1',
        author: 'Євгеній',
        description: 'Збірка українських ресурсів для Lampa',
        onLoad: function() {
            Lampa.Noty.show('🇺🇦 Українські джерела активовані');

            // UAKINO
            Lampa.Source.add('uakino', {
                title: 'UAkino',
                onSearch: function(query, callback) {
                    callback([{title: 'Перейдіть на UAKINO', url: 'https://uakino.club'}]);
                },
                onDetails: function(movie, callback) {
                    callback([{title: 'UAkino', url: 'https://uakino.club'}]);
                }
            });

            // KINOUKR
            Lampa.Source.add('kinoukr', {
                title: 'KinoUkr',
                onSearch: function(query, callback) {
                    callback([{title: 'Перейдіть на KinoUkr', url: 'https://kinoukr.com'}]);
                },
                onDetails: function(movie, callback) {
                    callback([{title: 'KinoUkr', url: 'https://kinoukr.com'}]);
                }
            });

            // REZKA (укр)
            Lampa.Source.add('rezka', {
                title: 'Rezka (UA)',
                onSearch: function(query, callback) {
                    callback([{title: 'Rezka українською', url: 'https://rezka.ag'}]);
                },
                onDetails: function(movie, callback) {
                    callback([{title: 'Rezka AG', url: 'https://rezka.ag'}]);
                }
            });

            // KINOPLAY
            Lampa.Source.add('kinoplay', {
                title: 'Kinoplay (UA)',
                onSearch: function(query, callback) {
                    callback([{title: 'Kinoplay українською', url: 'https://kinoplay.org'}]);
                },
                onDetails: function(movie, callback) {
                    callback([{title: 'Kinoplay', url: 'https://kinoplay.org'}]);
                }
            });

            // TOLOKA
            Lampa.Source.add('toloka', {
                title: 'Toloka',
                onSearch: function(query, callback) {
                    callback([{title: 'Toloka (торенти)', url: 'https://toloka.to'}]);
                },
                onDetails: function(movie, callback) {
                    callback([{title: 'Toloka', url: 'https://toloka.to'}]);
                }
            });

            // FILMIX (укр доріжки)
            Lampa.Source.add('filmix', {
                title: 'Filmix (UA)',
                onSearch: function(query, callback) {
                    callback([{title: 'Filmix з українською доріжкою', url: 'https://filmix.ac'}]);
                },
                onDetails: function(movie, callback) {
                    callback([{title: 'Filmix', url: 'https://filmix.ac'}]);
                }
            });

            // UAFLIX
            Lampa.Source.add('uaflix', {
                title: 'UAFlix',
                onSearch: function(query, callback) {
                    callback([{title: 'Перейдіть на UAFlix', url: 'https://uaflix.biz'}]);
                },
                onDetails: function(movie, callback) {
                    callback([{title: 'UAFlix', url: 'https://uaflix.biz'}]);
                }
            });

        },
        onStop: function() {}
    });
})();