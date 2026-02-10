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
          var style = 'filter: ' + filter + '; opacity: ' + settings.opacity + '; height: ' + size + '; width: auto;';
          
          if (forCard) {
            style += ' margin-top: 0;';
          } else {
            style += ' margin-top: -2px;';
          }
          
          html += '<div class="studio-logo-badge' + (forCard ? ' card-logo' : '') + '" ' +
                  'style="margin-right: ' + (forCard ? '6px' : '12px') + '; display: inline-block; vertical-align: middle;">' +
                  '<img src="' + TMDB_IMAGE_URL + co.logo_path + '" title="' + co.name + '" style="' + style + '">' +
                  '</div>';
          count++;
        }
      });
    }
    return html;
  }

  // Додавання логотипів на картки
  function addCardLogos(card, movie) {
    if (!settings.enabled || (settings.position !== 'card' && settings.position !== 'both')) return;
    
    var existing = card.find('.card-studio-logos');
    if (existing.length) return;
    
    var logos = getStudioLogos(movie, true);
    if (logos) {
      card.find('.card__view').append('<div class="card-studio-logos">' + logos + '</div>');
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
        title: 'Розмір логотипів',
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
        placeholder: '1.8em, 24px, 2rem'
      });
    }
    
    menu.push(
      {
        title: 'Максимальна кількість',
        component: 'select',
        name: 'maxLogos',
        value: settings.maxLogos,
        values: [
          { title: '3 логотипи', value: 3 },
          { title: '5 логотипів', value: 5 },
          { title: '8 логотипів', value: 8 },
          { title: 'Усі логотипи', value: 99 }
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
        $('.studio-logos-container, .card-studio-logos').remove();
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
        display: flex; \
        align-items: center; \
        gap: 0.8em; \
        margin: 0.8em 0; \
        min-height: 2em; \
        flex-wrap: wrap; \
      }\
      .studio-logo-badge { \
        display: flex; \
        align-items: center; \
        ' + (settings.animation ? 'opacity: 0; transform: translateY(8px); animation: studio_logo_in 0.4s ease forwards;' : '') + '\
      }\
      .card-studio-logos { \
        position: absolute; \
        top: 0.3em; \
        left: 0.3em; \
        display: flex; \
        flex-direction: row; \
        gap: 0.2em; \
        pointer-events: none; \
        z-index: 5; \
      }\
      .card-logo { \
        height: 1em !important; \
        ' + (settings.animation ? 'opacity: 0; transform: translateY(5px); animation: studio_logo_in 0.3s ease forwards;' : '') + '\
      }\
      @keyframes studio_logo_in { \
        to { \
          opacity: 1; \
          transform: translateY(0); \
        } \
      }\
      .studio-logo-badge img { \
        height: 100%; \
        width: auto; \
        display: block; \
      }\
      .card-logo img { \
        filter: drop-shadow(0 1px 2px #000); \
      }\
    </style>';
    
    $('body').append(style);
    
    // Додаємо пункт в налаштування - АНАЛОГІЧНО ДО ПЛАГІНУ ЯКОСТІ
    // Створюємо об'єкт налаштувань
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
