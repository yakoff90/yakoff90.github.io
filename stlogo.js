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
    maxLogos: 3, // На картках менше місця
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
  function getSize(forCard) {
    if (forCard) {
      return '1.2em'; // Фіксований малий розмір для карток
    }
    
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
    if (!settings.enabled || !movie || !movie.production_companies) return '';
    
    var html = '';
    var count = 0;
    var size = getSize(forCard);
    var maxLogos = forCard ? Math.min(3, settings.maxLogos) : settings.maxLogos;
    
    movie.production_companies.forEach(function(co) {
      if (co.logo_path && count < maxLogos) {
        var filter = 'brightness(' + settings.brightness + ') invert(' + settings.invert + ')';
        var style = 'filter: ' + filter + '; opacity: ' + settings.opacity + '; height: ' + size + '; width: auto;';
        
        html += '<div class="studio-logo-badge' + (forCard ? ' card-logo' : '') + '">' +
                '<img src="' + TMDB_IMAGE_URL + co.logo_path + '" title="' + co.name + '" style="' + style + '">' +
                '</div>';
        count++;
      }
    });
    
    return html;
  }

  // Обробка карток (як у torqUAcardify.js)
  function processCards() {
    $('.card:not(.studio-processed)').each(function() {
      var card = $(this);
      var movie = card.data('item');
      
      if (movie) {
        card.addClass('studio-processed');
        
        // Видаляємо старі логотипи
        card.find('.studio-logos-card-block').remove();
        
        // Перевіряємо налаштування
        if (settings.enabled && (settings.position === 'card' || settings.position === 'both')) {
          var logos = getStudioLogos(movie, true);
          if (logos) {
            // Створюємо контейнер як у torqUAcardify.js
            var container = $('<div class="studio-logos-card-block"></div>').html(logos);
            
            // Знаходимо контейнер картки
            var cardView = card.find('.card__view');
            if (cardView.length) {
              cardView.append(container);
            }
          }
        }
      }
    });
  }

  // Обробка сторінки деталей
  function processDetails(movie) {
    if (!settings.enabled || (settings.position !== 'details' && settings.position !== 'both')) return;
    
    var renderTarget = $('.full-start-new, .full-start');
    if (renderTarget.length) {
      var rateLine = $('.full-start-new__rate-line, .full-start__rate-line', renderTarget);
      
      if (rateLine.length) {
        var container = $('.studio-logos-details-container', renderTarget);
        if (!container.length) { 
          container = $('<div class="studio-logos-details-container"></div>'); 
          rateLine.after(container);
        }
        
        var logos = getStudioLogos(movie, false);
        container.html(logos);
      }
    }
  }

  // Слухач подій для деталей фільму
  Lampa.Listener.follow('full', function(e) {
    if (e.type !== 'complite') return;
    
    // Обробляємо деталі фільму
    processDetails(e.data.movie);
    
    // Також обробляємо картки
    setTimeout(processCards, 500);
  });

  // Інтервал для обробки карток (як у torqUAcardify.js)
  setInterval(processCards, 2000);

  // Функція для відкриття меню налаштувань
  function openSettings() {
    loadSettings();
    
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
        title: 'Розмір логотипів (деталі)',
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
        $('.studio-logos-card-block, .studio-logos-details-container').remove();
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
    
    // Додаємо CSS стилі (аналогічно torqUAcardify.js)
    var style = '<style>\
      /* Стилі для сторінки деталей */\
      .studio-logos-details-container { \
        display: flex; \
        gap: 8px; \
        align-items: center; \
        margin: 8px 0; \
        flex-wrap: wrap; \
      }\
      \
      /* Стилі для карток */\
      .studio-logos-card-block { \
        position: absolute; \
        bottom: 8px; \
        right: 8px; \
        z-index: 10; \
        display: flex; \
        flex-direction: row; \
        justify-content: flex-end; \
        align-items: center; \
        gap: 3px; \
        pointer-events: none; \
        max-width: 70%; \
        flex-wrap: wrap; \
      }\
      \
      /* Загальні стилі для логотипів */\
      .studio-logo-badge { \
        display: flex; \
        align-items: center; \
        justify-content: center; \
        ' + (settings.animation ? 'opacity: 0; transform: translateY(8px); animation: studio_logo_in 0.4s ease forwards;' : '') + '\
      }\
      \
      /* Стилі для логотипів на картках */\
      .card-logo { \
        background: rgba(0, 0, 0, 0.6); \
        padding: 2px 4px; \
        border-radius: 3px; \
        border: 1px solid rgba(255, 255, 255, 0.2); \
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3); \
        ' + (settings.animation ? 'opacity: 0; transform: translateY(5px); animation: studio_logo_in 0.3s ease forwards 0.1s;' : '') + '\
      }\
      \
      /* Стилі для зображень */\
      .studio-logo-badge img { \
        height: 100%; \
        width: auto; \
        display: block; \
        max-width: 100%; \
      }\
      \
      /* Додаткові тіні для кращої видимості на картках */\
      .card-logo img { \
        filter: drop-shadow(0 1px 1px rgba(0,0,0,0.8)); \
      }\
      \
      /* Анімація появи */\
      @keyframes studio_logo_in { \
        to { \
          opacity: 1; \
          transform: translateY(0); \
        } \
      }\
      \
      /* Гарантуємо, що інша інформація не перекривається */\
      .card__info { \
        z-index: 15 !important; \
      }\
      .card__title { \
        z-index: 15 !important; \
      }\
      .card__view:after { \
        content: ""; \
        position: absolute; \
        bottom: 0; \
        left: 0; \
        right: 0; \
        height: 40px; \
        background: linear-gradient(to top, rgba(0,0,0,0.3), transparent); \
        pointer-events: none; \
        z-index: 5; \
      }\
      \
      /* Спеціальні стилі для Cardify */\
      .cardify .card .studio-logos-card-block { \
        bottom: 5px !important; \
        right: 5px !important; \
      }\
      \
      /* Адаптація для темної теми */\
      @media (prefers-color-scheme: dark) { \
        .card-logo { \
          background: rgba(0, 0, 0, 0.7); \
          border-color: rgba(255, 255, 255, 0.15); \
        }\
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
    
    // Додаємо в налаштування
    if (Lampa.Settings && Lampa.Settings.list && Array.isArray(Lampa.Settings.list)) {
      Lampa.Settings.list.push(settingsItem);
    } else if (Lampa.SettingsApi && Lampa.SettingsApi.addParam) {
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
    
    // Запускаємо обробку карток
    setTimeout(processCards, 2000);
    
  }, 3000);

})();
[file content end]
