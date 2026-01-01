!function() {
    "use strict";
    
    var PLUGIN_NAME = "movieTV";
    var START_PAGE_VALUE = "movieTV";
    var JSON_URL = "https://Rugaroo888.github.io/movietv-plugin/base.json";
    var CACHE_SIZE = 100; 
    var CACHE_TIME = 1000 * 60 * 60 * 22;
    var SETTINGS_CATEGORIES_COMPONENT = PLUGIN_NAME + "_categories";
    var CATEGORY_SETTING_PREFIX = PLUGIN_NAME + "_cat_";
    var NAV_SETTING_MAIN_FAVORITE = PLUGIN_NAME + "_nav_main_favorite";
    var NAV_SETTING_SETTINGS_RANDOM = PLUGIN_NAME + "_nav_settings_random";
    var NAV_SETTING_ADD_NOVINKI = PLUGIN_NAME + "_nav_add_novinki";
    var FILTER_SETTING_MIN_RATING_MOVIE = PLUGIN_NAME + "_filter_min_rating_movie";
    var FILTER_SETTING_MIN_VOTES_MOVIE = PLUGIN_NAME + "_filter_min_votes_movie";
    var FILTER_SETTING_MIN_RATING_TV = PLUGIN_NAME + "_filter_min_rating_tv";
    var FILTER_SETTING_MIN_VOTES_TV = PLUGIN_NAME + "_filter_min_votes_tv";
    var FILTER_SETTING_RANDOM_MIN_RATING = PLUGIN_NAME + "_random_min_rating";
    var FILTER_SETTING_RANDOM_MIN_VOTES = PLUGIN_NAME + "_random_min_votes";
    var FILTER_SETTING_RANDOM_YEAR_FROM = PLUGIN_NAME + "_random_year_from";
    var FILTER_SETTING_RANDOM_YEAR_TO = PLUGIN_NAME + "_random_year_to";
    var CARD_RATING_DISPLAY_SETTING = PLUGIN_NAME + "_card_rating_display";

    var FILTER_EXCLUDE_CATEGORY_IDS = {
        popular_movies: true,
        top_100_movies: true
    };
    var MOVIE_CATEGORY_IDS = {
        movies: true,
        movies_rus: true,
        animation: true
    };
    var SERIES_CATEGORY_IDS = {
        foreign_series: true,
        russian_series: true,
        turkish_series: true
    };

    
    
    function buildItemIndex(categoriesData) {
        var index = Object.create(null);
        if (!categoriesData) return index;

        for (var categoryId in categoriesData) {
            if (!categoriesData.hasOwnProperty(categoryId)) continue;

            var category = categoriesData[categoryId];
            var items = (category && category.items) ? category.items : [];

            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                if (item && item.id) index[item.id] = item;
            }
        }

        return index;
    }
 
    var cache = {}; 
	var ICON_SVG = '<svg viewBox="0 0 39 39" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="1.85742" y="1.70898" width="35.501" height="35.501" rx="4.5" stroke="currentColor" stroke-width="3"/><rect x="9.11133" y="12.77" width="2.96094" height="14.2765" rx="1" fill="currentColor"/><rect x="15.7627" y="12.77" width="3.01162" height="14.2765" rx="1" fill="currentColor"/><rect x="10.6455" y="18.0308" width="6.98432" height="3.07105" fill="currentColor"/><path d="M25.5996 14.27C27.5326 14.27 29.0996 15.837 29.0996 17.77V22.0464C29.0996 23.9794 27.5326 25.5464 25.5996 25.5464H22.4365V14.27H25.5996Z" stroke="currentColor" stroke-width="3"/></svg>';
	var RANDOM_ICON_SVG = '<svg class="mtv-random-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><rect x="2.5" y="2.5" width="19" height="19" rx="4" fill="none" stroke="currentColor" stroke-width="2.2"/><circle cx="7" cy="7" r="1.4" fill="currentColor"/><circle cx="17" cy="7" r="1.4" fill="currentColor"/><circle cx="12" cy="12" r="1.4" fill="currentColor"/><circle cx="7" cy="17" r="1.4" fill="currentColor"/><circle cx="17" cy="17" r="1.4" fill="currentColor"/></svg>';
    
    
    var DEBUG_RATINGS = false; 
    var DEBUG_SERIES = false; 
	var DEBUG_RANDOM = false; 
    var DEBUG_FAVORITE = false; 
    
	function logFavorite() {
    if (DEBUG_FAVORITE && window.console) {
        var args = ['[FAVORITE]'].concat(Array.prototype.slice.call(arguments));
        console.log.apply(console, args);
    }
	}

    function logRatings() {
        if (DEBUG_RATINGS && window.console) {
            var args = ['[RATINGS]'].concat(Array.prototype.slice.call(arguments));
            console.log.apply(console, args);
        }
    }

	
	function logRandom() {
		if (DEBUG_RANDOM && window.console) {
			var args = ['[RANDOM]'].concat(Array.prototype.slice.call(arguments));
			console.log.apply(console, args);
		}
	}
    
    Lampa.Lang.add({
        movie_title: {
            ru: "Новинки"
        },
        movie_cache: {
            ru: "Очистить кэш"
        },
        movie_cleared: {
            ru: "Кэш очищен"
        },
        movie_start_page: {
            ru: "Новинки"
        },
        random_card_title: {
            en: 'Random from Novelties',
            uk: 'Випадкове з Новинок',
            ru: 'Случайное'
        },
        random_card_no_data_error: {
            en: 'No data available in Novelties',
            uk: 'Немає даних у Новинках',
            ru: 'Нет данных в Новинках'
        }
    });
    
    
    function getCache(key) {
        var res = cache[key];
        if (res) {
            var cache_timestamp = Date.now() - CACHE_TIME;
            if (res.timestamp > cache_timestamp) return res.value;

            for (var ID in cache) {
                var node = cache[ID];
                if (!(node && node.timestamp > cache_timestamp)) delete cache[ID];
            }
        }
        return null;
    }

    function setCache(key, value) {
        var timestamp = Date.now();
        var size = Object.keys(cache).length;

        if (size >= CACHE_SIZE) {
            var cache_timestamp = timestamp - CACHE_TIME;
            for (var ID in cache) {
                var node = cache[ID];
                if (!(node && node.timestamp > cache_timestamp)) delete cache[ID];
            }
            size = Object.keys(cache).length;
            if (size >= CACHE_SIZE) {
                var timestamps = [];
                for (var ID in cache) {
                    var node = cache[ID];
                    timestamps.push(node && node.timestamp || 0);
                }
                timestamps.sort(function (a, b) { return a - b });
                cache_timestamp = timestamps[Math.floor(timestamps.length / 2)];
                for (var ID in cache) {
                    var node = cache[ID];
                    if (!(node && node.timestamp > cache_timestamp)) delete cache[ID];
                }
            }
        }

        cache[key] = {
            timestamp: timestamp,
            value: value
        };
    }

    function clearCache() {
        cache = {};
        return true;
    }

    var categorySettingsAdded = Object.create(null);
    var staticSettingsAdded = false;
    var settingsReady = false;
    var mainNavButtonTemplate = null;
    var settingsNavButtonTemplate = null;

    function ensureSettingsComponents() {
        if (settingsReady || !window.Lampa || !Lampa.SettingsApi) return;
        settingsReady = true;
        bindCategoryLineListener();

        Lampa.SettingsApi.addComponent({
            component: SETTINGS_CATEGORIES_COMPONENT,
            name: PLUGIN_NAME,
            icon: ICON_SVG
        });
    }

    function ensureCategorySettings(categoriesData) {
        if (!categoriesData || !window.Lampa || !Lampa.SettingsApi) return;
        ensureSettingsComponents();

        function addCategoryParam(categoryId, category) {
            if (!categoryId || !category || categorySettingsAdded[categoryId]) return;

            categorySettingsAdded[categoryId] = true;

            var settingName = CATEGORY_SETTING_PREFIX + categoryId;
            var defaultVisible = !(categoryId === 'top_100_movies' || categoryId === 'popular_movies');
            var visible = Lampa.Storage.get(settingName, defaultVisible ? "true" : "false").toString() === "true";

            Lampa.SettingsApi.addParam({
                component: SETTINGS_CATEGORIES_COMPONENT,
                param: {
                    name: settingName,
                    type: 'trigger',
                    "default": visible
                },
                field: {
                    name: category.title
                },
                onChange: (function(id) {
                    return function(value) {
                    updateCategoryLineVisibility(id);
                    return value;
                    };
                })(categoryId)
            });
        }

        if (!staticSettingsAdded) {
            staticSettingsAdded = true;

            Lampa.SettingsApi.addParam({
                component: SETTINGS_CATEGORIES_COMPONENT,
                param: {
                    type: 'title'
                },
                field: {
                    name: 'Популярное'
                }
            });

            if (categoriesData.popular_movies) addCategoryParam('popular_movies', categoriesData.popular_movies);
            if (categoriesData.top_100_movies) addCategoryParam('top_100_movies', categoriesData.top_100_movies);

            Lampa.SettingsApi.addParam({
                component: SETTINGS_CATEGORIES_COMPONENT,
                param: {
                    type: 'title'
                },
                field: {
                    name: 'Фильтрация'
                }
            });

            Lampa.SettingsApi.addParam({
                component: SETTINGS_CATEGORIES_COMPONENT,
                param: {
                    name: CARD_RATING_DISPLAY_SETTING,
                    type: 'select',
                    values: {
                        kp: 'Кинопоиск',
                        imdb: 'IMDB',
                        tmdb: 'TMDB',
                        votes: 'Приоритет голосов'
                    },
                    "default": 'votes'
                },
                field: {
                    name: 'Карточки: рейтинг'
                },
                onChange: function(value) {
                    processExistingCards();
                    return value;
                }
            });

            Lampa.SettingsApi.addParam({
                component: SETTINGS_CATEGORIES_COMPONENT,
                param: {
                    name: FILTER_SETTING_MIN_RATING_MOVIE,
                    type: 'select',
                    values: {
                        0: 'Любой',
                        1: '1',
                        2: '2',
                        3: '3',
                        4: '4',
                        5: '5',
                        6: '6',
                        7: '7',
                        8: '8',
                        9: '9'
                    },
                    "default": 0
                },
                field: {
                    name: 'Фильмы: минимальный рейтинг'
                },
                onChange: function(value) {
                    scheduleFilterRefresh();
                    return value;
                }
            });

            Lampa.SettingsApi.addParam({
                component: SETTINGS_CATEGORIES_COMPONENT,
                param: {
                name: FILTER_SETTING_MIN_VOTES_MOVIE,
                type: 'select',
                values: {
                    0: 'Любые',
                    1000: 'от 1k',
                    2000: 'от 2k',
                    3000: 'от 3k',
                    4000: 'от 4k',
                    5000: 'от 5k',
                    10000: 'от 10k',
                    20000: 'от 20k',
                    50000: 'от 50k',
                    100000: 'от 100k',
                    500000: 'от 500k',
                    1000000: 'от 1000k'
                },
                "default": 0
            },
                field: {
                    name: 'Фильмы: минимум голосов'
                },
                onChange: function(value) {
                    scheduleFilterRefresh();
                    return value;
                }
            });

            Lampa.SettingsApi.addParam({
                component: SETTINGS_CATEGORIES_COMPONENT,
                param: {
                    name: FILTER_SETTING_MIN_RATING_TV,
                    type: 'select',
                    values: {
                        0: 'Любой',
                        1: '1',
                        2: '2',
                        3: '3',
                        4: '4',
                        5: '5',
                        6: '6',
                        7: '7',
                        8: '8',
                        9: '9'
                    },
                    "default": 0
                },
                field: {
                    name: 'Сериалы: минимальный рейтинг'
                },
                onChange: function(value) {
                    scheduleFilterRefresh();
                    return value;
                }
            });

            Lampa.SettingsApi.addParam({
                component: SETTINGS_CATEGORIES_COMPONENT,
                param: {
                name: FILTER_SETTING_MIN_VOTES_TV,
                type: 'select',
                values: {
                    0: 'Любые',
                    1000: 'от 1k',
                    2000: 'от 2k',
                    3000: 'от 3k',
                    4000: 'от 4k',
                    5000: 'от 5k',
                    10000: 'от 10k',
                    20000: 'от 20k',
                    50000: 'от 50k',
                    100000: 'от 100k',
                    500000: 'от 500k',
                    1000000: 'от 1000k'
                },
                "default": 0
            },
                field: {
                    name: 'Сериалы: минимум голосов'
                },
                onChange: function(value) {
                    scheduleFilterRefresh();
                    return value;
                }
            });

            Lampa.SettingsApi.addParam({
                component: SETTINGS_CATEGORIES_COMPONENT,
                param: {
                    type: 'title'
                },
                field: {
                    name: 'Случайное кино'
                }
            });

            Lampa.SettingsApi.addParam({
                component: SETTINGS_CATEGORIES_COMPONENT,
                param: {
                    name: FILTER_SETTING_RANDOM_YEAR_FROM,
                    type: 'input',
                    placeholder: 'например 1990',
                    values: '',
                    "default": ''
                },
                field: {
                    name: 'Год фильма: от'
                },
                onChange: function(value) {
                    return value;
                }
            });

            Lampa.SettingsApi.addParam({
                component: SETTINGS_CATEGORIES_COMPONENT,
                param: {
                    name: FILTER_SETTING_RANDOM_YEAR_TO,
                    type: 'input',
                    placeholder: 'например 2023',
                    values: '',
                    "default": ''
                },
                field: {
                    name: 'Год фильма: до'
                },
                onChange: function(value) {
                    return value;
                }
            });

            Lampa.SettingsApi.addParam({
                component: SETTINGS_CATEGORIES_COMPONENT,
                param: {
                    name: FILTER_SETTING_RANDOM_MIN_RATING,
                    type: 'select',
                    values: {
                        0: 'Любой',
                        1: '1',
                        2: '2',
                        3: '3',
                        4: '4',
                        5: '5',
                        6: '6',
                        7: '7',
                        8: '8',
                        9: '9'
                    },
                    "default": 0
                },
                field: {
                    name: 'Случайное: минимальный рейтинг'
                },
                onChange: function(value) {
                    return value;
                }
            });

            Lampa.SettingsApi.addParam({
                component: SETTINGS_CATEGORIES_COMPONENT,
                param: {
                    name: FILTER_SETTING_RANDOM_MIN_VOTES,
                    type: 'select',
                values: {
                    0: 'Любые',
                    1000: 'от 1k',
                    2000: 'от 2k',
                    3000: 'от 3k',
                    4000: 'от 4k',
                    5000: 'от 5k',
                    10000: 'от 10k',
                    20000: 'от 20k',
                    50000: 'от 50k',
                    100000: 'от 100k',
                        500000: 'от 500k',
                        1000000: 'от 1000k'
                    },
                    "default": 0
                },
                field: {
                    name: 'Случайное: минимум голосов'
                },
                onChange: function(value) {
                    return value;
                }
            });

            Lampa.SettingsApi.addParam({
                component: SETTINGS_CATEGORIES_COMPONENT,
                param: {
                    type: 'title'
                },
                field: {
                    name: 'Категории'
                }
            });
        }

        for (var categoryId in categoriesData) {
            if (!categoriesData.hasOwnProperty(categoryId)) continue;
            if (categoryId === 'popular_movies' || categoryId === 'top_100_movies') continue;
            addCategoryParam(categoryId, categoriesData[categoryId]);
        }

        if (staticSettingsAdded) {
            if (!categorySettingsAdded[NAV_SETTING_MAIN_FAVORITE]) {
                categorySettingsAdded[NAV_SETTING_MAIN_FAVORITE] = true;

                Lampa.SettingsApi.addParam({
                    component: SETTINGS_CATEGORIES_COMPONENT,
                    param: {
                        type: 'title'
                    },
                    field: {
                        name: 'Кнопки'
                    }
                });

                Lampa.SettingsApi.addParam({
                    component: SETTINGS_CATEGORIES_COMPONENT,
                    param: {
                        name: NAV_SETTING_MAIN_FAVORITE,
                        type: 'trigger',
                        "default": true
                    },
                    field: {
                        name: 'Заменить кнопку Главная на Избранное'
                    },
                    onChange: function() {
                        applyNavButtons();
                    }
                });

                Lampa.SettingsApi.addParam({
                    component: SETTINGS_CATEGORIES_COMPONENT,
                    param: {
                        name: NAV_SETTING_SETTINGS_RANDOM,
                        type: 'trigger',
                        "default": true
                    },
                    field: {
                        name: 'Заменить кнопку Настройки на Случайное'
                    },
                    onChange: function() {
                        applyNavButtons();
                    }
                });

                Lampa.SettingsApi.addParam({
                    component: SETTINGS_CATEGORIES_COMPONENT,
                    param: {
                        name: NAV_SETTING_ADD_NOVINKI,
                        type: 'trigger',
                        "default": true
                    },
                    field: {
                        name: 'Добавить кнопку Новинки'
                    },
                    onChange: function() {
                        applyNavButtons();
                    }
                });
            }
        }
    }

    function isCategoryEnabled(categoryId) {
        if (!window.Lampa || !Lampa.Storage || !Lampa.Storage.get) return true;
        var defaultVisible = !(categoryId === 'top_100_movies' || categoryId === 'popular_movies');
        var value = Lampa.Storage.get(CATEGORY_SETTING_PREFIX + categoryId, defaultVisible ? "true" : "false");
        if (value === undefined || value === null) return true;
        return value === true || value === 1 || value === '1' || value === 'true';
    }

    function isNavSettingEnabled(key, defaultValue) {
        if (!window.Lampa || !Lampa.Storage || !Lampa.Storage.get) return !!defaultValue;
        var def = defaultValue ? "true" : "false";
        var value = Lampa.Storage.get(key, def);
        if (value === undefined || value === null) return !!defaultValue;
        return value === true || value === 1 || value === '1' || value === 'true';
    }

    function getNumericSetting(key, defaultValue) {
        if (!window.Lampa || !Lampa.Storage || !Lampa.Storage.get) return defaultValue;
        var value = Lampa.Storage.get(key, defaultValue);
        var num = parseFloat(value);
        if (isNaN(num)) return defaultValue;
        return num;
    }

    function getYearSetting(key) {
        if (!window.Lampa || !Lampa.Storage || !Lampa.Storage.get) return 0;
        var value = Lampa.Storage.get(key, '');
        var num = parseInt(value, 10);
        if (isNaN(num)) return 0;
        return num;
    }

    function getRandomYearRange() {
        var from = getYearSetting(FILTER_SETTING_RANDOM_YEAR_FROM);
        var to = getYearSetting(FILTER_SETTING_RANDOM_YEAR_TO);
        if (from > 0 && to > 0 && from > to) {
            var temp = from;
            from = to;
            to = temp;
        }
        return { from: from, to: to };
    }

    function getRandomFilterConfig() {
        return {
            minRating: getNumericSetting(FILTER_SETTING_RANDOM_MIN_RATING, 0),
            minVotes: getNumericSetting(FILTER_SETTING_RANDOM_MIN_VOTES, 0)
        };
    }

    function getFilterConfigForType(type) {
        if (type === 'tv') {
            return {
                minRating: getNumericSetting(FILTER_SETTING_MIN_RATING_TV, 0),
                minVotes: getNumericSetting(FILTER_SETTING_MIN_VOTES_TV, 0)
            };
        }
        return {
            minRating: getNumericSetting(FILTER_SETTING_MIN_RATING_MOVIE, 0),
            minVotes: getNumericSetting(FILTER_SETTING_MIN_VOTES_MOVIE, 0)
        };
    }

    function refreshActiveCategory() {
        if (!window.Lampa || !Lampa.Activity || !Lampa.Activity.active) return;
        var active = Lampa.Activity.active();
        if (!active || active.source !== PLUGIN_NAME || active.component !== 'category') return;
        if (active.activity && active.activity.refresh) active.activity.refresh();
    }

    var pendingFilterRefresh = false;
    var pendingFilterTimer = null;

    function isSettingsOpen() {
        return !!(document.body && document.body.classList && document.body.classList.contains('settings--open'));
    }

    function scheduleFilterRefresh() {
        if (!isSettingsOpen()) {
            refreshActiveCategory();
            return;
        }

        pendingFilterRefresh = true;
        if (pendingFilterTimer) return;

        pendingFilterTimer = setInterval(function() {
            if (isSettingsOpen()) return;

            clearInterval(pendingFilterTimer);
            pendingFilterTimer = null;

            if (pendingFilterRefresh) {
                pendingFilterRefresh = false;
                refreshActiveCategory();
            }
        }, 300);
    }

    function removeNavButton(action) {
        var navBar = document.querySelector('.navigation-bar__body');
        if (!navBar) return false;
        var btn = navBar.querySelector('.navigation-bar__item[data-action="' + action + '"]');
        if (btn) btn.remove();
        return !!btn;
    }

    function removeNavButtonWhenReady(action) {
        if (removeNavButton(action)) return;
        var observer = new MutationObserver(function() {
            if (removeNavButton(action)) observer.disconnect();
        });
        observer.observe(document.body, { childList: true, subtree: true });
        setTimeout(function() { observer.disconnect(); }, 10000);
    }

    function restoreMainButton() {
        var navBar = document.querySelector('.navigation-bar__body');
        if (!navBar || !mainNavButtonTemplate) return false;

        var mainBtn = navBar.querySelector('.navigation-bar__item[data-action="main"]');
        if (mainBtn) return true;

        var favoriteBtn = navBar.querySelector('.navigation-bar__item[data-mtv-main-replace="1"]');
        var restore = mainNavButtonTemplate;
        if (favoriteBtn) {
            favoriteBtn.parentNode.replaceChild(restore, favoriteBtn);
        } else {
            navBar.insertBefore(restore, navBar.firstChild);
        }
        return true;
    }

    function restoreSettingsButton() {
        var navBar = document.querySelector('.navigation-bar__body');
        if (!navBar || !settingsNavButtonTemplate) return false;

        var settingsBtn = navBar.querySelector('.navigation-bar__item[data-action="settings"]');
        if (settingsBtn) return true;

        var randomBtn = navBar.querySelector('.navigation-bar__item[data-mtv-settings-replace="1"]');
        var restore = settingsNavButtonTemplate;
        if (randomBtn) {
            randomBtn.parentNode.replaceChild(restore, randomBtn);
        } else {
            navBar.appendChild(restore);
        }
        return true;
    }

    function applyNavButtons() {
        if (isNavSettingEnabled(NAV_SETTING_MAIN_FAVORITE, true)) {
            replaceMainWithFavorite();
        } else {
            restoreMainButton();
        }

        if (isNavSettingEnabled(NAV_SETTING_SETTINGS_RANDOM, true)) {
            addRandomNavButton();
        } else {
            removeNavButtonWhenReady('random_novinki');
            restoreSettingsButton();
        }

        if (isNavSettingEnabled(NAV_SETTING_ADD_NOVINKI, true)) {
            addNovinkiButton();
        } else {
            removeNavButtonWhenReady('novinki');
        }
    }

    var categoryLineListenerBound = false;
    var navButtonsListenerBound = false;
    var navBarObserverBound = false;
    var lastNavBarElement = null;
    var navBarApplyDebounce = null;
    var navBarMutationObserver = null;

    function bindNavButtonsListener() {
        if (navButtonsListenerBound || !window.Lampa || !Lampa.Listener) return;
        navButtonsListenerBound = true;

        Lampa.Listener.follow('activity', function(e) {
            if (!e || e.type !== 'start') return;
            applyNavButtons();
        });
    }

    function bindNavBarObserver() {
        if (navBarObserverBound) return;
        navBarObserverBound = true;

        function scheduleApply(delay) {
            if (navBarApplyDebounce) clearTimeout(navBarApplyDebounce);
            navBarApplyDebounce = setTimeout(function() {
                navBarApplyDebounce = null;
                applyNavButtons();
            }, delay);
        }

        function attachNavBar(navBar) {
            if (navBarMutationObserver) navBarMutationObserver.disconnect();
            navBarMutationObserver = new MutationObserver(function() {
                scheduleApply(150);
            });
            navBarMutationObserver.observe(navBar, { childList: true, subtree: true });
            scheduleApply(150);
        }

        var observer = new MutationObserver(function() {
            var navBar = document.querySelector('.navigation-bar__body');
            if (!navBar || navBar === lastNavBarElement) return;
            lastNavBarElement = navBar;
            attachNavBar(navBar);
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }

    function bindCategoryLineListener() {
        if (categoryLineListenerBound || !window.Lampa || !Lampa.Listener) return;
        categoryLineListenerBound = true;

        Lampa.Listener.follow('line', function(e) {
            if (!e || e.type !== 'create' || !e.data || e.data.source !== PLUGIN_NAME) return;

            var url = e.data.url || '';
            if (url.indexOf(PLUGIN_NAME + '__') !== 0) return;

            var categoryId = url.split('__')[1];
            if (!categoryId) return;

            var lineEl = e.line && e.line.render && e.line.render(true);
            if (!lineEl) return;

            lineEl.setAttribute('data-mtv-category', categoryId);
            if (!isCategoryEnabled(categoryId)) lineEl.classList.add('hide');
        });
    }

    function updateCategoryLineVisibility(categoryId) {
        if (!window.Lampa || !Lampa.Activity || !Lampa.Activity.active) return;
        var active = Lampa.Activity.active();
        if (!active || active.component !== 'category' || active.source !== PLUGIN_NAME) return;

        var render = active.activity && active.activity.render ? active.activity.render(true) : null;
        if (!render) return;

        var enabled = isCategoryEnabled(categoryId);
        var selector = '[data-mtv-category="' + categoryId + '"]';
        var lines = render.querySelectorAll(selector);

        for (var i = 0; i < lines.length; i++) {
            if (enabled) lines[i].classList.remove('hide');
            else lines[i].classList.add('hide');
        }
    }
    
    
    var seriesStyle = document.createElement('style');
    seriesStyle.innerHTML = 
        '.card__series {' +
            'position: absolute;' +
            'top: 0.3em;' +
            'right: 0.3em;' +
            'font-size: 1em;' +
            'font-weight: 700;' +
            'color: #fff;' +
            'background: rgba(0, 0, 0, 0.5);' +
            'border-radius: 0.5em;' +
            'padding: 0.2em 0.5em;' +
            'z-index: 2;' +
        '}' +
        '.card__series:empty { display: none; }' +
	    '.card__type {' +
            'color: #fff;' +
            'background: #ff4242;' +
            'z-index: 2;' +
        '}';
    document.head.appendChild(seriesStyle);

    var randomIconStyle = document.createElement('style');
    randomIconStyle.innerHTML =
        '.menu__ico .mtv-random-icon,' +
        '.navigation-bar__icon .mtv-random-icon{' +
            'width:100%;' +
            'height:100%;' +
            'display:block;' +
            'transform:scale(1.12);' +
            'transform-origin:center;' +
        '}' +
        '.menu__item.focus .menu__ico .mtv-random-icon rect,' +
        '.menu__item.traverse .menu__ico .mtv-random-icon rect,' +
        '.menu__item.hover .menu__ico .mtv-random-icon rect{' +
            'fill:none !important;' +
        '}';
    document.head.appendChild(randomIconStyle);

    function formatCardRating(value) {
        var num = parseFloat((value || 0) + '');
        if (!(num > 0)) return null;
        return num >= 10 ? '10' : num.toFixed(1);
    }

    function getCardRatingPreference() {
        if (!window.Lampa || !Lampa.Storage || !Lampa.Storage.get) return 'votes';
        var value = Lampa.Storage.get(CARD_RATING_DISPLAY_SETTING, 'votes');
        return value || 'votes';
    }

    function getCardRatingDisplay(data) {
        if (!data) return null;

        var pref = getCardRatingPreference();
        var options = {
            kp: [
                { key: 'kp_rating', label: 'КП' },
                { key: 'imdb_rating', label: 'IMDB' },
                { key: 'tmdb_rating', label: 'TMDB' }
            ],
            imdb: [
                { key: 'imdb_rating', label: 'IMDB' },
                { key: 'kp_rating', label: 'КП' },
                { key: 'tmdb_rating', label: 'TMDB' }
            ],
            tmdb: [
                { key: 'tmdb_rating', label: 'TMDB' },
                { key: 'kp_rating', label: 'КП' },
                { key: 'imdb_rating', label: 'IMDB' }
            ]
        };

        if (pref === 'votes') {
            if (data.card_rating_source && data.card_rating > 0) {
                return {
                    label: data.card_rating_source === 'KP' ? 'КП' : data.card_rating_source,
                    value: data.card_rating
                };
            }
        } else {
            var list = options[pref] || options.kp;
            for (var i = 0; i < list.length; i++) {
                var opt = list[i];
                if (data[opt.key] > 0) return { label: opt.label, value: data[opt.key] };
            }
        }

        return null;
    }

    function applyCardRating(card, data) {
        if (!data || !data.mtv_source) return;

        var viewContainer = card.querySelector('.card__view');
        if (!viewContainer) return;

        var ratingInfo = getCardRatingDisplay(data);
        if (!ratingInfo) return;

        var ratingText = formatCardRating(ratingInfo.value);
        if (!ratingText) return;

        var label = ratingInfo.label;
        var voteEl = viewContainer.querySelector('.card__vote');

        if (!voteEl) {
            voteEl = document.createElement('div');
            voteEl.className = 'card__vote';
            viewContainer.appendChild(voteEl);
        }

        voteEl.textContent = label + ' ' + ratingText;
    }
    
    
    function addSeriesIndicator(card) {
        if (card.getAttribute('data-series-added')) {
            return;
        }
        
        if (!card.card_data) {
            return;
        }
        
        var data = card.card_data;
        
        
        if (!data.series && !data.release_quality) {
            var service = Lampa.Api.sources[PLUGIN_NAME];
            if (service && service.itemIndex) {
                
                var foundItem = service.itemIndex[data.id];
                
                    if (foundItem) {
                        
                        data.series = foundItem.series;
                        data.release_quality = foundItem.release_quality;
                        data.original_name = foundItem.original_name;
                        data.name = foundItem.name;
                        data.type = foundItem.type;
                        data.category_id = foundItem.category_id; 
                        data.card_rating = foundItem.card_rating;
                        data.card_rating_source = foundItem.card_rating_source;
                        data.mtv_source = true;
                }
            }
        }
        
        var viewContainer = card.querySelector('.card__view');
        if (!viewContainer) {
            return;
        }

        if (!data.series && !data.release_quality && !data.original_name) {
            applyCardRating(card, data);
            return;
        }
        
        
        var oldIndicators = viewContainer.querySelectorAll('.card__series, .card__quality, .card__type');
        oldIndicators.forEach(function(indicator) {
            indicator.remove();
        });
        
        
        var contentType = '';
        
    
        var effectiveCategoryId = data.category_id;
        if ((effectiveCategoryId === 'popular_movies' || effectiveCategoryId === 'top_100_movies') && data.movie_category) {
            effectiveCategoryId = data.movie_category;
        }
        var isAnimationCategory = effectiveCategoryId === 'animation';
    var isMoviesRusCategory = effectiveCategoryId === 'movies_rus';
    var isRussianSeriesCategory = effectiveCategoryId === 'russian_series';
        
        
        var isTv = data.original_name || data.name || data.type === 'tv';
        
        if (isTv) {
        
        if (isRussianSeriesCategory) {
            contentType = 'Сериал RU';
        } else {
            contentType = 'Сериал';
        }
            card.classList.add('card--tv');
        } else {
        
            if (isAnimationCategory) {
                contentType = 'Мультфильм';
        } else if (isMoviesRusCategory) {
            contentType = 'Фильм RU';
            } else {
                contentType = 'Фильм';
            }
            card.classList.add('card--movie');
        }
        
        
        if (contentType) {
            var typeEl = document.createElement('div');
            typeEl.className = 'card__type';
            typeEl.textContent = contentType;
            viewContainer.appendChild(typeEl);
        }
        
        
        if (data.series) {
            var seriesEl = document.createElement('div');
            seriesEl.className = 'card__series';
            seriesEl.textContent = data.series;
            viewContainer.appendChild(seriesEl);
        }
        
        
		if (data.release_quality) {
		var qualityEl = document.createElement('div');
		qualityEl.className = 'card__quality';
		qualityEl.textContent = data.release_quality;
		viewContainer.appendChild(qualityEl);
	}

        applyCardRating(card, data);
	
        card.setAttribute('data-series-added', 'true');
    }
    
    
    var pendingCards = [];
    var pendingScheduled = false;

    function queueCardForIndicators(card){
        if (!card || card.nodeType !== 1) return;
        if (card.getAttribute && card.getAttribute('data-mtv-queued')) return;

        
        if (card.setAttribute) card.setAttribute('data-mtv-queued', '1');
        pendingCards.push(card);
    }

    function flushQueuedCards(){
        pendingScheduled = false;

        if (!pendingCards.length) return;

        var cards = pendingCards;
        pendingCards = [];

        for (var i = 0; i < cards.length; i++) {
            var c = cards[i];
            if (c && c.removeAttribute) c.removeAttribute('data-mtv-queued');
            addSeriesIndicator(c);
        }
    }

    function scheduleFlush(){
        if (pendingScheduled) return;
        pendingScheduled = true;

        if (window.requestAnimationFrame) window.requestAnimationFrame(flushQueuedCards);
        else setTimeout(flushQueuedCards, 16);
    }

    
    var observer = new MutationObserver(function(mutations) {
        for (var i = 0; i < mutations.length; i++) {
            var mutation = mutations[i];
            if (!mutation.addedNodes) continue;

            for (var j = 0; j < mutation.addedNodes.length; j++) {
                var node = mutation.addedNodes[j];
                if (!node || node.nodeType !== 1) continue;

                
                if (node.classList && node.classList.contains('card')) {
                    queueCardForIndicators(node);
                }

                
                if (node.querySelectorAll) {
                    var nestedCards = node.querySelectorAll('.card');
                    for (var k = 0; k < nestedCards.length; k++) {
                        queueCardForIndicators(nestedCards[k]);
                    }
                }
            }
        }

        if (pendingCards.length) scheduleFlush();
    });
    
    
    function processExistingCards() {
        var cards = document.querySelectorAll('.card:not([data-series-added])');
        for (var i = 0; i < cards.length; i++) {
            addSeriesIndicator(cards[i]);
        }
    }

    
    function displayRatingsInFullView(cardData) {
        if (!cardData) {
            logRatings('No card data provided for ratings');
            return;
        }
        
        logRatings('Displaying ratings for:', cardData.title || cardData.name);
        logRatings('KP Rating:', cardData.kp_rating, 'Type:', typeof cardData.kp_rating);
        logRatings('IMDB Rating:', cardData.imdb_rating, 'Type:', typeof cardData.imdb_rating);
        
    function updateRatings() {
        var render = Lampa.Activity.active().activity.render();
            if (!render) {
            setTimeout(updateRatings, 100);
                return;
            }
            
            logRatings('Render found, updating ratings...');
        
        
        $('.wait_rating', render).remove();
            
        
            if (cardData.kp_rating !== null && cardData.kp_rating !== undefined && cardData.kp_rating > 0) {
                var kpRating = parseFloat(cardData.kp_rating).toFixed(1);
            var kpElement = $('.rate--kp', render);
                if (kpElement.length > 0) {
                kpElement.removeClass('hide').find('> div').eq(0).text(kpRating);
                    logRatings('Updated KP rating:', kpRating);
                }
            }
            
        
            if (cardData.imdb_rating !== null && cardData.imdb_rating !== undefined && cardData.imdb_rating > 0) {
                var imdbRating = parseFloat(cardData.imdb_rating).toFixed(1);
            var imdbElement = $('.rate--imdb', render);
                if (imdbElement.length > 0) {
                imdbElement.removeClass('hide').find('> div').eq(0).text(imdbRating);
                    logRatings('Updated IMDB rating:', imdbRating);
            }
        }
    }
    
    setTimeout(updateRatings, 300);
}

    
    var translateQuality = function(q) {
        if (!q) return ''; 
        if (q === '2160p') return '4K';
        if (q === '1080p') return 'FHD';
        if (q === '720p') return 'HD';
        return 'SD'; 
    };

    
    var formatReleaseInfo = function(q, ripType) {
        if (!q && !ripType) return '';
        
        
        var isDub = false;
        var baseRipType = ripType;
        
        if (ripType && typeof ripType === 'string') {
            isDub = ripType.includes('_dub');
            baseRipType = isDub ? ripType.replace('_dub', '') : ripType;
        }
        
        const quality = translateQuality(q);
        let rip = '';
        
        if (baseRipType) {
            switch(baseRipType.toLowerCase()) {
                case 'bluray': rip = 'Blu-ray'; break;
                case 'bdrip': rip = 'BDRip'; break;
                case 'webdl': rip = 'WEB-DL'; break;
                case 'webrip': rip = 'WEBRip'; break;
                default: rip = baseRipType.toUpperCase();
            }
        }
        
    
        var result = '';
        if (quality && rip) {
            result = quality + ' ' + rip;
        } else if (quality) {
        result = quality; 
        } else if (rip) {
        result = rip; 
        }
        
    
    if (isDub && rip) {
            result += ' (ДБ)';
        }
        
        return result;
    };
    
    

    function pickRandomItem(array) {
        if (!Array.isArray(array) || array.length === 0) return null;
        var index = Math.floor(Math.random() * array.length);
        return array[index];
    }

    function getItemYear(item) {
        if (!item) return 0;
        if (item.year) return parseInt(item.year, 10) || 0;
        if (item.release_date) return parseInt(String(item.release_date).substring(0, 4), 10) || 0;
        if (item.first_air_date) return parseInt(String(item.first_air_date).substring(0, 4), 10) || 0;
        return 0;
    }

    function passesMovieFilter(item, minRating, minVotes, yearRange) {
        if (!item || item.type === 'tv') return false;

        var year = getItemYear(item);
        if (yearRange && (yearRange.from > 0 || yearRange.to > 0)) {
            if (!(year > 0)) return false;
            if (yearRange.from > 0 && year < yearRange.from) return false;
            if (yearRange.to > 0 && year > yearRange.to) return false;
        }

        if (!(minRating > 0) && !(minVotes > 0)) return true;

        var kpRating = item.kp_rating;
        var imdbRating = item.imdb_rating;
        var kpVotes = item.kp_votes || 0;
        var imdbVotes = item.imdb_votes || 0;

        function sourcePasses(rating, votes) {
            if (minRating > 0 && !(rating >= minRating)) return false;
            if (minVotes > 0 && !(votes >= minVotes)) return false;
            if (minRating > 0 && !(rating > 0)) return false;
            return true;
        }

        var passes = false;
        if (kpRating > 0 || kpVotes > 0) passes = sourcePasses(kpRating, kpVotes);
        if (!passes && (imdbRating > 0 || imdbVotes > 0)) passes = sourcePasses(imdbRating, imdbVotes);

        return passes;
    }

    
    function getRandomMovieTvCard() {
        var service = Lampa.Api.sources[PLUGIN_NAME];

        if (!service.categoriesData || Object.keys(service.categoriesData).length === 0) {
            logRandom('No categories data available');
            return null;
        }

        
        var excludeIds = Object.create(null);
        if (window.Lampa && Lampa.Favorite && typeof Lampa.Favorite.get === 'function') {
            var viewed = Lampa.Favorite.get({ type: 'viewed' }) || [];
            var thrown = Lampa.Favorite.get({ type: 'thrown' }) || [];

            for (var vi = 0; vi < viewed.length; vi++) {
                if (viewed[vi] && viewed[vi].id) excludeIds[viewed[vi].id] = true;
            }
            for (var ti = 0; ti < thrown.length; ti++) {
                if (thrown[ti] && thrown[ti].id) excludeIds[thrown[ti].id] = true;
            }
        }

        
        var allMovies = [];
        var totalItemsCount = 0;
        var movieConfig = getRandomFilterConfig();
        var yearRange = getRandomYearRange();

        for (var categoryId in service.categoriesData) {
            if (service.categoriesData.hasOwnProperty(categoryId)) {
                if (!isCategoryEnabled(categoryId)) continue;
                var category = service.categoriesData[categoryId];
                if (category.items && Array.isArray(category.items)) {
                    totalItemsCount += category.items.length;

                    for (var i = 0; i < category.items.length; i++) {
                        var item = category.items[i];
                        if (item && item.id && excludeIds[item.id]) continue;
                        if (passesMovieFilter(item, movieConfig.minRating, movieConfig.minVotes, yearRange)) {
                            allMovies.push(item);
                            if (DEBUG_RANDOM) {
                                logRandom('Item passed filter -',
                                          item.title || item.name,
                                          'KP:', item.kp_rating,
                                          'IMDB:', item.imdb_rating,
                                          'Votes KP:', item.kp_votes,
                                          'Votes IMDB:', item.imdb_votes,
                                          'Year:', getItemYear(item),
                                          'Type:', item.type);
                            }
                        }
                    }
                }
            }
        }

        logRandom('Total items:', totalItemsCount, 'Filtered movies:', allMovies.length);

        if (allMovies.length === 0) {
            logRandom('No items passed the random filter');
            return null;
        }

        logRandom('Selecting random movie from filtered list');
        var selectedItem = pickRandomItem(allMovies);

        logRandom('Selected item -',
                  selectedItem.title || selectedItem.name,
                  'Type:', selectedItem.type,
                  'TMDB:', selectedItem.tmdb_rating,
                  'KP:', selectedItem.kp_rating,
                  'IMDB:', selectedItem.imdb_rating);

        return selectedItem;
    }

    
    function openRandomCard(randomCard) {
        logRandom('Opening card -', randomCard.title || randomCard.name);
    
        
        var method = randomCard.type === 'tv' ? 'tv' : 'movie';
        Lampa.Activity.push({
            card: randomCard,
            component: 'full',
            method: method,
            source: randomCard.source || 'tmdb',
            id: randomCard.id
        });
    }

    
    function addRandomMenuItem() {
		var randomIcon = RANDOM_ICON_SVG;
		
        var randomMenuItem = $(
            '<li class="menu__item selector" data-action="random_movie">' +
                '<div class="menu__ico">' + randomIcon + '</div>' +
                '<div class="menu__text">' + Lampa.Lang.translate('random_card_title') + '</div>' +
            '</li>'
        );

        randomMenuItem.on("hover:enter", function() {
    logRandom('Button clicked');
    
            
            var service = Lampa.Api.sources[PLUGIN_NAME];
            
            if (Object.keys(service.categoriesData).length === 0) {
        logRandom('Data not loaded, loading now...');
                
                service.loadData(function() {
            logRandom('Data loaded successfully');
                    var randomCard = getRandomMovieTvCard();
                    if (randomCard) {
                        openRandomCard(randomCard);
                    } else {
                logRandom('No suitable card found after loading');
                        Lampa.Noty.show(Lampa.Lang.translate('random_card_no_data_error'));
                    }
                }, function(error) {
            logRandom('Error loading data:', error);
                    Lampa.Noty.show(Lampa.Lang.translate('random_card_no_data_error'));
                });
            } else {
                
        logRandom('Using cached data');
                var randomCard = getRandomMovieTvCard();
                if (randomCard) {
                    openRandomCard(randomCard);
                } else {
            logRandom('No suitable card found in cache');
                    Lampa.Noty.show(Lampa.Lang.translate('random_card_no_data_error'));
                }
            }
        });

        $(".menu .menu__list").eq(0).append(randomMenuItem);
    }
    
    function CategorizedService() {
        var self = this;
        var network = new Lampa.Reguest();
        self.categoriesData = {}; 
        self.itemIndex = Object.create(null); 
        
        
        self.loadData = function(onComplete, onError) {
            var cacheKey = JSON_URL;
            var cached = getCache(cacheKey);
            
            if (cached) {
                self.categoriesData = cached;
                self.itemIndex = buildItemIndex(self.categoriesData);
                ensureCategorySettings(self.categoriesData);
                logRatings('Using cached data');
                onComplete();
                return;
            }
            
            logRatings('Loading data from URL:', JSON_URL);
            network.silent(JSON_URL, function(json) {
                if (!json || !json.categories || !Array.isArray(json.categories)) {
                    logRatings('Invalid JSON format received');
                    onError(new Error("Invalid JSON format"));
                    return;
                }
                
                logRatings('Successfully loaded JSON data, categories count:', json.categories.length);
        
        
        if (json.categories[0] && json.categories[0].items && json.categories[0].items[0]) {
            var sampleItem = json.categories[0].items[0];
                    logRatings('Sample item from loaded data:', sampleItem.ti || sampleItem.n, 'K:', sampleItem.k, 'I:', sampleItem.i);
        }
        
                
                var normalizedData = {};
                for (var i = 0; i < json.categories.length; i++) {
                    var category = json.categories[i];
                    normalizedData[category.id] = {
                        title: category.title,
                        items: category.items.map(function(item) {
                            return normalizeItem(item, category.id); 
                        })
                    };
                }
                
                self.categoriesData = normalizedData;
                self.itemIndex = buildItemIndex(self.categoriesData);
                setCache(cacheKey, normalizedData); 
                ensureCategorySettings(self.categoriesData);
                logRatings('Data normalized and cached');
                onComplete();
            }, function(error) {
                logRatings('Error loading data:', error);
                onError(error || new Error("Network error"));
            });
        };

        function parseRatingWithVotes(value) {
            if (value === null || value === undefined || value === '' || Array.isArray(value)) {
                return { rating: null, votes: 0 };
            }

            if (typeof value === 'number') {
                return { rating: value, votes: 0 };
            }

            var str = String(value);
            var normalized = str.replace(',', '.');
            var ratingMatch = normalized.match(/([0-9]+(?:\.[0-9]+)?)/);
            var votesMatch = normalized.match(/\(([\d\s]+)\)/);
            var rating = ratingMatch ? parseFloat(ratingMatch[1]) : null;
            var votes = votesMatch ? parseInt(votesMatch[1].replace(/\s+/g, ''), 10) : 0;

            if (isNaN(rating)) rating = null;
            if (isNaN(votes)) votes = 0;

            return { rating: rating, votes: votes };
        }

        function getRatingField(item, shortKey, longKey) {
            if (!item) return undefined;
            if (item[shortKey] !== undefined) return item[shortKey];
            return item[longKey];
        }

        function getField(item, shortKey, longKey) {
            if (!item) return undefined;
            if (item[shortKey] !== undefined) return item[shortKey];
            return item[longKey];
        }

        function pickBestRating(data) {
            var candidates = [
                { source: 'KP', rating: data.kp_rating, votes: data.kp_votes || 0, order: 0 },
                { source: 'IMDB', rating: data.imdb_rating, votes: data.imdb_votes || 0, order: 1 },
                { source: 'TMDB', rating: data.tmdb_rating, votes: data.tmdb_votes || 0, order: 2 }
            ];

            var best = null;

            for (var i = 0; i < candidates.length; i++) {
                var candidate = candidates[i];
                if (!(candidate.rating > 0)) continue;

                if (!best ||
                    candidate.votes > best.votes ||
                    (candidate.votes === best.votes && candidate.rating > best.rating) ||
                    (candidate.votes === best.votes && candidate.rating === best.rating && candidate.order < best.order)) {
                    best = candidate;
                }
            }

            return best;
        }

        function filterItemsBySettings(items, categoryId) {
            if (categoryId && FILTER_EXCLUDE_CATEGORY_IDS[categoryId]) return items;

            var filtered = [];
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                var filterType = item && item.type === 'tv' ? 'tv' : 'movie';
                if (categoryId) {
                    if (MOVIE_CATEGORY_IDS[categoryId]) filterType = 'movie';
                    else if (SERIES_CATEGORY_IDS[categoryId]) filterType = 'tv';
                }

                var config = getFilterConfigForType(filterType);
                var minRating = config.minRating;
                var minVotes = config.minVotes;

                if (!(minRating > 0) && !(minVotes > 0)) {
                    filtered.push(item);
                    continue;
                }

                var kpRating = item.kp_rating;
                var imdbRating = item.imdb_rating;

                var kpVotes = item.kp_votes || 0;
                var imdbVotes = item.imdb_votes || 0;

                function sourcePasses(rating, votes) {
                    if (minRating > 0 && !(rating >= minRating)) return false;
                    if (minVotes > 0 && !(votes >= minVotes)) return false;
                    if (minRating > 0 && !(rating > 0)) return false;
                    return true;
                }

                var passes = false;
                if (kpRating > 0 || kpVotes > 0) passes = sourcePasses(kpRating, kpVotes);
                if (!passes && (imdbRating > 0 || imdbVotes > 0)) passes = sourcePasses(imdbRating, imdbVotes);

                if (passes) filtered.push(item);
            }

            return filtered;
        }
        
        
        function normalizeItem(item, categoryId) { 
            var tmdbInfo = parseRatingWithVotes(getRatingField(item, 't', 'tmdb_rating'));
            var kpInfo = parseRatingWithVotes(getRatingField(item, 'k', 'kp_rating'));
            var imdbInfo = parseRatingWithVotes(getRatingField(item, 'i', 'imdb_rating'));
            var title = getField(item, 'ti', 'title');
            var name = getField(item, 'n', 'name');
            var posterPath = getField(item, 'p', 'poster_path');
            var releaseDate = getField(item, 'r', 'release_date');
            var firstAirDate = getField(item, 'f', 'first_air_date');
            var season = getField(item, 's', 'season');
            var episode = getField(item, 'e', 'episode');
            var totalEpisodes = getField(item, 'te', 'totalEpisodes');

            var dataItem = {
                id: item.id,
                poster_path: posterPath || item.poster || '',
                vote_average: tmdbInfo.rating || 0,
                year: item.year || null,
                source: 'tmdb',
                kp_rating: kpInfo.rating,
                imdb_rating: imdbInfo.rating,
                tmdb_rating: tmdbInfo.rating || 0,
                kp_votes: kpInfo.votes,
                imdb_votes: imdbInfo.votes,
                tmdb_votes: tmdbInfo.votes,
                mtv_source: true,
                category_id: categoryId,
                movie_category: getField(item, 'm', 'movie_category') || null
            };

            var bestRating = pickBestRating(dataItem);
            if (bestRating) {
                dataItem.card_rating = bestRating.rating;
                dataItem.card_rating_source = bestRating.source;
            }
								 
            
            if (dataItem.kp_rating || dataItem.imdb_rating) {
                logRatings('Normalizing item with ratings:', title || name, 
                          'KP:', dataItem.kp_rating, 'IMDB:', dataItem.imdb_rating);
            }

            
    if (title) {
        
        dataItem.type = 'movie';
        dataItem.title = title;
        dataItem.original_title = item.original_title;
        dataItem.release_date = releaseDate;
        
    } else if (name) {
        
        dataItem.type = 'tv';
        dataItem.name = name;
        dataItem.original_name = item.original_name || name; 
        dataItem.original_title = item.original_name;
        dataItem.first_air_date = firstAirDate;
        dataItem.number_of_seasons = item.number_of_seasons;
        dataItem.last_air_date = item.last_air_date;
        dataItem.last_episode_to_air = item.last_episode_to_air;
            } else {
        
        dataItem.type = 'movie';
            }

            
            if (season !== undefined && episode !== undefined) {
                var seasonValue = season != null ? season : '';
                var episodeValue = episode != null ? episode : '';
                var totalEpisodesValue = totalEpisodes != null ? totalEpisodes : '';
        
                var series = '';
                if (seasonValue && episodeValue && totalEpisodesValue) {
                    series = 's' + seasonValue + ' e' + episodeValue + '/' + totalEpisodesValue;
                } else if (seasonValue && episodeValue) {
                    series = 's' + seasonValue + ' e' + episodeValue;
                } else if (episodeValue && totalEpisodesValue) {
                    series = ' e' + episodeValue + '/' + totalEpisodesValue;
                } else if (episodeValue) {
                    series = ' e' + episodeValue;
                }
                
                dataItem.series = series;
            }

            
            if (item.release_quality || item.sourceType) {
                dataItem.release_quality = formatReleaseInfo(
                    item.release_quality, 
                    item.sourceType
                );
            }

            
    if (dataItem.type === 'movie' && releaseDate) {
        dataItem.year = parseInt(releaseDate.substring(0, 4)) || null;
    } else if (dataItem.type === 'tv' && firstAirDate) {
        dataItem.year = parseInt(firstAirDate.substring(0, 4)) || null;
    }

            
            if (dataItem.year) {
        dataItem.promo_title = (dataItem.name || dataItem.title || dataItem.original_title || dataItem.original_name) + ` (${dataItem.year})`;
            } else {
        dataItem.promo_title = dataItem.name || dataItem.title || dataItem.original_title || dataItem.original_name;
            }
    
            return dataItem;
        }
        
        
        self.list = function(params, onComplete, onError) {
            var parts = (params.url || "").split('__');
            var categoryId = parts[1];
            var page = parseInt(params.page) || 1;
            var pageSize = 20;
            
            if (!self.categoriesData[categoryId]) {
                self.loadData(function() {
                    sendCategoryPage(categoryId, page, pageSize, onComplete);
                }, onError);
            } else {
                sendCategoryPage(categoryId, page, pageSize, onComplete);
            }
        };
        
        function sendCategoryPage(categoryId, page, pageSize, onComplete) {
            if (!isCategoryEnabled(categoryId)) {
                onComplete({
                    results: [],
                    page: page,
                    total_pages: 0,
                    total_results: 0
                });
                return;
            }
            var category = self.categoriesData[categoryId] || { items: [] };
            var filteredItems = filterItemsBySettings(category.items || [], categoryId);
            var startIndex = (page - 1) * pageSize;
            var endIndex = startIndex + pageSize;
            var items = filteredItems.slice(startIndex, endIndex);
            
            onComplete({
                results: items,
                page: page,
                total_pages: Math.ceil(filteredItems.length / pageSize),
                total_results: filteredItems.length
            });
        }
        
        
        self.category = function(params, onSuccess, onError) {
            self.loadData(function() {
                var sections = [];
                
                for (var categoryId in self.categoriesData) {
                    if (self.categoriesData.hasOwnProperty(categoryId)) {
                        var category = self.categoriesData[categoryId];
                        var categoryItems = filterItemsBySettings(category.items || [], categoryId);
                        
                        sections.push({
                            url: PLUGIN_NAME + '__' + categoryId,
                            title: category.title,
                            page: 1,
                            total_results: categoryItems.length,
                            total_pages: Math.ceil(categoryItems.length / 20),
                            results: categoryItems.slice(0, 20),
                            source: PLUGIN_NAME,
                            more: categoryItems.length > 20
                        });
                    }
                }
                
                onSuccess(sections);
            }, onError);
        };
        
        
        self.full = function(params, onSuccess, onError) {
            if (!params.card) return onError(new Error("Card data missing"));
            
            
            var originalCardData = params.card;
            logRatings('Original card data in full method:', originalCardData);
            
            
            var method = params.card.type === "tv" ? "tv" : "movie";
            
            Lampa.Api.sources.tmdb.full({
                id: params.card.id,
                method: method,
                card: params.card
            }, function(data) {
                data.originalCardData = originalCardData;
                onSuccess(data);
                
                setTimeout(function() {
                    displayRatingsInFullView(originalCardData);
        }, 100);
    }, onError);
};
        
        self.clear = function() {
            
            network.clear();
        };
        
        self.person = Lampa.Api.sources.tmdb.person;
        self.seasons = Lampa.Api.sources.tmdb.seasons;
    }

    
    function addNovinkiButton() {
        if (!isNavSettingEnabled(NAV_SETTING_ADD_NOVINKI, true)) {
            removeNavButtonWhenReady('novinki');
            return;
        }
        function addButtonToNavBar() {
            const navBar = document.querySelector('.navigation-bar__body');
            if (!navBar) return false;

            
            if (navBar.querySelector('.navigation-bar__item[data-action="novinki"]')) return true;

            
            const button = document.createElement('div');
            button.className = 'navigation-bar__item';
            button.setAttribute('data-action', 'novinki');
            button.setAttribute('data-mtv-novinki', '1');
            button.innerHTML = `
                <div class="navigation-bar__icon">${ICON_SVG}</div>
                <div class="navigation-bar__label">${Lampa.Lang.translate('movie_title')}</div>
            `;

            
            button.addEventListener('click', function() {
                Lampa.Activity.push({
                    title: Lampa.Lang.translate('movie_title'),
                    component: "category",
                    source: PLUGIN_NAME,
                    page: 1
                });
            });

            
            const searchBtn = navBar.querySelector('.navigation-bar__item[data-action="search"]');
            if (searchBtn) {
                navBar.insertBefore(button, searchBtn);
            } else {
                
                const settingsBtn = navBar.querySelector('.navigation-bar__item[data-action="settings"]');
                if (settingsBtn) {
                    navBar.insertBefore(button, settingsBtn);
                } else {
                navBar.appendChild(button);
                }
            }

            return true;
        }

        
        if (!addButtonToNavBar()) {
            
            const observer = new MutationObserver(function(mutations) {
                if (addButtonToNavBar()) {
                    observer.disconnect();
                }
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });

            
            setTimeout(() => observer.disconnect(), 10000);
        }
    }

    
    function addRandomNavButton() {
        if (!isNavSettingEnabled(NAV_SETTING_SETTINGS_RANDOM, true)) {
            removeNavButtonWhenReady('random_novinki');
            restoreSettingsButton();
            return;
        }
        function addButtonToNavBar() {
            const navBar = document.querySelector('.navigation-bar__body');
            if (!navBar) return false;

            
            if (navBar.querySelector('.navigation-bar__item[data-action="random_novinki"]')) return true;

            
			const randomIcon = RANDOM_ICON_SVG;
			
            
            const button = document.createElement('div');
            button.className = 'navigation-bar__item';
            button.setAttribute('data-action', 'random_novinki');
            button.setAttribute('data-mtv-settings-replace', '1');
            button.innerHTML = `
                <div class="navigation-bar__icon">${randomIcon}</div>
                <div class="navigation-bar__label">${Lampa.Lang.translate('random_card_title')}</div>
            `;

            
            button.addEventListener('click', function() {
                logRandom('Random button clicked from navigation');
                
                
                var service = Lampa.Api.sources[PLUGIN_NAME];
                
                if (Object.keys(service.categoriesData).length === 0) {
                    logRandom('Data not loaded, loading now...');
                    
                    service.loadData(function() {
                        logRandom('Data loaded successfully');
                        var randomCard = getRandomMovieTvCard();
                        if (randomCard) {
                            openRandomCard(randomCard);
                        } else {
                            logRandom('No suitable card found after loading');
                            Lampa.Noty.show(Lampa.Lang.translate('random_card_no_data_error'));
                        }
                    }, function(error) {
                        logRandom('Error loading data:', error);
                        Lampa.Noty.show(Lampa.Lang.translate('random_card_no_data_error'));
                    });
                } else {
                    
                    logRandom('Using cached data');
                    var randomCard = getRandomMovieTvCard();
                    if (randomCard) {
                        openRandomCard(randomCard);
                    } else {
                        logRandom('No suitable card found in cache');
                        Lampa.Noty.show(Lampa.Lang.translate('random_card_no_data_error'));
                    }
                }
            });

            
                    const settingsBtn = navBar.querySelector('.navigation-bar__item[data-action="settings"]');
                    if (settingsBtn) {
                
                if (!settingsNavButtonTemplate) settingsNavButtonTemplate = settingsBtn;
                settingsBtn.parentNode.replaceChild(button, settingsBtn);
                    } else {
                
                        navBar.appendChild(button);
            }

            return true;
        }

        
        if (!addButtonToNavBar()) {
            
            const observer = new MutationObserver(function(mutations) {
                if (addButtonToNavBar()) {
                    observer.disconnect();
                }
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });

            
            setTimeout(() => observer.disconnect(), 10000);
        }
    }


function replaceMainWithFavorite() {
    if (!isNavSettingEnabled(NAV_SETTING_MAIN_FAVORITE, true)) {
        restoreMainButton();
        return;
    }
    function addButtonToNavBar() {
        const navBar = document.querySelector('.navigation-bar__body');
        if (!navBar) {
            logFavorite('Навигационная панель не найдена');
            return false;
        }

        
        if (navBar.querySelector('.navigation-bar__item[data-action="favorite"]')) {
            logFavorite('Кнопка favorite уже существует в навигационной панели');
            return true;
        }

        
        const menuFavoriteItem = document.querySelector('.menu__item[data-action="favorite"]');
        if (!menuFavoriteItem) {
            logFavorite('Кнопка "Избранное" не найдена в боковой панели');
            return false;
        }

        
        const menuIcon = menuFavoriteItem.querySelector('.menu__ico');
        const menuText = menuFavoriteItem.querySelector('.menu__text');
        
        if (!menuIcon || !menuText) {
            logFavorite('Не удалось извлечь иконку или текст из кнопки "Избранное"');
            return false;
        }

        
        const favoriteButton = document.createElement('div');
        favoriteButton.className = 'navigation-bar__item';
        favoriteButton.setAttribute('data-action', 'favorite');
        favoriteButton.setAttribute('data-mtv-main-replace', '1');
        favoriteButton.innerHTML = `
            <div class="navigation-bar__icon">${menuIcon.innerHTML}</div>
            <div class="navigation-bar__label">${menuText.textContent}</div>
        `;

        
        favoriteButton.addEventListener('click', function(e) {
            logFavorite('Кнопка "Избранное" нажата');
            
            
            const originalFavoriteButton = document.querySelector('.menu__item[data-action="favorite"]');
            if (!originalFavoriteButton) {
                logFavorite('Оригинальная кнопка "Избранное" не найдена в меню');
                Lampa.Noty.show('Не удалось открыть избранное');
                return;
            }

            
            const $originalButton = $(originalFavoriteButton);
            
            
            const events = $._data(originalFavoriteButton, 'events');
            if (events && events['hover:enter']) {
                logFavorite('Найден обработчик hover:enter, вызываем его');
                try {
                    $originalButton.trigger("hover:enter");
                    return;
                } catch (error) {
                    logFavorite('Ошибка при вызове hover:enter:', error);
                }
            }
            
            
            logFavorite('Симулируем клик на оригинальной кнопке меню');
            try {
                originalFavoriteButton.click();
            } catch (error) {
                logFavorite('Ошибка при клике на оригинальную кнопку:', error);
                Lampa.Noty.show('Не удалось открыть избранное');
            }
        });

        
        const mainBtn = navBar.querySelector('.navigation-bar__item[data-action="main"]');
        
        if (mainBtn) {
            logFavorite('Найдена кнопка main, заменяем на favorite');
            
            
            if (!mainNavButtonTemplate) mainNavButtonTemplate = mainBtn;
            mainBtn.parentNode.replaceChild(favoriteButton, mainBtn);
            logFavorite('Кнопка main заменена на favorite');
            
            return true;
        } else {
            logFavorite('Кнопка main не найдена, добавляем favorite в начало');
            navBar.insertBefore(favoriteButton, navBar.firstChild);
            logFavorite('Кнопка favorite добавлена в начало навигационной панели');
            
            return true;
        }
    }

    
    logFavorite('Попытка добавления кнопки favorite в навигационную панель...');
    if (!addButtonToNavBar()) {
        logFavorite('Не удалось добавить кнопку сразу, запускаем MutationObserver');
        
        
        const observer = new MutationObserver(function(mutations) {
            logFavorite('MutationObserver: изменения в DOM обнаружены');
            
            if (addButtonToNavBar()) {
                logFavorite('Кнопка добавлена через MutationObserver, отключаем observer');
                observer.disconnect();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        
        setTimeout(() => {
            logFavorite('Таймаут MutationObserver, проверяем еще раз...');
            if (!addButtonToNavBar()) {
                logFavorite('Все равно не удалось добавить кнопку favorite');
            }
            observer.disconnect();
        }, 10000);
    } else {
        logFavorite('Кнопка favorite успешно добавлена');
    }
}

    function startPlugin() {
        ensureSettingsComponents();
        
        Lampa.SettingsApi.addParam({
            component: "main",
            param: {
                name: "movie_clear_cache",
                type: "trigger",
                default: false
            },
            field: {
                name: Lampa.Lang.translate('movie_cache'),
                description: Lampa.Lang.translate('movie_cleared')
            },
            onChange: function() {
                clearCache();
                Lampa.Noty.show(Lampa.Lang.translate('movie_cleared'));
            }
        });
        
        var CAT_NAME = Lampa.Lang.translate('movie_title');
        
        
        if (Lampa.Storage.field('start_page') === START_PAGE_VALUE) {
            window.start_deep_link = {
                component: 'category',
                page: 1,
                url: '',
                source: PLUGIN_NAME,
                title: CAT_NAME
            };
        }

        
        var values = Lampa.Params.values.start_page;
        values[START_PAGE_VALUE] = CAT_NAME;
        
        var service = new CategorizedService();
        Lampa.Api.sources[PLUGIN_NAME] = service;
        
        var menuItem = $(
            '<li class="menu__item selector" data-action="' + PLUGIN_NAME + '">' +
                '<div class="menu__ico">' + ICON_SVG + '</div>' +
                '<div class="menu__text">' + CAT_NAME + '</div>' +
            '</li>'
        );
        
        menuItem.on("hover:enter", function() {
            Lampa.Activity.push({
                title: CAT_NAME,
                component: "category",
                source: PLUGIN_NAME,
                page: 1
            });
        });
        
        $(".menu .menu__list").eq(0).append(menuItem);
        
        
        observer.observe(document.body, { 
            childList: true, 
            subtree: true
        });
        
        
        processExistingCards();
        
        
        setTimeout(function() {
            processExistingCards();
        }, 3000);

        
        applyNavButtons();
        bindNavButtonsListener();
        bindNavBarObserver();

        
		
		

        
        addRandomMenuItem();

        
        Lampa.Listener.follow('full', function(e) {
            if (e.type === 'complite') {
                logRatings('Full screen complite event received');
        
        var cardData = e.data.movie;
            if (cardData) {
                    logRatings('Card data found:', cardData.title || cardData.name);
                    logRatings('KP rating in cardData:', cardData.kp_rating, 'Type:', typeof cardData.kp_rating);
                    logRatings('IMDB rating in cardData:', cardData.imdb_rating, 'Type:', typeof cardData.imdb_rating);
            
            
            if ((cardData.kp_rating === null || cardData.kp_rating === undefined || cardData.kp_rating === '') && 
                (cardData.imdb_rating === null || cardData.imdb_rating === undefined || cardData.imdb_rating === '')) {
                        logRatings('Ratings not found in cardData, searching in our service...');
                var service = Lampa.Api.sources[PLUGIN_NAME];
                if (service && service.itemIndex) {
                    
                    var foundItem = service.itemIndex[cardData.id];
                        if (foundItem) {
                                    logRatings('Found item in service:', foundItem.title || foundItem.name);
                                    logRatings('KP from service:', foundItem.kp_rating);
                                    logRatings('IMDB from service:', foundItem.imdb_rating);
                            cardData.kp_rating = foundItem.kp_rating;
                            cardData.imdb_rating = foundItem.imdb_rating;
                    }
                }
            }
            
            
            var render = e.object.activity.render();
            if ($('.rate--kp', render).hasClass('hide') && !$('.wait_rating', render).length) {
                $('.info__rate', render).after('<div style="width:2em;margin-top:1em;margin-right:1em" class="wait_rating"><div class="broadcast__scan"><div></div></div><div>');
            }
            
                    setTimeout(function() {
                    displayRatingsInFullView(cardData);
            }, 100);
                }
            }
        });
    }

    if (window.appready) startPlugin();
    else Lampa.Listener.follow('app', function(e) {
        if (e.type === 'ready') startPlugin();
    });
}();




