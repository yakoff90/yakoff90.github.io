!(function () {
  "use strict";
  
  console.log("[EasyTorrent] Завантаження плагіна...");
  
  const PLUGIN_NAME = "EasyTorrent";
  const PLUGIN_VERSION = "1.1.0 Beta";
  
  // Основна конфігурація
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
  
  // Спрощена ініціалізація
  function initPlugin() {
    console.log("[EasyTorrent] Ініціалізація плагіна...");
    
    try {
      // Перевіряємо, чи Lampa існує
      if (typeof Lampa === 'undefined') {
        console.error("[EasyTorrent] Lampa не знайдена!");
        return;
      }
      
      console.log("[EasyTorrent] Lampa знайдена, версія:", Lampa.version || "невідома");
      
      // Завантажуємо збережену конфігурацію
      loadConfig();
      
      // Додаємо компонент в налаштування
      addSettingsComponent();
      
      // Патчимо парсер
      patchParser();
      
      // Додаємо CSS стилі
      addStyles();
      
      console.log("[EasyTorrent] Плагін успішно ініціалізований!");
      
    } catch (error) {
      console.error("[EasyTorrent] Помилка ініціалізації:", error);
    }
  }
  
  function loadConfig() {
    try {
      const savedConfig = Lampa.Storage.get("easytorrent_config_json");
      if (savedConfig) {
        currentConfig = JSON.parse(savedConfig);
        console.log("[EasyTorrent] Конфігурація завантажена");
      } else {
        Lampa.Storage.set("easytorrent_config_json", JSON.stringify(defaultConfig));
        console.log("[EasyTorrent] Використана конфігурація за замовчуванням");
      }
    } catch (error) {
      console.error("[EasyTorrent] Помилка завантаження конфігурації:", error);
      currentConfig = defaultConfig;
    }
  }
  
  function addSettingsComponent() {
    try {
      // Перевіряємо, чи існує SettingsApi
      if (!Lampa.SettingsApi) {
        console.error("[EasyTorrent] SettingsApi не знайдена!");
        return;
      }
      
      // Додаємо компонент
      Lampa.SettingsApi.addComponent({
        component: "easytorrent",
        name: PLUGIN_NAME,
        icon: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/></svg>'
      });
      
      // Додаємо параметри
      addSettingsParams();
      
      console.log("[EasyTorrent] Компонент доданий до налаштувань");
      
    } catch (error) {
      console.error("[EasyTorrent] Помилка додавання компонента:", error);
    }
  }
  
  function addSettingsParams() {
    // Простий перемикач
    Lampa.SettingsApi.addParam({
      component: "easytorrent",
      param: { 
        name: "easytorrent_enabled", 
        type: "trigger", 
        default: true 
      },
      field: { 
        name: "Увімкнути EasyTorrent", 
        description: "Показувати рекомендовані торренти" 
      }
    });
    
    // Інформація про плагін
    Lampa.SettingsApi.addParam({
      component: "easytorrent",
      param: { name: "easytorrent_about", type: "static" },
      field: { name: "<div>" + PLUGIN_NAME + " " + PLUGIN_VERSION + "</div>" },
      onRender: function (element) {
        element.css("opacity", "0.7");
        element.find(".settings-param__name").css({ 
          "font-size": "1.2em", 
          "margin-bottom": "0.3em" 
        });
        element.append(
          '<div style="font-size: 0.9em; padding: 0 1.2em; line-height: 1.4;">' +
          'Система рекомендацій торрентів<br>' +
          'На основі якості, HDR та озвучки' +
          '</div>'
        );
      }
    });
  }
  
  function patchParser() {
    try {
      // Шукаємо парсер
      const parser = window.Lampa.Parser || 
                    (window.Lampa.Component ? window.Lampa.Component.Parser : null);
      
      if (!parser || !parser.get) {
        console.error("[EasyTorrent] Парсер не знайдено");
        return;
      }
      
      console.log("[EasyTorrent] Знайдено парсер, патчимо...");
      
      // Зберігаємо оригінальну функцію
      const originalGet = parser.get;
      
      // Замінюємо функцію
      parser.get = function (source, callback, params) {
        return originalGet.call(
          this,
          source,
          function (data) {
            // Обробляємо результати
            if (data && data.Results && Array.isArray(data.Results)) {
              console.log("[EasyTorrent] Обробка", data.Results.length, "торрентів");
              
              // Маркуємо торренти
              data.Results.forEach((torrent, index) => {
                torrent._easytorrent_processed = true;
                torrent._easytorrent_index = index;
                
                // Проста оцінка на основі роздільної здатності
                const title = (torrent.Title || torrent.title || "").toLowerCase();
                let score = 50; // Базовий бал
                
                if (title.includes("2160p") || title.includes("4k")) {
                  score += 30;
                } else if (title.includes("1080p")) {
                  score += 20;
                } else if (title.includes("720p")) {
                  score += 10;
                }
                
                // Бонус за сиди
                const seeds = torrent.Seeds || torrent.seeds || torrent.Seeders || torrent.seeders || 0;
                if (seeds > 10) score += 10;
                if (seeds > 50) score += 10;
                
                torrent._easytorrent_score = score;
              });
              
              // Сортуємо за оцінкою
              data.Results.sort((a, b) => {
                return (b._easytorrent_score || 0) - (a._easytorrent_score || 0);
              });
              
              // Оновлюємо індекси після сортування
              data.Results.forEach((torrent, index) => {
                torrent._easytorrent_rank = index;
              });
            }
            
            // Викликаємо оригінальний callback
            return callback.apply(this, arguments);
          },
          params
        );
      };
      
      console.log("[EasyTorrent] Парсер успішно пропатчений");
      
    } catch (error) {
      console.error("[EasyTorrent] Помилка патчингу парсера:", error);
    }
  }
  
  function addStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .torrent-recommend-badge {
        position: absolute;
        top: 10px;
        right: 10px;
        background: rgba(76, 175, 80, 0.9);
        color: white;
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 0.8em;
        font-weight: bold;
        z-index: 10;
      }
      
      .torrent-recommend-badge.top {
        background: rgba(255, 193, 7, 0.9);
      }
      
      .easytorrent-info {
        margin: 10px;
        padding: 10px;
        background: rgba(0,0,0,0.2);
        border-radius: 5px;
        font-size: 0.9em;
      }
    `;
    document.head.appendChild(style);
  }
  
  // Додаємо простий обробник для відображення бейджів
  function addTorrentRenderHandler() {
    if (Lampa.Listener && Lampa.Listener.follow) {
      Lampa.Listener.follow("torrent", function (event) {
        if (event.type === "render" && event.element && event.item) {
          const torrent = event.element;
          const item = event.item;
          
          // Видаляємо старі бейджі
          item.find(".torrent-recommend-badge").remove();
          
          // Перевіряємо, чи торрент оброблений
          if (torrent._easytorrent_processed && torrent._easytorrent_rank !== undefined) {
            const rank = torrent._easytorrent_rank;
            const score = torrent._easytorrent_score || 0;
            
            // Додаємо бейдж тільки для топ-3
            if (rank < 3) {
              const badgeClass = rank === 0 ? "torrent-recommend-badge top" : "torrent-recommend-badge";
              const badgeText = rank === 0 ? "★ Топ" : "#" + (rank + 1);
              
              const badge = $('<div class="' + badgeClass + '">' + badgeText + '</div>');
              item.append(badge);
            }
          }
        }
      });
      
      console.log("[EasyTorrent] Обробник торрентів доданий");
    }
  }
  
  // Основний запуск
  function startPlugin() {
    console.log("[EasyTorrent] Запуск плагіна...");
    
    // Чекаємо, поки Lampa буде готова
    if (window.Lampa && window.Lampa.Storage) {
      console.log("[EasyTorrent] Lampa вже завантажена");
      initPlugin();
      setTimeout(addTorrentRenderHandler, 1000);
    } else if (window.appready) {
      console.log("[EasyTorrent] appready = true");
      initPlugin();
      setTimeout(addTorrentRenderHandler, 1000);
    } else {
      console.log("[EasyTorrent] Чекаємо на завантаження Lampa...");
      
      // Спробуємо через слухач подій
      if (Lampa.Listener && Lampa.Listener.follow) {
        Lampa.Listener.follow("app", function (event) {
          if (event.type === "ready") {
            console.log("[EasyTorrent] Lampa готова через Listener");
            initPlugin();
            setTimeout(addTorrentRenderHandler, 1000);
          }
        });
      } else {
        // Альтернативний спосіб: чекаємо на завантаження
        const checkLampa = setInterval(function() {
          if (window.Lampa && window.Lampa.Storage) {
            clearInterval(checkLampa);
            console.log("[EasyTorrent] Lampa завантажена через інтервал");
            initPlugin();
            setTimeout(addTorrentRenderHandler, 1000);
          }
        }, 500);
        
        // Максимальне очікування - 30 секунд
        setTimeout(function() {
          clearInterval(checkLampa);
          console.log("[EasyTorrent] Таймаут очікування Lampa");
        }, 30000);
      }
    }
  }
  
  // Запускаємо плагін
  console.log("[EasyTorrent] Плагін завантажено, починаємо ініціалізацію...");
  startPlugin();
  
})();
