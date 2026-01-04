!(function () {
  "use strict";
  
  console.log("[EasyTorrent] Завантаження плагіна v1.1.0...");
  
  const PLUGIN_NAME = "EasyTorrent";
  const PLUGIN_VERSION = "1.1.0 Beta";
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
    } catch (e) {
      currentConfig = defaultConfig;
    }
  }
  
  function loadConfig() {
    try {
      const savedConfig = Lampa.Storage.get("easytorrent_config_json");
      if (savedConfig) {
        currentConfig = JSON.parse(savedConfig);
      } else {
        saveConfig(defaultConfig);
      }
    } catch (error) {
      currentConfig = defaultConfig;
    }
  }
  
  // Функція для перегляду конфігурації
  function showConfigViewer() {
    const items = [
      { title: "Версія конфігу", subtitle: currentConfig.version, noselect: true },
      { title: "Тип пристрою", subtitle: (currentConfig.device.type || "tv_4k").toUpperCase(), noselect: true },
      { title: "Підтримка HDR", subtitle: (currentConfig.device.supported_hdr || []).join(", ") || "немає", noselect: true },
      { title: "Підтримка звуку", subtitle: (currentConfig.device.supported_audio || []).join(", ") || "стерео", noselect: true },
      { title: "Пріоритет параметрів", subtitle: (currentConfig.parameter_priority || []).join(" > "), noselect: true },
      { 
        title: "Пріоритет озвучок", 
        subtitle: (currentConfig.audio_track_priority || []).length + " шт. • Натисніть для перегляду",
        action: "show_voices" 
      },
      { title: "Мінімально сидів", subtitle: (currentConfig.preferences || {}).min_seeds || 2, noselect: true },
      { title: "Кількість рекомендацій", subtitle: (currentConfig.preferences || {}).recommendation_count || 3, noselect: true },
    ];
    
    Lampa.Select.show({
      title: "Поточна конфігурація",
      items: items,
      onSelect: function(item) {
        if (item.action === "show_voices") {
          showVoicesList();
        }
      },
      onBack: function() {
        Lampa.Controller.toggle("settings");
      }
    });
  }
  
  function showVoicesList() {
    const voices = currentConfig.audio_track_priority || [];
    const items = voices.map(function(voice, index) {
      return { title: (index + 1) + ". " + voice, noselect: true };
    });
    
    Lampa.Select.show({
      title: "Пріоритет озвучок",
      items: items,
      onBack: function() {
        showConfigViewer();
      }
    });
  }

  // === СПРОЩЕНА ФУНКЦІЯ QR-НАЛАШТУВАНЬ ===
  function showQRSetup() {
    console.log("[EasyTorrent] Запуск QR налаштувань...");
    
    try {
      // Генерація коду
      function generatePairCode() {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let code = "";
        for (let i = 0; i < 6; i++) {
          code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
      }

      const pairCode = generatePairCode();
      const qrUrl = PLUGIN_WEB_URL + "?pairCode=" + pairCode;
      
      console.log("[EasyTorrent] Код сполучення:", pairCode);
      
      // Просте модальне вікно без QR-коду (поки що)
      const modalHtml = `
        <div class="about" style="padding: 20px;">
          <div style="text-align: center; margin-bottom: 25px;">
            <div style="font-size: 1.3em; font-weight: bold; margin-bottom: 15px; color: #fff;">
              Налаштування через телефон
            </div>
            <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 10px; margin: 15px 0;">
              <div style="font-size: 1.1em; margin-bottom: 10px; color: #ccc;">
                Перейдіть за посиланням:
              </div>
              <div style="word-break: break-all; background: rgba(0,0,0,0.3); padding: 10px; border-radius: 5px; font-family: monospace; color: #4CAF50;">
                ${qrUrl}
              </div>
            </div>
          </div>
          
          <div style="text-align: center; margin-bottom: 20px;">
            <div style="font-size: 1.1em; font-weight: bold; margin-bottom: 10px; color: #fff;">
              Код сполучення:
            </div>
            <div style="font-size: 2.5em; font-weight: bold; letter-spacing: 0.3em; margin: 15px 0; color: #667eea; background: rgba(102,126,234,0.1); padding: 15px; border-radius: 10px;">
              ${pairCode}
            </div>
            <div style="font-size: 0.9em; color: #aaa; margin-top: 10px;">
              Введіть цей код на сторінці налаштувань
            </div>
          </div>
          
          <div id="qrStatus" style="text-align: center; padding: 15px; background: rgba(255,255,255,0.05); border-radius: 10px; margin-top: 20px; font-size: 1em;">
            ⏳ Чекаємо на конфігурацію...
            <div style="font-size: 0.8em; color: #aaa; margin-top: 5px;">
              Перевіряємо кожні 10 секунд
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px;">
            <div style="font-size: 0.8em; color: #888;">
              Це вікно закриється автоматично при отриманні конфігурації
            </div>
          </div>
        </div>
      `;

      // Відкриваємо модальне вікно
      Lampa.Modal.open({
        title: "🔗 Налаштування пріоритетів",
        html: modalHtml,
        size: "medium",
        onBack: function() {
          if (syncInterval) {
            clearInterval(syncInterval);
            syncInterval = null;
          }
          Lampa.Modal.close();
          Lampa.Controller.toggle("settings_component");
        }
      });

      // Функція для запиту конфігурації
      function fetchConfig() {
        return new Promise(function(resolve, reject) {
          try {
            // Використовуємо XMLHttpRequest для сумісності
            var xhr = new XMLHttpRequest();
            var url = SUPABASE_URL + "/rest/v1/tv_configs?id=eq." + encodeURIComponent(pairCode) + "&select=data,updated_at";
            
            console.log("[EasyTorrent] Запит до:", url);
            
            xhr.open('GET', url, true);
            xhr.setRequestHeader('apikey', SUPABASE_KEY);
            xhr.setRequestHeader('Authorization', 'Bearer ' + SUPABASE_KEY);
            xhr.setRequestHeader('Content-Type', 'application/json');
            
            xhr.timeout = 10000; // 10 секунд таймаут
            
            xhr.onload = function() {
              if (xhr.status === 200) {
                try {
                  var response = JSON.parse(xhr.responseText);
                  console.log("[EasyTorrent] Відповідь отримана:", response);
                  
                  if (response && response.length > 0 && response[0].data) {
                    resolve(response[0].data);
                  } else {
                    resolve(null);
                  }
                } catch (e) {
                  console.error("[EasyTorrent] Помилка парсингу відповіді:", e);
                  reject(e);
                }
              } else {
                console.error("[EasyTorrent] HTTP помилка:", xhr.status);
                reject(new Error('HTTP error: ' + xhr.status));
              }
            };
            
            xhr.onerror = function() {
              console.error("[EasyTorrent] Помилка мережі");
              reject(new Error('Network error'));
            };
            
            xhr.ontimeout = function() {
              console.error("[EasyTorrent] Таймаут запиту");
              reject(new Error('Request timeout'));
            };
            
            xhr.send();
          } catch (error) {
            console.error("[EasyTorrent] Помилка при виконанні запиту:", error);
            reject(error);
          }
        });
      }

      let lastGenerated = null;
      let attempts = 0;
      const maxAttempts = 30; // 30 спроб * 10 секунд = 5 хвилин
      
      // Функція перевірки конфігурації
      function checkForConfig() {
        attempts++;
        
        if (attempts > maxAttempts) {
          // Занадто багато спроб
          if (syncInterval) {
            clearInterval(syncInterval);
            syncInterval = null;
          }
          
          var statusElement = document.getElementById("qrStatus");
          if (statusElement) {
            statusElement.innerHTML = "⏰ Час очікування вийшов<br>" +
                                     "<div style='font-size: 0.8em; color: #f44336; margin-top: 5px;'>" +
                                     "Спробуйте ще раз</div>";
            statusElement.style.color = "#f44336";
          }
          
          setTimeout(function() {
            Lampa.Modal.close();
            Lampa.Controller.toggle("settings_component");
          }, 3000);
          return;
        }
        
        console.log("[EasyTorrent] Перевірка конфігурації, спроба", attempts);
        
        fetchConfig()
          .then(function(configData) {
            if (configData && configData.generated !== lastGenerated) {
              lastGenerated = configData.generated;
              
              // Зберігаємо конфігурацію
              saveConfig(configData);
              
              // Оновлюємо статус
              var statusElement = document.getElementById("qrStatus");
              if (statusElement) {
                statusElement.innerHTML = "✅ Конфігурація отримана!";
                statusElement.style.color = "#4CAF50";
              }
              
              // Зупиняємо перевірку
              if (syncInterval) {
                clearInterval(syncInterval);
                syncInterval = null;
              }
              
              // Закриваємо через 2 секунди
              setTimeout(function() {
                Lampa.Modal.close();
                Lampa.Noty.show("Конфігурація оновлена!");
                Lampa.Controller.toggle("settings_component");
              }, 2000);
            } else {
              // Оновлюємо статус
              var statusElement = document.getElementById("qrStatus");
              if (statusElement) {
                var dots = ".".repeat((attempts % 3) + 1);
                statusElement.innerHTML = "⏳ Чекаємо на конфігурацію" + dots + 
                                         "<div style='font-size: 0.8em; color: #aaa; margin-top: 5px;'>" +
                                         "Спроба " + attempts + " з " + maxAttempts + "</div>";
              }
            }
          })
          .catch(function(error) {
            console.error("[EasyTorrent] Помилка отримання конфігурації:", error);
            
            // Оновлюємо статус
            var statusElement = document.getElementById("qrStatus");
            if (statusElement) {
              var dots = ".".repeat((attempts % 3) + 1);
              statusElement.innerHTML = "⚠️ Помилка з'єднання" + dots + 
                                       "<div style='font-size: 0.8em; color: #ff9800; margin-top: 5px;'>" +
                                       "Спроба " + attempts + " з " + maxAttempts + "</div>";
              statusElement.style.color = "#ff9800";
            }
          });
      }
      
      // Запускаємо перевірку кожні 10 секунд
      syncInterval = setInterval(checkForConfig, 10000);
      
      // Перша перевірка через 1 секунду
      setTimeout(checkForConfig, 1000);
      
    } catch (error) {
      console.error("[EasyTorrent] Критична помилка в QR налаштуваннях:", error);
      Lampa.Noty.show("Помилка: " + error.message);
    }
  }
  
  // Решта функцій залишаються без змін...
  
  // Аналіз роздільної здатності
  function getResolution(torrent) {
    const title = (torrent.Title || torrent.title || "").toLowerCase();
    
    // Перевірка через ffprobe
    if (torrent.ffprobe && Array.isArray(torrent.ffprobe)) {
      for (var i = 0; i < torrent.ffprobe.length; i++) {
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
    
    // Перевірка по назві
    if (title.indexOf("2160p") !== -1 || title.indexOf("4k") !== -1) return 2160;
    if (title.indexOf("1440p") !== -1 || title.indexOf("2k") !== -1) return 1440;
    if (title.indexOf("1080p") !== -1) return 1080;
    if (title.indexOf("720p") !== -1) return 720;
    
    return null;
  }
  
  // Аналіз HDR
  function getHDRType(torrent) {
    const title = (torrent.Title || torrent.title || "").toLowerCase();
    const hdrTypes = [];
    
    // Перевірка Dolby Vision через ffprobe
    if (torrent.ffprobe && Array.isArray(torrent.ffprobe)) {
      for (var i = 0; i < torrent.ffprobe.length; i++) {
        if (torrent.ffprobe[i].codec_type === "video" && torrent.ffprobe[i].side_data_list) {
          const sideData = torrent.ffprobe[i].side_data_list;
          for (var j = 0; j < sideData.length; j++) {
            if (sideData[j].side_data_type && 
                (sideData[j].side_data_type.indexOf("DOVI") !== -1 || 
                 sideData[j].side_data_type.indexOf("Dolby Vision") !== -1)) {
              hdrTypes.push("dolby_vision");
              break;
            }
          }
        }
      }
    }
    
    // Перевірка по назві
    if (title.indexOf("hdr10+") !== -1 || title.indexOf("hdr10plus") !== -1) {
      if (hdrTypes.indexOf("hdr10plus") === -1) hdrTypes.push("hdr10plus");
    }
    
    if (title.indexOf("hdr10") !== -1) {
      if (hdrTypes.indexOf("hdr10") === -1) hdrTypes.push("hdr10");
    }
    
    if (title.indexOf("dolby vision") !== -1 || title.indexOf("dovi") !== -1) {
      if (hdrTypes.indexOf("dolby_vision") === -1) hdrTypes.push("dolby_vision");
    }
    
    if (title.indexOf("sdr") !== -1) {
      if (hdrTypes.indexOf("sdr") === -1) hdrTypes.push("sdr");
    }
    
    // Якщо немає HDR, повертаємо SDR
    if (hdrTypes.length === 0) return "sdr";
    
    // Вибираємо найкращий HDR
    const hdrScores = {
      dolby_vision: 40,
      hdr10plus: 32,
      hdr10: 32,
      sdr: -16
    };
    
    var bestHDR = hdrTypes[0];
    var bestScore = hdrScores[bestHDR] || 0;
    
    for (var i = 1; i < hdrTypes.length; i++) {
      var score = hdrScores[hdrTypes[i]] || 0;
      if (score > bestScore) {
        bestScore = score;
        bestHDR = hdrTypes[i];
      }
    }
    
    return bestHDR;
  }
  
  // Аналіз бітрейту
  function getBitrate(torrent, movieInfo, isSeries, episodeCount) {
    const title = torrent.Title || torrent.title || "";
    const size = torrent.Size || torrent.size_bytes || 0;
    
    // Перевірка через ffprobe
    if (torrent.ffprobe && Array.isArray(torrent.ffprobe)) {
      for (var i = 0; i < torrent.ffprobe.length; i++) {
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
    
    // Розрахунок через розмір файлу
    var duration = movieInfo ? (movieInfo.runtime || movieInfo.duration || movieInfo.episode_run_time) : 0;
    if (Array.isArray(duration)) duration = duration[0] || 0;
    
    if (isSeries && !duration) duration = 45;
    
    if (size > 0 && duration > 0) {
      var episodeMultiplier = 1;
      if (isSeries && episodeCount > 1) {
        episodeMultiplier = episodeCount;
      }
      
      const totalSeconds = 60 * duration * episodeMultiplier;
      const totalBits = 8 * size;
      const bitrateMbps = Math.round(totalBits / (1000 * 1000) / totalSeconds);
      
      if (bitrateMbps > 0) return Math.min(bitrateMbps, 150);
    }
    
    // Перевірка в назві
    const bitrateMatch = title.match(/(\d+\.?\d*)\s*(?:Mbps|Мбит)/i);
    if (bitrateMatch) return Math.round(parseFloat(bitrateMatch[1]));
    
    return 0;
  }
  
  // Словник озвучок
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
  
  // Аналіз озвучок
  function getAudioTracks(torrent) {
    const title = (torrent.Title || torrent.title || "").toLowerCase();
    const tracks = [];
    
    // Перевірка через ffprobe
    if (torrent.ffprobe && Array.isArray(torrent.ffprobe)) {
      for (var i = 0; i < torrent.ffprobe.length; i++) {
        if (torrent.ffprobe[i].codec_type === "audio") {
          const audio = torrent.ffprobe[i];
          const tags = audio.tags || {};
          const audioTitle = (tags.title || tags.handler_name || "").toLowerCase();
          const language = (tags.language || "").toLowerCase();
          
          // Перевіряємо всі озвучки
          for (var trackName in audioTracksDict) {
            if (tracks.indexOf(trackName) !== -1) continue;
            
            var patterns = audioTracksDict[trackName];
            var found = false;
            
            for (var j = 0; j < patterns.length; j++) {
              var pattern = patterns[j].toLowerCase();
              
              // Спеціальна перевірка для російського дубляжу
              if (trackName === "Дубляж RU") {
                if ((language === "rus" || language === "russian") && 
                    (audioTitle.indexOf("dub") !== -1 || audioTitle.indexOf("дубляж") !== -1)) {
                  found = true;
                  break;
                }
              }
              
              if (pattern === language) {
                found = true;
                break;
              }
              
              if (pattern.length <= 3) {
                var regex = new RegExp("\\b" + pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b", "i");
                if (regex.test(audioTitle)) {
                  found = true;
                  break;
                }
              } else if (audioTitle.indexOf(pattern) !== -1) {
                found = true;
                break;
              }
            }
            
            if (found) tracks.push(trackName);
          }
        }
      }
    }
    
    // Перевірка по назві торрента
    for (var trackName in audioTracksDict) {
      if (tracks.indexOf(trackName) !== -1) continue;
      
      var patterns = audioTracksDict[trackName];
      var found = false;
      
      for (var j = 0; j < patterns.length; j++) {
        var pattern = patterns[j].toLowerCase();
        
        if (pattern.length <= 3) {
          var regex = new RegExp("\\b" + pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b", "i");
          if (regex.test(title)) {
            found = true;
            break;
          }
        } else if (title.indexOf(pattern) !== -1) {
          found = true;
          break;
        }
      }
      
      if (found) tracks.push(trackName);
    }
    
    return tracks;
  }
  
  // Оцінка торренту
  function calculateScore(torrent, features) {
    var score = 100;
    var breakdown = {
      base: 100,
      resolution: 0,
      hdr: 0,
      bitrate: 0,
      availability: 0,
      audio_track: 0
    };
    
    const seeds = torrent.Seeds || torrent.seeds || torrent.Seeders || torrent.seeders || 0;
    const scoringRules = currentConfig.scoring_rules;
    
    // Оцінка роздільної здатності
    if (features.resolution) {
      var resScore = scoringRules.resolution[features.resolution] || 0;
      var resWeight = (scoringRules.weights.resolution || 100) / 100;
      breakdown.resolution = resScore * resWeight;
      score += breakdown.resolution;
    }
    
    // Оцінка HDR
    if (features.hdr_type) {
      var hdrScore = scoringRules.hdr[features.hdr_type] || 0;
      var hdrWeight = (scoringRules.weights.hdr || 100) / 100;
      breakdown.hdr = hdrScore * hdrWeight;
      score += breakdown.hdr;
    }
    
    // Оцінка бітрейту
    var bitrateWeight = (scoringRules.weights.bitrate || 55) / 100;
    if (features.bitrate > 0) {
      var thresholds = scoringRules.bitrate_bonus.thresholds;
      for (var i = 0; i < thresholds.length; i++) {
        if (features.bitrate >= thresholds[i].min && features.bitrate < thresholds[i].max) {
          breakdown.bitrate = thresholds[i].bonus * bitrateWeight;
          score += breakdown.bitrate;
          break;
        }
      }
    } else {
      var bitratePriority = currentConfig.parameter_priority.indexOf("bitrate");
      var penalty = bitratePriority === 0 ? -50 : bitratePriority === 1 ? -30 : -15;
      breakdown.bitrate = penalty * bitrateWeight;
      score += breakdown.bitrate;
    }
    
    // Оцінка озвучки
    var audioWeight = (scoringRules.weights.audio_track || 100) / 100;
    var priorityTracks = currentConfig.audio_track_priority || [];
    var torrentTracks = features.audio_tracks || [];
    
    for (var i = 0; i < priorityTracks.length; i++) {
      var trackName = priorityTracks[i];
      var found = false;
      
      for (var j = 0; j < torrentTracks.length; j++) {
        if (torrentTracks[j] === trackName) {
          found = true;
          break;
        }
      }
      
      if (found) {
        breakdown.audio_track = 15 * (priorityTracks.length - i) * audioWeight;
        score += breakdown.audio_track;
        break;
      }
    }
    
    // Оцінка доступності (сіди)
    var availabilityWeight = (scoringRules.weights.availability || 70) / 100;
    var minSeeds = currentConfig.preferences.min_seeds || scoringRules.availability.min_seeds || 2;
    
    if (seeds < minSeeds) {
      var availabilityPriority = currentConfig.parameter_priority.indexOf("availability");
      var penalty = availabilityPriority === 0 ? -80 : availabilityPriority === 1 ? -40 : -20;
      breakdown.availability = penalty * availabilityWeight;
    } else {
      breakdown.availability = 12 * Math.log(seeds + 1) / Math.log(10) * availabilityWeight;
    }
    
    score += breakdown.availability;
    
    // Спеціальний бонус для 4K
    var firstPriority = currentConfig.parameter_priority[0];
    if (firstPriority === "resolution" && currentConfig.device.type.indexOf("4k") !== -1) {
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
    
    // Бонус за Toloka
    var tracker = (torrent.Tracker || torrent.tracker || "").toLowerCase();
    if (tracker.indexOf("toloka") !== -1) {
      breakdown.tracker_bonus = 20;
      score += 20;
    }
    
    score = Math.max(0, Math.round(score));
    
    return {
      score: score,
      breakdown: breakdown,
      seeds: seeds
    };
  }
  
  // Обробка результатів парсера
  function processParserResults(data, source) {
    if (!data || !data.Results || !Array.isArray(data.Results)) return;
    
    console.log("[EasyTorrent] Обробка", data.Results.length, "торрентів");
    
    var movieInfo = source ? source.movie : null;
    var isSeries = movieInfo && (movieInfo.original_name || movieInfo.number_of_seasons > 0 || movieInfo.seasons);
    
    // Аналізуємо всі торренти
    var scoredTorrents = [];
    
    for (var i = 0; i < data.Results.length; i++) {
      var torrent = data.Results[i];
      
      // Отримуємо характеристики
      var features = {
        resolution: getResolution(torrent),
        hdr_type: getHDRType(torrent),
        audio_tracks: getAudioTracks(torrent),
        bitrate: getBitrate(torrent, movieInfo, isSeries, 1)
      };
      
      // Розраховуємо оцінку
      var scoreResult = calculateScore(torrent, features);
      
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
    for (var i = 0; i < scoredTorrents.length; i++) {
      var item = scoredTorrents[i];
      item.element._recommendScore = item.score;
      item.element._recommendBreakdown = item.breakdown;
      item.element._recommendFeatures = item.features;
      item.element._recommendRank = i;
      item.element._recommendIsIdeal = (i === 0 && item.score >= 150);
    }
    
    // Логування для дебагу
    if (Lampa.Storage.get("easytorrent_show_scores", false)) {
      console.log("=== EasyTorrent Scores ===");
      for (var i = 0; i < Math.min(10, scoredTorrents.length); i++) {
        var item = scoredTorrents[i];
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
  }
  
  // Відображення бейджів на торрентах
  function renderTorrentBadge(event) {
    if (event.type !== "render" || !event.element || !event.item) return;
    if (!Lampa.Storage.get("easytorrent_enabled", true)) return;
    
    var torrent = event.element;
    var item = event.item;
    
    // Видаляємо старі бейджі
    item.find(".torrent-recommend-panel").remove();
    
    // Перевіряємо, чи є оцінка
    if (torrent._recommendRank === undefined) return;
    
    var rank = torrent._recommendRank;
    var score = torrent._recommendScore;
    var breakdown = torrent._recommendBreakdown || {};
    var features = torrent._recommendFeatures || {};
    var showScores = Lampa.Storage.get("easytorrent_show_scores", true);
    var recCount = currentConfig.preferences.recommendation_count || 3;
    
    // Показуємо тільки для топ-рекомендацій або якщо увімкнено показ оцінок
    if (!torrent._recommendIsIdeal && rank >= recCount && !showScores) return;
    
    // Формуємо мета-інформацію
    var metaInfo = [];
    if (features.resolution) metaInfo.push(features.resolution + "p");
    if (features.hdr_type) {
      var hdrNames = {
        dolby_vision: "DV",
        hdr10plus: "HDR10+",
        hdr10: "HDR10",
        sdr: "SDR"
      };
      metaInfo.push(hdrNames[features.hdr_type] || features.hdr_type.toUpperCase());
    }
    if (features.bitrate) metaInfo.push(features.bitrate + " Mbps");
    
    // Визначаємо тип бейджа
    var badgeType = "neutral";
    var badgeText = "";
    
    if (torrent._recommendIsIdeal) {
      badgeType = "ideal";
      badgeText = getLocalizedText("ideal_badge");
    } else if (rank < recCount) {
      badgeType = "recommended";
      badgeText = getLocalizedText("recommended_badge") + " • #" + (rank + 1);
    } else {
      badgeType = "neutral";
      badgeText = "Оцінка";
    }
    
    // Створюємо панель
    var panel = $('<div class="torrent-recommend-panel torrent-recommend-panel--' + badgeType + '"></div>');
    
    // Ліва частина
    var leftPart = $('<div class="torrent-recommend-panel__left"></div>');
    leftPart.append('<div class="torrent-recommend-panel__label">' + badgeText + '</div>');
    
    if (metaInfo.length > 0) {
      leftPart.append('<div class="torrent-recommend-panel__meta">' + metaInfo.join(" • ") + '</div>');
    }
    
    panel.append(leftPart);
    
    // Права частина (оцінка)
    var rightPart = $('<div class="torrent-recommend-panel__right"></div>');
    if (showScores && score !== undefined) {
      rightPart.append('<div class="torrent-recommend-panel__score">' + score + '</div>');
    }
    
    panel.append(rightPart);
    
    // Детальна розбивка оцінки
    if (showScores && Object.keys(breakdown).length > 0) {
      var chips = $('<div class="torrent-recommend-panel__chips"></div>');
      var chipItems = [
        { key: "audio_track", name: "Озвучка" },
        { key: "resolution", name: "Розд." },
        { key: "bitrate", name: "Бітрейт" },
        { key: "availability", name: "Сіди" },
        { key: "hdr", name: "HDR" },
        { key: "special", name: "Бонус" },
        { key: "tracker_bonus", name: "Трекер" }
      ];
      
      for (var i = 0; i < chipItems.length; i++) {
        var chip = chipItems[i];
        if (breakdown[chip.key] !== undefined && breakdown[chip.key] !== 0) {
          var value = Math.round(breakdown[chip.key]);
          var sign = value > 0 ? "+" : "";
          var chipClass = value >= 0 ? "tr-chip--pos" : "tr-chip--neg";
          
          chips.append(
            '<div class="tr-chip ' + chipClass + '">' +
            '<span class="tr-chip__name">' + chip.name + '</span>' +
            '<span class="tr-chip__val">' + sign + value + '</span>' +
            '</div>'
          );
        }
      }
      
      if (chips.children().length > 0) {
        panel.append(chips);
      }
    }
    
    item.append(panel);
  }
  
  // Додавання CSS стилів
  function addStyles() {
    var style = document.createElement("style");
    style.textContent = `
      .torrent-recommend-panel {
        display: flex;
        align-items: center;
        gap: 0.9em;
        margin: 0.8em -1em -1em;
        padding: 0.75em 1em 0.85em;
        border-radius: 0 0 0.3em 0.3em;
        border-top: 1px solid rgba(255,255,255,0.10);
        background: rgba(0,0,0,0.18);
      }
      
      .torrent-recommend-panel__left {
        min-width: 0;
        flex: 1 1 auto;
      }
      
      .torrent-recommend-panel__label {
        font-size: 0.95em;
        font-weight: 800;
        letter-spacing: 0.2px;
        color: rgba(255,255,255,0.92);
        line-height: 1.15;
      }
      
      .torrent-recommend-panel__meta {
        margin-top: 0.25em;
        font-size: 0.82em;
        font-weight: 600;
        color: rgba(255,255,255,0.58);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .torrent-recommend-panel__right {
        flex: 0 0 auto;
        display: flex;
        align-items: center;
      }
      
      .torrent-recommend-panel__score {
        font-size: 1.05em;
        font-weight: 900;
        padding: 0.25em 0.55em;
        border-radius: 0.6em;
        background: rgba(255,255,255,0.10);
        border: 1px solid rgba(255,255,255,0.12);
        color: rgba(255,255,255,0.95);
      }
      
      .torrent-recommend-panel__chips {
        display: flex;
        flex: 2 1 auto;
        gap: 0.45em;
        flex-wrap: wrap;
        justify-content: flex-start;
        margin-top: 0.5em;
      }
      
      .torrent-recommend-panel__chips:empty {
        display: none;
      }
      
      .tr-chip {
        display: inline-flex;
        align-items: baseline;
        gap: 0.35em;
        padding: 0.28em 0.55em;
        border-radius: 999px;
        background: rgba(255,255,255,0.08);
        border: 1px solid rgba(255,255,255,0.10);
      }
      
      .tr-chip__name {
        font-size: 0.78em;
        font-weight: 700;
        color: rgba(255,255,255,0.60);
      }
      
      .tr-chip__val {
        font-size: 0.86em;
        font-weight: 900;
        color: rgba(255,255,255,0.92);
      }
      
      .tr-chip--pos {
        background: rgba(76,175,80,0.10);
        border-color: rgba(76,175,80,0.22);
      }
      
      .tr-chip--pos .tr-chip__val {
        color: rgba(120,255,170,0.95);
      }
      
      .tr-chip--neg {
        background: rgba(244,67,54,0.10);
        border-color: rgba(244,67,54,0.22);
      }
      
      .tr-chip--neg .tr-chip__val {
        color: rgba(255,120,120,0.95);
      }
      
      .torrent-recommend-panel--ideal {
        background: rgba(255,215,0,0.16);
        border-top-color: rgba(255,215,0,0.20);
      }
      
      .torrent-recommend-panel--ideal .torrent-recommend-panel__label {
        color: rgba(255,235,140,0.98);
      }
      
      .torrent-recommend-panel--recommended {
        background: rgba(76,175,80,0.08);
        border-top-color: rgba(76,175,80,0.18);
      }
      
      .torrent-recommend-panel--recommended .torrent-recommend-panel__label {
        color: rgba(160,255,200,0.92);
      }
      
      .torrent-item.focus .torrent-recommend-panel {
        background: rgba(255,255,255,0.08);
        border-top-color: rgba(255,255,255,0.16);
      }
    `;
    document.head.appendChild(style);
  }
  
  // === ФУНКЦІЯ ДОДАВАННЯ НАЛАШТУВАНЬ ===
  function addSettingsComponent() {
    // Перевірка стандартних налаштувань
    if (typeof Lampa.Storage.get("easytorrent_enabled") === "undefined") {
      Lampa.Storage.set("easytorrent_enabled", true);
    }
    if (typeof Lampa.Storage.get("easytorrent_show_scores") === "undefined") {
      Lampa.Storage.set("easytorrent_show_scores", true);
    }
    
    // Додаємо компонент
    Lampa.SettingsApi.addComponent({
      component: "easytorrent",
      name: PLUGIN_NAME,
      icon: PLUGIN_ICON
    });
    
    // Інформація про плагін
    Lampa.SettingsApi.addParam({
      component: "easytorrent",
      param: { name: "easytorrent_about", type: "static" },
      field: { name: "<div>" + PLUGIN_NAME + " " + PLUGIN_VERSION + "</div>" },
      onRender: function(element) {
        element.css("opacity", "0.7");
        element.find(".settings-param__name").css({
          "font-size": "1.2em",
          "margin-bottom": "0.3em"
        });
        element.append(
          '<div style="font-size: 0.9em; padding: 0 1.2em; line-height: 1.4;">' +
          'Автор: DarkestClouds<br>' +
          'Система рекомендацій торрентів на основі якості, HDR та озвучки' +
          '</div>'
        );
      }
    });
    
    // Основний перемикач
    Lampa.SettingsApi.addParam({
      component: "easytorrent",
      param: { name: "easytorrent_enabled", type: "trigger", default: true },
      field: {
        name: getLocalizedText("easytorrent_title"),
        description: getLocalizedText("easytorrent_desc")
      }
    });
    
    // Показ оцінок
    Lampa.SettingsApi.addParam({
      component: "easytorrent",
      param: { name: "easytorrent_show_scores", type: "trigger", default: true },
      field: {
        name: getLocalizedText("show_scores"),
        description: getLocalizedText("show_scores_desc")
      }
    });
    
    // Конфігурація JSON
    Lampa.SettingsApi.addParam({
      component: "easytorrent",
      param: {
        name: "easytorrent_config_json",
        type: "static",
        default: JSON.stringify(defaultConfig)
      },
      field: {
        name: getLocalizedText("config_json"),
        description: getLocalizedText("config_json_desc")
      },
      onRender: function(element) {
        var updateConfigText = function() {
          var deviceType = (currentConfig.device.type || "tv_4k").toUpperCase();
          var firstPriority = (currentConfig.parameter_priority || [])[0] || "resolution";
          element.find(".settings-param__value").text(deviceType + " | " + firstPriority);
        };
        
        updateConfigText();
        
        element.on("hover:enter", function() {
          Lampa.Select.show({
            title: getLocalizedText("config_json"),
            items: [
              { title: getLocalizedText("config_view"), action: "view" },
              { title: getLocalizedText("config_edit"), action: "edit" },
              { title: getLocalizedText("config_reset"), action: "reset" }
            ],
            onSelect: function(item) {
              if (item.action === "view") {
                showConfigViewer();
              } else if (item.action === "edit") {
                Lampa.Input.edit({
                  value: Lampa.Storage.get("easytorrent_config_json") || JSON.stringify(defaultConfig),
                  free: true
                }, function(newConfig) {
                  if (newConfig) {
                    try {
                      JSON.parse(newConfig);
                      saveConfig(newConfig);
                      updateConfigText();
                      Lampa.Noty.show("OK");
                    } catch (e) {
                      Lampa.Noty.show(getLocalizedText("config_error"));
                    }
                  }
                  Lampa.Controller.toggle("settings");
                });
              } else if (item.action === "reset") {
                saveConfig(defaultConfig);
                updateConfigText();
                Lampa.Noty.show("OK");
                Lampa.Controller.toggle("settings");
              }
            },
            onBack: function() {
              Lampa.Controller.toggle("settings");
            }
          });
        });
      }
    });
    
    // QR-налаштування (спрощена версія)
    Lampa.SettingsApi.addParam({
      component: "easytorrent",
      param: { name: "easytorrent_qr_setup", type: "static" },
      field: {
        name: "Розставити пріоритети",
        description: "Відкрийте візард на телефоні через QR-код"
      },
      onRender: function(element) {
        element.on("hover:enter", function() {
          console.log("[EasyTorrent] Натиснуто QR налаштування");
          showQRSetup();
        });
      }
    });
  }
  
  // Патчинг парсера
  function patchParser() {
    var parser = window.Lampa.Parser || 
                 (window.Lampa.Component ? window.Lampa.Component.Parser : null);
    
    if (!parser || !parser.get) {
      console.error("[EasyTorrent] Парсер не знайдено");
      return;
    }
    
    console.log("[EasyTorrent] Патчимо парсер...");
    
    var originalGet = parser.get;
    
    parser.get = function(source, callback, params) {
      return originalGet.call(
        this,
        source,
        function(data) {
          // Обробляємо результати
          if (Lampa.Storage.get("easytorrent_enabled", true)) {
            processParserResults(data, source);
          }
          
          // Викликаємо оригінальний callback
          return callback.apply(this, arguments);
        },
        params
      );
    };
    
    console.log("[EasyTorrent] Парсер успішно пропатчений");
  }
  
  // Головна функція ініціалізації
  function initPlugin() {
    console.log("[EasyTorrent] Ініціалізація...");
    
    try {
      // Завантажуємо конфігурацію
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
      
    } catch (error) {
      console.error("[EasyTorrent] Помилка ініціалізації:", error);
    }
  }
  
  // Запуск плагіна
  function startPlugin() {
    console.log("[EasyTorrent] Запуск...");
    
    if (window.Lampa && window.Lampa.Storage && window.Lampa.SettingsApi) {
      console.log("[EasyTorrent] Lampa вже завантажена");
      initPlugin();
    } else if (window.appready) {
      console.log("[EasyTorrent] appready = true");
      initPlugin();
    } else {
      console.log("[EasyTorrent] Чекаємо на Lampa...");
      
      // Чекаємо через слухач подій
      if (Lampa.Listener && Lampa.Listener.follow) {
        Lampa.Listener.follow("app", function(event) {
          if (event.type === "ready") {
            console.log("[EasyTorrent] Lampa готова");
            setTimeout(initPlugin, 100);
          }
        });
      } else {
        // Чекаємо через інтервал
        var checkInterval = setInterval(function() {
          if (window.Lampa && window.Lampa.Storage && window.Lampa.SettingsApi) {
            clearInterval(checkInterval);
            console.log("[EasyTorrent] Lampa завантажена через інтервал");
            setTimeout(initPlugin, 100);
          }
        }, 500);
        
        // Таймаут 30 секунд
        setTimeout(function() {
          clearInterval(checkInterval);
          console.log("[EasyTorrent] Таймаут очікування Lampa");
        }, 30000);
      }
    }
  }
  
  // Початок виконання
  console.log("[EasyTorrent] Початок завантаження...");
  startPlugin();
  
})();
