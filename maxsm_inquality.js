!function() {
    "use strict";
    
    var PLUGIN_NAME = "maxsm_inquality";
    var JSON_URL = "http://kinoxa.click/inq_parser.json";
    var ICON_SVG = '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512" xml:space="preserve">                            <path fill="currentColor" d="M256,81.077C159.55,81.077,81.077,159.55,81.077,256c0,10.578,8.574,19.152,19.152,19.152s19.152-8.574,19.152-19.158                                c0-75.325,61.287-136.612,136.618-136.612c10.572,0,19.152-8.574,19.152-19.152S266.578,81.077,256,81.077z"></path>                            <path fill="currentColor" d="M411.771,236.848c-10.578,0-19.152,8.574-19.152,19.152c0,75.325-61.287,136.618-136.618,136.618                                c-10.578,0-19.152,8.574-19.152,19.152c0,10.578,8.574,19.152,19.152,19.152c96.45,0,174.923-78.473,174.923-174.923                                C430.923,245.422,422.349,236.848,411.771,236.848z"></path>                            <path fill="currentColor" d="M256,0C114.843,0,0,114.843,0,256s114.843,256,256,256s256-114.842,256-256S397.158,0,256,0z M256,473.696                                c-120.039,0-217.696-97.657-217.696-217.696S135.961,38.304,256,38.304s217.696,97.65,217.696,217.689                                S376.039,473.696,256,473.696z"></path>                            <path fill="currentColor" d="M256,158.318c-53.856,0-97.676,43.814-97.676,97.676s43.814,97.682,97.676,97.682c53.862,0,97.676-43.82,97.676-97.682                               S309.862,158.318,256,158.318z M256,315.378c-32.737,0-59.372-26.634-59.372-59.378c0-32.737,26.634-59.372,59.372-59.372                                c32.744,0,59.372,26.634,59.372,59.372C315.372,288.744,288.737,315.378,256,315.378z"></path>                    </svg>';
    
    Lampa.Lang.add({
        maxsm_inquality_title: {
            ru: "Новые релизы",
            en: "New Releases",        // вместо "In Quality" (было слишком буквально)  
            uk: "Нові релізи",        // вместо "У якості" (неправильный контекст)  
            be: "Новыя рэлізы",       // вместо "У якасці" (не подходит по смыслу)  
            pt: "Novos Lançamentos",  // вместо "Com Qualidade" (не о качестве, а о новых фильмах)  
            zh: "新发布",              // вместо "高质量" (это "высокое качество", а не релизы)  
            he: "מהדורות חדשות",     // вместо "באיכות" ("в качестве" — неверный смысл)  
            cs: "Nové vydání",        // вместо "V kvalitě" ("в качестве" — неправильно)  
            bg: "Нови издания"        // вместо "В качество" (ошибка в контексте)  
        }
    });
    
    function InQualityService() {
        var self = this;
        var network = new Lampa.Reguest();
        
        self.list = function(params, onComplete, onError) {
            var page = parseInt(params.page) || 1;
            
            network.silent(JSON_URL, function(json) {
                if (json && json.results && Array.isArray(json.results)) {
                    var items = normalizeData(json.results);
                    var PAGE_SIZE = 20;
                    var startIndex = (page - 1) * PAGE_SIZE;
                    var endIndex = startIndex + PAGE_SIZE;
                    var pageItems = items.slice(startIndex, endIndex);
                    
                    onComplete({
                        results: pageItems,
                        page: page,
                        total_pages: Math.ceil(items.length / PAGE_SIZE),
                        total_results: items.length
                    });
                } else {
                    onError(new Error("Invalid data format"));
                }
            }, onError);
        };
        
        function normalizeData(items) {
            return items.map(function(item) {
                return {
                    id: item.id,
                    poster_path: item.poster_path || '',
                    vote_average: item.vote_average || 0,
                    original_language: item.original_language || '',
                    title: item.title || '',
                    original_title: item.original_title || item.title || '',
                    release_date: item.release_date || '',
                    quality: item.release_quality || '',
                    source: 'tmdb',
                    type: 'movie'
                };
            });
        }
        
        self.full = function(params, onSuccess, onError) {
            if (params.card) {
                Lampa.Api.sources.tmdb.full({
                    id: params.card.id,
                    method: params.card.type,
                    card: params.card
                }, onSuccess, onError);
            } else {
                onError(new Error("Card data missing"));
            }
        };
        
        self.clear = function() {
            network.clear();
        };
    }

    function startPlugin() {
        var inQualityService = new InQualityService();
        Lampa.Api.sources[PLUGIN_NAME] = inQualityService;
        
        var menuItem = $(
            '<li class="menu__item selector" data-action="' + PLUGIN_NAME + '">' +
                '<div class="menu__ico">' + ICON_SVG + '</div>' +
                '<div class="menu__text">' + Lampa.Lang.translate('maxsm_inquality_title') + '</div>' +
            '</li>'
        );
        
        menuItem.on("hover:enter", function() {
            Lampa.Activity.push({
                url: PLUGIN_NAME,
                title: Lampa.Lang.translate('maxsm_inquality_title'),
                component: "category_full",
                source: PLUGIN_NAME,
                page: 1
            });
        });
        
        $(".menu .menu__list").eq(0).append(menuItem);
    }

    if (window.appready) {
        startPlugin();
    } else {
        Lampa.Listener.follow('app', function(e) {
            if (e.type === 'ready') startPlugin();
        });
    }
}();