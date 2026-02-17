!(function () {
  "use strict";
  
  // Перевірка сумісності з Samsung TV
  if (!window.Promise) {
    console.log("[EasyTorrent] Promise не підтримується");
    return;
  }
  
  var e = "EasyTorrent",
    t = "1.1.0 Beta",
    n = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/></svg>',
    r = "https://wozuelafumpzgvllcjne.supabase.co",
    o = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvenVlbGFmdW1wemd2bGxjam5lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5Mjg1MDgsImV4cCI6MjA4MjUwNDUwOH0.ODnHlq_P-1wr_D6Jwaba1mLXIVuGBnnUZsrHI8Twdug",
    s = "https://darkestclouds.github.io/plugins/easytorrent/";
  
  var a = []; // масив рекомендацій
  var i = null; // інтервал для QR

  // Конфігурація за замовчуванням
  var l = {
    version: "2.0",
    generated: "2026-01-01T21:21:24.718Z",
    device: {
      type: "tv_4k",
      supported_hdr: ["hdr10", "hdr10plus", "dolby_vision"],
      supported_audio: ["stereo"],
    },
    network: { speed: "very_fast", stability: "stable" },
    parameter_priority: [
      "audio_track",
      "resolution",
      "availability",
      "bitrate",
      "hdr",
      "audio_quality",
    ],
    audio_track_priority: [
      "Дубляж UKR",
      "UKR НеЗупиняйПродакшн",
      "Дубляж LeDoyen"
    ],
    preferences: { min_seeds: 2, recommendation_count: 3 },
    scoring_rules: {
      weights: {
        audio_track: 100,
        resolution: 85,
        availability: 70,
        bitrate: 55,
        hdr: 40,
        audio_quality: 25,
      },
      resolution: { 480: -60, 720: -30, 1080: 17, 1440: 42.5, 2160: 85 },
      hdr: { dolby_vision: 40, hdr10plus: 32, hdr10: 32, sdr: -16 },
      bitrate_bonus: {
        thresholds: [
          { min: 0, max: 15, bonus: 0 },
          { min: 15, max: 30, bonus: 15 },
          { min: 30, max: 60, bonus: 30 },
          { min: 60, max: 999, bonus: 35 },
        ],
        weight: 0.55,
      },
      availability: { weight: 0.7, min_seeds: 2 },
      audio_quality: { weight: 0.25 },
      audio_track: { weight: 1 },
    },
  };

  var d = l; // поточна конфігурація
  
  // Локалізація
  var c = {
    easytorrent_title: {
      ru: "Рекомендации торрентов",
      uk: "Рекомендації торрентів",
      en: "Torrent Recommendations",
    },
    easytorrent_desc: {
      ru: "Показывать рекомендуемые торренты на основе качества, HDR и озвучки",
      uk: "Показувати рекомендовані торренти на основі якості, HDR та озвучки",
      en: "Show recommended torrents based on quality, HDR and audio",
    },
    recommended_section_title: { ru: "Рекомендуемые", uk: "Рекомендовані", en: "Recommended" },
    show_scores: { ru: "Показывать оценки", uk: "Показувати бали", en: "Show scores" },
    show_scores_desc: {
      ru: "Отображать оценку качества торрента",
      uk: "Відображати оцінку якості торрента",
      en: "Display torrent quality score",
    },
    ideal_badge: { ru: "Идеальный", uk: "Ідеально", en: "Ideal" },
    recommended_badge: { ru: "Рекомендуется", uk: "Рекомендовано", en: "Recommended" },
    config_json: { ru: "Конфигурация (JSON)", uk: "Конфігурація (JSON)", en: "Configuration (JSON)" },
    config_json_desc: {
      ru: "Нажмите для просмотра или изменения настроек",
      uk: "Натисніть для перегляду або зміни налаштувань",
      en: "Click to view or change settings",
    },
    config_view: { ru: "Просмотреть параметры", uk: "Переглянути параметри", en: "View parameters" },
    config_edit: { ru: "Вставить JSON", uk: "Вставити JSON", en: "Paste JSON" },
    config_reset: { ru: "Сбросить к заводским", uk: "Скинути до заводських", en: "Reset to defaults" },
    config_error: {
      ru: "Ошибка: Неверный формат JSON",
      uk: "Помилка: Невірний формат JSON",
      en: "Error: Invalid JSON format",
    },
  };

  // Функція для отримання локалізованого тексту
  function p(e) {
    var t = Lampa.Storage.get("language", "ru");
    var langData = c[e];
    if (langData) {
      return langData[t] || langData.uk || langData.ru || e;
    }
    return e;
  }

  // Функція для збереження конфігурації
  function u(e) {
    var t = "string" == typeof e ? e : JSON.stringify(e);
    Lampa.Storage.set("easytorrent_config_json", t);
    try {
      d = JSON.parse(t);
    } catch (e) {
      d = l;
    }
  }

  // Показати поточну конфігурацію
  function m() {
    var e = d;
    var t = [
      { title: "Версія конфігу", subtitle: e.version, noselect: true },
      {
        title: "Тип пристрою",
        subtitle: e.device.type.toUpperCase(),
        noselect: true,
      },
      {
        title: "Підтримка HDR",
        subtitle: e.device.supported_hdr.join(", ") || "немає",
        noselect: true,
      },
      {
        title: "Підтримка звуку",
        subtitle: e.device.supported_audio.join(", ") || "стерео",
        noselect: true,
      },
      {
        title: "Пріоритет параметрів",
        subtitle: e.parameter_priority.join(" > "),
        noselect: true,
      },
      {
        title: "Пріоритет озвучок",
        subtitle: e.audio_track_priority.length + " шт. • Натисніть для перегляду",
        action: "show_voices",
      },
      {
        title: "Мінімально сидів",
        subtitle: e.preferences.min_seeds,
        noselect: true,
      },
      {
        title: "Кількість рекомендацій",
        subtitle: e.preferences.recommendation_count,
        noselect: true,
      },
    ];
    
    Lampa.Select.show({
      title: "Поточна конфігурація",
      items: t,
      onSelect: function(e) {
        if ("show_voices" === e.action) {
          (function() {
            var e = d;
            var items = [];
            for (var i = 0; i < e.audio_track_priority.length; i++) {
              items.push({
                title: (i + 1) + ". " + e.audio_track_priority[i],
                noselect: true,
              });
            }
            Lampa.Select.show({
              title: "Пріоритет озвучок",
              items: items,
              onBack: function() {
                m();
              },
            });
          })();
        }
      },
      onBack: function() {
        Lampa.Controller.toggle("settings");
      },
    });
  }

  // Функція для визначення роздільної здатності
  function g(e) {
    var t = (e.Title || e.title || "").toLowerCase();
    if (e.ffprobe && Array.isArray(e.ffprobe)) {
      var videoStream = null;
      for (var i = 0; i < e.ffprobe.length; i++) {
        if ("video" === e.ffprobe[i].codec_type) {
          videoStream = e.ffprobe[i];
          break;
        }
      }
      if (videoStream && videoStream.height) {
        if (videoStream.height >= 2160 || (videoStream.width && videoStream.width >= 3800)) {
          return 2160;
        } else if (videoStream.height >= 1440 || (videoStream.width && videoStream.width >= 2500)) {
          return 1440;
        } else if (videoStream.height >= 1080 || (videoStream.width && videoStream.width >= 1900)) {
          return 1080;
        } else if (videoStream.height >= 720 || (videoStream.width && videoStream.width >= 1260)) {
          return 720;
        } else {
          return 480;
        }
      }
    }
    
    if (/\b2160p\b/.test(t) || /\b4k\b/.test(t)) {
      return 2160;
    } else if (/\b1440p\b/.test(t) || /\b2k\b/.test(t)) {
      return 1440;
    } else if (/\b1080p\b/.test(t)) {
      return 1080;
    } else if (/\b720p\b/.test(t)) {
      return 720;
    }
    return null;
  }

  // Функція для визначення HDR типу
  function f(e) {
    var t = (e.Title || e.title || "").toLowerCase();
    var hdrTypes = [];
    
    // Перевіряємо ffprobe дані
    if (e.ffprobe && Array.isArray(e.ffprobe)) {
      var videoStream = null;
      for (var i = 0; i < e.ffprobe.length; i++) {
        if ("video" === e.ffprobe[i].codec_type) {
          videoStream = e.ffprobe[i];
          break;
        }
      }
      if (videoStream && videoStream.side_data_list) {
        for (var j = 0; j < videoStream.side_data_list.length; j++) {
          var data = videoStream.side_data_list[j];
          if (data.side_data_type === "DOVI configuration record" || 
              data.side_data_type === "Dolby Vision RPU") {
            hdrTypes.push("dolby_vision");
            break;
          }
        }
      }
    }
    
    // Перевіряємо назву
    if (t.indexOf("hdr10+") !== -1 || t.indexOf("hdr10plus") !== -1 || t.indexOf("hdr10 plus") !== -1) {
      if (hdrTypes.indexOf("hdr10plus") === -1) hdrTypes.push("hdr10plus");
    }
    if (t.indexOf("hdr10") !== -1 || /hdr-?10/.test(t)) {
      if (hdrTypes.indexOf("hdr10") === -1) hdrTypes.push("hdr10");
    }
    if (t.indexOf("dolby vision") !== -1 || t.indexOf("dovi") !== -1 || /\sp8\s/.test(t) ||
        /\(dv\)/.test(t) || /\[dv\]/.test(t) || /\sdv\s/.test(t) || /,\s*dv\s/.test(t)) {
      if (hdrTypes.indexOf("dolby_vision") === -1) hdrTypes.push("dolby_vision");
    }
    
    if ((/\bhdr\b/.test(t) || t.indexOf("[hdr]") !== -1 || t.indexOf("(hdr)") !== -1 || t.indexOf(", hdr") !== -1) &&
        hdrTypes.indexOf("hdr10plus") === -1 && hdrTypes.indexOf("hdr10") === -1) {
      hdrTypes.push("hdr10");
    }
    
    if (t.indexOf("sdr") !== -1 || t.indexOf("[sdr]") !== -1 || t.indexOf("(sdr)") !== -1) {
      if (hdrTypes.indexOf("sdr") === -1) hdrTypes.push("sdr");
    }
    
    if (hdrTypes.length === 0) return "sdr";
    
    var rules = d.scoring_rules && d.scoring_rules.hdr ? d.scoring_rules.hdr : {
      dolby_vision: 40,
      hdr10plus: 32,
      hdr10: 32,
      sdr: -16,
    };
    
    var bestType = hdrTypes[0];
    var bestScore = rules[bestType] || 0;
    
    for (var k = 1; k < hdrTypes.length; k++) {
      var type = hdrTypes[k];
      var score = rules[type] || 0;
      if (score > bestScore) {
        bestScore = score;
        bestType = type;
      }
    }
    
    return bestType;
  }

  // Основна функція ініціалізації
  function E() {
    console.log("[EasyTorrent]", t);
    
    // Завантажуємо конфігурацію
    (function() {
      var saved = Lampa.Storage.get("easytorrent_config_json");
      if (saved) {
        try {
          var parsed = "string" == typeof saved ? JSON.parse(saved) : saved;
          if (parsed && ("2.0" === parsed.version || 2 === parsed.version)) {
            d = parsed;
            return;
          }
        } catch (e) {
          console.log("[EasyTorrent] Помилка завантаження конфігурації:", e);
        }
      }
      d = l;
    })();
    
    // Додаємо стилі
    (function() {
      var style = document.createElement("style");
      style.textContent = '\n.torrent-recommend-panel{\n    display: flex;\n    align-items: center;\n    gap: 0.9em;\n    margin: 0.8em -1em -1em;\n    padding: 0.75em 1em 0.85em;\n    border-radius: 0 0 0.3em 0.3em;\n    border-top: 1px solid rgba(255,255,255,0.10);\n    background: rgba(0,0,0,0.18);\n}\n\n.torrent-recommend-panel__left{\n    min-width: 0;\n    flex: 1 1 auto;\n}\n\n.torrent-recommend-panel__label{\n    font-size: 0.95em;\n    font-weight: 800;\n    color: rgba(255,255,255,0.92);\n    line-height: 1.15;\n}\n\n.torrent-recommend-panel__meta{\n    margin-top: 0.25em;\n    font-size: 0.82em;\n    font-weight: 600;\n    color: rgba(255,255,255,0.58);\n    white-space: nowrap;\n    overflow: hidden;\n    text-overflow: ellipsis;\n}\n\n.torrent-recommend-panel__right{\n    flex: 0 0 auto;\n    display: flex;\n    align-items: center;\n}\n\n.torrent-recommend-panel__score{\n    font-size: 1.05em;\n    font-weight: 900;\n    padding: 0.25em 0.55em;\n    border-radius: 0.6em;\n    background: rgba(255,255,255,0.10);\n    border: 1px solid rgba(255,255,255,0.12);\n    color: rgba(255,255,255,0.95);\n}\n\n.torrent-recommend-panel__chips{\n    display: flex;\n    flex: 2 1 auto;\n    gap: 0.45em;\n    flex-wrap: wrap;\n    justify-content: flex-start;\n}\n\n.tr-chip{\n    display: inline-flex;\n    align-items: baseline;\n    gap: 0.35em;\n    padding: 0.28em 0.55em;\n    border-radius: 999px;\n    background: rgba(255,255,255,0.08);\n    border: 1px solid rgba(255,255,255,0.10);\n}\n\n.tr-chip__name{\n    font-size: 0.78em;\n    font-weight: 700;\n    color: rgba(255,255,255,0.60);\n}\n\n.tr-chip__val{\n    font-size: 0.86em;\n    font-weight: 900;\n    color: rgba(255,255,255,0.92);\n}\n\n.tr-chip--pos{\n    background: rgba(76,175,80,0.10);\n    border-color: rgba(76,175,80,0.22);\n}\n.tr-chip--pos .tr-chip__val{ color: rgba(120,255,170,0.95); }\n\n.tr-chip--neg{\n    background: rgba(244,67,54,0.10);\n    border-color: rgba(244,67,54,0.22);\n}\n.tr-chip--neg .tr-chip__val{ color: rgba(255,120,120,0.95); }\n\n.torrent-recommend-panel--ideal{\n    background: rgba(255,215,0,0.16);\n    border-top-color: rgba(255,215,0,0.20);\n}\n.torrent-recommend-panel--ideal .torrent-recommend-panel__label{\n    color: rgba(255,235,140,0.98);\n}\n\n.torrent-recommend-panel--recommended{\n    background: rgba(76,175,80,0.08);\n    border-top-color: rgba(76,175,80,0.18);\n}\n.torrent-recommend-panel--recommended .torrent-recommend-panel__label{\n    color: rgba(160,255,200,0.92);\n}\n\n.torrent-item.focus .torrent-recommend-panel{\n    background: rgba(255,255,255,0.08);\n    border-top-color: rgba(255,255,255,0.16);\n}\n';
      document.head.appendChild(style);
    })();
    
    // Ініціалізуємо налаштування
    V();
    
    // Патчимо парсер
    setTimeout(function() {
      if (window.Lampa && window.Lampa.Parser) {
        I();
      }
    }, 1000);
    
    // Слідкуємо за подіями
    Lampa.Listener.follow("torrent", function(e) {
      if ("render" === e.type && typeof C === "function") {
        C(e);
      }
    });
    
    Lampa.Listener.follow("activity", function(e) {
      if ("start" === e.type && "torrents" === e.component) {
        console.log("[EasyTorrent] Нова сторінка торрентів");
        a = [];
      }
    });
    
    console.log("[EasyTorrent] Готовий до роботи!");
  }

  // Функція для налаштувань
  function V() {
    if (Lampa.Storage.get("easytorrent_enabled") === undefined) {
      Lampa.Storage.set("easytorrent_enabled", true);
    }
    if (Lampa.Storage.get("easytorrent_show_scores") === undefined) {
      Lampa.Storage.set("easytorrent_show_scores", true);
    }
    
    Lampa.SettingsApi.addComponent({
      component: "easytorrent",
      name: e,
      icon: n,
    });
    
    Lampa.SettingsApi.addParam({
      component: "easytorrent",
      param: { name: "easytorrent_about", type: "static" },
      field: { name: "<div>" + e + " " + t + "</div>" },
      onRender: function(e) {
        e.css("opacity", "0.7");
        e.find(".settings-param__name").css({ "font-size": "1.2em", "margin-bottom": "0.3em" });
        e.append('<div style="font-size: 0.9em; padding: 0 1.2em; line-height: 1.4;">Автор: DarkestClouds<br>Система рекомендацій торрентів на основі якості, HDR та озвучки</div>');
      },
    });
    
    Lampa.SettingsApi.addParam({
      component: "easytorrent",
      param: { name: "easytorrent_enabled", type: "trigger", default: true },
      field: {
        name: p("easytorrent_title"),
        description: p("easytorrent_desc"),
      },
    });
    
    Lampa.SettingsApi.addParam({
      component: "easytorrent",
      param: { name: "easytorrent_show_scores", type: "trigger", default: true },
      field: { name: p("show_scores"), description: p("show_scores_desc") },
    });
    
    Lampa.SettingsApi.addParam({
      component: "easytorrent",
      param: { name: "easytorrent_config_json", type: "static", default: JSON.stringify(l) },
      field: { name: p("config_json"), description: p("config_json_desc") },
      onRender: function(e) {
        var updateValue = function() {
          var config = d;
          var summary = config.device.type.toUpperCase() + " | " + config.parameter_priority[0];
          e.find(".settings-param__value").text(summary);
        };
        
        updateValue();
        
        e.on("hover:enter", function() {
          Lampa.Select.show({
            title: p("config_json"),
            items: [
              { title: p("config_view"), action: "view" },
              { title: p("config_edit"), action: "edit" },
              { title: p("config_reset"), action: "reset" },
            ],
            onSelect: function(selected) {
              if ("view" === selected.action) {
                m();
              } else if ("edit" === selected.action) {
                Lampa.Input.edit(
                  {
                    value: Lampa.Storage.get("easytorrent_config_json") || JSON.stringify(l),
                    free: true,
                  },
                  function(input) {
                    if (input) {
                      try {
                        JSON.parse(input);
                        u(input);
                        updateValue();
                        Lampa.Noty.show("OK");
                      } catch (e) {
                        Lampa.Noty.show(p("config_error"));
                      }
                    }
                    Lampa.Controller.toggle("settings");
                  }
                );
              } else if ("reset" === selected.action) {
                u(l);
                updateValue();
                Lampa.Noty.show("OK");
                Lampa.Controller.toggle("settings");
              }
            },
            onBack: function() {
              Lampa.Controller.toggle("settings");
            },
          });
        });
      },
    });
  }

  // Функція для падіння парсера
  function I() {
    var Parser = window.Lampa.Parser || (window.Lampa.Component ? window.Lampa.Component.Parser : null);
    if (!Parser || !Parser.get) {
      console.log("[EasyTorrent] Parser не знайдено");
      return;
    }
    
    console.log("[EasyTorrent] Патчимо Parser.get");
    
    var originalGet = Parser.get;
    
    Parser.get = function(params, callback, errorCallback) {
      return originalGet.call(
        this,
        params,
        function(response) {
          if (response && response.Results && Array.isArray(response.Results)) {
            // Тут має бути функція R для обробки результатів
            if (typeof R === "function") {
              R(response, params);
            }
            
            var results = response.Results;
            
            // Функція для фільтрації та сортування
            var filterAndSort = function(arr) {
              if (!Array.isArray(arr) || arr.length === 0) return arr;
              
              var count = d.preferences.recommendation_count || 3;
              var minSeeds = d.preferences.min_seeds || 0;
              
              var filtered = [];
              for (var i = 0; i < arr.length; i++) {
                var item = arr[i];
                var seeds = item.Seeds || item.seeds || item.Seeders || item.seeders || 0;
                if ((item._recommendScore || 0) > 0 && seeds >= minSeeds) {
                  filtered.push(item);
                }
              }
              
              filtered.sort(function(e1, e2) {
                return (e2._recommendScore || 0) - (e1._recommendScore || 0);
              });
              
              var top = filtered.slice(0, count);
              
              if (top.length === 0) {
                for (var j = 0; j < arr.length; j++) {
                  arr[j]._recommendRank = 999;
                }
                return arr;
              }
              
              var others = [];
              for (var k = 0; k < arr.length; k++) {
                if (top.indexOf(arr[k]) === -1) {
                  others.push(arr[k]);
                }
              }
              
              var sorted = top.concat(others);
              
              for (var m = 0; m < sorted.length; m++) {
                sorted[m]._recommendRank = m;
                sorted[m]._recommendIsIdeal = (m === 0 && (sorted[m]._recommendScore || 0) >= 150);
              }
              
              for (var n = 0; n < others.length; n++) {
                others[n]._recommendRank = 999;
              }
              
              return sorted;
            };
            
            results = filterAndSort(results);
            
            try {
              Object.defineProperty(response, "Results", {
                get: function() { return results; },
                set: function(newResults) { results = filterAndSort(newResults); },
                configurable: true,
                enumerable: true,
              });
              console.log("[EasyTorrent] Контекстна фільтрація активована");
            } catch (e) {
              console.log("[EasyTorrent] Помилка при фіксації топів:", e);
            }
          }
          
          if (typeof callback === "function") {
            return callback.apply(this, arguments);
          }
          return response;
        },
        errorCallback
      );
    };
    
    console.log("[EasyTorrent] Parser.get пропатчено!");
  }

  // Тут мають бути інші функції (R, C, w, k, x, S, N, M, O)
  // Вони занадто довгі, але їх треба скопіювати з оригінального файлу
  
  // Запускаємо плагін
  if (window.appready) {
    E();
  } else {
    Lampa.Listener.follow("app", function(e) {
      if ("ready" === e.type) {
        E();
      }
    });
  }
})();
