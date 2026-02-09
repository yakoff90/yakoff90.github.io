(function () {
  'use strict';

  var TMDB_IMAGE_URL = 'https://image.tmdb.org/t/p/h50'; 

  function getStudioLogos(movie) {
    var html = '';
    if (movie && movie.production_companies) {
      movie.production_companies.slice(0, 3).forEach(function(co) {
        if (co.logo_path) {
          html += '<div class="quality-badge studio-logo">' +
                  '<img src="' + TMDB_IMAGE_URL + co.logo_path + '" title="' + co.name + '">' +
                  '</div>';
        }
      });
    }
    return html;
  }

  Lampa.Listener.follow('full', function(e) {
    if (e.type !== 'complite') return;
 
    // Перевіряємо, чи використовується шаблон Cardify
    var cardifyElement = $('.cardify');
    var isCardify = cardifyElement.length > 0;
    
    if (isCardify) {
      // Для Cardify шаблону - додаємо логотипи під кнопками
      var buttonsContainer = $('.full-start-new__buttons');
      if (buttonsContainer.length) {
        // Видаляємо попередні логотипи, якщо вони є
        buttonsContainer.next('.cardify-studios-container').remove();
        
        var studioHtml = getStudioLogos(e.data.movie);
        
        if (studioHtml) {
          // Створюємо контейнер для логотипів під кнопками
          var studiosContainer = $('<div class="cardify-studios-container"></div>');
          studiosContainer.html(studioHtml);
          
          // Вставляємо після контейнера з кнопками
          buttonsContainer.after(studiosContainer);
        }
      }
    } else {
      // Для стандартного шаблону - оригінальна логіка
      var details = $('.full-start-new__details');
      if (details.length) {
        var cont = $('.quality-badges-container');
        if (!cont.length) { 
          cont = $('<div class="quality-badges-container"></div>'); 
          details.after(cont); 
        }
        
        cont.find('.studio-logo').remove();
        
        var studioHtml = getStudioLogos(e.data.movie);
        cont.prepend(studioHtml);
      }
    }
  });

  var style = '<style>\
    .quality-badges-container { \
        display: flex !important; \
        align-items: center !important; \
        flex-wrap: wrap !important; \
        gap: 15px !important; \
        margin: 10px 0 !important; \
    }\
    .cardify-studios-container { \
        display: flex !important; \
        align-items: center !important; \
        justify-content: flex-start !important; \
        flex-wrap: wrap !important; \
        gap: 12px !important; \
        margin: 15px 0 0 0 !important; \
        padding: 0 !important; \
        width: 100% !important; \
    }\
    .studio-logo { \
        display: flex !important; \
        align-items: center !important; \
        justify-content: center !important; \
        opacity: 0; \
        transform: translateY(8px); \
        animation: studio_in 0.4s ease forwards; \
        /* 50% сірого (128,128,128) та 50% прозорості (0.5) */ \
        background: rgba(128, 128, 128, 0.5) !important; \
        /* Біла рамка обводка */ \
        border: 1px solid rgba(255, 255, 255, 1) !important; \
        padding: 4px 10px !important; \
        border-radius: 4px !important; \
        backdrop-filter: blur(5px) !important; \
        -webkit-backdrop-filter: blur(5px) !important; \
    }\
    @keyframes studio_in { \
        to { opacity: 1; transform: translateY(0); } \
    }\
    .studio-logo img { \
        max-height: 1.5em !important; \
        width: auto !important; \
        max-width: 150px !important; \
        object-fit: contain !important; \
        filter: none !important; \
        display: block !important; \
    }\
    /* Адаптивні стилі для різних розмірів екрану */\
    @media (max-width: 1200px) {\
      .cardify-studios-container {\
        gap: 10px !important;\
        margin-top: 12px !important;\
      }\
      .studio-logo {\
        padding: 3px 8px !important;\
      }\
      .studio-logo img {\
        max-height: 1.3em !important;\
        max-width: 130px !important;\
      }\
    }\
    @media (max-width: 768px) {\
      .cardify-studios-container {\
        justify-content: center !important;\
        margin-top: 10px !important;\
        gap: 8px !important;\
      }\
      .studio-logo {\
        padding: 3px 6px !important;\
      }\
      .studio-logo img {\
        max-height: 1.2em !important;\
        max-width: 110px !important;\
      }\
    }\
    /* Специфічні стилі для Cardify шаблону */\
    .cardify .full-start-new__buttons {\
        margin-bottom: 0 !important;\
    }\
    .cardify .cardify-studios-container {\
        margin-top: 20px !important;\
    }\
  </style>';
  
  if (!$('style:contains(".studio-logo")').length) {
    $('body').append(style);
  }

})();
