(function () {
    'use strict';

    if (typeof Lampa === 'undefined') return;

    // ========== НАЛАШТУВАННЯ ==========
    var CONFIG = {
        cacheTime: 23 * 60 * 60 * 1000,
        language: 'uk'
    };

    var PROXIES = [
        'https://cors.lampa.stream/',
        'https://cors.eu.org/'
    ];

    // ========== КЕШ ЗОБРАЖЕНЬ ==========
    var AltImageCache = {
        index: {},
        supported: ('caches' in window),
        init: function() {
            try {
                this.index = JSON.parse(Lampa.Storage.get('uas_alt_img_index') || '{}');
            } catch(e) { 
                this.index = {}; 
            }
        },
        saveIndex: function() {
            Lampa.Storage.set('uas_alt_img_index', JSON.stringify(this.index));
        },
        get: async function(url) {
            if (!this.supported || !this.index[url]) return null;
            try {
                var cache = await caches.open('uas_alt_images_v1');
                var res = await cache.match(url);
                if (res) {
                    this.index[url].time = Date.now();
                    this.saveIndex();
                    var blob = await res.blob();
                    return URL.createObjectURL(blob);
                }
            } catch(e) {}
            return null;
        },
        setAndGet: async function(url) {
            if (!this.supported) return url;
            try {
                var res = await fetch(url);
                if (res.ok) {
                    var clone = res.clone();
                    var blob = await res.blob();
                    var cache = await caches.open('uas_alt_images_v1');
                    await cache.put(url, clone);
                    this.index[url] = { time: Date.now(), size: blob.size };
                    this.saveIndex();
                    return URL.createObjectURL(blob);
                }
            } catch(e) {}
            return url;
        }
    };

    // ========== ФОН МЕНЕДЖЕР ==========
    var BgManager = {
        container: null,
        layer1: null,
        layer2: null,
        currentLayer: 1,
        activeUrl: '',
        timer: null,
        init: function() {
            if (this.container) return;
            this.container = document.createElement('div');
            this.container.id = 'uas-bg-container';
            this.layer1 = document.createElement('div');
            this.layer1.className = 'uas-bg-layer active';
            this.layer2 = document.createElement('div');
            this.layer2.className = 'uas-bg-layer';
            this.container.appendChild(this.layer1);
            this.container.appendChild(this.layer2);
            document.body.appendChild(this.container);
        },
        change: function(url) {
            if (!url || this.activeUrl === url) return;
            var _this = this;
            if (this.timer) clearTimeout(this.timer);
            this.timer = setTimeout(function() {
                _this.activeUrl = url;
                var nextLayer = _this.currentLayer === 1 ? _this.layer2 : _this.layer1;
                var activeLayer = _this.currentLayer === 1 ? _this.layer1 : _this.layer2;
                nextLayer.style.backgroundImage = 'url(' + url + ')';
                nextLayer.classList.add('active');
                activeLayer.classList.remove('active');
                _this.currentLayer = _this.currentLayer === 1 ? 2 : 1;
            }, 50);
        },
        hide: function() {
            if (this.container) this.container.style.display = 'none';
        },
        show: function() {
            if (this.container) this.container.style.display = 'block';
        }
    };

    // ========== ДОПОМІЖНІ ФУНКЦІЇ ==========
    function getTmdbKey() {
        var custom = (Lampa.Storage.get('uas_pro_tmdb_apikey') || '').trim();
        return custom || (Lampa.TMDB && Lampa.TMDB.key ? Lampa.TMDB.key() : '');
    }

    function getTmdbEndpoint(path) {
        var url = Lampa.TMDB.api(path);
        var key = getTmdbKey();
        if (key && !url.includes('api_key')) {
            url += (url.includes('?') ? '&' : '?') + 'api_key=' + key;
        }
        if (!url.startsWith('http')) url = 'https://api.themoviedb.org/3/' + url;
        return url;
    }

    async function getImdbIdForTmdb(tmdbId, type) {
        if (!tmdbId) return null;
        var cacheKey = 'alt_imdb_' + tmdbId;
        var cached = Lampa.Storage.get(cacheKey);
        var now = Date.now();
        if (cached && (now - cached.time) < 4 * 24 * 60 * 60 * 1000) {
            return cached.id;
        }
        var endpoint = getTmdbEndpoint(type + '/' + tmdbId + '/external_ids');
        try {
            var res = await fetch(PROXIES[0] + endpoint);
            var data = await res.json();
            if (data && data.imdb_id) {
                Lampa.Storage.set(cacheKey, { id: data.imdb_id, time: now });
                return data.imdb_id;
            }
        } catch(e) {}
        return null;
    }

    // ========== НАЛАШТУВАННЯ ==========
    function createSettings() {
        if (!window.Lampa || !Lampa.SettingsApi) return;
        
        Lampa.SettingsApi.addComponent({
            component: 'ymainpage_alt',
            name: 'Альтернативний вигляд',
            icon: '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>'
        });

        Lampa.SettingsApi.addParam({
            component: 'ymainpage_alt',
            param: { name: 'uas_alt_design_enable', type: 'trigger', default: false },
            field: { name: 'Увімкнути альтернативний вигляд', description: 'Новий дизайн карток' }
        });

        Lampa.SettingsApi.addParam({
            component: 'ymainpage_alt',
            param: { name: 'uas_alt_apikey_btn', type: 'button' },
            field: { name: 'API ключ easyratingsdb', description: 'Натисніть, щоб ввести ключ' }
        });

        var badgePosValues = {
            'tl': 'Верхній Лівий',
            'tr': 'Верхній Правий',
            'ml': 'Середина Лівий',
            'mr': 'Середина Правий',
            'bl': 'Нижній Лівий',
            'br': 'Нижній Правий'
        };
        
        Lampa.SettingsApi.addParam({
            component: 'ymainpage_alt',
            param: { name: 'uas_alt_badge_pos', type: 'select', values: badgePosValues, default: 'tl' },
            field: { name: 'Позиція бейджів', description: 'Де відображати рік та сезон на картках' }
        });

        Lampa.Settings.listener.follow('open', function (e) {
            if (e.name === 'ymainpage_alt') {
                e.body.find('[data-name="uas_alt_apikey_btn"]').on('hover:enter', function () {
                    var currentKey = Lampa.Storage.get('uas_alt_design_apikey') || '';
                    Lampa.Input.edit({
                        title: 'API Ключ easyratingsdb', 
                        value: currentKey, 
                        free: true, 
                        nosave: true
                    }, function (new_val) {
                        if (new_val !== undefined) {
                            Lampa.Storage.set('uas_alt_design_apikey', new_val.trim());
                            Lampa.Noty.show('Ключ збережено');
                        }
                    });
                });
            }
        });
    }

    // ========== CSS СТИЛІ ==========
    function addStyles() {
        var style = document.createElement('style');
        style.innerHTML = [
            '.card__age { display: none !important; }',
            '',
            '/* Альтернативний дизайн */',
            'body.uas-alt-design-active .card__vote,',
            'body.uas-alt-design-active .card-rating,',
            'body.uas-alt-design-active .card .card__vote { display: none !important; }',
            '',
            'body.uas-alt-design-active .card--wide-custom .card-backdrop-overlay { display: none !important; }',
            '',
            '/* Контейнер бейджів */',
            '.card.uas-alt-card .card-custom-badges {',
            '  position: absolute !important;',
            '  display: flex !important;',
            '  flex-direction: column !important;',
            '  gap: 0.2em !important;',
            '  z-index: 20 !important;',
            '  pointer-events: none !important;',
            '}',
            '',
            '.card.uas-alt-card .badge-pos-tl { left: 0.3em !important; top: 0.55em !important; align-items: flex-start !important; }',
            '.card.uas-alt-card .badge-pos-tr { right: 0.3em !important; top: 0.55em !important; align-items: flex-end !important; }',
            '.card.uas-alt-card .badge-pos-ml { left: 0.3em !important; top: 50% !important; transform: translateY(-50%) !important; align-items: flex-start !important; }',
            '.card.uas-alt-card .badge-pos-mr { right: 0.3em !important; top: 50% !important; transform: translateY(-50%) !important; align-items: flex-end !important; }',
            '.card.uas-alt-card .badge-pos-bl { left: 0.3em !important; bottom: 0.55em !important; align-items: flex-start !important; }',
            '.card.uas-alt-card .badge-pos-br { right: 0.3em !important; bottom: 0.55em !important; align-items: flex-end !important; }',
            '',
            '.card.uas-alt-card .card-custom-badges > div {',
            '  position: static !important;',
            '  margin: 0 !important;',
            '  height: 1.6em !important;',
            '  border-radius: 2em !important;',
            '  display: flex !important;',
            '  align-items: center !important;',
            '  justify-content: center !important;',
            '  background: rgba(0, 0, 0, 0.6) !important;',
            '  padding: 0 0.6em !important;',
            '  font-size: 0.7em !important;',
            '  font-weight: bold !important;',
            '  color: #fff !important;',
            '}',
            '',
            '/* Фоновий контейнер */',
            '#uas-bg-container {',
            '  position: fixed; top: 0; left: 0; right: 0; bottom: 0;',
            '  width: 100vw; height: 100vh; z-index: 1;',
            '  pointer-events: none; background-color: #000;',
            '  display: none;',
            '}',
            '',
            '.uas-bg-layer {',
            '  position: absolute; top: 0; left: 0;',
            '  width: 100%; height: 100%;',
            '  background-size: cover; background-position: center;',
            '  opacity: 0; transition: opacity 1s ease-in-out;',
            '  filter: blur(10px) brightness(0.4);',
            '}',
            '',
            '.uas-bg-layer.active { opacity: 1; }',
            '',
            'body.uas-main-active .background { display: none !important; }',
            'body.uas-main-active .wrap { position: relative; z-index: 2; }',
            '',
            '/* Широкі картки */',
            '.card--wide-custom { width: 25em !important; margin-right: 0.2em !important; position: relative; cursor: pointer; transition: transform 0.2s ease; z-index: 1; }',
            '.card--wide-custom .card__view { border-radius: 0.4em !important; overflow: hidden !important; }',
            '.card--wide-custom.focus { z-index: 99 !important; transform: scale(1.08) !important; }',
            '.card--wide-custom.focus .card__view { border: 3px solid #fff !important; }',
            '',
            '.custom-title-bottom { width: 100%; text-align: left; font-size: 1.1em; font-weight: bold; margin-top: 0.3em; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }',
            '.custom-overview-bottom { width: 100%; text-align: left; font-size: 0.85em; color: #bbb; line-height: 1.2; margin-top: 0.2em; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }',
            '',
            '@media (max-width: 768px) {',
            '  .card--wide-custom { width: 14em !important; }',
            '  .card--wide-custom .custom-overview-bottom { display: none !important; }',
            '}'
        ].join('\n');
        document.head.appendChild(style);
    }

    // ========== ОСНОВНА ЛОГІКА ==========
    function start() {
        if (window.uas_alt_loaded) return;
        window.uas_alt_loaded = true;

        AltImageCache.init();
        BgManager.init();
        createSettings();
        addStyles();

        Lampa.Listener.follow('activity', function (e) {
            if (e.type === 'start') {
                var isMain = e.component === 'main' || e.component === 'tmdb';
                if (isMain || !e.component) {
                    document.body.classList.add('uas-main-active');
                    BgManager.show();
                } else {
                    document.body.classList.remove('uas-main-active');
                    BgManager.hide();
                }

                if (Lampa.Storage.get('uas_alt_design_enable') === true) {
                    document.body.classList.add('uas-alt-design-active');
                } else {
                    document.body.classList.remove('uas-alt-design-active');
                }
            }
        });

        // Перехоплення створення карток
        var CardMaker = Lampa.Maker.map('Card');
        var originalOnVisible = CardMaker.Card.onVisible;

        CardMaker.Card.onVisible = function() {
            var html = this.html;
            var data = this.data;
            
            if (originalOnVisible && !(html && (html.classList && (html.classList.contains('card--title-btn') || html.classList.contains('card--history-custom'))))) {
                originalOnVisible.apply(this, arguments);
            } else if (this.visible !== undefined) {
                this.visible = true;
            }

            if (!html || !data) return;
            if (data.is_title_btn || data.is_collection_btn) return;

            var view = html.querySelector('.card__view');
            if (!view) return;

            var useAltDesign = Lampa.Storage.get('uas_alt_design_enable') === true;
            var badgePos = Lampa.Storage.get('uas_alt_badge_pos') || 'tl';
            var altToken = Lampa.Storage.get('uas_alt_design_apikey');
            var isWideCard = html.classList && html.classList.contains('card--wide-custom');

            var targetContainer = view;
            
            if (useAltDesign) {
                html.classList.add('uas-alt-card');
                targetContainer = view.querySelector('.card-custom-badges');
                if (!targetContainer) {
                    targetContainer = document.createElement('div');
                    targetContainer.className = 'card-custom-badges badge-pos-' + badgePos;
                    view.appendChild(targetContainer);
                }
                
                // Додаємо рік
                var yearStr = (data.release_date || data.first_air_date || '').toString().substring(0, 4);
                if (yearStr && yearStr.length === 4) {
                    var yearBadge = targetContainer.querySelector('.card-badge-age');
                    if (!yearBadge) {
                        yearBadge = document.createElement('div');
                        yearBadge.className = 'card-badge-age';
                        yearBadge.innerText = yearStr;
                        targetContainer.appendChild(yearBadge);
                    }
                }

                // Завантаження альтернативних зображень
                if (altToken && data.id && !isWideCard) {
                    var mediaType = data.media_type || (data.name ? 'tv' : 'movie');
                    getImdbIdForTmdb(data.id, mediaType).then(function(imdb) {
                        if (imdb) {
                            var targetUrl = 'https://easyratingsdb.com/' + altToken + '/poster/' + imdb + '.jpg';
                            AltImageCache.get(targetUrl).then(function(cachedUrl) {
                                var img = html.querySelector('.card__img');
                                if (img && cachedUrl) {
                                    img.src = cachedUrl;
                                }
                            });
                        }
                    });
                }
            } else if (html.classList) {
                html.classList.remove('uas-alt-card');
                var oldBadges = view.querySelector('.card-custom-badges');
                if (oldBadges && oldBadges.parentNode) {
                    oldBadges.parentNode.removeChild(oldBadges);
                }
            }
        };
    }

    if (window.appready) {
        start();
    } else {
        Lampa.Listener.follow('app', function (e) { 
            if (e.type === 'ready') start(); 
        });
    }
})();
