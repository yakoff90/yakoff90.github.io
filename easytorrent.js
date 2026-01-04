!(function () {
  "use strict";

  // Використовуємо var для сумісності зі старими TV
  var plugin_name = "EasyTorrent";
  var plugin_version = "1.1.0-TV-Stable";
  var plugin_icon = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/></svg>';
  var supabase_url = "https://wozuelafumpzgvllcjne.supabase.co";
  var supabase_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvenVlbGFmdW1wemd2bGxjam5lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5Mjg1MDgsImV4cCI6MjA4MjUwNDUwOH0.ODnHlq_P-1wr_D6Jwaba1mLXIVuGBnnUZsrHI8Twdug";
  var pair_site_url = "https://darkestclouds.github.io/plugins/easytorrent/";

  var current_recommends = [];
  var sync_timer = null;

  var default_config = {
    version: "2.0",
    generated: "2026-01-01T21:21:24.718Z",
    device: {
      type: "tv_4k",
      supported_hdr: ["hdr10", "hdr10plus", "dolby_vision"],
      supported_audio: ["stereo"]
    },
    network: { speed: "very_fast", stability: "stable" },
    parameter_priority: ["audio_track", "resolution", "availability", "bitrate", "hdr", "audio_quality"],
    audio_track_priority: ["Дубляж UKR", "UKR НеЗупиняйПродакшн", "Дубляж LeDoyen"],
    preferences: { min_seeds: 2, recommendation_count: 3 },
    scoring_rules: {
      weights: { audio_track: 100, resolution: 85, availability: 70, bitrate: 55, hdr: 40, audio_quality: 25 },
      resolution: { 480: -60, 720: -30, 1080: 17, 1440: 42.5, 2160: 85 },
      hdr: { dolby_vision: 40, hdr10plus: 32, hdr10: 32, sdr: -16 },
      bitrate_bonus: {
        thresholds: [
          { min: 0, max: 15, bonus: 0 },
          { min: 15, max: 30, bonus: 15 },
          { min: 30, max: 60, bonus: 30 },
          { min: 60, max: 999, bonus: 35 }
        ],
        weight: 0.55
      },
      availability: { weight: 0.7, min_seeds: 2 },
      audio_quality: { weight: 0.25 },
      audio_track: { weight: 1 }
    }
  };

  var active_config = default_config;

  var localization = {
    easytorrent_title: { ru: "Рекомендации торрентов", uk: "Рекомендації торрентів", en: "Torrent Recommendations" },
    easytorrent_desc: { ru: "Показывать рекомендуемые торренты на основе качества, HDR и озвучки", uk: "Показувати рекомендовані торренти на основі якості, HDR та озвучки", en: "Show recommended torrents based on quality, HDR and audio" },
    recommended_section_title: { ru: "Рекомендуемые", uk: "Рекомендовані", en: "Recommended" },
    show_scores: { ru: "Показывать оценки", uk: "Показувати бали", en: "Show scores" },
    show_scores_desc: { ru: "Отображать оценку качества торрента", uk: "Відображати оцінку якості торрента", en: "Display torrent quality score" },
    ideal_badge: { ru: "Идеально", uk: "Ідеально", en: "Ideal" },
    recommended_badge: { ru: "Рекомендуется", uk: "Рекомендовано", en: "Recommended" },
    config_json: { ru: "Конфигурация (JSON)", uk: "Конфігурація (JSON)", en: "Configuration (JSON)" },
    config_json_desc: { ru: "Нажмите для просмотра или изменения настроек", uk: "Натисніть для перегляду або зміни налаштувань", en: "Click to view or change settings" },
    config_view: { ru: "Просмотреть параметры", uk: "Переглянути параметри", en: "View parameters" },
    config_edit: { ru: "Вставить JSON", uk: "Вставити JSON", en: "Paste JSON" },
    config_reset: { ru: "Сбросить к заводским", uk: "Скинути до заводських", en: "Reset to defaults" },
    config_error: { ru: "Ошибка: Неверный формат JSON", uk: "Помилка: Невірний формат JSON", en: "Error: Invalid JSON format" }
  };

  // Допоміжна функція безпечного доступу (заміна Optional Chaining)
  function getSafe(obj, path, defaultValue) {
    var parts = path.split('.');
    var current = obj;
    for (var i = 0; i < parts.length; i++) {
      if (current === null || current === undefined) return defaultValue;
      current = current[parts[i]];
    }
    return current === undefined ? defaultValue : current;
  }

  function getLangString(key) {
    var lang = Lampa.Storage.get("language", "ru");
    var item = localization[key];
    if (!item) return key;
    return item[lang] || item.uk || item.ru || key;
  }

  function updateConfig(newData) {
    var str = typeof newData === "string" ? newData : JSON.stringify(newData);
    Lampa.Storage.set("easytorrent_config_json", str);
    try {
      active_config = JSON.parse(str);
    } catch (e) {
      active_config = default_config;
    }
  }

  function showParamsModal() {
    var conf = active_config;
    var items = [
      { title: "Версія конфігу", subtitle: conf.version, noselect: true },
      { title: "Тип пристрою", subtitle: String(conf.device.type).toUpperCase(), noselect: true },
      { title: "Підтримка HDR", subtitle: conf.device.supported_hdr.join(", "), noselect: true },
      { title: "Пріоритет параметрів", subtitle: conf.parameter_priority.join(" > "), noselect: true },
      { title: "Мінімально сидів", subtitle: conf.preferences.min_seeds, noselect: true }
    ];

    Lampa.Select.show({
      title: "Поточна конфігурація",
      items: items,
      onBack: function () {
        Lampa.Controller.toggle("settings");
      }
    });
  }

  function parseResolution(item) {
    var title = (item.Title || item.title || "").toLowerCase();
    if (/\b2160p\b|\b4k\b/.test(title)) return 2160;
    if (/\b1440p\b|\b2k\b/.test(title)) return 1440;
    if (/\b1080p\b/.test(title)) return 1080;
    if (/\b720p\b/.test(title)) return 720;
    return 480;
  }

  function parseHDR(item) {
    var title = (item.Title || item.title || "").toLowerCase();
    var hdr_rules = getSafe(active_config, "scoring_rules.hdr", { dolby_vision: 40, hdr10plus: 32, hdr10: 32, sdr: -16 });
    
    if (title.indexOf("dolby vision") !== -1 || title.indexOf("dovi") !== -1 || title.indexOf(" dv ") !== -1) return "dolby_vision";
    if (title.indexOf("hdr10plus") !== -1 || title.indexOf("hdr10+") !== -1) return "hdr10plus";
    if (title.indexOf("hdr10") !== -1 || title.indexOf("hdr") !== -1) return "hdr10";
    return "sdr";
  }

  function calculateBitrate(item, movieInfo, isSerial, episodesCount) {
    var size = item.Size || item.size_bytes || 0;
    var runtime = getSafe(movieInfo, "runtime", 100) || 100;
    if (size === 0) return 0;

    var totalSeconds = runtime * 60;
    var bitrateMbps = Math.round((size * 8) / (totalSeconds * 1000000));
    return bitrateMbps;
  }

  var voiceMap = {
    "Дубляж UKR": ["ukr", "укр"],
    "UKR НеЗупиняйПродакшн": ["незупиняйпродакшн"],
    "Дубляж LeDoyen": ["ledoyen"],
    "Дубляж RU": ["дубляж", "дб", "dub"]
  };

  function detectAudio(item) {
    var title = (item.Title || item.title || "").toLowerCase();
    var detected = [];
    for (var key in voiceMap) {
      var keywords = voiceMap[key];
      for (var i = 0; i < keywords.length; i++) {
        if (title.indexOf(keywords[i].toLowerCase()) !== -1) {
          detected.push(key);
          break;
        }
      }
    }
    return detected;
  }

  function getTorrentFeatures(item, movieInfo, isSerial, count) {
    return {
      resolution: parseResolution(item),
      hdr_type: parseHDR(item),
      audio_tracks: detectAudio(item),
      bitrate: calculateBitrate(item, movieInfo, isSerial, count)
    };
  }

  function scoreTorrent(item) {
    var features = item._recommendFeatures;
    var rules = active_config.scoring_rules || {};
    var score = 100;
    var seeds = item.Seeds || item.seeds || 0;
    var tracker = (item.Tracker || item.tracker || "").toLowerCase();

    var breakdown = { base: 100, resolution: 0, hdr: 0, bitrate: 0, audio: 0, tracker: 0 };

    // Tracker Bonus
    if (tracker.indexOf("toloka") !== -1) {
      breakdown.tracker = 20;
      score += 20;
    }

    // Resolution Score
    var resW = getSafe(rules, "weights.resolution", 85) / 100;
    var resVal = getSafe(rules, "resolution." + features.resolution, 0) * resW;
    breakdown.resolution = resVal;
    score += resVal;

    // HDR Score
    var hdrW = getSafe(rules, "weights.hdr", 40) / 100;
    var hdrVal = getSafe(rules, "hdr." + features.hdr_type, 0) * hdrW;
    breakdown.hdr = hdrVal;
    score += hdrVal;

    // Audio Score
    var audioW = getSafe(rules, "weights.audio_track", 100) / 100;
    var prio = active_config.audio_track_priority || [];
    for (var i = 0; i < prio.length; i++) {
      if (features.audio_tracks.indexOf(prio[i]) !== -1) {
        var aScore = (15 * (prio.length - i)) * audioW;
        breakdown.audio = aScore;
        score += aScore;
        break;
      }
    }

    item._recommendScore = Math.max(0, Math.round(score));
    item._recommendBreakdown = breakdown;
  }

  function processResults(data, query) {
    if (!data || !data.Results) return;
    var results = data.Results;
    var movieInfo = query ? query.movie : null;

    for (var i = 0; i < results.length; i++) {
      results[i]._recommendFeatures = getTorrentFeatures(results[i], movieInfo, false, 1);
      scoreTorrent(results[i]);
    }

    results.sort(function (a, b) {
      return (b._recommendScore || 0) - (a._recommendScore || 0);
    });

    var limit = getSafe(active_config, "preferences.recommendation_count", 3);
    for (var j = 0; j < results.length; j++) {
      results[j]._recommendRank = j;
      results[j]._recommendIsIdeal = (j === 0 && results[j]._recommendScore >= 150);
    }
  }

  function renderBadge(e) {
    if (!Lampa.Storage.get("easytorrent_enabled", true)) return;
    var item = e.element;
    var container = e.item;

    if (item._recommendRank === undefined || item._recommendRank >= getSafe(active_config, "preferences.recommendation_count", 3)) return;

    container.find(".torrent-recommend-panel").remove();

    var type = item._recommendIsIdeal ? "ideal" : "recommended";
    var label = item._recommendIsIdeal ? getLangString("ideal_badge") : getLangString("recommended_badge") + " #" + (item._recommendRank + 1);
    
    var features = item._recommendFeatures;
    var meta = features.resolution + "p • " + String(features.hdr_type).toUpperCase() + " • " + features.bitrate + " Mbps";

    var html = '<div class="torrent-recommend-panel torrent-recommend-panel--' + type + '">' +
               '<div class="torrent-recommend-panel__left">' +
               '<div class="torrent-recommend-panel__label">' + label + '</div>' +
               '<div class="torrent-recommend-panel__meta">' + meta + '</div>' +
               '</div>' +
               '<div class="torrent-recommend-panel__right">' +
               '<div class="torrent-recommend-panel__score">' + item._recommendScore + '</div>' +
               '</div></div>';

    container.append(html);
  }

  // Використання Lampa.Reguest замість fetch для TV
  function startSync(code) {
    var network = new Lampa.Reguest();
    var url = supabase_url + "/rest/v1/tv_configs?id=eq." + encodeURIComponent(code) + "&select=data,updated_at";
    
    network.silent(url, function (res) {
      if (res && res.length > 0) {
        updateConfig(res[0].data);
        Lampa.Noty.show("Конфігурація оновлена!");
        if (sync_timer) { clearInterval(sync_timer); sync_timer = null; }
        Lampa.Modal.close();
      }
    }, function () {
      console.log("EasyTorrent: Sync Error");
    }, false, {
      headers: { apikey: supabase_key, Authorization: "Bearer " + supabase_key }
    });
  }

  function setupSettings() {
    Lampa.SettingsApi.addComponent({ component: "easytorrent", name: plugin_name, icon: plugin_icon });

    Lampa.SettingsApi.addParam({
      component: "easytorrent",
      param: { name: "easytorrent_enabled", type: "trigger", default: true },
      field: { name: getLangString("easytorrent_title"), description: getLangString("easytorrent_desc") }
    });

    Lampa.SettingsApi.addParam({
      component: "easytorrent",
      param: { name: "easytorrent_sync", type: "static" },
      field: { name: "Синхронізація (QR)", description: "Натисніть, щоб підключити телефон" },
      onRender: function (e) {
        e.on("hover:enter", function () {
          var code = Math.random().toString(36).substring(2, 8).toUpperCase();
          var qrUrl = pair_site_url + "?pairCode=" + code;
          
          var html = $('<div class="about"><div id="et_qr" style="background:white;padding:10px;width:180px;margin:0 auto;"></div>' +
                     '<div style="text-align:center;margin-top:15px;font-size:1.8em;font-weight:bold;color:#667eea;">' + code + '</div></div>');
          
          Lampa.Modal.open({
            title: "Налаштування",
            html: html,
            size: "medium",
            onBack: function() {
              if (sync_timer) clearInterval(sync_timer);
              Lampa.Modal.close();
            }
          });

          setTimeout(function() {
            if (Lampa.Utils && Lampa.Utils.qrcode) Lampa.Utils.qrcode(qrUrl, document.getElementById("et_qr"));
          }, 200);

          sync_timer = setInterval(function() { startSync(code); }, 5000);
        });
      }
    });
  }

  function patchParser() {
    var parser = Lampa.Parser || (Lampa.Component ? Lampa.Component.Parser : null);
    if (!parser) return;

    var originalGet = parser.get;
    parser.get = function (url, onDone, onError) {
      return originalGet.call(this, url, function (data) {
        if (data && data.Results) processResults(data, url);
        onDone(data);
      }, onError);
    };
  }

  function injectStyles() {
    var css = '.torrent-recommend-panel{ display:flex; align-items:center; gap:10px; margin:10px -10px -10px; padding:10px; background:rgba(0,0,0,0.2); border-top:1px solid rgba(255,255,255,0.1); border-radius:0 0 4px 4px; }' +
              '.torrent-recommend-panel--ideal{ background:rgba(255,193,7,0.15); border-top-color:rgba(255,193,7,0.3); }' +
              '.torrent-recommend-panel--recommended{ background:rgba(76,175,80,0.1); border-top-color:rgba(76,175,80,0.2); }' +
              '.torrent-recommend-panel__label{ font-size:14px; font-weight:bold; color:#fff; }' +
              '.torrent-recommend-panel__meta{ font-size:12px; color:rgba(255,255,255,0.5); margin-top:2px; }' +
              '.torrent-recommend-panel__score{ padding:4px 8px; background:rgba(255,255,255,0.1); border-radius:6px; font-weight:bold; font-size:14px; }';
    var style = document.createElement("style");
    style.innerHTML = css;
    document.head.appendChild(style);
  }

  function init() {
    var saved = Lampa.Storage.get("easytorrent_config_json");
    if (saved) {
      try { active_config = JSON.parse(saved); } catch (e) { active_config = default_config; }
    }
    
    injectStyles();
    setupSettings();
    patchParser();

    Lampa.Listener.follow("torrent", function (e) {
      if (e.type === "render") renderBadge(e);
    });

    console.log("EasyTorrent: Ready (ES5-TV Edition)");
  }

  if (window.appready) init();
  else Lampa.Listener.follow("app", function (e) { if (e.type === "ready") init(); });

})();
