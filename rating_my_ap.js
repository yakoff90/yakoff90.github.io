[file name]: rating_my_ap.js
[file content begin]
/**
 * Lampa: Enhanced Ratings (MDBList + OMDb)
 * Спрощена версія для уникнення конфліктів
 */

(function() {
  'use strict';

  // Чекаємо на повне завантаження Lampa
  function waitForLampa(callback) {
    if (window.Lampa && window.Lampa.Listener && window.Lampa.Storage) {
      callback();
    } else {
      setTimeout(function() {
        waitForLampa(callback);
      }, 100);
    }
  }

  waitForLampa(function() {
    console.log('Lampa Ratings Plugin: Starting...');
    
    // 1. Додаємо CSS
    var css = '<style>' +
      '.lmp-ratings-container {' +
      '  display: flex !important;' +
      '  align-items: center !important;' +
      '  flex-wrap: wrap !important;' +
      '  gap: 0.8em !important;' +
      '  margin-bottom: 0.5em !important;' +
      '}' +
      '.lmp-rating-item {' +
      '  display: flex !important;' +
      '  align-items: center !important;' +
      '  gap: 0.35em !important;' +
      '  font-size: 0.95em !important;' +
      '  font-weight: 600 !important;' +
      '}' +
      '.lmp-rating-green { color: #2ecc71 !important; }' +
      '.lmp-rating-blue { color: #60a5fa !important; }' +
      '.lmp-rating-orange { color: #f59e0b !important; }' +
      '.lmp-rating-red { color: #ef4444 !important; }' +
      '.lmp-icon {' +
      '  width: auto !important;' +
      '  height: 1.8em !important;' +
      '  object-fit: contain !important;' +
      '}' +
      '</style>';
    
    $('head').append(css);
    
    // 2. Налаштування
    var LMP_ENH_CONFIG = {
      apiKeys: {
        mdblist: 'nmqhlb9966w9m86h3yntb0dpz',
        omdb: '358837db'
      }
    };
    
    var ICONS = {
      total_star: 'https://raw.githubusercontent.com/ko3ik/LMP/main/wwwroot/star.png',
      imdb: 'https://raw.githubusercontent.com/ko3ik/LMP/main/wwwroot/imdb.png',
      tmdb: 'https://raw.githubusercontent.com/ko3ik/LMP/main/wwwroot/tmdb.png',
      metacritic: 'https://raw.githubusercontent.com/ko3ik/LMP/main/wwwroot/metacritic.png',
      rotten_good: 'https://raw.githubusercontent.com/ko3ik/LMP/main/wwwroot/RottenTomatoes.png',
      rotten_bad: 'https://raw.githubusercontent.com/ko3ik/LMP/main/wwwroot/RottenBad.png',
      popcorn: 'https://raw.githubusercontent.com/ko3ik/LMP/main/wwwroot/PopcornGood.png'
    };
    
    // 3. Допоміжні функції
    function getRatingClass(rating) {
      var r = parseFloat(rating);
      if (isNaN(r)) return '';
      if (r >= 8.0) return 'lmp-rating-green';
      if (r >= 6.0) return 'lmp-rating-blue';
      if (r >= 4.0) return 'lmp-rating-orange';
      return 'lmp-rating-red';
    }
    
    function createRatingElement(value, iconUrl, altText, colorClass) {
      var element = document.createElement('div');
      element.className = 'lmp-rating-item ' + (colorClass || '');
      element.innerHTML = '<div>' + value + '</div>' +
                         '<div><img src="' + iconUrl + '" alt="' + altText + '" class="lmp-icon"></div>';
      return element;
    }
    
    // 4. Основна функція завантаження рейтингів
    function fetchRatings(card) {
      console.log('Lampa Ratings: Fetching for', card);
      
      // Шукаємо або створюємо контейнер
      var render = Lampa.Activity.active().activity.render();
      if (!render) return;
      
      var container = render[0].querySelector('.lmp-ratings-container');
      if (!container) {
        // Шукаємо місце для вставки
        var meta = render[0].querySelector('.applecation__meta');
        var title = render[0].querySelector('.full-start-new__title');
        var target = meta || title;
        
        if (target) {
          container = document.createElement('div');
          container.className = 'lmp-ratings-container';
          target.parentNode.insertBefore(container, target.nextSibling);
        } else {
          console.log('Lampa Ratings: No target found');
          return;
        }
      }
      
      // Очищаємо контейнер
      container.innerHTML = '';
      
      // Додаємо тестові рейтинги (тимчасово)
      container.appendChild(createRatingElement('8.5', ICONS.imdb, 'IMDb', 'lmp-rating-green'));
      container.appendChild(createRatingElement('7.2', ICONS.tmdb, 'TMDB', 'lmp-rating-blue'));
      container.appendChild(createRatingElement('72%', ICONS.rotten_good, 'Rotten Tomatoes', 'lmp-rating-orange'));
      
      console.log('Lampa Ratings: Test ratings added');
    }
    
    // 5. Слухач подій
    Lampa.Listener.follow('full', function(e) {
      if (e.type === 'complite') {
        setTimeout(function() {
          fetchRatings(e.data.movie || e.object || {});
        }, 500);
      }
    });
    
    // 6. Додаємо налаштування
    Lampa.SettingsApi.addComponent({
      component: 'lmp_ratings',
      name: 'Рейтинги',
      icon: '<svg width="24" height="24" viewBox="0 0 24 24" ' +
        'fill="none" xmlns="http://www.w3.org/2000/svg">' +
        '<path d="M12 3l3.09 6.26L22 10.27l-5 4.87L18.18 21 ' +
        '12 17.77 5.82 21 7 15.14l-5-4.87 6.91-1.01L12 3z" ' +
        'stroke="currentColor" stroke-width="2" ' +
        'fill="none" stroke-linejoin="round" stroke-linecap="round"/>' +
        '</svg>'
    });
    
    Lampa.SettingsApi.addParam({
      component: 'lmp_ratings',
      param: {
        name: 'lmp_show_ratings',
        type: 'trigger',
        "default": true
      },
      field: {
        name: 'Показувати рейтинги',
        description: 'Відображати додаткові рейтинги'
      }
    });
    
    console.log('Lampa Ratings Plugin: Initialized successfully');
  });

})();
[file content end]
