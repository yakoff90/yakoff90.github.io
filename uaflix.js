(function() {
    'use strict';

    var Network = Lampa.Reguest;

    // ---------------------- ПАРСИНГ СПИСКУ РЕЗУЛЬТАТІВ ---------------------- //

    function parseUAFiX(html, query) {
        var results = [];
        try {
            var $html = $('<div>' + html + '</div>');

            $html.find(
                '.movie-item, .film-item, .search-result-item, ' +
                '.search-page__result, .search-page__item, ' +
                '.poster, .card, .video-block, .post-item, article'
            ).each(function() {
                var item = $(this);

                var title = item.find('.title, .poster__title, h3, h2, a[title]').first().text().trim();
                if (!title) return;

                var url = item.find('a').first().attr('href');
                if (!url) return;

                var img = item.find('img').first().attr('src') || item.find('img').first().attr('data-src');

                var metaText = item.find('.year, .date, .meta, .poster__info, .card__meta').first().text() || '';
                var year = metaText.match(/\d{4}/);

                if (url && !url.startsWith('http')) {
                    url = 'https://uafix.net' + (url.startsWith('/') ? url : '/' + url);
                }
                if (img && !img.startsWith('http')) {
                    img = 'https://uafix.net' + (img.startsWith('/') ? img : '/' + img);
                }

                results.push({
                    title: title,
                    url: url,
                    img: img,
                    year: year ? year[0] : null,
                    release_date: year ? year[0] : '0000'
                });
            });
        } catch(e) {
            console.error('UAFiX parse error:', e);
        }
        return results;
    }

    function parseUASerials(html, query) {
        var results = [];
        try {
            var $html = $('<div>' + html + '</div>');

            $html.find(
                '.movie-item, .film-item, .search-result-item, .post-item, ' +
                '.poster, .card, .video-block, article'
            ).each(function() {
                var item = $(this);

                var title = item.find('.title, .post-title, .poster__title, h3, h2, a[title]').first().text().trim();
                if (!title) return;

                var url = item.find('a').first().attr('href');
                if (!url) return;

                var img = item.find('img').first().attr('src') || item.find('img').first().attr('data-src');

                var metaText = item.find('.year, .date, .meta, .poster__info, .card__meta').first().text() || '';
                var year = metaText.match(/\d{4}/);

                if (url && !url.startsWith('http')) {
                    url = 'https://uaserials.pro' + (url.startsWith('/') ? url : '/' + url);
                }
                if (img && !img.startsWith('http')) {
                    img = 'https://uaserials.pro' + (img.startsWith('/') ? img : '/' + img);
                }

                results.push({
                    title: title,
                    url: url,
                    img: img,
                    year: year ? year[0] : null,
                    release_date: year ? year[0] : '0000'
                });
            });
        } catch(e) {
            console.error('UASerials parse error:', e);
        }
        return results;
    }

    // ---------------------- ПАРСИНГ ВІДЕОСТОРІНКИ ---------------------- //

    function normalizeVideoUrl(url) {
        if (!url) return url;
        // //example.com
        if (url.indexOf('//') === 0) {
            return 'https:' + url;
        }
        return url;
    }

    function parseEpisodesCommon($html) {
        var videos = [];

        $html.find('.episode-item, .season-item, .video-item, .episode, .series-item, [data-episode], [data-season]').each(function() {
            var item = $(this);

            var title = item.find('.title, .episode-title, a').first().text().trim();

            var linkEl = item.find('a, iframe, source').first();
            var url = linkEl.attr('href') || linkEl.attr('data-src') || linkEl.attr('src');

            var seasonAttr = item.attr('data-season');
            var episodeAttr = item.attr('data-episode');

            var seasonMatch = title ? title.match(/[Сс]езон\s*(\d+)/i) : null;
            var episodeMatch = title ? title.match(/[Сс]ери[яй]\s*(\d+)/i) : null;

            var season = seasonAttr || (seasonMatch ? seasonMatch[1] : null);
            var episode = episodeAttr || (episodeMatch ? episodeMatch[1] : null);

            url = normalizeVideoUrl(url);

            if (url) {
                videos.push({
                    title: title || 'Episode',
                    url: url,
                    season: season ? parseInt(season) : null,
                    episode: episode ? parseInt(episode) : null
                });
            }
        });

        return videos;
    }

    function parseFallbackIframe($html) {
        var videos = [];

        var iframe = $html.find('iframe[src], iframe[data-src]').first();
        if (iframe.length) {
            var src = iframe.attr('src') || iframe.attr('data-src');
            src = normalizeVideoUrl(src);

            if (src) {
                videos.push({
                    title: 'Play',
                    url: src,
                    method: 'play'
                });
            }
        }

        if (!videos.length) {
            $html.find('[data-player], [data-video], [data-file]').each(function() {
                var el = $(this);
                var src = el.attr('data-player') || el.attr('data-video') || el.attr('data-file');
                src = normalizeVideoUrl(src);
                if (src) {
                    videos.push({
                        title: 'Play',
                        url: src
                    });
                }
            });
        }

        return videos;
    }

    function parseUAFiXVideoPage(html) {
        var videos = [];
        try {
            var $html = $('<div>' + html + '</div>');

            videos = parseEpisodesCommon($html);

            if (!videos.length) {
                videos = parseFallbackIframe($html);
            }
        } catch(e) {
            console.error('UAFiX video parse error:', e);
        }
        return videos;
    }

    function parseUASerialsVideoPage(html) {
        var videos = [];
        try {
            var $html = $('<div>' + html + '</div>');

            videos = parseEpisodesCommon($html);

            if (!videos.length) {
                videos = parseFallbackIframe($html);
            }
        } catch(e) {
            console.error('UASerials video parse error:', e);
        }
        return videos;
    }

    // ---------------------- ТЕМПЛЕЙТИ ---------------------- //

    function resetTemplates() {
        if (!Lampa.Template.get('lampac_prestige_folder')) {
            Lampa.Template.add('lampac_prestige_folder', "<div class=\"online-prestige online-prestige--folder selector\">\n            <div class=\"online-prestige__folder\">\n                <svg viewBox=\"0 0 128 112\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n                    <rect y=\"20\" width=\"128\" height=\"92\" rx=\"13\" fill=\"white\"></rect>\n                    <path d=\"M29.9963 8H98.0037C96.0446 3.3021 91.4079 0 86 0H42C36.5921 0 31.9555 3.3021 29.9963 8Z\" fill=\"white\" fill-opacity=\"0.23\"></path>\n                    <rect x=\"11\" y=\"8\" width=\"106\" height=\"76\" rx=\"13\" fill=\"white\" fill-opacity=\"0.51\"></rect>\n                </svg>\n            </div>\n            <div class=\"online-prestige__body\">\n                <div class=\"online-prestige__head\">\n                    <div class=\"online-prestige__title\">{title}</div>\n                    <div class=\"online-prestige__time\">{time}</div>\n                </div>\n                <div class=\"online-prestige__footer\">\n                    <div class=\"online-prestige__info\">{info}</div>\n                </div>\n            </div>\n        </div>");
        }
        if (!Lampa.Template.get('lampac_prestige_full')) {
            Lampa.Template.add('lampac_prestige_full', "<div class=\"online-prestige online-prestige--full selector\">\n            <div class=\"online-prestige__img\">\n                <img alt=\"\">\n                <div class=\"online-prestige__loader\"></div>\n            </div>\n            <div class=\"online-prestige__body\">\n                <div class=\"online-prestige__head\">\n                    <div class=\"online-prestige__title\">{title}</div>\n                    <div class=\"online-prestige__time\">{time}</div>\n                </div>\n                <div class=\"online-prestige__timeline\"></div>\n                <div class=\"online-prestige__footer\">\n                    <div class=\"online-prestige__info\">{info}</div>\n                    <div class=\"online-prestige__quality\">{quality}</div>\n                </div>\n            </div>\n        </div>");
        }
        if (!Lampa.Template.get('lampac_content_loading')) {
            Lampa.Template.add('lampac_content_loading', "<div class=\"online-empty\">\n            <div class=\"broadcast__scan\"><div></div></div>\n            <div class=\"online-empty__templates\">\n                <div class=\"online-empty-template selector\">\n                    <div class=\"online-empty-template__ico\"></div>\n                    <div class=\"online-empty-template__body\"></div>\n                </div>\n                <div class=\"online-empty-template\">\n                    <div class=\"online-empty-template__ico\"></div>\n                    <div class=\"online-empty-template__body\"></div>\n                </div>\n                <div class=\"online-empty-template\">\n                    <div class=\"online-empty-template__ico\"></div>\n                    <div class=\"online-empty-template__body\"></div>\n                </div>\n            </div>\n        </div>");
        }
        if (!Lampa.Template.get('lampac_does_not_answer')) {
            Lampa.Template.add('lampac_does_not_answer', "<div class=\"online-empty\">\n            <div class=\"online-empty__title\">Nothing found</div>\n            <div class=\"online-empty__time\">No results found</div>\n            <div class=\"online-empty__buttons\"></div>\n        </div>");
        }
    }

    // ---------------------- КОМПОНЕНТ ---------------------- //

    function component(object) {
        var network = new Network();
        var scroll = new Lampa.Scroll({
            mask: true,
            over: true
        });
        var files = new Lampa.Explorer(object);
        var filter = new Lampa.Filter(object);
        var source = object.source || Lampa.Storage.get('uafix_uaserials_source', 'uafix');
        var baseUrl = source === 'uaserials' ? 'https://uaserials.pro' : 'https://uafix.net';
        var last;
        var videos = [];
        var sources_list = {
            'uafix': { name: 'UAFiX', url: 'https://uafix.net' },
            'uaserials': { name: 'UASerials', url: 'https://uaserials.pro' }
        };

        this.changeSource = function(newSource) {
            source = newSource;
            baseUrl = sources_list[newSource].url;
            Lampa.Storage.set('uafix_uaserials_source', newSource);
            object.source = newSource;
            this.reset();
            this.search();
        };

        this.initialize = function() {
            var _this = this;
            resetTemplates();
            this.loading(true);
            filter.onBack = function() {
                Lampa.Activity.backward();
            };
            filter.onSelect = function(type, a, b) {
                if (type == 'sort') {
                    Lampa.Select.close();
                    _this.changeSource(a.source);
                }
            };
            filter.render().find('.filter--sort span').text('Origin');
            scroll.body().addClass('torrent-list');
            files.appendFiles(scroll.render());
            files.appendHead(filter.render());
            scroll.minus(files.render().find('.explorer__files-head'));
            scroll.body().append(Lampa.Template.get('lampac_content_loading'));
            Lampa.Controller.enable('content');
            this.loading(false);
            this.updateSourceFilter();
            this.search();
        };

        this.updateSourceFilter = function() {
            var sourceItems = Object.keys(sources_list).map(function(key) {
                return {
                    title: sources_list[key].name,
                    source: key,
                    selected: key == source
                };
            });
            filter.set('sort', sourceItems);
            filter.chosen('sort', [sources_list[source].name]);
        };

        this.search = function() {
            var searchQuery = object.search || object.movie.title || object.movie.name || '';
            var searchUrl = baseUrl + '/search?term=' + encodeURIComponent(searchQuery);

            network.native(searchUrl, function(html) {
                var results = source === 'uaserials' ? parseUASerials(html, searchQuery) : parseUAFiX(html, searchQuery);

                if (results.length === 0) {
                    this.empty();
                } else if (results.length === 1 && !object.clarification) {
                    this.loadVideoPage(results[0].url);
                } else {
                    this.displayResults(results);
                }
            }.bind(this), function() {
                this.empty();
            }.bind(this), false, {
                dataType: 'text'
            });
        };

        this.loadVideoPage = function(url) {
            network.native(url, function(html) {
                videos = source === 'uaserials' ? parseUASerialsVideoPage(html) : parseUAFiXVideoPage(html);

                if (videos.length > 0) {
                    this.display(videos);
                } else {
                    this.empty();
                }
            }.bind(this), function() {
                this.empty();
            }.bind(this), false, {
                dataType: 'text'
            });
        };

        this.displayResults = function(results) {
            scroll.clear();

            results.forEach(function(item) {
                var info = [];
                if (item.year) info.push(item.year);
                if (item.details) info.push(item.details);

                var html = Lampa.Template.get('lampac_prestige_folder', {
                    title: item.title,
                    time: '',
                    info: info.join('<span class="online-prestige-split">●</span>')
                });

                if (item.img) {
                    var image = $('<img style="height: 7em; width: 7em; border-radius: 0.3em;"/>');
                    html.find('.online-prestige__folder').empty().append(image);

                    var imgUrl = item.img;
                    if (imgUrl && !imgUrl.startsWith('http')) {
                        imgUrl = baseUrl + (imgUrl.startsWith('/') ? imgUrl : '/' + imgUrl);
                    }

                    Lampa.Utils.imgLoad(image, imgUrl);
                }

                html.on('hover:enter', function() {
                    this.reset();
                    this.loadVideoPage(item.url);
                }.bind(this)).on('hover:focus', function(e) {
                    last = e.target;
                    scroll.update($(e.target), true);
                });

                scroll.append(html);
            }.bind(this));

            this.loading(false);
            Lampa.Controller.enable('content');
        };

        this.display = function(videosList) {
            scroll.clear();

            videosList.forEach(function(video, index) {
                var html = Lampa.Template.get('lampac_prestige_full', {
                    title: video.title || ('Episode ' + (video.episode || index + 1)),
                    time: '',
                    info: video.season ? 'Season ' + video.season + ', Episode ' + video.episode : '',
                    quality: ''
                });

                html.on('hover:enter', function() {
                    this.playVideo(video);
                }.bind(this)).on('hover:focus', function(e) {
                    last = e.target;
                    scroll.update($(e.target), true);
                });

                scroll.append(html);
            }.bind(this));

            Lampa.Controller.enable('content');
        };

        this.playVideo = function(video) {
            if (video.url) {
                var play = {
                    title: video.title,
                    url: normalizeVideoUrl(video.url),
                    season: video.season,
                    episode: video.episode
                };

                Lampa.Player.play(play);
            }
        };

        this.create = function() {
            return this.render();
        };

        this.render = function() {
            return files.render();
        };

        this.start = function() {
            if (Lampa.Activity.active().activity !== this.activity) return;
            if (!this.initialized) {
                this.initialized = true;
                this.initialize();
            }
            Lampa.Background.immediately(Lampa.Utils.cardImgBackgroundBlur(object.movie));
            Lampa.Controller.add('content', {
                toggle: function() {
                    Lampa.Controller.collectionSet(scroll.render(), files.render());
                    Lampa.Controller.collectionFocus(last || false, scroll.render());
                },
                up: function() {
                    if (Navigator.canmove('up')) {
                        Navigator.move('up');
                    } else {
                        Lampa.Controller.toggle('head');
                    }
                },
                down: function() {
                    Navigator.move('down');
                },
                right: function() {
                    if (Navigator.canmove('right')) Navigator.move('right');
                    else filter.show('Filter', 'filter');
                },
                left: function() {
                    if (Navigator.canmove('left')) Navigator.move('left');
                    else Lampa.Controller.toggle('menu');
                },
                back: function() {
                    Lampa.Activity.backward();
                }
            });
            Lampa.Controller.toggle('content');
        };

        this.back = function() {
            Lampa.Activity.backward();
        };

        this.loading = function(status) {
            if (status) {
                this.activity.loader(true);
            } else {
                this.activity.loader(false);
                this.activity.toggle();
            }
        };

        this.empty = function() {
            scroll.clear();
            var html = Lampa.Template.get('lampac_does_not_answer', {});
            html.find('.online-empty__title').text('Nothing found');
            html.find('.online-empty__time').text('No results found for your search');
            html.find('.online-empty__buttons').remove();
            scroll.append(html);
            this.loading(false);
        };

        this.destroy = function() {
            network.clear();
            files.destroy();
            scroll.destroy();
        };

        this.reset = function() {
            scroll.clear();
            network.clear();
            scroll.body().append(Lampa.Template.get('lampac_content_loading'));
        };

        this.pause = function() {};
        this.stop = function() {};
    }

    // ---------------------- ДЖЕРЕЛА ПОШУКУ ---------------------- //

    function addUAFiXSearchSource() {
        var network = new Network();

        var source = {
            title: 'UAFiX',
            search: function(params, onComplete) {
                var query = params.query;
                var searchUrl = 'https://uafix.net/search?term=' + encodeURIComponent(query);

                network.native(searchUrl, function(html) {
                    var results = parseUAFiX(html, query);

                    if (results.length > 0) {
                        var cards = results.map(function(item) {
                            return {
                                title: item.title,
                                url: item.url,
                                img: item.img,
                                release_date: item.release_date || '0000',
                                year: item.year
                            };
                        });

                        onComplete([{
                            title: 'UAFiX',
                            results: cards
                        }]);
                    } else {
                        onComplete([]);
                    }
                }, function() {
                    onComplete([]);
                }, false, {
                    dataType: 'text'
                });
            },
            onCancel: function() {
                network.clear();
            },
            params: {
                lazy: true,
                align_left: true,
                card_events: {
                    onMenu: function() {}
                }
            },
            onMore: function(params, close) {
                close();
            },
            onSelect: function(params, close) {
                close();

                Lampa.Activity.push({
                    url: params.element.url,
                    title: 'UAFiX - ' + params.element.title,
                    component: 'uafix-uaserials',
                    movie: params.element,
                    source: 'uafix',
                    search: params.element.title
                });
            }
        };

        Lampa.Search.addSource(source);
    }

    function addUASerialsSearchSource() {
        var network = new Network();

        var source = {
            title: 'UASerials',
            search: function(params, onComplete) {
                var query = params.query;
                var searchUrl = 'https://uaserials.pro/search?term=' + encodeURIComponent(query);

                network.native(searchUrl, function(html) {
                    var results = parseUASerials(html, query);

                    if (results.length > 0) {
                        var cards = results.map(function(item) {
                            return {
                                title: item.title,
                                url: item.url,
                                img: item.img,
                                release_date: item.release_date || '0000',
                                year: item.year
                            };
                        });

                        onComplete([{
                            title: 'UASerials',
                            results: cards
                        }]);
                    } else {
                        onComplete([]);
                    }
                }, function() {
                    onComplete([]);
                }, false, {
                    dataType: 'text'
                });
            },
            onCancel: function() {
                network.clear();
            },
            params: {
                lazy: true,
                align_left: true,
                card_events: {
                    onMenu: function() {}
                }
            },
            onMore: function(params, close) {
                close();
            },
            onSelect: function(params, close) {
                close();

                Lampa.Activity.push({
                    url: params.element.url,
                    title: 'UASerials - ' + params.element.title,
                    component: 'uafix-uaserials',
                    movie: params.element,
                    source: 'uaserials',
                    search: params.element.title
                });
            }
        };

        Lampa.Search.addSource(source);
    }

    // ---------------------- СТАРТ ПЛАГІНА ---------------------- //

    function startPlugin() {
        var manifest = {
            type: 'video',
            version: '1.1.0',
            name: 'UAFiX & UASerials Direct',
            description: 'Direct parsing plugin for UAFiX.net and UASerials.pro',
            component: 'uafix-uaserials',
            onContextMenu: function(object) {
                return {
                    name: 'Watch on UAFiX/UASerials',
                    description: ''
                };
            },
            onContextLauch: function(object) {
                resetTemplates();
                Lampa.Component.add('uafix-uaserials', component);

                var id = Lampa.Utils.hash(object.number_of_seasons ? object.original_name : object.original_title);
                var all = Lampa.Storage.get('clarification_search', '{}');
                var savedSource = Lampa.Storage.get('uafix_uaserials_source', 'uafix');

                var movieObj = Lampa.Arrays.clone(object);
                movieObj.source = savedSource;

                Lampa.Activity.push({
                    url: '',
                    title: Lampa.Lang.translate('title_online'),
                    component: 'uafix-uaserials',
                    search: all[id] ? all[id] : (object.title || object.name),
                    search_one: object.title || object.name,
                    search_two: object.original_title || object.original_name,
                    movie: movieObj,
                    page: 1,
                    clarification: all[id] ? true : false,
                    source: savedSource
                });
            }
        };

        // коректна реєстрація в маніфесті
        if (!Lampa.Manifest.plugins) {
            Lampa.Manifest.plugins = [];
        }
        if (Array.isArray(Lampa.Manifest.plugins)) {
            Lampa.Manifest.plugins.push(manifest);
        } else {
            Lampa.Manifest.plugins = [manifest];
        }

        Lampa.Lang.add({
            uafix_uaserials_watch: {
                ru: 'Смотреть на UAFiX/UASerials',
                en: 'Watch on UAFiX/UASerials',
                uk: 'Дивитися на UAFiX/UASerials'
            },
            title_online: {
                ru: 'Онлайн',
                uk: 'Онлайн',
                en: 'Online',
                zh: '在线的'
            }
        });

        resetTemplates();

        if (!document.getElementById('uafix-uaserials-css')) {
            var css = document.createElement('style');
            css.id = 'uafix-uaserials-css';
            css.textContent = "@charset 'UTF-8';.online-prestige{position:relative;-webkit-border-radius:.3em;border-radius:.3em;background-color:rgba(0,0,0,0.3);display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex}.online-prestige__body{padding:1.2em;line-height:1.3;-webkit-box-flex:1;-webkit-flex-grow:1;-moz-box-flex:1;-ms-flex-positive:1;flex-grow:1;position:relative}@media screen and (max-width:480px){.online-prestige__body{padding:.8em 1.2em}}.online-prestige__img{position:relative;width:13em;-webkit-flex-shrink:0;-ms-flex-negative:0;flex-shrink:0;min-height:8.2em}.online-prestige__img>img{position:absolute;top:0;left:0;width:100%;height:100%;-o-object-fit:cover;object-fit:cover;-webkit-border-radius:.3em;border-radius:.3em;opacity:0;-webkit-transition:opacity .3s;-o-transition:opacity .3s;-moz-transition:opacity .3s;transition:opacity .3s}.online-prestige__img--loaded>img{opacity:1}@media screen and (max-width:480px){.online-prestige__img{width:7em;min-height:6em}}.online-prestige__folder{padding:1em;-webkit-flex-shrink:0;-ms-flex-negative:0;flex-shrink:0}.online-prestige__folder>svg{width:4.4em !important;height:4.4em !important}.online-prestige__head,.online-prestige__footer{display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;-webkit-box-pack:justify;-webkit-justify-content:space-between;-moz-box-pack:justify;-ms-flex-pack:justify;justify-content:space-between;-webkit-box-align:center;-webkit-align-items:center;-moz-box-align:center;-ms-flex-align:center;align-items:center}.online-prestige__timeline{margin:.8em 0}.online-prestige__title{font-size:1.7em;overflow:hidden;-o-text-overflow:ellipsis;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:1;line-clamp:1;-webkit-box-orient:vertical}@media screen and (max-width:480px){.online-prestige__title{font-size:1.4em}}.online-prestige__time{padding-left:2em}.online-prestige__info{display:-webkit-box;display:-webkit-flex;display:
