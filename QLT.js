//Оригінальний плагін https://github.com/FoxStudio24/lampa/blob/main/Quality/Quality.js
//SVG Quality Badges (Full card only) + settings + cache
//Працює при увімкненому парсері
//Логіка UA — як у UA-Finder+Mod: відрізаємо SUB та рахуємо ukr-доріжки
//Показуємо ЯКІСТЬ/АУДІО тільки для релізів з UA-доріжкою, іконка UA — в кінці
//Оновлено: використовує стиль відображення з torqUAcardify.js

(function () {
  'use strict';

  // =====================================================================
  // CONFIG
  // =====================================================================

  var pluginPath = 'https://raw.githubusercontent.com/ko31k/LMP/main/wwwroot/img/';

  // ✅ пробіли в назвах — %20
  // ❌ DUB прибрали
  var svgIcons = {
    '4K': pluginPath + '4K.svg',
    '2K': pluginPath + '2K.svg',
    'FULL HD': pluginPath + 'FULL%20HD.svg',
    'HD': pluginPath + 'HD.svg',
    'HDR': pluginPath + 'HDR.svg',
    'Dolby Vision': 'https://upload.wikimedia.org/wikipedia/commons/0/03/Dolby_Vision_2021_logo.svg',
    '7.1': pluginPath + '7.1.svg',
    '5.1': pluginPath + '5.1.svg',
    '4.0': pluginPath + '4.0.svg',
    '2.0': pluginPath + '2.0.svg',
    'UKR': 'https://yarikrazor-star.github.io/lmp/ua.svg'
  };

  // bump key to avoid broken user settings cache after changes
  var SETTINGS_KEY = 'svgq_user_settings_v7';
  var DISPLAY_STYLE_KEY = 'svgq_display_style';

  // SVGQ cache
  var CACHE_KEY = 'svgq_parser_cache_v2';
  var CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24h

  // Default settings
  var st = {
    placement: 'rate',        // "rate" | "under_rate" | "after_details"
    force_new_line: false,    // перенос у rate-line (актуально лише для "rate")
    badge_size: 2.0,          // em
    display_style: 'modern'   // "classic" або "modern" (як у torq)
  };

  var memCache = null;

  // =====================================================================
  // SAFE STORAGE
  // =====================================================================

  function lsGet(key, def) {
    try {
      var v = Lampa.Storage.get(key, def);
      return (typeof v === 'undefined') ? def : v;
    } catch (e) { return def; }
  }
  function lsSet(key, val) {
    try { Lampa.Storage.set(key, val); } catch (e) {}
  }

  // =====================================================================
  // SETTINGS: load/save/apply
  // =====================================================================

  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }

  function applyCssVars() {
    try {
      if (document && document.documentElement) {
        document.documentElement.style.setProperty('--svgq-badge-size', String(st.badge_size) + 'em');
      }
    } catch (e) {}
  }

  function loadSettings() {
    var s = lsGet(SETTINGS_KEY, {}) || {};

    st.placement = (s.placement === 'rate' || s.placement === 'under_rate' || s.placement === 'after_details')
      ? s.placement
      : 'rate';

    st.force_new_line = (typeof s.force_new_line === 'boolean') ? s.force_new_line : false;
    st.display_style = (s.display_style === 'classic' || s.display_style === 'modern') ? s.display_style : 'modern';

    if (typeof s.badge_size !== 'undefined') {
      var n = parseFloat(String(s.badge_size).replace(',', '.'));
      if (!isNaN(n) && isFinite(n)) st.badge_size = clamp(n, 0.6, 4.0);
    }

    applyCssVars();
  }

  function saveSettings() {
    lsSet(SETTINGS_KEY, st);
    applyCssVars();
    toast('Збережено');
  }

  function toast(msg) {
    try {
      if (Lampa && typeof Lampa.Noty === 'function') { Lampa.Noty(msg); return; }
      if (Lampa && Lampa.Noty && Lampa.Noty.show) { Lampa.Noty.show(msg); return; }
    } catch (e) {}

    var id = 'svgq_toast';
    var el = document.getElementById(id);
    if (!el) {
      el = document.createElement('div');
      el.id = id;
      el.style.cssText =
        'position:fixed;left:50%;transform:translateX(-50%);bottom:2rem;' +
        'padding:.6rem 1rem;background:rgba(0,0,0,.85);color:#fff;border-radius:.5rem;' +
        'z-index:9999;font-size:14px;transition:opacity .2s;opacity:0';
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.style.opacity = '1';
    setTimeout(function () { el.style.opacity = '0'; }, 1200);
  }

  // =====================================================================
  // SVGQ CACHE
  // =====================================================================

  function getCacheObj() {
    if (memCache) return memCache;
    memCache = lsGet(CACHE_KEY, {}) || {};
    return memCache;
  }

  function makeCacheKey(movie) {
    var id = movie && movie.id ? String(movie.id) : '';
    var year = '';
    var rd = movie && (movie.release_date || movie.first_air_date);
    if (rd && String(rd).length >= 4) year = String(rd).slice(0, 4);
    var t = (movie.title || movie.name || movie.original_title || movie.original_name || '').toString().toLowerCase();
    return id + '|' + year + '|' + t;
  }

  function cacheGet(movie) {
    var key = makeCacheKey(movie);
    var c = getCacheObj();
    var it = c[key];
    if (!it || !it.t || typeof it.v === 'undefined') return null;
    if (Date.now() - it.t > CACHE_TTL_MS) return null;
    return it.v;
  }

  function cacheSet(movie, value) {
    var key = makeCacheKey(movie);
    var c = getCacheObj();
    c[key] = { t: Date.now(), v: value };
    memCache = c;
    lsSet(CACHE_KEY, c);
  }

  function cacheClear() {
    memCache = {};
    lsSet(CACHE_KEY, {});
    toast('Кеш очищено');
  }

  // =====================================================================
  // UA-Finder-like UA track detection (ignore subtitles)
  // =====================================================================

  // Як у UA-Finder+Mod: обрізаємо по "sub", потім NxUkr, потім ukr
  function countUkrainianTracks(title) {
    if (!title) return 0;
    var cleanTitle = String(title).toLowerCase();

    // ігнор сабів: беремо тільки ДО "sub"
    var subsIndex = cleanTitle.indexOf('sub');
    if (subsIndex !== -1) cleanTitle = cleanTitle.substring(0, subsIndex);

    // 3xUkr / 2xUkr ...
    var multi = cleanTitle.match(/(\d+)x\s*ukr/);
    if (multi && multi[1]) return parseInt(multi[1], 10) || 0;

    // одиночні ukr
    var singles = cleanTitle.match(/\bukr\b/g);
    if (singles) return singles.length;

    return 0;
  }

  // =====================================================================
  // Helpers: movie/tv + year filter (щоб не мішало)
  // =====================================================================

  function getCardType(cardData) {
    var type = cardData && (cardData.media_type || cardData.type);
    if (type === 'movie' || type === 'tv') return type;
    return (cardData && (cardData.name || cardData.original_name)) ? 'tv' : 'movie';
  }

  function extractYearFromTitle(title) {
    if (!title) return 0;
    var regex = /(?:^|[^\d])(\d{4})(?:[^\d]|$)/g;
    var match, lastYear = 0;
    var currentYear = new Date().getFullYear();
    while ((match = regex.exec(title)) !== null) {
      var y = parseInt(match[1], 10);
      if (y >= 1900 && y <= currentYear + 1) lastYear = y;
    }
    return lastYear;
  }

  function getMovieYear(movie) {
    var rd = movie && (movie.release_date || movie.first_air_date);
    if (rd && String(rd).length >= 4) {
      var y = parseInt(String(rd).slice(0, 4), 10);
      return isNaN(y) ? 0 : y;
    }
    return 0;
  }

  function isSeriesTorrentTitle(tl) {
    return /(сезон|season|s\d{1,2}|серии|серії|episodes|епізод|\d{1,2}\s*из\s*\d{1,2}|\d+×\d+)/i.test(tl);
  }

  // =====================================================================
  // getBest() – only among torrents with UA tracks
  // =====================================================================

  function detectAudioFromTitle(tl) {
    if (!tl) return null;
    if (/\b7[\.\s]?1\b|\b8ch\b|\b8\s*ch\b/i.test(tl)) return '7.1';
    if (/\b5[\.\s]?1\b|\b6ch\b|\b6\s*ch\b/i.test(tl)) return '5.1';
    if (/\b4[\.\s]?0\b|\b4ch\b|\b4\s*ch\b/i.test(tl)) return '4.0';
    if (/\b2[\.\s]?0\b|\b2ch\b|\b2\s*ch\b/i.test(tl)) return '2.0';
    return null;
  }

  // Повертає або null (UA не знайдено), або best-обʼєкт
  function getBest(results, movie) {
    var cardType = getCardType(movie);
    var cardYear = getMovieYear(movie);

    var best = {
      resolution: null,
      hdr: false,
      dolbyVision: false,
      audio: null,
      ua: false,
      ua_tracks: 0
    };

    var resOrder = ['HD', 'FULL HD', '2K', '4K'];
    var audioOrder = ['2.0', '4.0', '5.1', '7.1'];

    var limit = Math.min(results.length, 50);

    for (var i = 0; i < limit; i++) {
      var item = results[i];
      var title = (item.Title || item.title || item.name || '').toString();
      if (!title) continue;

      var tl = title.toLowerCase();

      // ФІЛЬТР movie/tv
      var seriesLike = isSeriesTorrentTitle(tl);
      if (cardType === 'tv' && !seriesLike) continue;
      if (cardType === 'movie' && seriesLike) continue;

      // ФІЛЬТР за роком (якщо рік реально знайдено)
      if (cardYear > 1900) {
        var y = extractYearFromTitle(title) || parseInt(item.relased || item.released || 0, 10) || 0;
        if (y > 1900 && y !== cardYear) continue;
      }

      // UA TRACKS (UA-Finder style)
      var uaCount = countUkrainianTracks(title);
      if (!uaCount || uaCount <= 0) continue;

      best.ua = true;
      if (uaCount > best.ua_tracks) best.ua_tracks = uaCount;

      // Resolution (title)
      var foundRes = null;
      if (tl.indexOf('4k') >= 0 || tl.indexOf('2160') >= 0 || tl.indexOf('uhd') >= 0) foundRes = '4K';
      else if (tl.indexOf('2k') >= 0 || tl.indexOf('1440') >= 0) foundRes = '2K';
      else if (tl.indexOf('1080') >= 0 || tl.indexOf('fhd') >= 0 || tl.indexOf('full hd') >= 0) foundRes = 'FULL HD';
      else if (tl.indexOf('720') >= 0 || /\bhd\b/.test(tl)) foundRes = 'HD';

      if (foundRes && (!best.resolution || resOrder.indexOf(foundRes) > resOrder.indexOf(best.resolution))) {
        best.resolution = foundRes;
      }

      // HDR/DV (title)
      if (tl.indexOf('dolby vision') >= 0 || tl.indexOf('dovi') >= 0) best.dolbyVision = true;
      if (tl.indexOf('hdr') >= 0) best.hdr = true;

      // Audio channels (prefer ffprobe)
      if (item.ffprobe && Array.isArray(item.ffprobe)) {
        for (var k = 0; k < item.ffprobe.length; k++) {
          var stream = item.ffprobe[k];
          if (!stream) continue;

          if (stream.codec_type === 'video') {
            var h = parseInt(stream.height || 0, 10);
            var w = parseInt(stream.width || 0, 10);
            var res = null;

            if (h >= 2160 || w >= 3840) res = '4K';
            else if (h >= 1440 || w >= 2560) res = '2K';
            else if (h >= 1080 || w >= 1920) res = 'FULL HD';
            else if (h >= 720 || w >= 1280) res = 'HD';

            if (res && (!best.resolution || resOrder.indexOf(res) > resOrder.indexOf(best.resolution))) best.resolution = res;

            try {
              if (stream.side_data_list && JSON.stringify(stream.side_data_list).indexOf('Vision') >= 0) best.dolbyVision = true;
              if (stream.color_transfer === 'smpte2084' || stream.color_transfer === 'arib-std-b67') best.hdr = true;
            } catch (e) {}
          }

          if (stream.codec_type === 'audio') {
            var ch = parseInt(stream.channels || 0, 10);
            if (ch) {
              var aud = (ch >= 8) ? '7.1' : (ch >= 6) ? '5.1' : (ch >= 4) ? '4.0' : '2.0';
              if (!best.audio || audioOrder.indexOf(aud) > audioOrder.indexOf(best.audio)) best.audio = aud;
            }
          }
        }
      } else {
        // fallback (title)
        var a = detectAudioFromTitle(tl);
        if (a && (!best.audio || audioOrder.indexOf(a) > audioOrder.indexOf(best.audio))) best.audio = a;
      }
    }

    if (best.dolbyVision) best.hdr = true;

    // якщо UA не знайдено — нічого не показуємо
    return best.ua ? best : null;
  }

  // =====================================================================
  // Rendering - Оновлено в стилі torqUAcardify.js
  // =====================================================================

  function createBadgeImg(type, index) {
    var iconPath = svgIcons[type];
    if (!iconPath) return '';
    var delay = (index * 0.08) + 's';
    
    // Для Dolby Vision додаємо спеціальний клас
    var extraClass = (type === 'Dolby Vision') ? 'qb-dv' : (type === 'HDR') ? 'qb-hdr' : '';
    var typeClass = type.toLowerCase().replace(/\s+/g, '-');
    
    return (
      '<div class="quality-badge ' + extraClass + ' qb-type-' + typeClass + '" style="animation-delay:' + delay + '">' +
        '<img src="' + iconPath + '" class="qb-prefix-icon" draggable="false" oncontextmenu="return false;">' +
        (type !== 'Dolby Vision' && type !== 'HDR' && type !== 'UKR' ? '<span class="qb-text">' + type + '</span>' : '') +
      '</div>'
    );
  }

  // Альтернативний рендеринг в стилі torq (з текстом всередині)
  function createTorqStyleBadge(type, value, index) {
    var iconPath = svgIcons[type];
    if (!iconPath) return '';
    var delay = (index * 0.08) + 's';
    
    // Для UKR використовуємо спеціальний текстовий значок як в torq
    if (type === 'UKR') {
      return (
        '<div class="quality-badge" style="animation-delay:' + delay + '">' +
          '<span class="qb-text-icon">UA</span>' +
        '</div>'
      );
    }
    
    // Для Dolby Vision та HDR без тексту
    if (type === 'Dolby Vision' || type === 'HDR') {
      var filterStyle = (type === 'Dolby Vision') ? 'filter: brightness(0) invert(1);' : 'filter: grayscale(1);';
      return (
        '<div class="quality-badge" style="animation-delay:' + delay + '">' +
          '<img src="' + iconPath + '" class="qb-prefix-icon" style="' + filterStyle + '" draggable="false" oncontextmenu="return false;">' +
        '</div>'
      );
    }
    
    // Для інших - іконка + текст
    return (
      '<div class="quality-badge" style="animation-delay:' + delay + '">' +
        '<img src="' + iconPath + '" class="qb-prefix-icon" draggable="false" oncontextmenu="return false;">' +
        '<span class="qb-text">' + value + '</span>' +
      '</div>'
    );
  }

  function buildBadgesHtml(best) {
    if (!best || !best.ua) return '';

    var badges = [];

    if (st.display_style === 'modern') {
      // Сучасний стиль (як у torqUAcardify.js)
      
      // Якість
      if (best.resolution) {
        badges.push(createTorqStyleBadge(best.resolution, best.resolution, badges.length));
      }
      
      // HDR/DV
      if (best.hdr) {
        badges.push(createTorqStyleBadge('HDR', '', badges.length));
      }
      if (best.dolbyVision) {
        badges.push(createTorqStyleBadge('Dolby Vision', '', badges.length));
      }
      
      // Аудіо
      if (best.audio) {
        badges.push(createTorqStyleBadge(best.audio, best.audio, badges.length));
      }
      
      // UKR в кінці (текстовий значок)
      badges.push(createTorqStyleBadge('UKR', '', badges.length));
      
    } else {
      // Класичний стиль (оригінальний SVG)
      
      // якість/аудіо — тільки серед релізів з UA
      if (best.resolution) badges.push(createBadgeImg(best.resolution, badges.length));
      if (best.hdr) badges.push(createBadgeImg('HDR', badges.length));
      if (best.dolbyVision) badges.push(createBadgeImg('Dolby Vision', badges.length));
      if (best.audio) badges.push(createBadgeImg(best.audio, badges.length));
      
      // UA іконка в кінці
      badges.push(createBadgeImg('UKR', badges.length));
    }

    return badges.join('');
  }

  function ensureContainer(renderRoot) {
    $('.quality-badges-container, .quality-badges-under-rate, .quality-badges-after-details', renderRoot).remove();

    // маркер режиму розміщення (для умовного CSS)
    renderRoot
      .removeClass('svgq-place-rate svgq-place-under svgq-place-after')
      .addClass(
        st.placement === 'under_rate' ? 'svgq-place-under' :
        st.placement === 'after_details' ? 'svgq-place-after' :
        'svgq-place-rate'
      );

    var rateLine = $('.full-start-new__rate-line, .full-start__rate-line', renderRoot).first();
    var details = $('.full-start-new__details, .full-start__details', renderRoot).first();

    if (st.placement === 'rate') {
      if (!rateLine.length) return null;
      var cls = 'quality-badges-container' + (st.force_new_line ? ' svgq-force-new-row' : '');
      var el = $('<div class="' + cls + '"></div>');
      rateLine.append(el);
      return el;
    }

    if (st.placement === 'under_rate') {
      if (!rateLine.length) return null;
      var elU = $('<div class="quality-badges-under-rate"></div>');
      rateLine.after(elU);
      return elU;
    }

    if (st.placement === 'after_details') {
      if (!details.length) return null;
      var elA = $('<div class="quality-badges-after-details"></div>');
      details.after(elA);
      return elA;
    }

    return null;
  }

  function applyBadgesToFullCard(movie, renderRoot) {
    if (!movie || !renderRoot) return;

    if (!Lampa || !Lampa.Storage || !Lampa.Storage.field || !Lampa.Storage.field('parser_use')) return;

    var container = ensureContainer(renderRoot);
    if (!container) return;

    var cached = cacheGet(movie);
    if (cached && typeof cached === 'string') {
      container.html(cached);
      return;
    }

    container.html('');

    Lampa.Parser.get(
      { search: movie.title || movie.name, movie: movie, page: 1 },
      function (response) {
        if (!response || !response.Results) return;

        var best = getBest(response.Results, movie);
        var html = buildBadgesHtml(best);

        cacheSet(movie, html || '');
        container.html(html);
      }
    );
  }

  // =====================================================================
  // Styles - Оновлено з додаванням стилів з torqUAcardify.js
  // =====================================================================

  var style = '<style id="svgq_styles">\
    /* Завжди ховаємо текстову мітку Quality+Mod (LQE) у full card */\
    .full-start__status.lqe-quality{ display:none !important; }\
    \
    /* CSS var: розмір міток (міняється з меню) */\
    :root{ --svgq-badge-size: 2.0em; }\
    \
    /* 1) В рядку рейтингів (rate-line) */\
    .quality-badges-container{\
      display:inline-flex;\
      flex-wrap:wrap;\
      align-items:center;\
      column-gap:0.32em;\
      row-gap:0.24em;\
      margin:0.20em 0 0 0.48em;\
      min-height:1.2em;\
      pointer-events:none;\
      vertical-align:middle;\
      max-width:100%;\
    }\
    .svgq-place-rate .full-start-new__rate-line,\
    .svgq-place-rate .full-start__rate-line{\
      display:flex;\
      align-items:center;\
    }\
    \
    /* наш контейнер в рядку рейтингів — як .full-start__rate .source--name */\
    .svgq-place-rate .quality-badges-container{\
      display:inline-flex;\
      align-items:center;\
      justify-content:flex-start;\
      line-height:1;\
      vertical-align:middle;\
    }\
    \
    /* кожен бейдж — теж inline-flex, як award/source wrappers */\
    .svgq-place-rate .quality-badge{\
      display:inline-flex;\
      align-items:center;\
      justify-content:center;\
      line-height:1;\
      flex-shrink:0;\
    }\
    \
    /* img */\
    .svgq-place-rate .quality-badge img{\
      object-fit:contain;\
    }\
    \
    .quality-badges-container.svgq-force-new-row{\
      flex-basis:100%;\
      width:100%;\
      display:flex;\
      margin-left:0;\
      margin-top:0.28em;\
    }\
    .svgq-place-under .full-start-new__rate-line,\
    .svgq-place-under .full-start__rate-line{\
      margin-bottom:0.50em !important;\
    }\
    \
    /* 2) Під рядком рейтингів (FIX накладання з details у деяких темах) */\
    .quality-badges-under-rate{\
      display:flex;\
      flex-wrap:wrap;\
      align-items:center;\
      column-gap:0.32em;\
      row-gap:0.24em;\
      width:100%;\
      margin:0.40em 0 1.8em 0; /* ✅ TOP | LEFT/RIGHT | BOTTOM */\
      min-height:1.2em;\
      pointer-events:none;\
      max-width:100%;\
      position:relative;\
      z-index:2;\
    }\
    /* ✅ ключовий фікс: якщо details має негативний margin-top у темі — прибираємо його ТІЛЬКИ після нашого рядка */\
    .quality-badges-under-rate + .full-start-new__details,\
    .quality-badges-under-rate + .full-start__details{\
      margin-top:0 !important;\
    }\
    \
    /* 3) Після додаткової інформації (details) */\
    .quality-badges-after-details{\
      display:flex;\
      flex-wrap:wrap;\
      align-items:center;\
      column-gap:0.32em;\
      row-gap:0.24em;\
      margin:0.03em 0 1.9em 0;\
      min-height:1.2em;\
      pointer-events:none;\
      max-width:100%;\
    }\
    \
    /* 4) Badge shell — БЕЗ рамок, БЕЗ фону */\
    .quality-badge{\
      height:var(--svgq-badge-size);\
      display:inline-flex;\
      align-items:center;\
      justify-content:center;\
      padding:0;\
      background:none;\
      box-shadow:none;\
      border:none;\
      border-radius:0;\
      box-sizing:border-box;\
      opacity:0;\
      transform:translateY(8px);\
      animation:qb_in 0.38s ease forwards;\
    }\
    @keyframes qb_in{ to{ opacity:1; transform:translateY(0);} }\
    .quality-badge img{\
      height:100%;\
      width:auto;\
      display:block;\
      filter:drop-shadow(0 1px 2px rgba(0,0,0,0.85));\
    }\
    \
    /* ========== СТИЛІ З torqUAcardify.js ========== */\
    .qb-unified-block { \
        display: flex; \
        flex-wrap: nowrap; \
        align-items: center; \
        gap: 0.45em; \
    }\
    .quality-badge { \
      display: inline-flex; \
      align-items: center; \
      gap: 0.35em; \
      color: #fff; \
      white-space: nowrap; \
      flex-shrink: 0; \
      height: var(--svgq-badge-size); \
    }\
    .qb-text { \
      font-weight: bold; \
      line-height: 1.1em; \
      height: 1.1em; \
      display: flex; \
      align-items: center; \
      font-size: 0.85em; \
    }\
    .qb-prefix-icon { \
        height: var(--svgq-badge-size) !important; \
        width: auto; \
        display: block; \
        object-fit: contain; \
        margin: 0; \
    }\
    .qb-text-icon { \
        height: var(--svgq-badge-size) !important; \
        line-height: var(--svgq-badge-size) !important; \
        font-size: 0.85em !important; \
        font-weight: 900; \
        display: inline-flex; \
        align-items: center; \
        justify-content: center; \
        background: #fff; \
        color: #000; \
        padding: 0 0.25em; \
        border-radius: 2px; \
        box-sizing: border-box; \
        vertical-align: top; \
    }\
    .qb-dv img, .qb-type-dolby-vision img { \
        filter: brightness(0) invert(1) !important; \
    }\
    .qb-hdr img, .qb-type-hdr img { \
        filter: grayscale(1) !important; \
    }\
    .qb-not-found { opacity: 0.6; }\
    \
    @media (max-width:768px){\
      .quality-badges-container{\
        column-gap:0.26em;\
        row-gap:0.18em;\
        margin-left:0.38em;\
        margin-top:0.18em;\
      }\
      .quality-badges-container.svgq-force-new-row{\
        margin-top:0.24em;\
      }\
      .quality-badges-under-rate{\
        column-gap:0.26em;\
        row-gap:0.18em;\
        margin:0.24em 0 0.95em 0;\
      }\
      .quality-badges-after-details{\
        column-gap:0.26em;\
        row-gap:0.18em;\
        margin:0.34em 0 0.78em 0;\
      }\
    }\
  </style>';

  function injectStyleOnce() {
    if (document.getElementById('svgq_styles')) return;
    $('body').append(style);
    applyCssVars();
  }

  // =====================================================================
  // Settings UI (NO crash) + Clear cache + Display style option
  // =====================================================================

  function registerSettingsUIOnce() {
    if (window.__svgq_settings_registered) return;
    window.__svgq_settings_registered = true;

    Lampa.Template.add('settings_svgq', '<div></div>');

    // Головний пункт в Interface
    Lampa.SettingsApi.addParam({
      component: 'interface',
      param: { type: 'button', component: 'svgq' },
      field: {
        name: 'Мітки якості в повній картці',
        description: 'SVG бейджі якості у full card (працює з парсером)'
      },
      onChange: function () {
        Lampa.Settings.create('svgq', {
          template: 'settings_svgq',
          onBack: function () { Lampa.Settings.create('interface'); }
        });
      }
    });

    // Розміщення міток
    Lampa.SettingsApi.addParam({
      component: 'svgq',
      param: {
        name: 'svgq_placement',
        type: 'select',
        values: {
          rate: 'Показувати в рядку рейтингів',
          under_rate: 'Показувати під рядком рейтингів',
          after_details: 'Показувати після додаткової інформації'
        },
        default: st.placement
      },
      field: { name: 'Розміщення міток' },
      onChange: function (v) { st.placement = String(v); saveSettings(); }
    });

    // Стиль відображення (НОВИЙ ПУНКТ)
    Lampa.SettingsApi.addParam({
      component: 'svgq',
      param: {
        name: 'svgq_display_style',
        type: 'select',
        values: {
          modern: 'Сучасний (як у torqUAcardify)',
          classic: 'Класичний (оригінальний SVG)'
        },
        default: st.display_style
      },
      field: { name: 'Стиль відображення', description: 'Виберіть стиль значків' },
      onChange: function (v) { 
        st.display_style = String(v); 
        saveSettings(); 
        // Перезавантажити поточну картку для застосування стилю
        setTimeout(function() {
          if (Lampa && Lampa.Activity && Lampa.Activity.current()) {
            Lampa.Activity.current().reload();
          }
        }, 100);
      }
    });

    // Переносити мітки на новий рядок (актуально для "в рядку рейтингів")
    Lampa.SettingsApi.addParam({
      component: 'svgq',
      param: {
        name: 'svgq_force_new_line',
        type: 'select',
        values: { 'false': 'Ні', 'true': 'Так' },
        default: String(!!st.force_new_line)
      },
      field: { name: 'Переносити мітки на новий рядок в рядку рейтингів' },
      onChange: function (v) { st.force_new_line = (String(v) === 'true'); saveSettings(); }
    });

    // ✅ Розмір міток (як у rtg.js: input + values:'') — це прибирає твій краш в налаштуваннях
    Lampa.SettingsApi.addParam({
      component: 'svgq',
      param: {
        name: 'svgq_badge_size',
        type: 'input',
        values: '',                 // <-- ВАЖЛИВО (інакше в деяких збірках валиться Settings update)
        default: String(st.badge_size)
      },
      field: { name: 'Розмір міток (em)', description: 'Напр.: 2.0 або 1.4 (це буде em)' },
      onChange: function (v) {
        var n = parseFloat(String(v).replace(',', '.'));
        if (isNaN(n) || !isFinite(n)) { toast('Некоректне число'); return; }
        st.badge_size = clamp(n, 0.6, 4.0);
        saveSettings();
      }
    });

    // Очистити кеш
    Lampa.SettingsApi.addParam({
      component: 'svgq',
      param: { type: 'button', component: 'svgq_clear_cache' },
      field: { name: 'Очистити кеш' },
      onChange: function () { cacheClear(); }
    });
  }

  function startSettings() {
    loadSettings();
    if (Lampa && Lampa.SettingsApi && typeof Lampa.SettingsApi.addParam === 'function') {
      setTimeout(registerSettingsUIOnce, 0);
    }
  }

  // =====================================================================
  // Full-card hook only
  // =====================================================================

  Lampa.Listener.follow('full', function (e) {
    if (e.type !== 'complite') return;

    try {
      injectStyleOnce();

      if (!window.__svgq_settings_inited) {
        window.__svgq_settings_inited = true;

        if (window.appready) startSettings();
        else if (Lampa && Lampa.Listener) {
          Lampa.Listener.follow('app', function (ev) {
            if (ev.type === 'ready') startSettings();
          });
        }
      }

      var root = $(e.object.activity.render());
      applyBadgesToFullCard(e.data.movie, root);
    } catch (err) {
      console.error('[SVGQ] error:', err);
    }
  });

  console.log('[SVGQ] loaded with torq style');

})();
