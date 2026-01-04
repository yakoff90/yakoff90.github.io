!(function () {
  "use strict";
  var e = "EasyTorrent",
    t = "1.1.0 Beta",
    n = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/></svg>',
    r = "https://wozuelafumpzgvllcjne.supabase.co",
    o = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvenVlbGFmdW1wemd2bGxjam5lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5Mjg1MDgsImV4cCI6MjA4MjUwNDUwOH0.ODnHlq_P-1wr_D6Jwaba1mLXIVuGBnnUZsrHI8Twdug",
    s = "https://darkestclouds.github.io/plugins/easytorrent/";
  var a = [],
    i = null;

  // Конфігурація
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
      "Дубляж LeDoyen",
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
    recommended_section_title: {
      ru: "Рекомендуемые",
      uk: "Рекомендовані",
      en: "Recommended",
    },
    show_scores: { ru: "Показывать оценки", uk: "Показувати бали", en: "Show scores" },
    show_scores_desc: {
      ru: "Отображать оценку качества торрента",
      uk: "Відображати оцінку якості торрента",
      en: "Display torrent quality score",
    },
    ideal_badge: { ru: "Идеальный", uk: "Ідеально", en: "Ideal" },
    recommended_badge: {
      ru: "Рекомендуется",
      uk: "Рекомендовано",
      en: "Recommended",
    },
    config_json: {
      ru: "Конфигурация (JSON)",
      uk: "Конфігурація (JSON)",
      en: "Configuration (JSON)",
    },
    config_json_desc: {
      ru: "Нажмите для просмотра или изменения настроек",
      uk: "Натисніть для перегляду або зміни налаштувань",
      en: "Click to view or change settings",
    },
    config_view: {
      ru: "Просмотреть параметры",
      uk: "Переглянути параметри",
      en: "View parameters",
    },
    config_edit: { ru: "Вставить JSON", uk: "Вставити JSON", en: "Paste JSON" },
    config_reset: {
      ru: "Сбросить к заводским",
      uk: "Скинути до заводських",
      en: "Reset to defaults",
    },
    config_error: {
      ru: "Ошибка: Неверный формат JSON",
      uk: "Помилка: Невірний формат JSON",
      en: "Error: Invalid JSON format",
    },
  };

  function p(e) {
    var t = Lampa.Storage.get("language", "ru");
    return (c[e] && (c[e][t] || c[e].uk || c[e].ru)) || e;
  }

  function u(e) {
    var t = typeof e === "string" ? e : JSON.stringify(e);
    Lampa.Storage.set("easytorrent_config_json", t);
    try {
      d = JSON.parse(t);
    } catch (e) {
      d = l;
    }
  }

  function m() {
    var e = d,
      t = [
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
      onSelect: function (e) {
        if (e.action === "show_voices") {
          (function () {
            var e = d,
              t = e.audio_track_priority.map(function (e, t) {
                return {
                  title: (t + 1) + ". " + e,
                  noselect: true,
                };
              });
            Lampa.Select.show({
              title: "Пріоритет озвучок",
              items: t,
              onBack: function () {
                m();
              },
            });
          })();
        }
      },
      onBack: function () {
        Lampa.Controller.toggle("settings");
      },
    });
  }

  function g(e) {
    var t = (e.Title || e.title || "").toLowerCase();
    if (e.ffprobe && Array.isArray(e.ffprobe)) {
      var n = e.ffprobe.find(function (e) {
        return e.codec_type === "video";
      });
      if (n && n.height) {
        if (n.height >= 2160 || (n.width && n.width >= 3800)) return 2160;
        if (n.height >= 1440 || (n.width && n.width >= 2500)) return 1440;
        if (n.height >= 1080 || (n.width && n.width >= 1900)) return 1080;
        if (n.height >= 720 || (n.width && n.width >= 1260)) return 720;
        return 480;
      }
    }
    if (/\b2160p\b/.test(t) || /\b4k\b/.test(t)) return 2160;
    if (/\b1440p\b/.test(t) || /\b2k\b/.test(t)) return 1440;
    if (/\b1080p\b/.test(t)) return 1080;
    if (/\b720p\b/.test(t)) return 720;
    return null;
  }

  function f(e) {
    var t = (e.Title || e.title || "").toLowerCase(),
      n = [];
    if (e.ffprobe && Array.isArray(e.ffprobe)) {
      var r = e.ffprobe.find(function (e) {
        return e.codec_type === "video";
      });
      if (r && r.side_data_list) {
        r.side_data_list.some(function (e) {
          return (
            e.side_data_type === "DOVI configuration record" ||
            e.side_data_type === "Dolby Vision RPU"
          );
        }) && n.push("dolby_vision");
      }
    }
    if (
      (t.includes("hdr10+") || t.includes("hdr10plus") || t.includes("hdr10 plus")) &&
      !n.includes("hdr10plus")
    ) {
      n.push("hdr10plus");
    }
    if (
      (t.includes("hdr10") || /hdr-?10/.test(t)) &&
      !n.includes("hdr10")
    ) {
      n.push("hdr10");
    }
    if (
      (t.includes("dolby vision") ||
        t.includes("dovi") ||
        /\sp8\s/.test(t) ||
        /\(dv\)/.test(t) ||
        /\[dv\]/.test(t) ||
        /\sdv\s/.test(t) ||
        /,\s*dv\s/.test(t)) &&
      !n.includes("dolby_vision")
    ) {
      n.push("dolby_vision");
    }
    if (
      (/\bhdr\b/.test(t) ||
        t.includes("[hdr]") ||
        t.includes("(hdr)") ||
        t.includes(", hdr")) &&
      !n.includes("hdr10plus") &&
      !n.includes("hdr10")
    ) {
      n.push("hdr10");
    }
    if (
      (t.includes("sdr") || t.includes("[sdr]") || t.includes("(sdr)")) &&
      !n.includes("sdr")
    ) {
      n.push("sdr");
    }
    if (n.length === 0) return "sdr";
    var o = d.scoring_rules && d.scoring_rules.hdr ? d.scoring_rules.hdr : {
        dolby_vision: 40,
        hdr10plus: 32,
        hdr10: 32,
        sdr: -16,
      },
      s = n[0],
      a = o[s] || 0;
    for (var i = 0; i < n.length; i++) {
      var l = o[n[i]] || 0;
      if (l > a) {
        a = l;
        s = n[i];
      }
    }
    return s;
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
    return Number.isInteger ? Number.isInteger(e) && e >= 1 && e <= 60 : Math.floor(e) === e && e >= 1 && e <= 60;
  }

  function y(e) {
    return Number.isInteger ? Number.isInteger(e) && e >= 0 && e <= 5000 : Math.floor(e) === e && e >= 0 && e <= 5000;
  }

  function v(e, t) {
    var n = Number.isInteger ? Number.isInteger(e) && Number.isInteger(t) : Math.floor(e) === e && Math.floor(t) === t;
    return (
      n &&
      !(e < 1900 || e > 2100) &&
      !(t < 1900 || t > 2100) &&
      !(t < e) &&
      t - e <= 60
    );
  }

  function w(e) {
    var t = e.toLowerCase(),
      n = [
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
    for (var r = 0; r < n.length; r++) {
      if (n[r].test(t)) return true;
    }
    return false;
  }

  function L(e, t, n) {
    if (String(n).toLowerCase().replace(/\s+/g, "") === "2x2") return true;
    var r = e.slice(Math.max(0, t - 12), t).toLowerCase(),
      o = e.slice(t + n.length, t + n.length + 12).toLowerCase(),
      s = /(дб|dub)\s*\(/i.test(r),
      a = /^\s*\)/.test(o);
    return s && a;
  }

  function x(e) {
    var t = e.season,
      n = e.seasonRange,
      r = e.episode,
      o = e.episodeRange,
      s = e.base,
      a = e.title;
    if (a && w(a)) return 0;
    var i = s;
    var l = t !== undefined && t !== null ? t : n && n.start !== undefined && n.start !== null ? n.start : null;
    var d = r !== undefined && r !== null ? r : o && o.start !== undefined && o.start !== null ? o.start : null;
    if (l != null) i += 10;
    if (d != null) i += 10;
    if (l != null && d != null) i += 15;
    if (n && n.end !== n.start) i += 5;
    if (o && o.end !== o.start) i += 5;
    if ((l == null || !_(l)) && i !== undefined) i -= 60;
    if ((d == null || !y(d)) && i !== undefined) i -= 60;
    var c = i;
    return isFinite(c) ? Math.max(0, Math.min(100, Math.round(c))) : 0;
  }

  function k(e) {
    var t = (function (e) {
        if (e == null) return "";
        var t = String(e);
        t = t.replace(/[\u2012\u2013\u2014\u2212]/g, "-");
        t = t.replace(/х/gi, "x");
        t = t.replace(/\u00A0/g, " ");
        t = t.replace(/\s+/g, " ").trim();
        return t;
      })(e),
      n = (function (e) {
        var t =
          /(?:^|[^\p{L}\p{N}])(?:из|of)\s*(\d{1,4})(?=$|[^\p{L}\p{N}])/iu.exec(e);
        if (!t) return null;
        var n = b(t[1]);
        return y(n) ? n : null;
      })(t);
    if (w(t))
      return { season: null, episode: null, source: "trash", confidence: 0 };
    var r = [],
      o = [];
    {
      var e = /s(\d{1,2})\s*[ex](\d{1,3})(?:\s*[-]\s*[ex]?(\d{1,3}))?\b/i.exec(t);
      if (e) {
        var s = b(e[1]),
          a = h(b(e[2]), b(e[3])),
          i = a ? a.start : null;
        if (_(s)) r.push({ season: s, base: 90, name: "SxxEyy" });
        if (y(i))
          o.push({ episode: i, episodeRange: a, base: 90, name: "SxxEyy" });
      }
    }
    {
      var e = /\b(\d{1,2})\s*[-]\s*(\d{1,2})\s*x\s*(\d{1,3})(?:\s*[-]\s*(\d{1,4}))?\b/i.exec(
        t
      );
      if (e && !L(t, e.index, e[0])) {
        var l = b(e[1]),
          d = b(e[2]),
          c = b(e[3]),
          p = b(e[4]),
          u = h(l, d),
          m = h(c, p);
        if (u && _(u.start) && _(u.end)) {
          r.push({
            season: u.start,
            seasonRange: u.start !== u.end ? u : undefined,
            base: 92,
            name: "Srange x Erange",
          });
        }
        if (m && y(m.start) && y(m.end)) {
          o.push({
            episode: m.start,
            episodeRange: m.start !== m.end ? m : undefined,
            base: 92,
            name: "Srange x Erange",
          });
        }
      }
    }
    {
      var e = /\b(\d{1,2})\s*x\s*(\d{1,3})(?:\s*[-]\s*(\d{1,3}))?\b/i.exec(t);
      if (e) {
        if (L(t, e.index, e[0])) {
          // skip
        } else {
          var g = b(e[1]),
            f = h(b(e[2]), b(e[3])),
            _y = f ? f.start : null;
          if (_(g)) r.push({ season: g, base: 85, name: "xxXyy" });
          if (y(_y))
            o.push({ episode: _y, episodeRange: f, base: 85, name: "xxXyy" });
        }
      }
    }
    {
      var e = t.matchAll(/[\[\(]([^\]\)]+)[\]\)]?/g);
      var matches = [];
      var match;
      while ((match = e.exec ? e.exec(t) : (matches.length ? matches.shift() : null)) !== null) {
        if (!match) break;
        var B = match[1],
          H = /(\d{1,4})\s*[-]\s*(\d{1,4})/g;
        var rangeMatch;
        while ((rangeMatch = H.exec(B)) !== null) {
          var V = b(rangeMatch[1]),
            I = b(rangeMatch[2]);
          if (V == null || I == null || v(V, I)) continue;
          var E = B.slice(
              rangeMatch.index + rangeMatch[0].length,
              rangeMatch.index + rangeMatch[0].length + 12
            ).toLowerCase(),
            T = B.slice(Math.max(0, rangeMatch.index - 12), rangeMatch.index).toLowerCase(),
            A = /(эп|ep|из|of|tv|series|сер)/i.test(T + " " + E);
          if (!(A || Math.max(V, I) >= 50)) continue;
          var O = h(V, I),
            R = O && O.start !== undefined && O.start !== null ? O.start : null;
          o.push({
            episode: y(R) ? R : null,
            episodeRange: O && y(O.start) ? O : undefined,
            base: A ? 75 : 70,
            name: "bracket range",
          });
        }
        var N = /(?:эп|ep|сер|серия)\s*(\d{1,4})(?=$|[^\d])/i,
          M =
            /(?:^|[^\d])(\d{1,4})(?:\s*(?:из|эп|ep|сер|of|from))(?=$|[^\d])/i.exec(
              B
            ) || N.exec(B);
        if (M) {
          var P = b(M[1]);
          if (y(P)) o.push({ episode: P, base: 65, name: "bracket single" });
        }
      }
    }
    {
      var patterns = [
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
      for (var j = 0; j < patterns.length; j++) {
        var pattern = patterns[j];
        var match = pattern.re.exec(t);
        if (!match) continue;
        if (pattern.name === "Сезон: N") {
          var context = t
            .slice(match.index + match[0].length, match.index + match[0].length + 20)
            .toLowerCase();
          if (/^[\s]* (сер|series|episode|эпиз)/i.test(context)) continue;
        }
        var seasonStart = b(match[1]),
          seasonEnd = b(match[2]);
        if (seasonStart == null) continue;
        var seasonRange = h(seasonStart, seasonEnd);
        r.push({
          season: seasonRange && seasonRange.start !== undefined ? seasonRange.start : null,
          seasonRange: seasonRange && seasonRange.end !== seasonRange.start ? seasonRange : undefined,
          base: pattern.base,
          name: pattern.name,
        });
      }
    }
    {
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
      for (var j = 0; j < episodePatterns.length; j++) {
        var epPattern = episodePatterns[j];
        var match = epPattern.re.exec(t);
        if (!match) continue;
        var epStart = b(match[1]),
          epEnd = b(match[2]);
        if (epStart == null) continue;
        var epRange = h(epStart, epEnd);
        o.push({
          episode: epRange && epRange.start !== undefined ? epRange.start : null,
          episodeRange: epRange && epRange.end !== epRange.start ? epRange : undefined,
          base: epPattern.base,
          name: epPattern.name,
        });
      }
    }
    var bestSeason = r.sort(function (e, t) {
        return t.base - e.base;
      })[0] || null,
      bestEpisode = o.sort(function (e, t) {
        return t.base - e.base;
      })[0] || null;
    if (bestSeason || bestEpisode) {
      var season = bestSeason && bestSeason.season !== undefined ? bestSeason.season : null,
        episode = bestEpisode && bestEpisode.episode !== undefined ? bestEpisode.episode : null,
        seasonRange = bestSeason && bestSeason.seasonRange,
        episodeRange = bestEpisode && bestEpisode.episodeRange,
        validSeason = season != null && _(season) ? season : null,
        validEpisode = episode != null && y(episode) ? episode : null;
      return {
        season: validSeason,
        seasonRange: seasonRange,
        episode: validEpisode,
        episodeRange: episodeRange,
        episodesTotal: n,
        episodesCount: episodeRange
          ? episodeRange.end - episodeRange.start + 1
          : validEpisode != null
          ? 1
          : null,
        source: [bestSeason && bestSeason.name, bestEpisode && bestEpisode.name]
          .filter(function (e) {
            return e;
          })
          .join(" + ") || "heuristic",
        confidence: x({
          season: validSeason,
          seasonRange: seasonRange,
          episode: validEpisode,
          episodeRange: episodeRange,
          base: Math.max(
            bestSeason && bestSeason.base ? bestSeason.base : 0,
            bestEpisode && bestEpisode.base ? bestEpisode.base : 0
          ),
          title: t,
        }),
      };
    }
    return { season: null, episode: null, source: "none", confidence: 0 };
  }

  function S(e, t, n, r) {
    var o = e.Title || e.title || "",
      s = e.Size || e.size_bytes || 0;
    if (e.ffprobe && Array.isArray(e.ffprobe)) {
      var a = e.ffprobe.find(function (e) {
        return e.codec_type === "video";
      });
      if (a) {
        if (a.tags && a.tags.BPS) {
          var i = parseInt(a.tags.BPS, 10);
          if (!isNaN(i) && i > 0) return Math.round(i / 1000000);
        }
        if (a.bit_rate) {
          var l = parseInt(a.bit_rate, 10);
          if (!isNaN(l) && l > 0) return Math.round(l / 1000000);
        }
      }
    }
    var d = t && (t.runtime || t.duration || t.episode_run_time);
    if (Array.isArray(d) && (d = d.length > 0 ? d[0] : 0), !d && n && (d = 45), s > 0 && d > 0) {
      var c = 1;
      if (n) {
        var p = k(o);
        if (p && p.episodesCount && p.episodesCount > 1) c = p.episodesCount;
        else if (p && p.episodesTotal && p.episodesTotal > 1) c = p.episodesTotal;
        else if (r > 1) {
          s > (/\b2160p\b|4k\b/i.test(o) ? 32212254720 : 10737418240) && (c = r);
        }
      }
      var u = 60 * d * c,
        m = 8 * s,
        g = Math.round(m / Math.pow(1000, 2) / u);
      if (g > 0) return Math.min(g, 150);
    }
    if (e.bitrate) {
      var f = String(e.bitrate).match(/(\d+\.?\d*)/);
      if (f) return Math.round(parseFloat(f[1]));
    }
    var b = o.match(/(\d+\.?\d*)\s*(?:Mbps|Мбит)/i);
    return b ? Math.round(parseFloat(b[1])) : 0;
  }

  function N(e, t, n, r) {
    var o = (e.Title || e.title || "").toLowerCase(),
      s = [];
    if (e.ffprobe && Array.isArray(e.ffprobe)) {
      e.ffprobe
        .filter(function (e) {
          return e.codec_type === "audio";
        })
        .forEach(function (e) {
          var t = (function (e) {
            var t = e.tags || {},
              n = (t.title || t.handler_name || "").toLowerCase(),
              r = (t.language || "").toLowerCase(),
              o = [];
            for (var s in M) {
              var a = M[s];
              if (
                s === "Дубляж RU" &&
                (r === "rus" || r === "russian") &&
                (n.includes("dub") || n.includes("дубляж"))
              ) {
                o.push(s);
                continue;
              }
              var i = a.some(function (e) {
                var t = e.toLowerCase();
                if (t === r) return true;
                if (t.length <= 3) {
                  return new RegExp(
                    "\\b" + t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b",
                    "i"
                  ).test(n);
                }
                return n.includes(t);
              });
              if (i) o.push(s);
            }
            return o;
          })(e);
          t.forEach(function (e) {
            if (!s.includes(e)) s.push(e);
          });
        });
    }
    for (var a in M) {
      if (s.includes(a)) continue;
      var i = M[a].some(function (e) {
        var t = e.toLowerCase();
        if (t.length <= 3) {
          return new RegExp(
            "\\b" + t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b",
            "i"
          ).test(o);
        }
        return o.includes(t);
      });
      if (i) s.push(a);
    }
    return {
      resolution: g(e),
      hdr_type: f(e),
      audio_tracks: s,
      bitrate: S(e, t, n, r),
    };
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
    var n = e.toLowerCase();
    return (M[t] || []).some(function (e) {
      var t = e.toLowerCase();
      if (t.length <= 3) {
        return new RegExp(
          "\\b" + t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b",
          "i"
        ).test(n);
      }
      return n.includes(t);
    });
  }

  function R(e, t) {
    if (!Lampa.Storage.get("easytorrent_enabled", true)) return;
    if (!e.Results || !Array.isArray(e.Results)) return;
    console.log(
      "[EasyTorrent] Отримано від парсера:",
      e.Results.length,
      "торрентів"
    );
    var n = t && t.movie,
      r = !(!n || !(n.original_name || n.number_of_seasons > 0 || n.seasons));
    var o = 1;
    if (r) {
      var s = 1,
        a = 1;
      e.Results.forEach(function (e) {
        var t = k(e.Title || e.title || "");
        if (t.episodesCount > s) s = t.episodesCount;
        if (t.episodesTotal > a) a = t.episodesTotal;
      });
      o = s > 1 ? s : a;
      o > 1 &&
        console.log(
          "[EasyTorrent] Режим серіалу. Аналіз: Реал макс=" +
            s +
            ", План=" +
            a +
            ". Використовуємо=" +
            o
        );
    }
    var i = (function () {
        var e = d,
          t = e.scoring_rules;
        return function (n) {
          var r = 100;
          var o = n.features,
            s =
              n.Seeds ||
              n.seeds ||
              n.Seeders ||
              n.seeders ||
              0;
          var trackerName = (n.Tracker || n.tracker || "").toLowerCase();
          var a = {
            base: 100,
            resolution: 0,
            hdr: 0,
            bitrate: 0,
            availability: 0,
            audio: 0,
            audio_track: 0,
            tracker_bonus: 0,
          };
          if (trackerName.includes("toloka")) {
            var tolokaBonus = 20;
            a.tracker_bonus = tolokaBonus;
            r += tolokaBonus;
          }
          var i =
              e.parameter_priority || [
                "resolution",
                "hdr",
                "bitrate",
                "audio_track",
                "availability",
                "audio_quality",
              ],
            l = ((t.weights && t.weights.resolution) || 100) / 100,
            c = (t.resolution[o.resolution] || 0) * l;
          (a.resolution = c), (r += c);
          var p = ((t.weights && t.weights.hdr) || 100) / 100;
          var u = (t.hdr[o.hdr_type] || 0) * p;
          (a.hdr = u), (r += u);
          var m = 0;
          var g =
            ((t.weights && t.weights.bitrate) ||
              100 * (t.bitrate_bonus && t.bitrate_bonus.weight) ||
              55) / 100;
          if (o.bitrate > 0) {
            var f = t.bitrate_bonus.thresholds;
            for (var b = 0; b < f.length; b++) {
              var _ = f[b];
              if (o.bitrate >= _.min && o.bitrate < _.max) {
                m = _.bonus * g;
                break;
              }
            }
          } else {
            var y = i.indexOf("bitrate");
            m = (y === 0 ? -50 : y === 1 ? -30 : -15) * g;
          }
          (a.bitrate = m), (r += m);
          var v = ((t.weights && t.weights.audio_track) || 100) / 100,
            w = e.audio_track_priority || [],
            L = o.audio_tracks || [];
          var x = 0;
          for (var k = 0; k < w.length; k++) {
            var S = w[k];
            if (
              L.some(function (e) {
                return O(e, S);
              })
            ) {
              x = 15 * (w.length - k) * v;
              break;
            }
          }
          (a.audio_track = x), (r += x);
          var N = 0;
          var M =
            (e.preferences && e.preferences.min_seeds) ||
            (t.availability && t.availability.min_seeds) ||
            1;
          var C =
            ((t.weights && t.weights.availability) ||
              100 * (t.availability && t.availability.weight) ||
              70) / 100;
          if (s < M) {
            var V = i.indexOf("availability");
            N = (V === 0 ? -80 : V === 1 ? -40 : -20) * C;
          } else N = 12 * Math.log10(s + 1) * C;
          if (
            ((a.availability = N),
            (r += N),
            i[0] === "resolution" &&
              (e.device && e.device.type || "tv_4k").includes("4k"))
          ) {
            if (o.resolution === 2160 && o.bitrate > 0) {
              a.special = 80;
              r += 80;
            } else if (o.resolution === 2160) {
              a.special = 30;
              r += 30;
            } else if (
              o.resolution === 1080 &&
              s > 50 &&
              o.bitrate > 0
            ) {
              a.special = 10;
              r += 10;
            }
          }
          r = Math.max(0, Math.round(r));
          if (Lampa.Storage.get("easytorrent_show_scores", false)) {
            var I = (n.Title || n.title || "").substring(0, 80);
            console.log("[Score]", I, {
              total: r,
              breakdown: a,
              features: {
                resolution: o.resolution,
                hdr_type: o.hdr_type,
                bitrate: o.bitrate,
                audio_tracks: o.audio_tracks,
              },
              seeds: s,
              paramPriority: i.slice(0, 3),
            });
          }
          return { score: r, breakdown: a };
        };
      })(),
      l = e.Results.map(function (e, t) {
        var n = N(e, r ? t : null, r, o),
          s = i(Object.assign({}, e, { features: n }));
        return {
          element: e,
          originalIndex: t,
          features: n,
          score: s.score,
          breakdown: s.breakdown,
        };
      });
    console.log("[EasyTorrent] Торренти оцінені"),
      l.sort(function (e, t) {
        if (t.score !== e.score) return t.score - e.score;
        if (t.features.bitrate !== e.features.bitrate)
          return t.features.bitrate - e.features.bitrate;
        var n =
          e.element.Seeds ||
          e.element.seeds ||
          e.element.Seeders ||
          e.element.seeders ||
          0;
        return (
          (t.element.Seeds ||
            t.element.seeds ||
            t.element.Seeders ||
            t.element.seeders ||
            0) - n
        );
      }),
      l.length > 0 &&
        (console.log("=== ВСІ ТОРРЕНТИ (відсортовані за score) ==="),
        l.forEach(function (e, t) {
          var n =
              e.element.Seeds ||
              e.element.seeds ||
              e.element.Seeders ||
              e.element.seeders ||
              0,
            r = e.breakdown,
            o = e.element.Title.substring(0, 100),
            s = [];
          if (r.audio_track !== undefined && r.audio_track !== 0)
            s.push(
              "A:" +
                (r.audio_track > 0 ? "+" : "") +
                Math.round(r.audio_track)
            );
          if (r.resolution !== undefined && r.resolution !== 0)
            s.push(
              "R:" +
                (r.resolution > 0 ? "+" : "") +
                Math.round(r.resolution)
            );
          if (r.bitrate !== undefined && r.bitrate !== 0)
            s.push(
              "B:" + (r.bitrate > 0 ? "+" : "") + Math.round(r.bitrate)
            );
          if (r.availability !== undefined && r.availability !== 0)
            s.push(
              "S:" +
                (r.availability > 0 ? "+" : "") +
                Math.round(r.availability)
            );
          if (r.hdr !== undefined && r.hdr !== 0)
            s.push("H:" + (r.hdr > 0 ? "+" : "") + Math.round(r.hdr));
          if (r.special !== undefined && r.special !== 0)
            s.push(
              "SP:" + (r.special > 0 ? "+" : "") + Math.round(r.special)
            );
          var a = s.length > 0 ? "[" + s.join(" ") + "]" : "[no breakdown]";
          console.log(
            (t + 1) +
              ". [" +
              e.score +
              "] " +
              (e.features.resolution || "?") +
              "p " +
              e.features.hdr_type +
              " " +
              e.features.bitrate +
              "mb Seeds:" +
              n +
              " " +
              a +
              " | " +
              o
          );
        }),
        console.log("=== ВСЬОГО: " + l.length + " торрентів ==="));
    var c = d.preferences.recommendation_count || 3,
      p = d.preferences.min_seeds || 2,
      u = l.filter(function (e) {
        var t =
          e.element.Seeds ||
          e.element.seeds ||
          e.element.Seeders ||
          e.element.seeders ||
          0;
        return t >= p;
      });
    (a = u.slice(0, c).map(function (e, t) {
        return {
          element: e.element,
          rank: t,
          score: e.score,
          features: e.features,
          isIdeal: t === 0 && e.score >= 150,
        };
      })),
      l.forEach(function (e) {
        (e.element._recommendScore = e.score),
          (e.element._recommendBreakdown = e.breakdown),
          (e.element._recommendFeatures = e.features);
      }),
      console.log("[EasyTorrent] Всі торренти промарковані балами"),
      console.log("[EasyTorrent] Топ-рекомендації збережені");
  }

  function C(e) {
    if (!Lampa.Storage.get("easytorrent_enabled", true)) return;
    var t = e.element,
      n = e.item;
    var r = Lampa.Storage.get("easytorrent_show_scores", true);
    if (t._recommendRank === undefined) return;
    n.find(".torrent-recommend-badge").remove(),
      n.find(".torrent-recommend-panel").remove();
    var o = t._recommendRank,
      s = t._recommendScore,
      a = t._recommendBreakdown || {},
      i = d.preferences.recommendation_count || 3;
    if (!(t._recommendIsIdeal || o < i || r)) return;
    var l = t._recommendFeatures || {},
      c = [];
    if (l.resolution) c.push(l.resolution + "p");
    if (l.hdr_type) {
      var p = {
        dolby_vision: "DV",
        hdr10plus: "HDR10+",
        hdr10: "HDR10",
        sdr: "SDR",
      }[l.hdr_type];
      c.push(p || String(l.hdr_type).toUpperCase());
    }
    if (l.bitrate) c.push(l.bitrate + " Mbps");
    var u = "neutral",
      m = "";
    if (t._recommendIsIdeal)
      (u = "ideal"), (m = p("ideal_badge"));
    else if (o < i) (u = "recommended"), (m = p("recommended_badge") + " • #" + (o + 1));
    else (u = "neutral"), (m = "Оцінка");
    var g = $(
        '<div class="torrent-recommend-panel torrent-recommend-panel--' +
          u +
          '"></div>'
      ),
      f = $('<div class="torrent-recommend-panel__left"></div>');
    f.append(
      '<div class="torrent-recommend-panel__label">' + m + "</div>"
    ),
      c.length &&
        f.append(
          '<div class="torrent-recommend-panel__meta">' +
            c.join(" • ") +
            "</div>"
        );
    var b = $('<div class="torrent-recommend-panel__right"></div>');
    if (
      r &&
      s !== undefined &&
      b.append(
        '<div class="torrent-recommend-panel__score">' + s + "</div>"
      ),
      g.append(f),
      r
    ) {
      var h = (function (e) {
        if (!e || Object.keys(e).length === 0) return "";
        var t = $('<div class="torrent-recommend-panel__chips"></div>');
        [
          { key: "audio_track", name: "Озвучка" },
          { key: "resolution", name: "Розд." },
          { key: "bitrate", name: "Бітрейт" },
          { key: "availability", name: "Сіди" },
          { key: "hdr", name: "HDR" },
          { key: "special", name: "Бонус" },
        ].forEach(function (n) {
          if (e[n.key] === undefined || e[n.key] === 0) return;
          var r = Math.round(e[n.key]),
            o = r > 0 ? "+" : "",
            s = r >= 0 ? "tr-chip--pos" : "tr-chip--neg";
          t.append(
            '\n                <div class="tr-chip ' +
              s +
              '">\n                    <span class="tr-chip__name">' +
              n.name +
              '</span>\n                    <span class="tr-chip__val">' +
              o +
              r +
              "</span>\n                </div>\n            "
          );
        });
        return t;
      })(a);
      h && g.append(h);
    }
    g.append(b), n.append(g);
  }

  function V() {
    (Lampa.Storage.get("easytorrent_enabled") === undefined &&
      Lampa.Storage.set("easytorrent_enabled", true),
      Lampa.Storage.get("easytorrent_show_scores") === undefined &&
        Lampa.Storage.set("easytorrent_show_scores", true),
      Lampa.SettingsApi.addComponent({
        component: "easytorrent",
        name: e,
        icon: n,
      }),
      Lampa.SettingsApi.addParam({
        component: "easytorrent",
        param: { name: "easytorrent_about", type: "static" },
        field: { name: "<div>" + e + " " + t + "</div>" },
        onRender: function (e) {
          (e.css("opacity", "0.7"),
            e
              .find(".settings-param__name")
              .css({ "font-size": "1.2em", "margin-bottom": "0.3em" }),
            e.append(
              '<div style="font-size: 0.9em; padding: 0 1.2em; line-height: 1.4;">Автор: DarkestClouds<br>Система рекомендацій торрентів на основі якості, HDR та озвучки</div>'
            ));
        },
      }),
      Lampa.SettingsApi.addParam({
        component: "easytorrent",
        param: { name: "easytorrent_enabled", type: "trigger", default: true },
        field: {
          name: p("easytorrent_title"),
          description: p("easytorrent_desc"),
        },
      }),
      Lampa.SettingsApi.addParam({
        component: "easytorrent",
        param: {
          name: "easytorrent_show_scores",
          type: "trigger",
          default: true,
        },
        field: { name: p("show_scores"), description: p("show_scores_desc") },
      }),
      Lampa.SettingsApi.addParam({
        component: "easytorrent",
        param: {
          name: "easytorrent_config_json",
          type: "static",
          default: JSON.stringify(l),
        },
        field: { name: p("config_json"), description: p("config_json_desc") },
        onRender: function (e) {
          var t = function () {
            var t = d,
              n =
                t.device.type.toUpperCase() +
                " | " +
                t.parameter_priority[0];
            e.find(".settings-param__value").text(n);
          };
          t(),
            e.on("hover:enter", function () {
              Lampa.Select.show({
                title: p("config_json"),
                items: [
                  { title: p("config_view"), action: "view" },
                  { title: p("config_edit"), action: "edit" },
                  { title: p("config_reset"), action: "reset" },
                ],
                onSelect: function (e) {
                  if (e.action === "view") m();
                  else if (e.action === "edit")
                    Lampa.Input.edit(
                      {
                        value:
                          Lampa.Storage.get("easytorrent_config_json") ||
                          JSON.stringify(l),
                        free: true,
                      },
                      function (e) {
                        if (e)
                          try {
                            JSON.parse(e), u(e), t(), Lampa.Noty.show("OK");
                          } catch (e) {
                            Lampa.Noty.show(p("config_error"));
                          }
                        Lampa.Controller.toggle("settings");
                      }
                    );
                  else if (e.action === "reset")
                    u(l), t(), Lampa.Noty.show("OK"), Lampa.Controller.toggle("settings");
                },
                onBack: function () {
                  Lampa.Controller.toggle("settings");
                },
              });
            });
        },
      }),
      Lampa.SettingsApi.addParam({
        component: "easytorrent",
        param: { name: "easytorrent_qr_setup", type: "static" },
        field: {
          name: "Розставити пріоритети",
          description: "Відкрийте візард на телефоні через QR-код",
        },
        onRender: function (e) {
          e.on("hover:enter", function () {
            !(function () {
              var e = (function () {
                  var e = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
                    t = "";
                  for (var n = 0; n < 6; n++)
                    t += e.charAt(Math.floor(Math.random() * e.length));
                  return t;
                })(),
                t = s + "?pairCode=" + e,
                n = $(
                  '\n            <div class="about">\n                <div style="text-align: center; margin-bottom: 20px;">\n                    <div id="qrCodeContainer" style="background: white; padding: 20px; border-radius: 15px; display: inline-block; margin-bottom: 20px;height: 20em;width: 20em;"></div>\n                </div>\n                <div class="about__text" style="text-align: center; margin-bottom: 15px;">\n                    <strong>Або перейдіть вручну:</strong><br>\n                    <span style="word-break: break-all;">' +
                    t +
                    '</span>\n                </div>\n                <div class="about__text" style="text-align: center;">\n                    <strong>Код сполучення:</strong>\n                    <div style="font-size: 2em; font-weight: bold; letter-spacing: 0.3em; margin: 10px 0; color: #667eea;">' +
                    e +
                    '</div>\n                </div>\n                <div class="about__text" id="qrStatus" style="text-align: center; padding: 15px; background: rgba(255,255,255,0.05); border-radius: 10px; margin-top: 20px;">\n                    ⏳ Очікування конфігурації...\n                </div>\n            </div>\n        '
                );
              Lampa.Modal.open({
                title: "🔗 Налаштування пріоритетів",
                html: n,
                size: "medium",
                onBack: function () {
                  i && (clearInterval(i), (i = null)),
                    Lampa.Modal.close(),
                    Lampa.Controller.toggle("settings_component");
                },
              }),
                setTimeout(function () {
                  var e = document.getElementById("qrCodeContainer");
                  if (e && Lampa.Utils && Lampa.Utils.qrcode)
                    try {
                      Lampa.Utils.qrcode(t, e);
                    } catch (t) {
                      e.innerHTML =
                        '<p style="color: #f44336;">Помилка генерації QR-коду</p>';
                    }
                }, 100);
              var a = null;
              i = setInterval(function () {
                (function (e) {
                  return fetch(
                    r +
                      "/rest/v1/tv_configs?id=eq." +
                      encodeURIComponent(e) +
                      "&select=data,updated_at",
                    {
                      headers: {
                        apikey: o,
                        Authorization: "Bearer " + o,
                      },
                    }
                  )
                    .then(function (t) {
                      if (!t.ok)
                        throw new Error("Fetch failed: " + t.status);
                      return t.json();
                    })
                    .then(function (t) {
                      return t.length ? t[0].data : null;
                    })
                    .catch(function (e) {
                      return console.error("[EasyTorrent] Fetch error:", e), null;
                    });
                })(e).then(function (t) {
                  if (t) {
                    var n = t.generated;
                    n !== a &&
                      ((a = n),
                      u(t),
                      $("#qrStatus")
                        .html("✅ Конфігурація отримана!")
                        .css("color", "#4CAF50"),
                      setTimeout(function () {
                        i && (clearInterval(i), (i = null)),
                          Lampa.Modal.close(),
                          Lampa.Noty.show("Конфігурація оновлена!"),
                          Lampa.Controller.toggle("settings_component");
                      }, 2000));
                  }
                });
              }, 5000);
            })();
          });
        },
      }));
  }

  function I() {
    var e =
      window.Lampa.Parser ||
      (window.Lampa.Component ? window.Lampa.Component.Parser : null);
    if (!e || !e.get)
      return void console.log("[EasyTorrent] Parser не знайдено");
    console.log("[EasyTorrent] Патчимо Parser.get");
    var t = e.get;
    (e.get = function (e, n, r) {
      return t.call(
        this,
        e,
        function (t) {
          if (t && t.Results && Array.isArray(t.Results)) {
            R(t, e);
            var n = t.Results;
            var o = function (e) {
                if (!Array.isArray(e) || e.length === 0) return e;
                var t = d.preferences.recommendation_count || 3,
                  n = d.preferences.min_seeds || 0,
                  r = e
                    .filter(function (e) {
                      var t =
                        e.Seeds ||
                        e.seeds ||
                        e.Seeders ||
                        e.seeders ||
                        0;
                      return (e._recommendScore || 0) > 0 && t >= n;
                    })
                    .sort(function (e, t) {
                      return (
                        (t._recommendScore || 0) - (e._recommendScore || 0)
                      );
                    })
                    .slice(0, t);
                if (r.length === 0) {
                  e.forEach(function (e) {
                    e._recommendRank = 999;
                  });
                  return e;
                }
                var o = e.filter(function (e) {
                    return !r.includes(e);
                  }),
                  s = r.concat(o);
                return (
                  s.forEach(function (e, t) {
                    (e._recommendRank = t),
                      (e._recommendIsIdeal =
                        t === 0 && (e._recommendScore || 0) >= 150);
                  }),
                  o.forEach(function (e) {
                    e._recommendRank = 999;
                  }),
                  s
                );
              },
              s = function (e) {
                if (!e || e._recommendPatched) return e;
                var t = e.sort;
                e.sort = function () {
                  t.apply(this, arguments);
                  var e = o(this);
                  for (var n = 0; n < e.length; n++) this[n] = e[n];
                  return this;
                };
                var n = e.filter;
                return (
                  (e.filter = function () {
                    var e = n.apply(this, arguments),
                      t = o(e);
                    return s(t);
                  }),
                  (e._recommendPatched = true),
                  e
                );
              };
            n = s(o(n));
            try {
              Object.defineProperty(t, "Results", {
                get: function () {
                  return n;
                },
                set: function (e) {
                  n = s(o(e));
                },
                configurable: true,
                enumerable: true,
              }),
                console.log("[EasyTorrent] Контекстна фільтрація активована");
            } catch (e) {
              console.log("[EasyTorrent] Помилка при фіксації топів:", e);
            }
          }
          return n.apply(this, arguments);
        },
        r
      );
    }),
      console.log("[EasyTorrent] Parser.get пропатчено!");
  }

  function E() {
    console.log("[EasyTorrent]", t),
      (function () {
        var e = Lampa.Storage.get("easytorrent_config_json");
        if (e)
          try {
            var t = typeof e === "string" ? JSON.parse(e) : e;
            if (t && (t.version === "2.0" || t.version === 2))
              return void (d = t);
          } catch (e) {}
        d = l;
      })(),
      (function () {
        var e = document.createElement("style");
        (e.textContent =
          '\n/* Панель рекомендацій (футер всередині .torrent-item) */\n.torrent-recommend-panel{\n    display: flex;\n    align-items: center;\n    gap: 0.9em;\n    margin: 0.8em -1em -1em;        /* "приклеюємо" до країв картки */\n    padding: 0.75em 1em 0.85em;\n    border-radius: 0 0 0.3em 0.3em; /* співпадає з torrent-item */\n    border-top: 1px solid rgba(255,255,255,0.10);\n    background: rgba(0,0,0,0.18);\n    backdrop-filter: blur(6px);\n    -webkit-backdrop-filter: blur(6px);\n}\n\n.torrent-recommend-panel__left{\n    min-width: 0;\n    flex: 1 1 auto;\n}\n\n.torrent-recommend-panel__label{\n    font-size: 0.95em;\n    font-weight: 800;\n    letter-spacing: 0.2px;\n    color: rgba(255,255,255,0.92);\n    line-height: 1.15;\n}\n\n.torrent-recommend-panel__meta{\n    margin-top: 0.25em;\n    font-size: 0.82em;\n    font-weight: 600;\n    color: rgba(255,255,255,0.58);\n    white-space: nowrap;\n    overflow: hidden;\n    text-overflow: ellipsis;\n}\n\n.torrent-recommend-panel__right{\n    flex: 0 0 auto;\n    display: flex;\n    align-items: center;\n}\n\n.torrent-recommend-panel__score{\n    font-size: 1.05em;\n    font-weight: 900;\n    padding: 0.25em 0.55em;\n    border-radius: 0.6em;\n    background: rgba(255,255,255,0.10);\n    border: 1px solid rgba(255,255,255,0.12);\n    color: rgba(255,255,255,0.95);\n}\n\n/* Чіпси breakdown */\n.torrent-recommend-panel__chips{\n    display: flex;\n    flex: 2 1 auto;\n    gap: 0.45em;\n    flex-wrap: wrap;\n    justify-content: flex-start;\n}\n\n.torrent-recommend-panel__chips:empty{\n    display: none;\n}\n\n.tr-chip{\n    display: inline-flex;\n    align-items: baseline;\n    gap: 0.35em;\n    padding: 0.28em 0.55em;\n    border-radius: 999px;\n    background: rgba(255,255,255,0.08);\n    border: 1px solid rgba(255,255,255,0.10);\n}\n\n.tr-chip__name{\n    font-size: 0.78em;\n    font-weight: 700;\n    color: rgba(255,255,255,0.60);\n}\n\n.tr-chip__val{\n    font-size: 0.86em;\n    font-weight: 900;\n    color: rgba(255,255,255,0.92);\n}\n\n.tr-chip--pos{\n    background: rgba(76,175,80,0.10);\n    border-color: rgba(76,175,80,0.22);\n}\n.tr-chip--pos .tr-chip__val{ color: rgba(120,255,170,0.95); }\n\n.tr-chip--neg{\n    background: rgba(244,67,54,0.10);\n    border-color: rgba(244,67,54,0.22);\n}\n.tr-chip--neg .tr-chip__val{ color: rgba(255,120,120,0.95); }\n\n/* Варіанти */\n.torrent-recommend-panel--ideal{\n    background: linear-gradient(135deg, rgba(255,215,0,0.16) 0%, rgba(255,165,0,0.08) 100%);\n    border-top-color: rgba(255,215,0,0.20);\n}\n.torrent-recommend-panel--ideal .torrent-recommend-panel__label{\n    color: rgba(255,235,140,0.98);\n}\n\n.torrent-recommend-panel--recommended{\n    background: rgba(76,175,80,0.08);\n    border-top-color: rgba(76,175,80,0.18);\n}\n.torrent-recommend-panel--recommended .torrent-recommend-panel__label{\n    color: rgba(160,255,200,0.92);\n}\n\n/* Анімація */\n.torrent-recommend-panel{\n    animation: tr-panel-in 0.22s ease-out;\n}\n@keyframes tr-panel-in{\n    from{ opacity: 0; transform: translateY(-3px); }\n    to{ opacity: 1; transform: translateY(0); }\n}\n\n/* Підсвітка */\n.torrent-item.focus .torrent-recommend-panel{\n    background: rgba(255,255,255,0.08);\n    border-top-color: rgba(255,255,255,0.16);\n}\n\n/* Компакт */\n@media (max-width: 520px){\n    .torrent-recommend-panel{\n        gap: 0.7em;\n        padding: 0.65em 0.9em 0.75em;\n    }\n    .torrent-recommend-panel__meta{\n        display: none;\n    }\n}\n'),
          document.head.appendChild(e));
      })(),
      V(),
      window.Lampa && window.Lampa.Parser
        ? I()
        : setTimeout(function () {
            I();
          }, 1000),
      Lampa.Listener.follow("torrent", function (e) {
        e.type === "render" && C(e);
      }),
      Lampa.Listener.follow("activity", function (e) {
        e.type === "start" &&
          e.component === "torrents" &&
          (console.log("[EasyTorrent] Нова сторінка торрентів"), (a = []));
      }),
      console.log("[EasyTorrent] Готовий до роботи!");
  }
  if (window.appready) E();
  else
    Lampa.Listener.follow("app", function (e) {
      e.type === "ready" && E();
    });
})();
