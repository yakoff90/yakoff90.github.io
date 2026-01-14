/**
 * Lampa: Enhanced Ratings (MDBList + OMDb)
 * --------------------------------------------------------
 * - Працює на старих WebView: локальні шими/поліфіли (localStorage, Promise, fetch, DOM-методи)
 * - Бере рейтинги з MDBList (+ OMDb для віку/нагород) і малює їх у деталці
 * - Адаптовано для Applecation: відображає рейтинги у картці перед описом фільму
 * - Має секцію налаштувань "Рейтинги", живе застосування стилів без перезавантаження
 */

(function() {
  'use strict';

  // ... (поліфіли та початковий код залишаються без змін) ...

  /**
   * CSS стилі плагіну - адаптовано для Applecation
   */
  var pluginStyles = "<style>" +
    /* --- Загальні стилі --- */
    ".full-start-new.applecation .full-start-new__rate-line {" +
    "    display: flex !important;" +
    "    align-items: center !important;" +
    "    flex-wrap: wrap !important;" +
    "    gap: 0.8em !important;" +
    "    margin-bottom: 0.5em !important;" +
    "    opacity: 0 !important;" +
    "    transform: translateY(15px) !important;" +
    "    transition: opacity 0.4s ease-out, transform 0.4s ease-out !important;" +
    "}" +
    
    ".full-start-new.applecation .full-start-new__rate-line.show {" +
    "    opacity: 1 !important;" +
    "    transform: translateY(0) !important;" +
    "}" +
    
    /* --- Стилі для рейтингів у Applecation --- */
    ".full-start-new.applecation .applecation__ratings {" +
    "    display: flex !important;" +
    "    align-items: center !important;" +
    "    flex-wrap: wrap !important;" +
    "    gap: 0.8em !important;" +
    "    margin-bottom: 0.5em !important;" +
    "    opacity: 0 !important;" +
    "    transform: translateY(15px) !important;" +
    "    transition: opacity 0.4s ease-out, transform 0.4s ease-out !important;" +
    "}" +
    
    ".full-start-new.applecation .applecation__ratings.show {" +
    "    opacity: 1 !important;" +
    "    transform: translateY(0) !important;" +
    "}" +
    
    ".full-start-new.applecation .applecation__ratings .full-start__rate {" +
    "    display: flex !important;" +
    "    align-items: center !important;" +
    "    gap: 0.35em !important;" +
    "    font-size: 0.95em !important;" +
    "    font-weight: 600 !important;" +
    "    color: #fff !important;" +
    "    transition: color 0.3s ease !important;" +
    "}" +
    
    ".full-start-new.applecation .applecation__ratings .source--name {" +
    "    display: flex !important;" +
    "    align-items: center !important;" +
    "    justify-content: center !important;" +
    "}" +
    
    ".full-start-new.applecation .applecation__ratings .source--name img {" +
    "    width: auto !important;" +
    "    height: var(--lmp-h-default, 1.8em) !important;" +
    "    object-fit: contain !important;" +
    "}" +
    
    /* --- Специфічні висоти іконок --- */
    ".full-start-new.applecation .rate--imdb .source--name img { height: 1.8em !important; }" +
    ".full-start-new.applecation .rate--kp .source--name img { height: 1.5em !important; }" +
    ".full-start-new.applecation .rate--tmdb .source--name img { height: 1.8em !important; }" +
    ".full-start-new.applecation .rate--mc .source--name img { height: 1.8em !important; }" +
    ".full-start-new.applecation .rate--rt .source--name img { height: 1.8em !important; }" +
    ".full-start-new.applecation .rate--popcorn .source--name img { height: 1.8em !important; }" +
    ".full-start-new.applecation .rate--avg .source--name img { height: 1.4em !important; }" +
    ".full-start-new.applecation .rate--oscars .source--name img," +
    ".full-start-new.applecation .rate--emmy .source--name img," +
    ".full-start-new.applecation .rate--awards .source--name img { height: 1.4em !important; }" +
    
    /* --- Кольоровий режим --- */
    ".full-start-new.applecation .rate--oscars," +
    ".full-start-new.applecation .rate--emmy," +
    ".full-start-new.applecation .rate--awards {" +
    "    color: gold !important;" +
    "}" +
    
    /* --- КОЛЬОРИ ОЦІНОК - СПЕЦІАЛЬНО ДЛЯ APPLECATION --- */
    ".full-start-new.applecation .full-start__rate.rating--green  { color: #2ecc71 !important; }" +
    ".full-start-new.applecation .full-start__rate.rating--blue   { color: #60a5fa !important; }" +
    ".full-start-new.applecation .full-start__rate.rating--orange { color: #f59e0b !important; }" +
    ".full-start-new.applecation .full-start__rate.rating--red    { color: #ef4444 !important; }" +
    
    /* --- Загальні кольори оцінок (для не-Applecation) --- */
    ".full-start__rate.rating--green  { color: #2ecc71 !important; }" +
    ".full-start__rate.rating--blue   { color: #60a5fa !important; }" +
    ".full-start__rate.rating--orange { color: #f59e0b !important; }" +
    ".full-start__rate.rating--red    { color: #ef4444 !important; }" +
    
    /* --- Лоадер "Пошук..." --- */
    ".loading-dots-container {" +
    "    display: flex;" +
    "    align-items: center;" +
    "    font-size: 0.85em;" +
    "    color: #ccc;" +
    "    padding: 0.6em 1em;" +
    "    border-radius: 0.5em;" +
    "}" +
    ".loading-dots__text {" +
    "    margin-right: 1em;" +
    "}" +
    ".loading-dots__dot {" +
    "    width: 0.5em;" +
    "    height: 0.5em;" +
    "    border-radius: 50%;" +
    "    background-color: currentColor;" +
    "    animation: loading-dots-bounce 1.4s infinite ease-in-out both;" +
    "}" +
    ".loading-dots__dot:nth-child(1) {" +
    "    animation-delay: -0.32s;" +
    "}" +
    ".loading-dots__dot:nth-child(2) {" +
    "    animation-delay: -0.16s;" +
    "}" +
    "@keyframes loading-dots-bounce {" +
    "    0%, 80%, 100% { transform: translateY(0); opacity: 0.6; }" +
    "    40% { transform: translateY(-0.5em); opacity: 1; }" +
    "}" +
    
    /* --- Приховування під час завантаження --- */
    ".full-start-new__rate-line.lmp-is-loading-ratings > :not(#lmp-search-loader)," +
    ".full-start__rate-line.lmp-is-loading-ratings > :not(#lmp-search-loader) {" +
    "    opacity: 0 !important;" +
    "    pointer-events: none !important;" +
    "    transition: opacity 0.15s;" +
    "}" +
    
    ".applecation__ratings.lmp-is-loading-ratings > :not(#lmp-search-loader) {" +
    "    opacity: 0 !important;" +
    "    pointer-events: none !important;" +
    "    transition: opacity 0.15s;" +
    "}" +
    
    /* --- Вирівнювання іконок нагород --- */
    ".lmp-award-icon{" +
    "  display:inline-flex;" +
    "  align-items:center;" +
    "  justify-content:center;" +
    "  line-height:1;" +
    "  height:auto;" +
    "  width:auto;" +
    "  flex-shrink:0;" +
    "}" +
    ".lmp-award-icon img{" +
    "  height:auto;" +
    "  width:auto;" +
    "  display:block;" +
    "  object-fit:contain;" +
    "}" +
    
    /* --- Приховування стандартного рейтингу Кінопошуку --- */
    ".full-start__rate.rate--kp, .rate--kp{display:none!important;}" +
    
    /* --- Адаптив (Mobile) --- */
    "@media (max-width: 600px){" +
    "  .full-start-new.applecation .applecation__ratings {" +
    "    gap: 0.5em !important;" +
    "  }" +
    "  .full-start-new.applecation .applecation__ratings .full-start__rate {" +
    "    font-size: 0.85em !important;" +
    "  }" +
    "}" +
    "</style>";

  // ... (продовження коду без змін) ...

  /*
  |==========================================================================
  | 6. РЕНДЕР (RENDER) - АДАПТОВАНО ДЛЯ APPLECATION
  |==========================================================================
  */

  /**
   * Оновлює приховані елементи (вік, IMDb, TMDB)
   */
  function updateHiddenElements(data) {
    var render = Lampa.Activity.active().activity.render();
    if (!render || !render[0]) return;

    var pgElement = $('.full-start__pg.hide', render);
    if (pgElement.length && data.ageRating) {
      var invalidRatings = ['N/A', 'Not Rated', 'Unrated'];
      var isValid = invalidRatings.indexOf(data.ageRating) === -1;
      if (isValid) {
        var localized = AGE_RATINGS[data.ageRating] || data.ageRating;
        pgElement.removeClass('hide').text(localized);
      }
    }
  }

  /**
   * Застосовує "золотий" колір до нагород
   */
  function applyAwardsColor(rateLine, cfg) {
    var $tiles = rateLine.find('.rate--awards, .rate--oscars, .rate--emmy');
    $tiles.removeClass('rating--green rating--blue rating--orange rating--red');

    if (cfg && cfg.colorizeAll) {
      $tiles.addClass('rate--gold');
    } else {
      $tiles.removeClass('rate--gold');
    }
  }

  /**
   * Функція для перевірки та оновлення кольорів всіх рейтингів
   */
  function updateAllRatingColors(cfg) {
    var render = Lampa.Activity.active().activity.render();
    if (!render || !render[0]) return;
    
    var ratingsContainer = $('.applecation__ratings', render);
    if (!ratingsContainer.length) return;
    
    // Оновлюємо кольори для всіх рейтингів
    ratingsContainer.find('.rate--imdb, .rate--tmdb, .rate--mc, .rate--rt, .rate--popcorn, .rate--avg').each(function() {
      var $rate = $(this);
      var ratingValue = parseFloat($rate.find('> div:first-child').text());
      
      if (!isNaN(ratingValue) && cfg.colorizeAll) {
        // Видаляємо всі кольорові класи
        $rate.removeClass('rating--green rating--blue rating--orange rating--red');
        // Додаємо правильний клас
        $rate.addClass(getRatingClass(ratingValue));
      } else if (!cfg.colorizeAll) {
        // Якщо кольорове виділення вимкнено - видаляємо всі кольорові класи
        $rate.removeClass('rating--green rating--blue rating--orange rating--red');
      }
    });
    
    // Оновлюємо кольори нагород
    applyAwardsColor(ratingsContainer, cfg);
  }

  /**
   * Створює або знаходить контейнер для рейтингів у Applecation
   */
  function getApplecationRatingsContainer() {
    var render = Lampa.Activity.active().activity.render();
    if (!render) return null;
    
    // Шукаємо існуючий контейнер для рейтингів у Applecation
    var ratingsContainer = $('.applecation__ratings', render);
    
    // Якщо контейнера немає, створюємо його
    if (!ratingsContainer.length) {
      // Шукаємо місце для вставки (після мета-інформації)
      var metaContainer = $('.applecation__meta', render);
      if (metaContainer.length) {
        ratingsContainer = $('<div class="applecation__ratings"></div>');
        metaContainer.after(ratingsContainer);
      } else {
        // Якщо мета-інформації немає, вставляємо після заголовка
        var titleContainer = $('.full-start-new__title', render);
        if (titleContainer.length) {
          ratingsContainer = $('<div class="applecation__ratings"></div>');
          titleContainer.after(ratingsContainer);
        }
      }
    }
    
    return ratingsContainer;
  }

  /**
   * Вставляє нові бейджі (MC, RT, Popcorn, Awards) у Applecation
   */
  function insertRatings(data) {
    var ratingsContainer = getApplecationRatingsContainer();
    if (!ratingsContainer || !ratingsContainer.length) return;

    var cfg = (typeof getCfg === 'function') ? getCfg() : {
      enableImdb: true,
      enableTmdb: true,
      enableMc: true,
      enableRt: true,
      enablePop: true,
      colorizeAll: true, // За замовчуванням включено для тестування
      showAverage: true
    };

    // Додаємо іконку IMDb
    (function() {
      if (!cfg.enableImdb || !data.imdb_display) return;
      
      var imdbVal = data.imdb_for_avg ? parseFloat(data.imdb_for_avg) : parseFloat(data.imdb_display);
      var imdbText = imdbVal && !isNaN(imdbVal) ? imdbVal.toFixed(1) : 'N/A';
      
      var colorClass = '';
      if (cfg.colorizeAll && imdbVal && !isNaN(imdbVal)) {
        colorClass = ' ' + getRatingClass(imdbVal);
      }
      
      var imdbElement = $(
        '<div class="full-start__rate rate--imdb' + colorClass + '">' +
        '<div>' + imdbText + '</div>' +
        '<div class="source--name"></div>' +
        '</div>'
      );
      imdbElement.find('.source--name').html(iconImg(ICONS.imdb, 'IMDb', 22));
      
      // Перевіряємо, чи вже є такий рейтинг
      if (!$('.rate--imdb', ratingsContainer).length) {
        ratingsContainer.append(imdbElement);
      }
    })();

    // Додаємо іконку TMDB
    (function() {
      if (!cfg.enableTmdb || !data.tmdb_display) return;
      
      var tmdbVal = data.tmdb_for_avg ? parseFloat(data.tmdb_for_avg) : parseFloat(data.tmdb_display);
      var tmdbText = tmdbVal && !isNaN(tmdbVal) ? tmdbVal.toFixed(1) : 'N/A';
      
      var colorClass = '';
      if (cfg.colorizeAll && tmdbVal && !isNaN(tmdbVal)) {
        colorClass = ' ' + getRatingClass(tmdbVal);
      }
      
      var tmdbElement = $(
        '<div class="full-start__rate rate--tmdb' + colorClass + '">' +
        '<div>' + tmdbText + '</div>' +
        '<div class="source--name"></div>' +
        '</div>'
      );
      tmdbElement.find('.source--name').html(iconImg(ICONS.tmdb, 'TMDB', 24));
      
      if (!$('.rate--tmdb', ratingsContainer).length) {
        ratingsContainer.append(tmdbElement);
      }
    })();

    // Додаємо Metacritic
    (function() {
      if (!cfg.enableMc) return;

      var mcVal = null;
      if (data.mc_user_for_avg && !isNaN(data.mc_user_for_avg)) {
        mcVal = parseFloat(data.mc_user_for_avg);
      } else if (data.mc_critic_for_avg && !isNaN(data.mc_critic_for_avg)) {
        mcVal = parseFloat(data.mc_critic_for_avg);
      } else if (data.mc_for_avg && !isNaN(data.mc_for_avg)) {
        mcVal = parseFloat(data.mc_for_avg);
      } else if (data.mc_display && !isNaN(parseFloat(data.mc_display))) {
        var md = parseFloat(data.mc_display);
        mcVal = (md > 10) ? (md / 10) : md;
      }

      if (mcVal == null || isNaN(mcVal)) return;

      var mcText = mcVal.toFixed(1);
      var colorClass = cfg.colorizeAll ? ' ' + getRatingClass(mcVal) : '';
      
      var mcElement = $(
        '<div class="full-start__rate rate--mc' + colorClass + '">' +
        '<div>' + mcText + '</div>' +
        '<div class="source--name"></div>' +
        '</div>'
      );
      mcElement.find('.source--name').html(iconImg(ICONS.metacritic, 'Metacritic', 22));

      if (!$('.rate--mc', ratingsContainer).length) {
        ratingsContainer.append(mcElement);
      }
    })();

    // Додаємо Rotten Tomatoes
    (function() {
      if (!cfg.enableRt) return;

      var rtVal = null;
      if (data.rt_for_avg && !isNaN(data.rt_for_avg)) rtVal = parseFloat(data.rt_for_avg);
      else if (data.rt_display && !isNaN(parseFloat(data.rt_display))) {
        var rtd = parseFloat(data.rt_display);
        rtVal = (rtd > 10) ? (rtd / 10) : rtd;
      }

      if (rtVal == null || isNaN(rtVal)) return;

      var rtText = rtVal.toFixed(1);
      var rtIconUrl = data.rt_fresh ? ICONS.rotten_good : ICONS.rotten_bad;
      var extra = data.rt_fresh ? 'border-radius:4px;' : '';
      var colorClass = cfg.colorizeAll ? ' ' + getRatingClass(rtVal) : '';
      
      var rtElement = $(
        '<div class="full-start__rate rate--rt' + colorClass + '">' +
        '<div>' + rtText + '</div>' +
        '<div class="source--name"></div>' +
        '</div>'
      );
      rtElement.find('.source--name').html(iconImg(rtIconUrl, 'Rotten Tomatoes', 22, extra));

      if (!$('.rate--rt', ratingsContainer).length) {
        ratingsContainer.append(rtElement);
      }
    })();

    // Додаємо Popcorn
    (function() {
      if (!cfg.enablePop) return;

      var pcVal = null;
      if (data.popcorn_for_avg && !isNaN(data.popcorn_for_avg)) pcVal = parseFloat(data.popcorn_for_avg);
      else if (data.popcorn_display && !isNaN(parseFloat(data.popcorn_display))) {
        var pcd = parseFloat(data.popcorn_display);
        pcVal = (pcd > 10) ? (pcd / 10) : pcd;
      }

      if (pcVal == null || isNaN(pcVal)) return;

      var pcText = pcVal.toFixed(1);
      var colorClass = cfg.colorizeAll ? ' ' + getRatingClass(pcVal) : '';
      
      var pcElement = $(
        '<div class="full-start__rate rate--popcorn' + colorClass + '">' +
        '<div>' + pcText + '</div>' +
        '<div class="source--name"></div>' +
        '</div>'
      );
      pcElement.find('.source--name').html(iconImg(ICONS.popcorn, 'Audience', 22));

      if (!$('.rate--popcorn', ratingsContainer).length) {
        ratingsContainer.append(pcElement);
      }
    })();

    // Додаємо нагороди
    if (data.awards && data.awards > 0 && !$('.rate--awards', ratingsContainer).length) {
      var awardsElement = $(
        '<div class="full-start__rate rate--awards rate--gold">' +
        '<div>' + data.awards + '</div>' +
        '<div class="source--name"></div>' +
        '</div>'
      );
      awardsElement.find('.source--name')
        .html(iconImg(ICONS.awards, 'Awards', 20))
        .attr('title', Lampa.Lang.translate('awards_other_label'));
      ratingsContainer.prepend(awardsElement);
    }

    if (data.emmy && data.emmy > 0 && !$('.rate--emmy', ratingsContainer).length) {
      var emmyElement = $(
        '<div class="full-start__rate rate--emmy rate--gold">' +
        '<div>' + data.emmy + '</div>' +
        '<div class="source--name"></div>' +
        '</div>'
      );
      emmyElement.find('.source--name')
        .html(emmyIconInline())
        .attr('title', Lampa.Lang.translate('emmy_label'));
      ratingsContainer.prepend(emmyElement);
    }

    if (data.oscars && data.oscars > 0 && !$('.rate--oscars', ratingsContainer).length) {
      var oscarsElement = $(
        '<div class="full-start__rate rate--oscars rate--gold">' +
        '<div>' + data.oscars + '</div>' +
        '<div class="source--name"></div>' +
        '</div>'
      );
      oscarsElement.find('.source--name')
        .html(oscarIconInline())
        .attr('title', Lampa.Lang.translate('oscars_label'));
      ratingsContainer.prepend(oscarsElement);
    }

    try {
      applyAwardsColor(ratingsContainer, cfg);
    } catch (e) {}
  }

  /**
   * Розраховує та вставляє середній рейтинг (AVG) у Applecation
   */
  function calculateAverageRating(data) {
    var ratingsContainer = getApplecationRatingsContainer();
    if (!ratingsContainer || !ratingsContainer.length) {
      removeLoadingAnimation();
      return;
    }

    var cfg = (typeof getCfg === 'function') ? getCfg() : {
      enableImdb: true,
      enableTmdb: true,
      enableMc: true,
      enableRt: true,
      enablePop: true,
      colorizeAll: true,
      showAverage: true
    };

    $('.rate--avg', ratingsContainer).remove();
    if (!cfg.showAverage) {
      try {
        applyAwardsColor(ratingsContainer, cfg);
      } catch (e) {}
      removeLoadingAnimation();
      // Додаємо клас show для анімації появи
      ratingsContainer.addClass('show');
      return;
    }

    var parts = [];
    if (cfg.enableTmdb && data.tmdb_for_avg && !isNaN(data.tmdb_for_avg)) parts.push(parseFloat(data.tmdb_for_avg));
    if (cfg.enableImdb && data.imdb_for_avg && !isNaN(data.imdb_for_avg)) parts.push(parseFloat(data.imdb_for_avg));

    if (cfg.enableMc) {
      if (data.mc_user_for_avg && !isNaN(data.mc_user_for_avg)) {
        parts.push(parseFloat(data.mc_user_for_avg));
      } else if (data.mc_critic_for_avg && !isNaN(data.mc_critic_for_avg)) {
        parts.push(parseFloat(data.mc_critic_for_avg));
      } else if (data.mc_for_avg && !isNaN(data.mc_for_avg)) {
        parts.push(parseFloat(data.mc_for_avg));
      }
    }

    if (cfg.enableRt && data.rt_for_avg && !isNaN(data.rt_for_avg)) parts.push(parseFloat(data.rt_for_avg));
    if (cfg.enablePop && data.popcorn_for_avg && !isNaN(data.popcorn_for_avg)) parts.push(parseFloat(data.popcorn_for_avg));

    if (!parts.length) {
      removeLoadingAnimation();
      ratingsContainer.addClass('show');
      return;
    }

    var sum = 0;
    for (var i = 0; i < parts.length; i++) sum += parts[i];
    var avg = sum / parts.length;
    var colorClass = cfg.colorizeAll ? getRatingClass(avg) : '';

    var avgElement = $(
      '<div class="full-start__rate rate--avg ' + colorClass + '">' +
      '<div>' + avg.toFixed(1) + '</div>' +
      '<div class="source--name"></div>' +
      '</div>'
    );

    var starHtml = iconImg(ICONS.total_star, 'AVG', 20);
    avgElement.find('.source--name').html(starHtml);

    ratingsContainer.prepend(avgElement);

    try {
      applyAwardsColor(ratingsContainer, (typeof getCfg === 'function') ? getCfg() : null);
    } catch (e) {}

    removeLoadingAnimation();
    
    // Додаємо клас show для анімації появи
    ratingsContainer.addClass('show');
    
    // Оновлюємо кольори всіх рейтингів
    updateAllRatingColors(cfg);
  }

  // ... (продовження коду без змін) ...

  /**
   * Ховає/показує блоки з нагородами
   */
  function toggleAwards(showAwards) {
    var nodes = document.querySelectorAll('.rate--oscars, .rate--emmy, .rate--awards');
    nodes.forEach(function(n) {
      n.style.display = showAwards ? '' : 'none';
    });
  }

  /**
   * Ховає/показує блок середнього рейтингу
   */
  function toggleAverage(showAverage) {
    var nodes = document.querySelectorAll('.rate--avg');
    nodes.forEach(function(n) {
      n.style.display = showAverage ? '' : 'none';
    });
  }

  /**
   * Оновлює кольорове виділення всіх рейтингів
   */
  function toggleColorizeAll(colorizeAll) {
    var cfg = getCfg();
    cfg.colorizeAll = colorizeAll;
    updateAllRatingColors(cfg);
  }

  /**
   * Головна функція стилізації
   */
  function applyStylesToAll() {
    var cfg = getCfg();
    toggleAwards(cfg.showAwards);
    toggleAverage(cfg.showAverage);
    toggleColorizeAll(cfg.colorizeAll);
  }

  /**
   * Патч Lampa.Storage для миттєвого застосування стилів
   */
  function patchStorageSetOnce() {
    if (window.__lmpRatingsPatchedStorage) return;
    window.__lmpRatingsPatchedStorage = true;

    var _set = Lampa.Storage.set;
    Lampa.Storage.set = function(k, v) {
      var out = _set.apply(this, arguments);
      if (typeof k === 'string' && k.indexOf('ratings_') === 0) {
        setTimeout(function() {
          applyStylesToAll();
        }, 0);
      }
      return out;
    };
  }

  /**
   * "Живе" оновлення стилів при зміні в меню
   */
  function attachLiveSettingsHandlers() {
    var scheduleApply = (function() {
      var t;
      return function() {
        clearTimeout(t);
        t = setTimeout(function() {
          try {
            if (typeof currentRatingsData === 'object' && currentRatingsData) {
              updateHiddenElements(currentRatingsData);
              insertRatings(currentRatingsData);
              calculateAverageRating(currentRatingsData);
            }
          } catch (e) {}
          applyStylesToAll();
        }, 150);
      };
    })();

    function onDomChange(e) {
      var t = e.target;
      if (!t) return;
      var n = (t.getAttribute('name') || t.getAttribute('data-name') || '');
      if (n && n.indexOf('ratings_') === 0) scheduleApply();
    }

    document.addEventListener('input', onDomChange, true);
    document.addEventListener('change', onDomChange, true);
    document.addEventListener('click', function(e) {
      var el = e.target.closest('[data-name^="ratings_"],[name^="ratings_"]');
      if (el) scheduleApply();
    }, true);
    document.addEventListener('keyup', onDomChange, true);

    try {
      if (Lampa.SettingsApi && Lampa.SettingsApi.listener && Lampa.SettingsApi.listener.follow) {
        Lampa.SettingsApi.listener.follow('change', function(ev) {
          if (ev && ev.name && ev.name.indexOf('ratings_') === 0) {
            scheduleApply();
            // Особлива обробка для кольорового виділення
            if (ev.name === 'ratings_colorize_all') {
              toggleColorizeAll(ev.value);
            }
          }
        });
      }
    } catch (_) {}
  }

  // ... (решта коду залишається без змін) ...
})();
