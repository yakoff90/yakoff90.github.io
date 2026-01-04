!(function () {
  "use strict";

  // Використовуємо var замість const/let для сумісності зі старими TV
  var plugin_name = "EasyTorrent";
  var plugin_version = "1.1.0-TV-Fixed";
  var plugin_icon = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/></svg>';
  var supabase_url = "https://wozuelafumpzgvllcjne.supabase.co";
  var supabase_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvenVlbGFmdW1wemd2bGxjam5lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5Mjg1MDgsImV4cCI6MjA4MjUwNDUwOH0.ODnHlq_P-1wr_D6Jwaba1mLXIVuGBnnUZsrHI8Twdug";
  var pair_url = "https://darkestclouds.github.io/plugins/easytorrent/";
  
  var current_recommends = [];
  var sync_interval = null;

  var default_config = {
    version: "2.0",
    device: { type: "tv_4k", supported_hdr: ["hdr10", "hdr10plus", "dolby_vision"], supported_audio: ["stereo"] },
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
      }
    }
  };

  var config = default_config;

  // Локалізація
  var lang_data = {
    easytorrent_title: { ru: "Рекомендации торрентов", uk: "Рекомендації торрентів", en: "Torrent Recommendations" },
    easytorrent_desc: { ru: "На основе качества и HDR", uk: "На основі якості та HDR", en: "Based on quality and HDR" },
    recommended_badge: { ru: "Рекомендовано", uk: "Рекомендовано", en: "Recommended" },
    ideal_badge: { ru: "Идеально", uk: "Ідеально", en: "Ideal" },
    config_error: { ru: "Ошибка JSON", uk: "Помилка JSON", en: "JSON Error" }
  };

  function getString(key) {
    var lang = Lampa.Storage.get("language", "ru");
    return (lang_data[key] && (lang_data[key][lang] || lang_data[key].uk)) || key;
  }

  // Безпечне отримання властивостей (заміна Optional Chaining)
  function getSafe(obj, path, def) {
    var parts = path.split('.');
    for (var i = 0; i < parts.length; i++) {
      if (!obj || !Object.prototype.hasOwnProperty.call(obj, parts[i])) return def;
      obj = obj[parts[i]];
    }
    return obj === undefined ? def : obj;
  }

  function saveConfig(new_data) {
    var str = typeof new_data === "string" ? new_data : JSON.stringify(new_data);
    Lampa.Storage.set("easytorrent_config_json", str);
    try { config = JSON.parse(str); } catch (e) { config = default_config; }
  }

  // Заміна fetch на Lampa.Reguest (для сумісності з TV)
  function fetchRemoteConfig(code) {
    var network = new Lampa.Reguest();
    var url = supabase_url + "/rest/v1/tv_configs?id=eq." + encodeURIComponent(code) + "&select=data,updated_at";
    
    network.silent(url, function(res) {
      if (res && res.length > 0) {
        saveConfig(res[0].data);
        Lampa.Noty.show(getString("uk") === "uk" ? "Оновлено!" : "Обновлено!");
        if (sync_interval) { clearInterval(sync_interval); sync_interval = null; }
        Lampa.Modal.close();
      }
    }, function() {
      console.log("EasyTorrent: Sync failed");
    }, false, {
      headers: { apikey: supabase_key, Authorization: "Bearer " + supabase_key }
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
    if (title.indexOf("dolby vision") > -1 || title.indexOf("dovi") > -1) return "dolby_vision";
    if (title.indexOf("hdr10plus") > -1) return "hdr10plus";
    if (title.indexOf("hdr10") > -1 || title.indexOf("hdr") > -1) return "hdr10";
    return "sdr";
  }

  function calculateScore(item) {
    var score = 100;
    var res = parseResolution(item);
    var hdr = parseHDR(item);
    var seeds = item.Seeds || item.seeds || 0;

    // Розрахунок балів без ES6 операторів
    var resScore = getSafe(config, "scoring_rules.resolution." + res, 0);
    var hdrScore = getSafe(config, "scoring_rules.hdr." + hdr, 0);
    
    score += resScore;
    score += hdrScore;
    if (seeds > 50) score += 20;

    return Math.max(0, Math.round(score));
  }

  function applyRecommendation(results) {
    if (!results || !Array.isArray(results)) return;
    
    results.forEach(function(item) {
      var score = calculateScore(item);
      item._recommendScore = score;
    });

    results.sort(function(a, b) {
      return (b._recommendScore || 0) - (a._recommendScore || 0);
    });

    results.forEach(function(item, index) {
      item._recommendRank = index;
      item._recommendIsIdeal = (index === 0 && item._recommendScore >= 150);
    });
  }

  function renderBadge(e) {
    if (!Lampa.Storage.get("easytorrent_enabled", true)) return;
    var t = e.element, n = e.item;
    if (t._recommendRank === undefined || t._recommendRank > 2) return;

    n.find(".torrent-recommend-panel").remove();
    
    var isIdeal = t._recommendIsIdeal;
    var label = isIdeal ? getString("ideal_badge") : getString("recommended_badge") + " #" + (t._recommendRank + 1);
    var typeClass = isIdeal ? "ideal" : "recommended";

    var html = '<div class="torrent-recommend-panel torrent-recommend-panel--'+typeClass+'">' +
               '<div class="torrent-recommend-panel__label">'+label+'</div>' +
               '<div class="torrent-recommend-panel__score">'+t._recommendScore+'</div>' +
               '</div>';
    
    n.append(html);
  }

  function setupSettings() {
    Lampa.SettingsApi.addComponent({ component: "easytorrent", name: plugin_name, icon: plugin_icon });

    Lampa.SettingsApi.addParam({
      component: "easytorrent",
      param: { name: "easytorrent_enabled", type: "trigger", default: true },
      field: { name: getString("easytorrent_title"), description: getString("easytorrent_desc") }
    });

    Lampa.SettingsApi.addParam({
      component: "easytorrent",
      param: { name: "easytorrent_sync", type: "static" },
      field: { name: "Синхронізація (QR)", description: "Натисніть для підключення телефону" },
      onRender: function(e) {
        e.on("hover:enter", function() {
          var code = Math.random().toString(36).substring(2, 8).toUpperCase();
          var qr_url = pair_url + "?pairCode=" + code;
          
          var html = $('<div class="about"><div id="easytorrent_qr" style="background:white;padding:10px;width:200px;margin:0 auto;"></div>' +
                     '<div style="text-align:center;margin-top:10px;font-size:1.5em;font-weight:bold;">'+code+'</div></div>');
          
          Lampa.Modal.open({ title: "Налаштування", html: html, size: "medium", onBack: function() {
            if (sync_interval) clearInterval(sync_interval);
            Lampa.Modal.close();
          }});

          setTimeout(function() {
            if (Lampa.Utils && Lampa.Utils.qrcode) {
              Lampa.Utils.qrcode(qr_url, document.getElementById("easytorrent_qr"));
            }
          }, 200);

          sync_interval = setInterval(function() {
            fetchRemoteConfig(code);
          }, 5000);
        });
      }
    });
  }

  function patchParser() {
    var parser = Lampa.Parser || (Lampa.Component ? Lampa.Component.Parser : null);
    if (!parser) return;

    var originalGet = parser.get;
    parser.get = function(url, onDone, onError) {
      return originalGet.call(this, url, function(data) {
        if (data && data.Results) applyRecommendation(data.Results);
        onDone(data);
      }, onError);
    };
  }

  function init() {
    var saved = Lampa.Storage.get("easytorrent_config_json");
    if (saved) try { config = JSON.parse(saved); } catch(e) {}

    // Додаємо стилі
    var style = document.createElement("style");
    style.textContent = '.torrent-recommend-panel{ display:flex; justify-content:space-between; padding:5px 10px; background:rgba(0,0,0,0.3); border-top:1px solid rgba(255,255,255,0.1); margin: 5px -10px -10px; }' +
                        '.torrent-recommend-panel--recommended{ background:rgba(76,175,80,0.2); }' +
                        '.torrent-recommend-panel--ideal{ background:rgba(255,193,7,0.3); }' +
                        '.torrent-recommend-panel__label{ font-weight:bold; font-size:12px; }' +
                        '.torrent-recommend-panel__score{ opacity:0.7; font-size:12px; }';
    document.head.appendChild(style);

    setupSettings();
    patchParser();
    Lampa.Listener.follow("torrent", function(e) {
      if (e.type === "render") renderBadge(e);
    });
  }

  if (window.appready) init();
  else Lampa.Listener.follow("app", function(e) { if (e.type === "ready") init(); });

})();
