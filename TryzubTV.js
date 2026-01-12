(function () {
  'use strict';

  // Проверяем, работает ли на Tizen
  var IS_TIZEN = typeof tizen !== 'undefined' || 
                 navigator.userAgent.toLowerCase().indexOf('tizen') > -1 ||
                 navigator.userAgent.toLowerCase().indexOf('samsung') > -1 ||
                 /SMART-TV|Tizen/.test(navigator.userAgent);

  console.log('TryzubTV: Platform detection - IS_TIZEN:', IS_TIZEN, 'UserAgent:', navigator.userAgent);

  // Базовые константы с альтернативными прокси для Tizen
  var API_BASE = IS_TIZEN 
    ? 'https://corsproxy.io/?' + encodeURIComponent('https://dyvy.tv/api/v1')
    : 'https://dyvy.tv/api/v1';
  
  var REPLAY_BASE$1 = IS_TIZEN
    ? 'https://corsproxy.io/?' + encodeURIComponent('https://a.maincast.tv/items')
    : 'https://p01--corsproxy--h7ynqrkjrc6c.code.run/https://a.maincast.tv/items';
  
  var REPLAY_LIMIT = 10;
  var QR_CARD_POSTER$1 = 'https://iili.io/fkdGkSj.png';
  var CATALOG_ORDER_KEY = 'tryzubtv_catalog_order';
  var CATALOG_HIDE_KEY = 'tryzubtv_catalog_hidden';
  var SOURCE_TV = 'tv';
  var SOURCE_REPLAY = 'replay';

  // Упрощенные функции для совместимости
  function _arrayLikeToArray(r, a) {
    (null == a || a > r.length) && (a = r.length);
    for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
    return n;
  }
  
  function _arrayWithHoles(r) {
    if (Array.isArray(r)) return r;
  }
  
  function asyncGeneratorStep(n, t, e, r, o, a, c) {
    try {
      var i = n[a](c),
        u = i.value;
    } catch (n) {
      return void e(n);
    }
    i.done ? t(u) : Promise.resolve(u).then(r, o);
  }
  
  function _asyncToGenerator(n) {
    return function () {
      var t = this,
        e = arguments;
      return new Promise(function (r, o) {
        var a = n.apply(t, e);
        function _next(n) {
          asyncGeneratorStep(a, r, o, _next, _throw, "next", n);
        }
        function _throw(n) {
          asyncGeneratorStep(a, r, o, _next, _throw, "throw", n);
        }
        _next(void 0);
      });
    };
  }
  
  function _iterableToArrayLimit(r, l) {
    var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
    if (null != t) {
      var e,
        n,
        i,
        u,
        a = [],
        f = !0,
        o = !1;
      try {
        if (i = (t = t.call(r)).next, 0 === l) {
          if (Object(t) !== t) return;
          f = !1;
        } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0);
      } catch (r) {
        o = !0, n = r;
      } finally {
        try {
          if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return;
        } finally {
          if (o) throw n;
        }
      }
      return a;
    }
  }
  
  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  
  function _slicedToArray(r, e) {
    return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest();
  }
  
  function _unsupportedIterableToArray(r, a) {
    if (r) {
      if ("string" == typeof r) return _arrayLikeToArray(r, a);
      var t = {}.toString.call(r).slice(8, -1);
      return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0;
    }
  }

  // Адаптированная функция запроса для всех платформ
  function request$2(url) {
    return new Promise(function (resolve, reject) {
      console.log('TryzubTV: Requesting URL:', url);
      
      // Для Tizen используем более надежный подход
      if (IS_TIZEN) {
        try {
          var xhr = new XMLHttpRequest();
          xhr.open('GET', url, true);
          xhr.timeout = 15000; // Увеличен таймаут для Tizen
          
          // Важно для CORS на Tizen
          xhr.setRequestHeader('Accept', 'application/json');
          xhr.setRequestHeader('Content-Type', 'application/json');
          
          xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
              console.log('TryzubTV: XHR Status:', xhr.status, 'for URL:', url);
              if (xhr.status === 200 || xhr.status === 0) { // 0 для file:// протокола
                try {
                  var data = JSON.parse(xhr.responseText);
                  console.log('TryzubTV: XHR Success, data received');
                  resolve(data);
                } catch (e) {
                  console.error('TryzubTV: JSON parse error:', e, 'Response:', xhr.responseText);
                  try {
                    // Пробуем парсить как текст
                    resolve(xhr.responseText);
                  } catch (e2) {
                    reject(new Error('Invalid JSON response'));
                  }
                }
              } else {
                console.error('TryzubTV: XHR Error Status:', xhr.status);
                // Пробуем альтернативный URL
                var altUrl = url.replace('corsproxy.io', 'api.allorigins.win');
                if (url !== altUrl) {
                  console.log('TryzubTV: Trying alternative URL:', altUrl);
                  request$2(altUrl).then(resolve).catch(reject);
                } else {
                  reject(new Error('HTTP ' + xhr.status));
                }
              }
            }
          };
          
          xhr.onerror = function () {
            console.error('TryzubTV: XHR Network error for URL:', url);
            // Пробуем без прокси как последний вариант
            if (url.includes('corsproxy.io')) {
              var directUrl = decodeURIComponent(url.split('?')[1]);
              console.log('TryzubTV: Trying direct URL:', directUrl);
              request$2(directUrl).then(resolve).catch(reject);
            } else {
              reject(new Error('Network error'));
            }
          };
          
          xhr.ontimeout = function () {
            console.error('TryzubTV: XHR Timeout for URL:', url);
            reject(new Error('Timeout'));
          };
          
          xhr.send();
        } catch (error) {
          console.error('TryzubTV: XHR Exception:', error);
          reject(error);
        }
      } else {
        // Оригинальный код для других платформ
        if (Lampa && Lampa.Network && Lampa.Network.silent) {
          Lampa.Network.silent(url, resolve, reject);
        } else {
          // Fallback для старых версий Lampa
          fetch(url)
            .then(response => response.json())
            .then(resolve)
            .catch(reject);
        }
      }
    });
  }
  
  function isFreeChannel(channel) {
    return channel && channel.package_block == null;
  }
  
  function translateCategoryName$1(name) {
    var raw = name || '';
    if (!raw) return '';
    var key = "tryzubtv_category_".concat(raw);
    var translated = Lampa && Lampa.Lang ? Lampa.Lang.translate(key) : key;
    return translated === key ? raw : translated;
  }
  
  function normalizeLineId(id) {
    if (!id) return '';
    if (id.includes(':')) return id;
    return "".concat(SOURCE_TV, ":").concat(id);
  }
  
  function getStoredArray(key) {
    var value = Lampa && Lampa.Storage ? Lampa.Storage.get(key, []) : [];
    if (Array.isArray(value)) return value.slice();
    if (typeof value === 'string') {
      try {
        var parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
      } catch (error) {
        return value.split(',').map(function (item) {
          return item.trim();
        }).filter(Boolean);
      }
    }
    return [];
  }
  
  function normalizeStoredList(list) {
    var normalized = [];
    list.forEach(function (item) {
      var id = normalizeLineId(item);
      if (id) normalized.push(id);
    });
    return normalized;
  }
  
  function setStoredList(key, list, original) {
    if (!Lampa || !Lampa.Storage) return;
    var normalized = normalizeStoredList(list);
    var current = JSON.stringify(original);
    var updated = JSON.stringify(normalized);
    if (current !== updated) {
      Lampa.Storage.set(key, normalized);
    }
  }
  
  function getCatalogOrder() {
    var order = getStoredArray(CATALOG_ORDER_KEY);
    setStoredList(CATALOG_ORDER_KEY, order, order);
    return normalizeStoredList(order);
  }
  
  function getCatalogHidden() {
    var hidden = getStoredArray(CATALOG_HIDE_KEY);
    setStoredList(CATALOG_HIDE_KEY, hidden, hidden);
    return normalizeStoredList(hidden);
  }
  
  function sortCatalogLines(lines) {
    var order = getCatalogOrder();
    if (!order.length) {
      var tv = lines.filter(function (line) {
        return line.source === SOURCE_TV;
      });
      var replay = lines.filter(function (line) {
        return line.source === SOURCE_REPLAY;
      });
      var defaultOrder = tv.concat(replay);
      var _mergedOrder = defaultOrder.map(function (line) {
        return line.id;
      });
      if (Lampa && Lampa.Storage) Lampa.Storage.set(CATALOG_ORDER_KEY, _mergedOrder);
      return defaultOrder;
    }
    var map = new Map();
    lines.forEach(function (line) {
      if (line && line.id) map.set(line.id, line);
    });
    var ordered = [];
    order.forEach(function (id) {
      var normalized = normalizeLineId(id);
      if (map.has(normalized)) {
        ordered.push(map.get(normalized));
        map["delete"](normalized);
      }
    });
    lines.forEach(function (line) {
      if (line && map.has(line.id)) {
        ordered.push(line);
        map["delete"](line.id);
      }
    });
    var mergedOrder = ordered.map(function (line) {
      return line.id;
    });
    if (Lampa && Lampa.Storage && JSON.stringify(mergedOrder) !== JSON.stringify(order)) {
      Lampa.Storage.set(CATALOG_ORDER_KEY, mergedOrder);
    }
    return ordered;
  }
  
  function buildQrCard() {
    return {
      poster: QR_CARD_POSTER$1,
      cover: QR_CARD_POSTER$1,
      img: QR_CARD_POSTER$1,
      overview: '',
      tryzubtv_action: 'qr_modal',
      params: {
        style: {
          name: 'wide'
        }
      }
    };
  }
  
  function mapChannelToCard(channel, category) {
    var logo = channel.icon_url || channel.icon_url_2 || '';
    var poster = logo || channel.frame_url || channel.frame_url_origin || '';
    var categorySlug = category ? category.slug : '';
    var categoryTitle = translateCategoryName$1(category ? category.name : '');
    var nowTitle = channel.epg_current && channel.epg_current.name ? channel.epg_current.name : '';
    var fallbackTitle = channel.name || '';
    return {
      title: nowTitle || fallbackTitle,
      poster: poster,
      cover: poster,
      img: logo,
      overview: channel.description || '',
      tryzubtv_source: SOURCE_TV,
      tryzubtv_slug: channel.slug || '',
      tryzubtv_link: channel.link || '',
      tryzubtv_epg: channel.epg_current || null,
      tryzubtv_type: channel.type || '',
      tryzubtv_logo: logo,
      tryzubtv_now: channel.epg_current ? channel.epg_current.name : '',
      tryzubtv_category: categorySlug,
      tryzubtv_category_title: categoryTitle,
      params: {
        style: {
          name: 'wide'
        }
      }
    };
  }
  
  function mapReplayToCard(vod) {
    try {
      if (!vod.link || !vod.link.startsWith('http')) return null;
      var url = new URL(vod.link);
      var v = url.searchParams.get('v');
      if (!v) return null;
      var description = vod.description || '';
      var release_date = vod.date ? new Date(vod.date).toLocaleDateString() : '';
      var cover = '';
      if (vod.cover) {
        cover = vod.cover.startsWith('http') ? vod.cover : "https://a.maincast.tv/assets/".concat(vod.cover);
      } else if (vod.cover_url) {
        cover = vod.cover_url;
      } else if (vod.poster) {
        cover = vod.poster.startsWith('http') ? vod.poster : "https://a.maincast.tv/assets/".concat(vod.poster);
      }
      return {
        title: vod.name,
        cover: cover,
        poster: cover,
        overview: description,
        salo_description: description,
        salo_release_date: release_date,
        salo_vod_id: v,
        tryzubtv_source: SOURCE_REPLAY,
        params: {
          style: {
            name: 'wide'
          }
        }
      };
    } catch (e) {
      console.error('TryzubTV: Error mapping replay to card:', e);
      return null;
    }
  }
  
  function fetchCategories() {
    return _fetchCategories.apply(this, arguments);
  }
  
  function _fetchCategories() {
    _fetchCategories = _asyncToGenerator(function* () {
      try {
        console.log('TryzubTV: Fetching categories from:', API_BASE + "/categories?is_main=1");
        var response = yield request$2(API_BASE + "/categories?is_main=1");
        console.log('TryzubTV: Categories response:', response);
        return response && response.data ? response.data : [];
      } catch (error) {
        console.error('TryzubTV: Error fetching categories:', error);
        // Возвращаем заглушку для тестирования
        return IS_TIZEN ? [
          { name: "News", slug: "news" },
          { name: "Sport", slug: "sport" },
          { name: "Movies", slug: "movies" }
        ] : [];
      }
    });
    return _fetchCategories.apply(this, arguments);
  }
  
  function fetchReplayDisciplines() {
    return _fetchReplayDisciplines.apply(this, arguments);
  }
  
  function _fetchReplayDisciplines() {
    _fetchReplayDisciplines = _asyncToGenerator(function* () {
      try {
        var url = REPLAY_BASE$1 + "/discipline?filter={\"category\":\"sport\"}&fields=name,id,icon";
        console.log('TryzubTV: Fetching disciplines from:', url);
        var response = yield request$2(url);
        console.log('TryzubTV: Disciplines response:', response);
        return response && response.data ? response.data : [];
      } catch (error) {
        console.error('TryzubTV: Error fetching disciplines:', error);
        return [];
      }
    });
    return _fetchReplayDisciplines.apply(this, arguments);
  }
  
  function buildLineMetaTv(category) {
    var rawTitle = category && category.name ? category.name : '';
    var title = translateCategoryName$1(rawTitle);
    var slug = category && category.slug ? category.slug : '';
    return {
      id: SOURCE_TV + ":" + slug,
      source: SOURCE_TV,
      title: title,
      rawTitle: rawTitle,
      category_slug: slug
    };
  }
  
  function buildLineMetaReplay(discipline) {
    var rawTitle = discipline && discipline.name ? discipline.name : '';
    var title = translateCategoryName$1(rawTitle);
    return {
      id: SOURCE_REPLAY + ":" + discipline.id,
      source: SOURCE_REPLAY,
      title: title,
      rawTitle: rawTitle,
      discipline_id: discipline.id
    };
  }
  
  function fetchCatalogLines() {
    return _fetchCatalogLines.apply(this, arguments);
  }
  
  function _fetchCatalogLines() {
    _fetchCatalogLines = _asyncToGenerator(function* () {
      try {
        console.log('TryzubTV: Fetching catalog lines...');
        var _ref = yield Promise.all([fetchCategories(), fetchReplayDisciplines()]),
            _ref2 = _slicedToArray(_ref, 2),
            categories = _ref2[0],
            disciplines = _ref2[1];
        
        console.log('TryzubTV: Categories found:', categories ? categories.length : 0);
        console.log('TryzubTV: Disciplines found:', disciplines ? disciplines.length : 0);
        
        var tvLines = (categories || []).map(buildLineMetaTv);
        var replayLines = (disciplines || []).map(buildLineMetaReplay);
        
        var allLines = tvLines.concat(replayLines);
        console.log('TryzubTV: Total lines:', allLines.length);
        return allLines;
      } catch (error) {
        console.error('TryzubTV: Error fetching catalog lines:', error);
        // Возвращаем заглушку для Tizen если запрос не удался
        if (IS_TIZEN) {
          return [
            buildLineMetaTv({ name: "News", slug: "news" }),
            buildLineMetaTv({ name: "Sport", slug: "sport" }),
            buildLineMetaReplay({ name: "Football", id: "1" })
          ];
        }
        return [];
      }
    });
    return _fetchCatalogLines.apply(this, arguments);
  }
  
  function buildLineShell(meta, LineModule, index) {
    var baseParams = {
      tryzubtv_source: meta.source,
      tryzubtv_line_id: meta.id,
      tryzubtv_line_index: index,
      tryzubtv_line_title: meta.title
    };
    
    var params = Object.assign({}, baseParams);
    
    if (meta.source === SOURCE_TV) {
      params.tryzubtv_category = meta.category_slug;
      params.tryzubtv_category_title = meta.title;
      params.tryzubtv_category_raw = meta.rawTitle;
      params.more = {
        title: meta.title,
        component: 'tryzubtv_category',
        category_slug: meta.category_slug
      };
    } else {
      params.tryzubtv_replay_id = meta.discipline_id;
      var morePrefix = Lampa && Lampa.Lang ? Lampa.Lang.translate('tryzubtv_more_videos') : 'All videos:';
      params.more = {
        title: morePrefix + " " + meta.title,
        component: 'salopower_category',
        disciplineId: meta.discipline_id
      };
    }
    
    if (LineModule) {
      params.module = LineModule.toggle(LineModule.MASK.base, 'More');
    }
    
    return {
      title: meta.title,
      results: [],
      total_pages: 2,
      params: params
    };
  }
  
  function loadMain(oncomplete, onerror) {
    return _loadMain.apply(this, arguments);
  }
  
  function _loadMain() {
    _loadMain = _asyncToGenerator(function* () {
      try {
        console.log('TryzubTV: Loading main catalog...');
        var linesMeta = yield fetchCatalogLines();
        console.log('TryzubTV: Lines meta received:', linesMeta.length);
        
        var ordered = sortCatalogLines(linesMeta);
        var hidden = getCatalogHidden();
        
        var isTvEnabled = Lampa && Lampa.Storage ? Lampa.Storage.get('tryzubtv_source_tv', true) : true;
        var isReplayEnabled = Lampa && Lampa.Storage ? Lampa.Storage.get('tryzubtv_source_replay', true) : true;
        
        var visible = ordered.filter(function (line) {
          if (hidden.includes(line.id)) return false;
          if (line.source === SOURCE_TV) return isTvEnabled;
          if (line.source === SOURCE_REPLAY) return isReplayEnabled;
          return true;
        });
        
        console.log('TryzubTV: Visible lines:', visible.length);
        
        var LineModule = Lampa && Lampa.Maker && Lampa.Maker.module ? Lampa.Maker.module('Line') : null;
        var lines = visible.map(function (meta, index) {
          return buildLineShell(meta, LineModule, index);
        });
        
        console.log('TryzubTV: Lines built:', lines.length);
        oncomplete(lines);
      } catch (error) {
        console.error('TryzubTV: Error in loadMain:', error);
        if (onerror) onerror(error);
        // Даже при ошибке показываем пустой список
        oncomplete([]);
      }
    });
    return _loadMain.apply(this, arguments);
  }
  
  function loadCategory$1(categorySlug, categoryTitle, oncomplete, onerror) {
    return _loadCategory$1.apply(this, arguments);
  }
  
  function _loadCategory$1() {
    _loadCategory$1 = _asyncToGenerator(function* (categorySlug, categoryTitle, oncomplete, onerror) {
      try {
        console.log('TryzubTV: Loading category:', categorySlug);
        var url = API_BASE + "/channels?category_slug=" + encodeURIComponent(categorySlug) + "&limit=100";
        console.log('TryzubTV: Category URL:', url);
        
        var response = yield request$2(url);
        console.log('TryzubTV: Category response received');
        
        var channels = response && response.data ? response.data : [];
        var total = response && response.meta && response.meta.total ? response.meta.total : channels.length;
        
        console.log('TryzubTV: Channels found:', channels.length);
        
        var title = translateCategoryName$1(categoryTitle || categorySlug || '');
        var lineTitle = total ? title + " · " + total : title;
        
        var items = channels
          .filter(isFreeChannel)
          .filter(function (channel) {
            return channel && channel.link;
          })
          .map(function (channel) {
            return mapChannelToCard(channel, {
              slug: categorySlug,
              name: title
            });
          })
          .filter(Boolean);
        
        console.log('TryzubTV: Mapped items:', items.length);
        
        oncomplete([{
          title: lineTitle,
          results: items,
          total_pages: 1,
          params: {
            tryzubtv_source: SOURCE_TV,
            tryzubtv_category: categorySlug || '',
            tryzubtv_category_title: title,
            tryzubtv_category_total: total
          }
        }]);
      } catch (error) {
        console.error('TryzubTV: Error loading category:', error);
        if (onerror) onerror(error);
        oncomplete([{
          title: translateCategoryName$1(categoryTitle || categorySlug || ''),
          results: [],
          total_pages: 1
        }]);
      }
    });
    return _loadCategory$1.apply(this, arguments);
  }
  
  function loadLineItems(lineData) {
    return _loadLineItems.apply(this, arguments);
  }
  
  function _loadLineItems() {
    _loadLineItems = _asyncToGenerator(function* (lineData) {
      try {
        var params = lineData && lineData.params || {};
        var source = params.tryzubtv_source;
        
        console.log('TryzubTV: Loading line items for source:', source);
        
        if (source === SOURCE_TV) {
          var slug = params.tryzubtv_category;
          if (!slug) {
            console.log('TryzubTV: No category slug for TV source');
            return { items: [], total: 0, total_pages: 1 };
          }
          
          var url = API_BASE + "/channels?category_slug=" + encodeURIComponent(slug) + "&limit=100";
          console.log('TryzubTV: TV line URL:', url);
          
          var response = yield request$2(url);
          var channels = response && response.data ? response.data : [];
          var total = response && response.meta && response.meta.total ? response.meta.total : channels.length;
          
          console.log('TryzubTV: TV channels found:', channels.length);
          
          var title = translateCategoryName$1(params.tryzubtv_category_raw || params.tryzubtv_category_title || '');
          
          var items = channels
            .filter(isFreeChannel)
            .filter(function (channel) {
              return channel && channel.link;
            })
            .map(function (channel) {
              return mapChannelToCard(channel, {
                slug: slug,
                name: title
              });
            })
            .filter(Boolean);
          
          console.log('TryzubTV: TV items mapped:', items.length);
          return { items: items, total: total, title: title };
          
        } else if (source === SOURCE_REPLAY) {
          var disciplineId = params.tryzubtv_replay_id;
          if (!disciplineId) {
            console.log('TryzubTV: No discipline ID for replay source');
            return { items: [], total: 0, total_pages: 1 };
          }
          
          var _url = REPLAY_BASE$1 + "/vod?filter={\"discipline\":" + disciplineId + "}&sort=-date&limit=" + (REPLAY_LIMIT + 1);
          console.log('TryzubTV: Replay line URL:', _url);
          
          var _response = yield request$2(_url);
          var vods = (_response && _response.data ? _response.data : []).filter(function (vod) {
            return vod && vod.link && !vod.link.includes('youtube');
          });
          
          console.log('TryzubTV: Replay vods found:', vods.length);
          
          var mapped = vods.map(mapReplayToCard).filter(Boolean);
          var hasMore = mapped.length > REPLAY_LIMIT;
          var _items = hasMore ? mapped.slice(0, REPLAY_LIMIT) : mapped;
          
          console.log('TryzubTV: Replay items mapped:', _items.length);
          return { items: _items, total: null, total_pages: hasMore ? 2 : 1 };
        }
        
        return { items: [], total: 0, total_pages: 1 };
      } catch (error) {
        console.error('TryzubTV: Error loading line items:', error);
        return { items: [], total: 0, total_pages: 1 };
      }
    });
    return _loadLineItems.apply(this, arguments);
  }
  
  var Api$1 = {
    loadMain: loadMain,
    loadCategory: loadCategory$1,
    loadLineItems: loadLineItems,
    fetchCategories: fetchCategories,
    fetchCatalogLines: fetchCatalogLines,
    sortCatalogLines: sortCatalogLines,
    getCatalogHidden: getCatalogHidden,
    getCatalogOrder: getCatalogOrder,
    buildQrCard: buildQrCard,
    API_BASE: API_BASE,
    SOURCE_TV: SOURCE_TV,
    SOURCE_REPLAY: SOURCE_REPLAY
  };

  // Упрощенный модуль Player для Tizen
  function request$1(url) {
    return request$2(url); // Используем ту же функцию запроса
  }
  
  function buildChannelEpgUrl(slug) {
    return API_BASE + "/channels/" + encodeURIComponent(slug) + "?expand=epg_items";
  }
  
  function toPlaylistItems(items, fallbackTitle) {
    return (items || []).filter(function (item) {
      return item && item.link;
    }).map(function (item) {
      return {
        title: item.name || fallbackTitle || '',
        url: item.link
      };
    });
  }
  
  function formatProgramTime(timestamp) {
    var date = new Date(timestamp * 1000);
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  function renderProgramList(container, items, position) {
    if (!container || !container[0]) return;
    
    container.empty();
    if (!items.length) {
      var empty = document.createElement('div');
      empty.classList.add('player-panel-iptv-item__prog-item');
      empty.innerHTML = "<span>" + (Lampa && Lampa.Lang ? Lampa.Lang.translate('tryzubtv_now_empty') : 'No EPG data') + "</span>";
      if (container[0]) container[0].append(empty);
      return;
    }
    
    var startIndex = Math.max(0, position || 0);
    var view = items.slice(startIndex, startIndex + 7);
    view.forEach(function (item, index) {
      var absoluteIndex = startIndex + index;
      var row = document.createElement('div');
      row.classList.add('player-panel-iptv-item__prog-item');
      if (absoluteIndex === position) row.classList.add('watch');
      var span = document.createElement('span');
      span.textContent = formatProgramTime(item.start) + " - " + formatProgramTime(item.finish) + "  " + item.name;
      row.append(span);
      if (container[0]) container[0].append(row);
    });
  }
  
  function getCurrentProgramIndex(items, currentItem) {
    if (!items.length) return 0;
    if (currentItem && currentItem.id) {
      var idx = items.findIndex(function (item) {
        return item.id === currentItem.id;
      });
      if (idx >= 0) return idx;
    }
    var now = Math.floor(Date.now() / 1000);
    var idxByTime = items.findIndex(function (item) {
      return item.start <= now && item.finish >= now;
    });
    return idxByTime >= 0 ? idxByTime : 0;
  }
  
  function fetchChannelEpg(slug) {
    var url = buildChannelEpgUrl(slug);
    return request$1(url).then(function (data) {
      return data && data.data ? data.data : null;
    });
  }
  
  function fetchCategoryChannels(categorySlug) {
    return _fetchCategoryChannels.apply(this, arguments);
  }
  
  function _fetchCategoryChannels() {
    _fetchCategoryChannels = _asyncToGenerator(function* (categorySlug) {
      try {
        var url = API_BASE + "/channels?category_slug=" + encodeURIComponent(categorySlug) + "&limit=100";
        var response = yield request$1(url);
        var channels = response && response.data ? response.data : [];
        return channels
          .filter(function (channel) {
            return channel && channel.package_block == null && channel.link;
          })
          .map(function (channel) {
            return {
              name: channel.name || '',
              slug: channel.slug || '',
              url: channel.link || '',
              logo: channel.icon_url || channel.icon_url_2 || '',
              epg_current: channel.epg_current || null
            };
          });
      } catch (error) {
        console.error('TryzubTV: Error fetching category channels:', error);
        return [];
      }
    });
    return _fetchCategoryChannels.apply(this, arguments);
  }
  
  function playIptvList(channels, startIndex, groupTitle) {
    var epgCache = {};
    var data = {
      title: channels[startIndex].name,
      url: channels[startIndex].url,
      total: channels.length,
      position: startIndex,
      onGetChannel: function onGetChannel(position) {
        var channel = channels[position];
        if (!channel) return null;
        var nowTitle = channel.epg_current && channel.epg_current.name ? channel.epg_current.name : channel.name;
        var selected = {
          name: nowTitle,
          group: channel.name || groupTitle,
          logo: channel.logo,
          url: channel.url,
          slug: channel.slug,
          epg_current: channel.epg_current
        };
        if (!selected.slug) return selected;
        var cached = epgCache[selected.slug];
        if (cached) {
          if (Lampa && Lampa.Player && Lampa.Player.programReady) {
            Lampa.Player.programReady({
              channel: selected,
              position: cached.position,
              total: cached.items.length
            });
          }
          return selected;
        }
        fetchChannelEpg(selected.slug).then(function (data) {
          var items = data && data.epg_items ? data.epg_items : [];
          var current = data && data.epg_current ? data.epg_current : null;
          var position = getCurrentProgramIndex(items, current);
          epgCache[selected.slug] = {
            items: items,
            position: position
          };
          if (Lampa && Lampa.Player && Lampa.Player.programReady) {
            Lampa.Player.programReady({
              channel: selected,
              position: position,
              total: items.length
            });
          }
        }).catch(function (error) {
          console.error('TryzubTV: channel epg load failed', error);
          epgCache[selected.slug] = {
            items: [],
            position: 0
          };
          if (Lampa && Lampa.Player && Lampa.Player.programReady) {
            Lampa.Player.programReady({
              channel: selected,
              position: 0,
              total: 0
            });
          }
        });
        return selected;
      },
      onGetProgram: function onGetProgram(selected, position, container) {
        if (!selected || !selected.slug) {
          renderProgramList(container, [], 0);
          return;
        }
        var cached = epgCache[selected.slug];
        if (cached) {
          var hasCachedPosition = typeof cached.position === 'number' && cached.position > 0;
          var usePosition = typeof position === 'number' && position > 0 ? position : hasCachedPosition ? cached.position : 0;
          renderProgramList(container, cached.items || [], usePosition);
          return;
        }
        renderProgramList(container, [], 0);
      },
      onPlaylistProgram: function onPlaylistProgram(selected, position) {
        if (!selected || !selected.slug) return;
        var cached = epgCache[selected.slug];
        if (cached) {
          if (Lampa && Lampa.Player && Lampa.Player.playlist) {
            Lampa.Player.playlist(toPlaylistItems(cached.items || [], selected.name));
          }
          return;
        }
        fetchChannelEpg(selected.slug).then(function (data) {
          var items = data && data.epg_items ? data.epg_items : [];
          var current = data && data.epg_current ? data.epg_current : null;
          var position = getCurrentProgramIndex(items, current);
          epgCache[selected.slug] = {
            items: items,
            position: position
          };
          if (Lampa && Lampa.Player && Lampa.Player.playlist) {
            Lampa.Player.playlist(toPlaylistItems(items, selected.name));
          }
        }).catch(function (error) {
          console.error('TryzubTV: playlist load failed', error);
          if (Lampa && Lampa.Noty && Lampa.Lang) {
            Lampa.Noty.show(Lampa.Lang.translate('tryzubtv_epg_failed'));
          }
        });
      }
    };
    
    if (Lampa && Lampa.Player && Lampa.Player.iptv) {
      Lampa.Player.iptv(data);
    } else {
      console.error('TryzubTV: Lampa.Player.iptv not available');
      // Fallback: просто запускаем видео
      if (Lampa && Lampa.Player && Lampa.Player.play) {
        Lampa.Player.play({
          title: data.title,
          url: data.url
        });
      }
    }
  }
  
  function playChannel(cardData) {
    if (!cardData || !cardData.tryzubtv_link) {
      if (Lampa && Lampa.Noty && Lampa.Lang) {
        Lampa.Noty.show(Lampa.Lang.translate('tryzubtv_no_link'));
      }
      return;
    }
    
    var title = cardData.title || '';
    var logo = cardData.tryzubtv_logo || '';
    var categorySlug = cardData.tryzubtv_category || '';
    var categoryTitle = cardData.tryzubtv_category_title || cardData.tryzubtv_category || 
                       (Lampa && Lampa.Lang ? Lampa.Lang.translate('tryzubtv_title') : 'TryzubTV');
    
    console.log('TryzubTV: Playing channel:', title, 'Category:', categorySlug);
    
    if (categorySlug) {
      if (Lampa && Lampa.Loading) Lampa.Loading.start();
      
      fetchCategoryChannels(categorySlug).then(function (channels) {
        if (Lampa && Lampa.Loading) Lampa.Loading.stop();
        
        console.log('TryzubTV: Category channels found:', channels.length);
        
        if (!channels.length) {
          playIptvList([{
            name: title,
            slug: cardData.tryzubtv_slug || '',
            url: cardData.tryzubtv_link,
            logo: logo,
            epg_current: cardData.tryzubtv_epg || null
          }], 0, categoryTitle);
          return;
        }
        
        var startIndex = Math.max(0, channels.findIndex(function (channel) {
          return channel.slug === cardData.tryzubtv_slug;
        }));
        
        console.log('TryzubTV: Starting channel index:', startIndex);
        playIptvList(channels, startIndex, categoryTitle);
      }).catch(function (error) {
        console.error('TryzubTV: category channels load failed', error);
        if (Lampa && Lampa.Loading) Lampa.Loading.stop();
        
        playIptvList([{
          name: title,
          slug: cardData.tryzubtv_slug || '',
          url: cardData.tryzubtv_link,
          logo: logo,
          epg_current: cardData.tryzubtv_epg || null
        }], 0, categoryTitle);
      });
    } else {
      playIptvList([{
        name: title,
        slug: cardData.tryzubtv_slug || '',
        url: cardData.tryzubtv_link,
        logo: logo,
        epg_current: cardData.tryzubtv_epg || null
      }], 0, categoryTitle);
    }
    
    // Загружаем EPG в фоне
    if (cardData.tryzubtv_slug) {
      fetchChannelEpg(cardData.tryzubtv_slug).then(function (data) {
        var items = data && data.epg_items ? data.epg_items : [];
        var playlist = toPlaylistItems(items, title);
        if (playlist.length && Lampa && Lampa.Player && Lampa.Player.playlist) {
          Lampa.Player.playlist(playlist);
        }
      }).catch(function (error) {
        console.error('TryzubTV: epg list load failed', error);
      });
    }
  }
  
  var Player = {
    playChannel: playChannel
  };

  // Упрощенный QR модуль
  var QR_URL = 'https://lampame.donatik.me';
  var QR_TEXT = "<a href=\"" + QR_URL + "\">Посілання</a>";
  var QR_BODY = 'Донат автору плагіну TryzubTV добровільний, на розвиток якого витрачено багато часу та сил.';
  var QR_CARD_POSTER = 'https://iili.io/fkdGkSj.png';
  
  function openQrModal() {
    var html = $('<div class="tryzubtv-qr-modal" style="display:flex;flex-direction:column;gap:1.2em;align-items:center;text-align:center;">' + 
      '<div class="account-modal-split__info" style="max-width:28em;">' + 
      '<div class="account-modal-split__text"><img src="' + QR_CARD_POSTER + '" class="tryzubtv-qr-modal__img" style="max-width:100%;height:auto;"><br />' + QR_BODY + '</div>' + 
      '</div>' + 
      '<div class="account-modal-split__qr">' + 
      '<div class="account-modal-split__qr-code" style="margin-bottom:0;width: 13em;height: 13em;background:#fff;padding:1em;box-sizing:border-box;">' +
      '<div style="color:#000;text-align:center;padding:3em 0;">QR код недоступний<br>на цьому пристрої</div>' +
      '</div>' + 
      '<div class="account-modal-split__qr-text">' + QR_TEXT + '</div>' + 
      '</div>' + 
      '</div>');
    
    var enabledController = Lampa && Lampa.Controller ? Lampa.Controller.enabled().name : '';
    
    if (Lampa && Lampa.Modal) {
      Lampa.Modal.open({
        title: '',
        html: html,
        size: 'medium',
        onBack: function onBack() {
          Lampa.Modal.close();
          if (Lampa && Lampa.Controller) {
            Lampa.Controller.toggle(enabledController);
          }
        }
      });
    }
  }

  // Упрощенный SocketManager для Tizen
  var SocketManager = function () {
    var instance;
    
    function createInstance() {
      var connect = function connect() {
        return new Promise(function (resolve, reject) {
          console.log('TryzubTV: SocketManager connecting...');
          // Для Tizen генерируем локальный ключ
          var key = 'tizen_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
          console.log('TryzubTV: Generated key for Tizen');
          resolve(key);
        });
      };
      
      var disconnect = function disconnect() {
        console.log('TryzubTV: SocketManager disconnected');
      };
      
      var listen = function listen() {
        console.log('TryzubTV: SocketManager listening');
        if (Lampa && Lampa.Player && Lampa.Player.listener) {
          Lampa.Player.listener.follow('destroy', function () {
            console.log('TryzubTV: Player destroyed');
            disconnect();
          });
        }
      };
      
      return {
        connect: connect,
        disconnect: disconnect,
        listen: listen
      };
    }
    
    return {
      getInstance: function getInstance() {
        if (!instance) instance = createInstance();
        return instance;
      }
    };
  }();

  // Основной компонент
  function appendReplayOverlay(cardItem, cardData) {
    try {
      if (!cardItem || !cardData) return;
      
      var cardElement = cardItem.render ? cardItem.render(true) : null;
      if (!cardElement) return;
      
      var $card = $(cardElement);
      var card_view = $card.find('.card__view');
      if (!card_view.length) return;
      
      var title = cardData.title || '';
      var desc = cardData.salo_description || cardData.description || '';
      var date = cardData.salo_release_date || cardData.release_date || '';
      if (!title && !desc && !date) return;
      
      $card.addClass('card--salopower');
      
      var overlay = '<div class="card__body card__body--salopower" style="position:absolute;left:0;top:0;width:100%;height:100%;display:flex;flex-direction:column;padding:1.2em 1.5em;background-image:linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.5) 40%, rgba(0,0,0,0) 100%);pointer-events:none;">' +
        '<div class="card__title" style="font-size:1.6em;font-weight:700;">' + title + '</div>' +
        '<div class="card__salopower-data" style="margin-top:auto;padding-top:1em;">' +
        '<div class="card__description" style="font-size:1.3em;color:rgba(255,255,255,0.7);-webkit-line-clamp:2;-webkit-box-orient:vertical;display:-webkit-box;overflow:hidden;text-overflow:ellipsis;">' + desc + '</div>' +
        '<div class="card__release-date" style="font-size:1.2em;color:rgba(255,255,255,0.5);margin-top:0.5em;">' + date + '</div>' +
        '</div>' +
        '</div>';
      
      card_view.append(overlay);
    } catch (e) {
      console.error('TryzubTV: replay card overlay error', e);
    }
  }
  
  function playReplay(cardData) {
    return _playReplay.apply(this, arguments);
  }
  
  function _playReplay() {
    _playReplay = _asyncToGenerator(function* (cardData) {
      if (!cardData || !cardData.salo_vod_id) {
        console.error('TryzubTV: No vod_id for replay');
        return;
      }
      
      if (Lampa && Lampa.Loading) Lampa.Loading.start();
      
      try {
        console.log('TryzubTV: Playing replay with ID:', cardData.salo_vod_id);
        
        // Для Tizen используем прямой URL
        var videoUrl = "https://vod-maincast.cosmonova-broadcast.tv/" + cardData.salo_vod_id + "/master.m3u8";
        console.log('TryzubTV: Video URL:', videoUrl);
        
        if (Lampa && Lampa.Player && Lampa.Player.play) {
          Lampa.Player.play({
            title: cardData.title || 'Replay',
            url: videoUrl
          });
        } else {
          console.error('TryzubTV: Lampa.Player.play not available');
        }
      } catch (error) {
        console.error('TryzubTV: replay playback failed', error);
        if (Lampa && Lampa.Noty) {
          Lampa.Noty.show('Не вдалося запустити відтворення.');
        }
      } finally {
        if (Lampa && Lampa.Loading) Lampa.Loading.stop();
      }
    });
    return _playReplay.apply(this, arguments);
  }
  
  function loadLineContent(lineItem, lineData) {
    if (!lineItem || !lineData || lineData.tryzubtv_loaded) return;
    lineData.tryzubtv_loaded = true;
    
    console.log('TryzubTV: Loading line content for:', lineData.title);
    
    Api$1.loadLineItems(lineData).then(function (payload) {
      var items = payload.items || [];
      var total = payload.total;
      var totalPages = payload.total_pages || (items.length ? 2 : 1);
      
      console.log('TryzubTV: Line items loaded:', items.length);
      
      lineData.results = items;
      lineData.total_pages = totalPages;
      
      if (typeof total === 'number' && total > 0 && lineData.params && lineData.params.tryzubtv_source === Api$1.SOURCE_TV) {
        var title = lineData.params.tryzubtv_category_title || lineData.title;
        var newTitle = title + " · " + total;
        lineData.title = newTitle;
        
        var titleNode = lineItem.render().find('.items-line__title');
        if (titleNode.length) titleNode.text(newTitle);
      }
      
      // Добавляем карточку доната только если есть элементы
      if (lineData.params && lineData.params.tryzubtv_line_index === 0 && !lineData.tryzubtv_qr_added && items.length > 0) {
        var donateEnabled = Lampa && Lampa.Storage ? Lampa.Storage.get('tryzubtv_donate_card', true) : true;
        if (donateEnabled) {
          lineData.results.unshift(Api$1.buildQrCard());
        }
        lineData.tryzubtv_qr_added = true;
      }
      
      var view = lineItem.params && lineItem.params.items ? lineItem.params.items.view : 7;
      var initial = lineData.results.slice(0, view);
      
      console.log('TryzubTV: Appending initial items:', initial.length);
      
      initial.forEach(function (element) {
        if (lineItem && typeof lineItem.emit === 'function') {
          lineItem.emit('createAndAppend', element);
        }
      });
    }).catch(function (error) {
      console.error('TryzubTV: line load failed', error);
      lineData.tryzubtv_loaded = false;
    });
  }
  
  function component$2(object) {
    if (!Lampa || !Lampa.Maker) {
      console.error('TryzubTV: Lampa.Maker not available');
      return null;
    }
    
    var comp = Lampa.Maker.make('Main', object);
    
    comp.use({
      onCreate: function onCreate() {
        var _this = this;
        
        console.log('TryzubTV: Main component onCreate');
        
        if (this.activity && this.activity.render) {
          this.activity.render().addClass('tryzubtv-activity');
        }
        
        if (this.activity && this.activity.loader) {
          this.activity.loader(true);
        }
        
        // Задержка для Tizen
        setTimeout(function() {
          Api$1.loadMain(function (lines) {
            console.log('TryzubTV: Main lines received:', lines ? lines.length : 0);
            
            if (_this.activity && _this.activity.loader) {
              _this.activity.loader(false);
            }
            
            if (lines && lines.length) {
              if (_this.build) {
                _this.build(lines);
              }
            } else {
              if (_this.empty) {
                _this.empty();
              }
            }
          }, function (error) {
            console.error('TryzubTV: Main load error:', error);
            
            if (_this.activity && _this.activity.loader) {
              _this.activity.loader(false);
            }
            
            if (_this.empty) {
              _this.empty();
            }
          });
        }, IS_TIZEN ? 500 : 0);
      },
      
      onBack: function onBack() {
        if (Lampa && Lampa.Activity) {
          Lampa.Activity.backward();
        }
      },
      
      onInstance: function onInstance(lineItem, lineData) {
        if (!lineItem || !lineData) return;
        
        var params = lineData.params || {};
        var lineIndex = typeof params.tryzubtv_line_index === 'number' ? params.tryzubtv_line_index : 0;
        var forceVisible = lineIndex < 4;
        lineData.tryzubtv_force_visible = forceVisible;
        
        lineItem.use({
          onVisible: function onVisible() {
            loadLineContent(lineItem, lineData);
          },
          
          onPush: function onPush(item) {
            if (lineData.tryzubtv_force_visible && item && typeof item.visible === 'function') {
              item.visible();
            }
          },
          
          onMore: function onMore() {
            var more = params.more || {};
            
            if (more.component === 'salopower_category' && more.disciplineId) {
              if (Lampa && Lampa.Activity) {
                Lampa.Activity.push({
                  url: '',
                  title: more.title || lineData.title || (Lampa.Lang ? Lampa.Lang.translate('tryzubtv_title') : 'TryzubTV'),
                  component: 'salopower_category',
                  disciplineId: more.disciplineId
                });
              }
              return;
            }
            
            if (!more.category_slug) return;
            
            if (Lampa && Lampa.Activity) {
              Lampa.Activity.push({
                url: '',
                title: more.title || lineData.title || (Lampa.Lang ? Lampa.Lang.translate('tryzubtv_title') : 'TryzubTV'),
                component: 'tryzubtv_category',
                category_slug: more.category_slug,
                category_title: more.title || lineData.title || '',
                params: {
                  empty: {
                    title: more.title || (Lampa.Lang ? Lampa.Lang.translate('tryzubtv_title') : 'TryzubTV'),
                    descr: Lampa.Lang ? Lampa.Lang.translate('tryzubtv_empty') : 'No channels available'
                  }
                }
              });
            }
          },
          
          onInstance: function onInstance(cardItem, cardData) {
            if (!cardItem || !cardData) return;
            
            cardItem.use({
              onCreate: function onCreate() {
                if (this.html && this.html.classList) {
                  this.html.classList.add('card--tryzubtv');
                }
                if (cardData && cardData.salo_vod_id) {
                  appendReplayOverlay(cardItem, cardData);
                }
              },
              
              onEnter: function onEnter() {
                if (cardData && cardData.tryzubtv_action === 'qr_modal') {
                  openQrModal();
                  return;
                }
                if (cardData && cardData.salo_vod_id) {
                  playReplay(cardData);
                  return;
                }
                Player.playChannel(cardData);
              },
              
              onMenu: function onMenu() {
                return false;
              }
            });
          }
        });
        
        if (forceVisible) {
          setTimeout(function () {
            loadLineContent(lineItem, lineData);
          }, IS_TIZEN ? 1000 : 0);
        }
      }
    });
    
    return comp;
  }

  // Компонент категории
  function component$1(object) {
    if (!Lampa || !Lampa.Maker) {
      console.error('TryzubTV: Lampa.Maker not available for category');
      return null;
    }
    
    var comp = Lampa.Maker.make('Category', object);
    
    comp.use({
      onCreate: function onCreate() {
        var _this = this;
        
        console.log('TryzubTV: Category component onCreate, slug:', object.category_slug);
        
        if (this.activity && this.activity.render) {
          this.activity.render().addClass('tryzubtv-activity');
        }
        
        if (this.activity && this.activity.loader) {
          this.activity.loader(true);
        }
        
        if (!object.category_slug) {
          console.error('TryzubTV: No category slug provided');
          if (this.activity && this.activity.loader) {
            this.activity.loader(false);
          }
          if (this.empty) {
            this.empty();
          }
          return;
        }
        
        // Задержка для Tizen
        setTimeout(function() {
          Api$1.loadCategory(object.category_slug, object.category_title, function (lines) {
            console.log('TryzubTV: Category lines received:', lines && lines[0] ? lines[0].results.length : 0);
            
            if (_this.activity && _this.activity.loader) {
              _this.activity.loader(false);
            }
            
            if (lines && lines[0] && lines[0].results && lines[0].results.length) {
              if (_this.build) {
                _this.build(lines);
              }
            } else {
              if (_this.empty) {
                _this.empty();
              }
            }
          }, function (error) {
            console.error('TryzubTV: Category load error:', error);
            
            if (_this.activity && _this.activity.loader) {
              _this.activity.loader(false);
            }
            
            if (_this.empty) {
              _this.empty();
            }
          });
        }, IS_TIZEN ? 500 : 0);
      },
      
      onBack: function onBack() {
        if (Lampa && Lampa.Activity) {
          Lampa.Activity.backward();
        }
      },
      
      onInstance: function onInstance(lineItem, lineData) {
        if (!lineItem) return;
        
        lineItem.use({
          onInstance: function onInstance(cardItem, cardData) {
            if (!cardItem || !cardData) return;
            
            cardItem.use({
              onCreate: function onCreate() {
                if (this.html && this.html.classList) {
                  this.html.classList.add('card--tryzubtv');
                }
              },
              
              onEnter: function onEnter() {
                Player.playChannel(cardData);
              },
              
              onMenu: function onMenu() {
                return false;
              }
            });
          }
        });
      }
    });
    
    return comp;
  }

  // Языковые настройки
  function lang() {
    if (!Lampa || !Lampa.Lang) {
      console.warn('TryzubTV: Lampa.Lang not available');
      return;
    }
    
    Lampa.Lang.add({
      tryzubtv_title: {
        en: 'TryzubTV',
        uk: 'TryzubTV'
      },
      tryzubtv_no_link: {
        en: 'No stream link',
        uk: 'Немає посилання на трансляцію'
      },
      tryzubtv_epg_failed: {
        en: 'Failed to load playlist',
        uk: 'Не вдалося завантажити плейліст'
      },
      tryzubtv_now: {
        en: 'Now',
        uk: 'Зараз'
      },
      tryzubtv_now_empty: {
        en: 'No EPG data',
        uk: 'Немає даних EPG'
      },
      tryzubtv_empty: {
        en: 'No channels available',
        uk: 'Немає доступних каналів'
      },
      tryzubtv_settings_donate: {
        en: 'Donate',
        uk: 'Донат'
      },
      tryzubtv_settings_catalog: {
        en: 'Catalog settings',
        uk: 'Налаштування каталогу'
      },
      tryzubtv_settings_source_tv: {
        en: 'TV channels',
        uk: 'ТВ Канали'
      },
      tryzubtv_settings_source_replay: {
        en: 'Sports replays',
        uk: 'Спортивні реплеї'
      },
      tryzubtv_settings_donate_card: {
        en: 'Donate card',
        uk: 'Картка доната'
      },
      tryzubtv_settings_donate_sad: {
        en: 'You made the developer sad',
        uk: 'Ви засмутили розробника'
      },
      tryzubtv_settings_source_required: {
        en: 'At least one source must stay enabled',
        uk: 'Мінімум одне джерело має бути увімкненим'
      },
      tryzubtv_more_videos: {
        en: 'All videos:',
        uk: 'Усі відео:'
      },
      tryzubtv_category_Movies: {
        en: 'Movies',
        uk: 'Фільми'
      },
      tryzubtv_category_Entertainment: {
        en: 'Entertainment',
        uk: 'Розваги'
      },
      tryzubtv_category_Series: {
        en: 'Series',
        uk: 'Серіали'
      },
      tryzubtv_category_Cognitive: {
        en: 'Cognitive',
        uk: 'Когнітивні'
      },
      tryzubtv_category_News: {
        en: 'News',
        uk: 'Новини'
      },
      tryzubtv_category_Music: {
        en: 'Music',
        uk: 'Музика'
      },
      tryzubtv_category_Sport: {
        en: 'Sport',
        uk: 'Спорт'
      },
      tryzubtv_category_Kids: {
        en: 'Kids',
        uk: 'Дитячі'
      }
    });
    
    console.log('TryzubTV: Language strings added');
  }

  // Настройки
  var SOURCE_TV_KEY = 'tryzubtv_source_tv';
  var SOURCE_REPLAY_KEY = 'tryzubtv_source_replay';
  var DONATE_CARD_KEY = 'tryzubtv_donate_card';
  
  function ensureAtLeastOne(enabledKey) {
    if (!Lampa || !Lampa.Storage || !Lampa.Noty || !Lampa.Settings) return;
    
    var tvEnabled = Lampa.Storage.get(SOURCE_TV_KEY, true);
    var replayEnabled = Lampa.Storage.get(SOURCE_REPLAY_KEY, true);
    if (!tvEnabled && !replayEnabled) {
      Lampa.Storage.set(enabledKey, true);
      Lampa.Noty.show(Lampa.Lang.translate('tryzubtv_settings_source_required'));
    }
    Lampa.Settings.update();
  }
  
  function initSettings() {
    if (!Lampa) {
      console.warn('TryzubTV: Lampa not available for settings');
      return;
    }
    
    var SettingsApi = Lampa.SettingsApi || Lampa.Settings;
    if (!SettingsApi || !SettingsApi.addComponent) {
      console.warn('TryzubTV: Settings API not available');
      return;
    }
    
    console.log('TryzubTV: Initializing settings');
    
    SettingsApi.addComponent({
      component: 'tryzubtv',
      name: Lampa.Lang ? Lampa.Lang.translate('tryzubtv_title') : 'TryzubTV',
      icon: '<svg viewBox="0 0 32 32" fill="#ffffff" xmlns="http://www.w3.org/2000/svg"><path d="M30.118 15l0.776-1.553c0.136-0.271 0.141-0.589 0.014-0.865-0.127-0.275-0.372-0.478-0.666-0.552L27 11.219V11c0-0.552-0.448-1-1-1h-2.586L22 8.586V7c0-0.308-0.142-0.599-0.385-0.788-0.243-0.19-0.561-0.258-0.858-0.183l-4 1c-0.241 0.061-0.451 0.208-0.589 0.416l-1.044 1.566-0.229-0.459c-0.144-0.288-0.417-0.488-0.734-0.54-0.315-0.049-0.64 0.054-0.868 0.28l-0.533 0.534L8.372 7.071C8.153 6.984 7.91 6.977 7.684 7.051l-3 1C4.16 8.226 3.877 8.792 4.052 9.316l0.726 2.177-1.224 0.612C3.214 12.275 3 12.621 3 13v1.382l-1.447 0.724c-0.494 0.247-0.694 0.848-0.447 1.342l1 2C2.275 18.786 2.621 19 3 19h4c0.265 0 0.52-0.105 0.707-0.293l0.833-0.833 2.19-0.73L13.586 20l-1.293 1.293c-0.076 0.076-0.139 0.164-0.187 0.26l-1 2c-0.192 0.385-0.117 0.85 0.187 1.154l1 1C12.48 25.895 12.735 26 13 26h1c0.265 0 0.52-0.105 0.707-0.293L16 24.414l0.293 0.293c0.227 0.227 0.548 0.329 0.867 0.28 0.317-0.052 0.59-0.252 0.734-0.54L18 24.236V25c0 0.379 0.214 0.725 0.553 0.894L20 26.618V27c0 0.347 0.18 0.668 0.474 0.851C20.635 27.95 20.818 28 21 28c0.153 0 0.306-0.035 0.447-0.105l4-2c0.193-0.097 0.351-0.254 0.447-0.448l1-2c0.192-0.385 0.117-0.85-0.187-1.154-0.303-0.304-0.769-0.379-1.154-0.187l-1.105 0.553-0.139-0.277 4.206-2.523c0.163-0.098 0.295-0.24 0.38-0.41L29.618 18H30c0.347 0 0.668-0.18 0.851-0.474 0.182-0.295 0.199-0.663 0.044-0.973L30.118 15zM28.105 14.553c-0.141 0.282-0.141 0.613 0 0.894l0.355 0.71c-0.149 0.096-0.273 0.23-0.355 0.395l-0.87 1.74-4.75 2.85c-0.448 0.269-0.613 0.837-0.38 1.305l1 2c0.054 0.107 0.124 0.2 0.207 0.279l-1.47 0.735c-0.096-0.149-0.23-0.273-0.395-0.355L20 24.382v-0.146l0.895-1.789c0.155-0.31 0.138-0.678-0.044-0.973C20.668 21.18 20.347 21 20 21h-2c-0.379 0-0.725 0.214-0.895 0.553l-0.379 0.759-0.019-0.019c-0.391-0.391-1.024-0.391-1.414 0L13.586 24h-0.172l-0.197-0.197 0.605-1.21 1.885-1.885c0.391-0.391 0.391-1.024 0-1.414l-4-4c-0.268-0.269-0.664-0.362-1.023-0.242l-3 1c-0.147 0.049-0.281 0.132-0.391 0.242L6.586 17H3.618l-0.276-0.553 1.105-0.553C4.786 15.725 5 15.379 5 15v-1.382l1.447-0.724c0.445-0.222 0.659-0.738 0.501-1.211L6.265 9.632 7.969 9.064l4.66 1.864c0.372 0.148 0.796 0.062 1.079-0.222l0.019-0.019 0.379 0.759c0.16 0.319 0.477 0.529 0.833 0.551 0.351 0.026 0.696-0.147 0.894-0.444l1.786-2.678L20 8.281V9c0 0.265 0.105 0.52 0.293 0.707l2 2C22.48 11.895 22.735 12 23 12h2c0 0.459 0.312 0.859 0.757 0.97l2.791 0.698L28.105 14.553z"/></svg>'
    });
    
    SettingsApi.addParam({
      component: 'tryzubtv',
      param: {
        name: 'tryzubtv_donate',
        type: 'button'
      },
      field: {
        name: Lampa.Lang ? Lampa.Lang.translate('tryzubtv_settings_donate') : 'Donate'
      },
      onChange: function onChange() {
        openQrModal();
      }
    });
    
    SettingsApi.addParam({
      component: 'tryzubtv',
      param: {
        name: DONATE_CARD_KEY,
        type: 'trigger',
        default: true
      },
      field: {
        name: Lampa.Lang ? Lampa.Lang.translate('tryzubtv_settings_donate_card') : 'Donate card'
      },
      onChange: function onChange() {
        var enabled = Lampa.Storage.get(DONATE_CARD_KEY, true);
        if (!enabled && Lampa.Noty && Lampa.Lang) {
          Lampa.Noty.show(Lampa.Lang.translate('tryzubtv_settings_donate_sad'));
        }
      }
    });
    
    SettingsApi.addParam({
      component: 'tryzubtv',
      param: {
        name: SOURCE_TV_KEY,
        type: 'trigger',
        default: true
      },
      field: {
        name: Lampa.Lang ? Lampa.Lang.translate('tryzubtv_settings_source_tv') : 'TV channels'
      },
      onChange: function onChange() {
        ensureAtLeastOne(SOURCE_TV_KEY);
      }
    });
    
    SettingsApi.addParam({
      component: 'tryzubtv',
      param: {
        name: SOURCE_REPLAY_KEY,
        type: 'trigger',
        default: true
      },
      field: {
        name: Lampa.Lang ? Lampa.Lang.translate('tryzubtv_settings_source_replay') : 'Sports replays'
      },
      onChange: function onChange() {
        ensureAtLeastOne(SOURCE_REPLAY_KEY);
      }
    });
    
    console.log('TryzubTV: Settings initialized');
  }

  // Упрощенный API для replay
  var REPLAY_BASE = IS_TIZEN
    ? 'https://corsproxy.io/?' + encodeURIComponent('https://a.maincast.tv/items')
    : 'https://p01--corsproxy--h7ynqrkjrc6c.code.run/https://a.maincast.tv/items';
  
  function request(url) {
    return request$2(url); // Используем ту же функцию
  }
  
  function mapVodToCard(vod) {
    try {
      if (!vod.link || !vod.link.startsWith('http')) return null;
      var url = new URL(vod.link);
      var v = url.searchParams.get('v');
      if (!v) return null;
      var description = vod.description || '';
      var release_date = vod.date ? new Date(vod.date).toLocaleDateString() : '';
      var cover = '';
      if (vod.cover) {
        cover = vod.cover.startsWith('http') ? vod.cover : "https://a.maincast.tv/assets/" + vod.cover;
      } else if (vod.cover_url) {
        cover = vod.cover_url;
      } else if (vod.poster) {
        cover = vod.poster.startsWith('http') ? vod.poster : "https://a.maincast.tv/assets/" + vod.poster;
      }
      return {
        title: vod.name,
        cover: cover,
        poster: cover,
        description: description,
        salo_description: description,
        salo_release_date: release_date,
        salo_vod_id: v,
        params: {
          style: {
            name: 'wide'
          }
        }
      };
    } catch (e) {
      console.error('TryzubTV: Error mapping vod to card:', e);
      return null;
    }
  }
  
  function loadCategory(disciplineId, oncomplete, onerror) {
    return _loadCategory.apply(this, arguments);
  }
  
  function _loadCategory() {
    _loadCategory = _asyncToGenerator(function* (disciplineId, oncomplete, onerror) {
      try {
        console.log('TryzubTV: Loading replay category:', disciplineId);
        var url = REPLAY_BASE + "/vod?filter={\"discipline\":" + disciplineId + "}&sort=-date&limit=100";
        var response = yield request(url);
        var vods = (response && response.data ? response.data : []).filter(function (vod) {
          return vod && vod.link && !vod.link.includes('youtube');
        });
        var items = vods.map(mapVodToCard).filter(Boolean);
        
        console.log('TryzubTV: Replay items loaded:', items.length);
        
        if (oncomplete) {
          oncomplete([{
            title: '',
            results: items,
            total_pages: 1,
            params: {
              salopower: true,
              disciplineId: disciplineId
            }
          }]);
        }
      } catch (error) {
        console.error("TryzubTV: Failed to load replay category " + disciplineId, error);
        if (onerror) onerror(error);
        if (oncomplete) {
          oncomplete([{
            title: '',
            results: [],
            total_pages: 1
          }]);
        }
      }
    });
    return _loadCategory.apply(this, arguments);
  }
  
  var Api = {
    loadCategory: loadCategory
  };

  // Компонент для replay
  function component(object) {
    if (!Lampa || !Lampa.Maker) {
      console.error('TryzubTV: Lampa.Maker not available for replay');
      return null;
    }
    
    var comp = Lampa.Maker.make('Category', object);
    
    comp.use({
      onCreate: function onCreate() {
        var _this = this;
        
        console.log('TryzubTV: Replay component onCreate, disciplineId:', object.disciplineId);
        
        if (this.activity && this.activity.loader) {
          this.activity.loader(true);
        }
        
        // Задержка для Tizen
        setTimeout(function() {
          Api.loadCategory(object.disciplineId, function (lines) {
            console.log('TryzubTV: Replay lines received:', lines && lines[0] ? lines[0].results.length : 0);
            
            if (_this.activity && _this.activity.loader) {
              _this.activity.loader(false);
            }
            
            if (_this.build) {
              _this.build(lines);
            }
          }, function() {
            console.log('TryzubTV: Replay load failed');
            
            if (_this.activity && _this.activity.loader) {
              _this.activity.loader(false);
            }
            
            if (_this.empty) {
              _this.empty();
            }
          });
        }, IS_TIZEN ? 500 : 0);
      },
      
      onInstance: function onInstance(line_item, line_data) {
        if (!line_item) return;
        
        line_item.use({
          onInstance: function onInstance(card_item, card_data) {
            if (!card_item || !card_data) return;
            
            card_item.use({
              onCreate: function onCreate() {
                try {
                  var cardElement = this.render ? this.render(true) : card_item.render ? card_item.render(true) : null;
                  if (!cardElement) return;
                  
                  var $card = $(cardElement);
                  var card_view = $card.find('.card__view');
                  if (!card_view.length || !card_data) return;
                  
                  var title = card_data.title || '';
                  var desc = card_data.salo_description || card_data.description || '';
                  var date = card_data.salo_release_date || card_data.release_date || '';
                  if (!title && !desc && !date) return;
                  
                  $card.addClass('card--salopower');
                  
                  var overlay = '<div class="card__body card__body--salopower" style="position:absolute;left:0;top:0;width:100%;height:100%;display:flex;flex-direction:column;padding:1.2em 1.5em;background-image:linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.5) 40%, rgba(0,0,0,0) 100%);pointer-events:none;">' +
                    '<div class="card__title" style="font-size:1.6em;font-weight:700;">' + title + '</div>' +
                    '<div class="card__salopower-data" style="margin-top:auto;padding-top:1em;">' +
                    '<div class="card__description" style="font-size:1.3em;color:rgba(255,255,255,0.7);-webkit-line-clamp:2;-webkit-box-orient:vertical;display:-webkit-box;overflow:hidden;text-overflow:ellipsis;">' + desc + '</div>' +
                    '<div class="card__release-date" style="font-size:1.2em;color:rgba(255,255,255,0.5);margin-top:0.5em;">' + date + '</div>' +
                    '</div>' +
                    '</div>';
                  
                  card_view.append(overlay);
                } catch (e) {
                  console.error('TryzubTV: replay card overlay create error', e);
                }
              },
              
              onEnter: function onEnter() {
                playReplay(card_data);
              }
            });
          }
        });
      }
    });
    
    return comp;
  }

  // Основная функция запуска плагина
  function startPlugin() {
    console.log('TryzubTV: Starting plugin, IS_TIZEN:', IS_TIZEN);
    
    try {
      window.tryzubtv_merged = true;
      if (Lampa && Lampa.Storage) {
        Lampa.Storage.set('tryzubtv_merged', true);
      }
      
      var manifest = {
        type: 'iptv',
        version: '1.5.1',
        name: 'TryzubTV',
        description: 'Ukrainian TV channels',
        component: 'tryzubtv_main'
      };
      
      if (Lampa && Lampa.Manifest) {
        Lampa.Manifest.plugins = manifest;
      }
      
      // Регистрируем компоненты
      if (Lampa && Lampa.Component) {
        Lampa.Component.add('tryzubtv_main', component$2);
        Lampa.Component.add('tryzubtv_category', component$1);
        Lampa.Component.add('salopower_category', component);
        console.log('TryzubTV: Components registered');
      }
      
      // Добавляем языковые строки
      lang();
      
      // Инициализируем настройки
      initSettings();
      
      // Добавляем стили
      var style = document.createElement('style');
      style.textContent = `
        .card--tryzubtv .card__img {
            object-fit: contain;
            object-position: center;
            background: transparent;
        }
        .card--tryzubtv.card--wide {
            width: 15em;
        }
        .card--tryzubtv .card__promo-title {
            font-size: 1em;
            line-height: 1.2;
            max-height: 2.4em;
            overflow: hidden;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            line-clamp: 2;
            -webkit-box-orient: vertical;
            text-overflow: ellipsis;
        }
        .card--tryzubtv .card__promo-text {
            display: none;
        }
        .card--tryzubtv.card--wide .card__title {
            display: none;
        }
        .card--tryzubtv .card__promo {
            overflow: hidden;
            padding: 2em 1em 1em 1em;
        }
        .tryzubtv-activity .items-line {
            padding-bottom: 1em;
        }
        .card--wide.card--salopower .card__view {
            position: relative;
        }
        .card--wide.card--salopower .card__body--salopower {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            padding: 1.2em 1.5em;
            background-image: linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.5) 40%, rgba(0,0,0,0) 100%);
            pointer-events: none;
        }
        .card--wide.card--salopower .card__promo {
            display: none;
        }
        .card--wide.card--salopower .card__body--salopower .card__title {
            font-size: 1.6em;
            font-weight: 700;
        }
        .card--wide.card--salopower .card__salopower-data {
            margin-top: auto;
            padding-top: 1em;
        }
        .card--salopower .card__description {
            font-size: 1.3em;
            color: rgba(255, 255, 255, 0.7);
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            display: -webkit-box;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .card--salopower .card__release-date {
            font-size: 1.2em;
            color: rgba(255, 255, 255, 0.5);
            margin-top: 0.5em;
        }
        .account-modal-split__text {
            margin-bottom: 0;
        }
        .account-modal-split__qr-text>a {
            text-decoration: none;
            color: #d8c39a;
        }
        .tryzubtv-test-message {
            position: fixed;
            top: 10px;
            right: 10px;
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 10px;
            border-radius: 5px;
            z-index: 9999;
            font-size: 12px;
            max-width: 300px;
        }
      `;
      
      document.head.appendChild(style);
      console.log('TryzubTV: Styles added');
      
      // Слушаем события сокета
      SocketManager.getInstance().listen();
      
      // Функция добавления в меню
      function addMenu() {
        console.log('TryzubTV: Adding menu item');
        
        var menuText = Lampa && Lampa.Lang ? Lampa.Lang.translate('tryzubtv_title') : 'TryzubTV';
        var button = $('<li class="menu__item selector">' +
          '<div class="menu__ico">' +
          '<svg viewBox="0 0 32 32" fill="#ffffff" xmlns="http://www.w3.org/2000/svg"><path d="M30.118 15l0.776-1.553c0.136-0.271 0.141-0.589 0.014-0.865-0.127-0.275-0.372-0.478-0.666-0.552L27 11.219V11c0-0.552-0.448-1-1-1h-2.586L22 8.586V7c0-0.308-0.142-0.599-0.385-0.788-0.243-0.19-0.561-0.258-0.858-0.183l-4 1c-0.241 0.061-0.451 0.208-0.589 0.416l-1.044 1.566-0.229-0.459c-0.144-0.288-0.417-0.488-0.734-0.54-0.315-0.049-0.64 0.054-0.868 0.28l-0.533 0.534L8.372 7.071C8.153 6.984 7.91 6.977 7.684 7.051l-3 1C4.16 8.226 3.877 8.792 4.052 9.316l0.726 2.177-1.224 0.612C3.214 12.275 3 12.621 3 13v1.382l-1.447 0.724c-0.494 0.247-0.694 0.848-0.447 1.342l1 2C2.275 18.786 2.621 19 3 19h4c0.265 0 0.52-0.105 0.707-0.293l0.833-0.833 2.19-0.73L13.586 20l-1.293 1.293c-0.076 0.076-0.139 0.164-0.187 0.26l-1 2c-0.192 0.385-0.117 0.85 0.187 1.154l1 1C12.48 25.895 12.735 26 13 26h1c0.265 0 0.52-0.105 0.707-0.293L16 24.414l0.293 0.293c0.227 0.227 0.548 0.329 0.867 0.28 0.317-0.052 0.59-0.252 0.734-0.54L18 24.236V25c0 0.379 0.214 0.725 0.553 0.894L20 26.618V27c0 0.347 0.18 0.668 0.474 0.851C20.635 27.95 20.818 28 21 28c0.153 0 0.306-0.035 0.447-0.105l4-2c0.193-0.097 0.351-0.254 0.447-0.448l1-2c0.192-0.385 0.117-0.85-0.187-1.154-0.303-0.304-0.769-0.379-1.154-0.187l-1.105 0.553-0.139-0.277 4.206-2.523c0.163-0.098 0.295-0.24 0.38-0.41L29.618 18H30c0.347 0 0.668-0.18 0.851-0.474 0.182-0.295 0.199-0.663 0.044-0.973L30.118 15zM28.105 14.553c-0.141 0.282-0.141 0.613 0 0.894l0.355 0.71c-0.149 0.096-0.273 0.23-0.355 0.395l-0.87 1.74-4.75 2.85c-0.448 0.269-0.613 0.837-0.38 1.305l1 2c0.054 0.107 0.124 0.2 0.207 0.279l-1.47 0.735c-0.096-0.149-0.23-0.273-0.395-0.355L20 24.382v-0.146l0.895-1.789c0.155-0.31 0.138-0.678-0.044-0.973C20.668 21.18 20.347 21 20 21h-2c-0.379 0-0.725 0.214-0.895 0.553l-0.379 0.759-0.019-0.019c-0.391-0.391-1.024-0.391-1.414 0L13.586 24h-0.172l-0.197-0.197 0.605-1.21 1.885-1.885c0.391-0.391 0.391-1.024 0-1.414l-4-4c-0.268-0.269-0.664-0.362-1.023-0.242l-3 1c-0.147 0.049-0.281 0.132-0.391 0.242L6.586 17H3.618l-0.276-0.553 1.105-0.553C4.786 15.725 5 15.379 5 15v-1.382l1.447-0.724c0.445-0.222 0.659-0.738 0.501-1.211L6.265 9.632 7.969 9.064l4.66 1.864c0.372 0.148 0.796 0.062 1.079-0.222l0.019-0.019 0.379 0.759c0.16 0.319 0.477 0.529 0.833 0.551 0.351 0.026 0.696-0.147 0.894-0.444l1.786-2.678L20 8.281V9c0 0.265 0.105 0.52 0.293 0.707l2 2C22.48 11.895 22.735 12 23 12h2c0 0.459 0.312 0.859 0.757 0.97l2.791 0.698L28.105 14.553z"/></svg>' +
          '</div>' +
          '<div class="menu__text">' + menuText + '</div>' +
          '</li>');
        
        button.on('hover:enter', function () {
          console.log('TryzubTV: Menu item clicked');
          
          var title = menuText + " | Спільнота t.me/mmssixxx";
          var emptyTitle = Lampa && Lampa.Lang ? Lampa.Lang.translate('tryzubtv_title') : 'TryzubTV';
          var emptyDescr = Lampa && Lampa.Lang ? Lampa.Lang.translate('tryzubtv_empty') : 'No channels available';
          
          if (Lampa && Lampa.Activity) {
            Lampa.Activity.push({
              url: '',
              title: title,
              component: 'tryzubtv_main',
              page: 1,
              params: {
                empty: {
                  title: emptyTitle,
                  descr: emptyDescr
                }
              }
            });
          }
        });
        
        var menuList = $('.menu .menu__list').eq(0);
        if (menuList.length) {
          menuList.append(button);
          console.log('TryzubTV: Menu item added successfully');
        } else {
          console.error('TryzubTV: Menu list not found');
          // Пробуем снова через секунду
          setTimeout(addMenu, 1000);
        }
      }
      
      // Добавляем тестовое сообщение для отладки
      if (IS_TIZEN) {
        var testMsg = $('<div class="tryzubtv-test-message">TryzubTV loaded<br>Platform: ' + (IS_TIZEN ? 'Tizen' : 'Other') + '</div>');
        $('body').append(testMsg);
        setTimeout(function() {
          testMsg.remove();
        }, 5000);
      }
      
      // Ждем готовности приложения
      if (window.appready) {
        console.log('TryzubTV: App already ready, adding menu');
        setTimeout(addMenu, 2000);
      } else if (Lampa && Lampa.Listener) {
        console.log('TryzubTV: Waiting for app ready');
        Lampa.Listener.follow('app', function (e) {
          if (e.type == 'ready') {
            console.log('TryzubTV: App ready event received');
            setTimeout(addMenu, 2000);
          }
        });
      } else {
        console.log('TryzubTV: No listener, trying direct menu add');
        setTimeout(addMenu, 3000);
      }
      
      console.log('TryzubTV: Plugin started successfully');
      
    } catch (error) {
      console.error('TryzubTV: Error starting plugin:', error);
    }
  }
  
  // Запуск плагина с задержкой для Tizen
  console.log('TryzubTV: Manifest check:', Lampa && Lampa.Manifest ? Lampa.Manifest.app_digital : 'no manifest');
  
  if (Lampa && Lampa.Manifest && Lampa.Manifest.app_digital >= 300) {
    console.log('TryzubTV: Starting plugin...');
    if (IS_TIZEN) {
      setTimeout(startPlugin, 3000);
    } else {
      setTimeout(startPlugin, 1000);
    }
  } else {
    console.error('TryzubTV: Lampa not available or version too old');
    // Пробуем все равно запуститься для совместимости
    setTimeout(function() {
      if (typeof Lampa !== 'undefined') {
        startPlugin();
      }
    }, 5000);
  }

  return startPlugin;

})();
