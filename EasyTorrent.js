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

  // Повертаємо оригінальну функцію w з виправленнями для Samsung TV
  function w(e) {
    var t = e.toLowerCase();
    var patterns = [
      /(?:^|[^\p{L}\p{N}])(фильм|film|movie|movies)(?=$|[^\p{L}\p{N}])/iu,
      /(?:^|[^\p{L}\p{N}])(спецвыпуск|special|specials|sp|ova|ona|bonus|extra|экстра|спэшл|спешл|спэшал|ова|она|спэшел)(?=$|[^\p{L}\p{N}])/iu,
      /(?:^|[^\p{L}\p{N}])(трейлер|trailer|teaser|тизер)(?=$|[^\p{L}\p{N}])/iu,
      /(?:^|[^\p{L}\p{N}])(саундтрек|ost|soundtrack)(?=$|[^\p{L}\p{N}])/iu,
      /(?:^|[^\p{L}\p{N}])(клип|clip|pv)(?=$|[^\p{L}\p{N}])/iu,
      /(?:^|[^\p{L}\p{N}])(интервью|interview)(?=$|[^\p{L}\p{N}])/iu,
      /(?:^|[^\p{L}\p{N}])(репортаж|report)(?=$|[^\p{L}\p{N}])/iu,
      /(?:^|[^\p{L}\p{N}])(промо|promo)(?=$|[^\p{L}\p{N}])/iu,
      /(?:^|[^\p{L}\p{N}])(отрывок|preview)(?=$|[^\p{L}\p{N}])/iu,
      /(?:^|[^\p{L}\p{N}])(анонс|announcement)(?=$|[^\p{L}\p{N}])/iu,
      /(?:^|[^\p{L}\p{N}])(съемки|making of|behind the scenes)(?=$|[^\p{L}\p{N}])/iu,
      /(?:^|[^\p{L}\p{N}])(сборник|collection)(?=$|[^\p{L}\p{N}])/iu,
      /(?:^|[^\p{L}\p{N}])(документальный|docu|documentary)(?=$|[^\p{L}\p{N}])/iu,
      /(?:^|[^\p{L}\p{N}])(концерт|concert|live)(?=$|[^\p{L}\p{N}])/iu,
      /movie\s*\d+/i,
      /film\s*\d+/i,
      /(?:^|[^\p{L}\p{N}])(мультфильм|аниме-фильм|спецэпизод|спецсерія)(?=$|[^\p{L}\p{N}])/iu,
      /\bepisode of\b/i,
    ];
    
    for (var i = 0; i < patterns.length; i++) {
      if (patterns[i].test(t)) return true;
    }
    return false;
  }

  // Повертаємо оригінальну функцію L
  function L(e, t, n) {
    if ("2x2" === String(n).toLowerCase().replace(/\s+/g, "")) return true;
    var r = e.slice(Math.max(0, t - 12), t).toLowerCase();
    var o = e.slice(t + n.length, t + n.length + 12).toLowerCase();
    var s = /(дб|dub)\s*\(/i.test(r);
    var a = /^\s*\)/.test(o);
    return s && a;
  }

  // Повертаємо оригінальну функцію x
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

  // Повертаємо оригінальну функцію k з виправленнями для Samsung TV
  function k(e) {
    if (e == null) return "";
    
    var t = String(e);
    t = t.replace(/[\u2012\u2013\u2014\u2212]/g, "-");
    t = t.replace(/х/gi, "x");
    t = t.replace(/\u00A0/g, " ");
    t = t.replace(/\s+/g, " ").trim();
    
    var n = null;
    var match = /(?:^|[^\p{L}\p{N}])(?:из|of)\s*(\d{1,4})(?=$|[^\p{L}\p{N}])/iu.exec(t);
    if (match) {
      var totalEp = b(match[1]);
      if (y(totalEp)) n = totalEp;
    }
    
    if (w(t)) return { season: null, episode: null, source: "trash", confidence: 0 };
    
    var seasonCandidates = [];
    var episodeCandidates = [];
    
    var sxxexxMatch = /s(\d{1,2})\s*[ex](\d{1,3})(?:\s*[-]\s*[ex]?(\d{1,3}))?\b/i.exec(t);
    if (sxxexxMatch) {
      var s = b(sxxexxMatch[1]);
      var eRange = h(b(sxxexxMatch[2]), b(sxxexxMatch[3]));
      var eStart = eRange ? eRange.start : null;
      if (_(s)) seasonCandidates.push({ season: s, base: 90, name: "SxxEyy" });
      if (y(eStart)) episodeCandidates.push({ episode: eStart, episodeRange: eRange, base: 90, name: "SxxEyy" });
    }
    
    var sRangeMatch = /\b(\d{1,2})\s*[-]\s*(\d{1,2})\s*x\s*(\d{1,3})(?:\s*[-]\s*(\d{1,4}))?\b/i.exec(t);
    if (sRangeMatch && !L(t, sRangeMatch.index, sRangeMatch[0])) {
      var s1 = b(sRangeMatch[1]);
      var s2 = b(sRangeMatch[2]);
      var e1 = b(sRangeMatch[3]);
      var e2 = b(sRangeMatch[4]);
      var sRange = h(s1, s2);
      var eRange = h(e1, e2);
      if (sRange && _(sRange.start) && _(sRange.end)) {
        seasonCandidates.push({
          season: sRange.start,
          seasonRange: sRange.start !== sRange.end ? sRange : undefined,
          base: 92,
          name: "Srange x Erange",
        });
      }
      if (eRange && y(eRange.start) && y(eRange.end)) {
        episodeCandidates.push({
          episode: eRange.start,
          episodeRange: eRange.start !== eRange.end ? eRange : undefined,
          base: 92,
          name: "Srange x Erange",
        });
      }
    }
    
    var sxxMatch = /\b(\d{1,2})\s*x\s*(\d{1,3})(?:\s*[-]\s*(\d{1,3}))?\b/i.exec(t);
    if (sxxMatch && !L(t, sxxMatch.index, sxxMatch[0])) {
      var sVal = b(sxxMatch[1]);
      var eRange = h(b(sxxMatch[2]), b(sxxMatch[3]));
      var eStart = eRange ? eRange.start : null;
      if (_(sVal)) seasonCandidates.push({ season: sVal, base: 85, name: "xxXyy" });
      if (y(eStart)) episodeCandidates.push({ episode: eStart, episodeRange: eRange, base: 85, name: "xxXyy" });
    }
    
    var bracketMatches = t.match(/[\[\(]([^\]\)]+)[\]\)]?/g);
    if (bracketMatches) {
      for (var bmIdx = 0; bmIdx < bracketMatches.length; bmIdx++) {
        var bracketContent = bracketMatches[bmIdx].replace(/[\[\(\]\)]/g, '');
        var rangeRegex = /(\d{1,4})\s*[-]\s*(\d{1,4})/g;
        var rangeMatch;
        while ((rangeMatch = rangeRegex.exec(bracketContent)) !== null) {
          var start = b(rangeMatch[1]);
          var end = b(rangeMatch[2]);
          if (start == null || end == null || v(start, end)) continue;
          
          var afterText = bracketContent.slice(rangeMatch.index + rangeMatch[0].length, rangeMatch.index + rangeMatch[0].length + 12).toLowerCase();
          var beforeText = bracketContent.slice(Math.max(0, rangeMatch.index - 12), rangeMatch.index).toLowerCase();
          var isEpisode = /(эп|ep|из|of|tv|series|сер)/i.test(beforeText + " " + afterText);
          
          if (!(isEpisode || Math.max(start, end) >= 50)) continue;
          
          var epRange = h(start, end);
          var epStart = epRange ? epRange.start : null;
          episodeCandidates.push({
            episode: y(epStart) ? epStart : null,
            episodeRange: epRange && y(epRange.start) ? epRange : undefined,
            base: isEpisode ? 75 : 70,
            name: "bracket range",
          });
        }
        
        var singleRegex = /(?:эп|ep|сер|серия)\s*(\d{1,4})(?=$|[^\d])/i;
        var altSingle = /(?:^|[^\d])(\d{1,4})(?:\s*(?:из|эп|ep|сер|of|from))(?=$|[^\d])/i.exec(bracketContent) || singleRegex.exec(bracketContent);
        if (altSingle) {
          var epNum = b(altSingle[1]);
          if (y(epNum)) episodeCandidates.push({ episode: epNum, base: 65, name: "bracket single" });
        }
      }
    }
    
    var seasonPatterns = [
      {
        re: /(?:^|[^\p{L}\p{N}])(\d{1,2})(?:\s*[-]\s*(\d{1,2}))?\s*сезон(?:а|ы|ів)?(?=$|[^\p{L}\p{N}])/iu,
        base: 75,
        name: "N сезон",
      },
      {
        re: /(?:^|[^\p{L}\p{N}])сезон(?:а|ы|и|ів)?\s*(\d{1,2})(?:\s*[-]\s*(\d{1,2}))?(?=$|[^\p{L}\p{N}])/iu,
        base: 70,
        name: "Сезон N",
      },
      {
        re: /(?:^|[^\p{L}\p{N}])сезон(?:а|ы|и|ів)?\s*:\s*(\d{1,2})(?:\s*[-]\s*(\d{1,2}))?/iu,
        base: 66,
        name: "Сезон: N",
      },
      {
        re: /\bseason\s*[: ]\s*(\d{1,2})(?:\s*[-]\s*(\d{1,2}))?\b/i,
        base: 55,
        name: "Season:",
      },
      { re: /\bseason\s*(\d{1,2})\b/i, base: 52, name: "Season N" },
      { re: /\[\s*s(\d{1,2})\s*\]/i, base: 80, name: "[Sxx]" },
      { re: /\bs(\d{1,2})\b/i, base: 50, name: "Sxx (season-only)" },
    ];
    
    for (var spIdx = 0; spIdx < seasonPatterns.length; spIdx++) {
      var pattern = seasonPatterns[spIdx];
      var spMatch = pattern.re.exec(t);
      if (!spMatch) continue;
      
      if ("Сезон: N" === pattern.name) {
        var afterText = t.slice(spMatch.index + spMatch[0].length, spMatch.index + spMatch[0].length + 20).toLowerCase();
        if (/^[\s]* (сер|series|episode|эпиз)/i.test(afterText)) continue;
      }
      
      var sVal1 = b(spMatch[1]);
      var sVal2 = b(spMatch[2]);
      if (sVal1 == null) continue;
      
      var sRange = h(sVal1, sVal2);
      seasonCandidates.push({
        season: sRange ? sRange.start : null,
        seasonRange: sRange && sRange.end !== sRange.start ? sRange : undefined,
        base: pattern.base,
        name: pattern.name,
      });
    }
    
    var episodePatterns = [
      {
        re: /(?:^|[^\p{L}\p{N}])(?:серии|серія|серії|эпизод(?:ы)?|episodes|эп\.?)\s*[: ]?\s*(\d{1,4})(?:\s*[-]\s*(\d{1,4}))?(?=$|[^\p{L}\p{N}])/iu,
        base: 60,
        name: "серии",
      },
      {
        re: /(?:^|[^\p{L}\p{N}])(\d{1,4})(?:\s*[-]\s*(\d{1,4}))?\s*(?:серии|серія|серії|эпизод(?:ы)?|эп\.?)(?=$|[^\p{L}\p{N}])/iu,
        base: 62,
        name: "1-4 серии",
      },
      {
        re: /(?:^|[^\p{L}\p{N}])(\d{1,4})\s*[-]\s*(\d{1,4})\s*серия(?=$|[^\p{L}\p{N}])/iu,
        base: 62,
        name: "1-4 серия",
      },
      {
        re: /(?:^|[^\p{L}\p{N}])(\d{1,4})\s*(?:серия|серія)(?=$|[^\p{L}\p{N}])/iu,
        base: 54,
        name: "N серия",
      },
      {
        re: /(?:серии|серії)\s*(\d{1,4})\s*из\s*(\d{1,4})/iu,
        base: 65,
        name: "серии X из Y",
      },
    ];
    
    for (var epIdx = 0; epIdx < episodePatterns.length; epIdx++) {
      var epPattern = episodePatterns[epIdx];
      var epMatch = epPattern.re.exec(t);
      if (!epMatch) continue;
      
      var epStartVal = b(epMatch[1]);
      var epEndVal = b(epMatch[2]);
      if (epStartVal == null) continue;
      
      var epRange = h(epStartVal, epEndVal);
      episodeCandidates.push({
        episode: epRange ? epRange.start : null,
        episodeRange: epRange && epRange.end !== epRange.start ? epRange : undefined,
        base: epPattern.base,
        name: epPattern.name,
      });
    }
    
    seasonCandidates.sort(function(a, b) { return b.base - a.base; });
    episodeCandidates.sort(function(a, b) { return b.base - a.base; });
    
    var bestSeason = seasonCandidates.length > 0 ? seasonCandidates[0] : null;
    var bestEpisode = episodeCandidates.length > 0 ? episodeCandidates[0] : null;
    
    if (bestSeason || bestEpisode) {
      var seasonVal = bestSeason ? bestSeason.season : null;
      var episodeVal = bestEpisode ? bestEpisode.episode : null;
      var seasonRange = bestSeason ? bestSeason.seasonRange : null;
      var episodeRange = bestEpisode ? bestEpisode.episodeRange : null;
      
      var validSeason = seasonVal != null && _(seasonVal) ? seasonVal : null;
      var validEpisode = episodeVal != null && y(episodeVal) ? episodeVal : null;
      
      var sourceParts = [];
      if (bestSeason && bestSeason.name) sourceParts.push(bestSeason.name);
      if (bestEpisode && bestEpisode.name) sourceParts.push(bestEpisode.name);
      
      return {
        season: validSeason,
        seasonRange: seasonRange,
        episode: validEpisode,
        episodeRange: episodeRange,
        episodesTotal: n,
        episodesCount: episodeRange ? (episodeRange.end - episodeRange.start + 1) : (validEpisode != null ? 1 : null),
        source: sourceParts.length > 0 ? sourceParts.join(" + ") : "heuristic",
        confidence: x({
          season: validSeason,
          seasonRange: seasonRange,
          episode: validEpisode,
          episodeRange: episodeRange,
          base: Math.max(bestSeason ? bestSeason.base : 0, bestEpisode ? bestEpisode.base : 0),
          title: t,
        }),
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
        if (parsed && parsed.episodesCount && parsed.episodesCount > 1) {
          multiplier = parsed.episodesCount;
        } else if (parsed && parsed.episodesTotal && parsed.episodesTotal > 1) {
          multiplier = parsed.episodesTotal;
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

  // Основна функція обробки результатів (спрощена для надійності)
  function R(e, t) {
    try {
      if (!Lampa.Storage.get("easytorrent_enabled", true)) return;
      if (!e || !e.Results || !Array.isArray(e.Results)) return;
      
      console.log("[EasyTorrent] Отримано від парсера:", e.Results.length, "торрентів");
      
      var movieData = t ? t.movie : null;
      var isSeries = false;
      
      if (movieData) {
        isSeries = !!(movieData.original_name || movieData.number_of_seasons > 0 || movieData.seasons);
      }
      
      var episodesMultiplier = 1;
      if (isSeries) {
        episodesMultiplier = 12; // Типова кількість серій
      }
      
      var scoredItems = [];
      
      for (var i = 0; i < e.Results.length; i++) {
        try {
          var torrent = e.Results[i];
          if (!torrent) continue;
          
          // Отримуємо характеристики
          var features = N(torrent, movieData, isSeries, episodesMultiplier);
          
          // Оцінюємо торрент
          var seeds = torrent.Seeds || torrent.seeds || torrent.Seeders || torrent.seeders || 0;
          var score = 100;
          
          // Додаємо бонуси за роздільну здатність
          if (features.resolution) {
            if (features.resolution === 2160) score += 85;
            else if (features.resolution === 1080) score += 17;
            else if (features.resolution === 720) score -= 30;
            else if (features.resolution === 480) score -= 60;
          }
          
          // Додаємо бонуси за HDR
          if (features.hdr_type) {
            if (features.hdr_type === "dolby_vision") score += 40;
            else if (features.hdr_type === "hdr10plus" || features.hdr_type === "hdr10") score += 32;
            else if (features.hdr_type === "sdr") score -= 16;
          }
          
          // Додаємо бонуси за бітрейт
          if (features.bitrate > 0) {
            if (features.bitrate >= 60) score += 35;
            else if (features.bitrate >= 30) score += 30;
            else if (features.bitrate >= 15) score += 15;
          }
          
          // Додаємо бонуси за наявність української озвучки
          if (features.audio_tracks) {
            for (var j = 0; j < features.audio_tracks.length; j++) {
              var track = features.audio_tracks[j];
              if (track.indexOf("UKR") !== -1 || track.indexOf("Укра") !== -1) {
                score += 50;
                break;
              }
            }
          }
          
          // Додаємо бонуси за сіди
          if (seeds > 0) {
            score += Math.min(30, Math.log10(seeds) * 15);
          }
          
          score = Math.max(0, Math.min(200, Math.round(score)));
          
          // Зберігаємо результат
          scoredItems.push({
            element: torrent,
            features: features,
            score: score,
            seeds: seeds
          });
          
        } catch (err) {
          console.log("[EasyTorrent] Помилка обробки торрента:", err);
        }
      }
      
      // Сортуємо за оцінкою
      scoredItems.sort(function(a, b) {
        if (b.score !== a.score) return b.score - a.score;
        return b.seeds - a.seeds;
      });
      
      // Зберігаємо результати в глобальний масив
      a = [];
      for (var ri = 0; ri < Math.min(scoredItems.length, 5); ri++) {
        a.push({
          element: scoredItems[ri].element,
          score: scoredItems[ri].score,
          features: scoredItems[ri].features
        });
      }
      
      // Додаємо метадані до торрентів
      for (var mi = 0; mi < scoredItems.length; mi++) {
        var item = scoredItems[mi];
        item.element._recommendScore = item.score;
        item.element._recommendFeatures = item.features;
        item.element._recommendRank = mi;
        item.element._recommendIsIdeal = (mi === 0 && item.score >= 150);
      }
      
      console.log("[EasyTorrent] Оброблено " + scoredItems.length + " торрентів");
      
    } catch (err) {
      console.log("[EasyTorrent] Критична помилка:", err);
    }
  }

  function C(e) {
    try {
      if (!Lampa.Storage.get("easytorrent_enabled", true)) return;
      
      var element = e.element;
      var item = e.item;
      
      if (!element || !item) return;
      if (element._recommendScore === undefined) return;
      
      item.find(".torrent-recommend-panel").remove();
      
      var score = element._recommendScore;
      var features = element._recommendFeatures || {};
      var rank = element._recommendRank;
      
      var metaParts = [];
      if (features.resolution) metaParts.push(features.resolution + "p");
      if (features.hdr_type && features.hdr_type !== "sdr") {
        metaParts.push(features.hdr_type.toUpperCase());
      }
      
      var panelClass = "torrent-recommend-panel";
      var label = "Рекомендовано";
      
      if (rank === 0 && score >= 150) {
        panelClass += " torrent-recommend-panel--ideal";
        label = "Ідеально";
      } else if (rank < 3) {
        panelClass += " torrent-recommend-panel--recommended";
        label = "Рекомендовано #" + (rank + 1);
      }
      
      var panel = $('<div class="' + panelClass + '">' +
        '<div class="torrent-recommend-panel__left">' +
        '<div class="torrent-recommend-panel__label">' + label + '</div>' +
        (metaParts.length ? '<div class="torrent-recommend-panel__meta">' + metaParts.join(" • ") + '</div>' : '') +
        '</div>' +
        '<div class="torrent-recommend-panel__right">' +
        '<div class="torrent-recommend-panel__score">' + score + '</div>' +
        '</div>' +
        '</div>');
      
      item.append(panel);
      
    } catch (err) {
      console.log("[EasyTorrent] Помилка рендеру:", err);
    }
  }

  function V() {
    try {
      if (Lampa.Storage.get("easytorrent_enabled") === undefined) {
        Lampa.Storage.set("easytorrent_enabled", true);
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
      });
      
      Lampa.SettingsApi.addParam({
        component: "easytorrent",
        param: { name: "easytorrent_enabled", type: "trigger", default: true },
        field: {
          name: p("easytorrent_title"),
          description: p("easytorrent_desc"),
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
              if (response && response.Results) {
                R(response, params);
              }
            } catch (err) {
              console.log("[EasyTorrent] Помилка:", err);
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
      
      // Додавання стилів
      try {
        var style = document.createElement("style");
        style.textContent = '\n.torrent-recommend-panel{\n    display: flex;\n    align-items: center;\n    gap: 0.9em;\n    margin: 0.8em -1em -1em;\n    padding: 0.75em 1em 0.85em;\n    border-radius: 0 0 0.3em 0.3em;\n    border-top: 1px solid rgba(255,255,255,0.10);\n    background: rgba(0,0,0,0.18);\n}\n.torrent-recommend-panel__left{\n    min-width: 0;\n    flex: 1 1 auto;\n}\n.torrent-recommend-panel__label{\n    font-size: 0.95em;\n    font-weight: 800;\n    color: rgba(255,255,255,0.92);\n    line-height: 1.15;\n}\n.torrent-recommend-panel__meta{\n    margin-top: 0.25em;\n    font-size: 0.82em;\n    font-weight: 600;\n    color: rgba(255,255,255,0.58);\n}\n.torrent-recommend-panel__right{\n    flex: 0 0 auto;\n}\n.torrent-recommend-panel__score{\n    font-size: 1.05em;\n    font-weight: 900;\n    padding: 0.25em 0.55em;\n    border-radius: 0.6em;\n    background: rgba(255,255,255,0.10);\n    border: 1px solid rgba(255,255,255,0.12);\n    color: rgba(255,255,255,0.95);\n}\n.torrent-recommend-panel--ideal{\n    background: rgba(255,215,0,0.16);\n    border-top-color: rgba(255,215,0,0.20);\n}\n.torrent-recommend-panel--ideal .torrent-recommend-panel__label{\n    color: rgba(255,235,140,0.98);\n}\n.torrent-recommend-panel--recommended{\n    background: rgba(76,175,80,0.08);\n    border-top-color: rgba(76,175,80,0.18);\n}\n.torrent-recommend-panel--recommended .torrent-recommend-panel__label{\n    color: rgba(160,255,200,0.92);\n}\n';
        document.head.appendChild(style);
      } catch (err) {}
      
      V();
      
      setTimeout(function() {
        I();
      }, 1000);
      
      Lampa.Listener.follow("torrent", function(e) {
        if ("render" === e.type) {
          C(e);
        }
      });
      
      console.log("[EasyTorrent] Готовий до роботи!");
      
    } catch (err) {
      console.log("[EasyTorrent] Помилка запуску:", err);
    }
  }
  
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
