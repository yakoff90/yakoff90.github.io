!function() {
    "use strict";

    var PLUGIN_NAME = "maxsm_inquality";
    var JSON_URL = "http://kinoxa.click/inq_parser.json"; // можна замінити на своє джерело JSON
    var TMDB_API_KEY = "27489d4d8c9dbd0f2b3e89f68821de34";
    var ICON_SVG = '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M256,81.077C159.55,81.077,81.077,159.55,81.077,256c0,10.578,8.574,19.152,19.152,19.152s19.152-8.574,19.152-19.158c0-75.325,61.287-136.612,136.618-136.612c10.572,0,19.152-8.574,19.152-19.152S266.578,81.077,256,81.077z"></path><path fill="currentColor" d="M411.771,236.848c-10.578,0-19.152,8.574-19.152,19.152c0,75.325-61.287,136.618-136.618,136.618c-10.578,0-19.152,8.574-19.152,19.152c0,10.578,8.574,19.152,19.152,19.152c96.45,0,174.923-78.473,174.923-174.923C430.923,245.422,422.349,236.848,411.771,236.848z"></path><path fill="currentColor" d="M256,0C114.843,0,0,114.843,0,256s114.843,256,256,256s256-114.842,256-256S397.158,0,256,0z M256,473.696c-120.039,0-217.696-97.657-217.696-217.696S135.961,38.304,256,38.304s217.696,97.65,217.696,217.689S376.039,473.696,256,473.696z"></path><path fill="currentColor" d="M256,158.318c-53.856,0-97.676,43.814-97.676,97.676s43.814,97.682,97.676,97.682c53.862,0,97.676-43.82,97.676-97.682S309.862,158.318,256,158.318z M256,315.378c-32.737,0-59.372-26.634-59.372-59.378c0-32.737,26.634-59.372,59.372-59.372c32.744,0,59.372,26.634,59.372,59.372C315.372,288.744,288.737,315.378,256,315.378z"></path></svg>';

    Lampa.Lang.add({
        maxsm_inquality_title: { uk: "Нові релізи", ru: "Новые релизы", en: "New Releases" }
    });

    function InQualityService() {
        var self = this;
        var network = new Lampa.Reguest();
        var cache = {};

        self.list = function(params, onComplete, onError) {
            var page = parseInt(params.page) || 1;

            network.silent(JSON_URL, function(json) {
                if (!json || !json.results || !Array.isArray(json.results)) return onError(new Error("Invalid data"));

                var items = json.results.map(function(item) {
                    var id = item.id || item.title || Math.random();
                    var title = item.title || '';
                    var poster = item.poster_path || '';

                    var card = {
                        id: id,
                        title: title,
                        original_title: title,
                        poster_path: poster,
                        vote_average: item.vote_average || 0,
                        release_date: item.release_date || '',
                        quality: item.release_quality || '',
                        original_language: item.original_language || '',
                        source: 'tmdb',
                        type: 'movie'
                    };

                    // асинхронно оновлюємо українські дані
                    fetchTMDB(title, card);

                    return card;
                });

                var PAGE_SIZE = 20;
                var startIndex = (page - 1) * PAGE_SIZE;
                var pageItems = items.slice(startIndex, startIndex + PAGE_SIZE);

                onComplete({
                    results: pageItems,
                    page: page,
                    total_pages: Math.ceil(items.length / PAGE_SIZE),
                    total_results: items.length
                });
            }, onError);
        };

        function fetchTMDB(title, card) {
            if (!title) return;
            Lampa.TMDB.search(title, function(found) {
                if (found && found.results && found.results.length) {
                    let match = found.results[0];
                    let newTitle = match.title || match.name;
                    let newPoster = match.poster_path ? "https://image.tmdb.org/t/p/w500" + match.poster_path : '';

                    // оновлюємо картку у Lampa
                    card.title = newTitle;
                    card.original_title = newTitle;
                    if (newPoster) card.poster_path = newPoster;

                    Lampa.Activity.updateCard(card);
                }
            }, function(){}, { language: 'uk-UA', api_key: TMDB_API_KEY, type: 'movie' });
        }

        self.full = function(params, onSuccess, onError) {
            if (!params.card) return onError(new Error("Card missing"));
            Lampa.Api.sources.tmdb.full({ id: params.card.id, method: params.card.type, card: params.card }, onSuccess, onError);
        };

        self.clear = function() {
            network.clear();
            cache = {};
        };
    }

    function startPlugin() {
        var service = new InQualityService();
        Lampa.Api.sources[PLUGIN_NAME] = service;

        var menuItem = $(
            '<li class="menu__item selector" data-action="' + PLUGIN_NAME + '">' +
                '<div class="menu__ico">' + ICON_SVG + '</div>' +
                '<div class="menu__text">' + Lampa.Lang.translate('maxsm_inquality_title') + '</div>' +
            '</li>'
        );

        menuItem.on("hover:enter", function() {
            Lampa.Activity.push({ url: PLUGIN_NAME, title: Lampa.Lang.translate('maxsm_inquality_title'), component: "category_full", source: PLUGIN_NAME, page: 1 });
        });

        $(".menu .menu__list").eq(0).append(menuItem);
    }

    if (window.appready) startPlugin();
    else Lampa.Listener.follow('app', e => { if (e.type === 'ready') startPlugin(); });

}();
