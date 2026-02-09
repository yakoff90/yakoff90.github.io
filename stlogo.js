(function () {
  'use strict';

  var pluginPath = 'https://crowley38.github.io/Icons/';
  var TMDB_IMAGE_URL = 'https://image.tmdb.org/t/p/h30';
  
  // Налаштування за замовчуванням
  var settings = {
    enabled: true,
    position: 'details', // 'details' або 'card' або 'both'
    size: 'medium', // 'small', 'medium', 'large', 'custom'
    customHeight: '1.8em',
    maxLogos: 5,
    showOnCards: true, // Змінено на true за замовчуванням
    animation: true,
    brightness: 0,
    invert: 1,
    opacity: 0.9,
    cardPosition: 'bottom-right', // Нова опція: 'top-left', 'top-right', 'bottom-left', 'bottom-right'
    cardSpacing: '6px', // Відстань між логотипами на картках
    cardMaxLogos: 3 // Макс кількість логотипів на картках
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
      switch(settings.size) {
        case 'small': return '0.9em';
        case 'medium': return '1.2em';
        case 'large': return '1.6em';
        case 'custom': return settings.customHeight;
        default: return '1.2em';
      }
    } else {
      switch(settings.size) {
        case 'small': return '1.2em';
        case 'medium': return '1.8em';
        case 'large': return '2.5em';
        case 'custom': return settings.customHeight;
        default: return '1.8em';
      }
    }
  }

  // Отримання позиції для карток
  function getCardPositionStyle() {
    var style = '';
    var spacing = settings.cardSpacing;
    
    switch(settings.cardPosition) {
      case 'top-left':
        style = 'top: 0.3em; left: 0.3em; right: auto; bottom: auto; flex-direction: row;';
        break;
      case 'top-right':
        style = 'top: 0.3em; right: 0.3em; left: auto; bottom: auto; flex-direction: row;';
        break;
      case 'bottom-left':
        style = 'bottom: 0.3em; left: 0.3em; right: auto; top: auto; flex-direction: row;';
        break;
      case 'bottom-right':
        style = 'bottom: 0.3em; right: 0.3em; left: auto; top: auto; flex-direction: row;';
        break;
      default:
        style = 'bottom: 0.3em; right: 0.3em; left: auto; top: auto; flex-direction: row;';
    }
    
    return style;
  }

  // Отримання логотипів студій
  function getStudioLogos(movie, forCard) {
    if (!settings.enabled) return '';
    
    var html = '';
    var count = 0;
    var size = getSize(forCard);
    var maxLogos = forCard ? settings.cardMaxLogos : settings.maxLogos;
    
    if (movie && movie.production_companies) {
      // Фільтруємо студії з логотипами
      var studiosWithLogos = movie.production_companies.filter(function(co) {
        return co.logo_path;
      });
      
      // Сортуємо за важливістю (можливо перші студії важливіші)
      studiosWithLogos.forEach(function(co) {
        if (count < maxLogos) {
          var filter = 'brightness(' + settings.brightness + ') invert(' + settings.invert + ')';
          var style = 'filter: ' + filter + '; opacity: ' + settings.opacity + '; height: ' + size + '; width: auto; max-width: 3em;';
          
          // Додаємо тінь для кращої видимості на картках
          if (forCard) {
            style += ' filter: drop-shadow(0 1px 2px rgba(0,0,0,0.7)) ' + filter + ';';
          }
          
          html += '<div class="studio-logo-badge' + (forCard ? ' card-logo' : '') + '" ' +
                  'style="margin-right: ' + (forCard ? settings.cardSpacing : '12px') + '; display: inline-block; vertical-align: middle;' + 
                  (settings.animation && forCard ? ' animation: studio_logo_in 0.3s ease forwards;' : '') + '">' +
                  '<img src="' + TMDB_IMAGE_URL + co.logo_path + '" title="' + co.name + '" style="' + style + '" onerror="this.style.display=\'none\'">' +
                  '</div>';
          count++;
        }
      });
    }
    return html;
  }

  // Перевірка, чи є плагін Cardify активний
  function isCardifyActive() {
    return $('.cardify').length > 0 || Lampa.Storage.field('cardify_run_trailers') !== undefined;
  }

  // Додавання логотипів на картки
  function addCardLogos(card, movie) {
    if (!settings.enabled || !settings.showOnCards) return;
    
    // Перевіряємо, чи є вже додані логотипи
    var existing = card.find('.card-studio-logos');
    if (existing.length) {
      // Оновлюємо існуючі
      var logos = getStudioLogos(movie, true);
      if (logos) {
        existing.html(logos);
      } else {
        existing.remove();
      }
      return;
    }
    
    var logos = getStudioLogos(movie, true);
    if (logos) {
      var positionStyle = getCardPositionStyle();
      var logoContainer = $('<div class="card-studio-logos" style="position: absolute; z-index: 15; ' + positionStyle + 
                           ' display: flex; align-items: center; pointer-events: none; padding: 0.2em;"></div>');
      logoContainer.html(logos);
      
      // Додаємо контейнер до картки
      var cardView = card.find('.card__view');
      if (cardView.length) {
        cardView.append(logoContainer);
      } else {
        card.append(logoContainer);
      }
      
      // Анімація появи
      if (settings.animation) {
        logoContainer.css('opacity', '0');
        setTimeout(function() {
          logoContainer.css('opacity', '1');
          logoContainer.css('transition', 'opacity 0.3s ease');
        }, 100);
      }
    }
  }

  // Обробка карток
  function processCards() {
    if (!settings.enabled || !settings.showOnCards) return;
    
    $('.card:not(.studio-processed)').each(function() {
      var card = $(this);
      card.addClass('studio-processed');
      
      // Отримуємо дані фільму
      var movie = card.data('item');
      if (!movie) {
        // Спробуємо отримати з інших атрибутів
        var cardId = card.attr('data-id');
        if (cardId) {
          // Можна спробувати отримати з глобального кешу
          movie = Lampa.Storage.get('card_movie_' + cardId);
        }
      }
      
      if (movie) {
        addCardLogos(card, movie);
      } else {
        // Якщо даних немає, спробуємо пізніше
        setTimeout(function() {
          card.removeClass('studio-processed');
        }, 1000);
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
  var cardInterval = setInterval(processCards, 1500);
  
  // Додаткова обробка при скролі
  Lampa.Listener.follow('scroll', function() {
    setTimeout(processCards, 300);
  });

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
        title: 'Показувати на картках',
        component: 'checkbox',
        name: 'showOnCards',
        value: settings.showOnCards
      },
      {
        title: 'Позиція на картках',
        component: 'select',
        name: 'cardPosition',
        value: settings.cardPosition,
        values: [
          { title: 'Верхній лівий кут', value: 'top-left' },
          { title: 'Верхній правий кут', value: 'top-right' },
          { title: 'Нижній лівий кут', value: 'bottom-left' },
          { title: 'Нижній правий кут', value: 'bottom-right' }
        ]
      },
      {
        title: 'Місце розташування (деталі)',
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
        title: 'Макс. логотипів (деталі)',
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
        title: 'Макс. логотипів (картки)',
        component: 'select',
        name: 'cardMaxLogos',
        value: settings.cardMaxLogos,
        values: [
          { title: '1 логотип', value: 1 },
          { title: '2 логотипи', value: 2 },
          { title: '3 логотипи', value: 3 },
          { title: '4 логотипи', value: 4 }
        ]
      },
      {
        title: 'Відстань між логотипами',
        component: 'select',
        name: 'cardSpacing',
        value: settings.cardSpacing,
        values: [
          { title: 'Маленька (4px)', value: '4px' },
          { title: 'Середня (6px)', value: '6px' },
          { title: 'Велика (8px)', value: '8px' },
          { title: 'Дуже велика (10px)', value: '10px' }
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
        $('.card').removeClass('studio-processed');
        setTimeout(function() {
          processCards();
          var details = $('.full-start-new__details, .full-start__details');
          if (details.length) {
            var movie = Lampa.Storage.get('full-movie');
            if (movie) processDetails(movie);
          }
        }, 300);
        
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
    
    // Додаємо CSS стилі з урахуванням кардіфай
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
      /* Стилі для карток з урахуванням кардіфай */\
      .card-studio-logos { \
        position: absolute; \
        z-index: 15 !important; \
        display: flex; \
        align-items: center; \
        pointer-events: none; \
        padding: 0.2em; \
        max-width: 50%; \
        flex-wrap: nowrap; \
        overflow: hidden; \
      }\
      /* Для карток кардіфай додаємо додаткові стилі */\
      .cardify .card-studio-logos { \
        z-index: 25 !important; \
      }\
      .card-logo { \
        height: 1em !important; \
        flex-shrink: 0; \
      }\
      .card-logo img { \
        max-height: 1.2em !important; \
        width: auto !important; \
        filter: drop-shadow(0 1px 2px rgba(0,0,0,0.7)) !important; \
      }\
      /* Анімація */\
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
      /* Адаптація для різних типів карток */\
      .card__view { \
        position: relative; \
      }\
      /* Уникаємо конфліктів з іншими елементами картки */\
      .card__quality, .card__rate, .card__info { \
        z-index: 10; \
      }\
      .card-studio-logos { \
        z-index: 5; \
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
    }
    
    // Альтернативний спосіб через SettingsApi
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
    
    // Початкова обробка карток
    setTimeout(processCards, 2000);
    
    // Слухаємо зміни в DOM для нових карток
    if (typeof MutationObserver !== 'undefined') {
      var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
          if (mutation.addedNodes.length) {
            setTimeout(processCards, 100);
          }
        });
      });
      
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    }
    
  }, 3000);

})();
