!(function () {
  "use strict";
  
  console.log("[EasyTorrent] Завантаження плагіна v1.1.0 для Samsung TV...");
  
  const PLUGIN_NAME = "EasyTorrent";
  const PLUGIN_VERSION = "1.1.0";
  const PLUGIN_ICON = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/></svg>';
  
  // Константи для QR-налаштувань
  const SUPABASE_URL = "https://wozuelafumpzgvllcjne.supabase.co";
  const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvenVlbGFmdW1wemd2bGxjam5lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5Mjg1MDgsImV4cCI6MjA4MjUwNDUwOH0.ODnHlq_P-1wr_D6Jwaba1mLXIVuGBnnUZsrHI8Twdug";
  const PLUGIN_WEB_URL = "https://darkestclouds.github.io/plugins/easytorrent/";
  
  let syncInterval = null;
  
  // Конфігурація за замовчуванням
  const defaultConfig = {
    version: "2.0",
    generated: "2026-01-01T21:21:24.718Z",
    device: {
      type: "tv_4k",
      supported_hdr: ["hdr10", "hdr10plus", "dolby_vision"],
      supported_audio: ["stereo"],
    },
    network: { speed: "very_fast", stability: "stable" },
    parameter_priority: [
      "audio_track",    // 1-ше місце
      "resolution",     // 2-ге місце  
      "availability",   // 3-тє місце
      "bitrate",        // 4-те місце
      "hdr",           // 5-те місце
      "audio_quality",  // 6-те місце
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

  let currentConfig = defaultConfig;
  
  // Локалізація
  const localization = {
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

  // Допоміжні функції
  function getLocalizedText(key) {
    const lang = Lampa.Storage.get("language", "ru");
    return (localization[key] && (localization[key][lang] || localization[key].uk || localization[key].ru)) || key;
  }
  
  function saveConfig(config) {
    const configStr = typeof config === 'string' ? config : JSON.stringify(config);
    Lampa.Storage.set("easytorrent_config_json", configStr);
    try {
      currentConfig = JSON.parse(configStr);
      console.log("[EasyTorrent] Конфігурацію збережено:", currentConfig.version);
    } catch (e) {
      console.error("[EasyTorrent] Помилка парсингу конфігурації:", e);
      currentConfig = defaultConfig;
    }
  }
  
  // ВАЖЛИВО: Функція завантаження конфігурації
  function loadConfig() {
    try {
      const savedConfig = Lampa.Storage.get("easytorrent_config_json");
      if (savedConfig) {
        currentConfig = JSON.parse(savedConfig);
        console.log("[EasyTorrent] Конфігурацію завантажено з пам'яті");
      } else {
        saveConfig(defaultConfig);
      }
    } catch (error) {
      console.error("[EasyTorrent] Помилка завантаження конфігурації:", error);
      currentConfig = defaultConfig;
    }
  }
  
  // Виправлена функція для отримання штрафу за пріоритет
  function getPenaltyForParameter(paramName) {
    const paramPriority = currentConfig.parameter_priority || [];
    const index = paramPriority.indexOf(paramName);
    
    // Якщо параметр не в пріоритетах - стандартний штраф
    if (index === -1) return -15;
    
    // Чим вище пріоритет (менший index) - тим більший штраф
    switch(index) {
      case 0: return -80;  // Найвищий пріоритет (1-ше місце)
      case 1: return -40;  // 2-ге місце
      case 2: return -20;  // 3-тє місце
      case 3: return -15;  // 4-те місце
      default: return -10; // Решта
    }
  }
  
  // Виправлена функція оцінювання з ПРАЦЮЮЧИМИ пріоритетами
  function calculateScore(torrent, features) {
    const seeds = torrent.Seeds || torrent.seeds || torrent.Seeders || torrent.seeders || 0;
    const scoringRules = currentConfig.scoring_rules;
    
    let score = 100;
    let breakdown = {
      base: 100,
      resolution: 0,
      hdr: 0,
      bitrate: 0,
      availability: 0,
      audio_track: 0,
      tracker_bonus: 0
    };
    
    // Бонус за Toloka
    const trackerName = (torrent.Tracker || torrent.tracker || "").toLowerCase();
    if (trackerName.includes('toloka')) {
      const tolokaBonus = 20;
      breakdown.tracker_bonus = tolokaBonus;
      score += tolokaBonus;
    }
    
    // Оцінка роздільної здатності
    if (features.resolution) {
      const resScore = scoringRules.resolution[features.resolution] || 0;
      const resWeight = (scoringRules.weights.resolution || 85) / 100;
      breakdown.resolution = resScore * resWeight;
      score += breakdown.resolution;
    }
    
    // Оцінка HDR
    if (features.hdr_type) {
      const hdrScore = scoringRules.hdr[features.hdr_type] || 0;
      const hdrWeight = (scoringRules.weights.hdr || 40) / 100;
      breakdown.hdr = hdrScore * hdrWeight;
      score += breakdown.hdr;
    }
    
    // Оцінка бітрейту (З ПРАВИЛЬНИМИ ПРОРІОРИТЕТАМИ)
    const bitrateWeight = (scoringRules.weights.bitrate || 55) / 100;
    if (features.bitrate > 0) {
      const thresholds = scoringRules.bitrate_bonus.thresholds;
      for (let i = 0; i < thresholds.length; i++) {
        if (features.bitrate >= thresholds[i].min && features.bitrate < thresholds[i].max) {
          breakdown.bitrate = thresholds[i].bonus * bitrateWeight;
          score += breakdown.bitrate;
          break;
        }
      }
    } else {
      // ВИПРАВЛЕНО: Використовуємо функцію для правильного штрафу
      breakdown.bitrate = getPenaltyForParameter("bitrate") * bitrateWeight;
      score += breakdown.bitrate;
    }
    
    // Оцінка озвучки
    const audioWeight = (scoringRules.weights.audio_track || 100) / 100;
    const priorityTracks = currentConfig.audio_track_priority || [];
    const torrentTracks = features.audio_tracks || [];
    
    let audioScore = 0;
    for (let i = 0; i < priorityTracks.length; i++) {
      const trackName = priorityTracks[i];
      if (torrentTracks.includes(trackName)) {
        // Більший бонус за вищий пріоритет
        audioScore = 25 * (priorityTracks.length - i);
        break;
      }
    }
    
    breakdown.audio_track = audioScore * audioWeight;
    score += breakdown.audio_track;
    
    // Оцінка доступності (сіди)
    const availabilityWeight = (scoringRules.weights.availability || 70) / 100;
    const minSeeds = currentConfig.preferences.min_seeds || 2;
    
    if (seeds < minSeeds) {
      // ВИПРАВЛЕНО: Використовуємо функцію для правильного штрафу
      breakdown.availability = getPenaltyForParameter("availability") * availabilityWeight;
    } else {
      // Бонус за кількість сідів
      breakdown.availability = 15 * Math.log10(seeds + 1) * availabilityWeight;
    }
    
    score += breakdown.availability;
    
    // Спеціальний бонус для 4K
    const firstPriority = currentConfig.parameter_priority[0];
    if (firstPriority === "resolution" && currentConfig.device.type.includes("4k")) {
      if (features.resolution === 2160 && features.bitrate > 0) {
        breakdown.special = 80;
        score += 80;
      } else if (features.resolution === 2160) {
        breakdown.special = 30;
        score += 30;
      } else if (features.resolution === 1080 && seeds > 50 && features.bitrate > 0) {
        breakdown.special = 10;
        score += 10;
      }
    }
    
    // Округлення
    score = Math.max(0, Math.round(score));
    
    return {
      score: score,
      breakdown: breakdown,
      seeds: seeds
    };
  }
  
  // Словник озвучок (залишається без змін)
  const audioTracksDict = {
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
  
  // Функції аналізу (залишаються без змін)
  function getResolution(torrent) {
    const title = (torrent.Title || torrent.title || "").toLowerCase();
    
    if (torrent.ffprobe && Array.isArray(torrent.ffprobe)) {
      for (let i = 0; i < torrent.ffprobe.length; i++) {
        if (torrent.ffprobe[i].codec_type === "video") {
          const video = torrent.ffprobe[i];
          if (video.height) {
            if (video.height >= 2160 || (video.width && video.width >= 3800)) return 2160;
            if (video.height >= 1440 || (video.width && video.width >= 2500)) return 1440;
            if (video.height >= 1080 || (video.width && video.width >= 1900)) return 1080;
            if (video.height >= 720 || (video.width && video.width >= 1260)) return 720;
            return 480;
          }
        }
      }
    }
    
    if (title.includes("2160p") || title.includes("4k")) return 2160;
    if (title.includes("1440p") || title.includes("2k")) return 1440;
    if (title.includes("1080p")) return 1080;
    if (title.includes("720p")) return 720;
    
    return null;
  }
  
  function getHDRType(torrent) {
    const title = (torrent.Title || torrent.title || "").toLowerCase();
    const hdrTypes = [];
    
    if (torrent.ffprobe && Array.isArray(torrent.ffprobe)) {
      for (let i = 0; i < torrent.ffprobe.length; i++) {
        if (torrent.ffprobe[i].codec_type === "video" && torrent.ffprobe[i].side_data_list) {
          const sideData = torrent.ffprobe[i].side_data_list;
          for (let j = 0; j < sideData.length; j++) {
            if (sideData[j].side_data_type && 
                (sideData[j].side_data_type.includes("DOVI") || 
                 sideData[j].side_data_type.includes("Dolby Vision"))) {
              hdrTypes.push("dolby_vision");
              break;
            }
          }
        }
      }
    }
    
    if (title.includes("hdr10+") || title.includes("hdr10plus")) {
      if (!hdrTypes.includes("hdr10plus")) hdrTypes.push("hdr10plus");
    }
    
    if (title.includes("hdr10")) {
      if (!hdrTypes.includes("hdr10")) hdrTypes.push("hdr10");
    }
    
    if (title.includes("dolby vision") || title.includes("dovi")) {
      if (!hdrTypes.includes("dolby_vision")) hdrTypes.push("dolby_vision");
    }
    
    if (title.includes("sdr")) {
      if (!hdrTypes.includes("sdr")) hdrTypes.push("sdr");
    }
    
    if (hdrTypes.length === 0) return "sdr";
    
    const hdrScores = {
      dolby_vision: 40,
      hdr10plus: 32,
      hdr10: 32,
      sdr: -16
    };
    
    let bestHDR = hdrTypes[0];
    let bestScore = hdrScores[bestHDR] || 0;
    
    for (let i = 1; i < hdrTypes.length; i++) {
      const score = hdrScores[hdrTypes[i]] || 0;
      if (score > bestScore) {
        bestScore = score;
        bestHDR = hdrTypes[i];
      }
    }
    
    return bestHDR;
  }
  
  function getBitrate(torrent, movieInfo, isSeries, episodeCount) {
    const title = torrent.Title || torrent.title || "";
    const size = torrent.Size || torrent.size_bytes || 0;
    
    if (torrent.ffprobe && Array.isArray(torrent.ffprobe)) {
      for (let i = 0; i < torrent.ffprobe.length; i++) {
        if (torrent.ffprobe[i].codec_type === "video") {
          const video = torrent.ffprobe[i];
          
          if (video.tags && video.tags.BPS) {
            const bps = parseInt(video.tags.BPS, 10);
            if (!isNaN(bps) && bps > 0) return Math.round(bps / 1000000);
          }
          
          if (video.bit_rate) {
            const bps = parseInt(video.bit_rate, 10);
            if (!isNaN(bps) && bps > 0) return Math.round(bps / 1000000);
          }
        }
      }
    }
    
    let duration = movieInfo ? (movieInfo.runtime || movieInfo.duration || movieInfo.episode_run_time) : 0;
    if (Array.isArray(duration)) duration = duration[0] || 0;
    
    if (isSeries && !duration) duration = 45;
    
    if (size > 0 && duration > 0) {
      let episodeMultiplier = 1;
      if (isSeries && episodeCount > 1) {
        episodeMultiplier = episodeCount;
      }
      
      const totalSeconds = 60 * duration * episodeMultiplier;
      const totalBits = 8 * size;
      const bitrateMbps = Math.round(totalBits / (1000 * 1000) / totalSeconds);
      
      if (bitrateMbps > 0) return Math.min(bitrateMbps, 150);
    }
    
    const bitrateMatch = title.match(/(\d+\.?\d*)\s*(?:Mbps|Мбит)/i);
    if (bitrateMatch) return Math.round(parseFloat(bitrateMatch[1]));
    
    return 0;
  }
  
  function getAudioTracks(torrent) {
    const title = (torrent.Title || torrent.title || "").toLowerCase();
    const tracks = [];
    
    if (torrent.ffprobe && Array.isArray(torrent.ffprobe)) {
      for (let i = 0; i < torrent.ffprobe.length; i++) {
        if (torrent.ffprobe[i].codec_type === "audio") {
          const audio = torrent.ffprobe[i];
          const tags = audio.tags || {};
          const audioTitle = (tags.title || tags.handler_name || "").toLowerCase();
          const language = (tags.language || "").toLowerCase();
          
          for (const trackName in audioTracksDict) {
            if (tracks.includes(trackName)) continue;
            
            const patterns = audioTracksDict[trackName];
            let found = false;
            
            for (let j = 0; j < patterns.length; j++) {
              const pattern = patterns[j].toLowerCase();
              
              if (trackName === "Дубляж RU") {
                if ((language === "rus" || language === "russian") && 
                    (audioTitle.includes("dub") || audioTitle.includes("дубляж"))) {
                  found = true;
                  break;
                }
              }
              
              if (pattern === language) {
                found = true;
                break;
              }
              
              if (pattern.length <= 3) {
                const regex = new RegExp("\\b" + pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b", "i");
                if (regex.test(audioTitle)) {
                  found = true;
                  break;
                }
              } else if (audioTitle.includes(pattern)) {
                found = true;
                break;
              }
            }
            
            if (found) tracks.push(trackName);
          }
        }
      }
    }
    
    for (const trackName in audioTracksDict) {
      if (tracks.includes(trackName)) continue;
      
      const patterns = audioTracksDict[trackName];
      let found = false;
      
      for (let j = 0; j < patterns.length; j++) {
        const pattern = patterns[j].toLowerCase();
        
        if (pattern.length <= 3) {
          const regex = new RegExp("\\b" + pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b", "i");
          if (regex.test(title)) {
            found = true;
            break;
          }
        } else if (title.includes(pattern)) {
          found = true;
          break;
        }
      }
      
      if (found) tracks.push(trackName);
    }
    
    return tracks;
  }
  
  // Обробка результатів парсера (ВИПРАВЛЕНА)
  function processParserResults(data, source) {
    if (!data || !data.Results || !Array.isArray(data.Results)) return;
    
    console.log("[EasyTorrent] Обробка", data.Results.length, "торрентів");
    
    const movieInfo = source ? source.movie : null;
    const isSeries = movieInfo && (movieInfo.original_name || movieInfo.number_of_seasons > 0 || movieInfo.seasons);
    
    // Аналізуємо всі торренти
    const scoredTorrents = [];
    
    for (let i = 0; i < data.Results.length; i++) {
      const torrent = data.Results[i];
      
      // Отримуємо характеристики
      const features = {
        resolution: getResolution(torrent),
        hdr_type: getHDRType(torrent),
        audio_tracks: getAudioTracks(torrent),
        bitrate: getBitrate(torrent, movieInfo, isSeries, 1)
      };
      
      // Розраховуємо оцінку З ПРАЦЮЮЧИМИ ПРОРІОРИТЕТАМИ
      const scoreResult = calculateScore(torrent, features);
      
      scoredTorrents.push({
        element: torrent,
        originalIndex: i,
        features: features,
        score: scoreResult.score,
        breakdown: scoreResult.breakdown,
        seeds: scoreResult.seeds
      });
    }
    
    // Сортуємо за оцінкою
    scoredTorrents.sort(function(a, b) {
      if (b.score !== a.score) return b.score - a.score;
      if (b.features.bitrate !== a.features.bitrate) return b.features.bitrate - a.features.bitrate;
      return b.seeds - a.seeds;
    });
    
    // Зберігаємо інформацію в торрентах
    for (let i = 0; i < scoredTorrents.length; i++) {
      const item = scoredTorrents[i];
      item.element._recommendScore = item.score;
      item.element._recommendBreakdown = item.breakdown;
      item.element._recommendFeatures = item.features;
      item.element._recommendRank = i;
      item.element._recommendIsIdeal = (i === 0 && item.score >= 150);
    }
    
    // Логування для дебагу
    if (Lampa.Storage.get("easytorrent_show_scores", false)) {
      console.log("=== EasyTorrent Scores ===");
      for (let i = 0; i < Math.min(10, scoredTorrents.length); i++) {
        const item = scoredTorrents[i];
        console.log(
          (i + 1) + ". [" + item.score + "] " + 
          (item.features.resolution || "?") + "p " + 
          item.features.hdr_type + " " + 
          item.features.bitrate + "Mbps " +
          "Seeds:" + item.seeds + " | " + 
          (item.element.Title || "").substring(0, 60)
        );
      }
    }
    
    console.log("[EasyTorrent] Оброблено", scoredTorrents.length, "торрентів");
    
    // Повертаємо відсортований масив для фіксації у парсері
    return scoredTorrents.map(item => item.element);
  }
  
  // Патчинг парсера (ВИПРАВЛЕНА)
  function patchParser() {
    const parser = window.Lampa.Parser || 
                 (window.Lampa.Component ? window.Lampa.Component.Parser : null);
    
    if (!parser || !parser.get) {
      console.error("[EasyTorrent] Парсер не знайдено");
      return;
    }
    
    console.log("[EasyTorrent] Патчимо парсер...");
    
    const originalGet = parser.get;
    
    parser.get = function(source, callback, params) {
      return originalGet.call(
        this,
        source,
        function(data) {
          // Обробляємо результати
          if (Lampa.Storage.get("easytorrent_enabled", true)) {
            const sortedTorrents = processParserResults(data, source);
            if (sortedTorrents && Array.isArray(sortedTorrents)) {
              // Встановлюємо відсортовані торренти
              data.Results = sortedTorrents;
            }
          }
          
          // Викликаємо оригінальний callback
          return callback.apply(this, arguments);
        },
        params
      );
    };
    
    console.log("[EasyTorrent] Парсер успішно пропатчений");
  }
  
  // Решта коду залишається без змін (CSS, відображення бейджів, налаштування)
  // Додайте ваші функції showConfigViewer(), showQRSetup(), addStyles(), C() тощо
  
  // Головна функція ініціалізації (ВИПРАВЛЕНА)
  function initPlugin() {
    console.log("[EasyTorrent] Ініціалізація для Samsung TV...");
    
    try {
      // ВАЖЛИВО: Завантажуємо конфігурацію
      loadConfig();
      
      // Додаємо CSS
      addStyles();
      
      // Додаємо компонент в налаштування
      addSettingsComponent();
      
      // Патчимо парсер
      patchParser();
      
      // Додаємо обробник для відображення бейджів
      Lampa.Listener.follow("torrent", renderTorrentBadge);
      
      console.log("[EasyTorrent] Плагін успішно ініціалізований!");
      console.log("[EasyTorrent] Пріоритети:", currentConfig.parameter_priority);
      
    } catch (error) {
      console.error("[EasyTorrent] Помилка ініціалізації:", error);
    }
  }
  
  // Запуск плагіна
  if (window.Lampa && window.Lampa.Storage) {
    console.log("[EasyTorrent] Lampa вже завантажена");
    setTimeout(initPlugin, 100);
  } else {
    window.addEventListener('lampa_loaded', function() {
      console.log("[EasyTorrent] Lampa завантажена через подію");
      setTimeout(initPlugin, 100);
    });
    
    // Таймаут 30 секунд
    setTimeout(function() {
      if (window.Lampa && window.Lampa.Storage) {
        console.log("[EasyTorrent] Lampa завантажена через інтервал");
        setTimeout(initPlugin, 100);
      }
    }, 30000);
  }
  
})();
