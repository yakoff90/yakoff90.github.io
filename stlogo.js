[file name]: stlogo.js
[file content begin]
(function () {
  'use strict';

  var pluginPath = 'https://crowley38.github.io/Icons/';
  var TMDB_IMAGE_URL = 'https://image.tmdb.org/t/p/h30';
  
  // Налаштування за замовчуванням
  var settings = {
    enabled: true,
    position: 'details', // 'details' або 'card'
    size: 'medium', // 'small', 'medium', 'large', 'custom'
    customHeight: '1.8em',
    maxLogos: 5,
    showOnCards: false,
    animation: true,
    brightness: 0,
    invert: 1,
    opacity: 0.9
  };

  // Завантаження збережених налаштувань
  function loadSettings() {
    var saved = Lampa.Storage.get('studio_logos_settings');
    if (saved) {
      Object.keys(saved).forEach(function(key) {
        if (settings[key] !== undefined) settings[key] = saved[key];
      });
    }
  }

  // Збереження налаштувань
  function saveSettings() {
    Lampa.Storage.set('studio_logos_settings', settings);
  }

  // Отримання розміру в залежності від налаштувань
  function getSize() {
    switch(settings.size) {
      case 'small': return '1.2em';
      case 'medium': return '1.8em';
      case 'large': return '2.5em';
      case 'custom': return settings.customHeight;
      default: return '1.8em';
    }
  }

  // Отримання логотипів студій
  function getStudioLogos(movie, forCard) {
    if (!settings.enabled) return '';
    
    var html = '';
    var count = 0;
    var size = getSize();
    var maxLogos = forCard ? 3 : settings.maxLogos; // На картках менше місця
    
    if (movie && movie.production_companies) {
      movie.production_companies.forEach(function(co) {
        if (co.logo_path && count < maxLogos) {
          var filter = 'brightness(' + settings.brightness + ') invert(' + settings.invert + ')';
          
          // Для карток використовуємо стилі як у cardify плагіні
          if (forCard) {
            html += '<div class="studio-badge card">' +
                    '<img src="' + TMDB_IMAGE_URL + co.logo_path + '" title="' + co.name + '" ' +
                    'style="height: 0.9em; width: auto; display: block; filter: ' + filter + '; opacity: ' + settings.opacity + ';">' +
                    '</div>';
          } else {
            var style = 'filter: ' + filter + '; opacity: ' + settings.opacity + '; height: ' + size + '; width: auto;';
            style += ' margin-top: -2px;';
            
            html += '<div class="studio-logo-badge"' + 
                    'style="margin-right: 12px; display: inline-block; vertical-align: middle;">' +
                    '<img src="' + TMDB_IMAGE_URL + co.logo_path + '" title="' + co.name + '" style="' + style + '">' +
                    '</div>';
          }
          count++;
        }
      });
    }
    return html;
  }

  // Додавання логотипів на картки
  function addCardLogos(card, movie) {
    if (!settings.enabled || (settings.position !== 'card' && settings.position !== 'both')) return;
    
    var existing = card.find('.studio-logos-container');
    if (existing.length) return;
    
    var logos = getStudioLogos(movie, true);
    if (logos) {
      // Створюємо контейнер для логотипів в правому нижньому куті (як у cardify)
      var container = $('<div class="studio-logos-container"></div>');
      container.html(logos);
      card.find('.card__box').append(container);
    }
  }

  // Обробка карток
  function processCards() {
    if (!settings.enabled || (settings.position !== 'card' && settings.position !== 'both')) return;
    
    $('.card:not(.studio-processed)').addClass('studio-processed').each(function() {
      var card = $(this);
      var movie = card.data('item');
      if (movie) {
        addCardLogos(card, movie);
      }
    });
  }

  // Обробка сторінки деталей
  function processDetails(movie) {
    if (!settings.enabled || (settings.position !== 'details' && settings.position !== 'both')) return;
    
    var details = $('.full-start-new__details, .full-start__details');
    if (details.length) {
      var container = $('.studio-logos-container');
      if (!container.length) {
        details.after('<div class="studio-logos-container"></div>');
        container = $('.studio-logos-container');
      }
      
      var logos = getStudioLogos(movie, false);
      container.html(logos);
    }
  }

  // Слухач подій
  Lampa.Listener.follow('full', function(e) {
    if (e.type !== 'complite') return;
    processDetails(e.data.movie);
  });

  // Інтервал для обробки карток
  setInterval(processCards, 1000);

  // Функція для відкриття меню налаштувань
  function openSettings() {
    loadSettings();
    
    // Створення меню
    var menu = [
      {
        title: 'Увімкнути логотипи студій',
        component: 'checkbox',
        name: 'enabled',
        value: settings.enabled
      },
      {
        title: 'Місце розташування',
        component: 'select',
        name: 'position',
        value: settings.position,
        values: [
          { title: 'На сторінці деталей', value: 'details' },
          { title: 'На картках', value: 'card' },
          { title: 'В обох місцях', value: 'both' }
        ]
      },
      {
        title: 'Розмір логотипів на картках',
        component: 'select',
        name: 'size',
        value: settings.size,
        values: [
          { title: 'Маленький', value: 'small' },
          { title: 'Середній', value: 'medium' },
          { title: 'Великий', value: 'large' },
          { title: 'Власний розмір', value: 'custom' }
        ]
      }
    ];
    
    // Додаємо поле для власного розміру тільки якщо вибрано "custom"
    if (settings.size === 'custom') {
      menu.push({
        title: 'Власна висота',
        component: 'text',
        name: 'customHeight',
        value: settings.customHeight,
        placeholder: '0.9em, 16px, 1rem'
      });
    }
    
    menu.push(
      {
        title: 'Максимальна кількість на картках',
        component: 'select',
        name: 'maxLogos',
        value: settings.maxLogos,
        values: [
          { title: '2 логотипи', value: 2 },
          { title: '3 логотипи', value: 3 },
          { title: '4 логотипи', value: 4 },
          { title: '5 логотипів', value: 5 }
        ]
      },
      {
        title: 'Позиція на картці',
        component: 'select',
        name: 'cardPosition',
        value: settings.cardPosition || 'bottom-right',
        values: [
          { title: 'Правий нижній кут', value: 'bottom-right' },
          { title: 'Лівий нижній кут', value: 'bottom-left' },
          { title: 'Правий верхній кут', value: 'top-right' },
          { title: 'Лівий верхній кут', value: 'top-left' }
        ]
      },
      {
        title: 'Анімація появи',
        component: 'checkbox',
        name: 'animation',
        value: settings.animation
      },
      {
        title: 'Яскравість',
        component: 'slider',
        name: 'brightness',
        value: settings.brightness,
        min: 0,
        max: 2,
        step: 0.1
      },
      {
        title: 'Інверсія кольорів',
        component: 'slider',
        name: 'invert',
        value: settings.invert,
        min: 0,
        max: 1,
        step: 0.1
      },
      {
        title: 'Прозорість',
        component: 'slider',
        name: 'opacity',
        value: settings.opacity,
        min: 0,
        max: 1,
        step: 0.1
      }
    );

    // Відкриття меню налаштувань
    Lampa.SettingsApi.open({
      title: 'Логотипи студій',
      menu: menu,
      onSave: function(data) {
        // Оновлюємо налаштування
        Object.keys(data).forEach(function(key) {
          if (settings[key] !== undefined) {
            settings[key] = data[key];
          }
        });
        
        // Зберігаємо налаштування
        saveSettings();
        
        // Оновлюємо відображення
        $('.studio-logos-container').remove();
        setTimeout(function() {
          processCards();
          var details = $('.full-start-new__details, .full-start__details');
          if (details.length) {
            var movie = Lampa.Storage.get('full-movie');
            if (movie) processDetails(movie);
          }
        }, 100);
        
        return true;
      },
      onBack: function() {
        return true;
      }
    });
  }

  // Чекаємо, поки завантажиться додаток
  setTimeout(function() {
    loadSettings();
    
    // Додаємо CSS стилі
    var style = '<style>\
      .studio-logos-container { \
        position: absolute; \
        bottom: 5px; \
        right: 5px; \
        z-index: 10; \
        display: flex; \
        flex-direction: row; \
        align-items: center; \
        gap: 4px; \
        pointer-events: none; \
      }\
      .studio-badge.card { \
        display: flex; \
        align-items: center; \
        justify-content: center; \
        width: auto; \
        height: 1.4em; \
        min-width: 1.4em; \
        background: rgba(0, 0, 0, 0.7); \
        border: 1px solid rgba(255, 255, 255, 0.3); \
        border-radius: 3px; \
        padding: 1px 3px; \
        box-sizing: border-box; \
        ' + (settings.animation ? 'opacity: 0; transform: translateY(5px); animation: studio_logo_in 0.3s ease forwards;' : '') + '\
      }\
      .studio-badge.card img { \
        height: 0.9em; \
        width: auto; \
        max-width: 2.5em; \
        object-fit: contain; \
      }\
      .studio-logo-badge { \
        display: flex; \
        align-items: center; \
        ' + (settings.animation ? 'opacity: 0; transform: translateY(8px); animation: studio_logo_in 0.4s ease forwards;' : '') + '\
      }\
      .full-start-new__details .studio-logos-container { \
        position: static; \
        display: flex; \
        align-items: center; \
        gap: 0.8em; \
        margin: 0.8em 0; \
        min-height: 2em; \
        flex-wrap: wrap; \
        flex-direction: row; \
      }\
      .full-start-new__details .studio-badge { \
        position: static; \
        background: rgba(255, 255, 255, 0.08); \
        border: 1px solid rgba(255, 255, 255, 0.15); \
        border-radius: 6px; \
        padding: 0px 8px; \
        height: 2.2em; \
        gap: 5px; \
        margin-right: 12px; \
      }\
      .full-start-new__details .studio-badge img { \
        height: 1em !important; \
        width: auto; \
        display: block; \
      }\
      @keyframes studio_logo_in { \
        to { \
          opacity: 1; \
          transform: translateY(0); \
        } \
      }\
    </style>';
    
    $('body').append(style);
    
    // Додаємо пункт в налаштування
    var settingsItem = {
      component: 'settings_plugin_item',
      name: 'studio_logos',
      title: 'Логотипи студій',
      onSelect: function() {
        openSettings();
      }
    };
    
    // Перевіряємо, чи існує масив налаштувань
    if (Lampa.Settings && Lampa.Settings.list && Array.isArray(Lampa.Settings.list)) {
      // Додаємо наш пункт
      Lampa.Settings.list.push(settingsItem);
    } else if (Lampa.Storage && Lampa.Storage.field) {
      // Альтернативний спосіб - через поле
      Lampa.Storage.field('studio_logos_enabled', true);
      
      // Створюємо власний розділ в налаштуваннях
      var originalSettings = Lampa.Storage.field('settings') || {};
      originalSettings.studio_logos = settingsItem;
      Lampa.Storage.field('settings', originalSettings);
    }
    
    // Або спробуємо через SettingsApi
    if (Lampa.SettingsApi && Lampa.SettingsApi.addParam) {
      Lampa.SettingsApi.addParam({
        component: 'block',
        name: 'studio_logos',
        params: [{
          name: 'studio_logos_settings',
          title: 'Логотипи студій',
          button: {
            title: 'Налаштування',
            action: function() {
              openSettings();
            }
          }
        }]
      });
    }
    
  }, 3000); // Затримка 3 секунди для завантаження Lampa

})();
[file content end]
