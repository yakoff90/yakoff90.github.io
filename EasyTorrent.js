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
  
  var a = [];
  var i = null;

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

  var d = l;
  
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

  function p(e) {
    var t = Lampa.Storage.get("language", "ru");
    var langData = c[e];
    if (langData) {
      return langData[t] || langData.uk || langData.ru || e;
    }
    return e;
  }

  function u(e) {
    var t = "string" == typeof e ? e : JSON.stringify(e);
    Lampa.Storage.set("easytorrent_config_json", t);
    try {
      d = JSON.parse(t);
    } catch (e) {
      d = l;
    }
  }

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

  function f(e) {
    var t = (e.Title || e.title || "").toLowerCase();
    var hdrTypes = [];
    
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
            if (hdrTypes.indexOf("dolby_vision") === -1) hdrTypes.push("dolby_vision");
            break;
          }
        }
      }
    }
    
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

  function b(e) {
    var t = parseInt(e, 10);
    return isFinite(t) ? t : null;
  }

  function h(e, t) {
    return e == null
      ? null
      : t == null || t === e
        ? { start: e, end: e }
        : { start: Math.min(e, t), end: Math.max(e, t) };
  }

  function _(e) {
    return Number.isInteger(e) && e >= 1 && e <= 60;
  }

  function y(e) {
    return Number.isInteger(e) && e >= 0 && e <= 5000;
  }

  function v(e, t) {
    return (
      !(!Number.isInteger(e) || !Number.isInteger(t)) &&
      !(e < 1900 || e > 2100) &&
      !(t < 1900 || t > 2100) &&
      !(t < e) &&
      t - e <= 60
    );
  }

  // Функція для перевірки на "сміттєві" торренти
  function w(e) {
    if (!e) return false;
    var t = e.toLowerCase();
    // Шукаємо ключові слова, що вказують на серіал
    var seriesIndicators = [
      's01', 's02', 's03', 's04', 's05', 's06', 's07', 's08', 's09', 's10',
      'season', 'сезон', 'e01', 'e02', 'e03', 'e04', 'e05', 'episode',
      'серия', 'серія', 'ep', 'эпизод'
    ];
    
    for (var i = 0; i < seriesIndicators.length; i++) {
      if (t.indexOf(seriesIndicators[i]) !== -1) return true;
    }
    return false;
  }

  // Функція для перевірки спеціального формату
  function L(e, t, n) {
    if ("2x2" === String(n).toLowerCase().replace(/\s+/g, "")) return true;
    var r = e.slice(Math.max(0, t - 12), t).toLowerCase();
    var o = e.slice(t + n.length, t + n.length + 12).toLowerCase();
    var s = /(дб|dub)\s*\(/i.test(r);
    var a = /^\s*\)/.test(o);
    return s && a;
  }

  // Функція розрахунку впевненості
  function x(params) {
    var season = params.season;
    var seasonRange = params.seasonRange;
    var episode = params.episode;
    var episodeRange = params.episodeRange;
    var base = params.base;
    var title = params.title;
    
    if (title && w(title)) return 0;
    
    var result = base;
    var seasonVal = season != null ? season : (seasonRange && seasonRange.start != null ? seasonRange.start : null);
    var episodeVal = episode != null ? episode : (episodeRange && episodeRange.start != null ? episodeRange.start : null);
    
    if (seasonVal != null) result += 10;
    if (episodeVal != null) result += 10;
    if (seasonVal != null && episodeVal != null) result += 15;
    if (seasonRange && seasonRange.end !== seasonRange.start) result += 5;
    if (episodeRange && episodeRange.end !== episodeRange.start) result += 5;
    if (seasonVal != null && !_(seasonVal)) result -= 60;
    if (episodeVal != null && !y(episodeVal)) result -= 60;
    
    return Number.isFinite(result) ? Math.max(0, Math.min(100, Math.round(result))) : 0;
  }

  // Спрощена функція парсингу серіалів
  function k(e) {
    if (e == null) return { season: null, episode: null, source: "none", confidence: 0 };
    
    var t = String(e).toLowerCase();
    
    // Шукаємо S01E01 формат
    var sxxexxMatch = /s(\d{1,2})e(\d{1,3})/i.exec(t);
    if (sxxexxMatch) {
      return {
        season: parseInt(sxxexxMatch[1], 10),
        episode: parseInt(sxxexxMatch[2], 10),
        source: "SxxEyy",
        confidence: 90
      };
    }
    
    // Шукаємо S01.E01 формат
    var sxxDotExxMatch = /s(\d{1,2})\.e(\d{1,3})/i.exec(t);
    if (sxxDotExxMatch) {
      return {
        season: parseInt(sxxDotExxMatch[1], 10),
        episode: parseInt(sxxDotExxMatch[2], 10),
        source: "Sxx.Eyy",
        confidence: 85
      };
    }
    
    // Шукаємо 1x01 формат
    var xxXyyMatch = /(\d{1,2})x(\d{1,3})/i.exec(t);
    if (xxXyyMatch) {
      return {
        season: parseInt(xxXyyMatch[1], 10),
        episode: parseInt(xxXyyMatch[2], 10),
        source: "NxN",
        confidence: 80
      };
    }
    
    // Шукаємо Season 1 Episode 2
    var seasonEpisodeMatch = /season[.\s]*(\d{1,2})[.\s]*episode[.\s]*(\d{1,3})/i.exec(t);
    if (seasonEpisodeMatch) {
      return {
        season: parseInt(seasonEpisodeMatch[1], 10),
        episode: parseInt(seasonEpisodeMatch[2], 10),
        source: "Season Episode",
        confidence: 75
      };
    }
    
    // Шукаємо сезон 1 серія 2
    var ukrMatch = /сез[оi]н[.\s]*(\d{1,2})[.\s]*сер[ія][.\s]*(\d{1,3})/i.exec(t);
    if (ukrMatch) {
      return {
        season: parseInt(ukrMatch[1], 10),
        episode: parseInt(ukrMatch[2], 10),
        source: "Сезон Серія",
        confidence: 70
      };
    }
    
    // Шукаємо тільки сезон
    var seasonOnlyMatch = /s(\d{1,2})/i.exec(t);
    if (seasonOnlyMatch) {
      return {
        season: parseInt(seasonOnlyMatch[1], 10),
        episode: null,
        source: "Sxx only",
        confidence: 50
      };
    }
    
    return { season: null, episode: null, source: "none", confidence: 0 };
  }

  function S(e, t, n, r) {
    n = n || false;
    r = r || 1;
    
    var title = e.Title || e.title || "";
    var size = e.Size || e.size_bytes || 0;
    
    if (e.ffprobe && Array.isArray(e.ffprobe)) {
      for (var i = 0; i < e.ffprobe.length; i++) {
        var stream = e.ffprobe[i];
        if ("video" === stream.codec_type) {
          if (stream.tags && stream.tags.BPS) {
            var bps = parseInt(stream.tags.BPS, 10);
            if (!isNaN(bps) && bps > 0) return Math.round(bps / 1000000);
          }
          if (stream.bit_rate) {
            var bitrate = parseInt(stream.bit_rate, 10);
            if (!isNaN(bitrate) && bitrate > 0) return Math.round(bitrate / 1000000);
          }
          break;
        }
      }
    }
    
    var runtime = t ? (t.runtime || t.duration || t.episode_run_time) : null;
    if (Array.isArray(runtime)) runtime = runtime.length > 0 ? runtime[0] : 0;
    if (!runtime && n) runtime = 45;
    
    if (size > 0 && runtime > 0) {
      var multiplier = 1;
      if (n) {
        var parsed = k(title);
        if (parsed && parsed.episode && parsed.episode > 0) {
          // Припускаємо, що це одна серія
          multiplier = 1;
        } else if (r > 1) {
          if (size > (/\b2160p\b|4k\b/i.test(title) ? 32212254720 : 10737418240)) {
            multiplier = r;
          }
        }
      }
      
      var totalSeconds = 60 * runtime * multiplier;
      var totalBits = 8 * size;
      var mbps = totalSeconds > 0 ? Math.round(totalBits / Math.pow(1000, 2) / totalSeconds) : 0;
      if (mbps > 0) return Math.min(mbps, 150);
    }
    
    if (e.bitrate) {
      var bitrateMatch = String(e.bitrate).match(/(\d+\.?\d*)/);
      if (bitrateMatch) return Math.round(parseFloat(bitrateMatch[1]));
    }
    
    var titleMatch = title.match(/(\d+\.?\d*)\s*(?:Mbps|Мбит)/i);
    return titleMatch ? Math.round(parseFloat(titleMatch[1])) : 0;
  }

  var M = {
    "Дубляж RU": ["дубляж", "дб", "d", "dub"],
    "Дубляж UKR": ["ukr", "укр"],
    "Дубляж Піфагор": ["піфагор", "пифагор"],
    "Дубляж Red Head Sound": ["red head sound", "rhs"],
    "Дубляж Videofilm": ["videofilm"],
    "Дубляж MovieDalen": ["moviedalen"],
    "Дубляж LeDoyen": ["ledoyen"],
    "Дубляж Whiskey Sound": ["whiskey sound"],
    "Дубляж IRON VOICE": ["iron voice"],
    "Дубляж AlexFilm": ["alexfilm"],
    "Дубляж Amedia": ["amedia"],
    "MVO HDRezka": ["hdrezka", "hdrezka studio"],
    "MVO LostFilm": ["lostfilm"],
    "MVO TVShows": ["tvshows", "tv shows"],
    "MVO Jaskier": ["jaskier"],
    "MVO RuDub": ["rudub"],
    "MVO LE-Production": ["le-production"],
    "MVO Кубик в Кубі": ["кубик в кубе", "кубик в кубі"],
    "MVO NewStudio": ["newstudio"],
    "MVO Good People": ["good people"],
    "MVO IdeaFilm": ["ideafilm"],
    "MVO AMS": ["ams"],
    "MVO Baibako": ["baibako"],
    "MVO Profix Media": ["profix media"],
    "MVO NewComers": ["newcomers"],
    "MVO GoLTFilm": ["goltfilm"],
    "MVO JimmyJ": ["jimmyj"],
    "MVO Kerob": ["kerob"],
    "MVO LakeFilms": ["lakefilms"],
    "MVO Novamedia": ["novamedia"],
    "MVO Twister": ["twister"],
    "MVO Voice Project": ["voice project"],
    "MVO Dragon Money Studio": ["dragon money", "dms"],
    "MVO Syncmer": ["syncmer"],
    "MVO ColdFilm": ["coldfilm"],
    "MVO SunshineStudio": ["sunshinestudio"],
    "MVO Ultradox": ["ultradox"],
    "MVO Octopus": ["octopus"],
    "MVO OMSKBIRD": ["omskbird records", "omskbird"],
    "AVO Володарський": ["володарский"],
    "AVO Яроцький": ["яроцкий", "м. яроцкий"],
    "AVO Сербін": ["сербин", "ю. сербин"],
    "PRO Gears Media": ["gears media"],
    "PRO Hamsterstudio": ["hamsterstudio", "hamster"],
    "PRO P.S.Energy": ["p.s.energy"],
    "UKR НеЗупиняйПродакшн": ["незупиняйпродакшн"],
    Original: ["original"],
  };

  function O(e, t) {
    var title = e.toLowerCase();
    var patterns = M[t] || [];
    for (var i = 0; i < patterns.length; i++) {
      var pattern = patterns[i].toLowerCase();
      if (pattern.length <= 3) {
        var regex = new RegExp("\\b" + pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b", "i");
        if (regex.test(title)) return true;
      } else {
        if (title.indexOf(pattern) !== -1) return true;
      }
    }
    return false;
  }

  function N(e, t, n, r) {
    n = n || false;
    r = r || 1;
    
    var title = (e.Title || e.title || "").toLowerCase();
    var audioTracks = [];
    
    if (e.ffprobe && Array.isArray(e.ffprobe)) {
      for (var i = 0; i < e.ffprobe.length; i++) {
        var stream = e.ffprobe[i];
        if ("audio" === stream.codec_type) {
          var tags = stream.tags || {};
          var handlerName = (tags.title || tags.handler_name || "").toLowerCase();
          var language = (tags.language || "").toLowerCase();
          
          for (var trackName in M) {
            if (M.hasOwnProperty(trackName)) {
              var patterns = M[trackName];
              
              if (trackName === "Дубляж RU" && 
                  (language === "rus" || language === "russian") && 
                  (handlerName.indexOf("dub") !== -1 || handlerName.indexOf("дубляж") !== -1)) {
                if (audioTracks.indexOf(trackName) === -1) audioTracks.push(trackName);
                continue;
              }
              
              for (var j = 0; j < patterns.length; j++) {
                var pat = patterns[j].toLowerCase();
                if (pat.length <= 3) {
                  var regex = new RegExp("\\b" + pat.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b", "i");
                  if (regex.test(handlerName)) {
                    if (audioTracks.indexOf(trackName) === -1) audioTracks.push(trackName);
                    break;
                  }
                } else {
                  if (handlerName.indexOf(pat) !== -1) {
                    if (audioTracks.indexOf(trackName) === -1) audioTracks.push(trackName);
                    break;
                  }
                }
              }
            }
          }
        }
      }
    }
    
    for (var trackName in M) {
      if (M.hasOwnProperty(trackName)) {
        if (audioTracks.indexOf(trackName) !== -1) continue;
        
        var patterns = M[trackName];
        for (var k = 0; k < patterns.length; k++) {
          var pat = patterns[k].toLowerCase();
          if (pat.length <= 3) {
            var regex = new RegExp("\\b" + pat.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b", "i");
            if (regex.test(title)) {
              audioTracks.push(trackName);
              break;
            }
          } else {
            if (title.indexOf(pat) !== -1) {
              audioTracks.push(trackName);
              break;
            }
          }
        }
      }
    }
    
    return {
      resolution: g(e),
      hdr_type: f(e),
      audio_tracks: audioTracks,
      bitrate: S(e, t, n, r),
    };
  }

  // Основна функція обробки результатів
  function R(e, t) {
    try {
      if (!Lampa.Storage.get("easytorrent_enabled", true)) return;
      if (!e || !e.Results || !Array.isArray(e.Results)) return;
      
      console.log("[EasyTorrent] Отримано від парсера:", e.Results.length, "торрентів");
      
      var movieData = t ? t.movie : null;
      var isSeries = false;
      
      // Безпечна перевірка на серіал
      if (movieData) {
        isSeries = !!(movieData.original_name || movieData.number_of_seasons > 0 || movieData.seasons);
      }
      
      var episodesMultiplier = 1;
      if (isSeries) {
        var maxEpisodes = 1;
        for (var idx = 0; idx < e.Results.length; idx++) {
          try {
            var torrent = e.Results[idx];
            if (torrent) {
              var title = torrent.Title || torrent.title || "";
              if (title && w(title)) {
                maxEpisodes = 12; // Типова кількість серій у сезоні
              }
            }
          } catch (err) {
            console.log("[EasyTorrent] Помилка аналізу серіалу:", err);
          }
        }
        episodesMultiplier = maxEpisodes;
      }
      
      var scoredItems = [];
      for (var i = 0; i < e.Results.length; i++) {
        try {
          var torrent = e.Results[i];
          if (!torrent) continue;
          
          var features = N(torrent, movieData, isSeries, episodesMultiplier);
          
          // Функція оцінювання
          var score = 100;
          var seeds = torrent.Seeds || torrent.seeds || torrent.Seeders || torrent.seeders || 0;
          var trackerName = (torrent.Tracker || torrent.tracker || "").toLowerCase();
          
          var breakdown = {
            base: 100,
            resolution: 0,
            hdr: 0,
            bitrate: 0,
            availability: 0,
            audio_track: 0,
            tracker_bonus: 0
          };
          
          if (trackerName.indexOf('toloka') !== -1) {
            breakdown.tracker_bonus = 20;
            score += 20;
          }
          
          var config = d;
          var rules = config.scoring_rules;
          var priority = config.parameter_priority || [
            "resolution", "hdr", "bitrate", "audio_track", "availability", "audio_quality"
          ];
          
          // Resolution
          var resWeight = (rules.weights && rules.weights.resolution || 100) / 100;
          var resBonus = 0;
          if (features.resolution && rules.resolution[features.resolution]) {
            resBonus = rules.resolution[features.resolution] * resWeight;
          }
          breakdown.resolution = resBonus;
          score += resBonus;
          
          // HDR
          var hdrWeight = (rules.weights && rules.weights.hdr || 100) / 100;
          var hdrBonus = 0;
          if (features.hdr_type && rules.hdr[features.hdr_type]) {
            hdrBonus = rules.hdr[features.hdr_type] * hdrWeight;
          }
          breakdown.hdr = hdrBonus;
          score += hdrBonus;
          
          // Bitrate
          var bitrateBonus = 0;
          var bitrateWeight = (rules.weights && rules.weights.bitrate || 55) / 100;
          
          if (features.bitrate > 0 && rules.bitrate_bonus && rules.bitrate_bonus.thresholds) {
            var thresholds = rules.bitrate_bonus.thresholds;
            for (var thIdx = 0; thIdx < thresholds.length; thIdx++) {
              var th = thresholds[thIdx];
              if (features.bitrate >= th.min && features.bitrate < th.max) {
                bitrateBonus = th.bonus * bitrateWeight;
                break;
              }
            }
          }
          breakdown.bitrate = bitrateBonus;
          score += bitrateBonus;
          
          // Audio track
          var audioWeight = (rules.weights && rules.weights.audio_track || 100) / 100;
          var trackPriority = config.audio_track_priority || [];
          var availableTracks = features.audio_tracks || [];
          
          var audioBonus = 0;
          for (var tpIdx = 0; tpIdx < trackPriority.length; tpIdx++) {
            var track = trackPriority[tpIdx];
            var found = false;
            for (var atIdx = 0; atIdx < availableTracks.length; atIdx++) {
              if (O(availableTracks[atIdx], track)) {
                found = true;
                break;
              }
            }
            if (found) {
              audioBonus = 15 * (trackPriority.length - tpIdx) * audioWeight;
              break;
            }
          }
          breakdown.audio_track = audioBonus;
          score += audioBonus;
          
          // Availability (seeds)
          var availWeight = (rules.weights && rules.weights.availability || 70) / 100;
          var minSeeds = config.preferences.min_seeds || 2;
          
          if (seeds >= minSeeds) {
            var availBonus = 12 * Math.log10(seeds + 1) * availWeight;
            breakdown.availability = availBonus;
            score += availBonus;
          }
          
          // Special bonus for 4K
          if (priority[0] === "resolution" && 
              (config.device && config.device.type || "tv_4k").indexOf("4k") !== -1) {
            if (features.resolution === 2160 && features.bitrate > 0) {
              breakdown.special = 80;
              score += 80;
            } else if (features.resolution === 2160) {
              breakdown.special = 30;
              score += 30;
            }
          }
          
          score = Math.max(0, Math.round(score));
          
          scoredItems.push({
            element: torrent,
            originalIndex: i,
            features: features,
            score: score,
            breakdown: breakdown,
          });
          
        } catch (err) {
          console.log("[EasyTorrent] Помилка обробки торрента:", err);
        }
      }
      
      // Сортування
      scoredItems.sort(function(a, b) {
        if (b.score !== a.score) return b.score - a.score;
        var seedsA = a.element.Seeds || a.element.seeds || a.element.Seeders || a.element.seeders || 0;
        var seedsB = b.element.Seeds || b.element.seeds || b.element.Seeders || b.element.seeders || 0;
        return seedsB - seedsA;
      });
      
      // Збереження результатів
      var recCount = d.preferences.recommendation_count || 3;
      var minSeeds = d.preferences.min_seeds || 2;
      
      a = [];
      for (var ri = 0; ri < Math.min(scoredItems.length, recCount); ri++) {
        var rec = scoredItems[ri];
        var seedCount = rec.element.Seeds || rec.element.seeds || rec.element.Seeders || rec.element.seeders || 0;
        if (seedCount >= minSeeds) {
          a.push({
            element: rec.element,
            rank: ri,
            score: rec.score,
            features: rec.features,
            isIdeal: ri === 0 && rec.score >= 150,
          });
        }
      }
      
      // Додаємо метадані до торрентів
      for (var mi = 0; mi < scoredItems.length; mi++) {
        var scored = scoredItems[mi];
        try {
          scored.element._recommendScore = scored.score;
          scored.element._recommendBreakdown = scored.breakdown;
          scored.element._recommendFeatures = scored.features;
          
          // Визначаємо ранг
          var rank = 999;
          for (var ri2 = 0; ri2 < a.length; ri2++) {
            if (a[ri2].element === scored.element) {
              rank = ri2;
              break;
            }
          }
          scored.element._recommendRank = rank;
          scored.element._recommendIsIdeal = (rank === 0 && scored.score >= 150);
          
        } catch (err) {
          console.log("[EasyTorrent] Помилка додавання метаданих:", err);
        }
      }
      
      console.log("[EasyTorrent] Топ-рекомендації збережені");
      
    } catch (err) {
      console.log("[EasyTorrent] Критична помилка в R():", err);
    }
  }

  function C(e) {
    try {
      if (!Lampa.Storage.get("easytorrent_enabled", true)) return;
      
      var element = e.element;
      var item = e.item;
      
      if (!element || !item) return;
      if (element._recommendRank === undefined) return;
      
      var showScores = Lampa.Storage.get("easytorrent_show_scores", true);
      
      item.find(".torrent-recommend-badge").remove();
      item.find(".torrent-recommend-panel").remove();
      
      var rank = element._recommendRank;
      var score = element._recommendScore;
      var breakdown = element._recommendBreakdown || {};
      var recCount = d.preferences.recommendation_count || 3;
      
      if (!(element._recommendIsIdeal || rank < recCount || showScores)) return;
      
      var features = element._recommendFeatures || {};
      var metaParts = [];
      if (features.resolution) metaParts.push(features.resolution + "p");
      if (features.hdr_type) {
        var hdrLabel = {
          dolby_vision: "DV",
          hdr10plus: "HDR10+",
          hdr10: "HDR10",
          sdr: "SDR",
        }[features.hdr_type] || String(features.hdr_type).toUpperCase();
        metaParts.push(hdrLabel);
      }
      if (features.bitrate) metaParts.push(features.bitrate + " Mbps");
      
      var panelType = "neutral";
      var panelLabel = "";
      
      if (element._recommendIsIdeal) {
        panelType = "ideal";
        panelLabel = p("ideal_badge");
      } else if (rank < recCount) {
        panelType = "recommended";
        panelLabel = p("recommended_badge") + " • #" + (rank + 1);
      } else {
        panelType = "neutral";
        panelLabel = "Оцінка";
      }
      
      var panel = $('<div class="torrent-recommend-panel torrent-recommend-panel--' + panelType + '"></div>');
      var leftDiv = $('<div class="torrent-recommend-panel__left"></div>');
      
      leftDiv.append('<div class="torrent-recommend-panel__label">' + panelLabel + '</div>');
      if (metaParts.length) {
        leftDiv.append('<div class="torrent-recommend-panel__meta">' + metaParts.join(" • ") + '</div>');
      }
      
      var rightDiv = $('<div class="torrent-recommend-panel__right"></div>');
      if (showScores && score !== undefined) {
        rightDiv.append('<div class="torrent-recommend-panel__score">' + score + '</div>');
      }
      
      panel.append(leftDiv);
      
      if (showScores) {
        var chipsDiv = $('<div class="torrent-recommend-panel__chips"></div>');
        
        var chipItems = [
          { key: "audio_track", name: "Озвучка" },
          { key: "resolution", name: "Розд." },
          { key: "bitrate", name: "Бітрейт" },
          { key: "availability", name: "Сіди" },
          { key: "hdr", name: "HDR" },
          { key: "special", name: "Бонус" },
        ];
        
        for (var i = 0; i < chipItems.length; i++) {
          var chip = chipItems[i];
          if (breakdown[chip.key] === undefined || breakdown[chip.key] === 0) continue;
          
          var val = Math.round(breakdown[chip.key]);
          var sign = val > 0 ? "+" : "";
          var chipClass = val >= 0 ? "tr-chip--pos" : "tr-chip--neg";
          
          var chipHtml = '<div class="tr-chip ' + chipClass + '">' +
            '<span class="tr-chip__name">' + chip.name + '</span>' +
            '<span class="tr-chip__val">' + sign + val + '</span>' +
            '</div>';
          chipsDiv.append(chipHtml);
        }
        
        if (chipsDiv.children().length > 0) {
          panel.append(chipsDiv);
        }
      }
      
      panel.append(rightDiv);
      item.append(panel);
      
    } catch (err) {
      console.log("[EasyTorrent] Помилка в C():", err);
    }
  }

  function V() {
    try {
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
          try {
            e.css("opacity", "0.7");
            e.find(".settings-param__name").css({ "font-size": "1.2em", "margin-bottom": "0.3em" });
            e.append('<div style="font-size: 0.9em; padding: 0 1.2em; line-height: 1.4;">Автор: DarkestClouds<br>Система рекомендацій торрентів на основі якості, HDR та озвучки</div>');
          } catch (err) {}
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
            try {
              var config = d;
              var summary = config.device.type.toUpperCase() + " | " + config.parameter_priority[0];
              e.find(".settings-param__value").text(summary);
            } catch (err) {}
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
      
    } catch (err) {
      console.log("[EasyTorrent] Помилка в V():", err);
    }
  }

  function I() {
    try {
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
            try {
              if (response && response.Results && Array.isArray(response.Results)) {
                R(response, params);
              }
            } catch (err) {
              console.log("[EasyTorrent] Помилка в callback:", err);
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
      
    } catch (err) {
      console.log("[EasyTorrent] Помилка в I():", err);
    }
  }

  function E() {
    try {
      console.log("[EasyTorrent]", t);
      
      // Завантаження конфігурації
      try {
        var saved = Lampa.Storage.get("easytorrent_config_json");
        if (saved) {
          var parsed = "string" == typeof saved ? JSON.parse(saved) : saved;
          if (parsed && ("2.0" === parsed.version || 2 === parsed.version)) {
            d = parsed;
          }
        }
      } catch (err) {
        d = l;
      }
      
      // Додавання стилів
      try {
        var style = document.createElement("style");
        style.textContent = '\n.torrent-recommend-panel{\n    display: flex;\n    align-items: center;\n    gap: 0.9em;\n    margin: 0.8em -1em -1em;\n    padding: 0.75em 1em 0.85em;\n    border-radius: 0 0 0.3em 0.3em;\n    border-top: 1px solid rgba(255,255,255,0.10);\n    background: rgba(0,0,0,0.18);\n}\n.torrent-recommend-panel__left{\n    min-width: 0;\n    flex: 1 1 auto;\n}\n.torrent-recommend-panel__label{\n    font-size: 0.95em;\n    font-weight: 800;\n    color: rgba(255,255,255,0.92);\n    line-height: 1.15;\n}\n.torrent-recommend-panel__meta{\n    margin-top: 0.25em;\n    font-size: 0.82em;\n    font-weight: 600;\n    color: rgba(255,255,255,0.58);\n    white-space: nowrap;\n    overflow: hidden;\n    text-overflow: ellipsis;\n}\n.torrent-recommend-panel__right{\n    flex: 0 0 auto;\n    display: flex;\n    align-items: center;\n}\n.torrent-recommend-panel__score{\n    font-size: 1.05em;\n    font-weight: 900;\n    padding: 0.25em 0.55em;\n    border-radius: 0.6em;\n    background: rgba(255,255,255,0.10);\n    border: 1px solid rgba(255,255,255,0.12);\n    color: rgba(255,255,255,0.95);\n}\n.torrent-recommend-panel__chips{\n    display: flex;\n    flex: 2 1 auto;\n    gap: 0.45em;\n    flex-wrap: wrap;\n    justify-content: flex-start;\n}\n.tr-chip{\n    display: inline-flex;\n    align-items: baseline;\n    gap: 0.35em;\n    padding: 0.28em 0.55em;\n    border-radius: 999px;\n    background: rgba(255,255,255,0.08);\n    border: 1px solid rgba(255,255,255,0.10);\n}\n.tr-chip__name{\n    font-size: 0.78em;\n    font-weight: 700;\n    color: rgba(255,255,255,0.60);\n}\n.tr-chip__val{\n    font-size: 0.86em;\n    font-weight: 900;\n    color: rgba(255,255,255,0.92);\n}\n.tr-chip--pos{\n    background: rgba(76,175,80,0.10);\n    border-color: rgba(76,175,80,0.22);\n}\n.tr-chip--pos .tr-chip__val{ color: rgba(120,255,170,0.95); }\n.tr-chip--neg{\n    background: rgba(244,67,54,0.10);\n    border-color: rgba(244,67,54,0.22);\n}\n.tr-chip--neg .tr-chip__val{ color: rgba(255,120,120,0.95); }\n.torrent-recommend-panel--ideal{\n    background: rgba(255,215,0,0.16);\n    border-top-color: rgba(255,215,0,0.20);\n}\n.torrent-recommend-panel--ideal .torrent-recommend-panel__label{\n    color: rgba(255,235,140,0.98);\n}\n.torrent-recommend-panel--recommended{\n    background: rgba(76,175,80,0.08);\n    border-top-color: rgba(76,175,80,0.18);\n}\n.torrent-recommend-panel--recommended .torrent-recommend-panel__label{\n    color: rgba(160,255,200,0.92);\n}\n.torrent-item.focus .torrent-recommend-panel{\n    background: rgba(255,255,255,0.08);\n    border-top-color: rgba(255,255,255,0.16);\n}\n';
        document.head.appendChild(style);
      } catch (err) {
        console.log("[EasyTorrent] Помилка додавання стилів:", err);
      }
      
      V();
      
      setTimeout(function() {
        if (window.Lampa && window.Lampa.Parser) {
          I();
        }
      }, 1000);
      
      Lampa.Listener.follow("torrent", function(e) {
        if ("render" === e.type) {
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
      
    } catch (err) {
      console.log("[EasyTorrent] Критична помилка в E():", err);
    }
  }
  
  // Запуск плагіна
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
